# Security and QA Roadmap — OrbitScore

**Checked repository snapshot:** `/tmp/orbitscore-check-20261025`  
**Checked commit:** `403051612cf6ac026d6a31be7d8ca6b826da2a93` (requested commit; exact match)  
**Assessment date:** 2026-10-25  
**Repository modifications:** None. This roadmap is written outside the repository.

## Current score: 4/10

This is a conservative roadmap score, not a vulnerability severity rating or a certification. The score reflects visible security controls and recorded test evidence, discounted for the lack of independently verified current CI execution, inconsistent test-count claims, limited demonstrated abuse/isolation testing, and missing evidenced release/deployment controls.

**Observed basis:** The repository has an auth dependency with reviewer/viewer roles and a production-enforcement switch; a CORS regression test rejects wildcard origins; upload tests cover extension rejection and a 10 MiB boundary; export tests cover lock behavior and packet shape; provenance tests cover canonicalization, tamper, order, deletion, and stored SQLite tampering. README describes external-processing permission checks and TLS verification, and AI is documented as disabled by default with deterministic fallback. `.brain/state.json` records an earlier verification result and completion eligibility awaiting final human review. These are positive signals, but a test or prior report is evidence only for its defined scenario and revision; they do not establish full endpoint authorization, tenant isolation, production configuration, live CI success, or deployed behavior.

**Current gaps / unverified facts:** The checked-in CI YAML specifies tests but contains no run result; no live GitHub Actions status was observed, so CI-green is **unverified**. README says backend 64 + AI/ML 33 + frontend 85 = 182 tests; `.brain/state.json` records backend 55 + AI/ML 34 + frontend 67 = 156 tests (and 5 brain reporting tests separately). CI job labels repeat the README's 64/33/85 values, while commands invoke whole suites and do not assert those counts. Thus the nominal totals differ by 26 (backend −9, AI/ML +1, frontend −18); none should be treated as the authoritative current count until regenerated from the checked commit. `.brain/state.json` says `last_verified_at` 2026-10-24 and `current_phase: completed`, but its recorded suite figures and referenced report are stale relative to the README claims and must not be silently reconciled. The current auth module also contains literal fallback reviewer/viewer key strings; whether every deployment overrides them and whether secrets can leak through history/runtime is **unverified**. The supplied sample tests do not demonstrate a comprehensive cross-mission/role matrix, exhaustive API abuse tests, dependency scanning, secret scanning, deployment smoke/rollback, or current accessibility audit.

## Scope and meaning of “10/10”

Scope is repository-only security and quality assurance: authentication/authorization, CORS, API abuse resistance, mission/data isolation, file uploads and exports, provenance/audit evidence, external-data and model-output boundaries, secrets/privacy, dependency and static security checks, CI/test integrity, accessibility evidence, release/deployment smoke and rollback, evidence freshness, and accountable signoff. This roadmap does not certify orbital/domain correctness, regulatory compliance, production readiness for a particular operator, or security against all attackers.

**10/10 means evidence-backed and bounded assurance:** every in-scope control has an explicit owner, threat/requirement, automated or documented verification, current artifact tied to an immutable commit, and a defined exception process; critical regressions fail the gate; an independent reviewer signs off the release evidence. It does not mean literal perfection, zero vulnerabilities, or a guarantee against unknown threats. Any material code/config/dependency change invalidates relevant evidence and requires rerun.

## Evidence handling rules

1. Record commit SHA, UTC timestamp, tool/version, exact command, exit status, test totals by suite, and artifact links for each verification. Count tests from the runner's actual collected/passed output, not README labels or test-file names.
2. Treat `.brain/state.json` and completion reports as project workflow records, not proof that CI or a deployment passed. Reconcile their timestamp, commit association, suite counts, and report contents before reuse.
3. Label every item as **observed**, **recorded**, **unverified**, or **failed**. Do not report green based on `.github/workflows/ci.yml` existing.
4. Keep evidence non-sensitive: redact tokens, user content, uploaded documents, and provider credentials. Preserve logs/provenance with access control and retention policy.

## Sequenced phases

### Phase 0 — Establish reproducible baseline and truthful counts
**Dependencies:** None.  
**Deliverables:** A commit-pinned baseline manifest; corrected suite-count source of truth; CI run-status evidence; inventory of routes, roles, external calls, stored data and release environments; update process for README and `.brain` records. Do not edit either claim set before determining why counts differ.

