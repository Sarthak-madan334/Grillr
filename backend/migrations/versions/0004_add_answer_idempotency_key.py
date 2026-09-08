"""add WebSocket answer idempotency keys

Revision ID: 0004_add_answer_idempotency_key
Revises: 0003_add_username
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0004_add_answer_idempotency_key"
down_revision: Union[str, None] = "0003_add_username"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("answers", sa.Column("idempotency_key", sa.String(length=128), nullable=True))
    op.create_index("uq_answers_session_idempotency_key", "answers", ["session_id", "idempotency_key"], unique=True)


def downgrade() -> None:
    op.drop_index("uq_answers_session_idempotency_key", table_name="answers")
    op.drop_column("answers", "idempotency_key")