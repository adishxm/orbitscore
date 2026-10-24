# Frontend Roadmap: Simple, Easy Mission Evidence UX

**Area:** Frontend (canonical React application)  
**Repository:** `/tmp/orbitscore-check-20261025`  
**Checked commit:** `403051612cf6ac026d6a31be7d8ca6b826da2a93`  
**Commit date:** 2026-10-25  
**Roadmap observation date:** 2026-10-25  
**Worktree at inspection:** clean  
**Current UX score:** **5.5 / 10** (reasoned product assessment, not a measured user-study result)

## Executive assessment

OrbitScore already has substantial engineering behind the UI: explicit source locators and evidence states, deterministic checks, stale-result signaling, human decisions, and an export gate. The main gap is not a lack of features or visual polish. The canonical landing page and workspace present too many concepts, choices, and stages at once for a user whose stated priority is a simple, easy web experience. Simplify the user's path and language while preserving the controls that make evidence traceable and decisions human-owned.

The two supplied Unstop screenshots show a form with many consecutive long-text fields, dense pasted content, and explanatory helper text. They are useful as evidence that straightforward labels, visible instructions, and ease of completion matter to the requester. They are not evidence for copying a long form, and they do not establish OrbitScore's existing user behavior or requirements. No user study or runtime usability observation was supplied.

## Score and basis

**Score: 5.5/10.** This is an explicit, qualitative current-state score for the priority “simple and easy web UX,” not an overall engineering quality or safety score. Weighted rubric:

| Dimension | Weight | Current estimate | Observed basis |
|---|---:|---:|---|
| Clear entry point and information architecture | 20% | 5/10 | Root app routes include five informational pages plus mission list/workspace aliases; header has five links and a demo CTA. Landing is a very long, sectioned product explainer. |
| First-run guidance and task completion | 20% | 5/10 | Landing CTA opens a fixed demo. Missions page presents two fixtures but says “initialize a custom mission configuration”; no initialization control is present in that page. No observed task-oriented first-run guidance or empty-state flow. |
| Workflow simplicity and progress | 20% | 4/10 | Workspace exposes six selectable stages in `Stepper`; stage state initializes to `evidence`, while `completedSteps` is derived in a way that pre-adds `context`. Users can click stages directly, including gated downstream ones. |
| Source visibility and trust | 15% | 7/10 | Fixtures carry source titles, references, dates, page/section locators, and evidence state; `SidePanel` is source-aware and tests assert conflicting-source details. This is strong underlying affordance, but exposed primarily after selecting a row. |
| Accessibility, responsiveness, motion optionality | 15% | 6/10 | Skip link, mobile drawer, reduced-motion hook, responsive CSS, and axe tests exist. Runtime behavior at narrow widths, keyboard operation of all controls, motion/3D optionality, and performance are not demonstrated by static tests. |
| State clarity and predictable persistence | 10% | 4/10 | Zustand persistence starts in mock mode. In live mode evaluation and review submission are asynchronous side effects after local state is committed; field/context/issue/counterfactual/export workflows are not clearly wired as one server-authoritative lifecycle in the inspected store/page. |

The weighted result is rounded to the nearest half point. It reflects directly observed implementation, with deductions for complexity and incomplete server authority—not aesthetic preference.

## Scope

In scope: canonical React frontend route structure, global navigation, landing and mission selection, first-run/demo flow, mission workspace stages and language, source/citation discoverability, responsive and accessible interaction, reduced-motion and non-WebGL options, frontend-to-backend state ownership, and UX validation. The intended review files include `frontend/src/App.tsx`, `pages/LandingPage.tsx`, `pages/MissionWorkspacePage.tsx`, `components/common/Header.tsx`, `components/workspace/Stepper.tsx`, `store/useOrbitStore.ts`, `api/backend.ts`, and frontend tests.

Out of scope: redesigning backend/domain policy, changing engineering acceptance criteria, authorizing autonomous engineering decisions, asserting regulatory compliance, or delivering a new orbital-scoring claim. Visual styling is in scope only when it improves comprehension, accessibility, or task completion. Do not remove safety messaging or make evidence provenance less visible in order to reduce screen content.

## Definition of 10/10 for this roadmap

“10/10” means the frontend meets the measurable criteria below for the agreed representative user tasks and supported browsers/devices, and no known critical usability/accessibility/safety-boundary defect remains at release review. It is an operational quality bar, **not literal perfection**, a guarantee of regulatory compliance, or proof that every user will find the experience easy.

