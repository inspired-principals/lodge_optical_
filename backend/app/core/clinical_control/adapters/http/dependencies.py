from __future__ import annotations

from fastapi import Depends, Header, Request
from sqlalchemy.orm import Session

from ....database import get_db
from ...application import ClinicalControlCaseApplicationService
from ...contracts.common import TenantContext
from ...infrastructure import SqlAlchemyClinicalControlCaseRepository


def get_tenant_context(
    request: Request,
    x_tenant_id: str = Header(default="default"),
    x_user_id: str = Header(default="system"),
    x_role: str = Header(default="system"),
):
    request_id = request.headers.get("x-request-id", "clinical-control-request")
    return TenantContext(
        tenant_id=x_tenant_id,
        user_id=x_user_id,
        role=x_role,
        request_id=request_id,
    )


def get_case_application_service(db: Session = Depends(get_db)) -> ClinicalControlCaseApplicationService:
    return ClinicalControlCaseApplicationService(SqlAlchemyClinicalControlCaseRepository(db))
