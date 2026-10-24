# T005 — Cited review packet

- status: blocked-by-T003
- owner: Aditya
- reviewer: Narayan
- priority: P1
- depends_on: [T003, T004]

## Goal

Turn the current minimal HTML/JSON response into a readable cited review packet that is unlocked only after all findings have decisions.

## Packet must contain

Synthetic mission label, selected profile and version, finding table, observed values, thresholds, source locators, assumptions, limitation text, counterfactual disclaimer, reviewer decisions, provenance status, and generation timestamp.

## Acceptance checks

1. Unreviewed findings return a clear `EXPORT_LOCKED` response.
2. Fully reviewed findings produce valid HTML and JSON.
3. Every finding has a source and limitation field, including `NOT_EVALUATED`.
4. Counterfactuals are labeled illustrative and synthetic.
5. Export can be inspected after API restart.
6. PDF is optional; HTML+JSON is the minimum accepted output.

## Required verification

Test locked and unlocked paths, inspect the generated HTML visually, parse the JSON, and run all existing suites.
