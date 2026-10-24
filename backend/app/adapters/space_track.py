"""
Space-Track adapter for OrbitScore.
Safely respects ORBIT_LIVE_DATA_ENABLED flag and falls back to bundled fixture data.
"""
import os
from typing import Dict, Any

BUNDLED_ASTERIA3_TLE = {
    "norad_cat_id": 99999,
    "object_name": "ASTERIA-3 (DEMO)",
    "epoch": "2026-10-24T12:00:00Z",
    "line1": "1 99999U 26001A   26297.50000000  .00001000  00000-0  10000-4 0  9991",
    "line2": "2 99999  97.4000 120.5000 0010000  45.0000 315.0000 15.15000000    12",
    "inclination_deg": 97.4,
    "eccentricity": 0.001,
    "semi_major_axis_km": 6878.14,
    "perigee_km": 493.26,
    "apogee_km": 506.88,
    "period_minutes": 94.6,
    "provenance": "SYNTHETIC_FIXTURE",
    "badge": "SYNTHETIC DEMO DATA",
    "source": "Bundled Test Fixtures (Asteria-3)"
}


async def fetch_space_track_tle(norad_id: int = 99999) -> Dict[str, Any]:
    """Return live TLE from Space-Track if enabled, else return bundled fixture TLE."""
    live_enabled = os.environ.get("ORBIT_LIVE_DATA_ENABLED", "false").lower() in ("true", "1", "yes")
    if not live_enabled:
        return BUNDLED_ASTERIA3_TLE

    try:
        from ..integrations.space_track import SpaceTrackClient
        client = SpaceTrackClient()
        tle = await client.fetch_tle(norad_id)
        data = tle.model_dump()
        data["provenance"] = "LIVE_SOURCE_CITED"
        data["badge"] = "LIVE-SOURCE-CITED"
        return data
    except Exception as exc:
        data = dict(BUNDLED_ASTERIA3_TLE)
        data["error"] = f"Live fetch failed ({str(exc)}); using fallback fixture."
        return data
