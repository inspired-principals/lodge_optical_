"""Add tenant isolation and concurrency controls

Revision ID: 003
Revises: 002
Create Date: 2026-04-15 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "triage_submissions",
        sa.Column("tenant_id", sa.String(length=100), nullable=False, server_default="default"),
    )
    op.add_column(
        "triage_submissions",
        sa.Column("row_version", sa.Integer(), nullable=False, server_default="1"),
    )
    op.add_column(
        "triage_submissions",
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.add_column(
        "triage_submissions",
        sa.Column("updated_by", sa.String(length=100), nullable=False, server_default="system"),
    )
    op.create_index("idx_case_tenant", "triage_submissions", ["tenant_id", "id"])

    op.add_column(
        "case_actions",
        sa.Column("tenant_id", sa.String(length=100), nullable=False, server_default="default"),
    )
    op.create_index("idx_action_tenant", "case_actions", ["tenant_id", "submission_id"])


def downgrade():
    op.drop_index("idx_action_tenant", table_name="case_actions")
    op.drop_column("case_actions", "tenant_id")

    op.drop_index("idx_case_tenant", table_name="triage_submissions")
    op.drop_column("triage_submissions", "updated_by")
    op.drop_column("triage_submissions", "updated_at")
    op.drop_column("triage_submissions", "row_version")
    op.drop_column("triage_submissions", "tenant_id")
