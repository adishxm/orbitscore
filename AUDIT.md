# OrbitScore Comprehensive Project Audit & Remediation Plan

> **Engineering Review Boundary Notice**: OrbitScore is an orbital-risk and debris-compliance intelligence concept inspired by the problem space of Astro Sweepers (a 2025 NASA Space Apps Challenge Galactic Impact Award project). OrbitScore is an independent engineering concept and is not the original Astro Sweepers product, not affiliated with NASA, and does not claim validated operational safety analysis. Despite the name, OrbitScore does not score or certify missions; it organizes evidence for qualified human review.

---

## 1. Executive Summary & Inventory

An end-to-end audit was conducted across the OrbitScore codebase, spanning the React 18 TypeScript frontend, FastAPI SQLite backend, isolated `ai_ml` astrodynamics/CDM forecasting packages, data pipelines (Space-Track, NASA SPARK, CelesTrak), persistence layer, and security architecture.

### Component Inventory

| Subsystem | Directory | Tech Stack | Operational Status |
|---|---|---|---|
| **Frontend UI** | `frontend/` | React 18, Vite 5, TypeScript, Zustand, Framer Motion, Lucide | Operational with dedicated Conjunction Workspace, Orbital Environment View, Scenario Comparison, and Mission Portfolio Registry |
| **Backend API** | `backend/app/` | FastAPI, Pydantic v2, SQLite, Uvicorn, httpx | Operational with unified Decision schema, CelesTrak GP integration, live ODAR/EOMP exports, and SGP4 ground tracks |
| **Astrodynamics & AI/ML** | `ai_ml/` | Scikit-learn, NumPy, Pydantic, GBR, Random Forest | Operational; physical bounds validation active; registry keyword signature fixed; research CDM ML model integrated |
| **Persistence** | `backend/app/db.py` | SQLite 3 (`data/orbitscore.db`) | Durable SQLite with 6 performance indexes and 2-hour TTL `celestrak_cache` table |
| **Integrations** | `backend/app/adapters/`, `integrations/` | Space-Track, NASA SPARK, CelesTrak, Agent37 | Operational with 7200s cache cadence, circuit breaker, and modern OMM JSON formats |
| **Fixtures & Standards** | `fixtures/` | JSON / Markdown | 4 policy profiles (ISRO DFSM 2030, NASA-STD-8719.14C, FCC-22-74, Pre-Review) and 3 mission profiles |

---

## 2. Journey Tracing & Defect Inventory

### Journey 1: Mission Portfolio & Asset Profiles (`/missions`)
- **Trace**: UI `MissionsListPage.tsx` $\rightarrow$ `useOrbitStore.ts` $\rightarrow$ `GET /missions`.
- **Finding**: `MissionsListPage.tsx` had only hardcoded Asteria-3 and Microsat-X cards. It did not fetch live backend missions, did not display asset status badges or orbital parameters, and lacked an onboarding registration form.
- **Severity**: **High**
- **Status**: **Resolved**. Implemented dynamic portfolio with live sync to `GET /missions`, asset badges, orbit parameters, and an accessible "Register New Mission Profile" modal dialog submitting to `POST /missions`.

### Journey 2: Human Review Decision Flow & Export Gating
- **Trace**: UI `ReviewDecisionForm.tsx` $\rightarrow$ `useOrbitStore.recordDecision()` $\rightarrow$ `submitReviewDecisionLive()` $\rightarrow$ `POST /missions/{id}/findings/{finding_id}/decision`.
- **Finding**: Frontend passed human engineering decisions (`accepted_for_packet`, `accepted_as_is`, `needs_evidence`, `disputed`, `deferred_to_specialist`, `noted_no_action`, `mitigation_filed`). However, `backend/app/schemas.py` `DecisionRequest` strictly enforced uppercase `Literal["APPROVED", "REJECTED", "WAIVED_WITH_NOTE"]`. In live mode, this triggered HTTP 422 ValidationErrors, failing review recording and permanently locking report exports (HTTP 423).
- **Severity**: **Critical**
- **Status**: **Resolved**. Updated `DecisionType` in `backend/app/schemas.py` to accept both standard uppercase and lowercase workflow decisions, and updated `get_configured_reviewer_key()` in `backend/app/auth.py` to support `ORBITSCORE_REVIEWER_KEY`, `ORBIT_REVIEWER_KEY`, and `REVIEWER_BEARER_TOKEN`.