**Actions and acceptance:**
- In a clean checkout of `403051612cf6ac026d6a31be7d8ca6b826da2a93`, run backend, AI/ML, frontend, brain validation, typecheck, build and verification-matrix commands from repository docs/CI. Example: `python -m pytest backend/tests/ -v`, `python -m pytest ai_ml/tests/ -v`, `cd frontend && npm ci && npm test -- --reporter=verbose`, `npm run typecheck`, `npm run build`; run `python .brain/scripts/validate_brain.py` and `python -m app.verification` in their documented working directories. Capture exact collected/passed counts. **Note:** whether `npm test` accepts an appended reporter option is package-script-dependent; use configured Vitest reporter if not.
- Query the actual GitHub Actions run for this SHA (UI/API) and preserve URL, workflow/run ID, conclusion, branch/event and jobs. Require all required jobs concluded `success`; pending/missing runs are not green.
- Reconcile expected test counts with observed runner totals and the relevant `.brain/reports/task-runs/...T009_verification.json`. Acceptance: one machine-readable manifest and docs agree exactly on per-suite counts and commit; explanation recorded for the current 64/33/85 vs 55/34/67 discrepancy. No hard-coded test count should be accepted as evidence absent output.

### Phase 1 — Close high-impact auth, role, CORS and data-isolation gaps
**Dependencies:** Phase 0 route/environment inventory.  
**Deliverables:** Route-to-role authorization matrix; safe production bootstrap; negative tests for every write/read/export route; mission-isolation integration fixtures; documented CORS allowlist by environment.

**Actions and acceptance:**
- Audit every FastAPI route dependency in `backend/app`; enumerate anonymous, viewer and reviewer access. Ensure production startup refuses absent, default, duplicate, or weak reviewer/viewer credentials; remove hard-coded fallback secrets for production and preferably fail startup when auth is enforced without explicitly provisioned secrets. Test both environment variables (`ORBIT_ENV`, `ENVIRONMENT`) and `ORBITSCORE_AUTH_ENABLED` precedence, including conflicting values.
- Expand tests from `backend/tests/test_auth_security.py`: for each protected read/write/export route assert missing token → 401, invalid token → 401, viewer write → 403, reviewer allowed only for intended operations; test both Bearer and `X-API-Key` if supported. Ensure local-dev bypass is impossible in production configuration. Include disabled-auth mode only in explicit test/local environment.
- Create missions A/B with unique sentinel values, artifacts, reviews, evaluations and provenance. As viewer/reviewer, attempt cross-mission read, update, decision, artifact fetch, export, and identifier substitution. Acceptance: no response or export reveals/changes B while operating on A; negative responses do not leak record existence or private fields beyond documented policy. Repeat using guessed IDs and malformed identifiers.
- Test CORS preflight and actual responses against approved origins; reject unlisted origins and credentials with wildcard origin. Test production allowlist contains no localhost unless explicitly required. Current test only checks static middleware configuration and localhost inclusion; it does not prove browser enforcement.

### Phase 2 — API abuse, upload, persistence and export hardening
**Dependencies:** Phase 1 identity and route matrix.  
**Deliverables:** Abuse-case suite, bounded upload/resource policy, export injection/privacy checks, resilient persistence and provenance tests.

**Actions and acceptance:**
- Exercise malformed/oversized JSON, boundary and over-limit multipart payloads, misleading MIME types/extensions, empty files, path traversal filenames, duplicate uploads, parser bombs where applicable, excessive pagination/batch requests, repeated expensive evaluation/export, and concurrent writes. Require documented status codes, bounded memory/time, no traceback/secrets, and stable data after rejection.
- Verify stored uploads are non-executable, path-safe, access-controlled and subject to retention/deletion policy. Fuzz or property-test parsing boundaries; cap request and extraction time/size and assert timeout behavior.
- Test HTML/Markdown/JSON exports with hostile mission names, notes and extracted text (HTML/script injection, CSV-like formula values where relevant); assert correct escaping, explicit unverified states, access control, correct mission matching and no unintended PII/secrets. Confirm export lock behavior for pending/rejected findings and consistent provenance validity.
- Add database migration/restore and concurrent transaction tests. Exercise provenance chain verification after payload edit, deletion, reorder and forged chain head; document that a hash chain without external anchoring cannot prevent a privileged attacker rewriting the full database.

