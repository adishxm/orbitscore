# OrbitScore 10/10 Master Roadmap

## Purpose and baseline

This document integrates the eight area roadmaps for OrbitScore's declared single-deployment, human-pre-review MVP. It is an execution plan, not evidence that implementation, deployment, verification, or approval has occurred. The area assessments refer to repository commit `403051612cf6ac026d6a31be7d8ca6b826da2a93` (2026-10-25), including project-operations/research, which was checked against the same fresh clone. The evidence-based area scores are AI/ML 4/10, backend 5.5/10, frontend 5.5/10, integrations 3/10, FlutterFlow 2.5/10, Render 4/10, security/QA 4/10, and project operations/research 6/10. Scores are snapshots, not completion claims; area files contain their own evidence, criteria, and limitations.

**A 10/10 means completion of the declared, bounded, scoped criteria and documented acceptance evidence in these roadmaps—not absolute perfection, universal security, or proof against every possible failure.** Scope changes require explicit review and updated criteria rather than silently relaxing gates.


## Dependency-ordered phases

Phases advance only when their exit evidence is recorded against a named commit/build. Some work can proceed in parallel within a phase, but downstream release claims depend on upstream gates. Any failed or unobserved check remains open; documentation/configuration is not proof of runtime behavior.

### Phase 0 — Reconcile scope, source of truth, and baseline

**Lead areas:** project operations/research, security/QA, all area owners. Freeze the MVP boundary and claims; identify exact checkout SHA, worktree state, runtime/deployment environments, ownership, and evidence freshness. Reconcile the recorded `.brain` status and verification timestamp with the current candidate. Capture clean-checkout test counts per suite and reconcile the reported 182 tests (64 backend + 33 AI/ML + 85 frontend) with the `.brain` figures totaling 156 (55 + 34 + 67); neither count is authoritative until rerun on the exact SHA. Preserve dated reports without overwriting them.

**Exit gate G0:** one signed baseline record identifies scope, SHA, environment, owners, source-of-truth artifacts, verified/unverified claims, reproducible suite counts, and all known discrepancies. No release assertion relies on inaccessible or stale state.

### Phase 1 — Define contracts and close trust-boundary blockers

**Lead areas:** backend, security/QA; integrations and AI/ML contract input. Specify authoritative API schemas, roles, mission/resource ownership, revisions, decision and export states, provenance, provider consent and data boundaries, and failure/error semantics. Remove production fallback credentials and make missing production secrets fail closed; reject demo keys for production. Decide migration/runtime DB behavior and the supported release image. Set explicit provider enablement policy and keep unverified providers disabled. Define what “live,” “snapshot,” “synthetic,” and “synthetic assumption” mean. Pin FlutterFlow status as unverified until a real service project/account and app are demonstrated.

**Exit gate G1:** reviewed contract and threat-boundary dossier; routes and roles are mapped; no contradictory client/server or research/product claims; provider and mobile enablement conditions are explicit. This gate precedes client parity and deployment hardening.

### Phase 2 — Make backend state safe, durable, and authoritative

**Lead areas:** backend, security/QA, Render. Implement route-by-route authentication/authorization, cross-mission isolation, write transaction integrity, idempotency and concurrency behavior, revision-bound evaluations/approvals, and consistent export blocks for stale, incomplete, rejected, cross-mission, or invalid-provenance state. Reconcile artifact-upload invalidation and duplicated export gates. Establish migration from empty and supported prior schemas, durable storage, backup/restore, verified hashes, bounded upload/provider behavior, and redacted errors/logs. Test provider egress policy and ensure disabled/unconfigured paths make zero calls.

**Exit gate G2:** adversarial route-role and two-mission tests pass; injected write failures leave no partial state; retries do not duplicate writes; mutations invalidate/bind prior decisions and evaluations; all export variants enforce the same server-authoritative rules; restart/restore and migration evidence is recorded. No UI optimism can override this API state.

### Phase 3 — Reproducible product, deployment, and evidence foundation

