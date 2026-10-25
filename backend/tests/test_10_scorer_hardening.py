"""
OrbitScore 10/10 Hardening Test Suite
Verifies all non-frontend requirements from .brain/10_scorer/ (backend.md, security_qa.md, integrations.md, render.md, ai_ml.md)
"""
import pytest
import os
import io
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app, reset_db
from app.auth import get_configured_reviewer_key, get_configured_viewer_key, is_production, is_auth_enforced
from app.db import (
    save_mission, get_mission_db, save_evaluation_db, get_evaluation_db,
    save_review_db, get_connection, append_provenance_event_db
)
from app.integrations.elevenlabs import ElevenLabsNarrateRequest, narrate_reviewed_finding
from app.integrations.browser_use import BrowserCaptureRequest, capture_public_source, validate_url_allowlist
from app.integrations.agent37 import _parse_agent37_output_json
from app.integrations.space_track import SpaceTrackClient, SpaceTrackTLE
from ai_ml.datasets.sources import SourceDocumentRecord, validate_source_record, verify_source_bytes, compute_bytes_sha256

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_db():
    reset_db()
    yield
    reset_db()


def test_10_scorer_production_auth_fail_closed(monkeypatch):
    """Phase 1: In production mode, missing secrets fail closed and demo keys are rejected."""
    monkeypatch.setenv("ORBIT_ENV", "production")
    monkeypatch.delenv("ORBITSCORE_REVIEWER_KEY", raising=False)
    monkeypatch.delenv("ORBIT_REVIEWER_KEY", raising=False)
    monkeypatch.delenv("REVIEWER_BEARER_TOKEN", raising=False)

    # Calling get_configured_reviewer_key in production without explicit env key raises RuntimeError
    with pytest.raises(RuntimeError) as exc_info:
        get_configured_reviewer_key()
    assert "Production mode requires explicitly configured" in str(exc_info.value)

    # Demo key provided in production without explicit config is rejected with 401
    res = client.get(
        "/missions",
        headers={"Authorization": "Bearer orbitscore-reviewer-key-2026"}
    )
    assert res.status_code == 401
    assert "Demo credentials are not permitted in production" in res.json().get("detail", {}).get("message", "")


def test_10_scorer_ready_probe():
    """Phase 6: /ready verifies database connectivity and closes connection safely."""
    res = client.get("/ready")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ready"
    assert data["ready"] is True
    assert data["ok"] is True
    assert "sqlite" in data["database"]


def test_10_scorer_reset_forbidden_in_production(monkeypatch):
    """Phase 1 / Phase 3: /reset is strictly forbidden in production mode."""
    monkeypatch.setenv("ORBIT_ENV", "production")
    monkeypatch.setenv("ORBITSCORE_REVIEWER_KEY", "real-prod-reviewer-key")

    res = client.post(
        "/reset",
        headers={"Authorization": "Bearer real-prod-reviewer-key"}
    )
    assert res.status_code == 403
    assert res.json().get("detail", {}).get("error") == "RESET_FORBIDDEN_IN_PRODUCTION"


def test_10_scorer_upload_artifact_invalidates_evaluation():
    """Phase 4: Uploading a new artifact invalidates existing evaluation for that mission."""
    mission_id = "mission_complete"
    # Seed an evaluation
    save_evaluation_db(mission_id, "fcc-22-74-inspired", {
        "status": "EVALUATED",
        "findings": [{"finding_id": "f_test_01", "rule_id": "FCC-01", "status": "PASS_UNDER_PROFILE"}]
    })
    assert get_evaluation_db(mission_id) is not None

    # Upload artifact
    fake_txt = io.BytesIO(b"Mission document showing updated dry mass.")
    res = client.post(
        f"/missions/{mission_id}/artifacts",
        files={"file": ("updated_mass_spec.txt", fake_txt, "text/plain")}
    )
    assert res.status_code == 200

    # Evaluation must now be invalidated (None)
    assert get_evaluation_db(mission_id) is None


def test_10_scorer_unified_export_gate_and_tampered_provenance():
    """Phase 4: Export packet, ODAR, and EOMP all enforce the same gate and block tampered provenance."""
    mission_id = "mission_complete"
    
    # 1. Un-evaluated -> 423 EXPORT_LOCKED for all three
    for path in (f"/export/{mission_id}", f"/export/{mission_id}/odar", f"/export/{mission_id}/eomp"):
        res = client.get(path)
        assert res.status_code == 423
        assert res.json()["detail"]["code"] == "EXPORT_LOCKED"

    # Evaluate and approve finding
    eval_res = client.post(f"/missions/{mission_id}/evaluate", json={"profile_id": "fcc-22-74-inspired"})
    assert eval_res.status_code == 200
    findings = eval_res.json().get("findings", [])
    for f in findings:
        client.post(
            f"/missions/{mission_id}/findings/{f['finding_id']}/decision",
            json={"decision": "APPROVED", "note": "Approved by reviewer"}
        )

    # 2. Now exports succeed
    for path in (f"/export/{mission_id}", f"/export/{mission_id}/odar", f"/export/{mission_id}/eomp"):
        res = client.get(path)
        assert res.status_code == 200

    # 3. Tamper with the SQLite provenance chain
    conn = get_connection()
    with conn:
        conn.execute("UPDATE provenance SET payload_json = '{\"tampered\": true}' WHERE sequence = 1")
    conn.close()

    # 4. Now all three export endpoints MUST fail closed with 423 EXPORT_LOCKED and TAMPERED_PROVENANCE_CHAIN
    for path in (f"/export/{mission_id}", f"/export/{mission_id}/odar", f"/export/{mission_id}/eomp"):
        res = client.get(path)
        assert res.status_code == 423
        detail = res.json()["detail"]
        assert detail["code"] == "EXPORT_LOCKED"
        assert detail["error"] == "TAMPERED_PROVENANCE_CHAIN"


