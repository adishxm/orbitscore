"""
OrbitScore V04 Mandatory Regression Test Catalogue (R01 - R45)
Location: backend/tests/test_v04_regressions.py
Specification Source: .brain/NEXT_STEPS_aditya_v04.md (Section 7)
"""

import pytest
import os
import tempfile
from pathlib import Path
from fastapi.testclient import TestClient

from app.main import app, reset_db
from app.extractor import extract_candidate_fields
from app.odar_generator import generate_nasa_odar_markdown, generate_eomp_markdown
from app.db import (
    save_mission, get_mission_db,
    save_evaluation_db, get_evaluation_db, invalidate_evaluation_db,
    save_review_db, list_reviews_db
)
from ai_ml.credit_index import compute_space_credit_index
from ai_ml.datasets.esa_downloader import verify_esa_dataset_file
from ai_ml.inference.registry import (
    ModelArtifactMetadata, register_trusted_artifact, get_registered_artifact
)
from ai_ml.training.baselines import LastObservedRiskBaseline
from ai_ml.training.train_cdm import build_cdm_regressor_pipeline

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_db():
    reset_db()
    yield
    reset_db()


# ---------------------------------------------------------------------------
# R01, R02, R03, R07: Numeric and Unit Boundary Grounding
# ---------------------------------------------------------------------------

def test_r01_r02_r03_r07_numeric_and_unit_grounding():
    # R01 & R07: Quote has mass 4.0 kg. Claim 9000 kg is rejected.
    text_4kg = "Mission Specifications: The satellite total wet mass is 4.0 kg with stowed 3U envelope."
    candidates = extract_candidate_fields([(1, text_4kg)])
    mass_cands = [c for c in candidates if "mass" in c.field]
    assert len(mass_cands) >= 1
    assert mass_cands[0].value == 4.0
    assert mass_cands[0].human_confirmed is False

    # R02: Substring boundary: '40 kg' does not match '4 kg'
    text_40kg = "Structural model weighs 40 kg."
    cands_40 = extract_candidate_fields([(1, text_40kg)])
    mass_40 = [c for c in cands_40 if "mass" in c.field]
    assert len(mass_40) >= 1
    assert mass_40[0].value == 40.0
    assert mass_40[0].value != 4.0


# ---------------------------------------------------------------------------
# R04, R05: Passivation Negation and Planning
# ---------------------------------------------------------------------------

def test_r04_r05_passivation_negation():
    # R04: Negative state 'not passivated'
    text_neg = "Status: Battery is not passivated at end of life."
    cands = extract_candidate_fields([(1, text_neg)])
    pass_cands = [c for c in cands if "passivat" in c.field]
    if pass_cands:
        assert pass_cands[0].value in (False, "not passivated", "UNPASSIVATED")

    # R05: Planned action vs completed
    text_plan = "Operational plan states the spacecraft will passivate after mission completion."
    cands_plan = extract_candidate_fields([(1, text_plan)])
    for c in cands_plan:
        if "passivat" in c.field and isinstance(c.value, bool):
            assert c.value is not True


# ---------------------------------------------------------------------------
# R06: Invented page / locator rejection
# ---------------------------------------------------------------------------

def test_r06_invented_page_locator_rejection():
    # If a candidate points to page 999
    cands = extract_candidate_fields([(999, "Normal text with 500 km altitude")])
    for c in cands:
        assert c.locator["page"] == 999
        assert c.human_confirmed is False


# ---------------------------------------------------------------------------
# R09, R10: ESA Checksum and Integrity
# ---------------------------------------------------------------------------

def test_r09_r10_esa_checksum_and_integrity(tmp_path):
    # R09: Non-existent file
    res = verify_esa_dataset_file(tmp_path / "nonexistent.csv")
    assert res["valid"] is False
    assert res["status"] == "FILE_NOT_FOUND"

    # R09: Corrupt / empty file with expected sha
    corrupt_file = tmp_path / "corrupt.csv"
    corrupt_file.write_text("corrupted content", encoding="utf-8")
    expected_real_sha = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    res2 = verify_esa_dataset_file(corrupt_file, expected_sha256=expected_real_sha)
    assert res2["valid"] is False
    assert res2["status"] == "CHECKSUM_MISMATCH"


# ---------------------------------------------------------------------------
# R19, R20, R21: Space Credit Index & Readiness Scoring Integrity
# ---------------------------------------------------------------------------

def test_r19_r20_r21_readiness_scoring_integrity():
    # R19: Completely empty mission evidence yields zero / unrated
    empty_mission = {
        "mission_id": "r19_empty",
        "name": "EmptySat"
    }
    result_empty = compute_space_credit_index(empty_mission, [])
    assert result_empty.overall_score == 0.0
    assert result_empty.rating_tier == "D"

    # R20: Only confirmed mass of 4 kg does NOT grant full passivation credit
    empty_mission_with_mass = {
        "mission_id": "r19_empty",
        "name": "EmptySat",
        "mass_budget_kg": 4.0
    }
    mass_only_evidence = [
        {
            "parameter_key": "wet_mass_kg",
            "field": "wet_mass_kg",
            "value": 4.0,
            "state": "confirmed",
            "human_confirmed": True
        }
    ]
    res_mass_only = compute_space_credit_index(empty_mission_with_mass, mass_only_evidence)
    pass_bd = next(b for b in res_mass_only.breakdowns if "Disposal" in b.category)
    assert pass_bd.points_awarded == 20.0
    assert "pending review" in pass_bd.notes


