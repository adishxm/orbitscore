# Task ID Mapping & Crosswalk (V04 Roadmap to Canonical Brain Tasks)

This document formalizes the mapping between the **V04 Roadmap IDs (V04-00 through V04-27)** defined in `NEXT_STEPS_aditya_v04.md` and the existing `.brain/` state tasks (`T001`–`T017`) and roadmap extensions (`T018`–`T032`).

---

## Task Mapping Matrix

| V04 Roadmap ID | V04 Title | Brain Task ID | Status | Primary Output / Artifact |
|---|---|---|---|---|
| **V04-00** | Adopt scope, IDs & release authority | `T010` / Scope | ✅ Done | `docs/validation/v04/release-contract.yaml` |
| **V04-01** | Red regression suite & containment | `T018` | ✅ Done | `backend/tests/test_v04_regressions.py` |
| **V04-02** | Canonical mission/evidence contract | `T011` | ✅ Done | `ai_ml/schemas.py`, `backend/app/schemas.py` |
| **V04-03** | Installation, config & packaging | `T012` | ✅ Done | `requirements.txt`, `pyproject.toml`, `.env.example` |
| **V04-04** | Source provenance, rights & integrity | `T003` / `T013` | ✅ Done | SHA-256 chain, `backend/app/provenance.py` |
| **V04-05** | Parsing & locator mapping | `T013` | ✅ Done | `backend/app/extractor.py`, `ai_ml/extraction/` |
| **V04-06** | Real reviewed document corpus | `T014` | In Progress / Track A | `fixtures/asteria-3/` primary docs |
| **V04-07** | Unit-aware evidence grounding | `T014` | ✅ Done | Exact numeric boundary normalization |
| **V04-08** | Pretrained extraction & copilot eval | `T015` | ✅ Done | `ai_ml/evaluation/`, `Agent37Copilot.tsx` |
| **V04-09** | ESA dataset acquisition & verify | `T019` | ✅ Done | `ai_ml/datasets/esa_downloader.py` |
| **V04-10** | CDM column import & leakage-safe events | `T019` | ✅ Done | `ai_ml/training/train_cdm.py` |
| **V04-11** | CDM baseline & model fitting | `T020` | ✅ Done | `GradientBoostingRegressor` vs persistence |
| **V04-12** | Independent holdout evaluation | `T020` | ✅ Done | Log-risk MAE/RMSE comparisons |
| **V04-13** | Model registry & approval | `T021` | ✅ Done | `ai_ml/inference/registry.py` |
| **V04-14** | Model serving contracts & routes | `T027` | ✅ Done | `backend/app/main.py` (`/ml/predict-decay`) |
| **V04-15** | Authorized telemetry & snapshots | `T026` | ✅ Done | `backend/app/integrations/space_track.py` |
| **V04-16** | Orbital pathway computation | `T028` | ✅ Done | `/missions/{id}/pathway` |
| **V04-17** | Atmospheric decay capability | `T029` | Research / Scoped | Natural drag decay models |
| **V04-18** | Conjunction assessment & risk | `T030` | Research / Scoped | Miss distance / collision probabilities |
| **V04-19** | Calibrated uncertainty & OOD | `T030` | ✅ Done | Explicit unavailable/OOD responses |
| **V04-20** | Space Credit Index contract | `T004` / `T028` | ✅ Done | `ai_ml/credit_index.py` |
| **V04-21** | Regulatory profile interpretation | `T002` | ✅ Done | `fixtures/rules_profiles.json` |
| **V04-22** | Truthful ODAR/EOMP exports | `T005` / `T027` | ✅ Done | `backend/app/odar_generator.py` |
| **V04-23** | Frontend evidence flow & E2E | `T007` / `T008` | ✅ Done | `frontend/src/`, Playwright E2E suites |
| **V04-24** | Optional TensorFlow spike | `T032` | Optional / Spike | `ai_ml/training/experiments/tf_decay_spike.py` |
| **V04-25** | Database parity & hardening | `T031` | ✅ Done | `backend/app/db.py`, Alembic migrations |
| **V04-26** | Deploy, monitor & rollback | `T031` | ✅ Done | `launch.bat`, `stop.bat`, `deploy-aws.md` |
| **V04-27** | Final release audit | `T009` | ✅ Done | `.brain/PROJECT_SIGNOFF.md` |

---

## Invariant Rules
1. Historical tasks `T001`–`T017` in `.brain/` remain immutable and preserve their signed completion status.
2. New roadmap tasks use `V04-xx` namespace for planning and execution crosswalks.
