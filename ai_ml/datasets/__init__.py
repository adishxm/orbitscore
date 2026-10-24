"""
Datasets Package for OrbitScore.
Contains dataset schemas, provenance registries, and ESA CDM event processing.
"""

from ai_ml.datasets.sources import SourceDocumentRecord, compute_bytes_sha256
from ai_ml.datasets.documents import (
    PageRecord,
    DocumentPackage,
    partition_documents_by_family,
)
from ai_ml.datasets.esa_cdm import (
    CDMMessage,
    CDMEventExample,
    build_cutoff_safe_cdm_event,
    partition_cdm_events_by_event_id,
)

__all__ = [
    "SourceDocumentRecord",
    "compute_bytes_sha256",
    "PageRecord",
    "DocumentPackage",
    "partition_documents_by_family",
    "CDMMessage",
    "CDMEventExample",
    "build_cutoff_safe_cdm_event",
    "partition_cdm_events_by_event_id",
]
