# T016 — Offline CDM Scikit-Learn Training Pipeline and Experiment Reporting

- status: done
- owner: Aditya
- reviewer: Roshan
- priority: P1
- depends_on: [T014]

## Goal

Implement genuine offline scikit-learn GradientBoosting pipeline training on cutoff-safe historical CDM features, and generate standardized markdown and JSON experiment reports.

## Acceptance checks

1. `ai_ml/training/train_cdm.py` extracts feature matrices (`time_to_tca_days`, `miss_distance_m`, `relative_speed_m_s`, `latest_early_risk`) and trains a leak-free scikit-learn Pipeline.
2. Training evaluates on held-out test events against `LastObservedRiskBaseline` to compute genuine log10-risk MAE, RMSE, and relative skill.
3. `ai_ml/evaluation/reports.py` generates comprehensive experiment records documenting dataset provenance and explicit research disclaimers.
4. Experiment configurations created at `experiments/extraction_v1/config.yaml` and `experiments/esa_cdm_v1/config.yaml`.

## Required verification

Execute `pytest ai_ml/tests/test_cdm_training_and_registry.py` and run `python -m ai_ml.cli cdm-train --config experiments/esa_cdm_v1/config.yaml`.

## Reviewer log

- Implementation evidence: GradientBoosting training pipeline, experiment reporting generator, configs, and passing unit tests.
- Reviewer sign-off: Roshan (2026-10-24T18:48:00.000000Z / 2026-10-25T00:18:00.000000+05:30)
