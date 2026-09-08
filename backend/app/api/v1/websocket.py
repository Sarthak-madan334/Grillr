import asyncio
import base64
import json
import logging
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.auth import authenticate_token
from app.db.session import SessionLocal
from app.services.interview_service import InterviewService
from app.services.providers import RimeTextToSpeech
from app.services.speech_controller import SpeechController
from app.models import SessionStatus
from app.schemas.answer import AnswerCreate
from app.services.interview_service import AnswerEvaluationError, InterviewService
from app.services.providers import (
    SpeechToTextService,
    TextToSpeechConfigurationError,
    TextToSpeechProviderError,
    TranscriptionError,
    TranscriptionTimeoutError,
    create_speech_to_text,
    create_text_to_speech,
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/ws/interviews/{session_id}")
async def interview_socket(websocket: WebSocket, session_id: UUID):
    await websocket.accept()
    db: Session = SessionLocal()
    speech = SpeechController()
    service = None
    identity = None

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

        async def send_resync() -> None:
            current_question = next((item for item in session.questions if not item.answered_at), None)
            await websocket.send_json({"type": "session.connected", "data": {"session_id": str(session_id), "status": session.status.value, "current_question_number": session.current_question_number, "question_id": str(current_question.id) if current_question else None, "turn_state": turn_state}})

        await send_resync()
        if session.speech_state == "ai_speaking" and session.speech_generation_id is not None:
            await speech.restore_ai_speech(session.speech_generation_id)
        speech_to_text = SpeechToTextService(create_speech_to_text())
        text_to_speech = None
        audio_buffer = bytearray()
        recording = False
        current_turn_id: str | None = None

        async def send_question_audio(question) -> None:
            nonlocal text_to_speech
            if question is None:
                return
            try:
                if text_to_speech is None:
                    text_to_speech = create_text_to_speech()
                audio = await asyncio.to_thread(text_to_speech.synthesize, question.question_text)
                media_type = getattr(text_to_speech, "media_type", "audio/mpeg")
                if not audio:
                    raise TextToSpeechProviderError("TTS returned empty audio")
            except (TextToSpeechConfigurationError, TextToSpeechProviderError, ValueError):
                await send_error("tts_unavailable", "Question audio is temporarily unavailable.")
                return
            await websocket.send_json({
                "type": "audio.ai",
                "data": {
                    "question_id": str(question.id),
                    "question_number": question.question_number,
                    "media_type": media_type,
                    "audio_base64": base64.b64encode(audio).decode("ascii"),
                },
            })
        async def transcribe_buffer() -> None:
            nonlocal audio_buffer, recording, turn_state, session, current_turn_id
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
            answer = service.get_idempotent_answer(session_id, identity.id, current_turn_id) if current_turn_id else None
            answer_question = answer.question if answer is not None else current_question
            if answer is None and answer_question is None:
                await send_error("missing_question", "The active question could not be found for this answer.")
                return
            try:
                answer = service.answer(
                    answer_question.id,
                    identity.id,
                    AnswerCreate(transcript=normalized, duration=max(len(audio) / (2 * 16000), 1.0)),
                    idempotency_key=current_turn_id,
                    session_id=session_id,
                )
                service.recover_progression(answer, identity.id)
            except AnswerEvaluationError:
                await send_error("answer_evaluation_failed", "Your answer was saved, but evaluation is unavailable. Please retry.")
                return
            except Exception:
                logger.exception("Failed to persist websocket answer", extra={"session_id": str(session_id), "question_id": str(answer_question.id)})
                await send_error("answer_persistence_failed", "We could not save your answer. Please try again.")
                return

            try:
                db.expire_all()
                updated_session = service.get(session_id, identity.id)
                if answer.evaluation is None:
                    await send_error("answer_evaluation_failed", "Your answer was saved, but evaluation is unavailable. Please retry.")
                    return

                await websocket.send_json({
                    "type": "transcript.final",
                    "data": {
                        "answer_id": str(answer.id),
                        "question_id": str(answer.question_id),
                        "text": answer.transcript,
                        "turn_id": current_turn_id,
                    },
                })
                await websocket.send_json({
                    "type": "answer.evaluated",
                    "data": {
                        "answer_id": str(answer.id),
                        "question_id": str(answer.question_id),
                        "overall_score": answer.evaluation.overall_score,
                        "turn_id": current_turn_id,
                    },
                })
                next_question = next(
                    (
                        item for item in sorted(updated_session.questions, key=lambda item: item.question_number)
                        if not item.answers and item.id != answer.question_id
                    ),
                    None,
                )
                if next_question is None:
                    if updated_session.status == SessionStatus.COMPLETED:
                        await websocket.send_json({
                            "type": "session.completed",
                            "data": {"session_id": str(session_id), "answer_id": str(answer.id), "overall_score": updated_session.summary.overall_score if updated_session.summary else 0},
                        })
                    else:
                        await send_error("question_generation_failed", "We could not prepare the next question. Please try again.")
                    return
                question_event_type = "question.follow_up" if next_question.is_follow_up else "question.created"
                await websocket.send_json({
                    "type": question_event_type,
                    "data": {
                        "session_id": str(session_id),
                        "question_id": str(next_question.id),
                        "text": next_question.question_text,
                        "question_text": next_question.question_text,
                        "question_number": next_question.question_number,
                        "is_follow_up": next_question.is_follow_up,
                        "audio_url": f"/api/v1/questions/{next_question.id}/audio",
                    },
                })
                await send_question_audio(next_question)
                turn_state = "listening"
                await websocket.send_json({"type": "turn.state_changed", "data": {"state": turn_state, "question_id": str(next_question.id) if next_question else None}})
            except Exception:
                logger.exception("Failed to generate next question or emit audio", extra={"session_id": str(session_id), "question_id": str(answer.question_id)})
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
                current_question = next((item for item in session.questions if not item.answered_at), None)
                await send_question_audio(current_question)
            elif event_type == "session.resync":
                session = service.get(session_id, identity.id)
                await send_resync()
            elif event_type == "speech.start":
                turn_id = event.get("turn_id")
                if not isinstance(turn_id, str) or not turn_id.strip() or len(turn_id) > 128:
                    await send_error("missing_turn_id", "A unique turn_id is required for every answer.")
                    continue
                audio_buffer.clear()
                recording = True
                current_turn_id = turn_id.strip()
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
        await speech.close()
        db.close()
