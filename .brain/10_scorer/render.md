# Render Deployment Roadmap: OrbitScore

**Checked repository commit:** `403051612cf6ac026d6a31be7d8ca6b826da2a93`  
**Commit date:** 2026-10-25  
**Assessment date:** 2026-10-25  
**Area:** Render configuration and production deployment only.  
**Current score:** **4/10** (configuration maturity; a live deployment is not evidenced by the files inspected).

## Current score and basis

The repository contains a Render Blueprint describing an Oregon API web service, static frontend, and background worker; the API has a declared `/health` probe and a 1 GB disk mounted at `/data`. Backend code chooses a writable `/data/orbitscore.db` path and initializes SQLite, and the frontend reads `VITE_API_BASE_URL`. Authentication and CORS are configurable, and `/ready` probes a database connection. Docker provides a non-root runtime and a health check. These are meaningful deployment foundations.

The score is limited because the inspected evidence is configuration and source code, not Render dashboard state, successful Blueprint validation, build/deploy history, live HTTP probes, production traffic, or recovery evidence. Staging and production are not separated. The Blueprint explicitly turns authentication off for the worker, allows `localhost:5173` as a production CORS origin, and uses a host-only service reference for the Vite API URL whose scheme/format has not been verified. SQLite is single-writer and lives on a service-local disk; the worker's default database path can therefore differ from the API's `/data` database, and the worker appends provenance. Health and readiness differ, but the Blueprint probes only liveness. Static-site environment variables are build-time for Vite and must be proven to resolve correctly in deployed output. Docker Compose contains literal development credential values and a development secret while setting `ORBIT_ENV=production`; do not reuse those values in any hosted service. No current Render deployment has been independently confirmed.

**Evidence boundary:** statements about repository files above are observed. Anything about existing Render service instances, actual env values, custom domains, deploy health, backup settings, alerts, or user data is **unverified** unless checked in the authorized Render account or by deployment evidence. The roadmap proposes target controls; it does not assert that they already exist.

## Scope and 10/10 definition

This roadmap covers Render service architecture and Blueprint correctness; clean staging/production separation; frontend-to-API URL configuration and CORS; generated secrets, rotation, and service-specific auth; worker networking and data access; persistence and schema migration; liveness/readiness; operational logs, metrics, alerts, resource/cost limits; backup/restore and rollback; privacy boundaries; and production smoke tests. It does not score product feature completeness or claim that the application is a safety/certification authority.

**10/10 means deployment operations are repeatable, secure by default, observable, recoverable, and supported by dated evidence:** the Blueprint validates and provisions least-privilege staging and production services; exact deployed frontend/API origins and secret handling are tested; migrations and durable storage have an explicit supported strategy; health checks correctly gate traffic; dashboards and actionable alerts exist; resource budgets are measured; a restore and rollback have been rehearsed; privacy/security checks pass; and a versioned production release passes authenticated and unauthenticated smoke tests with evidence retained. This is an operationally high-confidence target, not literal perfection or a guarantee of zero incidents.

## Observed configuration and risks

