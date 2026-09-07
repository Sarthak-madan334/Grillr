"""add nullable unique usernames to users

Revision ID: 0003_add_username
Revises: 0002_add_question_count
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0003_add_username"
down_revision: Union[str, None] = "0002_add_question_count"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("username", sa.String(length=30), nullable=True))
    op.create_index(
        "users_username_lower_unique",
        "users",
        [sa.text("LOWER(username)")],
        unique=True,
        postgresql_where=sa.text("username IS NOT NULL"),
        sqlite_where=sa.text("username IS NOT NULL"),
    )


def downgrade() -> None:
    op.drop_index("users_username_lower_unique", table_name="users")
    op.drop_column("users", "username")
