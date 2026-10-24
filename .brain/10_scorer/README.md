# OrbitScore Roadmap Index

Start with the [overall master roadmap](overall-roadmap.md) for dependency order, cross-area gates, critical path, scoring, shared risks, and final signoff. Then use the focused area plan relevant to the work; each file contains its own evidence basis, phased actions, and acceptance checks:

- [AI/ML](ai_ml.md) — data provenance, evaluation, reproducibility, model governance, and research/release boundaries.
- [Backend](backend.md) — API contracts, authentication, isolation, persistence, invalidation, exports, and operations.
- [Frontend](frontend.md) — clear UX, server-authoritative state, source visibility, accessibility, and usability validation.
- [Provider integrations](integrations.md) — consent, credentials, outbound controls, reliability, and provider-specific verification.
- [FlutterFlow](flutterflow.md) — service-project readiness, mobile implementation, contract parity, device testing, and release.
- [Render](render.md) — Blueprint and service topology, environments, secrets, persistence, observability, recovery, and deployment evidence.
- [Security and QA](security_qa.md) — reproducible counts, adversarial/security testing, CI, accessibility evidence, deployment smoke, and signoff.
- [Project operations and research](project_ops_research.md) — scope/source-of-truth, evidence and claims, research lineage, onboarding, dated reports, and review governance.

Use the master plan to order dependencies: establish a verifiable baseline and contracts first, then safe backend state and verified deployment, followed by clients and controlled AI/provider work, integrated release testing, and independent human signoff. Treat an area score as a dated evidence snapshot, not completion. Verify evidence against the exact candidate commit; do not infer a live deployment, FlutterFlow project, passed CI, or approval from configuration or documentation alone. Missing, stale, inaccessible, or failed evidence remains an open blocker.
