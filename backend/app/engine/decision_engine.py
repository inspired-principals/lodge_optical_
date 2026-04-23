from typing import Dict, Any, List
from datetime import datetime
from uuid import uuid4
from sqlalchemy.orm import Session

from .rules import RulesEngine
from .scoring import ScoringEngine
from .schemas import TriageInput, TriageResult
from ..core.logging import get_logger
from ..core.exceptions import TriageEngineError

logger = get_logger(__name__)

ENGINE_VERSION = "1.0.0"


class DecisionEngine:
    """Main triage decision engine that orchestrates rules and scoring"""
    
    def __init__(self, db: Session):
        self.db = db
        self.rules_engine = RulesEngine(db)
        self.scoring_engine = ScoringEngine()
        
    def process_triage(self, triage_input: TriageInput) -> TriageResult:
        """Process triage input and return decision result"""
        try:
            logger.info(f"Processing triage for patient {triage_input.patient_id}")
            
            # Validate input
            self._validate_input(triage_input)
            
            # Apply rules and get rule results
            rule_results = self.rules_engine.evaluate_rules(triage_input)
            
            # Calculate risk score
            risk_score = self.scoring_engine.calculate_risk_score(triage_input, rule_results)
            
            # Determine risk level
            risk_level = self.scoring_engine.determine_risk_level(risk_score)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(triage_input, rule_results, risk_level)
            
            # Generate reasoning
            reasoning = self._generate_reasoning(triage_input, rule_results, risk_score)
            
            # Calculate confidence score
            confidence_score = self.scoring_engine.calculate_confidence(triage_input, rule_results)
            
            # Get applied rule names
            rules_applied = [result["rule_name"] for result in rule_results]
            
            result = TriageResult(
                session_id=uuid4(),
                risk_score=round(risk_score, 2),
                risk_level=risk_level,
                recommendations=recommendations,
                reasoning=reasoning,
                confidence_score=round(confidence_score, 2),
                engine_version=ENGINE_VERSION,
                rules_applied=rules_applied,
                created_at=datetime.utcnow()
            )
            
            logger.info(f"Triage completed for patient {triage_input.patient_id}: {risk_level} risk (score: {risk_score})")
            return result
            
        except Exception as e:
            logger.error(f"Triage processing failed for patient {triage_input.patient_id}: {str(e)}")
            raise TriageEngineError(f"Triage processing failed: {str(e)}")
    
    def _validate_input(self, triage_input: TriageInput) -> None:
        """Validate triage input data"""
        if not triage_input.symptoms:
            raise TriageEngineError("At least one symptom is required")
        
        if triage_input.patient_id <= 0:
            raise TriageEngineError("Valid patient ID is required")
    
    def _generate_recommendations(
        self, 
        triage_input: TriageInput, 
        rule_results: List[Dict[str, Any]], 
        risk_level: str
    ) -> List[str]:
        """Generate recommendations based on triage results"""
        recommendations = []
        
        # Collect recommendations from rules
        for result in rule_results:
            if result.get("recommendations"):
                recommendations.extend(result["recommendations"])
        
        # Add standard recommendations based on risk level
        if risk_level == "critical":
            recommendations.insert(0, "Immediate emergency care required")
            recommendations.append("Call emergency services if not already done")
        elif risk_level == "high":
            recommendations.insert(0, "Urgent medical attention required within 1 hour")
            recommendations.append("Monitor vital signs closely")
        elif risk_level == "moderate":
            recommendations.insert(0, "Schedule appointment within 24 hours")
            recommendations.append("Monitor symptoms for changes")
        else:  # low
            recommendations.insert(0, "Schedule routine appointment within 1-2 weeks")
            recommendations.append("Continue monitoring symptoms")
        
        # Remove duplicates while preserving order
        seen = set()
        unique_recommendations = []
        for rec in recommendations:
            if rec not in seen:
                seen.add(rec)
                unique_recommendations.append(rec)
        
        return unique_recommendations
    
    def _generate_reasoning(
        self, 
        triage_input: TriageInput, 
        rule_results: List[Dict[str, Any]], 
        risk_score: float
    ) -> str:
        """Generate reasoning explanation for the triage decision"""
        reasoning_parts = []
        
        # Add primary factors
        if triage_input.symptoms:
            reasoning_parts.append(f"Primary symptoms: {', '.join(triage_input.symptoms[:3])}")
        
        # Add vital signs concerns
        vital_concerns = []
        if triage_input.vital_signs.heart_rate and triage_input.vital_signs.heart_rate > 100:
            vital_concerns.append("elevated heart rate")
        if triage_input.vital_signs.blood_pressure and "high" in triage_input.vital_signs.blood_pressure.lower():
            vital_concerns.append("elevated blood pressure")
        if triage_input.vital_signs.temperature and triage_input.vital_signs.temperature > 100.4:
            vital_concerns.append("fever")
        
        if vital_concerns:
            reasoning_parts.append(f"Vital sign concerns: {', '.join(vital_concerns)}")
        
        # Add medical history factors
        if triage_input.medical_history:
            reasoning_parts.append(f"Relevant medical history: {', '.join(triage_input.medical_history[:2])}")
        
        # Add rule-based reasoning
        high_impact_rules = [r for r in rule_results if r.get("score_impact", 0) > 1.0]
        if high_impact_rules:
            rule_names = [r["rule_name"] for r in high_impact_rules[:2]]
            reasoning_parts.append(f"Triggered high-priority rules: {', '.join(rule_names)}")
        
        # Add risk score context
        reasoning_parts.append(f"Overall risk score: {risk_score:.1f}/10.0")
        
        return ". ".join(reasoning_parts) + "."