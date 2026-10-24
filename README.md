# OrbitScore

> **Engineering Review Boundary Notice**: Despite the name, OrbitScore does not score or certify missions; it organizes evidence for human review.

OrbitScore is a source-linked mission evidence organization workspace for student, university, and small spacecraft engineering teams.

---

## Repository Structure

The complete mission evidence workspace application, design system, tests, and documentation are organized inside the [`frontend/`](./frontend) directory, alongside the research library and backend services:

```text
OrbitScore/
├── frontend/                      # React 18 + TS interactive mission evidence workspace
│   ├── docs/                      # Complete specifications & engineering documentation
│   │   ├── orbitscore_master_prompt_v2.md # Project brief and execution mandate
│   │   ├── PROGRESS.md            # Checkpoint tracking log
│   │   ├── VALIDATION_REPORT.md   # Final validation report & gate verification
│   │   ├── DESIGN_SYSTEM.md       # Visual tokens, typography, colors, animations & components
│   │   ├── IMPLEMENTATION_PLAN.md # Architecture, vertical slices & test matrix
│   │   ├── PROFILE_SPEC.md        # Demo Evidence Completeness v0.1.0 specification
│   │   ├── ASSETS.md              # Provenance & typography licensing
│   │   ├── ASSUMPTIONS.md         # Domain, UX & architectural defaults
│   │   ├── REFERENCE_ANALYSIS.md  # Deep reference site inspection log
│   │   ├── openapi.draft.yaml     # Draft OpenAPI 3.1 contract
│   │   └── reference/screenshots/ # Inspection evidence screenshots
│   ├── src/                       # React 18 + TypeScript application source code
│   │   ├── components/            # UI components (Header, Footer, Workspace, Findings, Stepper)
│   │   ├── fixtures/              # Synthetic scenarios (Asteria-3, Microsat-X)
│   │   ├── pages/                 # Route pages (Landing, Workspace, Profiles, HowItWorks, etc.)
│   │   ├── profiles/              # Pure deterministic check engine (6 checks)
│   │   ├── store/                 # Zustand state management with local persistence
│   │   ├── styles/                # CSS variable design tokens & global stylesheets
│   │   ├── test/                  # 9 test suites (unit, integration, axe a11y, banned words)
│   │   ├── types/                 # Domain types
│   │   └── utils/                 # Export dossier packet generator
│   ├── public/                    # Self-hosted fonts & static assets
│   ├── package.json               # Application dependencies & npm scripts
│   └── README.md                  # Detailed frontend documentation
├── apps/                          # Backend services (FastAPI API & web services)
├── research/                      # Preserved research library, sources & literature
├── paper/                         # Research paper artifacts & documentation
├── package.json                   # Root convenience runner (proxies commands to frontend & apps)
└── .gitignore
```

---

## Quickstart

Run these commands directly from the repository root:

```bash
# Start local development server (http://localhost:5173)
npm run dev

# Run all 9 Vitest suites (unit, integration, axe a11y, banned-words lint)
npm test

# Run strict TypeScript build
npm run build

# Run banned-wording scanner
npm run lint:banned-words
```

Or navigate directly to `frontend/`:

```bash
cd frontend
npm run dev
```

For complete technical documentation, see [`frontend/docs/`](./frontend/docs) and [`frontend/README.md`](./frontend/README.md).

---

## Research Library & Task Gate

Before product research or policy-sensitive work, review [`research/README.md`](research/README.md) and [`research/SOURCE_REGISTER.md`](research/SOURCE_REGISTER.md) for source hierarchy, date, scope, and claim safeguards.

`.brain/` contains shared project instructions, task definitions, and verification scripts:

```bash
python .brain/scripts/complete_task.py T001
```
