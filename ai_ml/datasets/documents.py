"""
Mission Document and Page Extraction Dataset Module
Location: ai_ml/datasets/documents.py
Strict Invariant:
Splits mission documents strictly by mission_family_id (or operator lineage)
to prevent data leakage across document templates between train, validation, and test sets.
"""

from __future__ import annotations
import hashlib
from typing import Dict, List, Optional, Tuple
from pydantic import BaseModel, Field


class PageRecord(BaseModel):
    source_id: str
    page_number: int
    text_content: str
    has_tables: bool = False
    is_scan: bool = False
    char_count: int = 0
    sha256: str = ""

    def model_post_init(self, __context) -> None:
        if not self.char_count:
            self.char_count = len(self.text_content)
        if not self.sha256:
            self.sha256 = hashlib.sha256(self.text_content.encode("utf-8")).hexdigest()


class DocumentPackage(BaseModel):
    source_id: str
    mission_family_id: str
    original_filename: str
    pages: List[PageRecord] = Field(default_factory=list)
    split: Optional[str] = None  # "train", "val", "test"


def partition_documents_by_family(
    documents: List[DocumentPackage],
    train_ratio: float = 0.7,
    val_ratio: float = 0.15
) -> Tuple[List[DocumentPackage], List[DocumentPackage], List[DocumentPackage]]:
    """
    Partition documents into train, val, test sets strictly grouped by mission_family_id.
    Ensures all documents and amendments from the same mission family stay within one split.
    """
    family_map: Dict[str, List[DocumentPackage]] = {}
    for doc in documents:
        family_map.setdefault(doc.mission_family_id, []).append(doc)

    sorted_families = sorted(family_map.keys())
    total_families = len(sorted_families)

    if total_families == 0:
        return [], [], []

    train_end = max(1, int(total_families * train_ratio))
    val_end = max(train_end + 1, int(total_families * (train_ratio + val_ratio)))

    train_families = set(sorted_families[:train_end])
    val_families = set(sorted_families[train_end:val_end])
    test_families = set(sorted_families[val_end:])

    train_docs, val_docs, test_docs = [], [], []

    for fam, docs in family_map.items():
        if fam in train_families:
            for d in docs:
                d.split = "train"
                train_docs.append(d)
        elif fam in val_families:
            for d in docs:
                d.split = "val"
                val_docs.append(d)
        else:
            for d in docs:
                d.split = "test"
                test_docs.append(d)

    return train_docs, val_docs, test_docs
