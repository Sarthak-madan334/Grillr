import asyncio
import threading
from uuid import uuid4
from uuid import UUID, uuid4
import pytest
from sqlalchemy import select
from app.core.auth import DEV_USER_ID
from app.db.session import SessionLocal
from app.models import Answer, AnswerEvaluation, InterviewSession, Question, SessionStatus
import app.api.v1.websocket as websocket_module
from starlette.websockets import WebSocketDisconnect


def test_websocket_lifecycle_and_events(client):
    user_token = f"dev:{DEV_USER_ID}:developer@localhost:Development User"
    create_res = client.post("/api/v1/interviews", json={
        "interview_type": "technical",
        "job_role": "Backend Engineer",
        "experience_level": "senior",
        "difficulty": "hard",
        "personality": "challenging",
        "duration": 45
    }, headers={"Authorization": f"Bearer {user_token}"})
    session_id = create_res.json()["id"]

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}") as ws:
        ws.send_json({"type": "auth", "token": user_token})
        assert ws.receive_json()["type"] == "auth.ok"
        # Connected event
        conn_msg = ws.receive_json()
        assert conn_msg["type"] == "session.connected"
        assert conn_msg["data"]["session_id"] == session_id
        assert conn_msg["data"]["turn_state"] == "listening"

        # Send session.start
        ws.send_json({"type": "session.start"})
        start_msg = ws.receive_json()
        assert start_msg["type"] == "session.started"
        assert ws.receive_json()["type"] == "audio.ai"

        # Send speech.start
        ws.send_json({"type": "speech.start", "turn_id": "turn-lifecycle"})
        speech_msg = ws.receive_json()
        assert speech_msg["type"] == "speech.start.ack"
        assert ws.receive_json()["data"]["state"] == "listening"

        # Send invalid event
        ws.send_json({"type": "unknown.event"})
        err_msg = ws.receive_json()
        assert err_msg["type"] == "error"
        assert err_msg["data"]["code"] == "invalid_event"


def test_websocket_rejects_unauthenticated(client):
    fake_session_id = uuid4()
    with client.websocket_connect(f"/api/v1/ws/interviews/{fake_session_id}") as ws:
        ws.send_json({"type": "speech.start", "turn_id": "turn-buffer"})
        with pytest.raises(WebSocketDisconnect) as exc_info:
            ws.receive_json()
        assert exc_info.value.code == 1008


def test_websocket_rejects_malformed_auth_payload(client):
    with client.websocket_connect(f"/api/v1/ws/interviews/{uuid4()}") as ws:
        ws.send_text("not-json")
        with pytest.raises(WebSocketDisconnect) as exc_info:
            ws.receive_json()
        assert exc_info.value.code == 1008


def test_websocket_rejects_invalid_auth_token(client):
    with client.websocket_connect(f"/api/v1/ws/interviews/{uuid4()}") as ws:
        ws.send_json({"type": "auth", "token": "invalid-token"})
        with pytest.raises(WebSocketDisconnect) as exc_info:
            ws.receive_json()
        assert exc_info.value.code == 1008


def test_websocket_rejects_answer_without_turn_id(client):
    session_id, token = _create_interview(client)

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}") as ws:
        ws.send_json({"type": "auth", "token": token})
        assert ws.receive_json()["type"] == "auth.ok"
        assert ws.receive_json()["type"] == "session.connected"
        ws.send_json({"type": "speech.start"})
        error = ws.receive_json()
        assert error["type"] == "error"
        assert error["data"]["code"] == "missing_turn_id"


def test_websocket_reconnect_requires_first_message_auth(client, caplog):
    session_id, token = _create_interview(client)

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}") as ws:
        ws.send_json({"type": "auth", "token": token})
        assert ws.receive_json()["type"] == "auth.ok"
        assert ws.receive_json()["type"] == "session.connected"

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}") as ws:
        ws.send_json({"type": "session.resync"})
        with pytest.raises(WebSocketDisconnect) as exc_info:
            ws.receive_json()
        assert exc_info.value.code == 1008

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}") as ws:
        ws.send_json({"type": "auth", "token": token})
        assert ws.receive_json()["type"] == "auth.ok"
        assert ws.receive_json()["type"] == "session.connected"

    assert token not in " ".join(record.getMessage() for record in caplog.records)


