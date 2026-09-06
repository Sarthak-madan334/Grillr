from uuid import uuid4
import pytest
from app.services.providers import MockSpeechAnalyzer, MockAnswerEvaluator, MockAIInterviewer


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
    nxt = ai.next_question("DevOps Engineer", 2, [])
    assert "DevOps Engineer" in nxt


def test_unknown_interview_is_not_accessible(client):
    response = client.get(f"/api/v1/interviews/{uuid4()}")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "not_found"


def test_validation_rejects_bad_duration(client):
    response = client.post("/api/v1/interviews", json={"interview_type": "behavioral", "job_role": "x", "experience_level": "mid", "difficulty": "medium", "personality": "professional", "duration": 0})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"
