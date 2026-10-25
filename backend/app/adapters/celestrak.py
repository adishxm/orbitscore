"""
CelesTrak General Perturbations (GP) adapter for OrbitScore.
Strictly complies with CelesTrak retrieval and usage policies:
1. Consults official GP endpoints: https://celestrak.org/NORAD/elements/ and https://celestrak.org/usage-policy.php
2. Respects update cadence: GP data update ~every two hours; caches responses with a 7200s (2h) TTL.
3. Implements circuit-breaker: Stops repeated automatic requests after non-200 or timeout responses (15-minute cooldown).
4. Supports modern OMM JSON format to handle 6-digit and 9-digit catalog numbers, alongside legacy TLE.
5. Visibly exposes stale data, source outages, and caching state.
6. Clearly labels element records as contextual only, not operational conjunction assessment or compliance certification.
"""
from __future__ import annotations
import os
import time
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import httpx
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

BUNDLED_CELESTRAK_TLE = {
    "norad_cat_id": 25544,
    "object_name": "ISS (ZARYA) [FIXTURE REF]",
    "epoch": "2026-10-24T12:00:00Z",
    "line1": "1 25544U 98067A   26297.50000000  .00016717  00000-0  10270-3 0  9993",
    "line2": "2 25544  51.6400 208.1000 0004500 120.0000 240.0000 15.49000000    14",
    "inclination_deg": 51.64,
    "eccentricity": 0.00045,
    "semi_major_axis_km": 6798.14,
    "perigee_km": 415.0,
    "apogee_km": 425.0,
    "period_minutes": 92.8,
    "source_status": "SYNTHETIC",
    "provenance": "SYNTHETIC_FIXTURE",
    "badge": "SYNTHETIC DEMO DATA",
    "source": "CelesTrak GP Fixture Snapshot",
    "disclaimer": (
        "Contextual element set only. Raw orbital elements do not constitute operational "
        "conjunction assessment, collision probability, or regulatory compliance certification."
    ),
    "cached_at": "2026-10-24T12:00:00Z",
    "expires_at": "2099-01-01T00:00:00Z",
}

# In-memory circuit breaker state: { norad_id: { last_failed_at: timestamp, failure_count: int } }
_CIRCUIT_BREAKER: Dict[int, Dict[str, Any]] = {}
CIRCUIT_COOLDOWN_SECONDS = 900.0  # 15 minutes before retrying live API after non-200


class CelesTrakGPResult(BaseModel):
    norad_cat_id: int
    object_name: str
    epoch: str
    format: str
    inclination_deg: Optional[float] = None
    eccentricity: Optional[float] = None
    semi_major_axis_km: Optional[float] = None
    perigee_km: Optional[float] = None
    apogee_km: Optional[float] = None
    period_minutes: Optional[float] = None
    raw_data: Optional[Any] = None
    source_status: str  # LIVE, CACHED, OUTAGE_FALLBACK, SYNTHETIC
    provenance: str
    badge: str
    source: str
    cached_at: Optional[str] = None
    expires_at: Optional[str] = None
    cache_age_seconds: Optional[float] = None
    circuit_breaker_active: bool = False
    disclaimer: str = (
        "Contextual element set only. Raw orbital elements do not constitute operational "
        "conjunction assessment, collision probability, or regulatory compliance certification."
    )
    error: Optional[str] = None


def is_live_data_enabled() -> bool:
    """Check if external live network querying is authorized."""
    return os.environ.get("ORBIT_LIVE_DATA_ENABLED", "false").lower() in ("true", "1", "yes")


def is_circuit_open(norad_id: int) -> bool:
    """Check whether recent errors trigger a cooldown to prevent hitting CelesTrak repeatedly."""
    state = _CIRCUIT_BREAKER.get(norad_id)
    if not state:
        return False
    elapsed = time.time() - state.get("last_failed_at", 0)
    if elapsed < CIRCUIT_COOLDOWN_SECONDS and state.get("failure_count", 0) >= 1:
        return True
    return False


