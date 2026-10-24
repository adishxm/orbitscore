"""
Unit tests for Scikit-Learn orbital decay ML, collision risk classifier,
and Space Credit Index calculations.
"""
import pytest
from ai_ml.credit_index import compute_space_credit_index, SpaceCreditIndexResult
from ai_ml.orbital_ml import OrbitalDecayML, CollisionRiskClassifierML


def test_space_credit_index_scoring():
    mission = {
        "id": "asteria-3",
        "name": "Asteria-3 Demonstration Mission",
        "form_factor": "3U",
        "mass_budget_kg": 4.0,
        "target_orbit": "500 km SSO",
    }
    evidence = [
        {"parameter_key": "stowed_envelope", "state": "confirmed", "human_confirmed": True},
        {"parameter_key": "wet_mass", "state": "confirmed", "human_confirmed": True},
        {"parameter_key": "battery_screening_report", "state": "confirmed", "human_confirmed": True},
        {"parameter_key": "solar_panel_deployment", "state": "unconfirmed", "human_confirmed": False},
    ]

    result = compute_space_credit_index(mission, evidence, estimated_decay_years=3.8)
    assert isinstance(result, SpaceCreditIndexResult)
    assert result.overall_score >= 80.0
    assert result.rating_tier in ["AAA", "AA", "A"]
    assert result.isro_dfsm_aligned is True
    assert result.fcc_5yr_aligned is True


def test_orbital_decay_ml_prediction():
    engine = OrbitalDecayML()
    pred = engine.predict(
        perigee_km=500.0,
        apogee_km=500.0,
        inclination_deg=97.4,
        mass_kg=4.0,
        area_m2=0.03,
        solar_flux_f107=150.0,
    )
    assert pred.predicted_lifetime_years > 0.0
    assert pred.confidence_interval_95[0] < pred.confidence_interval_95[1]
    assert pred.fcc_5yr_compliant is True


def test_collision_risk_ml_classification():
    engine = CollisionRiskClassifierML()

    # Distant encounter -> LOW
    res_low = engine.evaluate_conjunction(miss_distance_m=5000.0, radial_miss_m=800.0)
    assert res_low.risk_tier == "LOW"
    assert res_low.maneuver_recommended is False

    # Close encounter -> ELEVATED
    res_elevated = engine.evaluate_conjunction(miss_distance_m=120.0, radial_miss_m=30.0)
    assert res_elevated.risk_tier == "ELEVATED"
    assert res_elevated.maneuver_recommended is True