def _create_interview(client, question_count=5):
    token = f"dev:{DEV_USER_ID}:developer@localhost:Development User"
    response = client.post("/api/v1/interviews", json={
        "interview_type": "technical",
        "job_role": "Backend Engineer",
        "experience_level": "senior",
        "difficulty": "hard",
        "personality": "challenging",
        "duration": 45,
        "question_count": question_count,
    }, headers={"Authorization": f"Bearer {token}"})
    return response.json()["id"], token


def test_websocket_buffers_binary_audio_and_returns_final_transcript(client, monkeypatch):
    received: list[bytes] = []

    class FakeSpeechToText:
        def transcribe(self, audio: bytes) -> str:
            received.append(audio)
            return "I improved the deployment pipeline."

    monkeypatch.setattr(websocket_module, "create_speech_to_text", lambda: FakeSpeechToText())
    session_id, token = _create_interview(client)

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}") as ws:
        ws.send_json({"type": "auth", "token": token})
        assert ws.receive_json()["type"] == "auth.ok"
        ws.receive_json()
        ws.send_json({"type": "speech.start", "turn_id": "turn-empty"})
        assert ws.receive_json()["type"] == "speech.start.ack"
        ws.receive_json()
        ws.send_bytes(b"first-")
        ws.send_bytes(b"chunk")
        ws.send_json({"type": "speech.stop"})

        assert ws.receive_json()["type"] == "speech.stop.ack"
        assert ws.receive_json()["data"]["state"] == "processing"
        transcript = ws.receive_json()
        assert transcript["type"] == "transcript.final"
        assert transcript["data"]["text"] == "I improved the deployment pipeline."
        assert transcript["data"]["question_id"]
        assert received == [b"first-chunk"]


def test_websocket_emits_question_audio_on_session_start(client, monkeypatch):
    class FakeTextToSpeech:
        media_type = "audio/wav"

        def synthesize(self, text: str) -> bytes:
            assert text
            return b"question-audio"

    monkeypatch.setattr(websocket_module, "create_text_to_speech", lambda: FakeTextToSpeech())
    session_id, token = _create_interview(client)

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}") as ws:
        ws.send_json({"type": "auth", "token": token})
        assert ws.receive_json()["type"] == "auth.ok"
        assert ws.receive_json()["type"] == "session.connected"
        ws.send_json({"type": "session.start"})
        assert ws.receive_json()["type"] == "session.started"
        audio_event = ws.receive_json()

        assert audio_event["type"] == "audio.ai"
        assert audio_event["data"]["media_type"] == "audio/wav"
        assert audio_event["data"]["question_id"]
        assert audio_event["data"]["audio_base64"]


def test_websocket_rejects_out_of_state_and_empty_audio(client):
    session_id, token = _create_interview(client)

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}") as ws:
        ws.send_json({"type": "auth", "token": token})
        assert ws.receive_json()["type"] == "auth.ok"
        ws.receive_json()
        ws.send_bytes(b"audio-before-start")
        assert ws.receive_json()["data"]["code"] == "audio_out_of_state"

        ws.send_text("not-json")
        assert ws.receive_json()["data"]["code"] == "invalid_event"

        ws.send_json({"type": "speech.start", "turn_id": "turn-pipeline"})
        ws.receive_json()
        ws.receive_json()
        ws.send_json({"type": "speech.stop"})
        assert ws.receive_json()["type"] == "speech.stop.ack"
        assert ws.receive_json()["data"]["code"] == "empty_audio"


