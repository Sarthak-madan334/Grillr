"""add question count to interview sessions

Revision ID: 0002_add_question_count
Revises: 0001_initial
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0002_add_question_count"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "interview_sessions",
        sa.Column("question_count", sa.Integer(), server_default="5", nullable=False),
    )


def downgrade() -> None:
    op.drop_column("interview_sessions", "question_count")