1. A first-time representative user can state what the product does and does not do, identify synthetic demo data, and enter the demo workspace without needing to interpret internal subsystem terminology.
2. For the core path—open demo, inspect a cited record, understand a finding, record a human decision, and understand why export is allowed/blocked—the interface guides users with a compact progress model and clear next action. Expert users retain direct navigation and review detail; the interface does not falsely imply an incomplete task is complete.
3. Each displayed evidence value can be connected to its source title/reference, revision/date when present, locator, verification state, and conflicts without guessing or losing the surrounding task context. Missing source fields are shown as missing, never silently inferred.
4. Mock/demo versus live API state and save/evaluation outcomes are explicit. Mutations claimed as saved or evaluated have server confirmation; failed requests cannot appear successful, and stale findings remain visibly stale. Destructive/reset actions are deliberate and understandable.
5. Core flows work by keyboard, screen reader semantics, touch, and reflow at 320 CSS px through desktop widths; no horizontal page overflow; color is not the only state cue; reduced-motion settings avoid nonessential animation; 3D/WebGL is optional with a useful static alternative.
6. Validation across moderated/unmoderated representative tasks achieves at least 90% task completion without facilitator intervention, median core-path completion under 3 minutes after first entry, at least 4/5 ease rating, and no critical safety-boundary misunderstanding in the tested sample. Baselines and sample sizes must be recorded; these are release targets, not existing results.

## Current observed facts and evidence locations

- **Routing:** `frontend/src/App.tsx` routes `/`, `/how-it-works`, `/profiles`, `/about-limits`, `/status`, `/missions`, `/missions/:id`, plus duplicate `/app/missions` aliases and wildcard 404. Header (`components/common/Header.tsx`) links Overview, How It Works, Profiles & Rules, About Limits, System Status, plus Asteria-3 Demo. This creates six top-level navigation destinations/actions before workspace entry.
- **Landing:** `pages/LandingPage.tsx` begins with a lazy cinematic experience, HUD, hero, spacecraft canvas, and a demo CTA. Subsequent sections include challenge/solution, “Two Steps,” a six-stage interactive lifecycle, subsystem telemetry, five evidence states, traceability and further product material. The landing-page test checks key content, interactions, and axe; it does not establish that a new user can efficiently find the first action.
- **Workspace:** `MissionWorkspacePage.tsx` contains context, evidence, profile, findings, review, and export rendering branches; top actions include Agent 37 Copilot and Reset Demo Data. Context updates use direct `useOrbitStore.setState` in the page. `Stepper.tsx` renders six clickable steps. On first mount `currentStep` is `evidence`, despite the six-stage framing; completion is partly inferred from local evidence/check/decision presence. Navigability and completion semantics need product decisions and tests.
- **Evidence:** `fixtures/asteria-3.ts` demonstrates fields including `source_doc_title`, `source_doc_ref`, source date, page, locator, evidence state, notes, and conflicting source value. `workspace-flow.test.tsx` verifies a citation/conflict in `SidePanel`, search/state filtering, local human confirmation, and axe. The fixture is synthetic and must remain identified as such.
- **State/API:** `useOrbitStore.ts` persists local mission, evidence, check, decision, and issue state; initial `apiMode` is `mock`. `runChecks` always executes local `executeProfileChecks` and, when live/connected, fires `evaluateMissionLive(...)` asynchronously but discards its response and does not replace the displayed run. `recordDecision` updates local state first and submits live asynchronously; failure only logs a console error. The page's mission-context edit bypasses store actions and persistence semantics via direct `setState`. `addEvidenceItem`, `updateEvidenceItem`, `confirmEvidenceItem`, and `deleteEvidenceItem` mutate local state; no corresponding evidence mutation call appears in the inspected `backend.ts` API client. Issues are local. Counterfactual UI exists, and an API helper `runCounterfactualLive` exists, but wiring is not established by the reviewed page/store excerpts and must be verified. `fetchExportLive` exists, but the shown workspace uses `ExportPacketView` and no live export call is evident there. These are specific inspection gaps, not claims that no backend endpoint exists.
- **Accessibility/motion:** App shell has a skip link; Header closes mobile drawer on route change and Escape. Landing and SpacecraftCanvas use `useReducedMotion`. `SpacecraftCanvas` still mounts Three.js render loop when WebGL is supported and has fallback handling if unavailable; reduced motion disables selected movement, not the WebGL canvas itself. Landing test contains axe; workspace test contains axe. These are useful baseline checks, not proof of full WCAG conformance, cross-browser correctness, or that motion is optional.
- **Test/build commands:** `frontend/package.json` defines `npm test`, `npm run build` (typecheck + Vite build), `npm run lint` (TypeScript check), and `npm run lint:banned-words`. README documents frontend tests and build. Current test count in README is a repository claim (85 frontend tests/12 suites) and was not independently run for this roadmap; do not treat it as a test result for this inspection.
- **Unverified:** No browser-based performance measurements, production API connection, screen-reader session, device matrix, analytics, usability baseline, task completion or completion-time data were available. Validate rather than assume.

