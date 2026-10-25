# T029 — ODAR and EOMP Report Generator with Watermarked PDF

- status: done
- owner: Aditya
- reviewer: Roshan
- priority: P1
- depends_on: [T028]

## Goal

Generate automated NASA-STD-8719.14 ODAR and ISRO DFSM 2030 / FCC 5-year EOMP regulatory drafts in Markdown, PDF, and JSON formats under unified export gates.

## Acceptance checks

1. `GET /export/{mission_id}/odar` and `GET /export/{mission_id}/eomp` generate section-complete regulatory drafts with explicit NEEDS_EVIDENCE indicators.
2. PDF export (`?format=pdf`) uses ReportLab to render watermarked draft reports requiring qualified human review.
3. Export endpoints enforce the unified export gate requiring compliance, human reviewer decisions, and un-tampered provenance chains.
4. Report generation achieves fast p95 < 3s benchmark on pre-cached telemetry.

## Required verification

Run `pytest backend/tests/test_export.py` and `pytest backend/tests/test_extended_capabilities.py`.

## Reviewer log

- Implementation evidence: Implemented in app/odar_generator.py and app/main.py; ReportLab PDF generation verified.
- Reviewer sign-off: Roshan (2026-10-25T02:15:00.000000Z / 2026-10-25T07:45:00.000000+05:30)
