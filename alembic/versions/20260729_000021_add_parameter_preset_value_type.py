"""add explicit parameter preset value type

Revision ID: 20260729_000021
Revises: 20260729_000020
Create Date: 2026-07-29 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "20260729_000021"
down_revision = "20260729_000020"
branch_labels = None
depends_on = None


def upgrade() -> None:
    table_columns = {
        column["name"]
        for column in inspect(op.get_bind()).get_columns("product_type_parameter_presets")
    }
    if "value_type" not in table_columns:
        with op.batch_alter_table("product_type_parameter_presets") as batch_op:
            batch_op.add_column(
                sa.Column("value_type", sa.String(length=16), nullable=True)
            )

    op.execute(
        sa.text(
            """
            UPDATE product_type_parameter_presets
            SET value_type = CASE
                WHEN value_string IS NOT NULL THEN 'string'
                WHEN value_number IS NOT NULL OR preferred_unit IS NOT NULL THEN 'number'
                ELSE 'string'
            END
            WHERE value_type IS NULL
            """
        )
    )

    with op.batch_alter_table("product_type_parameter_presets") as batch_op:
        batch_op.alter_column(
            "value_type",
            existing_type=sa.String(length=16),
            nullable=False,
            server_default="string",
        )


def downgrade() -> None:
    table_columns = {
        column["name"]
        for column in inspect(op.get_bind()).get_columns("product_type_parameter_presets")
    }
    if "value_type" in table_columns:
        with op.batch_alter_table("product_type_parameter_presets") as batch_op:
            batch_op.drop_column("value_type")
