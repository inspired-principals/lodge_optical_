from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from .models import CaseAction, TriageSubmission
from ...core.exceptions import DatabaseError, ValidationError
from ...core.logging import get_logger

logger = get_logger(__name__)


STATUS_NEW = "NEW"
STATUS_REVIEWED = "REVIEWED"
STATUS_CONTACTED = "CONTACTED"
STATUS_ESCALATED = "ESCALATED"
STATUS_BOOKED = "BOOKED"
STATUS_NO_RESPONSE = "NO_RESPONSE"
STATUS_CLOSED = "CLOSED"
STATUS_CANCELLED = "CANCELLED"

ACTION_STATUS_CHANGE = "status_change"
ACTION_OVERRIDE_PRIORITY = "override_priority"
ACTION_OVERRIDE_ROUTING = "override_routing"
ACTION_NOTE = "note"
PERFORMED_BY_SYSTEM = "system"

ALLOWED_STATUS_TRANSITIONS = {
    STATUS_NEW: {STATUS_REVIEWED},
    STATUS_REVIEWED: {STATUS_CONTACTED, STATUS_ESCALATED},
    STATUS_CONTACTED: {STATUS_BOOKED, STATUS_NO_RESPONSE},
    STATUS_BOOKED: {STATUS_CLOSED, STATUS_CANCELLED},
}


