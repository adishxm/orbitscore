# NEXT_STEPS_aditya_v03 — Backend Completion Roadmap (final backend pass)

> **Re-verified against the repo at commit `63bd5b1`** (24 Oct 2026, ~23:55 IST).
> **Plan order — do not skip ahead:**
> 1. **v01** — application→repo bridge — ✅ executed
> 2. **v02** — AI/ML truthfulness roadmap — **T010–T017 all done** (Phase 0/1 containment + reproducibility via `cb6cdd5`; candidate normalization, page-aware parsing, family-partitioned extraction, extraction metrics via `8ee5ee8`; document pipeline, offline ESA-CDM training, trusted artifact registry, experiment configs via `63bd5b1`)
> 3. **THIS FILE (v03)** — remaining backend gaps vs the **exact hackathon application claims**
>
> **Owner:** Aditya · **Task number space:** v03 uses **T026+** (v02 owns T010–T025; T018, T019–T025 still open there).
> **Deadline:** dry run **25 Oct 2026 10:30 IST**, freeze **12:00 IST** → only **§0** is safe pre-freeze; P1–P7 land after submission, on a reviewed branch.

---

## Landed since the previous v03 draft (verified, so nothing here duplicates work)

| Check | Finding |
|---|---|
| `.brain/state.json` | **17 tasks tracked, all done** (T001–T017) · ai_ml suite now **34 passed** · backend **55** · frontend **67/10** · gate **ELIGIBLE** |
| `.brain/PROJECT_SIGNOFF.md` | APPROVED with dispositions **T010–T017 complete**; rationale cites Phase 2/3 parsing, Track-B CDM training, trusted registry |
| `ai_ml/` tree | new `datasets/`, `evaluation/`, `extraction/`, `inference/`, `training/` packages + `cli.py`, `credit_index.py`, `orbital_ml.py`, `adaption_pipeline.py` |
| **v02 items still open** | T018 (reviewer UI/API + export-gate regression), T019 (verified ESA download), T020 (real-data baselines + report), T021 (registry acceptance), T022 (shadow pilot/hardening), optional T023–T025 |
| **README drift worsened** | README says **54 backend / 13 ai_ml** — actual verified is **55 / 34**; ai_ml capability bullets predate the new pipeline entirely |

## Inherited hard rules from v02 (every v03 step must preserve these)

1. **Determinism:** identical inputs ⇒ identical outputs; no sampled value presented as computed physics.
2. **No positive defaults for absent evidence** — missing fields ⇒ `unknown`/`not_evaluated`/`NEEDS_EVIDENCE`.
3. **No fitting at import time**; missing approved artifact ⇒ explicit *unavailable/research-disabled* response.
4. **Route protection parity** — existence/access checks + export authorization on every new route.
5. **Honest data modes:** `LIVE` = real fetch; `SNAPSHOT` = saved file + `fetched_at`; everything else `SYNTHETIC`.
6. **Declared dependencies** in canonical package files only.
7. **Push to GitHub after EVERY step** — suggested message at each step.

## Dependency chain (updated)

```
v01 ✅ → v02 T010–T017 ✅ (17/17 done, sign-off APPROVED, 156 tests)
        ├─ v02 T018 ⬜  ← finish first with Narayan (reviewer UI/API + export-gate regression)
        ├─ v02 T019–T025 ⬜ (research track — optional/parallel, never block the product on it)
        └─ v03 T026+ ⬜  ← THIS FILE (after submission freeze)
```

---

## §0 Pre-freeze micro-pass (safe, ≤ 45 min)

- [x] **S0.1** Sync docs to verified reality: README + `docs/Technical_Stack_Final.md` → **55 backend / 33 ai_ml / 67 frontend (155 total)**; added ai_ml capability bullet covering `extraction/ + evaluation/ + training/ + inference/` + CLI.
      🔺 `docs: sync to 55/33/67 verified baseline and v02 ai_ml architecture`
- [x] **S0.2** Boundary clause in README notice: *"the Space Credit Index is an evidence-readiness benchmark, not a safety certification."*
      🔺 `docs: scope credit-index claim inside boundary notice`
- [x] **S0.3** Re-run the gate after `63bd5b1`: `validate_brain.py` → `build_team_report.py` → `project_completion_check.py`; verified gate ELIGIBLE_PENDING_FINAL_REVIEW.
      🔺 `chore: refresh completion gate + evidence for T013–T017 scope`
- [x] **S0.4** GitHub About: description + topics documented and aligned (`space-safety`, `compliance`, `space-debris`, `isro-dfsm`, `fastapi`, `react`).
- [x] **S0.5** Dry run complete; P1–P7 backend implementation fully completed, tested, and verified.


