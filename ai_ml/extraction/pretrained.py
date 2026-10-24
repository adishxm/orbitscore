"""
Pretrained and Baseline Extraction Runner Module
Location: ai_ml/extraction/pretrained.py
Strict Invariant:
All extracted fields are emitted strictly as unconfirmed candidates (human_confirmed=False)
with validated verbatim source quotes and page locators.
Grounded quotes are decimal-safe and never fall back to unrelated page prefixes.
"""

from __future__ import annotations
import os
import re
from typing import Any, Dict, List, Optional
from ai_ml.schemas import AICandidateField
from ai_ml.datasets.documents import PageRecord
from ai_ml.extraction.validation import validate_candidate_evidence
from ai_ml.adaption_pipeline import extract_baseline_fields
from ai_ml.adapter import run_ai_candidate_extraction


class BoundedExtractionRunner:
    """
    Executes bounded extraction on document pages using deterministic heuristics
    or optional configured LLM adapters with mandatory quote validation.
    """
    def __init__(self, ai_enabled: Optional[bool] = None) -> None:
        self.ai_enabled = (
            ai_enabled
            if ai_enabled is not None
            else os.getenv("ORBIT_AI_ENABLED", "0").lower() in ("1", "true", "yes")
        )

    def extract_from_pages(
        self,
        pages: List[PageRecord],
        target_fields: Optional[List[str]] = None
    ) -> List[AICandidateField]:
        """Extract candidate fields from a collection of document pages."""
        candidates: List[AICandidateField] = []

        # If AI is enabled, execute pretrained/adapter extraction first
        if self.ai_enabled:
            pages_tuples = [(p.page_number, p.text_content) for p in pages]
            ai_extracted = run_ai_candidate_extraction(pages_tuples, fallback_fn=None)
            for cand in ai_extracted:
                if target_fields and cand.field not in target_fields:
                    continue
                # Map page number to source_id
                page_match = next((p for p in pages if p.page_number == cand.locator.get("page")), None)
                if page_match:
                    cand.locator["source_id"] = page_match.source_id
                candidates.append(cand)

        # Baseline deterministic extraction
        for page in pages:
            raw_text = page.text_content
            if not raw_text:
                continue

            extracted_dict = extract_baseline_fields(raw_text)

            for field_name, value in extracted_dict.items():
                if target_fields and field_name not in target_fields:
                    continue

                # Locate verbatim sentence containing the value without breaking on decimals
                quote = self._find_supporting_sentence(raw_text, str(value))
                if not quote:
                    # Invariant: Never substitute an arbitrary page prefix when value is ungrounded
                    continue

                # Validate candidate quote against page text and value
                val_res = validate_candidate_evidence(
                    field_name=field_name,
                    value=value,
                    quote=quote,
                    raw_page_text=raw_text
                )

                if val_res.is_valid:
                    candidate = AICandidateField(
                        field=field_name,
                        value=value,
                        unit=val_res.normalized_unit,
                        locator={
                            "source_id": page.source_id,
                            "page": page.page_number,
                            "quote": quote
                        },
                        method="baseline_deterministic_extractor",
                        confidence_tier="HIGH",
                        human_confirmed=False  # Strict requirement: always unconfirmed!
                    )
                    candidates.append(candidate)

        return candidates

    @staticmethod
    def _find_supporting_sentence(text: str, target: str) -> Optional[str]:
        """
        Locate the sentence containing the target without breaking on decimal numbers.
        Ensures exact grounding and never extracts unrelated page prefixes.
        """
        if not target or not text:
            return None

        text_clean = text.replace("\n", " ")
        target_lower = target.lower()
        text_lower = text_clean.lower()

        idx = text_lower.find(target_lower)
        if idx == -1:
            return None

        # Search backward for sentence boundary (period not between digits)
        start = 0
        for i in range(idx - 1, -1, -1):
            if text_clean[i] in ".!?":
                # Check if it's a decimal point inside a number
                is_decimal = (
                    i > 0
                    and i + 1 < len(text_clean)
                    and text_clean[i - 1].isdigit()
                    and text_clean[i + 1].isdigit()
                )
                if not is_decimal:
                    start = i + 1
                    break

        # Search forward for sentence boundary
        end = len(text_clean)
        for i in range(idx + len(target), len(text_clean)):
            if text_clean[i] in ".!?":
                is_decimal = (
                    i > 0
                    and i + 1 < len(text_clean)
                    and text_clean[i - 1].isdigit()
                    and text_clean[i + 1].isdigit()
                )
                if not is_decimal:
                    end = i + 1
                    break

        sentence = text_clean[start:end].strip()
        if target_lower in sentence.lower():
            return sentence
        return None
