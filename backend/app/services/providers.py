import asyncio
import io
import json
import logging
import threading
import wave
from dataclasses import dataclass
from typing import Any, Callable, ClassVar, Protocol
from uuid import UUID

import httpx
from openai import OpenAI

from app.core.config import get_settings
from app.core.errors import ProviderError

logger = logging.getLogger(__name__)
WHISPER_SAMPLE_RATE = 16000


class AIInterviewer(Protocol):
    def first_question(self, job_role: str, interview_type: str) -> str: ...
    def next_question(self, job_role: str, question_number: int, history: list[dict[str, str]]) -> str: ...


class SpeechToText(Protocol):
    def transcribe(self, audio: bytes) -> str: ...


class TranscriptionError(RuntimeError):
    """A provider failed while converting audio to text."""


class TranscriptionTimeoutError(TranscriptionError):
    """A provider did not finish transcription within the configured limit."""


class WhisperTranscriptionError(TranscriptionError):
    """Whisper could not decode the audio, load its model, or transcribe it."""


def _decode_wav(audio: bytes) -> tuple[Any, int]:
    import numpy as np

    try:
        with wave.open(io.BytesIO(audio), "rb") as wav_file:
            if wav_file.getnchannels() != 1 or wav_file.getsampwidth() != 2:
                raise ValueError("WAV audio must be mono 16-bit PCM")
            sample_rate = wav_file.getframerate()
            samples = np.frombuffer(wav_file.readframes(wav_file.getnframes()), dtype=np.int16)
    except Exception as exc:
        raise WhisperTranscriptionError(f"Whisper could not decode WAV audio: {exc}") from exc

    if not len(samples) or sample_rate <= 0:
        raise WhisperTranscriptionError("Whisper received empty WAV audio")
    samples = samples.astype(np.float32) / 32768.0
    if sample_rate != WHISPER_SAMPLE_RATE:
        source_positions = np.arange(len(samples), dtype=np.float32)
        target_positions = np.linspace(
            0,
            len(samples) - 1,
            num=round(len(samples) * WHISPER_SAMPLE_RATE / sample_rate),
            dtype=np.float32,
        )
        samples = np.interp(target_positions, source_positions, samples).astype(np.float32)
        sample_rate = WHISPER_SAMPLE_RATE
    return samples, sample_rate


def _decode_audio(audio: bytes) -> tuple[Any, int]:
    """Decode WAV or browser WebM/Opus bytes to mono float32 samples.

    WAV is decoded with the standard library. Other containers, including the
    WebM/Opus payload produced by MediaRecorder, require PyAV from faster-whisper.
    """
    if audio.startswith(b"RIFF") and audio[8:12] == b"WAVE":
        return _decode_wav(audio)

    try:
        import av
        import numpy as np

        with av.open(io.BytesIO(audio)) as container:
            audio_stream = next(iter(container.streams.audio), None)
            if audio_stream is None:
                raise ValueError("audio stream not found")
            frames = [frame.to_ndarray() for frame in container.decode(audio=0)]
            if not frames:
                raise ValueError("audio stream contained no frames")
            samples = np.concatenate(frames, axis=1 if frames[0].ndim > 1 else 0)
            if samples.ndim > 1:
                samples = samples.mean(axis=0)
            if np.issubdtype(samples.dtype, np.integer):
                samples = samples.astype(np.float32) / np.iinfo(samples.dtype).max
            else:
                samples = samples.astype(np.float32)
            if audio_stream.sample_rate != WHISPER_SAMPLE_RATE:
                source_positions = np.arange(len(samples), dtype=np.float32)
                target_positions = np.linspace(
                    0,
                    len(samples) - 1,
                    num=round(len(samples) * WHISPER_SAMPLE_RATE / audio_stream.sample_rate),
                    dtype=np.float32,
                )
                samples = np.interp(target_positions, source_positions, samples).astype(np.float32)
            return samples, WHISPER_SAMPLE_RATE
    except WhisperTranscriptionError:
        raise
    except Exception as exc:
        raise WhisperTranscriptionError(f"Whisper could not decode audio: {exc}") from exc


@dataclass(frozen=True)
class TranscriptionResult:
    transcript: str
    code: str

    @property
    def has_speech(self) -> bool:
        return self.code == "transcribed"


