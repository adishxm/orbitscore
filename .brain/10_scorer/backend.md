# Backend Roadmap to 10/10 — OrbitScore

**Checked repository commit:** `403051612cf6ac026d6a31be7d8ca6b826da2a93`  
**Commit date:** 2026-10-25 03:10:40 +05:30 (commit metadata; not the date of a full system audit)  
**Roadmap prepared:** 2026-10-25  
**Area:** FastAPI/backend only

## Current score: 5.5/10

This is a code-and-documentation readiness score for the declared MVP, not a security certification or operational service rating. The score recognizes an implemented FastAPI service, typed Pydantic request/response models, an OpenAPI contract test, SQLite CRUD persistence, a hash-chained provenance implementation, reviewer/viewer dependencies, selected field-edit invalidation, export lock checks, and a pytest suite with focused auth and persistence cases. The repository documents test commands and CI. Those are useful foundations.

The score is held down by high-impact issues visible in the checked code: `auth.py` contains fallback reviewer/viewer keys and local unauthenticated reviewer behavior; route coverage is inconsistent (including unauthenticated `/health`, `/`, and `/integrations/status`, plus several mission-ID handlers that do not establish mission existence); the environment template exposes conflicting names and demo values; migration/runtime parity and persistent-volume/backup behavior are not demonstrated end-to-end; export logic is duplicated and does not visibly reject a tampered provenance chain; idempotency/concurrency semantics are absent from inspected write paths; and OpenAPI verification checks a subset of paths but writes the generated document during testing. These are findings from the checked files, not claims about deployed behavior.

**Evidence boundary:** The repository's README claims that an October 2026 audit remediated auth, isolation, migration parity, storage, and CI, and it reports test totals. This roadmap does not treat those claims as proof of deployed configuration or independently run tests. At the time of writing, no test command was run for this assessment. The supplied tests prove only what their assertions cover; production secrets, network exposure, deployed volume persistence, restore drills, TLS/provider configuration, monitoring, and backup schedules are **unverified**.

## MVP scope and 10/10 definition

The target is a single-deployment, small-spacecraft-team **pre-review evidence workspace**, not a multi-tenant SaaS or safety-critical flight service. It manages synthetic/demo mission data, source-linked evidence, deterministic profile evaluation, human decisions, provenance, and gated review-packet exports. External providers are optional, bounded adapters. A qualified human remains responsible for review. The backend must not imply certification, regulatory approval, operational collision assessment, or maneuver advice.

For this declared scope, **10/10** means a production-handoff-quality backend with no known release-blocking defects in the agreed API surface: generated and versioned schema matches implementation; auth is fail-closed outside explicit local test mode and all sensitive routes have tested role policies; missions cannot cross-contaminate evaluations, decisions, artifacts, or exports; schema upgrades and recovery are reproducible; every source/evaluation/review/export has auditable version and provenance linkage; edits invalidate derived state and prior approvals safely; exports cannot bypass review, stale-state, or integrity gates; optional providers are isolated, permission-checked, time-bounded, and non-authoritative; errors and retries are predictable; health/readiness and deployment handoff are documented and tested; and CI has deterministic regression and security boundary coverage. This score describes a mature MVP bar, not literal perfection, zero risk, or certification.

## Observed backend baseline

