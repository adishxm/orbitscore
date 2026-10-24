# Provider Integrations Roadmap

**Checked repository commit:** `403051612cf6ac026d6a31be7d8ca6b826da2a93` (requested commit; checked-out `HEAD` matches)  
**Assessment date:** 2026-10-25  
**Area:** External provider integrations only — Agent37, Browser Use, ElevenLabs, Adaption, and astronomy data sources (Space-Track and NASA SPARK/ORDEM).

## Current score: 3/10

**Basis.** OrbitScore has separate provider adapters, typed request/response models, feature-flag/key checks for Agent37, Browser Use, and ElevenLabs, bounded timeouts, candidate-only or presentation-only safety boundaries, a documented Browser Use domain allowlist, and a Space-Track live-fetch path with explicit LIVE/SNAPSHOT/SYNTHETIC data modes. Offline fallbacks and tests exist for selected behavior. This is meaningful integration scaffolding, but it is not evidence of production-grade integrations: no active provider credentials, accounts, successful live calls, or operational monitoring were verified in this repository inspection; current automated checks are predominantly local behavior; Browser Use and ElevenLabs contract and security gaps remain; Space-Track CDM and NASA SPARK are not live feeds in the inspected adapters; and Adaption is a standalone synthetic research workbench rather than an inference provider. The focused integration tests could not be collected in this environment because `scikit-learn` is missing (`ModuleNotFoundError: No module named 'sklearn'`), so even the checked-in mock tests were not independently observed passing here.

A 3/10 denotes implemented, reviewable beginnings and some safety scaffolding, not an assertion that any vendor connection is operational. Provider activation and readiness must be established separately for each provider and environment.

## Evidence and confidence boundaries

Observed code and documentation are not interchangeable with live verification. This assessment separates them as follows:

| Provider/source | Observed adapter or workbench | Local test/evidence status | Live status verified here? |
|---|---|---|---|
| Agent37 | `backend/app/integrations/agent37.py` has remote triage/chat/status paths, a deterministic local fallback, HTTPS host suffix checks for Agent37 endpoints, and a key-plus-flag enable check. Candidates are forced to `human_confirmed=False`. | `backend/tests/test_integrations.py` contains fallback-oriented triage/chat/status tests. Test collection failed here before execution due to missing `scikit-learn`. | **No.** No credential, account ownership, provider-side configuration, or successful live-call evidence inspected. `docs/integrations/agent37.md` describes an instance and live responses and says `AGENT37_ENABLED=1`; the adapter defaults to disabled if not explicitly enabled and keyed. Documentation claims are unverified. |
| Browser Use | `backend/app/integrations/browser_use.py` contains an allowlist check, mock excerpt path, and a live HTTP path with a 15-second timeout. Its flag defaults to off and key must be present. | No provider-specific Browser Use assertions were found in `backend/tests/test_integrations.py`; overall API test import blocked by missing dependency. | **No.** No active key/account or successful live call verified. Documentation's mock behavior and allowlist are not proof of remote behavior. |
| ElevenLabs | `backend/app/integrations/elevenlabs.py` contains approved-review gating, a 2,000-character bound, a mock metadata response, and a live TTS call with a 12-second timeout. Flag defaults off and key must be present. | Tests in `backend/tests/test_integrations.py` cover the reviewed/unreviewed gate path; collection failed here. | **No.** No active key/account or successful TTS request verified. The checked-in request model defaults `opt_in=True`, but the adapter does not inspect `opt_in`; explicit consent must be made effective before launch. |
| Adaption | `ai_ml/adaption_pipeline.py` and `ai_ml/tests/test_adaption_pipeline.py` describe/exercise synthetic offline dataset work and evaluation. `docs/integrations/adaption.md` explicitly says production online inference is not connected and no guaranteed production inference endpoint is established. | Synthetic-only research tests are present but not run in this check. | **No.** Keep research-only; do not add a production path unless a documented, supported inference API and its terms are independently confirmed. |
| Space-Track | `backend/app/integrations/space_track.py` attempts authenticated TLE login when credentials are available, then snapshot fallback, then labeled synthetic TLE. | `backend/tests/test_extended_capabilities.py` has a TLE/conjunction behavior test; not run here. | **No.** Credential availability and a live TLE response were not verified. The inspected `fetch_conjunctions()` always returns hard-coded synthetic screening records, not a live CDM query. |
| NASA SPARK / ORDEM | `backend/app/integrations/nasa_spark.py` returns a hard-coded empirical density table and calculated estimates labeled `SYNTHETIC_ASSUMPTION`; no HTTP/provider client is present in that module. | `backend/tests/test_extended_capabilities.py` tests density/flux behavior; not run here. | **No.** No live data source/API connection verified; do not describe the current adapter as live SPARK ingestion. |

