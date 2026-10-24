from __future__ import annotations
import logging
from typing import Any, Tuple, Optional

from ai_ml import (
    is_ai_enabled,
    run_ai_candidate_extraction as _run_ai_extraction,
    AI_TEMPERATURE,
    AI_TIMEOUT_SECONDS,
    AI_MODEL_NAME,
    AIFieldExtraction,
    AIResponseSchema,
)
from .schemas import CandidateField
from .extractor import extract_candidate_fields, SYNTHETIC_WARNING

logger = logging.getLogger(__name__)


def run_ai_candidate_extraction(
    pages: list[Tuple[int, str]],
    allow_external: bool = False
) -> list[CandidateField]:
    """Execute AI extraction delegating to ai_ml package with deterministic fallback.
    
    Invariants enforced:
    1. Adapter never writes final review statuses or decisions.
    2. Extracted fields strictly have human_confirmed=False.
    3. Preserves deterministic fallback when AI is disabled, unpermitted, or fails.
    4. Explicit document consent (allow_external=True) strictly required before sending bytes externally.
    """
    if not allow_external or not is_ai_enabled():
        return extract_candidate_fields(pages)

    raw_candidates = _run_ai_extraction(pages, fallback_fn=extract_candidate_fields)
    candidates: list[CandidateField] = []
    for item in raw_candidates:
        if isinstance(item, CandidateField):
            candidates.append(item)
        else:
            candidates.append(CandidateField(
                field=item.field,
                value=item.value,
                unit=item.unit,
                locator=item.locator,
                method=item.method,
                confidence_tier=item.confidence_tier,
                human_confirmed=False  # Crucial invariant: always unconfirmed!
            ))
    return candidates