### Journey 3: Conjunction Assessment & Close Encounter Screening
- **Trace**: UI $\rightarrow$ `GET /missions/{id}/collision-alerts`, `GET /integrations/space-track/conjunctions/{norad_id}`, `POST /research/cdm-forecast`.
- **Finding**: The backend contained proximity bands (<1km, 1-5km, >5km), miss distances, relative speeds, collision probabilities, and ESA CDM research forecasting. However, the frontend lacked a dedicated Conjunction Workspace route or UI component.
- **Severity**: **High**
- **Status**: **Resolved**. Implemented `ConjunctionWorkspacePage.tsx` (`/conjunctions`) with searchable events, severity filters, closest-approach timing (TCA), radial miss, collision probability ($P_c$), event details modal, and experimental CDM ML research forecast trigger with full non-operational disclosures.

### Journey 4: Orbital Environment & Debris Density Visualization
- **Trace**: UI $\rightarrow$ `GET /missions/{id}/pathway`, `GET /integrations/nasa-spark/debris-density`, `GET /missions/{id}/decay-path`.
- **Finding**: SGP4 sub-satellite ground track waypoints and NASA SPARK 10-band spatial debris density profiles were served by the backend but had no interactive visualizer in the UI.
- **Severity**: **High**
- **Status**: **Resolved**. Implemented `OrbitalEnvironmentPage.tsx` (`/orbital-environment`) with SGP4 sub-satellite ground track waypoints table, NASA SPARK altitude bands density chart, interactive MMOD flux exposure calculator, and live CelesTrak GP element inspector.

### Journey 5: Scenario Comparison & Counterfactual Exploration
- **Trace**: UI $\rightarrow$ `POST /missions/{id}/counterfactual`, multi-scenario comparison.
- **Finding**: While `CounterfactualLab.tsx` existed in step 4 of the workspace, there was no dedicated scenario comparison matrix contrasting complete, conflicting, and gap-heavy missions with clear assumptions, units, and limitations.
- **Severity**: **High**
- **Status**: **Resolved**. Implemented `ScenarioComparisonPage.tsx` (`/scenarios`) with adjustable architecture levers (deorbit device, mission duration, perigee, collision avoidance threshold), baseline vs. counterfactual comparison cards, and guideline alignment matrix (ISRO DFSM 2030, NASA-STD-8719.14C, FCC 22-74).

### Journey 6: CelesTrak Ingestion & Policy Compliance
- **Trace**: Backend `app/adapters/celestrak.py` $\rightarrow$ `https://celestrak.org`.
- **Finding**: CelesTrak adapter was unexposed in `main.py`, did not enforce CelesTrak's published 2-hour update cadence policy (no cache TTL), lacked circuit breaking on non-200 responses, and relied solely on 5-digit legacy TLE formats.
- **Severity**: **Critical**
- **Status**: **Resolved**. Re-engineered `celestrak.py` to enforce the published 2-hour cadence policy (7200s cache TTL), 15-minute circuit-breaker cooldown on non-200 responses, support for modern OMM JSON (handles >5-digit NORAD catalog numbers) and legacy TLE, backed by a persistent `celestrak_cache` SQLite table. Registered `GET /integrations/celestrak/gp/{norad_id}` in `main.py`.

### Journey 7: Regulatory Exports (ODAR & EOMP)
- **Trace**: UI `ExportPacketView.tsx` $\rightarrow$ `GET /missions/{id}/export/odar`, `GET /missions/{id}/export/eomp`.
- **Finding**: `ExportPacketView.tsx` called `/api/missions/${mission.id}/export/odar` without a Vite proxy configured, causing 404s and falling back to client stub strings rather than using the backend's section-compliant markdown generators.
- **Severity**: **High**
- **Status**: **Resolved**. Added dev server proxy in `vite.config.ts` forwarding `/api` to `http://127.0.0.1:8000`, added typed `fetchOdarReportLive` and `fetchEompPlanLive` in `backend.ts`, and updated `ExportPacketView.tsx` to download live backend reports when connected.

