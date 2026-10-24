# Git synchronization protocol

`.brain/` source, tasks, `state.json`, and sanitized timestamped reports under `.brain/reports/` are shared project artifacts and should be committed with application changes. `.brain/local-reports/` contains detailed local-only command output; the stable `team-report.html` view is also ignored.

Before work:

```bash
git pull --rebase
git status
python .brain/scripts/validate_brain.py
python .brain/scripts/new_task_report.py T001 --title "Short task title"
```

After implementation, run the report-only verification gate:

```bash
python .brain/scripts/complete_task.py T001
```

The task report is named with the task ID and Asia/Kolkata timestamp and includes both UTC and Asia/Kolkata ISO timestamps. At handoff, finalize the report using `python .brain/scripts/finalize_task_report.py <draft-path>`; this writes a new finished copy and preserves the draft. The verification gate records a sanitized, timestamped summary under `.brain/reports/task-runs/`, detailed command output only under ignored `.brain/local-reports/`, and a timestamped HTML snapshot. It never stages, commits, pushes, or marks work done. The assigned reviewer must inspect baseline and task-specific evidence, record sign-off with both timestamps, and update the task file and `state.json` together. Then inspect `git diff` and `git status`, stage only intended paths, and commit through the normal reviewed workflow. Push only after reviewing the commit.

Never commit `.env`, credentials, personal documents, local databases, browser profiles, generated model weights, or `.brain/local-reports/`. Use `.brain/scripts/project_completion_check.py` for tracked-MVP status; it must not be bypassed to claim 100% completion.
