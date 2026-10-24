# OrbitScore roadmap — implementation and verification status

## Product boundary

OrbitScore is a source-linked pre-review decision-support tool. It is not legal certification, collision prediction, conjunction screening, maneuver guidance, atmospheric propagation, regulator filing, or a universal compliance score. Synthetic fixtures and counterfactuals are explicitly illustrative.

## Delivered vertical slice

```text
Synthetic mission with source locators
  → confirmed/unconfirmed evidence fields
  → selected versioned policy profile
  → deterministic profile-specific findings and conflict detection
  → capped prioritization band
  → bounded illustrative counterfactual
  → persisted human review decision in frontend mock state
  → cited HTML/JSON packet, or EXPORT_LOCKED
```

## Implemented package map

- Canonical Frontend: `frontend/` (React/Vite/TypeScript, Zustand store, Framer Motion, 9 test suites, 63 Vitest tests, Axe a11y passed).
- Backend: `backend/app/main.py`, `schemas.py`, `engine.py`, `db.py`, `provenance.py`, `export.py`, and `extractor.py`.
- AI / ML: `ai_ml/` (`adapter.py`, `schemas.py`, `tests/test_adapter.py`). Unconfirmed-only candidates, temperature 0.0, 10.0s timeout, deterministic fallback.
- Policy catalog: `fixtures/rules_profiles.json`, with four selectable profiles.
- Synthetic mission inputs: `fixtures/mission_complete.json`, `mission_gap_heavy.json`, and `mission_conflict.json`.
- Evidence sample: `fixtures/asteria3_mission_datasheet_synthetic.pdf` and `.txt`.
- Legacy console & client: `legacy/web/` and `legacy/frontend-service/` (retained for transition and reference).
- Results: `fixtures/evaluation_verification_report.json` captures three missions × four profiles and a verified SHA-256 trace.

## Verification completed

```text
python -m pytest backend/tests         38 passed
python -m pytest ai_ml/tests           6 passed
python -m app.verification (in backend) 12 evaluations; provenance valid
npm test                                63 Vitest tests passed (9 suites)
npm run typecheck                       passed (tsc --noEmit)
npm run build                           passed (Vite production bundle)
npm run legacy:web:test                 10 Vitest tests passed
```

Tests cover all three fixtures across all four profiles, the 8.4-year NASA-vs-FCC switching case, unconfirmed evidence, conflicts, a bounded counterfactual, review-gated export, and sequence-specific provenance tampering. The frontend tests additionally verify local state persistence and SHA-256 output.

## Known boundaries and next work

The API's demo state is process-memory only; browser mock state persists in localStorage with a Node in-memory fallback. A production release would need durable database-backed multi-user state, authentication/authorization, a formal migration strategy, upload malware/size controls, content-derived artifact hashes, stronger provenance signing/retention, comprehensive legal source review, independent rule validation, accessibility and deployment hardening, and additional integration/security tests. No PDF extraction pipeline, physical orbital propagation, collision-risk model, or regulator connectivity is claimed.

Before using any profile on a real mission, qualified reviewers must verify source versions, scope, definitions, conditions, units, and all evidence. FCC 22-74 is limited here to covered LEO stations below 2,000 km using uncontrolled atmospheric reentry; NASA Req. 4.3-1 wording is scoped to the specified planned-debris pathway. Parasuraman et al. is cited as automation-design inspiration, not certification. The prioritization band contains no `S_coll` term and is not a safety probability.