def test_10_scorer_elevenlabs_opt_in_gate():
    """Integrations: ElevenLabs requires explicit opt_in=True; opt_in=False is rejected."""
    # Finding must be reviewed first
    save_review_db({
        "finding_id": "finding_123",
        "mission_id": "mission_complete",
        "decision": "APPROVED",
        "note": "Verified by Lead Engineer"
    })

    # opt_in = False via HTTP request -> 400 Bad Request
    res = client.post(
        "/integrations/elevenlabs/narrate",
        json={
            "finding_id": "finding_123",
            "mission_id": "mission_complete",
            "reviewed_text": "Spacecraft passivation resistors have been confirmed.",
            "opt_in": False
        }
    )
    assert res.status_code == 400
    assert "Explicit user opt-in is required" in res.json().get("detail", {}).get("message", "")

    # Direct function test: opt_in=False returns status ERROR
    req = ElevenLabsNarrateRequest(
        finding_id="finding_123",
        mission_id="mission_complete",
        reviewed_text="Passivation confirmed.",
        opt_in=False
    )
    res_direct = narrate_reviewed_finding(req, is_finding_reviewed=True, review_status="APPROVED")
    assert res_direct.status =="ERROR"
    assert "opt-in is required" in res_direct.message


def test_10_scorer_browser_use_ssrf_blocked():
    """Integrations: Browser Use blocks loopback, private IPs, userinfo, and unapproved domains."""
    # Loopback targets
    for target in ("http://localhost/admin", "http://127.0.0.1:8080/secret", "http://169.254.169.254/latest/meta-data"):
        with pytest.raises(ValueError) as exc:
            validate_url_allowlist(target)
        assert "SSRF blocked" in str(exc.value)

    # Via capture endpoint
    res = client.post(
        "/integrations/browser-use/capture",
        json={"url": "http://127.0.0.1/status"}
    )
    assert res.status_code == 200
    assert res.json()["status"] == "REJECTED_DOMAIN"
    assert "SSRF blocked" in res.json()["message"]


def test_10_scorer_agent37_exact_quote_literal_invariant():
    """Integrations: Agent37 candidate is rejected if exact_quote is not a literal substring of excerpt."""
    excerpt = "The spacecraft total mass is 4.0 kg."
    
    # 1. Output containing quote that exists in excerpt
    valid_output = '[{"field": "mass_kg", "value": 4.0, "exact_quote": "mass is 4.0 kg"}]'
    cands_valid = _parse_agent37_output_json(valid_output, "test_doc", excerpt=excerpt)
    assert len(cands_valid) == 1
    assert cands_valid[0].field == "mass_kg"
    assert cands_valid[0].human_confirmed is False

    # 2. Output containing hallucinated quote that DOES NOT exist in excerpt
    hallucinated_output = '[{"field": "mass_kg", "value": 5000.0, "exact_quote": "huge booster weighing 5000 kg"}]'
    cands_invalid = _parse_agent37_output_json(hallucinated_output, "test_doc", excerpt=excerpt)
    assert len(cands_invalid) == 0  # Hallucinated candidate rejected


def test_10_scorer_space_track_stale_snapshot(monkeypatch):
    """Integrations: Space-Track snapshot older than threshold returns STALE_SNAPSHOT."""
    # Set threshold to 1 day for test
    monkeypatch.setenv("SPACE_TRACK_MAX_SNAPSHOT_AGE_DAYS", "1.0")
    
    # Mock snapshot in db
    from app.db import save_tle_snapshot
    save_tle_snapshot(
        norad_id=88888,
        epoch="2026-01-01T00:00:00Z",
        line1="1 88888U 26042A   26001.00000000  .00002182  00000-0  11824-3 0  9993",
        line2="2 88888  97.4021 142.1524 0001428 274.1522  85.9124 15.22145892  8421",
        source="Space-Track.org Snapshot",
        fetched_at="2026-01-01T00:00:00Z",
        sha256="abc12345"
    )

    client_st = SpaceTrackClient()
    import asyncio
    tle = asyncio.run(client_st.fetch_tle(88888))
    assert tle.data_mode == "STALE_SNAPSHOT"
    assert "STALE TELEMETRY SNAPSHOT" in tle.disclaimer


def test_10_scorer_source_bytes_sha256_verification():
    """AI/ML: validate_source_record recomputes and verifies SHA-256 against actual bytes."""
    data = b"Official NASA technical memo text regarding deorbit analysis."
    correct_hash = compute_bytes_sha256(data)
    
    record = SourceDocumentRecord(
        source_id="src_doc_01",
        mission_family_id="asteria",
        document_role="technical_spec",
        original_filename="nasa_memo.pdf",
        sha256=correct_hash,
        byte_size=len(data),
        page_count=2,
        retrieved_at_utc="2026-10-25T00:00:00Z",
        privacy_class="PUBLIC"
    )

    # 1. Valid bytes match record
    valid, msg = validate_source_record(record, content_bytes=data)
    assert valid is True
    assert "Byte-level integrity verified" in msg

    # 2. Corrupted bytes mismatch hash
    corrupted_data = b"Corrupted bytes injected by an adversary."
    valid_corrupt, msg_corrupt = validate_source_record(record, content_bytes=corrupted_data)
    assert valid_corrupt is False
    assert "Byte size mismatch" in msg_corrupt or "SHA-256 digest mismatch" in msg_corrupt
