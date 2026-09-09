import logging
import time
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import CurrentUser, get_current_user
from app.core.errors import NotFoundError
from app.db.session import get_db
from app.models import Answer, Question
from app.schemas.answer import AnswerCreate, AnswerResponse
from app.services.interview_service import InterviewService
from app.services.providers import (
    TextToSpeechConfigurationError,
    TextToSpeechProviderError,
    create_text_to_speech,
)

router = APIRouter()
logger = logging.getLogger(__name__)

_audio_cache: dict[UUID, tuple[float, bytes, str]] = {}
_AUDIO_CACHE_TTL_SECONDS = 3600
_AUDIO_CACHE_MAX_ENTRIES = 256


def get_owned_question(question_id: UUID, identity: CurrentUser, db: Session) -> Question:
    question = db.scalar(select(Question).where(Question.id == question_id, Question.session.has(user_id=identity.id)))
    if question is None:
        raise NotFoundError("Question")
    return question


@router.post("/questions/{question_id}/answer", response_model=AnswerResponse, status_code=status.HTTP_201_CREATED)
def submit_answer(question_id: UUID, data: AnswerCreate, identity: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    get_owned_question(question_id, identity, db)
    return InterviewService(db).answer(question_id, identity.id, data)


@router.get("/questions/{question_id}/audio", response_class=Response)
def get_question_audio(question_id: UUID, identity: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    question = get_owned_question(question_id, identity, db)
    cached = _audio_cache.get(question_id)
    if cached is not None and time.monotonic() - cached[0] < _AUDIO_CACHE_TTL_SECONDS:
        audio = cached[1]
        media_type = cached[2]
    else:
        _audio_cache.pop(question_id, None)
        try:
            tts = create_text_to_speech()
            audio = tts.synthesize(question.question_text)
            media_type = getattr(tts, "media_type", "audio/mpeg")
        except TextToSpeechConfigurationError as exc:
            logger.error("Question audio provider is not configured", extra={"question_id": str(question_id)})
            raise HTTPException(status_code=503, detail={"code": "provider_not_configured", "message": "Question audio is temporarily unavailable"}) from exc
        except (TextToSpeechProviderError, ValueError) as exc:
            logger.warning("Question audio provider failed", extra={"question_id": str(question_id)})
            raise HTTPException(status_code=503, detail={"code": "provider_unavailable", "message": "Question audio is temporarily unavailable"}) from exc
        if not audio:
            logger.warning("Question audio provider returned empty audio", extra={"question_id": str(question_id)})
            raise HTTPException(status_code=503, detail={"code": "provider_unavailable", "message": "Question audio is temporarily unavailable"})
        if len(_audio_cache) >= _AUDIO_CACHE_MAX_ENTRIES:
            oldest_question_id = min(_audio_cache, key=lambda key: _audio_cache[key][0])
            del _audio_cache[oldest_question_id]
        _audio_cache[question_id] = (time.monotonic(), audio, media_type)
    return Response(content=audio, media_type=media_type)
