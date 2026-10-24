# OrbitScore Frontend Application

> **Engineering Review Boundary Notice**: Despite the name, OrbitScore does not score or certify missions; it organizes evidence for human review.

OrbitScore is a source-linked mission evidence organization workspace for student, university, and small spacecraft engineering teams. It allows teams to consolidate technical parameters, link exact primary document citations (ICDs, test reports, CAD models), detect numerical and structural discrepancies deterministically, and export cited review packets for qualified human review.

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested on Node 20+)
- npm 9+

### Installation
```bash
# From workspace root or /frontend
cd frontend
npm install
```

### Development Server
```bash
npm run dev
# Starts Vite local development server on http://localhost:5173
```

### Production Build
```bash
npm run build
# Runs strict TypeScript type-checking (tsc --noEmit) and produces optimized bundle in /dist
```

### Running Test Suite
```bash
npm test
# Runs all 9 Vitest suites (unit, integration, axe accessibility, and banned-words lint)
```

### Banned-Words Copy Integrity Lint
```bash
npm run lint:banned-words
# Scans all files in /src for forbidden compliance, certification, and score terms
```

---

## Architecture

- **UI Framework**: React 18 + TypeScript (strict mode enabled)
- **Bundler**: Vite 5
- **Routing**: React Router v6
- **State Management**: Zustand 5 with localStorage persistence (`orbitscore_store_v1`) and safe in-memory fallback
- **Typography & Design System**: Self-hosted Space Grotesk, Inter, and JetBrains Mono with CSS variable design tokens
- **Deterministic Check Engine**: Pure mathematical/structural evaluation functions (`demo-evidence-completeness.ts`)
- **Accessibility**: Audited with axe-core (WCAG 2.2 AA compliant, zero violations)
- **Motion**: Framer Motion with automatic detection of user preference (`prefers-reduced-motion`)

---

## Synthetic Scenarios Included

1. **Asteria-3 (3U CubeSat Demonstration)**:
   - Full 7-item cited evidence register
   - Mass budget conflict: 4.15 kg (launch vehicle interface) vs 3.82 kg (CAD model)
   - Stale qualification record: TVAC test dated 2022-09-12 predates 2024-01-01 baseline
   - Unconfirmed parameter: Battery runaway screening report awaiting thermal engineer review
   - Missing required parameter: Target deployment epoch
   - Out-of-scope system: Cold-gas micro-thruster trade study

2. **Microsat-X (150 kg ESPA-Class Satellite)**:
   - Boundary protection test demonstrating Profile Gate inapplicability halts automated checks on uncalibrated vehicle classes.

---

## License
MIT (Open Source)
