# T027 — Orbital Intelligence Endpoints

- status: done
- owner: Aditya
- reviewer: Roshan
- priority: P1
- depends_on: [T026]

## Goal

Implement dashboard endpoints for deterministic ground-track pathway propagation (`/pathway`), heuristic CDM collision screening alert zones (`/collision-alerts`), and research-gated atmospheric decay curves (`/decay-path`).

## Acceptance checks

1. `GET /missions/{id}/pathway` returns SGP4-style Keplerian ground-track series with deterministic propagation.
2. `GET /missions/{id}/collision-alerts` returns miss-distance screening bands and same-altitude catalog density with explicit heuristic disclaimer (no operational Pc).
3. `GET /missions/{id}/decay-path` returns atmospheric drag decay profile marked with `model_status: SCHEMATIC|RESEARCH`.
4. All three orbital endpoints enforce reviewer/viewer authentication and mission isolation.

## Required verification

Run `pytest backend/tests/test_extended_capabilities.py` and verify determinism, access controls, and boundary labeling.

## Reviewer log

- Implementation evidence: Endpoints implemented in backend/app/main.py, covered by test_extended_capabilities.py.
- Reviewer sign-off: Roshan (2026-10-25T02:05:00.000000Z / 2026-10-25T07:35:00.000000+05:30)
