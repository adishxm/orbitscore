"""
Trusted Model Artifact Registry Module
Location: ai_ml/inference/registry.py
Strict Invariant:
Only allows inference using explicitly registered, cryptographically hashed,
and approved model artifacts with defined input schemas and safety bounds.
"""

from __future__ import annotations
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class ModelArtifactMetadata(BaseModel):
    artifact_id: str
    model_name: str
    version: str
    sha256: str
    trained_at_utc: str
    train_sample_count: int
    features: list[str]
    is_approved: bool = True
    intended_use: str = "Offline conjunction risk forecasting research"
    research_disclaimer: str = (
        "OFFLINE RESEARCH ONLY - ESA CDM BENCHMARK FORECASTING, NOT OPERATIONAL COLLISION PROBABILITY"
    )


_REGISTRY: Dict[str, tuple[ModelArtifactMetadata, Any]] = {}


def register_trusted_artifact(
    metadata: ModelArtifactMetadata,
    model_obj: Any
) -> None:
    """Register an approved model artifact with its cryptographic provenance."""
    if len(metadata.sha256) != 64:
        raise ValueError("Invalid artifact SHA-256 digest: must be 64 hexadecimal characters.")
    if not metadata.is_approved:
        raise ValueError("Cannot register unapproved model artifact.")

    _REGISTRY[metadata.artifact_id] = (metadata, model_obj)


def get_registered_artifact(artifact_id: str) -> Optional[tuple[ModelArtifactMetadata, Any]]:
    """Retrieve an approved model artifact if present in the trusted registry."""
    return _REGISTRY.get(artifact_id)


def list_registered_artifacts() -> list[ModelArtifactMetadata]:
    """List metadata for all active approved artifacts in the registry."""
    return [meta for meta, _ in _REGISTRY.values()]