- `backend/app/main.py` defines the API, handles route orchestration, and runs `init_db()` at import and app startup. It exposes many routes beyond the narrow evidence/review MVP.
- `backend/app/auth.py` defines `viewer` and `reviewer` roles. `is_auth_enforced()` defaults to enforced in production-like environments, but `get_configured_reviewer_key()` / `get_configured_viewer_key()` fall back to fixed demo strings. With auth disabled, requests without a token become local reviewer requests.
- `backend/app/db.py` uses SQLite and `CREATE TABLE IF NOT EXISTS`; selects paths from `DATABASE_URL`, `ORBIT_DB_PATH`/`DATABASE_PATH`, a writable `/data`, or a repository-local default. It has explicit migrations under `backend/alembic/`, but runtime initialization shown in `main.py` calls `init_db()`, not an observed migration runner. The supplied Docker Compose binds `/app/data`, whereas `db.py` may prefer writable `/data`; effective path must be verified in the actual container. `db.py` includes `reset_db()` which deletes data and must be operationally guarded.
- `engine.py` evaluates the supplied mission and profile deterministically, uses human-confirmed fields, produces missing/conflicting evidence statuses, and labels its score as a prioritization aid. Persisted evaluations are keyed by mission only, not mission plus profile/version.
- `main.py` invalidates evaluations on field PATCH and extraction, but the inspected artifact-upload path saves the mission and artifact without calling `invalidate_evaluation_db()`. Decision and evaluation writes are separate operations. Review rows use global `finding_id` primary key; isolation therefore depends on generated IDs plus query filters.
- Export endpoints do mission-filter reviews and block pending/rejected decisions, but the code duplicates the gate across packet/ODAR/EOMP routes. `export_packet` computes provenance status and passes it through; the inspected route does not block when verification is false. ODAR/EOMP gates do not visibly verify provenance or ensure their inputs match current evaluation revision. All use viewer-or-reviewer dependency, which is plausible for read-only export but needs explicit policy decision and tested enforcement.
- `provenance.py` and DB provenance code implement SHA-256 event chaining and verification. A local hash chain detects some alteration but is not immutable against an administrator rewriting the database and is not independently anchored.
- `backend/tests/test_auth_security.py`, `test_persistence.py`, and `test_openapi_contract.py` provide concrete existing test anchors. OpenAPI test checks selected expected endpoints and writes `backend/openapi.json`; it does not assert complete route/auth/schema parity.
- README commands provide grounded baseline checks: `python -m pytest backend/tests`, `python -m app.verification` from `backend/`, and `uvicorn app.main:app ...` from `backend/`. CI configuration runs pytest for backend and AI/ML and frontend. The reported totals vary across project documents, so do not use a hard-coded historical test count as a gate.

## Sequenced phases

### Phase 0 — Establish the canonical contract and release baseline

**Goal:** define the MVP route surface and establish repeatable evidence before altering implementation.

**Deliverables:** inventory of every mounted route, method, request/response schema, role, mutation, provider dependency, error contract, and mission scope; explicit separation of MVP routes from optional research/integration routes; canonical generated `backend/openapi.json`; CI baseline with dependency/runtime versions and artifacted test output; route policy matrix. Resolve mismatched env names in `.env.example` and app configuration as part of contract documentation. Mark simulated/research APIs visibly as non-operational.

**Dependencies:** none; must precede security and schema refactors.

**Acceptance tests:**
1. `cd backend && python -m pytest tests/test_openapi_contract.py -q` passes with no unexpected file mutation; generated OpenAPI is deterministic and clean in `git diff`.
2. Contract test enumerates every `app.routes` API route against a checked-in allowlist and verifies each operation has declared request/response schemas where applicable, stable status/error semantics, and an explicit auth policy. No unclassified route remains.
3. OpenAPI operations requiring reviewer/viewer security declare their security scheme, and route-level test matrix confirms runtime behavior matches schema.
4. `python -m pytest backend/tests` (from repo root) succeeds in CI; attach actual output and report discovered count rather than assuming README totals.

### Phase 1 — Close authentication and authorization gaps

**Goal:** production mode cannot start or serve protected operations with guessed/demo credentials.

**Deliverables:** secret-backed credential configuration with no fallback production secrets; explicit startup validation for production (`ORBIT_ENV`/canonical environment variable); local bypass limited to an explicit test/development profile; all route policies centrally reviewable; documented secret rotation and least-privilege role model. Decide intentionally which liveness/readiness/status endpoints are public and minimize disclosed operational information. Protect `/reset` so it is disabled outside local test/dev or requires a separately controlled operator capability.

**Dependencies:** Phase 0 route inventory.

