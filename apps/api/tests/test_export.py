import json
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app, missions, reviews, evaluations, events
from app.export import generate_packet, generate_html_packet

ROOT = Path(__file__).resolve().parents[3]
FIXTURES = ROOT / "fixtures"

def load_fixture(name):
    return json.loads((FIXTURES / f"{name}.json").read_text(encoding="utf-8"))


def test_export_locked_when_unevaluated():
    client = TestClient(app)
    missions.clear(); reviews.clear(); evaluations.clear(); events.clear()
    m = load_fixture("mission_complete")
    missions[m["mission_id"]] = m

    resp = client.get("/export/mission_complete")
    assert resp.status_code == 423
    assert resp.json()["detail"]["code"] == "EXPORT_LOCKED"


def test_export_locked_when_findings_undecided():
    client = TestClient(app)
    missions.clear(); reviews.clear(); evaluations.clear(); events.clear()
    m = load_fixture("mission_gap_heavy")
    missions[m["mission_id"]] = m

    eval_resp = client.post("/missions/mission_gap_heavy/evaluate", json={"profile_id": "fcc-22-74-inspired"})
    assert eval_resp.status_code == 200
    findings = eval_resp.json()["findings"]
    assert len(findings) > 0

    # Decide only 1 finding if multiple exist
    if len(findings) > 1:
        client.post(
            f"/missions/mission_gap_heavy/findings/{findings[0]['finding_id']}/decision",
            json={"decision": "APPROVED", "note": "Partial review"}
        )
        resp = client.get("/export/mission_gap_heavy")
        assert resp.status_code == 423
        assert resp.json()["detail"]["code"] == "EXPORT_LOCKED"
        assert resp.json()["detail"]["pending_decisions"] > 0


def test_export_unlocked_json_and_html_when_fully_decided():
    client = TestClient(app)
    missions.clear(); reviews.clear(); evaluations.clear(); events.clear()
    m = load_fixture("mission_gap_heavy")
    missions[m["mission_id"]] = m

    eval_resp = client.post("/missions/mission_gap_heavy/evaluate", json={"profile_id": "fcc-22-74-inspired"})
    findings = eval_resp.json()["findings"]

    # Review all findings
    for idx, f in enumerate(findings):
        dec = "APPROVED" if idx % 2 == 0 else "WAIVED_WITH_NOTE"
        res = client.post(
            f"/missions/mission_gap_heavy/findings/{f['finding_id']}/decision",
            json={"decision": dec, "note": f"Reviewed item {idx}", "reviewer": "Aditya"}
        )
        assert res.status_code == 200

    # 1. JSON Export
    json_resp = client.get("/export/mission_gap_heavy?format=json")
    assert json_resp.status_code == 200
    data = json_resp.json()
    assert data["mission_id"] == "mission_gap_heavy"
    assert "findings" in data
    assert "reviews" in data
    assert "disclaimers" in data
    assert data["provenance"]["valid"] is True

    # 2. HTML Export via query param
    html_resp = client.get("/export/mission_gap_heavy?format=html")
    assert html_resp.status_code == 200
    assert "text/html" in html_resp.headers["content-type"]
    assert "OrbitScore Mission Review Packet" in html_resp.text
    assert "mission_gap_heavy" in html_resp.text
    assert "Regulatory Disclaimer" in html_resp.text

    # 3. HTML Export via Accept header
    hdr_resp = client.get("/export/mission_gap_heavy", headers={"Accept": "text/html"})
    assert hdr_resp.status_code == 200
    assert "text/html" in hdr_resp.headers["content-type"]
    assert "OrbitScore Mission Review Packet" in hdr_resp.text


def test_packet_generator_direct_call():
    m = load_fixture("mission_complete")
    ev = {"profile_id": "nasa-std-8719-14c-inspired", "msri": {"score": 90, "band": "NOMINAL"}, "findings": []}
    revs = {}
    prov = {"valid": True, "count": 2, "head": "abc"}
    packet = generate_packet(m, ev, revs, prov)
    assert packet["mission_id"] == "mission_complete"

    html = generate_html_packet(packet)
    assert "<!doctype html>" in html.lower()
    assert "OrbitScore Mission Review Packet" in html

