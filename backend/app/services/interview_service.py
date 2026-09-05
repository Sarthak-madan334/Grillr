from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


class InterviewService:
    def __init__(self) -> None:
        self._sessions: list[dict[str, Any]] = []

    def create(self, payload: Any) -> dict[str, Any]:
        session = {
            "id": uuid4().hex,
            "status": "created",
            "interview_type": payload.interview_type,
            "job_role": payload.job_role,
            "experience_level": payload.experience_level,
            "difficulty": payload.difficulty,
            "personality": payload.personality,
            "duration": payload.duration,
            "resume_url": payload.resume_url,
            "job_description": payload.job_description,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self._sessions.append(session)
        return session

    def list(self) -> dict[str, Any]:
        return {
            "items": self._sessions,
            "total": len(self._sessions),
            "limit": 20,
            "offset": 0,
        }

    def get_interview(self, session_id: str) -> dict[str, Any]:
        for session in self._sessions:
            if session["id"] == session_id:
                return session
        raise ValueError(f"Interview {session_id} not found")
