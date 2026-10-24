# T004 — Durable provenance chain

- status: ready
- owner: Aditya
- reviewer: Roshan
- priority: P1
- depends_on: [T002]

## Goal

Persist artifact, extraction, confirmation, evaluation, review, counterfactual, and export events in order. Keep exact-sequence tamper detection after process restart.

## Acceptance checks

1. Every required lifecycle action appends an event.
2. Each event contains sequence, event type, payload, previous hash, and hash.
3. Verification detects changed payload, changed order, missing event, and wrong previous hash.
4. Verification works after API restart.
5. The UI can show valid/invalid status and the first broken sequence.
6. The implementation does not claim legal immutability or third-party signing.

## Required verification

Run the existing tamper test plus restart and four corruption cases. Capture the first broken sequence in the task log.
