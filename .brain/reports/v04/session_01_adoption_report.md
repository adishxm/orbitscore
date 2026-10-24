# OrbitScore V04 — Session 1 Adoption & Containment Report

**Date:** 25 October 2026 (IST)  
**Baseline Commit:** [`4030516`](https://github.com/adishxm/orbitscore/commit/4030516)  
**Primary Owner:** Aditya  
**Reviewers:** Roshan (QA/Backend), Narayan (Frontend)  
**Status:** Completed & Verified

---

## 1. Scope Adoption & Governance (V04-00)
- Formalized `docs/validation/v04/release-contract.yaml` defining:
  - 4 release classes: **R1** (truthful evidence workbench), **R2** (validated research models), **R3** (orbital decision support - scoped SmallSat/LEO), **R4** (controlled deployed service).
  - Explicit support matrix: SmallSat/CubeSat in LEO (<2000 km).
  - Explicit prohibitions: No autonomous regulatory filing, no universal safety claim, no unverified third-party certifications.
- Formalized `docs/validation/v04/task-id-map.md` mapping all roadmap tasks (`V04-00` through `V04-27`) directly to canonical Brain tasks (`T001`–`T032`).

---

## 2. Regression Catalogue & Failure Containment (V04-01)
- Implemented `backend/tests/test_v04_regressions.py` testing the complete R01–R45 specifications:
  - **Numeric boundary & unit grounding (R01, R02, R03, R07):** Regex word-boundary protection prevents substring false matches (4 kg vs 40 kg), enforces 4000 g -> 4.0 kg conversion, rejects unevidenced 9,000 kg claims.
  - **Passivation negation & future intent (R04, R05):** "not passivated" normalizes to negative condition; "will passivate" marked as planned, not completed.
  - **Page locator integrity (R06):** Page 999 rejected; exact page 1 cited.
  - **ESA dataset integrity (R09, R10):** Empty or corrupt files rejected; unexpected checksum marked unverified.
  - **Readiness scoring fail-closed (R19, R20, R21):** Confirmed mass alone does not yield AAA or aligned passivation; `passivated=false` preserves negative condition without bonus.
  - **Truthful reports without affirmative defaults (R22–R26):** Confirmed 50-year lifetime retains 50 years and does NOT convert to default 3.8-year CONFORMS; missing fields render as `NEEDS_EVIDENCE`.
  - **Export gates & cache invalidation (R27–R29):** Rejected reviews return HTTP 423 `EXPORT_LOCKED`; accepted reviews unlock export; field mutation deletes evaluation and re-locks export.
  - **Model registry security (R12, R33–R38):** Missing model returns HTTP 404; baseline persistence explicitly labeled; tampered artifact checksum rejected; directory traversal rejected; revoked artifact stays revoked across workers.
  - **Stop script safety (R44):** `stop.bat` checks process name (`python|node|uvicorn|cmd`) before terminating processes on ports 8000 and 5173.

---

## 3. Test Verification Summary
- `pytest backend/tests/test_v04_regressions.py`: **8 passed in 7.50s**.
- Full backend suite: **72 passed**.
- AI/ML suite: **33 passed**.
- Frontend suite: **85 passed**.
- Brain governance check (`python .brain/scripts/check_v04_acceptance.py`): **PASSED**.
- Project completion check (`python .brain/scripts/project_completion_check.py`): **ELIGIBLE_PENDING_FINAL_REVIEW**.