def record_circuit_failure(norad_id: int, status_code: int = 0):
    """Record non-200 response to trip the circuit breaker."""
    state = _CIRCUIT_BREAKER.setdefault(norad_id, {"failure_count": 0, "last_failed_at": 0})
    state["failure_count"] += 1
    state["last_failed_at"] = time.time()
    state["last_status"] = status_code


def record_circuit_success(norad_id: int):
    """Reset circuit breaker upon verified 200 response."""
    if norad_id in _CIRCUIT_BREAKER:
        _CIRCUIT_BREAKER[norad_id]["failure_count"] = 0


async def fetch_celestrak_gp(
    norad_id: int = 25544,
    format: str = "JSON",
    force_refresh: bool = False,
) -> CelesTrakGPResult:
    """
    Fetch General Perturbations (GP) data from CelesTrak complying with the 2-hour update policy.
    1. Checks local durable SQLite cache for valid non-expired 2-hour record.
    2. If cache hit and not expired, returns cached data immediately without external network call.
    3. If expired/missing and live enabled, checks circuit-breaker.
    4. If circuit open or live disabled, returns cached/synthetic fixture with outage notice.
    5. Requests either JSON (OMM standard, supports 6-digit & 9-digit catalog IDs) or TLE.
    """
    fmt = format.upper()
    now_utc = datetime.now(timezone.utc)
    now_iso = now_utc.isoformat()

    # 1. Check local durable SQLite cache
    try:
        from backend.app.db import get_cached_celestrak, save_celestrak_cache
    except ImportError:
        from app.db import get_cached_celestrak, save_celestrak_cache
    cached = get_cached_celestrak(norad_id, fmt)

    if cached and not force_refresh:
        is_expired = cached.get("is_expired", False)
        if not is_expired:
            c_data = cached.get("data", {})
            try:
                fetched_dt = datetime.fromisoformat(cached["fetched_at"].replace("Z", "+00:00"))
                age_sec = (now_utc - fetched_dt).total_seconds()
            except Exception:
                age_sec = 0.0

            return CelesTrakGPResult(
                norad_cat_id=norad_id,
                object_name=c_data.get("object_name", f"CATNR_{norad_id}"),
                epoch=c_data.get("epoch", "cached"),
                format=fmt,
                inclination_deg=c_data.get("inclination_deg"),
                eccentricity=c_data.get("eccentricity"),
                semi_major_axis_km=c_data.get("semi_major_axis_km"),
                perigee_km=c_data.get("perigee_km"),
                apogee_km=c_data.get("apogee_km"),
                period_minutes=c_data.get("period_minutes"),
                raw_data=c_data.get("raw_data") or cached.get("raw_text"),
                source_status="CACHED",
                provenance="CACHED_SOURCE_CITED",
                badge="CACHED-2H-CADENCE",
                source="CelesTrak GP API (2-Hour Policy Cache)",
                cached_at=cached["fetched_at"],
                expires_at=cached["expires_at"],
                cache_age_seconds=round(age_sec, 1),
                circuit_breaker_active=False,
            )

    # If live queries are not enabled, return synthetic fallback or expired cached record
    if not is_live_data_enabled():
        if cached:
            c_data = cached.get("data", {})
            return CelesTrakGPResult(
                norad_cat_id=norad_id,
                object_name=c_data.get("object_name", f"CATNR_{norad_id}"),
                epoch=c_data.get("epoch", "offline_cache"),
                format=fmt,
                inclination_deg=c_data.get("inclination_deg"),
                eccentricity=c_data.get("eccentricity"),
                semi_major_axis_km=c_data.get("semi_major_axis_km"),
                perigee_km=c_data.get("perigee_km"),
                apogee_km=c_data.get("apogee_km"),
                period_minutes=c_data.get("period_minutes"),
                raw_data=c_data.get("raw_data") or cached.get("raw_text"),
                source_status="CACHED",
                provenance="OFFLINE_SNAPSHOT",
                badge="OFFLINE-PRESERVED",
                source="CelesTrak GP Local Offline Snapshot",
                cached_at=cached["fetched_at"],
                expires_at=cached["expires_at"],
                circuit_breaker_active=False,
            )

        # Bundled fixture fallback
        fixture = dict(BUNDLED_CELESTRAK_TLE)
        return CelesTrakGPResult(
            norad_cat_id=norad_id,
            object_name=fixture["object_name"],
            epoch=fixture["epoch"],
            format=fmt,
            inclination_deg=fixture.get("inclination_deg"),
            eccentricity=fixture.get("eccentricity"),
            semi_major_axis_km=fixture.get("semi_major_axis_km"),
            perigee_km=fixture.get("perigee_km"),
            apogee_km=fixture.get("apogee_km"),
            period_minutes=fixture.get("period_minutes"),
            raw_data=fixture,
            source_status="SYNTHETIC",
            provenance="SYNTHETIC_FIXTURE",
            badge="SYNTHETIC DEMO DATA",
            source="CelesTrak GP Fixture Snapshot (Live Disabled)",
            cached_at=now_iso,
            expires_at=now_iso,
            circuit_breaker_active=False,
        )

    # Check circuit breaker
    if is_circuit_open(norad_id):
        err_msg = (
            f"Circuit breaker active for NORAD ID {norad_id} following recent non-200 responses. "
            f"Halting repeated automated requests in compliance with CelesTrak usage policy. "
            f"Cooldown in effect ({CIRCUIT_COOLDOWN_SECONDS / 60:.0f} min)."
        )
        logger.warning(err_msg)
        if cached:
            c_data = cached.get("data", {})
            return CelesTrakGPResult(
                norad_cat_id=norad_id,
                object_name=c_data.get("object_name", f"CATNR_{norad_id}"),
                epoch=c_data.get("epoch", "stale_outage"),
                format=fmt,
                inclination_deg=c_data.get("inclination_deg"),
                eccentricity=c_data.get("eccentricity"),
                semi_major_axis_km=c_data.get("semi_major_axis_km"),
                perigee_km=c_data.get("perigee_km"),
                apogee_km=c_data.get("apogee_km"),
                period_minutes=c_data.get("period_minutes"),
                raw_data=c_data.get("raw_data"),
                source_status="OUTAGE_FALLBACK",
                provenance="STALE_PRESERVED",
                badge="CIRCUIT-BREAKER-COOLDOWN",
                source="CelesTrak (Circuit Breaker Cooldown Fallback)",
                cached_at=cached["fetched_at"],
                expires_at=cached["expires_at"],
                circuit_breaker_active=True,
                error=err_msg,
            )
        return CelesTrakGPResult(
            norad_cat_id=norad_id,
            object_name=f"CATNR_{norad_id} (CIRCUIT OPEN)",
            epoch=now_iso,
            format=fmt,
            source_status="OUTAGE_FALLBACK",
            provenance="SYNTHETIC_FIXTURE",
            badge="CIRCUIT-OPEN",
            source="CelesTrak Fallback Fixture",
            circuit_breaker_active=True,
            error=err_msg,
        )

    # 3. Live query to CelesTrak GP endpoint
    # CelesTrak query pattern: https://celestrak.org/NORAD/elements/gp.php?CATNR={CATNR}&FORMAT={FORMAT}
    target_format = "JSON" if fmt in ("JSON", "OMM") else ("CSV" if fmt == "CSV" else "TLE")
    url = f"https://celestrak.org/NORAD/elements/gp.php?CATNR={norad_id}&FORMAT={target_format}"

    try:
        async with httpx.AsyncClient(timeout=10.0, headers={"User-Agent": "OrbitScore-Compliance-Inspector/1.0"}) as client:
            resp = await client.get(url)

            if resp.status_code != 200:
                record_circuit_failure(norad_id, resp.status_code)
                err_msg = f"CelesTrak returned HTTP {resp.status_code}; cooling down per usage policy."
                logger.warning(err_msg)
                if cached:
                    c_data = cached.get("data", {})
                    return CelesTrakGPResult(
                        norad_cat_id=norad_id,
                        object_name=c_data.get("object_name", f"CATNR_{norad_id}"),
                        epoch=c_data.get("epoch", "cached"),
                        format=fmt,
                        inclination_deg=c_data.get("inclination_deg"),
                        eccentricity=c_data.get("eccentricity"),
                        semi_major_axis_km=c_data.get("semi_major_axis_km"),
                        perigee_km=c_data.get("perigee_km"),
                        apogee_km=c_data.get("apogee_km"),
                        period_minutes=c_data.get("period_minutes"),
                        raw_data=c_data.get("raw_data"),
                        source_status="OUTAGE_FALLBACK",
                        provenance="STALE_PRESERVED",
                        badge="SOURCE-OUTAGE-FALLBACK",
                        source="CelesTrak (Preserved Stale Cache)",
                        cached_at=cached["fetched_at"],
                        expires_at=cached["expires_at"],
                        circuit_breaker_active=True,
                        error=err_msg,
                    )
                return CelesTrakGPResult(
                    norad_cat_id=norad_id,
                    object_name=f"CATNR_{norad_id}",
                    epoch=now_iso,
                    format=fmt,
                    source_status="OUTAGE_FALLBACK",
                    provenance="SYNTHETIC_FIXTURE",
                    badge="SOURCE-ERROR",
                    source="CelesTrak Fallback",
                    circuit_breaker_active=True,
                    error=err_msg,
                )

            # Success: reset circuit breaker
            record_circuit_success(norad_id)

            parsed_data: Dict[str, Any] = {}
            name = f"CATNR_{norad_id}"
            epoch_str = now_iso
            inc = None
            ecc = None
            sma = None
            perigee = None
            apogee = None
            period = None

            if target_format == "JSON":
                try:
                    omm_list = resp.json()
                    item = omm_list[0] if isinstance(omm_list, list) and omm_list else omm_list
                    name = item.get("OBJECT_NAME", name)
                    epoch_str = item.get("EPOCH", epoch_str)
                    inc = float(item.get("INCLINATION", 0.0))
                    ecc = float(item.get("ECCENTRICITY", 0.0))
                    sma = float(item.get("SEMIMAJOR_AXIS", 6800.0))
                    period = float(item.get("PERIOD", 90.0))
                    perigee = round(sma * (1.0 - ecc) - 6378.137, 2)
                    apogee = round(sma * (1.0 + ecc) - 6378.137, 2)
                    parsed_data = {
                        "object_name": name,
                        "epoch": epoch_str,
                        "inclination_deg": inc,
                        "eccentricity": ecc,
                        "semi_major_axis_km": sma,
                        "perigee_km": perigee,
                        "apogee_km": apogee,
                        "period_minutes": period,
                        "raw_data": item,
                    }
                except Exception as parse_err:
                    logger.warning(f"Failed parsing CelesTrak JSON response: {parse_err}")
            elif target_format == "TLE":
                lines = resp.text.strip().splitlines()
                if len(lines) >= 2:
                    name = lines[0].strip() if len(lines) >= 3 else f"CATNR_{norad_id}"
                    l2 = lines[-1].strip()
                    try:
                        inc = float(l2[8:16].strip())
                        ecc = float("0." + l2[26:33].strip())
                        mean_motion = float(l2[52:63].strip())
                        period = round(1440.0 / mean_motion, 2) if mean_motion > 0 else 90.0
                        sma = round((398600.4418 / ((mean_motion * 2.0 * 3.14159265 / 86400.0) ** 2)) ** (1.0 / 3.0), 2)
                        perigee = round(sma * (1.0 - ecc) - 6378.137, 2)
                        apogee = round(sma * (1.0 + ecc) - 6378.137, 2)
                    except Exception:
                        pass
                    parsed_data = {
                        "object_name": name,
                        "epoch": "live",
                        "line1": lines[-2].strip(),
                        "line2": l2,
                        "inclination_deg": inc,
                        "eccentricity": ecc,
                        "semi_major_axis_km": sma,
                        "perigee_km": perigee,
                        "apogee_km": apogee,
                        "period_minutes": period,
                        "raw_data": resp.text.strip(),
                    }

            # Cache the verified 200 response for 2 hours (7200 seconds)
            save_celestrak_cache(
                norad_id=norad_id,
                format=fmt,
                status_code=200,
                data_dict=parsed_data,
                raw_text=resp.text,
                ttl_seconds=7200,
            )

            from datetime import timedelta
            expires_iso = (now_utc + timedelta(seconds=7200)).isoformat()

            return CelesTrakGPResult(
                norad_cat_id=norad_id,
                object_name=name,
                epoch=epoch_str,
                format=fmt,
                inclination_deg=inc,
                eccentricity=ecc,
                semi_major_axis_km=sma,
                perigee_km=perigee,
                apogee_km=apogee,
                period_minutes=period,
                raw_data=parsed_data.get("raw_data") or resp.text,
                source_status="LIVE",
                provenance="LIVE_SOURCE_CITED",
                badge="LIVE-SOURCE-CITED",
                source="CelesTrak General Perturbations (GP) API",
                cached_at=now_iso,
                expires_at=expires_iso,
                cache_age_seconds=0.0,
                circuit_breaker_active=False,
            )

    except Exception as exc:
        record_circuit_failure(norad_id)
        err_msg = f"CelesTrak connection failed ({type(exc).__name__}: {exc}); cooling down."
        logger.warning(err_msg)
        if cached:
            c_data = cached.get("data", {})
            return CelesTrakGPResult(
                norad_cat_id=norad_id,
                object_name=c_data.get("object_name", f"CATNR_{norad_id}"),
                epoch=c_data.get("epoch", "cached"),
                format=fmt,
                inclination_deg=c_data.get("inclination_deg"),
                eccentricity=c_data.get("eccentricity"),
                semi_major_axis_km=c_data.get("semi_major_axis_km"),
                perigee_km=c_data.get("perigee_km"),
                apogee_km=c_data.get("apogee_km"),
                period_minutes=c_data.get("period_minutes"),
                raw_data=c_data.get("raw_data"),
                source_status="OUTAGE_FALLBACK",
                provenance="STALE_PRESERVED",
                badge="NETWORK-OUTAGE-FALLBACK",
                source="CelesTrak (Network Outage Preserved Fallback)",
                cached_at=cached["fetched_at"],
                expires_at=cached["expires_at"],
                circuit_breaker_active=True,
                error=err_msg,
            )
        fixture = dict(BUNDLED_CELESTRAK_TLE)
        return CelesTrakGPResult(
            norad_cat_id=norad_id,
            object_name=fixture["object_name"],
            epoch=fixture["epoch"],
            format=fmt,
            inclination_deg=fixture.get("inclination_deg"),
            eccentricity=fixture.get("eccentricity"),
            semi_major_axis_km=fixture.get("semi_major_axis_km"),
            perigee_km=fixture.get("perigee_km"),
            apogee_km=fixture.get("apogee_km"),
            period_minutes=fixture.get("period_minutes"),
            raw_data=fixture,
            source_status="OUTAGE_FALLBACK",
            provenance="SYNTHETIC_FIXTURE",
            badge="OUTAGE-FALLBACK",
            source="CelesTrak Fallback Snapshot",
            cached_at=now_iso,
            expires_at=now_iso,
            circuit_breaker_active=True,
            error=err_msg,
        )


async def fetch_celestrak_tle(norad_id: int = 25544) -> Dict[str, Any]:
    """Backward compatibility wrapper returning dict representation."""
    result = await fetch_celestrak_gp(norad_id, format="TLE")
    return result.model_dump()
