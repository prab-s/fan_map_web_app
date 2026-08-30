"""Add independently editable CMS page layouts."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "20260830_000027"
down_revision = "20260830_000026"
branch_labels = None
depends_on = None


def upgrade() -> None:
    existing = {column["name"] for column in inspect(op.get_bind()).get_columns("site_pages")}
    for name in ("draft_layout", "published_layout"):
        if name not in existing:
            op.add_column("site_pages", sa.Column(name, sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("site_pages", "published_layout")
    op.drop_column("site_pages", "draft_layout")
