# orbitscore

## Project onboarding

Before product research or policy-sensitive work, agents should start at [`research/README.md`](research/README.md), read the product synthesis, then follow its links into the preserved research library. Check [`research/SOURCE_REGISTER.md`](research/SOURCE_REGISTER.md) for source hierarchy, date, scope, and claim safeguards. The research folder includes prior product dossiers, academic literature, standards, agency reports, tools/data references, and Hackyard source materials.

## Local Antigravity brain and task gate

`.brain/` contains shared project instructions, task definitions, and status, so it is committed with the application. Generated reports under `.brain/local-reports/` and `team-report.html` are local-only and ignored by Git.

After implementation, run the baseline verification gate:

```bash
python .brain/scripts/complete_task.py T001
```

Before work, create a uniquely named report: `python .brain/scripts/new_task_report.py T001 --title "Short task title"`. Fill it during the task; after checks, create a finished copy with `python .brain/scripts/finalize_task_report.py <draft-path>`. Each task-gate run saves timestamped verification summaries and each team report gets a timestamped snapshot under `.brain/reports/`. Times include ISO-8601 UTC and Asia/Kolkata (`+05:30`); accuracy depends on the host clock. The latest `team-report.html` is a convenience view and may be overwritten; its snapshots are retained.

The task gate runs baseline checks and writes evidence; it never stages, commits, pushes, or marks work done. A human reviewer must check task-specific acceptance evidence, record approval with timestamps, then update task and state. Inspect `git diff` before committing. Use `.brain/knowledge-manual.md` for the team reading syllabus.

To check the full tracked MVP—not just one task—run `python .brain/scripts/project_completion_check.py`. It reports blockers and does not mark the project done. A “100%” statement is permitted only for the declared scope in `.brain/project-scope.json` after all required task evidence, reviewer approvals, optional-task disposition, and final human sign-off pass. This is not a claim of universal product quality, regulatory validity, or production readiness.
