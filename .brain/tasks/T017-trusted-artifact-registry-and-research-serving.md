# T017 — Trusted Artifact Registry and Research Forecast Serving

- status: done
- owner: Aditya
- reviewer: Roshan
- priority: P1
- depends_on: [T016]

## Goal

Implement the trusted model artifact registry with cryptographic hash verification, safe inference runner, and an isolated `/research/cdm-forecast` backend endpoint with non-operational research disclaimers.

## Acceptance checks

1. `ai_ml/inference/registry.py` enforces SHA-256 digest validation and approval checks before registering and loading model artifacts.
2. `ai_ml/inference/cdm_forecast.py` executes research forecast inference returning `CDMMakeForecastResult` with `research_only: True` and explicit disclaimers.
3. Backend route `POST /research/cdm-forecast` provides authenticated decision-support access without impacting production compliance routes.
4. Unit tests confirm artifact registration, prediction execution, and backend HTTP response.

## Required verification

Execute `pytest ai_ml/tests/test_cdm_training_and_registry.py` and test `/research/cdm-forecast` with TestClient.

## Reviewer log

- Implementation evidence: Trusted registry, forecast runner, FastAPI research endpoint, and 4 passing unit tests.
- Reviewer sign-off: Roshan (2026-10-24T18:50:00.000000Z / 2026-10-25T00:20:00.000000+05:30)
