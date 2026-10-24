import hashlib, json
from typing import Any

def _canonical(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")

canonical_bytes = _canonical

def append_event(events: list[dict], event_type: str, payload: dict) -> dict:
    seq = len(events) + 1
    prev = events[-1]["hash"] if events else "0" * 64
    body = {"sequence": seq, "event_type": event_type, "payload": payload, "previous_hash": prev}
    event = {**body, "hash": hashlib.sha256(_canonical(body)).hexdigest()}
    events.append(event)
    return event

def verify_chain(events: list[dict]) -> dict:
    """Verify cryptographic integrity of the append-only SHA-256 hash chain.
    
    Detects:
    1. Changed payload
    2. Changed sequence order
    3. Missing / deleted event
    4. Modified previous hash
    """
    previous = "0" * 64
    for idx, event in enumerate(events, 1):
        if event.get("sequence") != idx:
            return {
                "valid": False,
                "tampered_sequence": idx,
                "reason": "ORDER_OR_SEQUENCE_MISMATCH",
                "message": f"Expected sequence {idx}, but found {event.get('sequence')}."
            }
        if event.get("previous_hash") != previous:
            return {
                "valid": False,
                "tampered_sequence": idx,
                "reason": "PREVIOUS_HASH_MISMATCH",
                "expected_previous": previous,
                "actual_previous": event.get("previous_hash")
            }
        body = {k: event[k] for k in ("sequence", "event_type", "payload", "previous_hash") if k in event}
        expected = hashlib.sha256(_canonical(body)).hexdigest()
        if event.get("hash") != expected:
            return {
                "valid": False,
                "tampered_sequence": idx,
                "reason": "PAYLOAD_TAMPERED",
                "expected_hash": expected,
                "actual_hash": event.get("hash")
            }
        previous = event["hash"]

    return {
        "valid": True,
        "count": len(events),
        "head": previous,
        "notice": "Tamper-evident verification checked; not a legally binding third-party certification or distributed blockchain."
    }
