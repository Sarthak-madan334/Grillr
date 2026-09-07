from types import SimpleNamespace
from uuid import uuid4

import httpx
import pytest

import app.services.providers as providers
from app.services.interview_service import InterviewService
from app.services.providers import LLMAnswerEvaluator, MockSpeechAnalyzer, MockAnswerEvaluator, MockAIInterviewer, MockTextToSpeech, RimeTextToSpeech, SpeechToTextService, TranscriptionError, TranscriptionTimeoutError, create_text_to_speech


class FailingSpeechToText:
    def transcribe(self, audio: bytes) -> str:
        raise RuntimeError("provider unavailable")


class SlowSpeechToText:
    def transcribe(self, audio: bytes) -> str:
        import time
        time.sleep(0.05)
        return "too late"


class SilentSpeechToText:
    def transcribe(self, audio: bytes) -> str:
        return "  "


@pytest.mark.asyncio
async def test_stt_provider_failure_becomes_defined_error(caplog):
    service = SpeechToTextService(FailingSpeechToText(), timeout_seconds=1)

    with pytest.raises(TranscriptionError, match="Speech transcription failed"):
        await service.transcribe(b"private-audio", session_id=uuid4(), question_id=uuid4())

    assert "private-audio" not in caplog.text
    assert "Speech transcription failed" in caplog.text


@pytest.mark.asyncio
async def test_stt_timeout_becomes_defined_timeout_error():
    service = SpeechToTextService(SlowSpeechToText(), timeout_seconds=0.01)

    with pytest.raises(TranscriptionTimeoutError, match="exceeded"):
        await service.transcribe(b"audio")


@pytest.mark.asyncio
async def test_stt_empty_transcript_is_no_speech_outcome():
    result = await SpeechToTextService(SilentSpeechToText()).transcribe(b"silent-audio")

    assert result.code == "no_speech_detected"
    assert result.transcript == ""
    assert result.has_speech is False


class FakeHttpClient:
    def __init__(self, response=None, error=None):
        self.response = response
        self.error = error
        self.request = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def post(self, url, **kwargs):
        self.request = (url, kwargs)
        if self.error:
            raise self.error
        return self.response


def test_speech_analyzer_metrics():
    analyzer = MockSpeechAnalyzer()
    transcript = "Um I think uh like we should we should optimize this query"
    duration = 10.0
    metrics = analyzer.analyze(transcript, duration)

    assert metrics["word_count"] == 12
    assert metrics["filler_count"] == 3  # um, uh, like
    assert metrics["duration_seconds"] == 10.0
    # WPM = 12 words / 10s * 60 = 72.0
    assert metrics["words_per_minute"] == 72.0


def test_speech_analyzer_zero_duration_safeguard():
    analyzer = MockSpeechAnalyzer()
    metrics = analyzer.analyze("Hello world", duration=0.0)
    assert metrics["words_per_minute"] > 0  # does not divide by zero


def test_speech_analyzer_detects_common_filler_phrases():
    metrics = MockSpeechAnalyzer().analyze("Um, you know, I mean, basically we can sort of improve it", 10.0)

    assert metrics["filler_count"] == 5


def test_speech_analyzer_detects_repeated_phrases():
    metrics = MockSpeechAnalyzer().analyze("I think the plan is strong and I think the plan should ship", 10.0)

    assert metrics["repetition_count"] >= 2


def test_speech_analyzer_clamps_near_zero_duration():
    metrics = MockSpeechAnalyzer().analyze("one two", 0.001)

    assert metrics["words_per_minute"] == 120


def test_answer_evaluator_scoring():
    evaluator = MockAnswerEvaluator()
    short_eval = evaluator.evaluate("Short answer", "What is OOP?")
    assert short_eval["overall_score"] == 60

    long_eval = evaluator.evaluate("This is a detailed answer that contains more than ten words to score high", "What is OOP?")
    assert long_eval["overall_score"] == 80


def test_answer_evaluator_factory_uses_mock_without_key():
    evaluator = providers.create_answer_evaluator(SimpleNamespace(groq_api_key=None, groq_model="test-model"))

    assert isinstance(evaluator, MockAnswerEvaluator)


def test_interview_service_uses_llm_evaluator_with_injected_key():
    service = InterviewService(object(), tts=MockTextToSpeech(), settings=SimpleNamespace(groq_api_key="test-key", groq_model="test-model"))

    assert isinstance(service.evaluator, LLMAnswerEvaluator)
    assert service.evaluator.api_key == "test-key"
    assert service.evaluator.model == "test-model"


def test_llm_answer_evaluator_parses_and_clamps_scores(monkeypatch):
    payload = {"choices": [{"message": {"content": '{"relevance_score": 120, "clarity_score": 80, "structure_score": 70, "specificity_score": 60, "technical_accuracy_score": 50, "conciseness_score": 40, "communication_score": 30, "overall_score": 75, "strengths": ["Clear"], "weaknesses": [], "suggestions": ["Add metrics"], "improved_answer": "A stronger answer."}'}}]}
    client = FakeHttpClient(response=httpx.Response(200, json=payload, request=httpx.Request("POST", "https://api.groq.com")))
    monkeypatch.setattr(providers.httpx, "Client", lambda timeout: client)

    result = LLMAnswerEvaluator(api_key="test-key").evaluate("I led a migration and reduced deploy time by 40 percent.", "Tell me about a project you led.")

    assert result["relevance_score"] == 100
    assert result["overall_score"] == 75
    assert result["strengths"] == ["Clear"]


