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
    Guarantees no messages/examples from the same event appear across multiple splits.
    """
    if not events:
        return [], [], []

    # Group all examples by unique event_id
    grouped: Dict[str, List[CDMEventExample]] = {}
    for ev in events:
        grouped.setdefault(ev.event_id, []).append(ev)

    unique_event_ids = sorted(list(grouped.keys()))
    n_unique = len(unique_event_ids)

    if n_unique == 1:
        # All examples belong to a single event: put all in train, keep val and test empty
        # to strictly preserve event disjointness!
        return list(events), [], []

    train_count = max(1, int(n_unique * train_ratio))
    val_count = int(n_unique * val_ratio)
    if train_count + val_count >= n_unique:
        val_count = max(0, n_unique - train_count - 1)

    train_ids = set(unique_event_ids[:train_count])
    val_ids = set(unique_event_ids[train_count : train_count + val_count])
    test_ids = set(unique_event_ids[train_count + val_count :])

    train = [ev for eid in train_ids for ev in grouped[eid]]
    val = [ev for eid in val_ids for ev in grouped[eid]]
    test = [ev for eid in test_ids for ev in grouped[eid]]

    # Rigorous invariant check: splits MUST be disjoint by event_id
    assert train_ids.isdisjoint(val_ids), "Train and val sets must be event-disjoint"
    assert train_ids.isdisjoint(test_ids), "Train and test sets must be event-disjoint"
    assert val_ids.isdisjoint(test_ids), "Val and test sets must be event-disjoint"

    return train, val, test

