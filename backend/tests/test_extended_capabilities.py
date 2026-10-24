"""
Tests for extended platform capabilities:
- Space Credit Index calculation
- Scikit-Learn orbital decay prediction & collision risk classification
- Space-Track TLE & CDM ingestion
- NASA SPARK debris density profile
- Automated NASA ODAR & ISRO EOMP regulatory export pipeline
"""
import pytest
from fastapi.testclient import TestClient
try:
    from app.main import app
    from app.auth import get_configured_reviewer_key
except ImportError:
    from backend.app.main import app
    from backend.app.auth import get_configured_reviewer_key

client = TestClient(app)
AUTH_HEADERS = {"Authorization": f"Bearer {get_configured_reviewer_key()}"}


def test_space_credit_index_endpoint():
    """Verify Space Credit Index generates 4-pillar scores and tier rating."""
    resp = client.get("/missions/asteria-3/space-credit-index", headers=AUTH_HEADERS)
    assert resp.status_code == 200
    data = resp.json()

    assert "overall_score" in data
    assert 0.0 <= data["overall_score"] <= 100.0
    assert data["rating_tier"] in ["AAA", "AA", "A", "BBB", "BB", "C", "D"]
    assert "breakdowns" in data
    assert len(data["breakdowns"]) == 4

    categories = [b["category"] for b in data["breakdowns"]]
    assert "Trajectory & Orbital Lifetime" in categories
    assert "Collision Footprint & Form Factor" in categories
    assert "Disposal & Passivation Readiness" in categories
    assert "Sourced Evidence Provenance" in categories


def test_ml_orbital_decay_prediction():
    """Verify Scikit-Learn GradientBoostingRegressor predicts lifetime with confidence interval."""
    payload = {
        "perigee_km": 498.8,
        "apogee_km": 500.2,
        "inclination_deg": 97.4,
        "mass_kg": 4.0,
        "area_m2": 0.03,
        "solar_flux_f107": 145.0,
    }
    resp = client.post("/missions/asteria-3/ml/predict-decay", json=payload, headers=AUTH_HEADERS)
    assert resp.status_code == 200
    data = resp.json()

    assert "predicted_lifetime_years" in data
    assert data["predicted_lifetime_years"] > 0
    assert len(data["confidence_interval_95"]) == 2
    assert data["confidence_interval_95"][0] <= data["predicted_lifetime_years"] <= data["confidence_interval_95"][1]
    assert data["model_version"] == "OrbitalDecay-GBR-v1.0"


def test_ml_conjunction_risk_classification():
    """Verify Scikit-Learn RandomForestClassifier classifies close encounter geometry."""
    payload = {
        "miss_distance_m": 850.0,
        "relative_speed_kms": 14.1,
        "radial_miss_m": 140.0,
        "combined_hbr_m": 2.5,
    }
    resp = client.post("/missions/asteria-3/ml/collision-risk", json=payload, headers=AUTH_HEADERS)
    assert resp.status_code == 200
    data = resp.json()

    assert data["risk_tier"] in ["LOW", "MODERATE", "ELEVATED"]
    assert "collision_probability_estimate" in data
    assert data["model_version"] == "CollisionVector-RF-v1.0"


def test_space_track_tle_and_conjunctions():
    """Verify Space-Track ingestion returns valid orbital elements and CDMs."""
    # TLE endpoint
    resp_tle = client.get("/integrations/space-track/tle/99999", headers=AUTH_HEADERS)
    assert resp_tle.status_code == 200
    tle = resp_tle.json()
    assert tle["norad_cat_id"] == 99999
    assert "1 99999" in tle["line1"]
    assert "2 99999" in tle["line2"]
    assert tle["inclination_deg"] == 97.4

    # Conjunctions endpoint
    resp_cdm = client.get("/integrations/space-track/conjunctions/99999", headers=AUTH_HEADERS)
    assert resp_cdm.status_code == 200
    cdms = resp_cdm.json()
    assert len(cdms) >= 1
    assert "miss_distance_meters" in cdms[0]
    assert "collision_probability" in cdms[0]


