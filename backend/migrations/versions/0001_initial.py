"""create core interview tables

Revision ID: 0001_initial
Revises:
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    session_status = sa.Enum("CREATED", "ACTIVE", "COMPLETED", "CANCELLED", name="sessionstatus")
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        session_status.create(bind, checkfirst=True)
    op.create_table("users", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("email", sa.String(320), nullable=False), sa.Column("name", sa.String(120)), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_table("interview_sessions", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False), sa.Column("interview_type", sa.String(40), nullable=False), sa.Column("job_role", sa.String(160), nullable=False), sa.Column("experience_level", sa.String(40), nullable=False), sa.Column("difficulty", sa.String(40), nullable=False), sa.Column("personality", sa.String(40), nullable=False), sa.Column("duration", sa.Integer(), nullable=False), sa.Column("resume_url", sa.String(500)), sa.Column("job_description", sa.Text()), sa.Column("status", session_status, nullable=False), sa.Column("current_question_number", sa.Integer(), nullable=False, server_default="0"), sa.Column("started_at", sa.DateTime(timezone=True)), sa.Column("completed_at", sa.DateTime(timezone=True)), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_index("ix_interview_sessions_user_id", "interview_sessions", ["user_id"])
    op.create_index("ix_interview_sessions_status", "interview_sessions", ["status"])
    op.create_index("ix_interview_sessions_user_status", "interview_sessions", ["user_id", "status"])
    op.create_table("questions", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("session_id", sa.Uuid(), sa.ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False), sa.Column("question_number", sa.Integer(), nullable=False), sa.Column("question_text", sa.Text(), nullable=False), sa.Column("question_type", sa.String(40), nullable=False), sa.Column("is_follow_up", sa.Boolean(), nullable=False, server_default=sa.false()), sa.Column("parent_question_id", sa.Uuid(), sa.ForeignKey("questions.id", ondelete="SET NULL")), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False), sa.Column("answered_at", sa.DateTime(timezone=True)), sa.UniqueConstraint("session_id", "question_number"))
    op.create_index("ix_questions_session_id", "questions", ["session_id"])
    op.create_index("ix_questions_session", "questions", ["session_id"])
    op.create_table("answers", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("question_id", sa.Uuid(), sa.ForeignKey("questions.id", ondelete="CASCADE"), nullable=False), sa.Column("session_id", sa.Uuid(), sa.ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False), sa.Column("attempt_number", sa.Integer(), nullable=False), sa.Column("transcript", sa.Text(), nullable=False), sa.Column("duration", sa.Float(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False), sa.Column("completed_at", sa.DateTime(timezone=True)), sa.UniqueConstraint("question_id", "attempt_number"))
    op.create_index("ix_answers_question_id", "answers", ["question_id"])
    op.create_index("ix_answers_session", "answers", ["session_id"])
    op.create_table("speech_metrics", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("answer_id", sa.Uuid(), sa.ForeignKey("answers.id", ondelete="CASCADE"), nullable=False, unique=True), sa.Column("words_per_minute", sa.Float(), nullable=False), sa.Column("filler_count", sa.Integer(), nullable=False), sa.Column("pause_count", sa.Integer(), nullable=False), sa.Column("repetition_count", sa.Integer(), nullable=False), sa.Column("duration_seconds", sa.Float(), nullable=False), sa.Column("word_count", sa.Integer(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_table("answer_evaluations", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("answer_id", sa.Uuid(), sa.ForeignKey("answers.id", ondelete="CASCADE"), nullable=False, unique=True), *[sa.Column(name, sa.Integer(), nullable=False) for name in ("relevance_score", "clarity_score", "structure_score", "specificity_score", "technical_accuracy_score", "conciseness_score", "communication_score", "overall_score")], sa.Column("strengths", sa.JSON(), nullable=False), sa.Column("weaknesses", sa.JSON(), nullable=False), sa.Column("suggestions", sa.JSON(), nullable=False), sa.Column("improved_answer", sa.Text(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_table("interview_summaries", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("session_id", sa.Uuid(), sa.ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, unique=True), sa.Column("overall_score", sa.Integer(), nullable=False), sa.Column("total_questions", sa.Integer(), nullable=False), sa.Column("total_duration", sa.Float(), nullable=False), sa.Column("average_wpm", sa.Float(), nullable=False), sa.Column("total_filler_words", sa.Integer(), nullable=False), sa.Column("total_pauses", sa.Integer(), nullable=False), sa.Column("strengths", sa.JSON(), nullable=False), sa.Column("weaknesses", sa.JSON(), nullable=False), sa.Column("recommendations", sa.JSON(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))


def downgrade() -> None:
    op.drop_table("interview_summaries")
    op.drop_table("answer_evaluations")
    op.drop_table("speech_metrics")
    op.drop_table("answers")
    op.drop_table("questions")
    op.drop_index("ix_interview_sessions_user_status", table_name="interview_sessions")
    op.drop_index("ix_interview_sessions_status", table_name="interview_sessions")
    op.drop_index("ix_interview_sessions_user_id", table_name="interview_sessions")
    op.drop_table("interview_sessions")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    if op.get_bind().dialect.name == "postgresql":
        sa.Enum(name="sessionstatus").drop(op.get_bind(), checkfirst=True)
