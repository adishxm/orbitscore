# OrbitScore — Next Steps (post-application build plan)

> **Main idea (from the hackathon application):** an automated, compliance-driven **"Space Credit Score" platform** for space
> sustainability — autonomously ingesting space-tracking telemetry, generating **submission-ready ODAR/EOMP compliance
> reports in seconds**, computing a proprietary **Space Credit Index**, visualized on a real-time risk dashboard,
> launched **India-first (ISRO standards) → global**, targeting operators, startups, and aerospace insurers.
>
> **Repo reality today:** a deterministic, human-gated **mission evidence workspace + pre-review decision-support tool**
> (React 18/Vite + FastAPI + SQLite; tamper-evident SHA-256 provenance; versioned rule profiles incl. ISRO DFSM 2030 /
> FCC / NASA / ESA tier matrix; synthetic demo data; 67 frontend + 48 backend + 10 ai_ml tests passing).
>
> This file is the admitted-vision → shipped-product bridge. Every item below exists to close a specific gap between
> the application text and the code. **The `README` boundary notice stays authoritative:** nothing here ships as a
> literal certification, safety score, or regulator filing. Claims scale only as fast as evidence.

---

## 0. P0 — Demo-day blockers & repo hygiene (do first)

- [x] **Close T006** clean-clone preflight — _(owner: Roshan)_ — closed and verified; passing baseline gate report archived.
- [x] **Close T007** browser E2E tests — _(owner: Narayan/Roshan)_ — closed and verified; passing baseline gate report archived.
- [x] **Get T009 reviewer sign-off** → flip `verifying` → `done` with evidence report — completed with approved reviewer sign-off.
- [x] **Update `.brain/PROJECT_SIGNOFF.md`**: T008 disposition is `complete` in `project-scope.json` and in sign-off file; OrbitScore scope verified.
- [x] **Purge lingering "OrbitReady" naming**: `.brain/state.json` (`"project": "orbitscore"`), `.brain/knowledge-manual.md` title, `PROJECT_SIGNOFF.md` scope line → **OrbitScore** everywhere.
- [x] **Fix dead paths in `.brain/knowledge-manual.md`**: `apps/api/...` → `backend/app/...`, `apps/web/...` → `frontend/...` (pre-monorepo references cleaned).
- [x] **Sync stale numbers in `docs/Technical_Stack_Final.md`**: verified counts synced to **67 frontend (10 suites) / 54 backend / 13 ai_ml**.
- [x] **Re-run the brain baseline** and refresh artifacts:
  ```bash
  python .brain/scripts/validate_brain.py
  python .brain/scripts/complete_task.py T009
  python .brain/scripts/build_team_report.py
  python .brain/scripts/project_completion_check.py
  ```
- [ ] **Set GitHub repo description + topics** (currently empty): e.g., `space-debris`, `compliance`, `fastapi`, `react`, `decision-support`, `isro-dfsm`.

---

## 1. Feature 1 — Automated ODAR/EOMP Pipeline ✅→ auto-**populated draft** (honest version)

*Form claim: "auto-populates complex Orbital Debris Assessment Reports and End-of-Mission Plans by running simulations."*
Ship the evidence-backed subset; keep the human gate.

- [x] `docs/odar-mapping.md` — map every ODAR/EOMP section (spacecraft description, mission profile, breakup/passivation, debris release, disposal/EOMP timeline) to fields already collected in the evidence register.
- [x] Extended `backend/app/odar_generator.py` with an **ODAR-structured export template** (Markdown) & EOMP generator: fixed section headings, auto-filled confirmed fields, explicit `NEEDS_EVIDENCE` placeholders for gaps.
- [x] New routes: `GET /missions/{id}/export/odar` and `GET /missions/{id}/export/eomp` (keeps `EXPORT_LOCKED` gate).
- [x] Frontend: Download buttons and print packet options in the export view.
- [x] Tests: template rendering, locked/unlocked behavior, per-section field fill coverage (backend pytest).

## 2. Feature 2 — Space Credit Index ✅→ **readiness heuristic, clearly labeled** (honest version)

*Form claim: "proprietary unified safety score."* Repo boundary forbids certification/safety claims — ship the defensible core.

