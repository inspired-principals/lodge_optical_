from __future__ import annotations

from ..contracts.cases import (
    CaseRecord,
    CaseTimeline,
    CreateCaseNoteRequest,
    PatchCasePriorityRequest,
    PatchCaseRoutingRequest,
    PatchCaseStatusRequest,
)
from ..contracts.common import TenantContext
from .ports import ClinicalControlCasePort


class ClinicalControlCaseApplicationService:
    def __init__(self, port: ClinicalControlCasePort):
        self.port = port

    def list_cases(self, ctx: TenantContext, limit: int = 100) -> list[CaseRecord]:
        return self.port.list_cases(ctx, limit)

    def get_case(self, case_id: int, ctx: TenantContext) -> CaseRecord:
        return self.port.get_case(case_id, ctx)

    def get_timeline(self, case_id: int, ctx: TenantContext) -> CaseTimeline:
        return self.port.get_timeline(case_id, ctx)

    def update_status(self, case_id: int, payload: PatchCaseStatusRequest, ctx: TenantContext) -> CaseRecord:
        return self.port.update_status(case_id, payload.new_status, payload.row_version, ctx)

    def override_priority(self, case_id: int, payload: PatchCasePriorityRequest, ctx: TenantContext) -> CaseRecord:
        return self.port.override_priority(case_id, payload.new_score, payload.reason, payload.row_version, ctx)

    def override_routing(self, case_id: int, payload: PatchCaseRoutingRequest, ctx: TenantContext) -> CaseRecord:
        return self.port.override_routing(case_id, payload.new_category, payload.reason, payload.row_version, ctx)

    def add_note(self, case_id: int, payload: CreateCaseNoteRequest, ctx: TenantContext) -> CaseTimeline:
        return self.port.add_note(case_id, payload.note, ctx)
