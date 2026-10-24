# T007 — Browser acceptance tests

- status: done
- owner: Narayan
- reviewer: Roshan
- priority: P1
- depends_on: [T001, T002]

## Reviewer log

- Implementation evidence: .brain/reports/task-runs/20261024T233400.000000+0530_T007_browser-tests_finished_20261024T233505.md
- Reviewer sign-off: Roshan (2026-10-24T18:05:10.000000Z / 2026-10-24T23:35:10.000000+05:30)


## Goal

Add a small browser-level suite or a deterministic manual equivalent for the actual UI flow.

## Required flow

Load synthetic mission → choose profile → inspect candidate fields → confirm/edit a field → evaluate → open finding → review each finding → verify export unlock → inspect packet → verify provenance.

## Acceptance checks

1. The flow works in live API mode.
2. Offline/mock mode still works.
3. Locked export is visible before review.
4. A conflict and a missing-evidence state are visible.
5. The synthetic warning and product boundary are visible.
6. A browser failure produces a screenshot or exact reproduction record.

## Required verification

Run Playwright if available; otherwise execute the manual checklist twice from a clean browser state and attach screenshots/URLs in the task log.
