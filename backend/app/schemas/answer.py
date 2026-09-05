from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.interview import FeedbackResponse


class AnswerCreate(BaseModel):
    transcript: str = Field(min_length=1, max_length=50000)
    duration: float = Field(gt=0, le=3600)


class SpeechMetricsResponse(BaseModel):
    words_per_minute: float
    filler_count: int
    pause_count: int
    repetition_count: int
    duration_seconds: float
    word_count: int

    model_config = {"from_attributes": True}


class AnswerResponse(BaseModel):
    id: UUID
    question_id: UUID
    attempt_number: int
    transcript: str
    duration: float
    created_at: datetime
    completed_at: datetime | None
    speech_metrics: SpeechMetricsResponse | None = None
    evaluation: FeedbackResponse | None = None

    model_config = {"from_attributes": True}
