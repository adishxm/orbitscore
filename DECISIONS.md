# Architecture & Implementation Decisions (DECISIONS.md)

| Date | ID | Topic | Decision | Context & Rationale |
|---|---|---|---|---|
| 2026-10-24 | DEC-001 | Engine Choice | Three.js (WebGL 2) with custom GLSL & Postprocessing | Project already integrates Three.js `0.186.1` in `frontend/package.json`. Clean-room rules dictate independent shader/scene implementation rather than PlayCanvas proprietary assets. |
| 2026-10-24 | DEC-002 | Storyline Adaptation | Aerospace mission evidence chapters | Adapted reference's 6-scene journey directly to OrbitScore's domain (Orbital Telemetry $\rightarrow$ Planetary Network $\rightarrow$ Deterministic Rules $\rightarrow$ Space Credit Core $\rightarrow$ Human Review Gate $\rightarrow$ Regulatory Mission Dossier). |
| 2026-10-24 | DEC-003 | Typography Pairing | Space Grotesk + Inter + JetBrains Mono | Reference uses General Sans (display/body) and JetBrains Mono (numbers/code). OrbitScore already self-hosts Space Grotesk (headings), Inter (body), and JetBrains Mono (telemetry/monospaced figures) in `frontend/public/fonts/`. |
| 2026-10-24 | DEC-004 | Audio Synthesis | Web Audio API procedural synthesis + designed cues | Audio is strictly opt-in via `#custom-cta` click gesture ("Experience with headphones"). Ambient stems are synthesized using Web Audio oscillators/filters, eliminating licensing and payload overhead. |
| 2026-10-24 | DEC-005 | Virtual Scroll Model | Lenis / Custom Virtual Scroll synced with GSAP Ticker | 32,000 px virtual track length, lerp speed 0.1, key step 0.12, snap idle delay 1.0s, and snap points matching measured reference behavior. |
| 2026-10-24 | DEC-006 | Strict Copy Guardrails | Complete exclusion of forbidden terms (`compliant`, `certified`, `risk score`, etc.) | Preserved OrbitScore's core engineering boundary: the software organizes technical evidence for qualified human review rather than certifying or scoring flight readiness. |
| 2026-10-24 | DEC-007 | Zero External Binary Downloads | 100% Procedural Three.js Geometries & Web Audio Synthesizer | Eliminates network latency, bandwidth overhead, and proprietary asset licensing concerns while maintaining a light ~54 kB JS chunk size. |
