#!/usr/bin/env python3
"""Create a timestamped, non-overwriting Markdown report before task work starts."""
from __future__ import annotations
import argparse
import re
import sys
from pathlib import Path
from reporting import filename_stamp, now_pair, write_unique

ROOT = Path(__file__).resolve().parents[2]
BRAIN = ROOT / ".brain"
OUT_DIR = BRAIN / "reports" / "task-runs"


def slugify(value: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", value.lower())).strip("-")[:48] or "task-report"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("task_id", help="Task ID such as T001")
    parser.add_argument("--title", required=True, help="Short report/task title")
    args = parser.parse_args()
    if not re.fullmatch(r"T\d{3}", args.task_id):
        print("Task IDs must use the form T001.", file=sys.stderr)
        return 2
    matches = list((BRAIN / "tasks").glob(f"{args.task_id}-*.md"))
    if len(matches) != 1:
        print(f"Expected exactly one task for {args.task_id}; found {len(matches)}", file=sys.stderr)
        return 2
    task_text = matches[0].read_text(encoding="utf-8")
    def field(name: str) -> str:
        match = re.search(rf"^- {re.escape(name)}: (.+)$", task_text, re.M)
        return match.group(1).strip() if match else "unspecified"
    created = now_pair()
    stamp = filename_stamp(created["local"])
    path = OUT_DIR / f"{stamp}_{args.task_id}_{slugify(args.title)}.md"
    template = (BRAIN / "task-report-template.md").read_text(encoding="utf-8")
    lines = template.splitlines()
    body = "\n".join(lines[2:]).lstrip()
    report = f"""# {args.task_id} — {args.title}

## Timestamp metadata

- Report created UTC: {created['utc']}
- Report created local ({created['timezone']}): {created['local']}
- Timestamp source: {created['timestamp_source']}; verify host clock synchronization if exact wall-clock accuracy is critical.
- Report status: in progress

{body}
"""
    report = report.replace("- ID:\n", f"- ID: {args.task_id}\n", 1)
    report = report.replace("- Owner:\n", f"- Owner: {field('owner')}\n", 1)
    report = report.replace("- Reviewer:\n", f"- Reviewer: {field('reviewer')}\n", 1)
    report = report.replace("- Phase:\n", f"- Phase: {field('status')}\n", 1)
    report = report.replace("- Started UTC:\n", f"- Started UTC: {created['utc']}\n", 1)
    report = report.replace("- Started Asia/Kolkata:\n", f"- Started Asia/Kolkata: {created['local']}\n", 1)
    report = report.replace("- Finished UTC:\n", "- Finished UTC: pending\n", 1)
    report = report.replace("- Finished Asia/Kolkata:\n", "- Finished Asia/Kolkata: pending\n", 1)
    saved = write_unique(path, report)
    print(saved.relative_to(ROOT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
