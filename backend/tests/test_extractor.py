from pathlib import Path
import hashlib
import io
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
ROOT = Path(__file__).resolve().parents[2]
FIXTURES = ROOT / "fixtures"


@pytest.fixture(autouse=True)
def clean_state():
    client.post("/reset")


def test_txt_artifact_upload_and_extraction():
    txt_path = FIXTURES / "asteria3_mission_datasheet_synthetic.txt"
    content = txt_path.read_bytes()
    expected_hash = hashlib.sha256(content).hexdigest()

    # 1. Upload synthetic TXT
    res = client.post(
        "/missions/mission_complete/artifacts",
        files={"file": ("asteria3_mission_datasheet_synthetic.txt", io.BytesIO(content), "text/plain")}
    )
    assert res.status_code == 200, res.text
    art = res.json()
    assert art["sha256"] == expected_hash
    assert art["filename"] == "asteria3_mission_datasheet_synthetic.txt"
    assert art["size_bytes"] == len(content)
    assert "SYNTHETIC" in art["warning"]
    art_id = art["artifact_id"]

    # 2. Extract candidate fields
    ext_res = client.post(f"/artifacts/{art_id}/extract")
    assert ext_res.status_code == 200, ext_res.text
    data = ext_res.json()
    assert data["status"] == "SUCCESS"
    assert len(data["extracted_fields"]) >= 7

    fields_by_name = {f["field"]: f for f in data["extracted_fields"]}
    assert "operational_altitude_km" in fields_by_name
    assert fields_by_name["operational_altitude_km"]["value"] == 510.0
    assert fields_by_name["operational_altitude_km"]["unit"] == "km"
    assert fields_by_name["operational_altitude_km"]["confidence_tier"] == "HIGH"
    assert fields_by_name["operational_altitude_km"]["locator"]["line"] > 0
    assert "510" in fields_by_name["operational_altitude_km"]["locator"]["quote"]

    assert "inclination_deg" in fields_by_name
    assert fields_by_name["inclination_deg"]["value"] == 97.4

    assert "disposal_lifetime_years" in fields_by_name
    assert fields_by_name["disposal_lifetime_years"]["value"] == 8.4

    # CRITICAL: Every single candidate field MUST have human_confirmed=False
    for f in data["extracted_fields"]:
        assert f["human_confirmed"] is False, f"Field {f['field']} was prematurely confirmed"


def test_pdf_artifact_upload_and_extraction():
    pdf_path = FIXTURES / "asteria3_mission_datasheet_synthetic.pdf"
    if not pdf_path.exists():
        pytest.skip("PDF fixture not available")

    content = pdf_path.read_bytes()
    res = client.post(
        "/missions/mission_complete/artifacts",
        files={"file": ("asteria3_mission_datasheet_synthetic.pdf", io.BytesIO(content), "application/pdf")}
    )
    assert res.status_code == 200
    art_id = res.json()["artifact_id"]

    ext_res = client.post(f"/artifacts/{art_id}/extract")
    assert ext_res.status_code == 200
    data = ext_res.json()
    assert data["status"] == "SUCCESS"
    assert len(data["extracted_fields"]) >= 6

    for f in data["extracted_fields"]:
        assert f["human_confirmed"] is False


def test_unconfirmed_fields_do_not_produce_pass():
    """Unconfirmed candidate fields must not satisfy evaluation rules that require confirmed evidence."""
    # Create empty mission
    m_res = client.post("/missions", json={"mission_id": "test_unconfirmed_m", "name": "Test Mission"})
    assert m_res.status_code == 200

    # Upload and extract artifact into this mission
    txt_path = FIXTURES / "asteria3_mission_datasheet_synthetic.txt"
    content = txt_path.read_bytes()
    upload_res = client.post(
        "/missions/test_unconfirmed_m/artifacts",
        files={"file": ("datasheet.txt", io.BytesIO(content), "text/plain")}
    )
    art_id = upload_res.json()["artifact_id"]
    client.post(f"/artifacts/{art_id}/extract")

    # Evaluate mission under NASA profile
    eval_res = client.post("/missions/test_unconfirmed_m/evaluate", json={"profile_id": "nasa-std-8719-14c-inspired"})
    assert eval_res.status_code == 200
    findings = eval_res.json()["findings"]

    # All findings must be NEEDS_EVIDENCE because none of the candidate fields are human_confirmed
    for finding in findings:
        assert finding["status"] == "NEEDS_EVIDENCE", f"Finding {finding['rule_id']} passed without human confirmation!"

    # Now human confirms one field (passivated)
    patch_res = client.patch(
        "/missions/test_unconfirmed_m/fields/passivated",
        json={"value": True, "human_confirmed": True}
    )
    assert patch_res.status_code == 200

    # Re-evaluate
    eval_res2 = client.post("/missions/test_unconfirmed_m/evaluate", json={"profile_id": "nasa-std-8719-14c-inspired"})
    findings2 = eval_res2.json()["findings"]
    f_passivation = next((f for f in findings2 if f["rule_id"] == "NASA-4.4-2-PASSIVATION"), None)
    assert f_passivation is not None
    # Now that passivated is human confirmed, it passes the passivation rule!
    assert f_passivation["status"] == "PASS_UNDER_PROFILE"


def test_malformed_file_returns_not_evaluated():
    """Malformed files must return NOT_EVALUATED and clear message instead of crashing or inventing values."""
    corrupted_pdf = b"%PDF-1.4 Corrupted Binary Junk That Cannot Be Parsed \xff\xfe\x00\x01\x02"
    upload_res = client.post(
        "/missions/mission_complete/artifacts",
        files={"file": ("corrupt.pdf", io.BytesIO(corrupted_pdf), "application/pdf")}
    )
    assert upload_res.status_code == 200
    art_id = upload_res.json()["artifact_id"]

    ext_res = client.post(f"/artifacts/{art_id}/extract")
    assert ext_res.status_code == 200
    data = ext_res.json()
    assert data["status"] == "NOT_EVALUATED"
    assert len(data["extracted_fields"]) == 0
    assert "Parser failure" in data["message"] or "No compliance candidate" in data["message"]


def test_missing_fields_returns_not_evaluated():
    """Text with no compliance fields returns NOT_EVALUATED without inventing values."""
    irrelevant_text = b"Grocery list: Apples, Bananas, Coffee, Milk. No spacecraft data here."
    upload_res = client.post(
        "/missions/mission_complete/artifacts",
        files={"file": ("notes.txt", io.BytesIO(irrelevant_text), "text/plain")}
    )
    assert upload_res.status_code == 200
    art_id = upload_res.json()["artifact_id"]

    ext_res = client.post(f"/artifacts/{art_id}/extract")
    assert ext_res.status_code == 200
    data = ext_res.json()
    assert data["status"] == "NOT_EVALUATED"
    assert len(data["extracted_fields"]) == 0


def test_file_limits_and_type_restrictions():
    # Unsupported extension
    res = client.post(
        "/missions/mission_complete/artifacts",
        files={"file": ("malware.exe", io.BytesIO(b"MZ\x90\x00"), "application/x-msdownload")}
    )
    assert res.status_code == 400
    assert "Unsupported file type" in res.json()["detail"]

    # File size limit (over 10 MB)
    huge_data = b"0" * (10 * 1024 * 1024 + 1024)
    res_huge = client.post(
        "/missions/mission_complete/artifacts",
        files={"file": ("huge.txt", io.BytesIO(huge_data), "text/plain")}
    )
    assert res_huge.status_code == 413
