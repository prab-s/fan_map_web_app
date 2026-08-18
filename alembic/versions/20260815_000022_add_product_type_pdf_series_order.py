"""add product type PDF series ordering

Revision ID: 20260815_000022
Revises: 20260729_000021
Create Date: 2026-08-15 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "20260815_000022"
down_revision = "20260729_000021"
branch_labels = None
depends_on = None


def upgrade() -> None:
    columns = {column["name"] for column in inspect(op.get_bind()).get_columns("product_types")}
    if "product_type_pdf_series_order" not in columns:
        op.add_column(
            "product_types",
            sa.Column("product_type_pdf_series_order", sa.JSON(), nullable=True),
        )

    product_types = sa.table(
        "product_types",
        sa.column("product_type_pdf_series_order", sa.JSON()),
    )
    op.execute(
        product_types.update()
        .where(product_types.c.product_type_pdf_series_order.is_(None))
        .values(product_type_pdf_series_order=[])
    )


def downgrade() -> None:
    columns = {column["name"] for column in inspect(op.get_bind()).get_columns("product_types")}
    if "product_type_pdf_series_order" in columns:
        op.drop_column("product_types", "product_type_pdf_series_order")
