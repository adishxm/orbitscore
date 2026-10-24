"""
OrbitScore Telemetry and Ephemeris Adapters.
Controlled by ORBIT_LIVE_DATA_ENABLED (default false for air-gapped/synthetic mode).
"""
from .space_track import fetch_space_track_tle
from .celestrak import fetch_celestrak_tle

__all__ = ["fetch_space_track_tle", "fetch_celestrak_tle"]