`.env.example` has blank Space-Track credentials, an empty Agent37 key despite `AGENT37_ENABLED=1`, and no Browser Use or Adaption configuration. It names `ELEVENLABS_API_KEY`, whereas the ElevenLabs adapter reads `XI_API_KEY`. These are template contents, not proof of deployed environment state. Never infer secrets, provider accounts, or live calls from documentation, sample environment files, endpoint names, or mock outputs.

## Scope and 10/10 definition

This roadmap covers the integration boundary between OrbitScore and external providers/data sources: credential lifecycle, consent and data minimization, destination controls, provider request/response contracts, quotas and cost limits, timeouts/retries, idempotency, auditability, error behavior, freshness/provenance, live and offline tests, and operational release gates. It does **not** grade the deterministic policy engine, general application security, front-end quality, or the scientific validity of underlying regulatory/astrodynamics models, except where these rely on provider data.

**10/10 for this area means mature and auditable readiness, not literal perfection:** every enabled provider has an explicitly approved use case and data flow; server-side least-privilege secrets with rotation and environment separation; recorded consent and minimum necessary payloads; enforced endpoint allowlists and spend/request budgets; versioned validated contracts; bounded timeouts, safe retry and idempotency behavior; useful redacted audit/metrics; deterministic fail-closed or clearly marked fallback behavior; contract/unit/security tests plus controlled live smoke/integration evidence; documented freshness, lineage, outage and revocation procedures; and independent release approval. Providers not meeting these criteria remain disabled. Research-only workbenches do not gain production status by existing in the repository.

## Sequenced phases

### Phase 0 — Establish verified baseline and resolve contract inconsistencies

**Deliverables**
- Maintain a provider inventory per environment recording state as one of: adapter present; mock tested; disabled; credentials configured; account/tenant verified; live call succeeded; operationally accepted. Record evidence timestamps without storing secrets.
- Align configuration naming and defaults. Reconcile `ELEVENLABS_API_KEY` in `.env.example` with adapter `XI_API_KEY`; remove misleading examples that enable a provider while its key is blank, or document the exact fail-closed behavior. Keep production remote providers disabled absent explicit approval.
- Correct provider docs that imply an active instance, successful live integration, or current enabled state without dated, reproducible evidence. Mark those claims “unverified” until substantiated.
- Inventory routes, permission checks, provider inputs/outputs, and provenance events for all named providers and astronomy sources.

**Dependencies:** None.  
**Acceptance tests / evidence**
1. A sanitized config/status report for each deployment shows flag, key-present boolean (never key value), configured destination, environment, and live evidence timestamp; unknown values report unknown, not configured.
2. With no keys, all optional cloud providers remain disabled and make zero outbound requests. CI asserts this with HTTP interception.
3. Config tests reject conflicting/legacy names or normalize them unambiguously; docs and `.env.example` match actual adapter variable names and defaults.
4. Record current baseline test result. Re-run focused tests after installing declared dependencies using `python -m pytest backend/tests/test_integrations.py backend/tests/test_extended_capabilities.py -q` from repository root; install requirements as required by project instructions. Do not call tests passed until execution succeeds.

