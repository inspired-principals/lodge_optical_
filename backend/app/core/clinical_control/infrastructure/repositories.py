from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from ...exceptions import ConcurrencyConflictError, TenantIsolationViolationError, ValidationError
from ...logging import get_logger
from ..case_core import CaseService
from ..contracts.cases import CaseRecord, CaseTimeline, CaseTimelineEvent
from ..contracts.common import TenantContext
from ..core.case_rules import evaluate_case_health
from ....modules.patient.service import PatientService
from ....modules.triage.models import CaseAction, TriageSubmission
from ....modules.triage.service import TriageService

logger = get_logger(__name__)


class SqlAlchemyClinicalControlCaseRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_cases(self, ctx: TenantContext, limit: int) -> list[CaseRecord]:
        submissions = (
            self.db.query(TriageSubmission)
            .filter(TriageSubmission.tenant_id == ctx.tenant_id)
            .order_by(TriageSubmission.priority_score.desc().nullslast(), TriageSubmission.submitted_at.desc())
            .limit(limit)
            .all()
        )
        return [self._map_case(submission) for submission in submissions]

    def get_case(self, case_id: int, ctx: TenantContext) -> CaseRecord:
        submission = self._get_submission(case_id, ctx)
        return self._map_case(submission)

    def get_timeline(self, case_id: int, ctx: TenantContext) -> CaseTimeline:
        submission = self._get_submission(case_id, ctx)
        return CaseTimeline(
            submission_id=submission.id,
            current_status=submission.case_status,
            priority_score=submission.priority_score,
            routing_category=submission.routing_category,
            timeline=[
                CaseTimelineEvent(
                    action_type=action.action_type,
                    performed_by=action.performed_by,
                    previous_value=action.previous_value,
                    new_value=action.new_value,
                    created_at=action.created_at,
                )
                for action in sorted(submission.actions, key=lambda item: item.created_at)
                if action.tenant_id == ctx.tenant_id
            ],
        )

    def update_status(self, case_id: int, new_status: str, row_version: int, ctx: TenantContext) -> CaseRecord:
        submission = self._get_submission(case_id, ctx)
        self._assert_row_version(submission, row_version)
        CaseService.update_case_status(self.db, submission.id, new_status, ctx.user_id)
        return self.get_case(case_id, ctx)

    def override_priority(self, case_id: int, new_score: int, reason: str, row_version: int, ctx: TenantContext) -> CaseRecord:
        submission = self._get_submission(case_id, ctx)
        self._assert_row_version(submission, row_version)
        CaseService.override_priority(self.db, submission.id, new_score, reason, ctx.user_id)
        return self.get_case(case_id, ctx)

    def override_routing(self, case_id: int, new_category: str, reason: str, row_version: int, ctx: TenantContext) -> CaseRecord:
        submission = self._get_submission(case_id, ctx)
        self._assert_row_version(submission, row_version)
        CaseService.override_routing(self.db, submission.id, new_category, reason, ctx.user_id)
        return self.get_case(case_id, ctx)

    def add_note(self, case_id: int, note: str, ctx: TenantContext) -> CaseTimeline:
        submission = self._get_submission(case_id, ctx)
        CaseService.add_case_note(self.db, submission.id, note, ctx.user_id)
        return self.get_timeline(case_id, ctx)

    def _get_submission(self, case_id: int, ctx: TenantContext) -> TriageSubmission:
        submission = (
            self.db.query(TriageSubmission)
            .filter(TriageSubmission.id == case_id, TriageSubmission.tenant_id == ctx.tenant_id)
            .first()
        )
        if submission:
            return submission

        exists_elsewhere = self.db.query(TriageSubmission).filter(TriageSubmission.id == case_id).first()
        if exists_elsewhere:
            raise TenantIsolationViolationError("Tenant isolation violation detected")
        raise ValidationError("Triage submission not found")

    @staticmethod
    def _assert_row_version(submission: TriageSubmission, row_version: int) -> None:
        if submission.row_version != row_version:
            raise ConcurrencyConflictError("Case was updated by another actor")

    def _map_case(self, submission: TriageSubmission) -> CaseRecord:
        patient = PatientService.get_patient_by_id(self.db, submission.patient_id)
        latest_action_at = submission.submitted_at
        if submission.actions:
            latest_action_at = max(action.created_at for action in submission.actions if action.tenant_id == submission.tenant_id)
        override_count = (
            self.db.query(CaseAction)
            .filter(
                CaseAction.tenant_id == submission.tenant_id,
                CaseAction.submission_id == submission.id,
                CaseAction.action_type.in_(["override_priority", "override_routing"]),
            )
            .count()
        )
        case_health = evaluate_case_health(
            priority_score=submission.priority_score,
            case_status=submission.case_status,
            status_updated_at=submission.status_updated_at,
            latest_action_at=latest_action_at,
            override_count=override_count,
        )

        return CaseRecord(
            id=submission.id,
            tenant_id=submission.tenant_id,
            patient_id=submission.patient_id,
            patient_name=patient.full_name if patient else f"Patient {submission.patient_id}",
            patient_email=patient.email if patient else None,
            patient_phone=patient.phone if patient else None,
            submitted_at=submission.submitted_at,
            severity_score=float(submission.severity_score),
            risk_level=submission.risk_level,
            recommended_specialty=submission.recommended_specialty,
            urgency_days=submission.urgency_days,
            symptoms=submission.symptoms or [],
            history=submission.history or "",
            notes=submission.notes or "",
            clinical_notes=submission.clinical_notes or [],
            ai_summary=submission.ai_summary or "",
            ai_risk_level=submission.ai_risk_level,
            ai_confidence=float(submission.ai_confidence) if submission.ai_confidence is not None else None,
            ai_flags=submission.ai_flags or [],
            ai_version=submission.ai_version,
            priority_score=submission.priority_score,
            priority_level=submission.priority_level,
            routing_category=submission.routing_category,
            next_action=submission.next_action,
            recommended_window=submission.recommended_window,
            case_status=submission.case_status,
            row_version=submission.row_version,
            updated_at=submission.updated_at,
            updated_by=submission.updated_by,
            case_health=case_health,
        )
