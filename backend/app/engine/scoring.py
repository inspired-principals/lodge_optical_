from typing import Dict, Any, List
import math
from .schemas import TriageInput
from ..core.logging import get_logger

logger = get_logger(__name__)


class ScoringEngine:
    """Risk scoring algorithms and calculations"""
    
    # Risk level thresholds
    RISK_THRESHOLDS = {
        "low": (0.0, 3.0),
        "moderate": (3.0, 6.0),
        "high": (6.0, 8.5),
        "critical": (8.5, 10.0)
    }
    
    # Symptom severity weights
    SYMPTOM_WEIGHTS = {
        "chest_pain": 3.0,
        "shortness_of_breath": 2.5,
        "severe_headache": 2.0,
        "abdominal_pain": 1.5,
        "dizziness": 1.0,
        "nausea": 0.5,
        "fatigue": 0.3,
        "cough": 0.2
    }
    
    def calculate_risk_score(self, triage_input: TriageInput, rule_results: List[Dict[str, Any]]) -> float:
        """Calculate overall risk score from input and rule results"""
        base_score = 0.0
        
        # Calculate symptom-based score
        symptom_score = self._calculate_symptom_score(triage_input)
        base_score += symptom_score
        
        # Calculate vital signs score
        vital_score = self._calculate_vital_signs_score(triage_input)
        base_score += vital_score
        
        # Calculate medical history score
        history_score = self._calculate_medical_history_score(triage_input)
        base_score += history_score
        
        # Apply rule adjustments
        rule_adjustments = sum(result.get("score_adjustment", 0) for result in rule_results)
        base_score += rule_adjustments
        
        # Apply severity multiplier if provided
        if triage_input.severity:
            severity_multiplier = 1.0 + (triage_input.severity - 5) * 0.1  # Scale around 5
            base_score *= severity_multiplier
        
        # Normalize to 0-10 scale
        final_score = max(0.0, min(10.0, base_score))
        
        logger.info(f"Risk score calculation: symptoms={symptom_score:.2f}, vitals={vital_score:.2f}, "
                   f"history={history_score:.2f}, rules={rule_adjustments:.2f}, final={final_score:.2f}")
        
        return final_score
    
    def _calculate_symptom_score(self, triage_input: TriageInput) -> float:
        """Calculate score based on symptoms"""
        if not triage_input.symptoms:
            return 0.0
        
        symptom_score = 0.0
        for symptom in triage_input.symptoms:
            weight = self.SYMPTOM_WEIGHTS.get(symptom.lower(), 0.5)  # Default weight for unknown symptoms
            symptom_score += weight
        
        # Apply diminishing returns for multiple symptoms
        if len(triage_input.symptoms) > 1:
            symptom_score *= (1.0 + math.log(len(triage_input.symptoms)) * 0.2)
        
        return min(symptom_score, 4.0)  # Cap at 4.0
    
    def _calculate_vital_signs_score(self, triage_input: TriageInput) -> float:
        """Calculate score based on vital signs"""
        vital_score = 0.0
        vitals = triage_input.vital_signs
        
        # Heart rate scoring
        if vitals.heart_rate:
            if vitals.heart_rate > 120 or vitals.heart_rate < 50:
                vital_score += 2.0
            elif vitals.heart_rate > 100 or vitals.heart_rate < 60:
                vital_score += 1.0
        
        # Blood pressure scoring (simplified)
        if vitals.blood_pressure:
            bp_lower = vitals.blood_pressure.lower()
            if "high" in bp_lower or "elevated" in bp_lower:
                vital_score += 1.5
            elif "low" in bp_lower:
                vital_score += 2.0
        
        # Temperature scoring
        if vitals.temperature:
            if vitals.temperature > 103.0 or vitals.temperature < 95.0:
                vital_score += 2.5
            elif vitals.temperature > 100.4 or vitals.temperature < 97.0:
                vital_score += 1.0
        
        # Oxygen saturation scoring
        if vitals.oxygen_saturation:
            if vitals.oxygen_saturation < 90:
                vital_score += 3.0
            elif vitals.oxygen_saturation < 95:
                vital_score += 1.5
        
        # Pain level scoring
        if vitals.pain_level:
            if vitals.pain_level >= 8:
                vital_score += 2.0
            elif vitals.pain_level >= 6:
                vital_score += 1.0
            elif vitals.pain_level >= 4:
                vital_score += 0.5
        
        return min(vital_score, 4.0)  # Cap at 4.0
    
    def _calculate_medical_history_score(self, triage_input: TriageInput) -> float:
        """Calculate score based on medical history"""
        history_score = 0.0
        
        # High-risk conditions
        high_risk_conditions = [
            "heart_disease", "diabetes", "hypertension", "stroke", "cancer",
            "kidney_disease", "liver_disease", "copd", "asthma"
        ]
        
        for condition in triage_input.medical_history:
            if condition.lower() in high_risk_conditions:
                history_score += 0.5
        
        # Medication interactions (simplified)
        if triage_input.current_medications:
            if len(triage_input.current_medications) > 5:
                history_score += 0.5  # Polypharmacy risk
        
        # Allergies consideration
        if triage_input.allergies:
            history_score += 0.2 * len(triage_input.allergies)
        
        return min(history_score, 2.0)  # Cap at 2.0
    
    def determine_risk_level(self, risk_score: float) -> str:
        """Determine risk level category from score"""
        for level, (min_score, max_score) in self.RISK_THRESHOLDS.items():
            if min_score <= risk_score < max_score:
                return level
        
        # Handle edge case for exactly 10.0
        if risk_score >= 10.0:
            return "critical"
        
        return "low"
    
    def calculate_confidence(self, triage_input: TriageInput, rule_results: List[Dict[str, Any]]) -> float:
        """Calculate confidence score for the triage decision"""
        confidence_factors = []
        
        # Data completeness factor
        completeness = 0.0
        if triage_input.symptoms:
            completeness += 0.3
        if triage_input.vital_signs.heart_rate or triage_input.vital_signs.blood_pressure:
            completeness += 0.2
        if triage_input.vital_signs.temperature:
            completeness += 0.1
        if triage_input.medical_history:
            completeness += 0.2
        if triage_input.chief_complaint:
            completeness += 0.1
        if triage_input.severity:
            completeness += 0.1
        
        confidence_factors.append(completeness)
        
        # Rule consistency factor
        if rule_results:
            rule_consistency = min(1.0, len(rule_results) / 3.0)  # More rules = higher confidence
            confidence_factors.append(rule_consistency)
        else:
            confidence_factors.append(0.3)  # Low confidence without rules
        
        # Symptom specificity factor
        specific_symptoms = ["chest_pain", "shortness_of_breath", "severe_headache"]
        has_specific = any(symptom in triage_input.symptoms for symptom in specific_symptoms)
        specificity_factor = 0.8 if has_specific else 0.5
        confidence_factors.append(specificity_factor)
        
        # Calculate weighted average
        weights = [0.4, 0.4, 0.2]  # Completeness, rules, specificity
        confidence = sum(factor * weight for factor, weight in zip(confidence_factors, weights))
        
        return max(0.1, min(1.0, confidence))  # Ensure between 0.1 and 1.0