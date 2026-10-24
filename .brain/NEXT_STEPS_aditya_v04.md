# NEXT_STEPS_aditya_v04 — From AI/ML prototype to evidence-backed completion

**Prepared:** 25 October 2026 (IST)  
**Primary owner:** Aditya; suggested collaborators/reviewers: Narayan for frontend, Roshan for QA/reproducibility, plus a qualified orbital-domain reviewer and an appropriate policy/legal reviewer where required. These are proposed responsibilities, not recorded approvals.  
**Repository baseline:** [`2e614cb323a7cd54ee243a45c1621d9757c14645`](https://github.com/adishxm/orbitscore/commit/2e614cb323a7cd54ee243a45c1621d9757c14645).  
**Status:** **PLAN — NOT IMPLEMENTED OR VERIFIED BY WRITING THIS FILE.**

> **Goal:** close every major AI/ML area from the previous ratings with working implementation, traceable inputs, independent evaluation, correct integration and release evidence. “100/100” means all agreed acceptance criteria are demonstrated **within an explicitly approved scope**. It does not mean perfect prediction, zero real-world risk, agency certification, guaranteed insurance savings, or universal support for every satellite.
>
> Do not close this roadmap by editing checkboxes. A file named `downloader`, `benchmark`, `trusted`, or `complete` is not evidence that its promised behavior happened.

**Where to put this file:** after the owner approves adoption, copy it to `.brain/NEXT_STEPS_aditya_v04.md`. Creating this deliverable has not changed the repository’s task state, sign-off files, application code or remote branches.

---

## Contents

1. [Read this before executing](#read-first)
2. [What exists, and what still needs proof](#baseline)
3. [What 100/100 actually requires](#completion)
4. [Architecture and non-negotiable contracts](#contracts)
5. [Execution order and dependencies](#execution)
6. [Implementation task cards: V04-00 through V04-27](#tasks)
7. [Mandatory regression test catalogue](#regressions)
8. [Real data and evaluation protocols](#data-protocols)
9. [Configuration, commands and experiment records](#commands)
10. [Acceptance thresholds and evidence](#acceptance)
11. [All 28 rated areas: completion crosswalk](#crosswalk)
12. [Schedule, resources and stop conditions](#schedule)
13. [First three work sessions](#first-sessions)
14. [Final release audit](#final-audit)
15. [Primary references and learning order](#sources)

<a id="read-first"></a>
## 1. Read this before executing

### 1.1 Preserve working code; replace unsupported claims

This is not a request to rewrite the project or add another layer of similarly named classes. Reuse the existing schemas, sklearn pipelines, validators, provider adapters, event grouping, registry, review workflow and report formatting where they work.

The priorities are:

1. Stop false-positive outputs and silent fallback behavior.
2. Establish one canonical data contract and reproducible environment.
3. Connect real, permissioned inputs to the existing functions.
4. Evaluate actual models against independent labels/reference cases.
5. Make the API, UI and reports consume those validated results.
6. Validate deployment, monitoring, human authority and rollback.

**Do not “fix” a false-positive feature by returning unavailable for every valid request forever.** Each task needs both negative controls and a legitimate successful path.

### 1.2 Keep three different achievements separate

- **Software implementation:** a function runs and its contract tests pass.
- **Empirical/scientific validation:** its outputs meet frozen, independently reviewed criteria on appropriate data/reference cases.
- **Operational/regulatory authorization:** the organization and relevant authorities accept the system for a specific use.

The first does not imply the second; neither automatically grants the third.

A good historical CDM predictor is not a physical collision-probability service. A good document extractor is not an atmospheric-decay model. A fast PDF renderer is not a verified NASA DAS workflow. Human confirmation does not turn synthetic input into real telemetry.

### 1.3 Scope changes need explicit approval

The current `.brain/AGENT.md` and research contract restrict the original MVP to human-reviewed evidence assistance. Live feeds, new physical conjunction/decay analysis, operational advice, real filings, paid services and destructive migrations require explicit scope/permission decisions before implementation.

This plan describes work needed for the broader application idea, but **does not itself authorize those activities**. V04-00 must adopt each expanded track. If the team cannot obtain suitable data or qualified scientific review, the physical-analysis track stays blocked/deferred; do not label it complete.

“Any satellite” must become a documented support matrix. A validated smallsat/LEO implementation may correctly reject unsupported regimes. That is acceptable scoped engineering, but is **not** delivery of an unqualified universal-satellite claim. Changing the scope must be visible in the pitch and final assessment.

### 1.4 Agent execution rules

- Read `.brain/AGENT.md`, current task records, source, tests and relevant primary references first.
- Execute **one adopted task at a time**; run positive and negative controls; record actual outputs.
- New CLI flags, files and schemas marked **PROPOSED** below do not exist until implemented and tested.
- Never replace missing real data with generated rows while reporting real-data success.
- Never invent losses, model metrics, timestamps, source permissions, citations, approvals or reviewer identities.
- Never convert an optional/deferred feature into an implemented feature by changing its label.
- No real document upload to a provider, large data/model download, paid call, live credential use, migration or deployment without the relevant approval and budget.
- Do not commit raw/private data, credentials, customer documents or unreviewed model artifacts. Do not use blanket `git add .` as a release procedure.
- Preserve old reports; append new dated evidence. Do not edit `.brain/state.json` or sign-off files to conceal failures.

<a id="baseline"></a>
## 2. What exists, and what still needs proof

### 2.1 Baseline freshness

The last executed main-idea assessment was at `b543a4b`. The latest inspected `2e614cb` adds only `launch.bat` and `stop.bat`; the AI, backend, frontend and `.brain` sources underlying that assessment are unchanged.

Historical independent results: **97 AI/backend tests passed; 85 frontend tests passed; frontend build passed; 17 task records validated.** The backend run required review-only additions of `python-multipart` and a PDF parser. These are inherited executed results, **not a fresh full-suite run performed while writing v04**, and not model-accuracy measurements.

Important unresolved observations:

| Area | Existing useful work | Gap to close |
|---|---|---|
| Data acquisition | Source/hash helpers and a sample staging function | ESA stub writes nine invented rows and reports `VERIFIED`; arbitrary/empty files pass without an expected digest |
| CDM research | Real sklearn fitting, preprocessing, grouping and basic cutoff guards | CLI still uses two invented train events and one test event; config settings do not drive the experiment |
| Decay/collision models | Lazy fitting and repeatable research demonstrations | 1,000/300 generated examples; no demonstrated independent physical accuracy or calibrated uncertainty |
| Extraction | Regex, optional LLM/Agent37 calls, page/candidate schemas | Real-document holdout missing; numeric substring/negation failures; inconsistent validation across provider paths |
| Metrics | Actual precision/recall/error calculations | Tiny-probability tolerances and untraceable manually supplied “model” arrays can mislead |
| Registry | Actual registration digest, default-unapproved metadata and disk reload | Cached bytes do not establish live-object integrity; feature/approval/persistence policy needs completion |
| Score | Backend score and explanation routes | Confirmed mass alone yields 95/AAA; frontend has a separate formula and can label adverse unconfirmed data ALIGNED |
| Reports | Reviewed backend export gate, Markdown/PDF rendering | Confirmed 50-year lifetime becomes default 3.8-year CONFORMS output; unsupported hardware/notification claims remain |
| UI | Considerable working frontend and copilot | New download handlers generate “verified” local documents after 423; orbit labels can change without proving source validity |
| Orbital routes | Schematic pathway/decay series | Read `field_name` instead of stored `field`; registry call has an unsupported argument; mission data can be ignored |
| Runtime/deployment | SQLite, migrations/docs, Docker, startup scripts | PostgreSQL URL does not select a PostgreSQL connection; clean installation, safe startup/stop, security and pilots need proof |

Sources: [AI training and CLI](https://github.com/adishxm/orbitscore/blob/2e614cb323a7cd54ee243a45c1621d9757c14645/ai_ml/cli.py), [ESA stub](https://github.com/adishxm/orbitscore/blob/2e614cb323a7cd54ee243a45c1621d9757c14645/ai_ml/datasets/esa_downloader.py), [orbital models](https://github.com/adishxm/orbitscore/blob/2e614cb323a7cd54ee243a45c1621d9757c14645/ai_ml/orbital_ml.py), [backend routes](https://github.com/adishxm/orbitscore/blob/2e614cb323a7cd54ee243a45c1621d9757c14645/backend/app/main.py).

### 2.2 Reconcile the planning IDs

The actual task directory/state currently tracks **T001–T017**. v02/v03 planning prose also reserves or describes T018–T032, with titles that do not always match the adopted task meanings.

Therefore **V04-00 … V04-27 are roadmap IDs, not existing `.brain` task IDs**. During adoption, inventory all reserved IDs and create an explicit mapping to new formal task records. Do not reuse a T-number or rename historical work silently. Do not pass these roadmap IDs to task scripts until those scripts/task files support them.

<a id="completion"></a>
## 3. What 100/100 actually requires

### 3.1 Four release classes—not one misleading “complete” label

| Release class | What it may claim | Required evidence |
|---|---|---|
| **R1 — truthful evidence workbench** | Source-backed candidate assistance, human review, scoped deterministic checks, accurate draft reports | Real-document evaluation; canonical fields; grounded quotes; no positive defaults; consistent review/export gates; secure data handling |
| **R2 — validated research models** | Reproducible historical CDM forecasting and evaluated extraction within stated populations | Real input provenance, disjoint holdouts, baselines, measured errors, versioned approved research artifacts and honest limitations |
| **R3 — domain-validated orbital decision support** | Specific approved decay/trajectory/conjunction analyses within an explicit support matrix | Qualified domain ownership, appropriate physical/reference inputs, independent numerical/observational validation, uncertainty and OOD controls |
| **R4 — controlled deployed service** | Operable deployment of the approved R1/R2/R3 scope | Actual database/runtime parity, access controls, monitoring, incident/rollback tests and representative shadow-pilot evidence |

R1 can be valuable before R3 exists. **R1/R2 alone do not complete the original physical-safety vision.** No class here grants agency certification, permission to file, autonomous maneuver authority or insurer acceptance.

### 3.2 Evidence-backed maturity rubric

For each rated area, use these milestones:

| Level | What must exist |
|---:|---|
| **0** | Missing, placeholder, or unsupported claim |
| **25** | Honest, clearly labeled demonstration with basic tests |
| **50** | Implemented positive/negative contracts and repeatable development pipeline |
| **75** | Appropriate real-data/trusted-reference evaluation, integrated artifacts and documented failure modes |
| **100** | All frozen acceptance criteria pass, evidence is reproducible, independent review is recorded, deployment/use limits are enforced |

This is a planning rubric, not a measured accuracy percentage. Utility components can use suitable verified fixtures/reference cases; a claim of real-data model quality cannot be validated by synthetic smoke fixtures alone.

**Hard rule:** a weighted average never overrides a release blocker. Any false-safe default, unsupported scientific claim, missing approval, leakage, privacy violation or unverified production artifact prevents a “100/100 complete” sign-off.

### 3.3 Optional features and honest scope

TensorFlow, RAG and fine-tuning are not mandatory just to collect framework names. If TensorFlow remains optional, mark it **N/A/deferred with rationale**, not “implemented 100.” If the goal literally includes all 28 rated areas, execute V04-24’s real TensorFlow experiment and evaluate it. An honest negative experiment can complete an experiment task; it does not prove a superior production model.

<a id="contracts"></a>
## 4. Architecture and non-negotiable contracts

### 4.1 One data path

```text
Raw bytes / authorized feed snapshot
  → source record + trusted integrity checks + origin/permission record
  → page records or typed CDM/state records
  → canonical normalized values + source spans
  → unconfirmed candidates / quarantined research inputs
  → human confirmation or validated analysis approval
  → versioned deterministic rule evaluation
  → reviewed findings and explicit limitations
  → identical API/UI/report data transfer objects
  → gated Markdown/PDF/JSON outputs
```

Model experiments follow a separate reproducible path:

```text
Frozen dataset manifest → frozen group/time split → train-only preprocessing
  → baselines + fitted model → development selection/calibration
  → untouched final holdout → experiment record + candidate artifact
  → independent approval → verified load → declared inference mode
```

### 4.2 Separate four concepts currently being conflated

**PROPOSED contract fields:**

| Concept | Example values | Never infer it from |
|---|---|---|
| `data_origin` | `REAL_EXTERNAL`, `VALIDATED_SIMULATION`, `SYNTHETIC_FIXTURE`, `USER_UNVERIFIED` | A provider name, filename or human confirmation |
| `transport_mode` | `LIVE`, `SNAPSHOT`, `DEMO`, `UNAVAILABLE` | Whether a scalar value is nonempty |
| `review_state` | `UNCONFIRMED`, `CONFIRMED`, `CONFLICTING`, `REJECTED`, `OUT_OF_SCOPE` | Model confidence or successful JSON parsing |
| `analysis_status` | `AVAILABLE`, `MISSING_INPUT`, `INVALID_INPUT`, `OUT_OF_DOMAIN`, `MODEL_UNAVAILABLE` | A fallback number or HTTP 200 alone |

A real snapshot can be stale; a confirmed value can still come from a synthetic fixture; a prediction is not automatically confirmed evidence. Report these independently.

### 4.3 Canonical fields must preserve meaning

Create one versioned field registry and explicit adapters for frontend `parameter_key`, backend `field`, legacy aliases and external column names. Remove ad-hoc `field_name` lookups.

Do **not** blindly merge these different quantities:

- remaining orbital life from a stated epoch;
- post-mission disposal lifetime from end of mission;
- lifetime of intentionally released debris;
- planned passivation procedure versus completed passivation state;
- disposal reliability, reported collision probability and casualty expectation.

Each quantity needs a definition, unit, time basis, allowed representations, source requirements, valid domain and applicable rule mappings. Ambiguous aliases require clarification or rejection, not guessing.

Use typed finite values, explicit null/unknowns, a source locator, source/artifact version and actual actor/time of confirmation. `false` is an adverse known value—not missing. Unknown is not zero and is not false.

### 4.4 Numerical and authority boundaries

- Normalize before comparison; retain raw values/units for traceability.
- Use numeric token boundaries and field-specific semantic support, not substring occurrence.
- Negated, future, conditional and conflicting statements remain distinguishable.
- Probability/log-probability/ratio representations must not be mixed.
- No universal absolute `1e-6` tolerance for tiny probabilities.
- No claimed 95% interval unless an approved calibration protocol supports that meaning.
- ML outputs do not directly set regulatory `PASS`/`CONFORMS` or operational maneuver decisions.
- Every missing/out-of-domain/unavailable case returns an explicit state, not fabricated 3.8 years, 4 kg, 500 km, a safe probability or a “verified” report.

<a id="execution"></a>
## 5. Execution order and dependencies

### 5.1 Workstreams

| Phase | Tasks | Exit gate |
|---|---|---|
| **0 — adoption and containment** | 00–03 | Agreed scope; current failures reproduced; dangerous output paths contained; clean environment/config contract |
| **1A — real document assistance** | 04–08 | Permissioned corpus, reviewed labels, robust parsing/grounding and a genuine extraction benchmark |
| **1B — real CDM research** | 09–12 | Official input import, disjoint events, actual baseline/model training and untouched holdout report |
| **2 — trusted inference/data** | 13–16 | Approved artifacts, real API integration, honest telemetry modes and reference-tested propagation |
| **3 — scientific validity** | 17–19 | Domain-approved decay/conjunction scope and validated uncertainty/OOD behavior |
| **4 — original product outputs** | 20–23 | One score contract, scoped rules, truthful reports and verified browser workflow |
| **5 — optional experiments / operations** | 24–26 | Real optional experiments if claimed; production database/security/pilot evidence |
| **6 — independent completion audit** | 27 | Every required acceptance artifact reviewed; no release blocker |

Documents and CDM research may proceed in parallel after their shared foundations. Policy interpretation can begin early with qualified review. Scientific tasks do not become approved just because UI work finishes.

### 5.2 Dependency register

The references below are roadmap dependencies. Conditional prerequisites are called out in the task cards.

| Task | Prerequisites |
|---|---|
| V04-00 | None |
| V04-01 | V04-00 |
| V04-02 | V04-00, V04-01 |
| V04-03 | V04-00, V04-01 |
| V04-04 | V04-02, V04-03 |
| V04-05 | V04-02, V04-03, V04-04 |
| V04-06 | V04-04, V04-05 |
| V04-07 | V04-02, V04-06 |
| V04-08 | V04-03, V04-05, V04-06, V04-07 |
| V04-09 | V04-03, V04-04 |
| V04-10 | V04-02, V04-09 |
| V04-11 | V04-03, V04-10 |
| V04-12 | V04-10, V04-11 |
| V04-13 | V04-02, V04-03; approval of each real artifact also requires its completed model-validation task |
| V04-14 | V04-02, V04-13 |
| V04-15 | V04-00, V04-02, V04-03, V04-04; explicit provider/scope permission |
| V04-16 | V04-02, V04-15 |
| V04-17 | V04-00, V04-04, V04-14, V04-16; qualified scientific owner |
| V04-18 | V04-00, V04-04, V04-14, V04-16; qualified scientific owner |
| V04-19 | V04-12, V04-17, V04-18 for the corresponding claimed model families |
| V04-20 | V04-02, V04-04; V04-19 before using validated-model risk indicators |
| V04-21 | V04-00, V04-02, V04-04; appropriate policy/domain reviewer |
| V04-22 | V04-02, V04-13, V04-20, V04-21; scientific prerequisites for any computed physical claims |
| V04-23 | V04-08, V04-14, V04-16, V04-20, V04-22 |
| V04-24 | V04-03, V04-08, V04-12; V04-17 for a real decay-network experiment |
| V04-25 | V04-02, V04-03, V04-04, V04-13, V04-14 |
| V04-26 | V04-08, V04-12–16, V04-20–23, V04-25; V04-17–19 before an R3 rollout |
| V04-27 | All tasks required by the approved release class; V04-24 if its capability is claimed |

<a id="tasks"></a>
## 6. Implementation task cards

**All cards below start PLANNED.** Existing code can satisfy part of a task after re-verification; that does not mean this plan executed or revoked historical work. Each card needs an adopted task ID, owner, independent reviewer and dated evidence before closure.

### V04-00 — Adopt the scope, IDs and acceptance authority

**Owner/review:** Aditya + whole team; domain/policy reviewers for expanded claims.  
**Touch:** `.brain/project-scope.json`, task records, claims documentation and release-contract files **only after adoption approval**.

- Reconcile the screenshots, v01–v03, actual task IDs and current code. Preserve history and identify unsupported completion labels without bulk rewriting sign-offs.
- Define R1/R2/R3/R4 requirements, supported mission classes/regimes, intended users and prohibited uses.
- Name the data owner, scientific reviewer, software reviewer and release authority. The implementation agent cannot impersonate them.
- Freeze privacy permissions, provider budget, access rights and numerical acceptance criteria before final tests.
- Decide whether TensorFlow is an actual deliverable or explicitly optional. Do not silently exclude a claimed requirement to inflate a grade.

**Done only when:** there is an approved requirements-to-evidence matrix, formal task-ID mapping and scope-change decision for every advanced track. Missing domain authority blocks scientific approval.

**Evidence:** `docs/validation/v04/release-contract.yaml` and `task-id-map.md` **[PROPOSED]**, with real decision records, not invented signatures.

### V04-01 — Build the red regression suite and contain misleading outputs

**Owner/review:** Aditya + Narayan; Roshan verifies independently.  
**Touch:** current validators, score, exports, orbital routes and their tests.

- Turn the concrete failures in Section 7 into failing tests before repairing them.
- Stop frontend fallbacks after 401/403/423. Remove favorable physical/report defaults and unsupported model compliance/maneuver fields from authoritative paths.
- Keep research/demo functionality behind explicit modes. When legitimate inputs or approved artifacts are absent, return a structured unavailable state.
- Preserve the previously fixed examples: 9,000 versus 4 kg, fabricated page 999, duplicated event groups, empty-record scoring and packaged imports.
- Isolate test model storage, SQLite and generated files; tests must not overwrite committed model metadata or contact live services.

**Done only when:** named negative cases fail closed and corresponding valid, fully evidenced cases still work. Disabling all outputs is containment, not completed capability.

**Evidence:** initial failing output, repaired tests, representative API/UI/report traces and a reviewed claims inventory.

### V04-02 — Implement one canonical mission/evidence/result contract

**Owner/review:** Aditya; Narayan and a domain-aware reviewer.  
**Touch:** `ai_ml/schemas.py`, normalization, backend schemas, frontend domain/adapters and profile mappings.

- Inventory every current field name and unit; write explicit versioned mappings.
- Preserve physically different lifetime and probability quantities; attach epoch/time basis to time-dependent values.
- Implement independent origin, transport, review and analysis-status fields from Section 4.
- Derive confirmation from authenticated review records, never from model output or arbitrary truthy strings.
- Add typed report/index/prediction DTOs consumed by both backend and frontend; remove hidden alternate score computations.

**Done only when:** round-trip tests preserve values, units, nulls, false values, aliases, provenance and semantic distinctions. Unknown aliases fail clearly. New outputs cannot become ALIGNED merely because a record is present.

**Evidence:** versioned field registry, migration/crosswalk notes, generated API types or contract tests and example valid/invalid payloads.

### V04-03 — Clean installation, real configuration and packaging

**Owner/review:** Aditya; Roshan reproduces from a clean clone.

- Declare `python-multipart`, the selected PDF parser and every actual runtime dependency in canonical files. Keep optional OCR/TF dependencies in explicit extras/environments.
- Select a supported Python minor/OS matrix; pin reproducible compatible dependency sets. Record actual versions rather than assuming a global developer environment.
- Validate YAML semantically: dataset paths/origins/checksums, split ratios, horizons, model allowlist, parameters, output paths and seed. Reject invalid values and ambiguous demo/experiment flags.
- Make handlers use the loaded settings. Missing real input must never cause demo rows to be generated.
- Test a normal wheel in a fresh non-editable environment outside the source directory, including any nested experimental package that is meant to ship.
- Standardize npm installation and lockfile ownership; do not create duplicate React installations.

**Done only when:** missing/malformed/invalid configs fail; changing an allowed model setting changes the fitted estimator/record; installed-wheel CLI works; a clean documented installation runs relevant tests without manual undeclared supplements.

**Evidence:** clean-install logs, lockfiles, wheel contents/import trace and config behavior tests.

### V04-04 — Source provenance, rights and trusted integrity

**Owner/review:** Aditya + data owner; Roshan checks controls.

- Add source manifests with stable IDs, source version/URL, retrieval timestamp, rights, allowed annotation/training/provider processing, confidentiality, expected upstream checksum and computed local digest.
- Distinguish `HASH_COMPUTED_UNVERIFIED` from source-integrity verification and schema acceptance.
- Reject arbitrary/empty/corrupt inputs for a claimed dataset; verify bytes against an independently trusted expectation where available.
- Preserve raw immutable inputs and transformations; keep real/private data out of Git and unit fixtures.
- Treat files, archives and document content as untrusted. Bound size/expansion/pages/runtime; defend archive extraction and outbound fetching.

**Done only when:** a known good permitted source passes, wrong expected hashes/schema/origin fail, and synthetic fixtures cannot be relabeled real by a filename or confirmation flag.

**Evidence:** approved source register, raw-byte manifests, rejected-input examples, license/permission review and transformation lineage.

### V04-05 — Reliable text/PDF/table/OCR parsing

**Owner/review:** Aditya; Roshan tests, domain reviewer checks representative documents.

- Reuse page classes, but parse actual file bytes with a declared parser.
- Preserve original page numbers, extraction offsets and raw-file identity. Page markers such as 7/9 must not silently become 1/2.
- Detect low-quality/scanned pages; use an approved OCR pipeline or return explicit OCR-required/unavailable status. Do not call empty extraction successful.
- Preserve table row/header associations, units and multi-column context. Record parser/OCR versions and processing budgets.
- Keep extracted text distinct from original bytes; a text hash does not replace the original document hash.

**Done only when:** a reviewed mixed-quality fixture set has correct page/locator mapping, actual text extraction and explicit failures; no fabricated content or unlimited parser behavior occurs.

**Evidence:** parser quality report, OCR/error examples, page-to-source tests and documented supported/unsupported file types.

### V04-06 — Build a real reviewed document corpus

**Owner/review:** Aditya + data owner; independent annotators/domain adjudicator.

- Obtain permissioned documents; public availability is not blanket training or external-processing permission.
- Define annotation instructions from V04-02: raw/normalized values, units, exact page/span/quote, unknowns, negation, plans, conflicts and conditional statements.
- Start with a small pilot to debug the process; then expand based on field coverage and confidence/sample-size needs. A planning target of 30–50 documents across at least 10 independent families is a starting point, **not a guarantee of adequate final evaluation**.
- Double-review critical labels and adjudicate disagreements. Do not let the same model generate gold labels and grade itself.
- Freeze family/operator/template-aware train/dev/test identities before model tuning. Ensure meaningful nonempty holdouts and no cross-split duplicates/amendments.

**Done only when:** provenance and rights are approved, gold labels are independently reviewed, split manifests are immutable, and the evaluation owner accepts coverage/sample size before unblinding.

**Evidence:** annotation guide, agreement/adjudication report, data card, split manifest and access-controlled corpus references.

### V04-07 — Unit-aware, field-aware evidence grounding

**Owner/review:** Aditya; domain-aware reviewer + Roshan.

- Wire normalization into every extraction path, including Agent37 and baseline adapters, not only one helper.
- Require field/value/unit association within a real cited span. Reject 4 from 40, unrelated section numbers and unsupported sentence-prefix fallbacks.
- Handle decimal/scientific notation, percentages and ratios with representation-aware logic. Preserve uncertainty or ranges stated in the source.
- Distinguish “not passivated,” “will passivate,” and “passivation verified.” A positive keyword cannot override negation or temporal meaning.
- Enforce canonical field allowlists, finite/domain checks, source/page identity, conflicts and explicit abstention. Model confidence never bypasses validation.

**Done only when:** adversarial grounding cases fail and valid conversions such as 4 kg versus 4,000 g pass only through correct unit-aware matching. Ambiguity yields a reviewable unknown, not a HIGH candidate.

**Evidence:** field-specific validator tests and a blinded error analysis on real reviewed documents.

### V04-08 — Real pretrained extraction and copilot evaluation

**Owner/review:** Aditya; Roshan evaluates, Narayan integrates; data owner approves provider use.

- Benchmark deterministic extraction first, then one approved pretrained provider/local model on the same frozen documents.
- Pin model/provider revision where possible, prompt/schema/parser versions, token/page budgets, timeouts, retries and cost caps. Log sanitized usage and actual mode.
- Use strict structured output plus V04-07 semantic checks. Documents are data, never authority to execute tools or change decisions.
- Resolve conflicting/duplicate AI and baseline candidates explicitly; do not silently overwrite one with the other.
- Keep `human_confirmed=False`; show exact source and uncertainty. Chat answers must distinguish citations, interpretation and missing evidence; no automated certification.

**Done only when:** actual approved inference is demonstrated, real holdout metrics/error analysis meet frozen criteria, privacy/cost controls work, and the full candidate→human-review path is tested. Mocked calls alone establish interface behavior, not model quality.

**Evidence:** baseline/provider comparison, per-field metrics, grounded-citation precision, abstention/correction rates, actual inference trace and consent record.

### V04-09 — Acquire and verify the actual ESA dataset

**Owner/review:** Aditya; data owner and Roshan.

- Use the official ESA/Zenodo sources in Section 15. Fetch metadata first; verify the intended release, file identity, license and published checksum before an approved archive download/stage.
- Keep the existing nine-row generator only as a named synthetic fixture. It cannot satisfy this task.
- Preserve the downloaded release, upstream checksum and locally computed SHA-256. Do not set the expected hash equal to the just-downloaded hash and call that independent verification.
- Inspect archive layout safely; public challenge tables, released labels and separate raw data are not assumed identical.
- Record all counts and schema checks. The full archive is about 221 MB before extraction; use appropriate local/object storage, not a small persisted conversation workspace or Git.

**Done only when:** actual release bytes or an explicitly supplied approved copy are verified and inventoried, and invalid/empty/substituted releases are rejected. Respect any applicable terms and source permissions.

**Evidence:** source manifest, saved metadata, checksum output, archive inventory and attribution/license notice.

### V04-10 — Official-column import, correct target and leakage-safe events

**Owner/review:** Aditya; domain reviewer and Roshan.

- Implement the actual CSV/table loader, not only Pydantic constructors.
- Map documented fields, including `risk` → reported log10 risk, `time_to_tca` → days, `miss_distance` → metres and `relative_speed` → m/s. Preserve original IDs and units.
- Require exactly one event identity in an event assembly call. Reject mixed-event histories, contradictory duplicate messages and invalid/nonfinite values.
- For the two-day task, use only feature CDMs available at/earlier than the cutoff: `time_to_tca >= 2`. Choose labels according to the official protocol, not merely “any message <2 days.”
- Log excluded events, cohort differences and missingness. Freeze unique-event splits before preprocessing; add mission/time robustness splits where the released identifiers support them.

**Done only when:** event counts and exclusions reconcile to source rows, target chronology is correct, train/dev/test are event-disjoint and stable, and all guard tests pass on actual imported data.

**Evidence:** mapping specification, row/event audit, target definition and checksummed split manifests.

### V04-11 — Execute actual baselines and fitted CDM models

**Owner/review:** Aditya; independent experiment reviewer.

- Fit a train-only median/dummy baseline and evaluate last-observed-risk persistence.
- Train a small CPU sklearn model using the same declared feature/target contract and splits. Reuse the pipeline; do not train on the test set.
- Fit imputation/scaling/feature selection only on training data. Feature engineering cannot read final labels or late messages.
- Make config parameters, seed and dataset paths operative and recorded. No default demo data in a real experiment.
- Persist predictions with event IDs, model IDs, actual feature snapshot and label references. Store a candidate artifact, not automatically an approved model.

**Done only when:** reproducible commands consume verified inputs, fit actual samples, evaluate proper heldouts, and produce dataset-linked predictions and candidate artifacts. A clean run must not quietly fall back to two sample events.

**Evidence:** training log, estimator parameters, sample/event counts, predictions and candidate artifact digest.

### V04-12 — Independent holdout evaluation and defensible benchmark reports

**Owner/review:** Roshan/independent evaluator; Aditya supports implementation.

- Keep final holdout labels inaccessible to tuning/model-selection code until the evaluation protocol is frozen.
- Report event-level MAE/RMSE in log10 units, persistence/median comparisons, error distributions and relevant subgroup/horizon results. Use appropriate uncertainty on comparisons.
- Explain high-risk-enriched selection; do not interpret challenge prevalence as population collision frequency.
- Validate lengths, IDs, unique-event counts and finite values. A report formatter may calculate supplied-array metrics, but cannot declare those inputs a trained-model holdout without lineage.
- Bind the report to data, split, feature, code, model and prediction digests. Record failures and non-superiority honestly.

**Done only when:** an independent reviewer reproduces the actual experiment and checks claims against saved predictions. Research can complete with a negative result; a product claim of improved accuracy remains blocked unless evidence supports it.

**Evidence:** immutable JSON/Markdown report, holdout access record, reproducibility instructions and reviewed limitations.

### V04-13 — Artifact registry, approval, integrity and reload

**Owner/review:** Aditya; security/release reviewer and Roshan.

- Separate candidate/quarantine storage from approved inference artifacts. Approval must be a real protected review event, not a caller-supplied Boolean.
- Bind raw artifact bytes to model type, feature order/units/schema, preprocessing, dataset/split hashes, library versions, intended use, domain limits and validation record.
- Validate IDs/paths and enforce a protected storage root; prevent traversal and uncontrolled deserialization. Never load untrusted pickle/joblib merely because its accompanying metadata contains a matching hash.
- Serve an immutable verified snapshot or detect live-object mutation; hashing old cached bytes while returning changed weights is insufficient.
- Persist approval/revocation/version changes and test across fresh processes/workers. Use transactional/atomic publication and explicit rollback.

**Done only when:** approval defaults to unavailable, tamper/schema/version/revocation cases fail, valid approved artifacts reload and predict consistently, and research/demo artifacts cannot become production-approved accidentally.

**Evidence:** registry negative/positive tests, new-process load trace, approval audit and compatibility/rollback report.

### V04-14 — Real model-serving contracts and route parity

**Owner/review:** Aditya; Narayan + Roshan.

- Make routes load the intended approved model/reference implementation and actually use it. Correct the unsupported registry argument in `/decay-path`.
- Enforce ordered feature contract, units, finiteness, supported domain, mission identity and access permissions before inference.
- Return requested/used artifact IDs, input/provenance versions, analysis status, limits and model scope. No direct model-produced legal PASS or maneuver command.
- Distinguish an explicitly selected baseline from an unavailable requested model. Never disguise missing artifacts as baseline success.
- Add bounded jobs, cancellation, idempotency and resource limits if processing is long; log actual failures without leaking secrets.

**Done only when:** valid approved inputs exercise the intended estimator, unsupported/missing inputs are explicit, named missing models fail clearly, and every new endpoint has existence/auth/domain checks.

**Evidence:** API schema snapshots, model-use spy/trace, valid/invalid request matrix and cross-process serving test.

### V04-15 — Authorized telemetry, verified snapshots and honest modes

**Owner/review:** Aditya; provider/data owner and Roshan.

- Require explicit live enablement **and** authorized credentials/terms. A stored credential alone must not trigger live requests when live mode is off.
- Implement source-specific caching, freshness, timeouts and error policies. Recheck current provider usage rules; do not blindly retry every non-200 response.
- Persist original responses, epoch/retrieval time, source, actual checksum and parsed values. Recompute/verify snapshot integrity; do not attach preset orbital elements to arbitrary stored TLE lines.
- Maintain verified mission→catalog identity; a planned satellite may have no catalog ID. `99999` belongs only in explicitly synthetic fixtures.
- Support appropriate modern GP/OMM/CSV/JSON representations and expanded catalog IDs, not TLE-only assumptions.
- Replace NASA-labelled hardcoded bands with a real licensed/versioned product and validated interpretation, or keep them explicitly synthetic assumptions.

**Done only when:** a permitted real fetch and a verified offline replay work, modes/freshness remain truthful under failure, identity mapping is correct, and forbidden/unconfigured requests make no live calls.

**Evidence:** sanitized real-fetch trace, replay/hash tests, policy/caching tests and mission identity mapping.

### V04-16 — Reference-tested orbital pathway computation

**Owner/review:** qualified orbital owner + Aditya; independent numerical reviewer.

- Choose a trusted propagation/library chain appropriate to the source. GP mean elements require their compatible propagation model; do not treat them as arbitrary precision osculating states.
- Define epochs, time scales, frames, units and Earth-fixed conversions. Preserve model/input versions and freshness limits.
- Replace the current generic trigonometric schematic for any claim of propagated pathways; label a retained schematic honestly.
- Use canonical fields or the explicitly selected authoritative snapshot. Conflicting element/evidence inputs require resolution, not silent merging.
- Test reference trajectories and frame conversions, not only latitude bounds or array length.

**Done only when:** independently sourced reference cases match approved numerical tolerances and unsupported/stale inputs are rejected or explicitly qualified. A visual path remains non-navigation decision support unless separately authorized.

**Evidence:** reference-case catalogue, error tables, frame/time/unit tests and input-to-waypoint trace.

### V04-17 — Validated atmospheric-decay capability

**Owner/review:** qualified orbital/atmospheric specialist; Aditya implements; independent reviewer approves.

- Freeze the supported mission/orbit/vehicle/solar-environment scope and what “lifetime” means.
- Obtain suitable observed labels or a trusted, permitted numerical reference pipeline; distinguish censored active objects from known reentries and simulator labels from observations.
- Review physical inputs, attitude/geometry/drag and environmental assumptions. Do not train a synthetic formula and assume its comments establish validation.
- Benchmark the physical/reference method first. If using ML as a surrogate, compare it with that method on object/time/regime-disjoint cases and independent observational checks where available.
- Remove fixed ±12% “95%” claims and direct compliance flags until V04-19 and V04-21 support the intended meaning.

**Done only when:** a domain-reviewed validation report meets frozen error/coverage/applicability criteria and the API actually consumes the approved method/artifact. Outside scope returns unknown/OOD, not clipped 50-year guesses.

**Evidence:** source/label lineage, reference/observational comparisons, error slices, support matrix and scientific sign-off. Without data or a qualified reviewer, this task remains blocked—not completed by a proxy.

### V04-18 — Physical conjunction assessment and meaningful risk classification

**Owner/review:** qualified conjunction-assessment specialist; Aditya implements approved methods.

- Keep ESA reported-risk forecasting separate from physical Pc calculations.
- Establish availability/quality of the required states, frames, epochs, covariance, geometry and hard-body-radius assumptions. A few distances and an invented sigma are insufficient.
- Implement a specialist-selected method against trusted published/reference numerical cases. Validate covariance consistency, units, degeneracy, numerical tails and missing inputs.
- Define any derived classifier target using valid assessments or reviewed labels—not merely a rule the classifier is expected to reproduce while claiming independent safety prediction.
- Remove operational maneuver recommendations from this roadmap’s automatic outputs. Any future operational action system needs a separate authority/safety process.

**Done only when:** approved reference and out-of-domain cases meet frozen numerical requirements, uncertainty assumptions are explicit, and downstream consumers cannot confuse a research class/proxy with operational Pc or maneuver authority.

**Evidence:** method review, numerical validation suite, feature/label provenance, classifier evaluation where applicable and independent domain approval.

### V04-19 — Calibrated uncertainty, abstention and OOD behavior

**Owner/review:** Aditya + statistical/domain evaluator.

- Define uncertainty separately for extraction, reported-risk forecasts and physical/lifetime models; they are not interchangeable.
- Use a legitimate calibration design with data separated from model selection and final testing. Record assumptions, grouping and distribution-shift limitations.
- Report measured coverage and interval width/error tradeoffs on untouched cases and relevant subgroups. RF class confidence is not collision probability.
- Enforce the approved support matrix at inference; detect invalid/OOD/stale inputs and abstain visibly.
- Model interval/error claims must follow the exact calibrated representation—e.g. log-risk forecast error is not physical collision-event uncertainty.

**Done only when:** interval/abstention claims meet preapproved criteria, calibration leakage is absent, unsupported inputs cannot produce confident safe outputs, and the result is independently reproduced for each claimed model family.

**Evidence:** calibration protocol, group-aware coverage plots/tables, OOD test set and approved uncertainty wording.

### V04-20 — One defensible Space Credit Index contract

**Owner/review:** Aditya + Narayan; domain/stakeholder reviewers.

- Decide whether v1 measures **evidence readiness** or a separately validated safety/risk construct. Do not imply underwriting meaning or universal safety from arbitrary weights.
- Define each pillar’s relevant inputs, confirmation requirements, adverse/missing/conflict behavior, weight version and explanation.
- Remove defaults triggered by generic record presence. Confirmed mass cannot prove disposal/passivation; confirmed `false` cannot earn positive passivation credit.
- Make backend, `/explain`, fleet, frontend and reports consume the same versioned result. Missing-pillar disclosure must reflect actual missing requirements, not merely zero points.
- If a unified physical safety index is retained as an original requirement, define and independently validate the aggregation against a defensible target. Otherwise clearly state that broader requirement is not delivered.

**Done only when:** all adverse/missing cases behave correctly, valid supported evidence earns only justified contributions, all consumers agree, and the scope/meaning is accepted by appropriate reviewers.

**Evidence:** versioned rubric, monotonicity/counterexample tests, stakeholder/domain validation and cross-channel parity tests.

### V04-21 — Scoped, versioned regulatory/profile interpretation

**Owner/review:** Aditya; appropriate domain/policy/legal reviewer.

- Map every implemented rule to controlling source, clause, effective date, jurisdiction, mission/object class, exceptions, units and evidence type.
- Distinguish primary text, team interpretation and computational output. “Inspired” labels do not become agency approval.
- Preserve exact comparison semantics and required evidence. Missing applicability cannot become global conformance; rounded display values cannot change the raw rule result.
- Separate reviewed packets containing disagreements/waivers from any submission-clearance process. Define which decisions satisfy each export policy.
- Add change control and re-evaluation requirements when sources, profiles, models or evidence change.

**Done only when:** a reviewed traceability matrix and representative passing/failing/out-of-scope cases support every claimed rule. Unsupported jurisdictions/sections remain explicitly unassessed.

**Evidence:** source-to-rule matrix, source freshness review, versioned fixtures and reviewer interpretation record.

### V04-22 — Truthful analytical ODAR/EOMP and all-format gates

**Owner/review:** Aditya; Narayan, Roshan and the appropriate report/domain reviewer.

- Build a typed report-input DTO from canonical confirmed evidence and approved analysis, not arbitrary dictionaries/default arguments.
- Preserve actual adverse values, missing scope and uncertainty. No default 3.8-year lifetime, invented 40 Wh battery, zero debris release, safe casualty risk, tether exclusion or notification-sent claim.
- Every substantive statement must have an input/rule/assessment locator or clearly be an instruction/template placeholder—not a mission fact.
- Recheck evaluation freshness and review eligibility on every Markdown/PDF/JSON export. Evidence/profile/model changes must invalidate stale eligibility as specified.
- Preserve actual reviewer actor/time/decision/rationale; never substitute “Safety Authority” or an invented approval rationale.
- Test PDF extracted text and provenance, not only `%PDF`, section titles or a successful status code. Measure a real latency distribution on representative inputs if claiming p95.

**Done only when:** valid reviewed packets export accurately, 50-year inputs stay adverse/unknown as appropriate, all missing fields stay unknown, all formats agree, and no unauthorized/unreviewed route unlocks.

**Evidence:** semantic report fixtures, parsed PDF comparisons, authorization/freshness traces and reviewed output samples.

### V04-23 — Frontend, evidence flow and browser E2E

**Owner/review:** Narayan + Aditya; Roshan verifies in a real browser.

- Consume the same canonical API/index/report contract. Remove client-only score formulas and hardcoded physical fallbacks.
- Use the configured authenticated API client/proxy for every new request; do not hardcode a browser-side backend localhost or silently generate “verified” files after errors.
- Bind LIVE/SNAPSHOT/DEMO labels to response provenance/freshness, not a UI Boolean. Animation or a health ping does not establish live physical analysis.
- Show actual candidates, conflicts, source pages, human confirmation, model limitations, review decisions, lock reasons and errors.
- Exercise the full source→candidate→confirmation→evaluation→review→export journey, including supported successful results and blocked failures.

**Done only when:** browser network traces and rendered content agree with API evidence; auth/423/OOD/missing artifact cases cannot be visually disguised; accessibility and existing UI tests remain healthy.

**Evidence:** browser E2E recordings/screenshots, network assertions, regression tests and actual exported-file checks. JSDOM tests alone are not browser E2E proof.

### V04-24 — Genuine optional TensorFlow/RAG/fine-tuning experiments

**Owner/review:** Aditya; independent experiment reviewer; budget/data owner where needed.

- If TensorFlow is claimed, use an actual supported TensorFlow environment, real fitting on the approved dataset/reference labels, learned weights, recorded training history and saved/reloaded model.
- Use the same frozen splits/metrics as the sklearn comparator. Train preprocessing only on training inputs; do not fabricate a loss curve or infer superiority from a framework name.
- Test that training affects fitted parameters and held-out outputs appropriately; record a negative result honestly and keep the stronger/simpler model if warranted.
- Add RAG only for an approved corpus and measured retrieval/citation need; add fine-tuning only after baseline error analysis justifies it. Pin revisions, rights and budget, and preserve a blind holdout.

**Done only when:** each claimed experiment has actual execution, lineage, comparisons and limitations. If deferred, mark N/A/deferred, not implemented 100. No mandatory gate depends on an optional framework unless the agreed scope explicitly requires it.

**Evidence:** real experiment record, model/checkpoint where appropriate, comparator results and an architecture decision.

### V04-25 — Actual database parity and security hardening

**Owner/review:** Aditya; security/release reviewer + Roshan.

- If PostgreSQL is a requirement, implement the actual runtime data layer/driver, not only Alembic files. Test SQLite/PostgreSQL CRUD, transactions, concurrency and provenance serialization parity.
- Test migrations, backups and recovery on an isolated database before production. Never silently connect to SQLite when a PostgreSQL deployment was requested.
- Enforce authenticated identity/roles and mission-level authorization on all reads/writes, artifacts, candidates, jobs, models and exports. Request-provided reviewer names are not proof of authority.
- Protect secrets/storage, restrict CORS/HTTPS deployment, bound uploads/parsing/archives, restrict outbound fetching, audit provider retention/permissions and isolate untrusted parsing.
- Secure approval/pickle storage and test cross-tenant access, path traversal, stale evaluations and service failure behavior.

**Done only when:** the requested database really serves the application, migrations/recovery work, and the agreed threat-model tests pass without bypassing necessary functionality.

**Evidence:** real engine/transaction traces, migration/restore results, authorization matrix and security review. PostGIS is optional unless actual spatial-query requirements justify it.

### V04-26 — Deploy, monitor, shadow-pilot and rollback

**Owner/review:** whole team; independent release authority and pilot/domain participants.

- Deploy only the approved release class with actual dependency/database parity, secrets and provider limits. Health/readiness must reflect real dependencies and degraded modes.
- Fix startup/stop scripts: verify owned process identity and readiness, report startup failure, and never kill unrelated processes merely because they use port 8000/5173.
- Observe parse/validation failures, abstention, reviewer corrections, source freshness, OOD, model/version use, latency, errors, drift and spend. Use sanitized logs and defined alert actions.
- Run a representative shadow pilot without autonomous decisions or external filings. Measure task time/correction/error rates against a defined baseline; do not claim insurance or launch-delay benefits without evidence.
- Demonstrate rollback of code/model/profile and recovery of database/provenance without changing historical human decisions.

**Done only when:** pilot acceptance, monitoring ownership, incident actions and rollback/recovery are demonstrated for the actual deployed scope. A Dockerfile or deployment guide is preparation, not execution evidence.

**Evidence:** deployment manifest, health/alert traces, pilot report, incident/rollback exercise and release sign-off.

### V04-27 — Independent final audit and completion decision

**Owner/review:** independent software, data, statistical/domain and release reviewers as applicable.

- Reproduce the agreed installation, unit/integration/browser tests, real-data experiments and reference analyses from documented inputs/artifacts.
- Check every row of the 28-area crosswalk against its actual evidence, not a source filename.
- Audit claims in UI, README, pitch, report templates, API schemas, model cards and deployment modes for consistency with the approved support matrix.
- Keep unresolved/optional/blocked work visible. A task count or green metadata validator cannot overrule missing scientific evidence.
- Record the exact commit, data/model/profile/config versions, reviewers, decision, residual limits and authorized release class.

**Done only when:** all required criteria pass with no hard blocker and actual independent approvals are recorded. Only then may the team describe the agreed bounded scope as complete; never equate that with 100% predictive accuracy or agency approval.

**Evidence:** final acceptance dossier and signed release decision. Do not create a completion tag/push or change final sign-off merely because this roadmap says what the result should be.

<a id="regressions"></a>
## 7. Mandatory regression test catalogue

These are **specifications to implement**, not claims that new test files already exist. Put them in a reviewed release-blocker suite with both API and UI/report assertions where applicable.

| ID | Input / condition | Required result |
|---|---|---|
| R01 | Claim 9,000 kg; quote says 4 kg | Rejected; valid 4 kg control accepted and unconfirmed |
| R02 | Claim 4 kg; quote says 40 kg | Rejected using numeric boundaries/meaning, not substring |
| R03 | Claim 4 kg; quote says 4,000 g | Accepted only through correct field/unit normalization |
| R04 | `passivated=True`; quote says “not passivated” | Rejected or normalized to the explicitly supported negative state |
| R05 | Quote says “will passivate after mission” | Planned action retained; not completed passivation |
| R06 | Invented field/page/quote, including page 999 | No accepted candidate; valid source/page control still works |
| R07 | Long introduction followed by mass 4.2 kg | Exact supporting span/page, not prefix; decimal-safe matching |
| R08 | Probability gold `1e-9`, prediction `1e-6` | Not a perfect field match under the approved scientific tolerance |
| R09 | Empty, garbage or corrupt claimed ESA file | Invalid/unverified, never trusted `VERIFIED` merely from reading bytes |
| R10 | File has no independently trusted expected checksum | At most hash-computed/unverified; schema/origin status separate |
| R11 | Missing real dataset/config, invalid ratios or zero estimators | Nonzero failure with actionable error; no generated substitute |
| R12 | Demo execution | Explicit synthetic origin; separate artifacts; no production approval |
| R13 | Four copies of one CDM event | All remain in one split; empty holdouts disclosed, not evaluated as adequate |
| R14 | Mixed event A/B history | Assembly rejected; label from B cannot be attached to A |
| R15 | Feature snapshot 0.5 days under a 2-day task | Rejected; all chronology and availability rules enforced |
| R16 | Duplicate message IDs with conflicting contents / NaN / infinity | Explicit rejection or documented quarantine, not silent overwrite |
| R17 | Same data/config/code in a compatible pinned environment | Reproducible manifests/predictions within declared numerical tolerances |
| R18 | Supplied numeric arrays without experiment lineage | Metrics-only output; no automatic “real ESA heldout model” claim |
| R19 | Empty mission / only empty evidence record | Unrated or zero-readiness contract; no positive alignment/physical result |
| R20 | Only confirmed mass of 4 kg | No disposal/passivation completion or alignment claim from missing fields |
| R21 | Confirmed passivation=false | Negative condition preserved; no passivation bonus or safe fallback |
| R22 | Three unconfirmed adverse UI records, including 50-year lifetime | UI/API/report agree; never ALIGNED because keys exist |
| R23 | Confirmed 50-year lifetime under an explicitly applicable configured rule | Retain 50 and rule result; never replace with 3.8 or conformance |
| R24 | Applicability unknown or finding NOT_EVALUATED | Report remains unassessed, not CONFORMS |
| R25 | Confirmed adverse collision/casualty value | Report actual value/status, not a hardcoded safe bound |
| R26 | No hardware/notification/tether evidence | Unknown/missing; no invented 40 Wh, notification sent or exclusion claim |
| R27 | HTTP 401/403/423 on any export | No “verified” local download; show lock/auth error |
| R28 | Valid fully reviewed packet, including recorded disagreements per policy | Accurate export succeeds; disagreements remain visible |
| R29 | Evidence/profile/model changes after evaluation/review | Stale eligibility handled according to versioned policy; no old approval silently reused |
| R30 | Canonical confirmed orbit 700 km / 53° | Use selected valid source or disclose conflict/unavailability; no hidden 500/97.4 default |
| R31 | Missing mission / inaccessible mission on any ML route | Correct existence/access response; no orphan prediction |
| R32 | Negative/invalid physical inputs or OOD regime | Explicit invalid/OOD result; no plausible success number |
| R33 | Named missing/unapproved/incompatible model | Explicit model error; no silent persistence fallback |
| R34 | Explicitly chosen persistence baseline | Valid baseline result clearly labeled as baseline |
| R35 | Tampered bytes, metadata mismatch or changed live weights | Integrity failure/immutable verified inference; never silently keep the same approved identity |
| R36 | Artifact ID/path escape / untrusted serialized object | Reject before loading; stay inside protected storage |
| R37 | Revocation then restart/second worker | Remains revoked; old on-disk approval cannot resurrect it |
| R38 | Approved artifact, compatible schema, fresh process | Same intended model loaded and used; feature order/units checked |
| R39 | Live disabled but credentials exist | No live request; mode truthful |
| R40 | Snapshot stale/corrupt/wrong catalog mapping | Correct disclosed failure/age; no fabricated fresh timestamp/elements |
| R41 | Expanded catalog ID such as 123456 | Supported modern representation, or explicit unsupported-format error—not truncated ID |
| R42 | Real-provider failure/non-200 | Source-specific policy; honest mode/status; no success label over synthetic replacement |
| R43 | PostgreSQL URL requested | Actual PostgreSQL runtime or explicit failure, not SQLite success |
| R44 | Stop script finds unrelated service on configured port | Does not kill it; only verified owned process stopped |
| R45 | Missing final acceptance thresholds/reviewer/evidence | Release check blocks; does not fill defaults or mark 100 |

The API status convention should be frozen in V04-02/14. Suggested distinctions: 401 missing credentials, 403 forbidden action, 404 unknown entity/model, 422 invalid input, 423 locked export, 503 unavailable required service. An OOD response may use an agreed structured status, but must not carry a fabricated valid prediction. Tenant-existence privacy policy must also be consistent.

<a id="data-protocols"></a>
## 8. Real data and evaluation protocols

### 8.1 ESA source facts checked for this roadmap

The official Zenodo record **4463683**, DOI **10.5281/zenodo.4463683**, describes anonymized 2015–2019 CDMs and released labels, under **CC-BY-4.0**. Metadata currently lists `Collision Avoidance Challenge - Dataset.zip`, **221,128,642 bytes**, checksum `md5:d19dc8875229f2f6893253c38adddc87`.

Re-read trusted metadata at acquisition time. Verify the published checksum and compute a local SHA-256 fingerprint; the published MD5 alone is not a strong authenticity guarantee. Record source transport, license, version and metadata identity. **Do not invent an upstream SHA-256**, use the empty-file hash, or treat a self-generated CSV as that release.

The official challenge page describes **162,634 training rows / 13,154 events** and **24,484 test rows / 2,167 events**, with 103 columns. Treat those as source-reference counts, not your post-filter usable counts. Inspect actual contents; report all differences/exclusions.

### 8.2 Correct CDM target/horizon

- Predict the final **reported** log10 risk, not observed collision occurrence.
- For a two-day forecasting protocol, feature data must be available with `time_to_tca >= 2` days.
- Official test histories are truncated; the full underlying events used for test have final messages within one day. Training includes other cohorts. Do not equate the current “any late message <2 days” helper with the full challenge target definition.
- Define whether you reproduce the official protocol or use a clearly named filtered alternative. Record final-label windows, availability, exclusions and released-label joins.
- Never use released final labels/private-test labels for feature building, preprocessing, model selection or threshold tuning.
- Partition before fitting transformations. Group by event; test additional mission/time separation only where identifiers genuinely support it. Do not infer chronology from arbitrary anonymized IDs.
- The high-risk-enriched test distribution is not a sample of ordinary real-time traffic; disclose selection bias in metrics and claims.

### 8.3 Extraction evaluation

Measure at least: parse success, field/value/unit precision and recall, grounded-citation correctness, abstention, conflict detection, critical false-positive cases, reviewer correction, latency and cost. Report per field and per independent mission family, with sample counts and uncertainty on estimates.

Both returning every possible value and returning nothing can game isolated metrics. Require adequate supported-field coverage **and** safe precision/abstention behavior according to frozen criteria.

### 8.4 Scientific data/reference options

| Need | Appropriate starting point | What it does not automatically establish |
|---|---|---|
| Historical CDM forecasting | Official ESA challenge release and documentation | Operational Pc, maneuver choice or decay prediction |
| Orbital pathway visualization | Permitted GP/OMM/TLE source plus compatible, reference-tested propagation | Precision ephemeris/covariance or full spacecraft properties |
| Decay/lifetime validation | Reviewed observed reentry histories and/or an approved physical reference simulator | Universal accuracy for every orbit/vehicle/attitude/solar regime |
| Physical conjunction assessment | Appropriate state/covariance/geometry inputs and specialist-selected numerical reference cases | That distance bands alone are calibrated collision probabilities |
| Debris environment / report assessment | Licensed/versioned agency products such as appropriate NASA tools | Automatic authorization to redistribute, run in Linux containers or certify all legal requirements |

NASA’s current DAS page, checked for this plan, lists **3.2.7**, Windows 11 optimization, a Python API and a required Software Usage Agreement. Recheck version/platform/environment files and permitted usage before integration. A licensed Windows worker or approved external assessment import may be needed; do not assume the software can simply be placed in a Linux Docker image.

CelesTrak’s current policy warns about expanded catalog IDs and formats beyond legacy TLE. It also requires source-specific caching and stopping/reporting non-200 responses. Recheck the actual policy before any automated fetcher; generic retry recipes do not override it.

<a id="commands"></a>
## 9. Configuration, commands and experiment records

### 9.1 Existing commands versus required future behavior

The CLI command names below already exist, but **their current demo-oriented behavior is not the v04 acceptance implementation**. New flags/validation/output artifacts must be implemented before relying on them.

| Existing command | v04 required behavior |
|---|---|
| `documents-ingest --config ...` | Read actual approved files; parse pages; emit origin/rights/quality records and frozen family splits |
| `documents-validate --config ...` | Validate actual source bytes/metadata/permissions, not a constructed sample record |
| `extraction-evaluate --config ...` | Use the selected real reviewed corpus/model; write value/citation metrics and errors |
| `cdm-validate --config ...` | Validate actual imported release, field units/schema/IDs and target assumptions |
| `cdm-build-events --config ...` | Build real cutoff-safe events, exclusions and checksummed split manifests |
| `cdm-train --config ...` | Fit configured baselines/model on actual selected inputs; save candidate artifact and traceable predictions |
| `cdm-evaluate --config ...` | Load specified approved/candidate research artifact as allowed; evaluate frozen holdout without refitting/tuning |
| `--demo` | Explicit synthetic mode only, with separate artifacts/labels and no production approval |

### 9.2 PROPOSED config contract—implement and validate it

This is a schema example, not a ready-to-run current config. Paths must be real local paths supplied by the operator. Numerical criteria are frozen separately before final evaluation.

```yaml
schema_version: orbit-experiment-v1
experiment_id: cdm_real_v1
purpose: forecast_final_reported_log10_risk
mode: research
seed: 42
dataset:
  origin: REAL_EXTERNAL
  source_manifest: /absolute/operator/path/esa/source-manifest.json
  table_manifest: /absolute/operator/path/esa/tables-manifest.json
  input_schema: esa-challenge-reviewed-v1
protocol:
  feature_cutoff_days: 2.0
  label_definition_id: official-protocol-reviewed-v1
  split_manifest: /absolute/operator/path/esa/split-manifest.json
features:
  contract_id: cdm-four-feature-v1
  ordered_names:
    - feature_time_to_tca_days
    - miss_distance_m
    - relative_speed_m_s
    - latest_early_risk
model:
  family: sklearn_gradient_boosting
  parameters:
    n_estimators: 40
    max_depth: 3
    learning_rate: 0.1
baselines:
  - last_observed_risk
  - train_median
outputs:
  run_directory: /absolute/operator/path/experiments/cdm_real_v1
approval:
  requested_stage: candidate
```

Keep model family allowlisted; do not allow a config to import arbitrary Python classes or execute commands. Changing parameters must affect the fitted estimator and saved record. A YAML parser accepting a dictionary is not semantic config validation.

### 9.3 Installation and regression commands

Choose/activate the approved clean Python environment first. At this baseline, the backend requirements contain an editable path relative to the **working directory**, so install them from `backend/` unless V04-03 deliberately changes that packaging contract.

**POSIX example, repo root:**

```bash
python -m venv .venv
. .venv/bin/activate
(cd backend && python -m pip install -r requirements.txt)
PYTHONPATH=.:backend python -m pytest ai_ml/tests backend/tests
npm ci --prefix frontend
npm --prefix frontend test
npm --prefix frontend run build
python .brain/scripts/validate_brain.py
python -m unittest discover -s .brain/tests -v
```

**PowerShell example, repo root, without changing global execution policy:**

```powershell
python -m venv .venv
$Py = Join-Path (Get-Location) ".venv\Scripts\python.exe"
Push-Location backend
& $Py -m pip install -r requirements.txt
Pop-Location
$env:PYTHONPATH = ".;backend"
& $Py -m pytest ai_ml/tests backend/tests
npm.cmd ci --prefix frontend
npm.cmd --prefix frontend test
npm.cmd --prefix frontend run build
& $Py .brain/scripts/validate_brain.py
& $Py -m unittest discover -s .brain/tests -v
```

At the inspected baseline, declared dependencies still need V04-03’s repair; do not treat the example installation as already certified. Add test isolation for model directories/databases before full-suite runs, and disable live/paid flags in ordinary CI. Real-source/model acceptance tests are separate approved jobs, never silently replaced by mocks.

Build and install the normal AI wheel in a fresh environment outside the checkout as an additional gate. `pip install -e` plus source-tree imports is not sufficient packaging proof.

### 9.4 PROPOSED experiment/approval record

Implement a strict record schema, not an unvalidated free-form success dictionary:

```json
{
  "record_status": "DRAFT_NOT_EXECUTED",
  "experiment_id": "REPLACE_AFTER_REAL_RUN",
  "code_commit": null,
  "dataset_manifest_sha256": null,
  "split_manifest_sha256": null,
  "feature_contract_version": null,
  "target_contract_version": null,
  "environment_lock_sha256": null,
  "model_parameters": {},
  "sample_counts": {},
  "prediction_artifact_sha256": null,
  "metrics": null,
  "validation_report_sha256": null,
  "model_artifact_sha256": null,
  "intended_use": "research_only",
  "approval": {
    "status": "PENDING",
    "reviewer_identity": null,
    "decision_time_utc": null,
    "decision_evidence": null
  }
}
```

This template must **fail release approval** until replaced with actual validated values and an independent decision. A checksum binds bytes, not the truth of labels or the authority of the signer; access controls and review provenance remain necessary.

### 9.5 `.brain` reporting loop

After task adoption, use the real mapped task ID with the existing `new_task_report.py` and `finalize_task_report.py` scripts. Record the actual produced path and commands/results. Inspect scripts’ current CLI help first; do not copy unexpanded placeholders into commands.

The existing `project_completion_check.py` can check the declared software scope. It does not independently validate physics or replace V04-27. A **PROPOSED** `check_v04_acceptance.py` may enforce evidence/schema consistency, but must not auto-invent human/domain approval or infer scientific success from file existence.

<a id="acceptance"></a>
## 10. Acceptance thresholds and evidence

### 10.1 Freeze numerical thresholds before final evaluation

Some software invariants are fixed: no false-safe defaults in the named regression set; no train/test event overlap; no accepted tampered artifact; no export after denied eligibility; no invented data provenance.

Model performance thresholds cannot responsibly be guessed from the project name. The owner and qualified reviewer must set:

- supported population, epochs, feature domains and intended decisions;
- tolerated value errors per field/unit/representation;
- minimum independent holdout coverage/sample size and subgroup reporting;
- critical false-positive and abstention constraints;
- baseline comparison requirements and uncertainty on differences;
- lifetime/reference numerical error limits;
- uncertainty coverage/width and OOD handling criteria;
- latency/resource/cost/freshness limits for the deployed environment.

**Until these are approved, statistical/scientific acceptance is BLOCKED—not automatically passed.** No post-test threshold changes to make a chosen model look successful; a new criterion version requires a new independent evaluation protocol.

### 10.2 Every completion record must contain

1. Actual code commit and config/schema/profile/model versions.
2. Source/data rights and immutable input identities.
3. Exact command/environment and nonempty relevant results.
4. Positive, boundary, negative and failure-mode examples.
5. Actual predictions/output artifacts, not only summary numbers.
6. Independent review, unresolved limitations and authorized use.
7. Reproduction instructions and any required access approvals.

A file, screenshot of a terminal, green status, or health endpoint is supporting evidence—not the complete acceptance package by itself.

### 10.3 Evidence storage layout—PROPOSED

```text
.brain/reports/v04/                  sanitized, append-only review summaries
experiments/<run-id>/               configs, split references, metrics, errors
model_artifacts/candidates/         quarantined research candidates
model_artifacts/approved/           protected approved snapshots + manifests
docs/validation/v04/                contracts, reference cases, acceptance decisions
<approved-data-root>/raw/           immutable licensed/private source bytes
<approved-data-root>/processed/     versioned transforms and labels
<approved-data-root>/manifests/     data and split identities
```

Final storage/backend paths may differ, but must be explicit. Keep restricted bytes, credentials and potentially sensitive manifests out of public Git. Publish sanitized aggregate evidence where permitted. Unit fixtures must be clearly synthetic and small; no real archive download in ordinary tests.

<a id="crosswalk"></a>
## 11. All 28 rated areas: what earns completion

The old numbers below were subjective maturity ratings at the audited baseline, **not model accuracy or measured completion percentages**. “100 evidence” means the stated scoped criteria and relevant release gates are actually satisfied; it is not awarded by filling this table.

| # | Area / previous rating | Evidence required for 100 within agreed scope | Primary tasks |
|---|---|---|---|
| 1 | Real ESA acquisition — 5 | Genuine verified permitted release, correct schema/import, no synthetic substitution | 04, 09, 10 |
| 2 | Real document corpus/labels — 10 | Permissioned, independently reviewed gold data and adequate family-disjoint holdout | 04–06 |
| 3 | Provenance/integrity — 35 | Trusted source expectations, raw-byte lineage, rights and honest separate states | 02, 04, 25 |
| 4 | Parsing/pages — 60 | Verified file/page/table/OCR handling and explicit unsupported cases | 05 |
| 5 | Normalization — 55 | Correct typed units/representations across all paths; ambiguity preserved | 02, 07 |
| 6 | Splits/cutoffs — 65 | Correct real-data target chronology, disjoint identities, exclusions and frozen manifests | 06, 10, 12 |
| 7 | Decay prediction — 25 | Independent domain-approved numerical/observational validation and correct served method | 16, 17, 19, 14 |
| 8 | Collision classification — 20 | Meaningful reviewed target, appropriate data, independent evaluation and scope guards | 18, 19 |
| 9 | Physical Pc — 10 | Appropriate inputs/covariance and trusted numerical-case validation; no proxy mislabeling | 16, 18, 19 |
| 10 | Historical CDM forecast — 30 | Actual input-to-holdout experiment and artifact-served forecast of reported risk | 09–14 |
| 11 | LLM/Agent37 integration — 60 | Actual authorized model inference, measured document quality, budget/privacy controls | 06–08, 23 |
| 12 | Grounding — 30 | Field/value/unit/span correctness, negation/plans/conflicts and safe abstention | 07, 08 |
| 13 | Confidence/calibration — 5 | Valid independent calibration and coverage/OOD reports for each claimed meaning | 08, 12, 19 |
| 14 | TensorFlow — 5 | Actual justified fit/save/reload/comparator experiment, or visibly N/A rather than implemented | 24 |
| 15 | Training/preprocessing — 65 | Real configured fit, train-only transforms, reproducible outputs and safeguards | 03, 10, 11 |
| 16 | Baselines — 55 | Properly fitted/evaluated baselines on identical valid splits; honest comparisons | 11, 12 |
| 17 | Metrics/report machinery — 45 | Correct typed tolerances/ID checks and outputs bound to real experiment lineage | 07, 12 |
| 18 | Independent real-data benchmark — 10 | Frozen blind holdout, sufficient coverage, reproduction and independent claims review | 06, 08, 10–12 |
| 19 | Config-driven runs — 30 | Validated settings actually control files, splits, models, seeds and outputs | 03, 11 |
| 20 | Registry/persistence — 60 | Protected immutable artifacts, approvals/revocations, compatibility and fresh-worker checks | 13, 25 |
| 21 | Serving integration — 45 | Intended model used with correct fields/units/domain/access; explicit unavailability | 14, 17–19 |
| 22 | Space Credit Index — 15 | Defined validated construct, relevant inputs, no positive defaults, all consumers identical | 20, 21, 23 |
| 23 | Live telemetry — 40 | Permitted real fetch, truthful failure/freshness, correct mapping and verified replay | 15 |
| 24 | Orbital dashboard data — 25 | Reference-tested actual inputs/pathways and accurate source/model labels | 16, 19, 23 |
| 25 | Markdown/PDF formatting — 85 | All-format semantic parity, complete citations/Unicode, real performance and access tests | 22, 23 |
| 26 | Analytical ODAR/EOMP — 20 | Actual scoped assessments and confirmed values; unknown/adverse states retained; domain-reviewed content | 17–22 |
| 27 | Human review/export safety — 50 | Authenticated review authority and the same fresh gate on every API/UI/format | 02, 21–23, 25 |
| 28 | Production/scientific acceptance — 15 | Actual runtime security/database/pilot/monitoring/rollback and independent scientific release approval | 17–19, 25–27 |

If the original unqualified “any satellite / universal safety / guaranteed filing or premium benefit” claims are retained, they need evidence for that full claim. Do not mark them complete by validating only a narrower LEO demo and hiding the limitation.

<a id="schedule"></a>
## 12. Schedule, resources and stop conditions

### 12.1 Planning estimates, not delivery guarantees

| Window | Realistic focus |
|---|---|
| First 1–2 work sessions | Adopt scope, reproduce red cases, stop misleading output paths |
| Roughly 1–2 weeks | Canonical contracts, clean installs/config, provenance and robust pipeline plumbing |
| Roughly 2–6 weeks, permission-dependent | Real document annotation/evaluation; CDM import/baseline experiments in parallel |
| Several additional weeks or months | Scoped orbital science/reference validation, uncertainty and qualified review; access gaps can block this indefinitely |
| After acceptance, roughly 2–6 weeks | Controlled deployment/shadow pilot, monitoring and recovery evidence |

These windows depend on team skill, data rights, reviewer availability and actual results. They are not an extension or override of any hackathon code-freeze rule. A truthful demo can ship earlier; a newly validated orbital model cannot be manufactured overnight by checking a roadmap.

### 12.2 Resource defaults

- Start with CPU tabular baselines and a modest development machine. Measure before buying hardware.
- Labeling, permission management and qualified review are often larger bottlenecks than model fitting.
- A local LLM needs an approved model/license and compatible RAM/VRAM; an external provider needs explicit data permission, budget and retention controls. Neither is automatically necessary for the first baseline.
- Use separate approved storage for real archives/weights and private documents; allow for extraction/working copies and impose expansion limits.
- Do not install TensorFlow into the production environment simply to raise a rubric score. Use a compatible optional experimental environment if V04-24 is executed.

### 12.3 Stop and mark blocked when

- Source permissions or provider processing rights are unknown.
- A claimed real input is actually generated or cannot be independently identified.
- Labels, splits or feature chronology are unreliable.
- Model accuracy/uncertainty criteria are unset or fail.
- Qualified review for a scientific/regulatory claim is unavailable.
- A required covariance/state/epoch or supported physical assumption is missing.
- A model/profile/data version changes after approval without re-evaluation.
- Production auth, migration, budget or recovery testing is not approved.

The correct response is a visible blocker and an honest narrower release—not synthetic success, fabricated approval or another “100% complete” document.

<a id="first-sessions"></a>
## 13. First three work sessions

### Session 1 — agree scope and prove the failures

- [ ] Read current `.brain` contract, scope, task records and this file; record the actual commit.
- [ ] Create the formal v04 task mapping and acceptance owners; preserve older reports.
- [ ] Approve only the first scoped changes; keep live/provider/production flags off.
- [ ] Reproduce: 50→3.8 report, mass-only AAA, unconfirmed-adverse UI alignment, export 423 fallback, fake ESA verification, tiny-probability/negation cases.
- [ ] Save failing outputs and positive controls; do not mass-mark future work done.

### Session 2 — repair the shared truth contract

- [ ] Agree canonical fields/time bases, typed units and independent origin/review/status states.
- [ ] Remove false-safe defaults and unsupported claims without breaking valid reviewed flows.
- [ ] Use one score/result contract across API/UI/report; reject invalid aliases explicitly.
- [ ] Repair dependencies and config semantics; test the normal package outside the checkout.
- [ ] Record the actual tests, remaining failures and independent review.

### Session 3 — start one real vertical slice

- [ ] Choose a permissioned document pilot and/or approve official ESA metadata/acquisition.
- [ ] Replace the fake ESA “verified” path with real source validation; retain tiny samples only as synthetic unit fixtures.
- [ ] Produce actual labeled/split manifests before fitting anything.
- [ ] Plan the baseline experiment and holdout access policy; do not select the winner from final-test results.
- [ ] Schedule domain feasibility review for the physical-lifetime/Pc track; leave it blocked if expertise/data are absent.

<a id="final-audit"></a>
## 14. Final release audit

**Do not fill these now.** Use them only after task evidence exists.

- [ ] Every required claim maps to a supported feature, data/reference source, acceptance criterion and reviewed result.
- [ ] All named regression cases and legitimate positive workflows pass in a clean supported environment.
- [ ] Actual source bytes, labels, split IDs and experiment predictions reproduce the reports.
- [ ] Scientific claims are reviewed within an explicit support matrix; OOD and unavailable cases abstain.
- [ ] Approved model/profile/source versions are used by the actual API and reflected in UI/PDF outputs.
- [ ] Unknown/adverse evidence never becomes a safe number, alignment badge or fabricated engineering fact.
- [ ] Review authorization/freshness and all-format export gates hold in real browser and direct API tests.
- [ ] No private data/secrets/untrusted artifacts are exposed; live calls and costs follow explicit permissions.
- [ ] Actual runtime database/deployment, monitoring, pilot and rollback evidence exist for the release class.
- [ ] Independent reviewers have recorded real decisions; unresolved/optional work remains visible.
- [ ] The README, pitch, UI and model/report cards say exactly what was validated—not broader universal/agency/insurance claims.

**Final wording when justified:** “All agreed acceptance criteria for release class ___, supported population ___, data/model/profile versions ___, and intended use ___ have been independently reviewed and met at commit ___, with limitations ___.”

That is more meaningful than an unsupported “100/100.” It does not claim 100% accuracy, zero mission risk or external regulatory authorization.

<a id="sources"></a>
## 15. Primary references and learning order

### Repository references inspected for v04

- [Operating contract](https://github.com/adishxm/orbitscore/blob/2e614cb323a7cd54ee243a45c1621d9757c14645/.brain/AGENT.md), [actual scope](https://github.com/adishxm/orbitscore/blob/2e614cb323a7cd54ee243a45c1621d9757c14645/.brain/project-scope.json), [state](https://github.com/adishxm/orbitscore/blob/2e614cb323a7cd54ee243a45c1621d9757c14645/.brain/state.json).
- [v02](https://github.com/adishxm/orbitscore/blob/2e614cb323a7cd54ee243a45c1621d9757c14645/.brain/NEXT_STEPS_aditya_v02.md), [v03](https://github.com/adishxm/orbitscore/blob/2e614cb323a7cd54ee243a45c1621d9757c14645/.brain/NEXT_STEPS_aditya_v03.md), [research scope](https://github.com/adishxm/orbitscore/blob/2e614cb323a7cd54ee243a45c1621d9757c14645/research/README.md).
- Existing `AI_ML_Main_Idea_Completion_Report.md` and audit evidence supplied in this conversation provide the detailed historical reproductions. They are not automatically repository files; copy only sanitized reviewed material if adopting it.

### Official data and methods

1. ESA: [challenge definition](https://kelvins.esa.int/collision-avoidance-challenge/challenge/), [data/units/protocol](https://kelvins.esa.int/collision-avoidance-challenge/data/), [scoring](https://kelvins.esa.int/collision-avoidance-challenge/scoring/).
2. Zenodo: [release 4463683](https://zenodo.org/records/4463683), [machine-readable metadata](https://zenodo.org/api/records/4463683).
3. CelesTrak: [GP/OMM formats](https://celestrak.org/NORAD/documentation/gp-data-formats.php), [current usage policy](https://celestrak.org/usage-policy.php).
4. Space-Track: [official documentation/access rules](https://www.space-track.org/documentation). Account access does not imply permission to every operational product or redistribution.
5. NASA: [DAS acquisition/platform/version guidance](https://orbitaldebris.jsc.nasa.gov/mitigation/debris-assessment-software.html), [NASA conjunction-assessment reference](https://nodis3.gsfc.nasa.gov/OCE_docs/OCE_51.pdf). Qualified reviewers must select/read the applicable current method/standard, not rely only on this roadmap.
6. [Python SGP4 package documentation](https://pypi.org/project/sgp4/) and [Skyfield satellite guidance](https://rhodesmill.org/skyfield/earth-satellites.html) as implementation/reference starting points, not a substitute for domain validation.

### ML/provider implementation guidance

- scikit-learn: [common pitfalls/leakage](https://scikit-learn.org/stable/common_pitfalls.html), [model persistence and security](https://scikit-learn.org/stable/model_persistence.html).
- Provider strict structured-output documentation, e.g. [OpenAI structured outputs](https://platform.openai.com/docs/guides/structured-outputs), while retaining provider-independent contracts and semantic checks.
- A previously discussed local model such as [Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct) is an established **example**, not a newest/best-model claim. Recheck its model card/license/revision and benchmark alternatives before downloading or using private documents.

**Learning order for a beginner:** canonical fields and units → source rights/provenance → parsing and labels → split/leakage basics → baselines and actual `.fit()`/`.predict()` → correct evaluation → artifact/load/serve chain → scoped physics with a qualified reviewer → calibrated uncertainty → truthful reports and controlled operations.

---

## Closing instruction to the implementation agent

Start with **V04-00, then V04-01**. Produce real evidence for one adopted task, seek independent review, and only then advance. Do not mark this entire document complete because the previous code compiled or because files with the requested names exist. Keep the boundary between a good prototype, validated research and authorized real mission use explicit throughout.
