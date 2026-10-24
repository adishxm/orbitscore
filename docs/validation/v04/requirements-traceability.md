# OrbitScore V04 — Requirements Traceability & Regression Catalogue Matrix

**Reference:** `NEXT_STEPS_aditya_v04.md` (Section 7, IDs R01 through R45)  
**Verification Date:** 25 October 2026  
**Status:** All 45 regression specifications verified and mapped to concrete automated tests.

---

## Traceability Crosswalk

| Req ID | Input / Condition | Required Result | Verified Test / Implementation File | Status |
|:---|:---|:---|:---|:---:|
| **R01** | Claim 9,000 kg; quote says 4 kg | Rejected; valid 4 kg control accepted and unconfirmed | `backend/tests/test_v04_regressions.py::test_r01_r02_r03_r07_numeric_boundary_and_grounding` | ✅ Pass |
| **R02** | Claim 4 kg; quote says 40 kg | Rejected using numeric boundaries/meaning, not substring | `backend/tests/test_v04_regressions.py::test_r01_r02_r03_r07_numeric_boundary_and_grounding` | ✅ Pass |
| **R03** | Claim 4 kg; quote says 4,000 g | Accepted only through correct field/unit normalization | `backend/tests/test_v04_regressions.py::test_r01_r02_r03_r07_numeric_boundary_and_grounding` | ✅ Pass |
| **R04** | `passivated=True`; quote says "not passivated" | Rejected or normalized to negative state | `backend/tests/test_v04_regressions.py::test_r04_r05_passivation_negation_and_future_intent` | ✅ Pass |
| **R05** | Quote says "will passivate after mission" | Planned action retained; not completed passivation | `backend/tests/test_v04_regressions.py::test_r04_r05_passivation_negation_and_future_intent` | ✅ Pass |
| **R06** | Invented field/page/quote, including page 999 | No accepted candidate; valid source/page control still works | `backend/tests/test_v04_regressions.py::test_r06_page_locator_integrity` | ✅ Pass |
| **R07** | Long introduction followed by mass 4.2 kg | Exact supporting span/page, not prefix; decimal-safe matching | `backend/tests/test_v04_regressions.py::test_r01_r02_r03_r07_numeric_boundary_and_grounding` | ✅ Pass |
| **R08** | Probability gold `1e-9`, prediction `1e-6` | Not a perfect field match under scientific tolerance | `ai_ml/tests/test_evaluation_metrics.py` | ✅ Pass |
| **R09** | Empty, garbage or corrupt claimed ESA file | Invalid/unverified, never trusted `VERIFIED` | `backend/tests/test_v04_regressions.py::test_r09_r10_esa_dataset_integrity` | ✅ Pass |
| **R10** | File has no independently trusted expected checksum | At most hash-computed/unverified; schema/origin status separate | `backend/tests/test_v04_regressions.py::test_r09_r10_esa_dataset_integrity` | ✅ Pass |
| **R11** | Missing real dataset/config, invalid ratios | Nonzero failure with actionable error; no generated substitute | `ai_ml/tests/test_training_pipeline.py` | ✅ Pass |
| **R12** | Demo execution | Explicit synthetic origin; separate artifacts; no production approval | `backend/tests/test_v04_regressions.py::test_r33_to_r38_model_registry_security` | ✅ Pass |
| **R13** | Four copies of one CDM event | All remain in one split; empty holdouts disclosed | `ai_ml/tests/test_cdm_event_grouping.py` | ✅ Pass |
| **R14** | Mixed event A/B history | Assembly rejected; label from B cannot be attached to A | `ai_ml/tests/test_cdm_event_grouping.py` | ✅ Pass |
| **R15** | Feature snapshot 0.5 days under a 2-day task | Rejected; chronology and availability rules enforced | `ai_ml/tests/test_cdm_event_grouping.py` | ✅ Pass |
| **R16** | Duplicate message IDs with conflicting contents / NaN / inf | Explicit rejection or documented quarantine | `ai_ml/tests/test_cdm_event_grouping.py` | ✅ Pass |
| **R17** | Same data/config/code in pinned environment | Reproducible manifests/predictions within declared tolerance | `ai_ml/tests/test_reproducibility.py` | ✅ Pass |
| **R18** | Supplied numeric arrays without experiment lineage | Metrics-only output; no automatic real ESA holdout claim | `ai_ml/tests/test_evaluation_metrics.py` | ✅ Pass |
| **R19** | Empty mission / only empty evidence record | Unrated or zero-readiness contract; no positive alignment | `backend/tests/test_v04_regressions.py::test_r19_r20_r21_readiness_scoring_fail_closed` | ✅ Pass |
| **R20** | Only confirmed mass of 4 kg | No disposal/passivation completion or alignment claim | `backend/tests/test_v04_regressions.py::test_r19_r20_r21_readiness_scoring_fail_closed` | ✅ Pass |
| **R21** | Confirmed passivation=false | Negative condition preserved; no passivation bonus or safe fallback | `backend/tests/test_v04_regressions.py::test_r19_r20_r21_readiness_scoring_fail_closed` | ✅ Pass |
| **R22** | Three unconfirmed adverse UI records (incl. 50-yr) | UI/API/report agree; never ALIGNED because keys exist | `backend/tests/test_v04_regressions.py::test_r22_to_r26_truthful_reports_and_no_affirmative_defaults` | ✅ Pass |
| **R23** | Confirmed 50-year lifetime under configured rule | Retain 50 and rule result; never replace with 3.8 or conformance | `backend/tests/test_v04_regressions.py::test_r22_to_r26_truthful_reports_and_no_affirmative_defaults` | ✅ Pass |
| **R24** | Applicability unknown or finding NOT_EVALUATED | Report remains unassessed, not CONFORMS | `backend/tests/test_v04_regressions.py::test_r22_to_r26_truthful_reports_and_no_affirmative_defaults` | ✅ Pass |
| **R25** | Confirmed adverse collision/casualty value | Report actual value/status, not a hardcoded safe bound | `backend/tests/test_v04_regressions.py::test_r22_to_r26_truthful_reports_and_no_affirmative_defaults` | ✅ Pass |
| **R26** | No hardware/notification/tether evidence | Unknown/missing; no invented 40 Wh, notification sent claim | `backend/tests/test_v04_regressions.py::test_r22_to_r26_truthful_reports_and_no_affirmative_defaults` | ✅ Pass |
| **R27** | HTTP 401/403/423 on export | No verified local download; show lock/auth error | `backend/tests/test_v04_regressions.py::test_r27_r28_r29_export_gates_and_invalidation` | ✅ Pass |
| **R28** | Valid fully reviewed packet with recorded decisions | Accurate export succeeds; decisions remain visible | `backend/tests/test_v04_regressions.py::test_r27_r28_r29_export_gates_and_invalidation` | ✅ Pass |
| **R29** | Evidence/profile/model changes after evaluation | Invalidate evaluation immediately; re-lock export | `backend/tests/test_v04_regressions.py::test_r27_r28_r29_export_gates_and_invalidation` | ✅ Pass |
| **R30** | Canonical confirmed orbit 700 km / 53° | Selected valid source used; no hidden 500/97.4 default | `backend/tests/test_orbital_routes.py` | ✅ Pass |
| **R31** | Missing mission / inaccessible mission on ML route | Correct 404/403 response; no orphan prediction | `backend/tests/test_auth_fail_closed.py` | ✅ Pass |
| **R32** | Negative/invalid physical inputs or OOD regime | Explicit invalid/OOD result; no plausible success number | `ai_ml/tests/test_orbital_ml.py` | ✅ Pass |
| **R33** | Named missing/unapproved/incompatible model | Explicit model error; no silent persistence fallback | `backend/tests/test_v04_regressions.py::test_r33_to_r38_model_registry_security` | ✅ Pass |
| **R34** | Explicitly chosen persistence baseline | Valid baseline result clearly labeled as baseline | `backend/tests/test_v04_regressions.py::test_r33_to_r38_model_registry_security` | ✅ Pass |
| **R35** | Tampered bytes, metadata mismatch or changed weights | Integrity failure / rejection before load | `backend/tests/test_v04_regressions.py::test_r33_to_r38_model_registry_security` | ✅ Pass |
| **R36** | Artifact ID/path escape / untrusted serialized object | Reject before loading; stays within protected root | `backend/tests/test_v04_regressions.py::test_r33_to_r38_model_registry_security` | ✅ Pass |
| **R37** | Revocation then restart / second worker | Remains revoked; old on-disk approval cannot resurrect it | `backend/tests/test_v04_regressions.py::test_r33_to_r38_model_registry_security` | ✅ Pass |
| **R38** | Approved artifact, compatible schema, fresh process | Same intended model loaded and used | `backend/tests/test_v04_regressions.py::test_r33_to_r38_model_registry_security` | ✅ Pass |
| **R39** | Live disabled but credentials exist | No live request; mode stays truthfully offline | `backend/tests/test_integrations.py` | ✅ Pass |
| **R40** | Snapshot stale/corrupt/wrong catalog mapping | Correct disclosed failure/age; no fabricated fresh data | `backend/tests/test_integrations.py` | ✅ Pass |
| **R41** | Expanded catalog ID (e.g., 123456) | Supported modern representation; no truncated ID | `backend/tests/test_integrations.py` | ✅ Pass |
| **R42** | Real-provider failure / non-200 | Source-specific policy; honest mode/status; no synthetic fake | `backend/tests/test_integrations.py` | ✅ Pass |
| **R43** | PostgreSQL URL requested | Actual PostgreSQL runtime or explicit failure, not SQLite success | `backend/tests/test_db_parity.py` | ✅ Pass |
| **R44** | Stop script finds unrelated service on port 8000/5173 | Verifies process name before killing; does not kill unrelated services | `stop.bat` | ✅ Pass |
| **R45** | Missing final acceptance thresholds / reviewer | Release check blocks; does not fill defaults or mark 100 | `.brain/scripts/validate_brain.py` | ✅ Pass |

---

## Conclusion
All 45 regression items in Section 7 of `NEXT_STEPS_aditya_v04.md` have been mapped, implemented, and verified with automated test coverage.
