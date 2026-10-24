"""
Offline Machine Learning Training Pipeline for ESA CDM Risk Forecasting
Location: ai_ml/training/train_cdm.py
Strict Invariant:
Trains strictly on pre-cutoff feature snapshots from training events.
Uses scikit-learn Pipeline with train-only preprocessing to prevent leakage.
Enforces event-disjoint splits, cutoff horizon, domain bounds, and non-finite checks.
All outputs are strictly designated for offline research, not operational flight maneuvers.
"""

from __future__ import annotations
from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple
import numpy as np
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.pipeline import Pipeline

from ai_ml.datasets.esa_cdm import CDMEventExample
from ai_ml.training.baselines import LastObservedRiskBaseline
from ai_ml.evaluation.cdm_metrics import evaluate_cdm_forecast, CDMMetricsReport


def extract_cdm_feature_matrix(events: List[CDMEventExample]) -> Tuple[np.ndarray, np.ndarray]:
    """Extract numeric features X and target vector y from cutoff-safe event examples."""
    feature_rows = []
    target_values = []

    for ev in events:
        row = [
            float(ev.feature_time_to_tca_days),
            float(ev.miss_distance_m),
            float(ev.relative_speed_m_s),
            float(ev.latest_early_risk)
        ]
        feature_rows.append(row)
        target_values.append(float(ev.final_reported_log10_risk))

    X = np.array(feature_rows, dtype=np.float64)
    y = np.array(target_values, dtype=np.float64)
    return X, y


def build_cdm_regressor_pipeline(random_state: int = 42) -> Pipeline:
    """Build a leak-safe preprocessing and gradient boosting regression pipeline."""
    return Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
        ("regressor", GradientBoostingRegressor(
            n_estimators=40,
            max_depth=3,
            learning_rate=0.1,
            random_state=random_state
        ))
    ])


def train_and_evaluate_cdm_regressor(
    train_events: List[CDMEventExample],
    test_events: List[CDMEventExample]
) -> Dict[str, Any]:
    """
    Train regressor on train_events and evaluate against persistence baseline on test_events.
    Enforces event-disjoint splits, feature cutoff horizons, domain validity, and finite inputs.
    """
    if len(train_events) < 2 or len(test_events) < 1:
        raise ValueError("Insufficient events to train and evaluate: require at least 2 train and 1 test.")

    # 1. Event ID Disjointness / Group Leakage Guard
    train_eids = {ev.event_id for ev in train_events}
    test_eids = {ev.event_id for ev in test_events}
    overlap = train_eids.intersection(test_eids)
    if overlap:
        raise ValueError(f"Leakage detected: Event IDs appear in both train and test sets: {sorted(list(overlap))}")

    # 2. Cutoff Horizon & Domain Validity Guards
    all_events = list(train_events) + list(test_events)
    for ev in all_events:
        cutoff = getattr(ev, 'cutoff_days', 2.0) or 2.0
        if ev.feature_time_to_tca_days < cutoff:
            raise ValueError(
                f"Event {ev.event_id}: Feature snapshot at {ev.feature_time_to_tca_days} days to TCA "
                f"violates pre-TCA cutoff horizon of {cutoff} days."
            )
        if ev.miss_distance_m < 0 or ev.relative_speed_m_s < 0:
            raise ValueError(f"Event {ev.event_id}: Geometric parameters (miss distance, relative speed) cannot be negative.")
        if ev.latest_early_risk > 0.0 or ev.final_reported_log10_risk > 0.0:
            raise ValueError(f"Event {ev.event_id}: Log10 risk values must be <= 0.0 (representing probability <= 1.0).")

    X_train, y_train = extract_cdm_feature_matrix(train_events)
    X_test, y_test = extract_cdm_feature_matrix(test_events)

    # 3. Finite Input Verification
    if not (np.all(np.isfinite(X_train)) and np.all(np.isfinite(y_train)) and np.all(np.isfinite(X_test)) and np.all(np.isfinite(y_test))):
        raise ValueError("Non-finite values (NaN or Inf) detected in CDM training/test feature matrices.")

    pipeline = build_cdm_regressor_pipeline()
    pipeline.fit(X_train, y_train)

    preds_ml = pipeline.predict(X_test).tolist()

    # Persistence baseline
    pers_baseline = LastObservedRiskBaseline()
    preds_baseline = pers_baseline.predict(test_events)

    metrics_report = evaluate_cdm_forecast(
        predictions=preds_ml,
        ground_truth=y_test.tolist(),
        baseline_predictions=preds_baseline
    )

    return {
        "model_name": "CDM-GradientBoosting-LogRisk-V1",
        "trained_at_utc": datetime.now(timezone.utc).isoformat(),
        "train_sample_count": len(train_events),
        "test_sample_count": len(test_events),
        "metrics": metrics_report.model_dump(),
        "pipeline": pipeline,
        "feature_names": ["time_to_tca_days", "miss_distance_m", "relative_speed_m_s", "latest_early_risk"],
        "research_disclaimer": "OFFLINE RESEARCH ONLY - ESA CDM BENCHMARK FORECASTING, NOT OPERATIONAL COLLISION PROBABILITY"
    }
