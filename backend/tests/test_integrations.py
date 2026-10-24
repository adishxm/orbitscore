import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_integrations_status_endpoint():
    """Verify GET /integrations/status lists all 6 services with proper boundaries."""
    res = client.get("/integrations/status")
    assert res.status_code == 200
    data = res.json()
    services = data.get("services", {})
    assert "flutterflow" in services
    assert "agent37" in services
    assert "browser_use" in services
    assert "elevenlabs" in services
    assert "adaption" in services
    assert "render" in services
    assert "External services cannot certify compliance" in data.get("governance_notice", "")

def test_agent37_triage_candidates_and_invariants():
    """Verify Agent37 extracts structured candidate pairs and preserves human_confirmed=False."""
    sample_text = (
        "Spacecraft design report: Satellite wet mass of 180.5 kg. Operating at perigee altitude of 520 km. "
        "Post-mission disposal within 4.5 years via natural orbital decay."
    )
    res = client.post(
        "/integrations/agent37/triage",
        json={
            "excerpt": sample_text,
            "source_identifier": "doc_design_spec_01",
            "mission_id": "mission_complete"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ("SUCCESS", "FALLBACK_PARSED")
    assert len(data["source_hash"]) == 64
    candidates = data["candidates"]
    assert len(candidates) >= 2

    # Check strict invariants
    for c in candidates:
        assert c["human_confirmed"] is False
        assert 0.0 <= c["uncertainty"] <= 1.0
        assert c["exact_quote"] != ""

    fields_found = {c["field"] for c in candidates}
    assert "wet_mass_kg" in fields_found or "disposal_duration_years" in fields_found or "perigee_altitude_km" in fields_found

def test_browser_use_capture_allowlist_enforcement():
    """Verify Browser Use strictly rejects non-allowlisted domains and accepts approved public sources."""
    # 1. Disallowed domain -> REJECTED_DOMAIN
    res_disallowed = client.post(
        "/integrations/browser-use/capture",
        json={
            "url": "https://unauthorized-random-tracker.com/policy",
            "target_clause": "debris"
        }
    )
    assert res_disallowed.status_code == 200
    data_dis = res_disallowed.json()
    assert data_dis["status"] == "REJECTED_DOMAIN"
    assert "not in the approved public source register" in data_dis["message"]
    assert data_dis["human_confirmed"] is False

    # 2. Approved allowlisted domain -> DISABLED_FALLBACK / SUCCESS with candidate output
    res_allowed = client.post(
        "/integrations/browser-use/capture",
        json={
            "url": "https://docs.fcc.gov/public/attachments/FCC-22-74A1.pdf",
            "target_clause": "5-year rule"
        }
    )
    assert res_allowed.status_code == 200
    data_al = res_allowed.json()
    assert data_al["status"] in ("SUCCESS", "DISABLED_FALLBACK")
    assert data_al["domain"] == "docs.fcc.gov"
    assert data_al["human_confirmed"] is False
    assert data_al["excerpt"] is not None

def test_elevenlabs_narration_gate_on_unreviewed_finding():
    """Verify ElevenLabs strictly rejects narration for unreviewed/unapproved findings."""
    res = client.post(
        "/integrations/elevenlabs/narrate",
        json={
            "finding_id": "non_existent_unreviewed_finding",
            "mission_id": "mission_complete",
            "reviewed_text": "Executive summary of compliance findings."
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "REJECTED_UNREVIEWED"
    assert "Narration rejected" in data["message"]
    assert data["audio_base64"] is None

def test_elevenlabs_narration_for_approved_finding():
    """Verify ElevenLabs allows narration once a human engineering decision is recorded."""
    # First record an explicit approval decision on a known finding
    eval_res = client.post(
        "/missions/mission_complete/evaluate",
        json={"profile_id": "fcc-22-74-inspired"}
    )
    assert eval_res.status_code == 200
    finding = eval_res.json()["findings"][0]
    finding_id = finding["finding_id"]

    dec_res = client.post(
        f"/missions/mission_complete/findings/{finding_id}/decision",
        json={
            "decision": "APPROVED",
            "reviewer": "Flight Safety Officer",
            "note": "Human verification confirms passivation valve testing complete."
        }
    )
    assert dec_res.status_code == 200

    # Now request narration on the human-reviewed finding
    nar_res = client.post(
        "/integrations/elevenlabs/narrate",
        json={
            "finding_id": finding_id,
            "mission_id": "mission_complete",
            "reviewed_text": "Flight safety confirms passivation valve test passed under profile."
        }
    )
    assert nar_res.status_code == 200
    data = nar_res.json()
    assert data["status"] in ("SUCCESS", "DISABLED_FALLBACK")
    assert data["finding_id"] == finding_id
    assert "AI-generated narration; not certification" in data["disclaimer"]


def test_agent37_chat_copilot_endpoint():
    """Verify Agent37 interactive Copilot responds with advisory disclaimer and session metadata."""
    res = client.post(
        "/integrations/agent37/chat",
        json={
            "message": "What is the orbital lifetime limit for LEO disposal?",
            "mission_id": "asteria-3"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ("SUCCESS", "FALLBACK", "ERROR")
    assert "Agent37 assistance only" in data["disclaimer"]
    assert len(data["response"]) > 0


def test_agent37_status_endpoint():
    """Verify GET /integrations/agent37/status returns connectivity health check."""
    res = client.get("/integrations/agent37/status")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert "instance_id" in data
    assert data["instance_id"] != ""

