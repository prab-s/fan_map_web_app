"""add short series description for product type contents grids

Revision ID: 20260728_000019
Revises: 20260722_000018
Create Date: 2026-07-28 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "20260728_000019"
down_revision = "20260722_000018"
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("series")}
    if "contents_description" not in columns:
        op.add_column("series", sa.Column("contents_description", sa.String(length=500), nullable=True))


def downgrade() -> None:
    inspector = inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("series")}
    if "contents_description" in columns:
        op.drop_column("series", "contents_description")