| Surface | Observed repository fact | Deployment concern / unverified point |
|---|---|---|
| Blueprint | `render.yaml` declares `orbitscore-api` (Python web, `starter`, Oregon, root `backend`), `orbitscore-web` (static, Oregon, `starter`, root `frontend`), and `orbitscore-worker` (Python worker, Oregon, `starter`, root `backend`). | No separate staging group/environment is declared. Render-specific schema validation and the actual service plans are unverified. Confirm whether all three `starter` values are valid for their service types and current account/region. |
| API persistence | API disk `orbitscore-data`, `/data`, 1 GB. `backend/app/db.py` checks writable `/data` before the repository default. `backend/app/main.py` calls `init_db()`. | Disk is finite and attached to the API only in the inspected YAML. SQLite WAL/single-writer and scaling/instance constraints need explicit policy; capacity alerts, growth rate, actual mount and disk use are unverified. |
| Worker persistence | `app.worker` calls `init_db()`, verifies the provenance chain, and appends a completion event; worker has no disk declaration in `render.yaml`. | Worker may select its local filesystem/default DB rather than the API's mounted database. If a shared DB is intended, this is a correctness and durability hazard; if isolated worker state is intended, document and enforce that. Shared SQLite across independent services is not supplied by separate local disks. |
| Authentication/secrets | API sets `ORBITSCORE_AUTH_ENABLED=1`, and uses generated reviewer/viewer keys. Worker sets `ORBITSCORE_AUTH_ENABLED=0`. `auth.py` includes hardcoded fallback keys if corresponding env variables are absent. | Worker has no API credentials or explicit network/data access policy in the Blueprint. Auth being disabled is not by itself proof of public HTTP exposure for a background process, but is an unsafe default if an API or management surface is ever started. Verify reachability; remove fallback secrets for production and test missing-secret fail-closed behavior. Generated-value persistence and rotation procedure are unverified. |
| CORS/frontend URL | API CORS includes `https://orbitscore-web.onrender.com,http://localhost:5173`. Frontend `backend.ts` reads `VITE_API_BASE_URL`, falling back to `http://127.0.0.1:8000`. YAML references API `property: host`. | Production CORS unnecessarily allows localhost. Validate whether Render's `host` reference is emitted as an HTTPS URL or hostname and whether Vite gets it at build time; a bare host may produce invalid requests. Actual URL and browser preflight/runtime behavior are unverified. |
| Health | Blueprint probes `/health`. In `main.py`, `/health` reports a constant healthy status and `/ready` attempts `SELECT 1` but does not close its connection in the inspected code. | Liveness may remain green if DB is unavailable; readiness is not the configured probe. Probe semantics and Render traffic behavior need test evidence. Make probe response status fail when dependencies fail, and close DB resources. |
| Build/runtime | Render uses `pip install -r requirements.txt && pip install -e ../ai_ml`, `uvicorn app.main:app ... $PORT`, and static `npm install && npm run build`. Docker separately builds via `npm ci`, runs non-root, and health-checks `/health`. | Render and Docker production paths differ. Lockfile reproducibility, root-directory resolution of `../ai_ml`, security updates, and deployed artifact consistency require validation. |
| Migration docs | PostgreSQL guide describes Alembic and a future PostgreSQL path; `db.py` inspected here is SQLite-only in its operations. | Documentation proposing `DATABASE_URL` PostgreSQL must not be treated as proof the runtime supports PostgreSQL end-to-end. Migration execution, schema parity, and data transfer are not proven. |
| Compose credentials | `docker-compose.yml` contains literal `ORBIT_SECRET_KEY=dev-secret-key-change-for-production` and literal reviewer/viewer keys while setting production environment. | These are explicitly development-looking values but must be treated as compromised if they have ever been used or exposed. Do not copy into Render; remove or externalize, rotate any reused credentials, and scan history/secrets. |
| Operations | Render guide gives manual Blueprint steps and describes intended worker behavior. | No live deploy record, logs/metrics, alerts, budgets, backup/restore drill, rollback drill, privacy validation, or production smoke-test report was supplied. |

## Sequenced phases

Phases are sequential unless marked otherwise. Keep deployment changes behind review and use staging first. No phase authorizes a production deployment by itself; perform deployment actions only under the service owner's approval and change process.

### Phase 0 — Establish an auditable baseline and source-of-truth Blueprint

**Deliverables**
- Capture a dated deployment inventory for staging and production (if they exist): service IDs/names, service types, regions, plans, root directories, build/start commands, domains, health check paths, disks/databases, environment-variable *names and classifications* (never secret values), deploy commit, and access owners.
- Validate `render.yaml` against Render's current Blueprint schema and a disposable/staging Blueprint. Confirm root directory/build context behavior for `pip install -e ../ai_ml`, static publish directory, Vite build-time variables, service references, plan declarations, and disk support for the selected service plan.
- Choose a canonical, reproducible dependency install path. Prefer lockfile-backed frontend install (`npm ci`) and pin/review backend dependencies, aligned between Docker, local CI, and Render builds.
- Remove ambiguity between the Render deployment path and Docker image path. Record which one is production authority; test both if both remain supported.