class CaseService:
    @staticmethod
    def _as_utc(value: datetime | None) -> datetime | None:
        if value is None:
            return None
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)

    @staticmethod
    def get_case_timeline(db: Session, submission_id: int) -> dict:
        submission = CaseService._get_submission(db, submission_id)

        return {
            "submission_id": submission.id,
            "current_status": submission.case_status,
            "priority_score": submission.priority_score,
            "routing_category": submission.routing_category,
            "timeline": [
                {
                    "action_type": action.action_type,
                    "performed_by": action.performed_by,
                    "previous_value": action.previous_value,
                    "new_value": action.new_value,
                    "created_at": action.created_at,
                }
                for action in sorted(submission.actions, key=lambda item: item.created_at)
            ],
        }

    @staticmethod
    def get_override_stats(db: Session) -> dict:
        total_actions = db.query(CaseAction).count()
        override_count = (
            db.query(CaseAction)
            .filter(CaseAction.action_type.in_([ACTION_OVERRIDE_PRIORITY, ACTION_OVERRIDE_ROUTING]))
            .count()
        )

        return {
            "total_actions": total_actions,
            "override_count": override_count,
            "override_rate": (override_count / total_actions) if total_actions else 0,
        }

    @staticmethod
    def get_avg_time_in_status(db: Session) -> dict:
        actions = (
            db.query(CaseAction)
            .filter(CaseAction.action_type == ACTION_STATUS_CHANGE)
            .order_by(CaseAction.submission_id, CaseAction.created_at)
            .all()
        )

        durations = defaultdict(list)
        last_seen = {}

        for action in actions:
            key = action.submission_id

            if key in last_seen:
                previous = last_seen[key]
                delta = (action.created_at - previous["time"]).total_seconds()
                durations[previous["status"]].append(delta)

            last_seen[key] = {
                "status": action.new_value,
                "time": action.created_at,
            }

        return {
            status: sum(times) / len(times)
            for status, times in durations.items()
            if times
        }

    @staticmethod
    def get_ai_disagreement_rate(db: Session) -> dict:
        overrides = (
            db.query(CaseAction)
            .filter(CaseAction.action_type.in_([ACTION_OVERRIDE_PRIORITY, ACTION_OVERRIDE_ROUTING]))
            .count()
        )
        ai_actions = db.query(CaseAction).filter(CaseAction.performed_by == PERFORMED_BY_SYSTEM).count()

        return {
            "ai_actions": ai_actions,
            "overrides": overrides,
            "disagreement_rate": overrides / ai_actions if ai_actions else 0,
        }

    @staticmethod
    def evaluate_case_health(submission: TriageSubmission) -> list[str]:
        issues: list[str] = []
        now = datetime.now(timezone.utc)

        if submission.priority_score and submission.priority_score > 80 and submission.case_status == STATUS_NEW:
            status_updated_at = CaseService._as_utc(submission.status_updated_at)
            if status_updated_at and (now - status_updated_at) > timedelta(hours=4):
                issues.append("high_priority_unhandled")

        latest_action_at = CaseService._as_utc(submission.submitted_at)
        if submission.actions:
            latest_action_at = max(
                (CaseService._as_utc(action.created_at) for action in submission.actions),
                key=lambda value: value or datetime.min.replace(tzinfo=timezone.utc),
            )

        if latest_action_at and (now - latest_action_at) > timedelta(hours=48):
            issues.append("stalled_case")

        return issues

    @staticmethod
    def update_case_status(db: Session, submission_id: int, new_status: str, user_id: str) -> TriageSubmission:
        try:
            submission = CaseService._get_submission(db, submission_id)
            previous_status = submission.case_status
            CaseService._validate_status_transition(previous_status, new_status)

            submission.case_status = new_status
            submission.status_updated_at = datetime.now(timezone.utc)
            submission.row_version += 1
            submission.updated_at = datetime.now(timezone.utc)
            submission.updated_by = user_id

            db.add(
                CaseAction(
                    tenant_id=submission.tenant_id,
                    submission_id=submission.id,
                    action_type=ACTION_STATUS_CHANGE,
                    performed_by=user_id,
                    previous_value=previous_status,
                    new_value=new_status,
                )
            )
            db.commit()
            db.refresh(submission)

            logger.info(
                "Case status updated",
                extra={
                    "submission_id": submission.id,
                    "action_type": ACTION_STATUS_CHANGE,
                    "performed_by": user_id,
                    "previous_value": previous_status,
                    "new_value": new_status,
                },
            )
            return submission
        except ValidationError:
            raise
        except Exception as exc:
            db.rollback()
            logger.error(
                "Failed to update case status",
                extra={"submission_id": submission_id, "new_status": new_status, "error": str(exc)},
            )
            raise DatabaseError(f"Failed to update case status: {str(exc)}")

    @staticmethod
    def override_priority(
        db: Session,
        submission_id: int,
        new_score: int,
        reason: str,
        user_id: str,
    ) -> TriageSubmission:
        if new_score < 0 or new_score > 100:
            raise ValidationError("Priority score must be between 0 and 100")
        if not reason or not reason.strip():
            raise ValidationError("Override reason is required")

        try:
            submission = CaseService._get_submission(db, submission_id)
            previous_score = str(submission.priority_score) if submission.priority_score is not None else None

            submission.priority_score = new_score
            submission.priority_overridden = True
            submission.override_reason = reason.strip()
            submission.row_version += 1
            submission.updated_at = datetime.now(timezone.utc)
            submission.updated_by = user_id

            db.add(
                CaseAction(
                    tenant_id=submission.tenant_id,
                    submission_id=submission.id,
                    action_type=ACTION_OVERRIDE_PRIORITY,
                    performed_by=user_id,
                    previous_value=previous_score,
                    new_value=str(new_score),
                )
            )
            db.commit()
            db.refresh(submission)

            logger.info(
                "Case priority overridden",
                extra={
                    "submission_id": submission.id,
                    "action_type": ACTION_OVERRIDE_PRIORITY,
                    "performed_by": user_id,
                    "previous_value": previous_score,
                    "new_value": str(new_score),
                    "override_reason": submission.override_reason,
                },
            )
            return submission
        except ValidationError:
            raise
        except Exception as exc:
            db.rollback()
            logger.error(
                "Failed to override case priority",
                extra={"submission_id": submission_id, "new_score": new_score, "error": str(exc)},
            )
            raise DatabaseError(f"Failed to override case priority: {str(exc)}")

    @staticmethod
    def override_routing(
        db: Session,
        submission_id: int,
        new_category: str,
        reason: str,
        user_id: str,
    ) -> TriageSubmission:
        if not new_category or not new_category.strip():
            raise ValidationError("Routing category is required")
        if not reason or not reason.strip():
            raise ValidationError("Override reason is required")

        try:
            submission = CaseService._get_submission(db, submission_id)
            previous_category = submission.routing_category

            submission.routing_category = new_category.strip()
            submission.routing_overridden = True
            submission.override_reason = reason.strip()
            submission.row_version += 1
            submission.updated_at = datetime.now(timezone.utc)
            submission.updated_by = user_id

            db.add(
                CaseAction(
                    tenant_id=submission.tenant_id,
                    submission_id=submission.id,
                    action_type=ACTION_OVERRIDE_ROUTING,
                    performed_by=user_id,
                    previous_value=previous_category,
                    new_value=submission.routing_category,
                )
            )
            db.commit()
            db.refresh(submission)

            logger.info(
                "Case routing overridden",
                extra={
                    "submission_id": submission.id,
                    "action_type": ACTION_OVERRIDE_ROUTING,
                    "performed_by": user_id,
                    "previous_value": previous_category,
                    "new_value": submission.routing_category,
                    "override_reason": submission.override_reason,
                },
            )
            return submission
        except ValidationError:
            raise
        except Exception as exc:
            db.rollback()
            logger.error(
                "Failed to override case routing",
                extra={"submission_id": submission_id, "new_category": new_category, "error": str(exc)},
            )
            raise DatabaseError(f"Failed to override case routing: {str(exc)}")

    @staticmethod
    def add_case_note(db: Session, submission_id: int, note: str, user_id: str) -> CaseAction:
        if not note or not note.strip():
            raise ValidationError("Note is required")

        try:
            submission = CaseService._get_submission(db, submission_id)
            action = CaseAction(
                tenant_id=submission.tenant_id,
                submission_id=submission.id,
                action_type=ACTION_NOTE,
                performed_by=user_id,
                previous_value=None,
                new_value=note.strip(),
            )
            db.add(action)
            db.commit()
            db.refresh(action)

            logger.info(
                "Case note added",
                extra={
                    "submission_id": submission.id,
                    "action_type": ACTION_NOTE,
                    "performed_by": user_id,
                },
            )
            return action
        except ValidationError:
            raise
        except Exception as exc:
            db.rollback()
            logger.error(
                "Failed to add case note",
                extra={"submission_id": submission_id, "error": str(exc)},
            )
            raise DatabaseError(f"Failed to add case note: {str(exc)}")

    @staticmethod
    def create_system_case_actions(
        db: Session,
        submission: TriageSubmission,
        note: str | None = None,
    ) -> None:
        db.add(
            CaseAction(
                tenant_id=submission.tenant_id,
                submission_id=submission.id,
                action_type=ACTION_STATUS_CHANGE,
                performed_by=PERFORMED_BY_SYSTEM,
                previous_value=None,
                new_value=submission.case_status,
            )
        )

        if note:
            db.add(
                CaseAction(
                    tenant_id=submission.tenant_id,
                    submission_id=submission.id,
                    action_type=ACTION_NOTE,
                    performed_by=PERFORMED_BY_SYSTEM,
                    previous_value=None,
                    new_value=note,
                )
            )

    @staticmethod
    def _get_submission(db: Session, submission_id: int) -> TriageSubmission:
        submission = db.query(TriageSubmission).filter(TriageSubmission.id == submission_id).first()
        if not submission:
            raise ValidationError("Triage submission not found")
        return submission

    @staticmethod
    def _validate_status_transition(current_status: str, new_status: str) -> None:
        if current_status == new_status:
            raise ValidationError("Case is already in the requested status")

        allowed_statuses = ALLOWED_STATUS_TRANSITIONS.get(current_status, set())
        if new_status not in allowed_statuses:
            raise ValidationError(
                f"Invalid case status transition: {current_status} -> {new_status}"
            )
