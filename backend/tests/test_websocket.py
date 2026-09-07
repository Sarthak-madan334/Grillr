from uuid import uuid4
import pytest
from app.core.auth import DEV_USER_ID
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

    # Connect with matching dev token query parameter
    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}?token={user_token}") as ws:
        # Connected event
        conn_msg = ws.receive_json()
        assert conn_msg["type"] == "session.connected"
        assert conn_msg["data"]["session_id"] == session_id
        assert conn_msg["data"]["turn_state"] == "listening"

        # Send session.start
        ws.send_json({"type": "session.start"})
        start_msg = ws.receive_json()
        assert start_msg["type"] == "session.started"

        # Send speech.start
        ws.send_json({"type": "speech.start"})
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
        with pytest.raises(WebSocketDisconnect) as exc_info:
            ws.receive_json()
        assert exc_info.value.code == 1008


def _create_interview(client):
    token = f"dev:{DEV_USER_ID}:developer@localhost:Development User"
    response = client.post("/api/v1/interviews", json={
        "interview_type": "technical",
        "job_role": "Backend Engineer",
        "experience_level": "senior",
        "difficulty": "hard",
        "personality": "challenging",
        "duration": 45,
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

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}?token={token}") as ws:
        ws.receive_json()
        ws.send_json({"type": "speech.start"})
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


def test_websocket_rejects_out_of_state_and_empty_audio(client):
    session_id, token = _create_interview(client)

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}?token={token}") as ws:
        ws.receive_json()
        ws.send_bytes(b"audio-before-start")
        assert ws.receive_json()["data"]["code"] == "audio_out_of_state"

        ws.send_text("not-json")
        assert ws.receive_json()["data"]["code"] == "invalid_event"

        ws.send_json({"type": "speech.start"})
        ws.receive_json()
        ws.receive_json()
        ws.send_json({"type": "speech.stop"})
        assert ws.receive_json()["type"] == "speech.stop.ack"
        assert ws.receive_json()["data"]["code"] == "empty_audio"


def test_websocket_provider_failure_returns_error_event(client, monkeypatch):
    class FailingSpeechToText:
        def transcribe(self, audio: bytes) -> str:
            raise RuntimeError("provider failed")

    monkeypatch.setattr(websocket_module, "create_speech_to_text", lambda: FailingSpeechToText())
    session_id, token = _create_interview(client)

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}?token={token}") as ws:
        ws.receive_json()
        ws.send_json({"type": "speech.start"})
        ws.receive_json()
        ws.receive_json()
        ws.send_bytes(b"audio")
        ws.send_json({"type": "speech.stop"})
        ws.receive_json()
        ws.receive_json()
        assert ws.receive_json()["data"]["code"] == "stt_failed"
