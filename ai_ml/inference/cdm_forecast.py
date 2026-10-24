"""
Research-Only CDM Forecast Inference Module
Location: ai_ml/inference/cdm_forecast.py
Strict Invariant:
Executes conjunction risk forecasting strictly within research parameters.
All outputs clearly carry non-operational research disclaimers.
"""

from __future__ import annotations
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
    Run forecast for a conjunction event using a registered artifact or fallback baseline.
    """
    if artifact_id:
        entry = get_registered_artifact(artifact_id)
        if entry is not None:
            meta, model_obj = entry
            X = np.array([[time_to_tca_days, miss_distance_m, relative_speed_m_s, latest_early_risk]])
            pred_risk = float(model_obj.predict(X)[0])
            return CDMMakeForecastResult(
                event_id=event_id,
                forecasted_final_log10_risk=round(pred_risk, 4),
                derived_high_risk_flag=pred_risk >= -6.0,
                model_version=f"{meta.model_name}:{meta.version}"
            )

    # Deterministic persistence fallback if no registered artifact specified
    return CDMMakeForecastResult(
        event_id=event_id,
        forecasted_final_log10_risk=round(float(latest_early_risk), 4),
        derived_high_risk_flag=float(latest_early_risk) >= -6.0,
        model_version="Baseline-Persistence-Fallback"
    )
