"""add associated downloadable documents

Revision ID: 20260719_000017
Revises: 20260715_000016
Create Date: 2026-07-19 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "20260719_000017"
down_revision = "20260715_000016"
branch_labels = None
depends_on = None


def upgrade() -> None:
    if inspect(op.get_bind()).has_table("associated_documents"):
        return

    op.create_table(
        "associated_documents",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("product_type_id", sa.Integer(), nullable=True),
        sa.Column("series_id", sa.Integer(), nullable=True),
        sa.Column("product_id", sa.Integer(), nullable=True),
        sa.Column("owner_type", sa.String(length=32), nullable=False),
        sa.Column("original_file_name", sa.String(length=512), nullable=False),
        sa.Column("file_name", sa.String(length=512), nullable=False),
        sa.Column("mime_type", sa.String(length=255), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["product_type_id"], ["product_types.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["series_id"], ["series.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("file_name"),
    )
    op.create_index("ix_associated_documents_id", "associated_documents", ["id"], unique=False)


def downgrade() -> None:
    if not inspect(op.get_bind()).has_table("associated_documents"):
        return
    op.drop_index("ix_associated_documents_id", table_name="associated_documents")
    op.drop_table("associated_documents")
