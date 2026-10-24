from __future__ import annotations
import os
import json
import hashlib
import uuid
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query, Request, Depends, Response
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
from .auth import (
    get_current_user, require_reviewer, require_viewer_or_reviewer, AuthenticatedUser, is_production
)
from .integrations.agent37 import (
    triage_excerpt_agent37, Agent37TriageRequest, Agent37TriageResponse, is_agent37_enabled,
    chat_with_agent37, Agent37ChatRequest, Agent37ChatResponse,
    check_agent37_live_status, Agent37StatusResponse
)
from .integrations.browser_use import (
    capture_public_source, BrowserCaptureRequest, BrowserCaptureResponse, is_browser_use_enabled
)
from .integrations.elevenlabs import (
    narrate_reviewed_finding, ElevenLabsNarrateRequest, ElevenLabsNarrateResponse, is_elevenlabs_enabled
)
from ai_ml.credit_index import compute_space_credit_index, SpaceCreditIndexResult
from ai_ml.orbital_ml import (
    decay_ml_engine, collision_ml_engine,
    DecayPredictionResult, ConjunctionRiskResult
)
from .integrations.space_track import space_track_service, SpaceTrackTLE, ConjunctionAlert
from .integrations.nasa_spark import nasa_spark_service, DebrisDensityBand, DebrisFluxAssessment
from .odar_generator import generate_nasa_odar_markdown, generate_eomp_markdown, generate_pdf_report
from .db import (
    init_db, reset_db, get_connection, save_mission, get_mission_db, list_missions_db,
    save_artifact_db, get_artifact_db, get_artifact_content_db,
    save_evaluation_db, get_evaluation_db, invalidate_evaluation_db, save_review_db, list_reviews_db,
    save_counterfactual_db, append_provenance_event_db, get_all_provenance_events_db,
    verify_provenance_chain_db
)
from .adapters.celestrak import fetch_celestrak_gp, CelesTrakGPResult

ROOT = Path(__file__).resolve().parents[2]
FIXTURES = ROOT / "fixtures"

# Load local environment configuration safely if present
try:
    from dotenv import load_dotenv
    load_dotenv(ROOT / ".env")
except ImportError:
    env_file = ROOT / ".env"
    if env_file.exists():
        with open(env_file, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k, v = k.strip(), v.strip().strip('"').strip("'")
                    if k not in os.environ:
                        os.environ[k] = v

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

# Environment-specific CORS configuration - avoids wildcard origins in production/staging
cors_origins_env = os.getenv("ORBITSCORE_CORS_ORIGINS") or os.getenv("CORS_ORIGINS", "")
if cors_origins_env:
    cors_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
else:
    cors_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


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


@app.get("/")
def root():
    return {
        "service": "OrbitScore API",
        "status": "online",
        "version": app.version,
        "description": "Deterministic regulatory policy evaluation & human review decision dossier API.",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "health_url": "/health",
        "frontend_workspace": "http://localhost:5173",
        "message": "Welcome to the OrbitScore Backend API. Visit /docs for interactive API documentation or http://localhost:5173 for the frontend workspace."
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "ok": True,
        "service": "orbitscore-backend",
        "version": app.version,
        "ai_enabled": is_ai_enabled(),
        "database": "sqlite_durable"
    }


@app.get("/ready")
def ready():
    """
    Readiness probe for deployment environments (Render, Kubernetes, Docker).
    Verifies that the SQLite database is reachable and operational with zero connection leaks.
    Returns 200 OK if ready, 503 Service Unavailable if database is unreachable.
    """
    try:
        conn = get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
        finally:
            conn.close()
        return {
            "status": "ready",
            "ready": True,
            "ok": True,
            "service": "orbitscore-backend",
            "version": app.version,
            "database": "sqlite_connected"
        }
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "not_ready",
                "ok": False,
                "error": "DATABASE_UNAVAILABLE",
                "message": str(exc)
            }
        )


@app.get("/profiles")
def profiles(user: AuthenticatedUser = Depends(require_viewer_or_reviewer)):
    return load_profiles()


@app.get("/missions")
def list_missions(user: AuthenticatedUser = Depends(require_viewer_or_reviewer)):
    _ensure_fixtures_loaded()
    missions = list_missions_db()
    if not missions:
        _ensure_fixtures_loaded()
        missions = list_missions_db()
    return missions


@app.get("/missions/{mission_id}")
def get_mission(mission_id: str, user: AuthenticatedUser = Depends(require_viewer_or_reviewer)):
    lookup_id = "mission_complete" if mission_id in ("asteria-3", "asteria3") else mission_id
    m = get_mission_db(lookup_id)
    if not m:
        fixture = FIXTURES / f"{lookup_id}.json"
        if fixture.exists():
            m = _load_fixture(f"{lookup_id}.json")
            save_mission(m)
    if not m and lookup_id != mission_id:
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
def create_mission(payload: MissionProfile, user: AuthenticatedUser = Depends(require_reviewer)):
    mission = payload.model_dump()
    save_mission(mission)
    append_provenance_event_db("mission_created", {"mission_id": mission["mission_id"]}, mission["mission_id"])
    return mission


@app.post("/missions/{mission_id}/evaluate")
def evaluate(mission_id: str, request: EvaluateRequest, user: AuthenticatedUser = Depends(require_reviewer)):
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
def decision(mission_id: str, finding_id: str, request: DecisionRequest, user: AuthenticatedUser = Depends(require_reviewer)):
    evaluation = get_evaluation_db(mission_id)
    if not evaluation or not any(f["finding_id"] == finding_id for f in evaluation.get("findings", [])):
        raise HTTPException(404, "Evaluate mission and select an existing finding first")
    item = {"finding_id": finding_id, "mission_id": mission_id, **request.model_dump()}
    save_review_db(item)
    append_provenance_event_db("review_decision", item, mission_id)
    return item


