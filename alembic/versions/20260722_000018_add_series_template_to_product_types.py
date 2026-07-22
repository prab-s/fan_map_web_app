"""add series PDF template default to product types

Revision ID: 20260722_000018
Revises: 20260719_000017
Create Date: 2026-07-22 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "20260722_000018"
down_revision = "20260719_000017"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("product_types")}
    if "series_template_id" not in columns:
        op.add_column("product_types", sa.Column("series_template_id", sa.String(length=128), nullable=True))


def downgrade() -> None:
    inspector = inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("product_types")}
    if "series_template_id" in columns:
        op.drop_column("product_types", "series_template_id")
