# OrbitScore FlutterFlow Mobile Client Roadmap

**Area:** FlutterFlow / mobile reviewer client readiness only  
**Checked commit:** `403051612cf6ac026d6a31be7d8ca6b826da2a93`  
**Commit date:** 2026-10-25 03:10:40 +05:30  
**Audit date:** 2026-10-25  
**Current score:** **2.5/10**

## Current score and basis

The repository has meaningful backend and documentation groundwork, but there is no shipped or checked-in FlutterFlow/mobile client in the inspected checkout. The FlutterFlow integration guide describes screens, endpoint usage, authentication configuration, and intended cross-client behavior. A checked-in `backend/openapi.json` exists, FastAPI publishes `/openapi.json`, and an automated test checks generation and the presence of key paths. The React client has a real API wrapper in `frontend/src/api/backend.ts`, including bearer authorization and mission, evaluation, decision, provenance, and export calls. The API persists mission/evaluation/review/provenance data in the backend database, providing a credible shared-state architecture.

However, `git ls-files` and a repository search found no Flutter/Dart files, `pubspec.yaml`, or FlutterFlow project export. There is no evidence in this checkout that a FlutterFlow service/account project has been created, configured, connected to the API, or tested on a device. Thus the documentation and backend contract are readiness inputs, not a mobile product. Score breakdown: **1.0** for backend/API and React shared-state foundation; **1.0** for documented integration and checked-in OpenAPI contract; **0.5** for an existing contract-generation test; **0** for verified FlutterFlow project, auth configuration, implemented reviewer flow, mobile error/offline UX, device evidence, or release/maintenance evidence. These are maturity judgments, not test results.

**Observed vs. unverified:** Repository files and code paths cited below were inspected at the checked commit. No FlutterFlow account/project, deployment, credentials, live API, or physical device was inspected. Their existence/status is **unverified**; do not infer service configuration from the integration guide's word “Ready.” The integration README says FlutterFlow is “Ready,” and `/integrations/status` returns FlutterFlow status `READY`; these are declarative metadata, not evidence of a built or released client.

## Scope

This roadmap is for a focused FlutterFlow mobile companion for human reviewers: authenticate as an authorized reviewer, browse missions and evidence, view deterministic findings/citations, record explicit human decisions with notes, inspect provenance, and understand export readiness. The mobile app is an API client only. It must not evaluate policy, infer approval, or treat cached/local state as authoritative. Backend FastAPI remains the source of truth shared with React.

Out of scope: rebuilding the backend or React UI, adding autonomous decisions, claiming certification/safety approval, and treating synthetic demo evidence as real mission evidence. Follow the repository’s engineering review boundary notice in all relevant screens and release material.

## Definition of 10/10 readiness

A 10/10 means **release-ready and operationally maintained against an explicit, verified bar**, not literal perfection. It requires all of the following:

1. A named, owned FlutterFlow project exists in the service/account with documented environments and recoverable source/export or equivalent change history.
2. Its API calls use the authoritative, reviewed OpenAPI contract and HTTPS production base URL; API contract changes are detectable and reviewed before release.
3. Authentication is secure for the chosen deployment: no committed or embedded shared production reviewer secret, no server/master credentials in client configuration, appropriate credential lifecycle and role restrictions, and verified fail-closed behavior. If the current shared-token backend cannot support secure user-specific mobile credentials, that backend/auth prerequisite must be addressed before production release.
4. A usable reviewer flow covers mission list/detail, evaluation/findings, cited evidence, explicit decision with note, provenance verification, and export lock/readiness. All authoritative data and decisions come from FastAPI.
5. Loading, empty, validation, unauthorized/forbidden, server, timeout, connectivity, and stale/offline states are explicit and safe. Offline behavior is read-only and clearly marked stale unless a separately designed, reviewed synchronization protocol exists; never queue or replay a human decision silently.
6. Contract-parity tests show React and mobile read and mutate the same server-side mission/review/provenance state, and both observe the same export lock result.
7. Automated and manual tests pass on supported iOS/Android targets, including device/simulator network and auth scenarios; accessibility, privacy, and release checks are documented.
8. A controlled release has owner, version/build record, rollback plan, support/maintenance cadence, and a repeatable contract-change process.

## Repository facts and API contract