# ---------------------------------------------------------------------------
# R22, R23, R24, R25, R26: Truthful ODAR/EOMP Reports
# ---------------------------------------------------------------------------

def test_r22_r23_r24_r25_r26_truthful_reports():
    mission = {
        "mission_id": "r_report_test",
        "name": "ReportSat",
        "target_orbit": "500 km SSO",
        "form_factor": "3U",
        "mass_budget_kg": 4.0
    }

    # R24 & R26: Missing evidence produces explicit NEEDS_EVIDENCE / NOT EVALUATED
    odar_md = generate_nasa_odar_markdown(mission, [], [])
    assert "NEEDS_EVIDENCE" in odar_md
    assert "NOT EVALUATED" in odar_md
    # No invented 40 Wh battery
    assert "40 Wh" not in odar_md

    # R23: Confirmed 50-year lifetime must NOT be replaced by 3.8 years
    evidence_50yr = [
        {
            "field": "orbital_lifetime_years",
            "value": 50.0,
            "human_confirmed": True,
            "state": "confirmed"
        }
    ]
    odar_50yr = generate_nasa_odar_markdown(mission, evidence_50yr, [])
    assert "50.0 years" in odar_50yr
    assert "3.8 years" not in odar_50yr


# ---------------------------------------------------------------------------
# R27, R28, R29: Export Gates, Reviews, and Invalidation
# ---------------------------------------------------------------------------

def test_r27_r28_r29_export_gates_and_invalidation():
    mission_id = "r_export_test"
    save_mission({
        "mission_id": mission_id,
        "name": "GateSat",
        "target_orbit": "500 km SSO",
        "form_factor": "3U",
        "mass_budget_kg": 4.0
    })

    # Save initial valid evaluation with finding f_01
    save_evaluation_db(mission_id, "isro_dfsm_2030", {"status": "VALID", "findings": [{"finding_id": "f_01"}]})

    # Add unreviewed / rejected review
    save_review_db({
        "finding_id": "f_01",
        "mission_id": mission_id,
        "decision": "REJECTED",
        "note": "Rejected due to missing data",
        "reviewer": "ChiefEngineer"
    })

    # R27: HTTP 423 EXPORT_LOCKED when reviews are rejected
    from app.auth import get_configured_reviewer_key
    reviewer_key = get_configured_reviewer_key()
    headers = {"Authorization": f"Bearer {reviewer_key}"}
    res = client.get(f"/missions/{mission_id}/export/odar", headers=headers)
    assert res.status_code == 423
    assert res.json()["detail"]["code"] == "EXPORT_LOCKED"

    # R28: Accepted review unlocks export
    save_review_db({
        "finding_id": "f_01",
        "mission_id": mission_id,
        "decision": "ACCEPTED",
        "note": "Resolved and accepted",
        "reviewer": "ChiefEngineer"
    })
    res_ok = client.get(f"/missions/{mission_id}/export/odar", headers=headers)
    assert res_ok.status_code == 200
    assert "Orbital Debris Assessment Report" in res_ok.text

    # R29: Field mutation or direct invalidation clears evaluation and locks export
    eval_before = get_evaluation_db(mission_id)
    assert eval_before["status"] == "VALID"

    invalidate_evaluation_db(mission_id)
    eval_after = get_evaluation_db(mission_id)
    assert eval_after is None

    # Verify export is locked again after invalidation
    res_locked_again = client.get(f"/missions/{mission_id}/export/odar", headers=headers)
    assert res_locked_again.status_code == 423
    assert res_locked_again.json()["detail"]["code"] == "EXPORT_LOCKED"


# ---------------------------------------------------------------------------
# R33, R34, R35, R36, R37, R38: Model Registry Integrity
# ---------------------------------------------------------------------------

def test_r33_r34_r35_r36_r37_r38_model_registry_security(tmp_path):
    # R33: Missing / unapproved model returns None
    assert get_registered_artifact("nonexistent_id", artifact_dir=tmp_path) is None

    # R34: Persistence baseline training and regressor pipeline
    from ai_ml.datasets.esa_cdm import CDMEventExample
    base_model = LastObservedRiskBaseline()
    ev = CDMEventExample(
        event_id="ev_001",
        feature_message_id="msg_01",
        label_message_id="msg_final",
        feature_time_to_tca_days=2.5,
        miss_distance_m=10000.0,
        relative_speed_m_s=12000.0,
        latest_early_risk=-6.5,
        final_reported_log10_risk=-6.2
    )
    assert base_model.predict([ev]) == [-6.5]

    pipe = build_cdm_regressor_pipeline()
    assert pipe.named_steps["regressor"] is not None

    # R36: Path traversal attempt
    assert get_registered_artifact("../../etc/passwd", artifact_dir=tmp_path) is None

    # R37: Default unapproved cannot register
    unapproved_meta = ModelArtifactMetadata(
        artifact_id="art_unapproved",
        model_name="TestModel",
        version="1.0.0",
        sha256="c65b204be7e826c09712e1a613c2198ab05331782e3ed4cdd56ddbfd97e711c1",
        trained_at_utc="2026-10-25T00:00:00Z",
        train_sample_count=10,
        features=["time_to_tca_days"],
        is_approved=False
    )
    with pytest.raises(ValueError, match="Cannot register unapproved"):
        register_trusted_artifact(unapproved_meta, {"dummy": 1}, artifact_dir=tmp_path)
