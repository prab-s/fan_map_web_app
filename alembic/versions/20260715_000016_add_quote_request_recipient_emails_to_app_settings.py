"""Add quote request recipient emails to app settings.

Revision ID: 20260715_000016
Revises: 20260715_000015
Create Date: 2026-07-15 13:55:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = "20260715_000016"
down_revision = "20260715_000015"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    existing_columns = {column["name"] for column in inspector.get_columns("app_settings")}
    if "quote_request_recipient_emails" not in existing_columns:
        op.add_column("app_settings", sa.Column("quote_request_recipient_emails", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("app_settings", "quote_request_recipient_emails")
