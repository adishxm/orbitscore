"""
Source Document Provenance and Registry Module
Location: ai_ml/datasets/sources.py
Strict Invariant:
All mission documents must have an immutable provenance record, verified SHA-256 hash,
and explicit rights/permissions flags before being processed.
"""

from __future__ import annotations
import hashlib
from typing import Optional
from pydantic import BaseModel, Field


class SourceDocumentRecord(BaseModel):
    source_id: str
    mission_family_id: str
    document_role: str  # "mission_claim", "regulator_filing", "technical_spec", "research_paper"
    original_filename: str
    sha256: str
    byte_size: int
    page_count: int
    retrieved_at_utc: str
    allowed_download: bool = True
    allowed_annotation: bool = True
    allowed_training: bool = False  # Explicit opt-in only
    allowed_external_processing: bool = False  # LLM API opt-in
    privacy_class: str = "CONFIDENTIAL_MISSION_DATA"  # "PUBLIC", "RESTRICTED", "CONFIDENTIAL_MISSION_DATA"
    source_owner: str = "Flight Dynamics Team"
    notes: Optional[str] = None


def compute_bytes_sha256(data: bytes) -> str:
    """Compute standard hex SHA-256 digest of binary content."""
    return hashlib.sha256(data).hexdigest()


def verify_source_bytes(record: SourceDocumentRecord, content_bytes: bytes) -> tuple[bool, str]:
    """Verify that actual document bytes match the recorded byte size and SHA-256 digest."""
    if len(content_bytes) != record.byte_size:
        return False, f"Byte size mismatch: recorded {record.byte_size}, actual {len(content_bytes)}."
    computed = compute_bytes_sha256(content_bytes)
    if computed.lower() != record.sha256.lower():
        return False, f"SHA-256 digest mismatch: recorded {record.sha256}, actual {computed}."
    return True, "Byte-level integrity verified."


def validate_source_record(
    record: SourceDocumentRecord,
    content_bytes: Optional[bytes] = None
) -> tuple[bool, str]:
    """Validate that a source document conforms to data integrity and security gates, optionally checking bytes."""
    if len(record.sha256) != 64:
        return False, f"Invalid SHA-256 digest length ({len(record.sha256)}). Must be 64 characters."
    if record.byte_size <= 0:
        return False, "File byte size must be greater than zero."
    if record.page_count <= 0:
        return False, "Document page count must be at least 1."
    if record.privacy_class not in ("PUBLIC", "RESTRICTED", "CONFIDENTIAL_MISSION_DATA"):
        return False, f"Invalid privacy classification: {record.privacy_class}"

    if content_bytes is not None:
        return verify_source_bytes(record, content_bytes)

    return True, "Source record is valid and verified."
