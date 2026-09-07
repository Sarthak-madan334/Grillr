from uuid import uuid4
import pytest
from app.core.auth import DEV_USER_ID
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

    # Connect with matching dev token query parameter
    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}?token={user_token}") as ws:
        # Connected event
        conn_msg = ws.receive_json()
        assert conn_msg["type"] == "session.connected"
        assert conn_msg["data"]["session_id"] == session_id

        # Send session.start
        ws.send_json({"type": "session.start"})
        start_msg = ws.receive_json()
        assert start_msg["type"] == "session.started"

        # Send speech.start
        ws.send_json({"type": "speech.start"})
        speech_msg = ws.receive_json()
        assert speech_msg["type"] == "speech.start.ack"

        ws.send_bytes(b"audio bytes")
        ws.send_json({"type": "speech.stop"})
        assert ws.receive_json()["type"] == "speech.stop.ack"
        assert ws.receive_json()["type"] == "transcript.partial"
        transcript_msg = ws.receive_json()
        assert transcript_msg["type"] == "transcript.final"
        assert transcript_msg["data"]["text"]

        # Send invalid event
        ws.send_json({"type": "unknown.event"})
        err_msg = ws.receive_json()
        assert err_msg["type"] == "error"
        assert err_msg["data"]["code"] == "invalid_event"


def test_websocket_rejects_unauthenticated(client):
    fake_session_id = uuid4()
    with client.websocket_connect(f"/api/v1/ws/interviews/{fake_session_id}") as ws:
        with pytest.raises(WebSocketDisconnect) as exc_info:
            ws.receive_json()
        assert exc_info.value.code == 1008


def test_websocket_reports_missing_audio(client):
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

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}?token={user_token}") as ws:
        ws.receive_json()
        ws.send_json({"type": "speech.start"})
        ws.receive_json()
        ws.send_json({"type": "speech.stop"})
        ws.receive_json()
        error = ws.receive_json()
        assert error["type"] == "error"
        assert error["data"]["code"] == "no_speech_detected"
