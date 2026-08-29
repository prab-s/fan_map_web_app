"""Add SMTP settings to app settings.

Revision ID: 20260829_000024
Revises: 20260815_000023
Create Date: 2026-08-29 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "20260829_000024"
down_revision = "20260815_000023"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    existing_columns = {column["name"] for column in inspect(bind).get_columns("app_settings")}
    columns = {
        "smtp_host": sa.Column("smtp_host", sa.String(length=255), nullable=True),
        "smtp_port": sa.Column("smtp_port", sa.Integer(), nullable=True),
        "smtp_username": sa.Column("smtp_username", sa.String(length=255), nullable=True),
        "smtp_password_encrypted": sa.Column("smtp_password_encrypted", sa.Text(), nullable=True),
        "smtp_use_tls": sa.Column("smtp_use_tls", sa.Boolean(), nullable=True),
        "smtp_from_address": sa.Column("smtp_from_address", sa.String(length=255), nullable=True),
    }
    for name, column in columns.items():
        if name not in existing_columns:
            op.add_column("app_settings", column)


def downgrade() -> None:
    for name in (
        "smtp_from_address",
        "smtp_use_tls",
        "smtp_password_encrypted",
        "smtp_username",
        "smtp_port",
        "smtp_host",
    ):
        op.drop_column("app_settings", name)
