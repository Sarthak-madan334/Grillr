from dataclasses import dataclass
from typing import Protocol

import httpx

from app.core.config import get_settings


class AIInterviewer(Protocol):
    def first_question(self, job_role: str, interview_type: str) -> str: ...
    def next_question(self, job_role: str, question_number: int) -> str: ...


class SpeechToText(Protocol):
    def transcribe(self, audio: bytes) -> str: ...


class TextToSpeech(Protocol):
    def synthesize(self, text: str) -> bytes: ...


class SpeechAnalyzer(Protocol):
    def analyze(self, transcript: str, duration: float) -> dict: ...


class AnswerEvaluator(Protocol):
    def evaluate(self, transcript: str, question: str) -> dict: ...


class MockAIInterviewer:
    def first_question(self, job_role: str, interview_type: str) -> str:
        return f"Tell me about your experience relevant to {job_role}."

    def next_question(self, job_role: str, question_number: int) -> str:
        return f"What was your most meaningful contribution as a {job_role}?"


class MockSpeechToText:
    def transcribe(self, audio: bytes) -> str:
        return "This is a mock transcript."


class MockTextToSpeech:
    def synthesize(self, text: str) -> bytes:
        return text.encode("utf-8")


class RimeTextToSpeech:
    """Synchronous adapter for Rime's audio-byte TTS endpoint."""

    endpoint = "https://users.rime.ai/v1/rime-tts"

    def __init__(self, api_key: str | None = None, speaker: str = "astra", model_id: str = "coda"):
        self.api_key = api_key if api_key is not None else get_settings().rime_api_key
        self.speaker = speaker
        self.model_id = model_id

    def synthesize(self, text: str) -> bytes:
        if not self.api_key:
            raise RuntimeError("Rime TTS is not configured: RIME_API_KEY is missing")
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
            raise RuntimeError(f"Rime TTS network request failed: {exc}") from exc

        if response.status_code >= 400:
            detail = response.text.strip().replace("\n", " ")[:200]
            raise RuntimeError(f"Rime TTS request failed with HTTP {response.status_code}: {detail}")

        content_type = response.headers.get("content-type", "").lower()
        if "json" in content_type:
            raise RuntimeError("Rime TTS returned an API response instead of audio")
        if not response.content:
            raise RuntimeError("Rime TTS returned an empty audio response")
        return response.content


class MockSpeechAnalyzer:
    def analyze(self, transcript: str, duration: float) -> dict:
        words = transcript.split()
        fillers = sum(word.lower() in {"um", "uh", "like"} for word in words)
        repetitions = sum(a.lower() == b.lower() for a, b in zip(words, words[1:]))
        return {"words_per_minute": round(len(words) / max(duration, 1 / 60) * 60, 2), "filler_count": fillers, "pause_count": max(0, int(duration // 5) - 1), "repetition_count": repetitions, "duration_seconds": duration, "word_count": len(words)}


class MockAnswerEvaluator:
    def evaluate(self, transcript: str, question: str) -> dict:
        score = 80 if len(transcript.split()) >= 10 else 60
        return {"relevance_score": score, "clarity_score": score, "structure_score": score, "specificity_score": score, "technical_accuracy_score": score, "conciseness_score": score, "communication_score": score, "overall_score": score, "strengths": ["Direct response"], "weaknesses": [] if score == 80 else ["Add more detail"], "suggestions": ["Use a concrete example"], "improved_answer": transcript}
