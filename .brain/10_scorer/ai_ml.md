# AI/ML Roadmap to a Defensible 10/10

**Area:** AI/ML only  
**Repository commit inspected:** `403051612cf6ac026d6a31be7d8ca6b826da2a93`  
**Commit date / inspection date:** 2026-10-25 (commit subject: `feat(api): add informative root endpoint at / linking to docs and frontend`)  
**Current score:** **4/10**  
**Evidence status:** Repository files were inspected; this document does not claim test suites or commands were run.

## Score and basis

The score is a roadmap judgment of maturity against a bounded, responsible AI/ML research-and-candidate-extraction scope—not a score for regulatory compliance or flight-readiness. OrbitScore's product boundary is pre-review evidence organization and human review, with synthetic demonstrations explicitly not safety or compliance assessments (README.md; `docs/Technical_Stack_Final.md`).

Credit for the current state: there is a substantial modular research implementation under `ai_ml/`: source/document schemas and provenance fields, document-family and CDM event-group split helpers, cutoff/domain checks, extraction validation, baseline metrics, a CDM training function, a hash-checked artifact registry, explicit research-only forecast output, and an AI adapter described as candidate-only. The repository has tests for these components. This is more than a concept or notebook.

The score is held down because the observed evidence does not establish a validated predictive product. `ai_ml/orbital_ml.py` generates synthetic feature/label samples from hand-coded equations and threshold labels at lazy initialization; the displayed confidence interval is a fixed ±12% band rather than empirically calibrated uncertainty. `ai_ml/adaption_pipeline.py` evaluates a regex baseline on one held-out synthetic sample from a five-sample corpus. CDM tests use three hand-built events (one test event), not evidence of generalization. `ai_ml/cli.py` paths visibly construct toy records/events in handlers; a configured mode label is not itself evidence of a real ingestion/training run. Dataset-source validation checks hash length rather than recomputing it from source bytes. The registry has useful checksum and approval gates, but observed code uses pickle deserialization and local metadata/approval state; this is not by itself a secured, auditable model-governance process. No tested calibration, monitoring, drift response, or independent acceptance evidence was observed in the inspected files. Some README/technical-stack “passed” counts are repository claims, not runs performed for this roadmap.

**Current observed state versus unverified:** code and tests exist as described above. Claims of successful suite runs and any external corpus coverage are **unverified in this inspection**; this task did not run tests. The current real-world availability, rights, completeness, label quality, and representativeness of any ESA/CDM, regulatory, or mission documents are **unverified**. No real operational validation is inferred.

## Scope and 10/10 definition

The target scope is bounded: (1) offline, reproducible research on document-field extraction and historical CDM risk-report forecasting; (2) synthetic orbital-model demonstrations clearly separated from validated inference; and (3) optional extraction suggestions that remain unconfirmed until human review. The Space Credit Index and deterministic rules are not ML validation targets except where their interfaces consume ML outputs. Do not expand scope to autonomous collision avoidance, maneuver recommendations, flight certification, official regulatory determinations, or claims of operational safety.

A 10/10 means excellent, auditable engineering for this declared scope—not literal perfection. It requires fit-for-purpose and rights-reviewed data with lineage; leakage-resistant splits and locked test sets; strong baselines and reproducible comparative evaluation; honest calibration/uncertainty and abstention; versioned and reviewable artifacts; explicit online/offline boundaries; candidate-only outputs and safe failure/rollback; and acceptance evidence that an independent reviewer can reproduce. Insufficient real evidence should result in “research-only / not validated,” not a relaxed bar or unsupported claim.

## Sequenced phases

Phases are gates: do not promote work into a later phase if the prior gate fails. Thresholds below are proposed roadmap acceptance criteria, to be fixed before looking at final test results; they are not claims of current performance.

### Phase 0 — Freeze scope, inventory claims, and establish a clean baseline

**Deliverables:** AI/ML component and route inventory; matrix of implemented, demo-only, research-only, and production-connected behavior; versioned experiment protocol; per-model intended-use and prohibited-use statements; baseline run manifests. Separate the synthetic orbital surrogate from trained-on-observations models and from extraction candidate generation. Clarify whether each CLI mode ingests its declared inputs or only emits demonstrations.

