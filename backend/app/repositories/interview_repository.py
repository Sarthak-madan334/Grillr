from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models import InterviewSession, SessionStatus


class InterviewRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_owned(self, session_id: UUID, user_id: UUID) -> InterviewSession | None:
        return self.db.scalar(select(InterviewSession).where(InterviewSession.id == session_id, InterviewSession.user_id == user_id).options(selectinload(InterviewSession.questions), selectinload(InterviewSession.summary)))

    def list_owned(self, user_id: UUID, status: SessionStatus | None, limit: int, offset: int) -> tuple[list[InterviewSession], int]:
        query = select(InterviewSession).where(InterviewSession.user_id == user_id)
        count_query = select(func.count()).select_from(InterviewSession).where(InterviewSession.user_id == user_id)
        if status:
            query = query.where(InterviewSession.status == status)
            count_query = count_query.where(InterviewSession.status == status)
        items = list(self.db.scalars(query.options(selectinload(InterviewSession.questions)).order_by(InterviewSession.created_at.desc()).limit(limit).offset(offset)).all())
        return items, self.db.scalar(count_query) or 0
