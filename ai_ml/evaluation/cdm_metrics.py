"""
CDM Evaluation Metrics Module
Location: ai_ml/evaluation/cdm_metrics.py
Strict Invariant:
Evaluates risk forecasts in base-10 logarithmic space (MAE, RMSE, Max Error)
and computes relative forecast skill against persistence baselines.
"""

from __future__ import annotations
import math
from typing import List, Optional
from pydantic import BaseModel


class CDMMetricsReport(BaseModel):
    sample_count: int
    mae: float
    rmse: float
    max_error: float
    skill_vs_baseline: Optional[float] = None
    research_disclaimer: str = (
        "OFFLINE RESEARCH ONLY - EVALUATION OF FORECASTED LOG-RISK, NOT OPERATIONAL Pc ACCURACY"
    )


def evaluate_cdm_forecast(
    predictions: List[float],
    ground_truth: List[float],
    baseline_predictions: Optional[List[float]] = None
) -> CDMMetricsReport:
    """
    Compute regression metrics for final reported log10 risk predictions.
    """
    if len(predictions) != len(ground_truth):
        raise ValueError(f"Length mismatch: {len(predictions)} predictions vs {len(ground_truth)} ground truth.")

    n = len(predictions)
    if n == 0:
        return CDMMetricsReport(sample_count=0, mae=0.0, rmse=0.0, max_error=0.0)

    abs_errors = [abs(p - g) for p, g in zip(predictions, ground_truth)]
    sq_errors = [(p - g) ** 2 for p, g in zip(predictions, ground_truth)]

    mae = sum(abs_errors) / n
    rmse = math.sqrt(sum(sq_errors) / n)
    max_err = max(abs_errors)

    skill: Optional[float] = None
    if baseline_predictions and len(baseline_predictions) == n:
        base_sq_errors = [(bp - g) ** 2 for bp, g in zip(baseline_predictions, ground_truth)]
        base_rmse = math.sqrt(sum(base_sq_errors) / n)
        if base_rmse > 0:
            skill = round(1.0 - (rmse / base_rmse), 4)

    return CDMMetricsReport(
        sample_count=n,
        mae=round(mae, 4),
        rmse=round(rmse, 4),
        max_error=round(max_err, 4),
        skill_vs_baseline=skill
    )