### Phase 1 — Define trust boundary, consent, and provider-specific contracts

**Deliverables**
- Versioned internal provider contracts and per-provider data-flow/retention tables. Define accepted request fields, maximum lengths/sizes, normalized response shapes, required provenance fields, enum/value constraints, and explicit provider API version assumptions.
- Agent37: define triage input as reviewer-supplied, permission-checked excerpt only; exclude raw documents and irrelevant mission identifiers. Validate returned JSON against strict schemas; reject unknown fields, malformed numbers/units, invalid confidence, missing/incorrect quotes, and oversized responses. Treat every output as untrusted candidate data.
- Browser Use: define public-page capture only; limit methods to non-mutating read/extract. Enforce HTTPS-only (unless a narrowly approved exception), redirect re-validation, hostname/IP resolution protections against private/link-local/loopback destinations, and configured API endpoint host validation. Do not send mission excerpts or private data to browser provider. Reconcile source-register entries with the runtime allowlist.
- ElevenLabs: make opt-in explicit and enforce it; obtain narration text from server-side reviewed finding state rather than trusting caller-supplied `reviewed_text` as authoritative. Document exactly which reviewed text leaves OrbitScore, retention/voice implications, output handling, and opt-out/revocation behavior. Keep max text bound and prohibit personal or confidential content unless specifically approved.
- Adaption: freeze production integration scope at **research-only**. Require documented vendor inference API, security/data-handling terms, supported latency/availability contract, and approved data class before any proposal to connect it online.
- Space-Track: version and validate TLE, snapshot, and CDM schemas independently. Do not label fabricated conjunction values as real CDMs. NASA SPARK/ORDEM: document table source/version/date, units and assumptions; preserve synthetic/empirical labels. Any future external dataset path requires source identity, license/terms, retrieval timestamp and content hash.

**Dependencies:** Phase 0 inventory.  
**Acceptance tests / evidence**
1. Contract/schema tests reject invalid/missing fields, non-finite numbers, wrong units, oversized provider bodies, and unexpected provider content; valid fixtures round-trip to internal models.
2. Consent tests prove ElevenLabs makes no outbound request when opt-in is false or absent; remote dispatch is impossible for unreviewed findings and caller-edited text cannot bypass server-side review state.
3. Browser Use tests reject user-info URLs, unsupported schemes, suffix-confusion hosts, redirects off allowlist, private/reserved IP targets, and unapproved API base hosts before any request.
4. Agent37 tests prove all successful, malformed, and fallback results remain `human_confirmed=False`; exact_quote must be a literal substring of the submitted excerpt before any candidate is accepted.
5. Metadata and UI/API responses distinguish `LIVE`, `SNAPSHOT`, `SYNTHETIC`, and `SYNTHETIC_ASSUMPTION` unambiguously; no synthetic output is presented as a provider response.

### Phase 2 — Harden authentication, secrets, budgets, and outbound controls

**Deliverables**
- Store production credentials only in the deployment secret manager; use separate least-privilege credentials per environment, rotation/revocation runbooks, startup validation, and redaction. Never log headers, key values, raw excerpts, narration text, or sensitive provider bodies.
- Implement a shared outbound policy with HTTPS and hostname allowlists per provider, DNS/IP checks where relevant, redirect restrictions, TLS verification, egress controls where deployable, and bounded response sizes. Agent37 currently has host suffix checks for its endpoint; extend and test boundary behavior. Browser Use currently accepts an arbitrary `BROWSER_USE_API_URL` and checks target URLs for HTTP or HTTPS; constrain both.
- Add provider-specific daily/monthly request and cost/character caps, per-user and per-mission rate limits, concurrency limits, and kill switches. Set explicit ceilings before enabling; enforce locally even if vendor quotas are also configured. Alert on threshold and near-exhaustion.
- Align secret names and ensure deployment configuration is checked at startup without leaking values. For Space-Track, store credentials in secret manager; avoid retaining cookies beyond the request/session scope.

