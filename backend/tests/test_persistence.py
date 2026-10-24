import os
import json
import sqlite3
import subprocess
import sys
from pathlib import Path
from app.db import (
    init_db, reset_db, get_connection, save_mission, get_mission_db, list_missions_db,
    save_artifact_db, get_artifact_db, get_artifact_content_db,
    save_evaluation_db, get_evaluation_db, save_review_db, list_reviews_db,
    save_counterfactual_db, append_provenance_event_db, get_all_provenance_events_db,
    verify_provenance_chain_db
)

def test_db_init_and_table_creation(tmp_path):
    db_file = tmp_path / "orbit_test.db"
    init_db(db_file)
    assert db_file.exists()

    conn = sqlite3.connect(str(db_file))
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = {row[0] for row in cur.fetchall()}
    conn.close()

    expected = {"missions", "artifacts", "fields", "evaluations", "reviews", "counterfactuals", "provenance"}
    assert expected.issubset(tables)


def test_mission_persistence_across_connections(tmp_path):
    db_file = tmp_path / "orbit_test.db"
    init_db(db_file)

    sample_mission = {
        "mission_id": "mission_alpha",
        "name": "Alpha Mission",
        "orbit_type": "LEO",
        "fields": [{"field": "apogee_km", "value": 550, "human_confirmed": True}]
    }

    # Save on connection 1
    save_mission(sample_mission, db_path=db_file)

    # Re-read on fresh connection
    loaded = get_mission_db("mission_alpha", db_path=db_file)
    assert loaded is not None
    assert loaded["mission_id"] == "mission_alpha"
    assert loaded["fields"][0]["value"] == 550

    missions = list_missions_db(db_path=db_file)
    assert len(missions) == 1
    assert missions[0]["mission_id"] == "mission_alpha"


def test_artifact_persistence_with_blob_and_metadata(tmp_path):
    db_file = tmp_path / "orbit_test.db"
    init_db(db_file)

    content = b"PDF-1.4 orbital plan binary simulation content"
    meta = {"filename": "flight_plan.pdf", "media_type": "application/pdf", "pages": 3}

    save_artifact_db(
        artifact_id="art_001",
        mission_id="mission_alpha",
        filename="flight_plan.pdf",
        media_type="application/pdf",
        sha256="fake_sha256_hash",
        content=content,
        metadata=meta,
        db_path=db_file
    )

    # Verify metadata retrieval
    loaded_meta = get_artifact_db("art_001", db_path=db_file)
    assert loaded_meta is not None
    assert loaded_meta["filename"] == "flight_plan.pdf"
    assert loaded_meta["pages"] == 3

    # Verify content blob retrieval
    loaded_blob = get_artifact_content_db("art_001", db_path=db_file)
    assert loaded_blob == content


def test_evaluation_and_review_persistence(tmp_path):
    db_file = tmp_path / "orbit_test.db"
    init_db(db_file)

    eval_data = {
        "msri": {"score": 82.5, "band": "NOMINAL"},
        "findings": [{"finding_id": "f_01", "rule_id": "NASA-4.6", "status": "PASS_UNDER_PROFILE"}]
    }
    save_evaluation_db("mission_alpha", "nasa-profile", eval_data, db_path=db_file)

    loaded_eval = get_evaluation_db("mission_alpha", db_path=db_file)
    assert loaded_eval is not None
    assert loaded_eval["msri"]["band"] == "NOMINAL"

    review_data = {
        "finding_id": "f_01",
        "mission_id": "mission_alpha",
        "decision": "APPROVED",
        "note": "Verified by flight safety officer",
        "reviewer": "Aditya"
    }
    save_review_db(review_data, db_path=db_file)

    reviews = list_reviews_db(db_path=db_file)
    assert "f_01" in reviews
    assert reviews["f_01"]["decision"] == "APPROVED"
    assert reviews["f_01"]["reviewer"] == "Aditya"


def test_counterfactual_persistence(tmp_path):
    db_file = tmp_path / "orbit_test.db"
    init_db(db_file)

    cf_data = {
        "mission_id": "mission_alpha",
        "finding_id": "f_01",
        "lever": "perigee_altitude_km",
        "proposed_value": 350,
        "synthetic": True,
        "before_status": "WARNING",
        "after_status": "PASS_UNDER_PROFILE"
    }
    save_counterfactual_db(cf_data, db_path=db_file)

    conn = get_connection(db_file)
    cur = conn.cursor()
    cur.execute("SELECT mission_id, finding_id, lever FROM counterfactuals WHERE mission_id = 'mission_alpha'")
    row = cur.fetchone()
    conn.close()

    assert row is not None
    assert row["finding_id"] == "f_01"
    assert row["lever"] == "perigee_altitude_km"


def test_reset_db_clears_all_records(tmp_path):
    db_file = tmp_path / "orbit_test.db"
    init_db(db_file)

    save_mission({"mission_id": "m1", "name": "M1"}, db_path=db_file)
    assert len(list_missions_db(db_path=db_file)) == 1

    reset_db(db_path=db_file)
    assert len(list_missions_db(db_path=db_file)) == 0


def test_db_cli_init():
    proc = subprocess.run(
        [sys.executable, "-m", "app.db", "init"],
        cwd=Path(__file__).resolve().parents[1],
        capture_output=True,
        text=True
    )
    assert proc.returncode == 0
    assert "Initialized database" in proc.stdout
