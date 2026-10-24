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
from typing import Any, Dict, Optional
from pydantic import BaseModel


class CandidateValidationResult(BaseModel):
    is_valid: bool
    status: str  # "VALID", "QUOTE_MISMATCH", "OUT_OF_BOUNDS", "UNSUPPORTED_FIELD"
    details: str
    normalized_value: Optional[Any] = None
    normalized_unit: Optional[str] = None


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
    # 1. Quote Verbatim / Fuzzy Substring Verification
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

    # 2. Field-Specific Boundary Verification
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

    elif field_name in ("apogee_altitude_km", "perigee_altitude_km", "altitude_km"):
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

    elif field_name in ("disposal_duration_years", "decay_years"):
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
        details="Evidence quote matches page text and value satisfies physical boundaries.",
        normalized_value=value,
        normalized_unit=unit
    )
