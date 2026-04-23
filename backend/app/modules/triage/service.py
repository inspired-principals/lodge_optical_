from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import List, Tuple, Optional
from uuid import UUID

from ...core.clinical_control.contracts import AdminTriageCaseResponse, TriageSubmissionRequest
from ...core.clinical_control.decision_engine import TriageAIService, TriageRoutingService
from .models import TriageSession, TriageRule, TriageSubmission
from .schemas import TriageRequest, TriageResponse, TriageRuleRequest
from .case_service import CaseService
from ...engine.decision_engine import DecisionEngine
from ...engine.schemas import TriageInput
from ...modules.patient.service import PatientService
from ...core.exceptions import ValidationError, TriageEngineError, DatabaseError
from ...core.logging import get_logger

logger = get_logger(__name__)


class TriageService:
    @staticmethod
    def _sanitize_submission_snapshot(submission: TriageSubmissionRequest) -> dict:
        snapshot = submission.model_dump()
        patient = snapshot.get("patient", {})
        email = patient.get("email")
        phone = patient.get("phone")
        full_name = patient.get("full_name", "")
        patient["email"] = f"***@{email.split('@', 1)[1]}" if isinstance(email, str) and "@" in email else None
        patient["phone"] = f"***{phone[-4:]}" if isinstance(phone, str) and len(phone) >= 4 else None
        patient["full_name"] = full_name[:1] + "***" if full_name else ""
        snapshot["patient"] = patient
        return snapshot

    @staticmethod
    def _build_admin_triage_case(triage_case: TriageSubmission, patient) -> AdminTriageCaseResponse:
        return AdminTriageCaseResponse(
            submission_id=triage_case.id,
            patient_id=patient.id,
            patient_name=patient.full_name,
            patient_email=patient.email,
            patient_phone=patient.phone,
            submitted_at=triage_case.submitted_at,
            severity_score=float(triage_case.severity_score),
            risk_level=triage_case.risk_level,
            recommended_specialty=triage_case.recommended_specialty,
            urgency_days=triage_case.urgency_days,
            symptoms=triage_case.symptoms or [],
            history=triage_case.history or "",
            notes=triage_case.notes or "",
            clinical_notes=triage_case.clinical_notes or [],
            ai_summary=triage_case.ai_summary or "",
            ai_risk_level=triage_case.ai_risk_level,
            ai_confidence=float(triage_case.ai_confidence) if triage_case.ai_confidence is not None else None,
            ai_flags=triage_case.ai_flags or [],
            ai_version=triage_case.ai_version,
            priority_score=triage_case.priority_score,
            priority_level=triage_case.priority_level,
            routing_category=triage_case.routing_category,
            next_action=triage_case.next_action,
            recommended_window=triage_case.recommended_window,
            case_status=triage_case.case_status,
        )

    @staticmethod
    def submit_triage_case(db: Session, submission: TriageSubmissionRequest) -> AdminTriageCaseResponse:
        """Persist a public digital triage submission."""
        try:
            sanitized_snapshot = TriageService._sanitize_submission_snapshot(submission)
            patient = PatientService.get_or_create_triage_patient(
                db=db,
                full_name=submission.patient.full_name,
                email=submission.patient.email,
                phone=submission.patient.phone,
            )

            triage_case = TriageSubmission(
                tenant_id="default",
                patient_id=patient.id,
                symptoms=submission.triage.symptoms,
                history=submission.triage.history,
                severity_score=submission.triage.severity_score,
                notes=submission.triage.notes,
                risk_level=submission.triage.risk_level,
                recommended_specialty=submission.triage.recommended_specialty,
                urgency_days=submission.triage.urgency_days,
                clinical_notes=submission.triage.clinical_notes,
                diagnostic_results=submission.triage.diagnostic_results,
                ai_summary="",
                ai_flags=[],
                ai_version=None,
                updated_by="system",
            )

            db.add(triage_case)
            db.flush()

            ai_result = None
            try:
                ai_result = TriageAIService.interpret_submission(submission)
                triage_case.ai_summary = ai_result.summary
                triage_case.ai_risk_level = ai_result.risk_level
                triage_case.ai_confidence = Decimal(str(ai_result.confidence)) if ai_result.confidence is not None else None
                triage_case.ai_flags = ai_result.flags
                triage_case.ai_version = ai_result.version
            except Exception as ai_error:
                logger.error(
                    "AI interpretation failed for triage submission",
                    extra={
                        "submission_id": triage_case.id,
                        "input_snapshot": sanitized_snapshot,
                        "ai_version": "v1_rules",
                        "error": str(ai_error),
                    },
                )

            routing_result = TriageRoutingService.route_submission(submission, ai_result)
            triage_case.priority_score = routing_result.priority_score
            triage_case.priority_level = routing_result.priority_level
            triage_case.routing_category = routing_result.routing_category
            triage_case.next_action = routing_result.next_action
            triage_case.recommended_window = routing_result.recommended_window
            CaseService.create_system_case_actions(
                db=db,
                submission=triage_case,
                note=(
                    f"AI {triage_case.ai_risk_level or 'unavailable'} | "
                    f"route {triage_case.routing_category or 'general_optical'} | "
                    f"priority {triage_case.priority_score if triage_case.priority_score is not None else 'unassigned'}"
                ),
            )

            db.commit()
            db.refresh(triage_case)
            db.refresh(patient)

            logger.info(
                "Triage submission persisted",
                extra={
                    "submission_id": triage_case.id,
                    "patient_id": patient.id,
                    "input_snapshot": sanitized_snapshot,
                    "ai_output": {
                        "summary": triage_case.ai_summary,
                        "risk_level": triage_case.ai_risk_level,
                        "confidence": float(triage_case.ai_confidence) if triage_case.ai_confidence is not None else None,
                        "flags": triage_case.ai_flags or [],
                        "version": triage_case.ai_version,
                    },
                    "ai_version": triage_case.ai_version,
                    "routing_output": {
                        "priority_score": triage_case.priority_score,
                        "priority_level": triage_case.priority_level,
                        "routing_category": triage_case.routing_category,
                        "next_action": triage_case.next_action,
                        "recommended_window": triage_case.recommended_window,
                    },
                },
            )

            return TriageService._build_admin_triage_case(triage_case, patient)
        except Exception as e:
            db.rollback()
            logger.error(
                "Failed to submit triage case",
                extra={"error": str(e)},
            )
            raise DatabaseError(f"Failed to submit triage case: {str(e)}")

    @staticmethod
    def get_admin_triage_cases(db: Session, limit: int = 100) -> List[AdminTriageCaseResponse]:
        """Return recent triage submissions for admin visibility."""
        submissions = (
            db.query(TriageSubmission)
            .order_by(
                desc(TriageSubmission.priority_score).nullslast(),
                desc(TriageSubmission.submitted_at),
            )
            .limit(limit)
            .all()
        )

        cases: List[AdminTriageCaseResponse] = []
        for submission in submissions:
            patient = PatientService.get_patient_by_id(db, submission.patient_id)
            if not patient:
                continue
            cases.append(TriageService._build_admin_triage_case(submission, patient))

        return cases

    @staticmethod
    def get_admin_triage_case_by_id(db: Session, submission_id: int) -> AdminTriageCaseResponse:
        submission = (
            db.query(TriageSubmission)
            .filter(TriageSubmission.id == submission_id)
            .first()
        )
        if not submission:
            raise ValidationError("Triage submission not found")

        patient = PatientService.get_patient_by_id(db, submission.patient_id)
        if not patient:
            raise ValidationError("Patient not found for triage submission")

        return TriageService._build_admin_triage_case(submission, patient)

    @staticmethod
    def process_triage(db: Session, triage_request: TriageRequest, user_id: int) -> TriageResponse:
        """Process triage request and store results"""
        try:
            # Validate patient exists
            patient = PatientService.get_patient_by_id(db, triage_request.patient_id)
            if not patient:
                raise ValidationError("Patient not found")
            
            # Convert request to engine input
            triage_input = TriageInput(**triage_request.dict())
            
            # Process through decision engine
            engine = DecisionEngine(db)
            result = engine.process_triage(triage_input)
            
            # Store triage session
            session = TriageSession(
                id=result.session_id,
                patient_id=triage_request.patient_id,
                user_id=user_id,
                input_data=triage_request.dict(),
                risk_score=result.risk_score,
                risk_level=result.risk_level,
                recommendations=result.recommendations,
                reasoning=result.reasoning,
                confidence_score=result.confidence_score,
                engine_version=result.engine_version,
                rules_applied=result.rules_applied
            )
            
            db.add(session)
            db.commit()
            db.refresh(session)
            
            logger.info(f"Triage session created: {session.id} for patient {patient.full_name}")
            
            return TriageResponse(**result.dict())
            
        except ValidationError:
            raise
        except TriageEngineError:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Triage processing failed: {str(e)}")
            raise DatabaseError(f"Failed to process triage: {str(e)}")
    
    @staticmethod
    def get_triage_session(db: Session, session_id: UUID) -> Optional[TriageSession]:
        """Get triage session by ID"""
        return db.query(TriageSession).filter(TriageSession.id == session_id).first()
    
    @staticmethod
    def get_patient_triage_history(
        db: Session, 
        patient_id: int, 
        page: int = 1, 
        limit: int = 20
    ) -> Tuple[List[TriageSession], int]:
        """Get triage history for a patient"""
        query = db.query(TriageSession).filter(TriageSession.patient_id == patient_id)
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        offset = (page - 1) * limit
        sessions = query.order_by(desc(TriageSession.created_at)).offset(offset).limit(limit).all()
        
        return sessions, total
    
    @staticmethod
    def get_recent_triage_sessions(
        db: Session, 
        page: int = 1, 
        limit: int = 50
    ) -> Tuple[List[TriageSession], int]:
        """Get recent triage sessions across all patients"""
        query = db.query(TriageSession)
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        offset = (page - 1) * limit
        sessions = query.order_by(desc(TriageSession.created_at)).offset(offset).limit(limit).all()
        
        return sessions, total


