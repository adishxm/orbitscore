"""
Tests for ESA CDM training pipeline, trusted artifact registry, and research forecast inference.
"""

import pytest
from ai_ml.datasets.esa_cdm import CDMMessage, build_cutoff_safe_cdm_event
from ai_ml.training.train_cdm import train_and_evaluate_cdm_regressor
from ai_ml.inference.registry import (
    ModelArtifactMetadata,
    register_trusted_artifact,
    get_registered_artifact,
    list_registered_artifacts,
)
from ai_ml.inference.cdm_forecast import run_cdm_forecast
from ai_ml.evaluation.reports import generate_experiment_markdown_report


def _create_sample_events():
    msgs_1 = [
        CDMMessage(event_id="e1", message_id="m1", time_to_tca_days=4.0, miss_distance_m=12000.0, relative_speed_m_s=14000.0, log10_risk=-6.2),
        CDMMessage(event_id="e1", message_id="m2", time_to_tca_days=0.5, miss_distance_m=11000.0, relative_speed_m_s=14000.0, log10_risk=-6.0),
    ]
    msgs_2 = [
        CDMMessage(event_id="e2", message_id="m3", time_to_tca_days=3.0, miss_distance_m=7500.0, relative_speed_m_s=14100.0, log10_risk=-5.2),
        CDMMessage(event_id="e2", message_id="m4", time_to_tca_days=0.4, miss_distance_m=7000.0, relative_speed_m_s=14100.0, log10_risk=-4.9),
    ]
    msgs_3 = [
        CDMMessage(event_id="e3", message_id="m5", time_to_tca_days=2.5, miss_distance_m=4200.0, relative_speed_m_s=14050.0, log10_risk=-4.5),
        CDMMessage(event_id="e3", message_id="m6", time_to_tca_days=0.3, miss_distance_m=4000.0, relative_speed_m_s=14050.0, log10_risk=-4.1),
    ]
    return [
        build_cutoff_safe_cdm_event(msgs_1),
        build_cutoff_safe_cdm_event(msgs_2),
        build_cutoff_safe_cdm_event(msgs_3)
    ]


def test_cdm_training_pipeline_and_registry():
    events = _create_sample_events()
    train_events = events[:2]
    test_events = events[2:]

    result = train_and_evaluate_cdm_regressor(train_events, test_events)
    assert result["model_name"] == "CDM-GradientBoosting-LogRisk-V1"
    assert result["train_sample_count"] == 2
    assert result["test_sample_count"] == 1
    assert "mae" in result["metrics"]
    assert "pipeline" in result

    # Register artifact
    meta = ModelArtifactMetadata(
        artifact_id="art_gb_01",
        model_name=result["model_name"],
        version="1.0.0",
        sha256="a" * 64,
        trained_at_utc=result["trained_at_utc"],
        train_sample_count=2,
        features=result["feature_names"],
        is_approved=True
    )
    register_trusted_artifact(meta, result["pipeline"])

    retrieved = get_registered_artifact("art_gb_01")
    assert retrieved is not None
    assert retrieved[0].artifact_id == "art_gb_01"

    # Run inference with registered artifact
    forecast = run_cdm_forecast(
        event_id="evt_test_target",
        time_to_tca_days=2.5,
        miss_distance_m=4200.0,
        relative_speed_m_s=14050.0,
        latest_early_risk=-4.5,
        artifact_id="art_gb_01"
    )
    assert forecast.event_id == "evt_test_target"
    assert forecast.research_only is True
    assert "OFFLINE RESEARCH ONLY" in forecast.disclaimer
    assert isinstance(forecast.forecasted_final_log10_risk, float)


def test_experiment_markdown_report_generation():
    record = {
        "experiment_id": "esa_cdm_v1",
        "purpose": "Forecast log10 risk on held-out events",
        "metrics": {"mae": 0.45, "rmse": 0.52},
        "dataset_sha256": "abcdef123456",
        "train_sample_count": 100,
        "test_sample_count": 20
    }
    report = generate_experiment_markdown_report(record)
    assert "# Experiment Report: esa_cdm_v1" in report
    assert "| mae | `0.45` |" in report
    assert "Safety Limitations" in report


def test_backend_research_cdm_endpoint():
    from fastapi.testclient import TestClient
    try:
        from app.main import app
        from app.auth import get_configured_reviewer_key
    except ImportError:
        from backend.app.main import app
        from backend.app.auth import get_configured_reviewer_key

    client = TestClient(app)
    auth_headers = {"Authorization": f"Bearer {get_configured_reviewer_key()}"}

    payload = {
        "event_id": "conjunction_event_99",
        "time_to_tca_days": 2.8,
        "miss_distance_m": 8500.0,
        "relative_speed_m_s": 14200.0,
        "latest_early_risk": -5.8
    }
    resp = client.post("/research/cdm-forecast", json=payload, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["event_id"] == "conjunction_event_99"
    assert data["research_only"] is True
    assert "OFFLINE RESEARCH ONLY" in data["disclaimer"]
    assert "forecasted_final_log10_risk" in data
