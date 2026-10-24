from enum import Enum
from typing import Any, Literal
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
    unit: str | None = None
    data_origin: DataOrigin = DataOrigin.SYNTHETIC_FIXTURE
    transport_mode: TransportMode = TransportMode.SNAPSHOT
    review_state: ReviewState = ReviewState.UNCONFIRMED
    analysis_status: AnalysisStatus = AnalysisStatus.AVAILABLE
    artifact_id: str | None = None
    source_locator: dict[str, Any] = Field(default_factory=dict)

EvidenceState = Literal["PASS_UNDER_PROFILE", "WARNING", "NEEDS_EVIDENCE", "CONFLICT", "NOT_EVALUATED"]

class EvidenceField(BaseModel):
    field: str
    value: Any = None
    human_confirmed: bool = False
    artifact_id: str | None = None
    locator: dict[str, Any] = Field(default_factory=dict)

class MissionProfile(BaseModel):
    mission_id: str
    name: str
    fields: list[EvidenceField] = Field(default_factory=list)
    artifacts: list[dict[str, Any]] = Field(default_factory=list)

DecisionType = Literal[
    "APPROVED", "REJECTED", "WAIVED_WITH_NOTE",
    "accepted_for_packet", "accepted_as_is", "needs_evidence",
    "disputed", "deferred_to_specialist", "noted_no_action",
    "mitigation_filed", "action_pending"
]

class ReviewDecision(BaseModel):
    finding_id: str
    decision: DecisionType
    note: str | None = None
    reviewer: str = "reviewer"

class CounterfactualRequest(BaseModel):
    finding_id: str
    lever: str
    proposed_value: Any

class EvaluateRequest(BaseModel):
    profile_id: str

class DecisionRequest(BaseModel):
    decision: DecisionType
    note: str | None = None
    reviewer: str = "reviewer"

class FieldUpdateRequest(BaseModel):
    value: Any = None
    human_confirmed: bool | None = None

class ArtifactRecord(BaseModel):
    artifact_id: str
    mission_id: str
    filename: str
    media_type: str
    sha256: str
    uploaded_at: str
    size_bytes: int
    warning: str = "SYNTHETIC TEST EVIDENCE ONLY - NOT A REAL FLIGHT RECORD"
    locator: dict[str, Any] = Field(default_factory=dict)

class CandidateField(BaseModel):
    field: str
    value: Any
    unit: str | None = None
    locator: dict[str, Any] = Field(default_factory=dict)
    method: str = "regex_heuristic"
    confidence_tier: Literal["HIGH", "MEDIUM", "LOW"] = "HIGH"
    human_confirmed: bool = False

class ExtractionResponse(BaseModel):
    artifact_id: str
    mission_id: str
    status: Literal["SUCCESS", "NOT_EVALUATED", "ERROR"]
    extracted_fields: list[CandidateField] = Field(default_factory=list)
    warning: str = "SYNTHETIC TEST EVIDENCE ONLY - NOT A REAL FLIGHT RECORD"
    message: str | None = None
