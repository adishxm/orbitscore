# OrbitScore External Services Architecture & Integrations

## Architectural Overview & One Source of Truth

OrbitScore organizes cited spacecraft evidence for human review. It is not certification, a regulator decision, flight readiness approval, or operational safety advice.

To preserve strict regulatory integrity, OrbitScore enforces **one authoritative source of truth**:
- **Authoritative Engine**: Deterministic policy evaluation, persisted evidence records, human reviewer decisions, SHA-256 provenance chain, and fail-closed dossier export locking are exclusively executed and stored in the **FastAPI backend** backed by SQLite/PostgreSQL.
- **Client Equality**: Both the **React/Vite web application** and the **FlutterFlow mobile reviewer application** interact via the exact same versioned REST API (`backend/openapi.json`). Neither client possesses local decision authority.
- **Service Isolation**: External services (Agent37, Browser Use Cloud, ElevenLabs, Adaption) act as candidate extractors or accessible presentation helpers. **No external model or remote provider can make compliance decisions, alter evaluations, or approve evidence.**

```text
┌───────────────────────────┐      ┌─────────────────────────────┐
│ React Web Reviewer Client │      │ FlutterFlow Mobile Reviewer │
└─────────────┬─────────────┘      └──────────────┬──────────────┘
              │                                   │
              └───────────────┬───────────────────┘
                              │ HTTPS (Bearer Auth)
                              ▼
                ┌───────────────────────────┐
                │   FastAPI Backend API     │
                │  - Deterministic Engine   │
                │  - SQLite / Durable DB    │
                │  - SHA-256 Provenance     │
                │  - Cited Dossier Export   │
                └─────────────┬─────────────┘
                              │
     ┌────────────────────────┼────────────────────────┐
     │                        │                        │
     ▼                        ▼                        ▼
┌──────────────┐       ┌──────────────┐        ┌──────────────┐
│ Browser Use  │       │   Agent37    │        │  ElevenLabs  │
│ Cloud Capture│       │ Triage Agent │        │ Audio Summary│
│ (Allowlisted)│       │ (Candidates) │        │ (Post-Review)│
└──────────────┘       └──────────────┘        └──────────────┘

[Offline Research Workbench]
┌──────────────────────────────────────────────┐
│ ai_ml/adaption_pipeline.py                   │
│ - Synthetic-only dataset generation          │
│ - NIST AI RMF / NASA ODMSP schema validation │
│ - Train/val/test evaluation (not production) │
└──────────────────────────────────────────────┘
```

## Six Integrated Services Matrix

| Service | Primary Role | Safety Invariant | Default State |
| :--- | :--- | :--- | :---: |
| **[FlutterFlow](./flutterflow.md)** | Optional mobile reviewer client for mission browsing & sign-offs | Calls versioned FastAPI contract; client state is not authoritative | Ready (`backend/openapi.json`) |
| **[Agent37](./agent37.md)** | Bounded candidate triage on supplied document excerpts | Outputs `human_confirmed=False` candidates only; zero decision rights | Disabled by default (mock fallback) |
| **[Browser Use](./browser_use.md)** | Public authoritative source capture & repeatable QA | Strict allowlist (NASA, FCC, FAA, ESA, ISO); non-mutating | Disabled by default (mock fallback) |
| **[ElevenLabs](./elevenlabs.md)** | Accessible audio narration for reviewed executive summaries | Gated strictly on human engineering approval; keys server-side | Disabled by default (mock fallback) |
| **[Adaption](./adaption.md)** | Offline synthetic data preparation & model evaluation workbench | Research-only in `ai_ml/`; NOT connected to production online inference | Standalone (`ai_ml/adaption_pipeline.py`) |
| **[Render](./render.md)** | Unified hosting (Web service, Static site, Worker) | Persistent storage, strict CORS, secret placeholders only | Configured (`render.yaml`) |

## Governance & Safety Rules
1. **Disabled by Default**: All remote provider integrations start disabled (`*_ENABLED=0`). Local development and tests execute deterministically using synthetic mock fallbacks without consuming provider credits.
2. **Zero Autonomous Authority**: Remote provider responses are strictly treated as **unconfirmed candidates**. They must be reviewed and confirmed by a human engineer before influencing compliance status.
3. **Fail-Closed Gate**: Final export dossiers remain locked (HTTP 423) until 100% of detected findings receive an explicit human review decision.