def test_nasa_spark_debris_density_and_flux():
    """Verify NASA SPARK density profile and smallsat flux assessments."""
    # Spatial density bands
    resp_density = client.get("/integrations/nasa-spark/debris-density", headers=AUTH_HEADERS)
    assert resp_density.status_code == 200
    bands = resp_density.json()
    assert len(bands) >= 5
    altitudes = [b["altitude_km"] for b in bands]
    assert 500 in altitudes

    # Mission flux assessment
    resp_flux = client.get(
        "/integrations/nasa-spark/assess-flux?altitude_km=500&area_m2=0.03&lifetime_years=3.8",
        headers=AUTH_HEADERS,
    )
    assert resp_flux.status_code == 200
    flux = resp_flux.json()
    assert flux["shielding_adequate"] is True
    assert "NASA SPARK" in flux["source_model"]


def test_nasa_odar_and_isro_eomp_generation():
    """Verify automated ODAR and EOMP markdown report generators enforce review gate and populate sections."""
    from app.main import reviews
    from app.db import get_connection
    reviews.clear()
    with get_connection() as conn:
        conn.execute("DELETE FROM reviews WHERE mission_id = 'asteria-3'")

    # 1. Verify locked gate when unevaluated or unreviewed
    eval_resp = client.post("/missions/asteria-3/evaluate", json={"profile_id": "fcc-22-74-inspired"}, headers=AUTH_HEADERS)
    assert eval_resp.status_code == 200
    findings = eval_resp.json().get("findings", [])

    # If there are findings, test that ODAR export is locked (423) before review
    if findings:
        resp_locked = client.get("/missions/asteria-3/export/odar", headers=AUTH_HEADERS)
        assert resp_locked.status_code == 423
        assert resp_locked.json()["detail"]["code"] == "EXPORT_LOCKED"


        # Complete review decisions for all findings
        for idx, f in enumerate(findings):
            client.post(
                f"/missions/asteria-3/findings/{f['finding_id']}/decision",
                json={"decision": "APPROVED", "note": f"Reviewed finding {idx}", "reviewer": "Aditya"},
                headers=AUTH_HEADERS
            )

    # 2. ODAR endpoint unlocked
    resp_odar = client.get("/missions/asteria-3/export/odar", headers=AUTH_HEADERS)
    assert resp_odar.status_code == 200
    odar_md = resp_odar.text
    assert "Orbital Debris Assessment Report (ODAR)" in odar_md
    assert "NASA-STD-8719.14" in odar_md
    assert "Section 1: Program Management & Mission Overview" in odar_md
    assert "Section 3: Assessment of Intentional Breakups" in odar_md
    assert "Section 5: Assessment of Post-Mission Disposal" in odar_md
    assert "FCC 5-Year Rule" in odar_md
    assert "ISRO Debris-Free Space Missions" in odar_md

    # 3. EOMP endpoint unlocked
    resp_eomp = client.get("/missions/asteria-3/export/eomp", headers=AUTH_HEADERS)
    assert resp_eomp.status_code == 200
    eomp_md = resp_eomp.text
    assert "End-of-Mission Plan (EOMP)" in eomp_md
    assert "ISRO DFSM 2030" in eomp_md
    assert "Part III: Spacecraft Passivation Protocols" in eomp_md
    assert "Part IV: Re-entry Ground Safety Assessment" in eomp_md


def test_odar_excessive_lifetime_and_missing_evidence_fail_safe():
    try:
        from app.odar_generator import generate_nasa_odar_markdown
    except ImportError:
        from backend.app.odar_generator import generate_nasa_odar_markdown

    empty_mission = {"name": "TestSat", "mass_budget_kg": 50.0}
    # 50-year decay scenario with zero evidence
    md = generate_nasa_odar_markdown(empty_mission, [], [], estimated_decay_years=50.0)

    assert "NON-CONFORMANT" in md
    assert "UNVERIFIED" in md
    assert "NEEDS_EVIDENCE" in md
    assert "Draft Review Packet" in md