def test_llm_answer_evaluator_malformed_response_uses_fallback(monkeypatch):
    client = FakeHttpClient(response=httpx.Response(200, json={"choices": [{"message": {"content": "not json"}}]}, request=httpx.Request("POST", "https://api.groq.com")))
    monkeypatch.setattr(providers.httpx, "Client", lambda timeout: client)

    result = LLMAnswerEvaluator(api_key="test-key").evaluate("I improved the process by documenting the workflow and measuring cycle time.", "How did you improve a process?")

    assert result["overall_score"] == 0
    assert "Evaluation unavailable" in result["weaknesses"][0]


def test_llm_answer_evaluator_provider_failure_uses_fallback(monkeypatch):
    client = FakeHttpClient(error=httpx.ConnectError("connection refused"))
    monkeypatch.setattr(providers.httpx, "Client", lambda timeout: client)

    result = LLMAnswerEvaluator(api_key="test-key").evaluate("I improved the process by documenting the workflow and measuring cycle time.", "How did you improve a process?")

    assert result["overall_score"] == 0
    assert "Evaluation unavailable" in result["weaknesses"][0]


def test_llm_answer_evaluator_trivial_answer_scores_low_without_call(monkeypatch):
    def fail_if_called(*args, **kwargs):
        raise AssertionError("trivial answers should not call the LLM")

    monkeypatch.setattr(providers.httpx, "Client", fail_if_called)
    result = LLMAnswerEvaluator(api_key="test-key").evaluate("I don't know", "What is your greatest strength?")

    assert result["overall_score"] == 0
    assert "too brief" in result["weaknesses"][0]


def test_mock_ai_interviewer():
    ai = MockAIInterviewer()
    first = ai.first_question("DevOps Engineer", "technical")
    assert "DevOps Engineer" in first
    nxt = ai.next_question("DevOps Engineer", 2, [])
    assert "DevOps Engineer" in nxt


def test_rime_tts_returns_audio_bytes(monkeypatch):
    response = httpx.Response(200, content=b"audio-bytes", headers={"content-type": "audio/mpeg"})
    client = FakeHttpClient(response=response)
    monkeypatch.setattr(providers.httpx, "Client", lambda timeout: client)

    audio = RimeTextToSpeech(api_key="test-rime-key").synthesize("Hello there")

    assert audio == b"audio-bytes"
    assert client.request[0] == RimeTextToSpeech.endpoint
    assert client.request[1]["headers"]["Authorization"] == "Bearer test-rime-key"
    assert client.request[1]["json"]["text"] == "Hello there"


def test_rime_tts_network_failure_raises(monkeypatch):
    client = FakeHttpClient(error=httpx.ConnectError("connection refused"))
    monkeypatch.setattr(providers.httpx, "Client", lambda timeout: client)

    with pytest.raises(RuntimeError, match="network request failed"):
        RimeTextToSpeech(api_key="test-rime-key").synthesize("Hello there")


@pytest.mark.parametrize("status_code", [401, 429, 500])
def test_rime_tts_api_failure_raises(monkeypatch, status_code):
    response = httpx.Response(status_code, content=b'{"error":"not available"}')
    client = FakeHttpClient(response=response)
    monkeypatch.setattr(providers.httpx, "Client", lambda timeout: client)

    with pytest.raises(RuntimeError, match=f"HTTP {status_code}"):
        RimeTextToSpeech(api_key="test-rime-key").synthesize("Hello there")


def test_rime_tts_rejects_non_audio_success_response(monkeypatch):
    response = httpx.Response(200, json={"audio": "missing"})
    client = FakeHttpClient(response=response)
    monkeypatch.setattr(providers.httpx, "Client", lambda timeout: client)

    with pytest.raises(RuntimeError, match="instead of audio"):
        RimeTextToSpeech(api_key="test-rime-key").synthesize("Hello there")


def test_rime_tts_requires_api_key(monkeypatch):
    monkeypatch.setattr(providers, "get_settings", lambda: SimpleNamespace(rime_api_key=None))

    with pytest.raises(RuntimeError, match="RIME_API_KEY is missing"):
        RimeTextToSpeech().synthesize("Hello there")


def test_text_to_speech_factory_uses_mock_without_rime_key(monkeypatch):
    monkeypatch.setattr(providers, "get_settings", lambda: SimpleNamespace(rime_api_key=None))

    assert isinstance(create_text_to_speech(), MockTextToSpeech)


def test_text_to_speech_factory_uses_rime_with_api_key(monkeypatch):
    monkeypatch.setattr(providers, "get_settings", lambda: SimpleNamespace(rime_api_key="test-rime-key"))

    provider = create_text_to_speech()

    assert isinstance(provider, RimeTextToSpeech)
    assert provider.api_key == "test-rime-key"


def test_unknown_interview_is_not_accessible(client):
    response = client.get(f"/api/v1/interviews/{uuid4()}")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "not_found"


def test_validation_rejects_bad_duration(client):
    response = client.post("/api/v1/interviews", json={"interview_type": "behavioral", "job_role": "x", "experience_level": "mid", "difficulty": "medium", "personality": "professional", "duration": 0})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"
