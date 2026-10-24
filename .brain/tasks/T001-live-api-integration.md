# T001 — Live API integration

- status: done
- owner: Aditya
- reviewer: Narayan
- priority: P0
- depends_on: []

## Goal

Make the normal React app use the FastAPI API for mission listing, profile selection, evaluation, review decisions, provenance, and export. Preserve offline/mock mode as an explicit fallback.

## Allowed files

`backend/app/main.py`, `frontend/src/`, `frontend/vite.config.ts`, `frontend/.env.example`, legacy archives (`legacy/web/`, `legacy/frontend-service/`), tests, and docs needed for the run command.
*(Note: Reconciled during layout consolidation from legacy `apps/api` and `apps/web` to top-level canonical `backend/` and `frontend/` at commit `ca96b42`)*.

## Acceptance checks

1. With `VITE_USE_MOCK=false` and the API running, the browser loads a mission from FastAPI.
2. Selecting a profile calls the API and renders the returned findings.
3. Review decisions reach the API and export lock status reflects server state.
4. With `VITE_USE_MOCK=true`, the current offline tests and demo still work.
5. Network failure shows a clear error and does not silently claim live evaluation.

## Required verification

Run backend pytest, frontend Vitest, typecheck, build, and one manual browser flow in both live and mock modes. Record request/response evidence in the task log.
*(Note: Canonical store in `frontend/src/store/useOrbitStore.ts` now wires `evaluateMissionLive`, `submitReviewDecisionLive`, and `fetchProvenanceLive` when `apiMode === 'live'`)*.
