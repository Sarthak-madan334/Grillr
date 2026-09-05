from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl, field_validator

from app.models import SessionStatus


class InterviewType(str, Enum):
    behavioral = "behavioral"
    technical = "technical"
    hr = "hr"
    system_design = "system_design"
    company = "company"


class InterviewCreate(BaseModel):
    interview_type: InterviewType
    job_role: str = Field(min_length=2, max_length=160)
    experience_level: str = Field(min_length=2, max_length=40)
    difficulty: str = Field(min_length=2, max_length=40)
    personality: str = Field(min_length=2, max_length=40)
    duration: int = Field(gt=0, le=180)
    question_count: int = Field(default=5, ge=1, le=20)
    resume_url: HttpUrl | None = None
    job_description: str | None = Field(default=None, max_length=10000)


class QuestionResponse(BaseModel):
    id: UUID
    question_number: int
    question_text: str
    question_type: str
    is_follow_up: bool
    answered_at: datetime | None

    model_config = {"from_attributes": True}


class InterviewResponse(BaseModel):
    id: UUID
    status: SessionStatus
    interview_type: str
    job_role: str
    experience_level: str
    difficulty: str
    personality: str
    duration: int
    question_count: int
    current_question_number: int
    created_at: datetime
    started_at: datetime | None
    completed_at: datetime | None
    questions: list[QuestionResponse] = []

    model_config = {"from_attributes": True}


class InterviewListResponse(BaseModel):
    items: list[InterviewResponse]
    total: int
    limit: int
    offset: int


class QuestionsResponse(BaseModel):
    items: list[QuestionResponse]


class RetryResponse(BaseModel):
    question_id: UUID
    attempt_number: int
    status: str


class FeedbackResponse(BaseModel):
    overall_score: int
    scores: dict[str, int]
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]
    improved_answer: str


class SummaryResponse(BaseModel):
    overall_score: int
    total_questions: int
    total_duration: float
    average_wpm: float
    total_filler_words: int
    total_pauses: int
    strengths: list[str]
    weaknesses: list[str]
    recommendations: list[str]

    model_config = {"from_attributes": True}
