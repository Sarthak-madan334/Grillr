from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.auth import CurrentUser, get_current_user
from app.db.session import get_db
from app.models import Answer, AnswerEvaluation, InterviewSession, Question, SessionStatus
from app.schemas.answer import AnswerCreate, AnswerResponse, AttemptsResponse
from app.schemas.common import RetryRequest
from app.schemas.interview import DashboardStatsResponse, InterviewCreate, InterviewListResponse, InterviewResponse, QuestionsResponse, RetryResponse, SummaryResponse
from app.services.interview_service import InterviewService

router = APIRouter()


def service(db: Session = Depends(get_db)) -> InterviewService:
    return InterviewService(db)


@router.post("", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def create_interview(data: InterviewCreate, identity: CurrentUser = Depends(get_current_user), interviews: InterviewService = Depends(service)):
    return interviews.create(identity.id, data)


@router.get("/{session_id}/latest-answer", response_model=AnswerResponse)
def latest_answer(session_id: UUID, identity: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    answer = db.scalar(
        select(Answer)
        .join(InterviewSession, Answer.session_id == InterviewSession.id)
        .where(Answer.session_id == session_id, InterviewSession.user_id == identity.id)
        .options(selectinload(Answer.speech_metrics), selectinload(Answer.evaluation))
        .order_by(Answer.created_at.desc())
    )
    if answer is None:
        from app.core.errors import NotFoundError
        raise NotFoundError("Answer")
    return answer


@router.get("", response_model=InterviewListResponse)
def list_interviews(status_filter: SessionStatus | None = Query(default=None, alias="status"), limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0), identity: CurrentUser = Depends(get_current_user), interviews: InterviewService = Depends(service)):
    items, total = interviews.list(identity.id, status_filter, limit, offset)
    return {"items": items, "total": total, "limit": limit, "offset": offset}


@router.get("/stats", response_model=DashboardStatsResponse)
def dashboard_stats(identity: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    completed = db.scalars(
        select(InterviewSession).where(
            InterviewSession.user_id == identity.id,
            InterviewSession.status == SessionStatus.COMPLETED,
        )
    ).all()
    scores = [session.summary.overall_score for session in completed if session.summary is not None]
    dimension_columns = {
        "relevance": AnswerEvaluation.relevance_score,
        "clarity": AnswerEvaluation.clarity_score,
        "structure": AnswerEvaluation.structure_score,
        "specificity": AnswerEvaluation.specificity_score,
        "technical_accuracy": AnswerEvaluation.technical_accuracy_score,
        "conciseness": AnswerEvaluation.conciseness_score,
        "communication": AnswerEvaluation.communication_score,
    }
    dimensions: dict[str, float | None] = {}
    for name, column in dimension_columns.items():
        value = db.scalar(
            select(func.avg(column))
            .join(Answer, AnswerEvaluation.answer_id == Answer.id)
            .join(InterviewSession, Answer.session_id == InterviewSession.id)
            .where(
                InterviewSession.user_id == identity.id,
                InterviewSession.status == SessionStatus.COMPLETED,
            )
        )
        dimensions[name] = round(float(value), 1) if value is not None else None

    return {
        "average_score": round(sum(scores) / len(scores), 1) if scores else None,
        "interview_count": len(completed),
        "role_count": len({session.job_role for session in completed}),
        "dimensions": dimensions,
    }


@router.get("/{session_id}", response_model=InterviewResponse)
def get_interview(session_id: UUID, identity: CurrentUser = Depends(get_current_user), interviews: InterviewService = Depends(service)):
    return interviews.get(session_id, identity.id)


@router.post("/{session_id}/start", response_model=InterviewResponse)
def start_interview(session_id: UUID, identity: CurrentUser = Depends(get_current_user), interviews: InterviewService = Depends(service)):
    return interviews.transition(session_id, identity.id, SessionStatus.ACTIVE)


@router.post("/{session_id}/cancel", response_model=InterviewResponse)
def cancel_interview(session_id: UUID, identity: CurrentUser = Depends(get_current_user), interviews: InterviewService = Depends(service)):
    return interviews.transition(session_id, identity.id, SessionStatus.CANCELLED)


@router.post("/{session_id}/complete", response_model=InterviewResponse)
def complete_interview(session_id: UUID, identity: CurrentUser = Depends(get_current_user), interviews: InterviewService = Depends(service)):
    return interviews.complete(session_id, identity.id)


@router.get("/{session_id}/questions", response_model=QuestionsResponse)
def get_questions(session_id: UUID, identity: CurrentUser = Depends(get_current_user), interviews: InterviewService = Depends(service)):
    return {"items": interviews.questions(session_id, identity.id)}


@router.get("/{session_id}/feedback", response_model=SummaryResponse)
def get_feedback(session_id: UUID, identity: CurrentUser = Depends(get_current_user), interviews: InterviewService = Depends(service)):
    interview = interviews.get(session_id, identity.id)
    if interview.summary is None:
        from app.core.errors import NotFoundError
        raise NotFoundError("Interview feedback")
    return interview.summary


@router.post("/questions/{question_id}/answer", response_model=AnswerResponse, status_code=status.HTTP_201_CREATED)
def submit_answer(question_id: UUID, data: AnswerCreate, identity: CurrentUser = Depends(get_current_user), interviews: InterviewService = Depends(service)):
    return interviews.answer(question_id, identity.id, data)


@router.post("/questions/{question_id}/retry", response_model=RetryResponse)
def retry_answer(question_id: UUID, request: RetryRequest, identity: CurrentUser = Depends(get_current_user), interviews: InterviewService = Depends(service)):
    answer = interviews.answer(question_id, identity.id, AnswerCreate(transcript=request.transcript, duration=request.duration), is_retry=True)
    attempts, score_delta = interviews.attempts(question_id, identity.id)
    return {"question_id": question_id, "answer_id": answer.id, "attempt_number": answer.attempt_number, "status": "submitted", "score_delta": score_delta}


@router.get("/questions/{question_id}/attempts", response_model=AttemptsResponse)
def question_attempts(question_id: UUID, identity: CurrentUser = Depends(get_current_user), interviews: InterviewService = Depends(service)):
    attempts, score_delta = interviews.attempts(question_id, identity.id)
    return {"items": attempts, "score_delta": score_delta}
