from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_
from uuid import UUID
import json

from .models import User, Role, UserSession, SystemFlag
from .schemas import UserCreate, UserLogin, UserUpdate, RoleCreate
from ...core.security import SecurityService
from ...core.exceptions import AuthenticationError, ValidationError, PermissionError
from ...core.logging import get_logger

logger = get_logger(__name__)


class AuthService:
    @staticmethod
    def create_user(db: Session, user_data: UserCreate, created_by_user_id: int) -> User:
        """Create a new user"""
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise ValidationError("Email already registered")
        
        # Verify role exists
        role = db.query(Role).filter(Role.id == user_data.role_id).first()
        if not role:
            raise ValidationError("Invalid role specified")
        
        # Hash password
        password_hash = SecurityService.hash_password(user_data.password)
        
        # Create user
        user = User(
            email=user_data.email,
            password_hash=password_hash,
            role_id=user_data.role_id
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        logger.info(f"User created: {user.email} by user {created_by_user_id}")
        return user
    
    @staticmethod
    def authenticate_user(db: Session, credentials: UserLogin, ip_address: str, user_agent: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = db.query(User).filter(
            and_(User.email == credentials.email, User.is_active == True)
        ).first()
        
        if not user:
            logger.warning(f"Authentication failed: user not found for {credentials.email}")
            return None
        
        # Check if account is locked
        if user.locked_until and user.locked_until > datetime.utcnow():
            logger.warning(f"Authentication failed: account locked for {credentials.email}")
            raise AuthenticationError("Account is temporarily locked")
        
        # Verify password
        if not SecurityService.verify_password(credentials.password, user.password_hash):
            # Increment failed attempts
            user.failed_login_attempts += 1
            
            # Lock account after 5 failed attempts
            if user.failed_login_attempts >= 5:
                user.locked_until = datetime.utcnow() + timedelta(minutes=30)
                logger.warning(f"Account locked due to failed attempts: {credentials.email}")
            
            db.commit()
            logger.warning(f"Authentication failed: invalid password for {credentials.email}")
            return None
        
        # Reset failed attempts on successful login
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login = datetime.utcnow()
        db.commit()
        
        logger.info(f"User authenticated successfully: {credentials.email}")
        return user
    
    @staticmethod
    def create_user_session(
        db: Session, 
        user: User, 
        ip_address: str, 
        user_agent: str, 
        device_info: Dict[str, Any] = None
    ) -> Dict[str, str]:
        """Create user session with tokens"""
        # Create tokens
        token_data = {"sub": str(user.id), "email": user.email, "role": user.role.name}
        access_token = SecurityService.create_access_token(token_data)
        refresh_token = SecurityService.create_refresh_token(token_data)
        
        # Hash refresh token for storage
        refresh_token_hash = SecurityService.hash_refresh_token(refresh_token)
        
        # Create session record
        session = UserSession(
            user_id=user.id,
            refresh_token_hash=refresh_token_hash,
            device_info=device_info,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        
        db.add(session)
        db.commit()
        
        logger.info(f"Session created for user {user.email}")
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "session_id": str(session.id)
        }
    
    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str) -> Optional[Dict[str, str]]:
        """Refresh access token using refresh token"""
        # Verify refresh token
        payload = SecurityService.verify_token(refresh_token, "refresh")
        if not payload:
            return None
        
        user_id = int(payload["sub"])
        
        # Find active session with matching refresh token
        sessions = db.query(UserSession).filter(
            and_(
                UserSession.user_id == user_id,
                UserSession.is_active == True,
                UserSession.expires_at > datetime.utcnow()
            )
        ).all()
        
        valid_session = None
        for session in sessions:
            if SecurityService.verify_password(refresh_token, session.refresh_token_hash):
                valid_session = session
                break
        
        if not valid_session:
            logger.warning(f"Invalid refresh token for user {user_id}")
            return None
        
        # Get user with role
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            return None
        
        # Create new tokens
        token_data = {"sub": str(user.id), "email": user.email, "role": user.role.name}
        new_access_token = SecurityService.create_access_token(token_data)
        new_refresh_token = SecurityService.create_refresh_token(token_data)
        
        # Update session with new refresh token hash (token rotation)
        valid_session.refresh_token_hash = SecurityService.hash_refresh_token(new_refresh_token)
        valid_session.expires_at = datetime.utcnow() + timedelta(days=7)
        
        db.commit()
        
        logger.info(f"Tokens refreshed for user {user.email}")
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "session_id": str(valid_session.id)
        }
    
    @staticmethod
    def invalidate_session(db: Session, session_id: UUID) -> bool:
        """Invalidate a specific user session"""
        session = db.query(UserSession).filter(UserSession.id == session_id).first()
        if session:
            session.is_active = False
            db.commit()
            logger.info(f"Session invalidated: {session_id}")
            return True
        return False
    
    @staticmethod
    def invalidate_all_user_sessions(db: Session, user_id: int) -> int:
        """Invalidate all sessions for a user"""
        count = db.query(UserSession).filter(
            and_(UserSession.user_id == user_id, UserSession.is_active == True)
        ).update({"is_active": False})
        
        db.commit()
        logger.info(f"Invalidated {count} sessions for user {user_id}")
        return count
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def update_user(db: Session, user_id: int, user_data: UserUpdate) -> Optional[User]:
        """Update user information"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        
        logger.info(f"User updated: {user.email}")
        return user


class RoleService:
    @staticmethod
    def create_role(db: Session, role_data: RoleCreate) -> Role:
        """Create a new role"""
        existing_role = db.query(Role).filter(Role.name == role_data.name).first()
        if existing_role:
            raise ValidationError("Role name already exists")
        
        role = Role(
            name=role_data.name,
            permissions=role_data.permissions
        )
        
        db.add(role)
        db.commit()
        db.refresh(role)
        
        logger.info(f"Role created: {role.name}")
        return role
    
    @staticmethod
    def get_all_roles(db: Session) -> list[Role]:
        """Get all roles"""
        return db.query(Role).all()


class SystemFlagService:
    @staticmethod
    def get_flag(db: Session, key: str) -> Optional[SystemFlag]:
        """Get system flag by key"""
        return db.query(SystemFlag).filter(SystemFlag.key == key).first()
    
    @staticmethod
    def set_flag(db: Session, key: str, value: bool, description: str = None, updated_by: int = None) -> SystemFlag:
        """Set system flag value"""
        flag = db.query(SystemFlag).filter(SystemFlag.key == key).first()
        
        if flag:
            flag.value = value
            if description:
                flag.description = description
            flag.updated_by = updated_by
        else:
            flag = SystemFlag(
                key=key,
                value=value,
                description=description,
                updated_by=updated_by
            )
            db.add(flag)
        
        db.commit()
        db.refresh(flag)
        
        logger.info(f"System flag updated: {key} = {value}")
        return flag
    
    @staticmethod
    def is_system_enabled(db: Session) -> bool:
        """Check if system is enabled (kill switch)"""
        flag = SystemFlagService.get_flag(db, "system_enabled")
        return flag.value if flag else True