"""
OrbitScore AI/ML Command Line Interface
Location: ai_ml/cli.py
Strict Invariant:
Provides local, reproducible commands for document validation, evaluation, and CDM research.
Never downloads private data or calls external paid APIs without explicit flags.
"""

from __future__ import annotations
import argparse
import json
import sys
from typing import List
from ai_ml.adaption_pipeline import run_adaption_workbench
from ai_ml.datasets.esa_cdm import (
    CDMMessage,
    build_cutoff_safe_cdm_event,
    partition_cdm_events_by_event_id,
)
from ai_ml.training.baselines import LastObservedRiskBaseline
from ai_ml.evaluation.cdm_metrics import evaluate_cdm_forecast
from ai_ml.datasets.sources import SourceDocumentRecord, validate_source_record


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="ai_ml",
        description="OrbitScore AI/ML Workbench & Research CLI"
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Command: extraction-evaluate
    subparsers.add_parser(
        "extraction-evaluate",
        help="Run offline extraction evaluation harness on synthetic benchmark"
    )

    # Command: documents-validate
    subparsers.add_parser(
        "documents-validate",
        help="Validate registered source documents against schema and provenance requirements"
    )

    # Command: cdm-build-events
    subparsers.add_parser(
        "cdm-build-events",
        help="Test cutoff-safe event assembly on synthetic sample CDMs"
    )

    # Command: cdm-evaluate
    subparsers.add_parser(
        "cdm-evaluate",
        help="Evaluate baseline persistence forecaster on sample conjunction events"
    )

    return parser


def handle_extraction_evaluate() -> int:
    result = run_adaption_workbench()
    print(json.dumps(result, indent=2))
    return 0


def handle_documents_validate() -> int:
    # Validate example registered record
    record = SourceDocumentRecord(
        source_id="src_asteria_fcc_01",
        mission_family_id="asteria_leo",
        document_role="regulator_filing",
        original_filename="asteria_fcc_narrative.pdf",
        sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        byte_size=1048576,
        page_count=12,
        retrieved_at_utc="2026-10-24T12:00:00Z",
        allowed_download=True,
        allowed_annotation=True,
        privacy_class="CONFIDENTIAL_MISSION_DATA"
    )
    is_valid, msg = validate_source_record(record)
    print(json.dumps({"source_id": record.source_id, "is_valid": is_valid, "message": msg}, indent=2))
    return 0 if is_valid else 1


def handle_cdm_build_events() -> int:
    sample_msgs = [
        CDMMessage(
            event_id="evt_sample_01",
            message_id="msg_01",
            time_to_tca_days=4.5,
            miss_distance_m=12500.0,
            relative_speed_m_s=14200.0,
            log10_risk=-6.8
        ),
        CDMMessage(
            event_id="evt_sample_01",
            message_id="msg_02",
            time_to_tca_days=2.1,
            miss_distance_m=9800.0,
            relative_speed_m_s=14210.0,
            log10_risk=-5.4
        ),
        CDMMessage(
            event_id="evt_sample_01",
            message_id="msg_03",
            time_to_tca_days=0.5,
            miss_distance_m=8400.0,
            relative_speed_m_s=14215.0,
            log10_risk=-5.1
        )
    ]
    event = build_cutoff_safe_cdm_event(sample_msgs, cutoff_days=2.0)
    if event:
        print(json.dumps(event.model_dump(), indent=2))
        return 0
    print("Failed to build cutoff-safe event.")
    return 1


def handle_cdm_evaluate() -> int:
    sample_msgs_a = [
        CDMMessage(event_id="evt_a", message_id="m1", time_to_tca_days=3.0, miss_distance_m=10000.0, relative_speed_m_s=14000.0, log10_risk=-6.0),
        CDMMessage(event_id="evt_a", message_id="m2", time_to_tca_days=0.5, miss_distance_m=9000.0, relative_speed_m_s=14000.0, log10_risk=-5.5),
    ]
    sample_msgs_b = [
        CDMMessage(event_id="evt_b", message_id="m3", time_to_tca_days=2.5, miss_distance_m=5000.0, relative_speed_m_s=14000.0, log10_risk=-4.5),
        CDMMessage(event_id="evt_b", message_id="m4", time_to_tca_days=0.3, miss_distance_m=4800.0, relative_speed_m_s=14000.0, log10_risk=-4.2),
    ]
    evt_a = build_cutoff_safe_cdm_event(sample_msgs_a)
    evt_b = build_cutoff_safe_cdm_event(sample_msgs_b)
    events = [e for e in [evt_a, evt_b] if e is not None]

    baseline = LastObservedRiskBaseline()
    preds = baseline.predict(events)
    ground_truth = [e.final_reported_log10_risk for e in events]
    report = evaluate_cdm_forecast(preds, ground_truth)
    print(json.dumps(report.model_dump(), indent=2))
    return 0


def main(args: List[str] | None = None) -> int:
    parser = build_parser()
    parsed = parser.parse_args(args)

    if not parsed.command:
        parser.print_help()
        return 0

    if parsed.command == "extraction-evaluate":
        return handle_extraction_evaluate()
    elif parsed.command == "documents-validate":
        return handle_documents_validate()
    elif parsed.command == "cdm-build-events":
        return handle_cdm_build_events()
    elif parsed.command == "cdm-evaluate":
        return handle_cdm_evaluate()
    else:
        parser.print_help()
        return 1


if __name__ == "__main__":
    sys.exit(main())