**Dependencies:** Phase 1 data-flow approval.  
**Acceptance tests / evidence**
1. Secret scanning and client bundle scans show no provider key, authorization header, or secret-bearing config in tracked files, built assets, responses, logs, or traces.
2. Tests verify malformed credentials, missing flags, unsafe hosts, invalid TLS, and exceeded budgets fail closed before dispatch.
3. Budget tests at exact limit and limit-plus-one prove no extra calls are made; operator kill switch stops dispatch immediately.
4. Redaction tests inject fake secrets and sensitive payload markers into exception paths and assert none appear in captured logs.
5. Deployment evidence records secret owner, rotation date, environment, authorized vendor account, quota configuration and outbound network policy; do not claim completion based on `.env.example`.

### Phase 3 — Reliability, idempotency, audit trail, and failure semantics

**Deliverables**
- Use a standard outbound client with connect/read/total timeouts, bounded response reads, cancellation, correlation IDs, and provider-specific retry classification. Retry only safe transient failures with bounded exponential backoff/jitter and total deadline; avoid retrying authorization, validation, or non-idempotent generation requests without a stable idempotency key or explicit vendor guarantee.
- Add idempotency keys for user-triggered triage/capture/narration as appropriate; cache/deduplicate only when privacy, freshness and billing semantics allow. Prevent retries from causing duplicate paid TTS/agent work.
- Define visible failure states: deterministic local candidate fallback only where it is safe and clearly marked; otherwise return unavailable/error without fabricated success. No fallback can become authoritative. Space-Track snapshot fallback must include age/fetched-at and stale-data limit; older snapshots must be explicitly stale or rejected. Conjunction data must remain synthetic screening until a real supported CDM source is implemented.
- Append provenance/audit events for remote dispatch and completion/failure with provider, operation, timestamp, correlation/idempotency identifiers, data mode, source hash/URL where safe, outcome, latency, and candidate count/character count. Do not include secret or raw sensitive contents. Clarify whether existing claimed `agent37_triage_executed` event is actually emitted by route code; prove it with tests before relying on documentation.
- Add service metrics for calls, latency, failures, retries, budget usage, mode/fallback, validation rejects and freshness; restrict sensitive dimensions and avoid high-cardinality/user-content labels.

**Dependencies:** Phases 1–2.  
**Acceptance tests / evidence**
1. Fault-injection tests cover timeout, DNS/TLS failure, rate limit, 4xx/5xx, malformed JSON, oversized payload, provider outage, cancellation, and retry exhaustion; assert bounded completion and correct outcome.
2. Repeat same idempotency key twice and assert one billable upstream operation (or documented provider semantics) and stable response semantics.
3. Tests prove fallback responses are marked fallback/synthetic, never `SUCCESS` from a mock, never alter evaluations/reviews, and never erase provider failure evidence.
4. Audit chain verification passes after success, disabled, rejected, validation failure, timeout and retry outcomes; audited payloads contain no secret or raw excerpt.
5. Stale Space-Track snapshot threshold tests and synthetic-vs-live labeling tests pass; NASA SPARK synthetic baseline remains transparently labeled.

### Phase 4 — Provider-specific contract suites and controlled live verification

