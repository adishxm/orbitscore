from __future__ import annotations
import json
import pytest
from unittest.mock import patch, MagicMock

from ai_ml.adapter import (
    is_ai_enabled,
    run_ai_candidate_extraction,
    AI_TEMPERATURE,
    AI_TIMEOUT_SECONDS,
)
from ai_ml.schemas import (
    AICandidateField,
    AIResponseSchema,
)


def test_ai_settings_configured():
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


def test_fallback_when_disabled(monkeypatch):
    monkeypatch.delenv("ORBIT_AI_ENABLED", raising=False)
    pages = [(1, "Telemetry: altitude: 550 km, disposal lifetime: 4.2 years")]

    def mock_fallback(pgs):
        return [
            AICandidateField(
                field="operational_altitude_km",
                value=550.0,
                unit="km",
                locator={"page": 1, "line": 1, "quote": "altitude: 550 km"},
                method="deterministic_regex",
                confidence_tier="HIGH",
                human_confirmed=False,
            )
        ]

    candidates = run_ai_candidate_extraction(pages, fallback_fn=mock_fallback)
    assert len(candidates) == 1
    assert candidates[0].field == "operational_altitude_km"
    assert candidates[0].human_confirmed is False


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
                "confidence_tier": "HIGH",
            }
        ],
    })
    schema = AIResponseSchema.model_validate_json(mock_json)
    assert schema.summary == "Extracted orbital telemetry"
    assert len(schema.extracted_fields) == 1
    assert schema.extracted_fields[0].value == 3.8


def test_ai_network_error_fallback(monkeypatch):
    monkeypatch.setenv("ORBIT_AI_ENABLED", "true")
    monkeypatch.setenv("ORBIT_AI_KEY", "dummy_key")

    pages = [(1, "Flight Manifest\naltitude: 600 km\ndisposal lifetime: 25.0 years")]

    def mock_fallback(pgs):
        return [
            AICandidateField(
                field="debris_decay_years",
                value=25.0,
                locator={"page": 1, "line": 2, "quote": "disposal lifetime: 25.0 years"},
                method="deterministic_regex",
                human_confirmed=False,
            )
        ]

    with patch("httpx.Client.post", side_effect=Exception("Connection timed out")):
        candidates = run_ai_candidate_extraction(pages, fallback_fn=mock_fallback)
        assert len(candidates) == 1
        assert candidates[0].human_confirmed is False


def test_ai_mock_provider_success(monkeypatch):
    monkeypatch.setenv("ORBIT_AI_ENABLED", "true")
    monkeypatch.setenv("ORBIT_AI_KEY", "dummy_key")

    pages = [(1, "Manifest: disposal: 4.1 years")]

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "choices": [
            {
                "message": {
                    "content": json.dumps({
                        "summary": "Extracted fields",
                        "extracted_fields": [
                            {
                                "field": "debris_decay_years",
                                "value": 4.1,
                                "unit": "years",
                                "page": 1,
                                "line": 1,
                                "quote": "disposal: 4.1 years",
                                "confidence_tier": "HIGH",
                            }
                        ],
                    })
                }
            }
        ]
    }

    with patch("httpx.Client.post", return_value=mock_resp):
        candidates = run_ai_candidate_extraction(pages)
        assert len(candidates) == 1
        assert candidates[0].field == "debris_decay_years"
        assert candidates[0].value == 4.1
        # Critical: human_confirmed must ALWAYS be False
        assert candidates[0].human_confirmed is False
        assert candidates[0].method == "ai_assisted_extraction"
