import html, json
from typing import Any

def generate_packet(mission: dict, evaluation: dict, decisions: list[dict]) -> dict[str, Any]:
    rows = "".join(f"<tr><td>{html.escape(f['rule_id'])}</td><td>{html.escape(f['status'])}</td><td>{html.escape(f['title'])}</td><td>{html.escape(f['source_citation'].get('document',''))} {html.escape(f['source_citation'].get('clause',''))}</td></tr>" for f in evaluation["findings"])
    page = f"<!doctype html><meta charset='utf-8'><title>OrbitScore review packet</title><h1>{html.escape(mission['name'])}</h1><p>Profile: {html.escape(evaluation['profile_id'])}</p><p>Decision-support artifact; not a certification.</p><table border='1'><thead><tr><th>Rule</th><th>Status</th><th>Finding</th><th>Source</th></tr></thead><tbody>{rows}</tbody></table>"
    return {"status": "READY", "mission": mission, "evaluation": evaluation, "decisions": decisions, "html": page}