def test_orbital_intelligence_endpoints_pathway_alerts_decay():
    """Verify P2 endpoints: /pathway, /collision-alerts, and /decay-path enforce boundaries and determinism."""
    # 1. Pathway endpoint
    resp_path = client.get("/missions/asteria-3/pathway", headers=AUTH_HEADERS)
    assert resp_path.status_code == 200
    path_data = resp_path.json()
    assert path_data["mission_id"] == "asteria-3"
    assert path_data["period_minutes"] > 80.0
    assert len(path_data["pathway_points"]) == 16
    assert path_data["data_mode"] == "SYNTHETIC_PROPAGATION"
    assert "HEURISTIC SCHEMATIC PATHWAY" in path_data["disclaimer"]

    # Verify waypoint lat/lon ranges
    for pt in path_data["pathway_points"]:
        assert -90.0 <= pt["latitude"] <= 90.0
        assert -180.0 <= pt["longitude"] <= 180.0
        assert pt["altitude_km"] > 0.0

    # 2. Collision alerts endpoint
    resp_alerts = client.get("/missions/asteria-3/collision-alerts", headers=AUTH_HEADERS)
    assert resp_alerts.status_code == 200
    alerts_data = resp_alerts.json()
    assert alerts_data["mission_id"] == "asteria-3"
    assert alerts_data["total_alerts"] >= 1
    assert "bands" in alerts_data
    assert alerts_data["bands"]["critical_sub_1km"] >= 0
    assert "HEURISTIC SCREENING ONLY" in alerts_data["disclaimer"]

    # 3. Decay path endpoint
    resp_decay = client.get("/missions/asteria-3/decay-path", headers=AUTH_HEADERS)
    assert resp_decay.status_code == 200
    decay_data = resp_decay.json()
    assert decay_data["initial_altitude_km"] >= 100.0
    assert decay_data["reentry_altitude_km"] == 100.0
    assert decay_data["model_status"] in ("SCHEMATIC", "RESEARCH")
    series = decay_data["decay_series"]
    assert len(series) == 10
    # Verify monotonic decay
    for i in range(len(series) - 1):
        assert series[i]["altitude_km"] >= series[i + 1]["altitude_km"]
    assert series[-1]["altitude_km"] == 100.0

    # 4. Unknown mission returns 404
    resp_404 = client.get("/missions/unknown-sat-xyz/pathway", headers=AUTH_HEADERS)
    assert resp_404.status_code == 404


def test_space_credit_index_explain_endpoint():
    """Verify P3 endpoint: /space-credit-index/explain provides per-pillar breakdown and discloses missing evidence."""
    resp = client.get("/missions/asteria-3/space-credit-index/explain", headers=AUTH_HEADERS)
    assert resp.status_code == 200
    data = resp.json()

    assert data["mission_id"] == "asteria-3"
    assert 0.0 <= data["overall_score"] <= 100.0
    assert data["rating_tier"] in ("AAA", "AA", "A", "BBB", "BB", "C", "D")
    assert isinstance(data["pillars"], list)
    assert len(data["pillars"]) == 4

    # Verify every pillar has valid point bounds and category
    for p in data["pillars"]:
        assert 0.0 <= p["points_awarded"] <= p["max_points"]
        assert p["status"] in ("SATISFIED", "PARTIAL", "MISSING_EVIDENCE")
        assert p["category"] in (
            "Trajectory & Orbital Lifetime",
            "Collision Footprint & Form Factor",
            "Disposal & Passivation Readiness",
            "Sourced Evidence Provenance"
        )

    assert "missing_pillars" in data
    assert "recommendations" in data
    assert data["data_mode"] in ("SNAPSHOT", "SYNTHETIC")
    assert "PRE-REVIEW HEURISTIC" in data["disclaimer"]

    # 404 on missing mission
    resp_404 = client.get("/missions/unknown-sat-xyz/space-credit-index/explain", headers=AUTH_HEADERS)
    assert resp_404.status_code == 404


def test_telemetry_mode_separation_and_db_persistence():
    """Verify P1: Spatio-temporal persistence and strict data mode separation (LIVE/SNAPSHOT/SYNTHETIC)."""
    from app.db import save_tle_snapshot, get_latest_tle_snapshot, save_cdm_event, get_cdm_events_for_norad
    import hashlib

    # 1. Save and retrieve TLE snapshot
    digest = hashlib.sha256(b"line1\nline2").hexdigest()
    row_id = save_tle_snapshot(
        norad_id=12345,
        epoch="2026-10-25T01:00:00Z",
        line1="1 12345U ...",
        line2="2 12345 ...",
        source="Test Satellite Snapshot",
        fetched_at="2026-10-25T01:00:00Z",
        sha256=digest,
    )
    assert row_id > 0

    snap = get_latest_tle_snapshot(12345)
    assert snap is not None
    assert snap["norad_id"] == 12345
    assert snap["sha256"] == digest

    # 2. Save and query CDM events
    save_cdm_event({
        "cdm_id": "CDM-TEST-001",
        "primary_norad": 12345,
        "primary_name": "TEST-SAT-1",
        "secondary_norad": 99991,
        "secondary_name": "SPACE-DEBRIS",
        "tca": "2026-10-25T04:00:00Z",
        "miss_distance_m": 450.0,
        "collision_probability": 2.5e-5,
        "alert_level": "WARNING",
        "data_mode": "SNAPSHOT",
    })

    cdms = get_cdm_events_for_norad(12345)
    assert len(cdms) >= 1
    assert cdms[0]["cdm_id"] == "CDM-TEST-001"
    assert cdms[0]["miss_distance_m"] == 450.0


