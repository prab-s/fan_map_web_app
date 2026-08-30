"""Add persisted ordering for CMS navigation pages."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "20260830_000026"
down_revision = "20260829_000025"
branch_labels = None
depends_on = None


def upgrade() -> None:
    if "cms_navigation_order" not in {column["name"] for column in inspect(op.get_bind()).get_columns("app_settings")}: 
        op.add_column("app_settings", sa.Column("cms_navigation_order", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("app_settings", "cms_navigation_order")
