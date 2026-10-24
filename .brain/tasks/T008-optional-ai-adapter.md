# T008 — Optional structured AI extraction

- status: done
- owner: Aditya
- reviewer: Narayan
- priority: P2
- depends_on: [T002, T005]

## Goal

Add an optional LLM adapter only for candidate extraction and explanation. The product must remain complete with `LLM_ENABLED=false`.

## Acceptance checks

1. The adapter requests strict JSON fields and validates the response.
2. Temperature and other settings are explicit and documented.
3. Timeouts, invalid JSON, missing credentials, and provider errors fall back to deterministic extraction or `NOT_EVALUATED`.
4. The adapter never writes final statuses or review decisions.
5. Extracted fields remain unconfirmed until a human approves them.
6. No secret or provider response is committed to Git.

## Required verification

Run all failure paths without a key. If a key is available, use a synthetic fixture only and record the schema validation result without storing the response.
