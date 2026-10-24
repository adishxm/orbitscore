import hashlib, json
from typing import Any

def _canonical(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")

def append_event(events: list[dict], event_type: str, payload: dict) -> dict:
    seq = len(events) + 1
    prev = events[-1]["hash"] if events else "0" * 64
    body = {"sequence": seq, "event_type": event_type, "payload": payload, "previous_hash": prev}
    event = {**body, "hash": hashlib.sha256(_canonical(body)).hexdigest()}
    events.append(event)
    return event

def verify_chain(events: list[dict]) -> dict:
    previous = "0" * 64
    for idx, event in enumerate(events, 1):
        body = {k: event[k] for k in ("sequence", "event_type", "payload", "previous_hash") if k in event}
        expected = hashlib.sha256(_canonical(body)).hexdigest()
        if event.get("sequence") != idx or event.get("previous_hash") != previous or event.get("hash") != expected:
            return {"valid": False, "tampered_sequence": idx, "expected_hash": expected, "actual_hash": event.get("hash")}
        previous = event["hash"]
    return {"valid": True, "count": len(events), "head": previous}
