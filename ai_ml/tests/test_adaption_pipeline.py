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
