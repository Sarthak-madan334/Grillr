import asyncio
import threading
from uuid import uuid4
import pytest
from app.core.auth import DEV_USER_ID
from app.api.v1 import websocket as websocket_module
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
        state_msg = ws.receive_json()
        assert state_msg["type"] == "session.state"

        # Send session.start
        ws.send_json({"type": "session.start"})
        start_msg = ws.receive_json()
        assert start_msg["type"] == "session.started"

        # Send speech.start
        ws.send_json({"type": "speech.start"})
        speech_msg = ws.receive_json()
        assert speech_msg["type"] == "speech.start.ack"

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


def test_websocket_interrupt_rejects_late_audio(client):
    user_token = f"dev:{DEV_USER_ID}:developer@localhost:Development User"
    create_res = client.post(
        "/api/v1/interviews",
        json={
            "interview_type": "technical",
            "job_role": "Backend Engineer",
            "experience_level": "senior",
            "difficulty": "hard",
            "personality": "challenging",
            "duration": 45,
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    session_id = create_res.json()["id"]

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}?token={user_token}") as ws:
        ws.receive_json()
        ws.receive_json()
        ws.send_json({"type": "ai.speech.start"})
        started = ws.receive_json()
        generation_id = started["data"]["generation_id"]

        ws.send_json({"type": "interview.interrupt"})
        interrupted = ws.receive_json()
        assert interrupted["type"] == "interview.interrupt.ack"
        assert interrupted["data"]["interrupted"] is True
        assert interrupted["data"]["state"] == "user_speaking"

        ws.send_json({"type": "audio.chunk", "data": {"generation_id": generation_id}})
        assert ws.receive_json() == {
            "type": "audio.chunk.ack",
            "data": {"accepted": False, "generation_id": generation_id},
        }


def test_websocket_speech_start_uses_speech_ack(client):
    user_token = f"dev:{DEV_USER_ID}:developer@localhost:Development User"
    create_res = client.post(
        "/api/v1/interviews",
        json={
            "interview_type": "technical",
            "job_role": "Backend Engineer",
            "experience_level": "senior",
            "difficulty": "hard",
            "personality": "challenging",
            "duration": 45,
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    session_id = create_res.json()["id"]

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}?token={user_token}") as ws:
        ws.receive_json()
        ws.receive_json()
        ws.send_json({"type": "ai.speech.start"})
        ws.receive_json()
        ws.send_json({"type": "speech.start"})
        assert ws.receive_json()["type"] == "speech.start.ack"


def test_interruption_state_resyncs_and_answer_capture_remains_available(client):
    user_token = f"dev:{DEV_USER_ID}:developer@localhost:Development User"
    headers = {"Authorization": f"Bearer {user_token}"}
    create_res = client.post(
        "/api/v1/interviews",
        json={
            "interview_type": "technical",
            "job_role": "Backend Engineer",
            "experience_level": "senior",
            "difficulty": "hard",
            "personality": "challenging",
            "duration": 45,
            "question_count": 2,
        },
        headers=headers,
    )
    session = create_res.json()
    session_id = session["id"]
    question_id = session["questions"][0]["id"]
    assert client.post(f"/api/v1/interviews/{session_id}/start", headers=headers).status_code == 200

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}?token={user_token}") as ws:
        ws.receive_json()
        ws.receive_json()
        ws.send_json({"type": "ai.speech.start", "data": {"question_id": question_id}})
        started = ws.receive_json()
        generation_id = started["data"]["generation_id"]
        ws.send_json({"type": "interview.interrupt"})
        assert ws.receive_json()["data"]["interrupted"] is True

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}?token={user_token}") as ws:
        ws.receive_json()
        resumed = ws.receive_json()
        assert resumed["type"] == "session.state"
        assert resumed["data"]["speech_state"] == "user_speaking"
        assert resumed["data"]["interrupted_generation_id"] == generation_id

    answer = client.post(
        f"/api/v1/interviews/questions/{question_id}/answer",
        json={"transcript": "I designed and shipped a reliable service with measurable impact.", "duration": 8},
        headers=headers,
    )
    assert answer.status_code == 201
    assert answer.json()["transcript"].startswith("I designed")


def test_interrupt_cancels_active_rime_task(client, monkeypatch):
    user_token = f"dev:{DEV_USER_ID}:developer@localhost:Development User"
    create_res = client.post(
        "/api/v1/interviews",
        json={
            "interview_type": "technical",
            "job_role": "Backend Engineer",
            "experience_level": "senior",
            "difficulty": "hard",
            "personality": "challenging",
            "duration": 45,
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    session_id = create_res.json()["id"]
    started = threading.Event()
    cancelled = threading.Event()

    async def fake_synthesize(self, text):
        started.set()
        try:
            await asyncio.sleep(30)
        except asyncio.CancelledError:
            cancelled.set()
            raise

    monkeypatch.setattr(websocket_module, "get_settings", lambda: type("Settings", (), {"rime_api_key": "test-key"})())
    monkeypatch.setattr(websocket_module.RimeTextToSpeech, "synthesize_async", fake_synthesize)

    with client.websocket_connect(f"/api/v1/ws/interviews/{session_id}?token={user_token}") as ws:
        ws.receive_json()
        ws.receive_json()
        ws.send_json({"type": "ai.speech.start", "data": {"text": "Tell me about your work."}})
        ws.receive_json()
        assert started.wait(1)
        ws.send_json({"type": "interview.interrupt"})
        assert ws.receive_json()["data"]["interrupted"] is True
        assert cancelled.wait(1)