**Acceptance tests:**
1. With `ORBIT_ENV=production` and missing/empty reviewer or viewer credentials, app startup fails closed; no request can authenticate using repository demo strings.
2. For each protected route, no credentials and invalid credentials return 401; viewer writes return 403; reviewer-authorized writes pass; permitted viewer reads pass. Exercise bearer and API-key forms if both remain supported.
3. Production test matrix sets auth env variants (`production`, `prod`, `ENVIRONMENT`) and confirms no unauthenticated reviewer path. Local bypass succeeds only under explicit test configuration.
4. `/reset` is unavailable or forbidden in production; no public endpoint returns secrets or sensitive configuration.
5. Run `cd backend && python -m pytest tests/test_auth_security.py -q` plus full backend suite.

### Phase 2 — Make mission isolation and write semantics reliable

**Goal:** every operation is scoped to an existing mission, and mutation effects are atomic and retry-safe.

**Deliverables:** service-layer mission lookup/authorization used by every mission-bound route; consistent 404/403 policy; all DB queries constrain mission and resource IDs; stable uniqueness constraints for reviews/artifacts and foreign-key or equivalent ownership checks; transactional mutation + provenance append; optimistic revision/version checks for stale clients; idempotency-key support for create/upload/decision/export-trigger writes where retry can duplicate effects. Include explicit single-deployment data ownership statement (MVP single organization; not tenant isolation).

**Dependencies:** Phase 0 route map, Phase 1 role model, Phase 3 schema design may run in parallel with design but migrations must precede final data constraints.

**Acceptance tests:**
1. Create two missions with same rule/finding shape; decisions, artifacts, evaluation, provenance visibility, and exports for A never include B's records. Forge an artifact/finding ID from B while addressing A and verify no mutation/read leak.
2. Every mission-specific route returns 404 for nonexistent mission IDs instead of computing with defaults, reading arbitrary resources, or returning an unrelated result; test route-by-route from the inventory.
3. Concurrent identical requests with same idempotency key create one logical mutation and same result; same key with differing payload returns 409. Concurrent stale revision update is rejected with documented 409/412 rather than silently overwriting.
4. Simulate DB/provenance failure during mutation and assert neither partial mutation nor missing audit record is committed.
5. `python -m pytest backend/tests` includes these cases and passes repeatedly.

### Phase 3 — Govern persistence, migrations, backup, and restore

**Goal:** deployable persistence has one authoritative schema lifecycle and verified recovery.

**Deliverables:** choose supported MVP DB deployment (SQLite on durable single-writer volume, or explicitly migrate to managed relational DB before horizontal scale); make runtime use Alembic migrations or formally remove migration ambiguity; establish schema version and migration check at startup/release; align migration schema, constraints, indexes, and runtime behavior; settle canonical DB path so Compose/Render/Docker mount and app agree; disable destructive reset except explicit dev/test; backup/restore runbook with encryption/access controls, retention, RPO/RTO targets, and scheduled off-host copies. Document SQLite single-writer/scaling limit.

**Dependencies:** Phase 2 ownership/schema constraints. Must complete before production deployment acceptance.

**Acceptance tests:**
1. From an empty temp DB, apply migrations to head; test migration from a previous supported schema fixture to head; app starts without silently creating divergent tables. Compare table/column/index/FK expectations against runtime ORM/queries or formal schema manifest.
2. Run tests against temp DB paths; restart app and verify mission, artifact bytes/hash, evaluation, decisions, and provenance persist.
3. In a container configured exactly as production, assert resolved DB path is inside the mounted durable volume; write, recreate container, and read back records. No database is created in an unintended container layer.
4. Scheduled backup artifact can be restored into a clean instance; verify row counts, artifact SHA-256s, and provenance chain. Meet declared RPO/RTO in a timed drill; record measured results.
5. Production startup refuses invalid/missing DB path or failed migration; `/reset` cannot erase production data.
6. Commands: `cd backend && alembic upgrade head` (after DB URL configuration); `docker compose config`; `docker compose up --build`; run backup/restore drill script/runbook command (to be added).

### Phase 4 — Bind evaluations, invalidation, provenance, and export gates

**Goal:** outputs are demonstrably current, mission-scoped, review-gated, and auditable.

