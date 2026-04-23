from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import and_

from .schemas import TriageInput
from ..modules.triage.models import TriageRule
from ..core.logging import get_logger

logger = get_logger(__name__)


class RulesEngine:
    """Executable rules engine for triage decision making"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def evaluate_rules(self, triage_input: TriageInput) -> List[Dict[str, Any]]:
        """Evaluate all active rules against triage input"""
        # Get active rules ordered by priority
        rules = self.db.query(TriageRule).filter(
            TriageRule.is_active == True
        ).order_by(TriageRule.priority.desc()).all()
        
        rule_results = []
        
        for rule in rules:
            try:
                result = self._evaluate_single_rule(rule, triage_input)
                if result:
                    rule_results.append(result)
            except Exception as e:
                logger.error(f"Error evaluating rule {rule.name}: {str(e)}")
                continue
        
        logger.info(f"Evaluated {len(rules)} rules, {len(rule_results)} matched")
        return rule_results
    
    def _evaluate_single_rule(self, rule: TriageRule, triage_input: TriageInput) -> Dict[str, Any]:
        """Evaluate a single rule against triage input"""
        conditions = rule.conditions
        actions = rule.actions
        
        # Check if all conditions are met
        if not self._check_conditions(conditions, triage_input):
            return None
        
        # Rule matched, prepare result
        result = {
            "rule_id": rule.id,
            "rule_name": rule.name,
            "rule_version": rule.version,
            "score_adjustment": actions.get("score_adjustment", 0.0),
            "priority_boost": actions.get("priority_boost", 0),
            "recommendations": actions.get("recommendations", []),
            "reasoning": actions.get("reasoning", ""),
            "score_impact": abs(actions.get("score_adjustment", 0.0))
        }
        
        logger.info(f"Rule matched: {rule.name} (score adjustment: {result['score_adjustment']})")
        return result
    
    def _check_conditions(self, conditions: List[Dict[str, Any]], triage_input: TriageInput) -> bool:
        """Check if all conditions in a rule are satisfied"""
        for condition in conditions:
            if not self._evaluate_condition(condition, triage_input):
                return False
        return True
    
    def _evaluate_condition(self, condition: Dict[str, Any], triage_input: TriageInput) -> bool:
        """Evaluate a single condition against triage input"""
        field = condition.get("field")
        operator = condition.get("operator")
        value = condition.get("value")
        
        if not all([field, operator, value is not None]):
            return False
        
        # Get field value from triage input
        field_value = self._get_field_value(field, triage_input)
        
        if field_value is None:
            return False
        
        # Apply operator
        return self._apply_operator(field_value, operator, value)
    
    def _get_field_value(self, field: str, triage_input: TriageInput):
        """Extract field value from triage input using dot notation"""
        try:
            # Handle nested fields like "vital_signs.heart_rate"
            parts = field.split(".")
            value = triage_input
            
            for part in parts:
                if hasattr(value, part):
                    value = getattr(value, part)
                elif isinstance(value, dict) and part in value:
                    value = value[part]
                else:
                    return None
            
            return value
        except Exception:
            return None
    
    def _apply_operator(self, field_value: Any, operator: str, condition_value: Any) -> bool:
        """Apply comparison operator"""
        try:
            if operator == "equals":
                return field_value == condition_value
            
            elif operator == "not_equals":
                return field_value != condition_value
            
            elif operator == "contains":
                if isinstance(field_value, list):
                    return condition_value in field_value
                elif isinstance(field_value, str):
                    return condition_value.lower() in field_value.lower()
                return False
            
            elif operator == "not_contains":
                if isinstance(field_value, list):
                    return condition_value not in field_value
                elif isinstance(field_value, str):
                    return condition_value.lower() not in field_value.lower()
                return True
            
            elif operator == "in":
                if isinstance(condition_value, list):
                    return field_value in condition_value
                return False
            
            elif operator == "not_in":
                if isinstance(condition_value, list):
                    return field_value not in condition_value
                return True
            
            elif operator == "greater_than":
                return float(field_value) > float(condition_value)
            
            elif operator == "greater_than_or_equal":
                return float(field_value) >= float(condition_value)
            
            elif operator == "less_than":
                return float(field_value) < float(condition_value)
            
            elif operator == "less_than_or_equal":
                return float(field_value) <= float(condition_value)
            
            elif operator == "exists":
                return field_value is not None
            
            elif operator == "not_exists":
                return field_value is None
            
            elif operator == "length_greater_than":
                if hasattr(field_value, "__len__"):
                    return len(field_value) > int(condition_value)
                return False
            
            elif operator == "length_less_than":
                if hasattr(field_value, "__len__"):
                    return len(field_value) < int(condition_value)
                return False
            
            else:
                logger.warning(f"Unknown operator: {operator}")
                return False
                
        except (ValueError, TypeError) as e:
            logger.warning(f"Operator evaluation failed: {operator} with values {field_value}, {condition_value}: {str(e)}")
            return False


class DefaultRulesLoader:
    """Load default triage rules into the database"""
    
    @staticmethod
    def load_default_rules(db: Session, created_by_user_id: int):
        """Load default triage rules"""
        default_rules = [
            {
                "name": "Chest Pain with Cardiac History",
                "version": "1.0",
                "conditions": [
                    {"field": "symptoms", "operator": "contains", "value": "chest_pain"},
                    {"field": "medical_history", "operator": "contains", "value": "heart_disease"}
                ],
                "actions": {
                    "score_adjustment": 3.0,
                    "recommendations": ["Immediate cardiac evaluation", "ECG required"],
                    "reasoning": "Chest pain with cardiac history requires urgent evaluation"
                },
                "priority": 10
            },
            {
                "name": "High Fever with Severe Symptoms",
                "version": "1.0",
                "conditions": [
                    {"field": "vital_signs.temperature", "operator": "greater_than", "value": 103.0},
                    {"field": "symptoms", "operator": "length_greater_than", "value": 2}
                ],
                "actions": {
                    "score_adjustment": 2.5,
                    "recommendations": ["Immediate fever management", "Blood work recommended"],
                    "reasoning": "High fever with multiple symptoms indicates serious condition"
                },
                "priority": 8
            },
            {
                "name": "Shortness of Breath",
                "version": "1.0",
                "conditions": [
                    {"field": "symptoms", "operator": "contains", "value": "shortness_of_breath"}
                ],
                "actions": {
                    "score_adjustment": 2.0,
                    "recommendations": ["Respiratory assessment", "Oxygen saturation check"],
                    "reasoning": "Shortness of breath requires respiratory evaluation"
                },
                "priority": 7
            },
            {
                "name": "Severe Pain",
                "version": "1.0",
                "conditions": [
                    {"field": "vital_signs.pain_level", "operator": "greater_than_or_equal", "value": 8}
                ],
                "actions": {
                    "score_adjustment": 1.5,
                    "recommendations": ["Pain management", "Detailed pain assessment"],
                    "reasoning": "Severe pain requires immediate attention"
                },
                "priority": 6
            },
            {
                "name": "Multiple Chronic Conditions",
                "version": "1.0",
                "conditions": [
                    {"field": "medical_history", "operator": "length_greater_than", "value": 3}
                ],
                "actions": {
                    "score_adjustment": 1.0,
                    "recommendations": ["Comprehensive evaluation", "Medication review"],
                    "reasoning": "Multiple chronic conditions increase complexity"
                },
                "priority": 3
            }
        ]
        
        for rule_data in default_rules:
            # Check if rule already exists
            existing = db.query(TriageRule).filter(
                and_(
                    TriageRule.name == rule_data["name"],
                    TriageRule.version == rule_data["version"]
                )
            ).first()
            
            if not existing:
                rule = TriageRule(
                    name=rule_data["name"],
                    version=rule_data["version"],
                    conditions=rule_data["conditions"],
                    actions=rule_data["actions"],
                    priority=rule_data["priority"],
                    created_by=created_by_user_id
                )
                db.add(rule)
        
        db.commit()
        logger.info("Default triage rules loaded")