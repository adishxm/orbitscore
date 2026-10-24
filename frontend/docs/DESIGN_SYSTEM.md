# OrbitScore Design System Specification (`DESIGN_SYSTEM.md`)

**Role**: Phase Two-A Deliverable for OrbitScore.  
**Philosophy**: A high-precision, technical design language derived from the EnduroSat reference, re-engineered for safety, accessibility (WCAG 2.2 AA), and evidence-based spacecraft verification workflows.

---

## 1. Design Tokens & CSS Custom Properties

### 1.1 Core Color Tokens

Derived from the reference's obsidian-and-cyan technical palette, with elevated contrast ratios to ensure 100% WCAG 2.2 AA compliance.

```css
:root {
  /* Surfaces & Backgrounds */
  --os-color-bg-deep: #05070a;        /* Deep space black viewport */
  --os-color-bg-base: #090d12;        /* App shell canvas */
  --os-color-surface-subtle: #10151c; /* Table rows, subtle panels */
  --os-color-surface-card: #141a23;   /* Cards, container panels */
  --os-color-surface-hover: #1a222e;  /* Card hover state */
  --os-color-surface-overlay: #1c2431;/* Drawers, modals, dropdowns */

  /* Hairline Borders */
  --os-color-border-subtle: #1c2530;  /* Architectural dividers */
  --os-color-border-mid: #2b3644;     /* Card and input borders */
  --os-color-border-bright: #3f4e62;  /* Focus & hover borders */
  --os-color-border-cyan: #00a1ff;    /* Active highlight border */

  /* Text & Labels (Engineered for WCAG 2.2 AA: Contrast >= 4.5:1 on dark) */
  --os-color-text-white: #ffffff;     /* Headings, active values (Contrast 18.5:1) */
  --os-color-text-primary: #f0f4f8;   /* Primary body copy (Contrast 16.2:1) */
  --os-color-text-secondary: #9daec2; /* Subtitles, column headers (Contrast 8.2:1) */
  --os-color-text-muted: #6f8298;     /* Metadata, placeholders (Contrast 4.6:1) */
  --os-color-text-dim: #4d5c6f;       /* Inactive tabs, disabled markers */

  /* Brand Accents */
  --os-color-accent-cyan: #00a1ff;    /* OrbitScore primary cyan */
  --os-color-accent-cyan-hover: #33b4ff;
  --os-color-accent-cyan-muted: rgba(0, 161, 255, 0.15);
  --os-color-accent-amber: #f59e0b;   /* Currency / date warnings */
  --os-color-accent-crimson: #f43f5e; /* Serious alerts */
}
```

---

### 1.2 Five Evidence State Tokens (WCAG 2.2 AA Dual-Surface Specification)

To meet §3.3 and WCAG 1.4.1 (no color-only meaning), every evidence state features a **distinct icon, text label, and color combination**. Each state has two tailored color pairs: one for the dark application canvas, and one for the white export/print canvas, each rigorously verified for `>= 4.5:1` text contrast.

```
Evidence States Definition:
1. confirmed    : Primary verification recorded by human reviewer with citation locator.
2. unconfirmed  : Preliminary or draft data lacking primary verification.
3. missing      : Required parameter key absent from the evidence register.
4. conflicting  : Multiple entries for same key disagree beyond tolerance threshold.
5. out-of-scope : Evidence recorded for subsystem or payload not in profile scope.
```