**Lead areas:** Render, backend, security/QA, project operations/research. Validate the actual Render Blueprint and pinned image, not just configuration text. Prove frontend HTTPS API URL and exact CORS origins; eliminate localhost production allowances. Resolve the Render API host reference and verify service topology. Reconcile worker's disabled auth/no public listener and provenance writes with the API-only disk: require a tested least-privilege shared durable path or redesign so the worker cannot create inconsistent provenance. Separate staging/production origins, storage, and secrets; test readiness against dependencies and ensure failure is surfaced. Establish DB, logs, alerts, cost limits, release/rollback, and restore operations. In parallel, build clean-checkout evidence, align paper/product/implementation claims and source lineage, and repair onboarding paths.

**Exit gate G3:** a pinned staging deployment is operationally verified end-to-end; auth/CORS, persistence, readiness, backup/restore, logs/alerts, rollback, and smoke evidence pass. Configuration presence alone does not pass. Research and product claims have traceable current sources or are explicitly marked unverified/hypothesis.

### Phase 4 — Server-authoritative web UX and accessible workflow

**Lead areas:** frontend, backend, security/QA. Simplify entry and first-run orientation, reduce perceived workflow complexity without weakening actual human review gates, and make source/freshness/verification state easy to find. Wire all saves, evaluations, decisions, context/evidence/issues, and export status to confirmed server responses; failed writes must remain visibly failed, never appear saved/approved, and never unlock export. Make 3D/motion optional, support reduced motion, keyboard/screen reader/touch, small screens and zoom. Test against the Phase 1 contract and Phase 2 authoritative API.

**Exit gate G4:** live failure injection proves displayed state matches server outcomes; no client-only transition can bypass review; accessibility and responsive checks meet the frontend roadmap criteria; first-time usability and boundary comprehension are supported by measured participant results, not assumptions.

### Phase 5 — Provider and AI/ML evidence; research-only boundaries

**Lead areas:** integrations, AI/ML, backend, security/QA, project operations/research. For integrations, verify account/credential status and provider contracts before any controlled live-call evidence. Enforce consent, allowlists, redirect/SSRF defenses, strict TLS, budgets, bounded timeouts/retries, duplicate paid-call prevention, response validation, audit redaction, and truthful outage/fallback labels. ElevenLabs dispatch must require explicit opt-in and authoritative reviewed server content; Browser Use destinations must be validated; Agent37 quotations must be literal source excerpts. Keep Adaption offline research-only absent independently confirmed supported inference API.

For AI/ML, establish rights/privacy/label provenance for every item, hash verification, family/event-disjoint splits, duplicate/chronology leakage checks, locked adequately sized real-data evaluation, task-appropriate baselines, clustered confidence intervals and per-stratum results. Use reproducible manifests and independent reruns; calibrate uncertainty against preregistered coverage or abstain. Govern model approval/revocation/schema/domain constraints and audit lineage. Synthetic rule-derived orbital targets and fixed ±12% intervals are not validated performance. Insufficient real data means research-only and no promotion.

**Exit gate G5:** provider-specific release dossiers include validated live-call evidence only where approved; disabled/unconsented/budget-blocked paths prove zero egress. AI/ML candidate results meet predeclared evaluation criteria and independent reproducibility; otherwise remain unpromoted/research-only. All outputs remain unconfirmed and cited: no model/provider may approve findings or make operational/regulatory claims.

### Phase 6 — FlutterFlow project and cross-client parity (conditional scope)

**Lead areas:** FlutterFlow, backend, security/QA, project operations. Current mobile status is **not established**: repository documentation, OpenAPI, and contract-generation tests do not demonstrate a FlutterFlow service project, account configuration, app, build, or release. First verify project ownership/service status and release boundary. If in scope, create/configure the project, validate generated calls against `backend/openapi.json` and implementation, and provide safe auth/session lifecycle without embedding a shared reviewer key. Implement minimum reviewer flow, explicit loading/error/offline behavior, no silent write queue/replay, and shared backend state. Test decision/provenance parity and export lock across React and FlutterFlow on simulators and physical devices, including TLS/privacy/accessibility and rollback. If no service project exists or no mobile release is in scope, document the explicit exclusion and do not claim mobile completion.

**Exit gate G6:** service project identity/configuration and release boundary are evidenced; supported devices pass role, mission isolation, state parity, export lock, recovery/offline, accessibility, privacy, and rollback acceptance. A READY label or docs-only setup is not evidence of a shipped client.

### Phase 7 — Integrated release candidate and independent verification