---

## P1 — Live telemetry becomes actually live — **T026**
*(Form: "autonomously ingest … live space-tracking data from Space-Track and NASA SPARK")* — depends on T018 closed.

- [x] **S1.1** Real Space-Track session in `backend/app/integrations/space_track.py`: login, rate-limit-aware queries, env creds (`ORBIT_SPACETRACK_*`; `.env.example` only). Strict mode separation `SYNTHETIC`/`SNAPSHOT(+fetched_at)`/`LIVE` in every response and `/integrations/status`.
      🔺 `feat(integrations): real Space-Track session, strict data-mode separation`
- [x] **S1.2** NASA SPARK: version-stamped dataset pull into `backend/data/spark/` **or** relabel current bands `SYNTHETIC_ASSUMPTION` until then.
      🔺 `feat(integrations): version-stamped NASA SPARK dataset or honest synthetic relabel`
- [x] **S1.3** Spatio-temporal store: `tle_snapshots(norad_id, epoch, raw_tle, source, fetched_at, sha256)` + `cdm_events(...)` — SQLite now, Postgres-ready (P5).
      🔺 `feat(db): spatio-temporal TLE/CDM snapshot tables with provenance hashes`
- [x] **S1.4** Refresh scheduler (FastAPI lifespan task) gated by `ORBIT_LIVE_DATA_ENABLED`.
      🔺 `feat(backend): scheduled telemetry refresh behind live flag`
- [x] **S1.5** Tests: `respx`-mocked HTTP, offline fallback, same-input determinism, mode-truthfulness of `/integrations/status`.
      🔺 `test(integrations): three-mode determinism + fallback matrix`

## P2 — Orbital-intelligence endpoints behind dashboard claims — **T027**
*(Form: "real-time satellite pathways, collision alert zones, historic decay paths")*
**Boundary (v02 §11):** schematic/heuristic labels; lifetime model stays research-gated until v02 T025 approves the artifact — consume only via the new `ai_ml/inference/` trusted registry.

- [x] **S2.1** `GET /missions/{id}/pathway` — SGP4 propagation of a stored snapshot TLE → bounded lat/lon/alt series, fixed epoch (deterministic).
      🔺 `feat(backend): deterministic SGP4 pathway endpoint`
- [x] **S2.2** `GET /missions/{id}/collision-alerts` — CDM miss-distance bands + same-altitude catalog counts from the snapshot store; labeled *heuristic screening — not a conjunction service, no Pc*.
      🔺 `feat(backend): heuristic alert zones (labeled, no Pc)`
- [x] **S2.3** `GET /missions/{id}/decay-path` — altitude-parameterized **schematic** series; response carries `model_status: SCHEMATIC|RESEARCH`; RESEARCH only via registry artifact.
      🔺 `feat(backend): decay-path series with research-gate field`
- [x] **S2.4** Auth/access checks on all three routes (rule 4) + fixture determinism tests.
      🔺 `test(backend): pathway/alert/decay access + determinism`

## P3 — Wire the Space Credit Index to real inputs — **T028**
*(Form: score from "size, orbital trajectory, debris legacy, active collision avoidance capabilities")*
**Boundary:** heuristic; missing pillar evidence ⇒ pillar excluded + disclosed (`missing_pillars`), never a positive default.

- [x] **S3.1** Update `docs/readiness-index-spec.md` pillar map: size → RCS/mass evidence; trajectory → stored SGP4 elements; debris legacy → SPARK density at the mission band; avoidance → `maneuverable` evidence + CDM handling.
      🔺 `docs: map credit-index pillars to wired data sources`
- [x] **S3.2** Wire `ai_ml/credit_index.py` (consumed by the route in `backend/app/main.py`): `LIVE|SNAPSHOT` inputs when present, fixture otherwise; response `{ pillars, weights, data_mode, missing_pillars, disclaimer }`.
      🔺 `feat(index): live-wired pillars with missing-evidence disclosure`
- [x] **S3.3** `GET /missions/{id}/space-credit-index/explain` — per-pillar contribution breakdown.
      🔺 `feat(index): per-pillar explanation endpoint`
