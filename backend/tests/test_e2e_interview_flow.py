from uuid import UUID

from sqlalchemy import select

import app.services.interview_service as interview_service
from app.db.session import SessionLocal
from app.models import Answer, AnswerEvaluation, InterviewSession, InterviewSummary, Question, SessionStatus, SpeechMetrics


def test_typed_interview_flow_completes_with_retry_and_feedback(client, monkeypatch):
    monkeypatch.setattr(
        interview_service,
        "create_text_to_speech",
        lambda: type("TestTTS", (), {"synthesize": lambda self, text: b"test-audio"})(),
    )
    question_count = 3
    payload = {
        "interview_type": "behavioral",
        "job_role": "Software Engineer",
        "experience_level": "mid",
        "difficulty": "medium",
        "personality": "professional",
        "duration": 30,
        "question_count": question_count,
    }

    created_response = client.post("/api/v1/interviews", json=payload)
    assert created_response.status_code == 201
    created = created_response.json()
    interview_id = UUID(created["id"])
    assert interview_id
    assert created["status"] == SessionStatus.CREATED.value
    assert created["question_count"] == question_count
    assert created["current_question_number"] == 0
    assert len(created["questions"]) == 1

    first_question_id = UUID(created["questions"][0]["id"])
    assert created["questions"][0]["question_number"] == 1
    with SessionLocal() as db:
        session = db.get(InterviewSession, interview_id)
        assert session is not None
        assert session.status is SessionStatus.CREATED
        assert session.question_count == question_count
        question = db.get(Question, first_question_id)
        assert question is not None
        assert question.session_id == interview_id
        assert question.question_number == 1

    start_response = client.post(f"/api/v1/interviews/{interview_id}/start")
    assert start_response.status_code == 200
    assert start_response.json()["status"] == SessionStatus.ACTIVE.value

    submitted_question_ids: set[UUID] = set()
    total_answers = 0
    for question_number in range(1, question_count + 1):
        questions_response = client.get(f"/api/v1/interviews/{interview_id}/questions")
        assert questions_response.status_code == 200
        questions = questions_response.json()["items"]
        assert len(questions) == question_number
        current_question = next(item for item in questions if item["question_number"] == question_number)
        question_id = UUID(current_question["id"])
        assert question_id not in submitted_question_ids
        submitted_question_ids.add(question_id)

        with SessionLocal() as db:
            question = db.get(Question, question_id)
            assert question is not None
            assert question.session_id == interview_id
            assert question.question_number == question_number

        answer_response = client.post(
            f"/api/v1/interviews/questions/{question_id}/answer",
            json={
                "transcript": (
                    f"For question {question_number}, I led a measurable project improvement "
                    "by aligning stakeholders, reducing delivery risk, and tracking the outcome."
                ),
                "duration": 12,
            },
        )
        assert answer_response.status_code == 201
        answer = answer_response.json()
        answer_id = UUID(answer["id"])
        assert UUID(answer["question_id"]) == question_id
        assert answer["attempt_number"] == 1
        assert answer["speech_metrics"] is not None
        assert answer["evaluation"] is not None
        total_answers += 1

        with SessionLocal() as db:
            persisted_answer = db.get(Answer, answer_id)
            assert persisted_answer is not None
            assert persisted_answer.question_id == question_id
            assert persisted_answer.session_id == interview_id
            assert persisted_answer.attempt_number == 1
            assert db.scalar(select(AnswerEvaluation).where(AnswerEvaluation.answer_id == answer_id)) is not None
            assert db.scalar(select(SpeechMetrics).where(SpeechMetrics.answer_id == answer_id)) is not None

        if question_number == 1:
            retry_response = client.post(
                f"/api/v1/interviews/questions/{question_id}/retry",
                json={
                    "transcript": "I improved the initial answer with a clearer result and concrete evidence.",
                    "duration": 10,
                },
            )
            assert retry_response.status_code == 200
            retry = retry_response.json()
            assert retry["question_id"] == str(question_id)
            assert retry["attempt_number"] == 2
            assert retry["status"] == "submitted"
            assert retry["answer_id"]
            assert retry["score_delta"] == 0
            retry_answer_id = UUID(retry["answer_id"])
            total_answers += 1

            with SessionLocal() as db:
                persisted_retry = db.get(Answer, retry_answer_id)
                assert persisted_retry is not None
                assert persisted_retry.question_id == question_id
                assert persisted_retry.session_id == interview_id
                assert persisted_retry.attempt_number == 2
                assert db.scalar(select(AnswerEvaluation).where(AnswerEvaluation.answer_id == retry_answer_id)) is not None
                assert db.scalar(select(SpeechMetrics).where(SpeechMetrics.answer_id == retry_answer_id)) is not None

        interview_response = client.get(f"/api/v1/interviews/{interview_id}")
        assert interview_response.status_code == 200
        interview = interview_response.json()
        assert interview["id"] == str(interview_id)
        assert interview["current_question_number"] == question_number
        expected_status = SessionStatus.COMPLETED.value if question_number == question_count else SessionStatus.ACTIVE.value
        assert interview["status"] == expected_status

    with SessionLocal() as db:
        session = db.get(InterviewSession, interview_id)
        assert session is not None
        assert session.status is SessionStatus.COMPLETED
        assert session.current_question_number == question_count
        assert len(session.questions) == question_count
        answers = db.scalars(select(Answer).where(Answer.session_id == interview_id)).all()
        evaluations = db.scalars(
            select(AnswerEvaluation).join(Answer).where(Answer.session_id == interview_id)
        ).all()
        metrics = db.scalars(select(SpeechMetrics).join(Answer).where(Answer.session_id == interview_id)).all()
        assert len(answers) == total_answers
        assert len(evaluations) == total_answers
        assert len(metrics) == total_answers
        assert db.scalar(select(InterviewSummary).where(InterviewSummary.session_id == interview_id)) is not None

    questions_response = client.get(f"/api/v1/interviews/{interview_id}/questions")
    assert questions_response.status_code == 200
    final_questions = questions_response.json()["items"]
    assert len(final_questions) == question_count
    assert {item["question_number"] for item in final_questions} == set(range(1, question_count + 1))

    feedback_response = client.get(f"/api/v1/interviews/{interview_id}/feedback")
    assert feedback_response.status_code == 200
    feedback = feedback_response.json()
    assert feedback["total_questions"] == question_count
    assert feedback["overall_score"] is not None
    assert feedback["total_duration"] > 0
    assert feedback["average_wpm"] > 0
    assert isinstance(feedback["strengths"], list)
    assert isinstance(feedback["weaknesses"], list)
    assert isinstance(feedback["recommendations"], list)
    with SessionLocal() as db:
        summary = db.scalar(select(InterviewSummary).where(InterviewSummary.session_id == interview_id))
        assert summary is not None
        assert summary.total_questions == feedback["total_questions"]
        assert summary.overall_score == feedback["overall_score"]

    list_response = client.get("/api/v1/interviews")
    assert list_response.status_code == 200
    listed = next(item for item in list_response.json()["items"] if item["id"] == str(interview_id))
    assert listed["status"] == SessionStatus.COMPLETED.value
    assert listed["question_count"] == question_count
    assert listed["current_question_number"] == question_count
    assert len(listed["questions"]) == question_count