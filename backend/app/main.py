from __future__ import annotations
import os
import json
import hashlib
import uuid
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from contextlib import asynccontextmanager

from .schemas import (
    MissionProfile, EvaluateRequest, DecisionRequest, CounterfactualRequest,
    FieldUpdateRequest, ArtifactRecord, CandidateField, ExtractionResponse
)
from .engine import evaluate_mission, run_counterfactual, load_profiles
from .provenance import verify_chain
from .export import generate_packet
from .extractor import (
    extract_text_from_bytes, extract_candidate_fields,
    MAX_FILE_SIZE, ALLOWED_EXTENSIONS, SYNTHETIC_WARNING
)
from .ai_adapter import run_ai_candidate_extraction, is_ai_enabled
from .db import (
    init_db, reset_db, get_connection, save_mission, get_mission_db, list_missions_db,
    save_artifact_db, get_artifact_db, get_artifact_content_db,
    save_evaluation_db, get_evaluation_db, save_review_db, list_reviews_db,
    save_counterfactual_db, append_provenance_event_db, get_all_provenance_events_db,
    verify_provenance_chain_db
)

ROOT = Path(__file__).resolve().parents[2]
FIXTURES = ROOT / "fixtures"

# Initialize durable SQLite database on startup
init_db()


def _load_fixture(name: str) -> dict:
    with (FIXTURES / name).open(encoding="utf-8") as f:
        return json.load(f)


def _ensure_fixtures_loaded():
    """Ensure standard synthetic mission fixtures are persisted in SQLite."""
    existing = list_missions_db()
    existing_ids = {m["mission_id"] for m in existing}
    for f in FIXTURES.glob("mission_*.json"):
        mid = f.stem
        if mid not in existing_ids:
            try:
                m_data = _load_fixture(f.name)
                save_mission(m_data)
            except Exception:
                pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    _ensure_fixtures_loaded()
    yield


app = FastAPI(
    title="OrbitScore API",
    version="1.0.0",
    description="Deterministic regulatory policy evaluation & human review decision dossier API.",
    lifespan=lifespan
)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


# Compatibility dictionary proxies backed by SQLite for tests and scripts
class MissionsDict(dict):
    def clear(self):
        conn = get_connection()
        with conn:
            conn.execute("DELETE FROM missions")
        conn.close()

    def __getitem__(self, key):
        m = get_mission_db(key)
        if m is None:
            raise KeyError(key)
        return m

    def __setitem__(self, key, value):
        save_mission(value)

    def __contains__(self, key):
        return get_mission_db(key) is not None

    def get(self, key, default=None):
        m = get_mission_db(key)
        return m if m is not None else default

    def values(self):
        return list_missions_db()

    def keys(self):
        return [m["mission_id"] for m in list_missions_db()]

    def items(self):
        return [(m["mission_id"], m) for m in list_missions_db()]

    def __len__(self):
        return len(list_missions_db())


class ReviewsDict(dict):
    def clear(self):
        conn = get_connection()
        with conn:
            conn.execute("DELETE FROM reviews")
        conn.close()

    def __getitem__(self, key):
        revs = list_reviews_db()
        return revs[key]

    def __setitem__(self, key, value):
        save_review_db(value)

    def __contains__(self, key):
        return key in list_reviews_db()

    def get(self, key, default=None):
        return list_reviews_db().get(key, default)

    def values(self):
        return list(list_reviews_db().values())

    def items(self):
        return list(list_reviews_db().items())

    def __len__(self):
        return len(list_reviews_db())


class EvaluationsDict(dict):
    def clear(self):
        conn = get_connection()
        with conn:
            conn.execute("DELETE FROM evaluations")
        conn.close()

    def __getitem__(self, key):
        ev = get_evaluation_db(key)
        if ev is None:
            raise KeyError(key)
        return ev

    def __setitem__(self, key, value):
        save_evaluation_db(key, value.get("profile_id", "default"), value)

    def __contains__(self, key):
        return get_evaluation_db(key) is not None

    def get(self, key, default=None):
        ev = get_evaluation_db(key)
        return ev if ev is not None else default


class EventsList(list):
    def clear(self):
        conn = get_connection()
        with conn:
            conn.execute("DELETE FROM provenance")
        conn.close()

    def append(self, item):
        append_provenance_event_db(
            item.get("event_type", "custom"),
            item.get("payload", {}),
            item.get("mission_id")
        )

    def __len__(self):
        return len(get_all_provenance_events_db())

    def __getitem__(self, index):
        return get_all_provenance_events_db()[index]

    def __iter__(self):
        return iter(get_all_provenance_events_db())


missions = MissionsDict()
reviews = ReviewsDict()
evaluations = EvaluationsDict()
events = EventsList()