**Lead areas:** security/QA, backend, Render, frontend, project operations, area owners. Freeze a release candidate SHA and deployment artifact. Run clean-checkout backend, AI/ML, frontend, contract, integration, and verification suites; publish actual runner counts and outcomes, resolving the 182-vs-156 discrepancy. Run route-role, mission-isolation, CORS, uploads/abuse, hostile model/output, secret/dependency/history/SBOM, privacy, accessibility, staging smoke, persistence/restore, and rollback checks. Validate all declared claims against current evidence and pinpoint sources. Record failures, exceptions, owners and expiry; no open critical blocker may be waived through score arithmetic.

**Exit gate G7:** all required suites and security/deployment checks pass on the exact candidate; results and artifact hashes are retained; dated independent review finds no unbounded critical/high risk and all approved exceptions are explicit and time-bounded.

### Phase 8 — Final human acceptance and signoff

An independent reviewer who did not solely author the evidence packet examines the exact SHA, built artifact, scope, cross-area gates, current evidence, risk exceptions, and each area's score basis. Product/release owner confirms the declared scope and human-pre-review boundary; security/operations owner confirms residual risk, rollback and recovery; research/AI owner confirms no unsupported performance claims; mobile owner signs only if mobile is in scope. Capture names/roles, date, commit/artifact IDs, decision, exceptions and evidence links. Any changed code/config/data after review invalidates affected evidence and reopens relevant gates. Pending or “eligible” status is not approval.

**Final acceptance gate:** G0–G7 are evidenced and passed (or an explicit out-of-scope decision is approved for conditional FlutterFlow work); global blockers are closed; all scoped area criteria score 10/10 with evidence; and independent human signoff is recorded for that exact release. Until then, status is incomplete regardless of configuration or documentation maturity.

## Cross-area gates and dependency logic

- **Contract-before-client:** backend/API, authorization, revision and provenance rules (G1–G2) precede React live-state claims, FlutterFlow generation, and integration enablement.
- **State-before-export:** server persistence, mutation invalidation, and human decision gates (G2) precede frontend/mobile export affordances and provider delivery.
- **Deploy-before-live-claims:** Render staging, secret separation, topology, durable storage, readiness and rollback (G3) precede any production-readiness or live-provider claim.
- **Evidence-before-performance-claims:** AI/ML data governance and locked evaluation (G5) precede any validated model or generalization claim; synthetic results stay labeled synthetic.
- **Parity-before-mobile-release:** actual FlutterFlow project/service identity plus shared backend state and auth are required; documentation alone cannot satisfy G6.
- **Fresh evidence-before-signoff:** tests and claims must match exact SHA/artifact; stale counts, unobserved Actions, and prior verification records do not satisfy G7/G8.

## 10/10 scoring rubric

Score each area from 0–10 only against its declared criteria, weighted by evidence quality, scope coverage, safety criticality and operational maturity. A score is not a mean that can compensate for a failed gate.

| Score band | Interpretation |
|---|---|
| 0–2 | Absent, inaccessible, or mostly plans/docs; implementation or ownership unverified. |
| 3–4 | Partial foundations exist; critical gaps and/or unverified behavior block acceptance. |
| 5–6 | Material implementation and some tests/evidence; important safety, coverage, operational, or user evidence remains open. |
| 7–8 | Most scoped criteria implemented and verified; bounded noncritical gaps remain with explicit owners and dates. |
| 9 | All substantive criteria pass; only tightly bounded, approved residual exceptions remain and do not weaken critical controls. |
| 10 | Every declared in-scope criterion passes on the named release candidate with fresh, reproducible evidence and required independent human signoff; no critical/unbounded blocker remains. |

**Mandatory rules:** A missing area file, missing source/project, failed test, stale count, inaccessible verification state, or unverified deployment cannot be scored as complete. No averaging away a failed critical acceptance check. “Not applicable” requires a signed scope decision and cannot be used to relabel an unimplemented in-scope area. Scores must identify evidence and date. Completion means the scoped criteria are met, not absolute perfection.

## Critical path (dependency chain)

