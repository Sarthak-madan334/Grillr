"""merge interruption state and username migration branches

Revision ID: 0005_merge_user_interrupt
Revises: 0003_add_interruption_state, 0004_add_answer_idempotency_key
"""
from typing import Sequence, Union


revision: str = "0005_merge_user_interrupt"
down_revision: Union[str, Sequence[str], None] = (
    "0003_add_interruption_state",
    "0004_add_answer_idempotency_key",
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
