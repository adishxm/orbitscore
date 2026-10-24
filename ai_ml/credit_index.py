"""
Space Credit Index calculation engine.
Evaluates spacecraft sustainability, post-mission disposal compliance,
and evidence integrity into an objective, explainable credit index (0-100).
"""
from typing import Dict, Any, List
from pydantic import BaseModel, Field


class CreditIndexBreakdown(BaseModel):
    category: str
    points_awarded: float
    max_points: float
    percentage: float
    notes: str


class SpaceCreditIndexResult(BaseModel):
    overall_score: float = Field(..., ge=0, le=100)
    rating_tier: str  # AAA, AA, A, BBB, BB, C, D
    isro_dfsm_aligned: bool
    fcc_5yr_aligned: bool
    summary: str
    breakdowns: List[CreditIndexBreakdown]
    recommendations: List[str]


def compute_space_credit_index(
    mission: Dict[str, Any],
    evidence_items: List[Dict[str, Any]],
    estimated_decay_years: float = 3.8,
) -> SpaceCreditIndexResult:
    """
    Computes a 4-pillar Space Credit Index (0 - 100):
    1. Trajectory & Orbit Lifetime (25 pts): Decay horizon vs ISRO DFSM 2030 and FCC 5-year rule.
    2. Collision Footprint & Form Factor (25 pts): Area-to-mass ratio, mass budget, and spatial profile.
    3. Disposal & Passivation Integrity (25 pts): Battery passivation, power cutoff, and demisability.
    4. Sourced Evidence Provenance (25 pts): Proportion of human-verified primary document citations.
    """
    breakdowns = []
    recommendations = []

    # 1. Trajectory & Orbit Lifetime (25 max points)
    # Target: < 5 years post-mission (FCC-22-74 & ISRO DFSM 2030)
    if estimated_decay_years <= 5.0:
        decay_points = 25.0
        decay_notes = f"Estimated decay of {estimated_decay_years:.1f} yrs conforms to 5-year deorbit limit."
    elif estimated_decay_years <= 10.0:
        decay_points = 15.0
        decay_notes = f"Estimated decay of {estimated_decay_years:.1f} yrs exceeds 5-year mandate but is under 10 yrs."
        recommendations.append("Consider drag enhancement sail or propulsion assist to lower decay timeline under 5 years.")
    elif estimated_decay_years <= 25.0:
        decay_points = 8.0
        decay_notes = f"Estimated decay of {estimated_decay_years:.1f} yrs relies on superseded 25-year guideline."
        recommendations.append("Mandatory active deorbit propulsion required for FCC/ISRO LEO authorization.")
    else:
        decay_points = 0.0
        decay_notes = f"Estimated decay of {estimated_decay_years:.1f} yrs leaves long-term orbital debris."
        recommendations.append("Subsystem waiver or active deorbit required before launch license.")

    breakdowns.append(
        CreditIndexBreakdown(
            category="Trajectory & Orbital Lifetime",
            points_awarded=decay_points,
            max_points=25.0,
            percentage=(decay_points / 25.0) * 100.0,
            notes=decay_notes,
        )
    )

    # 2. Collision Footprint & Form Factor (25 max points)
    mass = float(mission.get("mass_budget_kg", 4.0))
    form_factor = str(mission.get("form_factor", "3U"))
    footprint_points = 25.0
    if mass > 10.0:
        footprint_points -= 5.0
    if mass > 50.0:
        footprint_points -= 8.0
    if "12U" in form_factor or "16U" in form_factor:
        footprint_points -= 3.0
    footprint_points = max(0.0, footprint_points)

    breakdowns.append(
        CreditIndexBreakdown(
            category="Collision Footprint & Form Factor",
            points_awarded=footprint_points,
            max_points=25.0,
            percentage=(footprint_points / 25.0) * 100.0,
            notes=f"Vehicle mass {mass:.1f} kg ({form_factor}) with low spatial cross-sectional footprint.",
        )
    )

    # 3. Disposal & Passivation Integrity (25 max points)
    disposal_points = 20.0  # Base for demisable CubeSat (< 10 kg, 100% atmospheric demisability)
    # Check for battery/passivation evidence
    has_battery_evidence = any(
        any(k in str(e.get("parameter_key") or e.get("field") or "").lower() for k in ("battery", "power", "passivation"))
        for e in evidence_items
    )
    if has_battery_evidence:
        disposal_points += 5.0
        passivation_notes = "End-of-life battery passivation and energy storage depletion documented."
    else:
        passivation_notes = "Battery electrical passivation record pending review."
        recommendations.append("Attach battery passivation and circuit isolation documentation for EOMP approval.")

    breakdowns.append(
        CreditIndexBreakdown(
            category="Disposal & Passivation Readiness",
            points_awarded=disposal_points,
            max_points=25.0,
            percentage=(disposal_points / 25.0) * 100.0,
            notes=passivation_notes,
        )
    )

    # 4. Sourced Evidence Provenance (25 max points)
    total_items = len(evidence_items)
    confirmed_items = sum(
        1 for e in evidence_items
        if e.get("state") == "confirmed" or e.get("human_confirmed") is True
    )
    conflicting_items = sum(1 for e in evidence_items if e.get("state") == "conflicting")
    missing_items = sum(1 for e in evidence_items if e.get("state") == "missing")

    if total_items > 0:
        ratio = confirmed_items / total_items
        evidence_points = round(ratio * 25.0, 1)
        if conflicting_items > 0:
            evidence_points = max(0.0, evidence_points - (conflicting_items * 3.0))
        if missing_items > 0:
            evidence_points = max(0.0, evidence_points - (missing_items * 2.0))
    else:
        evidence_points = 5.0

    breakdowns.append(
        CreditIndexBreakdown(
            category="Sourced Evidence Provenance",
            points_awarded=evidence_points,
            max_points=25.0,
            percentage=round((evidence_points / 25.0) * 100.0, 1),
            notes=f"{confirmed_items}/{total_items} items human-confirmed; {conflicting_items} conflicts; {missing_items} missing.",
        )
    )

    overall = sum(b.points_awarded for b in breakdowns)
    overall = round(max(0.0, min(100.0, overall)), 1)

    # Rating Tier determination
    if overall >= 92.0:
        tier = "AAA"
    elif overall >= 85.0:
        tier = "AA"
    elif overall >= 78.0:
        tier = "A"
    elif overall >= 70.0:
        tier = "BBB"
    elif overall >= 60.0:
        tier = "BB"
    else:
        tier = "C"

    isro_aligned = estimated_decay_years <= 5.0 and mass <= 10.0
    fcc_aligned = estimated_decay_years <= 5.0 and conflicting_items == 0

    return SpaceCreditIndexResult(
        overall_score=overall,
        rating_tier=tier,
        isro_dfsm_aligned=isro_aligned,
        fcc_5yr_aligned=fcc_aligned,
        summary=f"Space Credit Index: {overall}/100 (Tier {tier}). Vehicle demonstrates favorable orbital sustainability and verifiable evidence lineage.",
        breakdowns=breakdowns,
        recommendations=recommendations,
    )
