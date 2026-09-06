from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.auth import authenticate_token
from app.core.config import get_settings
from app.db.session import SessionLocal
from app.services.interview_service import InterviewService

router = APIRouter()


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

        async def send_resync() -> None:
            current_question = next((item for item in session.questions if not item.answered_at), None)
            await websocket.send_json({"type": "session.connected", "data": {"session_id": str(session_id), "status": session.status.value, "current_question_number": session.current_question_number, "question_id": str(current_question.id) if current_question else None, "turn_state": turn_state}})

        await send_resync()
        while True:
            event = await websocket.receive_json()
            event_type = event.get("type")
            if event_type == "session.start":
                await websocket.send_json({"type": "session.started", "data": {}})
            elif event_type == "session.resync":
                session = service.get(session_id, identity.id)
                await send_resync()
            elif event_type in {"speech.start", "speech.stop", "interview.interrupt", "audio.chunk"}:
                if event_type == "speech.start":
                    turn_state = "listening"
                elif event_type == "speech.stop":
                    turn_state = "processing"
                await websocket.send_json({"type": f"{event_type}.ack", "data": {}})
                current_question = next((item for item in session.questions if not item.answered_at), None)
                await websocket.send_json({"type": "turn.state_changed", "data": {"state": turn_state, "question_id": str(current_question.id) if current_question else None}})
            else:
                await websocket.send_json({"type": "error", "data": {"code": "invalid_event", "message": "Unsupported event type"}})
    except WebSocketDisconnect:
        pass
    finally:
        db.close()
