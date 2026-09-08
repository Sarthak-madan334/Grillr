import asyncio
import base64
import logging
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.auth import authenticate_token
from app.core.config import get_settings
from app.db.session import SessionLocal
from app.services.interview_service import InterviewService
from app.services.providers import RimeTextToSpeech
from app.services.speech_controller import SpeechController

router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/ws/interviews/{session_id}")
async def interview_socket(websocket: WebSocket, session_id: UUID):
    await websocket.accept()
    db: Session = SessionLocal()
    speech = SpeechController()
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
        session = service.get(session_id, identity.id)
        await websocket.send_json({"type": "session.connected", "data": {"session_id": str(session_id)}})
        await websocket.send_json({
            "type": "session.state",
            "data": {
                "session_id": str(session_id),
                "speech_state": session.speech_state,
                "generation_id": str(session.speech_generation_id) if session.speech_generation_id else None,
                "question_id": str(session.speech_question_id) if session.speech_question_id else None,
                "interrupted_generation_id": str(session.interrupted_generation_id) if session.interrupted_generation_id else None,
                "interrupted_at": session.interrupted_at.isoformat() if session.interrupted_at else None,
            },
        })
        if session.speech_state == "ai_speaking" and session.speech_generation_id is not None:
            await speech.restore_ai_speech(session.speech_generation_id)
        while True:
            event = await websocket.receive_json()
            event_type = event.get("type")
            if event_type == "session.start":
                await websocket.send_json({"type": "session.started", "data": {}})
            elif event_type == "ai.speech.start":
                generation_id = await speech.begin_ai_speech()
                question_value = event.get("data", {}).get("question_id")
                try:
                    question_id = UUID(question_value) if question_value else None
                except (TypeError, ValueError):
                    question_id = None
                session = service.mark_speech_started(session_id, identity.id, generation_id, question_id)
                await websocket.send_json({
                    "type": "ai.speech.started",
                    "data": {"session_id": str(session_id), "generation_id": str(generation_id)},
                })
                text = event.get("data", {}).get("text")
                if isinstance(text, str) and text.strip() and get_settings().rime_api_key:
                    async def synthesize_question() -> None:
                        try:
                            audio = await RimeTextToSpeech().synthesize_async(text)
                            if not await speech.accepts_audio(generation_id):
                                return
                            await websocket.send_json({
                                "type": "audio.chunk",
                                "data": {
                                    "generation_id": str(generation_id),
                                    "audio_base64": base64.b64encode(audio).decode("ascii"),
                                    "content_type": "audio/mpeg",
                                },
                            })
                            if await speech.accepts_audio(generation_id):
                                await websocket.send_json({
                                    "type": "ai.speech.end",
                                    "data": {"generation_id": str(generation_id)},
                                })
                                service.mark_speech_finished(session_id, identity.id, generation_id)
                        except asyncio.CancelledError:
                            return
                        except Exception:
                            logger.warning("Rime speech generation failed for session %s", session_id, exc_info=True)
                            service.mark_speech_finished(session_id, identity.id, generation_id)

                    tts_task = asyncio.create_task(synthesize_question())
                    await speech.attach_task(generation_id, tts_task)
            elif event_type in {"speech.start", "interview.interrupt"}:
                result = await speech.interrupt()
                if result.interrupted and result.generation_id is not None:
                    session = service.mark_speech_interrupted(session_id, identity.id, result.generation_id)
                else:
                    session = service.mark_user_speaking(session_id, identity.id)
                data = {
                    "session_id": str(session_id),
                    "interrupted": result.interrupted,
                    "state": result.state.value,
                }
                if result.generation_id is not None:
                    data["generation_id"] = str(result.generation_id)
                ack_type = "interview.interrupt.ack" if event_type == "interview.interrupt" else "speech.start.ack"
                await websocket.send_json({"type": ack_type, "data": data})
            elif event_type == "ai.speech.end":
                generation_value = event.get("data", {}).get("generation_id")
                try:
                    generation_id = UUID(generation_value) if generation_value else None
                except (TypeError, ValueError):
                    generation_id = None
                if generation_id is not None:
                    service.mark_speech_finished(session_id, identity.id, generation_id)
                await websocket.send_json({"type": "ai.speech.end.ack", "data": {"accepted": generation_id is not None}})
            elif event_type == "speech.stop":
                await websocket.send_json({"type": "speech.stop.ack", "data": {}})
            elif event_type == "audio.chunk":
                generation_value = event.get("data", {}).get("generation_id")
                try:
                    generation_id = UUID(generation_value) if generation_value else None
                except (TypeError, ValueError):
                    generation_id = None
                accepted = generation_id is not None and await speech.accepts_audio(generation_id)
                await websocket.send_json({
                    "type": "audio.chunk.ack",
                    "data": {"accepted": accepted, "generation_id": generation_value},
                })
            else:
                await websocket.send_json({"type": "error", "data": {"code": "invalid_event", "message": "Unsupported event type"}})
    except WebSocketDisconnect:
        pass
    finally:
        await speech.close()
        db.close()
