from uuid import UUID, uuid4

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models import InterviewSummary

import pytest


def interview_payload():
    return {
        "interview_type": "behavioral",
        "job_role": "Software Engineer",
        "experience_level": "mid",
        "difficulty": "medium",
        "personality": "professional",
        "duration": 30,
        "question_count": 2,
    }


def user_headers(user_id: str, email: str, name: str = "User"):
    return {"Authorization": f"Bearer dev:{user_id}:{email}:{name}"}


def test_health_and_current_user(client):
    assert client.get("/health").json()["status"] == "ok"
    response = client.get("/api/v1/users/me")
    assert response.status_code == 200
    assert response.json()["email"] == "developer@localhost"


def test_interview_lifecycle_and_answer(client):
    created = client.post("/api/v1/interviews", json=interview_payload())
    assert created.status_code == 201
    interview = created.json()
    assert interview["status"] == "created"
    assert interview["question_count"] == 2
    session_id = interview["id"]
    question_id = interview["questions"][0]["id"]

    # Try answering before starting -> should be rejected (409)
    early_ans = client.post(f"/api/v1/interviews/questions/{question_id}/answer", json={"transcript": "early answer", "duration": 5})
    assert early_ans.status_code == 409

    # Start interview
    assert client.post(f"/api/v1/interviews/{session_id}/start").json()["status"] == "active"

    # Fetch questions endpoint
    q_resp = client.get(f"/api/v1/interviews/{session_id}/questions")
    assert q_resp.status_code == 200
    assert len(q_resp.json()["items"]) == 1

    # Answer question with detailed answer (> 10 words, exactly 15 words)
    answer = client.post(
        f"/api/v1/interviews/questions/{question_id}/answer",
        json={"transcript": "I led a distributed systems migration which reduced database query latency for millions of users.", "duration": 12},
    )
    assert answer.status_code == 201
    answer_id = answer.json()["id"]
    assert answer.json()["speech_metrics"]["word_count"] == 15
    assert answer.json()["evaluation"]["overall_score"] == 80

    # Get answer feedback
    feedback = client.get(f"/api/v1/answers/{answer_id}/feedback")
    assert feedback.status_code == 200
    assert feedback.json()["overall_score"] == 80

    # Complete interview
    comp = client.post(f"/api/v1/interviews/{session_id}/complete")
    assert comp.status_code == 200
    assert comp.json()["status"] == "completed"

    # Get summary feedback
    summary = client.get(f"/api/v1/interviews/{session_id}/feedback")
    assert summary.status_code == 200
    assert summary.json()["overall_score"] == 80


def test_retry_answer(client):
    created = client.post("/api/v1/interviews", json=interview_payload()).json()
    session_id = created["id"]
    question_id = created["questions"][0]["id"]

    client.post(f"/api/v1/interviews/{session_id}/start")
    client.post(f"/api/v1/interviews/questions/{question_id}/answer", json={"transcript": "First attempt answer text.", "duration": 8})

    retry_res = client.post(f"/api/v1/interviews/questions/{question_id}/retry", json={})
    assert retry_res.status_code == 200
    assert retry_res.json()["attempt_number"] == 2

    # Submit second attempt
    second_ans = client.post(f"/api/v1/interviews/questions/{question_id}/answer", json={"transcript": "Second improved attempt answer text.", "duration": 10})
    assert second_ans.status_code == 201
    assert second_ans.json()["attempt_number"] == 2


