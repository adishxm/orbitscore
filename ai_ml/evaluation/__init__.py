"""
Evaluation Package for OrbitScore AI/ML Pipelines.
Provides rigorous evaluation of extracted document fields and CDM forecasts.
"""
from ai_ml.evaluation.extraction_metrics import (
    evaluate_field_extractions,
    ExtractionMetricReport,
    FieldMetric
)

__all__ = [
    "evaluate_field_extractions",
    "ExtractionMetricReport",
    "FieldMetric",
]