**Dependencies:** access to current Render account/configuration for factual inventory; repository CI and Blueprint review.  
**Acceptance:** a clean Blueprint validation/provision preview has no unresolved schema/type/reference errors; a clean build from the exact commit succeeds for API and static site; artifact contains the expected API URL; inventory identifies which facts are observed and which remain unknown. Store output or screenshots/log links with timestamps and redact secrets.

### Phase 1 — Establish staging/production separation and correct service topology

**Deliverables**
- Define separate staging and production environments/Blueprint instances with distinct service names, URLs, disks/databases, generated secrets, provider credentials, and access roles. Document promotion by immutable commit/artifact rather than manually copying mutable settings.
- Make prod and staging env-var sets explicit and service-specific. Production must not depend on local/dev defaults. Confirm all hosted services share an intended region and that selected plans, disk capacity, and static-site configuration are supported.
- Decide whether the worker is required continuously, on demand, or as a scheduled finite task; avoid an always-on service if its function and cadence do not justify cost. Document its actual run behavior and lifecycle.
- Tighten the worker boundary: it should not serve public HTTP, should not receive reviewer credentials, and should access only the data and network required for its job. Because the current worker reads/verifies/appends the database, choose one explicit implementation: (a) a supported shared production database with least-privilege worker identity, or (b) an authenticated, narrow API/job interface that lets it submit permitted audit results. Do not rely on a second independent SQLite file as shared truth.

**Dependencies:** Phase 0.  
**Acceptance:** staging and production use distinct origins, persistent data stores, and generated reviewer/viewer secrets; staging secret rotation has zero effect on production; worker has no reachable listener/public route and no reviewer/admin credential; documented network/data flow and job permission tests demonstrate least privilege. The worker's provenance behavior is tested against the intended production store or deliberately isolated store.

### Phase 2 — Frontend/API origin, CORS, authentication, and secret lifecycle

**Deliverables**
- Set `VITE_API_BASE_URL` to an explicit HTTPS API origin per environment. Verify the actual static build uses that value and does not silently fall back to localhost; expose no secrets through `VITE_*` variables.
- Use a production CORS allowlist containing only exact production UI origins; keep localhost only in local/staging configurations as needed. Define corresponding exact staging allowlist. Review whether cookies/credentials are needed; otherwise avoid permissive credential behavior.
- Remove the production auth fallback credentials in `auth.py`, or make absence of production secrets fail startup/health. Ensure production auth enforcement cannot be disabled by an accidental env value. Use separate high-entropy generated values per environment and role, store/rotate using Render secret configuration, restrict dashboard access, and maintain a revocation procedure. Existing Docker Compose literal credentials must never be reused; assess whether any were used and rotate accordingly.
- Define worker-specific auth: no public API mode, no broad shared bearer secret, and no production `ORBITSCORE_AUTH_ENABLED=0` setting unless proven irrelevant to the isolated worker process and guarded by a test. Treat provider keys as opt-in and keep disabled integrations without secrets by default.
- Review frontend token persistence (`sessionStorage` and `localStorage` are both read) and production access practices for least exposure; do not put reviewer tokens in a public static build or analytics/logging.

**Dependencies:** Phase 1 topology and environment inventory.  
**Acceptance:** deployed frontend bundle/API request inspection shows HTTPS API origin with no localhost fallback; browser preflight succeeds for exact allowed UI origins and fails for localhost/unapproved origins in production; unauthenticated protected API requests return 401, viewer writes return 403, reviewer-approved actions work; unset production reviewer/viewer secrets fail closed; token rotation invalidates old credentials and works with new credentials; secret scanner finds no live secret in repository or built static files.

### Phase 3 — Persistence, schema migrations, and recovery foundation

