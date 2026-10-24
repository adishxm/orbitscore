"""
Pretrained and Baseline Extraction Runner Module
Location: ai_ml/extraction/pretrained.py
Strict Invariant:
All extracted fields are emitted strictly as unconfirmed candidates (human_confirmed=False)
with validated verbatim source quotes and page locators.
"""

from __future__ import annotations
import os
from typing import Any, Dict, List, Optional
from ai_ml.schemas import AICandidateField
from ai_ml.datasets.documents import PageRecord
from ai_ml.extraction.validation import validate_candidate_evidence
from ai_ml.adaption_pipeline import extract_baseline_fields


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

        for page in pages:
            raw_text = page.text_content
            if not raw_text:
                continue

            extracted_dict = extract_baseline_fields(raw_text)

            for field_name, value in extracted_dict.items():
                if target_fields and field_name not in target_fields:
                    continue

                # Locate verbatim sentence containing the value
                quote = self._find_supporting_sentence(raw_text, str(value))
                if not quote:
                    # Fallback to a snippet
                    quote = raw_text[:80].strip()

                # Validate candidate quote against page text
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
                        human_confirmed=False  # Strict requirement
                    )
                    candidates.append(candidate)

        return candidates

    @staticmethod
    def _find_supporting_sentence(text: str, target: str) -> Optional[str]:
        """Find the sentence containing the target string."""
        sentences = [s.strip() for s in text.replace("\n", " ").split(".") if s.strip()]
        for s in sentences:
            if target.lower() in s.lower():
                return s + "."
        return None