## Sequenced phases

### Phase 0 — Establish UX and safety baselines

**Goal:** Understand the current experience before simplifying it, and fix shared language/measurement decisions.

**Deliverables:**
- Inventory routes, navigation entries, core tasks, states, cross-links, and repeated/redundant information. Agree which destinations are primary versus contextual/help.
- Define target user cohorts (e.g., student project lead and experienced smallsat engineer), representative task scripts, plain-language glossary, synthetic/demo content rules, and non-negotiable safety boundaries.
- Add a UX measurement plan and baseline: find-demo time, task completion, errors/backtracks, ease score, source-understanding accuracy, export-boundary understanding, and abandonment.
- Audit current state transitions and document mock/live semantics and API operation coverage before deciding what can be combined.

**Dependencies:** Product/design and engineering review; no code prerequisite. Maintain traceability to current route/store/test evidence above.

**Acceptance:** Baseline records task definition, participant/device/browser, sample size, and observations. Every proposed removed/merged screen or action is mapped to a preserved safety control or explicitly shown not to affect it. No success metric is claimed from screenshot review alone.

### Phase 1 — Simplify information architecture and landing entry

**Goal:** Put the simple first action ahead of the product tour; preserve deeper explanations as optional help.

**Deliverables:**
- Establish a compact primary navigation centered on “Workspace” (or equivalent), “How it works,” and “About evidence & limitations”; move status, rules/profiles, and advanced material to contextual links or a secondary/help area based on user research.
- Normalize `/missions` and `/app/missions` behavior (redirect/alias decision), label active navigation accessibly, and keep a clear route back to workspaces.
- Rework landing hierarchy around one plain-language promise, one primary “Open demo workspace” action, explicit “synthetic demo” label, and a short “what it is / is not” boundary. Offer cinematic/technical detail lower on page or behind an optional tour; do not force the cinematic experience before first action.
- Correct mission list promise: either implement and validate custom mission initialization or remove the unsupported “initialize” claim. State plainly that the listed workspaces are synthetic fixtures.
- Ensure a no-WebGL or disabled-cinematic path exposes the same primary CTA, essential product purpose, and truth-in-advertising boundary.

**Dependencies:** Phase 0 navigation and content decisions. Keep existing informational pages reachable until replacement content is approved.

**Acceptance:** In a first-click test with at least 10 representative first-time participants, at least 9 find and explain the demo entry point within 15 seconds without assistance. At least 9/10 correctly identify the demo as synthetic and know OrbitScore does not certify or make flight decisions. No core page requires the cinematic module to load before its main content is usable. Route smoke tests cover all canonical routes, aliases, and 404.

### Phase 2 — First-run orientation and guided workspace entry

**Goal:** Make the first minute self-explanatory without turning expert review into a simplified but misleading wizard.

**Deliverables:**
- On first demo entry, show a dismissible, concise orientation: what data is synthetic, how to inspect a source, what automated findings mean, and that only qualified humans make review decisions. Provide “Start with sample evidence” and “Explore workspace” routes as appropriate.
- Present the next useful action and status summary: evidence needing attention, whether checks have been run, whether results are stale, review actions outstanding, and export blocked/ready state, each with a deep link.
- Introduce contextual empty/error/loading states (no mission, no records, unavailable API) and a clear way to recover. Avoid silently substituting the Asteria fixture for an unknown mission ID: show not-found or explicit demo fallback.
- Make reset a deliberate demo-only action with confirmation and state scope explained; do not imply persisted/live data is reset if only the local fixture is restored.

**Dependencies:** Phase 0 task definitions and Phase 1 IA; API status model from Phase 5 must be represented accurately.

**Acceptance:** At least 9/10 first-time test participants can explain synthetic status, locate a source record, and state their next action after orientation. Unknown mission IDs never render Asteria content under the wrong route identity. Reset tests verify only documented fixture data changes and that a user can cancel.

