#!/usr/bin/env python3
"""Run the verification gate and prepare a report for human review.

This script never stages, commits, pushes, or marks a task done. A reviewer
must inspect the report and explicitly update the task/state after approval.
Run from anywhere with: python .brain/scripts/complete_task.py T001
"""
from __future__ import annotations
import argparse
import json
import re
import subprocess
import sys
import time
from pathlib import Path
from reporting import filename_stamp, now_pair, write_unique

ROOT = Path(__file__).resolve().parents[2]
BRAIN = ROOT / ".brain"
LOCAL_REPORT_DIR = BRAIN / "local-reports"
RUN_REPORT_DIR = BRAIN / "reports" / "task-runs"


def run(label: str, command: list[str], cwd: Path) -> dict:
    started = now_pair()
    monotonic_started = time.monotonic()
    try:
        proc = subprocess.run(
            command,
            cwd=cwd,
            text=True,
            encoding="utf-8",
            errors="replace",
            capture_output=True,
            timeout=600,
            shell=(sys.platform == "win32")
        )
        finished = now_pair()
        return {"label": label, "command": " ".join(command),
                "started_utc": started["utc"], "started_local": started["local"],
                "completed_utc": finished["utc"], "completed_local": finished["local"],
                "duration_seconds": round(time.monotonic() - monotonic_started, 3),
                "returncode": proc.returncode, "passed": proc.returncode == 0,
                "stdout": proc.stdout[-8000:], "stderr": proc.stderr[-4000:]}
    except subprocess.TimeoutExpired as exc:
        finished = now_pair()
        return {"label": label, "command": " ".join(command),
                "started_utc": started["utc"], "started_local": started["local"],
                "completed_utc": finished["utc"], "completed_local": finished["local"],
                "duration_seconds": round(time.monotonic() - monotonic_started, 3),
                "returncode": 124, "passed": False,
                "stdout": str(exc.stdout or "")[-8000:], "stderr": "Timed out after 600 seconds"}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("task_id", help="Task ID such as T001")
    args = parser.parse_args()
    if not re.fullmatch(r"T\d{3}", args.task_id):
        print("Task IDs must use the form T001.", file=sys.stderr)
        return 2
    matches = list((BRAIN / "tasks").glob(f"{args.task_id}-*.md"))
    if len(matches) != 1:
        print(f"Expected exactly one task for {args.task_id}; found {len(matches)}", file=sys.stderr)
        return 2
    task = matches[0]
    task_text = task.read_text(encoding="utf-8")
    status = re.search(r"^- status: (.+)$", task_text, re.M)
    owner = re.search(r"^- owner: (.+)$", task_text, re.M)
    deps_match = re.search(r"^- depends_on: \[([^]]*)\]$", task_text, re.M)
    dependencies = [] if not deps_match or not deps_match.group(1).strip() else [x.strip() for x in deps_match.group(1).split(",")]
    state = json.loads((BRAIN / "state.json").read_text(encoding="utf-8"))
    if not status or status.group(1).strip() not in {"ready", "implementing", "testing", "verifying"}:
        print("Task is not runnable. Only ready/implementing/testing/verifying tasks may enter the verification gate.", file=sys.stderr)
        return 2
    incomplete = [dep for dep in dependencies if state.get("tasks", {}).get(dep) != "done"]
    if incomplete:
        print(f"Unmet dependencies: {', '.join(incomplete)}", file=sys.stderr)
        return 2
    checks = [
        ("brain validation", [sys.executable, ".brain/scripts/validate_brain.py"], ROOT),
        ("brain reporting tests", [sys.executable, "-m", "unittest", "discover", "-s", ".brain/tests", "-v"], ROOT),
        ("backend tests", [sys.executable, "-m", "pytest", "-q"], ROOT / "backend"),
        ("ai adapter tests", [sys.executable, "-m", "pytest", "-q"], ROOT / "ai_ml"),
        ("verification matrix", [sys.executable, "-m", "app.verification"], ROOT / "backend"),
        ("frontend tests", ["npm", "test"], ROOT),
        ("frontend typecheck", ["npm", "run", "typecheck"], ROOT),
        ("frontend production build", ["npm", "run", "build"], ROOT),
    ]
    task_started = now_pair()
    results = [run(label, command, cwd) for label, command, cwd in checks]
    passed = all(item["passed"] for item in results)
    completed = now_pair()
    timestamp = filename_stamp(completed["local"])
    record = {"task_id": args.task_id, "task_file": str(task.relative_to(ROOT)),
              "owner": owner.group(1).strip() if owner else "unspecified",
              "started_at_utc": task_started["utc"], "started_at_local": task_started["local"],
              "completed_at_utc": completed["utc"], "completed_at_local": completed["local"],
              "timezone": completed["timezone"], "timestamp_source": completed["timestamp_source"],
              "passed": passed,
              "status": "awaiting_reviewer" if passed else "checks_failed",
              "checks": results, "reviewer_action_required": passed,
              "note": "This gate never stages, commits, pushes, or marks a task done. A reviewer must inspect this report, complete task-specific checks, record sign-off, and update task/state explicitly."}
    LOCAL_REPORT_DIR.mkdir(parents=True, exist_ok=True)
    detailed_path = write_unique(LOCAL_REPORT_DIR / f"{timestamp}_{args.task_id}_verification.json", json.dumps(record, indent=2) + "\n")
    RUN_REPORT_DIR.mkdir(parents=True, exist_ok=True)
    summary = {key: value for key, value in record.items() if key != "checks"}
    summary["checks"] = [{key: value for key, value in item.items() if key not in {"stdout", "stderr"}} for item in results]
    summary["detailed_local_log"] = str(detailed_path.relative_to(ROOT))
    archived_path = write_unique(RUN_REPORT_DIR / f"{timestamp}_{args.task_id}_verification.json", json.dumps(summary, indent=2) + "\n")
    report_proc = subprocess.run([sys.executable, str(BRAIN / "scripts" / "build_team_report.py")], cwd=ROOT, capture_output=True, text=True)
    if not passed:
        print(f"FAILED: checks did not pass. Archived summary: {archived_path}; detailed local log: {detailed_path}", file=sys.stderr)
        return 1
    if report_proc.returncode:
        print(f"Checks passed but report generation failed: {report_proc.stderr}", file=sys.stderr)
        return 1
    print(f"PASS: baseline checks passed for {args.task_id}. Reviewer sign-off and task-specific verification remain required. Archived summary: {archived_path}; detailed local log: {detailed_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