class SpeechToTextService:
    """Protect the interview flow from provider failures and blocking calls."""

    def __init__(self, provider: SpeechToText, timeout_seconds: float | None = None):
        configured_timeout = timeout_seconds if timeout_seconds is not None else get_settings().stt_timeout_seconds
        if configured_timeout <= 0:
            raise ValueError("STT timeout must be greater than zero")
        self.provider = provider
        self.timeout_seconds = configured_timeout

    async def transcribe(
        self,
        audio: bytes,
        *,
        session_id: UUID | str | None = None,
        question_id: UUID | str | None = None,
    ) -> TranscriptionResult:
        audio_length = len(audio)
        context = {
            "session_id": str(session_id) if session_id is not None else None,
            "question_id": str(question_id) if question_id is not None else None,
            "audio_length": audio_length,
        }
        try:
            transcript = await asyncio.wait_for(
                asyncio.to_thread(self.provider.transcribe, audio),
                timeout=self.timeout_seconds,
            )
        except asyncio.TimeoutError as exc:
            logger.warning("Speech transcription timed out", extra=context)
            raise TranscriptionTimeoutError(
                f"Speech transcription exceeded {self.timeout_seconds:g} seconds"
            ) from exc
        except Exception as exc:
            logger.exception("Speech transcription failed", extra=context)
            raise TranscriptionError("Speech transcription failed") from exc

        normalized_transcript = transcript.strip()
        if not normalized_transcript:
            logger.info("No speech detected in audio", extra=context)
            return TranscriptionResult(transcript="", code="no_speech_detected")

        return TranscriptionResult(transcript=normalized_transcript, code="transcribed")


class TextToSpeech(Protocol):
    def synthesize(self, text: str) -> bytes: ...


class SpeechAnalyzer(Protocol):
    def analyze(self, transcript: str, duration: float) -> dict: ...


class AnswerEvaluator(Protocol):
    def evaluate(self, transcript: str, question: str) -> dict: ...


class MockAIInterviewer:
    def first_question(self, job_role: str, interview_type: str) -> str:
        return f"Tell me about your experience relevant to {job_role}."

    def next_question(self, job_role: str, question_number: int, history: list[dict[str, str]]) -> str:
        return f"What was your most meaningful contribution as a {job_role}?"


class MockSpeechToText:
    def transcribe(self, audio: bytes) -> str:
        return "This is a mock transcript."


class WhisperSpeechToText:
    """Transcribe encoded audio with a locally cached faster-whisper model.

    ``transcribe`` expects encoded WAV (mono 16-bit PCM) or a container format
    PyAV can decode, such as browser MediaRecorder WebM/Opus bytes. It returns
    an empty string for valid audio with no detected speech; malformed, empty,
    or failed inference raises ``WhisperTranscriptionError``.
    """

    _model_cache: ClassVar[dict[str, Any]] = {}
    _model_lock: ClassVar[threading.Lock] = threading.Lock()

    def __init__(
        self,
        model_size: str | None = None,
        model_loader: Callable[[str], Any] | None = None,
    ):
        self.model_size = model_size or get_settings().whisper_model_size
        self._model_loader = model_loader or self._load_model

    @classmethod
    def _load_model(cls, model_size: str) -> Any:
        try:
            from faster_whisper import WhisperModel

            return WhisperModel(model_size, device="cpu", compute_type="int8")
        except Exception as exc:
            raise WhisperTranscriptionError(
                f"Whisper model '{model_size}' could not be loaded: {exc}"
            ) from exc

    def _get_model(self) -> Any:
        model = self._model_cache.get(self.model_size)
        if model is not None:
            return model
        with self._model_lock:
            model = self._model_cache.get(self.model_size)
            if model is None:
                model = self._model_loader(self.model_size)
                self._model_cache[self.model_size] = model
        return model

    def transcribe(self, audio: bytes) -> str:
        if not audio:
            raise WhisperTranscriptionError("Whisper cannot transcribe empty audio")
        samples, sample_rate = _decode_audio(audio)
        try:
            segments, _ = self._get_model().transcribe(samples)
            return " ".join(segment.text.strip() for segment in segments).strip()
        except WhisperTranscriptionError:
            raise
        except Exception as exc:
            raise WhisperTranscriptionError(f"Whisper transcription failed: {exc}") from exc


