"""backfill product type PDF series ordering

Revision ID: 20260815_000023
Revises: 20260815_000022
Create Date: 2026-08-15 00:01:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260815_000023"
down_revision = "20260815_000022"
branch_labels = None
depends_on = None


def upgrade() -> None:
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
    pass