### Phase 3 — Secrets, privacy, third-party and model-output boundaries
**Dependencies:** Phase 1 threat inventory; Phase 2 upload/extraction paths.  
**Deliverables:** Secret-handling checklist and scanner gates; data-flow/privacy map; provider egress allowlist; model-output trust-boundary tests.

**Actions and acceptance:**
- Add secret scanning (e.g. Gitleaks or equivalent) on PR and default branch plus repository-history scan; inspect findings, rotate any exposed credential, and add narrow documented false-positive allowlist with expiry. Verify `.env`, build outputs, reports and logs do not expose secret values. Scan current tree and history; a clean current working tree alone is insufficient.
- Add Python and npm dependency vulnerability checks (e.g. `pip-audit` and `npm audit` or approved equivalents), lockfile consistency, and container/base-image scan if Docker is a release artifact. Pin/upgrade policy should be explicit. Gate on exploitable critical/high findings or documented, time-bounded risk acceptance; preserve SBOM and reports per release.
- Verify external document processing is denied unless per-document `allowed_external_processing` consent is true; test denial, provider outage, unexpected endpoint, TLS certificate failure, redirect to untrusted host, timeout and redacted telemetry. Confirm TLS validation cannot be disabled by fallback configuration. Claims of these controls in README are not independent runtime evidence.
- Treat AI/model output and extracted document contents as untrusted data: test prompt injection and instructions embedded in uploads, fabricated citations, malformed/schema-invalid fields, unsupported claims and oversized outputs. Require schema validation, provenance/citation linkage, `human_confirmed=False` until reviewer action, no model-originated command/tool execution, deterministic fallback behavior and safe refusal/NOT EVALUATED states. Acceptance: no model result can approve findings, change roles, bypass evidence gates or silently become authoritative source material.
- Document categories of personal/confidential data, purpose, storage location, access, retention/deletion, external processors and incident path. Acceptance: test logs omit tokens and uploaded content; deletion/retention tests prove policy behavior on primary DB and artifact store, or clearly state any unsupported deletion limitation.

### Phase 4 — Make CI a trustworthy, comprehensive release gate
**Dependencies:** Phases 0–3 tests and scan choices.  
**Deliverables:** Required branch-protection checks; deterministic clean-run workflow; scan/test artifacts; test-count reconciliation and flake policy.

**Actions and acceptance:**
- Update CI so every test suite and check runs on PRs and protected-branch pushes, with explicit Python/Node versions and locked dependencies. Include backend, AI/ML, frontend tests, typecheck/build, brain validation, verification matrix, accessibility, secret/dependency scans and relevant security tests. Add container build/test if deployable image is in release scope.
- Require a real Actions run against the candidate SHA. Acceptance: all required jobs conclude success, no skipped required job, full log/artifact URLs retained, and exact suite counts collected and matched to manifest/docs. A workflow definition alone never satisfies this check.
- Enable coverage reporting for backend/frontend. Set an initial measured baseline, then enforce thresholds that protect auth, export, consent/AI boundaries and route authorization rather than using an arbitrary global target. Require tests for all routes and identified threat cases; coverage percentage is not a substitute for behavior tests.
- Remove nondeterminism from tests (shared mutable app state, order coupling, time/network dependence) or isolate/reset it; demonstrate two clean CI reruns on the same SHA. Track flaky tests; no retry may conceal an unresolved failure.

### Phase 5 — Accessibility and user-facing safety wording verification
**Dependencies:** CI baseline and stable UI.  
**Deliverables:** Automated accessibility checks plus manual keyboard/screen-reader evidence; safety-boundary copy review.

**Actions and acceptance:**
- README/CI mention Axe, but workflow excerpt only runs `npm test`, and the inspected cinematic tests cover state/event architecture rather than accessibility. Determine whether automated Axe checks exist and are invoked in the actual suite; add route-level axe checks on primary workflows. Acceptance: zero serious/critical violations on defined key routes; all exceptions have owner, rationale and due date.
- Manually verify keyboard-only navigation, focus visibility/order, dialog focus return, labels, errors, contrast, reduced motion, zoom/reflow and screen-reader announcement of status and review gates. Save browser/OS/assistive-tech versions and results, test date, route and screenshots/logs.
- Retain banned-words lint as a narrow wording guard and test it against relevant UI/export surfaces. It cannot establish correctness of all claims. Acceptance: human review confirms synthetic demo labels, evidence-readiness boundary, uncertainty/NOT EVALUATED labels and non-certification notices are prominent in UI and exports; no copy implies autonomous safety/compliance approval.