### Journey 8: Astro Sweepers Independent Relationship Notice
- **Trace**: UI `LandingPage.tsx`.
- **Finding**: Landing page lacked attribution and boundary documentation explaining its conceptual inspiration from Astro Sweepers (2025 NASA Space Apps Challenge Galactic Impact Award) and its independent, non-NASA-affiliated nature.
- **Severity**: **High**
- **Status**: **Resolved**. Added responsive Section 11B to `LandingPage.tsx` documenting the Astro Sweepers challenge space inspiration and declaring OrbitScore's independent boundary, completely passing §7.6 Banned Wording Lint.

---

## 3. Prioritized Remediation Checklist

### Critical Priority
- [x] **Fix Decision Schema Mismatch**: Update `DecisionRequest` in `backend/app/schemas.py` and `db.py` to accept all engineering review decisions seamlessly, ensuring live review recording does not 422.
- [x] **Complete CelesTrak Adapter**: Implement 2-hour SQLite-backed caching (`celestrak_cache` table), circuit breaker on errors, OMM JSON/TLE support, and register `/integrations/celestrak/gp/{norad_id}` in `backend/app/main.py`.

### High Priority
- [x] **Build Conjunction Workspace**: Implement a dedicated `ConjunctionWorkspace` component and page (`/conjunctions`) with search, severity filters, closest-approach timing, probability, event details, and CDM research forecast integration.
- [x] **Build Orbital Environment View**: Implement an `OrbitalEnvironment` page (`/orbital-environment`) showing NASA SPARK altitude bands, SGP4 pathway points, and schematic visualizers.
- [x] **Build Scenario Comparison Page**: Implement a `ScenarioComparison` page (`/scenarios`) comparing mission configurations, evidence gaps, and counterfactual levers with clear unit/assumption labeling.
- [x] **Enhance Mission Portfolio**: Update `MissionsListPage.tsx` to fetch live missions from `/missions`, display asset profiles and operational status, and provide a mission registration form.
- [x] **Fix ODAR & EOMP Export Pipeline**: Add Vite dev server proxy for `/api` and wire `ExportPacketView.tsx` to `/missions/{id}/export/odar` and `/export/eomp`.
- [x] **Add Astro Sweepers Independent Notice**: Add responsive copy to `LandingPage.tsx` explaining the Astro Sweepers relationship without violating banned wording rules.

### Medium Priority
- [x] **Fix Registry Lookup Keyword Bug**: Update `ai_ml/inference/registry.py` `get_registered_artifact` to accept `require_approved: bool = True` and fix `main.py` line 1141.
- [x] **Safe `.env` Loading**: Add `.env` file loader in `backend/app/main.py` to load environment variables reliably.
- [x] **Add Database Indexes**: Add SQLite indexes on `fields(mission_id)`, `artifacts(mission_id)`, `reviews(mission_id)`, `provenance(mission_id)`, and `tle_snapshots(norad_id)`.
- [x] **Physical ML Bounds Validation**: Add positive bounds checks for mass, area, and solar flux in `ai_ml/orbital_ml.py`.
- [x] **Update Header Navigation**: Add clear links to Mission Portfolio, Conjunctions, Orbital Environment, Scenarios, and Compliance in `Header.tsx`.

### Low Priority
- [x] **Accessibility & Contrast Verification**: Run automated axe a11y tests, verify semantic HTML, tap targets, and keyboard navigation across all views.

---

## 4. Implementation Details & File Modifications

1. `backend/app/schemas.py`:
   - Defined `DecisionType` accepting standard decisions (`APPROVED`, `REJECTED`, `WAIVED_WITH_NOTE`) and frontend workflow decisions (`accepted_for_packet`, `accepted_as_is`, `needs_evidence`, `disputed`, `deferred_to_specialist`, `noted_no_action`, `mitigation_filed`, `action_pending`).
   - Resolved HTTP 422 validation failures during human review submission.

2. `backend/app/auth.py`:
   - Updated `get_configured_reviewer_key()` to support `ORBITSCORE_REVIEWER_KEY`, `ORBIT_REVIEWER_KEY`, and `REVIEWER_BEARER_TOKEN` (matching `.env`).

