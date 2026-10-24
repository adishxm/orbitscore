"""
Extraction Metrics Evaluation Module
Location: ai_ml/evaluation/extraction_metrics.py
Strict Invariant:
Derives genuine precision, recall, and F1 by comparing actual extracted candidates
against ground-truth labels with field-specific tolerances and semantic normalization.
Never hardcodes 1.0 or assigns perfect precision without empirical verification.
"""

from __future__ import annotations
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class FieldMetric(BaseModel):
    field_name: str
    true_positives: int = 0
    false_positives: int = 0
    false_negatives: int = 0
    precision: float = 0.0
    recall: float = 0.0
    f1_score: float = 0.0


class ExtractionMetricReport(BaseModel):
    total_gold_fields: int
    total_emitted_fields: int
    true_positives: int
    false_positives: int
    false_negatives: int
    precision: float
    recall: float
    f1_score: float
    field_metrics: Dict[str, FieldMetric] = Field(default_factory=dict)
    research_disclaimer: str = (
        "OFFLINE EVALUATION HARNESS - METRICS MEASURED AGAINST VALIDATED GROUND TRUTH LABELS"
    )


def _values_match(pred_val: Any, gold_val: Any, tolerance: float) -> bool:
    """Compare predicted and gold values using type-aware matching and tolerance."""
    if pred_val is None and gold_val is None:
        return True
    if pred_val is None or gold_val is None:
        return False

    # Numeric comparison with tolerance
    if isinstance(gold_val, (int, float)) and isinstance(pred_val, (int, float)):
        return abs(float(pred_val) - float(gold_val)) <= tolerance

    # If gold is float but pred is string, try converting
    if isinstance(gold_val, (int, float)) and isinstance(pred_val, str):
        try:
            return abs(float(pred_val) - float(gold_val)) <= tolerance
        except ValueError:
            return False

    # String comparison (trimmed, case-insensitive)
    return str(pred_val).strip().lower() == str(gold_val).strip().lower()


def evaluate_field_extractions(
    predictions_by_sample: Dict[str, Dict[str, Any]],
    ground_truth_by_sample: Dict[str, Dict[str, Any]],
    numeric_tolerances: Optional[Dict[str, float]] = None,
    default_tolerance: float = 0.1,
) -> ExtractionMetricReport:
    """
    Rigorously evaluate extracted candidate fields against ground truth per sample.

    Args:
        predictions_by_sample: Mapping of sample_id -> {field_name: predicted_value}
        ground_truth_by_sample: Mapping of sample_id -> {field_name: gold_value}
        numeric_tolerances: Optional per-field tolerance overrides
        default_tolerance: Default absolute error tolerance for numeric fields

    Returns:
        ExtractionMetricReport with global and per-field precision, recall, and F1.
    """
    tolerances = numeric_tolerances or {
        "wet_mass_kg": 1.0,
        "dry_mass_kg": 1.0,
        "apogee_altitude_km": 5.0,
        "perigee_altitude_km": 5.0,
        "altitude_km": 5.0,
        "inclination_deg": 0.5,
        "disposal_duration_years": 0.2,
        "energy_storage_joules": 1.0,
    }

    all_sample_ids = set(ground_truth_by_sample.keys()) | set(predictions_by_sample.keys())

    tp_total = 0
    fp_total = 0
    fn_total = 0

    field_counters: Dict[str, Dict[str, int]] = {}

    def get_counter(f: str) -> Dict[str, int]:
        if f not in field_counters:
            field_counters[f] = {"tp": 0, "fp": 0, "fn": 0}
        return field_counters[f]

    for s_id in all_sample_ids:
        gold_fields = ground_truth_by_sample.get(s_id, {})
        pred_fields = predictions_by_sample.get(s_id, {})

        matched_gold_fields = set()

        for f_name, pred_val in pred_fields.items():
            f_cnt = get_counter(f_name)
            tol = tolerances.get(f_name, default_tolerance)

            if f_name in gold_fields:
                gold_val = gold_fields[f_name]
                if _values_match(pred_val, gold_val, tol):
                    tp_total += 1
                    f_cnt["tp"] += 1
                    matched_gold_fields.add(f_name)
                else:
                    # Predicted a value that didn't match gold
                    fp_total += 1
                    f_cnt["fp"] += 1
            else:
                # Hallucinated or unexpected field
                fp_total += 1
                f_cnt["fp"] += 1

        # Any gold field not matched in predictions is a false negative
        for f_name, gold_val in gold_fields.items():
            if f_name not in matched_gold_fields:
                fn_total += 1
                f_cnt = get_counter(f_name)
                f_cnt["fn"] += 1

    total_emitted = tp_total + fp_total
    total_gold = tp_total + fn_total

    precision = tp_total / total_emitted if total_emitted > 0 else 0.0
    recall = tp_total / total_gold if total_gold > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    field_metrics_map: Dict[str, FieldMetric] = {}
    for f_name, cnt in field_counters.items():
        f_emitted = cnt["tp"] + cnt["fp"]
        f_gold = cnt["tp"] + cnt["fn"]
        f_p = cnt["tp"] / f_emitted if f_emitted > 0 else 0.0
        f_r = cnt["tp"] / f_gold if f_gold > 0 else 0.0
        f_f1 = 2 * (f_p * f_r) / (f_p + f_r) if (f_p + f_r) > 0 else 0.0

        field_metrics_map[f_name] = FieldMetric(
            field_name=f_name,
            true_positives=cnt["tp"],
            false_positives=cnt["fp"],
            false_negatives=cnt["fn"],
            precision=round(f_p, 4),
            recall=round(f_r, 4),
            f1_score=round(f_f1, 4),
        )

    return ExtractionMetricReport(
        total_gold_fields=total_gold,
        total_emitted_fields=total_emitted,
        true_positives=tp_total,
        false_positives=fp_total,
        false_negatives=fn_total,
        precision=round(precision, 4),
        recall=round(recall, 4),
        f1_score=round(f1, 4),
        field_metrics=field_metrics_map,
    )