- Integration guidance: `docs/integrations/flutterflow.md`. It proposes mission list/detail, evaluation, finding decisions, provenance, and export screens; bearer auth; and React↔mobile shared-state checks.
- Integration index: `docs/integrations/README.md`. It describes FastAPI plus SQLite/PostgreSQL as authoritative and calls FlutterFlow ready. That label is not proof of a service-side app.
- API: FastAPI app in `backend/app/main.py`; checked-in schema `backend/openapi.json` identifies API version `1.0.0`. `backend/tests/test_openapi_contract.py` builds `app.openapi()`, asserts essential paths, and writes `backend/openapi.json` when run. **Caution:** this test has a write side effect to that contract file; review the diff and restore/discard unintended generated changes if running it in a working copy.
- Relevant observed paths include `GET /health`, `GET /profiles`, `GET /missions`, `GET /missions/{mission_id}`, `POST /missions/{mission_id}/evaluate`, `POST /missions/{mission_id}/findings/{finding_id}/decision`, `GET /provenance`, and `GET /export/{mission_id}`. The guide’s endpoint for export is consistent with the route in `main.py`.
- `backend/app/auth.py` accepts bearer credentials or `X-API-Key`; viewer/reviewer roles are distinct, and write operations use reviewer authorization. Auth enforcement defaults off outside production unless configured; production is fail-closed by environment/config. The module contains development fallback key strings. Never treat those defaults as production credentials. A bearer-token field in a FlutterFlow project is not itself a secure account/authentication design.
- `backend/app/schemas.py` limits decisions to `APPROVED`, `REJECTED`, and `WAIVED_WITH_NOTE`, with optional `note` and `reviewer`. The integration guide’s informal “Approve, Reject, or Waive with Note” should map exactly to these values; do not invent a bare `WAIVED` payload. Export is locked with HTTP 423 until evaluation and required decisions satisfy backend rules; rejected or unreviewed findings block export.
- `frontend/src/api/backend.ts` is a useful React reference for request paths, bearer header, and export-lock handling. The backend decision route stores a review and appends provenance. This supports a shared-state test plan but does not prove that production React and FlutterFlow are pointed at the same deployed database.
- No FlutterFlow project/account state was observable from Git. Service-side work, app store status, live URLs, key provisioning, and device validation are **unverified**. There is no evidence to assert that production service configuration is already complete.

## Sequenced phases

### Phase 0 — Confirm ownership, target environments, and release boundary

**Deliverables:** Product owner and FlutterFlow project owner; named dev/staging/prod API base URLs; supported iOS/Android targets; reviewer persona and sign-off scope; data sensitivity/privacy review; documented demo-vs-real evidence warning; explicit decision on authentication model and whether backend changes are required.

**Dependencies:** None. Obtain authorization to use the FlutterFlow workspace and backend environments. Treat any pre-existing account/project as unverified until inspected by its owner.

**Acceptance:** A recorded environment matrix names each base URL, TLS requirement, database boundary, and test data set. Production is HTTPS-only. Project/app ownership and access are confirmed without recording secrets in the repository. A reviewer can explain that app findings are advisory deterministic results and that only an explicit human decision submitted to the API constitutes a review decision.

### Phase 1 — Create the FlutterFlow project and app shell

**Deliverables:** FlutterFlow project in the intended account/workspace; mobile navigation and design system; app name, package/bundle identifiers, environments, repository/export backup strategy; screens/shell for sign-in, mission list, mission detail, review, provenance, and export; visible product boundary notice.

**Dependencies:** Phase 0.

**Acceptance:** Project ownership, application identifiers, supported OS versions, and backup/export procedure are documented. A preview build launches on target simulators. No screen labels the tool as a certification or autonomous compliance decision-maker. A source/export snapshot is recoverable by a second authorized maintainer.

### Phase 2 — Import and validate API contract/calls

**Deliverables:** Import the reviewed `backend/openapi.json` into FlutterFlow API Calls (or create equivalent explicitly typed calls if the importer cannot represent required schemas); shared environment base URL; calls for health, profiles, missions, mission detail, evaluation, decision, provenance, and export; typed response/error mappings; contract provenance/version record.

**Dependencies:** Phases 0–1; reachable development API. The documented import path is `backend/openapi.json` / FlutterFlow API Calls > Import from OpenAPI. Verify the service accepts the schema rather than assuming it does.

**Acceptance:** Each configured call matches method, path, path parameter, body, and expected response in the current schema and backend implementation. Run API smoke tests against development for 200s on authorized reads and expected status codes on invalid inputs. Verify simulator networking separately: Android emulator commonly reaches host via `10.0.2.2`; iOS simulator may use `localhost`, but actual networking and TLS must be confirmed in the project/device environment. Do not use HTTP in production. Record importer limitations and manually validate unsupported `oneOf`/security/error schemas.

**Contract maintenance:** `cd backend && python -m pytest tests/test_openapi_contract.py` checks essential paths and regenerates `backend/openapi.json`; it writes the file, so inspect `git diff -- backend/openapi.json`. Also compare `app.openapi()` with the checked-in schema. Treat schema generation as a reviewed artifact, not a blind CI write. Any backend schema/path change triggers mobile call review and tests before release.

### Phase 3 — Authentication, authorization, and session safety