| State | Icon (`lucide-react`) | Text Label | Dark Canvas Text (Hex & Contrast on `#141A23`) | Dark Canvas Badge Fill | Light / Print Text (Hex & Contrast on `#FFFFFF`) | Light Print Badge Fill |
|---|---|---|---|---|---|---|
| `confirmed` | `CheckCircle2` | `CONFIRMED` | `#34D399` (Emerald 400) — **8.4:1** | `rgba(16, 185, 129, 0.12)` | `#047857` (Emerald 700) — **5.8:1** | `#ECFDF5` |
| `unconfirmed` | `Clock` | `UNCONFIRMED` | `#FBBF24` (Amber 400) — **8.6:1** | `rgba(245, 158, 11, 0.12)` | `#B45309` (Amber 700) — **5.2:1** | `#FFFBEB` |
| `missing` | `AlertCircle` | `MISSING` | `#F87171` (Red 400) — **6.7:1** | `rgba(239, 68, 68, 0.12)` | `#B91C1C` (Red 700) — **6.1:1** | `#FEF2F2` |
| `conflicting` | `GitCompare` | `CONFLICTING` | `#C084FC` (Purple 400) — **6.9:1** | `rgba(168, 85, 247, 0.14)` | `#7E22CE` (Purple 700) — **6.4:1** | `#FAF5FF` |
| `out-of-scope` | `Slash` | `OUT OF SCOPE` | `#94A3B8` (Slate 400) — **5.9:1** | `rgba(148, 163, 184, 0.12)` | `#475569` (Slate 600) — **5.4:1** | `#F1F5F9` |

---

### 1.3 Fluid Typography Scale (CSS `clamp()` Formulas)

Fluid typography adapts seamlessly across viewports without jarring breakpoint jumps, substituting the reference's proprietary `Magnetik` font with **Space Grotesk** (display/headings), **Inter** (body/tables), and **JetBrains Mono** (technical locators/data).

```css
:root {
  /* Font Families */
  --os-font-display: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --os-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --os-font-mono: 'JetBrains Mono', 'IBM Plex Mono', Menlo, Consolas, monospace;

  /* Fluid Scale: clamp(min, preferred-viewport-width, max) */
  --os-type-hero: clamp(2.5rem, 6vw + 1rem, 5.5rem);       /* 40px to 88px */
  --os-type-title-1: clamp(1.875rem, 4vw + 0.5rem, 3.5rem); /* 30px to 56px */
  --os-type-title-2: clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem);/* 24px to 36px */
  --os-type-title-3: clamp(1.25rem, 1.5vw + 0.25rem, 1.75rem);/* 20px to 28px */
  --os-type-body-l: clamp(1.0625rem, 0.5vw + 0.875rem, 1.25rem); /* 17px to 20px */
  --os-type-body: 1rem;                                     /* 16px */
  --os-type-body-s: 0.875rem;                               /* 14px */
  --os-type-caption: 0.75rem;                               /* 12px */

  /* Leading */
  --os-lh-tight: 1.05;
  --os-lh-snug: 1.25;
  --os-lh-normal: 1.55;
  --os-lh-relaxed: 1.75;

  /* Letter Spacing */
  --os-tracking-tighter: -0.04em;
  --os-tracking-tight: -0.02em;
  --os-tracking-normal: 0em;
  --os-tracking-wide: 0.05em;
  --os-tracking-caps: 0.1em;
}
```

---

### 1.4 Spacing & Layout Rhythm

```css
:root {
  /* Spacing Scale (4px base) */
  --os-space-1: 0.25rem;  /* 4px */
  --os-space-2: 0.5rem;   /* 8px */
  --os-space-3: 0.75rem;  /* 12px */
  --os-space-4: 1.0rem;   /* 16px */
  --os-space-5: 1.25rem;  /* 20px */
  --os-space-6: 1.5rem;   /* 24px */
  --os-space-8: 2.0rem;   /* 32px */
  --os-space-10: 2.5rem;  /* 40px */
  --os-space-12: 3.0rem;  /* 48px */
  --os-space-16: 4.0rem;  /* 64px */
  --os-space-24: 6.0rem;  /* 96px */
  --os-space-32: 8.0rem;  /* 128px */

  /* Container Max-Widths */
  --os-container-sm: 640px;
  --os-container-md: 960px;
  --os-container-lg: 1200px;
  --os-container-xl: 1360px;  /* Matches reference .container_1 */
  --os-container-pad: clamp(1.25rem, 4vw, 3.5rem);

  /* Geometry & Borders */
  --os-radius-xs: 2px;       /* Reference buttons and card corners */
  --os-radius-sm: 4px;       /* Input fields, select boxes */
  --os-radius-md: 6px;       /* Modals, tooltips */
  --os-radius-pill: 9999px;  /* Status chips */

  /* Z-Index Hierarchy */
  --os-z-below: -1;
  --os-z-canvas: 0;
  --os-z-content: 10;
  --os-z-sticky: 100;
  --os-z-header: 250;        /* Matches reference header z-index */
  --os-z-drawer: 300;
  --os-z-modal: 400;
  --os-z-toast: 500;
  --os-z-banner: 600;        /* Persistent honesty banner */
}
```

