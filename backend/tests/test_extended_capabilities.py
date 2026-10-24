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
    """Verify automated ODAR and EOMP markdown report generators populate regulatory sections."""
    # ODAR endpoint
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

    # EOMP endpoint
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

