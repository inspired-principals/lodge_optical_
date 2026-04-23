from __future__ import annotations

from typing import List

from .submission_schemas import TriageAIResult, TriageSubmissionRequest
from ...core.logging import get_logger

logger = get_logger(__name__)
AI_VERSION = "v1_rules"


TRIAGE_INTERPRETATION_PROMPT = """
You are a clinical triage interpretation layer for ophthalmic intake.
Input fields: symptoms, history, notes, severity_score, clinical_notes, diagnostic_results.
Return JSON only with this exact shape:
{
  "summary": "brief neutral operational summary",
  "risk_level": "low|moderate|high|urgent",
  "confidence": 0.0,
  "flags": ["signal_flag"],
  "version": "v1_rules"
}
Rules:
- Do not diagnose.
- Do not recommend treatment.
- Focus on severity, complexity, and routing signals.
- Keep summary factual and under 220 characters.
- Flags must be short snake_case tokens.
""".strip()


class TriageAIService:
    """Deterministic triage interpretation service with an LLM-ready interface."""

    @staticmethod
    def interpret_submission(submission: TriageSubmissionRequest) -> TriageAIResult:
        triage = submission.triage
        symptoms = [symptom.lower() for symptom in triage.symptoms]
        history = triage.history.lower()
        notes = triage.notes.lower()
        clinical_notes = [note.lower() for note in triage.clinical_notes]
        combined_text = " ".join(symptoms + [history, notes] + clinical_notes)
        diagnostic_results = triage.diagnostic_results or {}

        flags = TriageAIService._extract_flags(
            symptoms=symptoms,
            combined_text=combined_text,
            diagnostic_results=diagnostic_results,
        )
        risk_level = TriageAIService._classify_risk_level(
            severity_score=triage.severity_score,
            flags=flags,
            combined_text=combined_text,
        )
        heuristic_confidence = TriageAIService._estimate_confidence(
            symptom_count=len(symptoms),
            has_history=bool(triage.history.strip()),
            has_notes=bool(triage.notes.strip()),
            has_diagnostics=bool(diagnostic_results),
        )
        summary = TriageAIService._build_summary(
            risk_level=risk_level,
            flags=flags,
            symptoms=symptoms,
            severity_score=triage.severity_score,
        )

        result = TriageAIResult(
            summary=summary,
            risk_level=risk_level,
            confidence=heuristic_confidence,
            flags=flags,
            version=AI_VERSION,
        )
        logger.info(
            "Triage AI interpretation generated",
            extra={
                "ai_output": result.model_dump(),
                "ai_version": AI_VERSION,
            },
        )
        return result

    @staticmethod
    def _extract_flags(
        symptoms: List[str],
        combined_text: str,
        diagnostic_results: dict,
    ) -> List[str]:
        flags: List[str] = []

        if any("dry" in symptom for symptom in symptoms) or "dry eye" in combined_text:
            flags.append("dry_eye_risk")
        if "contact lens" in combined_text or "lens intolerance" in combined_text:
            flags.append("lens_intolerance")
        if "surgery" in combined_text or diagnostic_results.get("postSurgicalRisk", 0) >= 0.5:
            flags.append("post_surgical")
        if "trauma" in combined_text:
            flags.append("ocular_trauma_history")
        if "sudden" in combined_text or "vision change" in combined_text:
            flags.append("acute_change")
        if diagnostic_results.get("keratoconusRisk", 0) >= 0.5 or "keratoconus" in combined_text:
            flags.append("keratoconus_possible")
        if diagnostic_results.get("contrastSensitivity", 0) and diagnostic_results.get("contrastSensitivity", 0) <= 0.6:
            flags.append("contrast_reduction")
        if "pain" in combined_text:
            flags.append("pain_signal")
        if "redness" in combined_text or "discharge" in combined_text:
            flags.append("surface_inflammation_signal")

        return sorted(set(flags))

    @staticmethod
    def _classify_risk_level(severity_score: float, flags: List[str], combined_text: str) -> str:
        urgent_flags = {"acute_change", "ocular_trauma_history"}
        high_flags = {"keratoconus_possible", "pain_signal", "post_surgical"}

        if severity_score >= 80 or urgent_flags.intersection(flags):
            return "urgent"
        if severity_score >= 55 or high_flags.intersection(flags):
            return "high"
        if severity_score >= 25 or flags:
            return "moderate"
        if "routine" in combined_text and severity_score < 25:
            return "low"
        return "low"

    @staticmethod
    def _estimate_confidence(
        symptom_count: int,
        has_history: bool,
        has_notes: bool,
        has_diagnostics: bool,
    ) -> float:
        confidence = 0.35
        confidence += min(symptom_count, 6) * 0.06
        confidence += 0.15 if has_history else 0.0
        confidence += 0.10 if has_notes else 0.0
        confidence += 0.14 if has_diagnostics else 0.0
        return round(min(confidence, 0.96), 2)

    @staticmethod
    def _build_summary(
        risk_level: str,
        flags: List[str],
        symptoms: List[str],
        severity_score: float,
    ) -> str:
        symptom_preview = ", ".join(symptoms[:3]) if symptoms else "limited reported symptoms"
        if flags:
            flag_preview = ", ".join(flag.replace("_", " ") for flag in flags[:2])
            return (
                f"{risk_level.capitalize()} triage pattern with {symptom_preview}; "
                f"routing signals include {flag_preview}. Severity score {severity_score:.0f}."
            )[:220]
        return (
            f"{risk_level.capitalize()} triage pattern with {symptom_preview}. "
            f"Severity score {severity_score:.0f}."
        )[:220]
