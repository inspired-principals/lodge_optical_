import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from ..core.logging import get_logger

logger = get_logger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = int((time.time() - start_time) * 1000)
        
        logger.info(
            f"{request.method} {request.url.path} - {response.status_code} - {process_time}ms"
        )
        
        return response