**Dependencies:** none. Use current source and tests as the baseline. Grounded starting commands include `python -m pytest ai_ml/tests` and `python -m ai_ml.adaption_pipeline`; README documents these but this roadmap has not run them. Inspect actual CLI via `python -m ai_ml.cli --help` and source `ai_ml/cli.py` before presenting configured runs as training evidence.

**Acceptance:** 100% of routes/functions that return a learned or heuristic score appear in the inventory with inputs, output meaning, intended user, dependencies, data lineage, safety label, and fallback. Each advertised training/evaluation command has an integration test proving whether it consumes configured data; demo mode is labeled synthetic in machine-readable output. No output claims compliance or maneuver guidance. Every numeric model claim in docs links to a reproducible report or is marked illustrative/unverified.

### Phase 1 — Dataset provenance, quality, permissions, and split governance

**Deliverables:** immutable dataset manifests with source URI/owner, retrieval time, license/terms and permitted uses, privacy class, raw-file digest recomputed from bytes, parser/version, annotation method and reviewer, label definition, family/event identifiers, exclusions, and transformation history. Publish data cards and an issue log. Add duplicate/near-duplicate and conflicting-label checks. Keep confidential/ITAR-restricted material out unless explicit governance and authorization are established; public availability alone does not imply training permission. Build a real-data eligibility gate and a synthetic-data provenance catalog. Maintain separate, versioned corpora by task and domain.

**Split discipline:** preserve mission-family grouping for document extraction and event grouping for CDM; additionally protect temporal holdouts when the intended evaluation is future forecasting. Fit all preprocessing on training data only. Lock a test set and record access. Do not treat public regulation prose as representative of proprietary flight documents. Synthetic examples can test schema, edge cases, and safety invariants, but cannot establish performance on real filings or operational data.

**Dependencies:** Phase 0 scope and task definitions; rights/security review before collection.

**Acceptance:** every training/evaluation row resolves to a manifest; hashes are recomputed and verified; invalid rights/privacy/label/source metadata blocks use; no family or event overlap across splits; time cutoff and event-message chronology tests reject leakage; duplicate audit reports zero unexplained cross-split duplicates; test data is inaccessible to tuning steps in the recorded protocol. Until sufficient eligible real data exists, reports explicitly state synthetic-only limits and make no real-data generalization claim.

### Phase 2 — Baselines, evaluation design, and robust measurement

**Deliverables:** pre-registered task-specific metrics and error costs; baselines including current regex/deterministic extraction, persistence, dummy median/mean, and appropriate domain heuristics; confidence intervals via event/family-cluster bootstrap; stratified results by field/document family, forecast horizon, and data quality; failure examples and calibration/coverage curves. Add adversarial and out-of-domain cases. For extraction, measure exact normalized field precision/recall/F1, per-field scores, false extraction/hallucination rate, abstention and locator correctness. For CDM, report MAE/RMSE and decision-threshold performance separately; do not call reported log-risk a physical collision probability.

**Dependencies:** Phase 1 frozen datasets and labels. Existing references: `ai_ml/evaluation/extraction_metrics.py`, `ai_ml/evaluation/cdm_metrics.py`, `ai_ml/training/baselines.py`, `ai_ml/evaluation/benchmark_report.py`.

**Acceptance:** evaluation scripts consume a pinned manifest and emit machine-readable metrics, split IDs/hashes, baseline comparison, and confidence intervals. Tests prove empty, malformed, hallucinated, wrong-unit, and out-of-domain outputs degrade metrics or abstain correctly. On a sufficiently powered locked test set, candidate model must beat the predeclared baseline on the primary metric with a positive lower 95% clustered confidence bound, while meeting predeclared per-field/error caps; otherwise retain baseline and describe model as non-superior. A five-record synthetic test set is explicitly not sufficient for this gate.

### Phase 3 — Reproducible training and honest uncertainty

