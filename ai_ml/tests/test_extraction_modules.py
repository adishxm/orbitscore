"""
Unit tests for OrbitScore extraction, normalization, validation, sources, and ESA CDM modules.
"""

import pytest
from ai_ml.extraction.normalization import (
    normalize_mass,
    normalize_distance,
    normalize_probability,
    normalize_duration_years,
)
from ai_ml.extraction.validation import validate_candidate_evidence
from ai_ml.datasets.sources import SourceDocumentRecord, validate_source_record, compute_bytes_sha256
from ai_ml.datasets.esa_cdm import (
    CDMMessage,
    build_cutoff_safe_cdm_event,
    partition_cdm_events_by_event_id,
)
from ai_ml.training.baselines import LastObservedRiskBaseline, DummyRiskBaseline
from ai_ml.evaluation.cdm_metrics import evaluate_cdm_forecast


# --- Normalization Tests ---
def test_normalize_mass():
    assert normalize_mass(150.0, "kg") == (150.0, "kg")
    assert normalize_mass(500.0, "g") == (0.5, "kg")
    assert normalize_mass(2.5, "tonnes") == (2500.0, "kg")

    with pytest.raises(ValueError):
        normalize_mass(-10.0, "kg")
    with pytest.raises(ValueError):
        normalize_mass(float("nan"), "kg")
    with pytest.raises(ValueError):
        normalize_mass(100.0, "parsec")


def test_normalize_distance():
    assert normalize_distance(500.0, "km") == (500.0, "km")
    assert normalize_distance(250000.0, "m") == (250.0, "km")
    assert normalize_distance(100.0, "nmi") == (185.2, "km")

    with pytest.raises(ValueError):
        normalize_distance(-50.0, "km")


def test_normalize_probability():
    assert normalize_probability("1:25000") == pytest.approx(4e-5)
    assert normalize_probability("1/10000") == pytest.approx(1e-4)
    assert normalize_probability("1e-5") == pytest.approx(1e-5)
    assert normalize_probability("94%") == pytest.approx(0.94)
    assert normalize_probability(0.005) == pytest.approx(0.005)

    with pytest.raises(ValueError):
        normalize_probability("1:0")
    with pytest.raises(ValueError):
        normalize_probability("150%")
    with pytest.raises(ValueError):
        normalize_probability(-0.1)


def test_normalize_duration():
    assert normalize_duration_years(5.0, "years") == 5.0
    assert normalize_duration_years(24.0, "months") == 2.0

    with pytest.raises(ValueError):
        normalize_duration_years(-1.0, "years")


# --- Validation Tests ---
def test_validate_candidate_evidence_success():
    page_text = "The satellite mass is 45.0 kg and operates at an apogee altitude of 550.0 km."
    res = validate_candidate_evidence(
        field_name="wet_mass_kg",
        value=45.0,
        quote="satellite mass is 45.0 kg",
        raw_page_text=page_text
    )
    assert res.is_valid is True
    assert res.status == "VALID"


def test_validate_candidate_evidence_quote_mismatch():
    page_text = "The satellite mass is 45.0 kg."
    res = validate_candidate_evidence(
        field_name="wet_mass_kg",
        value=45.0,
        quote="fabricated quote not in document",
        raw_page_text=page_text
    )
    assert res.is_valid is False
    assert res.status == "QUOTE_MISMATCH"


def test_validate_candidate_evidence_out_of_bounds():
    page_text = "The spacecraft mass is -10.0 kg."
    res = validate_candidate_evidence(
        field_name="wet_mass_kg",
        value=-10.0,
        quote="spacecraft mass is -10.0 kg",
        raw_page_text=page_text
    )
    assert res.is_valid is False
    assert res.status == "OUT_OF_BOUNDS"


# --- Source Registry Tests ---
def test_source_document_record():
    content = b"Mock PDF Flight Evidence Content"
    digest = compute_bytes_sha256(content)
    assert len(digest) == 64

    rec = SourceDocumentRecord(
        source_id="src_test_01",
        mission_family_id="test_family",
        document_role="mission_claim",
        original_filename="flight_plan.pdf",
        sha256=digest,
        byte_size=len(content),
        page_count=4,
        retrieved_at_utc="2026-10-24T12:00:00Z"
    )
    valid, msg = validate_source_record(rec)
    assert valid is True

    # Bad SHA length
    rec_bad = rec.model_copy(update={"sha256": "bad_sha"})
    valid_bad, _ = validate_source_record(rec_bad)
    assert valid_bad is False


# --- ESA CDM & Baseline Forecasting Tests ---
def test_build_cutoff_safe_cdm_event():
    # Valid event with messages spanning across the 2-day cutoff
    msgs = [
        CDMMessage(event_id="e1", message_id="m1", time_to_tca_days=4.0, miss_distance_m=10000.0, relative_speed_m_s=14000.0, log10_risk=-6.5),
        CDMMessage(event_id="e1", message_id="m2", time_to_tca_days=2.2, miss_distance_m=9000.0, relative_speed_m_s=14000.0, log10_risk=-5.8),
        CDMMessage(event_id="e1", message_id="m3", time_to_tca_days=0.4, miss_distance_m=8500.0, relative_speed_m_s=14000.0, log10_risk=-5.5),
    ]
    evt = build_cutoff_safe_cdm_event(msgs, cutoff_days=2.0)
    assert evt is not None
    assert evt.event_id == "e1"
    assert evt.feature_message_id == "m2"  # Latest early message (2.2 days)
    assert evt.latest_early_risk == -5.8
    assert evt.label_message_id == "m3"  # Final late message (0.4 days)
    assert evt.final_reported_log10_risk == -5.5

    # Leakage check: event with only early messages (no label after cutoff) -> excluded!
    early_only = [msgs[0], msgs[1]]
    assert build_cutoff_safe_cdm_event(early_only, cutoff_days=2.0) is None

    # Leakage check: event with only late messages (no feature history) -> excluded!
    late_only = [msgs[2]]
    assert build_cutoff_safe_cdm_event(late_only, cutoff_days=2.0) is None


def test_cdm_baselines_and_metrics():
    msgs_1 = [
        CDMMessage(event_id="e1", message_id="m1", time_to_tca_days=3.0, miss_distance_m=10000.0, relative_speed_m_s=14000.0, log10_risk=-6.0),
        CDMMessage(event_id="e1", message_id="m2", time_to_tca_days=0.5, miss_distance_m=9000.0, relative_speed_m_s=14000.0, log10_risk=-5.6),
    ]
    msgs_2 = [
        CDMMessage(event_id="e2", message_id="m3", time_to_tca_days=2.5, miss_distance_m=5000.0, relative_speed_m_s=14000.0, log10_risk=-4.5),
        CDMMessage(event_id="e2", message_id="m4", time_to_tca_days=0.3, miss_distance_m=4800.0, relative_speed_m_s=14000.0, log10_risk=-4.2),
    ]
    events = [build_cutoff_safe_cdm_event(msgs_1), build_cutoff_safe_cdm_event(msgs_2)]

    # Persistence baseline
    pers = LastObservedRiskBaseline()
    preds = pers.predict(events)
    assert preds == [-6.0, -4.5]

    targets = [e.final_reported_log10_risk for e in events]
    rep = evaluate_cdm_forecast(preds, targets)
    assert rep.sample_count == 2
    assert rep.mae == pytest.approx(0.35)
    assert rep.rmse == pytest.approx(0.3535, rel=1e-2)