**Deliverables:** Sign-in/token provisioning flow approved for the backend’s actual auth capabilities; secure device storage where supported; bearer header attached to protected requests; explicit logout/credential clearing; 401 and 403 screens; separate read-only viewer and reviewer behavior; no secrets in source, app constants, public app variables, screenshots, logs, or crash reports.

**Dependencies:** Phase 0 auth decision and Phase 2 API setup. Backend authentication may need product/security work: current implementation uses configured static reviewer/viewer keys rather than a documented per-user login/refresh-token lifecycle. Do not launch a shared production reviewer secret in a distributed mobile binary. If no safe credential issuance/revocation mechanism is available, defer production release or implement one server-side.

**Acceptance:** With auth enforced, missing/invalid token yields 401 and cannot reveal protected mission/review data; valid viewer can read but a decision write yields 403; valid reviewer can perform authorized writes. Logout removes locally stored credentials and subsequent requests fail closed. A production build is inspected for embedded test/default/master keys. Only TLS-protected production endpoints are accepted.

### Phase 4 — Implement the minimum human reviewer flow

**Deliverables:** Mission list and refresh; mission detail with cited evidence and human-confirmation indicators; profile selection/evaluation; findings list with state and citations; decision confirmation modal mapping precisely to `APPROVED`, `REJECTED`, or `WAIVED_WITH_NOTE` and requiring an explanatory note for waiver; provenance screen with verification status; export viewer/download state including server-returned lock details. Use server responses as the displayed truth and refetch after writes.

**Dependencies:** Phases 2–3.

**Acceptance:** A reviewer can select a synthetic test mission, evaluate it, inspect a finding and its cited source/locator, submit one supported decision, and reload to observe the server-confirmed state. Waiver without the required product-level note is prevented in UI and rejected/validated consistently by backend policy. A decision is never optimistic-final: show pending submission, then confirmed server response, or revert and show error. Show provenance verification result returned by API; do not claim a client-computed chain is authoritative.

### Phase 5 — Error, loading, empty, and offline safety

**Deliverables:** Reusable states for slow loading, no missions/findings, 401, 403, 404, request validation errors, 409/423 export lock, 5xx, timeout, no connection, retry, and stale cached read data. Network banners and timestamps distinguish cached content from fresh server state. Offline interaction is read-only; decision/evaluation writes are disabled until connectivity is restored and user confirms resubmission.

**Dependencies:** Phase 4.

**Acceptance:** Fault-injection/manual tests demonstrate no duplicate decision on retry, no silent queued/replayed write, no stale cached data shown as current, and no export presented as ready when API returns 423. 423 response details identify pending/unreviewed/rejected findings in a comprehensible state. A recovered connection triggers an explicit refresh; the UI reports whether refresh succeeded.

### Phase 6 — Contract parity and React/mobile shared-state verification

**Deliverables:** Repeatable integration test script or QA protocol using one shared development/staging backend and isolated test mission; evidence capture of React and FlutterFlow observations; documented reset/cleanup procedure. Cross-reference React API wrapper `frontend/src/api/backend.ts` and decision/export tests rather than assuming parity from similar screens.

**Dependencies:** Phases 2–5; React web environment and a shared, disposable backend dataset.

**Critical acceptance tests:**

1. **Same mission read:** Create/seed a uniquely identified test mission through the backend. `GET /missions/{id}` from both clients shows the same mission ID and selected evidence values.
2. **Cross-client decision visibility (mobile → React):** Evaluate the mission; submit a supported decision in FlutterFlow; verify API response and provenance event; refresh React and confirm the same decision/status is visible. Confirm by querying the API, not solely local UI state.
3. **Cross-client decision visibility (React → mobile):** Record a second finding decision in React; refresh FlutterFlow and confirm server-returned state matches. Both directions must be exercised.
4. **Export lock coherence:** Before required decisions are complete, call/view export from each client and verify HTTP 423 with the server’s lock details. After all eligible decisions are complete, verify both clients observe successful export from the same backend. A rejected finding remains a lock, per backend logic.
5. **Provenance parity:** Confirm that a review made from either client appears in `GET /provenance`, and both clients display server-reported verification status. Never infer immutability solely from UI copy.
6. **Role parity:** Viewer credentials can read but cannot decide; reviewer credentials can decide. Both clients display the same 401/403 semantics.
7. **Contract drift:** Regenerate/check `backend/openapi.json`; fail the release checklist if route, body, enum, auth, or error semantics used by the mobile app changed without mobile review and tests.

**Evidence:** Save test date, app build/version, API base URL/environment (no secrets), test mission ID, API status/results, React/mobile screenshots or recordings, and provenance/export outcomes. Clean up the test record safely. These tests are acceptance criteria, not tests claimed as already performed.

### Phase 7 — Device, accessibility, privacy, and release validation

