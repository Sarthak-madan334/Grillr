import json
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.auth import authenticate_token
from app.db.session import SessionLocal
from app.services.interview_service import InterviewService
from app.services.providers import create_speech_to_text

router = APIRouter()


@router.websocket("/ws/interviews/{session_id}")
async def interview_socket(websocket: WebSocket, session_id: UUID):
    await websocket.accept()
    db: Session = SessionLocal()
    try:
        token = websocket.query_params.get("token")
        if not token and websocket.headers.get("authorization", "").lower().startswith("bearer "):
            token = websocket.headers["authorization"][7:]
        if not token:
            await websocket.close(code=1008, reason="Authentication is required")
            return
        try:
            identity = authenticate_token(token, db)
            service = InterviewService(db)
            service.get(session_id, identity.id)
        except Exception:
            await websocket.close(code=1008, reason="Unauthorized or session not found")
            return
        await websocket.send_json({"type": "session.connected", "data": {"session_id": str(session_id)}})
        speech_to_text = create_speech_to_text()
        audio_buffer = bytearray()
        while True:
            message = await websocket.receive()
            if message.get("bytes") is not None:
                audio_buffer.extend(message["bytes"])
                continue
            if message.get("text") is None:
                continue
            event = json.loads(message["text"])
            event_type = event.get("type")
            if event_type == "session.start":
                await websocket.send_json({"type": "session.started", "data": {}})
            elif event_type == "speech.start":
                audio_buffer.clear()
                await websocket.send_json({"type": "speech.start.ack", "data": {}})
            elif event_type == "speech.stop":
                await websocket.send_json({"type": "speech.stop.ack", "data": {}})
                if not audio_buffer:
                    await websocket.send_json({"type": "error", "data": {"code": "no_speech_detected", "message": "No audio was received."}})
                    continue
                transcript = speech_to_text.transcribe(bytes(audio_buffer)).strip()
                audio_buffer.clear()
                if not transcript:
                    await websocket.send_json({"type": "error", "data": {"code": "no_speech_detected", "message": "No speech was detected."}})
                    continue
                await websocket.send_json({"type": "transcript.partial", "data": {"text": transcript}})
                await websocket.send_json({"type": "transcript.final", "data": {"text": transcript}})
            elif event_type in {"interview.interrupt", "audio.chunk"}:
                await websocket.send_json({"type": f"{event_type}.ack", "data": {}})
            else:
                await websocket.send_json({"type": "error", "data": {"code": "invalid_event", "message": "Unsupported event type"}})
    except WebSocketDisconnect:
        pass
    finally:
        db.close()