**Deliverables**
- Maintain deterministic offline tests with mocked HTTP transports that exercise both provider request shape and actual response parsing, not only local fallback behavior. Use sanitized, vendor-approved fixtures and version each fixture.
- Agent37 live test suite: authentication, expected API endpoint/payload, response schema, candidate quote validation, usage capture, timeouts, and no-decision-rights invariant. Pilot on non-sensitive synthetic excerpts only.
- Browser Use live test suite: one approved public source, one blocked hostname, redirects, extraction-size bounds, provider API authentication, source URL/locator completeness and no private data transmission. Public capture must remain candidate evidence.
- ElevenLabs live test suite: authorized synthetic or approved reviewed text, explicit opt-in, approved voice, audio content type/size validation, transcript correspondence, review gate, quota accounting, and deletion/retention policy. Do not use real confidential findings in initial verification.
- Space-Track live TLE smoke test only with an authorized account and safe test object, validate returned NORAD ID, epoch, TLE checksum/format, freshness, and snapshot persistence. No live CDM readiness claim until a documented endpoint, credentials/access path, schema and separately tested implementation exist.
- NASA SPARK/ORDEM: treat public downloadable/reference artifacts as versioned offline datasets unless an official supported API/source is documented and operationally tested. Validate units, provenance, update process and applicable license before calling any path an integration.
- Adaption: research reproducibility suite only (synthetic corpus, deterministic split, dataset hash and held-out metrics); no production dispatch, no inference flag enablement based solely on an API key name.

**Dependencies:** Phases 0–3, vendor-approved test access and credentials; provider accounts remain a prerequisite, not an assumed fact.  
**Acceptance tests / evidence**
1. CI passes focused provider tests plus full backend/AI-ML suites in a dependency-complete environment. Example commands: `python -m pytest backend/tests/test_integrations.py backend/tests/test_extended_capabilities.py -q`; `python -m pytest backend/tests`; `python -m pytest ai_ml/tests`.
2. Mock transport asserts exact URL, method, auth mechanism (redacted in evidence), required headers, request schema, and response contract per supported API version; unexpected schema changes fail tests closed.
3. Live smoke evidence is time-stamped, environment-scoped, redacted and reproducible: provider status/operation, response validation outcome, latency, data mode, and source/test fixture—never secrets or sensitive content. Repeat on a cadence and after contract/config changes.
4. A live smoke result demonstrates connectivity only; separate evidence must demonstrate account authorization, terms/privacy approval, budget configuration, failure handling and operational ownership.
5. Do not mark an integration active unless live success is demonstrated under that environment's current configuration. Keep live CI opt-in and isolated from ordinary pull requests to avoid accidental disclosure and billing.

### Phase 5 — Production readiness, staged release, and ongoing assurance

**Deliverables**
- Per-provider release dossier: approved purpose/data class, owner/on-call, account and secret rotation evidence, consent UX/policy, spend ceilings, outbound policy, contract tests, recent live smoke evidence, SLO/error budget, incident procedures, vendor change monitoring, retention/deletion plan, and rollback/disable switch.
- Stage each provider independently (local mocks → isolated integration environment using synthetic data → limited opt-in pilot → broader enablement only after review). Default off until the provider's gate is approved. Keep Adaption research-only unless it independently satisfies a future API confirmation and review gate.
- For astronomy sources, provide user-visible source time/version/freshness and clear distinction between operational external data, stored snapshot, empirical reference table and fabricated synthetic scenario. Do not let provider feeds substitute for qualified operational conjunction assessment or regulatory review.
- Schedule periodic review of keys, terms, quotas, allowlists, schemas, privacy scope, dependency versions and external API changes; verify incident response and revocation drills.

**Dependencies:** Phases 0–4 and formal product/security/privacy/engineering approval.  
**Acceptance tests / evidence**
1. Release checklist is complete and signed per provider/environment; no blanket “all integrations live” status substitutes for individual proof.
2. Staging outage exercise proves alerts, safe user-facing failure, budget stopping, fallback labeling and rapid kill switch. Key revocation exercise proves dispatch stops and no secret appears in logs.
3. Monitoring dashboard reports availability, validated-success rate, p95 latency, errors, retries, quota/cost, freshness and fallback rate with agreed thresholds and alert recipients.
4. Production access review verifies least privilege; rotation and rollback drills meet documented recovery objectives.
5. Quarterly or vendor-change re-verification shows no undocumented scope expansion, data sharing or schema drift.

