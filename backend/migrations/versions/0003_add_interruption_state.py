"""persist interview speech interruption state

Revision ID: 0003_add_interruption_state
Revises: 0002_add_question_count
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0003_add_interruption_state"
down_revision: Union[str, None] = "0002_add_question_count"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("interview_sessions", sa.Column("speech_state", sa.String(length=20), server_default="idle", nullable=False))
    op.add_column("interview_sessions", sa.Column("speech_generation_id", sa.Uuid(), nullable=True))
    op.add_column("interview_sessions", sa.Column("speech_question_id", sa.Uuid(), nullable=True))
    op.add_column("interview_sessions", sa.Column("interrupted_generation_id", sa.Uuid(), nullable=True))
    op.add_column("interview_sessions", sa.Column("interrupted_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index("ix_interview_sessions_speech_generation_id", "interview_sessions", ["speech_generation_id"])
    op.create_index("ix_interview_sessions_speech_question_id", "interview_sessions", ["speech_question_id"])


def downgrade() -> None:
    op.drop_index("ix_interview_sessions_speech_question_id", table_name="interview_sessions")
    op.drop_index("ix_interview_sessions_speech_generation_id", table_name="interview_sessions")
    op.drop_column("interview_sessions", "interrupted_at")
    op.drop_column("interview_sessions", "interrupted_generation_id")
    op.drop_column("interview_sessions", "speech_question_id")
    op.drop_column("interview_sessions", "speech_generation_id")
    op.drop_column("interview_sessions", "speech_state")