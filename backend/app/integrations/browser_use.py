"""
Browser Use Cloud Public-Source Capture Adapter
Captures candidate evidence excerpts from an explicit allowlist of public authoritative space regulatory pages.
Strict Safety Invariant: Rejects all non-allowlisted domains. Does not submit forms, log in, or mutate external sites.
Captured text is strictly an unconfirmed candidate for human engineer review.
"""

from __future__ import annotations
import os
import re
import urllib.parse
from datetime import datetime, timezone
from typing import Optional, Literal
from pydantic import BaseModel, Field

BROWSER_USE_TIMEOUT_SECONDS = 15.0

# Strict allowlist of public authoritative sources derived from research/SOURCE_REGISTER.md
APPROVED_PUBLIC_DOMAINS = {
    "orbitaldebris.jsc.nasa.gov",
    "ntrs.nasa.gov",
    "standards.nasa.gov",
    "nodis3.gsfc.nasa.gov",
    "www.nasa.gov",
    "nasa.gov",
    "docs.fcc.gov",
    "www.fcc.gov",
    "fcc.gov",
    "www.faa.gov",
    "faa.gov",
    "nvlpubs.nist.gov",
    "www.isro.gov.in",
    "isro.gov.in",
    "www.esa.int",
    "esa.int",
    "public.ccsds.org",
    "ccsds.org",
    "www.space-track.org",
    "space-track.org",
    "www.iso.org",
    "iso.org"
}

SYNTHETIC_WARNING = "SYNTHETIC CANDIDATE EXTRACTION - REQUIRES INDEPENDENT HUMAN VERIFICATION"

class BrowserCaptureRequest(BaseModel):
    url: str
    target_clause: Optional[str] = None
    max_excerpt_chars: int = Field(default=2000, le=5000)

class BrowserCaptureResponse(BaseModel):
    status: Literal["SUCCESS", "REJECTED_DOMAIN", "CAPTURE_FAILED", "DISABLED_FALLBACK"]
    url: str
    domain: str
    capture_time: str
    page_title: Optional[str] = None
    excerpt: Optional[str] = None
    locator: dict = Field(default_factory=dict)
    human_confirmed: bool = False  # Invariant: strictly unconfirmed
    warning: str = SYNTHETIC_WARNING
    message: Optional[str] = None

def is_browser_use_enabled() -> bool:
    """Return True only if explicitly enabled and API key is present."""
    flag = os.getenv("BROWSER_USE_ENABLED", "0").lower() in ("1", "true", "yes")
    has_key = bool(os.getenv("BROWSER_USE_API_KEY", "").strip())
    return flag and has_key

def validate_url_allowlist(url: str) -> str:
    """
    Validate that the given URL belongs to an approved public authoritative space domain.
    Enforces SSRF prevention by rejecting private IPs, loopback, userinfo, and cloud metadata targets.
    Raises ValueError if non-allowlisted, malformed, or SSRF risk.
    """
    parsed = urllib.parse.urlparse(url)
    if not parsed.scheme or parsed.scheme.lower() not in ("http", "https"):
        raise ValueError("Invalid URL scheme. Only HTTP and HTTPS are permitted.")

    if parsed.username or parsed.password:
        raise ValueError("SSRF blocked: Embedded credentials/userinfo in target URL are prohibited.")

    hostname = (parsed.hostname or "").lower().strip("[]")
    if not hostname:
        raise ValueError("URL must have a valid hostname.")

    # Block localhost, loopback, and private IPv4 / IPv6 addresses
    if hostname in ("localhost", "127.0.0.1", "::1", "0.0.0.0"):
        raise ValueError("SSRF blocked: Localhost and loopback destinations are prohibited.")

    if hostname.startswith("10.") or hostname.startswith("192.168.") or hostname.startswith("169.254."):
        raise ValueError("SSRF blocked: Private or link-local network addresses are prohibited.")

    # Block 172.16.0.0 - 172.31.255.255
    if hostname.startswith("172."):
        parts = hostname.split(".")
        if len(parts) >= 2 and parts[1].isdigit() and 16 <= int(parts[1]) <= 31:
            raise ValueError("SSRF blocked: Private class B network addresses are prohibited.")

    # Match exact domain or subdomain of approved domains
    is_allowed = False
    for approved in APPROVED_PUBLIC_DOMAINS:
        if hostname == approved or hostname.endswith(f".{approved}"):
            is_allowed = True
            break

    if not is_allowed:
        raise ValueError(
            f"Domain '{hostname}' is not in the approved public source register. "
            f"Allowed domains include: {', '.join(sorted(list(APPROVED_PUBLIC_DOMAINS)[:6]))}..."
        )
    return hostname

