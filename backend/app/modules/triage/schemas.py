from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from uuid import UUID
from ...engine.schemas import TriageInput, TriageResult


class TriageRequest(TriageInput):
    """API request model for triage operations"""
    pass


class TriageResponse(TriageResult):
    """API response model for triage results"""
    pass


class TriageSessionResponse(BaseModel):
    id: UUID
    patient_id: int
    patient_name: Optional[str] = None
    risk_score: float
    risk_level: str
    recommendations: List[str]
    reasoning: str
    confidence_score: float
    engine_version: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class TriageHistoryResponse(BaseModel):
    sessions: List[TriageSessionResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class TriageRuleRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    version: str = Field(..., min_length=1, max_length=20)
    conditions: List[Dict[str, Any]]
    actions: Dict[str, Any]
    priority: int = 0
    is_active: bool = True


class TriageRuleResponse(BaseModel):
    id: int
    name: str
    version: str
    conditions: List[Dict[str, Any]]
    actions: Dict[str, Any]
    priority: int
    is_active: bool
    created_by: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True