from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from uuid import UUID


class VitalSigns(BaseModel):
    blood_pressure: Optional[str] = None
    heart_rate: Optional[int] = Field(None, ge=30, le=300)
    temperature: Optional[float] = Field(None, ge=90.0, le=110.0)
    respiratory_rate: Optional[int] = Field(None, ge=5, le=60)
    oxygen_saturation: Optional[int] = Field(None, ge=70, le=100)
    pain_level: Optional[int] = Field(None, ge=0, le=10)


class TriageInput(BaseModel):
    patient_id: int
    symptoms: List[str] = Field(..., min_items=1)
    vital_signs: VitalSigns
    medical_history: List[str] = Field(default_factory=list)
    current_medications: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    chief_complaint: Optional[str] = None
    additional_notes: Optional[str] = None
    onset_time: Optional[str] = None  # "acute", "gradual", "chronic"
    severity: Optional[int] = Field(None, ge=1, le=10)


class TriageResult(BaseModel):
    session_id: UUID
    risk_score: float = Field(..., ge=0.0, le=10.0)
    risk_level: str  # "low", "moderate", "high", "critical"
    recommendations: List[str]
    reasoning: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    engine_version: str
    rules_applied: List[str]
    created_at: datetime


class RuleCondition(BaseModel):
    field: str
    operator: str  # "equals", "contains", "greater_than", "less_than", "in"
    value: Any
    weight: float = 1.0


class RuleAction(BaseModel):
    score_adjustment: float = 0.0
    priority_boost: int = 0
    recommendations: List[str] = Field(default_factory=list)
    reasoning: Optional[str] = None


class TriageRule(BaseModel):
    name: str
    version: str
    conditions: List[RuleCondition]
    actions: RuleAction
    priority: int = 0
    is_active: bool = True