"""Tarot cards and readings

Revision ID: 003
Revises: 002
Create Date: 2025-02-26

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "tarot_cards",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("uuid", sa.String(64), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("image_url", sa.String(512), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True, server_default="1"),
        sa.Column("sort_order", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=True, server_default=sa.text("(CURRENT_TIMESTAMP)")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tarot_cards_uuid"), "tarot_cards", ["uuid"], unique=True)

    op.create_table(
        "tarot_readings",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("question_text", sa.Text(), nullable=True),
        sa.Column("past_card_uuid", sa.String(64), nullable=False),
        sa.Column("present_card_uuid", sa.String(64), nullable=False),
        sa.Column("future_card_uuid", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True, server_default=sa.text("(CURRENT_TIMESTAMP)")),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("tarot_readings")
    op.drop_index(op.f("ix_tarot_cards_uuid"), table_name="tarot_cards")
    op.drop_table("tarot_cards")