**Deliverables**
- Decide whether single-instance SQLite on the Render API disk is a deliberately bounded initial production architecture or whether managed PostgreSQL is required before production. State capacity/concurrency limits and block unsafe horizontal scaling with SQLite. Do not claim PostgreSQL support until runtime DB access, migrations, transaction semantics, and tests support it.
- For SQLite: enforce that all API writes target `/data`; validate mount permissions, WAL/checkpoint behavior, free-space monitoring, restart persistence, disk resize procedure, and service/instance constraints. Ensure only the API process writes the database unless a supported shared persistence architecture is implemented.
- For PostgreSQL: add/verify full runtime adapter and drivers, validated migration chain, connection pooling and TLS, least-privilege roles, staging rehearsal, data reconciliation, cutover/rollback plan, and only then use managed PostgreSQL. Existing docs' Alembic statements and SQL examples are hypotheses until reconciled with real runtime and schema.
- Make startup schema initialization/migrations an explicit safe process. Avoid concurrent DDL at worker/API start; run one controlled migration step and verify migration status. Capture row counts and provenance-chain verification before/after transfer.
- Define backup policy, RPO/RTO, retention, encryption/access, and restore owner. Determine what Render disk/database backup mechanisms are currently available for chosen resource; configuration and successful restore are unverified today. Add independent encrypted export/backup if required by the chosen platform's retention guarantees.

**Dependencies:** Phase 1 topology; DB design decision and data owner approval.  
**Acceptance:** test against a fresh empty store and a production-like copy; migration is repeatable and recorded at a known revision; restart/redeploy preserves mission, review, artifact BLOB, and provenance data; an actual isolated restore meets approved RPO/RTO and matches row counts plus provenance verification; capacity and concurrency tests remain within documented limits. If shared worker writes remain necessary, demonstrate transaction/concurrency safety or block release.

### Phase 4 — Liveness/readiness, logs, metrics, alerts, and cost guardrails

**Deliverables**
- Separate liveness (`/health`: process alive, low-cost) from readiness (`/ready`: required storage reachable and schema current). Return appropriate non-2xx status on failed readiness; close DB connections. Decide which Render probe controls restart/traffic and configure it deliberately. Avoid probing optional third-party providers as hard readiness dependencies unless required for safe service.
- Emit structured logs with timestamp, level, service, deployment commit, request/job correlation ID, and outcome; redact authorization headers, tokens, secret env values, personal/sensitive document content, and source documents. Set retention/access expectations.
- Add practical service metrics or equivalent evidence for request volume/latency/error rate, readiness failures, DB/disk usage, migration status, worker run duration/failures, and provenance verification failures. If the chosen Render plan lacks native metrics/alerts, select a supported external mechanism and document its privacy/egress effects.
- Configure actionable alerts with owner, threshold, and runbook: repeated deploy failure, health/readiness failure, 5xx/latency, disk threshold, DB connectivity, worker failure/staleness, backup failure, and unusual cost/resource use. Test notification delivery.
- Set explicit resource/cost budgets per environment, service and month; alert before approaching ceilings. Reassess Starter services and 1 GB disk against measured traffic/data, worker cadence, and any minimum-instance costs. No cost is asserted here because account billing and current plan pricing were not inspected.

**Dependencies:** Phase 3 storage decision; Phase 1 service layout.  
**Acceptance:** inject a staging DB failure and observe readiness fail while liveness behavior matches its definition; restore dependency and observe recovery; trigger test alert and verify receipt/escalation; sample logs contain no credentials or sensitive payloads; dashboard reports all required resource indicators; load test stays inside agreed latency/error/resource/cost budgets.

### Phase 5 — Deployment safety, backup restore, rollback, privacy, and production release evidence

**Deliverables**
- Define release gates: CI, static analysis/dependency checks, test suite, Blueprint/build validation, migration compatibility, staging deploy, smoke tests, approval, production deploy, and post-deploy verification. Pin each release to commit and capture Render deploy ID/logs.
- Design rollback for application and schema independently. Prefer backward-compatible expand/contract migrations; state when a data restore rather than code rollback is required. Confirm rollback does not discard data or break provenance. Document who can authorize/execute it and the stop-ship triggers.
- Rehearse restore and rollback in staging using production-like data. Record actual elapsed time, data loss window, checksums/counts, and blockers. Do not describe backup capability as proven before a restore succeeds.
- Review privacy and data handling: production data classification, retention/deletion, backup retention, least-privilege dashboard access, TLS, provider integrations off by default, explicit consent before external document processing, and no sensitive material in logs, browser storage, or static artifacts. Verify domain/TLS and access policies from deployed endpoints.
- Add automated and manual production smoke suite: `/health`, `/ready`, frontend route and API URL, CORS, 401/403/authorized read/write behavior, fixture/demo labeling, safe document upload/retrieval if in scope, export review gate, provenance verification, persistence across restart, and disabled provider integrations. Test against synthetic or specifically approved non-sensitive records; do not use actual mission-sensitive data without authorization.

