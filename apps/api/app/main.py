from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import json
from .schemas import MissionProfile, EvaluateRequest, DecisionRequest, CounterfactualRequest
from .engine import evaluate_mission, run_counterfactual, load_profiles
from .provenance import append_event, verify_chain
from .export import generate_packet

app = FastAPI(title="OrbitScore API", version="1.0.0", description="Evidence pre-review decision support; not certification.")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
ROOT = Path(__file__).resolve().parents[3]
FIXTURES = ROOT / "fixtures"
missions: dict[str, dict] = {}
reviews: dict[str, dict] = {}
evaluations: dict[str, dict] = {}
events: list[dict] = []

from .schemas import MissionProfile, EvaluateRequest, DecisionRequest, CounterfactualRequest, FieldUpdateRequest

def _load_fixture(name: str) -> dict:
    with (FIXTURES / name).open(encoding="utf-8") as f: return json.load(f)

def _ensure_fixtures_loaded():
    for f in FIXTURES.glob("mission_*.json"):
        mid = f.stem
        if mid not in missions:
            try: missions[mid] = _load_fixture(f.name)
            except Exception: pass

@app.get("/health")
def health(): return {"ok": True, "version": app.version}

@app.get("/profiles")
def profiles(): return load_profiles()

@app.get("/missions")
def list_missions():
    _ensure_fixtures_loaded()
    return list(missions.values())

@app.get("/missions/{mission_id}")
def get_mission(mission_id: str):
    if mission_id not in missions:
        fixture = FIXTURES / f"{mission_id}.json"
        if fixture.exists(): missions[mission_id] = _load_fixture(f"{mission_id}.json")
    if mission_id not in missions: raise HTTPException(404, "Mission not found")
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
    try: result = evaluate_mission(mission, request.profile_id)
    except ValueError as exc: raise HTTPException(400, str(exc))
    evaluations[mission_id] = result
    append_event(events, "mission_evaluated", {"mission_id": mission_id, "profile_id": request.profile_id})
    return result

@app.post("/missions/{mission_id}/findings/{finding_id}/decision")
def decision(mission_id: str, finding_id: str, request: DecisionRequest):
    evaluation = evaluations.get(mission_id)
    if not evaluation or not any(f["finding_id"] == finding_id for f in evaluation["findings"]): raise HTTPException(404, "Evaluate mission and select an existing finding first")
    item = {"finding_id": finding_id, **request.model_dump()}
    reviews[finding_id] = item
    append_event(events, "review_decision", item)
    return item

@app.post("/missions/{mission_id}/counterfactual")
def counterfactual(mission_id: str, request: CounterfactualRequest):
    evaluation = evaluations.get(mission_id)
    if not evaluation: raise HTTPException(409, "Evaluate mission first")
    result = run_counterfactual(get_mission(mission_id), evaluation["profile_id"], request.finding_id, request.lever, request.proposed_value)
    append_event(events, "counterfactual_generated", result)
    return result

@app.get("/provenance")
def provenance(): return {"events": events, "verification": verify_chain(events)}

@app.get("/export/{mission_id}")
def export_packet(mission_id: str):
    evaluation = evaluations.get(mission_id)
    if not evaluation: raise HTTPException(409, "Evaluate mission first")
    missing = [f["finding_id"] for f in evaluation["findings"] if f["finding_id"] not in reviews]
    if missing: raise HTTPException(423, detail={"code": "EXPORT_LOCKED", "unreviewed_findings": missing})
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
    append_event(events, "field_updated", {"mission_id": mission_id, "field": field_name, "value": request.value, "human_confirmed": request.human_confirmed})
    return {"ok": True, "field": field_name, "mission_id": mission_id}

@app.post("/reset")
def reset_demo():
    missions.clear()
    reviews.clear()
    evaluations.clear()
    events.clear()
    _ensure_fixtures_loaded()
    return {"ok": True}

