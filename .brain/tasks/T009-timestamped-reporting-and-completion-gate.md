# T009 — Timestamped reports and completion gate

- status: done
- owner: Project agent
- reviewer: Aditya
- priority: P1
- depends_on: []

## Goal

Make task/report history append-only with clear UTC and Asia/Kolkata timestamps, and prevent a task-run report or vague percentage from being presented as 100% project completion.

## Acceptance checks

1. Agents can create a uniquely named Markdown report before work begins; it includes exact creation/start timestamps in UTC and Asia/Kolkata with explicit offsets.
2. A finished report is a new copy with exact end timestamps; the initial draft and prior reports are not overwritten.
3. The verification gate records UTC/local start/end and per-check timing; it saves a durable summary and a detailed local log without committing raw output.
4. Every team-report generation creates a timestamped HTML snapshot, while `team-report.html` remains only the stable latest-view pointer.
5. The project completion checker fails closed on open required tasks, missing passing evidence, missing task-specific acceptance/reviewer timestamps, unresolved optional scope, or missing final project sign-off.
6. The completion report uses explicit tracked-MVP scope language and does not claim that task count equals objective whole-product completion.
7. Tests cover unique non-overwrite behavior, timezone offsets, snapshot creation, and an ineligible current project result.

## Required verification

Run Python syntax checks and `.brain/scripts/validate_brain.py`; exercise report creation and finalization in a temporary copy; confirm two repeated runs create distinct artifacts; generate the team report twice and compare timestamps/snapshots; run the project completion gate and verify it lists blockers while the project remains incomplete. Confirm the app test/build baseline remains unchanged.

## Reviewer log

- Implementation evidence: .brain/reports/task-runs/20261024T233520.000000+0530_T009_timestamped-reporting-and-completion-gate_finished_20261024T233625.md
- Reviewer sign-off: Aditya (2026-10-24T18:06:30.000000Z / 2026-10-24T23:36:30.000000+05:30)

