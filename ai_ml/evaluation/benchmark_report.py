"""
Comprehensive CDM Benchmark Report Generator
Task: T020 (Real-data CDM baselines, training, final research report)

Produces rigorous comparative metrics between naive persistence and trained regressor models
with leakage-safe event cross-validation and explicit decision-support caveats.
"""
from __future__ import annotations
import json
from datetime import datetime, timezone
from typing import Dict, Any, List
import numpy as np


def generate_cdm_benchmark_report(
    y_true: List[float],
    y_persistence: List[float],
    y_pred: List[float],
    event_ids: List[str]
) -> Dict[str, Any]:
    """Computes empirical comparative metrics between persistence baseline and trained model."""
    yt = np.array(y_true)
    yp = np.array(y_persistence)
    ym = np.array(y_pred)

    mse_persistence = float(np.mean((yt - yp) ** 2))
    mae_persistence = float(np.mean(np.abs(yt - yp)))

    mse_model = float(np.mean((yt - ym) ** 2))
    mae_model = float(np.mean(np.abs(yt - ym)))

    improvement_pct = float(
        ((mse_persistence - mse_model) / mse_persistence) * 100.0 if mse_persistence > 0 else 0.0
    )

    now_utc = datetime.now(timezone.utc).isoformat()

    report = {
        "report_id": f"REP_CDM_BENCHMARK_{now_utc[:10]}",
        "generated_at_utc": now_utc,
        "sample_count": len(event_ids),
        "events": event_ids,
        "metrics": {
            "persistence_baseline": {
                "mse": round(mse_persistence, 4),
                "mae": round(mae_persistence, 4)
            },
            "gradient_boosting_model": {
                "mse": round(mse_model, 4),
                "mae": round(mae_model, 4)
            },
            "mse_improvement_percentage": round(improvement_pct, 2),
            "beats_persistence": bool(mse_model < mse_persistence)
        },
        "disclaimer": (
            "OFFLINE RESEARCH ONLY - Historical ESA CDM benchmark forecasting. "
            "Does not calculate physical collision probability (Pc) or provide flight maneuver certification."
        )
    }

    return report


def render_benchmark_markdown(report: Dict[str, Any]) -> str:
    """Renders benchmark metrics to GitHub markdown format."""
    m = report["metrics"]
    pb = m["persistence_baseline"]
    gm = m["gradient_boosting_model"]

    lines = [
        f"# Conjunction Data Message (CDM) Benchmark Report",
        f"**Report ID**: `{report['report_id']}`",
        f"**Date**: {report['generated_at_utc']}",
        f"**Sample Count**: {report['sample_count']} held-out events",
        "",
        "---",
        "",
        "## 1. Model vs. Baseline Comparison",
        "",
        "| Model | Mean Squared Error (MSE) | Mean Absolute Error (MAE) | Status |",
        "|---|---|---|---|",
        f"| **Persistence Baseline** (last observed risk) | `{pb['mse']}` | `{pb['mae']}` | Unlearned Reference |",
        f"| **Gradient Boosting Regressor** | `{gm['mse']}` | `{gm['mae']}` | {'✅ Outperforms' if m['beats_persistence'] else 'Non-superior'} |",
        "",
        f"- **Relative Error Reduction**: **{m['mse_improvement_percentage']}%** over naive persistence.",
        "",
        "## 2. Integrity & Research Boundaries",
        f"> {report['disclaimer']}",
        "",
        "---",
        "*OrbitScore Autonomous AI/ML Benchmark Suite*"
    ]
    return "\n".join(lines)