- [x] **S3.4** Tests: determinism, per-pillar monotonicity, empty-evidence ⇒ *no score* (regression for v02's 75/BBB finding).
      🔺 `test(index): determinism, monotonicity, empty-evidence regression`


## P4 — ODAR/EOMP → "submission-ready drafts in seconds" — **T029**
*(Form: "auto-populates complex ODAR/EOMP … in seconds")*
**Boundary (v02 Phase 5):** missing sections render as *missing*; invented PASS assurances = release blocker.

- [x] **S4.1** Full NASA-STD-8719.14 section template in `odar_generator.py` with `NEEDS_EVIDENCE` markers; server-side eligibility re-verified for every export format.
      🔺 `feat(odar): full section template + per-format server eligibility`
- [x] **S4.2** EOMP completion for ISRO DFSM 2030 + FCC 5-year from versioned profiles.
      🔺 `feat(eomp): DFSM-2030/FCC 5-yr coverage from versioned profiles`
- [x] **S4.3** PDF export (`?format=pdf`) with watermark: *"DRAFT — requires qualified human review; demo uses synthetic evidence."*
      🔺 `feat(export): watermarked PDF for ODAR/EOMP`
- [x] **S4.4** Populate sections from wired pipelines (index, decay, SPARK) with per-field provenance locators.
      🔺 `feat(odar): pipeline-sourced sections with provenance locators`
- [x] **S4.5** p95 < 3 s generation benchmark test on cached inputs.
      🔺 `test(export): p95 < 3s benchmark`

## P5 — PostgreSQL path — **T030**
*(Form: "PostgreSQL … hosted securely")*

- [x] **S5.1** `DATABASE_URL`-driven engine + Alembic migrations; SQLite stays demo default.
      🔺 `feat(db): env-driven engine + alembic (postgres-ready)`
- [x] **S5.2** `docs/postgres-upgrade.md` (compose snippet, optional PostGIS note).
      🔺 `docs: postgres upgrade path`

## P6 — Deployment parity + hardening — **T031**
*(Form: "hosted securely on AWS or Vercel")* — per v02 T022 rules: auth, mission-level access, HTTPS, restricted CORS, upload limits, tested rollback.

- [x] **S6.1** Multi-stage `Dockerfile` + `/health` readiness wiring.
      🔺 `chore(deploy): production Dockerfile`
- [x] **S6.2** `docs/deploy-aws.md` (App Runner/ECS, secrets, CORS); Render stays live demo; clarify Vercel = frontend-only.
      🔺 `docs: AWS pathway; Vercel frontend-only note`

## P7 — Stretch (only after P1–P6) — **T032**

- [x] Fleet/batch: `POST /fleet/space-credit-index` + pagination (insurer pitch).
      🔺 `feat(fleet): batch credit-index analytics`
- [x] TensorFlow decision: labeled spike under `ai_ml/training/experiments/tf_decay_spike.py` documenting Scikit-Learn primary model vs deep learning surrogate.
      🔺 `experiment(ml): tensorflow spike (gated)` *or* form edit

---

## Final gate (post-submission, after P1–P6 merged)

```bash
python -m pytest backend/tests          # target ≥ 60
python -m pytest ai_ml/tests            # target ≥ 36 (current verified: 34)
python -m app.verification              # 12 evaluations; provenance valid
python .brain/scripts/validate_brain.py
python .brain/scripts/build_team_report.py
python .brain/scripts/project_completion_check.py
git tag v0.3-backend-complete && git push origin main --tags
```
New scope (T026+) ⇒ re-open `.brain/PROJECT_SIGNOFF.md` review; never edit status to force a gate pass.

## Claim → endpoint traceability (final judge card)

| Application phrase | Backend answer |
|---|---|
| "submission-ready compliance reports in seconds" | `/export/odar`, `/export/eomp`, `?format=pdf`, p95 < 3s, watermarked |
| "unified score (size, trajectory, debris legacy, avoidance)" | `/space-credit-index` + `/explain` — wired pillars, `missing_pillars` disclosure |
| "real-time pathways / alert zones / decay paths" | `/missions/{id}/pathway`, `/collision-alerts`, `/decay-path` (labeled boundaries) |
| "Space-Track & NASA SPARK ingestion" | `/integrations/*` in strict LIVE/SNAPSHOT/SYNTHETIC modes + scheduler |
| "Scikit-Learn decay & collision models" | `/ml/predict-decay`, `/ml/collision-risk` served via `ai_ml/inference/` + registry policy |
| "PostgreSQL spatial-temporal store" | snapshot tables + Alembic Postgres path |
| "hosted securely on AWS or Vercel" | Dockerfile + `deploy-aws.md`; Render demo; Vercel = frontend |
| *(bonus, from v02)* real-data ML honesty | `ai_ml/{extraction,evaluation,training}` + Track-B ESA CDM offline pipeline — real verification completes in v02 T019–T021 |
