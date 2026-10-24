# Project completion policy

## What “100% complete” means here

The gate can report **eligible for owner/reviewer completion sign-off for the tracked MVP scope** only when every condition below is evidenced. It cannot prove that the product is universally complete, safe for real missions, compliant, commercially successful, or production-ready. The number of closed tasks is a progress signal for this declared scope, not an objective percentage of all possible product work.

1. Every task in `.brain/project-scope.json` `required_tasks` is `done` in both its task file and `state.json`.
2. Each required task has a finished timestamped Markdown report, task-specific acceptance marked complete, explicit reviewer decision `APPROVED`, reviewer identity, both UTC and Asia/Kolkata sign-off timestamps, and evidence notes.
3. Each required task has a passing timestamped baseline verification report generated after that task report began. In addition, the latest full-suite run must pass every recorded check and occur after all required task reports have started, so the final integrated code is retested after implementation work. The reviewer separately verifies task-specific acceptance; baseline tests alone do not satisfy acceptance.
4. The optional T008 AI adapter is completed or explicitly dispositioned `deferred_by_owner` with a named reviewer, rationale, and timestamp. A deferral means the adapter was not delivered.
5. The latest project-level completion check has no blockers, all mandatory checks are current, and the final project sign-off is approved by a human reviewer.
6. No known release-blocking issue, skipped required check, unresolved dependency, or unsupported claim is concealed. Product/research/domain limitations remain documented.

## Run the checks

Before beginning a task, create a report draft:

```bash
python .brain/scripts/new_task_report.py T001 --title "Short task title"
```

Fill that report as work proceeds. After all required checks, make a timestamped finished copy without overwriting the draft:

```bash
python .brain/scripts/finalize_task_report.py .brain/reports/task-runs/<draft-name>.md
```

The verifier creates timestamped JSON evidence and an HTML status snapshot while keeping `team-report.html` as a convenience latest view:

```bash
python .brain/scripts/complete_task.py T001
python .brain/scripts/build_team_report.py
```

When all required task reports are underway and implementation work is complete, run the final full-suite gate against the last task in `verifying` status. Finalize its task report, collect its reviewer sign-off, update task/state only after approval, and then run the fail-closed completion check:

```bash
python .brain/scripts/project_completion_check.py
```

The checker always saves a timestamped result under `.brain/reports/completion-runs/`. It will explicitly list blockers rather than mark a task or project complete. The final reviewer must update `.brain/PROJECT_SIGNOFF.md` only after reviewing the evidence. Never edit task status or sign-off merely to make the gate pass.

## Timestamp policy

Generated records include both ISO-8601 UTC and Asia/Kolkata (`+05:30`) timestamps with microseconds and an explicit timezone name. Filenames use the Asia/Kolkata timestamp and a task/project identifier. The system uses the execution host’s system clock; timestamps are only as accurate as that clock’s synchronization. Keep the original offsets; do not rewrite old timestamps when viewing from another timezone. Reports are written with exclusive file creation so a repeat run creates another record instead of replacing the prior one.
