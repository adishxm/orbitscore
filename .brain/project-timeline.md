# OrbitReady project timeline

This is the technical schedule derived from the official Build 2026 event guide. It intentionally excludes travel, packing, accommodation, and personal information.

| Deadline | Technical milestone | Required output |
|---|---|---|
| Before hacking begins, Sat 24 Oct 12:00 PM IST | Scope and baseline freeze | `.brain` validated, prototype tests green, task ownership confirmed |
| Sat 24 Oct 12:00–3:00 PM | Foundation and core integration | Live API contract, seeded mission, evaluator still green |
| Sat 24 Oct 3:00–8:00 PM | Evidence workflow | Upload/extraction fallback, confirmation state, source locators |
| Sat 24 Oct 8:00–11:00 PM | Review and provenance | Findings, human decisions, export lock, provenance trace |
| Sat 24 Oct 11:00 PM–Sun 25 Oct 6:00 AM | Optional hardening | Durable state, export polish, browser checks; only if core is stable |
| Sun 25 Oct 6:00–10:30 AM | Final integration and rehearsal | Clean demo, limitations, counterfactual, export, backup recording |
| **Sun 25 Oct 10:30 AM** | **Pitch dry-run deadline** | Final narration and judge answers |
| **Sun 25 Oct 12:00 PM** | **Code freeze/submission** | Repository, deck, and two-minute demo video frozen |
| Sun 25 Oct after 12:00 PM | Judging support | No feature work; only recovery of already-tested paths |

## Dependency order

The critical path is `T001` live API integration and `T002` upload/extraction. Then complete `T003` durable state and `T004` durable provenance. After those, complete `T005` export, `T007` browser acceptance, and only then attempt `T008` optional AI integration. `T006` clean-clone preflight can run in parallel.

## Cut rule

If the team is behind at any checkpoint, cut optional AI, PDF styling, charts, Docker deployment, and multiple profiles before cutting deterministic evaluation, human confirmation, conflict handling, export lock, provenance verification, or the offline demo.
