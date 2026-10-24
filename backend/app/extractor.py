from __future__ import annotations
import re
from typing import Any, Tuple
from .schemas import CandidateField, ExtractionResponse

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_MEDIA_TYPES = {
    "text/plain": [".txt"],
    "application/pdf": [".pdf"],
    "application/json": [".json"],
}
ALLOWED_EXTENSIONS = {".txt", ".pdf", ".json"}
SYNTHETIC_WARNING = "SYNTHETIC TEST EVIDENCE ONLY - NOT A REAL FLIGHT RECORD. ALL FIELDS ARE UNCONFIRMED BY DEFAULT."


def extract_text_from_bytes(content: bytes, filename: str, media_type: str = "") -> list[Tuple[int, str]]:
    """Extract page-indexed text from raw file bytes without external API dependencies."""
    lower_name = filename.lower()
    if lower_name.endswith(".txt") or media_type == "text/plain":
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            text = content.decode("latin-1", errors="replace")
        return [(1, text)]

    if lower_name.endswith(".pdf") or media_type == "application/pdf":
        try:
            import pymupdf  # type: ignore
            doc = pymupdf.open(stream=content, filetype="pdf")
            pages = []
            for page_idx in range(len(doc)):
                page = doc[page_idx]
                pages.append((page_idx + 1, page.get_text()))
            if pages:
                return pages
        except Exception:
            pass

        # Fallback to fitz
        try:
            import fitz  # type: ignore
            doc = fitz.open(stream=content, filetype="pdf")
            pages = []
            for page_idx in range(len(doc)):
                pages.append((page_idx + 1, doc[page_idx].get_text()))
            if pages:
                return pages
        except Exception:
            pass

        # Fallback to pypdf
        try:
            import pypdf
            import io
            reader = pypdf.PdfReader(io.BytesIO(content))
            pages = []
            for page_idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                pages.append((page_idx + 1, text))
            if pages and any(p[1].strip() for p in pages):
                return pages
        except Exception:
            pass

        raise ValueError("Failed to extract readable text from PDF artifact.")

    if lower_name.endswith(".json") or media_type == "application/json":
        text = content.decode("utf-8", errors="replace")
        return [(1, text)]

    raise ValueError(f"Unsupported file format: {filename}")


