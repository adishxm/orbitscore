"""
Offline Machine Learning Training Pipeline for ESA CDM Risk Forecasting
Location: ai_ml/training/train_cdm.py
Strict Invariant:
Trains strictly on pre-cutoff feature snapshots from training events.
Uses scikit-learn Pipeline with train-only preprocessing to prevent leakage.
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
    """
    if len(train_events) < 2 or len(test_events) < 1:
        raise ValueError("Insufficient events to train and evaluate: require at least 2 train and 1 test.")

    X_train, y_train = extract_cdm_feature_matrix(train_events)
    X_test, y_test = extract_cdm_feature_matrix(test_events)

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