1. **Baseline and scope truth (G0):** establish exact SHA, access to project/.brain and deployed environments, reconcile test counts and confirm ownership.
2. **Canonical trust/API contracts and production fail-closed auth (G1).**
3. **Backend isolation, durable transactional state, revision invalidation, and export gates (G2).**
4. **Verified Render staging topology, secrets, HTTPS/CORS, shared durable data path, readiness and recovery (G3).**
5. **Server-authoritative web client and usability/accessibility evidence (G4).**
6. **Provider/AI controls and independently reproducible real-data evaluation; research-only where evidence is inadequate (G5).**
7. **If mobile is in scope: actual FlutterFlow project + contract, safe auth, state parity and device proof (G6); this can develop in parallel after G1–G3 but cannot release before them.**
8. **Exact-candidate integrated security/QA, clean-run counts, deployment rollback, claim reconciliation (G7).**
9. **Independent human review and signoff on the unchanged candidate (G8).**

The likely long pole is real-data provenance plus adequately powered, locked AI/ML evaluation and external validity; lack of data must lead to an explicitly research-only outcome, not fabricated schedule certainty. Deployment/shared-state topology and production auth are blocking technical risks early in the path.

## Global risk register

| Risk | Impact / current evidence | Required mitigation and closure evidence | Owner(s) |
|---|---|---|---|
| Source-of-truth and stale evidence | `.brain/state.json` records verification on 2026-10-24; current inspected `main` is commit `4030516` on 2026-10-25. All tasks are marked done/eligible, while the latest completion report remains pending final human review. | Record exact current SHA; rerun relevant checks; preserve the distinction between done, eligible, and independently approved. | Project ops, QA |
| Authentication fallback/shared-key exposure | Backend and Render reviews cite fallback credentials; worker auth/storage boundary unclear. | Remove production defaults, fail closed, no embedded shared reviewer token; route-role tests and least-privilege worker design. | Backend, security, Render |
| Cross-mission leakage / unsafe exports | Route/resource ownership and export gate consistency not fully evidenced. | Two-mission adversarial suite; centralized server-side decision/provenance/revision gates over every export variant. | Backend, security, frontend |
| Persistence and restore failure | SQLite runtime/migration path and API disk vs worker provenance writes not proven; backups/restore absent. | Validate topology; migration, restart, backup/restore drills with hash/row/provenance checks and agreed RPO/RTO. | Backend, Render, operations |
| UI falsely reports saved/approved | Evaluations discarded, local optimistic decisions, and incomplete save wiring identified. | Failure-injection and API-authoritative UI state; failed writes stay failed and export remains locked. | Frontend, backend |
| Provider egress, privacy or paid-call abuse | No verified live accounts/calls; consent, allowlist/SSRF, budget/idempotency and response controls incomplete. | Default disabled; explicit consent, strict destination validation, limits, safe errors, audit and controlled release dossier. | Integrations, security |
| Misleading AI performance or model misuse | Tiny/synthetic data, rule-derived targets, uncalibrated uncertainty and incomplete governance. | Provenance-rich independent real-data evaluation; uncertainty calibration, registry controls, abstention and research-only labeling until passed. | AI/ML, research, security |
| Nonexistent/unverified FlutterFlow release | No Dart source/project export or verified service/account; docs are not app evidence. | Confirm actual service/project and scope; otherwise mark mobile not established/out of scope; never claim shipped. | FlutterFlow owner, operations |
| Render configuration mistaken for deployment | Blueprint evidence but no live validation; CORS localhost, API host reference and probe semantics unresolved. | Validate pinned staging and actual built URL, readiness, origins, persistence, smoke, restore and rollback. | Render, backend |
| Test-count/CI mismatch | Claimed 182 vs .brain 156; no verified live Actions result. | Re-run each suite from clean checkout at candidate SHA; retain raw runner output and reconcile all labels. | QA, operations |
| Unsupported or misaligned product/research claims | Source freshness, paper/product/implementation alignment and lineage not verified. | Claim-to-source matrix with pinpoint locators; reproducible source-to-PDF process; mark unsupported items hypothesis/unverified. | Research, product |
| Human signoff bypass or stale approval | “Done/eligible” distinct from final review; no independent exact-candidate signoff. | G8 independent review; any candidate change invalidates affected evidence and approval. | Release owner, independent reviewer |

## Area roadmap links

Use the [README index](README.md) for the eight focused files. Each area roadmap owns its detailed actions and checks; this master plan governs cross-area order, shared gates, and release completion.
