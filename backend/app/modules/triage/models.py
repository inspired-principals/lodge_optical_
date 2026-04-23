from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4
from ...core.database import Base


UUID_TYPE = UUID(as_uuid=True).with_variant(String(36), "sqlite")


class TriageSession(Base):
    __tablename__ = "triage_sessions"
    
    id = Column(UUID_TYPE, primary_key=True, default=uuid4, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    input_data = Column(JSON, nullable=False)
    risk_score = Column(DECIMAL(4, 2))
    risk_level = Column(String(20))
    recommendations = Column(JSON)
    reasoning = Column(Text)
    confidence_score = Column(DECIMAL(3, 2))
    engine_version = Column(String(20))
    rules_applied = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    patient = relationship("Patient", foreign_keys=[patient_id])
    user = relationship("User", foreign_keys=[user_id])


class TriageRule(Base):
    __tablename__ = "triage_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    version = Column(String(20), nullable=False)
    conditions = Column(JSON, nullable=False)  # Executable rule conditions
    actions = Column(JSON, nullable=False)     # Score, priority, recommendations
    priority = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, index=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    created_by_user = relationship("User", foreign_keys=[created_by])


class TriageSubmission(Base):
    __tablename__ = "triage_submissions"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String(100), nullable=False, default="default", index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    symptoms = Column(JSON, nullable=False, default=list)
    history = Column(Text, nullable=False, default="")
    severity_score = Column(DECIMAL(5, 2), nullable=False)
    notes = Column(Text, nullable=False, default="")
    risk_level = Column(String(50), nullable=False, index=True)
    recommended_specialty = Column(String(200), nullable=False)
    urgency_days = Column(Integer, nullable=False, default=0)
    clinical_notes = Column(JSON, nullable=False, default=list)
    diagnostic_results = Column(JSON, nullable=False, default=dict)
    ai_summary = Column(Text, nullable=False, default="")
    ai_risk_level = Column(String(20), nullable=True, index=True)
    ai_confidence = Column(DECIMAL(3, 2), nullable=True)
    ai_flags = Column(JSON, nullable=False, default=list)
    ai_version = Column(String(20), nullable=True)
    priority_score = Column(Integer, nullable=True, index=True)
    priority_level = Column(String(20), nullable=True, index=True)
    routing_category = Column(String(50), nullable=True, index=True)
    next_action = Column(String(50), nullable=True)
    recommended_window = Column(String(50), nullable=True)
    case_status = Column(String(20), nullable=False, default="NEW", index=True)
    status_updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    priority_overridden = Column(Boolean, nullable=False, default=False)
    routing_overridden = Column(Boolean, nullable=False, default=False)
    override_reason = Column(String(255), nullable=True)
    row_version = Column(Integer, nullable=False, default=1)
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    updated_by = Column(String(100), nullable=False, default="system")
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    patient = relationship("Patient", foreign_keys=[patient_id])
    actions = relationship(
        "CaseAction",
        back_populates="submission",
        cascade="all, delete-orphan",
        order_by="CaseAction.created_at.desc()",
    )


class CaseAction(Base):
    __tablename__ = "case_actions"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String(100), nullable=False, default="default", index=True)
    submission_id = Column(Integer, ForeignKey("triage_submissions.id"), nullable=False, index=True)
    action_type = Column(String(50), nullable=False, index=True)
    performed_by = Column(String(100), nullable=False)
    previous_value = Column(String(255), nullable=True)
    new_value = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)

    submission = relationship("TriageSubmission", back_populates="actions")
