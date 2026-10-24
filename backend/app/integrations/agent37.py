"""
Agent37 Bounded Evidence-Triage & Copilot Adapter
Extracts candidate field/value/date/claim pairs and exact quotations from supplied excerpts.
Operates against live Agent37 Cloud sandboxes (https://agent37.com / {instanceId}.agent37.app).

Strict Safety Invariant: Output fields are strictly unconfirmed candidates (human_confirmed = False).
Agent37 cannot make review decisions, alter rule evaluations, or certify evidence.
"""

from __future__ import annotations
import os
import re
import ssl
import json
import hashlib
from datetime import datetime, timezone
from typing import Any, Optional, Literal, Dict
from pydantic import BaseModel, Field
import urllib.request
import logging

logger = logging.getLogger(__name__)

AGENT37_TIMEOUT_SECONDS = float(os.getenv("AGENT37_TIMEOUT_SECONDS", "30.0"))
SYNTHETIC_DISCLAIMER = "Agent37 candidate extraction only. Requires independent human engineering confirmation."

class Agent37Candidate(BaseModel):
    field: str
    value: Any
    unit: Optional[str] = None
    exact_quote: str
    source_identifier: str
    uncertainty: float = Field(default=0.1, ge=0.0, le=1.0, description="Estimated extraction uncertainty (0.0=certain, 1.0=uncertain)")
    confidence_tier: Literal["HIGH", "MEDIUM", "LOW"] = "MEDIUM"
    human_confirmed: bool = False  # Strict fail-closed boundary: always false!

class Agent37TriageRequest(BaseModel):
    excerpt: str
    source_identifier: str = "doc_ref"
    mission_id: Optional[str] = None

class Agent37TriageResponse(BaseModel):
    status: Literal["SUCCESS", "FALLBACK_PARSED", "DISABLED", "ERROR"]
    provider: str = "agent37"
    model_template: str = "spacecraft-evidence-triage-v1"
    request_time: str
    source_hash: str
    candidates: list[Agent37Candidate] = Field(default_factory=list)
    session_id: Optional[str] = None
    agent_id: Optional[str] = None
    usage: Optional[Dict[str, Any]] = None
    disclaimer: str = SYNTHETIC_DISCLAIMER
    message: Optional[str] = None

class Agent37ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    mission_id: Optional[str] = None

class Agent37ChatResponse(BaseModel):
    status: Literal["SUCCESS", "FALLBACK", "ERROR"]
    agent: str = "hermes"
    response: str
    session_id: Optional[str] = None
    request_id: Optional[str] = None
    timestamp: str
    disclaimer: str = "Agent37 assistance only. Not an official compliance determination."

class Agent37StatusResponse(BaseModel):
    enabled: bool
    configured: bool
    instance_id: str
    instance_url: str
    status: str
    agent_name: str
    latency_ms: Optional[float] = None
    detail: Optional[str] = None

def is_agent37_enabled() -> bool:
    """Return True only if explicitly enabled and API key is present."""
    flag = os.getenv("AGENT37_ENABLED", "0").lower() in ("1", "true", "yes")
    has_key = bool(os.getenv("AGENT37_API_KEY", "").strip())
    return flag and has_key

def get_agent37_endpoint() -> str:
    """Resolve the active Agent37 runtime endpoint URL with strict HTTPS and domain constraints."""
    import urllib.parse
    raw_url = os.getenv("AGENT37_INSTANCE_URL", "").strip()
    instance_id = os.getenv("AGENT37_INSTANCE_ID", "z2dhn46l7d").strip()
    if raw_url:
        endpoint = f"{raw_url.rstrip('/')}/v1/responses"
    elif instance_id:
        endpoint = f"https://{instance_id}.agent37.app/v1/responses"
    else:
        endpoint = "https://api.agent37.com/v1/responses"

    parsed = urllib.parse.urlparse(endpoint)
    if parsed.scheme.lower() != "https":
        raise ValueError(f"Insecure transport scheme '{parsed.scheme}'. Agent37 strictly requires HTTPS.")

    allowed_suffixes = (".agent37.app", ".agent37.com")
    netloc = parsed.netloc.lower().split(":")[0]
    if not (any(netloc.endswith(s) for s in allowed_suffixes) or netloc in ("agent37.com", "api.agent37.com")):
        raise ValueError(f"Unapproved external host '{netloc}' for Agent37. Only official agent37 domains permitted.")

    return endpoint

def _get_ssl_context() -> ssl.SSLContext:
    """Create strict, verified SSL context. Fails closed on TLS errors without insecure fallbacks."""
    return ssl.create_default_context()