---

### 1.5 Motion Tokens & Easing Curves

Directly replicates the reference site's measured cubic-bezier easing and transition durations:

```css
:root {
  /* Reference Primary Easing */
  --os-ease-standard: cubic-bezier(0.51, 0.01, 0.2, 1);
  --os-ease-decelerate: cubic-bezier(0, 0, 0.2, 1);
  --os-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Duration Scale */
  --os-duration-fast: 150ms;
  --os-duration-normal: 300ms;
  --os-duration-medium: 450ms;
  --os-duration-deliberate: 600ms;
  --os-duration-long: 800ms;
}

/* Reduced Motion Override */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

### 1.6 Accessible Focus & Keyboard Specification

```css
/* Visible Focus Ring meeting WCAG 2.2 AA (>= 3:1 against background) */
:focus-visible {
  outline: 2px solid var(--os-color-accent-cyan);
  outline-offset: 2px;
  border-radius: var(--os-radius-xs);
}

/* High Contrast Skip Link */
.skip-link {
  position: absolute;
  top: -100px;
  left: 1rem;
  z-index: var(--os-z-banner);
  background: var(--os-color-accent-cyan);
  color: #000000;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  font-family: var(--os-font-sans);
  text-decoration: none;
  transition: top var(--os-duration-fast) ease;
}
.skip-link:focus {
  top: 1rem;
}
```

---

## 2. Component Design & Behavior Specifications

### 2.1 Persistent Status Banner (`StatusBanner`)
- **Purpose**: Establishes undeniable product transparency that OrbitScore is a client-side preparation tool, not a live certification backend.
- **States**: Fixed at viewport top; can be collapsed but never hidden.
- **Content**:
  ```
  [DEMO / MOCK]  •  [SYNTHETIC DATA: Asteria-3]  •  [LOCAL ONLY: Stored in browser, not durable]
  ```
- **Controls**: Includes an immediate "Clear Local Data" / "Reset Demo" action.
- **Accessibility**: Landmark role `region` with `aria-label="Application Environment Status"`.

---

### 2.2 Header & Navigation (`Header`)
- **Purpose**: Top navigation shell inspired by EnduroSat's 3-column sticky header.
- **Variants**:
  - `Default (Top)`: Transparent background, `padding: 1.5rem 0`, full logo size.
  - `Scrolled Past Top`: Solid obsidian background (`#05070a`), `padding: 0.75rem 0`, hairline bottom border (`#1c2530`).
- **Interactive Elements**:
  - Left: OrbitScore geometric brand logo with "OrbitScore" brand label.
  - Center: Nav links (`Mission Workspace`, `Demo Profile & Rules`, `About Limits`, `Roadmap`) with text skew-slide hover effect.
  - Right: "Asteria-3 Demo" quick-switch button (`.button_primary`) and Mobile Hamburger toggle.
- **Keyboard & Mobile**: Menu expands full-screen drawer with `Esc` key capture and focus trap.

---

