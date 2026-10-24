from __future__ import annotations
import sys
import tempfile
import unittest
import shutil
import subprocess
from datetime import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))
from reporting import filename_stamp, now_pair, write_unique  # noqa: E402


class ReportingTests(unittest.TestCase):
    def test_now_pair_has_explicit_utc_and_kolkata_offsets_for_same_instant(self):
        pair = now_pair()
        utc = datetime.fromisoformat(pair["utc"].replace("Z", "+00:00"))
        local = datetime.fromisoformat(pair["local"])
        self.assertEqual(utc.utcoffset().total_seconds(), 0)
        self.assertEqual(local.utcoffset().total_seconds(), 19800)
        self.assertEqual(utc, local.astimezone(utc.tzinfo))
        self.assertEqual(pair["timezone"], "Asia/Kolkata")
        self.assertEqual(pair["timestamp_source"], "host system clock")

    def test_filename_stamp_preserves_offset_without_colons(self):
        value = "2026-10-22T01:30:00.123456+05:30"
        stamp = filename_stamp(value)
        self.assertEqual(stamp, "20261022T013000.123456+0530")
        self.assertNotIn(":", stamp)

    def test_write_unique_never_overwrites_prior_report(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "report.json"
            first = write_unique(path, "first\n")
            second = write_unique(path, "second\n")
            self.assertNotEqual(first, second)
            self.assertEqual(first.read_text(), "first\n")
            self.assertEqual(second.read_text(), "second\n")
            self.assertEqual(len(list(Path(tmp).glob("report*.json"))), 2)

    def test_task_report_cli_creates_draft_and_finished_copy_without_overwrite(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            brain = root / ".brain"
            (brain / "scripts").mkdir(parents=True)
            (brain / "tasks").mkdir()
            for name in ("reporting.py", "new_task_report.py", "finalize_task_report.py"):
                shutil.copy2(SCRIPT_DIR / name, brain / "scripts" / name)
            shutil.copy2(SCRIPT_DIR.parent / "task-report-template.md", brain / "task-report-template.md")
            (brain / "tasks" / "T001-example.md").write_text(
                "# T001 example\n- status: ready\n- owner: Agent A\n- reviewer: Reviewer B\n- priority: P1\n- depends_on: []\n",
                encoding="utf-8",
            )
            first = subprocess.run([sys.executable, str(brain / "scripts" / "new_task_report.py"), "T001", "--title", "Unit report"], cwd=root, check=True, text=True, capture_output=True).stdout.strip()
            draft = root / first
            text = draft.read_text(encoding="utf-8")
            self.assertIn("- Started UTC: 20", text)
            self.assertIn("- Started Asia/Kolkata: 20", text)
            self.assertIn("- Finished UTC: pending", text)
            before = draft.read_text(encoding="utf-8")
            finished_rel = subprocess.run([sys.executable, str(brain / "scripts" / "finalize_task_report.py"), first], cwd=root, check=True, text=True, capture_output=True).stdout.strip()
            finished = root / finished_rel
            self.assertTrue(finished.exists())
            self.assertEqual(draft.read_text(encoding="utf-8"), before)
            finished_text = finished.read_text(encoding="utf-8")
            self.assertNotIn("- Finished UTC: pending", finished_text)
            self.assertIn("Finalized by", finished_text)
            second = subprocess.run([sys.executable, str(brain / "scripts" / "new_task_report.py"), "T001", "--title", "Unit report"], cwd=root, check=True, text=True, capture_output=True).stdout.strip()
            self.assertNotEqual(first, second)

    def test_team_report_keeps_each_timestamped_snapshot(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            brain = root / ".brain"
            (brain / "scripts").mkdir(parents=True)
            (brain / "tasks").mkdir()
            for name in ("reporting.py", "build_team_report.py"):
                shutil.copy2(SCRIPT_DIR / name, brain / "scripts" / name)
            for name in ("state.json", "phases.yaml", "context.md", "team-knowledge.md"):
                (brain / name).write_text("{}\n", encoding="utf-8")
            (brain / "tasks" / "T001-example.md").write_text("# T001 Example\n- status: ready\n", encoding="utf-8")
            script = brain / "scripts" / "build_team_report.py"
            subprocess.run([sys.executable, str(script)], cwd=root, check=True, text=True, capture_output=True)
            first_latest = (root / "team-report.html").read_text(encoding="utf-8")
            subprocess.run([sys.executable, str(script)], cwd=root, check=True, text=True, capture_output=True)
            snapshots = list((brain / "reports" / "team-snapshots").glob("*_team-report.html"))
            self.assertEqual(len(snapshots), 2)
            self.assertIn("Generated UTC:", first_latest)
            self.assertIn("Generated Asia/Kolkata:", first_latest)


if __name__ == "__main__":
    unittest.main()
