from __future__ import annotations
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class AIFieldExtraction(BaseModel):
    field: str
    value: Any
    unit: Optional[str] = None
    page: int = 1
    line: int = 1
    quote: str
    confidence_tier: str = "HIGH"


class AIResponseSchema(BaseModel):
    summary: str
    extracted_fields: list[AIFieldExtraction] = Field(default_factory=list)


class AICandidateField(BaseModel):
    field: str
    value: Any
    unit: Optional[str] = None
    locator: Dict[str, Any]
    method: str = "ai_assisted_extraction"
    confidence_tier: str = "MEDIUM"
    human_confirmed: bool = False  # Critical: AI outputs must always be unconfirmed
