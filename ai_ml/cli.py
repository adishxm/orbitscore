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
from typing import List, Optional
from ai_ml.adaption_pipeline import run_adaption_workbench
from ai_ml.datasets.esa_cdm import (
    CDMMessage,
    build_cutoff_safe_cdm_event,
    partition_cdm_events_by_event_id,
)
from ai_ml.datasets.documents import DocumentPackage, PageRecord, partition_documents_by_family
from ai_ml.training.baselines import LastObservedRiskBaseline
from ai_ml.training.train_cdm import train_and_evaluate_cdm_regressor
from ai_ml.evaluation.cdm_metrics import evaluate_cdm_forecast
from ai_ml.datasets.sources import SourceDocumentRecord, validate_source_record


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="ai_ml",
        description="OrbitScore AI/ML Workbench & Research CLI"
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Command: extraction-evaluate
    p_ext = subparsers.add_parser(
        "extraction-evaluate",
        help="Run offline extraction evaluation harness on synthetic benchmark"
    )
    p_ext.add_argument("--config", type=str, default=None, help="Path to experiment config YAML")

    # Command: documents-ingest
    p_ing = subparsers.add_parser(
        "documents-ingest",
        help="Ingest and partition mission document packages by mission family"
    )
    p_ing.add_argument("--config", type=str, default=None, help="Path to experiment config YAML")

    # Command: documents-validate
    p_doc = subparsers.add_parser(
        "documents-validate",
        help="Validate registered source documents against schema and provenance requirements"
    )
    p_doc.add_argument("--config", type=str, default=None, help="Path to experiment config YAML")

    # Command: cdm-validate
    p_cdm_v = subparsers.add_parser(
        "cdm-validate",
        help="Validate CDM message integrity and check 2-day cutoff adherence"
    )
    p_cdm_v.add_argument("--config", type=str, default=None, help="Path to experiment config YAML")

    # Command: cdm-build-events
    p_cdm_b = subparsers.add_parser(
        "cdm-build-events",
        help="Test cutoff-safe event assembly on synthetic sample CDMs"
    )
    p_cdm_b.add_argument("--config", type=str, default=None, help="Path to experiment config YAML")

    # Command: cdm-train
    p_cdm_t = subparsers.add_parser(
        "cdm-train",
        help="Train offline scikit-learn GradientBoosting regressor on historical CDM events"
    )
    p_cdm_t.add_argument("--config", type=str, default=None, help="Path to experiment config YAML")

    # Command: cdm-evaluate
    p_cdm_e = subparsers.add_parser(
        "cdm-evaluate",
        help="Evaluate baseline persistence forecaster on sample conjunction events"
    )
    p_cdm_e.add_argument("--config", type=str, default=None, help="Path to experiment config YAML")

    return parser


def handle_extraction_evaluate(config: Optional[str] = None) -> int:
    result = run_adaption_workbench()
    if config:
        result["config_path"] = config
    print(json.dumps(result, indent=2))
    return 0


def handle_documents_ingest(config: Optional[str] = None) -> int:
    sample_doc_1 = DocumentPackage(
        source_id="src_sat_a_01",
        mission_family_id="fam_alpha",
        original_filename="sat_a_spec.pdf",
        pages=[PageRecord(source_id="src_sat_a_01", page_number=1, text_content="Wet mass 150 kg.")]
    )
    sample_doc_2 = DocumentPackage(
        source_id="src_sat_b_01",
        mission_family_id="fam_beta",
        original_filename="sat_b_spec.pdf",
        pages=[PageRecord(source_id="src_sat_b_01", page_number=1, text_content="Perigee 480 km.")]
    )
    train, val, test = partition_documents_by_family([sample_doc_1, sample_doc_2])
    res = {
        "status": "COMPLETED",
        "action": "documents-ingest",
        "total_packages": 2,
        "train_count": len(train),
        "val_count": len(val),
        "test_count": len(test),
        "grouped_by": "mission_family_id",
        "config_path": config
    }
    print(json.dumps(res, indent=2))
    return 0


def handle_documents_validate(config: Optional[str] = None) -> int:
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
    res = {"source_id": record.source_id, "is_valid": is_valid, "message": msg, "config_path": config}
    print(json.dumps(res, indent=2))
    return 0 if is_valid else 1


