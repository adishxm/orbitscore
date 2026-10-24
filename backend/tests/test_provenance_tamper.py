import json
import sqlite3
import pytest
from app.provenance import append_event, verify_chain, canonical_bytes
from app.db import (
    init_db, append_provenance_event_db, get_all_provenance_events_db,
    verify_provenance_chain_db, get_connection
)

def test_canonical_bytes_deterministic():
    d1 = {"b": 2, "a": 1, "nested": {"z": 10, "y": 20}}
    d2 = {"nested": {"y": 20, "z": 10}, "a": 1, "b": 2}
    assert canonical_bytes(d1) == canonical_bytes(d2)


def test_valid_provenance_chain():
    events = []
    e1 = append_event(events, "mission_created", {"mission_id": "test_01"})
    e2 = append_event(events, "evidence_uploaded", {"artifact_id": "art_01"})
    e3 = append_event(events, "evaluated", {"score": 85})

    assert len(events) == 3
    assert e1["sequence"] == 1
    assert e2["sequence"] == 2
    assert e3["sequence"] == 3
    assert e1["previous_hash"] == "0" * 64
    assert e2["previous_hash"] == e1["hash"]
    assert e3["previous_hash"] == e2["hash"]

    res = verify_chain(events)
    assert res["valid"] is True
    assert res["count"] == 3
    assert res["head"] == e3["hash"]
    assert "notice" in res


def test_tamper_payload_detection():
    events = []
    append_event(events, "created", {"val": 1})
    append_event(events, "evaluated", {"val": 2})
    append_event(events, "approved", {"val": 3})

    # Tamper with payload in event 2
    events[1]["payload"]["val"] = 999

    res = verify_chain(events)
    assert res["valid"] is False
    assert res["tampered_sequence"] == 2
    assert res["reason"] == "PAYLOAD_TAMPERED"


def test_tamper_order_swap_detection():
    events = []
    append_event(events, "e1", {"step": 1})
    append_event(events, "e2", {"step": 2})
    append_event(events, "e3", {"step": 3})

    # Swap event 1 and 2 (0-indexed 1 and 2)
    events[1], events[2] = events[2], events[1]

    res = verify_chain(events)
    assert res["valid"] is False
    assert res["tampered_sequence"] == 2
    assert res["reason"] == "ORDER_OR_SEQUENCE_MISMATCH"


def test_tamper_deletion_detection():
    events = []
    append_event(events, "e1", {"step": 1})
    append_event(events, "e2", {"step": 2})
    append_event(events, "e3", {"step": 3})

    # Delete event 2
    del events[1]

    res = verify_chain(events)
    assert res["valid"] is False
    assert res["tampered_sequence"] == 2


def test_tamper_previous_hash_detection():
    events = []
    append_event(events, "e1", {"step": 1})
    append_event(events, "e2", {"step": 2})

    events[1]["previous_hash"] = "f" * 64

    res = verify_chain(events)
    assert res["valid"] is False
    assert res["tampered_sequence"] == 2
    assert res["reason"] == "PREVIOUS_HASH_MISMATCH"


def test_sqlite_durable_provenance_and_db_tamper_detection(tmp_path):
    db_file = tmp_path / "prov_test.db"
    init_db(db_file)

    append_provenance_event_db("mission_created", {"mission_id": "m1"}, "m1", db_path=db_file)
    append_provenance_event_db("evaluated", {"band": "PASS"}, "m1", db_path=db_file)
    append_provenance_event_db("decision", {"decision": "APPROVED"}, "m1", db_path=db_file)

    stored = get_all_provenance_events_db(db_path=db_file)
    assert len(stored) == 3

    check1 = verify_provenance_chain_db(db_path=db_file)
    assert check1["valid"] is True
    assert check1["count"] == 3

    # Tamper with the raw SQLite record in row 2
    conn = get_connection(db_file)
    with conn:
        conn.execute("UPDATE provenance SET payload_json = '{\"band\":\"FAILED\"}' WHERE sequence = 2")
    conn.close()

    check2 = verify_provenance_chain_db(db_path=db_file)
    assert check2["valid"] is False
    assert check2["tampered_sequence"] == 2
