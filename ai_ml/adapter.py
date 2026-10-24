from __future__ import annotations
import os
import json
import logging
from typing import Any, Callable, List, Optional, Tuple

from .schemas import AICandidateField, AIFieldExtraction, AIResponseSchema

logger = logging.getLogger(__name__)

# Configurable explicit settings
AI_TEMPERATURE = 0.0
AI_TIMEOUT_SECONDS = 10.0
AI_MODEL_NAME = "deterministic-rule-llm-fallback-v1"


def is_ai_enabled() -> bool:
    """Check whether external AI extraction is enabled via environment variables."""
    val = os.environ.get("ORBIT_AI_ENABLED", "").lower()
    return val in ("1", "true", "yes") and bool(os.environ.get("ORBIT_AI_KEY") or os.environ.get("GEMINI_API_KEY"))


def run_ai_candidate_extraction(
    pages: list[Tuple[int, str]],
    fallback_fn: Optional[Callable[[list[Tuple[int, str]]], Any]] = None,
) -> list[AICandidateField]:
    """Execute AI extraction with strict JSON validation and deterministic fallback.

    Acceptance Invariants:
    1. Strict JSON fields and Pydantic validation
    2. Explicit temperature (0.0) and timeout (10.0s)
    3. Errors, missing keys, timeouts, or invalid JSON fall back to deterministic extraction
    4. Adapter NEVER writes final review statuses or decisions
    5. Extracted fields strictly have human_confirmed=False
    """
    if not is_ai_enabled():
        if fallback_fn:
            return fallback_fn(pages)
        return []

    api_key = os.environ.get("ORBIT_AI_KEY") or os.environ.get("GEMINI_API_KEY")
    prompt_text = "\n".join(f"[Page {p_num}] {p_text}" for p_num, p_text in pages)

    try:
        if not api_key or api_key == "mock-fallback":
            if fallback_fn:
                return fallback_fn(pages)
            return []

        import httpx  # type: ignore

        endpoint = os.environ.get("ORBIT_AI_ENDPOINT", "https://api.openai.com/v1/chat/completions")
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        payload = {
            "model": os.environ.get("ORBIT_AI_MODEL", "gpt-4o-mini"),
            "temperature": AI_TEMPERATURE,
            "response_format": {"type": "json_object"},
            "messages": [
                {
                    "role": "system",
                    "content": "Extract orbital safety fields into JSON matching: summary, extracted_fields list with field, value, unit, page, line, quote. Do not evaluate compliance.",
                },
                {"role": "user", "content": prompt_text},
            ],
        }

        with httpx.Client(timeout=AI_TIMEOUT_SECONDS) as client:
            resp = client.post(endpoint, headers=headers, json=payload)
            if resp.status_code != 200:
                logger.warning(f"AI provider returned status {resp.status_code}; engaging fallback.")
                if fallback_fn:
                    return fallback_fn(pages)
                return []
            raw_json = resp.json()["choices"][0]["message"]["content"]
            validated = AIResponseSchema.model_validate_json(raw_json)

            candidates: list[AICandidateField] = []
            for item in validated.extracted_fields:
                candidates.append(
                    AICandidateField(
                        field=item.field,
                        value=item.value,
                        unit=item.unit,
                        locator={"page": item.page, "line": item.line, "quote": item.quote},
                        method="ai_assisted_extraction",
                        confidence_tier=item.confidence_tier if item.confidence_tier in ("HIGH", "MEDIUM", "LOW") else "MEDIUM",
                        human_confirmed=False,  # Crucial invariant: always unconfirmed!
                    )
                )
            return candidates

    except Exception as exc:
        logger.warning(f"AI extraction error ({type(exc).__name__}: {exc}); engaging fallback.")
        if fallback_fn:
            return fallback_fn(pages)
        return []
