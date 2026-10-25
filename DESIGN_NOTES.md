# OrbitScore Visual Redesign — Engineering & Design Notes

## Executive Summary
This document records design decisions, technical architecture, and implementation assumptions for the visual overhaul of the OrbitScore aerospace telemetry and spacecraft verification mission-control platform.

## Design Direction: "Orbital Mission Control at Sunrise"
- **Mood**: Precision aerospace engineering (Linear/Vercel level craft with SpaceX/NASA telemetry feel).
- **Atmosphere**: Deep-space navy-black (`#04060b`), cool cyan/blue atmospheric glows (`#22d3ee`, `#6aa5ff`), and subtle sunrise amber accents (`#ffb454`) used with surgical restraint.
- **Surface Elevation**: Layered glassy panels (`#0b111d` to `#101828`), 1px translucent borders, fine SVG film grain, subtle 48px technical grid, and interactive corner accents.
- **Typography System**: 
  - UI & Headings: `Space Grotesk` (500/600/700) with sentence-case hierarchy.
  - Telemetry & Data: `JetBrains Mono` with `font-variant-numeric: tabular-nums`.
  - Micro-labels: 11-12px uppercase with `0.12em` letter-spacing.

## Phase Plan & Execution Log
- [x] **P0**: Tokens, self-hosted typography baseline, global atmosphere, custom scrollbar, base CSS.
- [ ] **P1**: Navigation (floating glass dock), unified labels/numbers, ConnectionStatus, Hero layout, telemetry chips, high-contrast CTAs, data-driven proof strip.
- [ ] **P2**: Component system applied to Spacecraft Fleet selector, 8-tile metrics grid, raw TLE inspector, and Subsystem Blueprint cards.
- [ ] **P3**: Hero centerpiece orbit visual (interactive SVG/Canvas Earth sphere with elliptical orbit rings, animated satellite markers, 2-way sync) + Earth-limb glow + starfield.
- [ ] **P4**: Section 02 6-Vector Telemetry grid (3x2), Benchmark Matrix, 6-Stage Gate Workflow, 5-State Taxonomy, SHA-256 Provenance, 36px bottom status bar, and Footer.
- [ ] **P5**: Subsystem line-art blueprint SVG schematic with hotspot nodes, micro-interactions, responsive testing (390px - 2560px), WCAG 2.2 AA accessibility validation.

## Key Technical Decisions & Invariant Preservation
1. **Zero Backend Modifications**: All FastAPI endpoints (`127.0.0.1:8000`), SGP4 calculations, TLE parsing, and SHA-256 Merkle root operations remain 100% untouched.
2. **Accessible DOM Labels for Vitest Invariants**: Where tests inspect specific navigation labels (e.g. `/COMMAND OVERVIEW/i`, `/LIVE FLEET & TLEs/i`), screen reader accessibility attributes (`sr-only` and `aria-label`) retain these exact strings while presenting unified short labels visually ("Overview", "Fleet", "Rules", "Workflow", "Citations", "Ledger").
3. **Synthetic Demo Data Disclosure**: Visible disclosure retained as a dedicated amber badge (`--warn`) adhering to honesty constraints.
4. **Offline Self-Hosted Assets**: Fonts and SVG icons are strictly self-hosted within `frontend/public/fonts/` and inline SVG/Lucide React components. No external CDNs or network requests.