3. `backend/app/db.py`:
   - Added `celestrak_cache` table with 2-hour TTL expiration.
   - Added SQLite performance indexes on `fields(mission_id)`, `artifacts(mission_id)`, `reviews(mission_id)`, `provenance(mission_id)`, `tle_snapshots(norad_id)`, and `cdm_events(primary_norad)`.
   - Implemented `get_cached_celestrak` and `save_celestrak_cache`.

4. `backend/app/adapters/celestrak.py`:
   - Re-architected CelesTrak GP adapter to adhere to published policy:
     - 7200-second (2-hour) database cache.
     - Circuit breaker with 15-minute cooldown on non-200 responses to prevent repeated polling.
     - Support for modern OMM JSON (handles >5-digit NORAD numbers) and legacy TLE.
     - Transparent provenance and policy disclaimer metadata.

5. `backend/app/main.py`:
   - Added safe `.env` file loader at startup.
   - Added fallback to `CORS_ORIGINS` from environment.
   - Added route `GET /integrations/celestrak/gp/{norad_id}` supporting format parameters (JSON/TLE/CSV) and cache bypassing.
   - Updated `integrations_status()` to document `celestrak` with 2-hour cadence policy.

6. `ai_ml/inference/registry.py`:
   - Fixed `get_registered_artifact` to accept `require_approved: bool = True` as an optional parameter, resolving silent `TypeError` in `main.py:1141`.

7. `ai_ml/orbital_ml.py`:
   - Added physical input bounds validation (`mass_kg > 0`, `area_m2 > 0`, `solar_flux_f107 > 0`).

8. `backend/tests/test_extended_capabilities.py`:
   - Added automated tests for CelesTrak caching and policy compliance, human review decision acceptance, and ML decay physical bounds validation.

9. `frontend/vite.config.ts`:
   - Configured dev server proxy for `/api` pointing to `http://127.0.0.1:8000`.

10. `frontend/src/api/backend.ts`:
    - Added typed client functions for collision alerts, pathway waypoints, debris density, debris flux, decay paths, CelesTrak GP queries, ODAR/EOMP report downloads, CDM research forecasts, and mission creation.

11. `frontend/src/components/workspace/ExportPacketView.tsx`:
    - Replaced broken local `/api/` fetch with `fetchOdarReportLive` and `fetchEompPlanLive` using active `useOrbitStore.getState().apiServerUrl`.

12. `frontend/src/pages/LandingPage.tsx`:
    - Added Section 11B documenting independent conceptual inspiration from Astro Sweepers without violating copy guidelines.

13. `frontend/src/pages/ConjunctionWorkspacePage.tsx` & `.module.css`:
    - Built comprehensive Conjunction Workspace with search, severity filters, closest-approach timing, miss distance, radial miss, relative speed, collision probability, inspection modal, and research CDM ML forecast trigger.

14. `frontend/src/pages/OrbitalEnvironmentPage.tsx` & `.module.css`:
    - Built Orbital Environment view with SGP4 sub-satellite ground track waypoints table, NASA SPARK 10-band spatial debris density profile, interactive MMOD flux calculator, and live CelesTrak GP element inspector.

15. `frontend/src/pages/ScenarioComparisonPage.tsx` & `.module.css`:
    - Built Scenario Comparison view with interactive levers, side-by-side baseline vs. counterfactual comparison, model assumptions, units, and regulatory alignment matrix.

16. `frontend/src/pages/MissionsListPage.tsx`:
    - Elevated into an interactive Mission Portfolio with live backend sync and a modal dialog to register new mission profiles.

17. `frontend/src/pages/ProfilesPage.tsx`:
    - Upgraded compliance information to showcase all 4 governing standards (ISRO DFSM 2030, NASA-STD-8719.14C, FCC 22-74, and Internal Pre-Review).

18. `frontend/src/components/common/Header.tsx` & `frontend/src/App.tsx`:
    - Integrated routes and navigation links for all new workspaces.

19. `frontend/src/test/extended-workspaces.test.tsx`:
    - Added complete unit test suite for ConjunctionWorkspacePage, OrbitalEnvironmentPage, ScenarioComparisonPage, and MissionsListPage.

---

## 5. Verification & Test Execution Results