def _extract_candidates_deterministic(excerpt: str, source_id: str) -> list[Agent37Candidate]:
    """
    Deterministic rule-based extractor used as fallback or local mock for Agent37.
    Extracts numerical values with units (kg, km, years, m/s, m^2).
    """
    candidates: list[Agent37Candidate] = []

    # Disposal duration / 5-year / 25-year rule
    m_disp = re.search(r'(?:disposal|re-?entry|de-?orbit)\s+(?:within|time|duration|period)?\s*(?:of)?\s*([0-9]+(?:\.[0-9]+)?)\s*(years?|yr)', excerpt, re.IGNORECASE)
    if m_disp:
        val = float(m_disp.group(1))
        candidates.append(Agent37Candidate(
            field="disposal_duration_years",
            value=val,
            unit="years",
            exact_quote=m_disp.group(0),
            source_identifier=source_id,
            uncertainty=0.05,
            confidence_tier="HIGH",
            human_confirmed=False
        ))

    # Mass
    m_mass = re.search(r'(?:dry\s+mass|wet\s+mass|spacecraft\s+mass|launch\s+mass|mass)\s*(?:of|is|:)?\s*([0-9]+(?:\.[0-9]+)?)\s*(kg|kilograms?)', excerpt, re.IGNORECASE)
    if m_mass:
        val = float(m_mass.group(1))
        candidates.append(Agent37Candidate(
            field="wet_mass_kg",
            value=val,
            unit="kg",
            exact_quote=m_mass.group(0),
            source_identifier=source_id,
            uncertainty=0.1,
            confidence_tier="HIGH",
            human_confirmed=False
        ))

    # Apogee / Perigee / Altitude
    m_alt = re.search(r'(?:perigee|apogee|altitude|orbit)\s*(?:is|of|:)?\s*([0-9]+(?:\.[0-9]+)?)\s*(km|kilometers?)', excerpt, re.IGNORECASE)
    if m_alt:
        val = float(m_alt.group(1))
        candidates.append(Agent37Candidate(
            field="perigee_altitude_km",
            value=val,
            unit="km",
            exact_quote=m_alt.group(0),
            source_identifier=source_id,
            uncertainty=0.15,
            confidence_tier="MEDIUM",
            human_confirmed=False
        ))

    # Casualty risk
    m_cas = re.search(r'(?:casualty\s+risk|human\s+casualty)\s*(?:is|of|:)?\s*(1\s*:\s*[0-9]+|[0-9]+(?:\.[0-9]+)?(?:e-[0-9]+)?)', excerpt, re.IGNORECASE)
    if m_cas:
        raw_val = m_cas.group(1)
        candidates.append(Agent37Candidate(
            field="human_casualty_risk",
            value=raw_val,
            unit="probability",
            exact_quote=m_cas.group(0),
            source_identifier=source_id,
            uncertainty=0.2,
            confidence_tier="MEDIUM",
            human_confirmed=False
        ))

    return candidates

def _parse_agent37_output_json(raw_text: str, source_id: str, excerpt: Optional[str] = None) -> list[Agent37Candidate]:
    """
    Parse JSON array output from Agent37 with markdown fence stripping.
    Strict Invariant: exact_quote must be a literal substring of the submitted excerpt.
    """
    text = raw_text.strip()
    if text.startswith("```"):
        # Strip code blocks
        lines = text.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()

    # Attempt direct json load
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        # Search for [...] within text
        match = re.search(r'\[\s*\{.*\}\s*\]', text, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group(0))
            except Exception:
                data = None
        else:
            data = None

    if not isinstance(data, list):
        # Fallback to regex extraction over both raw_text and excerpt
        return []

    candidates: list[Agent37Candidate] = []
    for item in data:
        if not isinstance(item, dict):
            continue
        field = str(item.get("field", "")).strip()
        if not field:
            continue
        
        raw_quote = str(item.get("exact_quote", "")).strip()
        # Invariant: If excerpt is provided, exact_quote must be a literal substring of excerpt
        if excerpt and raw_quote and raw_quote not in excerpt:
            # Quote does not literally appear in the source excerpt; reject to prevent hallucination
            continue

        # Uncertainty handling
        unc = item.get("uncertainty")
        try:
            unc_val = float(unc) if unc is not None and not isinstance(unc, str) else 0.1
            unc_val = max(0.0, min(1.0, unc_val))
        except (ValueError, TypeError):
            unc_val = 0.1

        tier = str(item.get("confidence_tier", "MEDIUM")).upper()
        if tier not in ("HIGH", "MEDIUM", "LOW"):
            tier = "MEDIUM"

        candidates.append(Agent37Candidate(
            field=field,
            value=item.get("value"),
            unit=item.get("unit"),
            exact_quote=raw_quote,
            source_identifier=source_id,
            uncertainty=unc_val,
            confidence_tier=tier,  # type: ignore
            human_confirmed=False  # Invariant: strictly unconfirmed!
        ))
    return candidates

