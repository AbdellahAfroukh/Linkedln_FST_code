from fastapi import FastAPI
import uvicorn
import models
from database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.middleware.trustedhost import TrustedHostMiddleware
from config import settings
from routes import auth_routes, admin_routes, cv_routes ,connection_routes, chat_routes, google_scholar_routes, post_routes, projet_routes, upload_routes, websocket_routes, scopus_routes
from collections import defaultdict
from time import time
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)
    
    async def dispatch(self, request: Request, call_next):
        # Rate limit auth endpoints
        if request.url.path in ["/auth/login", "/auth/register", "/auth/verify-2fa"]:
            client_ip = request.client.host
            now = time()
            
            # Clean old requests (older than 1 minute)
            self.requests[client_ip] = [req_time for req_time in self.requests[client_ip] if now - req_time < 60]
            
            if len(self.requests[client_ip]) >= self.requests_per_minute:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Please try again later."
                )
            
            self.requests[client_ip].append(now)
        
        response = await call_next(request)
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        return response

app = FastAPI(
    title="Academic Platform API",
    description="API for Academic Platform with JWT authentication and 2FA support",
    version="1.0.0"
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.localhost"]
)

# Add rate limiting
app.add_middleware(RateLimitMiddleware, requests_per_minute=60)

app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

# Global exception handler for unhandled exceptions
# Note: HTTPException and WebSocket errors are handled separately by FastAPI
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions - log details but don't expose to client"""
    # Don't catch HTTPException - those have their own handlers
    if isinstance(exc, HTTPException):
        raise exc
    
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    # Return generic error message without exposing details
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please try again later."}
    )

app.include_router(auth_routes.router)
app.include_router(admin_routes.router)
app.include_router(cv_routes.router)
app.include_router(connection_routes.router)
app.include_router(chat_routes.router)
app.include_router(google_scholar_routes.router)
app.include_router(scopus_routes.router)
app.include_router(post_routes.router)
app.include_router(projet_routes.router)
app.include_router(upload_routes.router)
app.include_router(websocket_routes.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to Academic Platform API",
        "docs": "/docs",
       "authentication": "JWT with 2FA support"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)