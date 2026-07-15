"""add quote requests table

Revision ID: 20260715_000015
Revises: 20260523_000014
Create Date: 2026-07-15 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "20260715_000015"
down_revision = "20260523_000014"
branch_labels = None
depends_on = None


def _quote_requests_table_exists() -> bool:
    bind = op.get_bind()
    return inspect(bind).has_table("quote_requests")


def upgrade() -> None:
    if _quote_requests_table_exists():
        return

    op.create_table(
        "quote_requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="new"),
        sa.Column("email_status", sa.String(length=32), nullable=False, server_default="pending"),
        sa.Column("email_error", sa.Text(), nullable=True),
        sa.Column("verification_provider", sa.String(length=32), nullable=False, server_default="none"),
        sa.Column("verification_status", sa.String(length=32), nullable=False, server_default="not_configured"),
        sa.Column("verification_error", sa.Text(), nullable=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("company", sa.String(length=160), nullable=True),
        sa.Column("email", sa.String(length=160), nullable=False),
        sa.Column("phone", sa.String(length=80), nullable=True),
        sa.Column("request_type", sa.String(length=32), nullable=False, server_default="unsure"),
        sa.Column("attributes", sa.JSON(), nullable=False),
        sa.Column("airflow_min", sa.String(length=40), nullable=True),
        sa.Column("airflow_max", sa.String(length=40), nullable=True),
        sa.Column("pressure_min", sa.String(length=40), nullable=True),
        sa.Column("pressure_max", sa.String(length=40), nullable=True),
        sa.Column("power_limit", sa.String(length=60), nullable=True),
        sa.Column("short_notes", sa.String(length=300), nullable=True),
        sa.Column("details", sa.Text(), nullable=True),
        sa.Column("page_type", sa.String(length=80), nullable=True),
        sa.Column("page_title", sa.String(length=200), nullable=True),
        sa.Column("page_summary", sa.String(length=500), nullable=True),
        sa.Column("page_card_title", sa.String(length=200), nullable=True),
        sa.Column("page_card_summary", sa.String(length=500), nullable=True),
        sa.Column("page_url", sa.String(length=500), nullable=True),
        sa.Column("client_ip", sa.String(length=64), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("referrer", sa.Text(), nullable=True),
        sa.Column("origin", sa.Text(), nullable=True),
        sa.Column("context_json", sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_quote_requests_id"), "quote_requests", ["id"], unique=False)
    op.create_index(op.f("ix_quote_requests_created_at"), "quote_requests", ["created_at"], unique=False)
    op.create_index(op.f("ix_quote_requests_status"), "quote_requests", ["status"], unique=False)
    op.create_index(op.f("ix_quote_requests_email_status"), "quote_requests", ["email_status"], unique=False)
    op.create_index(op.f("ix_quote_requests_verification_status"), "quote_requests", ["verification_status"], unique=False)


def downgrade() -> None:
    if not _quote_requests_table_exists():
        return

    op.drop_index(op.f("ix_quote_requests_verification_status"), table_name="quote_requests")
    op.drop_index(op.f("ix_quote_requests_email_status"), table_name="quote_requests")
    op.drop_index(op.f("ix_quote_requests_status"), table_name="quote_requests")
    op.drop_index(op.f("ix_quote_requests_created_at"), table_name="quote_requests")
    op.drop_index(op.f("ix_quote_requests_id"), table_name="quote_requests")
    op.drop_table("quote_requests")
