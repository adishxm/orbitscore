#!/usr/bin/env python3
"""Check eligibility for human sign-off of the declared MVP scope.

This is not an objective project-quality score. It never changes task state or
approves the project; it emits an append-only evidence report and blockers.
"""
from __future__ import annotations
import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from reporting import filename_stamp, now_pair, write_unique

ROOT = Path(__file__).resolve().parents[2]
BRAIN = ROOT / ".brain"
RUN_DIR = BRAIN / "reports" / "task-runs"
OUT_DIR = BRAIN / "reports" / "completion-runs"


def parse_iso(value: str) -> datetime | None:
    try:
        return datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return None


def offset_seconds(value: datetime | None) -> float | None:
    if value is None or value.utcoffset() is None:
        return None
    return value.utcoffset().total_seconds()


def same_instant(first: datetime | None, second: datetime | None) -> bool:
    return bool(first and second and first.utcoffset() is not None and second.utcoffset() is not None and first.timestamp() == second.timestamp())


def metadata(text: str, key: str) -> str:
    found = re.search(rf"^- {re.escape(key)}: (.*)$", text, re.M)
    return found.group(1).strip() if found else ""


def task_files() -> dict[str, Path]:
    return {p.stem.split("-", 1)[0]: p for p in (BRAIN / "tasks").glob("T*.md")}


