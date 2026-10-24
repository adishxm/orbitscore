# T015 — Document Processing, Grouped Family Splits, and Bounded Extraction

- status: done
- owner: Aditya
- reviewer: Narayan
- priority: P1
- depends_on: [T013]

## Goal

Implement page-aware document parsing, family-level train/val/test partitioning (to prevent template leakage), and the bounded extraction runner with mandatory quote-to-page evidence validation.

## Acceptance checks

1. `ai_ml/datasets/documents.py` implements `PageRecord`, `DocumentPackage`, and `partition_documents_by_family` grouping by `mission_family_id`.
2. `ai_ml/extraction/parsing.py` detects section headings, tabular formatting, and scan quality per page.
3. `ai_ml/extraction/pretrained.py` implements `BoundedExtractionRunner`, emitting candidate fields strictly with `human_confirmed=False` and verified verbatim source quotes.
4. Unit tests in `ai_ml/tests/test_document_pipeline.py` verify zero cross-family leakage and safety constraints.

## Required verification

Execute `pytest ai_ml/tests/test_document_pipeline.py` and run `python -m ai_ml.cli documents-ingest --config experiments/extraction_v1/config.yaml`.

## Reviewer log

- Implementation evidence: Page parser, family partitioning, bounded extraction runner, and 4 passing unit tests in `test_document_pipeline.py`.
- Reviewer sign-off: Narayan (2026-10-24T18:45:00.000000Z / 2026-10-25T00:15:00.000000+05:30)
