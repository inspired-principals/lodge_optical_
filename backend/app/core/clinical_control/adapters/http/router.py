from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from ....exceptions import ConcurrencyConflictError, DatabaseError, TenantIsolationViolationError, ValidationError
from ...application import ClinicalControlCaseApplicationService
from ...contracts.cases import (
    CaseRecord,
    CaseTimeline,
    CreateCaseNoteRequest,
    PatchCasePriorityRequest,
    PatchCaseRoutingRequest,
    PatchCaseStatusRequest,
)
from ...contracts.common import ResponseAudit, ResponseEnvelope, ResponseMeta, TenantContext
from .dependencies import get_case_application_service, get_tenant_context

router = APIRouter(prefix="/clinical-control", tags=["Clinical Control"])


def _envelope(data, ctx: TenantContext):
    return ResponseEnvelope(
        meta=ResponseMeta(tenant_id=ctx.tenant_id, request_id=ctx.request_id, version="v1"),
        data=data,
        audit=ResponseAudit(trace_id=ctx.request_id),
    )


@router.get("/cases")
def list_cases(
    limit: int = Query(100, ge=1, le=250),
    ctx: TenantContext = Depends(get_tenant_context),
    service: ClinicalControlCaseApplicationService = Depends(get_case_application_service),
):
    return _envelope(service.list_cases(ctx, limit), ctx)


@router.get("/cases/{case_id}")
def get_case(
    case_id: int,
    ctx: TenantContext = Depends(get_tenant_context),
    service: ClinicalControlCaseApplicationService = Depends(get_case_application_service),
):
    try:
        return _envelope(service.get_case(case_id, ctx), ctx)
    except TenantIsolationViolationError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except ValidationError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/cases/{case_id}/timeline")
def get_case_timeline(
    case_id: int,
    ctx: TenantContext = Depends(get_tenant_context),
    service: ClinicalControlCaseApplicationService = Depends(get_case_application_service),
):
    try:
        return _envelope(service.get_timeline(case_id, ctx), ctx)
    except TenantIsolationViolationError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except ValidationError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.patch("/cases/{case_id}/status")
def patch_case_status(
    case_id: int,
    payload: PatchCaseStatusRequest,
    ctx: TenantContext = Depends(get_tenant_context),
    service: ClinicalControlCaseApplicationService = Depends(get_case_application_service),
):
    try:
        return _envelope(service.update_status(case_id, payload, ctx), ctx)
    except TenantIsolationViolationError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except ConcurrencyConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc))
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@router.patch("/cases/{case_id}/priority")
def patch_case_priority(
    case_id: int,
    payload: PatchCasePriorityRequest,
    ctx: TenantContext = Depends(get_tenant_context),
    service: ClinicalControlCaseApplicationService = Depends(get_case_application_service),
):
    try:
        return _envelope(service.override_priority(case_id, payload, ctx), ctx)
    except TenantIsolationViolationError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except ConcurrencyConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc))
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@router.patch("/cases/{case_id}/routing")
def patch_case_routing(
    case_id: int,
    payload: PatchCaseRoutingRequest,
    ctx: TenantContext = Depends(get_tenant_context),
    service: ClinicalControlCaseApplicationService = Depends(get_case_application_service),
):
    try:
        return _envelope(service.override_routing(case_id, payload, ctx), ctx)
    except TenantIsolationViolationError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except ConcurrencyConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc))
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@router.post("/cases/{case_id}/notes")
def post_case_note(
    case_id: int,
    payload: CreateCaseNoteRequest,
    ctx: TenantContext = Depends(get_tenant_context),
    service: ClinicalControlCaseApplicationService = Depends(get_case_application_service),
):
    try:
        return _envelope(service.add_note(case_id, payload, ctx), ctx)
    except TenantIsolationViolationError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