@app.post("/missions/{mission_id}/counterfactual")
def counterfactual(mission_id: str, request: CounterfactualRequest, user: AuthenticatedUser = Depends(require_reviewer)):
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
def provenance(user: AuthenticatedUser = Depends(require_viewer_or_reviewer)):
    events = get_all_provenance_events_db()
    verification = verify_provenance_chain_db()
    return {"events": events, "verification": verification}


def _validate_and_get_export_gate(mission_id: str) -> tuple[dict, dict, dict, dict]:
    """
    Canonical export gate shared by /export/{mission_id}, /export/{mission_id}/odar, and /export/{mission_id}/eomp.
    Fails closed with HTTP 423 EXPORT_LOCKED if:
    - Mission is unevaluated.
    - Any finding lacks a human decision or has a rejected decision.
    - Provenance hash chain is invalid or tampered.
    """
    evaluation = get_evaluation_db(mission_id)
    if not evaluation:
        raise HTTPException(423, detail={"code": "EXPORT_LOCKED", "message": "Mission must be evaluated before export", "pending_decisions": 1})
    reviews = list_reviews_db(mission_id)
    unreviewed = [f["finding_id"] for f in evaluation.get("findings", []) if f["finding_id"] not in reviews]
    rejected = [
        f["finding_id"] for f in evaluation.get("findings", [])
        if f["finding_id"] in reviews and reviews[f["finding_id"]].get("decision") not in ("ACCEPTED", "WAIVED_WITH_NOTE", "APPROVED", "WAIVED")
    ]
    if unreviewed or rejected:
        raise HTTPException(423, detail={
            "code": "EXPORT_LOCKED",
            "unreviewed_findings": unreviewed,
            "rejected_findings": rejected,
            "pending_decisions": len(unreviewed) + len(rejected),
            "message": "Export locked: All findings must be approved or waived by human reviewer; rejected or unreviewed findings block export."
        })

    prov_status = verify_provenance_chain_db()
    if not prov_status.get("valid", True):
        raise HTTPException(423, detail={
            "code": "EXPORT_LOCKED",
            "error": "TAMPERED_PROVENANCE_CHAIN",
            "message": "Export locked: Provenance hash chain verification failed. Data integrity compromise detected."
        })

    mission = get_mission(mission_id)
    return mission, evaluation, reviews, prov_status


