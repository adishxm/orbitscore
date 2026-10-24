"""
Unit tests for Scikit-Learn orbital decay ML, collision risk classifier,
and Space Credit Index calculations.
Verifies determinism, research-only disclaimers, and empty evidence handling.
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
    assert "PRE-REVIEW HEURISTIC" in result.disclaimer


def test_space_credit_index_empty_mission_fails_safe():
    """Verify empty mission with no evidence produces low score/tier D, not false AAA/BBB."""
    empty_mission = {}
    empty_evidence = []
    result = compute_space_credit_index(empty_mission, empty_evidence)
    assert result.overall_score < 40.0
    assert result.rating_tier == "D"
    assert result.isro_dfsm_aligned is False
    assert result.fcc_5yr_aligned is False
    assert "Insufficient" in result.summary


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
    assert pred.research_only is True
    assert "RESEARCH DEMONSTRATION ONLY" in pred.disclaimer


def test_orbital_decay_invalid_inputs():
    """Verify invalid altitudes below LEO threshold raise ValueError."""
    engine = OrbitalDecayML()
    with pytest.raises(ValueError):
        engine.predict(perigee_km=50.0, apogee_km=80.0)


def test_collision_risk_ml_classification_and_determinism():
    engine = CollisionRiskClassifierML()

    # Distant encounter -> LOW
    res_low_1 = engine.evaluate_conjunction(miss_distance_m=5000.0, radial_miss_m=800.0)
    res_low_2 = engine.evaluate_conjunction(miss_distance_m=5000.0, radial_miss_m=800.0)
    assert res_low_1.risk_tier == "LOW"
    assert res_low_1.maneuver_recommended is False
    # Determinism: identical calls must yield exact same collision probability estimate
    assert res_low_1.collision_probability_estimate == res_low_2.collision_probability_estimate
    assert res_low_1.research_only is True

    # Close encounter -> ELEVATED
    res_elevated = engine.evaluate_conjunction(miss_distance_m=120.0, radial_miss_m=30.0)
    assert res_elevated.risk_tier == "ELEVATED"
    assert res_elevated.maneuver_recommended is True
