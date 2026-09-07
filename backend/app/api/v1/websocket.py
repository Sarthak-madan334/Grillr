import json
import logging
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.auth import authenticate_token
from app.db.session import SessionLocal
from app.services.interview_service import InterviewService
from app.services.providers import SpeechToTextService, TranscriptionError, TranscriptionTimeoutError, create_speech_to_text

router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/ws/interviews/{session_id}")
async def interview_socket(websocket: WebSocket, session_id: UUID):
    await websocket.accept()
    db: Session = SessionLocal()
    try:
        token = websocket.query_params.get("token")
        if not token:
            cookie_header = websocket.headers.get("cookie", "")
            token = next((part.split("=", 1)[1] for part in cookie_header.split("; ") if part.startswith("grillr_access_token=")), None)
        if not token and websocket.headers.get("authorization", "").lower().startswith("bearer "):
            token = websocket.headers["authorization"][7:]
        if not token:
            await websocket.close(code=1008, reason="Authentication is required")
            return
        try:
            identity = authenticate_token(token, db)
            service = InterviewService(db)
            session = service.get(session_id, identity.id)
        except Exception:
            await websocket.close(code=1008, reason="Unauthorized or session not found")
            return
        turn_state = "listening"
        speech_to_text = SpeechToTextService(create_speech_to_text())
        audio_buffer = bytearray()
        recording = False

        async def send_resync() -> None:
            current_question = next((item for item in session.questions if not item.answered_at), None)
            await websocket.send_json({"type": "session.connected", "data": {"session_id": str(session_id), "status": session.status.value, "current_question_number": session.current_question_number, "question_id": str(current_question.id) if current_question else None, "turn_state": turn_state}})

        await send_resync()
        async def send_error(code: str, message: str) -> None:
            await websocket.send_json({"type": "error", "data": {"code": code, "message": message}})

        async def transcribe_buffer() -> None:
            nonlocal audio_buffer, recording, turn_state, session
            if not audio_buffer:
                recording = False
                await send_error("empty_audio", "No audio was received for this answer.")
                return
            audio = bytes(audio_buffer)
            audio_buffer.clear()
            recording = False
            turn_state = "processing"
            current_question = next((item for item in session.questions if not item.answered_at), None)
            await websocket.send_json({"type": "turn.state_changed", "data": {"state": turn_state, "question_id": str(current_question.id) if current_question else None}})
            try:
                result = await speech_to_text.transcribe(audio, session_id=session_id, question_id=current_question.id if current_question else None)
            except TranscriptionTimeoutError:
                await send_error("transcription_timeout", "Transcription took too long. Please try again.")
                return
            except TranscriptionError:
                await send_error("stt_failed", "We could not transcribe that answer. Please try again.")
                return
            if not result.has_speech:
                await send_error("no_speech_detected", "No speech was detected. Please try again.")
                return
            normalized = result.transcript
            current_question = next((item for item in session.questions if not item.answered_at), None)
            await websocket.send_json({"type": "transcript.final", "data": {"text": normalized, "question_id": str(current_question.id) if current_question else None}})
            turn_state = "listening"
            await websocket.send_json({"type": "turn.state_changed", "data": {"state": turn_state, "question_id": str(current_question.id) if current_question else None}})

        while True:
            message = await websocket.receive()
            if message.get("type") == "websocket.disconnect":
                raise WebSocketDisconnect
            if message.get("bytes") is not None:
                if not recording:
                    await send_error("audio_out_of_state", "Audio can only be sent between speech.start and speech.stop.")
                else:
                    audio_buffer.extend(message["bytes"])
                continue
            raw_text = message.get("text")
            if raw_text is None:
                await send_error("invalid_frame", "Unsupported WebSocket frame.")
                continue
            try:
                event = json.loads(raw_text)
            except json.JSONDecodeError:
                await send_error("invalid_event", "Expected a JSON event.")
                continue
            if not isinstance(event, dict):
                await send_error("invalid_event", "Expected a JSON event object.")
                continue
            event_type = event.get("type")
            if event_type == "session.start":
                await websocket.send_json({"type": "session.started", "data": {}})
            elif event_type == "session.resync":
                session = service.get(session_id, identity.id)
                await send_resync()
            elif event_type == "speech.start":
                audio_buffer.clear()
                recording = True
                turn_state = "listening"
                await websocket.send_json({"type": "speech.start.ack", "data": {}})
                current_question = next((item for item in session.questions if not item.answered_at), None)
                await websocket.send_json({"type": "turn.state_changed", "data": {"state": turn_state, "question_id": str(current_question.id) if current_question else None}})
            elif event_type == "speech.stop":
                await websocket.send_json({"type": "speech.stop.ack", "data": {}})
                await transcribe_buffer()
            elif event_type == "interview.interrupt":
                await websocket.send_json({"type": f"{event_type}.ack", "data": {}})
            else:
                await websocket.send_json({"type": "error", "data": {"code": "invalid_event", "message": "Unsupported event type"}})
    except WebSocketDisconnect:
        pass
    finally:
        db.close()
