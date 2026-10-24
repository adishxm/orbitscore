"""
Research-Only CDM Forecast Inference Module
Location: ai_ml/inference/cdm_forecast.py
Strict Invariant:
Executes conjunction risk forecasting strictly within research parameters.
Validates input domain (pre-TCA horizon >= 2 days, non-negative geometry, log10-risk <= 0.0).
Strictly verifies requested model artifact availability and never disguises missing artifacts as fallbacks.
All outputs clearly carry non-operational research disclaimers.
"""

from __future__ import annotations
import math
import numpy as np
from pydantic import BaseModel, Field
from typing import Optional
from ai_ml.inference.registry import get_registered_artifact
from ai_ml.training.baselines import LastObservedRiskBaseline


class CDMMakeForecastResult(BaseModel):
    event_id: str
    forecasted_final_log10_risk: float
    derived_high_risk_flag: bool  # log10_risk >= -6.0
    model_version: str
    research_only: bool = True
    disclaimer: str = (
        "OFFLINE RESEARCH ONLY - FORECAST OF REPORTED LOG-RISK, NOT OPERATIONAL COLLISION PROBABILITY OR MANEUVER ADVICE"
    )


def run_cdm_forecast(
    event_id: str,
    time_to_tca_days: float,
    miss_distance_m: float,
    relative_speed_m_s: float,
    latest_early_risk: float,
    artifact_id: Optional[str] = None
) -> CDMMakeForecastResult:
    """
    Run forecast for a conjunction event using a registered artifact or baseline.
    Enforces horizon cutoff, geometric boundaries, finite values, and explicit artifact availability.
    """
    # 1. Finite Value Checks
    if not (
        math.isfinite(time_to_tca_days)
        and math.isfinite(miss_distance_m)
        and math.isfinite(relative_speed_m_s)
        and math.isfinite(latest_early_risk)
    ):
        raise ValueError("All forecast feature inputs must be finite numbers.")

    # 2. Domain Validation
    if time_to_tca_days < 2.0:
        raise ValueError(f"time_to_tca_days ({time_to_tca_days}) must be >= 2.0 days (prediction cutoff).")
    if miss_distance_m < 0.0:
        raise ValueError(f"miss_distance_m ({miss_distance_m}) cannot be negative.")
    if relative_speed_m_s < 0.0:
        raise ValueError(f"relative_speed_m_s ({relative_speed_m_s}) cannot be negative.")
    if latest_early_risk > 0.0:
        raise ValueError(f"latest_early_risk ({latest_early_risk}) represents log10(probability), so it must be <= 0.0.")

    # 3. Model Artifact Selection
    if artifact_id and artifact_id.strip().lower() not in ("baseline", "none"):
        entry = get_registered_artifact(artifact_id)
        if entry is None:
            raise LookupError(f"Requested model artifact '{artifact_id}' is not found or not approved in trusted registry.")
        meta, model_obj = entry
        X = np.array([[time_to_tca_days, miss_distance_m, relative_speed_m_s, latest_early_risk]])
        pred_risk = float(model_obj.predict(X)[0])
        return CDMMakeForecastResult(
            event_id=event_id,
            forecasted_final_log10_risk=round(pred_risk, 4),
            derived_high_risk_flag=pred_risk >= -6.0,
            model_version=f"{meta.model_name}:{meta.version}"
        )

    # 4. Explicit persistence baseline when artifact_id is None or "baseline"
    return CDMMakeForecastResult(
        event_id=event_id,
        forecasted_final_log10_risk=round(float(latest_early_risk), 4),
        derived_high_risk_flag=float(latest_early_risk) >= -6.0,
        model_version="Baseline-Persistence-Fallback"
    )