def main() -> int:
    checked = now_pair()
    blockers: list[str] = []
    notes: list[str] = []
    scope = json.loads((BRAIN / "project-scope.json").read_text(encoding="utf-8"))
    state = json.loads((BRAIN / "state.json").read_text(encoding="utf-8"))
    files = task_files()
    required = scope.get("required_tasks", [])
    optional = scope.get("optional_tasks", {})
    tasks = state.get("tasks", {})
    if set(required) & set(optional):
        blockers.append("Project-scope configuration lists a task as both required and optional.")
    if set(required) | set(optional) != set(files):
        blockers.append(f"Project-scope task list does not exactly match task files; unclassified={sorted(set(files)-set(required)-set(optional))}, unknown={sorted((set(required)|set(optional))-set(files))}.")
    if set(files) != set(tasks):
        blockers.append("Task files and state.json task IDs differ.")

    task_results = []
    for task_id in required:
        task_path = files.get(task_id)
        task_status = metadata(task_path.read_text(encoding="utf-8"), "status") if task_path else "missing"
        state_status = tasks.get(task_id, "missing")
        item = {"task_id": task_id, "task_status": task_status, "state_status": state_status, "report": None, "report_started_at_utc": None, "verification_report": None, "blockers": []}
        if not task_path:
            item["blockers"].append("Task file missing.")
        if task_status != state_status:
            item["blockers"].append("Task file and state.json status mismatch.")
        if task_status != "done":
            item["blockers"].append("Required task is not marked done after review.")

        report_candidates = sorted(RUN_DIR.glob(f"*_{task_id}_*_finished_*.md"), key=lambda p: p.name, reverse=True) if RUN_DIR.exists() else []
        report_path = None
        report_text = ""
        start_utc = None
        for candidate in report_candidates:
            candidate_text = candidate.read_text(encoding="utf-8")
            if candidate_text.startswith(f"# {task_id} —"):
                report_path, report_text = candidate, candidate_text
                start_utc = parse_iso(metadata(report_text, "Started UTC"))
                break
        if not report_path:
            item["blockers"].append("No finished, timestamped task report found.")
        else:
            item["report"] = str(report_path.relative_to(ROOT))
            item["report_started_at_utc"] = metadata(report_text, "Started UTC")
            acceptance_value = metadata(report_text, "Task-specific acceptance checks complete").lower().split(",", 1)[0].split("(", 1)[0].strip()
            if acceptance_value not in {"yes", "true", "complete", "completed"}:
                item["blockers"].append("Task report does not mark task-specific acceptance checks complete.")
            if metadata(report_text, "Reviewer decision (PENDING/APPROVED/REJECTED)").upper() != "APPROVED":
                item["blockers"].append("Task report lacks explicit reviewer APPROVED decision.")
            if not metadata(report_text, "Reviewer name"):
                item["blockers"].append("Task report has no reviewer identity.")
            reviewer_utc = parse_iso(metadata(report_text, "Reviewer signed off UTC"))
            reviewer_local = parse_iso(metadata(report_text, "Reviewer signed off Asia/Kolkata"))
            if offset_seconds(reviewer_utc) != 0 or offset_seconds(reviewer_local) != 19800:
                item["blockers"].append("Task report needs parseable reviewer sign-off timestamps in UTC and Asia/Kolkata (+05:30).")
            elif not same_instant(reviewer_utc, reviewer_local):
                item["blockers"].append("Reviewer UTC and Asia/Kolkata timestamps do not represent the same instant.")
            if not metadata(report_text, "Reviewer evidence path/notes"):
                item["blockers"].append("Task report has no reviewer evidence path/notes.")
            finished_utc = parse_iso(metadata(report_text, "Finished UTC"))
            finished_local = parse_iso(metadata(report_text, "Finished Asia/Kolkata"))
            if offset_seconds(finished_utc) != 0 or offset_seconds(finished_local) != 19800:
                item["blockers"].append("Finished report timestamps must include valid UTC and Asia/Kolkata offsets.")
            elif not same_instant(finished_utc, finished_local):
                item["blockers"].append("Finished UTC and Asia/Kolkata timestamps do not represent the same instant.")

        verification_candidates = sorted(RUN_DIR.glob(f"*_{task_id}_verification.json"), key=lambda p: p.name, reverse=True) if RUN_DIR.exists() else []
        verification = None
        for candidate in verification_candidates:
            try:
                record = json.loads(candidate.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                continue
            if record.get("passed") is True and (start_utc is None or (parse_iso(record.get("completed_at_utc", "")) or datetime.min.replace(tzinfo=start_utc.tzinfo)) >= start_utc):
                verification, item["verification_report"] = record, str(candidate.relative_to(ROOT))
                break
        if verification is None:
            item["blockers"].append("No passing timestamped baseline verification report found after the task report start time.")
        task_results.append(item)
        blockers.extend(f"{task_id}: {message}" for message in item["blockers"])

    all_verifications = []
    if RUN_DIR.exists():
        for candidate in RUN_DIR.glob("*_verification.json"):
            try:
                check_record = json.loads(candidate.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                continue
            completed_at = parse_iso(check_record.get("completed_at_utc", ""))
            if completed_at:
                all_verifications.append((completed_at, candidate, check_record))
    latest_baseline = max(all_verifications, key=lambda item: item[0]) if all_verifications else None
    latest_baseline_summary = None
    report_start_times = [parse_iso(item["report_started_at_utc"]) for item in task_results if item["report_started_at_utc"]]
    if not latest_baseline:
        blockers.append("No timestamped full-suite baseline verification exists for the project.")
    else:
        completed_at, baseline_path, baseline_record = latest_baseline
        latest_baseline_summary = {
            "path": str(baseline_path.relative_to(ROOT)),
            "task_id": baseline_record.get("task_id"),
            "completed_at_utc": baseline_record.get("completed_at_utc"),
            "completed_at_local": baseline_record.get("completed_at_local"),
            "passed": baseline_record.get("passed") is True,
            "all_checks_passed": bool(baseline_record.get("checks")) and all(check.get("passed") is True for check in baseline_record.get("checks", [])),
        }
        if baseline_record.get("passed") is not True or not latest_baseline_summary["all_checks_passed"]:
            blockers.append("The latest full-suite baseline run did not pass every recorded check.")
        if report_start_times and completed_at < max(report_start_times):
            blockers.append("The latest full-suite baseline run predates one or more required task reports; rerun the full gate after the final implementation work.")

    for task_id, config in optional.items():
        disposition = str(config.get("current_disposition", "pending"))
        if disposition == "complete":
            if tasks.get(task_id) != "done":
                blockers.append(f"Optional task {task_id} is dispositioned complete but is not done in state.json.")
        elif disposition == "deferred_by_owner":
            notes.append(f"Optional task {task_id} is explicitly deferred; its capability is not delivered.")
        else:
            blockers.append(f"Optional task {task_id} needs an explicit owner disposition (complete or deferred_by_owner).")

    signoff_path = BRAIN / "PROJECT_SIGNOFF.md"
    signoff = signoff_path.read_text(encoding="utf-8") if signoff_path.exists() else ""
    if metadata(signoff, "Decision").upper() != "APPROVED":
        blockers.append("Final human project sign-off is not APPROVED.")
    if not metadata(signoff, "Reviewer name"):
        blockers.append("Final project sign-off has no reviewer identity.")
    approval_utc = parse_iso(metadata(signoff, "Approval UTC"))
    approval_local = parse_iso(metadata(signoff, "Approval Asia/Kolkata"))
    if offset_seconds(approval_utc) != 0 or offset_seconds(approval_local) != 19800:
        blockers.append("Final project sign-off requires valid UTC and Asia/Kolkata timestamps.")
    elif not same_instant(approval_utc, approval_local):
        blockers.append("Final project UTC and Asia/Kolkata timestamps do not represent the same instant.")
    if not metadata(signoff, "Evidence report path"):
        blockers.append("Final project sign-off does not identify the completion evidence report.")
    if not metadata(signoff, "Rationale and remaining non-blocking limitations"):
        blockers.append("Final project sign-off must document rationale and remaining limitations.")
    for task_id, config in optional.items():
        recorded = metadata(signoff, f"Optional task {task_id} disposition").lower()
        expected = str(config.get("current_disposition", "pending")).lower()
        if recorded != expected:
            blockers.append(f"Final project sign-off disposition for optional task {task_id} does not match project-scope.json.")

    validation = subprocess.run(
        [sys.executable, str(BRAIN / "scripts" / "validate_brain.py")],
        cwd=ROOT,
        text=True,
        encoding="utf-8",
        errors="replace",
        capture_output=True
    )
    if validation.returncode:
        blockers.append(f"Brain metadata validation failed: {(validation.stderr or validation.stdout).strip()}")
    else:
        notes.append((validation.stdout.strip() or "Brain metadata valid.") + ".")

    eligible = not blockers
    record = {
        "report_type": "tracked_mvp_completion_gate",
        "created_at_utc": checked["utc"],
        "created_at_local": checked["local"],
        "timezone": checked["timezone"],
        "timestamp_source": checked["timestamp_source"],
        "eligible_for_human_completion_signoff": eligible,
        "status": "ELIGIBLE_PENDING_FINAL_REVIEW" if eligible else "NOT_ELIGIBLE",
        "scope_name": scope.get("scope_name"),
        "warning": scope.get("completion_scope_warning"),
        "required_task_count": len(required),
        "required_tasks_done": sum(item["task_status"] == "done" and item["state_status"] == "done" for item in task_results),
        "latest_full_suite_baseline": latest_baseline_summary,
        "optional_task_dispositions": {task_id: config.get("current_disposition", "pending") for task_id, config in optional.items()},
        "tasks": task_results,
        "blockers": blockers,
        "notes": notes,
        "does_not_claim": "This report does not score overall product quality, domain validity, regulatory compliance, commercial success, or all possible future work."
    }
    stamp = filename_stamp(checked["local"])
    path = write_unique(OUT_DIR / f"{stamp}_project-completion.json", json.dumps(record, indent=2) + "\n")
    print(json.dumps({"status": record["status"], "required_tasks_done": f"{record['required_tasks_done']}/{len(required)}", "blockers": blockers, "report": str(path.relative_to(ROOT))}, indent=2))
    return 0 if eligible else 1


if __name__ == "__main__":
    raise SystemExit(main())
