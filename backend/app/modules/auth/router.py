from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ...core.database import get_db
from ...core.exceptions import AuthenticationError, ValidationError
from ...middleware.auth import get_current_user, require_admin
from .schemas import (
    UserLogin, UserCreate, UserResponse, TokenResponse, 
    RefreshTokenRequest, RoleCreate, RoleResponse,
    UserSessionResponse, SystemFlagUpdate, SystemFlagResponse
)
from .service import AuthService, RoleService, SystemFlagService
from .models import User
from ...core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    """Authenticate user and create session"""
    try:
        # Get client info
        ip_address = request.client.host
        user_agent = request.headers.get("user-agent", "")
        
        # Authenticate user
        user = AuthService.authenticate_user(db, credentials, ip_address, user_agent)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Create session and tokens
        tokens = AuthService.create_user_session(db, user, ip_address, user_agent)
        
        # Prepare response
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            role=user.role.name,
            is_active=user.is_active,
            last_login=user.last_login,
            created_at=user.created_at
        )
        
        return TokenResponse(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            user=user_response
        )
        
    except AuthenticationError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")


@router.post("/refresh", response_model=dict)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """Refresh access token"""
    tokens = AuthService.refresh_access_token(db, refresh_data.refresh_token)
    if not tokens:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "token_type": "bearer"
    }


@router.post("/logout")
async def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Logout current user session"""
    # Get session ID from request state if available
    session_id = getattr(request.state, 'session_id', None)
    
    if session_id:
        AuthService.invalidate_session(db, session_id)
    else:
        # Fallback: invalidate all user sessions
        AuthService.invalidate_all_user_sessions(db, current_user.id)
    
    return {"message": "Logged out successfully"}


@router.post("/logout-all")
async def logout_all_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Logout all user sessions"""
    count = AuthService.invalidate_all_user_sessions(db, current_user.id)
    return {"message": f"Logged out from {count} sessions"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role.name,
        is_active=current_user.is_active,
        last_login=current_user.last_login,
        created_at=current_user.created_at
    )


@router.get("/sessions", response_model=List[UserSessionResponse])
async def get_user_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's active sessions"""
    sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_active == True
    ).all()
    
    return [
        UserSessionResponse(
            id=session.id,
            device_info=session.device_info,
            ip_address=str(session.ip_address) if session.ip_address else None,
            user_agent=session.user_agent,
            is_active=session.is_active,
            expires_at=session.expires_at,
            created_at=session.created_at
        )
        for session in sessions
    ]


# Admin endpoints
@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create new user (admin only)"""
    try:
        user = AuthService.create_user(db, user_data, current_user.id)
        return UserResponse(
            id=user.id,
            email=user.email,
            role=user.role.name,
            is_active=user.is_active,
            last_login=user.last_login,
            created_at=user.created_at
        )
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/roles", response_model=RoleResponse)
async def create_role(
    role_data: RoleCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create new role (admin only)"""
    try:
        role = RoleService.create_role(db, role_data)
        return RoleResponse(
            id=role.id,
            name=role.name,
            permissions=role.permissions,
            created_at=role.created_at
        )
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/roles", response_model=List[RoleResponse])
async def get_roles(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all roles (admin only)"""
    roles = RoleService.get_all_roles(db)
    return [
        RoleResponse(
            id=role.id,
            name=role.name,
            permissions=role.permissions,
            created_at=role.created_at
        )
        for role in roles
    ]


@router.put("/system-flags/{key}", response_model=SystemFlagResponse)
async def update_system_flag(
    key: str,
    flag_data: SystemFlagUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update system flag (admin only)"""
    flag = SystemFlagService.set_flag(
        db, key, flag_data.value, flag_data.description, current_user.id
    )
    
    return SystemFlagResponse(
        key=flag.key,
        value=flag.value,
        description=flag.description,
        updated_by=flag.updated_by,
        updated_at=flag.updated_at
    )