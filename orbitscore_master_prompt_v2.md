# MASTER PROMPT v2: REFERENCE-DRIVEN FRONTEND BUILD FOR ORBITSCORE

> Paste everything below the line into your coding agent (Claude Code or similar). Every decision is already made; the agent records any defaults it adds in `ASSUMPTIONS.md`.

---

## 0. HOW TO READ THIS PROMPT

You are an autonomous senior engineer-designer. Follow these rules throughout:

1. **Priority order when instructions conflict:** (1) Safety/honesty rules in §3, (2) Legal/IP rules in §2, (3) Functional requirements in §4, (4) Visual fidelity to the reference in §5-§8, (5) Everything else.
2. **Do not ask questions** unless blocked. For anything unspecified, choose a sensible default and record it in `ASSUMPTIONS.md`.
3. **Work in checkpoints.** After each phase, write the phase's deliverable file to disk, then continue. If you run out of context or time, the files on disk must be enough for a fresh session to resume (see §11).
4. **Evidence discipline.** Every claim about the reference site is labeled `[OBSERVED]`, `[EXTRACTED]` (from DOM/CSS/network), `[ESTIMATED]`, or `[HYPOTHESIS]`. Never invent hex values, timings, or library names. If you can't measure it, say so.
5. **Never fake capability.** No working login, no persistent storage, no live API, no AI extraction unless actually built and tested. Label every mock.

---

## 1. PROJECT IDENTITY

| Field | Value |
|---|---|
| Product name | **OrbitScore** (repo/package slug: `orbitscore`). Use "OrbitScore" as the brand everywhere. **Name-risk rule:** because "score" suggests a numeric grade, the product must NEVER output a score, grade, percentage, rating, ranking, or traffic-light status for a mission. The landing page and `/about-limits` must include a plain statement that, despite the name, OrbitScore does not score or certify missions; it organizes evidence for human review. Never use the word "score" in the UI except in the brand name and that disclaimer. |
| One-line description | A source-linked, human-reviewed workspace that helps student, university, and small spacecraft teams organize mission evidence before qualified expert review. |
| Reference site | https://www.endurosat.com/space-service/ (design and interaction reference only) |
| Primary users | Student/university/small-sat team members preparing evidence. |
| Secondary users | Qualified engineering, agency, or regulatory reviewers who inspect the evidence trail and record their own decisions. |
| Tone | Precise, calm, technical, honest. Confident about structure, humble about conclusions. |

**Stack (decided):** React 18 + TypeScript (strict) + Vite, React Router, CSS custom properties + CSS Modules (or Tailwind only if justified in the plan), Motion (Framer Motion) or GSAP + ScrollTrigger *only where justified by the animation audit*, Vitest + React Testing Library, Playwright, axe-core. Backend target: FastAPI + PostgreSQL (typed API contract only for now, see §4.7).

---

## 2. LEGAL, IP, AND REPLICATION BOUNDARIES (NON-NEGOTIABLE)

You are reproducing a **design language and interaction quality**, not cloning a company's website.

- **Do NOT copy:** logos, brand names, text/copy, photographs, illustrations, icons, video, 3D models, fonts that require a license, or source code from the reference.
- **DO reproduce:** layout rhythm, grid proportions, spacing scale, type hierarchy (with licensed/open substitutes), color *relationships* (derive an original palette inspired by the observed one), motion language (durations, easing character, scroll choreography), component behaviors.
- All imagery is **original**: CSS/SVG/canvas graphics, generated geometric/orbital diagrams, or openly licensed assets with the license recorded in `ASSETS.md`.
- If the reference's fonts are identified, record them in the analysis but use open-licensed alternatives (e.g., Inter, Space Grotesk, IBM Plex Sans/Mono, Sora, Manrope) unless the user holds a license.
- Respect `robots.txt` and site terms: inspect as a normal visitor would (browser, DevTools, view-source). No scraping of bulk assets, no hotlinking reference assets into the new project.
- Do not reproduce any reference-specific business claims (satellite services, pricing, mission heritage, customer names).

---

## 3. HONESTY, SAFETY, AND SCOPE GUARDRAILS (PRODUCT-LEVEL)

OrbitScore is an **evidence-preparation tool**. It is NOT a compliance, certification, or safety-decision system.

