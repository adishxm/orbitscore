# OrbitReady product research and context

**Purpose:** short product-context briefing derived from the project’s original research dossiers and current prototype. It is an internal synthesis, not an independent scientific, legal, market, or user study. Use the source files linked below for evidence and details; re-check primary sources for decisions that depend on current rules or standards.

## Product problem and user

The project targets a narrow pre-review workflow for student, university, and small spacecraft teams assembling evidence for a qualified engineering, agency, or regulatory review. Relevant facts may be spread across mission sheets, design documents, spreadsheets, and policy references. The product hypothesis is that teams benefit from seeing which inputs are present, where they came from, whether values conflict or remain unconfirmed, which carefully scoped profile was selected, and what human review is still needed.

This is a product hypothesis informed by desk research and the team’s design work. The package does not include representative user research sufficient to establish market size, willingness to pay, adoption, or quantified time savings. Do not state those as proven findings.

## Product thesis

OrbitReady/OrbitScore is best framed as a **source-linked, human-reviewed pre-review evidence workspace**. Its differentiation hypothesis is traceability and review flow—not a new orbital model or an autonomous compliance decision. The intended loop is:

`mission context → evidence and locators → human confirmation → one selected, scoped profile → deterministic findings → review decisions → cited local review packet`

Optional AI may help propose document fields or explanations in a future version. It must remain an assistive extraction layer, must show uncertainty and source locators, and must never make the final finding or reviewer decision. The core workflow should remain useful when AI is disabled.

## Product boundaries and safe language

The system does not perform orbital propagation, conjunction assessment, collision probability computation, debris-environment prediction, maneuver planning, official certification, regulatory filing, or NASA DAS analysis. A result such as `PASS_UNDER_PROFILE` means only that configured software logic returned that state for the selected fixture/profile and inputs. It is not proof of mission safety or legal compliance. “Inspired” profiles are team interpretations, not endorsements by an agency.

The current demo uses synthetic Asteria-3 fixtures. Synthetic inputs, sample citations, and counterfactuals are not real mission evidence. Provenance hashes can detect certain edits in the tested local chain; they do not establish signer identity, immutability, completeness, or legal admissibility.

## Research-supported design principles from this project’s source base

1. **Keep scope explicit.** A policy requirement may depend on agency, jurisdiction, mission/object class, altitude, method, date, and other applicability conditions. Preserve those conditions rather than silently generalizing a rule.
2. **Keep evidence and interpretation separate.** Store the source document, locator, date/version, value, unit, confirmation state, and the team’s interpretation distinctly.
3. **Fail visibly on missing or conflicting evidence.** Do not invent defaults or collapse missing, conflict, out-of-scope, and passing states.
4. **Make the human control point real.** Candidate extraction is not confirmed data; a finding is not a review decision; an export should represent reviewed material and its limitations.
5. **Keep the evaluator reproducible.** Where a profile is modeled, deterministic logic and explicit versioning are preferred over opaque generated decisions; domain correctness still requires qualified review.
6. **Measure before claiming value.** Establish baseline tasks, recruit representative users, measure completion time/error rates, and document limitations before making quantified workflow or business claims.

These are design principles synthesized from the library, not proof that every cited study directly evaluated OrbitReady.

## Current prototype status

The package has a local/mock React frontend, a separate FastAPI prototype, deterministic profile fixtures, human confirmation/review concepts, synthetic missions, local browser storage, an in-process API state, a provenance chain, tests, and a mock JSON download that remains gated by review decisions. These components are not yet one fully integrated, production-grade service.

Still planned or incomplete: wiring the UI to the live API; upload and robust PDF/text extraction; durable database storage and migrations; durable/multi-user provenance; a robust cited report/PDF export; browser end-to-end tests; authentication/authorization; upload threat controls; deployment/monitoring hardening; and independent domain validation. Check the source code and `.brain/tasks/` for current status before treating this list as current truth.

## Existing-solution landscape: how to compare fairly

The source library contains primary agency tools and reports, satellite catalogs/APIs, and commercial space-situational-awareness or space-traffic-management product material. Compare products by job-to-be-done, user, input data, decision authority, update cadence, scope, and safety assurances. NASA DAS and operational SSA/STM platforms address different technical or operational functions from this project’s evidence-organization hypothesis. Avoid claiming that OrbitReady replaces them or that a feature gap is unique until the comparison is checked against current official product documentation.

## Evidence map

| Research question | Start with | Product implication |
|---|---|---|
| What problem and user workflow motivated the project? | `OrbitReady_Research_Library/05_Hackathon_and_Source_Dossiers/Original_OrbitReady_Dossiers/orbitready-deep-research-dossier.md` and `orbitready-research-dossier-v2.md` | Treat as prior desk research and project framing; validate assumptions with users. |
| What was the winning-build recommendation and event context? | `.../Original_OrbitReady_Dossiers/OrbitReady — Hackyard Build 2026 Research, Validation, and Winning Build Design.md` and `.../Hackyard_2026_Official_Docs/` | Event-specific research is time-bound; check the current official event material before using. |
| Which debris mitigation science and engineering sources are collected? | `01_Academic_Literature/Orbital_Debris_and_Astrodynamics/`, `03_Agency_Technical_Reports/` | Use for concepts and references; do not implement physical predictions from a summary. |
| What standards or regulatory text is collected? | `02_Policy_and_Standards/` | Verify latest official effective text, applicability, and interpretation with a qualified reviewer. |
| What does the current software actually implement? | `../frontend/`, `../backend/`, `../ai_ml/`, `../fixtures/`, tests, and `../.brain/reports/package-audit.md` | Source and tests outrank design diagrams or research aspirations for implementation-status claims. |

## Questions future research should answer

- Do intended reviewers and smallsat teams actually experience evidence assembly as a high-cost, recurring problem? Which role owns it and at what point in mission development?
- Which evidence fields and source locators are useful across distinct missions without pretending one checklist fits every jurisdiction?
- What user study demonstrates improved traceability or reduced review rework, and what baseline and error measures are credible?
- Which rules can be modeled safely, who validates the interpretation, and how are versions/effective dates maintained?
- What data privacy, export-control, security, audit-retention, and operational risks apply to real mission documents?
- Which existing government, academic, and commercial tools already support parts of the workflow, and what interoperability is preferable to duplication?

Record answers with source provenance, counterevidence, uncertainty, and a date. If the sources disagree, expose the disagreement rather than forcing a single conclusion.