**Deliverables:** pinned environment/dependency lock, explicit seeds and deterministic controls, dataset and code revision hashes, configuration, feature/label definitions, training logs, model card, and one-command clean rerun. Separate model selection/validation from final test. Replace hand-coded synthetic-label “training” used in `orbital_ml.py` with either clearly named deterministic illustrative calculations or a genuine versioned observational/physics-simulator training and evaluation pipeline. Never present synthetic labels as independent physical truth. Quantify uncertainty empirically (e.g. held-out residual intervals/conformal intervals or calibrated probabilistic predictions), by relevant strata, and abstain outside validated domain.

**Dependencies:** accepted data and evaluation protocol from Phases 1–2.

**Acceptance:** independent clean-environment reruns on the same input manifest reproduce predictions/metrics within declared numerical tolerance and identical artifact/data/config hashes; retraining cannot read test outcomes; shuffled-label and leakage-injection tests expose invalid setups; uncertainty coverage is reported with sample count and intervals, and its predeclared coverage criterion holds on a separate calibration/validation set and an untouched test set. For an illustrative-only synthetic surrogate, responses and UI/docs explicitly avoid the term calibrated 95% confidence interval unless it is empirically supported.

### Phase 4 — Artifact registry, inference contracts, and safe integration

**Deliverables:** registry metadata that binds model bytes to training code, dataset manifest, validation report, feature schema, environment, intended-use policy, approval identity/time, and lifecycle status; signed or otherwise access-controlled promotion/revocation; secure artifact format/loading that does not deserialize untrusted pickle; immutable versions and audit history. Define inference schemas with units, ranges, missingness, source references, model version, uncertainty, and abstention reason. Keep `ai_ml.inference.cdm_forecast` explicitly research-only and prevent research artifacts from being used by operational routes. Extraction results remain candidate-only (`human_confirmed=False`) with exact evidence locator/quote; no model can approve a finding or alter a human decision.

**Dependencies:** reproducible reports and model cards from Phase 3. Existing starting point: `ai_ml/inference/registry.py`, `ai_ml/inference/cdm_forecast.py`, adapter tests and backend extraction boundary.

**Acceptance:** reject unsigned/unapproved, mismatched-hash, revoked, wrong-schema, wrong-version, and out-of-domain artifacts; artifact promotion requires passing report and authorized reviewer; round-trip and restart tests verify exact version/checksum. Integration tests prove AI disabled, timeout, provider error, invalid schema, and missing model all fail closed to deterministic fallback or explicit unavailable status. Every extracted field is unconfirmed and has a valid source locator; automated ML cannot write review decisions. No route or UI labels forecast as operational Pc, certification, or maneuver advice.

### Phase 5 — Shadow evaluation, monitoring, and rollback

**Deliverables:** if—and only if—authorized data and deployment scope support it, run a non-decisioning shadow trial with privacy review, human adjudication, drift/coverage/error monitoring, incident escalation, retention controls, and a documented rollback playbook. For the declared research product, this can remain offline: replay pinned historical data and maintain release-by-release regression suites. Define owner, trigger, and response for data drift, calibration deterioration, schema changes, provider outage, and suspected leakage or data-rights breach.

**Dependencies:** Phases 1–4 and explicit product/privacy authorization; no operational deployment is implied.

**Acceptance:** rehearsed rollback restores prior approved artifact/config and verifies checksum; revoked artifact cannot be loaded after restart; simulated provider outage and drift alarm do not change human decisions or bypass candidate status. Shadow outputs are never consumed as authoritative results. Monitoring thresholds are predeclared and supported by sample sizes; inadequate volume is reported as inconclusive, not as absence of risk.

### Phase 6 — Independent release review and evidence-backed claims

**Deliverables:** reviewer-signed release dossier linking scope, data cards, protocol, split manifests, baseline and model results, uncertainty, known limitations, safety tests, registry approval, rollback evidence, and claims-to-evidence map. Re-run full AI/ML suite and relevant backend integration tests in CI; archive command output, environment, and artifacts. Update README and technical-stack descriptions to distinguish measured results from intended capabilities.

**Dependencies:** all applicable prior gates. If real-data validation is unavailable, release dossier must retain research-only status and state that explicit limitation.

**Acceptance:** independent reviewer reproduces the locked evaluation; all critical safety and provenance checks pass; no unresolved high-severity data-rights, leakage, inference-boundary, or unsafe-claim issue; every public model metric has a traceable report and denominator; no unsupported regulatory, operational, or safety assertion remains. Failed or underpowered evaluation blocks promotion, not just documentation.

