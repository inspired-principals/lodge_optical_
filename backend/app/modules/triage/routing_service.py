from __future__ import annotations

from .submission_schemas import TriageAIResult, TriageRoutingResult, TriageSubmissionRequest


class TriageRoutingService:
    """Deterministic routing and queue priority rules for triage submissions."""

    FLAG_CATEGORY_PRIORITY = (
        ("keratoconus_possible", "corneal_specialty"),
        ("post_surgical", "post_surgical_followup"),
        ("dry_eye_risk", "dry_eye_specialty"),
    )
    CRITICAL_FLAGS = {"acute_change", "ocular_trauma_history"}

    @staticmethod
    def route_submission(
        submission: TriageSubmissionRequest,
        ai_result: TriageAIResult | None,
    ) -> TriageRoutingResult:
        priority_score = TriageRoutingService._compute_priority_score(
            severity_score=submission.triage.severity_score,
            ai_risk_level=ai_result.risk_level if ai_result else None,
            ai_flags=ai_result.flags if ai_result else [],
        )
        priority_level = TriageRoutingService._map_priority_level(priority_score)
        routing_category = TriageRoutingService._map_routing_category(ai_result.flags if ai_result else [])
        next_action = TriageRoutingService._map_next_action(priority_level)
        recommended_window = TriageRoutingService._map_recommended_window(priority_level)

        return TriageRoutingResult(
            priority_score=priority_score,
            priority_level=priority_level,
            routing_category=routing_category,
            next_action=next_action,
            recommended_window=recommended_window,
        )

    @staticmethod
    def _compute_priority_score(
        severity_score: float,
        ai_risk_level: str | None,
        ai_flags: list[str],
    ) -> int:
        score = int(round(severity_score))

        if ai_risk_level == "urgent":
            score += 20
        elif ai_risk_level == "high":
            score += 10

        score += sum(5 for flag in ai_flags if flag in TriageRoutingService.CRITICAL_FLAGS)
        return max(0, min(score, 100))

    @staticmethod
    def _map_priority_level(priority_score: int) -> str:
        if priority_score >= 80:
            return "urgent"
        if priority_score >= 60:
            return "high"
        if priority_score >= 30:
            return "moderate"
        return "low"

    @staticmethod
    def _map_routing_category(ai_flags: list[str]) -> str:
        for flag, category in TriageRoutingService.FLAG_CATEGORY_PRIORITY:
            if flag in ai_flags:
                return category
        return "general_optical"

    @staticmethod
    def _map_next_action(priority_level: str) -> str:
        return {
            "urgent": "schedule_immediate_consult",
            "high": "priority_booking",
            "moderate": "standard_intake_review",
            "low": "routine_followup",
        }[priority_level]

    @staticmethod
    def _map_recommended_window(priority_level: str) -> str:
        return {
            "urgent": "0-24h",
            "high": "24-72h",
            "moderate": "3-7 days",
            "low": "1-2 weeks",
        }[priority_level]
