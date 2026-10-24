import pytest
from ai_ml.adaption_pipeline import (
    prepare_synthetic_dataset,
    partition_dataset,
    compute_synthetic_metrics,
    run_adaption_workbench
)

def test_prepare_synthetic_dataset():
    samples = prepare_synthetic_dataset()
    assert len(samples) >= 5
    for s in samples:
        assert s.sample_id.startswith("synth_")
        assert len(s.ground_truth_fields) > 0
        assert s.source_clause != ""

def test_partition_dataset():
    samples = prepare_synthetic_dataset()
    train, val, test = partition_dataset(samples)
    assert len(train) > 0
    assert len(val) > 0
    assert len(test) > 0
    assert len(train) + len(val) + len(test) == len(samples)
    assert all(s.split == "train" for s in train)
    assert all(s.split == "val" for s in val)
    assert all(s.split == "test" for s in test)

def test_compute_synthetic_metrics():
    samples = prepare_synthetic_dataset()
    train, val, test = partition_dataset(samples)
    metrics = compute_synthetic_metrics(train, val, test)
    assert metrics.total_samples == len(samples)
    assert metrics.precision > 0
    assert metrics.f1_score > 0
    assert len(metrics.dataset_sha256) == 64

def test_run_adaption_workbench_invariants():
    result = run_adaption_workbench()
    assert result["status"] == "COMPLETED"
    invariants = result["safety_invariants"]
    assert invariants["synthetic_only"] is True
    assert invariants["real_data_ingestion_blocked"] is True
    assert invariants["production_inference_connected"] is False
    assert invariants["unconfirmed_candidate_output_only"] is True

def test_extraction_metrics_degrade_on_deliberately_bad_predictions():
    from ai_ml.evaluation.extraction_metrics import evaluate_field_extractions
    samples = prepare_synthetic_dataset()
    train, val, test = partition_dataset(samples)

    # 1. Test completely empty predictions
    empty_preds = {s.sample_id: {} for s in test}
    empty_metrics = compute_synthetic_metrics(train, val, test, custom_predictions=empty_preds)
    assert empty_metrics.precision == 0.0
    assert empty_metrics.recall == 0.0
    assert empty_metrics.f1_score == 0.0

    # 2. Test hallucinated / bad predictions
    bad_preds = {s.sample_id: {"hallucinated_field": 9999.0, "disposal_duration_years": 99999.0} for s in test}
    bad_metrics = compute_synthetic_metrics(train, val, test, custom_predictions=bad_preds)
    assert bad_metrics.precision == 0.0
    assert bad_metrics.recall == 0.0

    # 3. Direct evaluator unit test: precision/recall math
    gold = {"sample_1": {"mass_kg": 100.0, "altitude_km": 500.0}}
    pred_perfect = {"sample_1": {"mass_kg": 100.0, "altitude_km": 500.0}}
    rep_perfect = evaluate_field_extractions(pred_perfect, gold)
    assert rep_perfect.precision == 1.0
    assert rep_perfect.recall == 1.0
    assert rep_perfect.f1_score == 1.0

    # One wrong value, one correct value -> TP=1, FP=1, FN=1 -> P=0.5, R=0.5
    pred_partial = {"sample_1": {"mass_kg": 100.0, "altitude_km": 9999.0}}
    rep_partial = evaluate_field_extractions(pred_partial, gold)
    assert rep_partial.precision == 0.5
    assert rep_partial.recall == 0.5
    assert rep_partial.f1_score == 0.5

