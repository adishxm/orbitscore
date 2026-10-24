from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import json
import hashlib
import uuid
from datetime import datetime, timezone

from .schemas import (
    MissionProfile, EvaluateRequest, DecisionRequest, CounterfactualRequest,
    FieldUpdateRequest, ArtifactRecord, CandidateField, ExtractionResponse
)
from .engine import evaluate_mission, run_counterfactual, load_profiles
from .provenance import append_event, verify_chain
from .export import generate_packet
from .extractor import (
    extract_text_from_bytes, extract_candidate_fields,
    MAX_FILE_SIZE, ALLOWED_EXTENSIONS, SYNTHETIC_WARNING
)

app = FastAPI(title="OrbitScore API", version="1.0.0", description="Evidence pre-review decision support; not certification.")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

ROOT = Path(__file__).resolve().parents[3]
FIXTURES = ROOT / "fixtures"

missions: dict[str, dict] = {}
reviews: dict[str, dict] = {}
evaluations: dict[str, dict] = {}
events: list[dict] = []
artifacts_storage: dict[str, dict] = {}


def _load_fixture(name: str) -> dict:
    with (FIXTURES / name).open(encoding="utf-8") as f:
        return json.load(f)


def _ensure_fixtures_loaded():
    for f in FIXTURES.glob("mission_*.json"):
        mid = f.stem
        if mid not in missions:
            try:
                missions[mid] = _load_fixture(f.name)
            except Exception:
                pass


@app.get("/health")
def health():
    return {"ok": True, "version": app.version}


@app.get("/profiles")
def profiles():
    return load_profiles()


@app.get("/missions")
def list_missions():
    _ensure_fixtures_loaded()
    return list(missions.values())


@app.get("/missions/{mission_id}")
def get_mission(mission_id: str):
    if mission_id not in missions:
        fixture = FIXTURES / f"{mission_id}.json"
        if fixture.exists():
            missions[mission_id] = _load_fixture(f"{mission_id}.json")
    if mission_id not in missions:
        raise HTTPException(404, "Mission not found")
    return missions[mission_id]


@app.post("/missions")
def create_mission(payload: MissionProfile):
    mission = payload.model_dump()
    missions[mission["mission_id"]] = mission
    append_event(events, "mission_created", {"mission_id": mission["mission_id"]})
    return mission


@app.post("/missions/{mission_id}/evaluate")
def evaluate(mission_id: str, request: EvaluateRequest):
    mission = get_mission(mission_id)
    try:
        result = evaluate_mission(mission, request.profile_id)
    except ValueError as exc:
        raise HTTPException(400, str(exc))
    evaluations[mission_id] = result
    append_event(events, "mission_evaluated", {"mission_id": mission_id, "profile_id": request.profile_id})
    return result


@app.post("/missions/{mission_id}/findings/{finding_id}/decision")
def decision(mission_id: str, finding_id: str, request: DecisionRequest):
    evaluation = evaluations.get(mission_id)
    if not evaluation or not any(f["finding_id"] == finding_id for f in evaluation["findings"]):
        raise HTTPException(404, "Evaluate mission and select an existing finding first")
    item = {"finding_id": finding_id, **request.model_dump()}
    reviews[finding_id] = item
    append_event(events, "review_decision", item)
    return item


@app.post("/missions/{mission_id}/counterfactual")
def counterfactual(mission_id: str, request: CounterfactualRequest):
    evaluation = evaluations.get(mission_id)
    if not evaluation:
        raise HTTPException(409, "Evaluate mission first")
    result = run_counterfactual(
        get_mission(mission_id), evaluation["profile_id"], request.finding_id, request.lever, request.proposed_value
    )
    append_event(events, "counterfactual_generated", result)
    return result


@app.get("/provenance")
def provenance():
    return {"events": events, "verification": verify_chain(events)}


@app.get("/export/{mission_id}")
def export_packet(mission_id: str):
    evaluation = evaluations.get(mission_id)
    if not evaluation:
        raise HTTPException(409, "Evaluate mission first")
    missing = [f["finding_id"] for f in evaluation["findings"] if f["finding_id"] not in reviews]
    if missing:
        raise HTTPException(423, detail={"code": "EXPORT_LOCKED", "unreviewed_findings": missing})
    return generate_packet(get_mission(mission_id), evaluation, list(reviews.values()))


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
    append_event(events, "field_updated", {
        "mission_id": mission_id, "field": field_name, "value": request.value, "human_confirmed": request.human_confirmed
    })
    return {"ok": True, "field": field_name, "mission_id": mission_id}


@app.patch("/fields/{field_id}")
def update_field_by_id(field_id: str, request: FieldUpdateRequest, mission_id: str | None = None):
    target_mission = mission_id or "mission_complete"
    return update_field(target_mission, field_id, request)


# --- T002 Artifact Upload and Extraction Fallback Endpoints ---

@app.post("/missions/{mission_id}/artifacts", response_model=ArtifactRecord)
async def upload_artifact(mission_id: str, file: UploadFile = File(...)):
    """Upload a synthetic mission evidence document (TXT, PDF, JSON) with SHA-256 verification."""
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

    artifacts_storage[art_id] = {
        "record": record.model_dump(),
        "content": content,
        "mission_id": mission_id,
    }

    mission_artifacts = m.setdefault("artifacts", [])
    mission_artifacts.append(record.model_dump())

    append_event(events, "artifact_uploaded", {
        "artifact_id": art_id,
        "mission_id": mission_id,
        "filename": filename,
        "sha256": sha256_hash,
        "size_bytes": len(content),
    })

    return record


@app.get("/artifacts/{artifact_id}")
def get_artifact(artifact_id: str):
    if artifact_id not in artifacts_storage:
        raise HTTPException(404, "Artifact not found")
    return artifacts_storage[artifact_id]["record"]


@app.post("/artifacts/{artifact_id}/extract", response_model=ExtractionResponse)
def extract_artifact(artifact_id: str):
    """Extract candidate fields from artifact with human_confirmed=false."""
    if artifact_id not in artifacts_storage:
        raise HTTPException(404, "Artifact not found")

    art_entry = artifacts_storage[artifact_id]
    record = art_entry["record"]
    mission_id = art_entry["mission_id"]
    m = get_mission(mission_id)

    try:
        pages = extract_text_from_bytes(art_entry["content"], record["filename"], record.get("media_type", ""))
    except Exception as exc:
        return ExtractionResponse(
            artifact_id=artifact_id,
            mission_id=mission_id,
            status="NOT_EVALUATED",
            extracted_fields=[],
            warning=SYNTHETIC_WARNING,
            message=f"Parser failure: {str(exc)}"
        )

    candidates = extract_candidate_fields(pages)

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
        # Crucial for acceptance criterion 4: must remain False until confirmed
        cand_dict["human_confirmed"] = False
        m_fields.append(cand_dict)

    append_event(events, "artifact_extracted", {
        "artifact_id": artifact_id,
        "mission_id": mission_id,
        "extracted_count": len(candidates),
        "fields": [c.field for c in candidates],
    })

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
    missions.clear()
    reviews.clear()
    evaluations.clear()
    events.clear()
    artifacts_storage.clear()
    _ensure_fixtures_loaded()
    return {"ok": True}
