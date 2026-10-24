from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

class DataOrigin(str, Enum):
    REAL_EXTERNAL = "REAL_EXTERNAL"
    VALIDATED_SIMULATION = "VALIDATED_SIMULATION"
    SYNTHETIC_FIXTURE = "SYNTHETIC_FIXTURE"
    USER_UNVERIFIED = "USER_UNVERIFIED"

class TransportMode(str, Enum):
    LIVE = "LIVE"
    SNAPSHOT = "SNAPSHOT"
    DEMO = "DEMO"
    UNAVAILABLE = "UNAVAILABLE"

class ReviewState(str, Enum):
    UNCONFIRMED = "UNCONFIRMED"
    CONFIRMED = "CONFIRMED"
    CONFLICTING = "CONFLICTING"
    REJECTED = "REJECTED"
    OUT_OF_SCOPE = "OUT_OF_SCOPE"

class AnalysisStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    MISSING_INPUT = "MISSING_INPUT"
    INVALID_INPUT = "INVALID_INPUT"
    OUT_OF_DOMAIN = "OUT_OF_DOMAIN"
    MODEL_UNAVAILABLE = "MODEL_UNAVAILABLE"

class CanonicalEvidenceRecord(BaseModel):
    field: str
    value: Any = None
    unit: Optional[str] = None
    data_origin: DataOrigin = DataOrigin.SYNTHETIC_FIXTURE
    transport_mode: TransportMode = TransportMode.SNAPSHOT
    review_state: ReviewState = ReviewState.UNCONFIRMED
    analysis_status: AnalysisStatus = AnalysisStatus.AVAILABLE
    artifact_id: Optional[str] = None
    source_locator: Dict[str, Any] = Field(default_factory=dict)


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