### Phase 3 — Reduce perceived workflow stages, clarify progress and safety gates

**Goal:** Reduce the amount of navigation users must understand while preserving distinct deterministic checks, human review, and export controls.

**Deliverables:**
- User-test a compact task-oriented progress model (candidate: **Prepare evidence → Review findings → Export packet**) with context/profile setup surfaced only when needed. Keep underlying domain stages and audit records intact; do not merge automated findings and human decisions into one ambiguous approval action.
- Derive progress from authoritative state and named prerequisites. Mark steps unavailable with an explanation where prerequisites are absent; allow revisiting completed stages without representing them as proof of completion.
- Replace “Proceed to Profile Gate” and subsystem-heavy copy with a clear next action plus reason, using “automated consistency checks” and “human review” terms. Explain why a gate blocks progress. Retain access to expert details and exact rule/profile identity.
- Remove or demote secondary workspace distractions (Copilot, counterfactual lab, orbital/readiness panels) from the core path unless users ask for them; retain explicit labels and safe separation if present.
- Keep “Score” naming boundary clear; do not visually elevate a readiness index so it appears to be a certification or overall safety verdict.

**Dependencies:** Phases 0–2; safety/product owner approves mapping from domain stages to user-visible progress.

**Acceptance:** Representative users complete the core path at 90%+ without facilitator intervention and median under 3 minutes after first entry; no participant mistakes automated findings for human approval in validation sample. Automated tests cover all allowed transitions, blocked transitions, stale check state, decisions, and export lock conditions; no export path bypasses human gate.

### Phase 4 — Source visibility, record clarity, and error prevention

**Goal:** Make the evidence trail understandable at the point of use, not hidden behind expert-only inspection.

**Deliverables:**
- Show compact citation provenance in evidence rows/cards (source title/reference, date/revision, locator, verification state), with a detail panel for full metadata and conflicting source values. Provide direct navigation between a finding and its relevant evidence and back without losing filters or position.
- Distinguish source citation, extracted/entered parameter, human confirmation, rule/profile reference, and synthetic illustrative content. Missing, stale, conflicting, unconfirmed, or unavailable source metadata remains explicit; never fabricate a locator.
- Use plain-language state labels with stable visual + textual indicators, descriptions, and actions. State changes requiring human authority remain explicit human actions with reviewer attribution and rationale as required.
- Make citations keyboard/touch accessible and ensure mobile detail presentation does not obscure primary task context.

**Dependencies:** Phase 3 user-facing step model; coordinate exact source fields with domain/API schema owners.

**Acceptance:** In a source-finding task, at least 9/10 participants locate the supporting source and correctly identify its verification state within 30 seconds. 100% of visible fixture source values in tests map to stored source fields; absent values render an explicit absent state. Automated integration tests verify conflict details, direct finding-to-evidence linking, and stale/unconfirmed labels.

### Phase 5 — Server-authoritative state and explicit sync semantics

**Goal:** Make the interface truthfully reflect server-confirmed data and avoid optimistic local success in live mode.

**Observed wiring gaps to close:**
1. `runChecks` computes and stores local `executeProfileChecks` results first; live `evaluateMissionLive` is fire-and-forget and its response is discarded. Therefore the displayed run is not currently shown to be the backend evaluation result in live mode.
2. `recordDecision` commits the local decision before `submitReviewDecisionLive`; failure logs to console but does not roll back/mark UI state failed.
3. Mission-context editing in `MissionWorkspacePage.tsx` directly calls `useOrbitStore.setState`, bypassing an action boundary and no observed live save path.
4. Evidence add/edit/confirm/delete and issue add/status changes update Zustand locally; the inspected `backend.ts` exposes no matching evidence/issue mutation helper. Confirm API support or label these operations as demo/local-only in live mode—never imply server persistence.
5. API client exposes `fetchMissionsLive`, `fetchMissionLive`, `fetchProfilesLive`, `runCounterfactualLive`, and `fetchExportLive`; no corresponding use is evident in the reviewed page/store flow. Verify full repository wiring and connect the selected authoritative operations or remove misleading live affordances.
6. API mode starts as `mock`, and persisted store includes `apiMode`; establish reliable mode/connection state, prevent stale persisted “live” mode from implying a current connected session, and visibly label demo/local-only versus connected data.
7. Provenance sync catches errors and keeps local verification state. Distinguish “last verified” from unknown/offline; local default provenance must not appear server-verified without a real verification result.