### 3.1 Forbidden claims and behaviors (enforce in copy, UI, exports, and tests)
The product must never state or imply that it: certifies a mission; establishes legal/regulatory compliance; approves, passes, or "clears" a mission; assesses collision/debris/orbital risk; produces a readiness score, grade, percentage, traffic-light "safe" status, or ranking; replaces qualified review; or is an official filing.

### 3.2 Required honest-status system
- A persistent, accessible **Status Banner** and per-feature **Status Badges** using exactly these labels: `DEMO / MOCK`, `SYNTHETIC DATA`, `LOCAL ONLY (not saved)`, `NOT IMPLEMENTED`, `LIVE`. In this build **nothing is `LIVE`**.
- Landing page includes a "What OrbitScore is / is not" section.
- Any synthetic data is visibly tagged `SYNTHETIC` wherever it appears, including inside exports.
- Persistence in this build: in-memory state with optional browser `localStorage` clearly labeled "stored only in this browser, not durable, not private from other users of this device". Provide a "Clear all local data" control.
- No fake auth screens. If a sign-in affordance appears in the design, it routes to a "Not implemented in this build" panel that states the production plan (authentication + authorization before real mission materials).

### 3.3 Evidence and finding vocabulary (single source of truth)
**Evidence states** (exactly five): `confirmed`, `unconfirmed`, `missing`, `conflicting`, `out-of-scope`.
- Gaps are never auto-filled. Uncertainty is never treated as a pass.
- State transitions to `confirmed` require an explicit human action recorded with actor label and timestamp.
- Each state gets a distinct **icon + label + color** (never color alone; WCAG 1.4.1).

**Finding outcomes** (software-generated, deterministic): `Documented`, `Needs attention: missing`, `Needs attention: conflicting`, `Needs attention: unconfirmed`, `Not applicable (out of profile scope)`.
- Do **not** use pass/fail/compliant/safe/risk wording.
- **Software findings and human review decisions are separate objects, separate UI regions, and separate export sections.** A human decision never edits a finding; it references it.

**Review decision values** (human-recorded): `Accepted for packet`, `Needs more evidence`, `Disputed`, `Deferred to specialist`, `Noted – no action`. Each requires reviewer name (free text), role label, timestamp, and optional comment. These are **not** "approved/rejected."

---

## 4. FUNCTIONAL REQUIREMENTS (WHAT THE APP MUST ACTUALLY DO)

### 4.1 Core flow (a guided, resumable stepper)
`Mission context → Evidence register → Confirm inputs → Select profile → Run deterministic checks → Findings → Human review → Export packet`

Rules: later steps are visibly gated by earlier ones (with a reason shown, not a silent disable). Users can go backward; changing upstream data marks downstream results **stale** (badge + prompt to re-run). Export is disabled until every finding has at least one human review entry or an explicit "Deferred to specialist," and the reason is displayed.

### 4.2 Data model (TypeScript types and mirrored OpenAPI schema)

```ts
Mission { id, name, objectType: 'cubesat'|'smallsat'|'payload'|'other', description,
          orbitRegimeDeclared?: string, plannedLaunchWindow?: string,
          teamName, isSynthetic: boolean, createdAt, updatedAt }
EvidenceItem { id, missionId, parameterKey, label, value, unit, valueType,
               state: EvidenceState, source: { documentTitle, documentVersion?, documentDate?, locator /* page or section */, uri? },
               notes, enteredBy, enteredAt, confirmedBy?, confirmedAt?, isSynthetic }
Profile { id, version, title, description, applicability: Rule[], limitations: string[], checks: CheckDef[], status: 'demo' }
CheckDef { id, title, description, requiredParameterKeys, logic /* deterministic, documented */, rationale }
CheckRun { id, missionId, profileId, profileVersion, startedAt, inputSnapshot: EvidenceItem[] (frozen), results: CheckResult[] }
Finding { id, checkRunId, checkId, outcome, evidenceRefs: string[], message, whyThisOutcome }
ReviewDecision { id, findingId, decision, reviewerName, reviewerRole, comment, decidedAt }
OpenIssue { id, missionId, findingId?, text, status: 'open'|'resolved', raisedBy, raisedAt }
ExportPacket { id, missionId, generatedAt, profileId, profileVersion, appVersion, sections, limitationsText }
```

A `CheckRun` stores a **frozen input snapshot** so findings remain reproducible after evidence changes.

