"""Horoscope predictions table

Revision ID: 004
Revises: 003
Create Date: 2025-02-27

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "horoscope_predictions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("uuid", sa.String(64), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=True, server_default="1"),
        sa.Column("created_at", sa.DateTime(), nullable=True, server_default=sa.text("(CURRENT_TIMESTAMP)")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_horoscope_predictions_uuid"), "horoscope_predictions", ["uuid"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_horoscope_predictions_uuid"), table_name="horoscope_predictions")
    op.drop_table("horoscope_predictions")
