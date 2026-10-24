# OrbitReady team knowledge manual

This is the project’s practical reading syllabus and explain-back guide. Read the shared product boundary first, then complete the common foundation and role path. It is intentionally focused on this prototype—not a general spacecraft engineering or regulatory certification course.

For product, policy, market, or domain research, start with `research/README.md`, then read `research/PRODUCT_RESEARCH.md` and `research/SOURCE_REGISTER.md`. The underlying source archive is in `research/OrbitReady_Research_Library/`; its catalog is an index, not an independent verification of source correctness or freshness.

## How to use this manual

For each topic, read the listed project files and reference material, try the small exercise, then explain the result without looking at notes. “Read” means understand and demonstrate; it does not mean the team has independently validated an engineering or regulatory rule. Keep a short note in the task report for any concept you apply.

### Learning completion checklist

- [ ] I can explain what the product does and explicitly does not do.
- [ ] I can trace one input from source evidence through a deterministic finding to a reviewed export.
- [ ] I can reproduce the documented checks and distinguish software verification from domain validation.
- [ ] I can identify synthetic inputs, unconfirmed values, conflicts, missing evidence, and scope limitations.
- [ ] I can describe the assigned work, acceptance criteria, failure behavior, and next dependency.
- [ ] I can answer judge questions without presenting inspired rules as official decisions.

## 1. Common foundation — every team member

### 1.1 Product purpose, scope, and claims

**Read:** `.brain/context.md`, `.brain/AGENT.md`, `.brain/reports/package-audit.md`, `README.md`.  
**Understand:** OrbitReady/OrbitScore is a pre-review evidence organization and decision-support prototype. It is not certification, legal advice, operational conjunction screening, collision prediction, orbit propagation, maneuver guidance, regulator filing, or a universal compliance score.  
**Practice:** Give a 30-second description of a user problem, the workflow, and three explicit non-capabilities.  
**Check:** Never describe a configured profile as an agency approval or a passing state as proof of mission safety.

### 1.2 Evidence, provenance, and synthetic data

**Read:** `fixtures/mission_complete.json`, `fixtures/mission_gap_heavy.json`, `fixtures/mission_conflict.json`, `fixtures/asteria3_mission_datasheet_synthetic.txt`, `.brain/contracts/api-contract.md`.  
**Understand:** A source citation/locator tells a reviewer where a claim came from; a hash can detect content changes when computed and compared correctly; synthetic demo evidence is not real mission evidence. A hash chain is tamper-evident in its tested context, not immutable, signed, or legally authoritative.  
**Practice:** Pick one fixture field and identify its value, unit, source, locator, confirmation status, and what changes if it is missing or conflicted.  
**Check:** Never call sample/synthetic data flight data or imply a citation has been independently validated just because it is present.

### 1.3 Deterministic decision flow and human review

**Read:** `apps/api/app/engine.py`, `.brain/checklists/demo.md`, `apps/api/app/main.py`, `apps/api/app/export.py`.  
**Understand:** In the intended design AI may suggest fields or explanations, but deterministic code evaluates confirmed inputs under a selected versioned profile. A human checks evidence and makes review decisions. Export stays locked until all findings have decisions.  
**Practice:** Explain the sequence: select mission/profile → inspect evidence → confirm/correct fields → evaluate → inspect findings → review each finding → unlock export.  
**Check:** A model-generated extraction remains a candidate, not confirmed evidence; do not skip human review.

### 1.4 Five finding states and failure meanings

**Read:** `.brain/contracts/api-contract.md`, `apps/api/app/engine.py`, `apps/api/tests/test_evaluator.py`.  
**Understand:** `PASS_UNDER_PROFILE`, `WARNING`, `NEEDS_EVIDENCE`, `CONFLICT`, and `NOT_EVALUATED` communicate different configured evaluation outcomes. `NOT_EVALUATED` is not a pass; missing data should not be invented; a conflict is not resolved by silently choosing a value.  
**Practice:** For each state, name one fixture or test that demonstrates it and the next safe reviewer action.  
**Check:** Never collapse all non-pass states into one generic red status or claim a status outside the selected profile’s scope.

### 1.5 Verification versus validation

**Read:** `.brain/reports/package-audit.md`, `.brain/checklists/acceptance.md`, `apps/api/app/verification.py`, `apps/api/tests/test_evaluator.py`, `apps/web/tests/api.test.ts`.  
**Understand:** Tests can show that code behaves consistently with implemented rules. They do not prove the rules are scientifically, legally, or operationally correct. The 12-case matrix is a reproducibility check, not independent domain validation.  
**Practice:** State separately: “what the test established” and “what remains unvalidated.”  
**Check:** Avoid “validated/compliant/certified” unless supported by an appropriate independent process.

### 1.6 Local setup, test commands, and Git hygiene

