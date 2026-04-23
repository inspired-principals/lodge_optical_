from fastapi import Request, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from ..core.database import get_db
from ..core.security import SecurityService, PermissionChecker
from ..core.exceptions import unauthorized_exception, forbidden_exception
from ..modules.auth.service import AuthService, SystemFlagService
from ..modules.auth.models import User
from ..core.logging import get_logger

logger = get_logger(__name__)

security = HTTPBearer(auto_error=False)


class AuthDependency:
    def __init__(self, required_permission: Optional[str] = None):
        self.required_permission = required_permission
    
    def __call__(
        self,
        request: Request,
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
        db: Session = Depends(get_db)
    ) -> User:
        # Check system kill switch
        if not SystemFlagService.is_system_enabled(db):
            raise HTTPException(status_code=503, detail="System temporarily unavailable")
        
        if not credentials:
            raise unauthorized_exception("Authentication required", request.state.request_id)
        
        # Verify JWT token
        payload = SecurityService.verify_token(credentials.credentials)
        if not payload:
            raise unauthorized_exception("Invalid or expired token", request.state.request_id)
        
        # Get user from database
        user_id = int(payload["sub"])
        user = AuthService.get_user_by_id(db, user_id)
        
        if not user or not user.is_active:
            raise unauthorized_exception("User not found or inactive", request.state.request_id)
        
        # Check if user has required permission
        if self.required_permission:
            if not PermissionChecker.has_permission(user.role.name, self.required_permission):
                raise forbidden_exception(
                    f"Permission required: {self.required_permission}",
                    request.state.request_id
                )
        
        # Store user in request state for access in routes
        request.state.current_user = user
        
        logger.info(f"User authenticated: {user.email} for {request.method} {request.url.path}")
        return user


# Common auth dependencies
get_current_user = AuthDependency()
require_admin = AuthDependency("admin:*")
require_staff = AuthDependency("triage:write")


def get_optional_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, None otherwise"""
    if not credentials:
        return None
    
    try:
        payload = SecurityService.verify_token(credentials.credentials)
        if not payload:
            return None
        
        user_id = int(payload["sub"])
        user = AuthService.get_user_by_id(db, user_id)
        
        if user and user.is_active:
            request.state.current_user = user
            return user
    except Exception as e:
        logger.warning(f"Optional auth failed: {str(e)}")
    
    return None