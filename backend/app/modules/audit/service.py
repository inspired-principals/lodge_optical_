import hashlib
import json
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from .models import AuditLog, RequestLog
from .schemas import AuditLogCreate, RequestLogCreate
from ...core.logging import get_logger

logger = get_logger(__name__)


class AuditService:
    @staticmethod
    def create_audit_log(db: Session, audit_data: AuditLogCreate) -> AuditLog:
        """Create audit log entry"""
        try:
            # Calculate state diff if both states provided
            state_diff = None
            if audit_data.before_state and audit_data.after_state:
                state_diff = AuditService._calculate_state_diff(
                    audit_data.before_state, 
                    audit_data.after_state
                )
            
            audit_log = AuditLog(
                request_id=audit_data.request_id,
                user_id=audit_data.user_id,
                session_id=audit_data.session_id,
                action=audit_data.action,
                resource_type=audit_data.resource_type,
                resource_id=audit_data.resource_id,
                before_state=audit_data.before_state,
                after_state=audit_data.after_state,
                state_diff=state_diff,
                payload_hash=audit_data.payload_hash,
                ip_address=audit_data.ip_address,
                user_agent=audit_data.user_agent
            )
            
            db.add(audit_log)
            db.commit()
            
            logger.info(f"Audit log created: {audit_data.action} by user {audit_data.user_id}")
            return audit_log
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create audit log: {str(e)}")
            raise
    
    @staticmethod
    def log_action(
        db: Session,
        request_id: UUID,
        action: str,
        user_id: Optional[int] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        before_state: Optional[Dict[str, Any]] = None,
        after_state: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> None:
        """Convenience method to log an action"""
        audit_data = AuditLogCreate(
            request_id=request_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            before_state=before_state,
            after_state=after_state,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        AuditService.create_audit_log(db, audit_data)
    
    @staticmethod
    def get_audit_logs(
        db: Session,
        user_id: Optional[int] = None,
        action: Optional[str] = None,
        resource_type: Optional[str] = None,
        limit: int = 100
    ) -> List[AuditLog]:
        """Get audit logs with filters"""
        query = db.query(AuditLog)
        
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if action:
            query = query.filter(AuditLog.action == action)
        if resource_type:
            query = query.filter(AuditLog.resource_type == resource_type)
        
        return query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    
    @staticmethod
    def _calculate_state_diff(before: Dict[str, Any], after: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate difference between before and after states"""
        diff = {}
        
        # Find changed fields
        all_keys = set(before.keys()) | set(after.keys())
        
        for key in all_keys:
            before_val = before.get(key)
            after_val = after.get(key)
            
            if before_val != after_val:
                diff[key] = {
                    "before": before_val,
                    "after": after_val
                }
        
        return diff
    
    @staticmethod
    def hash_payload(payload: Dict[str, Any]) -> str:
        """Create hash of payload for integrity verification"""
        payload_str = json.dumps(payload, sort_keys=True, default=str)
        return hashlib.sha256(payload_str.encode()).hexdigest()


class RequestLogService:
    @staticmethod
    def create_request_log(db: Session, request_data: RequestLogCreate) -> RequestLog:
        """Create request log entry"""
        try:
            request_log = RequestLog(
                request_id=request_data.request_id,
                user_id=request_data.user_id,
                endpoint=request_data.endpoint,
                method=request_data.method,
                status_code=request_data.status_code,
                response_time_ms=request_data.response_time_ms,
                payload_size=request_data.payload_size,
                ip_address=request_data.ip_address,
                user_agent=request_data.user_agent
            )
            
            db.add(request_log)
            db.commit()
            
            return request_log
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create request log: {str(e)}")
            raise
    
    @staticmethod
    def get_request_logs(
        db: Session,
        user_id: Optional[int] = None,
        endpoint: Optional[str] = None,
        limit: int = 100
    ) -> List[RequestLog]:
        """Get request logs with filters"""
        query = db.query(RequestLog)
        
        if user_id:
            query = query.filter(RequestLog.user_id == user_id)
        if endpoint:
            query = query.filter(RequestLog.endpoint.like(f"%{endpoint}%"))
        
        return query.order_by(RequestLog.created_at.desc()).limit(limit).all()