def handle_cdm_validate(config: Optional[str] = None) -> int:
    sample_msg = CDMMessage(
        event_id="evt_sample_01",
        message_id="msg_01",
        time_to_tca_days=4.5,
        miss_distance_m=12500.0,
        relative_speed_m_s=14200.0,
        log10_risk=-6.8
    )
    valid = sample_msg.time_to_tca_days > 0 and sample_msg.miss_distance_m > 0
    res = {
        "status": "VALID",
        "event_id": sample_msg.event_id,
        "cutoff_compliant": sample_msg.time_to_tca_days >= 2.0,
        "config_path": config
    }
    print(json.dumps(res, indent=2))
    return 0 if valid else 1


def handle_cdm_build_events(config: Optional[str] = None) -> int:
    sample_msgs = [
        CDMMessage(event_id="evt_01", message_id="m1", time_to_tca_days=4.5, miss_distance_m=12500.0, relative_speed_m_s=14200.0, log10_risk=-6.8),
        CDMMessage(event_id="evt_01", message_id="m2", time_to_tca_days=2.1, miss_distance_m=9800.0, relative_speed_m_s=14210.0, log10_risk=-5.4),
        CDMMessage(event_id="evt_01", message_id="m3", time_to_tca_days=0.5, miss_distance_m=8400.0, relative_speed_m_s=14215.0, log10_risk=-5.1),
    ]
    event = build_cutoff_safe_cdm_event(sample_msgs, cutoff_days=2.0)
    if event:
        d = event.model_dump()
        d["config_path"] = config
        print(json.dumps(d, indent=2))
        return 0
    print("Failed to build cutoff-safe event.")
    return 1


def handle_cdm_train(config: Optional[str] = None) -> int:
    # Build sample train and test events
    msgs_1 = [
        CDMMessage(event_id="e1", message_id="m1", time_to_tca_days=3.5, miss_distance_m=12000.0, relative_speed_m_s=14000.0, log10_risk=-6.2),
        CDMMessage(event_id="e1", message_id="m2", time_to_tca_days=0.6, miss_distance_m=11000.0, relative_speed_m_s=14000.0, log10_risk=-6.0),
    ]
    msgs_2 = [
        CDMMessage(event_id="e2", message_id="m3", time_to_tca_days=2.8, miss_distance_m=7500.0, relative_speed_m_s=14100.0, log10_risk=-5.2),
        CDMMessage(event_id="e2", message_id="m4", time_to_tca_days=0.4, miss_distance_m=7000.0, relative_speed_m_s=14100.0, log10_risk=-4.9),
    ]
    msgs_3 = [
        CDMMessage(event_id="e3", message_id="m5", time_to_tca_days=3.0, miss_distance_m=4200.0, relative_speed_m_s=14050.0, log10_risk=-4.5),
        CDMMessage(event_id="e3", message_id="m6", time_to_tca_days=0.3, miss_distance_m=4000.0, relative_speed_m_s=14050.0, log10_risk=-4.1),
    ]
    ev1 = build_cutoff_safe_cdm_event(msgs_1)
    ev2 = build_cutoff_safe_cdm_event(msgs_2)
    ev3 = build_cutoff_safe_cdm_event(msgs_3)

    train_events = [ev1, ev2]
    test_events = [ev3]

    res = train_and_evaluate_cdm_regressor(train_events, test_events)
    out = {
        "status": "TRAINED",
        "model_name": res["model_name"],
        "trained_at_utc": res["trained_at_utc"],
        "train_count": res["train_sample_count"],
        "test_count": res["test_sample_count"],
        "metrics": res["metrics"],
        "research_disclaimer": res["research_disclaimer"],
        "config_path": config
    }
    print(json.dumps(out, indent=2))
    return 0


def handle_cdm_evaluate(config: Optional[str] = None) -> int:
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
    d = report.model_dump()
    d["config_path"] = config
    print(json.dumps(d, indent=2))
    return 0


def main(args: List[str] | None = None) -> int:
    parser = build_parser()
    parsed = parser.parse_args(args)

    if not parsed.command:
        parser.print_help()
        return 0

    cfg = getattr(parsed, "config", None)

    if parsed.command == "extraction-evaluate":
        return handle_extraction_evaluate(cfg)
    elif parsed.command == "documents-ingest":
        return handle_documents_ingest(cfg)
    elif parsed.command == "documents-validate":
        return handle_documents_validate(cfg)
    elif parsed.command == "cdm-validate":
        return handle_cdm_validate(cfg)
    elif parsed.command == "cdm-build-events":
        return handle_cdm_build_events(cfg)
    elif parsed.command == "cdm-train":
        return handle_cdm_train(cfg)
    elif parsed.command == "cdm-evaluate":
        return handle_cdm_evaluate(cfg)
    else:
        parser.print_help()
        return 1


if __name__ == "__main__":
    sys.exit(main())