**Deliverables:** canonical mutation service that invalidates evaluation and dependent review approvals on any input change (fields, artifacts, evidence links, mission metadata, profile/rule versions); store immutable evaluation snapshot with mission revision, profile/rule hash, engine version, timestamp; decision refers to evaluation revision and authenticated reviewer identity; canonical export gate shared by packet/ODAR/EOMP and any alternate export endpoint. Gate verifies evaluation is current, all findings have an allowed final decision, decisions refer to that evaluation, mission IDs align, required sources/provenance verify, and no unresolved integrity failure exists. Export is a deterministic snapshot whose payload/hash and provenance event are linked. Preserve prominent limitation notices; exports remain drafts/pre-review material.

**Dependencies:** Phase 2 transactional writes and Phase 3 revision/migration support.

**Acceptance tests:**
1. For every input mutation route, an existing evaluation becomes stale; every previously recorded decision is either invalidated/requires re-review or safely tied to the prior immutable revision and excluded from current export.
2. Uploading a new artifact or extraction candidate invalidates current evaluation exactly as field PATCH does.
3. Cross-mission decisions cannot satisfy a gate. Missing, rejected, stale, profile-mismatched, tampered-provenance, or mismatched-revision inputs yield a typed 423/409 lock response and no export event claiming READY.
4. Packet, ODAR Markdown/PDF, and EOMP Markdown/PDF invoke the same gate; parameterized tests verify identical gate outcomes. All successful formats include correct mission ID, source locators, decision identity/time, profile/rule/engine versions, provenance status/hash, synthetic/research disclaimers, and export digest.
5. Hash-chain tampering at first/middle/final events blocks readiness/export and is detectable after restart. Document residual limitation that local DB hash chain is not external immutable storage.

### Phase 5 — Stabilize provider boundaries and API behavior

**Goal:** external services cannot compromise privacy, reliability, or deterministic core outcomes.

**Deliverables:** adapters remain isolated behind typed interfaces; per-document `allowed_external_processing` permission is persisted, explicit, and checked before any egress; verified TLS and host/domain allowlists; secrets never enter logs or responses; connect/read timeout, retry budget, circuit breaker, payload-size limits, and cancellation; deterministic offline fallback is visibly labeled; no provider output can set human confirmation, decisions, or authoritative statuses. Normalize errors to documented problem-detail schema and add request IDs. Add content-type and malware/content validation, streaming size enforcement, and retention policy for uploaded binary data.

**Dependencies:** Phase 0 route/error contract and Phase 1 secrets policy; Phase 4 provenance of provider use.

**Acceptance tests:**
1. Provider disabled, timeout, malformed response, TLS validation failure, blocked host, permission denied, and rate-limit cases return documented typed errors or labeled deterministic fallback within configured deadline.
2. Mock network spy proves no document bytes are sent absent explicit per-document permission; tests prove no candidate is human-confirmed and no provider can approve/reject or alter finding status.
3. Fuzz/path/domain/redirect tests confirm allowlist cannot be bypassed; TLS verification cannot be disabled by environment or fallback code.
4. Oversized chunked upload terminates at configured byte limit before unbounded memory use; unsupported/mismatched file content is rejected; errors do not echo secrets, uploaded content, or stack traces.
5. Repeated provider failures leave deterministic evaluation results unchanged and are visible in operational metrics.

### Phase 6 — Observability, deployment handoff, and operational evidence

**Goal:** a maintainer can deploy, diagnose, and recover the MVP without inferring behavior from code.

**Deliverables:** structured logs with request/correlation ID and route/status/latency, redaction rules, metrics for request failures/latency, DB readiness, migration state, provider health/timeouts, export locks, and provenance verification; separate liveness (`/health`) and readiness (`/ready`) checks with accurate semantics; graceful shutdown; pinned/reproducible dependency and image builds; production Compose/Render configuration with no demo credentials, minimum exposure, durable storage, TLS termination guidance, secret injection, resource limits, and rollback/migration procedures. Handoff includes ownership, environment-variable reference, deploy/upgrade, smoke test, backup/restore and incident runbooks. Deployment claims in repo config are not proof of a live deployment.

**Dependencies:** Phases 1, 3, 5. Can implement instrumentation earlier, but release gate follows these dependencies.

