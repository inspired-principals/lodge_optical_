from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Handle different database types for testing
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def _ensure_triage_submission_columns():
    """Temporary dev-only backfill for the converged triage pipeline schema."""
    if settings.ENVIRONMENT.lower() == "production":
        return

    logger = __import__("logging").getLogger(__name__)
    inspector = inspect(engine)
    if not inspector.has_table("triage_submissions"):
        return

    logger.warning("Running temporary development schema backfill for triage_submissions")
    existing_columns = {column["name"] for column in inspector.get_columns("triage_submissions")}
    column_statements = {
        "ai_summary": "ALTER TABLE triage_submissions ADD COLUMN ai_summary TEXT NOT NULL DEFAULT ''",
        "ai_risk_level": "ALTER TABLE triage_submissions ADD COLUMN ai_risk_level VARCHAR(20)",
        "ai_confidence": "ALTER TABLE triage_submissions ADD COLUMN ai_confidence DECIMAL(3, 2)",
        "ai_flags": "ALTER TABLE triage_submissions ADD COLUMN ai_flags JSON",
        "ai_version": "ALTER TABLE triage_submissions ADD COLUMN ai_version VARCHAR(20)",
        "priority_score": "ALTER TABLE triage_submissions ADD COLUMN priority_score INTEGER",
        "priority_level": "ALTER TABLE triage_submissions ADD COLUMN priority_level VARCHAR(20)",
        "routing_category": "ALTER TABLE triage_submissions ADD COLUMN routing_category VARCHAR(50)",
        "next_action": "ALTER TABLE triage_submissions ADD COLUMN next_action VARCHAR(50)",
        "recommended_window": "ALTER TABLE triage_submissions ADD COLUMN recommended_window VARCHAR(50)",
        "case_status": "ALTER TABLE triage_submissions ADD COLUMN case_status VARCHAR(20) NOT NULL DEFAULT 'NEW'",
        "status_updated_at": "ALTER TABLE triage_submissions ADD COLUMN status_updated_at DATETIME",
        "priority_overridden": "ALTER TABLE triage_submissions ADD COLUMN priority_overridden BOOLEAN NOT NULL DEFAULT 0",
        "routing_overridden": "ALTER TABLE triage_submissions ADD COLUMN routing_overridden BOOLEAN NOT NULL DEFAULT 0",
        "override_reason": "ALTER TABLE triage_submissions ADD COLUMN override_reason VARCHAR(255)",
        "tenant_id": "ALTER TABLE triage_submissions ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default'",
        "row_version": "ALTER TABLE triage_submissions ADD COLUMN row_version INTEGER NOT NULL DEFAULT 1",
        "updated_at": "ALTER TABLE triage_submissions ADD COLUMN updated_at DATETIME",
        "updated_by": "ALTER TABLE triage_submissions ADD COLUMN updated_by VARCHAR(100) NOT NULL DEFAULT 'system'",
    }

    with engine.begin() as connection:
        for column_name, statement in column_statements.items():
            if column_name not in existing_columns:
                connection.execute(text(statement))


def _ensure_case_action_columns():
    """Temporary dev-only backfill for case action tenant isolation."""
    if settings.ENVIRONMENT.lower() == "production":
        return

    logger = __import__("logging").getLogger(__name__)
    inspector = inspect(engine)
    if not inspector.has_table("case_actions"):
        return

    logger.warning("Running temporary development schema backfill for case_actions")
    existing_columns = {column["name"] for column in inspector.get_columns("case_actions")}
    column_statements = {
        "tenant_id": "ALTER TABLE case_actions ADD COLUMN tenant_id VARCHAR(100) NOT NULL DEFAULT 'default'",
    }

    with engine.begin() as connection:
        for column_name, statement in column_statements.items():
            if column_name not in existing_columns:
                connection.execute(text(statement))


def ensure_database_tables():
    """Create missing tables for the active metadata set."""
    # Import mapped models explicitly so metadata is complete regardless of import order.
    from ..modules.auth import models as auth_models  # noqa: F401
    from ..modules.patient import models as patient_models  # noqa: F401
    from ..modules.triage import models as triage_models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _ensure_triage_submission_columns()
    _ensure_case_action_columns()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
