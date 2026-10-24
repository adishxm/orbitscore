# OrbitReady `.brain`

This folder is the shared technical execution contract for the team. It is version-controlled with the application so task definitions and status remain consistent across laptops. Generated local reports under `.brain/local-reports/` are ignored.

## Start here

1. Read `research/README.md` for research-sensitive tasks; use `research/PRODUCT_RESEARCH.md` as a quick product-context summary.
2. Read `.brain/AGENT.md`.
3. Read `.brain/context.md` and `.brain/state.json`.
4. Read the assigned role file in `.brain/agents/`.
5. Select the first task with `status: ready` in `.brain/tasks/`.
6. Execute the loop in `.brain/loop.yaml`: plan → implement → test → verify → repair/repeat → report.
7. Ask the assigned reviewer to inspect task-specific evidence. Only after written reviewer sign-off, update the task file and `state.json` together and commit that change.

## What this folder contains

The folder preserves product boundaries, team ownership, verified package status, technical gaps, API contracts, ordered tasks, acceptance checks, Antigravity prompts, and project deadlines. It contains no travel, packing, personal identity, or other non-project material.

## Shared commands

```bash
# backend
cd apps/api && pytest -q
python -m app.verification

# frontend
npm test
npm run typecheck
npm run build

# brain structure check
python .brain/scripts/validate_brain.py
```

The current package is a verified prototype, not yet the full upload/parser/database/real-API-integrated product. Antigravity must complete tasks in dependency order and must not skip acceptance checks.

## Project deadline mode

The Build 2026 project timeline is: hacking begins Saturday 24 October at 12:00 PM IST; pitch dry run by Sunday 25 October at 10:30 AM; repository, deck, and two-minute demo video freeze/submission by Sunday 25 October at 12:00 PM. Read `.brain/prompts/project-deadline-mode.md` and `.brain/checklists/code-freeze.md` when planning work against the deadline.

## Completion and Git rule

`.brain/` source, task files, and `state.json` are committed with the application. Generated `.brain/local-reports/` and `team-report.html` remain local-only. Run `python .brain/scripts/complete_task.py T001` to execute baseline checks and create a review report; the script never stages, commits, pushes, or marks work done. Complete task-specific checks, obtain reviewer sign-off, update the task and state manually, inspect `git diff`, then commit through the normal reviewed Git workflow. Never store API keys, model keys, cookies, private PDFs, local absolute paths, or machine-specific secrets here. Use `.env.example` for names only.

Before each task, create a report with `python .brain/scripts/new_task_report.py T001 --title "Short title"`; at handoff, use `python .brain/scripts/finalize_task_report.py <draft-path>` to create a finished copy without replacing the draft. Verification JSON summaries and each generated team-report HTML snapshot are timestamped in `.brain/reports/`; only detailed raw logs and `team-report.html` latest view are ignored. Timestamps include UTC and Asia/Kolkata (`+05:30`) and use the host system clock.

Use `python .brain/scripts/project_completion_check.py` to assess readiness for final sign-off. It never marks tasks or the project complete. Read `.brain/PROJECT_COMPLETION.md`; whole-project “100%” is not inferred from task count and requires task-specific evidence, named reviewer approvals, explicit optional-task disposition, and final human sign-off.

## Learning path

Use `.brain/knowledge-manual.md` for the role-based reading syllabus, internal code pointers, practice exercises, and concepts needed to explain the system accurately.
