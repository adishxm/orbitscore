# Acceptance checklist

A task can be marked done only when the owner and reviewer can answer yes to each applicable item:

| Check | Evidence |
|---|---|
| Scope matches the task | Changed-file list and task log |
| Existing behavior preserved | Baseline test output |
| New behavior works | Task-specific test output or observed runtime flow |
| Failure behavior is safe | Negative-path test or manual observation |
| Product boundary is visible | UI/export/API inspection |
| No secret or machine path committed | `git diff` and secret scan |
| Documentation is updated | README or task-local note |
| Reviewer agrees | Reviewer sign-off in task log |