**Deliverables:**
- Define an operation matrix by entity and mode: read, mutate, evaluate, decide, issue, counterfactual, export, provenance. Document which mode is authoritative and how offline behavior works.
- Route all writes through typed store/service actions. In live mode, apply server response only after success (or explicitly mark pending, then reconcile); on failure retain truthful unsaved/error state with retry and prevent gated downstream actions. Include duplicate-submit/idempotency strategy where applicable.
- Load and reconcile mission/evidence/check/decision/export data from API before labeling it live; avoid mixing local fixture data with server records without explicit provenance.
- Show connection, last-sync time, pending changes, stale checks, failure/retry, and export-gate status in plain language. Keep tokens out of UI/logs and preserve authentication fail-closed behavior.
- Maintain local deterministic demo behavior as a deliberate, conspicuously labeled mode; do not silently fall back to local evaluation after a live failure.

**Dependencies:** Backend/API contract and authentication decisions; operations 1–7 above must be resolved before claiming live authoritative workflow.

**Acceptance:** Contract tests assert each live operation's request/response/error behavior. Failure-injection tests prove failed evaluation/decision/write never appears saved or approved and does not unlock export. Success tests prove displayed run/decision/export correspond to returned backend data. Browser offline/reconnect test preserves clear pending/failed states and does not duplicate decisions. A visible indicator always differentiates mock from live, and a failed provenance fetch is never rendered as verified.

### Phase 6 — Accessible, responsive, motion-optional interaction

**Goal:** Ensure simplicity works for keyboard, screen-reader, touch, zoom, reduced motion, and constrained devices.

**Deliverables:**
- Audit route shell and every critical flow with keyboard-only, screen reader, 200% zoom, 320 CSS px width, portrait mobile/tablet/desktop, high-contrast/forced-colors, and touch. Fix focus order, landmarks, headings, error announcements, focus return for drawer/modal, and active/current navigation semantics.
- Convert interactive tab patterns to complete keyboard behavior or use simpler disclosure/links where custom tabs add no value. Test Stepper and state tabs with arrows/Home/End if they remain tabs.
- Respect `prefers-reduced-motion` consistently across Framer Motion, CSS animations, cinematic GSAP/Three animation, smooth scrolling, and transitions. Add a persistent user-accessible “Use simplified visuals”/“Disable 3D” option independent of OS preference, remembering choice appropriately.
- Lazy-load optional 3D only when requested/visible and provide a static, labeled image/diagram plus all meaningful text and controls. Check renderer cleanup and avoid animation-loop work when offscreen, reduced-motion, hidden tab, or disabled.
- Meet touch target and contrast requirements; ensure no color-only evidence states and no horizontal page overflow.

**Dependencies:** Phases 1–5 settled interaction and content structure; maintain existing axe checks as a floor, not the full test strategy.

**Acceptance:** No critical WCAG 2.2 AA issues found in automated plus manual audit for core flow; zero axe violations on each core route/state fixture; keyboard-only completion of all core tasks with visible focus and no trap; screen-reader announcement of state/error/blocked reason; no horizontal overflow at 320 px or 200% zoom; reduced-motion test confirms no nonessential looping/pulsing and explicit 3D-off mode makes no WebGL context request. Record browser/device matrix and any known exceptions.

### Phase 7 — UX validation, release gate, and iterative follow-through

**Goal:** Verify that the simplification works for real people and did not weaken safety or source comprehension.

**Deliverables:**
- Run moderated formative sessions on the revised prototype, fix issues, then run an unassisted summative task test with representative student and engineering users. Include keyboard/mobile users as well as desktop users.
- Test tasks: identify product boundary and synthetic status; open demo; locate source for a conflicting record; explain conflict and verification state; run/inspect checks; record or inspect human decision; determine why export is blocked or ready; reset demo safely; reach help/rules/status without losing work.
- Instrument privacy-conscious, non-sensitive UX events for navigation and errors only if approved; do not collect document/source contents or personal reviewer data for UX analytics. Set dashboard/owner for completion, time, error, backtracking, ease, and safety-comprehension metrics.
- Re-run performance/bundle and API-failure tests on agreed minimum mobile/network profile. Treat animation/3D loading as optional cost; prioritize usable first content and CTA.

**Dependencies:** All prior phases; stable release candidate and approved research/data-handling plan.

