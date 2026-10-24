# T013 — Candidate Schema, Domain Normalization, and Evidence Validation

- status: done
- owner: Aditya
- reviewer: Narayan
- priority: P1
- depends_on: [T011, T012]

## Goal

Implement domain normalization, quote-to-text evidence validation, cryptographic source registry, and honest precision/recall evaluation metrics without hardcoded 1.0 shortcuts.

## Acceptance checks

1. `ai_ml/extraction/normalization.py` converts mass, distance, duration, and probability expressions (ratios, percentages, scientific notation) with strict bounds checking.
2. `ai_ml/extraction/validation.py` verifies candidate quotes appear verbatim in raw source page text and rejects out-of-bounds parameters.
3. `ai_ml/datasets/sources.py` validates source records with SHA-256 digests and explicit permission/privacy controls.
4. `ai_ml/evaluation/extraction_metrics.py` calculates true precision, recall, and F1 across extracted fields with per-field error tracking.
5. `ai_ml/cli.py` provides unified commands (`extraction-evaluate`, `documents-validate`).

## Required verification

Execute `pytest ai_ml/tests/test_extraction_modules.py ai_ml/tests/test_adaption_pipeline.py` and run `python -m ai_ml.cli extraction-evaluate`.

## Reviewer log

- Implementation evidence: Normalizers, candidate validators, source registers, extraction evaluation harness, and 12 unit tests passing.
- Reviewer sign-off: Narayan (2026-10-24T18:30:00.000000Z / 2026-10-25T00:00:00.000000+05:30)