**Deliverables:** CI/build and manual test matrix for supported iOS/Android simulators and at least one physical device of each supported platform; accessibility pass (screen reader labels, focus order, text scaling, contrast, touch targets); privacy/log review; signing and store/internal distribution setup; release notes, support owner, rollback plan.

**Dependencies:** Phases 0–6; platform credentials and authorized test devices.

**Acceptance:** Clean install, authentication, reviewer flow, errors/offline, logout, and cross-client checks pass on the target matrix. No token appears in logs, analytics, crash output, or screenshots. TLS/certificate behavior and app lifecycle/session behavior are validated on-device. Release build identifiers and signing ownership are recorded; tested rollback to prior build is possible. Store submission/release is not considered done until actual distribution status is verified.

### Phase 8 — Operational maintenance

**Deliverables:** Named owner and backup; FlutterFlow change history/export backups; API contract change notification/review workflow; dependency/runtime and OS support review cadence; incident/credential rotation process; release/build evidence archive; support intake and deprecation policy.

**Dependencies:** Phases 1–7.

**Acceptance:** A second maintainer can restore or continue the project from the documented backup. A simulated API contract change is detected, reviewed, and either rejected or released with updated client calls and regression tests. Credential revocation/rotation and rollback procedures are demonstrated. A release checklist is completed for each production version.

## Useful commands and evidence sources

Run repository commands from the checkout root unless noted:

```bash
# Confirm the audited revision and whether the checkout is clean
git rev-parse HEAD
git status --short

# Review the authoritative API contract and the code that defines routes
cat backend/openapi.json
# Inspect backend/app/main.py, backend/app/auth.py, backend/app/schemas.py

# Run the OpenAPI contract test (NOTE: it writes backend/openapi.json)
cd backend && python -m pytest tests/test_openapi_contract.py

# Inspect React's request patterns and existing API behavior
sed -n '1,340p' frontend/src/api/backend.ts

# Search for mobile source/project declarations (expected none at audited commit)
find . -type f \( -name '*.dart' -o -name pubspec.yaml \) -print
```

The integration guide also mentions live `/openapi.json`, `/docs`, and `/integrations/status`. Their current production availability and contents were not checked; verify them against the actual target environment before relying on them. Never paste tokens into shell history, issue trackers, test artifacts, or screenshots.

## Principal risks and mitigations

- **No actual mobile client evidence:** The largest gap. A markdown guide and `READY` labels do not demonstrate a FlutterFlow service/account project, API wiring, build, or store release. Confirm project ownership and obtain preview/device evidence.
- **Shared static reviewer key exposure:** Current backend code compares configured bearer/API keys and contains local fallback key strings. A client-distributed shared key is extractable and difficult to attribute/revoke per user. Establish a secure credential lifecycle and least-privilege model before production; never embed backend/master or third-party secrets.
- **OpenAPI coverage and fidelity:** Contract test checks a list of paths and writes a generated file; this does not prove FlutterFlow imported every request/response/error/security nuance, nor parity with every React call. Add explicit schema-diff and client behavior tests; review body enums, status codes, and auth.
- **Documentation drift:** Integration prose may imply immediate reflection, while clients need refresh/polling or deliberate reload to see changes. Implement visible refresh and validate shared deployed database/environment; never promise real-time updates unless built.
- **Unsafe offline behavior:** Stale findings or queued writes can cause reviewers to believe a decision has persisted. Make offline state conspicuous and prevent silent decision replay.
- **Service/environment mismatch:** Local emulator URLs differ by platform; deployed API may use different host/database/auth configuration. Maintain explicit dev/staging/prod configuration and confirm TLS and persistence.
- **Decision semantics mismatch:** Schema accepts a fixed enum; informal “waive” language can generate invalid or ambiguous payloads. Use exact enum mapping and validate notes and backend export behavior.
- **Review-boundary confusion:** A mobile presentation may overstate deterministic checks or readiness scores. Preserve notices that the tool organizes evidence for qualified human review and is not certification or safety assessment.
- **Data/privacy on devices:** Mission evidence and tokens may be sensitive. Minimize local caching, define cache clearing/retention, prevent secret logging, and assess screenshots, backups, analytics, crash reporting, and lost-device response.

## Clear done gate

Declare the FlutterFlow roadmap **done for a production release** only when all 10/10 definition items are evidenced; Phases 0–8 acceptance criteria pass; the contract is reviewed at the release commit; shared-backend tests pass in both React→mobile and mobile→React directions, including 423 lock coherence and provenance; auth is fail-closed with production-appropriate credential issuance/revocation and no client-embedded shared secret; supported-device tests and privacy/accessibility checks are recorded; and a named owner signs the release, rollback, and maintenance record. Any missing service/account, credential, deployment, or device evidence leaves the score below 10. A preview or documentation-only completion is not a production done gate.
