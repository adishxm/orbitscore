import os
import json
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.ai_adapter import (
    is_ai_enabled, run_ai_candidate_extraction, AIResponseSchema,
    AI_TEMPERATURE, AI_TIMEOUT_SECONDS
)
from app.main import app, missions, reviews, evaluations, events

ROOT = Path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def test_ai_settings_configured():
    # Verify explicit acceptance parameters
    assert AI_TEMPERATURE == 0.0
    assert AI_TIMEOUT_SECONDS == 10.0


def test_ai_enabled_toggle(monkeypatch):
    monkeypatch.delenv("ORBIT_AI_ENABLED", raising=False)
    monkeypatch.delenv("ORBIT_AI_KEY", raising=False)
    assert is_ai_enabled() is False

    monkeypatch.setenv("ORBIT_AI_ENABLED", "true")
    # Missing API key still disables it
    assert is_ai_enabled() is False

    monkeypatch.setenv("ORBIT_AI_KEY", "test_key_123")
    assert is_ai_enabled() is True


def test_deterministic_fallback_when_disabled(monkeypatch):
    monkeypatch.delenv("ORBIT_AI_ENABLED", raising=False)
    pages = [
        (1, "Mission Telemetry Document\n"
            "altitude: 550 km\n"
            "disposal lifetime: 4.2 years\n"
            "passivation: planned")
    ]
    candidates = run_ai_candidate_extraction(pages)
    assert len(candidates) >= 2
    # Crucial invariant: human_confirmed must be False!
    assert all(c.human_confirmed is False for c in candidates)
    # Check that deterministic extractor found operational_altitude_km
    alt = next((c for c in candidates if c.field == "operational_altitude_km"), None)
    assert alt is not None
    assert alt.value == 550.0


def test_ai_schema_validation_and_unconfirmed_invariant():
    mock_json = json.dumps({
        "summary": "Extracted orbital telemetry",
        "extracted_fields": [
            {
                "field": "debris_decay_years",
                "value": 3.8,
                "unit": "years",
                "page": 1,
                "line": 4,
                "quote": "decay within 3.8 years",
                "confidence_tier": "HIGH"
            }
        ]
    })
    schema = AIResponseSchema.model_validate_json(mock_json)
    assert schema.summary == "Extracted orbital telemetry"
    assert len(schema.extracted_fields) == 1
    assert schema.extracted_fields[0].value == 3.8


def test_ai_network_error_fallback(monkeypatch):
    monkeypatch.setenv("ORBIT_AI_ENABLED", "true")
    monkeypatch.setenv("ORBIT_AI_KEY", "dummy_key")

    pages = [(1, "Flight Manifest\naltitude: 600 km\ndisposal lifetime: 25.0 years")]

    # Simulate httpx post raising an exception
    with patch("httpx.Client.post", side_effect=Exception("Connection timed out")):
        candidates = run_ai_candidate_extraction(pages)
        # Should gracefully fallback without crashing
        assert len(candidates) > 0
        assert all(c.human_confirmed is False for c in candidates)


def test_upload_endpoint_with_evidence():
    client = TestClient(app)
    missions.clear(); reviews.clear(); evaluations.clear(); events.clear()

    # Upload text artifact
    sample_txt = b"Satellite Mission Plan\naltitude: 500 km\ndisposal lifetime: 4.5 years\npassivation: planned\n"
    upload_resp = client.post(
        "/missions/mission_complete/artifacts",
        files={"file": ("mission_plan.txt", sample_txt, "text/plain")}
    )
    assert upload_resp.status_code == 200
    art_id = upload_resp.json()["artifact_id"]

    extract_resp = client.post(f"/artifacts/{art_id}/extract")
    assert extract_resp.status_code == 200
    data = extract_resp.json()
    assert data["artifact_id"] == art_id
    assert len(data["extracted_fields"]) >= 1
    # Verify candidates are strictly unconfirmed
    assert all(c["human_confirmed"] is False for c in data["extracted_fields"])
    assert "SYNTHETIC" in data["warning"]

