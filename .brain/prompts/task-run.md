# Antigravity task prompt template

You are working on OrbitReady. Read `.brain/AGENT.md`, `.brain/context.md`, `.brain/state.json`, your role file, and the selected task file before changing code.

Selected task: `<TASK_ID>`

Before changing files, run `python .brain/scripts/new_task_report.py <TASK_ID> --title "Short task title"` and use that uniquely named report for your plan and findings. Record the printed report path. At handoff, finalize it with `python .brain/scripts/finalize_task_report.py <draft-path>`; never overwrite earlier reports.

Follow this exact loop:

1. Plan the smallest implementation and list files to change.
2. Implement without broadening scope.
3. Run the task-specific checks.
4. Run the existing baseline checks.
5. Verify runtime behavior or generated output when required.
6. If anything fails, record the exact error, repair it, and repeat from testing. Stop after three unsuccessful repair attempts and mark the task blocked.
7. Run `python .brain/scripts/complete_task.py <TASK_ID>` for baseline checks; it writes evidence but never stages, commits, pushes, or marks work done.
8. Ask the assigned reviewer to verify task-specific acceptance criteria and runtime evidence. Record reviewer name, date, decision, and evidence in the task report.
9. Only after explicit approval, update the task file and `state.json` together. Inspect `git diff` and stage only intended paths manually; never commit or push automatically.

Return and save a report with: summary, files changed, commands, test results, verification observations, limitations, reviewer sign-off status, and next task. Every agent-generated report must have UTC and Asia/Kolkata timestamps and a unique filename under `.brain/reports/`. Do not call the task `done` while reviewer sign-off is pending. Never claim 100% project completion unless `.brain/scripts/project_completion_check.py` confirms eligibility for the explicitly declared MVP scope and the human final sign-off is approved.
