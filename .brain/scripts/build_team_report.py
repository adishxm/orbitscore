#!/usr/bin/env python3
"""Generate the ignored team-only HTML status report."""
from __future__ import annotations
import html
import json
from pathlib import Path
import re
from reporting import filename_stamp, now_pair, write_unique

ROOT = Path(__file__).resolve().parents[2]
BRAIN = ROOT / ".brain"
OUT = ROOT / "team-report.html"
SNAPSHOT_DIR = BRAIN / "reports" / "team-snapshots"

def read(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.exists() else ""

def task_info(path: Path) -> dict:
    text = read(path)
    def field(name: str, default: str = ""):
        m = re.search(rf"^- {re.escape(name)}: (.+)$", text, re.M)
        return m.group(1).strip() if m else default
    title = text.splitlines()[0].removeprefix("# ").strip() if text else path.stem
    return {"id": path.stem.split("-", 1)[0], "title": title, "status": field("status", "unknown"), "owner": field("owner", "unassigned"), "priority": field("priority", "P2"), "depends": field("depends_on", "[]")}

def esc(value) -> str:
    return html.escape(str(value))

def main():
    generated = now_pair()
    stamp = filename_stamp(generated["local"])
    state = json.loads(read(BRAIN / "state.json") or "{}")
    tasks = sorted((task_info(p) for p in (BRAIN / "tasks").glob("T*.md")), key=lambda x: x["id"])
    phases = read(BRAIN / "phases.yaml")
    context = read(BRAIN / "context.md")
    knowledge = read(BRAIN / "team-knowledge.md")
    reports = sorted((BRAIN / "reports" / "task-runs").glob("*_verification.json"), key=lambda p: p.name, reverse=True) if (BRAIN / "reports" / "task-runs").exists() else []
    latest = json.loads(reports[0].read_text(encoding="utf-8")) if reports else None
    done = sum(t["status"] == "done" for t in tasks)
    ready = sum(t["status"] == "ready" for t in tasks)
    blocked = sum(t["status"].startswith("blocked") for t in tasks)
    rows = "".join(f"<tr><td>{esc(t['id'])}</td><td>{esc(t['title'])}</td><td><span class='status {esc(t['status'])}'>{esc(t['status'])}</span></td><td>{esc(t['owner'])}</td><td>{esc(t['priority'])}</td><td>{esc(t['depends'])}</td></tr>" for t in tasks)
    latest_box = "<p>No verification report yet. Start a task report with <code>python .brain/scripts/new_task_report.py T001 --title 'Task title'</code>; after implementation run the report-only verification gate. Reports are timestamped and archived.</p>"
    if latest:
        check_rows = "".join(f"<li class='{ 'pass' if c['passed'] else 'fail' }'>{esc(c['label'])}: {'PASS' if c['passed'] else 'FAIL'} <code>{esc(c['command'])}</code></li>" for c in latest.get("checks", []))
        latest_box = f"<p><b>{esc(latest['task_id'])}</b> completed UTC {esc(latest.get('completed_at_utc','unknown'))}; {esc(latest.get('timezone','local'))} {esc(latest.get('completed_at_local','unknown'))}: <span class='{ 'pass' if latest['passed'] else 'fail' }'>{'ALL BASELINE CHECKS PASSED' if latest['passed'] else 'CHECKS FAILED'}</span></p><p>Status: {esc(latest.get('status','unknown'))}; reviewer approval is still required.</p><ul>{check_rows}</ul>"
    def md_to_html(text: str) -> str:
        chunks=[]
        for line in text.splitlines():
            if line.startswith("# "): chunks.append(f"<h2>{esc(line[2:])}</h2>")
            elif line.startswith("## "): chunks.append(f"<h3>{esc(line[3:])}</h3>")
            elif line.startswith("- "): chunks.append(f"<li>{esc(line[2:])}</li>")
            elif line.strip(): chunks.append(f"<p>{esc(line)}</p>")
        return "".join(chunks)
    page = f"""<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width'><title>OrbitReady Team Report</title><style>
:root{{--bg:#0b1020;--panel:#131b31;--muted:#aeb9d6;--text:#f5f7ff;--cyan:#5ee7d2;--amber:#ffd166;--red:#ff7b8a;--blue:#8ab4ff}}*{{box-sizing:border-box}}body{{margin:0;background:linear-gradient(135deg,#0b1020,#172342);color:var(--text);font:15px/1.55 system-ui,sans-serif}}main{{max-width:1200px;margin:auto;padding:32px 20px}}h1{{font-size:36px;margin:0 0 8px}}h2{{color:var(--cyan);margin-top:28px}}h3{{color:var(--blue)}}p,.muted{{color:var(--muted)}}.hero,.panel{{background:rgba(19,27,49,.94);border:1px solid #2d3c63;border-radius:16px;padding:22px;margin:16px 0;box-shadow:0 12px 40px #0003}}.hero{{border-left:5px solid var(--cyan)}}.stats{{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}}.stat{{padding:16px;border-radius:12px;background:#1b2744}}.stat b{{font-size:28px;display:block}}table{{border-collapse:collapse;width:100%;overflow:hidden;border-radius:12px}}th,td{{padding:11px;text-align:left;border-bottom:1px solid #2d3c63;vertical-align:top}}th{{background:#24355d}}.status{{padding:3px 8px;border-radius:99px;background:#38466a;font-size:12px}}.done,.pass{{color:#0b241f;background:var(--cyan)}}.ready{{color:#30260b;background:var(--amber)}}.blocked-by-T002,.blocked-by-T003,.blocked-by-T005,.fail{{color:#320d15;background:var(--red)}}.columns{{display:grid;grid-template-columns:1fr 1fr;gap:16px}}code{{color:#d9e2ff;background:#0a0f1f;padding:2px 5px;border-radius:5px}}li{{margin:7px 0}}footer{{color:var(--muted);margin-top:28px;font-size:13px}}@media(max-width:800px){{.stats,.columns{{grid-template-columns:1fr 1fr}}}}@media(max-width:560px){{.stats,.columns{{grid-template-columns:1fr}}}}
</style></head><body><main><section class='hero'><h1>OrbitReady Team Report</h1><p>This is the stable latest-view pointer. Timestamped snapshots and task reports are retained under <code>.brain/reports/</code>; this file may be regenerated.</p><p>Generated UTC: {esc(generated['utc'])}</p><p>Generated {esc(generated['timezone'])}: {esc(generated['local'])}</p><p>Timestamp source: {esc(generated['timestamp_source'])}; wall-clock accuracy depends on host time synchronization.</p></section><section class='stats'><div class='stat'><span>Completed</span><b>{done}</b></div><div class='stat'><span>Ready</span><b>{ready}</b></div><div class='stat'><span>Blocked by dependencies</span><b>{blocked}</b></div><div class='stat'><span>Current phase</span><b style='font-size:16px'>{esc(state.get('current_phase','unknown'))}</b></div></section><section class='panel'><h2>What is happening?</h2>{md_to_html(context)}</section><section class='panel'><h2>Task board</h2><table><thead><tr><th>ID</th><th>Task</th><th>Status</th><th>Owner</th><th>Priority</th><th>Dependencies</th></tr></thead><tbody>{rows}</tbody></table></section><section class='panel'><h2>Build phases</h2><pre style='white-space:pre-wrap;color:var(--muted)'>{esc(phases)}</pre></section><div class='columns'><section class='panel'><h2>Latest verification</h2>{latest_box}</section><section class='panel'><h2>What should the team know?</h2>{md_to_html(knowledge)}</section></div><section class='panel'><h2>How the loop works</h2><p><b>Plan → Implement → Test → Verify → Repair if needed → Write timestamped report → Reviewer approval → Manual Git review.</b> Passing baseline tests is not project completion. See <code>.brain/PROJECT_COMPLETION.md</code>; the project's whole-project completion percentage is not inferred from a task count.</p><h3>Judge-safe product answer</h3><p>OrbitReady assists evidence extraction and explanation. Deterministic rules evaluate confirmed inputs. Humans approve findings. It is not official compliance, certification, conjunction assessment, collision prediction, or maneuver advice.</p></section><footer>Stable latest view generated by <code>.brain/scripts/build_team_report.py</code>. An append-only timestamped HTML snapshot is also written for each run.</footer></main></body></html>"""
    snapshot = write_unique(SNAPSHOT_DIR / f"{stamp}_team-report.html", page)
    OUT.write_text(page, encoding="utf-8")
    print(f"Latest view: {OUT}\nTimestamped snapshot: {snapshot}")

if __name__ == "__main__":
    main()
