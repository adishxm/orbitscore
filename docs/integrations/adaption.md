# Adaption Synthetic-Data & Evaluation Workbench Integration

## Purpose & Scope
Adaption (featuring Adaptive Data and AutoScientist) is positioned within OrbitScore as an **offline research workbench** located in the `ai_ml/` directory (`ai_ml/adaption_pipeline.py`). It is dedicated to:
1. Generating high-fidelity synthetic training samples for space regulatory extraction (NIST AI RMF 1.0, NASA ODMSP, FCC 22-74).
2. Validating schemas against known regulatory rules.
3. Partitioning synthetic datasets into deterministic Train / Validation / Test splits.
4. Computing baseline extraction accuracy (Precision, Recall, F1) on held-out synthetic test sets.

## Critical Safety & Architectural Invariants
1. **Research Workbench Only — NOT Online Production Inference**:
   - Official vendor documentation defines dataset preparation and checkpoint outputs, but does not provide a guaranteed low-latency production inference endpoint.
   - Therefore, OrbitScore's online FastAPI extraction path (`/artifacts/{id}/extract`) is **deliberately NOT connected** to Adaption. Online extraction relies on deterministic regex parsing or local bounded models.
2. **100% Synthetic Corpus**:
   - Only synthetic or public open-access regulatory documents are processed.
   - Real, proprietary, ITAR-restricted, or confidential spacecraft engineering data is **strictly barred** from ingestion.
3. **Candidate-Only Principle**:
   - Even if a trained checkpoint model is evaluated in the future, its output fields remain strictly unconfirmed candidate proposals (`human_confirmed = False`).
   - A human engineer must always confirm candidate values before evaluation results or dossiers can be generated.

## Pipeline Architecture & Execution

The workbench is implemented in `ai_ml/adaption_pipeline.py`.

### Execution Command:
```bash
python -m ai_ml.adaption_pipeline
```

### Output Summary:
```json
{
  "status": "COMPLETED",
  "workbench": "Adaption-AutoScientist-Synthetic-Bench",
  "remote_adaption_enabled": false,
  "metrics": {
    "total_samples": 5,
    "train_count": 3,
    "val_count": 1,
    "test_count": 1,
    "precision": 1.0,
    "recall": 1.0,
    "f1_score": 1.0,
    "dataset_sha256": "b7928ee745996dc6adbbd9ee210ae5c4fd35725406661e8f57dd791a63514ec9",
    "evaluated_at": "2026-10-24T15:02:05Z",
    "research_disclaimer": "OFFLINE RESEARCH ONLY - NOT FOR OPERATIONAL INFERENCE"
  },
  "splits": {
    "train": ["synth_odmsp_01", "synth_fcc_02", "synth_casualty_03"],
    "val": ["synth_passivation_04"],
    "test": ["synth_orbit_05"]
  },
  "safety_invariants": {
    "synthetic_only": true,
    "real_data_ingestion_blocked": true,
    "production_inference_connected": false,
    "unconfirmed_candidate_output_only": true
  }
}
```

## Configuration & Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `ADAPTION_ENABLED` | Feature flag for remote Adaptive Data API runs | `0` (Disabled) |
| `ADAPTION_API_KEY` | Server-side API key for Adaption / AutoScientist | *None (Blank)* |
