"""add series images table

Revision ID: 20260523_000014
Revises: 20260514_000013
Create Date: 2026-05-23 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "20260523_000014"
down_revision = "20260514_000013"
branch_labels = None
depends_on = None


def _series_images_table_exists() -> bool:
    bind = op.get_bind()
    return inspect(bind).has_table("series_images")


def upgrade() -> None:
    if _series_images_table_exists():
        return

    op.create_table(
        "series_images",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("series_id", sa.Integer(), nullable=False),
        sa.Column("file_name", sa.String(length=512), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["series_id"], ["series.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_series_images_id"), "series_images", ["id"], unique=False)


def downgrade() -> None:
    if not _series_images_table_exists():
        return

    op.drop_index(op.f("ix_series_images_id"), table_name="series_images")
    op.drop_table("series_images")
