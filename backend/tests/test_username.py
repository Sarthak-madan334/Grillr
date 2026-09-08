from uuid import UUID, uuid4

import pytest
from sqlalchemy import select

import app.services.interview_service as interview_service
from app.db.session import SessionLocal
from app.models import Answer, AnswerEvaluation, InterviewSession, Question, SpeechMetrics, User


def headers_for(user_id: UUID, email: str) -> dict[str, str]:
    return {"Authorization": f"Bearer dev:{user_id}:{email}:Test User"}


def create_user(user_id: UUID | None = None, email: str = "user@example.com") -> tuple[UUID, dict[str, str]]:
    user_id = user_id or uuid4()
    return user_id, headers_for(user_id, email)


@pytest.mark.parametrize(
    "username",
    ["aile", "aile_sharma", "aile-sharma", "AbC_123", "abc", "a" * 30],
)
def test_valid_usernames_are_available_and_normalized(client, username):
    response = client.get("/api/v1/users/username/availability", params={"username": username})

    assert response.status_code == 200
    assert response.json() == {"available": True}


@pytest.mark.parametrize(
    "username",
    ["ab", "a" * 31, "aile sharma", "aile!", "", "   ", "éile"],
)
def test_invalid_usernames_use_validation_error_response(client, username):
    response = client.get("/api/v1/users/username/availability", params={"username": username})

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


def test_username_assignment_requires_authentication(client):
    response = client.patch("/api/v1/users/me/username", json={"username": "aile"}, headers={"Authorization": "Bearer invalid-token"})

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "unauthorized"


def test_username_assignment_persists_normalized_state_and_prevents_reassignment(client):
    user_id, headers = create_user()

    response = client.patch("/api/v1/users/me/username", json={"username": "Aile_Sharma"}, headers=headers)

    assert response.status_code == 200
    assert response.json()["username"] == "aile_sharma"
    assert response.json()["username_setup_complete"] is True
    me = client.get("/api/v1/users/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["id"] == str(user_id)
    assert me.json()["username"] == "aile_sharma"
    assert me.json()["username_setup_complete"] is True

    with SessionLocal() as db:
        user = db.get(User, user_id)
        assert user is not None
        assert user.username == "aile_sharma"

    repeated = client.patch("/api/v1/users/me/username", json={"username": "different_name"}, headers=headers)
    assert repeated.status_code == 409
    assert repeated.json()["error"]["code"] == "username_already_set"


def test_put_updates_username_without_changing_authenticated_ownership(client):
    _, headers = create_user()

    assert client.patch("/api/v1/users/me/username", json={"username": "first_name"}, headers=headers).status_code == 200

    response = client.put("/api/v1/users/me/username", json={"username": "second_name"}, headers=headers)

    assert response.status_code == 200
    assert response.json()["username"] == "second_name"
    assert client.get("/api/v1/users/me", headers=headers).json()["username"] == "second_name"


def test_username_assignment_rejects_duplicate_and_availability_hides_account_details(client):
    first_id, first_headers = create_user(email="first@example.com")
    second_id, second_headers = create_user(email="second@example.com")

    assert client.patch("/api/v1/users/me/username", json={"username": "taken_name"}, headers=first_headers).status_code == 200
    available = client.get("/api/v1/users/username/availability", params={"username": "Taken_Name"})
    assert available.status_code == 200
    assert available.json() == {"available": False}

    duplicate = client.patch("/api/v1/users/me/username", json={"username": "TAKEN_NAME"}, headers=second_headers)
    assert duplicate.status_code == 409
    assert duplicate.json()["error"]["code"] == "username_taken"
    assert "user_id" not in duplicate.json()["error"]
    assert "email" not in duplicate.json()["error"]
    assert first_id != second_id


def test_user_without_username_can_complete_setup_without_changing_interview_history(client, monkeypatch):
    monkeypatch.setattr(
        interview_service,
        "create_text_to_speech",
        lambda: type("TestTTS", (), {"synthesize": lambda self, text: b"test-audio"})(),
    )
    user_id, headers = create_user()
    payload = {
        "interview_type": "behavioral",
        "job_role": "Software Engineer",
        "experience_level": "mid",
        "difficulty": "medium",
        "personality": "professional",
        "duration": 30,
        "question_count": 1,
    }
    interview = client.post("/api/v1/interviews", json=payload, headers=headers)
    assert interview.status_code == 201
    interview_id = UUID(interview.json()["id"])
    question_id = UUID(interview.json()["questions"][0]["id"])
    assert client.post(f"/api/v1/interviews/{interview_id}/start", headers=headers).status_code == 200
    answer = client.post(
        f"/api/v1/interviews/questions/{question_id}/answer",
        json={"transcript": "I delivered a measurable project outcome for the team and customers.", "duration": 10},
        headers=headers,
    )
    assert answer.status_code == 201
    answer_id = UUID(answer.json()["id"])

    before = client.get(f"/api/v1/interviews/{interview_id}", headers=headers).json()
    assert before["status"] == "completed"
    assert client.get("/api/v1/users/me", headers=headers).json()["username"] is None

    assigned = client.patch("/api/v1/users/me/username", json={"username": "history_user"}, headers=headers)
    assert assigned.status_code == 200

    after = client.get(f"/api/v1/interviews/{interview_id}", headers=headers)
    assert after.status_code == 200
    assert after.json()["id"] == str(interview_id)
    assert after.json()["status"] == before["status"]
    feedback = client.get(f"/api/v1/interviews/{interview_id}/feedback", headers=headers)
    assert feedback.status_code == 200

    with SessionLocal() as db:
        user = db.get(User, user_id)
        assert user is not None
        assert user.username == "history_user"
        session = db.get(InterviewSession, interview_id)
        assert session is not None
        assert session.user_id == user_id
        assert db.get(Question, question_id) is not None
        assert db.get(Answer, answer_id) is not None
        assert db.scalar(select(AnswerEvaluation).where(AnswerEvaluation.answer_id == answer_id)) is not None
        assert db.scalar(select(SpeechMetrics).where(SpeechMetrics.answer_id == answer_id)) is not None


def test_users_without_username_are_valid_and_existing_user_with_username_is_complete(client):
    missing_id, missing_headers = create_user(email="missing@example.com")
    present_id, present_headers = create_user(email="present@example.com")

    missing = client.get("/api/v1/users/me", headers=missing_headers)
    assert missing.status_code == 200
    assert missing.json()["username"] is None
    assert missing.json()["username_setup_complete"] is False

    assert client.patch("/api/v1/users/me/username", json={"username": "present_user"}, headers=present_headers).status_code == 200
    present = client.get("/api/v1/users/me", headers=present_headers)
    assert present.status_code == 200
    assert present.json()["id"] == str(present_id)
    assert present.json()["username"] == "present_user"
    assert present.json()["username_setup_complete"] is True
    assert missing_id != present_id