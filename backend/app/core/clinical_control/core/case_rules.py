from __future__ import annotations

from datetime import datetime, timedelta, timezone


ALLOWED_STATUS_TRANSITIONS = {
    "NEW": {"REVIEWED"},
    "REVIEWED": {"CONTACTED", "ESCALATED"},
    "CONTACTED": {"BOOKED", "NO_RESPONSE"},
    "BOOKED": {"CLOSED", "CANCELLED"},
}


def validate_status_transition(current_status: str, new_status: str) -> None:
    if current_status == new_status:
        raise ValueError("Case is already in the requested status")
    if new_status not in ALLOWED_STATUS_TRANSITIONS.get(current_status, set()):
        raise ValueError(f"Invalid case status transition: {current_status} -> {new_status}")


def evaluate_case_health(
    *,
    priority_score: int | None,
    case_status: str,
    status_updated_at: datetime | None,
    latest_action_at: datetime | None,
    override_count: int = 0,
) -> dict:
    issues: list[str] = []
    now = datetime.now(timezone.utc)

    if priority_score and priority_score > 80 and case_status == "NEW" and status_updated_at:
        status_time = status_updated_at if status_updated_at.tzinfo else status_updated_at.replace(tzinfo=timezone.utc)
        if (now - status_time) > timedelta(hours=4):
            issues.append("high_priority_unhandled")

    if latest_action_at:
        action_time = latest_action_at if latest_action_at.tzinfo else latest_action_at.replace(tzinfo=timezone.utc)
        if (now - action_time) > timedelta(hours=48):
            issues.append("stalled_case")

    if override_count > 1:
        issues.append("overridden_multiple_times")

    if any(issue in issues for issue in ("high_priority_unhandled", "stalled_case")):
        status = "critical"
    elif issues:
        status = "warning"
    else:
        status = "stable"

    return {"status": status, "flags": issues}
