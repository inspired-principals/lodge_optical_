"""Add clinical case management layer

Revision ID: 002
Revises: 001
Create Date: 2026-04-15 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "triage_submissions",
        sa.Column("case_status", sa.String(length=20), nullable=False, server_default="NEW"),
    )
    op.add_column(
        "triage_submissions",
        sa.Column("status_updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.add_column(
        "triage_submissions",
        sa.Column("priority_overridden", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "triage_submissions",
        sa.Column("routing_overridden", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "triage_submissions",
        sa.Column("override_reason", sa.String(length=255), nullable=True),
    )

    op.create_index("ix_triage_submissions_case_status", "triage_submissions", ["case_status"])

    op.create_table(
        "case_actions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("submission_id", sa.Integer(), nullable=False),
        sa.Column("action_type", sa.String(length=50), nullable=False),
        sa.Column("performed_by", sa.String(length=100), nullable=False),
        sa.Column("previous_value", sa.String(length=255), nullable=True),
        sa.Column("new_value", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["submission_id"], ["triage_submissions.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_case_actions_submission_id", "case_actions", ["submission_id"])
    op.create_index("ix_case_actions_action_type", "case_actions", ["action_type"])
    op.create_index("ix_case_actions_created_at", "case_actions", ["created_at"])


def downgrade():
    op.drop_index("ix_case_actions_created_at", table_name="case_actions")
    op.drop_index("ix_case_actions_action_type", table_name="case_actions")
    op.drop_index("ix_case_actions_submission_id", table_name="case_actions")
    op.drop_table("case_actions")

    op.drop_index("ix_triage_submissions_case_status", table_name="triage_submissions")
    op.drop_column("triage_submissions", "override_reason")
    op.drop_column("triage_submissions", "routing_overridden")
    op.drop_column("triage_submissions", "priority_overridden")
    op.drop_column("triage_submissions", "status_updated_at")
    op.drop_column("triage_submissions", "case_status")
