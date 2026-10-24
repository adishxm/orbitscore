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
class ReviewDecision(BaseModel):
    finding_id: str
    decision: Literal["APPROVED", "REJECTED", "WAIVED_WITH_NOTE"]
    note: str | None = None
    reviewer: str = "reviewer"
class CounterfactualRequest(BaseModel):
    finding_id: str
    lever: str
    proposed_value: Any
class EvaluateRequest(BaseModel):
    profile_id: str
class DecisionRequest(BaseModel):
    decision: Literal["APPROVED", "REJECTED", "WAIVED_WITH_NOTE"]
    note: str | None = None
    reviewer: str = "reviewer"

class FieldUpdateRequest(BaseModel):
    value: Any = None
    human_confirmed: bool | None = None

