# OrbitReady context

## Product

OrbitReady/OrbitScore is a source-linked, human-reviewed pre-review copilot for organizing spacecraft debris-mitigation evidence. It is not legal certification, collision prediction, conjunction screening, maneuver guidance, atmospheric propagation, regulator filing, or a universal compliance score.

Core principle: **AI assists extraction and explanation. Deterministic code evaluates. Humans approve.**

## Current package status

The attached package is a verified prototype. After the localbrain improvements, checks rerun in the review workspace on 2026-10-22:

- Backend: `pytest -q` → 7 passed.
- Verification matrix: `python -m app.verification` → 12 evaluations, provenance valid.
- Frontend: 6 Vitest tests passed, including a reviewed JSON packet test.
- Brain metadata validator and Python syntax checks passed.
- TypeScript typecheck passed.
- Vite production build passed.

## Important gaps before the full desired app

1. The visible React app uses `frontend-service/api.ts` and local/mock state by default; it is not yet the normal live FastAPI path.
2. FastAPI has no artifact upload endpoint and no PDF/text extraction endpoint.
3. The API state is process-memory only; there is no SQLite/SQLModel persistence or migration strategy.
4. Provenance is an in-process hash chain, not durable storage, signing, retention, or multi-user audit.
5. Export is a local mock JSON download in the UI and a minimal HTML/JSON API response; it is not yet a robust cited PDF packet or live UI/API export flow.
6. There is no Docker Compose, GitHub Actions workflow, Playwright browser suite, upload-size/malware control, auth, or deployment hardening.
7. The current rule engine is a controlled prototype and must not be expanded into physical orbital prediction.

## Preferred implementation order

Live API contract → upload and extraction fallback → durable state → provenance persistence → review/export integration → browser tests → optional LLM adapter → PDF polish/deployment.

## Team ownership

- **Aditya:** FastAPI, data model, deterministic rules, parser/extraction, AI adapter boundary, persistence, provenance, integration, CI, final merge.
- **Narayan:** React/Vite UI, API client, evidence table, review dashboard, counterfactual view, export screen, visual polish.
- **Roshan:** fixtures, manual QA, documentation, reproducibility checklist, demo operations, small paired code tasks only.

## Project timeline constraint

The event guide establishes project deadlines only: hacking begins Saturday 24 October 2026 at 12:00 PM IST; the pitch dry run must be complete by Sunday 25 October at 10:30 AM; repository, deck, and two-minute demo video freeze/submission is Sunday 25 October at 12:00 PM. `.brain/checklists/code-freeze.md` is the authoritative technical deadline checklist.
