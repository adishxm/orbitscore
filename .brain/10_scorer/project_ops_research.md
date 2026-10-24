# Project Operations, Research & Documentation Roadmap

**Assessment date:** 2026-10-25, Asia/Kolkata  
**Repository snapshot:** `403051612cf6ac026d6a31be7d8ca6b826da2a93` (`main`, observed through a fresh read-only clone)  
**Scope:** project status/reporting, research library and source register, documentation alignment, agent workflow, and sign-off governance. This file does not claim that the entire product is complete.

## Current score and evidence

**Current score: 6/10, medium confidence.** There is a meaningful governance foundation: `.brain/` is tracked, 17 task IDs are recorded as done, timestamped task/verification and completion reports exist, a research directory and integration/product documents are present, and a fail-closed completion checker distinguishes eligibility from final sign-off. This is stronger than a plan-only repository.

Important evidence gaps remain. `.brain/state.json` records `last_verified_at: 2026-10-24`, all 17 tasks as done, `current_phase: completed`, and `project_completion_status: ELIGIBLE`. The latest completion-run documents inspected report `ELIGIBLE_PENDING_FINAL_REVIEW`; eligibility is not an approval. The latest recorded verification predates the checked `main` commit, so it does not verify that exact commit.

The claimed test totals also disagree. The current README/CI labels state 64 backend + 33 AI/ML + 85 frontend tests (182 total). `.brain/state.json` records 55 backend + 34 AI/ML + 67 frontend tests (156 total), plus a separate reporting-test count. Neither record establishes the current executable count until the suites are rerun from a clean checkout at the release candidate and outputs reconciled.

Research and technical documentation are extensive, but file presence is not source validation. Product, paper, marketing, technical-stack, integration, and implementation-status claims still need a single claim-to-source and claim-to-code reconciliation. Keep historical reports immutable; new checks must state their own assessment timestamp, time zone, commit, exact commands, and results.

## Scope and 10/10 definition

**10/10 means all explicitly tracked project-operations and research/documentation criteria below are complete and supported by fresh evidence on a named commit, with required independent sign-off.** It does not mean that every possible research question is answered, every source can never change, or the software is certified or production-perfect.

Use clear statuses consistently: `not started`, `in progress`, `blocked`, `verifying`, `done`, `eligible for sign-off`, and `approved`. A task can be `done` while the project is still awaiting final approval. An `eligible` result is a gate result, not a sign-off. “100%” must refer only to a declared scope whose requirements, acceptance checks, evidence, and review state are all current.

## Phased roadmap

### Phase 0 — Establish the exact baseline and reconcile project status

Record the actual repository URL, branch, commit SHA, clean/dirty status, timestamp/time zone, and the latest corresponding completion and verification reports. Compare each report’s SHA with the checkout. Identify commits after the last verified run. Record which environments, accounts, and deployments were actually observed; unknown is not passed.

Rerun the backend, AI/ML, frontend, brain/reporting, and deterministic verification suites from a clean checkout at one named candidate SHA. Preserve raw runner summaries or immutable references. Resolve the 182-versus-156 discrepancy with actual outputs and update the README, CI labels, and state snapshot from the same run. Do not change the task state to make the counts appear aligned.

**Acceptance:** one baseline record identifies the exact candidate and worktree, latest applicable verification, all discrepancies, and actual per-suite counts; every task and completion status has a clear evidence reference. No stale report is described as verifying the latest commit.

### Phase 1 — Freeze the project scope and evidence model

Maintain a project scope register that separates shipped MVP requirements from research work, optional integrations, FlutterFlow/mobile, deployment, and future ideas. Every in-scope requirement needs an owner, stable task ID, acceptance test, evidence location, and status. Record exclusions and deferrals explicitly. Keep the non-certification and human-review boundary in the product definition.

Create one evidence vocabulary for source and implementation claims: `verified live`, `verified snapshot`, `synthetic/demo`, `research-only`, `planned`, `not evaluated`, and `unknown`. Require sources and software behavior to be cited separately: a regulation citation does not prove a feature exists, and a passing test does not prove scientific validity.

**Acceptance:** every in-scope requirement maps to task, owner, test, evidence and disposition; task dependencies are valid and acyclic; the completion checker refuses missing evidence, stale verification, pending review, or unresolved critical blockers.

### Phase 2 — Make the research library and source register auditable

Keep `research/README.md`, `research/PRODUCT_RESEARCH.md`, `research/SOURCE_REGISTER.md`, and the preserved source library as the entry points. For each source used in an active product or paper claim, record a stable source ID, issuing organization, canonical URL or local path, version/publication/effective date, jurisdiction and applicability, source type, access limitations, retrieval/hash when available, last-checked date, and a review trigger.