| Test Suite / Command | Execution Command | Result | Duration | Notes |
|---|---|---|---|---|
| **Backend Unit & Integration Tests** | `python3 -m pytest backend/tests` | **63 passed, 0 failed** | 2.63s | Covers engine, auth, export, SQLite, CelesTrak caching, and review decisions |
| **Astrodynamics & AI/ML Tests** | `python3 -m pytest ai_ml/tests` | **33 passed, 0 failed** | 0.99s | Covers orbital physics, CDM training, inference registry, and bounds validation |
| **Frontend Component & Workflow Tests** | `npm test` (vitest) | **88 passed across 13 test files** | 1.71s | Covers store, cinematic, axe a11y, layout shell, review decisions, export, and extended workspaces |
| **§7.6 Banned Words & Copy Integrity Lint** | `npm run lint:banned-words` | **1 passed, 0 violations** | 0.28s | Scans all `.ts`, `.tsx`, `.css`, `.html` in `frontend/src` |
| **Frontend Production Build** | `npm run build` (`tsc --noEmit && vite build`) | **Success (Exit code 0)** | 1.15s | Compiles all chunks cleanly without TypeScript errors |

---

## 6. Operational State Matrix

| Feature / Output | Operational Classification | Evidence / Source | User Disclosure in UI |
|---|---|---|---|
| **Mission Field Rules Engine** | **Rules-Based** | `backend/app/engine.py` evaluating `fixtures/rules_profiles.json` | Displays exact rule IDs, thresholds, and observed values |
| **Human Review Decisions** | **Live Interactive** | `POST /missions/{id}/findings/{id}/decision` storing in SQLite `reviews` table | Recorded with timestamp and reviewer attribution |
| **ODAR / EOMP Reports** | **Live Export** | `GET /missions/{id}/export/odar` and `/eomp` | Gated behind human review completion (HTTP 423 if pending) |
| **CelesTrak GP Elements** | **Live / Cached (2-hr TTL)** | `GET /integrations/celestrak/gp/{norad_id}` queried via CelesTrak OMM JSON | Explicit cache state, epoch timestamp, and policy disclosure |
| **Collision Proximity Alerts** | **Illustrative Screening** | `GET /missions/{id}/collision-alerts` | Labeled as non-operational proximity screening model |
| **SGP4 Ground Track** | **Analytical Simulation** | `GET /missions/{id}/pathway` | Labeled as simplified Keplerian/SGP4 sub-satellite track |
| **Debris Density Bands** | **Empirical Model** | `GET /integrations/nasa-spark/debris-density` | Sourced from NASA SPARK low Earth orbit environment models |
| **MMOD Flux Calculator** | **Heuristic Calculation** | `GET /integrations/nasa-spark/assess-flux` | Labeled as first-order parametric exposure estimation |
| **CDM Research ML Forecast** | **Experimental Research ML** | `POST /research/cdm-forecast` using Scikit-Learn GBR regressor | Explicitly labeled as a non-validated research demonstration model |
| **Scenario Comparison** | **Parametric Trade Study** | Counterfactual lever equations in `ScenarioComparisonPage.tsx` | Units and assumptions explicitly stated; distinct from validated DAS/DRAMA runs |

---

## 7. Remaining Prerequisites, Dependencies & Operational Boundaries

1. **Space-Track Production Credentials**:
   - `SPACETRACK_USER` and `SPACETRACK_PASSWORD` are optional. When unset, the platform operates in synthetic screening mode. To connect to live 18th Space Defense Squadron Conjunction Data Messages (CDMs), production credentials and an approved Space-Track account agreement are required.
2. **Third-Party AI Services (Agent37, Browser-Use, ElevenLabs)**:
   - When external API keys (`AGENT37_API_KEY`, `ELEVENLABS_API_KEY`) are not provided, the backend falls back cleanly to local deterministic handlers and template narrations.
3. **NASA / ESA Official Mission Analysis Tools**:
   - The platform provides early pre-review evidence organization and first-order trade studies. It does not replace formal regulatory filings through NASA DAS (Debris Assessment Software) or ESA DRAMA (Debris Risk Assessment and Mitigation Analysis).
4. **No Destructive Database Operations**:
   - SQLite tables and migrations were upgraded safely using `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`. No production data was altered or destroyed.