class OpenAISpeechToText:
    """Speech-to-text adapter for recorded browser audio."""

    def __init__(self, api_key: str | None = None, model: str = "gpt-4o-mini-transcribe"):
        self.client = OpenAI(api_key=api_key or get_settings().openai_api_key)
        self.model = model

    def transcribe(self, audio: bytes) -> str:
        response = self.client.audio.transcriptions.create(
            model=self.model,
            file=("answer.webm", audio, "audio/webm"),
        )
        return response.text


def create_speech_to_text() -> SpeechToText:
    settings = get_settings()
    return OpenAISpeechToText(api_key=settings.openai_api_key) if settings.openai_api_key else MockSpeechToText()


class MockTextToSpeech:
    def synthesize(self, text: str) -> bytes:
        return text.encode("utf-8")


def create_text_to_speech() -> TextToSpeech:
    settings = get_settings()
    if settings.rime_api_key:
        return RimeTextToSpeech(api_key=settings.rime_api_key)
    if getattr(settings, "is_production", False):
        raise RuntimeError("Rime TTS is required outside development: RIME_API_KEY is missing")
    return MockTextToSpeech()


class RimeTextToSpeech:
    """Synchronous adapter for Rime's audio-byte TTS endpoint."""

    endpoint = "https://users.rime.ai/v1/rime-tts"

    def __init__(self, api_key: str | None = None, speaker: str = "astra", model_id: str = "coda"):
        self.api_key = api_key if api_key is not None else get_settings().rime_api_key
        self.speaker = speaker
        self.model_id = model_id

    def synthesize(self, text: str) -> bytes:
        if not self.api_key:
            raise ProviderError("Rime TTS is not configured: RIME_API_KEY is missing")
        if not text.strip():
            raise ValueError("Rime TTS cannot synthesize empty text")

        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(
                    self.endpoint,
                    headers={"Accept": "audio/mpeg", "Authorization": f"Bearer {self.api_key}"},
                    json={"text": text, "speaker": self.speaker, "modelId": self.model_id},
                )
        except httpx.HTTPError as exc:
            raise ProviderError(f"Rime TTS network request failed: {exc}") from exc

        if response.status_code >= 400:
            detail = response.text.strip().replace("\n", " ")[:200]
            raise ProviderError(f"Rime TTS request failed with HTTP {response.status_code}: {detail}")

        content_type = response.headers.get("content-type", "").lower()
        if "json" in content_type:
            raise ProviderError("Rime TTS returned an API response instead of audio")
        if not response.content:
            raise ProviderError("Rime TTS returned an empty audio response")
        return response.content


