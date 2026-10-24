from typing import Any, Literal
from pydantic import BaseModel, Field

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
