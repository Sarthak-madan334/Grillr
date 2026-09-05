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
        while True:
            event = await websocket.receive_json()
            event_type = event.get("type")
            if event_type == "session.start":
                await websocket.send_json({"type": "session.started", "data": {}})
            elif event_type in {"speech.start", "speech.stop", "interview.interrupt", "audio.chunk"}:
                await websocket.send_json({"type": f"{event_type}.ack", "data": {}})
            else:
                await websocket.send_json({"type": "error", "data": {"code": "invalid_event", "message": "Unsupported event type"}})
    except WebSocketDisconnect:
        pass
    finally:
        db.close()
