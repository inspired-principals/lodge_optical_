from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from math import ceil

from ...core.clinical_control.case_core import TriageRuleService, TriageService
from ...core.clinical_control.contracts import AdminTriageCaseResponse, TriageSubmissionRequest
from ...core.database import get_db
from ...middleware.auth import AuthDependency
from .schemas import (
    TriageRequest, TriageResponse, TriageSessionResponse, 
    TriageHistoryResponse, TriageRuleRequest, TriageRuleResponse
)
from ...modules.auth.models import User
from ...modules.patient.service import PatientService
from ...core.exceptions import ValidationError, TriageEngineError, DatabaseError

router = APIRouter(prefix="/triage", tags=["triage"])

# Permission requirements
require_triage_read = AuthDependency("triage:read")
require_triage_write = AuthDependency("triage:write")
require_admin = AuthDependency("admin:*")


@router.post("/submit", response_model=AdminTriageCaseResponse)
async def submit_triage_case(
    submission: TriageSubmissionRequest,
    db: Session = Depends(get_db)
):
    """Public digital triage intake submission."""
    try:
        return TriageService.submit_triage_case(db, submission)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=TriageResponse)
async def process_triage(
    triage_request: TriageRequest,
    current_user: User = Depends(require_triage_write),
    db: Session = Depends(get_db)
):
    """Process triage assessment"""
    try:
        result = TriageService.process_triage(db, triage_request, current_user.id)
        return result
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except TriageEngineError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions/{session_id}", response_model=TriageSessionResponse)
async def get_triage_session(
    session_id: UUID,
    current_user: User = Depends(require_triage_read),
    db: Session = Depends(get_db)
):
    """Get triage session by ID"""
    session = TriageService.get_triage_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Triage session not found")
    
    # Get patient name
    patient = PatientService.get_patient_by_id(db, session.patient_id)
    patient_name = patient.full_name if patient else None
    
    return TriageSessionResponse(
        id=session.id,
        patient_id=session.patient_id,
        patient_name=patient_name,
        risk_score=float(session.risk_score) if session.risk_score else 0.0,
        risk_level=session.risk_level or "unknown",
        recommendations=session.recommendations or [],
        reasoning=session.reasoning or "",
        confidence_score=float(session.confidence_score) if session.confidence_score else 0.0,
        engine_version=session.engine_version or "unknown",
        created_at=session.created_at
    )


@router.get("/patients/{patient_id}/history", response_model=TriageHistoryResponse)
async def get_patient_triage_history(
    patient_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_triage_read),
    db: Session = Depends(get_db)
):
    """Get triage history for a patient"""
    # Verify patient exists
    patient = PatientService.get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    sessions, total = TriageService.get_patient_triage_history(db, patient_id, page, limit)
    
    total_pages = ceil(total / limit) if total > 0 else 1
    
    session_responses = []
    for session in sessions:
        session_responses.append(TriageSessionResponse(
            id=session.id,
            patient_id=session.patient_id,
            patient_name=patient.full_name,
            risk_score=float(session.risk_score) if session.risk_score else 0.0,
            risk_level=session.risk_level or "unknown",
            recommendations=session.recommendations or [],
            reasoning=session.reasoning or "",
            confidence_score=float(session.confidence_score) if session.confidence_score else 0.0,
            engine_version=session.engine_version or "unknown",
            created_at=session.created_at
        ))
    
    return TriageHistoryResponse(
        sessions=session_responses,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.get("/sessions", response_model=TriageHistoryResponse)
async def get_recent_triage_sessions(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_triage_read),
    db: Session = Depends(get_db)
):
    """Get recent triage sessions across all patients"""
    sessions, total = TriageService.get_recent_triage_sessions(db, page, limit)
    
    total_pages = ceil(total / limit) if total > 0 else 1
    
    session_responses = []
    for session in sessions:
        # Get patient name
        patient = PatientService.get_patient_by_id(db, session.patient_id)
        patient_name = patient.full_name if patient else f"Patient {session.patient_id}"
        
        session_responses.append(TriageSessionResponse(
            id=session.id,
            patient_id=session.patient_id,
            patient_name=patient_name,
            risk_score=float(session.risk_score) if session.risk_score else 0.0,
            risk_level=session.risk_level or "unknown",
            recommendations=session.recommendations or [],
            reasoning=session.reasoning or "",
            confidence_score=float(session.confidence_score) if session.confidence_score else 0.0,
            engine_version=session.engine_version or "unknown",
            created_at=session.created_at
        ))
    
    return TriageHistoryResponse(
        sessions=session_responses,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


# Admin endpoints for rule management
@router.post("/rules", response_model=TriageRuleResponse)
async def create_triage_rule(
    rule_data: TriageRuleRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create new triage rule (admin only)"""
    try:
        rule = TriageRuleService.create_rule(db, rule_data, current_user.id)
        return TriageRuleResponse(
            id=rule.id,
            name=rule.name,
            version=rule.version,
            conditions=rule.conditions,
            actions=rule.actions,
            priority=rule.priority,
            is_active=rule.is_active,
            created_by=rule.created_by,
            created_at=rule.created_at
        )
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/rules", response_model=List[TriageRuleResponse])
async def get_triage_rules(
    active_only: bool = Query(False),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all triage rules (admin only)"""
    rules = TriageRuleService.get_all_rules(db, active_only)
    
    return [
        TriageRuleResponse(
            id=rule.id,
            name=rule.name,
            version=rule.version,
            conditions=rule.conditions,
            actions=rule.actions,
            priority=rule.priority,
            is_active=rule.is_active,
            created_by=rule.created_by,
            created_at=rule.created_at
        )
        for rule in rules
    ]


@router.put("/rules/{rule_id}/status")
async def update_rule_status(
    rule_id: int,
    is_active: bool = Query(...),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update triage rule status (admin only)"""
    try:
        rule = TriageRuleService.update_rule_status(db, rule_id, is_active)
        if not rule:
            raise HTTPException(status_code=404, detail="Rule not found")
        
        return {"message": f"Rule status updated to {'active' if is_active else 'inactive'}"}
    except DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/rules/{rule_id}")
async def delete_triage_rule(
    rule_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete triage rule (admin only)"""
    try:
        success = TriageRuleService.delete_rule(db, rule_id)
        if not success:
            raise HTTPException(status_code=404, detail="Rule not found")
        
        return {"message": "Rule deleted successfully"}
    except DatabaseError as e:
        raise HTTPException(status_code=500, detail=str(e))
