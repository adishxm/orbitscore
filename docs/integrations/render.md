# Render Deployment & Workflows Guide

## Purpose & Scope
This guide details the deployment of OrbitScore on Render using Infrastructure-as-Code via the repository-root `render.yaml`. It covers the Web Service, Static Site, Background Worker / Workflow, database persistence strategy, and environment variable configuration.

## Service Architecture

OrbitScore is declared as a unified Blueprint containing three services:

```text
┌───────────────────────────────────────────────┐
│              Render Static Site               │
│               orbitscore-web                  │
│       Canonical React/Vite Reviewer UI        │
│             Publish Directory: dist           │
└───────────────────────┬───────────────────────┘
                        │ HTTPS
                        ▼
┌───────────────────────────────────────────────┐
│              Render Web Service               │
│               orbitscore-api                  │
│             FastAPI Backend API               │
│       Port: $PORT | Health: /health           │
│   Persistent Disk: /data (orbitscore.db)      │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│           Render Background Worker            │
│              orbitscore-worker                │
│       Render Workflows & Source Audits        │
│          Command: python -m app.worker        │
└───────────────────────────────────────────────┘
```

## Persistence Strategy: SQLite vs PostgreSQL

### 1. Default: Persistent Disk with SQLite (Current Architecture)
OrbitScore currently uses SQLite with ACID transactions and write-ahead logging (WAL) located at `/data/orbitscore.db`.
- **Render Configuration**: The `orbitscore-api` service mounts a 1 GB persistent disk at `/data`.
- **Benefits**: Zero maintenance, instant transactional local queries, built-in SHA-256 provenance chain hashing.

### 2. Scaled Deployment: Render Managed PostgreSQL Migration Roadmap
When scaling to multi-instance autoscaling or enterprise concurrency:
1. Provision a Render Managed PostgreSQL instance (`orbitscore-postgres`).
2. Add `DATABASE_URL: postgresql://...` to `orbitscore-api` environment secrets.
3. Apply standard SQLAlchemy / Alembic migration scripts to map `missions`, `evaluations`, `reviews`, `artifacts`, and `provenance` tables.
4. Verify SHA-256 provenance chain integrity before cutting over traffic.

## Render Workflows & Prize Track Qualification
OrbitScore includes `orbitscore-worker` in `render.yaml` to meet the qualification criteria for Hackyard's **"Best Use of Render"** prize track:
- **Idempotent Background Jobs**: Executes scheduled public-source domain audits and cryptographic chain verification sweeps via `python -m app.worker`.
- **Bounded Inputs & Retries**: Jobs run with explicit timeouts and exit codes; failures trigger standard Render retry policies without affecting live API availability.
- **Safety Boundary**: The background worker cannot mutate human review decisions, alter finding outcomes, or issue export waivers.

## Environment Variables Configuration

| Variable | Target Service | Purpose | Value / Example |
| :--- | :--- | :--- | :--- |
| `PYTHON_VERSION` | `api`, `worker` | Python runtime version | `3.10.11` |
| `ORBITSCORE_AUTH_ENABLED` | `api` | Enforce API token authentication | `1` (Production/Staging) |
| `ORBITSCORE_REVIEWER_KEY` | `api` | Reviewer secret Bearer token | `generateValue: true` |
| `ORBITSCORE_VIEWER_KEY` | `api` | Read-only viewer Bearer token | `generateValue: true` |
| `ORBITSCORE_CORS_ORIGINS` | `api` | Allowed origins (no wildcard `*`) | `https://orbitscore-web.onrender.com` |
| `VITE_API_BASE_URL` | `web` | Backend API URL for React frontend | `https://orbitscore-api.onrender.com` |
| `AGENT37_ENABLED` | `api` | Enable remote Agent37 calls | `0` (Default) |
| `AGENT37_API_KEY` | `api` | Agent37 secret key | *Populated via Render Dashboard* |
| `BROWSER_USE_ENABLED` | `api` | Enable remote Browser Use Cloud | `0` (Default) |
| `BROWSER_USE_API_KEY` | `api` | Browser Use secret key | *Populated via Render Dashboard* |
| `ELEVENLABS_ENABLED` | `api` | Enable ElevenLabs audio narration | `0` (Default) |
| `XI_API_KEY` | `api` | ElevenLabs secret key | *Populated via Render Dashboard* |

## Deployment Steps
1. Push branch to GitHub (`adishxm/orbitscore`).
2. Navigate to [Render Dashboard](https://dashboard.render.com).
3. Click **New > Blueprint**.
4. Select `adishxm/orbitscore`. Render will detect `render.yaml` and prompt to create all three services.
5. Populate any required provider secret keys in the Render Dashboard (keys are marked `sync: false` to ensure they are never committed to git).
6. Click **Apply Blueprint**.