## Grounded commands and evidence sources

The repository documents `python -m pytest ai_ml/tests` as the isolated suite command and `python -m ai_ml.adaption_pipeline` as the synthetic extraction workbench. They were **not run for this roadmap**. Useful inspected evidence includes:

- `ai_ml/adaption_pipeline.py` and `ai_ml/tests/test_adaption_pipeline.py`: five hand-curated synthetic samples; deterministic positional split; regex baseline; one test sample; dataset digest; safety flags. Tests assert broad nonzero metrics and basic invariants, not generalization.
- `ai_ml/datasets/documents.py`, `ai_ml/datasets/esa_cdm.py`, `ai_ml/training/train_cdm.py`: family/event split and cutoff-safe training concepts, to be stress-tested with leakage and chronology tests.
- `ai_ml/datasets/sources.py`: provenance/permission schema exists, while hash validation currently checks digest length, not source-byte agreement.
- `ai_ml/training/baselines.py`, `ai_ml/evaluation/cdm_metrics.py`, `ai_ml/evaluation/extraction_metrics.py`, `ai_ml/evaluation/benchmark_report.py`: baseline and metric/report foundations.
- `ai_ml/inference/registry.py`, `ai_ml/inference/cdm_forecast.py`: checksum, approval, domain, and research-only boundary foundations; further trust, lifecycle, and safe-loading controls are needed.
- `ai_ml/orbital_ml.py`, `ai_ml/credit_index.py`, `ai_ml/tests/test_orbital_ml_and_credit.py`: synthetic training targets, fixed uncertainty band, threshold-derived outputs, and heuristic score behavior. Existing tests verify determinism and labels but not external validity or calibration.
- `README.md` and `docs/Technical_Stack_Final.md`: claims of 33 tests and components are documentation claims; verify in CI rather than treating as independently established here.

## Principal risks and mitigations

1. **Synthetic-to-real overclaim:** template-generated prose or hand-coded labels can produce flattering test scores without representing real documents or orbital dynamics. Label demo results; require eligible real-world validation for any generalization claim; otherwise remain research-only.
2. **Leakage and tiny samples:** messages from one event, revisions, or near-duplicate documents can cross splits; tiny test sets yield meaningless metrics. Group by family/event, add temporal holdout and duplicate checks, use clustered uncertainty, and refuse promotion when underpowered.
3. **Weak labels and source rights:** a valid-looking source record can still have wrong labels, invalid permission, or a fabricated checksum. Recompute content hashes, record license/authorization and label review, and block undocumented data.
4. **Misleading confidence/compliance outputs:** a fixed interval, classifier probability, or heuristic threshold is not calibrated physical uncertainty or regulatory determination. Rename illustrative quantities, expose uncertainty limits, and prohibit unsupported claims.
5. **Artifact compromise or irreproducibility:** pickle loading, mutable approvals, missing environment/data lineage, or model replacement can undermine trust. Use controlled formats/loading, signatures/access controls, immutable provenance, revocation, and reproducible promotion evidence.
6. **Boundary escape or automation bias:** timeouts, fallback, API integration, or polished UI may make candidates appear authoritative. Test fail-closed behavior, preserve citations and unconfirmed state, separate research endpoint, and retain explicit human decision ownership.
7. **Overfitting release metrics:** repeated test-set tuning invalidates holdout evidence. Lock test access, log experiment changes, require new holdout for repeated selection, and use independent review.

## Done gate

AI/ML reaches the roadmap’s 10/10 only when Phases 0–6 applicable to the declared offline/candidate-only product pass their measurable gates, with independently reproducible evidence and no unresolved critical risk. The artifact must show exactly what is implemented versus research-only, and all claims must be bounded by validated data and intended use. If authentic, authorized, adequately powered real data or calibrated evidence is unavailable, the done gate can still be met for a clearly labeled **research workbench**, but not for a claim of validated real-world performance, operational prediction, safety, maneuver utility, or regulatory compliance. Literal perfection is neither promised nor the criterion; evidence-backed fitness for the declared scope is.
