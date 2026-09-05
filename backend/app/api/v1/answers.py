from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.auth import CurrentUser, get_current_user
from app.core.errors import NotFoundError
from app.db.session import get_db
from app.models import Answer, InterviewSession
from app.schemas.answer import AnswerResponse
from app.schemas.interview import FeedbackResponse

router = APIRouter()


def owned_answer(answer_id: UUID, identity: CurrentUser, db: Session) -> Answer:
    answer = db.scalar(select(Answer).join(InterviewSession).where(Answer.id == answer_id, InterviewSession.user_id == identity.id).options(selectinload(Answer.speech_metrics), selectinload(Answer.evaluation)))
    if answer is None:
        raise NotFoundError("Answer")
    return answer


@router.get("/answers/{answer_id}", response_model=AnswerResponse)
def get_answer(answer_id: UUID, identity: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    return owned_answer(answer_id, identity, db)


@router.get("/answers/{answer_id}/feedback", response_model=FeedbackResponse)
def get_answer_feedback(answer_id: UUID, identity: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    answer = owned_answer(answer_id, identity, db)
    if answer.evaluation is None:
        raise NotFoundError("Answer feedback")
    evaluation = answer.evaluation
    return {"overall_score": evaluation.overall_score, "scores": {"relevance": evaluation.relevance_score, "clarity": evaluation.clarity_score, "structure": evaluation.structure_score, "specificity": evaluation.specificity_score, "technical_accuracy": evaluation.technical_accuracy_score, "conciseness": evaluation.conciseness_score, "communication": evaluation.communication_score}, "strengths": evaluation.strengths, "weaknesses": evaluation.weaknesses, "suggestions": evaluation.suggestions, "improved_answer": evaluation.improved_answer}
