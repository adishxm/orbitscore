from __future__ import annotations
import html
import json
from datetime import datetime, timezone
from typing import Any

DISCLAIMER_TEXT = (
    "NOTICE: This review packet is an algorithmic decision-support artifact produced from "
    "synthetic test evidence. It is NOT official compliance, legal certification, "
    "conjunction assessment, collision prediction, or flight maneuver advice. "
    "All findings must be confirmed by qualified human mission safety authorities."
)

COUNTERFACTUAL_DISCLAIMER = (
    "Counterfactual levers and simulated suggestions are illustrative synthetic projections. "
    "They do not replace formal mission engineering analysis or trajectory safety margins."
)


def generate_packet(
    mission: dict,
    evaluation: dict,
    decisions: list[dict] | dict[str, dict],
    provenance_status: dict | None = None
) -> dict[str, Any]:
    """Generate complete, cited human-readable HTML and structured JSON review packet."""
    now_utc = datetime.now(timezone.utc).isoformat()
    if isinstance(decisions, dict):
        decisions_by_id = decisions
        decisions_list = list(decisions.values())
    else:
        decisions_by_id = {d["finding_id"]: d for d in decisions}
        decisions_list = decisions
    prov = provenance_status or {"valid": True, "count": 0}

    # Format finding rows for HTML
    rows = []
    for f in evaluation.get("findings", []):
        fid = f.get("finding_id", "")
        dec = decisions_by_id.get(fid, {})
        dec_label = dec.get("decision", "UNREVIEWED")
        dec_note = dec.get("note", "—")
        dec_reviewer = dec.get("reviewer", "unassigned")
        citation = f.get("source_citation", {})
        citation_str = f"{citation.get('document', 'Unknown doc')} · {citation.get('clause', 'General')}"
        limitation = f.get("limitation_notice", "Pre-review rule logic only; verify controlling text.")
        
        status_color = "#10b981" if f.get("status") == "PASS_UNDER_PROFILE" else ("#f59e0b" if f.get("status") in ("WARNING", "NEEDS_EVIDENCE") else "#ef4444")

        row_html = f"""
        <tr>
          <td><b>{html.escape(f.get('rule_id', ''))}</b><br><small style="color:#64748b;">{html.escape(f.get('title', ''))}</small></td>
          <td><span style="display:inline-block;padding:2px 8px;border-radius:4px;font-weight:600;font-size:12px;color:#fff;background:{status_color};">{html.escape(f.get('status', ''))}</span></td>
          <td><b>{html.escape(str(f.get('observed_value', '—')))}</b> {html.escape(str(f.get('observed_unit', '')))}</td>
          <td>threshold: {html.escape(str(f.get('threshold', '—')))}</td>
          <td><small>{html.escape(citation_str)}</small></td>
          <td>
            <b style="color:#2563eb;">{html.escape(dec_label)}</b><br>
            <small style="color:#475569;">by {html.escape(dec_reviewer)}: {html.escape(dec_note)}</small>
          </td>
          <td><small style="color:#64748b;font-size:11px;">{html.escape(limitation)}</small></td>
        </tr>
        """
        rows.append(row_html)

    tbody = "\n".join(rows)

    html_content = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>OrbitScore Review Packet — {html.escape(mission.get('name', 'Mission'))}</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #1e293b; background: #fff; line-height: 1.5; }}
    .header {{ border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 24px; }}
    h1 {{ margin: 0 0 6px; font-size: 26px; color: #0f172a; }}
    .meta-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 20px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }}
    .meta-item b {{ display: block; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }}
    .meta-item span {{ font-size: 15px; font-weight: 600; color: #0f172a; }}
    .notice-box {{ background: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #1e3a8a; border-radius: 0 6px 6px 0; }}
    .warning-box {{ background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #92400e; border-radius: 0 6px 6px 0; }}
    table {{ width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 13px; }}
    th, td {{ padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; vertical-align: top; }}
    th {{ background: #f1f5f9; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }}
    .footer {{ margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between; }}
    @media print {{ body {{ margin: 15mm; }} }}
  </style>
</head>
<body>
  <div class="header">
    <h1>OrbitScore Mission Review Packet</h1>
    <p style="margin: 0; color: #64748b; font-size: 14px;">Deterministic regulatory policy evaluation & human review decision dossier</p>
  </div>

  <div class="meta-grid">
    <div class="meta-item"><b>Target Mission</b><span>{html.escape(mission.get('name', ''))} <small>({html.escape(mission.get('mission_id', ''))})</small></span></div>
    <div class="meta-item"><b>Policy Profile</b><span>{html.escape(evaluation.get('profile_id', ''))}</span></div>
    <div class="meta-item"><b>Review Decisions</b><span>{len(decisions)} of {len(evaluation.get('findings', []))} reviewed</span></div>
    <div class="meta-item"><b>Provenance Chain</b><span>{'VALID (SHA-256)' if prov.get('valid') else 'INTEGRITY WARNING'}</span></div>
  </div>

  <div class="notice-box">
    <b>Regulatory Disclaimer:</b> {html.escape(DISCLAIMER_TEXT)}
  </div>

  <div class="warning-box">
    <b>Counterfactual & Simulation Notice:</b> {html.escape(COUNTERFACTUAL_DISCLAIMER)}
  </div>

  <h2>Rule-by-Rule Compliance Findings & Review Decisions</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 20%;">Rule / Finding</th>
        <th style="width: 12%;">Status</th>
        <th style="width: 12%;">Observed</th>
        <th style="width: 12%;">Threshold</th>
        <th style="width: 16%;">Source Citation</th>
        <th style="width: 16%;">Human Decision</th>
        <th style="width: 12%;">Limitation</th>
      </tr>
    </thead>
    <tbody>
      {tbody}
    </tbody>
  </table>

  <div class="footer">
    <span>Generated by OrbitScore Engine · {html.escape(now_utc)}</span>
    <span>Chain Head: <code>{html.escape(str(prov.get('head', 'GENESIS'))[:16])}...</code></span>
  </div>
</body>
</html>"""

    return {
        "status": "READY",
        "generated_at": now_utc,
        "mission_id": mission.get("mission_id", ""),
        "mission": mission,
        "evaluation": evaluation,
        "profile": evaluation.get("profile_id", ""),
        "msri": evaluation.get("msri", {}),
        "findings": evaluation.get("findings", []),
        "reviews": decisions_list,
        "decisions": decisions_list,
        "provenance": prov,
        "disclaimer": DISCLAIMER_TEXT,
        "disclaimers": [DISCLAIMER_TEXT, COUNTERFACTUAL_DISCLAIMER],
        "counterfactual_disclaimer": COUNTERFACTUAL_DISCLAIMER,
        "html": html_content
    }


def generate_html_packet(packet: dict[str, Any]) -> str:
    """Helper to return the HTML string from a packet."""
    return packet.get("html", "")
