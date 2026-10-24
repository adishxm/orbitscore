# OrbitScore

> **Engineering Review Boundary Notice**: Despite the name, OrbitScore does not score or certify missions; it organizes evidence for human review.
>
> *OrbitScore helps small-spacecraft teams organize cited mission information, identify missing or inconsistent evidence, and prepare material for qualified human review. Its demo orbital data is synthetic and is not a safety or compliance assessment. The Space Credit Index is an evidence-readiness benchmark, not a safety certification.*

OrbitScore delivers a polished, responsive mission evidence workspace and synthetic orbital context dashboard for student, university, and small spacecraft engineering teams.

## Key Capabilities & Safety Architecture

- **Sourced Evidence Register**: Granular parameters mapped to primary source documents, revisions, dates, page/section locators, and human engineering verification status.
- **Deterministic Check Engine**: 100% deterministic rule verification surfacing missing citations, unconfirmed records, and cross-subsystem numerical discrepancies (e.g. CAD vs interface specifications).
- **Space Credit Index Engine**: Deterministic, 4-pillar 0–100 readiness index (AAA to D) benchmarking orbital lifetime, spatial footprint, passivation readiness, and primary citation provenance (`GET /missions/{id}/space-credit-index`).
- **Offline ML Training, Document Extraction Pipeline & Trusted Registry**: Modular document ingest with mission-family disjoint holdouts, ESA Conjunction Data Message (CDM) training pipeline (`ai_ml.training.train_cdm`), magnitude-aware precision/recall/F1 metrics, and cryptographically verified model artifact registry (`ai_ml.inference.registry`) with CLI (`python -m ai_ml.cli`).
- **Scikit-Learn Astrodynamics Machine Learning**: Supervised physical decay lifetime regression (`GradientBoostingRegressor`) and conjunction geometry risk classification (`RandomForestClassifier`) (`POST /missions/{id}/ml/...`).
- **Space-Track & NASA SPARK Ingestion Pipeline**: Ingestion service fetching live or cached Two-Line Elements (TLEs), Conjunction Data Messages (CDMs), and LEO spatial debris density profiles from NASA SPARK/ORDEM baseline (`GET /integrations/...`).
- **Automated ODAR & EOMP Export Pipeline**: Automated generation of complete, section-compliant draft NASA-STD-8719.14 Orbital Debris Assessment Reports and ISRO DFSM 2030 / FCC 5-year End-of-Mission Plans (`GET /missions/{id}/export/odar`, `/export/eomp`).
- **Static Synthetic Orbital Context**: Labeled schematic visualization (500 km SSO, 97.4° inclination, natural atmospheric decay ~3.8 yrs) with persistent truth-in-advertising caption.
- **National-to-Global Scalability Matrix**: Dual evaluation pathways aligning with Tier 1: India ISRO Debris-Free Space Missions (DFSM) 2030 guidelines and Tier 2: Global FCC (FCC-22-74 5-year deorbit rule), NASA STD 8719.14, and ESA Zero Debris standards.
- **Human Review & Decision Gate**: Explicit separation of software findings from human engineering mitigations, sign-offs, and open issue tracking.
- **Synthetic Demo Review Packets**: Exportable review packets (Markdown and JSON) with cryptographic SHA-256 provenance hashes and prominent review boundary notices.


## Repository layout

```text
.
├── frontend/          # Canonical React 18 + TS interactive mission evidence workspace (Zustand, Lucide, Framer Motion)
├── backend/           # FastAPI API service, SQLite persistence, deterministic evaluation, provenance, export
├── ai_ml/             # Isolated AI provider adapter, Pydantic schemas, and standalone unit tests
├── docs/              # Architecture, technical stack, research, and API contract specifications
├── fixtures/          # Synthetic mission inputs, versioned rule profiles, and evaluation verification report
├── research/          # Preserved research library, sources, literature dossiers, and indexes
├── paper/             # Research-paper artifacts and documentation
├── .brain/            # Shared agent instructions, tasks, state, and verified run reports
└── legacy/            # Archived initial prototype console (legacy/web) and client library (legacy/frontend-service)
```

## Quick start

### Canonical Frontend (`frontend/`)

```bash
# Run tests (68 tests across 10 suites)
npm test

# Typecheck
npm run typecheck

# Production build
npm run build

# Start local development server (http://localhost:5173)
npm run dev

# Run banned-wording scanner
npm run lint:banned-words
```

### Backend API (`backend/`)

```bash
# Install dependencies including the editable ai_ml package
pip install -r requirements.txt

# Run backend test suite (62 tests)
python -m pytest backend/tests

# Run synthetic verification matrix
python -m app.verification   # from backend/

# Start FastAPI dev server (http://127.0.0.1:8000)
uvicorn app.main:app --host 127.0.0.1 --port 8000   # from backend/
```

### AI / ML Astrodynamics & Adapter (`ai_ml/`)

```bash
# Run isolated AI/ML test suite (33 tests: training, evaluation, inference registry, adapter, and baselines)
python -m pytest ai_ml/tests
```

AI extraction is disabled by default (`ORBIT_AI_ENABLED=false`) and always operates with temperature 0.0, a 10.0-second timeout, and an automatic deterministic regex fallback (`backend/app/extractor.py`). All AI-extracted fields are strictly labeled `human_confirmed=False`.

### Archived Legacy Console (`legacy/`)

```bash
npm run legacy:web:test
npm run legacy:web:dev
```

## Project onboarding & research

Before product research or policy-sensitive work, agents should start at [`research/README.md`](research/README.md), read the product synthesis, then follow its links into the preserved research library. Check [`research/SOURCE_REGISTER.md`](research/SOURCE_REGISTER.md) for source hierarchy, date, scope, and claim safeguards.

## Local Antigravity brain and task gate

`.brain/` contains shared project instructions, task definitions, and status, so it is committed with the application. Generated reports under `.brain/local-reports/` and `team-report.html` are local-only and ignored by Git.

Run task baseline verification:

```bash
python .brain/scripts/complete_task.py T001
```

To validate the consistency of tasks, dependencies, and state:

```bash
python .brain/scripts/validate_brain.py
```
