"""Add structured customer-facing CMS pages and assets.

Revision ID: 20260829_000025
Revises: 20260829_000024
Create Date: 2026-08-29 00:30:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260829_000025"
down_revision = "20260829_000024"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "site_pages" not in inspector.get_table_names():
        op.create_table(
            "site_pages",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("slug", sa.String(length=80), nullable=False),
            sa.Column("label", sa.String(length=160), nullable=False),
            sa.Column("content_type", sa.String(length=32), nullable=False, server_default="page"),
            sa.Column("draft_content", sa.JSON(), nullable=False, server_default="{}"),
            sa.Column("published_content", sa.JSON(), nullable=False, server_default="{}"),
            sa.Column("draft_seo", sa.JSON(), nullable=False, server_default="{}"),
            sa.Column("published_seo", sa.JSON(), nullable=False, server_default="{}"),
            sa.Column("status", sa.String(length=32), nullable=False, server_default="published"),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
            sa.UniqueConstraint("slug", name="uq_site_pages_slug"),
        )
    if "ix_site_pages_slug" not in {index["name"] for index in sa.inspect(bind).get_indexes("site_pages")}:
        op.create_index("ix_site_pages_slug", "site_pages", ["slug"])
    if "site_assets" not in sa.inspect(bind).get_table_names():
        op.create_table(
            "site_assets",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("original_file_name", sa.String(length=512), nullable=False),
            sa.Column("file_name", sa.String(length=512), nullable=False),
            sa.Column("mime_type", sa.String(length=255), nullable=True),
            sa.Column("file_size_bytes", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.UniqueConstraint("file_name", name="uq_site_assets_file_name"),
        )
    if "ix_site_assets_file_name" not in {index["name"] for index in sa.inspect(bind).get_indexes("site_assets")}:
        op.create_index("ix_site_assets_file_name", "site_assets", ["file_name"])


def downgrade() -> None:
    op.drop_index("ix_site_assets_file_name", table_name="site_assets")
    op.drop_table("site_assets")
    op.drop_index("ix_site_pages_slug", table_name="site_pages")
    op.drop_table("site_pages")
