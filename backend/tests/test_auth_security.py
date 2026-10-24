import os
import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.auth import get_configured_reviewer_key, get_configured_viewer_key

client = TestClient(app)

def test_cors_origins_not_wildcard():
    """Verify CORS middleware is configured with specific origins, not wildcard '*'."""
    from fastapi.middleware.cors import CORSMiddleware
    cors_mw = None
    for mw in app.user_middleware:
        if mw.cls == CORSMiddleware:
            cors_mw = mw
            break
    assert cors_mw is not None
    allow_origins = cors_mw.kwargs.get("allow_origins", [])
    assert "*" not in allow_origins
    assert "http://localhost:5173" in allow_origins

def test_upload_file_type_restriction():
    """Verify that disallowed file types (e.g., .exe, .sh) are rejected with 400 Bad Request."""
    fake_exe = io.BytesIO(b"MZ\x90\x00\x03\x00\x00\x00")
    res = client.post(
        "/missions/mission_complete/artifacts",
        files={"file": ("malicious_payload.exe", fake_exe, "application/octet-stream")}
    )
    assert res.status_code == 400
    assert "Unsupported file type" in res.json().get("detail", "")

def test_upload_file_size_limit():
    """Verify that files exceeding the 10 MB limit are rejected with 413 Payload Too Large."""
    oversized = io.BytesIO(b"A" * (10 * 1024 * 1024 + 500))
    res = client.post(
        "/missions/mission_complete/artifacts",
        files={"file": ("huge_document.txt", oversized, "text/plain")}
    )
    assert res.status_code == 413
    assert "exceeds the 10 MB limit" in res.json().get("detail", "")

def test_strict_auth_enforcement(monkeypatch):
    """Verify strict 401 and 403 behavior when ORBITSCORE_AUTH_ENABLED is turned on."""
    monkeypatch.setenv("ORBITSCORE_AUTH_ENABLED", "1")

    # 1. Missing token on write endpoint -> 401 Unauthorized
    res = client.post(
        "/missions/mission_complete/evaluate",
        json={"profile_id": "fcc-22-74-inspired"}
    )
    assert res.status_code == 401
    assert res.json().get("detail", {}).get("error") == "UNAUTHORIZED"

    # 2. Invalid token -> 401 Unauthorized
    res = client.post(
        "/missions/mission_complete/evaluate",
        json={"profile_id": "fcc-22-74-inspired"},
        headers={"Authorization": "Bearer invalid-token-xyz"}
    )
    assert res.status_code == 401
    assert res.json().get("detail", {}).get("error") == "INVALID_CREDENTIALS"

    # 3. Viewer token on write endpoint -> 403 Forbidden
    viewer_key = get_configured_viewer_key()
    res = client.post(
        "/missions/mission_complete/evaluate",
        json={"profile_id": "fcc-22-74-inspired"},
        headers={"Authorization": f"Bearer {viewer_key}"}
    )
    assert res.status_code == 403
    assert res.json().get("detail", {}).get("error") == "FORBIDDEN"

    # 4. Viewer token on read endpoint -> 200 OK
    res = client.get(
        "/missions",
        headers={"Authorization": f"Bearer {viewer_key}"}
    )
    assert res.status_code == 200

    # 5. Reviewer token on write endpoint -> 200 OK
    reviewer_key = get_configured_reviewer_key()
    res = client.post(
        "/missions/mission_complete/evaluate",
        json={"profile_id": "fcc-22-74-inspired"},
        headers={"Authorization": f"Bearer {reviewer_key}"}
    )
    assert res.status_code == 200
    assert "findings" in res.json()