def test_question_count_progresses_and_completes(client):
    payload = interview_payload()
    payload["question_count"] = 2
    created = client.post("/api/v1/interviews", json=payload).json()
    session_id = created["id"]
    first_question_id = created["questions"][0]["id"]

    assert client.post(f"/api/v1/interviews/{session_id}/start").status_code == 200
    first_answer = client.post(
        f"/api/v1/interviews/questions/{first_question_id}/answer",
        json={"transcript": "This is a detailed first answer with useful context.", "duration": 8},
    )
    assert first_answer.status_code == 201

    questions = client.get(f"/api/v1/interviews/{session_id}/questions").json()["items"]
    assert len(questions) == 2
    second_question_id = questions[1]["id"]

    second_answer = client.post(
        f"/api/v1/interviews/questions/{second_question_id}/answer",
        json={"transcript": "This is a detailed second answer with useful context.", "duration": 8},
    )
    assert second_answer.status_code == 201
    interview = client.get(f"/api/v1/interviews/{session_id}").json()
    assert interview["status"] == "completed"
    assert interview["current_question_number"] == 2


@pytest.mark.parametrize("question_count", [0, -1, 21])
def test_question_count_validation(client, question_count):
    payload = interview_payload()
    payload["question_count"] = question_count
    response = client.post("/api/v1/interviews", json=payload)
    assert response.status_code == 422


def test_list_interviews_pagination_and_filter(client):
    # Create 2 interviews
    client.post("/api/v1/interviews", json=interview_payload())
    i2 = client.post("/api/v1/interviews", json=interview_payload()).json()
    client.post(f"/api/v1/interviews/{i2['id']}/start")

    # List all
    res_all = client.get("/api/v1/interviews?limit=10&offset=0")
    assert res_all.status_code == 200
    assert res_all.json()["total"] == 2

    # Filter active
    res_active = client.get("/api/v1/interviews?status=active")
    assert res_active.status_code == 200
    assert res_active.json()["total"] == 1
    assert res_active.json()["items"][0]["id"] == i2["id"]


def test_list_interviews_includes_nullable_summary_scores_and_preserves_pagination(client):
    first = client.post("/api/v1/interviews", json=interview_payload()).json()
    second = client.post("/api/v1/interviews", json=interview_payload()).json()
    third = client.post("/api/v1/interviews", json=interview_payload()).json()
    fourth = client.post("/api/v1/interviews", json=interview_payload()).json()
    client.post(f"/api/v1/interviews/{first['id']}/start")
    client.post(f"/api/v1/interviews/{first['id']}/complete")
    client.post(f"/api/v1/interviews/{second['id']}/start")
    client.post(f"/api/v1/interviews/{second['id']}/complete")
    client.post(f"/api/v1/interviews/{third['id']}/cancel")
    client.post(f"/api/v1/interviews/{fourth['id']}/start")

    with SessionLocal() as db:
        summaries = db.scalars(select(InterviewSummary).where(InterviewSummary.session_id.in_([UUID(first["id"]), UUID(second["id"])]))).all()
        summaries_by_session = {str(summary.session_id): summary for summary in summaries}
        summaries_by_session[first["id"]].overall_score = 82
        summaries_by_session[second["id"]].overall_score = 74
        db.commit()

    response = client.get("/api/v1/interviews?limit=10&offset=0")
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 4
    assert len(payload["items"]) == 4
    scores = {item["id"]: item["overall_score"] for item in payload["items"]}
    assert scores[first["id"]] == 82
    assert scores[second["id"]] == 74
    assert scores[third["id"]] is None
    assert scores[fourth["id"]] is None

    next_page = client.get("/api/v1/interviews?limit=2&offset=2")
    assert next_page.status_code == 200
    assert next_page.json()["total"] == 4
    assert len(next_page.json()["items"]) == 2


def test_feedback_endpoint_remains_available_for_completed_interview(client):
    created = client.post("/api/v1/interviews", json=interview_payload()).json()
    session_id = created["id"]
    client.post(f"/api/v1/interviews/{session_id}/start")
    client.post(
        f"/api/v1/interviews/questions/{created['questions'][0]['id']}/answer",
        json={"transcript": "I led a distributed systems migration which reduced database query latency for millions of users.", "duration": 8},
    )
    completed = client.post(f"/api/v1/interviews/{session_id}/complete")
    assert completed.status_code == 200

    feedback = client.get(f"/api/v1/interviews/{session_id}/feedback")
    assert feedback.status_code == 200
    assert feedback.json()["overall_score"] == 80


