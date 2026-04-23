from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..core.clinical_control.case_core import CaseService, TriageService
from ..core.clinical_control.contracts import (
    AdminTriageCaseResponse,
    CaseNoteCreateRequest,
    CasePriorityOverrideRequest,
    CaseRoutingOverrideRequest,
    CaseStatusUpdateRequest,
    CaseTimelineResponse,
)
from ..core.database import get_db
from ..core.exceptions import DatabaseError, ValidationError

router = APIRouter(prefix="/admin", tags=["Admin Triage"])


@router.get("/triage", response_model=list[AdminTriageCaseResponse])
def get_triage_cases(
    limit: int = Query(100, ge=1, le=250),
    db: Session = Depends(get_db),
):
    return TriageService.get_admin_triage_cases(db, limit)


@router.get("/triage/{submission_id}", response_model=AdminTriageCaseResponse)
def get_triage_case(submission_id: int, db: Session = Depends(get_db)):
    try:
        return TriageService.get_admin_triage_case_by_id(db, submission_id)
    except ValidationError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except DatabaseError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/triage/{submission_id}/timeline", response_model=CaseTimelineResponse)
def get_triage_case_timeline(submission_id: int, db: Session = Depends(get_db)):
    try:
        return CaseService.get_case_timeline(db, submission_id)
    except ValidationError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except DatabaseError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/triage/{submission_id}/status", response_model=AdminTriageCaseResponse)
def update_triage_case_status(
    submission_id: int,
    payload: CaseStatusUpdateRequest,
    db: Session = Depends(get_db),
):
    try:
        submission = CaseService.update_case_status(db, submission_id, payload.new_status, payload.user_id)
        return TriageService.get_admin_triage_case_by_id(db, submission.id)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except DatabaseError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/triage/{submission_id}/override-priority", response_model=AdminTriageCaseResponse)
def override_triage_case_priority(
    submission_id: int,
    payload: CasePriorityOverrideRequest,
    db: Session = Depends(get_db),
):
    try:
        submission = CaseService.override_priority(
            db,
            submission_id,
            payload.new_score,
            payload.reason,
            payload.user_id,
        )
        return TriageService.get_admin_triage_case_by_id(db, submission.id)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except DatabaseError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/triage/{submission_id}/override-routing", response_model=AdminTriageCaseResponse)
def override_triage_case_routing(
    submission_id: int,
    payload: CaseRoutingOverrideRequest,
    db: Session = Depends(get_db),
):
    try:
        submission = CaseService.override_routing(
            db,
            submission_id,
            payload.new_category,
            payload.reason,
            payload.user_id,
        )
        return TriageService.get_admin_triage_case_by_id(db, submission.id)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except DatabaseError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/triage/{submission_id}/notes", response_model=CaseTimelineResponse)
def add_triage_case_note(
    submission_id: int,
    payload: CaseNoteCreateRequest,
    db: Session = Depends(get_db),
):
    try:
        CaseService.add_case_note(db, submission_id, payload.note, payload.user_id)
        return CaseService.get_case_timeline(db, submission_id)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except DatabaseError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