### Phase 6 — Deployment smoke, rollback and independent evidence/signoff
**Dependencies:** Phases 0–5 complete; named deployment owner/environment.  
**Deliverables:** Environment-specific runbook, smoke-test report, rollback drill, evidence index, security/QA reviewer signoff.

**Actions and acceptance:**
- In an approved staging environment, deploy the exact candidate image/artifact and verify production auth fail-closed; health/readiness endpoints; CORS; migrations; persistent storage; upload size/type rejection; cross-mission isolation; review decision/export gate; provenance verification; AI/external processing disabled or consent-gated as configured; no secret in responses/logs. Capture sanitized request/response and deployment IDs. Do not infer deploy success from local tests.
- Perform a rollback drill to the last known-good artifact and database recovery plan in staging. Acceptance: restore/rollback within documented recovery objectives; no data corruption or authorization regression; operator records steps, elapsed time, and outcome. If production deployment is not in current scope, explicitly mark production smoke/rollback **not applicable and unverified**, not passed.
- Compile evidence index keyed to candidate SHA: actual CI run, test manifest/count reconciliation, scan reports/SBOM, threat-model/route matrix, privacy and provider-boundary checks, accessibility report, staging smoke/rollback, known-risk register and exceptions. Ensure freshness by rerunning after relevant code/config/dependency changes and within an agreed release window (proposed maximum 30 days for unchanged release evidence).
- Independent reviewer (not sole implementer) checks critical findings, evidence provenance/freshness, exceptions and release scope; accountable owner signs with date and explicit residual risks. `.brain` completion eligibility is not a substitute for this signoff.

## Risks and mitigations

| Risk | Mitigation / evidence required |
|---|---|
| Stale or contradictory test counts create false confidence | Generate counts from actual clean-run output on the same SHA; reconcile README, CI labels, and `.brain` reports before claiming a baseline. |
| Default token values are accidentally used in production | Startup fail-closed validation; secret provisioning checks; production-like config tests; secret/history scans and rotation evidence. |
| Route omissions or guessed mission IDs expose data | Route inventory and automated matrix; cross-mission sentinel tests for every object type and export path. |
| TestClient-only tests miss reverse-proxy/CORS/deployment behavior | Staging smoke through deployed ingress with production-equivalent configuration and browser preflight checks. |
| Hash-chain evidence is mistaken for tamper-proof storage | State threat-model limitation; restrict DB access, protect backups, and consider externally anchored signed checkpoints if adversarial admin tampering is in scope. |
| AI output or document prompt injection contaminates trusted review | Treat model/document data as untrusted; schema/citation validation, no autonomous decisions, consent and egress controls, adversarial tests. |
| Scanner noise blocks changes or exceptions persist indefinitely | Triage owner, severity rationale, narrow suppressions with expiry and CI-visible exception register. |
| Accessibility checks pass while workflows remain unusable | Combine axe automation with keyboard/screen-reader/manual task testing and dated evidence. |
| Deployment evidence becomes stale after a change | Tie every artifact to immutable SHA/image digest and invalidate/re-run on relevant changes; enforce release freshness. |
| Repository-only review is misrepresented as certification | Scope disclaimers, independent human signoff, and explicit residual-risk statement in release evidence. |

## Clear done gate

Security and QA is **10/10 for the defined repository/release scope** only when all of the following hold for one candidate commit and its deployment artifact:

1. A clean, reproducible run has exact per-suite counts; README/CI/`.brain` claims are reconciled; and the actual GitHub Actions run is green for that SHA with all required jobs completed.
2. Route/role and CORS matrices pass, including production fail-closed configuration and negative cross-mission access tests; all critical API abuse, upload, export, provenance and model/privacy boundary tests pass.
3. Dependency, secret/history and applicable container scans have current reports; no unaccepted critical/high issue remains; exceptions are owned, time-bounded and approved.
4. Accessibility automation and manual evidence meet the defined acceptance criteria; no unresolved critical accessibility or misleading safety-boundary issue remains.
5. Staging deployment smoke and rollback/recovery drill pass for the exact candidate artifact, or explicitly remain out of scope and block any claim of deployment readiness.
6. Evidence is sanitized, immutable-SHA-linked and fresh; known residual risks are documented; an independent reviewer and accountable release owner sign the evidence index.

Any failed critical check, missing artifact, stale evidence, unresolved count mismatch, absent actual CI result, or unsigned exception keeps the gate **not done**. No score or roadmap gate represents absolute security.