def capture_public_source(request: BrowserCaptureRequest) -> BrowserCaptureResponse:
    """
    Capture an excerpt from an approved public authoritative source page.
    Enforces domain allowlist before any network request is attempted.
    """
    now_iso = datetime.now(timezone.utc).isoformat()

    try:
        domain = validate_url_allowlist(request.url)
    except ValueError as val_err:
        return BrowserCaptureResponse(
            status="REJECTED_DOMAIN",
            url=request.url,
            domain="disallowed",
            capture_time=now_iso,
            human_confirmed=False,
            message=str(val_err)
        )

    if not is_browser_use_enabled():
        # Clean local mock capture for allowlisted sources in test/demo mode
        mock_excerpts = {
            "fcc.gov": "FCC Second Report and Order (FCC 22-74): In-orbit satellites in Low Earth Orbit must complete post-mission disposal within 5 years of mission termination.",
            "nasa.gov": "NASA-STD-8719.14C Requirement 4.6-1: Limit the risk of human casualty from reentering space hardware to less than 1 in 10,000.",
            "faa.gov": "FAA 14 CFR Part 450: Debris mitigation and orbital safety standards requiring passivated energy storage systems at end-of-life.",
            "esa.int": "ESA Zero Debris Policy 2030: Clear post-mission disposal probability threshold of greater than 90% for active spacecraft.",
            "iso.org": "ISO 24113: Space systems — Space debris mitigation requirements for orbital lifetime and passivation."
        }
        
        matched_text = "Official regulatory source excerpt retrieved from approved public register."
        for key, text in mock_excerpts.items():
            if key in domain:
                matched_text = text
                break

        return BrowserCaptureResponse(
            status="DISABLED_FALLBACK",
            url=request.url,
            domain=domain,
            capture_time=now_iso,
            page_title=f"Public Reference ({domain})",
            excerpt=matched_text[:request.max_excerpt_chars],
            locator={"source_url": request.url, "clause": request.target_clause or "general", "capture_method": "allowlist_mock_preview"},
            human_confirmed=False,
            message="Browser Use Cloud unconfigured/disabled; returned safe allowlisted mock excerpt without incurring provider charges."
        )

    # When remote Browser Use Cloud is enabled
    import urllib.request
    import json

    api_key = os.getenv("BROWSER_USE_API_KEY", "")
    api_url = os.getenv("BROWSER_USE_API_URL", "https://api.browser-use.com/v1")

    payload = {
        "url": request.url,
        "action": "extract_text",
        "clause": request.target_clause,
        "max_length": request.max_excerpt_chars
    }

    req = urllib.request.Request(
        f"{api_url}/browser/extract",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=BROWSER_USE_TIMEOUT_SECONDS) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return BrowserCaptureResponse(
                status="SUCCESS",
                url=request.url,
                domain=domain,
                capture_time=now_iso,
                page_title=data.get("title", f"Captured Page ({domain})"),
                excerpt=data.get("excerpt", "")[:request.max_excerpt_chars],
                locator={"source_url": request.url, "clause": request.target_clause, "cloud_run_id": data.get("run_id")},
                human_confirmed=False,
                message="Successfully captured excerpt via Browser Use Cloud."
            )
    except Exception as exc:
        return BrowserCaptureResponse(
            status="CAPTURE_FAILED",
            url=request.url,
            domain=domain,
            capture_time=now_iso,
            human_confirmed=False,
            message=f"Browser Use Cloud capture failed ({type(exc).__name__}: {exc})."
        )
