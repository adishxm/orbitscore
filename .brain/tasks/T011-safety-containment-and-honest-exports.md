# T011 — Safety containment and honest exports

- status: done
- owner: Aditya
- reviewer: Roshan
- priority: P0
- depends_on: [T010]

## Goal

Contain false-positive and non-deterministic outputs: replace random Pc sampling with a deterministic 2D encounter proxy, eliminate module import-time model fitting, enforce safe failure modes for empty evidence in the Space Credit Index, and ensure ODAR export templates report non-conformance for excessive lifetimes.

## Acceptance checks

1. `CollisionRiskClassifierML.evaluate_conjunction` produces deterministic, reproducible Pc estimates on identical inputs.
2. `OrbitalDecayML` and `CollisionRiskClassifierML` use lazy fitting without executing heavy random sampling at import time.
3. Empty mission and evidence inputs to `compute_space_credit_index` produce Tier D / < 40 score with unaligned flags instead of false-positive BBB / 75 scores.
4. ODAR markdown generator flags decay > 5 years as `NON-CONFORMANT` and missing battery records as `UNVERIFIED / NEEDS_EVIDENCE`.
5. Unit tests verify determinism, negative empty-mission behavior, and ODAR non-conformance detection.

## Required verification

Execute `pytest ai_ml/tests/test_orbital_ml_and_credit.py backend/tests/test_extended_capabilities.py` and confirm all negative safety tests pass.

## Reviewer log

- Implementation evidence: Deterministic Foster encounter proxy in `ai_ml/orbital_ml.py`, safe failure defaults in `ai_ml/credit_index.py`, draft non-conformance rendering in `backend/app/odar_generator.py`, and 12 passing unit tests in `test_orbital_ml_and_credit.py` and `test_extended_capabilities.py`.
- Reviewer sign-off: Roshan (2026-10-24T18:25:00.000000Z / 2026-10-24T23:55:00.000000+05:30)