@app.get("/health")
def health():
    return {
        "ok": True,
        "version": app.version,
        "ai_enabled": is_ai_enabled(),
        "database": "sqlite_durable"
    }


@app.get("/profiles")
def profiles():
    return load_profiles()


@app.get("/missions")
def list_missions():
    _ensure_fixtures_loaded()
    missions = list_missions_db()
    if not missions:
        _ensure_fixtures_loaded()
        missions = list_missions_db()
    return missions


@app.get("/missions/{mission_id}")
def get_mission(mission_id: str):
    m = get_mission_db(mission_id)
    if not m:
        fixture = FIXTURES / f"{mission_id}.json"
        if fixture.exists():
            m = _load_fixture(f"{mission_id}.json")
            save_mission(m)
    if not m:
        raise HTTPException(404, "Mission not found")
    return m


@app.post("/missions")
def create_mission(payload: MissionProfile):
    mission = payload.model_dump()
    save_mission(mission)
    append_provenance_event_db("mission_created", {"mission_id": mission["mission_id"]}, mission["mission_id"])
    return mission


@app.post("/missions/{mission_id}/evaluate")
def evaluate(mission_id: str, request: EvaluateRequest):
    mission = get_mission(mission_id)
    try:
        result = evaluate_mission(mission, request.profile_id)
    except ValueError as exc:
        raise HTTPException(400, str(exc))
    save_evaluation_db(mission_id, request.profile_id, result)
    append_provenance_event_db("mission_evaluated", {
        "mission_id": mission_id,
        "profile_id": request.profile_id,
        "finding_count": len(result.get("findings", []))
    }, mission_id)
    return result


@app.post("/missions/{mission_id}/findings/{finding_id}/decision")
def decision(mission_id: str, finding_id: str, request: DecisionRequest):
    evaluation = get_evaluation_db(mission_id)
    if not evaluation or not any(f["finding_id"] == finding_id for f in evaluation.get("findings", [])):
        raise HTTPException(404, "Evaluate mission and select an existing finding first")
    item = {"finding_id": finding_id, "mission_id": mission_id, **request.model_dump()}
    save_review_db(item)
    append_provenance_event_db("review_decision", item, mission_id)
    return item


@app.post("/missions/{mission_id}/counterfactual")
def counterfactual(mission_id: str, request: CounterfactualRequest):
    evaluation = get_evaluation_db(mission_id)
    if not evaluation:
        raise HTTPException(409, "Evaluate mission first")
    result = run_counterfactual(
        get_mission(mission_id), evaluation["profile_id"], request.finding_id, request.lever, request.proposed_value
    )
    save_counterfactual_db(result)
    append_provenance_event_db("counterfactual_generated", result, mission_id)
    return result


@app.get("/provenance")
def provenance():
    events = get_all_provenance_events_db()
    verification = verify_provenance_chain_db()
    return {"events": events, "verification": verification}


@app.get("/export/{mission_id}")
def export_packet(mission_id: str, request: Request, format: Optional[str] = Query(None)):
    """Export complete cited review packet. Returns 423 if any finding lacks a human decision."""
    evaluation = get_evaluation_db(mission_id)
    if not evaluation:
        raise HTTPException(423, detail={"code": "EXPORT_LOCKED", "message": "Mission must be evaluated before export", "pending_decisions": 1})
    reviews = list_reviews_db()
    missing = [f["finding_id"] for f in evaluation.get("findings", []) if f["finding_id"] not in reviews]
    if missing:
        raise HTTPException(423, detail={"code": "EXPORT_LOCKED", "unreviewed_findings": missing, "pending_decisions": len(missing)})

    prov_status = verify_provenance_chain_db()
    packet = generate_packet(
        get_mission(mission_id),
        evaluation,
        list(reviews.values()),
        provenance_status=prov_status
    )
    append_provenance_event_db("export_generated", {
        "mission_id": mission_id,
        "reviewed_count": len(reviews),
        "status": "READY"
    }, mission_id)

    accept_header = request.headers.get("accept", "")
    if format == "html" or "text/html" in accept_header:
        return HTMLResponse(content=packet["html"], status_code=200)
    return packet


@app.patch("/missions/{mission_id}/fields/{field_name}")
def update_field(mission_id: str, field_name: str, request: FieldUpdateRequest):
    m = get_mission(mission_id)
    fields = m.setdefault("fields", [])
    updated = False
    for f in fields:
        if f.get("field") == field_name:
            if request.value is not None:
                f["value"] = request.value
            if request.human_confirmed is not None:
                f["human_confirmed"] = request.human_confirmed
            updated = True
            break
    if not updated:
        fields.append({
            "field": field_name,
            "value": request.value,
            "human_confirmed": request.human_confirmed if request.human_confirmed is not None else False,
            "artifact_id": None,
            "locator": {}
        })
    save_mission(m)
    append_provenance_event_db("field_updated", {
        "mission_id": mission_id,
        "field": field_name,
        "value": request.value,
        "human_confirmed": request.human_confirmed
    }, mission_id)
    return {"ok": True, "field": field_name, "mission_id": mission_id}