**Acceptance tests:**
1. `/health` is liveness-only and does not falsely report DB healthy; `/ready` fails while DB/migration is unavailable and succeeds when ready. Probe policy is tested under production auth/network policy.
2. A synthetic request emits correlated structured logs and metrics, with no bearer token, API key, document body, or sensitive reviewer note. Verify exported metrics/log samples against redaction tests.
3. Clean environment deployment builds from lockfiles, injects secrets externally, uses verified persistent DB path, applies migration, passes authenticated smoke tests, and survives container restart.
4. Rollback-compatible release procedure and backup restore drill are performed and recorded before MVP launch; measured recovery meets declared objectives.
5. Operational docs identify owner/on-call path, supported scale/SQLite limits, provider off-switches, known synthetic/research boundaries, and escalation procedure.

### Phase 7 — Final regression and 10/10 review gate

**Goal:** independently verify all preceding controls against the agreed API inventory.

**Deliverables:** evidence bundle from clean checkout: test reports, OpenAPI diff, migration status, auth/route matrix, isolation/export adversarial results, backup-restore proof, deployment smoke test, and unresolved risk register signed by backend owner and product/safety reviewer.

**Dependencies:** Phases 0–6 complete.

**Acceptance tests:**
1. CI runs `python -m pytest backend/tests`, `python -m pytest ai_ml/tests` where backend adapters depend on them, and `python -m app.verification` from `backend/`; all pass on supported Python version. Do not accept undocumented skips or stale recorded counts.
2. Contract test covers all mounted routes and schema/auth mappings; checked-in OpenAPI is regenerated and has no unexplained diff.
3. Adversarial tests cover production fail-closed auth, mission separation, stale evaluation/review, tampered provenance, all export formats, idempotency, DB failure atomicity, provider permission/TLS/timeouts, and error redaction.
4. Deployment smoke test, restart persistence, migration, restore drill, and readiness checks pass against the actual release image and configuration.
5. No unresolved Critical/High backend security, data-integrity, privacy, or export-gate finding remains; accepted residual risks have an owner, mitigation, and review date.

## Principal risks and mitigations

- **Hard-coded/default credentials or environment ambiguity:** require secret injection and startup validation; test actual production-mode configuration, not just helper behavior.
- **Silent schema drift / migration not run:** one migration authority; deploy-time migration status gate; test old-to-new upgrades and restore.
- **Cross-mission record leakage:** audit every route and DB access path; enforce ownership predicates and hostile cross-ID tests.
- **Stale approval or evaluation reused after edits:** revision-bind decisions and exports; invalidate on every mutation, including artifact upload and metadata changes.
- **Tamper-evident chain mistaken for tamper-proof records:** document limits; gate export on verification; anchor signed/checkpoint hashes in separately controlled immutable storage if stronger assurance is required.
- **Non-atomic writes:** transactionally couple mission changes, invalidation, decision, and provenance; add concurrency and fault-injection tests.
- **Provider privacy or availability failure:** explicit permission, strict egress/TLS/timeout rules, minimal data, deterministic fallback, and no-authority invariant.
- **SQLite concurrency or durability assumptions:** limit MVP to single deployment/single writer; verify durable volume and backup recovery; migrate before multi-instance scaling.
- **Overstated policy/ML behavior:** retain research/synthetic labels and human review boundary; do not treat model outputs as operational determinations.
- **Documentation claims outpacing runtime:** distinguish checked-in intent/configuration from observed deployment; require release evidence generated by the deployed artifact.

## Clear done gate

Backend roadmap is complete for the declared MVP only when every Phase 0–7 deliverable is merged and its listed acceptance evidence is recorded against the release candidate; all routes are accounted for; production startup has no demo-secret or anonymous-reviewer path; migration, restart persistence, and restore are demonstrated; two-mission isolation and stale-state tests pass; every export is revision-bound and blocked on any unresolved gate or provenance failure; optional providers pass privacy/TLS/error-boundary tests; CI is green; and the deployment handoff and residual risks have named owners. Any missing evidence, unresolved critical/high data-integrity or authorization issue, or unverified production persistence means **not done**, irrespective of a passing unit-test count.
