from fastapi import HTTPException, status


class LodgeOpticalException(Exception):
    """Base exception for all application errors"""
    def __init__(self, message: str, error_code: str = None):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)


class AuthenticationError(LodgeOpticalException):
    """Authentication and authorization errors"""
    pass


class ValidationError(LodgeOpticalException):
    """Input validation errors"""
    pass


class TriageEngineError(LodgeOpticalException):
    """Triage engine processing errors"""
    pass


class DatabaseError(LodgeOpticalException):
    """Database operation errors"""
    pass


class PermissionError(LodgeOpticalException):
    """Permission denied errors"""
    pass


class TenantIsolationViolationError(LodgeOpticalException):
    """Raised when a tenant attempts to access another tenant's data"""
    pass


class ConcurrencyConflictError(LodgeOpticalException):
    """Raised when optimistic locking detects a stale write"""
    pass


# HTTP Exception helpers
def create_http_exception(
    status_code: int,
    error_code: str,
    message: str,
    details: dict = None,
    request_id: str = None
) -> HTTPException:
    """Create standardized HTTP exception"""
    error_detail = {
        "error": {
            "code": error_code,
            "message": message
        }
    }
    
    if details:
        error_detail["error"]["details"] = details
    
    if request_id:
        error_detail["error"]["request_id"] = request_id
    
    return HTTPException(status_code=status_code, detail=error_detail)


# Common HTTP exceptions
def unauthorized_exception(message: str = "Authentication required", request_id: str = None):
    return create_http_exception(
        status.HTTP_401_UNAUTHORIZED,
        "AUTHENTICATION_ERROR",
        message,
        request_id=request_id
    )


def forbidden_exception(message: str = "Insufficient permissions", request_id: str = None):
    return create_http_exception(
        status.HTTP_403_FORBIDDEN,
        "PERMISSION_ERROR",
        message,
        request_id=request_id
    )


def validation_exception(message: str, details: dict = None, request_id: str = None):
    return create_http_exception(
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        "VALIDATION_ERROR",
        message,
        details=details,
        request_id=request_id
    )


def not_found_exception(resource: str, request_id: str = None):
    return create_http_exception(
        status.HTTP_404_NOT_FOUND,
        "NOT_FOUND",
        f"{resource} not found",
        request_id=request_id
    )


def internal_server_exception(message: str = "Internal server error", request_id: str = None):
    return create_http_exception(
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        "INTERNAL_ERROR",
        message,
        request_id=request_id
    )
