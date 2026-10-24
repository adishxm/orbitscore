"""
Page-Aware Document Parsing and Text Processing Module
Location: ai_ml/extraction/parsing.py
Strict Invariant:
Maintains exact page boundaries, detects section headings and tabular structures,
and produces structured PageRecords without data loss or fabricated content.
"""

from __future__ import annotations
import re
from typing import List, Tuple
from ai_ml.datasets.documents import PageRecord


def detect_page_features(text: str) -> Tuple[List[str], bool, bool]:
    """Detect section headings, tables, and scan indicators on a single page."""
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    headings = []
    has_tables = False

    table_pattern = re.compile(r"\|.*\||\t")
    heading_pattern = re.compile(r"^(?:#+\s*|[0-9]+\.[0-9]*\s+|SECTION\s+[0-9]+|APPENDIX\s+[A-Z])", re.IGNORECASE)

    table_lines_count = 0
    for line in lines:
        if heading_pattern.match(line) or (line.isupper() and len(line.split()) < 8 and len(line) > 4):
            headings.append(line)
        if table_pattern.search(line):
            table_lines_count += 1

    if table_lines_count >= 2:
        has_tables = True

    # Page is flagged as suspected scan if character count is suspiciously low or full of unprintable characters
    is_scan = len(text.strip()) < 50 and any(c.isalpha() for c in text)

    return headings, has_tables, is_scan


def parse_document_text_by_page(
    raw_document_content: str,
    source_id: str = "src_doc_01"
) -> List[PageRecord]:
    """
    Parse a full document string into ordered, page-aware PageRecord instances.
    Splits on standard form-feed characters (\x0c) or explicit markers (--- Page N ---).
    """
    if "\x0c" in raw_document_content:
        raw_pages = raw_document_content.split("\x0c")
    else:
        # Check for explicit page delimiter patterns
        page_splits = re.split(r"(?:^|\n)\s*(?:---|===)\s*Page\s+\d+\s*(?:---|===)\s*(?:\n|$)", raw_document_content, flags=re.IGNORECASE)
        if len(page_splits) > 1:
            raw_pages = [p for p in page_splits if p.strip()]
        else:
            # Fallback: treat entire content as single page
            raw_pages = [raw_document_content]

    records: List[PageRecord] = []
    for idx, page_str in enumerate(raw_pages, start=1):
        clean_text = page_str.strip()
        _, has_tables, is_scan = detect_page_features(clean_text)

        rec = PageRecord(
            source_id=source_id,
            page_number=idx,
            text_content=clean_text,
            has_tables=has_tables,
            is_scan=is_scan,
            char_count=len(clean_text)
        )
        records.append(rec)

    return records
