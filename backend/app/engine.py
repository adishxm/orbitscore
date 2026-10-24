from __future__ import annotations
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
PROFILE_FILE = ROOT / "fixtures" / "rules_profiles.json"
STATUSES = {"PASS_UNDER_PROFILE", "WARNING", "NEEDS_EVIDENCE", "CONFLICT", "NOT_EVALUATED"}


def load_profiles() -> dict[str, Any]:
    with PROFILE_FILE.open(encoding="utf-8") as f:
        return json.load(f)


def _confirmed(mission: dict, field: str) -> list[dict]:
    return [x for x in mission.get("fields", []) if x.get("field") == field and x.get("human_confirmed") is True]


def detect_conflicts(mission: dict) -> list[dict]:
    result = []
    for f in mission.get("fields", []):
        if not f.get("human_confirmed"):
            continue
        peers = [p for p in mission.get("fields", []) if p.get("field") == f.get("field") and p.get("human_confirmed") and p.get("value") != f.get("value")]
        if peers:
            result.append({"field": f["field"], "values": list(dict.fromkeys([f.get("value")] + [p.get("value") for p in peers])), "artifact_ids": list(dict.fromkeys([f.get("artifact_id")] + [p.get("artifact_id") for p in peers]))})
    unique = {}
    for c in result:
        unique[c["field"]] = c
    return list(unique.values())


def _compare(value: Any, op: str, threshold: Any) -> bool:
    if op == "outside_band": return not (threshold[0] <= value <= threshold[1])
    if op == "<": return value < threshold
    if op == "<=": return value <= threshold
    if op == ">": return value > threshold
    if op == ">=": return value >= threshold
    if op == "==": return value == threshold
    if op == "!=": return value != threshold
    if op == "is_true": return value is True
    if op == "is_false": return value is False
    if op == "exists": return value is not None
    return False


def evaluate_mission(mission: dict, profile_id: str) -> dict:
    catalog = load_profiles()
    profile = catalog["profiles"].get(profile_id)
    if profile is None:
        raise ValueError(f"Unknown profile: {profile_id}")
    conflicts = detect_conflicts(mission)
    conflict_fields = {c["field"] for c in conflicts}
    findings = []
    fcc_in_scope = True
    if profile_id == "fcc-22-74-inspired":
        altitudes = _confirmed(mission, "operational_altitude_km")
        modes = _confirmed(mission, "reentry_mode")
        altitude = altitudes[-1].get("value") if altitudes else mission.get("orbit", {}).get("altitude_km")
        mode = modes[-1].get("value") if modes else None
        fcc_in_scope = isinstance(altitude, (int, float)) and altitude < 2000 and mode == "uncontrolled"
    for rule in profile["rules"]:
        field = rule["evaluation_logic"]["field"]
        candidates = _confirmed(mission, field)
        common = {"finding_id": f"{mission['mission_id']}:{profile_id}:{rule['rule_id']}", "rule_id": rule["rule_id"], "profile_id": profile_id, "title": rule["title"], "critical_gap": rule["critical_gap"], "source_citation": rule["source_citation"], "remediation_lever": rule["remediation_lever"]}
        if profile_id == "fcc-22-74-inspired" and not fcc_in_scope:
            findings.append({**common, "status": "NOT_EVALUATED", "observed_value": None, "message": "Outside the configured FCC scope: covered LEO station below 2,000 km using uncontrolled atmospheric reentry."})
            continue
        if field in conflict_fields:
            findings.append({**common, "status": "CONFLICT", "observed_value": None, "message": "Confirmed evidence contains incompatible values; human reconciliation required."})
            continue
        if not candidates:
            findings.append({**common, "status": "NEEDS_EVIDENCE", "observed_value": None, "message": f"No human-confirmed evidence for {field}."})
            continue
        selected = candidates[-1]
        logic = rule["evaluation_logic"]
        observed = selected.get("value")
        if logic.get("operator") == "exists":
            passed = observed is not None
        elif logic.get("operator") in ("is_true", "is_false"):
            passed = _compare(observed, logic["operator"], logic.get("threshold"))
        else:
            try: passed = _compare(float(observed) if isinstance(logic.get("threshold"), (int, float)) else observed, logic["operator"], logic.get("threshold"))
            except (TypeError, ValueError): passed = False
        findings.append({**common, "status": "PASS_UNDER_PROFILE" if passed else "WARNING", "observed_value": observed, "unit": logic.get("unit"), "message": "Evidence satisfies configured profile logic." if passed else f"Observed value does not satisfy configured condition {logic['operator']} {logic.get('threshold')} {logic.get('unit','')}".strip(), "evidence_id": selected.get("artifact_id"), "locator": selected.get("locator")})
    evaluated = [f for f in findings if f["status"] != "NOT_EVALUATED"]
    gap_count = sum(f["status"] in ("NEEDS_EVIDENCE", "CONFLICT", "WARNING") for f in evaluated)
    critical = any(f["critical_gap"] and f["status"] in ("NEEDS_EVIDENCE", "CONFLICT", "WARNING") for f in evaluated)
    score = max(0, 100 - 12 * gap_count)
    band = "RED" if critical else ("AMBER" if gap_count else "GREEN")
    return {"mission_id": mission["mission_id"], "profile_id": profile_id, "profile_version": profile.get("version", "1.0.0"), "findings": findings, "conflicts": conflicts, "msri": {"score": score, "band": band, "critical_gap_cap_applied": critical, "disclaimer": "Prioritization aid only; not a safety certification or risk prediction."}}


def run_counterfactual(mission: dict, profile_id: str, finding_id: str, lever: str, value: Any) -> dict:
    before = evaluate_mission(mission, profile_id)
    target = next((f for f in before["findings"] if f["finding_id"] == finding_id), None)
    if target is None: raise ValueError("Finding not found")
    field = next(r["evaluation_logic"]["field"] for r in load_profiles()["profiles"][profile_id]["rules"] if r["rule_id"] == target["rule_id"])
    clone = json.loads(json.dumps(mission))
    match = next((x for x in clone.get("fields", []) if x.get("field") == field and x.get("human_confirmed")), None)
    if match:
        match["value"] = value
    else:
        clone.setdefault("fields", []).append({"field": field, "value": value, "human_confirmed": True, "artifact_id": "synthetic-counterfactual", "locator": {"kind": "synthetic"}})
    after = evaluate_mission(clone, profile_id)
    new = next(f for f in after["findings"] if f["rule_id"] == target["rule_id"])
    return {"suggestion_id": f"cf:{finding_id}", "finding_id": finding_id, "profile_id": profile_id, "lever": lever, "proposed_value": value, "before_status": target["status"], "after_status": new["status"], "synthetic": True, "disclaimer": "Illustrative synthetic counterfactual; not an operational recommendation."}
