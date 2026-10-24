"""
Experiment Reporting and Audit Module
Location: ai_ml/evaluation/reports.py
Strict Invariant:
Formats complete, transparent experiment records capturing dataset provenance,
exact metric values, and explicit research/safety limitations.
"""

from __future__ import annotations
import json
from datetime import datetime, timezone
from typing import Any, Dict


def generate_experiment_markdown_report(record: Dict[str, Any]) -> str:
    """Generate GitHub-flavored Markdown experiment report for audit and reproducibility."""
    title = record.get("experiment_id", "OrbitScore Experiment Record")
    owner = record.get("owner", "Aditya")
    created_at = record.get("created_at_utc", datetime.now(timezone.utc).isoformat())
    purpose = record.get("purpose", "Research Benchmark Evaluation")
    metrics = record.get("metrics", {})

    lines = [
        f"# Experiment Report: {title}",
        "",
        f"- **Owner:** {owner}",
        f"- **Created At (UTC):** {created_at}",
        f"- **Purpose:** {purpose}",
        f"- **Status:** {record.get('status', 'COMPLETED')}",
        "",
        "## Measured Metrics",
        "",
        "| Metric | Value |",
        "|---|---|"
    ]

    for k, v in metrics.items():
        if k != "research_disclaimer":
            lines.append(f"| {k} | `{v}` |")

    lines.extend([
        "",
        "## Safety Limitations & Disclaimers",
        "",
        f"> {record.get('research_disclaimer', 'OFFLINE RESEARCH BENCHMARK ONLY - NOT FOR OPERATIONAL INFERENCE')}",
        "",
        "## Dataset Provenance",
        "",
        f"- **Dataset SHA-256:** `{record.get('dataset_sha256', 'N/A')}`",
        f"- **Train Count:** {record.get('train_sample_count', 0)}",
        f"- **Test Count:** {record.get('test_sample_count', 0)}",
        "",
        "---",
        "*OrbitScore Autonomous AI/ML Evaluation Harness*"
    ])

    return "\n".join(lines)
