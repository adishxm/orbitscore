"""
Baseline Models for Conjunction Risk Forecasting
Location: ai_ml/training/baselines.py
Strict Invariant:
Establishes clear empirical benchmarks (Last-Observed-Risk Persistence & Dummy Median)
against which any learned ML model must be compared.
"""

from __future__ import annotations
import statistics
from typing import List
from ai_ml.datasets.esa_cdm import CDMEventExample


class LastObservedRiskBaseline:
    """
    Persistence baseline: predicts the last observed early risk before the 2-day cutoff
    as the forecasted final reported risk.
    """
    def predict(self, events: List[CDMEventExample]) -> List[float]:
        return [float(e.latest_early_risk) for e in events]


class DummyRiskBaseline:
    """
    Dummy baseline: predicts the median final reported risk learned on the training set.
    """
    def __init__(self) -> None:
        self.median_risk: float = -6.0

    def fit(self, train_events: List[CDMEventExample]) -> DummyRiskBaseline:
        if train_events:
            targets = [float(e.final_reported_log10_risk) for e in train_events]
            self.median_risk = statistics.median(targets)
        return self

    def predict(self, events: List[CDMEventExample]) -> List[float]:
        return [self.median_risk for _ in events]
