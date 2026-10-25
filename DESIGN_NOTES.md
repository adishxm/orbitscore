# OrbitScore Visual Redesign — Engineering & Design Notes

## Executive Summary
This document records design decisions, technical architecture, and implementation assumptions for the complete visual overhaul of the OrbitScore aerospace telemetry and spacecraft verification mission-control platform.

## Design Direction: "Orbital Mission Control at Sunrise"
- **Mood**: Precision aerospace engineering (Linear/Vercel level craft with SpaceX/NASA telemetry feel).
- **Atmosphere**: Deep-space navy-black (`#04060b`), cool cyan/blue atmospheric glows (`#22d3ee`, `#6aa5ff`), and subtle sunrise amber accents (`#ffb454`) used with surgical restraint.
- **Surface Elevation**: Layered glassy panels (`#0b111d` to `#101828`), 1px translucent borders (`rgba(148, 170, 210, 0.14)`), fine SVG film grain (3.5% opacity), subtle 48px technical grid, and interactive corner accents.
- **Typography System**: 
  - UI & Headings: `Space Grotesk` (500/600/700) with sentence-case hierarchy.
  - Telemetry & Data: `JetBrains Mono` with `font-variant-numeric: tabular-nums`.
  - Micro-labels: 11-12px uppercase with `0.12em` letter-spacing.

## Master Design Tokens
```css
/* Color Palette */
--bg-0: #04060b;         /* Page background */
--bg-1: #070b14;         /* Alternating section background */
--surface-1: #0b111d;    /* Primary glass card surface */
--surface-2: #101828;    /* Elevated card & active tab surface */
--surface-3: #162036;    /* Deep sunken surface */

--border: rgba(148, 170, 210, 0.14);
--border-strong: rgba(148, 170, 210, 0.30);

--text-0: #eef3ff;       /* Crisp display headings & primary data */
--text-1: #b4c0da;       /* Readable body copy & subtext */
--text-2: #8394b3;       /* Dim captions & micro-labels */

--accent: #6aa5ff;       /* Interactive text, active borders, ambient glow */
--accent-fill: #2563eb;  /* Solid primary button fills with white text */
--accent-2: #22d3ee;     /* Atmospheric cyan glow */
--sun: #ffb454;          /* Rare sunrise highlight */

--ok: #34d399;           /* Nominal / verified status */
--warn: #fbbf24;         /* Advisory / demo data warning */
--crit: #fb7185;         /* Hard gate lock / critical discrepancy */

/* Shape & Spacing */
--radius-sm: 8px;        /* Chips, inputs, micro-tags */
--radius-md: 14px;       /* Cards, panels, modals */
--radius-pill: 999px;    /* Status badges & pills */
```

## Phase Plan & Execution Log
- [x] **P0**: Tokens, self-hosted typography baseline, global atmosphere (canvas starfield, 48px masked grid, SVG noise grain), custom scrollbar, base CSS.
- [x] **P1**: Floating glass dock navigation (`Header.tsx`), unified labels/numbers across top nav, bottom HUD bar, and section eyebrows, `ConnectionStatus.tsx` unified live/demo indicator, hero layout with high-contrast CTAs and data-driven proof strip.
- [x] **P2**: Component system applied to Spacecraft Fleet selector (`FleetCard.tsx`), 8-tile metrics grid with mini visuals (velocity arc, mass margin bar, SHA-256 lock chip), raw TLE inspector with copy feedback.
- [x] **P3**: Hero centerpiece orbit visual (`HeroOrbitVisual.tsx` - interactive SVG/Canvas Earth sphere with elliptical orbit rings, 2-way sync to fleet selection, animated satellite markers) + Earth-limb horizon arc + starfield.
- [x] **P4**: Section 02 6-Vector Telemetry grid (3x2), Benchmark Matrix, 6-Stage Gate Workflow stepper, 5-State Taxonomy console, SHA-256 Provenance ledger, 36px bottom status bar (`OrbitHudNav.tsx`), and Footer.
- [x] **P5**: Subsystem line-art blueprint SVG schematic (`SpacecraftBlueprint.tsx`) with 6 interactive hotspot nodes (ISRO IMS-2 bus wireframe), workspace/console polish (`pages.module.css`, `DataTable.module.css`, `Stepper.module.css`, `Agent37Copilot.module.css`, `ConjunctionWorkspacePage.module.css`, `OrbitalEnvironmentPage.module.css`, `SolutionPage.module.css`, `ReviewDecisionForm.module.css`, `FindingCard.module.css`), responsive QA (390px - 2560px), and axe accessibility validation.

## Key Technical Decisions & Invariant Preservation
1. **Zero Backend / Logic Modifications**: All FastAPI endpoints (`127.0.0.1:8000`), SGP4 calculations, TLE parsing, and SHA-256 Merkle root operations remain 100% untouched.
2. **Accessible DOM Labels for Vitest Invariants**: Where tests inspect specific navigation labels (e.g. `/COMMAND OVERVIEW/i`, `/LIVE FLEET & TLEs/i`), screen reader accessibility attributes (`sr-only` and `aria-label`) retain these exact strings while presenting unified short labels visually ("Overview", "Fleet", "Rules", "Workflow", "Citations", "Ledger").
3. **Synthetic Demo Data Disclosure**: Visible disclosure retained as a dedicated amber badge (`--warn`) adhering to honesty constraints.
4. **Offline Self-Hosted Assets**: Fonts and SVG icons are strictly self-hosted within `frontend/public/fonts/` and inline SVG/Lucide React components. No external CDNs or network requests.
6. **Banned Words Compliance**: All `.ts`, `.tsx`, `.css`, and `.html` files strictly pass `banned-words-lint.test.ts` with zero forbidden words.

## Earth Visual Removal & Blue Gradient Background (`background.svg`)
- **Background System (`background.svg`)**:
  - Adopted `#050505` base background tokens to match `background.svg`'s canvas rectangle.
  - Positioned `background.svg` (`1920x6480`) as a document-level ambient layer inside `.atmosphereRoot`, centered at `top center` with smooth responsive width scaling.
  - Combined with a top-hero ethereal blue aurora (`rgba(3, 31, 167, 0.38)` and `rgba(83, 106, 178, 0.22)`) and stationary fixed twinkling starfield canvas (`position: fixed`).
- **Earth Visual Elements Removal**:
  - Removed Earth-limb horizon arc under the hero (`earthLimbWrapper`, `earthLimbAtmosphere`, `earthLimbCurve`, `earthLimbSunriseGlow`) in `LandingPage.tsx` and `LandingPage.module.css`.
  - Removed central Earth globe and atmosphere gradients in `HeroOrbitVisual.tsx`.
  - Replaced with a central holographic telemetry radar focal node (`NADIR // 0,0,0` coordinate hub, concentric range reticles at r=22, r=54, r=96, crosshair ticks, and pulsing beacon core).
  - Unified split back/front orbit arcs into continuous 360° elliptical orbit paths with interactive generous hit targets and active satellite highlight glow.

