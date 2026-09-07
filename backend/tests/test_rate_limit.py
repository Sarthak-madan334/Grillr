from app.core.config import get_settings
from app.core.rate_limit import RateLimiter


def test_rate_limiter_resets_after_window():
    rate_limiter = RateLimiter()

    assert rate_limiter.check("client", limit=1, window_seconds=60, now=0) is None
    assert rate_limiter.check("client", limit=1, window_seconds=60, now=59) == 1
    assert rate_limiter.check("client", limit=1, window_seconds=60, now=60) is None


def test_global_rate_limit_returns_retry_after_header(client, monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "global_rate_limit", 2)

    assert client.get("/health").status_code == 200
    assert client.get("/health").status_code == 200
    limited = client.get("/health")

    assert limited.status_code == 429
    assert limited.headers["Retry-After"]
    assert limited.json() == {
        "error": {
            "code": "rate_limit_exceeded",
            "message": "Too many requests. Please try again later",
            "details": {"retry_after": int(limited.headers["Retry-After"])},
        }
    }


def test_interview_creation_rate_limit_is_user_scoped(client, monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "interview_creation_rate_limit", 1)

    payload = {
        "interview_type": "behavioral",
        "job_role": "Software Engineer",
        "experience_level": "mid",
        "difficulty": "medium",
        "personality": "professional",
        "duration": 30,
        "question_count": 1,
    }
    assert client.post("/api/v1/interviews", json=payload).status_code == 201
    limited = client.post("/api/v1/interviews", json=payload)

    assert limited.status_code == 429
    assert limited.headers["Retry-After"]