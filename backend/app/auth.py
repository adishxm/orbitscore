"""
OrbitScore Authentication and Role-Based Authorization
Enforces security boundaries for human review decisions, artifact uploads, and exports.
"""

from __future__ import annotations
import os
from typing import Optional, Literal
from fastapi import HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from pydantic import BaseModel

Role = Literal["reviewer", "viewer", "anonymous"]

class AuthenticatedUser(BaseModel):
    username: str
    role: Role
    token_type: str = "bearer"

# Security schemes
bearer_scheme = HTTPBearer(auto_error=False)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def is_auth_enforced() -> bool:
    """Check if authentication is strictly enforced via environment."""
    return os.getenv("ORBITSCORE_AUTH_ENABLED", "0").lower() in ("1", "true", "yes")

def get_configured_reviewer_key() -> str:
    return os.getenv("ORBITSCORE_REVIEWER_KEY", "orbitscore-reviewer-key-2026")

def get_configured_viewer_key() -> str:
    return os.getenv("ORBITSCORE_VIEWER_KEY", "orbitscore-viewer-key-2026")

async def get_current_user(
    request: Request,
    bearer_creds: Optional[HTTPAuthorizationCredentials] = Security(bearer_scheme),
    api_key: Optional[str] = Security(api_key_header),
) -> AuthenticatedUser:
    """
    Authenticate user via Bearer token or X-API-Key header.
    When ORBITSCORE_AUTH_ENABLED is not set, permits default reviewer access for local offline tests,
    unless explicitly requested.
    """
    token = None
    if bearer_creds:
        token = bearer_creds.credentials
    elif api_key:
        token = api_key

    reviewer_key = get_configured_reviewer_key()
    viewer_key = get_configured_viewer_key()

    if token:
        if token == reviewer_key:
            return AuthenticatedUser(username="engineer-reviewer", role="reviewer", token_type="api_key")
        elif token == viewer_key:
            return AuthenticatedUser(username="observer-viewer", role="viewer", token_type="api_key")
        else:
            raise HTTPException(status_code=401, detail={"error": "INVALID_CREDENTIALS", "message": "Provided token is invalid."})

    # If no token provided
    if is_auth_enforced():
        raise HTTPException(
            status_code=401,
            detail={"error": "UNAUTHORIZED", "message": "Authentication required. Provide Bearer token or X-API-Key header."}
        )

    # In local test/demo mode when auth is not strictly enforced
    return AuthenticatedUser(username="local-dev-user", role="reviewer", token_type="local_dev")

async def require_reviewer(
    user: AuthenticatedUser = Security(get_current_user)
) -> AuthenticatedUser:
    """Ensure user has 'reviewer' role to perform write actions."""
    if user.role != "reviewer":
        raise HTTPException(
            status_code=403,
            detail={"error": "FORBIDDEN", "message": "Reviewer role required for this write operation."}
        )
    return user

async def require_viewer_or_reviewer(
    user: AuthenticatedUser = Security(get_current_user)
) -> AuthenticatedUser:
    """Ensure user is authenticated with at least 'viewer' role."""
    if user.role not in ("viewer", "reviewer"):
        raise HTTPException(
            status_code=403,
            detail={"error": "FORBIDDEN", "message": "Viewer or Reviewer role required."}
        )
    return user