def test_multi_tenant_isolation(client):
    user_a = "00000000-0000-0000-0000-000000000001"
    user_b = "00000000-0000-0000-0000-000000000002"

    headers_a = user_headers(user_a, "usera@example.com", "User A")
    headers_b = user_headers(user_b, "userb@example.com", "User B")

    # User A creates an interview
    created_a = client.post("/api/v1/interviews", json=interview_payload(), headers=headers_a).json()
    session_id = created_a["id"]
    question_id = created_a["questions"][0]["id"]

    # User B tries to view User A's interview -> 404
    get_b = client.get(f"/api/v1/interviews/{session_id}", headers=headers_b)
    assert get_b.status_code == 404

    # User B tries to start User A's interview -> 404
    start_b = client.post(f"/api/v1/interviews/{session_id}/start", headers=headers_b)
    assert start_b.status_code == 404

    # User A starts interview
    client.post(f"/api/v1/interviews/{session_id}/start", headers=headers_a)

    # User B tries to submit answer to User A's question -> 404
    ans_b = client.post(f"/api/v1/interviews/questions/{question_id}/answer", json={"transcript": "hacking answer", "duration": 5}, headers=headers_b)
    assert ans_b.status_code == 404


def test_dashboard_stats_empty_state(client):
    response = client.get("/api/v1/interviews/stats")

    assert response.status_code == 200
    assert response.json() == {
        "average_score": None,
        "interview_count": 0,
        "role_count": 0,
        "dimensions": {
            "relevance": None,
            "clarity": None,
            "structure": None,
            "specificity": None,
            "technical_accuracy": None,
            "conciseness": None,
            "communication": None,
        },
    }


def test_dashboard_stats_aggregate_completed_interview(client):
    payload = interview_payload()
    payload["question_count"] = 1
    created = client.post("/api/v1/interviews", json=payload).json()
    client.post(f"/api/v1/interviews/{created['id']}/start")
    client.post(
        f"/api/v1/interviews/questions/{created['questions'][0]['id']}/answer",
        json={"transcript": "I delivered a measurable project outcome for the team and customers.", "duration": 10},
    )

    stats = client.get("/api/v1/interviews/stats")

    assert stats.status_code == 200
    assert stats.json()["average_score"] == 80.0
    assert stats.json()["interview_count"] == 1
    assert stats.json()["role_count"] == 1
    assert stats.json()["dimensions"]["clarity"] == 80.0


def test_invalid_transition_is_rejected(client):
    interview = client.post("/api/v1/interviews", json=interview_payload()).json()
    session_id = interview["id"]
    assert client.post(f"/api/v1/interviews/{session_id}/complete").status_code == 409


def test_final_answer_persists_completion_summary_and_latest_feedback(client):
    payload = interview_payload()
    payload["question_count"] = 1
    created = client.post("/api/v1/interviews", json=payload).json()
    session_id = created["id"]
    question_id = created["questions"][0]["id"]

    assert client.post(f"/api/v1/interviews/{session_id}/start").status_code == 200
    answer = client.post(
        f"/api/v1/interviews/questions/{question_id}/answer",
        json={"transcript": "This is a detailed answer with a concrete outcome for the team.", "duration": 8},
    )
    assert answer.status_code == 201
    assert answer.json()["evaluation"]["overall_score"] == 80

    interview = client.get(f"/api/v1/interviews/{session_id}")
    assert interview.json()["status"] == "completed"

    latest = client.get(f"/api/v1/interviews/{session_id}/latest-answer")
    assert latest.status_code == 200
    assert latest.json()["id"] == answer.json()["id"]
    assert latest.json()["evaluation"]["overall_score"] == 80

    summary = client.get(f"/api/v1/interviews/{session_id}/feedback")
    assert summary.status_code == 200
    assert summary.json()["total_questions"] == 1
