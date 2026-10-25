# T026 — Live Telemetry and Data Mode Separation

- status: done
- owner: Aditya
- reviewer: Roshan
- priority: P1
- depends_on: [T017]

## Goal

Provide live and cached space-tracking telemetry in `backend/app/integrations/space_track.py` and `backend/app/integrations/nasa_spark.py` with strict mode separation (LIVE, SNAPSHOT with fetched_at, and SYNTHETIC).

## Acceptance checks

1. Space-Track integration supports authenticated queries, offline snapshot fallbacks, and synthetic screening.
2. Every returned TLE/CDM payload and `/integrations/status` explicitly specifies data mode: LIVE, SNAPSHOT, or SYNTHETIC.
3. NASA SPARK spatial density returns structured empirical density and smallsat flux calculations with explicit non-operational screening disclaimers.
4. CelesTrak GP telemetry provides live two-line orbital elements with 2-hour cadence cache tracking.

## Required verification

Run `pytest backend/tests/test_extended_capabilities.py` and verify data mode labels and fallback mechanisms.

## Reviewer log

- Implementation evidence: Implemented three-mode telemetry in space_track.py, nasa_spark.py, and main.py; verified via automated tests.
- Reviewer sign-off: Roshan (2026-10-25T02:00:00.000000Z / 2026-10-25T07:30:00.000000+05:30)
