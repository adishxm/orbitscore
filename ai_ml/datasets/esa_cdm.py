"""
ESA Collision Avoidance Challenge CDM Dataset Module
Location: ai_ml/datasets/esa_cdm.py
Strict Invariant:
Builds leakage-safe conjunction event examples with a strict 2-day pre-TCA cutoff.
Splits strictly by event_id, NEVER row-by-row, to prevent chronological data leakage.
"""

from __future__ import annotations
from typing import List, Optional, Tuple
from pydantic import BaseModel, Field


class CDMMessage(BaseModel):
    event_id: str
    message_id: str
    time_to_tca_days: float
    miss_distance_m: float
    relative_speed_m_s: float
    log10_risk: float  # Base-10 log risk, e.g. -6.0 corresponds to 10^-6


class CDMEventExample(BaseModel):
    event_id: str
    feature_message_id: str
    feature_time_to_tca_days: float
    latest_early_risk: float
    miss_distance_m: float
    relative_speed_m_s: float
    label_message_id: str
    final_reported_log10_risk: float
    cutoff_days: float = 2.0
    research_disclaimer: str = (
        "OFFLINE RESEARCH ONLY - ESA CDM BENCHMARK FORECASTING, NOT OPERATIONAL COLLISION PROBABILITY"
    )


def build_cutoff_safe_cdm_event(
    messages: List[CDMMessage],
    cutoff_days: float = 2.0
) -> Optional[CDMEventExample]:
    """
    Construct a single leakage-safe event example from a sequence of CDMs for one event.
    Requirements:
    1. At least one early message with time_to_tca_days >= cutoff_days.
    2. At least one late message with time_to_tca_days < cutoff_days (to serve as the final target).
    """
    if not messages:
        return None

    event_id = messages[0].event_id

    # Filter messages before and after cutoff
    early_msgs = [m for m in messages if m.time_to_tca_days >= cutoff_days]
    late_msgs = [m for m in messages if m.time_to_tca_days < cutoff_days]

    if not early_msgs or not late_msgs:
        # Cannot form an example: either no feature history or no future label
        return None

    # Latest allowed feature snapshot is the early message closest to TCA (smallest time_to_tca >= cutoff)
    latest_early = min(early_msgs, key=lambda m: m.time_to_tca_days)

    # Final label is the late message closest to TCA (smallest time_to_tca < cutoff)
    final_late = min(late_msgs, key=lambda m: m.time_to_tca_days)

    return CDMEventExample(
        event_id=event_id,
        feature_message_id=latest_early.message_id,
        feature_time_to_tca_days=latest_early.time_to_tca_days,
        latest_early_risk=latest_early.log10_risk,
        miss_distance_m=latest_early.miss_distance_m,
        relative_speed_m_s=latest_early.relative_speed_m_s,
        label_message_id=final_late.message_id,
        final_reported_log10_risk=final_late.log10_risk,
        cutoff_days=cutoff_days,
    )


def partition_cdm_events_by_event_id(
    events: List[CDMEventExample],
    train_ratio: float = 0.7,
    val_ratio: float = 0.15
) -> Tuple[List[CDMEventExample], List[CDMEventExample], List[CDMEventExample]]:
    """
    Partition events into disjoint train, val, test sets strictly by event_id.
    Guarantees no messages from the same event appear across multiple splits.
    """
    total = len(events)
    if total == 0:
        return [], [], []

    train_end = max(1, int(total * train_ratio))
    val_end = max(train_end + 1, int(total * (train_ratio + val_ratio)))

    train = events[:train_end]
    val = events[train_end:val_end]
    test = events[val_end:]

    return train, val, test
