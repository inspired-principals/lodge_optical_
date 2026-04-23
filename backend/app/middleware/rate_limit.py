import time
from collections import defaultdict, deque
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from ..core.logging import get_logger

logger = get_logger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware with different tiers for different endpoints"""
    
    def __init__(self, app):
        super().__init__(app)
        # Store request timestamps per IP
        self.request_history = defaultdict(deque)
        
        # Rate limit configurations (requests per minute)
        self.rate_limits = {
            "/api/v1/auth/login": 5,      # 5 login attempts per minute
            "/api/v1/auth/refresh": 10,   # 10 refresh attempts per minute
            "/api/v1/triage": 30,         # 30 triage requests per minute
            "default": 60                 # 60 requests per minute for other endpoints
        }
    
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        endpoint = str(request.url.path)
        
        # Get rate limit for this endpoint
        rate_limit = self._get_rate_limit(endpoint)
        
        # Check rate limit
        if self._is_rate_limited(client_ip, endpoint, rate_limit):
            logger.warning(f"Rate limit exceeded for {client_ip} on {endpoint}")
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later."
            )
        
        # Record this request
        self._record_request(client_ip, endpoint)
        
        response = await call_next(request)
        return response
    
    def _get_rate_limit(self, endpoint: str) -> int:
        """Get rate limit for specific endpoint"""
        for pattern, limit in self.rate_limits.items():
            if pattern != "default" and pattern in endpoint:
                return limit
        return self.rate_limits["default"]
    
    def _is_rate_limited(self, client_ip: str, endpoint: str, rate_limit: int) -> bool:
        """Check if client has exceeded rate limit"""
        key = f"{client_ip}:{endpoint}"
        now = time.time()
        
        # Clean old requests (older than 1 minute)
        self._clean_old_requests(key, now)
        
        # Check current request count
        return len(self.request_history[key]) >= rate_limit
    
    def _record_request(self, client_ip: str, endpoint: str):
        """Record a request timestamp"""
        key = f"{client_ip}:{endpoint}"
        now = time.time()
        self.request_history[key].append(now)
    
    def _clean_old_requests(self, key: str, current_time: float):
        """Remove requests older than 1 minute"""
        cutoff_time = current_time - 60  # 1 minute ago
        
        while (self.request_history[key] and 
               self.request_history[key][0] < cutoff_time):
            self.request_history[key].popleft()