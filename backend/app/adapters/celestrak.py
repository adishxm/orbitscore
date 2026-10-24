"""
CelesTrak GP/TLE adapter for OrbitScore.
Safely respects ORBIT_LIVE_DATA_ENABLED flag and falls back to bundled fixture data.
"""
import os
from typing import Dict, Any
import httpx

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
    "provenance": "SYNTHETIC_FIXTURE",
    "badge": "SYNTHETIC DEMO DATA",
    "source": "CelesTrak GP Fixture Snapshot"
}


async def fetch_celestrak_tle(norad_id: int = 25544) -> Dict[str, Any]:
    """Fetch TLE from CelesTrak public endpoint or return bundled fixture."""
    live_enabled = os.environ.get("ORBIT_LIVE_DATA_ENABLED", "false").lower() in ("true", "1", "yes")
    if not live_enabled:
        return BUNDLED_CELESTRAK_TLE

    url = f"https://celestrak.org/NORAD/elements/gp.php?CATNR={norad_id}&FORMAT=TLE"
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200 and len(resp.text.strip().splitlines()) >= 2:
                lines = resp.text.strip().splitlines()
                name = lines[0].strip() if len(lines) == 3 else f"CATNR_{norad_id}"
                l1 = lines[-2].strip()
                l2 = lines[-1].strip()
                return {
                    "norad_cat_id": norad_id,
                    "object_name": name,
                    "epoch": "live",
                    "line1": l1,
                    "line2": l2,
                    "inclination_deg": float(l2[8:16].strip()),
                    "eccentricity": float("0." + l2[26:33].strip()),
                    "semi_major_axis_km": 6800.0,
                    "provenance": "LIVE_SOURCE_CITED",
                    "badge": "LIVE-SOURCE-CITED",
                    "source": "CelesTrak General Perturbations (GP) API"
                }
    except Exception as exc:
        data = dict(BUNDLED_CELESTRAK_TLE)
        data["error"] = f"CelesTrak live fetch failed ({str(exc)}); using fallback fixture."
        return data

    return BUNDLED_CELESTRAK_TLE
