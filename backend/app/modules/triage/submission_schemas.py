from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class TriagePatientPayload(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=200)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)


class TriageSubmissionPayload(BaseModel):
    symptoms: List[str] = Field(default_factory=list)
    history: str = Field(default="", max_length=4000)
    severity_score: float = Field(..., ge=0, le=100)
    notes: str = Field(default="", max_length=4000)
    risk_level: str = Field(..., min_length=1, max_length=50)
    recommended_specialty: str = Field(..., min_length=1, max_length=200)
    urgency_days: int = Field(..., ge=0, le=365)
    clinical_notes: List[str] = Field(default_factory=list)
    diagnostic_results: Dict[str, Any] = Field(default_factory=dict)


class TriageSubmissionRequest(BaseModel):
    patient: TriagePatientPayload
    triage: TriageSubmissionPayload


class TriageAIResult(BaseModel):
    summary: str = Field(default="", max_length=500)
    risk_level: Optional[Literal["low", "moderate", "high", "urgent"]] = None
    # Heuristic signal, not a calibrated probability.
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    flags: List[str] = Field(default_factory=list)
    version: Optional[str] = Field(default=None, max_length=20)


class TriageRoutingResult(BaseModel):
    priority_score: int = Field(..., ge=0, le=100)
    priority_level: Literal["low", "moderate", "high", "urgent"]
    routing_category: str = Field(..., min_length=1, max_length=50)
    next_action: str = Field(..., min_length=1, max_length=50)
    recommended_window: str = Field(..., min_length=1, max_length=50)


class AdminTriageCaseResponse(BaseModel):
    submission_id: int
    patient_id: int
    patient_name: str
    patient_email: Optional[str] = None
    patient_phone: Optional[str] = None
    submitted_at: datetime
    severity_score: float
    risk_level: str
    recommended_specialty: str
    urgency_days: int
    symptoms: List[str]
    history: str
    notes: str
    clinical_notes: List[str]
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
    case_status: Optional[str] = None

    class Config:
        from_attributes = True


class CaseTimelineEntryResponse(BaseModel):
    action_type: str
    performed_by: str
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    created_at: datetime


class CaseTimelineResponse(BaseModel):
    submission_id: int
    current_status: str
    priority_score: Optional[int] = None
    routing_category: Optional[str] = None
    timeline: List[CaseTimelineEntryResponse] = Field(default_factory=list)


class CaseStatusUpdateRequest(BaseModel):
    new_status: str = Field(..., min_length=1, max_length=20)
    user_id: str = Field(..., min_length=1, max_length=100)


class CasePriorityOverrideRequest(BaseModel):
    new_score: int = Field(..., ge=0, le=100)
    reason: str = Field(..., min_length=1, max_length=255)
    user_id: str = Field(..., min_length=1, max_length=100)


class CaseRoutingOverrideRequest(BaseModel):
    new_category: str = Field(..., min_length=1, max_length=50)
    reason: str = Field(..., min_length=1, max_length=255)
    user_id: str = Field(..., min_length=1, max_length=100)


class CaseNoteCreateRequest(BaseModel):
    note: str = Field(..., min_length=1, max_length=255)
    user_id: str = Field(..., min_length=1, max_length=100)
