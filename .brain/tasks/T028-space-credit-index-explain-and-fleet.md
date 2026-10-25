# T028 — Space Credit Index Explanation and Fleet Batching

- status: done
- owner: Aditya
- reviewer: Roshan
- priority: P1
- depends_on: [T027]

## Goal

Provide a transparent 4-pillar Space Credit Index (0–100, AAA–D rating tiers) with per-pillar breakdown disclosure and batch fleet aggregation.

## Acceptance checks

1. `GET /missions/{id}/space-credit-index` evaluates Size, Trajectory, Debris Legacy, and Collision Avoidance with fail-safe exclusions for missing evidence.
2. `GET /missions/{id}/space-credit-index/explain` returns weighted contributions, data modes, and lists missing evidence pillars.
3. `POST /fleet/space-credit-index` calculates batch index statistics and tier distributions across multiple missions.
4. Monotonicity and empty-mission tests confirm empty evidence yields no score or fails safe without positive default bias.

## Required verification

Run `pytest backend/tests/test_extended_capabilities.py` and `pytest ai_ml/tests/test_orbital_ml_and_credit.py`.

## Reviewer log

- Implementation evidence: Wired index in ai_ml/credit_index.py and endpoints in backend/app/main.py with tests passing.
- Reviewer sign-off: Roshan (2026-10-25T02:10:00.000000Z / 2026-10-25T07:40:00.000000+05:30)
