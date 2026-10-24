# T006 — Clean-clone preflight

- status: ready
- owner: Roshan
- reviewer: Aditya
- priority: P0
- depends_on: []

## Goal

Make the package reproducible on all three laptops and document the exact startup, test, mock, and live-API commands.

## Acceptance checks

1. A clean clone with Python 3.10+ and Node 18+ can install dependencies using README commands.
2. `.env.example` contains names only and no secrets.
3. Backend tests, verification matrix, frontend tests, typecheck, and build all run from documented commands.
4. Mock/offline mode is usable without internet or an API key.
5. The README explains which features are prototype-only and which are not implemented.

## Required verification

Roshan follows the README on a clean directory and records every command and output. Aditya fixes any environment or path issue. Do not mark done from the original machine only.