class MockSpeechAnalyzer:
    filler_phrases = {
        ("um",), ("uh",), ("erm",), ("like",), ("basically",), ("actually",),
        ("literally",), ("well",), ("so",), ("right",), ("you", "know"),
        ("sort", "of"), ("kind", "of"), ("i", "mean"), ("you", "see"),
    }

    @classmethod
    def _filler_count(cls, words: list[str]) -> int:
        matches: list[tuple[int, int]] = []
        for index in range(len(words)):
            for phrase in cls.filler_phrases:
                if tuple(words[index:index + len(phrase)]) == phrase:
                    matches.append((index, index + len(phrase)))
        count = 0
        consumed: set[int] = set()
        for start, end in sorted(matches, key=lambda item: (item[0], -(item[1] - item[0]))):
            if not any(position in consumed for position in range(start, end)):
                consumed.update(range(start, end))
                count += 1
        return count

    @staticmethod
    def _repetition_count(words: list[str]) -> int:
        repeated: set[tuple[str, ...]] = set()
        for size in (2, 3):
            seen: dict[tuple[str, ...], list[int]] = {}
            for index in range(len(words) - size + 1):
                phrase = tuple(words[index:index + size])
                if any(index - previous <= 8 for previous in seen.get(phrase, [])):
                    repeated.add(phrase)
                seen.setdefault(phrase, []).append(index)
        repeated.update(word_pair for word_pair in zip(words, words[1:]) if word_pair[0] == word_pair[1])
        return len(repeated)

    def analyze(self, transcript: str, duration: float) -> dict:
        words = [word.strip(".,!?;:'\"()[]{}").lower() for word in transcript.split()]
        words = [word for word in words if word]
        safe_duration = max(duration, 1.0)
        # This is a duration-based estimate, not real pause detection from audio timestamps.
        pause_count = max(0, int(duration // 5) - 1)
        return {"words_per_minute": round(len(words) / safe_duration * 60, 2), "filler_count": self._filler_count(words), "pause_count": pause_count, "repetition_count": self._repetition_count(words), "duration_seconds": duration, "word_count": len(words)}


class MockAnswerEvaluator:
    def evaluate(self, transcript: str, question: str) -> dict:
        score = 80 if len(transcript.split()) >= 10 else 60
        return {"relevance_score": score, "clarity_score": score, "structure_score": score, "specificity_score": score, "technical_accuracy_score": score, "conciseness_score": score, "communication_score": score, "overall_score": score, "strengths": ["Direct response"], "weaknesses": [] if score == 80 else ["Add more detail"], "suggestions": ["Use a concrete example"], "improved_answer": transcript}


class LLMAnswerEvaluator:
    endpoint = "https://api.groq.com/openai/v1/chat/completions"
    score_fields = ("relevance_score", "clarity_score", "structure_score", "specificity_score", "technical_accuracy_score", "conciseness_score", "communication_score", "overall_score")

    def __init__(self, api_key: str | None = None, model: str | None = None, settings=None):
        selected_settings = settings if settings is not None else get_settings()
        self.api_key = api_key if api_key is not None else selected_settings.groq_api_key
        self.model = model or selected_settings.groq_model

    @classmethod
    def _fallback(cls, note: str) -> dict:
        return {field: 0 for field in cls.score_fields} | {"strengths": [], "weaknesses": [note], "suggestions": ["Try answering with a clear situation, action, and result."], "improved_answer": note}

    @staticmethod
    def _is_trivial(transcript: str) -> bool:
        normalized = " ".join(transcript.lower().split())
        return len(normalized.split()) < 5 or normalized in {"i don't know", "idk", "not sure", "no idea"}

    def _parse(self, content: str) -> dict:
        cleaned = content.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
        payload = json.loads(cleaned)
        if not isinstance(payload, dict):
            raise ValueError("LLM evaluation was not an object")
        result = {}
        for field in self.score_fields:
            value = payload.get(field)
            if not isinstance(value, (int, float)):
                raise ValueError(f"Missing evaluation score: {field}")
            result[field] = max(0, min(100, round(value)))
        for field in ("strengths", "weaknesses", "suggestions"):
            value = payload.get(field, [])
            if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
                raise ValueError(f"Invalid evaluation field: {field}")
            result[field] = value[:3]
        result["improved_answer"] = str(payload.get("improved_answer", "")).strip()
        return result

    def evaluate(self, transcript: str, question: str) -> dict:
        if self._is_trivial(transcript):
            return self._fallback("This answer is too brief to evaluate meaningfully.")
        if not self.api_key:
            return self._fallback("Evaluation unavailable: the language model is not configured.")
        prompt = ("Evaluate this interview answer against the question. Return JSON only with integer scores from 0 to 100 for "
            "relevance_score, clarity_score, structure_score, specificity_score, technical_accuracy_score, "
            "conciseness_score, communication_score, and overall_score, plus string arrays strengths, weaknesses, "
            "suggestions and a short improved_answer string. Be honest and question-aware.\n\n"
            f"Question: {question}\nCandidate answer: {transcript}")
        try:
            with httpx.Client(timeout=20.0) as client:
                response = client.post(self.endpoint, headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}, json={"model": self.model, "temperature": 0, "response_format": {"type": "json_object"}, "messages": [{"role": "user", "content": prompt}]})
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"]
            return self._parse(content)
        except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError) as error:
            logger.warning("Answer evaluation failed: %s", error)
            return self._fallback("Evaluation unavailable. Please try again later.")


def create_answer_evaluator(settings=None) -> AnswerEvaluator:
    selected_settings = settings if settings is not None else get_settings()
    return LLMAnswerEvaluator(settings=selected_settings) if selected_settings.groq_api_key else MockAnswerEvaluator()
