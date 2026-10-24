"""Static metadata validation; does not replace app tests or reviewer sign-off."""
from __future__ import annotations
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
required = ["README.md", "AGENT.md", "context.md", "loop.yaml", "state.json", "project-timeline.md", "knowledge-manual.md", "project-scope.json", "PROJECT_COMPLETION.md", "PROJECT_SIGNOFF.md", "agents", "tasks", "checklists", "contracts", "reports", "prompts", "prompts/project-deadline-mode.md", "scripts/reporting.py", "scripts/new_task_report.py", "scripts/finalize_task_report.py", "scripts/project_completion_check.py", "tests/test_reporting.py", "../research/README.md", "../research/PRODUCT_RESEARCH.md", "../research/SOURCE_REGISTER.md", "../research/FILE_MANIFEST.csv", "../research/OrbitReady_Research_Library/RESEARCH_CATALOG_AND_INDEX.md"]
missing = [item for item in required if not (ROOT / item).exists()]
if missing:
    raise SystemExit(f"missing .brain entries: {', '.join(missing)}")

state = json.loads((ROOT / "state.json").read_text(encoding="utf-8"))
task_files = sorted((ROOT / "tasks").glob("T*.md"))
ids = {path.stem.split("-", 1)[0] for path in task_files}
state_tasks = state.get("tasks", {})
state_ids = set(state_tasks)
if ids != state_ids:
    raise SystemExit(f"task/state mismatch: files={sorted(ids)} state={sorted(state_ids)}")
try:
    scope = json.loads((ROOT / "project-scope.json").read_text(encoding="utf-8"))
except (OSError, json.JSONDecodeError) as exc:
    raise SystemExit(f"invalid project-scope.json: {exc}")
required_scope = set(scope.get("required_tasks", []))
optional_scope = set(scope.get("optional_tasks", {}))
if required_scope & optional_scope or required_scope | optional_scope != ids:
    raise SystemExit("project-scope.json must classify every task exactly once as required or optional")

allowed = {"ready", "planning", "implementing", "testing", "verifying", "repairing", "blocked", "done"}
blocked_status = re.compile(r"^blocked-by-(T\d+)$")
dependencies_by_id = {}
file_statuses = {}
for path in task_files:
    text = path.read_text(encoding="utf-8")
    task_id = path.stem.split("-", 1)[0]
    for label in ("- status:", "- owner:", "- reviewer:", "- priority:", "- depends_on:", "## Goal", "## Acceptance checks", "## Required verification"):
        if label not in text:
            raise SystemExit(f"{task_id}: missing {label}")
    status_match = re.search(r"^- status: (\S+)\s*$", text, re.M)
    if not status_match:
        raise SystemExit(f"{task_id}: malformed status")
    status = status_match.group(1)
    if status not in allowed and not blocked_status.fullmatch(status):
        raise SystemExit(f"{task_id}: unsupported status {status!r}")
    file_statuses[task_id] = status
    if state_tasks.get(task_id) != status:
        raise SystemExit(f"{task_id}: state.json status {state_tasks.get(task_id)!r} differs from task file {status!r}")
    deps_match = re.search(r"^- depends_on: \[([^]]*)\]$", text, re.M)
    if not deps_match:
        raise SystemExit(f"{task_id}: malformed depends_on list")
    deps = [] if not deps_match.group(1).strip() else [x.strip() for x in deps_match.group(1).split(",")]
    unknown = [dep for dep in deps if dep and dep not in ids]
    if unknown:
        raise SystemExit(f"{task_id}: unknown dependencies {unknown}")
    dependencies_by_id[task_id] = deps

visiting, visited = set(), set()
def visit(task_id):
    if task_id in visiting:
        raise SystemExit(f"dependency cycle detected at {task_id}")
    if task_id in visited:
        return
    visiting.add(task_id)
    for dep in dependencies_by_id[task_id]:
        visit(dep)
    visiting.remove(task_id)
    visited.add(task_id)
for task_id in sorted(ids):
    visit(task_id)

print(f".brain valid: {len(task_files)} tasks; statuses synchronized; dependencies known and acyclic; project-scope IDs and required research/reporting guides present")