@app.patch("/fields/{field_id}")
def update_field_by_id(field_id: str, request: FieldUpdateRequest, mission_id: str | None = None):
    target_mission = mission_id or "mission_complete"
    return update_field(target_mission, field_id, request)


# --- Artifact Upload and Extraction Endpoints ---

@app.post("/missions/{mission_id}/artifacts", response_model=ArtifactRecord)
async def upload_artifact(mission_id: str, file: UploadFile = File(...)):
    """Upload a synthetic mission evidence document with SHA-256 verification and durable persistence."""
    m = get_mission(mission_id)
    filename = file.filename or "unknown_artifact"
    ext = Path(filename).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type '{ext}'. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(413, f"File size ({len(content)} bytes) exceeds the 10 MB limit.")

    sha256_hash = hashlib.sha256(content).hexdigest()
    art_id = f"art_{uuid.uuid4().hex[:8]}"
    uploaded_at = datetime.now(timezone.utc).isoformat()

    record = ArtifactRecord(
        artifact_id=art_id,
        mission_id=mission_id,
        filename=filename,
        media_type=file.content_type or f"application/{ext.lstrip('.')}",
        sha256=sha256_hash,
        uploaded_at=uploaded_at,
        size_bytes=len(content),
        warning=SYNTHETIC_WARNING,
        locator={"page_count": 1}
    )

    save_artifact_db(
        art_id, mission_id, filename, record.media_type, sha256_hash, content, record.model_dump()
    )

    mission_artifacts = m.setdefault("artifacts", [])
    mission_artifacts.append(record.model_dump())
    save_mission(m)

    append_provenance_event_db("artifact_uploaded", {
        "artifact_id": art_id,
        "mission_id": mission_id,
        "filename": filename,
        "sha256": sha256_hash,
        "size_bytes": len(content),
    }, mission_id)

    return record


@app.get("/artifacts/{artifact_id}")
def get_artifact(artifact_id: str):
    rec = get_artifact_db(artifact_id)
    if not rec:
        raise HTTPException(404, "Artifact not found")
    return rec


@app.post("/artifacts/{artifact_id}/extract", response_model=ExtractionResponse)
def extract_artifact(artifact_id: str):
    """Extract candidate fields using AI (if enabled) or deterministic regex parser."""
    rec = get_artifact_db(artifact_id)
    if not rec:
        raise HTTPException(404, "Artifact not found")

    content = get_artifact_content_db(artifact_id)
    if not content:
        raise HTTPException(404, "Artifact content not found")

    mission_id = rec["mission_id"]
    m = get_mission(mission_id)

    try:
        pages = extract_text_from_bytes(content, rec["filename"], rec.get("media_type", ""))
    except Exception as exc:
        return ExtractionResponse(
            artifact_id=artifact_id,
            mission_id=mission_id,
            status="NOT_EVALUATED",
            extracted_fields=[],
            warning=SYNTHETIC_WARNING,
            message=f"Parser failure: {str(exc)}"
        )

    # Use AI candidate extraction when enabled; otherwise falls back cleanly to deterministic parser
    candidates = run_ai_candidate_extraction(pages)

    if not candidates:
        return ExtractionResponse(
            artifact_id=artifact_id,
            mission_id=mission_id,
            status="NOT_EVALUATED",
            extracted_fields=[],
            warning=SYNTHETIC_WARNING,
            message="No compliance candidate fields detected in artifact text."
        )

    # Attach unconfirmed candidate fields to mission
    m_fields = m.setdefault("fields", [])
    for cand in candidates:
        cand_dict = cand.model_dump()
        cand_dict["artifact_id"] = artifact_id
        cand_dict["human_confirmed"] = False  # Strict fail-closed invariant
        m_fields.append(cand_dict)

    save_mission(m)

    append_provenance_event_db("artifact_extracted", {
        "artifact_id": artifact_id,
        "mission_id": mission_id,
        "extracted_count": len(candidates),
        "fields": [c.field for c in candidates],
    }, mission_id)

    return ExtractionResponse(
        artifact_id=artifact_id,
        mission_id=mission_id,
        status="SUCCESS",
        extracted_fields=candidates,
        warning=SYNTHETIC_WARNING,
        message=f"Successfully extracted {len(candidates)} unconfirmed candidate fields with source locators."
    )


@app.post("/reset")
def reset_demo():
    reset_db()
    _ensure_fixtures_loaded()
    return {"ok": True}
