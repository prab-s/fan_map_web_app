"""add numbered description fields through ten

Revision ID: 20260903_000028
Revises: 20260830_000027
"""

from alembic import op
import sqlalchemy as sa


revision = "20260903_000028"
down_revision = "20260830_000027"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = {
        "products": range(4, 11),
        "series": range(5, 11),
    }
    for table, indexes in tables.items():
        columns = {column["name"] for column in inspector.get_columns(table)}
        for index in indexes:
            name = f"description{index}_html"
            if name not in columns:
                op.add_column(table, sa.Column(name, sa.Text(), nullable=True))
        if "description_field_count" not in columns:
            op.add_column(table, sa.Column("description_field_count", sa.Integer(), nullable=False, server_default="0"))
    op.execute(sa.text(
        "UPDATE products SET description4_html = comments_html, comments_html = NULL "
        "WHERE description4_html IS NULL AND comments_html IS NOT NULL"
    ))
    connection = op.get_bind()
    for table in ("products", "series"):
        rows = connection.execute(sa.text(
            f"SELECT id, {', '.join(f'description{index}_html' for index in range(1, 11))} "
            f"FROM {table} ORDER BY id"
        )).mappings().all()
        fields = [f"description{index}_html" for index in range(1, 11)]
        for row in rows:
            values = [row[field] for field in fields if row[field] is not None and str(row[field]).strip()]
            updates = {field: None for field in fields}
            updates.update({fields[index]: value for index, value in enumerate(values)})
            updates["count"] = len(values)
            assignments = ", ".join(f"{field} = :{field}" for field in fields)
            connection.execute(sa.text(
                f"UPDATE {table} SET {assignments}, description_field_count = :count WHERE id = :id"
            ), {**updates, "id": row["id"]})


def downgrade():
    for table, indexes in {"series": range(5, 11), "products": range(4, 11)}.items():
        op.drop_column(table, "description_field_count")
        for index in indexes:
            op.drop_column(table, f"description{index}_html")