### 4.3 Demo profile (illustrative, synthetic, NOT a real regulatory profile)
Ship ONE profile: **`demo-evidence-completeness` v0.1.0** – "Illustrative Mission Evidence Completeness Profile (synthetic; not derived from any regulation or agency requirement)."
- **Applicability gate:** applies only to `objectType` in {cubesat, smallsat}; otherwise outputs `Not applicable` and explains why. Show applicability result before checks.
- **Checks (all deterministic, each shown with inputs, logic description, and result):**
  1. `C-01` Required parameters present (mass, dimensions, declared orbit regime, deployment/launch date, primary contact document).
  2. `C-02` Units present and from an allowed unit list per parameter.
  3. `C-03` Cross-source consistency: same `parameterKey` with differing values across sources, beyond a declared tolerance, → conflicting.
  4. `C-04` Source traceability: every evidence item has document + locator.
  5. `C-05` Version/date currency: flag items whose source date is older than a configurable reference date (user-set, defaults to the mission's context date).
  6. `C-06` Confirmation status: any evidence item still `unconfirmed` that a check depends on.
- Display "What this profile does NOT cover" prominently (e.g., no orbital-risk analysis, no regulatory interpretation, no engineering adequacy judgment).
- Implement checks as **pure functions in a standalone module** (`/src/profiles/`), with unit tests, importable by a future Python port. Include a human-readable rule table page.

### 4.4 Synthetic demo scenario: "Asteria-3" (clearly labeled SYNTHETIC)
A fictional 3U CubeSat from a fictional university team. Must include, at minimum:
- **Conflicting:** mass is 3.9 kg in `Mission Overview v2` p.4 and 4.3 kg in `Mass Budget Rev B` §2.1.
- **Missing:** no deployment/launch date evidence at all.
- **Unconfirmed:** battery energy value entered from a slide deck, never confirmed.
- **Out-of-scope:** a propulsion-related item recorded for a payload the mission does not carry.
- **Stale:** one source document dated before the reference date.
- **Documented:** several confirmed items with full citations.
- A second tiny mission with `objectType: 'other'` so the "Not applicable" path is demonstrable.
Include a "Reset demo" button and a visible `SYNTHETIC` tag on every screen that shows this data.

### 4.5 Human confirmation and assistive extraction
- Confirming an item opens a side panel showing value, unit, **source citation and locator**, and a confirm/edit/mark-conflicting action.
- **AI extraction is NOT built.** Provide a disabled, honestly labeled "Assisted extraction – planned, not implemented" entry point and a documented interface contract (`ExtractionSuggestion { value, unit, confidence, sourceLocator, quotedSpan }`) with the rules: suggestions are never auto-accepted, always show uncertainty and source location, and never produce findings or review decisions. The core workflow must be fully usable without it.

### 4.6 Cited export (review packet)
- Formats: **Markdown and printable HTML (print-to-PDF via browser print stylesheet)**; plus JSON. No server rendering is needed.
- Sections: cover (mission, SYNTHETIC tag if applicable, generated timestamp, app version) → profile/version and applicability → limitations & non-claims → evidence register (with citations and states) → check run inputs → findings (with evidence references) → human review decisions (separate section) → open issues → source index.
- Every finding row lists evidence IDs and the check ID. Footer on every page: "Evidence-preparation packet. Not a certification, compliance determination, or official filing."
- Export is blocked with a clear message until the §4.1 review gate is met.

### 4.7 Frontend-only vs backend-required
| Capability | This build | Production plan |
|---|---|---|
| Mission/evidence CRUD | In-memory + optional localStorage (`LOCAL ONLY`) | FastAPI + PostgreSQL + migrations |
| Check engine | Pure TS module | Python port or shared spec; versioned and independently reviewable |
| Auth/roles | Not implemented | AuthN/AuthZ before real materials |
| File upload | Not implemented (source *locations* are text/URI only) | Object storage + scanning |
| AI extraction | Not implemented | Assistive only |
| Audit log | Client-side event list, labeled non-tamper-proof | Append-only server log |
Define a typed API client interface (`/src/api/`) with a `LocalMockAdapter` now and an `HttpAdapter` stub documenting expected endpoints. Include `openapi.draft.yaml`.

---

## 5. PHASE ONE: INVESTIGATE THE REFERENCE

### 5.0 Tooling check and fallbacks (do this first)
1. Determine what you can actually do: browser automation (Playwright/Chrome tool), DevTools access, screenshot capture, page fetch, viewport resizing.
2. Write the capability result to the top of `REFERENCE_ANALYSIS.md`.
3. **If you cannot render the site in a browser:** fall back to fetching HTML/CSS/JS, parsing computed structure and CSS variables, and mark all motion/visual findings `[HYPOTHESIS]`/`[LOW CONFIDENCE]`. Do not fabricate observations. Tell the user plainly what was and wasn't inspected, then proceed with an explicitly reasoned adaptation.
4. Save screenshots to `/docs/reference/screenshots/` (analysis use only, not shipped).

### 5.1 Exploration protocol (record a coverage log)
Create a **coverage table**: page/URL, sections inspected, interactions tested, viewports tested, what was NOT inspected and why.
- Start at `/space-service/`, then the homepage and 2-4 other internal pages that reveal distinct layouts/components.
- At **1920, 1440, 1024, 768, 390 px** widths: scroll in ~25% viewport increments, screenshot each stop, record sections, sticky/pinned elements, section transitions.
- Reload and capture the load sequence (record at 0, 250, 500, 1000, 2000 ms where tooling allows). Test with and without cursor movement.
- Test: nav (hover/dropdown/mobile menu), every button/card/tab/accordion/form/carousel, focus states via keyboard Tab, `prefers-reduced-motion`.
- Extract via DevTools: computed fonts (`font-family`, weight, size, line-height, letter-spacing), CSS custom properties on `:root`, container max-widths, grid templates, z-indexes, transition/animation declarations, `@keyframes`, scroll-related JS/library signatures (GSAP/ScrollTrigger/Lenis/Framer/Three/Lottie) from network/script inspection. Mark each finding with its evidence label.

### 5.2 Required analysis outputs (in `REFERENCE_ANALYSIS.md`)
1. **Color token table** (Token | Value | Usage | Evidence label). Only measured values. Note scroll-dependent color changes.
2. **Typography**: families, scale per breakpoint, tracking, case, special text effects (split/reveal/outline).
3. **Layout**: max widths, gutters, grid columns, vertical rhythm, where content is constrained vs full-bleed.
4. **Effects**: radii, borders, shadows, blur, gradients, textures, masks, glows. Rank by identity-importance (core / supporting / minor).
5. **Section-by-section breakdown** with IDs (`NAV-01`, `HERO-01`, `SEC-xx`, `CARD-xx`, `FOOTER-01`...), each with: position, background, container, grid, text hierarchy, assets, components, interactions, motion, responsive behavior, relation to neighbors. Plus a component tree.
6. **Animation audit table**, one row per animation with ID (`ANI-xx`), target, initial/final state, trigger, duration, delay, easing, transform values, stagger, repetition, scroll-linked or one-shot, reversible, exit behavior, mobile behavior, reduced-motion treatment, recommended implementation, **confidence**.
7. **Interaction inventory**: element, states (default/hover/focus/active/disabled), action, outcome.
8. **Asset inventory**: type (raster/SVG/video/canvas/WebGL), aspect ratio, crop, animation, and a *replacement strategy* using original assets.
9. **Header/footer/closing-section** deep dive (heights, sticky behavior, scrolled-state changes, mobile menu choreography).
10. **Responsive table** separating **observed breakpoints** from **recommended breakpoints**.
11. **Performance observations** (hero media weight, fonts loaded, scroll-jank risks).
12. **Accessibility observations** of the reference (contrast, focus, keyboard, reduced motion), to improve on, not copy.
13. **Open questions and unobserved items.**

**Gate:** do not start Phase Two until `REFERENCE_ANALYSIS.md` exists and the coverage log is complete.

---

## 6. PHASE TWO-A: DESIGN SYSTEM AND PLAN (still no app code)

### `DESIGN_SYSTEM.md`
Derived **original** tokens: color (including 5 evidence-state colors with icon/label pairings, each meeting WCAG AA on both light and dark surfaces), typography scale (fluid `clamp()` where the reference scales), spacing, layout (container widths, gutters, breakpoints), radii, shadows, borders, motion (durations, easings as `cubic-bezier`, stagger), z-index scale, focus-ring spec. Implement as CSS custom properties. Specify each component (purpose, variants, states, responsive behavior, a11y requirements): Header/Nav, Button (primary/secondary/ghost/danger-free), Section, Card, StatusBadge, StateChip, StatusBanner, Stepper, DataTable (evidence register), SidePanel, Dialog, Tabs, Accordion, Tooltip, Toast, CitationLink, FindingCard, ReviewDecisionForm, ExportPreview, Footer.

### `IMPLEMENTATION_PLAN.md`
Must include: page architecture; route map; component hierarchy; **feature-mapping table** (My Feature | Section/Route | Reference inspiration | Interactions | Needs backend? | Test); animation implementation map (ANI-id → technique → reduced-motion fallback); interaction map; responsive spec; asset list (all original); proposed folder structure; state-management choice (e.g., Zustand or Context+reducer, justify); build sequence in vertical slices; assumptions; risks.

**Suggested routes:** `/` (marketing/overview, reference-style), `/how-it-works`, `/profiles` (profile + rule table + limitations), `/app` (workspace shell), `/app/missions`, `/app/missions/:id/{context|evidence|confirm|profile|findings|review|export}`, `/about-limits` (what it is/isn't), `/status` (honest implementation status), `*` 404.

**Landing page section order (adapt to the reference's actual rhythm after analysis):** header → hero (headline, honest subline, CTA "Open the Asteria-3 demo", orbital evidence-trail visual) → "What it is / is not" → workflow stepper (animated, scroll-linked) → evidence-states explainer (interactive five-state demo) → traceability showcase (finding ⇄ evidence ⇄ rule hover-linked diagram) → human review vs software findings split → sample packet preview → honest status/roadmap → closing CTA → footer with limitations disclaimer.

---

## 7. PHASE TWO-B: BUILD

### 7.1 Safe workspace handling
Inspect the workspace first. If a project already exists, do not overwrite; create a subfolder or ask only if truly blocked. Otherwise scaffold with Vite + React + TS strict. Commit early and often (small conventional commits) if git is available.

### 7.2 Build order (vertical slices; each slice must run before the next)
1. Scaffold, tooling (ESLint, Prettier, Vitest, Playwright, axe), tokens, global styles, fonts (self-hosted, `font-display: swap`).
2. Layout shell: Header, Footer, Status Banner, routing, 404.
3. Domain types + check-engine module + **unit tests** (including conflicting/missing/out-of-scope/N-A cases).
4. Asteria-3 fixture + state store + localStorage adapter + reset.
5. Workspace flow: context → evidence register → confirmation panel.
6. Profile selection + applicability + check run + findings view with traceability links.
7. Review workflow + open issues + export gating.
8. Export generator (MD/HTML/JSON) + print stylesheet + tests.
9. Landing page, sections, and **motion layer** (added after function works).
10. Responsive pass, a11y pass, performance pass.
11. Visual validation loop (§9), documentation.

### 7.3 Interaction integrity
Every visible control must do something real or be explicitly rendered as `NOT IMPLEMENTED` with explanation. No dead buttons, `href="#"`, lorem ipsum, or placeholder charts. Empty, loading, error, and stale states must be designed for every data view.

### 7.4 Motion rules
- Motion must trace to an `ANI-xx` entry in the audit. No ungrounded animation.
- Animate only `transform` and `opacity` where possible; avoid layout-thrashing scroll handlers (use IntersectionObserver or scroll-timeline/library with throttling).
- `prefers-reduced-motion: reduce` → no parallax/pinning/auto-motion; replace with instant or simple fades; keep information identical.
- No motion may carry essential information without a static equivalent.
- On touch/mobile: simplify or remove pinned/horizontal scroll effects unless the reference proves they work well there.

### 7.5 Accessibility baseline (WCAG 2.2 AA)
Semantic landmarks, one `h1` per page, logical heading order, skip link, visible focus (≥3:1), full keyboard operability (menus, dialogs with focus trap and Esc, side panel, stepper), ARIA only where needed, `aria-live` for check-run results and toasts, tables with proper headers, target size ≥ 24×24 CSS px (aim 44 on touch), contrast ≥ 4.5:1 text / 3:1 UI, no color-only meaning, labels and error messages tied to inputs, `lang` set, print stylesheet for the packet.

### 7.6 Copy and microcopy rules
Write original copy. Plain language, no hype, no superlatives about safety/readiness. Ban list (lint it in tests over `/src` and export output): `certified`, `compliant`, `approved`, `guaranteed`, `safe to launch`, `risk score`, `readiness score`, `score of`, `pass/fail`, `cleared`, `ready for launch`. The lint must allow the exact brand token `OrbitScore` and the approved disclaimer sentence, and fail on any other use of "score" in `/src` copy or export output. Allowed phrasing examples: "documented", "needs attention", "not yet confirmed", "for reviewer consideration".

---

## 8. PERFORMANCE BUDGETS
Lighthouse (mobile, throttled) on landing: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90. LCP < 2.5 s, CLS < 0.05, INP < 200 ms. Initial JS ≤ 200 KB gzipped (route-split the app shell and the animation library). Images AVIF/WebP with explicit dimensions; no autoplay video unless justified. Fonts ≤ 2 families, ≤ 4 files, preloaded critical.

---

## 9. VALIDATION (REQUIRED, NOT OPTIONAL)

1. **Visual comparison loop:** capture reference and new site at 1920/1440/1024/768/390 at matching scroll offsets; compare composition, section order/heights, widths, margins, type wrapping, colors-relationships, radii/shadows, card sizes, header/footer. Rank mismatches (structure → composition → dimensions → type/spacing → motion → states → decoration), fix the biggest first, repeat until major differences are closed. **Never claim "pixel-perfect"**; report measured deltas.
2. **Functional tests:** unit (check engine, state transitions, export gating, banned-wording lint), component tests, and Playwright E2E for the full flow on Asteria-3: reach conflicting/missing/unconfirmed findings → record reviews → export blocked → export unblocked → packet contains required sections and disclaimer. Also: `Other` mission → Not applicable path; stale-result path after editing evidence.
3. **Quality gates:** `tsc --noEmit`, lint, tests, build all green; axe has zero serious/critical issues on every route; no horizontal overflow at any tested width (automated check); reduced-motion screenshot run; keyboard-only walkthrough of the full flow.
4. Write **`VALIDATION_REPORT.md`**: tests run with results, screenshots before/after, remaining discrepancies, known limitations, unimplemented backend dependencies, honest-status audit (every mock labeled).

---

## 10. DELIVERABLES (all written to disk)

| File | Contents |
|---|---|
| `REFERENCE_ANALYSIS.md` | §5.2 outputs with evidence labels and coverage log |
| `DESIGN_SYSTEM.md` | Tokens + component specs |
| `IMPLEMENTATION_PLAN.md` | Architecture, mapping, build order |
| `ASSUMPTIONS.md` | Every default you chose |
| `ASSETS.md` | Every asset and its origin/license |
| `PROFILE_SPEC.md` | Demo profile, checks, applicability, limitations, versioning policy |
| `openapi.draft.yaml` | Future FastAPI contract |
| `/app` (frontend project) | Runnable app, tests, README with run instructions |
| `VALIDATION_REPORT.md` | §9 results |
| `PROGRESS.md` | Live checkpoint log (see §11) |

---

## 11. CHECKPOINTS, CONTEXT MANAGEMENT, AND REPORTING

- Maintain `PROGRESS.md`: current phase, completed items, next 3 actions, blockers, decisions. Update after each build slice.
- If context is running low, finish the current slice, update `PROGRESS.md`, and stop cleanly, because the next session resumes from it.
- Use subagents/parallel work for independent items only (e.g., per-page reference inspection, asset generation); never for tightly coupled edits.
- Final message to the user: ≤ 10 lines: what exists, how to run it, what's verified (with numbers), what's mocked, top 3 remaining gaps. No overclaiming.

---

## 12. DEFINITION OF DONE

All of the following are true: reference coverage log complete with honest limits; every analysis claim labeled; all five evidence states and all finding/decision separations work end-to-end; Asteria-3 shows conflicting, missing, unconfirmed, out-of-scope, and stale cases; export gated and includes citations, profile/version, limitations, and separate review decisions; no forbidden claims anywhere (lint passes); every mock is labeled; landing page and app are responsive with no overflow; motion is grounded in the audit and respects reduced motion; accessibility, performance, and test gates met or documented as failing with reasons; `VALIDATION_REPORT.md` is truthful.

**BEGIN NOW** with §5.0 (tooling check), then §5.1. Do not write application code until `REFERENCE_ANALYSIS.md`, `DESIGN_SYSTEM.md`, and `IMPLEMENTATION_PLAN.md` exist.
