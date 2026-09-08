import asyncio
import json
import logging
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.auth import authenticate_token
from app.db.session import SessionLocal
from app.models import SessionStatus
from app.schemas.answer import AnswerCreate
from app.services.interview_service import InterviewService
from app.services.providers import SpeechToTextService, TranscriptionError, TranscriptionTimeoutError, create_speech_to_text

router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/ws/interviews/{session_id}")
async def interview_socket(websocket: WebSocket, session_id: UUID):
    await websocket.accept()
    db: Session = SessionLocal()

    async def send_error(code: str, message: str) -> None:
        await websocket.send_json({"type": "error", "data": {"code": code, "message": message}})

    try:
        try:
            auth_frame = await asyncio.wait_for(websocket.receive(), timeout=5)
        except asyncio.TimeoutError:
            await websocket.close(code=1008, reason="Authentication timeout")
            return

        if auth_frame.get("type") == "websocket.disconnect":
            raise WebSocketDisconnect
        raw_auth = auth_frame.get("text")
        if raw_auth is None:
            await websocket.close(code=1008, reason="Authentication is required")
            return
        try:
            auth_event = json.loads(raw_auth)
        except json.JSONDecodeError:
            await websocket.close(code=1008, reason="Invalid authentication payload")
            return
        if not isinstance(auth_event, dict) or auth_event.get("type") != "auth" or not isinstance(auth_event.get("token"), str) or not auth_event["token"]:
            await websocket.close(code=1008, reason="Authentication is required")
            return
        token = auth_event["token"]
        try:
            identity = authenticate_token(token, db)
        except Exception:
            await websocket.close(code=1008, reason="Unauthorized or session not found")
            return
        try:
            service = InterviewService(db)
            session = service.get(session_id, identity.id)
            if session.status == SessionStatus.CREATED:
                session = service.transition(session_id, identity.id, SessionStatus.ACTIVE)
        except Exception:
            logger.exception("Failed to initialize websocket interview pipeline", extra={"session_id": str(session_id)})
            await send_error("pipeline_initialization_failed", "The interview pipeline is temporarily unavailable. Please try again.")
            return
        await websocket.send_json({"type": "auth.ok", "data": {}})
        turn_state = "listening"
        speech_to_text = SpeechToTextService(create_speech_to_text())
        audio_buffer = bytearray()
        recording = False

        async def send_resync() -> None:
            current_question = next((item for item in session.questions if not item.answered_at), None)
            await websocket.send_json({"type": "session.connected", "data": {"session_id": str(session_id), "status": session.status.value, "current_question_number": session.current_question_number, "question_id": str(current_question.id) if current_question else None, "turn_state": turn_state}})

        await send_resync()
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
            if not current_question:
                await send_error("missing_question", "The active question could not be found for this answer.")
                return

            try:
                answer = service.answer(
                    current_question.id,
                    identity.id,
                    AnswerCreate(transcript=normalized, duration=max(len(audio) / (2 * 16000), 1.0)),
                )
            except Exception:
                logger.exception("Failed to persist websocket answer", extra={"session_id": str(session_id), "question_id": str(current_question.id)})
                await send_error("answer_persistence_failed", "We could not save your answer. Please try again.")
                return

            try:
                db.expire_all()
                updated_session = service.get(session_id, identity.id)
                next_question = next(
                    (
                        item for item in sorted(updated_session.questions, key=lambda item: item.question_number)
                        if not item.answers and item.id != current_question.id
                    ),
                    None,
                )
                if next_question is None:
                    if updated_session.status == SessionStatus.COMPLETED:
                        await websocket.send_json({
                            "type": "session.completed",
                            "data": {"session_id": str(session_id), "overall_score": updated_session.summary.overall_score if updated_session.summary else 0},
                        })
                    else:
                        await send_error("question_generation_failed", "We could not prepare the next question. Please try again.")
                    return
                if answer.evaluation is None:
                    await send_error("answer_evaluation_failed", "We could not evaluate your answer. Please try again.")
                    return

                await websocket.send_json({
                    "type": "transcript.final",
                    "data": {
                        "answer_id": str(answer.id),
                        "question_id": str(current_question.id) if current_question else None,
                        "text": normalized,
                    },
                })
                await websocket.send_json({
                    "type": "answer.evaluated",
                    "data": {"answer_id": str(answer.id), "overall_score": answer.evaluation.overall_score},
                })
                await websocket.send_json({
                    "type": "question.created",
                    "data": {
                        "question_id": str(next_question.id),
                        "text": next_question.question_text,
                        "question_text": next_question.question_text,
                        "question_number": next_question.question_number,
                        "is_follow_up": next_question.is_follow_up,
                        "audio_url": f"/api/v1/questions/{next_question.id}/audio",
                    },
                })
                await websocket.send_json({
                    "type": "audio.ai",
                    "data": {"question_id": str(next_question.id), "audio_url": f"/api/v1/questions/{next_question.id}/audio"},
                })
                turn_state = "listening"
                await websocket.send_json({"type": "turn.state_changed", "data": {"state": turn_state, "question_id": str(next_question.id) if next_question else None}})
            except Exception:
                logger.exception("Failed to generate next question or emit audio", extra={"session_id": str(session_id), "question_id": str(current_question.id)})
                await send_error("question_generation_failed", "We could not prepare the next question. Please try again.")
                return

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