@app.get("/export/{mission_id}")
def export_packet(
    mission_id: str,
    request: Request,
    format: Optional[str] = Query(None),
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """Export complete cited review packet. Returns 423 if any finding lacks a human decision or provenance is tampered."""
    mission, evaluation, reviews, prov_status = _validate_and_get_export_gate(mission_id)

    packet = generate_packet(
        mission,
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


@app.get("/export/{mission_id}/odar")
def export_odar(
    mission_id: str,
    format: Optional[str] = Query(None),
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """Export NASA-STD-8719.14 compliant ODAR draft review packet. Enforces canonical export gate."""
    mission, evaluation, reviews, prov_status = _validate_and_get_export_gate(mission_id)
    evidence_items = mission.get("fields", []) + mission.get("artifacts", [])
    decisions_list = list(reviews.values())

    decay_years = None
    for f in mission.get("fields", []):
        f_name = f.get("field") or f.get("field_name") or ""
        if "decay" in f_name or "disposal" in f_name or "lifetime" in f_name:
            try:
                decay_years = float(f.get("value"))
                break
            except (ValueError, TypeError):
                pass

    markdown_doc = generate_nasa_odar_markdown(
        mission=mission,
        evidence_items=evidence_items,
        decisions=decisions_list,
        estimated_decay_years=decay_years
    )

    append_provenance_event_db("odar_exported", {
        "mission_id": mission_id,
        "format": format or "markdown",
        "status": "READY"
    }, mission_id)

    if format == "pdf":
        pdf_bytes = generate_pdf_report(
            title="NASA-STD-8719.14C ODAR Review Packet",
            markdown_content=markdown_doc,
            mission_name=mission.get("name", mission_id),
            watermark_text="DRAFT — REQUIRES HUMAN REVIEW"
        )
        return Response(content=pdf_bytes, media_type="application/pdf")
    elif format == "json":
        return {
            "mission_id": mission_id,
            "document_type": "ODAR",
            "standard": "NASA-STD-8719.14C",
            "markdown": markdown_doc,
            "provenance": prov_status
        }
    return Response(content=markdown_doc, media_type="text/markdown")


@app.get("/export/{mission_id}/eomp")
def export_eomp(
    mission_id: str,
    format: Optional[str] = Query(None),
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """Export End-of-Mission Plan (EOMP) conforming to ISRO DFSM 2030 / FCC. Enforces canonical export gate."""
    mission, evaluation, reviews, prov_status = _validate_and_get_export_gate(mission_id)
    evidence_items = mission.get("fields", []) + mission.get("artifacts", [])

    decay_years = None
    for f in mission.get("fields", []):
        f_name = f.get("field") or f.get("field_name") or ""
        if "decay" in f_name or "disposal" in f_name or "lifetime" in f_name:
            try:
                decay_years = float(f.get("value"))
                break
            except (ValueError, TypeError):
                pass

    markdown_doc = generate_eomp_markdown(
        mission=mission,
        evidence_items=evidence_items,
        estimated_decay_years=decay_years
    )

    append_provenance_event_db("eomp_exported", {
        "mission_id": mission_id,
        "format": format or "markdown",
        "status": "READY"
    }, mission_id)

    if format == "pdf":
        pdf_bytes = generate_pdf_report(
            title="ISRO DFSM 2030 End-of-Mission Plan (EOMP)",
            markdown_content=markdown_doc,
            mission_name=mission.get("name", mission_id),
            watermark_text="DRAFT — REQUIRES HUMAN REVIEW"
        )
        return Response(content=pdf_bytes, media_type="application/pdf")
    elif format == "json":
        return {
            "mission_id": mission_id,
            "document_type": "EOMP",
            "standard": "ISRO DFSM 2030 / FCC Part 25",
            "markdown": markdown_doc,
            "provenance": prov_status
        }
    return Response(content=markdown_doc, media_type="text/markdown")


@app.patch("/missions/{mission_id}/fields/{field_name}")
def update_field(
    mission_id: str,
    field_name: str,
    request: FieldUpdateRequest,
    user: AuthenticatedUser = Depends(require_reviewer)
):
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
    invalidate_evaluation_db(mission_id)
    append_provenance_event_db("field_updated", {
        "mission_id": mission_id,
        "field": field_name,
        "value": request.value,
        "human_confirmed": request.human_confirmed
    }, mission_id)
    return {"ok": True, "field": field_name, "mission_id": mission_id}


@app.patch("/fields/{field_id}")
def update_field_by_id(
    field_id: str,
    request: FieldUpdateRequest,
    mission_id: str | None = None,
    user: AuthenticatedUser = Depends(require_reviewer)
):
    target_mission = mission_id or "mission_complete"
    return update_field(target_mission, field_id, request, user=user)


# --- Artifact Upload and Extraction Endpoints ---

@app.post("/missions/{mission_id}/artifacts", response_model=ArtifactRecord)
async def upload_artifact(
    mission_id: str,
    file: UploadFile = File(...),
    user: AuthenticatedUser = Depends(require_reviewer)
):
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
    invalidate_evaluation_db(mission_id)

    append_provenance_event_db("artifact_uploaded", {
        "artifact_id": art_id,
        "mission_id": mission_id,
        "filename": filename,
        "sha256": sha256_hash,
        "size_bytes": len(content),
    }, mission_id)

    return record


@app.get("/artifacts/{artifact_id}")
def get_artifact(artifact_id: str, user: AuthenticatedUser = Depends(require_viewer_or_reviewer)):
    rec = get_artifact_db(artifact_id)
    if not rec:
        raise HTTPException(404, "Artifact not found")
    return rec


@app.post("/artifacts/{artifact_id}/extract", response_model=ExtractionResponse)
def extract_artifact(artifact_id: str, user: AuthenticatedUser = Depends(require_reviewer)):
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

    meta = {}
    if rec.get("metadata_json"):
        try:
            meta = json.loads(rec["metadata_json"])
        except Exception:
            pass
    allowed_ext = bool(meta.get("allowed_external_processing", False))

    # Use AI candidate extraction when enabled AND permitted; otherwise falls back cleanly to deterministic parser
    candidates = run_ai_candidate_extraction(pages, allow_external=allowed_ext)

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
    invalidate_evaluation_db(mission_id)

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
def reset_demo(user: AuthenticatedUser = Depends(require_reviewer)):
    if is_production():
        raise HTTPException(
            status_code=403,
            detail={"error": "RESET_FORBIDDEN_IN_PRODUCTION", "message": "Database reset is strictly forbidden in production mode."}
        )
    reset_db()
    _ensure_fixtures_loaded()
    return {"ok": True}


# --- Six Services Integration Endpoints ---

@app.post("/integrations/agent37/triage", response_model=Agent37TriageResponse)
def agent37_triage(
    request: Agent37TriageRequest,
    user: AuthenticatedUser = Depends(require_reviewer)
):
    """
    Perform bounded candidate evidence triage via Agent37 on a supplied excerpt.
    Strict Invariant: Candidates produced are strictly unconfirmed (human_confirmed = False).
    """
    res = triage_excerpt_agent37(request)
    if res.candidates and request.mission_id:
        append_provenance_event_db("agent37_triage_executed", {
            "mission_id": request.mission_id,
            "candidate_count": len(res.candidates),
            "source_hash": res.source_hash,
            "status": res.status
        }, request.mission_id)
    return res


@app.post("/integrations/agent37/chat", response_model=Agent37ChatResponse)
def agent37_chat(
    request: Agent37ChatRequest,
    user: AuthenticatedUser = Depends(require_reviewer)
):
    """
    Interactive mission copilot chat powered by Agent 37 sandbox.
    Strict Invariant: Agent 37 answers questions and cites evidence but CANNOT certify compliance.
    """
    return chat_with_agent37(request)


@app.get("/integrations/agent37/status", response_model=Agent37StatusResponse)
def agent37_status():
    """Live connectivity and health check for the configured Agent 37 instance."""
    return check_agent37_live_status()


@app.post("/integrations/browser-use/capture", response_model=BrowserCaptureResponse)
def browser_use_capture(
    request: BrowserCaptureRequest,
    user: AuthenticatedUser = Depends(require_reviewer)
):
    """
    Capture public-source candidate excerpt from an approved allowlisted authority.
    Strict Invariant: Enforces strict domain allowlist (NASA, FCC, FAA, ESA, ISO, etc.).
    Does not login, submit forms, or alter external services.
    """
    return capture_public_source(request)


@app.post("/integrations/elevenlabs/narrate", response_model=ElevenLabsNarrateResponse)
def elevenlabs_narrate(
    request: ElevenLabsNarrateRequest,
    user: AuthenticatedUser = Depends(require_reviewer)
):
    """
    Generate audio narration for an already human-reviewed finding.
    Strict Invariant: Unreviewed findings are rejected. Server-side API key only.
    """
    if not request.opt_in:
        raise HTTPException(
            status_code=400,
            detail={"error": "OPT_IN_REQUIRED", "message": "Explicit user opt-in is required before generating audio narration."}
        )
    revs = list_reviews_db(request.mission_id)
    finding_decision = revs.get(request.finding_id)
    is_reviewed = finding_decision is not None
    review_status = finding_decision.get("decision") if finding_decision else None

    return narrate_reviewed_finding(request, is_finding_reviewed=is_reviewed, review_status=review_status)


@app.get("/integrations/status")
def integrations_status():
    """
    Report enabled status and configuration boundary for the six integrated services without leaking secrets.
    """
    return {
        "services": {
            "flutterflow": {
                "role": "Mobile Reviewer Client",
                "api_contract": "/openapi.json",
                "auth_method": "Bearer Token",
                "status": "READY"
            },
            "agent37": {
                "role": "Bounded Candidate Evidence Triage",
                "enabled": is_agent37_enabled(),
                "mode": "cloud" if is_agent37_enabled() else "local_deterministic_fallback",
                "output_constraint": "human_confirmed=False strictly",
                "status": "READY"
            },
            "browser_use": {
                "role": "Allowlisted Public-Source Capture & QA",
                "enabled": is_browser_use_enabled(),
                "mode": "cloud" if is_browser_use_enabled() else "local_allowlist_preview",
                "domain_filter": "strict_allowlist_enforced",
                "status": "READY"
            },
            "elevenlabs": {
                "role": "Accessible Audio Narration of Human-Reviewed Findings",
                "enabled": is_elevenlabs_enabled(),
                "mode": "cloud" if is_elevenlabs_enabled() else "local_mock_preview",
                "gate": "human_reviewed_findings_only",
                "status": "READY"
            },
            "adaption": {
                "role": "Isolated Synthetic-Data & Model Evaluation Workbench",
                "enabled": False,
                "location": "ai_ml/adaption_pipeline.py",
                "pipeline_type": "offline_research_only",
                "production_inference_connected": False,
                "status": "READY"
            },
            "celestrak": {
                "role": "Contextual GP Element Sets (2-Hour Policy Cadence)",
                "policy_doc": "https://celestrak.org/usage-policy.php",
                "formats": ["OMM/JSON", "TLE", "CSV"],
                "cache_policy": "7200s (2h) TTL with Circuit Breaker",
                "status": "READY"
            },
            "render": {
                "role": "Application & Static Hosting Infrastructure",
                "config": "render.yaml",
                "services": ["orbitscore-web", "orbitscore-api", "orbitscore-worker"],
                "status": "CONFIGURED"
            }
        },
        "governance_notice": "External services cannot certify compliance, approve evidence, or make review decisions. Deterministic evaluation and provenance remain authoritative."
    }


# --- Space Credit Index Endpoint ---

@app.get("/missions/{mission_id}/space-credit-index", response_model=SpaceCreditIndexResult)
def get_space_credit_index(
    mission_id: str,
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """
    Compute an explainable, 4-pillar Space Credit Index (0 - 100) for a spacecraft mission
    benchmarking orbit lifetime, collision footprint, passivation, and primary evidence provenance.
    """
    m = get_mission(mission_id)
    fields = m.get("fields", [])
    return compute_space_credit_index(m, fields)


# --- Scikit-Learn Astrodynamics Machine Learning Endpoints ---

class DecayMLRequest(BaseModel):
    perigee_km: float = 498.8
    apogee_km: float = 500.2
    inclination_deg: float = 97.4
    mass_kg: float = 4.0
    area_m2: float = 0.03
    solar_flux_f107: float = 145.0


class CollisionMLRequest(BaseModel):
    miss_distance_m: float = 850.0
    relative_speed_kms: float = 14.1
    radial_miss_m: float = 140.0
    combined_hbr_m: float = 2.5


@app.post("/missions/{mission_id}/ml/predict-decay", response_model=DecayPredictionResult)
def predict_orbital_decay(
    mission_id: str,
    req: DecayMLRequest,
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """Predict natural orbital decay lifetime using a trained Scikit-Learn GradientBoostingRegressor."""
    return decay_ml_engine.predict(
        perigee_km=req.perigee_km,
        apogee_km=req.apogee_km,
        inclination_deg=req.inclination_deg,
        mass_kg=req.mass_kg,
        area_m2=req.area_m2,
        solar_flux_f107=req.solar_flux_f107,
    )


@app.post("/missions/{mission_id}/ml/collision-risk", response_model=ConjunctionRiskResult)
def classify_conjunction_risk(
    mission_id: str,
    req: CollisionMLRequest,
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """Classify conjunction geometry risk vector using a Scikit-Learn RandomForestClassifier."""
    return collision_ml_engine.evaluate_conjunction(
        miss_distance_m=req.miss_distance_m,
        relative_speed_kms=req.relative_speed_kms,
        radial_miss_m=req.radial_miss_m,
        combined_hbr_m=req.combined_hbr_m,
    )


# --- Space-Track and NASA SPARK Ingestion Endpoints ---

@app.get("/integrations/space-track/tle/{norad_id}", response_model=SpaceTrackTLE)
async def get_space_track_tle(
    norad_id: int,
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """Retrieve Space-Track TLE orbit state vector with offline caching for air-gapped demo."""
    return await space_track_service.fetch_tle(norad_id)


@app.get("/integrations/space-track/conjunctions/{norad_id}", response_model=List[ConjunctionAlert])
async def get_space_track_conjunctions(
    norad_id: int,
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """Retrieve Close Encounter Conjunction Data Messages (CDMs) from Space-Track catalog."""
    return await space_track_service.fetch_conjunctions(norad_id)


@app.get("/integrations/nasa-spark/debris-density", response_model=List[DebrisDensityBand])
async def get_nasa_spark_debris_density(
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """Retrieve LEO spatial debris density distribution from NASA SPARK / ORDEM baseline."""
    return await nasa_spark_service.get_spatial_density_profile()


@app.get("/integrations/nasa-spark/assess-flux", response_model=DebrisFluxAssessment)
async def assess_nasa_spark_flux(
    altitude_km: float = 500.0,
    area_m2: float = 0.03,
    lifetime_years: float = 3.8,
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """Assess smallsat cumulative collision probability against NASA SPARK orbital models."""
    return await nasa_spark_service.assess_mission_flux(
        altitude_km=altitude_km,
        area_m2=area_m2,
        lifetime_years=lifetime_years,
    )


@app.get("/integrations/celestrak/gp/{norad_id}", response_model=CelesTrakGPResult)
async def get_celestrak_gp(
    norad_id: int,
    format: str = Query("JSON", description="Desired GP data format: JSON (OMM, supports >5 digit IDs), TLE, or CSV"),
    force_refresh: bool = Query(False, description="Force refresh ignoring local 2-hour cache"),
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """
    Retrieve General Perturbations (GP) element sets complying with CelesTrak usage policy.
    Cached for 2 hours (7200s); halts on errors with circuit breaker; clearly labeled as non-operational.
    Supports modern OMM JSON (handles 6-digit & 9-digit catalog numbers) and legacy TLE formats.
    """
    return await fetch_celestrak_gp(norad_id, format=format, force_refresh=force_refresh)


# --- Automated ODAR & EOMP Export Pipeline Endpoints ---

# --- Automated ODAR & EOMP Export Pipeline Endpoints ---

@app.get("/missions/{mission_id}/export/odar")
def export_nasa_odar_report(
    mission_id: str,
    format: str = Query("markdown", pattern="^(markdown|pdf)$"),
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """Generate a complete NASA-STD-8719.14 compliant draft ODAR document (markdown or PDF). Returns 423 if locked."""
    evaluation = get_evaluation_db(mission_id)
    if not evaluation:
        raise HTTPException(423, detail={"code": "EXPORT_LOCKED", "message": "Mission must be evaluated before export", "pending_decisions": 1})
    reviews = list_reviews_db(mission_id)
    unreviewed = [f["finding_id"] for f in evaluation.get("findings", []) if f["finding_id"] not in reviews]
    rejected = [
        f["finding_id"] for f in evaluation.get("findings", [])
        if f["finding_id"] in reviews and reviews[f["finding_id"]].get("decision") not in ("ACCEPTED", "WAIVED_WITH_NOTE", "APPROVED", "WAIVED")
    ]
    if unreviewed or rejected:
        raise HTTPException(423, detail={
            "code": "EXPORT_LOCKED",
            "unreviewed_findings": unreviewed,
            "rejected_findings": rejected,
            "pending_decisions": len(unreviewed) + len(rejected),
            "message": "Export locked: All findings must be approved or waived by human reviewer; rejected or unreviewed findings block export."
        })

    m = get_mission(mission_id)
    fields = m.get("fields", [])
    decisions = list(reviews.values())
    md = generate_nasa_odar_markdown(m, fields, decisions)
    if format == "pdf":
        pdf_bytes = generate_pdf_report("Orbital Debris Assessment Report (ODAR)", md, m.get("name", mission_id))
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="ODAR_{mission_id}.pdf"'}
        )
    return HTMLResponse(content=md, media_type="text/markdown; charset=utf-8")


@app.get("/missions/{mission_id}/export/eomp")
def export_isro_fcc_eomp_plan(
    mission_id: str,
    format: str = Query("markdown", pattern="^(markdown|pdf)$"),
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """Generate an End-of-Mission Plan (EOMP) conforming to ISRO DFSM 2030 and FCC 5-year rules (markdown or PDF). Returns 423 if locked."""
    evaluation = get_evaluation_db(mission_id)
    if not evaluation:
        raise HTTPException(423, detail={"code": "EXPORT_LOCKED", "message": "Mission must be evaluated before export", "pending_decisions": 1})
    reviews = list_reviews_db(mission_id)
    unreviewed = [f["finding_id"] for f in evaluation.get("findings", []) if f["finding_id"] not in reviews]
    rejected = [
        f["finding_id"] for f in evaluation.get("findings", [])
        if f["finding_id"] in reviews and reviews[f["finding_id"]].get("decision") not in ("ACCEPTED", "WAIVED_WITH_NOTE", "APPROVED", "WAIVED")
    ]
    if unreviewed or rejected:
        raise HTTPException(423, detail={
            "code": "EXPORT_LOCKED",
            "unreviewed_findings": unreviewed,
            "rejected_findings": rejected,
            "pending_decisions": len(unreviewed) + len(rejected),
            "message": "Export locked: All findings must be approved or waived by human reviewer; rejected or unreviewed findings block export."
        })

    m = get_mission(mission_id)
    fields = m.get("fields", [])
    md = generate_eomp_markdown(m, fields)
    if format == "pdf":
        pdf_bytes = generate_pdf_report("End-of-Mission Plan (EOMP)", md, m.get("name", mission_id))
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="EOMP_{mission_id}.pdf"'}
        )
    return HTMLResponse(content=md, media_type="text/markdown; charset=utf-8")


# --- Offline Research Demonstration Endpoints ---

try:
    from ai_ml.inference.cdm_forecast import run_cdm_forecast, CDMMakeForecastResult
except ImportError:
    run_cdm_forecast = None
    CDMMakeForecastResult = dict


class ResearchCDMForecastRequest(BaseModel):
    event_id: str
    time_to_tca_days: float = Field(2.5, ge=2.0, description="Pre-TCA horizon (must be >= 2.0 days)")
    miss_distance_m: float = Field(8500.0, ge=0.0, description="Encounter miss distance in meters")
    relative_speed_m_s: float = Field(14200.0, ge=0.0, description="Encounter relative speed in m/s")
    latest_early_risk: float = Field(-5.8, le=0.0, description="Reported log10 risk (must be <= 0.0)")
    artifact_id: Optional[str] = None


@app.post("/research/cdm-forecast")
def execute_research_cdm_forecast(
    req: ResearchCDMForecastRequest,
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """
    Offline research-only forecast of reported log-risk for a close approach event.
    Explicitly labeled as research benchmark, not operational collision probability or maneuver advice.
    """
    if run_cdm_forecast is None:
        raise HTTPException(503, "AI/ML research inference module unavailable.")
    try:
        result = run_cdm_forecast(
            event_id=req.event_id,
            time_to_tca_days=req.time_to_tca_days,
            miss_distance_m=req.miss_distance_m,
            relative_speed_m_s=req.relative_speed_m_s,
            latest_early_risk=req.latest_early_risk,
            artifact_id=req.artifact_id,
        )
        return result.model_dump()
    except LookupError as exc:
        raise HTTPException(404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(400, detail=str(exc))


# --- Orbital Intelligence & Space Credit Index Explanation Endpoints (P2 & P3) ---

class PathwayPoint(BaseModel):
    step: int
    time_offset_seconds: float
    latitude: float
    longitude: float
    altitude_km: float


class MissionPathwayResponse(BaseModel):
    mission_id: str
    epoch: str
    period_minutes: float
    inclination_deg: float
    altitude_km: float
    pathway_points: List[PathwayPoint]
    data_mode: str = "SYNTHETIC_PROPAGATION"
    disclaimer: str = (
        "HEURISTIC SCHEMATIC PATHWAY - FOR VISUALIZATION ONLY, NOT FOR FLIGHT NAVIGATION"
    )


class CollisionAlertsSummary(BaseModel):
    critical_sub_1km: int
    advisory_1_to_5km: int
    wide_above_5km: int


class MissionCollisionAlertsResponse(BaseModel):
    mission_id: str
    norad_cat_id: int
    total_alerts: int
    highest_severity: str
    bands: CollisionAlertsSummary
    alerts: List[ConjunctionAlert]
    data_mode: str = "SYNTHETIC_SCREENING"
    disclaimer: str = (
        "HEURISTIC SCREENING ONLY - NOT AN OPERATIONAL CONJUNCTION ASSESSMENT SERVICE, NO REAL-TIME Pc COMPUTED"
    )


class DecayPoint(BaseModel):
    year: float
    altitude_km: float


class MissionDecayPathResponse(BaseModel):
    mission_id: str
    initial_altitude_km: float
    reentry_altitude_km: float
    estimated_lifetime_years: float
    model_status: str
    decay_series: List[DecayPoint]
    data_mode: str = "SYNTHETIC_SCHEMATIC"
    disclaimer: str = (
        "SCHEMATIC ATMOSPHERIC DECAY PROFILE - FOR COARSE ESTIMATION ONLY, NOT AN ACCREDITED PROPAGATOR"
    )


class PillarExplanation(BaseModel):
    category: str
    points_awarded: float
    max_points: float
    percentage: float
    status: str
    notes: str


class SpaceCreditIndexExplainResponse(BaseModel):
    mission_id: str
    overall_score: float
    rating_tier: str
    isro_dfsm_aligned: bool
    fcc_5yr_aligned: bool
    summary: str
    pillars: List[PillarExplanation]
    missing_pillars: List[str]
    recommendations: List[str]
    data_mode: str
    disclaimer: str


@app.get("/missions/{mission_id}/pathway", response_model=MissionPathwayResponse)
def get_mission_pathway(
    mission_id: str,
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """
    Generate a deterministic SGP4-style Keplerian pathway for mission orbital context.
    Bounded series of latitude, longitude, and altitude waypoints across one full orbit.
    """
    import math
    m = get_mission(mission_id)
    if not m:
        raise HTTPException(404, "Mission not found")

    # Extract orbital elements
    alt = 500.0
    inc = 97.4
    for f in m.get("fields", []):
        fn = f.get("field") or f.get("field_name")
        val = f.get("value")
        if fn in ("altitude_km", "perigee_altitude_km", "apogee_altitude_km", "operational_altitude_km") and val is not None:
            try:
                alt = float(val)
            except (ValueError, TypeError):
                pass
        elif fn in ("inclination_deg", "orbit_inclination_deg") and val is not None:
            try:
                inc = float(val)
            except (ValueError, TypeError):
                pass

    # Earth physics
    R_earth = 6378.137  # km
    mu = 398600.4418  # km^3/s^2
    a = R_earth + alt
    period_seconds = 2.0 * math.pi * math.sqrt((a ** 3) / mu)
    period_min = round(period_seconds / 60.0, 1)

    steps = 16
    dt = period_seconds / float(steps - 1)
    omega_earth = 360.0 / 86400.0  # deg/sec
    mean_motion = 2.0 * math.pi / period_seconds

    inc_rad = math.radians(inc)
    points: List[PathwayPoint] = []
    for step in range(steps):
        t = step * dt
        # True spherical sub-satellite latitude: sin(lat) = sin(i) * sin(u)
        sin_lat = math.sin(inc_rad) * math.sin(mean_motion * t)
        lat = round(math.degrees(math.asin(max(-1.0, min(1.0, sin_lat)))), 4)
        lon_deg = (mean_motion * t * (180.0 / math.pi)) - (omega_earth * t)
        lon = round(((lon_deg + 180.0) % 360.0) - 180.0, 4)

        points.append(
            PathwayPoint(
                step=step,
                time_offset_seconds=round(t, 1),
                latitude=lat,
                longitude=lon,
                altitude_km=round(alt, 1),
            )
        )

    return MissionPathwayResponse(
        mission_id=mission_id,
        epoch="2026-10-25T00:00:00Z",
        period_minutes=period_min,
        inclination_deg=inc,
        altitude_km=round(alt, 1),
        pathway_points=points,
        data_mode="SYNTHETIC_PROPAGATION",
        disclaimer="HEURISTIC SCHEMATIC PATHWAY - FOR VISUALIZATION ONLY, NOT FOR FLIGHT NAVIGATION"
    )


@app.get("/missions/{mission_id}/collision-alerts", response_model=MissionCollisionAlertsResponse)
async def get_mission_collision_alerts(
    mission_id: str,
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """
    Retrieve proximity screening collision alerts for mission's operational altitude.
    Labeled as heuristic screening, not an operational conjunction assessment or collision probability.
    """
    m = get_mission(mission_id)
    if not m:
        raise HTTPException(404, "Mission not found")

    norad_id = 99999
    # Check DB stored CDMs first
    from .db import get_cdm_events_for_norad
    stored_cdms = get_cdm_events_for_norad(norad_id)

    alerts: List[ConjunctionAlert] = []
    if stored_cdms:
        for c in stored_cdms:
            alerts.append(
                ConjunctionAlert(
                    cdm_id=c["cdm_id"],
                    primary_norad=c["primary_norad"],
                    primary_name=c["primary_name"],
                    secondary_norad=c["secondary_norad"],
                    secondary_name=c["secondary_name"],
                    time_of_closest_approach=c["tca"],
                    miss_distance_meters=c["miss_distance_m"],
                    radial_miss_meters=round(c["miss_distance_m"] * 0.15, 1),
                    relative_speed_kms=14.1,
                    collision_probability=c["collision_probability"],
                    alert_level=c["alert_level"],
                    data_mode="SNAPSHOT",
                )
            )
    else:
        alerts = await space_track_service.fetch_conjunctions(norad_id)

    crit = sum(1 for a in alerts if a.miss_distance_meters < 1000.0)
    adv = sum(1 for a in alerts if 1000.0 <= a.miss_distance_meters <= 5000.0)
    wide = sum(1 for a in alerts if a.miss_distance_meters > 5000.0)

    highest = "NOMINAL"
    if crit > 0:
        highest = "CRITICAL"
    elif adv > 0:
        highest = "ADVISORY"

    return MissionCollisionAlertsResponse(
        mission_id=mission_id,
        norad_cat_id=norad_id,
        total_alerts=len(alerts),
        highest_severity=highest,
        bands=CollisionAlertsSummary(
            critical_sub_1km=crit,
            advisory_1_to_5km=adv,
            wide_above_5km=wide,
        ),
        alerts=alerts,
        data_mode="SYNTHETIC_SCREENING",
        disclaimer="HEURISTIC SCREENING ONLY - NOT AN OPERATIONAL CONJUNCTION ASSESSMENT SERVICE, NO REAL-TIME Pc COMPUTED"
    )


@app.get("/missions/{mission_id}/decay-path", response_model=MissionDecayPathResponse)
def get_mission_decay_path(
    mission_id: str,
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """
    Retrieve altitude-parameterized schematic decay curve for the mission.
    Distinguishes SCHEMATIC vs approved RESEARCH models from trusted registry.
    """
    import math
    m = get_mission(mission_id)
    if not m:
        raise HTTPException(404, "Mission not found")

    init_alt = 500.0
    lifetime_yrs = 3.8

    for f in m.get("fields", []):
        fn = f.get("field") or f.get("field_name")
        val = f.get("value")
        if fn in ("altitude_km", "perigee_altitude_km", "apogee_altitude_km", "operational_altitude_km") and val is not None:
            try:
                init_alt = float(val)
            except (ValueError, TypeError):
                pass
        elif fn in ("remaining_orbital_life_years", "disposal_duration_years", "debris_decay_years", "mission_lifetime_years") and val is not None:
            try:
                lifetime_yrs = float(val)
            except (ValueError, TypeError):
                pass

    # Model status check via trusted registry
    model_status = "SCHEMATIC"
    try:
        from ai_ml.inference.registry import get_registered_artifact
        artifact = get_registered_artifact("decay_regressor_approved")
        if artifact:
            model_status = "RESEARCH"
    except Exception:
        model_status = "SCHEMATIC"

    reentry_alt = 100.0
    steps = 10
    curve: List[DecayPoint] = []
    for step in range(steps):
        frac = step / float(steps - 1)
        yr = round(frac * lifetime_yrs, 2)
        # Quadratic atmospheric braking model
        current_alt = reentry_alt + (init_alt - reentry_alt) * math.sqrt(max(0.0, 1.0 - frac))
        curve.append(DecayPoint(year=yr, altitude_km=round(current_alt, 1)))

    return MissionDecayPathResponse(
        mission_id=mission_id,
        initial_altitude_km=round(init_alt, 1),
        reentry_altitude_km=reentry_alt,
        estimated_lifetime_years=round(lifetime_yrs, 2),
        model_status=model_status,
        decay_series=curve,
        data_mode="SYNTHETIC_SCHEMATIC",
        disclaimer="SCHEMATIC ATMOSPHERIC DECAY PROFILE - FOR COARSE ESTIMATION ONLY, NOT AN ACCREDITED PROPAGATOR"
    )


@app.get("/missions/{mission_id}/space-credit-index/explain", response_model=SpaceCreditIndexExplainResponse)
def explain_space_credit_index(
    mission_id: str,
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """
    Provide per-pillar explainability breakdown for Space Credit Index.
    Discloses missing evidence pillars, data mode, and explicit pre-review disclaimer.
    """
    m = get_mission(mission_id)
    if not m:
        raise HTTPException(404, "Mission not found")

    fields = m.get("fields", [])
    index_res = compute_space_credit_index(m, fields)

    pillars: List[PillarExplanation] = []
    missing_pillars: List[str] = []

    for b in index_res.breakdowns:
        awarded = b.points_awarded
        pct = b.percentage
        if awarded == 0.0:
            status = "MISSING_EVIDENCE"
            missing_pillars.append(b.category)
        elif pct >= 80.0:
            status = "SATISFIED"
        else:
            status = "PARTIAL"

        pillars.append(
            PillarExplanation(
                category=b.category,
                points_awarded=awarded,
                max_points=b.max_points,
                percentage=pct,
                status=status,
                notes=b.notes,
            )
        )

    has_confirmed = any(f.get("human_confirmed") for f in fields)
    data_mode = "SNAPSHOT" if has_confirmed else "SYNTHETIC"

    return SpaceCreditIndexExplainResponse(
        mission_id=mission_id,
        overall_score=index_res.overall_score,
        rating_tier=index_res.rating_tier,
        isro_dfsm_aligned=index_res.isro_dfsm_aligned,
        fcc_5yr_aligned=index_res.fcc_5yr_aligned,
        summary=index_res.summary,
        pillars=pillars,
        missing_pillars=missing_pillars,
        recommendations=index_res.recommendations,
        data_mode=data_mode,
        disclaimer=index_res.disclaimer,
    )


# --- System Hardening, Health, Readiness & Fleet Endpoints ---


@app.get("/ready")
def readiness_check():
    """Readiness probe checking database connectivity and system integrations."""
    db_ok = True
    try:
        conn = get_connection()
        conn.execute("SELECT 1")
    except Exception:
        db_ok = False
    return {
        "ready": db_ok,
        "database": "sqlite_connected" if db_ok else "unavailable",
        "live_telemetry_enabled": os.environ.get("ORBIT_LIVE_DATA_ENABLED", "false").lower() == "true",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


class FleetIndexRequest(BaseModel):
    mission_ids: Optional[List[str]] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=100)


@app.post("/fleet/space-credit-index")
def batch_fleet_credit_index(
    req: FleetIndexRequest,
    user: AuthenticatedUser = Depends(require_viewer_or_reviewer)
):
    """Batch calculation of the Space Credit Index across a fleet of missions with tier aggregation."""
    all_missions = list_missions()
    if req.mission_ids:
        target_missions = [m for m in all_missions if m.get("mission_id") in req.mission_ids]
    else:
        target_missions = all_missions

    total_count = len(target_missions)
    start_idx = (req.page - 1) * req.page_size
    page_missions = target_missions[start_idx : start_idx + req.page_size]

    results = []
    tier_counts = {"AAA": 0, "AA": 0, "A": 0, "BBB": 0, "BB": 0, "B": 0, "C": 0, "UNRATED": 0}

    for m in page_missions:
        mid = m.get("mission_id")
        fields = m.get("fields", [])
        if not fields:
            idx_res = {
                "mission_id": mid,
                "mission_name": m.get("name"),
                "overall_score": None,
                "rating_tier": "UNRATED",
                "missing_pillars": ["size", "orbital_trajectory", "debris_legacy", "collision_avoidance"],
                "data_mode": "SYNTHETIC"
            }
            tier_counts["UNRATED"] += 1
        else:
            calc = compute_space_credit_index(m, fields)
            tier = calc.rating_tier if hasattr(calc, 'rating_tier') else calc.get("rating_tier", "UNRATED")
            tier_counts[tier] = tier_counts.get(tier, 0) + 1
            idx_res = {
                "mission_id": mid,
                "mission_name": m.get("name"),
                "overall_score": calc.overall_score if hasattr(calc, 'overall_score') else calc.get("overall_score"),
                "rating_tier": tier,
                "data_mode": "SNAPSHOT"
            }
        results.append(idx_res)

    return {
        "page": req.page,
        "page_size": req.page_size,
        "total_missions": total_count,
        "total_pages": (total_count + req.page_size - 1) // req.page_size if total_count else 0,
        "fleet_tier_distribution": tier_counts,
        "missions": results,
        "disclaimer": "Fleet Space Credit Index benchmark is an evidence-readiness aggregation, not an underwriting rating or safety certification."
    }