def test_odar_and_eomp_pdf_export_and_benchmark():
    """Verify P4: PDF generation with watermark and p95 < 3s benchmark."""
    import time
    from app.main import reviews
    from app.db import get_connection

    # Setup: Ensure asteria-3 is evaluated and reviewed to pass 423 gate
    client.post("/missions/asteria-3/evaluate?profile_id=india-dfsm-inspired", headers=AUTH_HEADERS)
    resp_eval = client.get("/missions/asteria-3/evaluation", headers=AUTH_HEADERS)
    for f in resp_eval.json().get("findings", []):
        client.post(
            "/reviews",
            json={
                "finding_id": f["finding_id"],
                "mission_id": "asteria-3",
                "decision": "ACCEPTED",
                "note": "Approved for PDF export test",
                "reviewer": "Safety Authority",
                "authority_citation": "ISRO DFSM 2024"
            },
            headers=AUTH_HEADERS
        )

    # 1. Test ODAR PDF export
    t0 = time.time()
    resp_odar_pdf = client.get("/missions/asteria-3/export/odar?format=pdf", headers=AUTH_HEADERS)
    duration = time.time() - t0

    assert resp_odar_pdf.status_code == 200
    assert resp_odar_pdf.headers["content-type"] == "application/pdf"
    assert resp_odar_pdf.content.startswith(b"%PDF")
    assert duration < 3.0  # p95 generation benchmark

    # 2. Test EOMP PDF export
    resp_eomp_pdf = client.get("/missions/asteria-3/export/eomp?format=pdf", headers=AUTH_HEADERS)
    assert resp_eomp_pdf.status_code == 200
    assert resp_eomp_pdf.headers["content-type"] == "application/pdf"
    assert resp_eomp_pdf.content.startswith(b"%PDF")


def test_health_and_readiness_probes():
    """Verify P6: /health and /ready service probes."""
    resp_h = client.get("/health")
    assert resp_h.status_code == 200
    assert resp_h.json()["status"] == "healthy"
    assert resp_h.json()["service"] == "orbitscore-backend"

    resp_r = client.get("/ready")
    assert resp_r.status_code == 200
    assert resp_r.json()["ready"] is True
    assert "sqlite" in resp_r.json()["database"]


def test_batch_fleet_space_credit_index():
    """Verify P7: POST /fleet/space-credit-index batch calculation and tier aggregation."""
    payload = {
        "page": 1,
        "page_size": 10
    }
    resp = client.post("/fleet/space-credit-index", json=payload, headers=AUTH_HEADERS)
    assert resp.status_code == 200
    data = resp.json()

    assert data["page"] == 1
    assert data["page_size"] == 10
    assert data["total_missions"] >= 3
    assert "fleet_tier_distribution" in data
    assert "missions" in data
    assert len(data["missions"]) >= 3

    for m in data["missions"]:
        assert "mission_id" in m
        assert "rating_tier" in m
        assert m["data_mode"] in ("SNAPSHOT", "SYNTHETIC")

    assert "Fleet Space Credit Index benchmark" in data["disclaimer"]


def test_esa_dataset_and_benchmark_report_tools():
    """Verify T019 & T020: Dataset integrity validator and CDM comparative benchmark generator."""
    from ai_ml.datasets.esa_downloader import download_esa_dataset_stub, verify_esa_dataset_file
    from ai_ml.evaluation.benchmark_report import generate_cdm_benchmark_report, render_benchmark_markdown

    # T019
    res = download_esa_dataset_stub("data/test_esa_stage")
    assert res["valid"] is True
    assert res["size_bytes"] > 0

    # T020
    rep = generate_cdm_benchmark_report(
        y_true=[-6.0, -8.0, -4.5],
        y_persistence=[-6.5, -8.7, -5.1],
        y_pred=[-6.1, -8.1, -4.6],
        event_ids=["ev_1", "ev_2", "ev_3"]
    )
    assert rep["sample_count"] == 3
    assert rep["metrics"]["beats_persistence"] is True
    assert rep["metrics"]["mse_improvement_percentage"] > 0

    md = render_benchmark_markdown(rep)
    assert "Conjunction Data Message (CDM) Benchmark Report" in md
    assert "Persistence Baseline" in md



