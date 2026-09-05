import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, Integer, JSON, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


def uuid_column() -> Mapped[uuid.UUID]:
    return mapped_column(primary_key=True, default=uuid.uuid4)


class SessionStatus(str, enum.Enum):
    CREATED = "created"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = uuid_column()
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    interviews: Mapped[list["InterviewSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    __table_args__ = (Index("ix_interview_sessions_user_status", "user_id", "status"),)
    id: Mapped[uuid.UUID] = uuid_column()
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    interview_type: Mapped[str] = mapped_column(String(40))
    job_role: Mapped[str] = mapped_column(String(160))
    experience_level: Mapped[str] = mapped_column(String(40))
    difficulty: Mapped[str] = mapped_column(String(40))
    personality: Mapped[str] = mapped_column(String(40))
    duration: Mapped[int] = mapped_column(Integer)
    question_count: Mapped[int] = mapped_column(Integer, default=5, server_default="5")
    resume_url: Mapped[str | None] = mapped_column(String(500))
    job_description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[SessionStatus] = mapped_column(Enum(SessionStatus), default=SessionStatus.CREATED, index=True)
    current_question_number: Mapped[int] = mapped_column(Integer, default=0)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    user: Mapped[User] = relationship(back_populates="interviews")
    questions: Mapped[list["Question"]] = relationship(back_populates="session", cascade="all, delete-orphan")
    summary: Mapped["InterviewSummary | None"] = relationship(back_populates="session", uselist=False, cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"
    __table_args__ = (UniqueConstraint("session_id", "question_number"), Index("ix_questions_session", "session_id"))
    id: Mapped[uuid.UUID] = uuid_column()
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("interview_sessions.id", ondelete="CASCADE"), index=True)
    question_number: Mapped[int] = mapped_column(Integer)
    question_text: Mapped[str] = mapped_column(Text)
    question_type: Mapped[str] = mapped_column(String(40))
    is_follow_up: Mapped[bool] = mapped_column(Boolean, default=False)
    parent_question_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("questions.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    answered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    session: Mapped[InterviewSession] = relationship(back_populates="questions")
    answers: Mapped[list["Answer"]] = relationship(back_populates="question", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"
    __table_args__ = (UniqueConstraint("question_id", "attempt_number"), Index("ix_answers_session", "session_id"))
    id: Mapped[uuid.UUID] = uuid_column()
    question_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), index=True)
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("interview_sessions.id", ondelete="CASCADE"))
    attempt_number: Mapped[int] = mapped_column(Integer)
    transcript: Mapped[str] = mapped_column(Text)
    duration: Mapped[float] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    question: Mapped[Question] = relationship(back_populates="answers")
    speech_metrics: Mapped["SpeechMetrics | None"] = relationship(back_populates="answer", uselist=False, cascade="all, delete-orphan")
    evaluation: Mapped["AnswerEvaluation | None"] = relationship(back_populates="answer", uselist=False, cascade="all, delete-orphan")


class SpeechMetrics(Base):
    __tablename__ = "speech_metrics"
    id: Mapped[uuid.UUID] = uuid_column()
    answer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("answers.id", ondelete="CASCADE"), unique=True)
    words_per_minute: Mapped[float] = mapped_column()
    filler_count: Mapped[int] = mapped_column(Integer, default=0)
    pause_count: Mapped[int] = mapped_column(Integer, default=0)
    repetition_count: Mapped[int] = mapped_column(Integer, default=0)
    duration_seconds: Mapped[float] = mapped_column()
    word_count: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    answer: Mapped[Answer] = relationship(back_populates="speech_metrics")


class AnswerEvaluation(Base):
    __tablename__ = "answer_evaluations"
    id: Mapped[uuid.UUID] = uuid_column()
    answer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("answers.id", ondelete="CASCADE"), unique=True)
    relevance_score: Mapped[int] = mapped_column(Integer)
    clarity_score: Mapped[int] = mapped_column(Integer)
    structure_score: Mapped[int] = mapped_column(Integer)
    specificity_score: Mapped[int] = mapped_column(Integer)
    technical_accuracy_score: Mapped[int] = mapped_column(Integer)
    conciseness_score: Mapped[int] = mapped_column(Integer)
    communication_score: Mapped[int] = mapped_column(Integer)
    overall_score: Mapped[int] = mapped_column(Integer)
    strengths: Mapped[list] = mapped_column(JSON, default=list)
    weaknesses: Mapped[list] = mapped_column(JSON, default=list)
    suggestions: Mapped[list] = mapped_column(JSON, default=list)
    improved_answer: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    answer: Mapped[Answer] = relationship(back_populates="evaluation")

    @property
    def scores(self) -> dict[str, int]:
        return {"relevance": self.relevance_score, "clarity": self.clarity_score, "structure": self.structure_score, "specificity": self.specificity_score, "technical_accuracy": self.technical_accuracy_score, "conciseness": self.conciseness_score, "communication": self.communication_score}


class InterviewSummary(Base):
    __tablename__ = "interview_summaries"
    id: Mapped[uuid.UUID] = uuid_column()
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("interview_sessions.id", ondelete="CASCADE"), unique=True)
    overall_score: Mapped[int] = mapped_column(Integer)
    total_questions: Mapped[int] = mapped_column(Integer)
    total_duration: Mapped[float] = mapped_column()
    average_wpm: Mapped[float] = mapped_column()
    total_filler_words: Mapped[int] = mapped_column(Integer)
    total_pauses: Mapped[int] = mapped_column(Integer)
    strengths: Mapped[list] = mapped_column(JSON, default=list)
    weaknesses: Mapped[list] = mapped_column(JSON, default=list)
    recommendations: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    session: Mapped[InterviewSession] = relationship(back_populates="summary")
