# T012 — Canonical dependency hardening

- status: done
- owner: Aditya
- reviewer: Roshan
- priority: P0
- depends_on: [T010]

## Goal

Ensure reproducible, clean installation by declaring direct runtime dependencies (`numpy` and `scikit-learn`) directly in `ai_ml/pyproject.toml` and `backend/requirements.txt`.

## Acceptance checks

1. `ai_ml/pyproject.toml` explicitly declares `numpy>=1.24.0` and `scikit-learn>=1.3.0`.
2. `backend/requirements.txt` explicitly declares `numpy>=1.24.0` and `scikit-learn>=1.3.0`.
3. Fresh environment installation instructions in `README.md` are aligned with canonical declarations.

## Required verification

Run `pip check` and execute the full test baseline across backend and AI/ML packages.

## Reviewer log

- Implementation evidence: Declared numpy and scikit-learn in `ai_ml/pyproject.toml` and `backend/requirements.txt`.
- Reviewer sign-off: Roshan (2026-10-24T18:25:00.000000Z / 2026-10-24T23:55:00.000000+05:30)