### 2.3 Interactive Buttons (`Button`)
All buttons feature original geometric micro-animations matching the reference:
1. **Primary Button (`button_primary`)**: Solid cyan background (`#00A1FF`), black text (`#000000`), micro corner radius (`2px`). Hover: Skew-slide text flip.
2. **Secondary / Outline Button (`button_secondary`)**: Obsidian surface with hairline border (`#2B3644`), muted text (`#9DAEC2`). Hover: Cyan border and white text.
3. **Link Arrow Button (`button_arrow`)**: Cyan text with adjacent square icon box containing diagonal arrow that slides out and re-enters from the bottom-left on hover.
4. **Disabled Button**: Opacity `0.4`, `cursor: not-allowed`, visibly displays reason tooltip when hovered or focused.

---

### 2.4 Evidence Register Data Table (`DataTable`)
- **Purpose**: Core workspace table displaying mission parameters and citations.
- **Columns**: Parameter Key, Parameter Label, Value & Unit, Source Document & Locator, Evidence State (`StateChip`), Actions.
- **States**:
  - Hover: Row background shifts to `#141A23` with hairline cyan left indicator.
  - Filter Bar: Live filter by state (`confirmed`, `unconfirmed`, `missing`, `conflicting`, `out-of-scope`).
  - Search: Substring filter across parameter keys, labels, and document titles.
- **Accessibility**: Semantic HTML `<table>`, `<th>` with `scope="col"`, `aria-sort` on sortable columns.

---

### 2.5 Evidence Confirmation Drawer (`SidePanel`)
- **Purpose**: Slides in from right when a user inspects or edits an evidence item.
- **Fields**: Parameter details, declared source citation, document version, exact page/section locator, verification actor input, verification timestamp, and action buttons (`Confirm as Verified`, `Flag Conflicting`, `Mark Out of Scope`).
- **A11y**: Focus trapped inside panel while open; `Esc` closes and restores focus to triggering table row.

---

### 2.6 Stepper Workflow (`Stepper`)
- **Purpose**: Guides users through the 6-step evidence lifecycle:
  `1. Context → 2. Evidence Register → 3. Confirm Inputs → 4. Select Profile → 5. Findings → 6. Human Review → 7. Export Packet`
- **Behavior**:
  - Steps are gated: Later steps show clear prerequisite requirements if clicked prematurely.
  - Upstream edits mark downstream results **stale** (amber badge prompting re-run).
  - Current step illuminated with cyan pulse ring.

---

### 2.7 Software Finding Card (`FindingCard`)
- **Purpose**: Displays deterministic software check outputs without pass/fail language.
- **Outcomes**: `Documented`, `Needs attention: missing`, `Needs attention: conflicting`, `Needs attention: unconfirmed`, `Not applicable`.
- **Content**: Check ID (`C-01` through `C-06`), Check Title, Logic explanation, Evidence links, and Deterministic rationale.
- **Traceability Link**: Clicking an evidence reference highlights that item in the register.

---

### 2.8 Human Review Decision Form (`ReviewDecisionForm`)
- **Purpose**: Standalone human review zone independent of software findings.
- **Options**: `Accepted for packet`, `Needs more evidence`, `Disputed`, `Deferred to specialist`, `Noted – no action`.
- **Required Inputs**: Reviewer Name (text), Reviewer Role (selector), Decided At (timestamp), Engineering Comment (textarea).
- **Rule**: A human review decision never modifies software finding text; it references it as a separate record.

---

### 2.9 Export Packet Preview & Print Stylesheet (`ExportPreview`)
- **Purpose**: Previews the final verified review packet before export.
- **Gating**: Export is disabled until **every** software finding has at least one human review decision recorded.
- **Print Stylesheet (`@media print`)**:
  - Inverts canvas to crisp white background with obsidian text (`#000000`).
  - Eliminates all navigation bars, buttons, and decorative graphics.
  - Page break management: Prevents table rows from breaking awkwardly (`page-break-inside: avoid`).
  - Every page footer prints: *"Evidence-preparation packet. Not a certification, compliance determination, or official filing."*