**Acceptance:** Minimum 20 participants across agreed user segments for summative assessment, with device/profile and exclusions reported; at least 90% core task completion without help; median core-path completion <3 minutes; median ease rating >=4/5; >=90% correctly identify synthetic status and software/human authority boundary; 0 critical safety misunderstandings or export-gate bypasses. If target misses, record causes and a remediation phase rather than claiming 10/10. All frontend checks/build pass and owners sign off unresolved risks.

## Validation commands and evidence sources

Run from `/tmp/orbitscore-check-20261025/frontend`:

```bash
npm test
npm run lint
npm run build
npm run lint:banned-words
npm run dev
```

Use `npm run dev` for manual route, narrow viewport, keyboard, reduced-motion, WebGL-disabled, and network-failure checks. Add browser end-to-end coverage if not already configured; the observed `package.json` has Vitest/Testing Library and axe dependencies but no declared Playwright/Cypress script. Do not assume such coverage exists.

Repository evidence anchors:
- `frontend/src/App.tsx` — route list and shell
- `frontend/src/components/common/Header.tsx` — top-level navigation/mobile drawer
- `frontend/src/pages/LandingPage.tsx` and `LandingPage.module.css` — landing content and layout
- `frontend/src/pages/MissionsListPage.tsx` — fixture selection and initialization copy
- `frontend/src/pages/MissionWorkspacePage.tsx` — six-stage page composition and direct context update
- `frontend/src/components/workspace/Stepper.tsx` — six-stage progress affordance
- `frontend/src/store/useOrbitStore.ts` — mock/live state and mutation/evaluation wiring
- `frontend/src/api/backend.ts` — implemented API client methods
- `frontend/src/fixtures/asteria-3.ts` — example source metadata and synthetic fixture content
- `frontend/src/test/landing-page.test.tsx`, `workspace-flow.test.tsx`, plus `store.test.ts`, `findings-flow.test.tsx`, `review-decisions.test.tsx`, `export-packet.test.tsx`, `layout-shell.test.tsx`, and `cinematic-experience.test.ts` — existing test evidence; extend rather than assume comprehensive coverage
- `README.md` — repository-described commands and test count (not a fresh run result)
- `/tmp/orbit-simple-review/reference/WhatsApp Image 2026-10-24 at 22.01.43.jpeg` and `WhatsApp Image 2026-10-24 at 22.02.43.jpeg` — supplied Unstop screenshots, useful only as user-provided UX-priority context.

## Risks and mitigations

- **Simplifying language can erase technical precision.** Pair plain-language summary with expandable exact source/rule details; have engineering/domain owners review terms.
- **Reducing stages can obscure safety gates.** Collapse navigation only, not responsibilities: deterministic checks, human decisions, and export lock remain separate and testable.
- **More visible source data can increase clutter.** Use concise row-level citation summary plus deliberate details; test scanning and mobile reading instead of hiding provenance.
- **Live/offline ambiguity can mislead reviewers.** Make mode and server-confirmed state explicit; fail closed on live write/evaluation errors and preserve a clearly marked demo path.
- **3D optionality can regress product identity or content.** Preserve a static illustration and all labels/data; core task completion must not depend on GPU, animation, or scroll position.
- **Safety/compliance wording can imply unsupported claims.** Keep OrbitScore boundary and synthetic-data labels prominent; run `npm run lint:banned-words` plus manual copy review. Do not describe evidence-readiness as safety certification.
- **Over-optimizing against small test samples.** Report segment/sample limitations and repeat validation after structural changes; metrics are targets and not guarantees.
- **Performance and network behavior are currently unverified.** Establish measured budgets and real-device tests in Phases 0 and 7; do not assert current performance.

## Clear done gate

The frontend roadmap is done only when all are true: (1) the approved simplified information architecture and guided path ship with every core route and synthetic/data-boundary statement accurate; (2) the compact workflow maintains separate deterministic, human-review, and export controls, with automated regression coverage proving no bypass; (3) all live-mode wiring gaps are either closed or the relevant operation is explicitly unavailable/local-only, and failures cannot masquerade as successful server persistence; (4) source metadata and uncertainty remain inspectable and truthful; (5) accessibility, responsive, reduced-motion, and WebGL-off acceptance checks pass and exceptions are documented; (6) UX validation hits the Phase 7 thresholds or a named remediation plan is approved instead of declaring 10/10; and (7) `npm test`, `npm run lint`, `npm run build`, and `npm run lint:banned-words` pass on the release candidate. Record commit SHA, test outputs, study results, and sign-offs in the release evidence. No score alone substitutes for the done gate.