**Dependencies:** Phases 0–4 complete and accepted; production change approval.  
**Acceptance:** a release candidate passes all checks in staging; restore and rollback drills meet approved RPO/RTO; security/privacy checks have no unresolved critical/high findings; production deploy smoke evidence is attached to the release; alert channels, owners, budget, and runbooks are confirmed. Any failed critical check blocks promotion.

## Commands and evidence sources

Commands below are grounded in repository layout/README; execute from the indicated directory in a suitable environment. They are validation suggestions, not evidence that a live Render deployment exists.

```bash
# Repository identity and clean-state evidence
cd /tmp/orbitscore-check-20261025
git rev-parse HEAD
git status --short

# Frontend tests/build (README lists these)
cd frontend
npm ci
npm test
npm run typecheck
npm run build

# Backend tests (README lists this; use project-supported Python environment)
cd ../
python -m pytest backend/tests

# Blueprint/Docker checks: use Render's current Blueprint validation/preview
# and a staging build/deploy; check the service logs and deployed env-name mapping.
```

Repository evidence references: `render.yaml`; `Dockerfile`; `docker-compose.yml`; `docs/integrations/render.md`; `docs/postgres-upgrade.md`; `docs/deployment-hardening.md`; `backend/app/auth.py`; `backend/app/db.py`; `backend/app/main.py` (`/health`, `/ready`, CORS); `backend/app/worker.py`; `frontend/src/api/backend.ts`; `backend/alembic/`. Live evidence must come from authorized Render service settings/events/logs and real HTTPS requests, not README or intended-state documentation alone. Never capture or publish secret values in evidence.

## Cross-cutting risks and mitigations

- **False confidence from config/docs:** YAML and docs express intent, not a live deployment. Require service IDs, deploy commit, build logs, probes, and smoke results.
- **Data divergence/loss:** API disk is not declared on the worker; local SQLite databases are not shared. Keep a single writer or move to a properly shared DB; test restore.
- **Auth bypass/default secrets:** worker auth is configured off and auth module has fallback tokens; isolate worker, remove fallbacks, and test fail-closed behavior. Treat Compose literals as compromised if ever used.
- **Origin mistakes:** localhost in production CORS and `host`-only Vite service reference can expose unwanted origins or break requests. Use exact origins and verify actual bundle/network requests.
- **SQLite scaling/capacity:** single-writer contention and 1 GB disk limit growth; measure workload and do not autoscale API with local SQLite assumptions.
- **Migrations mismatch:** docs describe PostgreSQL while inspected runtime DB module is SQLite. Prove runtime support before migration claims/cutover.
- **Worker side effects:** worker writes provenance. Ensure the target store, idempotency, retries, and authorization boundary are defined and tested; current second-resolution job ID and append behavior deserve duplicate/retry testing.
- **Secrets in static/runtime surfaces:** generated values and all `VITE_*` variables need leakage review; rotate any credential that was shared or committed.
- **Unbounded cost or insufficient recovery:** verify current plan capabilities/pricing and backup retention in account; set measurable budgets and perform timed drills.

## Clear done gate

Score the Render area **10/10 only when** all phases have dated evidence tied to the release commit; Blueprint validation and separate staging/production deployment are proven; staging-only secrets and exact production URLs/CORS are tested; API authentication fails closed and worker access is least-privilege; the selected DB/persistence/migration model is supported, capacity-bounded, backed up, and restored successfully; liveness/readiness semantics and alerts work; logs are privacy-reviewed; cost/resource budgets and owners are agreed; rollback is rehearsed without unacceptable data loss; and production smoke/security/privacy tests pass. A live deployment or claim of production readiness remains **unverified** until the authorized Render evidence and release gate are actually completed. Do not call a failed or skipped critical check “done.”