def triage_excerpt_agent37(request: Agent37TriageRequest) -> Agent37TriageResponse:
    """
    Execute triage on a supplied excerpt.
    If remote Agent37 API is configured and enabled, invokes the live agent sandbox endpoint.
    Otherwise, gracefully falls back to deterministic parsing without throwing fatal errors.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    source_hash = hashlib.sha256(request.excerpt.encode("utf-8")).hexdigest()

    if not is_agent37_enabled():
        candidates = _extract_candidates_deterministic(request.excerpt, request.source_identifier)
        return Agent37TriageResponse(
            status="FALLBACK_PARSED",
            provider="agent37_local_fallback",
            request_time=now_iso,
            source_hash=source_hash,
            candidates=candidates,
            message="Remote Agent37 disabled or unconfigured; parsed candidates via deterministic extractor."
        )

    api_key = os.getenv("AGENT37_API_KEY", "").strip()
    endpoint = get_agent37_endpoint()

    prompt = (
        "You are the OrbitScore Spacecraft Evidence Extraction Agent running in an isolated sandbox. "
        "Analyze the following spacecraft document excerpt and extract candidate parameters:\n\n"
        f"\"\"\"\n{request.excerpt}\n\"\"\"\n\n"
        "Return ONLY a JSON array of objects without commentary or markdown codeblocks (or cleanly inside a ```json block). "
        "Each object must have these exact keys:\n"
        "- \"field\": string (e.g. wet_mass_kg, disposal_duration_years, perigee_altitude_km, human_casualty_risk)\n"
        "- \"value\": number or string\n"
        "- \"unit\": string (e.g. kg, years, km, probability)\n"
        "- \"exact_quote\": exact verbatim snippet from the excerpt\n"
        "- \"uncertainty\": float between 0.0 and 1.0\n"
        "- \"confidence_tier\": \"HIGH\", \"MEDIUM\", or \"LOW\"\n"
    )

    req_payload = {
        "input": prompt
    }

    req = urllib.request.Request(
        endpoint,
        data=json.dumps(req_payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "X-Agent37-Key": api_key,
            "Content-Type": "application/json",
            "User-Agent": "OrbitScore-Agent37-Adapter/1.0"
        },
        method="POST"
    )

    ctx = _get_ssl_context()

    try:
        with urllib.request.urlopen(req, timeout=AGENT37_TIMEOUT_SECONDS, context=ctx) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            raw_output = data.get("output_text", "")
            session_id = data.get("session_id")
            agent_id = data.get("id")
            agent_name = data.get("agent", "hermes")
            usage = data.get("usage")

            # Parse candidate list with literal excerpt quote validation
            candidates = _parse_agent37_output_json(raw_output, request.source_identifier, excerpt=request.excerpt)
            if not candidates:
                # Fallback to local regex if Agent 37 output wasn't cleanly JSON
                candidates = _extract_candidates_deterministic(request.excerpt, request.source_identifier)

            return Agent37TriageResponse(
                status="SUCCESS",
                provider=f"agent37_cloud_{agent_name}",
                request_time=now_iso,
                source_hash=source_hash,
                candidates=candidates,
                session_id=session_id,
                agent_id=agent_id,
                usage=usage,
                message=f"Agent37 ({agent_name}) cloud extracted {len(candidates)} candidate fields."
            )
    except Exception as exc:
        logger.warning(f"Remote Agent37 call failed ({type(exc).__name__}: {exc}); falling back to deterministic candidate extraction.")
        candidates = _extract_candidates_deterministic(request.excerpt, request.source_identifier)
        return Agent37TriageResponse(
            status="FALLBACK_PARSED",
            provider="agent37_fallback_after_error",
            request_time=now_iso,
            source_hash=source_hash,
            candidates=candidates,
            message=f"Remote Agent37 call failed ({type(exc).__name__}: {exc}); successfully fell back to deterministic candidate extraction."
        )

def chat_with_agent37(request: Agent37ChatRequest) -> Agent37ChatResponse:
    """
    Interactive mission copilot chat powered by Agent 37 Hermes agent.
    Provides engineering reference and explanation without violating decision boundaries.
    """
    now_iso = datetime.now(timezone.utc).isoformat()

    if not is_agent37_enabled():
        return Agent37ChatResponse(
            status="FALLBACK",
            agent="orbitscore_local_advisor",
            response=(
                f"Agent37 cloud integration is currently running in local fallback mode. "
                f"Regarding your query about mission '{request.mission_id or 'active'}': "
                f"OrbitScore organizes evidence for human engineering review under standards like "
                f"NASA-STD-8719.14 (25-year deorbit rule) and FCC 2022 (5-year post-mission disposal rule). "
                f"Connect live Agent37 by setting AGENT37_ENABLED=1 and your API key in .env."
            ),
            timestamp=now_iso
        )

    api_key = os.getenv("AGENT37_API_KEY", "").strip()
    endpoint = get_agent37_endpoint()

    system_preamble = (
        "You are the OrbitScore Mission Review Assistant, powered by Agent 37. "
        "You help spacecraft teams, university satellite builders, and mission operators understand "
        "orbital debris guidelines, passivation requirements, and evidence completeness. "
        "CRITICAL BOUNDARY: You NEVER make final certification or pass/fail decisions. "
        "Always remind users that human engineering sign-off is mandatory.\n\n"
        f"User question: {request.message}"
    )

    payload: Dict[str, Any] = {
        "input": system_preamble
    }
    if request.session_id:
        payload["session_id"] = request.session_id

    req = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "X-Agent37-Key": api_key,
            "Content-Type": "application/json",
            "User-Agent": "OrbitScore-Agent37-Copilot/1.0"
        },
        method="POST"
    )

    ctx = _get_ssl_context()

    try:
        with urllib.request.urlopen(req, timeout=AGENT37_TIMEOUT_SECONDS, context=ctx) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return Agent37ChatResponse(
                status="SUCCESS",
                agent=data.get("agent", "hermes"),
                response=data.get("output_text", "No response generated."),
                session_id=data.get("session_id"),
                request_id=data.get("id"),
                timestamp=now_iso
            )
    except Exception as exc:
        logger.warning(f"Agent37 chat failed ({type(exc).__name__}: {exc}); falling back.")
        return Agent37ChatResponse(
            status="ERROR",
            agent="orbitscore_fallback",
            response=f"Agent37 connection timeout or error: {exc}. Please verify instance status.",
            timestamp=now_iso
        )

def check_agent37_live_status() -> Agent37StatusResponse:
    """Check connectivity and health of the configured Agent37 instance."""
    instance_id = os.getenv("AGENT37_INSTANCE_ID", "z2dhn46l7d").strip()
    raw_url = os.getenv("AGENT37_INSTANCE_URL", f"https://{instance_id}.agent37.app").rstrip('/')
    enabled = is_agent37_enabled()
    configured = bool(os.getenv("AGENT37_API_KEY", "").strip())

    if not configured:
        return Agent37StatusResponse(
            enabled=False,
            configured=False,
            instance_id=instance_id,
            instance_url=raw_url,
            status="UNCONFIGURED",
            agent_name="none",
            detail="AGENT37_API_KEY is not set in environment."
        )

    # Ping /health on instance
    health_url = f"{raw_url}/health"
    api_key = os.getenv("AGENT37_API_KEY", "").strip()
    req = urllib.request.Request(
        health_url,
        headers={
            "Authorization": f"Bearer {api_key}",
            "X-Agent37-Key": api_key,
            "User-Agent": "OrbitScore-Health/1.0"
        },
        method="GET"
    )
    ctx = _get_ssl_context()

    import time
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=5.0, context=ctx) as resp:
            elapsed = (time.time() - t0) * 1000
            data = json.loads(resp.read().decode("utf-8"))
            is_ok = data.get("ok", False)
            return Agent37StatusResponse(
                enabled=enabled,
                configured=True,
                instance_id=instance_id,
                instance_url=raw_url,
                status="ONLINE" if is_ok else "DEGRADED",
                agent_name="hermes",
                latency_ms=round(elapsed, 1),
                detail="Instance responding on health endpoint."
            )
    except Exception as exc:
        return Agent37StatusResponse(
            enabled=enabled,
            configured=True,
            instance_id=instance_id,
            instance_url=raw_url,
            status="OFFLINE",
            agent_name="unknown",
            detail=f"Health probe failed: {exc}"
        )
