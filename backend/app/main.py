from fastapi import FastAPI

from .api.router import router
from .core.database import ensure_database_tables
from .core.event_listeners import setup_event_listeners
from .core.logging import get_logger, setup_logging
from .middleware.audit import AuditMiddleware
from .middleware.cors import setup_cors
from .middleware.logging import LoggingMiddleware
from .middleware.rate_limit import RateLimitMiddleware
from .middleware.request_id import RequestIDMiddleware

# Setup logging
setup_logging()
logger = get_logger(__name__)

app = FastAPI(
    title="Lodge Optical Autonomous Payment Engine",
    description="Sovereign financial control system with autonomous capabilities",
    version="2.0.0",
)

# Setup CORS
setup_cors(app)

# Add middleware (order matters - first added is outermost)
app.add_middleware(AuditMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RequestIDMiddleware)

# Include routers
app.include_router(router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    """Initialize the backend runtime."""
    ensure_database_tables()
    logger.info("Lodge Optical backend starting up")

    # Initialize event-driven architecture
    setup_event_listeners()

    logger.info("Backend initialized")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Lodge Optical backend shutting down")