def test_websocket_continues_pipeline_after_transcript(client, monkeypatch):
    class FakeSpeechToText:
        def transcribe(self, audio: bytes) -> str:
            return "I improved the deployment pipeline."

    class FakeTextToSpeech:
        media_type = "audio/mpeg"

        def synthesize(self, text: str) -> bytes:
            assert text
            return b"next-question-audio"

    monkeypatch.setattr(websocket_module, "create_speech_to_text", lambda: FakeSpeechToText())
    monkeypatch.setattr("app.services.interview_service.create_text_to_speech", lambda: FakeTextToSpeech())

    session_id, token = _create_interview(client)

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}") as ws:
        ws.send_json({"type": "auth", "token": token})
        assert ws.receive_json()["type"] == "auth.ok"
        ws.receive_json()
        ws.send_json({"type": "speech.start", "turn_id": "turn-stt-failure"})
        ws.receive_json()
        ws.receive_json()
        ws.send_bytes(b"audio-bytes")
        ws.send_json({"type": "speech.stop"})

        assert ws.receive_json()["type"] == "speech.stop.ack"
        assert ws.receive_json()["data"]["state"] == "processing"
        assert ws.receive_json()["type"] == "transcript.final"

        question_created = None
        for _ in range(5):
            message = ws.receive_json()
            if message["type"] == "question.created":
                question_created = message
                break
        assert question_created is not None
        assert question_created["data"]["text"]
        assert question_created["data"]["audio_url"].endswith("/audio")

    with SessionLocal() as db:
        answer_session_id = UUID(session_id)
        answer = db.scalar(select(Answer).where(Answer.session_id == answer_session_id).order_by(Answer.created_at.desc()))
        assert answer is not None
        assert answer.transcript == "I improved the deployment pipeline."
        assert answer.evaluation is None

        next_question = db.scalar(select(Question).where(Question.session_id == answer_session_id, Question.is_follow_up.is_(False), Question.question_number > 1))
        assert next_question.question_text == question_created["data"]["text"]


def test_websocket_provider_failure_returns_error_event(client, monkeypatch):
    class FailingSpeechToText:
        def transcribe(self, audio: bytes) -> str:
            raise RuntimeError("provider failed")

    monkeypatch.setattr(websocket_module, "create_speech_to_text", lambda: FailingSpeechToText())
    session_id, token = _create_interview(client)

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}") as ws:
        ws.send_json({"type": "auth", "token": token})
        assert ws.receive_json()["type"] == "auth.ok"
        ws.receive_json()
        ws.send_json({"type": "speech.start", "turn_id": "turn-stt-failure"})
        ws.receive_json()
        ws.receive_json()
        ws.send_bytes(b"audio")
        ws.send_json({"type": "speech.stop"})
        ws.receive_json()
        ws.receive_json()
        assert ws.receive_json()["data"]["code"] == "stt_failed"


def test_websocket_pipeline_initialization_failure_returns_error_event(client, monkeypatch):
    session_id, token = _create_interview(client)

    def fail_pipeline(*_args, **_kwargs):
        raise RuntimeError("tts unavailable")

    monkeypatch.setattr(websocket_module, "InterviewService", fail_pipeline)

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}") as ws:
        ws.send_json({"type": "auth", "token": token})
        error = ws.receive_json()
        assert error["type"] == "error"
        assert error["data"]["code"] == "pipeline_initialization_failed"


def test_websocket_duplicate_turn_replays_without_duplicate_answer(client, monkeypatch):
    class FakeSpeechToText:
        def transcribe(self, audio: bytes) -> str:
            return "I improved the deployment pipeline with automated checks."

    class FakeTextToSpeech:
        media_type = "audio/mpeg"

        def synthesize(self, text: str) -> bytes:
            return b"next-question-audio"

    monkeypatch.setattr(websocket_module, "create_speech_to_text", lambda: FakeSpeechToText())
    monkeypatch.setattr("app.services.interview_service.create_text_to_speech", lambda: FakeTextToSpeech())
    session_id, token = _create_interview(client)
    turn_id = "turn-duplicate-1"

    def submit(ws):
        ws.send_json({"type": "speech.start", "turn_id": turn_id})
        assert ws.receive_json()["type"] == "speech.start.ack"
        assert ws.receive_json()["type"] == "turn.state_changed"
        ws.send_bytes(b"audio")
        ws.send_json({"type": "speech.stop", "turn_id": turn_id})
        assert ws.receive_json()["type"] == "speech.stop.ack"
        assert ws.receive_json()["type"] == "turn.state_changed"
        events = [ws.receive_json(), ws.receive_json(), ws.receive_json(), ws.receive_json()]
        return [event["type"] for event in events]

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}") as ws:
        ws.send_json({"type": "auth", "token": token})
        assert ws.receive_json()["type"] == "auth.ok"
        ws.receive_json()
        first_events = submit(ws)

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}") as ws:
        ws.send_json({"type": "auth", "token": token})
        assert ws.receive_json()["type"] == "auth.ok"
        ws.receive_json()
        replay_events = submit(ws)

    assert first_events[:2] == ["transcript.final", "answer.saved"]
    assert replay_events[:2] == ["transcript.final", "answer.saved"]
    with SessionLocal() as db:
        answers = list(db.scalars(select(Answer).where(Answer.session_id == UUID(session_id))).all())
        assert len(answers) == 1
        assert answers[0].idempotency_key == turn_id
        assert answers[0].evaluation is None


