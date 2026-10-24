# OrbitReady API contract

The current package exposes health, profiles, missions, evaluation, decisions, counterfactual, provenance, and export. This page distinguishes the current evaluator finding shape from fields the live integration may add later. Do not claim planned fields are implemented.

## Stable status values

`PASS_UNDER_PROFILE`, `WARNING`, `NEEDS_EVIDENCE`, `CONFLICT`, and `NOT_EVALUATED`.

## Current finding shape (implemented)

```json
{
  "finding_id": "mission:profile:rule",
  "rule_id": "DISPOSAL-EVIDENCE-001",
  "profile_id": "internal-pre-review",
  "status": "NEEDS_EVIDENCE",
  "title": "Disposal evidence",
  "critical_gap": true,
  "message": "No human-confirmed evidence for disposal evidence.",
  "observed_value": null,
  "source_citation": {"document": "synthetic datasheet", "clause": "4.2", "locator": "page 2"},
  "remediation_lever": "confirm_disposal_evidence"
}
```

The exact fields vary by evaluation path: `unit`, `evidence_id`, and `locator` are present when applicable. Current findings do **not** consistently include `rule_version`, `severity`, `rationale`, `threshold`, `limitation_notice`, or `review_required`; do not make frontend code require these until the API and tests are updated together. Scope and limitations remain important and must be visible in the product interface/export even where they are currently supplied by surrounding profile/rule context rather than these exact keys.

## Target integration requirements

T001–T005 may add fields or routes. Before changing the live contract, document the migration, update Pydantic/backend/frontend types together, and add positive, missing-field, conflict, error, and export-gate tests. If adding per-finding version/severity/limitation fields, populate them from the configured rule/profile source—not invented defaults—and preserve an explicit version identifier.

## Integration rule

Narayan may build against fixtures and mock responses, but live-mode behavior is not complete until browser verification demonstrates it. Aditya must announce a breaking shape change in the task log before editing frontend types.