## Cross-cutting measurable acceptance targets

- **Default safety:** 100% of optional remote-provider calls are blocked when disabled, unconfigured, unconsented, over budget, or outside the destination allowlist.
- **Data integrity:** 100% of Agent37 and Browser Use extracted values remain unconfirmed; 100% of TLE/CDM/reference outputs carry truthful source and mode labels; no provider response can directly alter policy evaluation or human review decisions.
- **Contract quality:** 100% of upstream response bodies are size-bounded and validated before use; invalid responses fail closed or enter an explicitly labeled safe fallback.
- **Reliability:** Each provider has tested bounded total time, retry policy, duplicate-call behavior, cancellation and outage behavior; service-level objectives are defined from pilot measurements rather than invented in advance.
- **Audit/privacy:** Every provider dispatch has a redacted trace/audit outcome; zero secrets or prohibited raw private content in logs, traces, client assets or test artifacts.
- **Evidence:** Each production-enabled provider has current successful live-call evidence for the deployed environment; the absence of evidence means “unverified/disabled,” not “configured.”

## Priority risks and mitigations

1. **Docs overstate activation:** Agent37 docs describe an active instance and enabled flag, while checked-in code defaults to disabled and requires a key; the example key is blank. Treat live configuration/status statements as unverified until environment-specific evidence exists.
2. **Consent and text source mismatch:** ElevenLabs request accepts `opt_in` and caller-supplied `reviewed_text`, while the adapter does not enforce opt-in. Gate on persisted server-side review/consent records, not caller assertions.
3. **Browser egress and SSRF exposure:** Target URL allowlist currently permits HTTP and matching subdomains; redirects and resolved private IPs are not visibly rechecked. API base URL is environment-configurable without a provider-host allowlist in the inspected adapter. Fix before live enablement.
4. **Provider response trust:** Agent37 parser normalizes some malformed output and accepts arbitrary field labels/quotes without proving quote text occurs in the excerpt; strict validation and field allowlists are required.
5. **Cost and duplicate paid requests:** Timeouts exist, but explicit cost budgets, rate limits and idempotency were not observed. Retries or user repetition could incur repeat charges.
6. **Misleading fallback and audit claims:** Mock values can resemble genuine regulatory excerpts; distinguish synthetic/mock responses from captured provider data in every API/UI/provenance path. Documentation claims provenance events for Agent37 must be verified in route implementation and tests.
7. **Astronomy freshness and operational misuse:** Space-Track snapshot/synthetic paths and hard-coded synthetic CDM examples can appear operational if mode labels are lost; NASA SPARK adapter is an empirical hard-coded table, not a live feed. Enforce age/source labels and non-operational disclaimers.
8. **Dependency/test blind spot:** The focused test collection failed because `scikit-learn` is absent in this environment. Establish dependency-complete CI evidence before relying on these tests.
9. **Adaption API assumption:** Existing docs explicitly say no guaranteed low-latency production inference endpoint is established. Keep it out of production inference until confirmed through official API documentation and security/contract review.

## Clear done gate

This roadmap is complete only when **all applicable Phase 0–5 acceptance checks pass and are evidenced per provider and deployed environment**, with a dated sign-off from integration owner plus security/privacy/product reviewers. In particular: current credentials/accounts must be independently verified without exposing secrets; each enabled provider must have successful, validated live-call evidence and tested outage/budget/consent/allowlist behavior; mock and live paths must never be confused; astronomy data freshness and provenance must be visible; production flags remain off for providers lacking evidence; and Adaption stays research-only unless a documented supported inference API is confirmed and separately approved. Any failed or stale gate returns that provider to disabled/unverified. Passing this gate establishes a strong, auditable 10/10 readiness target for the defined scope—not literal perfection, guaranteed provider availability, or certification/safety authority.