def test_websocket_final_answer_emits_ordered_completion(client, monkeypatch):
    class FakeSpeechToText:
        def transcribe(self, audio: bytes) -> str:
            return "I delivered the project successfully."

    monkeypatch.setattr(websocket_module, "create_speech_to_text", lambda: FakeSpeechToText())
    session_id, token = _create_interview(client, question_count=1)

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}") as ws:
        ws.send_json({"type": "auth", "token": token})
        assert ws.receive_json()["type"] == "auth.ok"
        ws.receive_json()
        ws.send_json({"type": "speech.start", "turn_id": "turn-complete-1"})
        ws.receive_json()
        ws.receive_json()
        ws.send_bytes(b"audio")
        ws.send_json({"type": "speech.stop", "turn_id": "turn-complete-1"})
        assert ws.receive_json()["type"] == "speech.stop.ack"
        assert ws.receive_json()["type"] == "turn.state_changed"
        events = [ws.receive_json(), ws.receive_json(), ws.receive_json()]

    assert [event["type"] for event in events] == ["transcript.final", "answer.saved", "session.completed"]
    assert events[-1]["data"]["session_id"] == session_id
    with SessionLocal() as db:
        session = db.get(InterviewSession, UUID(session_id))
        answer = db.scalar(select(Answer).where(Answer.session_id == UUID(session_id)))
        assert answer is not None and answer.evaluation is not None
        assert session.status == SessionStatus.COMPLETED


def test_websocket_answer_is_saved_when_final_feedback_is_deferred(client, monkeypatch):
    class FakeSpeechToText:
        def transcribe(self, audio: bytes) -> str:
            return "I improved reliability with automated deployment checks."

    monkeypatch.setattr(websocket_module, "create_speech_to_text", lambda: FakeSpeechToText())
    session_id, token = _create_interview(client)
    turn_id = "turn-retry-1"

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}") as ws:
        ws.send_json({"type": "auth", "token": token})
        assert ws.receive_json()["type"] == "auth.ok"
        ws.receive_json()
        ws.send_json({"type": "speech.start", "turn_id": turn_id})
        ws.receive_json()
        ws.receive_json()
        ws.send_bytes(b"audio")
        ws.send_json({"type": "speech.stop", "turn_id": turn_id})
        events = []
        for _ in range(6):
            event = ws.receive_json()
            events.append(event["type"])
            if event["type"] == "answer.saved":
                break
        assert "transcript.final" in events
        assert "answer.saved" in events

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}") as ws:
        ws.send_json({"type": "auth", "token": token})
        assert ws.receive_json()["type"] == "auth.ok"
        ws.receive_json()
        ws.send_json({"type": "speech.start", "turn_id": turn_id})
        ws.receive_json()
        ws.receive_json()
        ws.send_bytes(b"audio")
        ws.send_json({"type": "speech.stop", "turn_id": turn_id})
        ws.receive_json()
        ws.receive_json()
        events = [ws.receive_json(), ws.receive_json(), ws.receive_json(), ws.receive_json()]
        assert events[0]["type"] == "transcript.final"
        assert events[1]["type"] == "answer.saved"

    with SessionLocal() as db:
        answers = list(db.scalars(select(Answer).where(Answer.session_id == UUID(session_id))).all())
        assert len(answers) == 1
        assert answers[0].evaluation is None
