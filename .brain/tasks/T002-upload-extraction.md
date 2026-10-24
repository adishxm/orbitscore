# T002 — Evidence upload and extraction fallback

- status: ready
- owner: Aditya
- reviewer: Roshan
- priority: P0
- depends_on: []

## Goal

Add a safe artifact path matching the diagrams: upload a synthetic TXT/PDF, hash it, extract candidate fields, attach source locators, and mark every candidate `human_confirmed=false` until the reviewer confirms it.

## Required endpoints

`POST /missions/{mission_id}/artifacts`, `POST /artifacts/{artifact_id}/extract`, and `PATCH /fields/{field_id}` or an equivalent documented route.

## Acceptance checks

1. The supplied synthetic datasheet can be uploaded without an external service.
2. The stored artifact has a SHA-256 hash and non-secret metadata.
3. Text/PDF extraction returns candidate field, value, unit, page/locator, method, and confidence tier.
4. Unconfirmed fields cannot produce a trusted `PASS_UNDER_PROFILE` result where confirmation is required.
5. Parser failure returns a visible `NOT_EVALUATED`/needs-review state rather than invented values.
6. File size/type limits and a synthetic-data warning are visible.

## Required verification

Run a complete extraction test, a malformed-file test, a missing-field test, and the complete backend/frontend suites. Inspect the stored hash and returned locators.
