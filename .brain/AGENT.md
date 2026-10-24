# Antigravity operating contract

You are the implementation agent for OrbitReady. Work from the task files and source files, not from memory. Do not broaden scope without writing a new task.

## Research-first rule

Before changing product framing, user/problem claims, policy/rule logic, domain terminology, source citations, AI behavior, or market/competitor claims, start at `research/README.md`, read the relevant part of `research/PRODUCT_RESEARCH.md`, and inspect the underlying primary or project source in `research/OrbitReady_Research_Library/`. Follow `research/SOURCE_REGISTER.md` for source hierarchy, freshness, scope, and citation quality. Distinguish published source text, team interpretation, synthetic demo data, and implemented software behavior. Cite exact sections/pages/locators and dates in task notes when a research claim drives a change. If evidence is stale, missing, conflicting, or safety-relevant, perform fresh research and request qualified human review rather than inferring.

For routine code changes with no research-sensitive claims, use the product summary as a quick context lookup; do not needlessly re-read the entire library.

## Mandatory loop

For every task:

1. **Plan/report:** read context, dependencies, owner, acceptance checks, and files allowed to change. Before implementation, run `python .brain/scripts/new_task_report.py <TASK_ID> --title "Short task title"`; record its path in the task log and write the plan there.
2. **Implement:** make the smallest change that satisfies the task. Preserve existing behavior.
3. **Test:** run the task's required commands and the relevant existing test suite.
4. **Verify:** inspect outputs, not only exit codes. Check API responses, rendered UI behavior, exported files, and boundary text where relevant.
5. **Repair:** if any check fails, record the failure, fix the smallest cause, and return to Test. Maximum repair attempts per cycle: 3; then mark `blocked` with evidence.
6. **Report:** record files changed, commands run, results, known limitations, and the next task. Before handing off, run `python .brain/scripts/finalize_task_report.py <draft-path>`; this saves a new finished copy and preserves the original. Save every other agent-generated report as a new, timestamped file under `.brain/reports/`; do not overwrite prior reports. Machine-generated detailed logs remain in ignored `.brain/local-reports/`, while sanitized summaries and HTML snapshots are archived in `.brain/reports/`.

Never claim “100% complete” based on this task or the task count. Use `python .brain/scripts/project_completion_check.py`; only report the declared MVP as eligible after its checks pass and a human reviewer completes `.brain/PROJECT_SIGNOFF.md`. Describe the scope and limitations explicitly.

Never mark a task `done` when a required check is skipped, mocked without disclosure, or merely described in code comments. Baseline test success is not task completion: the assigned reviewer must inspect task-specific acceptance evidence, record explicit sign-off, and only then update both task status and `state.json`.

## Decision authority

- AI/LLM may suggest extraction and explanations only.
- Deterministic Python rules decide statuses.
- A human confirms fields and reviews findings.
- Export stays locked until every finding has a review decision.
- Synthetic fixtures are never presented as real mission evidence.

## Stop conditions

Stop and ask for a new task if the work would add live orbital feeds, collision prediction, conjunction assessment, maneuver advice, official certification claims, real regulatory filing, credentials, destructive migrations, or a paid external service.

## Collaboration

Use the task owner and reviewer listed in the task file. Keep commits small. Do not rewrite another member's area without recording why. Never modify `.brain/state.json` to hide a failed check. The verification helper is report-only; inspect and stage intended Git paths manually after reviewer approval.
