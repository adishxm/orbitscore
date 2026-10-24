# OrbitScore

Source-linked debris-mitigation pre-review and decision-support system.

## Repository layout

```text
.
├── frontend/          # Canonical React/Vite/TypeScript web application (Zustand, Lucide, Framer Motion)
├── backend/           # FastAPI service, SQLite persistence, deterministic evaluation, provenance, export
├── ai_ml/             # Isolated AI provider adapter, Pydantic schemas, and standalone unit tests
├── docs/              # Architecture, technical stack, research, and API contract specifications
├── fixtures/          # Synthetic mission inputs, versioned rule profiles, and evaluation verification report
├── research/          # Source library and research indexes
├── paper/             # Research-paper artifacts
├── .brain/            # Shared agent instructions, tasks, state, and verified run reports
└── legacy/            # Archived initial console (legacy/web) and client library (legacy/frontend-service)
```

## Quick start

### Canonical Frontend (`frontend/`)

```bash
# Run tests (63 tests across 9 suites)
npm test

# Typecheck
npm run typecheck

# Production build
npm run build

# Start development server
npm run dev
```

### Backend API (`backend/`)

```bash
# Install dependencies including the editable ai_ml package
pip install -r requirements.txt

# Run backend test suite (38 tests)
python -m pytest backend/tests

# Run synthetic verification matrix
python -m app.verification   # from backend/

# Start FastAPI dev server
uvicorn app.main:app --host 127.0.0.1 --port 8000   # from backend/
```

### AI / ML Adapter (`ai_ml/`)

```bash
# Run isolated AI adapter test suite (6 tests)
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
