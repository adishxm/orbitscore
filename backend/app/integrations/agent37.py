"""
Agent37 Bounded Evidence-Triage Adapter
Extracts candidate field/value/date/claim pairs and exact quotations from supplied excerpts.
Strict Safety Invariant: Output fields are strictly unconfirmed candidates (human_confirmed = False).
Agent37 cannot make review decisions, alter rule evaluations, or certify evidence.
"""

from __future__ import annotations
import os
import re
import hashlib
from datetime import datetime, timezone
from typing import Any, Optional, Literal
from pydantic import BaseModel, Field

AGENT37_TIMEOUT_SECONDS = 10.0
SYNTHETIC_DISCLAIMER = "Agent37 candidate extraction only. Requires independent human engineering confirmation."

class Agent37Candidate(BaseModel):
    field: str
    value: Any
    unit: Optional[str] = None
    exact_quote: str
    source_identifier: str
    uncertainty: float = Field(ge=0.0, le=1.0, description="Estimated extraction uncertainty (0.0=certain, 1.0=uncertain)")
    confidence_tier: Literal["HIGH", "MEDIUM", "LOW"] = "MEDIUM"
    human_confirmed: bool = False  # Strict fail-closed boundary

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
    disclaimer: str = SYNTHETIC_DISCLAIMER
    message: Optional[str] = None

def is_agent37_enabled() -> bool:
    """Return True only if explicitly enabled and API key is present."""
    flag = os.getenv("AGENT37_ENABLED", "0").lower() in ("1", "true", "yes")
    has_key = bool(os.getenv("AGENT37_API_KEY", "").strip())
    return flag and has_key

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

def triage_excerpt_agent37(request: Agent37TriageRequest) -> Agent37TriageResponse:
    """
    Execute triage on a supplied excerpt.
    If remote Agent37 API is configured and enabled, attempts HTTP call with timeout.
    Otherwise, gracefully falls back to deterministic parsing without throwing fatal errors.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    source_hash = hashlib.sha256(request.excerpt.encode("utf-8")).hexdigest()

    if not is_agent37_enabled():
        # Clean local mock / fallback behavior
        candidates = _extract_candidates_deterministic(request.excerpt, request.source_identifier)
        return Agent37TriageResponse(
            status="FALLBACK_PARSED",
            provider="agent37_local_fallback",
            request_time=now_iso,
            source_hash=source_hash,
            candidates=candidates,
            message="Remote Agent37 disabled or unconfigured; parsed candidates via deterministic extractor."
        )

    # When remote Agent37 is enabled, invoke the Agent API instance
    api_key = os.getenv("AGENT37_API_KEY", "")
    instance_url = os.getenv("AGENT37_INSTANCE_URL", "https://api.agent37.com/v1")

    import urllib.request
    import json

    req_payload = {
        "task": "evidence_triage",
        "excerpt": request.excerpt,
        "source_id": request.source_identifier,
        "parameters": {"temperature": 0.0}
    }

    req = urllib.request.Request(
        f"{instance_url}/agents/triage",
        data=json.dumps(req_payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=AGENT37_TIMEOUT_SECONDS) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            raw_candidates = data.get("candidates", [])
            parsed_candidates = []
            for item in raw_candidates:
                parsed_candidates.append(Agent37Candidate(
                    field=item.get("field", "unknown_field"),
                    value=item.get("value"),
                    unit=item.get("unit"),
                    exact_quote=item.get("exact_quote", ""),
                    source_identifier=request.source_identifier,
                    uncertainty=float(item.get("uncertainty", 0.5)),
                    confidence_tier=item.get("confidence_tier", "MEDIUM"),
                    human_confirmed=False  # Invariant enforced
                ))
            return Agent37TriageResponse(
                status="SUCCESS",
                provider="agent37_cloud",
                request_time=now_iso,
                source_hash=source_hash,
                candidates=parsed_candidates,
                message=f"Agent37 cloud extracted {len(parsed_candidates)} candidate fields."
            )
    except Exception as exc:
        # Graceful fallback on network timeout or provider error
        candidates = _extract_candidates_deterministic(request.excerpt, request.source_identifier)
        return Agent37TriageResponse(
            status="FALLBACK_PARSED",
            provider="agent37_fallback_after_error",
            request_time=now_iso,
            source_hash=source_hash,
            candidates=candidates,
            message=f"Remote Agent37 call failed ({type(exc).__name__}: {exc}); successfully fell back to deterministic candidate extraction."
        )
