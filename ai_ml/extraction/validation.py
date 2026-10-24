"""
Candidate Evidence and Extraction Validation Module
Location: ai_ml/extraction/validation.py
Strict Invariant:
Validates that extracted candidate fields strictly correspond to verbatim or normalized
quotes within the source document, and verifies physical/regulatory boundaries.
"""

from __future__ import annotations
import math
import re
from typing import Any, Dict, Optional, Set
from pydantic import BaseModel


class CandidateValidationResult(BaseModel):
    is_valid: bool
    status: str  # "VALID", "QUOTE_MISMATCH", "OUT_OF_BOUNDS", "UNSUPPORTED_FIELD"
    details: str
    normalized_value: Optional[Any] = None
    normalized_unit: Optional[str] = None


ALLOWED_MISSION_FIELDS: Set[str] = {
    "wet_mass_kg",
    "dry_mass_kg",
    "mass_kg",
    "operational_altitude_km",
    "perigee_altitude_km",
    "apogee_altitude_km",
    "altitude_km",
    "inclination_deg",
    "disposal_duration_years",
    "decay_years",
    "debris_decay_years",
    "disposal_lifetime_years",
    "passivation_plan",
    "passivated",
    "passivation_method",
    "trackable",
    "identifiable",
    "maneuverable",
    "casualty_expectation",
    "human_casualty_risk",
    "reentry_mode",
    "pmd_probability",
    "disposal_reliability",
    "energy_storage_joules",
}


def _quote_supports_value(value: Any, quote: str) -> bool:
    """Verify that the supporting quote actually contains/supports the extracted value."""
    if value is None or not quote:
        return False

    val_str = str(value).strip().lower()
    quote_lower = quote.lower()

    # Exact string occurrence
    if val_str in quote_lower:
        return True

    # Check numeric representation
    try:
        val_f = float(value)
        # Find all numbers in quote, including scientific notation
        matches = re.findall(r"[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?", quote)
        for m in matches:
            try:
                m_f = float(m)
                if abs(m_f - val_f) <= 1e-4 * max(abs(val_f), 1.0) or abs(m_f - val_f) < 1e-6:
                    return True
            except ValueError:
                continue
    except (ValueError, TypeError):
        pass

    # Check boolean representation
    if isinstance(value, bool):
        if value:
            return any(w in quote_lower for w in ["passivat", "true", "yes", "compli", "conform", "deplet", "track", "maneuver"])
        else:
            return any(w in quote_lower for w in ["no", "not", "false", "unpassivat", "non-", "fail"])

    return False


def validate_candidate_evidence(
    field_name: str,
    value: Any,
    quote: str,
    raw_page_text: str,
    unit: Optional[str] = None
) -> CandidateValidationResult:
    """
    Rigorously validate an extracted candidate against its quoted evidence and page text.
    """
    # 0. Field Whitelist Verification
    if field_name not in ALLOWED_MISSION_FIELDS:
        return CandidateValidationResult(
            is_valid=False,
            status="UNSUPPORTED_FIELD",
            details=f"Field '{field_name}' is not in allowed mission schema whitelist."
        )

    # 1. Quote Verbatim / Substring Verification against page
    clean_quote = " ".join(quote.strip().split())
    clean_page = " ".join(raw_page_text.strip().split())

    if not clean_quote:
        return CandidateValidationResult(
            is_valid=False,
            status="QUOTE_MISMATCH",
            details="Supporting quote is empty."
        )

    if clean_quote.lower() not in clean_page.lower():
        return CandidateValidationResult(
            is_valid=False,
            status="QUOTE_MISMATCH",
            details=f"Quote '{quote[:40]}...' was not found in source page text."
        )

    # 2. Check that the quote actually supports the extracted value
    if not _quote_supports_value(value, clean_quote):
        return CandidateValidationResult(
            is_valid=False,
            status="QUOTE_MISMATCH",
            details=f"Extracted value '{value}' is not supported by quote: '{quote[:60]}...'"
        )

    # 3. Field-Specific Boundary Verification
    if field_name in ("wet_mass_kg", "dry_mass_kg", "mass_kg"):
        try:
            val_f = float(value)
            if not math.isfinite(val_f) or val_f <= 0:
                return CandidateValidationResult(
                    is_valid=False,
                    status="OUT_OF_BOUNDS",
                    details=f"Spacecraft mass {val_f} must be positive and finite."
                )
        except (ValueError, TypeError):
            return CandidateValidationResult(
                is_valid=False,
                status="OUT_OF_BOUNDS",
                details=f"Cannot parse mass value: {value}"
            )

    elif field_name in ("apogee_altitude_km", "perigee_altitude_km", "altitude_km", "operational_altitude_km"):
        try:
            val_f = float(value)
            if not math.isfinite(val_f) or val_f < 100.0 or val_f > 50000.0:
                return CandidateValidationResult(
                    is_valid=False,
                    status="OUT_OF_BOUNDS",
                    details=f"Orbital altitude {val_f} km must be between 100 km and 50,000 km."
                )
        except (ValueError, TypeError):
            return CandidateValidationResult(
                is_valid=False,
                status="OUT_OF_BOUNDS",
                details=f"Cannot parse altitude value: {value}"
            )

    elif field_name in ("disposal_duration_years", "decay_years", "disposal_lifetime_years"):
        try:
            val_f = float(value)
            if not math.isfinite(val_f) or val_f < 0:
                return CandidateValidationResult(
                    is_valid=False,
                    status="OUT_OF_BOUNDS",
                    details=f"Disposal lifetime {val_f} years cannot be negative."
                )
        except (ValueError, TypeError):
            return CandidateValidationResult(
                is_valid=False,
                status="OUT_OF_BOUNDS",
                details=f"Cannot parse duration value: {value}"
            )

    elif field_name == "inclination_deg":
        try:
            val_f = float(value)
            if not math.isfinite(val_f) or val_f < 0.0 or val_f > 180.0:
                return CandidateValidationResult(
                    is_valid=False,
                    status="OUT_OF_BOUNDS",
                    details=f"Orbital inclination {val_f} deg must be between 0 and 180 degrees."
                )
        except (ValueError, TypeError):
            return CandidateValidationResult(
                is_valid=False,
                status="OUT_OF_BOUNDS",
                details=f"Cannot parse inclination value: {value}"
            )

    return CandidateValidationResult(
        is_valid=True,
        status="VALID",
        details="Evidence quote matches page text, value is grounded in quote, and satisfies physical boundaries.",
        normalized_value=value,
        normalized_unit=unit
    )