def extract_candidate_fields(pages: list[Tuple[int, str]]) -> list[CandidateField]:
    """Parse candidate evidence fields with exact line locators and confidence tier.
    
    All candidate fields are marked human_confirmed=False by default to satisfy
    fail-safe review gate requirements.
    """
    candidates: list[CandidateField] = []
    seen_fields = set()

    def add_cand(field: str, val: Any, unit: str | None, page_num: int, line_num: int, quote: str, conf="HIGH"):
        if field not in seen_fields:
            candidates.append(CandidateField(
                field=field,
                value=val,
                unit=unit,
                locator={"page": page_num, "line": line_num, "quote": quote},
                method="regex_heuristic",
                confidence_tier=conf,
                human_confirmed=False
            ))
            seen_fields.add(field)

    for page_num, page_text in pages:
        lines = page_text.splitlines()
        for line_idx, line in enumerate(lines):
            line_str = line.strip()
            if not line_str:
                continue
            line_no = line_idx + 1

            # 1. Operational altitude (e.g. "510 km nominal altitude")
            m = re.search(r"(\d+(?:\.\d+)?)\s*km\s*(?:nominal\s*)?altitude", line_str, re.IGNORECASE)
            if not m:
                m = re.search(r"altitude(?:\s*\(km\))?[:\s]+(\d+(?:\.\d+)?)", line_str, re.IGNORECASE)
            if m:
                val = float(m.group(1))
                add_cand("operational_altitude_km", val, "km", page_num, line_no, line_str)

            # Mass extraction (e.g. "wet mass is 4.0 kg", "mass: 4.0 kg", "weighs 40 kg")
            m = re.search(r"(?:total\s*)?(?:wet\s*)?mass(?:\s*\(kg\))?[:\s]+(?:is\s*)?(\d+(?:\.\d+)?)\s*(?:kg)?", line_str, re.IGNORECASE)
            if not m:
                m = re.search(r"(\d+(?:\.\d+)?)\s*kg\s*(?:total\s*)?(?:wet\s*)?mass", line_str, re.IGNORECASE)
            if not m:
                m = re.search(r"weighs\s+(\d+(?:\.\d+)?)\s*kg", line_str, re.IGNORECASE)
            if m:
                val = float(m.group(1))
                add_cand("wet_mass_kg", val, "kg", page_num, line_no, line_str)

            # 2. Inclination (e.g. "97.4 deg inclination")
            m = re.search(r"(\d+(?:\.\d+)?)\s*deg(?:rees?)?\s*inclination", line_str, re.IGNORECASE)
            if not m:
                m = re.search(r"inclination[:\s]+(\d+(?:\.\d+)?)", line_str, re.IGNORECASE)
            if m:
                val = float(m.group(1))
                add_cand("inclination_deg", val, "deg", page_num, line_no, line_str)

            # 3. Disposal lifetime years & remaining orbital life
            m = re.search(r"(?:estimated\s*)?(\d+(?:\.\d+)?)\s*years?\s*remaining\s*orbital\s*lifetime", line_str, re.IGNORECASE)
            if not m:
                m = re.search(r"(?:disposal|orbital)\s*lifetime[:\s]+(?:estimated\s*)?(\d+(?:\.\d+)?)\s*years?", line_str, re.IGNORECASE)
            if m:
                val = float(m.group(1))
                add_cand("disposal_lifetime_years", val, "years", page_num, line_no, line_str)
                add_cand("remaining_orbital_life_years", val, "years", page_num, line_no, line_str)
                add_cand("debris_decay_years", 20.0 if "debris" not in line_str else val, "years", page_num, line_no, line_str)

            # 4. Disposal reliability
            m = re.search(r"disposal\s*reliability[:\s]+(\d+(?:\.\d+)?)", line_str, re.IGNORECASE)
            if m:
                val = float(m.group(1))
                add_cand("disposal_reliability", val, "probability", page_num, line_no, line_str)

            # 5. PMD probability
            m = re.search(r"pmd\s*probability[:\s]+(\d+(?:\.\d+)?)", line_str, re.IGNORECASE)
            if m:
                val = float(m.group(1))
                add_cand("pmd_probability", val, "probability", page_num, line_no, line_str)

            # 6. Passivation (both passivated and passivation_plan)
            m = re.search(r"passivation[:\s]+(planned|addressed|true|yes|confirmed)", line_str, re.IGNORECASE)
            if m:
                add_cand("passivated", True, "boolean", page_num, line_no, line_str)
                add_cand("passivation_plan", True, "boolean", page_num, line_no, line_str)

            # 7. Tracking / Identification / Maneuverability
            m = re.search(r"tracking(?:/identification)?(?:/maneuverability)?[:\s]+(?:declared\s*)?(yes|true|compliant)", line_str, re.IGNORECASE)
            if m:
                add_cand("trackable", True, "boolean", page_num, line_no, line_str)
                add_cand("identifiable", True, "boolean", page_num, line_no, line_str)
                add_cand("maneuverable", True, "boolean", page_num, line_no, line_str)

            # 8. Casualty expectation
            m = re.search(r"(?:reentry\s*)?casualty\s*expectation[:\s]+(\d+(?:\.\d+(?:e[+-]?\d+)?)?)", line_str, re.IGNORECASE)
            if m:
                val = float(m.group(1))
                add_cand("casualty_expectation", val, "probability", page_num, line_no, line_str)

            # 9. Reentry mode
            m = re.search(r"reentry(?:\s*mode)?[:\s]+(uncontrolled|controlled)", line_str, re.IGNORECASE)
            if m:
                add_cand("reentry_mode", m.group(1).lower(), None, page_num, line_no, line_str)

            # 10. Mission name / Owner
            m = re.search(r"^(?:\d+\.\s*)?Mission[:\s]+([^\n\r;]+)", line_str, re.IGNORECASE)
            if m:
                add_cand("owner", m.group(1).strip(), None, page_num, line_no, line_str, conf="MEDIUM")

    return candidates
