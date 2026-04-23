from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class CaseRecord(BaseModel):
    id: int
    tenant_id: str
    patient_id: int
    patient_name: str
    patient_email: Optional[str] = None
    patient_phone: Optional[str] = None
    submitted_at: datetime
    severity_score: float
    risk_level: str
    recommended_specialty: str
    urgency_days: int
    symptoms: List[str] = Field(default_factory=list)
    history: str
    notes: str
    clinical_notes: List[str] = Field(default_factory=list)
    ai_summary: str
    ai_risk_level: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_flags: List[str] = Field(default_factory=list)
    ai_version: Optional[str] = None
    priority_score: Optional[int] = None
    priority_level: Optional[str] = None
    routing_category: Optional[str] = None
    next_action: Optional[str] = None
    recommended_window: Optional[str] = None
    case_status: str
    row_version: int
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None
    case_health: dict = Field(default_factory=dict)


class CaseTimelineEvent(BaseModel):
    action_type: str
    performed_by: str
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    created_at: datetime


class CaseTimeline(BaseModel):
    submission_id: int
    current_status: str
    priority_score: Optional[int] = None
    routing_category: Optional[str] = None
    timeline: List[CaseTimelineEvent] = Field(default_factory=list)


class PatchCaseStatusRequest(BaseModel):
    new_status: str = Field(..., min_length=1, max_length=20)
    row_version: int = Field(..., ge=1)


class PatchCasePriorityRequest(BaseModel):
    new_score: int = Field(..., ge=0, le=100)
    reason: str = Field(..., min_length=1, max_length=255)
    row_version: int = Field(..., ge=1)


class PatchCaseRoutingRequest(BaseModel):
    new_category: str = Field(..., min_length=1, max_length=50)
    reason: str = Field(..., min_length=1, max_length=255)
    row_version: int = Field(..., ge=1)


class CreateCaseNoteRequest(BaseModel):
    note: str = Field(..., min_length=1, max_length=255)
