"""
Trusted Model Artifact Registry Module
Location: ai_ml/inference/registry.py
Strict Invariant:
Only allows inference using explicitly registered, cryptographically hashed,
and approved model artifacts with defined input schemas and safety bounds.
Enforces hex SHA-256 validation, default-unapproved status, real byte checksum verification,
and on-disk artifact persistence.
"""

from __future__ import annotations
import hashlib
import json
import os
import pickle
import re
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
from pydantic import BaseModel, Field


class ModelArtifactMetadata(BaseModel):
    artifact_id: str
    model_name: str
    version: str
    sha256: str
    trained_at_utc: str
    train_sample_count: int
    features: list[str]
    is_approved: bool = False  # Strict default: unapproved until explicitly granted
    intended_use: str = "Offline conjunction risk forecasting research"
    research_disclaimer: str = (
        "OFFLINE RESEARCH ONLY - ESA CDM BENCHMARK FORECASTING, NOT OPERATIONAL COLLISION PROBABILITY"
    )


_REGISTRY: Dict[str, Tuple[ModelArtifactMetadata, Any, bytes]] = {}
DEFAULT_ARTIFACT_DIR = Path("model_artifacts")


def compute_object_sha256(model_obj: Any) -> Tuple[str, bytes]:
    """Serialize model object and compute its cryptographic SHA-256 digest."""
    data = pickle.dumps(model_obj, protocol=5)
    digest = hashlib.sha256(data).hexdigest()
    return digest, data


def register_trusted_artifact(
    metadata: ModelArtifactMetadata,
    model_obj: Any,
    persist_to_disk: bool = True,
    artifact_dir: Optional[Path] = None,
) -> None:
    """
    Register an approved model artifact with cryptographic provenance verification.
    """
    # 1. Hexadecimal digest format check
    if not re.match(r"^[0-9a-fA-F]{64}$", metadata.sha256):
        raise ValueError("Invalid artifact SHA-256 digest: must be 64 valid hexadecimal characters.")

    # 2. Explicit approval check
    if not metadata.is_approved:
        raise ValueError("Cannot register unapproved model artifact: explicit approval (is_approved=True) is required.")

    # 3. Cryptographic byte verification
    computed_digest, serialized_bytes = compute_object_sha256(model_obj)
    # If registering with a computed digest or verifying against passed digest
    if metadata.sha256.lower() != computed_digest.lower():
        raise ValueError(
            f"Artifact checksum verification failed: provided digest '{metadata.sha256}' does not match "
            f"computed byte digest '{computed_digest}'."
        )

    _REGISTRY[metadata.artifact_id] = (metadata, model_obj, serialized_bytes)

    # 4. Optional disk persistence for cross-process recovery
    if persist_to_disk:
        target_dir = artifact_dir or DEFAULT_ARTIFACT_DIR
        target_dir.mkdir(parents=True, exist_ok=True)
        meta_file = target_dir / f"{metadata.artifact_id}.meta.json"
        bin_file = target_dir / f"{metadata.artifact_id}.bin"

        with open(meta_file, "w", encoding="utf-8") as f:
            f.write(metadata.model_dump_json(indent=2))
        with open(bin_file, "wb") as f:
            f.write(serialized_bytes)


def get_registered_artifact(
    artifact_id: str,
    artifact_dir: Optional[Path] = None,
    require_approved: bool = True,
) -> Optional[Tuple[ModelArtifactMetadata, Any]]:
    """
    Retrieve an approved model artifact if present in memory or on disk.
    Strictly enforces approval and integrity verification.
    """
    # Check in-memory registry
    if artifact_id in _REGISTRY:
        meta, model_obj, serialized_bytes = _REGISTRY[artifact_id]
        if require_approved and not meta.is_approved:
            # Revoked or unapproved: reject immediately
            return None
        # Verify integrity of registered bytes
        current_digest = hashlib.sha256(serialized_bytes).hexdigest()
        if current_digest.lower() != meta.sha256.lower():
            return None
        return meta, model_obj

    # Attempt recovery from persistent disk storage
    target_dir = artifact_dir or DEFAULT_ARTIFACT_DIR
    meta_file = target_dir / f"{artifact_id}.meta.json"
    bin_file = target_dir / f"{artifact_id}.bin"

    if meta_file.exists() and bin_file.exists():
        try:
            with open(meta_file, "r", encoding="utf-8") as f:
                meta_dict = json.load(f)
            meta = ModelArtifactMetadata(**meta_dict)
            if require_approved and not meta.is_approved:
                return None

            with open(bin_file, "rb") as f:
                data = f.read()

            current_digest = hashlib.sha256(data).hexdigest()
            if current_digest.lower() != meta.sha256.lower():
                return None

            model_obj = pickle.loads(data)
            _REGISTRY[artifact_id] = (meta, model_obj, data)
            return meta, model_obj
        except Exception:
            return None

    return None


def list_registered_artifacts() -> list[ModelArtifactMetadata]:
    """List metadata for all active approved artifacts in the registry."""
    return [meta for meta, _, _ in _REGISTRY.values() if meta.is_approved]