Link each material claim to a precise page, section, clause, table, or paragraph. Label whether the statement is a primary-source requirement, official guidance, team interpretation, empirical result, hypothesis, or product plan. Distinguish proposed rules from effective requirements and standards from regulations. Mark unavailable or restricted source text; never infer content that was not reviewed.

**Acceptance:** all current legal, scientific, numerical, event, and performance claims used in product-facing docs have a current source locator or are removed/recast as an assumption; all local links and registered paths resolve; stale sources have an owner and review date; a second reviewer spot-checks high-impact claims.

### Phase 3 — Align product description, paper, docs, and implementation

Create a claim matrix across the README, product research, technical-stack document, roadmap, paper, demo UI, integration guides, and hackathon materials. For each capability, show `implemented`, `prototype`, `research-only`, `planned`, `not implemented`, or `not evaluated`, with a code/test/evidence link. Keep the shipped product description focused on organizing source-linked mission evidence for human review. Do not claim certification, regulator approval, operational collision prediction, live telemetry, cost savings, or a validated universal safety score without evidence and domain approval.

Identify the canonical editable source for every paper/report and the generated PDF. Record toolchain, exact source version, regeneration steps, hashes, and supersession relationships. Preserve prior drafts and reports; corrections create new dated artifacts and identify what they supersede.

**Acceptance:** no unresolved contradiction remains about product name, event status, capability maturity, model metrics, data provenance, or safety boundary. Quantitative claims are reproducible or removed. An independent reviewer checks the claim matrix and the editable-source-to-PDF lineage.

### Phase 4 — Maintain clean onboarding and safe agent workflows

Update root README and `.brain/README.md` to reflect current `frontend/`, `backend/`, `ai_ml/`, `docs/`, `research/`, and `legacy/` paths. Document prerequisites, setup, tests, validation, scope boundaries, source verification, branch/worktree safety, task lifecycle, dated report creation/finalization, reviewer approval, and Git push/commit permissions. Link to canonical instructions rather than copying conflicting versions.

Add validator checks for stale paths, required files, broken internal links, task/state parity, dependency cycles, missing evidence references, and report metadata. Keep `.brain/` shared instructions/tasks tracked and private/local report data excluded according to the repository’s documented policy.

**Acceptance:** an uninvolved contributor can follow the guide from a clean clone and finish a sample task without oral instructions; all documented commands and paths are checked; agents cannot mark tasks done, commit, or push without the required reviewer/owner permission.

### Phase 5 — Produce append-only, commit-bound evidence and final sign-off

Every verification report states exact start/end timestamps with timezone, commit SHA, scope, commands, actual outcomes, skipped checks, limitations, evidence paths, and reviewer state. Reports use collision-safe names and never overwrite prior evidence. If corrected, create a new report that links the prior report and explains the correction.

Before final sign-off, regenerate team status and the completion report after all code changes. The reviewer checks the exact release SHA, test summaries, source register, claim matrix, deployment evidence, open risks, and explicit in/out-of-scope decisions. Any change to reviewed code/configuration/data invalidates affected checks and reopens the relevant gate.

**Acceptance:** two successive reports coexist and resolve to the correct commits; the final checker reports `ELIGIBLE_PENDING_FINAL_REVIEW` until a named reviewer signs; the approval record includes reviewer identity/role, date/time, candidate SHA, evidence packet, decision, and exceptions. The repository must not call the project approved while sign-off is pending.

### Phase 6 — Sustain the score after release

Assign ownership and an agreed cadence for sources, paper regeneration, claims, integration documentation, task instructions, and build/test steps. Trigger a review when a cited rule changes, provider behavior/terms change, a deployment is upgraded, an incident occurs, or an ML artifact is retrained. Reassess this area using the same rubric and fresh evidence; do not carry forward a past 10/10 automatically.

**Acceptance:** each review cycle produces a dated report tied to a commit; critical stale sources or broken workflows are triaged within an agreed window; a new maintainer can reproduce the in-scope completion gate.

## Area-specific 10/10 gate

- The exact candidate SHA and worktree state are recorded, and the latest verification is for that candidate.
- README/CI/state test counts agree with actual clean-run outputs; failures and skipped checks are disclosed.
- All tasks, project scope, research sources, paper versions, and capability claims have clear ownership and traceable evidence.
- All in-scope research claims have precise, current locators or are labeled as assumptions/hypotheses; no unsupported compliance or performance claims remain.
- Clean onboarding, internal links, validators, and timestamped non-overwriting reports work as documented.
- Completion eligibility and final approval are separate; an independent reviewer signs the exact candidate and evidence packet.

**Current decision:** not yet 10/10. The repository has strong task/report and research structures, but the old verification predates the checked commit, test counts conflict, and final human approval remains pending. This is a bounded project-operations assessment, not a judgment that every stored source or scientific claim was independently revalidated.