class TriageRuleService:
    @staticmethod
    def create_rule(db: Session, rule_data: TriageRuleRequest, created_by_user_id: int) -> TriageRule:
        """Create a new triage rule"""
        try:
            # Check if rule with same name and version exists
            existing = db.query(TriageRule).filter(
                and_(
                    TriageRule.name == rule_data.name,
                    TriageRule.version == rule_data.version
                )
            ).first()
            
            if existing:
                raise ValidationError("Rule with this name and version already exists")
            
            rule = TriageRule(
                name=rule_data.name,
                version=rule_data.version,
                conditions=rule_data.conditions,
                actions=rule_data.actions,
                priority=rule_data.priority,
                is_active=rule_data.is_active,
                created_by=created_by_user_id
            )
            
            db.add(rule)
            db.commit()
            db.refresh(rule)
            
            logger.info(f"Triage rule created: {rule.name} v{rule.version}")
            return rule
            
        except ValidationError:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create triage rule: {str(e)}")
            raise DatabaseError(f"Failed to create rule: {str(e)}")
    
    @staticmethod
    def get_all_rules(db: Session, active_only: bool = False) -> List[TriageRule]:
        """Get all triage rules"""
        query = db.query(TriageRule)
        
        if active_only:
            query = query.filter(TriageRule.is_active == True)
        
        return query.order_by(desc(TriageRule.priority), TriageRule.name).all()
    
    @staticmethod
    def get_rule_by_id(db: Session, rule_id: int) -> Optional[TriageRule]:
        """Get triage rule by ID"""
        return db.query(TriageRule).filter(TriageRule.id == rule_id).first()
    
    @staticmethod
    def update_rule_status(db: Session, rule_id: int, is_active: bool) -> Optional[TriageRule]:
        """Update rule active status"""
        try:
            rule = db.query(TriageRule).filter(TriageRule.id == rule_id).first()
            if not rule:
                return None
            
            rule.is_active = is_active
            db.commit()
            db.refresh(rule)
            
            logger.info(f"Rule {rule.name} status updated to {'active' if is_active else 'inactive'}")
            return rule
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update rule status: {str(e)}")
            raise DatabaseError(f"Failed to update rule: {str(e)}")
    
    @staticmethod
    def delete_rule(db: Session, rule_id: int) -> bool:
        """Delete triage rule"""
        try:
            rule = db.query(TriageRule).filter(TriageRule.id == rule_id).first()
            if not rule:
                return False
            
            db.delete(rule)
            db.commit()
            
            logger.info(f"Triage rule deleted: {rule.name}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete rule: {str(e)}")
            raise DatabaseError(f"Failed to delete rule: {str(e)}")
