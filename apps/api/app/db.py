from __future__ import annotations
import os
import sqlite3
import json
import hashlib
from pathlib import Path
from typing import Any, Optional
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[3]
DEFAULT_DB_PATH = ROOT / "data" / "orbitscore.db"


def get_db_path() -> Path:
    env_path = os.environ.get("ORBIT_DB_PATH") or os.environ.get("DATABASE_PATH")
    if env_path:
        return Path(env_path)
    return DEFAULT_DB_PATH


def get_connection(db_path: Optional[Path | str] = None) -> sqlite3.Connection:
    target = Path(db_path) if db_path else get_db_path()
    if target != Path(":memory:"):
        target.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(target), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_path: Optional[Path | str] = None) -> None:
    """Initialize SQLite database tables for durable persistence."""
    conn = get_connection(db_path)
    with conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS missions (
                mission_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                data_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS artifacts (
                artifact_id TEXT PRIMARY KEY,
                mission_id TEXT NOT NULL,
                filename TEXT NOT NULL,
                media_type TEXT NOT NULL,
                sha256 TEXT NOT NULL,
                size_bytes INTEGER NOT NULL,
                content_blob BLOB NOT NULL,
                metadata_json TEXT NOT NULL,
                uploaded_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS fields (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mission_id TEXT NOT NULL,
                field_name TEXT NOT NULL,
                value_json TEXT,
                human_confirmed INTEGER NOT NULL DEFAULT 0,
                artifact_id TEXT,
                locator_json TEXT,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS evaluations (
                mission_id TEXT PRIMARY KEY,
                profile_id TEXT NOT NULL,
                evaluation_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS reviews (
                finding_id TEXT PRIMARY KEY,
                mission_id TEXT NOT NULL,
                decision TEXT NOT NULL,
                note TEXT,
                reviewer TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS counterfactuals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mission_id TEXT NOT NULL,
                finding_id TEXT NOT NULL,
                lever TEXT NOT NULL,
                proposed_value_json TEXT NOT NULL,
                result_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS provenance (
                sequence INTEGER PRIMARY KEY,
                event_id TEXT,
                event_type TEXT NOT NULL,
                mission_id TEXT,
                payload_json TEXT NOT NULL,
                previous_hash TEXT NOT NULL,
                hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
        """)
    conn.close()


def reset_db(db_path: Optional[Path | str] = None) -> None:
    """Clear all records from database tables for deterministic reset."""
    conn = get_connection(db_path)
    with conn:
        conn.execute("DELETE FROM missions")
        conn.execute("DELETE FROM artifacts")
        conn.execute("DELETE FROM fields")
        conn.execute("DELETE FROM evaluations")
        conn.execute("DELETE FROM reviews")
        conn.execute("DELETE FROM counterfactuals")
        conn.execute("DELETE FROM provenance")
    conn.close()


# --- Mission persistence ---

def save_mission(mission: dict, db_path: Optional[Path | str] = None) -> None:
    conn = get_connection(db_path)
    now = datetime.now(timezone.utc).isoformat()
    mid = mission["mission_id"]
    name = mission.get("name", mid)
    data = json.dumps(mission, ensure_ascii=False)
    with conn:
        conn.execute(
            "INSERT OR REPLACE INTO missions (mission_id, name, data_json, updated_at) VALUES (?, ?, ?, ?)",
            (mid, name, data, now)
        )
    conn.close()


def get_mission_db(mission_id: str, db_path: Optional[Path | str] = None) -> Optional[dict]:
    conn = get_connection(db_path)
    cur = conn.cursor()
    cur.execute("SELECT data_json FROM missions WHERE mission_id = ?", (mission_id,))
    row = cur.fetchone()
    conn.close()
    if row:
        return json.loads(row["data_json"])
    return None


def list_missions_db(db_path: Optional[Path | str] = None) -> list[dict]:
    conn = get_connection(db_path)
    cur = conn.cursor()
    cur.execute("SELECT data_json FROM missions ORDER BY mission_id")
    rows = cur.fetchall()
    conn.close()
    return [json.loads(r["data_json"]) for r in rows]


# --- Artifact persistence ---

def save_artifact_db(
    artifact_id: str,
    mission_id: str,
    filename: str,
    media_type: str,
    sha256: str,
    content: bytes,
    metadata: dict,
    db_path: Optional[Path | str] = None
) -> None:
    conn = get_connection(db_path)
    now = datetime.now(timezone.utc).isoformat()
    with conn:
        conn.execute(
            """INSERT OR REPLACE INTO artifacts 
               (artifact_id, mission_id, filename, media_type, sha256, size_bytes, content_blob, metadata_json, uploaded_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (artifact_id, mission_id, filename, media_type, sha256, len(content), content, json.dumps(metadata), now)
        )
    conn.close()


def get_artifact_db(artifact_id: str, db_path: Optional[Path | str] = None) -> Optional[dict]:
    conn = get_connection(db_path)
    cur = conn.cursor()
    cur.execute("SELECT metadata_json FROM artifacts WHERE artifact_id = ?", (artifact_id,))
    row = cur.fetchone()
    conn.close()
    if row:
        return json.loads(row["metadata_json"])
    return None


def get_artifact_content_db(artifact_id: str, db_path: Optional[Path | str] = None) -> Optional[bytes]:
    conn = get_connection(db_path)
    cur = conn.cursor()
    cur.execute("SELECT content_blob FROM artifacts WHERE artifact_id = ?", (artifact_id,))
    row = cur.fetchone()
    conn.close()
    if row:
        return bytes(row["content_blob"])
    return None


# --- Evaluation and Reviews ---

def save_evaluation_db(mission_id: str, profile_id: str, evaluation: dict, db_path: Optional[Path | str] = None) -> None:
    conn = get_connection(db_path)
    now = datetime.now(timezone.utc).isoformat()
    with conn:
        conn.execute(
            "INSERT OR REPLACE INTO evaluations (mission_id, profile_id, evaluation_json, updated_at) VALUES (?, ?, ?, ?)",
            (mission_id, profile_id, json.dumps(evaluation), now)
        )
    conn.close()


def get_evaluation_db(mission_id: str, db_path: Optional[Path | str] = None) -> Optional[dict]:
    conn = get_connection(db_path)
    cur = conn.cursor()
    cur.execute("SELECT evaluation_json FROM evaluations WHERE mission_id = ?", (mission_id,))
    row = cur.fetchone()
    conn.close()
    if row:
        return json.loads(row["evaluation_json"])
    return None


def save_review_db(review: dict, db_path: Optional[Path | str] = None) -> None:
    conn = get_connection(db_path)
    now = datetime.now(timezone.utc).isoformat()
    fid = review["finding_id"]
    mid = review.get("mission_id", "")
    dec = review["decision"]
    note = review.get("note")
    rev = review.get("reviewer", "reviewer")
    with conn:
        conn.execute(
            "INSERT OR REPLACE INTO reviews (finding_id, mission_id, decision, note, reviewer, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (fid, mid, dec, note, rev, now)
        )
    conn.close()


def list_reviews_db(db_path: Optional[Path | str] = None) -> dict[str, dict]:
    conn = get_connection(db_path)
    cur = conn.cursor()
    cur.execute("SELECT finding_id, mission_id, decision, note, reviewer FROM reviews")
    rows = cur.fetchall()
    conn.close()
    return {
        r["finding_id"]: {
            "finding_id": r["finding_id"],
            "mission_id": r["mission_id"],
            "decision": r["decision"],
            "note": r["note"],
            "reviewer": r["reviewer"]
        } for r in rows
    }


def save_counterfactual_db(cf: dict, db_path: Optional[Path | str] = None) -> None:
    conn = get_connection(db_path)
    now = datetime.now(timezone.utc).isoformat()
    mid = cf.get("mission_id", "")
    fid = cf.get("finding_id", "")
    lever = cf.get("lever", "")
    prop = json.dumps(cf.get("proposed_value"))
    res = json.dumps(cf)
    with conn:
        conn.execute(
            """INSERT INTO counterfactuals (mission_id, finding_id, lever, proposed_value_json, result_json, created_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (mid, fid, lever, prop, res, now)
        )
    conn.close()


# --- Provenance chain persistence ---

def _canonical_bytes(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def append_provenance_event_db(
    event_type: str,
    payload: dict,
    mission_id: Optional[str] = None,
    db_path: Optional[Path | str] = None
) -> dict:
    conn = get_connection(db_path)
    cur = conn.cursor()
    cur.execute("SELECT sequence, hash FROM provenance ORDER BY sequence DESC LIMIT 1")
    last = cur.fetchone()
    seq = (last["sequence"] + 1) if last else 1
    prev_hash = last["hash"] if last else "0" * 64
    now = datetime.now(timezone.utc).isoformat()

    body = {
        "sequence": seq,
        "event_type": event_type,
        "payload": payload,
        "previous_hash": prev_hash,
    }
    event_hash = hashlib.sha256(_canonical_bytes(body)).hexdigest()

    with conn:
        conn.execute(
            """INSERT INTO provenance (sequence, event_id, event_type, mission_id, payload_json, previous_hash, hash, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (seq, f"evt_{seq}", event_type, mission_id, json.dumps(payload), prev_hash, event_hash, now)
        )
    conn.close()

    return {
        "sequence": seq,
        "event_id": f"evt_{seq}",
        "event_type": event_type,
        "mission_id": mission_id,
        "payload": payload,
        "previous_hash": prev_hash,
        "hash": event_hash,
        "created_at": now
    }


def get_all_provenance_events_db(db_path: Optional[Path | str] = None) -> list[dict]:
    conn = get_connection(db_path)
    cur = conn.cursor()
    cur.execute("SELECT sequence, event_id, event_type, mission_id, payload_json, previous_hash, hash, created_at FROM provenance ORDER BY sequence ASC")
    rows = cur.fetchall()
    conn.close()
    return [
        {
            "sequence": r["sequence"],
            "event_id": r["event_id"],
            "event_type": r["event_type"],
            "mission_id": r["mission_id"],
            "payload": json.loads(r["payload_json"]),
            "previous_hash": r["previous_hash"],
            "hash": r["hash"],
            "created_at": r["created_at"]
        } for r in rows
    ]


def verify_provenance_chain_db(db_path: Optional[Path | str] = None) -> dict:
    events = get_all_provenance_events_db(db_path)
    previous = "0" * 64
    for idx, event in enumerate(events, 1):
        body = {
            "sequence": event["sequence"],
            "event_type": event["event_type"],
            "payload": event["payload"],
            "previous_hash": event["previous_hash"]
        }
        expected = hashlib.sha256(_canonical_bytes(body)).hexdigest()
        if event.get("sequence") != idx or event.get("previous_hash") != previous or event.get("hash") != expected:
            return {
                "valid": False,
                "tampered_sequence": idx,
                "expected_hash": expected,
                "actual_hash": event.get("hash"),
                "reason": "SEQUENCE_OR_HASH_MISMATCH"
            }
        previous = event["hash"]
    return {"valid": True, "count": len(events), "head": previous}


if __name__ == "__main__":
    init_db()
    print(f"Initialized database at {get_db_path()}")
