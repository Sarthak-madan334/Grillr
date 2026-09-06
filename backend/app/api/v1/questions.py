from uuid import UUID

from fastapi import APIRouter, Depends, status
from fastapi.responses import Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.auth import CurrentUser, get_current_user
from app.core.errors import NotFoundError
from app.db.session import get_db
from app.models import Answer, Question
from app.schemas.answer import AnswerCreate, AnswerResponse
from app.schemas.common import RetryRequest
from app.schemas.interview import RetryResponse
from app.services.interview_service import InterviewService
from app.services.providers import MockTextToSpeech

router = APIRouter()

_audio_cache: dict[UUID, bytes] = {}


def get_owned_question(question_id: UUID, identity: CurrentUser, db: Session) -> Question:
    question = db.scalar(select(Question).where(Question.id == question_id, Question.session.has(user_id=identity.id)))
    if question is None:
        raise NotFoundError("Question")
    return question


@router.post("/questions/{question_id}/answer", response_model=AnswerResponse, status_code=status.HTTP_201_CREATED)
def submit_answer(question_id: UUID, data: AnswerCreate, identity: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    get_owned_question(question_id, identity, db)
    return InterviewService(db).answer(question_id, identity.id, data)


@router.post("/questions/{question_id}/retry", response_model=RetryResponse)
def retry_answer(question_id: UUID, request: RetryRequest, identity: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    get_owned_question(question_id, identity, db)
    attempt = db.scalar(select(func.max(Answer.attempt_number)).where(Answer.question_id == question_id)) or 0
    return {"question_id": question_id, "attempt_number": attempt + 1, "status": "ready"}


@router.get("/questions/{question_id}/audio", response_class=Response)
def get_question_audio(question_id: UUID, identity: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    question = get_owned_question(question_id, identity, db)
    if question_id in _audio_cache:
        audio = _audio_cache[question_id]
    else:
        tts = MockTextToSpeech()
        audio = tts.synthesize(question.question_text)
        _audio_cache[question_id] = audio
    return Response(content=audio, media_type="audio/mpeg")