**Read:** root `README.md`, `.brain/prompts/git-sync.md`, `.gitignore`, `.brain/scripts/validate_brain.py`.  
**Run:** `python .brain/scripts/validate_brain.py`; in `apps/api`, `python -m pytest -q` and `python -m app.verification`; at root, `npm ci --prefix apps/web`, `npm test`, `npm run typecheck`, and `npm run build`.  
**Understand:** `.brain/` is shared and version-controlled; generated reports and runtime caches are local. The completion script is report-only. Review `git status` and `git diff` before manually staging intended files.  
**Practice:** On a clean clone, follow the README and record exact commands and results.  
**Check:** Never add `.env`, credentials, private documents, local databases, dependency directories, or generated reports to a commit.

## 2. Aditya — backend, rules, data, and optional AI

Complete the common foundation, then study these topics in order.

### 2.1 HTTP, FastAPI, and request/response contracts

**Read:** `apps/api/app/main.py`, `apps/api/app/schemas.py`, `.brain/contracts/api-contract.md`.  
**Reference:** [FastAPI tutorial](https://fastapi.tiangolo.com/tutorial/), [Pydantic models](https://docs.pydantic.dev/latest/concepts/models/).  
**Learn:** HTTP methods and status codes, request validation, response shape, path/query/body parameters, API errors, and why the frontend and backend contract must agree.  
**Practice:** Trace one mission evaluation request through its schema, route, engine call, and response. Compare actual fields with the contract example.  
**Explain:** What should the client show on network error, validation error, and `EXPORT_LOCKED`?

### 2.2 Pure deterministic rule functions

**Read:** `apps/api/app/engine.py`, `fixtures/rules_profiles.json`, `apps/api/tests/test_evaluator.py`.  
**Learn:** Pure functions, explicit inputs/outputs, profile scope, unit/type validation, missing values, conflicting sources, boundary conditions, and stable rule versions.  
**Practice:** Add a small test case before changing any rule logic; test a normal, missing, conflict, and out-of-scope input.  
**Explain:** Why should evaluation not depend on an LLM answer or hidden mutable state?

### 2.3 Persistence and transaction concepts (planned work)

**Read:** `.brain/tasks/T003-durable-state.md`, `.brain/tasks/T004-durable-provenance.md`.  
**Learn:** In-memory state disappears on restart; a database persists records. Study primary/foreign keys, transactions, migrations, unique constraints, and test isolation before implementation.  
**Practice:** Sketch relationships among mission, artifact, extracted field, finding, decision, and provenance event.  
**Boundary:** Persistence is a task plan in this package, not a current verified capability of the API.

### 2.4 Hashes and event-chain provenance

**Read:** `apps/api/app/provenance.py`, matching tests, and `.brain/tasks/T004-durable-provenance.md`.  
**Learn:** SHA-256 hashes bytes; canonical serialization matters; a chain links each event to the preceding event; integrity checking detects certain edits but does not authenticate who created data or prevent deletion.  
**Practice:** Change one event payload in a copy and locate the first broken sequence.  
**Explain:** Difference between checksum, tamper evidence, digital signature, and immutable storage.

### 2.5 Parsing and extraction safety (planned work)

**Read:** `.brain/tasks/T002-upload-extraction.md`, `.brain/checklists/demo.md`, synthetic TXT/PDF fixtures.  
**Learn:** File type/size validation, parser errors, page/line locators, units, confidence, untrusted extraction candidates, and human confirmation.  
**Practice:** Write expected behavior for a malformed PDF, unsupported type, oversized file, and ambiguous numeric value.  
**Boundary:** The package does not yet implement the planned upload/PDF extraction pipeline.

### 2.6 Optional structured LLM assistance (deferred)

**Read:** `.brain/tasks/T008-optional-ai-adapter.md`, `.brain/AGENT.md`.  
**Learn:** Structured output schemas, validation, timeouts, retries, provider failure, privacy, prompt injection in documents, and feature-off behavior.  
**Practice:** Design a candidate-extraction response that includes source locator and uncertainty but cannot set final finding status or review decision.  
**Boundary:** AI is optional and cuttable; the product must remain complete with it disabled. Never put credentials or private evidence into unapproved providers.

## 3. Narayan — frontend, UI, and API integration

Complete the common foundation, then study these topics.

### 3.1 React state and component flow

**Read:** `apps/web/src/App.tsx`, `apps/web/src/main.tsx`, `apps/web/src/styles.css`.  
**Reference:** [React Learn](https://react.dev/learn).  
**Learn:** Component state, props, event handlers, derived UI, loading/empty/error states, controlled inputs, and avoiding stale or duplicate state.  
**Practice:** Trace the profile selector, evidence mutation, finding list, decision button, and export action to their state changes.

### 3.2 TypeScript contracts and API adapter

**Read:** `frontend-service/schemas.ts`, `frontend-service/api.ts`, `apps/web/tests/api.test.ts`, `.brain/contracts/api-contract.md`.  
**Reference:** [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html).  
**Learn:** Interfaces/types, discriminated unions, runtime validation versus compile-time checking, API adapters, local/mock versus live behavior, and visible network failures.  
**Practice:** Compare one backend response with its frontend type. Identify any type that is asserted but not runtime-checked.

### 3.3 Human confirmation and accessible status design

**Read:** `.brain/agents/narayan.md`, `.brain/checklists/acceptance.md`, `.brain/checklists/demo.md`, `apps/web/src/App.tsx`, `apps/web/src/styles.css`.  
**Learn:** Do not use color alone; make `CONFLICT`, `NEEDS_EVIDENCE`, and `NOT_EVALUATED` visible text; show source and limitation near the claim; make confirmation and review actions explicit.  
**Practice:** Walk the demo using keyboard only; check focus, labels, visible error text, and small-screen layout.

### 3.4 Export gate and live/mock distinction

**Read:** `apps/api/app/export.py`, `.brain/tasks/T001-live-api-integration.md`, `.brain/tasks/T005-export-packet.md`, `.brain/tasks/T007-browser-tests.md`.  
**Learn:** A local mock export is not proof that the API generated or stored a packet. UI text must distinguish requested, locked, generated, downloaded, and failed states.  
**Practice:** Verify both locked and unlocked paths in the actual user interface; inspect the produced HTML/JSON rather than only reading a toast message.  
**Boundary:** Live end-to-end UI/API integration is a planned task until demonstrated in browser acceptance tests.

## 4. Roshan — QA, fixtures, and demo operations

Complete the common foundation, then study these topics.

### 4.1 Test design and reproducible bug reports

**Read:** `.brain/checklists/acceptance.md`, `.brain/checklists/preflight.md`, `apps/api/tests/test_evaluator.py`, `apps/web/tests/api.test.ts`.  
**Learn:** Arrange/act/assert, positive/negative/boundary cases, deterministic fixtures, regression tests, expected versus actual result, environment details, and reproducibility.  
**Practice:** Write a bug report with exact steps, expected result, actual result, command/browser state, and sanitized screenshot/path.

### 4.2 Fixture coverage and adversarial cases

**Read:** all `fixtures/mission_*.json`, `fixtures/rules_profiles.json`, `.brain/tasks/T002-upload-extraction.md`, `.brain/tasks/T007-browser-tests.md`.  
**Learn:** Complete versus gap-heavy versus conflict cases, malformed inputs, contradictory sources, unconfirmed fields, out-of-scope profiles, and export before/after review.  
**Practice:** Create a test matrix with rows for each status and columns for source present, confirmed, conflicting, in-scope, and export reviewed. Mark untested cells as gaps, not passes.

### 4.3 Verification workflow and honest results

**Read:** `.brain/scripts/validate_brain.py`, `.brain/scripts/complete_task.py`, `.brain/scripts/build_team_report.py`, `.brain/state.json`.  
**Learn:** The validator checks task structure; app test suites exercise implemented behavior; the completion script records a baseline run; none substitutes for task-specific manual/browser verification or reviewer sign-off.  
**Practice:** Run each command from a clean working tree and compare output with the report; record failures exactly. Never edit a report to make a failed test look passed.

### 4.4 Demo contingency and judge communication

**Read:** `.brain/checklists/demo.md`, `.brain/checklists/code-freeze.md`, `.brain/team-knowledge.md`.  
**Learn:** Offline/mock mode, backup recording, synthetic labels, export lock, bounded counterfactual, and clear limitations.  
**Practice:** Rehearse once with network disabled. Demonstrate missing evidence or conflict, then explain why the result is not an operational safety decision.

## 5. Shared judge-question rehearsal

Each teammate should answer these in their own words:

1. What exact user task does the prototype help with?
2. Which data in the demo are synthetic, and how do you show that?
3. What does a source locator prove—and what does it not prove?
4. What does `PASS_UNDER_PROFILE` mean, and why is it not compliance or safety certification?
5. What happens when required evidence is missing, unconfirmed, conflicted, out of scope, or unparsable?
6. Which decisions are deterministic, which actions require a human, and where could optional AI fit?
7. What evidence supports the test claim, and what domain questions remain unvalidated?
8. Which important features are implemented today versus only described in the roadmap?
9. Can this predict a conjunction, collision, or maneuver? **No.** Explain the deliberate boundary.
10. What is the next highest-priority task, and what observable evidence will demonstrate completion?

## 6. Readiness standard

A teammate is ready to own a task when they can explain its goal and dependency, name the relevant code and tests, demonstrate the normal and failure paths, state the safety boundary, and hand a reviewer reproducible evidence. If any of these is missing, treat it as a learning or implementation gap—not as a completed capability.
