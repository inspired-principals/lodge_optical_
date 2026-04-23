from fastapi.middleware.cors import CORSMiddleware
from ..core.config import settings


def setup_cors(app):
    """Setup CORS middleware with appropriate settings"""
    
    # Determine allowed origins based on environment
    if settings.ENVIRONMENT == "development":
        allowed_origins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://127.0.0.1:5173"
        ]
    else:
        # Production origins - should be configured via environment variables
        allowed_origins = [
            # Add your production frontend URLs here
        ]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"]
    )
