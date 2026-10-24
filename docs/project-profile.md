# OrbitScore: Project Profile

Generated during Phase 0 discovery according to the EDOLUS-Style Cinematic WebGL Master Build Prompt.

---

### 1. PROJECT_NAME
- **Value**: `OrbitScore`
- **Tag**: FOUND
- **Source**: [`package.json:2`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/package.json#L2), [`frontend/package.json:2`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/frontend/package.json#L2), [`README.md:1`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/README.md#L1)

---

### 2. ONE_LINE_PITCH
- **Value**: "A source-linked pre-review mission evidence workspace and synthetic orbital context dashboard for student, university, and small spacecraft engineering teams."
- **Tag**: FOUND
- **Source**: [`README.md:7`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/README.md#L7), [`frontend/src/pages/LandingPage.tsx:233`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/frontend/src/pages/LandingPage.tsx#L233)

---

### 3. AUDIENCE
- **Value**: Student, university, and small spacecraft engineering teams, mission leads, systems engineers, and technical reviewers preparing orbital licensing, debris assessment, and compliance dossiers prior to qualified human engineering review.
- **Tag**: FOUND
- **Source**: [`README.md:5-7`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/README.md#L5-L7), [`.brain/AGENT.md:7`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/.brain/AGENT.md#L7)

---

### 4. STORYLINE & CHAPTERS
- **Value**: Instead of the generic AI infrastructure reference journey, OrbitScore's real mission content drives a 6-chapter aerospace evidence journey from low Earth orbit to regulatory mission dossier generation:
  - **Chapter 1: Orbital Intelligence & Telemetry** (Pointer) — 3U CubeSat in 500 km Sun-Synchronous Orbit (SSO) with solar arrays, real-time telemetry HUD (altitude, velocity, stowed envelope, beta angle), and mission context.
  - **Chapter 2: Planetary Network & Spatial Debris Density** (Pointer) — Global terrestrial ground station network arcs, LEO orbital tracks, Space-Track TLE states, and NASA SPARK/ORDEM spatial debris flux density.
  - **Chapter 3: Autonomous Deterministic Engines** (Scroll) — Stream of active engineering telemetry through the deterministic check matrix (rules C-01 through C-06); cross-subsystem discrepancy scanning (CAD mass 3.82 kg vs Launch Spec ICD 4.15 kg).
  - **Chapter 4: Space Credit & Provenance Core** (Pointer) — 4-pillar Space Credit Index (0–100 readiness, AAA to C tier) and tamper-evident SHA-256 cryptographic hash chain core with interactive nodal integrity verification.
  - **Chapter 5: Human Review & Decision Gate** (Pointer) — The engineering authority boundary: designated human sign-offs, technical rationales, mitigation tracking, and the strict HTTP 423 export lock.
  - **Chapter 6: Regulatory Mission Dossier** (Pointer/CTA) — Automated generation of section-compliant draft NASA-STD-8719.14 ODAR and ISRO DFSM 2030 / FCC 5-year EOMP review dossiers; launch Asteria-3 workspace; return to orbit.
- **Tag**: INFERRED (adapted directly from OrbitScore's verified engineering capabilities in `README.md:9-21`, `docs/Technical_Stack_Final.md:38-60`, and `frontend/src/pages/LandingPage.tsx`)
- **Source**: [`README.md:9-21`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/README.md#L9-L21), [`docs/Technical_Stack_Final.md`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/docs/Technical_Stack_Final.md)

---

### 5. STACK AND VERSIONS
- **Frontend**:
  - React `18.3.1`, React DOM `18.3.1` (FOUND: `frontend/package.json:19-20`)
  - TypeScript `~5.6.3` (FOUND: `frontend/package.json:34`)
  - Vite `^5.4.11` (FOUND: `frontend/package.json:35`)
  - Three.js `^0.186.1` & `@types/three ^0.186.0` (FOUND: `frontend/package.json:16,22`)
  - Zustand `^5.0.1` (FOUND: `frontend/package.json:23`)
  - Framer Motion `^11.11.17` (FOUND: `frontend/package.json:17`)
  - Lucide React `^0.460.0` (FOUND: `frontend/package.json:18`)
  - React Router DOM `^6.28.0` (FOUND: `frontend/package.json:21`)
  - Vitest `^2.1.4`, Testing Library React `^16.0.1`, Axe-Core `^4.10.2` (FOUND: `frontend/package.json:26-37`)
- **Backend**:
  - Python `3.10.11` (FOUND: `render.yaml:18`)
  - FastAPI, Uvicorn, SQLite3, Pydantic (FOUND: `backend/requirements.txt`, `backend/app/main.py`)
  - Scikit-Learn `GradientBoostingRegressor`, `RandomForestClassifier` (FOUND: `ai_ml/`, `docs/Technical_Stack_Final.md:31`)
- **Tag**: FOUND
- **Source**: [`frontend/package.json`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/frontend/package.json), [`render.yaml`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/render.yaml), [`docs/Technical_Stack_Final.md`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/docs/Technical_Stack_Final.md)

---

### 6. ROUTES AND PAGES
- **Routes**:
  - `/`: [`LandingPage.tsx`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/frontend/src/pages/LandingPage.tsx) (Target route for the WebGL cinematic experience)
  - `/how-it-works`: [`HowItWorksPage.tsx`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/frontend/src/pages/HowItWorksPage.tsx)
  - `/profiles`: [`ProfilesPage.tsx`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/frontend/src/pages/ProfilesPage.tsx)
  - `/about-limits`: [`AboutLimitsPage.tsx`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/frontend/src/pages/AboutLimitsPage.tsx)
  - `/status`: [`StatusPage.tsx`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/frontend/src/pages/StatusPage.tsx)
  - `/missions` & `/app/missions`: [`MissionsListPage.tsx`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/frontend/src/pages/MissionsListPage.tsx)
  - `/missions/:id` & `/app/missions/:id`: [`MissionWorkspacePage.tsx`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/frontend/src/pages/MissionWorkspacePage.tsx)
  - `*`: [`NotFoundPage.tsx`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/frontend/src/pages/NotFoundPage.tsx)
- **Tag**: FOUND
- **Source**: [`frontend/src/App.tsx:28-44`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/frontend/src/App.tsx#L28-L44)

---

### 7. COMPONENT AND CONTENT INVENTORY
- **Common Chrome**:
  - `Header`: Navigation, live/local API toggle, mission links.
  - `Footer`: Boundary notice, links, a11y declaration, version.
  - `StatusBanner`: Boundary declaration & active mode indicator.
  - `Logo`: Technical monogram & wordmark.
  - `OrbitHudNav`: Scroll-driven sticky telemetry navigation bar.
  - `StateChip`: 5-state evidence chip badge renderer.
- **3D Components**:
  - `SpacecraftCanvas`: Three.js procedural 3U CubeSat, Earth sphere, orbit ring, and lights.
- **Mission Workspace Components**:
  - `MissionContextCard`: Spacecraft metadata, orbit parameters, mass budget.
  - `OrbitalContextCard`: Synthetic altitude/decay visualization.
  - `ProfileGateCard`: Applicability boundary evaluation.
  - `DataTable`: 5-state evidence register with primary citation drill-down.
  - `FindingsView` & `FindingCard`: C-01 to C-06 deterministic rule outcomes.
  - `ReviewDecisionForm`: Human review sign-off modal and rationale entry.
  - `OpenIssuesList`: Unresolved findings tracker.
  - `ExportGateBlocker`: HTTP 423 lock barrier preventing unverified export.
  - `ExportPacketView`: Cited review dossier preview, JSON/Markdown export, and print stylesheet.
  - `CounterfactualLab`: Interactive what-if parameter modification laboratory.
  - `SidePanel` & `Stepper`: Workflow navigation and detail inspection drawers.
- **Tag**: FOUND
- **Source**: [`frontend/src/components/`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/frontend/src/components/)

---

### 8. CRITICAL FEATURES, FORMS, AUTH & API CALLS
- **Features That Must Never Break**:
  1. Interactive Mission Evidence Register with 5-state filtering (`confirmed`, `unconfirmed`, `missing`, `conflicting`, `out-of-scope`).
  2. Human Engineering Review Decision recording with reviewer name, role, and technical rationale.
  3. Strict Export Gate Blocker (Export is blocked with HTTP 423 until all actionable findings have recorded decisions).
  4. Cryptographic SHA-256 Provenance Chain validation (`/provenance`).
  5. Space Credit Index (`GET /missions/{id}/space-credit-index`).
  6. Astrodynamics ML predictions (`POST /missions/{id}/ml/predict-decay` & `/collision-risk`).
  7. Space-Track & NASA SPARK integration proxies (`GET /integrations/...`).
  8. Automated NASA ODAR & ISRO EOMP export dossiers (`GET /missions/{id}/export/odar`, `/export/eomp`).
  9. Dual mode operation: Local deterministic client engine (offline) and live FastAPI server connection (`http://127.0.0.1:8000`).
- **Auth**:
  - Currently unauthenticated local workspace / bearer reviewer keys in production (`ORBITSCORE_REVIEWER_KEY`).
- **Tag**: FOUND
- **Source**: [`README.md:9-21`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/README.md#L9-L21), [`frontend/src/store/useOrbitStore.ts`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/frontend/src/store/useOrbitStore.ts), [`backend/app/main.py`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/backend/app/main.py)

---

### 9. BRAND ASSETS AND DESIGN TOKENS
- **Color Palette**:
  - Pure Deep Black Base: `#05070a`, `#090d12`
  - Technical Overlays: `#10151c`, `#141a23`, `#1a222e`
  - High-Contrast Text: Pure white `#ffffff`, primary `#f0f4f8`, secondary `#9daec2`, muted `#6f8298`
  - Technical Accents: Cyan `#00a1ff` (primary telemetry & link), Amber `#f59e0b` (warning & unconfirmed), Crimson `#f43f5e` (missing/conflict), Emerald `#34d399` (confirmed), Purple `#c084fc` (conflicting).
- **Typography** (Self-hosted in `frontend/public/fonts/`):
  - Primary Grotesque Display: `Space Grotesk` (weights: 500, 700)
  - Interface Body: `Inter` (weights: 400, 600)
  - Telemetry & Code: `JetBrains Mono` (weights: 400, 600)
- **Brand Motifs**:
  - Hairline technical borders (`1px solid #1c2530` / `#2b3644`)
  - Precision corner brackets, crosshairs, tick scales
  - Telemetry readouts, tabular numbers, synthetic demo tags
- **Tag**: FOUND
- **Source**: [`frontend/src/styles/tokens.css`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/frontend/src/styles/tokens.css), [`frontend/public/fonts/`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/frontend/public/fonts/)

---

### 10. DEPLOY TARGET
- **Value**:
  - Static Frontend: Render Static Site (`orbitscore-web`, `dist/`, SPA rewrite `/*` -> `/index.html`)
  - API Service: Render Web Service (`orbitscore-api`, Python 3.10.11, Uvicorn)
  - Background Worker: Render Background Worker (`orbitscore-worker`)
  - Local Dev Server: Vite on `http://localhost:5173`
- **Tag**: FOUND
- **Source**: [`render.yaml`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/render.yaml)

---

### 11. GOVERNANCE & ARCHITECTURAL CONSTRAINTS
- **Engineering Review Boundary Notice**: "OrbitScore does not score or certify missions; it organizes evidence for human review. Its demo orbital data is synthetic and is not a safety or compliance assessment."
- **Deterministic Check Principle**: Software produces findings and organizes evidence; it never issues flight certifications, waivers, or launch approvals.
- **Safety Boundary Notice**: Must appear prominently on landing view and export packets.
- **Accessibility & Contrast**: Strict WCAG 2.2 AA compliance (Axe-core checked with 0 violations); reduced-motion support (`prefers-reduced-motion`) required.
- **Tag**: FOUND
- **Source**: [`README.md:3-5`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/README.md#L3-L5), [`.brain/AGENT.md:26-36`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/.brain/AGENT.md#L26-L36), [`frontend/src/test/a11y.test.tsx`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/frontend/src/test/a11y.test.tsx)

---

### 12. PROJECT SUBFOLDER OVERRIDE
- **PROJECT_PATH**: `frontend` (The canonical Vite application root lives in `/Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/frontend`)
- **SOUND**: Opt-in (default)
- **Tag**: FOUND
- **Source**: [`package.json:5-7`](file:///Users/narayanjha/Documents/Git-Projects/HaX26/PhantomDeps/OrbitScore/package.json#L5-L7)
