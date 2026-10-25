<div align="center">

# OrbitScore

**Source-Linked Mission Evidence Organization & Debris-Mitigation Copilot for Small Spacecraft**

[![CI Pipeline](https://github.com/adishxm/orbitscore/actions/workflows/ci.yml/badge.svg)](https://github.com/adishxm/orbitscore/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://www.python.org/)
[![React 18 / TypeScript](https://img.shields.io/badge/Frontend-React%2018%20%2F%20TypeScript-61dafb?logo=react)](frontend/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](backend/)
[![WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA-success)](frontend/)

*A source-backed, human-reviewed decision-support workspace helping student, university, and commercial SmallSat/CubeSat teams organize cited mission data, evaluate deterministic debris-mitigation rules, and prepare audit-ready compliance dossiers.*

</div>

---

> ### ⚠️ Engineering Review Boundary Notice
> **OrbitScore does not certify missions or make operational safety determinations.**  
> - **AI assists extraction & explanation.**  
> - **Deterministic code evaluates confirmed inputs.**  
> - **Qualified human engineers review, approve, and decide.**  
> 
> OrbitScore organizes evidence for human review. Demo orbital data is synthetic and does not represent real-time space surveillance. The **Space Credit Index** is an evidence-readiness benchmark, not an official compliance certification or collision prediction score.

---

## 🌟 Executive Summary

Small-satellite engineering teams face escalating regulatory scrutiny under global space sustainability mandates (e.g., FCC 5-year post-mission deorbit rule, ISRO Debris-Free Space Missions 2030, NASA-STD-8719.14, and ESA Zero Debris standards). Yet teams struggle with fragmented spreadsheets, contradictory subsystem documents, unconfirmed assumptions, and laborious manual filings.

**OrbitScore** solves this by uniting:
1. **Interactive Cinematic Experience & 3D WebGL Visualization**: A responsive, accessible 3D spacecraft inspection canvas with scroll-driven HUD navigation and real-time mission telemetry simulation.
2. **Deterministic Check & Compliance Engine**: 100% reproducible rule evaluation mapping parameters directly to global debris-mitigation standards.
3. **Space Credit Index Engine**: A deterministic 4-pillar readiness index (0–100, AAA to D) measuring orbital footprint, natural atmospheric lifetime, passivation reliability, and citation provenance.
4. **Draft ODAR & EOMP Export Pipeline**: Automated generation of draft NASA Orbital Debris Assessment Reports (ODAR) and End-of-Mission Plans (EOMP) locked behind a strict human review gate.
5. **Offline Astrodynamics ML & Trusted Registry**: Supervised decay lifetime regression, conjunction geometry classification, and ESA Conjunction Data Message (CDM) historical risk forecasting.
6. **Air-Gapped & Offline Contingency**: Complete offline reproducibility with bundled synthetic fixtures (`fixtures/`) ensuring seamless evaluations without external network or API keys.

---

## 🏛️ System Architecture

```
                                  ┌──────────────────────────────────────────────┐
                                  │      ORBITSCORE WEB & CINEMATIC CLIENT       │
                                  │  React 18 · TypeScript Strict · Zustand UI   │
                                  │  Three.js WebGL 3D Canvas · Web Audio Engine │
                                  └──────────────────────┬───────────────────────┘
                                                         │ HTTP / JSON API
                                                         ▼
                                  ┌──────────────────────────────────────────────┐
                                  │           FASTAPI BACKEND SERVICE            │
                                  │     Fail-Closed Auth · Mission Router        │
                                  └───────┬──────────────┬──────────────┬────────┘
                                          │              │              │
                   ┌──────────────────────┴──┐           │           ┌──┴────────────────────────┐
                   ▼                         ▼           │           ▼                           ▼
      ┌─────────────────────────┐  ┌──────────────────┐  │  ┌──────────────────┐  ┌─────────────────────┐
      │  DETERMINISTIC ENGINE   │  │ PROVENANCE CHAIN │  │  │ PERSISTENCE & DB │  │   DOCUMENT EXPORT   │
      │ Pure Rule Verification  │  │ SHA-256 Tamper-  │  │  │ SQLite/PostgreSQL│  │ Draft ODAR (NASA)   │
      │ 5 Profile States Matrix │  │ Evident Audit Log│  │  │ SQLModel/Alembic │  │ Draft EOMP (ISRO/FCC)│
      └─────────────────────────┘  └──────────────────┘  │  └──────────────────┘  └─────────────────────┘
                                                         ▼
                                  ┌──────────────────────────────────────────────┐
                                  │        AI / ML ASTRODYNAMICS & REGISTRY      │
                                  │ Scikit-Learn Regressors · ESA CDM Pipeline   │
                                  │ Cryptographic Artifact Registry · CLI Tools  │
                                  └──────────────────────────────────────────────┘
```

---

## 🚀 Key Modules & Capabilities

### 1. Interactive Cinematic 3D Experience (`frontend/src/cinematic/`)
- **Three.js WebGL Engine**: Interactive 3U CubeSat canvas with orbital altitude visualization, solar panel orientation, and earth context.
- **Scroll-Driven HUD Navigation**: 32,000px virtual timeline scroll engine with smooth lerp physics and snap chapters.
- **Procedural Audio Engine**: Web Audio API synthesizer generating real-time ambient cues and telemetry telemetry feedback.
- **Full Accessibility (WCAG 2.2 AA)**: Automatic reduced-motion fallback (`AccessibleFallback.tsx`), keyboard navigation, and high-contrast color tokens.

### 2. Sourced Evidence Register & Workspace (`frontend/src/`)
- **Granular Parameter Citations**: Every physical, orbital, and subsystem parameter links directly to a primary source document, date, page locator, and revision.
- **Unconfirmed Candidate Triage**: Newly parsed or suggested values are tagged `human_confirmed=False` and isolated until engineering verification.
- **Counterfactual Lab**: Test "what-if" mission modifications (e.g. changing insertion altitude from 600 km to 500 km or adding deployable drag sails) and observe instant deterministic compliance impact.
- **Agent37 AI Copilot**: Contextual assistance drawer for parsing questions and reviewing guidelines with privacy-first document permission gates (`allowed_external_processing`).

### 3. Multi-Tier Regulatory Compliance Engine (`backend/app/engine.py`)
- **Tier 1 — India (ISRO DFSM 2030)**: Verification against Debris-Free Space Missions targets, 5-year LEO deorbiting recommendations, and passivation requirements.
- **Tier 2 — Global (FCC, NASA, ESA)**:
  - **FCC-22-74**: Strict 5-year post-mission orbital disposal rule.
  - **NASA-STD-8719.14**: Orbital debris limitation standards (Requirement 4.5.1 LEO lifetime, 4.6 passivation, 4.7 collision risk).
  - **ESA Zero Debris Charter / ISO 24113**: Clean-space standards and casualty risk thresholds ($< 10^{-4}$).
- **Five Standardized Finding States**:
  - `PASS_UNDER_PROFILE`: Parameter meets profile limits with verified primary source citations.
  - `WARNING`: Parameter is near operational boundaries or approaching threshold limits.
  - `NEEDS_EVIDENCE`: Required field is missing citations or unconfirmed by a human engineer.
  - `CONFLICT`: Multiple sources disagree on the value (e.g., CAD mass vs. interface mass).
  - `NOT_EVALUATED`: Profile rule is out of operational scope or data was withheld.

### 4. Space Credit Index Engine (`backend/app/routers/` & `engine.py`)
Deterministic, 4-pillar readiness index evaluating spacecraft missions on a 0–100 scale (Rating bands: AAA, AA, A, BBB, BB, B, CCC, D):
1. **Orbital Lifetime & Natural Decay (35%)**: Ballistic coefficient, perigee/apogee altitude, and atmospheric sink rate.
2. **Spatial Footprint & Cross-Section (25%)**: Collision cross-sectional area and orbital debris cluster density.
3. **Passivation & Decommissioning Readiness (25%)**: Battery depletion circuitry, propellant venting, and magnetic despin reliability.
4. **Citation Provenance & Verification Quality (15%)**: Completeness of primary source citations and human confirmation sign-offs.

### 5. Automated ODAR & EOMP Export Pipeline (`backend/app/export.py`)
- **NASA-STD-8719.14 ODAR Generator**: Automated draft report compiling mission description, orbital parameters, disposal plans, and collision assessments into standard government sections.
- **ISRO DFSM / FCC EOMP Generator**: Complete End-of-Mission Plan dossier generator.
- **HTTP 423 Export Review Gate**: Export generation remains strictly locked until an engineer provides explicit review decisions on all open findings and conflicts.

### 6. AI/ML Astrodynamics & Registry (`ai_ml/`)
- **Physical Decay Lifetime Regressor**: Scikit-Learn `GradientBoostingRegressor` estimating atmospheric reentry duration based on area-to-mass ratio and solar flux baselines.
- **Conjunction Risk Classifier**: `RandomForestClassifier` assessing collision probability from ESA Conjunction Data Messages (CDMs).
- **Offline ESA CDM Pipeline**: Training pipeline (`ai_ml.training.train_cdm`) featuring magnitude-aware precision/recall/F1 metrics and holdout evaluations.
- **Cryptographic Model Registry**: SHA-256 verified model registry (`ai_ml.inference.registry`) with CLI (`python -m ai_ml.cli`).

---

## 📁 Repository Structure

```text
.
├── frontend/               # Canonical React 18 + TS workspace (Zustand, Lucide, Framer Motion, Three.js)
│   ├── src/
│   │   ├── cinematic/      # 3D WebGL engine, Three.js CubeSat canvas, virtual timeline, sound synthesis
│   │   ├── components/     # Accessible UI components, StatusBanner, StateChip, EvidenceRegister
│   │   ├── api/            # Typed backend API client & dual-mode mock fallback adapter
│   │   └── types/          # Domain schemas, review decisions, compliance profiles
│   └── test/               # Vitest suite (85 tests covering components, flows, and a11y)
│
├── backend/                # FastAPI application service
│   ├── app/
│   │   ├── engine.py       # 100% deterministic regulatory evaluation rule engine
│   │   ├── export.py       # NASA ODAR & ISRO/FCC EOMP draft document generation
│   │   ├── provenance.py   # Cryptographic SHA-256 audit hash chain
│   │   ├── db.py           # SQLModel SQLite / PostgreSQL persistence with Alembic migrations
│   │   ├── adapters/       # Telemetry adapters (Space-Track, CelesTrak, NASA SPARK baselines)
│   │   └── main.py         # REST API endpoints and middleware
│   └── tests/              # Pytest test suite (86 tests across 13 suites including v04 regression & hardening suites)
│
├── ai_ml/                  # Astrodynamics ML & Document Extraction
│   ├── training/           # ESA CDM offline training and cross-validation pipelines
│   ├── inference/          # Cryptographically verified model artifact registry
│   ├── models/             # Regressors, classifiers, and evaluation metrics
│   └── cli.py              # Command-line interface for models and evaluations
│
├── fixtures/               # Synthetic mission inputs (Asteria-3, Microsat-X), rule profiles, and benchmarks
├── docs/                   # Architecture profiles, validation contracts, motion specs, and API contracts
│   └── validation/v04/     # V04 Release contract, requirements traceability, and task ID map
├── research/               # Preserved regulatory libraries, NASA/ESA/ISRO source registers, and literature
├── paper/                  # Research paper drafts and academic citations
├── launch.bat              # One-click Windows development server launcher
├── stop.bat                # Clean one-click process termination script
├── docker-compose.yml      # Multi-container orchestration (PostgreSQL + FastAPI + Vite Frontend)
├── Dockerfile              # Production container build
└── .brain/                 # Verified project tracking, task specifications, and completion records
```

---

## ⚡ Quick Start & Development

### Option 1: One-Click Automated Launch (Windows)
Double-click [`launch.bat`](launch.bat) or run:
```bat
launch.bat
```
*This starts the FastAPI backend (port 8000) and Vite frontend (port 5173) in clean background processes.*  
To stop all services cleanly:
```bat
stop.bat
```

---

### Option 2: Manual Step-by-Step Setup

#### 1. Backend & AI/ML Setup
```bash
# Clone the repository
git clone https://github.com/adishxm/orbitscore.git
cd orbitscore

# Install Python dependencies (Python 3.10+)
pip install -r requirements.txt

# Run backend test suite (86 tests)
python -m pytest backend/tests

# Run synthetic verification matrix (12 evaluations)
python -m app.verification   # run from backend/ directory

# Start FastAPI development server (http://127.0.0.1:8000)
uvicorn app.main:app --host 127.0.0.1 --port 8000   # run from backend/ directory
```

#### 2. AI/ML Standalone Suite
```bash
# Run isolated AI/ML tests (33 tests)
python -m pytest ai_ml/tests

# Check model artifact registry
python -m ai_ml.cli list-models
```

#### 3. Frontend Setup
```bash
cd frontend

# Install Node dependencies (Node 18+)
npm install

# Run unit & accessibility tests (89 tests across 12 suites)
npm test

# Run TypeScript type check
npm run typecheck

# Build production bundle
npm run build

# Start Vite dev server (http://localhost:5173)
npm run dev
```

---

### Option 3: Docker Compose
```bash
# Start backend, frontend, and PostgreSQL in isolated containers
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs`

---

## 🧪 Verification Matrix & Test Coverage

OrbitScore maintains rigorous testing standards across all tiers:

| Subsystem | Test Framework | Test Count | Focus Areas |
|---|---|---|---|
| **Frontend UI** | Vitest + React Testing Library | **89 Passed** (12 suites) | Workspaces, Evidence Register, Export Gate, Agent37 Drawer, Axe a11y, Banned words |
| **Backend API** | Pytest + FastAPI TestClient | **86 Passed** | Rule engine, SQLite/PostgreSQL, Provenance SHA-256 chain, ODAR/EOMP generation, Auth |
| **AI/ML Astrodynamics**| Pytest | **33 Passed** | Decay lifetime regression, CDM risk classification, Artifact Registry, Candidate normalization |
| **Verification Matrix**| Python Verification Harness | **12 Evaluations** | Complete, gap-heavy, and conflict synthetic missions across DFSM 2030 and FCC rules |
| **Total Automated** | GitHub Actions CI | **208 Tests** (86 + 33 + 89) | Zero failures, zero type errors, zero lint warnings |

Run the complete validation suite:
```bash
# Check V04 Acceptance Criteria
python .brain/scripts/check_v04_acceptance.py

# Run Brain consistency check
python .brain/scripts/validate_brain.py
```

---

## 🔒 Security, Privacy & Integrity Standards

1. **Authentication Fail-Closed**: In production (`ORBIT_ENV=production`), all API routes strictly require Bearer token authorization; unauthenticated requests receive `HTTP 401`.
2. **Staleness Invalidation**: Any edit to an evidence parameter immediately invalidates cached evaluations (`invalidated: true`), requiring recalculation.
3. **Mission Isolation**: Multi-mission workspaces enforce strict foreign-key tenant boundaries; evaluations cannot leak between missions.
4. **Audit Hash Chain**: Evidence creation, edits, evaluations, and reviewer approvals are recorded in an append-only SHA-256 event log (`backend/app/provenance.py`).
5. **No Hallucination in Formal Filings**: ODAR/EOMP generators will never populate default compliance text. Fields without human-verified primary sources output `NOT EVALUATED / UNVERIFIED`.
6. **External AI Air-Gap**: LLM candidate suggestions require explicit document-level user authorization (`allowed_external_processing=true`). AI operates with temperature 0.0 and fallback to regex parsers.

---

## 👥 Team & Ownership

As documented in [`.brain/team-knowledge.md`](.brain/team-knowledge.md) and [`docs/validation/v04/release-contract.yaml`](docs/validation/v04/release-contract.yaml):

- **Aditya** — *Backend & AI Lead*: FastAPI architecture, deterministic rule engine, SQLite/PostgreSQL persistence, SHA-256 provenance chains, ODAR/EOMP generators, AI/ML models.
- **Narayan** — *Frontend & Cinematic Lead*: React 18 / TypeScript architecture, Three.js 3D WebGL CubeSat canvas, virtual scroll engine, Web Audio synthesis, accessibility (WCAG 2.2 AA).
- **Roshan** — *Software QA & Demo Operations Lead*: Clean-clone reproducibility preflight (T006), synthetic test fixtures, adversarial edge-case testing, acceptance verification checklists, offline demo contingency operations.

---

## 📜 License & Ethical Boundaries

Distributed under the **MIT License**.

OrbitScore is designed to democratize mission planning and space debris compliance for university teams, startups, and research institutions. It is intentionally engineered as an **evidence organization copilot** and must not be used as an autonomous autopilot or sole decision-maker for orbital launches or maneuvering.
