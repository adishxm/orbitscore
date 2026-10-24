#!/usr/bin/env python3
"""Create a timestamped finished copy of a report draft without replacing it."""
from __future__ import annotations
import argparse
import re
import sys
from pathlib import Path
from reporting import filename_stamp, now_pair, write_unique

ROOT = Path(__file__).resolve().parents[2]
REPORT_DIR = (ROOT / ".brain" / "reports" / "task-runs").resolve()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", help="Path printed by new_task_report.py")
    args = parser.parse_args()
    source = Path(args.report).resolve()
    if not source.is_relative_to(REPORT_DIR) or source.suffix.lower() != ".md" or not source.is_file():
        print("Report must be an existing Markdown file inside .brain/reports/task-runs/.", file=sys.stderr)
        return 2
    text = source.read_text(encoding="utf-8")
    if "- Report status: in progress" not in text or "- Finished UTC: pending" not in text:
        print("Report does not look like an unfinished report draft; refusing to alter it.", file=sys.stderr)
        return 2
    finished = now_pair()
    text = text.replace("- Finished UTC: pending", f"- Finished UTC: {finished['utc']}", 1)
    text = text.replace("- Finished Asia/Kolkata: pending", f"- Finished Asia/Kolkata: {finished['local']}", 1)
    text = text.replace("- Report status: in progress", f"- Report status: finished; finalized {finished['utc']} / {finished['local']}", 1)
    text += f"\n\n---\nFinalized by `.brain/scripts/finalize_task_report.py` at {finished['utc']} ({finished['timezone']}: {finished['local']}). This records report completion, not reviewer approval or task completion.\n"
    target = source.with_name(f"{source.stem}_finished_{filename_stamp(finished['local'])}.md")
    saved = write_unique(target, text)
    print(saved.relative_to(ROOT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
