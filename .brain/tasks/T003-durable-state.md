# T003 — Durable local state

- status: ready
- owner: Aditya
- reviewer: Roshan
- priority: P1
- depends_on: [T002]

## Goal

Replace process-memory mission/evaluation/review state with SQLite/SQLModel persistence suitable for a single-user demo and safe restart.

## Required records

Missions, artifacts, extracted fields, evaluations/findings, review decisions, counterfactuals, and provenance events.

## Acceptance checks

1. Restarting the API preserves the seeded mission, uploaded artifact metadata, confirmed fields, findings, and decisions.
2. Export lock state is correct after restart.
3. A documented initialization command creates the database from a clean clone.
4. The database path is configurable and no absolute machine path is committed.
5. Tests use an isolated temporary database.

## Required verification

Run the persistence test through stop/restart, then run backend and frontend suites. Record schema/version behavior and the clean initialization command.
