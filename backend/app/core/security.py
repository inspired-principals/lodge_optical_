import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

try:
    import jwt  # type: ignore
except ImportError:  # pragma: no cover - fallback path is environment-specific
    jwt = None

from .config import settings
from .logging import get_logger

try:
    import bcrypt  # type: ignore
except ImportError:  # pragma: no cover - fallback path is environment-specific
    bcrypt = None

logger = get_logger(__name__)

PBKDF2_ITERATIONS = 600_000


class SecurityService:
    @staticmethod
    def _require_jwt():
        if jwt is None:
            raise RuntimeError("JWT support is unavailable in this environment.")

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password with bcrypt when available, otherwise PBKDF2."""
        if bcrypt is not None:
            salt = bcrypt.gensalt(rounds=12)
            return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

        salt = secrets.token_bytes(16)
        digest = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            PBKDF2_ITERATIONS,
        )
        return "pbkdf2_sha256${}${}${}".format(
            PBKDF2_ITERATIONS,
            base64.b64encode(salt).decode("utf-8"),
            base64.b64encode(digest).decode("utf-8"),
        )

    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verify password against hash."""
        try:
            if hashed.startswith("pbkdf2_sha256$"):
                _, iteration_text, salt_text, digest_text = hashed.split("$", 3)
                derived = hashlib.pbkdf2_hmac(
                    "sha256",
                    password.encode("utf-8"),
                    base64.b64decode(salt_text.encode("utf-8")),
                    int(iteration_text),
                )
                return hmac.compare_digest(
                    derived,
                    base64.b64decode(digest_text.encode("utf-8")),
                )

            if bcrypt is None:
                return False

            return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
        except Exception as e:
            logger.error(f"Password verification failed: {str(e)}")
            return False

    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token with short expiration."""
        SecurityService._require_jwt()
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=5))
        to_encode.update({"exp": expire, "type": "access"})
        return jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")

    @staticmethod
    def create_refresh_token(data: Dict[str, Any]) -> str:
        """Create JWT refresh token with longer expiration."""
        SecurityService._require_jwt()
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=7)
        to_encode.update({"exp": expire, "type": "refresh"})
        return jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")

    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
        """Verify JWT token and return payload."""
        if jwt is None:
            logger.warning("JWT verification requested but JWT support is unavailable.")
            return None
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
            if payload.get("type") != token_type:
                logger.warning(f"Token type mismatch: expected {token_type}, got {payload.get('type')}")
                return None
            return payload
        except Exception as e:
            if jwt is not None and isinstance(e, getattr(jwt, "ExpiredSignatureError", tuple())):
                logger.info("Token has expired")
                return None
            logger.warning(f"JWT verification failed: {str(e)}")
            return None

    @staticmethod
    def hash_refresh_token(token: str) -> str:
        """Hash refresh token for secure storage."""
        return SecurityService.hash_password(token)


class PermissionChecker:
    """Role-based permission checking."""

    ROLE_PERMISSIONS = {
        "admin": ["*"],
        "staff": ["triage:read", "triage:write", "patient:read", "patient:write"],
        "viewer": ["triage:read", "patient:read"],
    }

    @staticmethod
    def has_permission(user_role: str, required_permission: str) -> bool:
        permissions = PermissionChecker.ROLE_PERMISSIONS.get(user_role, [])
        if "*" in permissions:
            return True
        return required_permission in permissions

    @staticmethod
    def require_permission(required_permission: str):
        def decorator(func):
            func._required_permission = required_permission
            return func

        return decorator
