import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session
from ..core.database import SessionLocal
from ..modules.audit.service import RequestLogService
from ..modules.audit.schemas import RequestLogCreate
from ..core.logging import get_logger

logger = get_logger(__name__)


class AuditMiddleware(BaseHTTPMiddleware):
    """Middleware for logging requests and responses for audit purposes"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Get request info
        request_id = getattr(request.state, 'request_id', None)
        user_id = getattr(request.state, 'current_user', None)
        user_id = user_id.id if user_id else None
        
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent", "")
        
        # Calculate payload size
        payload_size = 0
        if hasattr(request, '_body'):
            payload_size = len(request._body) if request._body else 0
        
        response = await call_next(request)
        
        # Calculate response time
        response_time_ms = int((time.time() - start_time) * 1000)
        
        # Log request if we have a request_id
        if request_id:
            try:
                db = SessionLocal()
                try:
                    request_log_data = RequestLogCreate(
                        request_id=request_id,
                        user_id=user_id,
                        endpoint=str(request.url.path),
                        method=request.method,
                        status_code=response.status_code,
                        response_time_ms=response_time_ms,
                        payload_size=payload_size,
                        ip_address=ip_address,
                        user_agent=user_agent
                    )
                    
                    RequestLogService.create_request_log(db, request_log_data)
                    
                except Exception as e:
                    logger.error(f"Failed to create request log: {str(e)}")
                finally:
                    db.close()
                    
            except Exception as e:
                logger.error(f"Failed to create database session for audit: {str(e)}")
        
        return response