- [x] Defined `docs/readiness-index-spec.md`: formula over **evidence completeness %, conflict count, unconfirmed-field penalty, profile scope notes, trajectory-class factor**. Explicitly **not** a collision-probability or safety score (keeps `S_coll` exclusion).
- [x] `ai_ml/credit_index.py` & `backend/app/main.py` → `GET /missions/{id}/space-credit-index` returning 4-pillar `{ overall_score, rating_tier, breakdowns, recommendations, disclaimer }`.
- [x] Tests: determinism, boundary values, disclaimer field always present (13 passed in `ai_ml/tests/`).

## 3. Feature 3 — Risk dashboard → real-data path (phased)

*Form claim: "real-time satellite pathways, collision alert zones, historic decay paths."* Phase it; synthetic stays default.

- [x] `backend/app/adapters/celestrak.py` + `space_track.py` stubs behind `ORBIT_LIVE_DATA_ENABLED=false`; return bundled fixture TLEs first, real fetch later.
- [x] Register live sources in `research/SOURCE_REGISTER.md` (CelesTrak, Space-Track, NASA ODPO docs) with freshness/scope notes.
- [x] Extend `OrbitalContextCard` to optionally render TLE-derived ground track; **truth-in-advertising badge must auto-switch** SYNTHETIC ↔ LIVE-SOURCE-CITED.
- [x] v1 "alert zones": rule-based proximity flags against a bundled catalog snapshot (labeled heuristic via `/missions/{id}/collision-alerts`).
- [x] Generalize the static decay estimate into an altitude-parameterized schematic curve (via `/missions/{id}/decay-path`).

## 4. Feature 4 — National-to-Global Scalability Matrix (already landed — tighten)

- [x] Split `fixtures/rules_profiles.json` into named, citable tiers: `isro_dfsm_2030`, `fcc_5yr_deorbit`, `nasa_std_8719_14`, `internal_pre_review` — each with source doc, revision, date.
- [x] Surface tier names in the profile gate UI verbatim (matches application wording).

---

## 5. Tech-stack alignment with the application

| Form says | Repo is | Action |
|---|---|---|
| React.js / Next.js + Tailwind | React 18 + Vite + TS (Zustand, Lucide, Framer) | Keep Vite; note in docs OR edit the form to "React" |
| FastAPI/Flask | FastAPI ✅ | none |
| Space-Track / NASA SPARK live scrapers | synthetic fixtures + datasheet upload only | §3 adapters; until then mark **planned** in the form or docs |
| Scikit-Learn / TensorFlow decay & collision models | schema-validated LLM extraction adapter + regex fallback | Add `ml/` spike: scikit-learn decay regression on synthetic set (clearly *experimental*); TF deferred |
| PostgreSQL + AWS/Vercel | SQLite + Render | Env-driven `DATABASE_URL`; document Postgres migration path; demo stays SQLite/Render |

---

## 6. Application-text reconciliation (edit the form, not just the code)

Paste-ready replacements that are true to the repo:

- **Feature 1:** *"ODAR-Ready Evidence Pipeline: auto-populates draft compliance packets mapped to ODAR/EOMP evidence fields from cited mission records — review-gated before any submission."*
- **Feature 2:** *"OrbitScore Readiness Index: a deterministic, fully explainable heuristic over evidence completeness and consistency — designed to evolve into a credit-style benchmarking index as live data integrations mature."*
- **Feature 3:** *"Risk Intelligence Dashboard: orbital-context visualization with cited orbital parameters; phased roadmap to live Space-Track/CelesTrak feeds (currently synthetic demo data, clearly labeled)."*

---

## 7. Team split

| Person | Lane (`.brain/knowledge-manual.md`) | Owns next |
|---|---|---|
| **Aditya** | backend, rules, persistence, provenance, parsing, optional AI | §1 ODAR export, §2 readiness index, §3 adapters, Postgres path, T009 closure |
| **Narayan** | React/types/API/UI/export | ODAR download UI, ReadinessIndexCard, OrbitalContextCard live-mode, T007 browser tests |
| **Roshan** | QA/fixtures/reproducibility/demo | T006 clean-clone preflight, new-test coverage, fixtures for ODAR/ML spike, demo script |

## Definition of done for this plan

`project_completion_check.py` → **ELIGIBLE** · sign-off APPROVED with timestamps · README, docs, and `.brain` numbers in sync · zero banned-word violations · every application claim either demonstrated in the demo or visibly marked *planned/roadmap*.
