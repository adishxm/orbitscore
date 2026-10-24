# Reviewer — independent verification role

The reviewer is the team member not responsible for the task, or a second Antigravity run with a clean context.

## Verify

- Acceptance criteria are observable.
- Required commands were actually run.
- The UI/API/export behavior matches the task.
- The change did not weaken product boundaries.
- Existing tests still pass.
- The task report contains a limitation note.

A reviewer may return a task to `repairing` with one concrete reason. A reviewer must not approve from code inspection alone when runtime behavior is part of the task.
