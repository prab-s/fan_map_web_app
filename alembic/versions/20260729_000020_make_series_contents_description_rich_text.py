"""make series contents description rich text

Revision ID: 20260729_000020
Revises: 20260728_000019
Create Date: 2026-07-29 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260729_000020"
down_revision = "20260728_000019"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("series") as batch_op:
        batch_op.alter_column(
            "contents_description",
            existing_type=sa.String(length=500),
            type_=sa.Text(),
            existing_nullable=True,
        )


def downgrade() -> None:
    with op.batch_alter_table("series") as batch_op:
        batch_op.alter_column(
            "contents_description",
            existing_type=sa.Text(),
            type_=sa.String(length=500),
            existing_nullable=True,
        )
