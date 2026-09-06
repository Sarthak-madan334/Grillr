from uuid import uuid4
from types import SimpleNamespace

import httpx
import pytest

import app.services.providers as providers
from app.services.providers import MockSpeechAnalyzer, MockAnswerEvaluator, MockAIInterviewer, RimeTextToSpeech


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


def test_answer_evaluator_scoring():
    evaluator = MockAnswerEvaluator()
    short_eval = evaluator.evaluate("Short answer", "What is OOP?")
    assert short_eval["overall_score"] == 60

    long_eval = evaluator.evaluate("This is a detailed answer that contains more than ten words to score high", "What is OOP?")
    assert long_eval["overall_score"] == 80


def test_mock_ai_interviewer():
    ai = MockAIInterviewer()
    first = ai.first_question("DevOps Engineer", "technical")
    assert "DevOps Engineer" in first
    nxt = ai.next_question("DevOps Engineer", 2)
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


def test_unknown_interview_is_not_accessible(client):
    response = client.get(f"/api/v1/interviews/{uuid4()}")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "not_found"


def test_validation_rejects_bad_duration(client):
    response = client.post("/api/v1/interviews", json={"interview_type": "behavioral", "job_role": "x", "experience_level": "mid", "difficulty": "medium", "personality": "professional", "duration": 0})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"
