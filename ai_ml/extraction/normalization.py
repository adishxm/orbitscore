"""
Domain Normalization Module for Spacecraft Parameters
Location: ai_ml/extraction/normalization.py
Strict Invariant:
Preserves original values and units while producing mathematically verified
normalized values with strict boundary checking.
"""

from __future__ import annotations
import math
import re
from typing import Any, Tuple


def normalize_mass(value: float, unit: str = "kg") -> Tuple[float, str]:
    """
    Normalize spacecraft mass to kilograms (kg).
    Rejects negative, zero, or non-finite mass values.
    """
    if not math.isfinite(value) or value <= 0:
        raise ValueError(f"Invalid spacecraft mass: {value}. Must be finite and positive.")

    u = unit.strip().lower()
    if u in ("kg", "kilogram", "kilograms"):
        return round(float(value), 4), "kg"
    elif u in ("g", "gram", "grams"):
        return round(float(value) / 1000.0, 4), "kg"
    elif u in ("t", "tonne", "tonnes", "metric ton"):
        return round(float(value) * 1000.0, 4), "kg"
    elif u in ("lb", "lbs", "pound", "pounds"):
        return round(float(value) * 0.45359237, 4), "kg"
    else:
        raise ValueError(f"Unrecognized mass unit: '{unit}'. Supported: kg, g, tonnes, lbs.")


def normalize_distance(value: float, unit: str = "km") -> Tuple[float, str]:
    """
    Normalize orbital distance/altitude to kilometers (km).
    Rejects negative or non-finite distances.
    """
    if not math.isfinite(value) or value < 0:
        raise ValueError(f"Invalid distance: {value}. Must be finite and non-negative.")

    u = unit.strip().lower()
    if u in ("km", "kilometer", "kilometers"):
        return round(float(value), 4), "km"
    elif u in ("m", "meter", "meters", "metre", "metres"):
        return round(float(value) / 1000.0, 4), "km"
    elif u in ("nmi", "nm", "nautical mile", "nautical miles"):
        return round(float(value) * 1.852, 4), "km"
    else:
        raise ValueError(f"Unrecognized distance unit: '{unit}'. Supported: km, m, nmi.")


def normalize_probability(value: Any) -> float:
    """
    Normalize a stated risk or probability expression into a float in [0.0, 1.0].
    Supports ratios ("1:25000", "1/10000"), scientific notation ("1e-5"), percentages ("94%"),
    and plain floating-point numbers.
    """
    if value is None:
        raise ValueError("Cannot normalize None probability.")

    if isinstance(value, (int, float)):
        val_f = float(value)
        if not math.isfinite(val_f) or val_f < 0.0 or val_f > 1.0:
            raise ValueError(f"Probability float out of range [0.0, 1.0]: {val_f}")
        return val_f

    val_str = str(value).strip().lower()

    # Ratio format: 1:25000 or 1/25000
    ratio_match = re.match(r"^(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)$", val_str)
    if ratio_match:
        num = float(ratio_match.group(1))
        denom = float(ratio_match.group(2))
        if denom == 0:
            raise ValueError(f"Division by zero in probability ratio: {val_str}")
        prob = num / denom
        if prob < 0.0 or prob > 1.0:
            raise ValueError(f"Calculated ratio out of range [0.0, 1.0]: {prob}")
        return prob

    # Percentage format: 94% or 94.5 %
    pct_match = re.match(r"^(\d+(?:\.\d+)?)\s*%$", val_str)
    if pct_match:
        pct_val = float(pct_match.group(1))
        prob = pct_val / 100.0
        if prob < 0.0 or prob > 1.0:
            raise ValueError(f"Percentage out of range [0%, 100%]: {val_str}")
        return round(prob, 6)

    # Scientific notation or plain decimal string
    try:
        val_f = float(val_str)
        if not math.isfinite(val_f) or val_f < 0.0 or val_f > 1.0:
            raise ValueError(f"Parsed probability out of range [0.0, 1.0]: {val_f}")
        return val_f
    except ValueError as err:
        raise ValueError(f"Unable to parse probability value: '{value}'") from err


def normalize_duration_years(value: float, unit: str = "year") -> float:
    """
    Normalize mission disposal / decay duration to calendar years.
    Rejects negative or non-finite durations.
    """
    if not math.isfinite(value) or value < 0:
        raise ValueError(f"Invalid duration: {value}. Must be finite and non-negative.")

    u = unit.strip().lower()
    if u in ("y", "yr", "yrs", "year", "years"):
        return round(float(value), 4)
    elif u in ("m", "mo", "mos", "month", "months"):
        return round(float(value) / 12.0, 4)
    elif u in ("d", "day", "days"):
        return round(float(value) / 365.25, 4)
    else:
        raise ValueError(f"Unrecognized duration unit: '{unit}'. Supported: years, months, days.")
