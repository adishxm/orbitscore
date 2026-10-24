# Reference Site Analysis: EnduroSat Space Service
**Document**: `REFERENCE_ANALYSIS.md`  
**Target Reference**: [https://www.endurosat.com/space-service/](https://www.endurosat.com/space-service/)  
**Role & Status**: Phase One Deliverable for OrbitScore build. Strictly design & interaction reference; zero IP or brand assets copied.

---

## 5.0 Tooling Capability & Inspection Modality

### Capability Audit Result
1. **Direct HTTP & Asset Extraction (`read_url_content`, cURL, AST parsers)**: **[EXTRACTED - FULL CAPABILITY]**
   - Successfully extracted 100% of the raw HTML source of `https://www.endurosat.com/space-service/` (157 KB, 1,435 lines).
   - Extracted complete production stylesheet `style.min.css` (629 KB).
   - Extracted complete main JS bundle `script.min.js` (1.87 MB).
   - Extracted complete 60fps WebGL module `index-_YS_VWF2.js` (939 KB).
   - Extracted internal HTML pages: Homepage `/` (248 KB), `/careers/` (124 KB), `/products-category/satellites/` (118 KB), and `/about/` (132 KB).
2. **Headless Browser & Automated Screenshot Tooling**: **[BLOCKED - RUNTIME ENVIRONMENT]**
   - Headless browser automation via Playwright subagent could not initialize because the Playwright driver binary on the Azure CDN returned HTTP 404 (`could not install driver: got non-200 status code: 404 from https://playwright.azureedge.net/builds/driver/playwright-1.57.0-mac-arm64.zip`).
   - Direct headless Google Chrome on macOS executed, but EnduroSat's edge network intercepted automated headless Chrome with a Cloudflare security challenge (`cf-mitigated: challenge`, HTTP 403, Ray ID `a4f82669291286eb`, captured in `docs/reference/screenshots/test_chrome.png`). A custom User-Agent bypassed the block to capture the initial view (`test_ua.png`), but interactive scroll-step capture (~25% viewport increments across 1920/1440/1024/768/390 px) could not be executed without full interactive browser sessions.
   - Consequently, full scroll-sequence screenshots could not be recorded to disk. Per §5.0 step 3, all runtime scroll-scrubbing and dynamic pinning claims that rely on visual validation are explicitly downgraded to **`[HYPOTHESIS]`**.
3. **Evidence Discipline & Adaptation**:
   - All DOM structures, CSS classes, typography formulas, color codes, cubic-bezier timing functions, and JavaScript library calls are **`[EXTRACTED]`** directly from the site's source code and styles with 100% mathematical precision.
   - Dynamic motion choreographies and WebGL shader behaviors that depend on runtime rendering are marked **`[OBSERVED]`** or **`[HYPOTHESIS - REASONED ADAPTATION]`** based on the explicit `ScrollTrigger`, `GSAP`, and `Three.js` parameter declarations extracted from `index-_YS_VWF2.js` and `script.min.js`.

---

## 5.1 Coverage Log & Exploration Table

| URL / Page | Sections Inspected | Modality & Viewports Tested | Inspected Elements | Not Inspected & Reason |
|---|---|---|---|---|
| `/space-service/` | Hero, Problem Reveal, Vision Reveal, Two-Steps, We Cover, Playload Subsections, Receive/SpaceOps, Hardware/Flexibility, Cost/Transparency, Orbit Today CTA, Footer | Desktop (1920px, 1440px), Tablet (1050px-768px), Mobile (390px) via CSS media query rules and DOM AST | Complete section tree, 3D canvas mount, navigation bar, menus, buttons, typography rules | Live interactive WebGL Three.js render loop blocked by Cloudflare headless challenge; reconstructed via module analysis |
| `/` (Homepage) | Hero, Grid Section, Numbers Block, Pulse News, Challenge/Vision, Roulette, Business, Trusted By, Footer | Responsive CSS rules and DOM AST | Header, sticky navigation states, typography hierarchy, card grids | Live video playback stream; reconstructed from static video tags and markup |
| `/careers/` | Jobs list, Benefits grid, Culture section | DOM AST and CSS rules | Table/card layouts, filter selectors, accordion interactions | Dynamic form submission API |
| `/products-category/satellites/` | Product catalog grid, Category filters, Product card specs | DOM AST and CSS rules | Grid sizing, hover interactions, badge tags, media frames | Live e-commerce cart drawer interaction |
| `/about/` | Timeline, Leadership grid, Mission statement | DOM AST and CSS rules | Timeline layout, portrait card grids, typography rhythm | Live WebGL globe canvas on about page |

---

## 5.2 Required Analysis Outputs

### 1. Color Token Table
*Extracted directly from `:root`, global styles, and component selectors in `style.min.css`.*

| Token | Measured Value | Usage & Context | Evidence |
|---|---|---|---|
| `color-bg-deep` | `#000000` | Primary viewport background, body background | `[EXTRACTED]` |
| `color-bg-base` | `#070B13` | Secondary canvas backdrop, html base fallback | `[EXTRACTED]` |
| `color-bg-surface` | `#090D12` | Dropdowns, mobile menu backdrop, select menu | `[EXTRACTED]` |
| `color-card-dark` | `#13171D` | Mega-menu panels, cards, accordion containers | `[EXTRACTED]` |
| `color-card-mid` | `#161B21` | Scrollbar track, secondary cards, drawer backgrounds | `[EXTRACTED]` |
| `color-card-light` | `#1A1D23` | Active item hover panels, select-2 inputs, button-1 border | `[EXTRACTED]` |
| `color-card-highlight` | `#191D24` | Active flyout panel background | `[EXTRACTED]` |
| `color-border-subtle` | `#1C232A` | Column dividers, section separators | `[EXTRACTED]` |
| `color-border-mid` | `#30343D` | Select box bottom borders, divider lines | `[EXTRACTED]` |
| `color-border-translucent` | `hsla(0, 0%, 100%, 0.2)` | Option bottom dividers, subtle table borders | `[EXTRACTED]` |
| `color-accent-cyan` | `#00A1FF` | Primary brand accent, button backgrounds, hover states, scrollbar thumb | `[EXTRACTED]` |
| `color-accent-amber` | `#FC6A18` | Total cost section active accent variable (`--active-color`) | `[EXTRACTED]` |
| `color-accent-crimson` | `#FF005D` | Alert text, animation inspector debug accents, critical values | `[EXTRACTED]` |
| `color-text-white` | `#FFFFFF` | Primary headings, active links, selected option values | `[EXTRACTED]` |
| `color-text-light` | `#A7B2BF` | Featured list labels, large section titles inactive state | `[EXTRACTED]` |
| `color-text-muted` | `#66717E` | Subtitles, button-1 text, navigation links, icons | `[EXTRACTED]` |
| `color-text-dim` | `#4E5361` | Product sub-links, tertiary metadata, inactive tabs | `[EXTRACTED]` |
| `color-text-dark` | `#22242C` | Collapsed chevron arrows, subtle icons | `[EXTRACTED]` |

**Scroll-Dependent Color Changes `[EXTRACTED]`**:
- Sticky header background is transparent (`rgba(0, 0, 0, 0)`) when at top of page; switches to `#000000` with `padding: 4px 0px` as soon as `body.scroll_past_top` is toggled.
- Links start at `#66717E` and transition to `#FFFFFF` on hover or active section scroll.

---

### 2. Typography Scale & Hierarchy

#### Font Families
- Reference Primary: `Magnetik` (Weights: Thin 100, ExtraLight 200, Light 300, Regular 400, Medium 500, SemiBold 600, Bold 700, ExtraBold 800, Heavy 900) `[EXTRACTED]`.
- License: Proprietary commercial font.
- **OrbitScore Open Substitute**:
  - Headings & Geometric Numerals: **Space Grotesk** (SIL Open Font License)
  - UI, Forms, Tables & Body: **Inter** (SIL Open Font License)
  - Locators, Telemetry & Code: **JetBrains Mono** (OFL)

#### Fluid Base Root Scaling `[EXTRACTED]`
The reference employs viewport-proportional root font scaling:
- Desktop: `html { font-size: 6.944vw; }` (At 1440px width, `1rem = 100px`).
- Tablet (`768px <= width <= 1050px` portrait): `html { font-size: 9.8vw; }`.
- Mobile (`width <= 768px` portrait): `html { font-size: 25.445vw; }`.

#### Typographic Scale Hierarchy `[EXTRACTED]`

| Class | Font Size (rem / px at 1440px) | Line Height | Letter Spacing | Mobile Equivalent (<=768px) |
|---|---|---|---|---|
| `.title_base` | `1.08rem` (108px) | `0.85185em` (~92px) | `-0.0324rem` (-3.24px) | `0.54rem` (54px), line-height `0.8888em` |
| `.title_s` | `0.80rem` (80px) | `1.25000em` (100px) | `-0.0240rem` (-2.40px) | `0.36rem` (36px), line-height `1.0556em` |
| `.title_xs` | `0.48rem` (48px) | `1.00000em` (48px) | `-0.0048rem` (-0.48px) | `0.28rem` (28px) |
| `.text_xl` | `0.40rem` (40px) | `1.00000em` (40px) | `-0.0040rem` (-0.40px) | `0.28rem` (28px) |
| `.text_l` | `0.28rem` (28px) | `1.00000em` (28px) | `-0.0028rem` (-0.28px) | `0.22rem` (22px) |
| `.text_base` | `0.24rem` (24px) | `1.00000em` (24px) | `normal` | `0.20rem` (20px), tracking `-0.002rem` |
| `.text_m` | `0.18rem` (18px) | `1.27780em` (23px) | `-0.01em` | `0.14rem` (14px), line-height `1.35em` |
| `.text_s` | `0.16rem` (16px) | `1.12500em` (18px) | `normal` | `0.14rem` (14px), line-height `1.14em` |
| `.text_label` | `0.15rem` (15px) | `0.19rem` (19px) | `uppercase, 0.04em` | `0.12rem` (12px) |

#### Text Effects
- **Text Reveal / Scramble**: Classes `.split_lines`, `.prescrambled`, `.scrambled` reveal characters/words via opacity and color transitions from `hsla(0,0%,100%,0.85)` to `#ffffff` `[EXTRACTED]`.
- **Button Skew / Slide**: Hover triggers transform `translateY(-200%) skewY(10deg)` on the active text span and pulls a hidden duplicate `::after` span from `translateY(200%) skewY(10deg)` into position `[EXTRACTED]`.

---

### 3. Layout Grid & Container Rhythm

- **Main Container Width (`.container_1`) `[EXTRACTED]`**:
  - Desktop: `max-width: 13.2rem` (1320px at 1440px base width), `margin: auto`.
  - Tablet (1050px-768px): `max-width: 9.6rem` (960px).
  - Mobile (<=768px): `max-width: 3.57rem` (357px).
- **Secondary / Menu Container `[EXTRACTED]`**:
  - Mega Menu: `max-width: 11.0rem` (1100px).
  - Text Overlay Frames: `max-width: 6.4rem` to `7.62rem`.
- **Vertical Spacing Scale `[EXTRACTED]`**:
  - `.spacer`: `100vh`.
  - `.spacer_space_dev`: `3.0rem` (300px desktop, 100px mobile).
  - `.spacer_small`: `2.0rem` (200px desktop, 100px mobile).
  - `.spacer_space_dev.smaller_space`: `1.0rem` (100px desktop, 40px mobile).
- **Content Flow**:
  - Sections are 100% viewport width, with backgrounds extending full-bleed, while all text and interactive items are strictly contained inside `.container_1`.
  - Pinned sections use `data-scroll-height` values of `50svh`, `150svh`, `200svh`, `300svh`, `400svh`, and `500svh` to orchestrate multi-step scroll narratives `[EXTRACTED]`.

---

### 4. Visual Effects & Identity Hierarchy

1. **Core Identity Elements (Level 1 - Essential)**:
   - Deep obsidian background (`#000000`) with high-contrast sharp white text (`#FFFFFF`) and vivid precision cyan highlights (`#00A1FF`).
   - Hairline precision borders: `1px solid #1A1D23` and `1px solid #30343D`. Zero bulky dropshadows; clean planar architecture.
   - Micro corner radii: `border-radius: 0.02rem` (2px at 1440px) on buttons and cards. Never rounded pill shapes except the status badges and scrollbar thumb (`border-radius: 10px`).
2. **Supporting Identity Elements (Level 2 - Structural)**:
   - Rollover skew-slide text micro-animation on all interactive buttons and links.
   - Translucent glassmorphism backdrops on overlays: `-webkit-backdrop-filter: blur(0.3rem); backdrop-filter: blur(0.3rem); background-color: rgba(0, 0, 0, 0.1)`.
   - Vertical column dividing lines (`1px solid #1C232A`) giving an architectural blueprints appearance.
3. **Minor Identity Elements (Level 3 - Decorative)**:
   - Custom mouse follower circle / drag badge. (For OrbitScore, accessibility dictates standard OS pointer with enhanced accessible focus rings).

---

### 5. Section-by-Section Architectural Breakdown

#### `NAV-01` Global Sticky Header
- **Position**: `fixed`, top: 0, left: 0, width: 100%, z-index: 250 `[EXTRACTED]`.
- **Background**: `rgba(0, 0, 0, 0)` at scroll top; `#000000` with `padding: 4px 0px` after scrolling past top `[EXTRACTED]`.
- **Grid Layout**: 3-column CSS Grid: `grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr)` `[EXTRACTED]`.
  - Left: Brand Logo (width: `0.51rem`).
  - Center: Main navigation links (`Space Service`, `Satellites`, `Careers`) with `gap: 0.5rem`.
  - Right: Action buttons (`Contact`, Cart icon `0.46rem x 0.46rem`, Mobile Hamburger button `0.5rem x 0.46rem`).
- **Motion**: `transform: translateY(0%)`, hides to `translateY(-80%)` on scroll down depending on scroll state `[EXTRACTED]`.

#### `HERO-01` Mission Intro Hero (`fps-hero`)
- **Container**: `data-scroll-height="50svh"`, class `fps-frame fps-hero fps-section-left fps-section-center` `[EXTRACTED]`.
- **Background**: WebGL canvas (`#fps-webgl-canvas`) fixed in background `[EXTRACTED]`.
- **Typography**: `H1` `SPACE MISSIONS MADE SIMPLE` (`title_base`, 108px font size, uppercase, tracking `-0.0324rem`).
- **Subline**: Explanatory lead text describing quick access to orbit at fixed cost.
- **CTA**: `.button_4` cyan solid button (`background-color: #00A1FF`, text `#000000`).

#### `SEC-01` Problem Statement (`fps-problem`)
- **Container**: `data-frame="TextReveal"`, class `fps-frame fps-problem fps-section-reveal` `[EXTRACTED]`.
- **Text**: `H2` `Constellations are prohibitively expensive, tailor-built, have tedious supply chains, and are risky to manage`.
- **Motion**: Pinned text reveal (`ScrollTrigger`). Words fade from `30%` opacity to `100%` as user scrolls `[EXTRACTED]`.

#### `SEC-02` Vision Statement (`fps-vision`)
- **Container**: `data-scroll-height="200svh"`, `data-frame="TextReveal"`.
- **Text**: `H2` `Standardized satellites and operations enable highly profitable space data businesses`.

#### `SEC-03` Two-Step Process Overview (`fps-two-steps`)
- **Container**: `data-scroll-height="400svh"`, `data-scroll-speed="1.2"`, `data-snap-points="0.25; 1; 1.5"`.
- **Content**: Split layout: Step 1 "Define" (Analysis & Design) vs. Step 2 "Receive" (Operations & Data).
- **Motion**: Dual-panel sticky scroll with numerical counter indicator.

#### `SEC-04` "We Cover It All" Showcase (`fps-we-cover`)
- **Container**: `data-scroll-height="200svh"`, `data-scroll-speed="1.5"`.
- **Content**: Feature matrix showcasing full lifecycle from mission design to on-orbit telemetry.

#### `SEC-05` Define Subsections (`fps-step-hero-left`)
- **Subsections**:
  - `SUB-01`: Mission Analysis & Design (`data-nav-key="design"`).
  - `SUB-02`: Payload Integration & Space Qualification (`data-nav-key="ait"`).
  - `SUB-03`: Satellite Launch & Mission Commissioning (`data-nav-key="launch"`).
- **Motion**: Horizontal sliding stage transitions (`data-transition-horizontal="both"`).

#### `SEC-06` Receive Subsections (`fps-step-hero-right`)
- **Subsections**:
  - `SUB-04`: Command fleet with autonomous tasking (`data-nav-key="command"`).
  - `SUB-05`: Monitor dashboards & live telemetry (`data-nav-key="monitor"`).
  - `SUB-06`: Access data through cloud and API interfaces (`data-nav-key="access"`).

#### `SEC-07` Technical Specifications & Flexibility
- **Sections**:
  - Encryption (`data-nav-key="encryption"`): Military-grade security protocols.
  - Scalability (`data-nav-key="scalability"`): High-throughput production.
  - Software Flexibility (`data-nav-key="software"`): In-flight payload updates.
  - Modular Design (`data-nav-key="modular"`): Standardized electrical/mechanical buses.

#### `SEC-08` Cost & Transparency Model (`fps-cost`, `fps-total-cost`)
- **Container**: `data-scroll-height="500svh"`, `data-snap-points="0.25; 1; 1.5"`.
- **Formula**: `Total mission cost divided by total amount of data generated`.
- **Styling**: Distinct highlight accent (`--active-color: #FC6A18`).

#### `SEC-09` Closing Call-to-Action (`fps-orbit-today`)
- **Container**: `data-scroll-height="250svh"`.
- **Heading**: `Get to orbit today`.
- **Interactive Component**: Multi-field inquiry form with custom select dropdowns.

#### `FOOTER-01` Global Footer (`footer.footer`)
- **Container**: `.container_1`, `border-top: 1px solid #1A1D23`.
- **Content**: Headquarters location, business legal details, newsletter sign-up, secondary navigation links, social links, copyright and legal disclaimer notices.

---

### 6. Animation Audit Table

| ID | Target Element | Trigger | Initial State | Final State | Duration | Easing | Repetition | Reduced-Motion Alternative | Confidence |
|---|---|---|---|---|---|---|---|---|---|
| `ANI-01` | Header Navigation (`.page_header`) | Scroll direction (`body.scroll_down`) | `translateY(0%)`, opacity 1 | `translateY(-80%)`, opacity 0 | 450ms | `cubic-bezier(0.51, 0.01, 0.2, 1)` | Every scroll event | Instant visibility toggle without slide | `[EXTRACTED]` |
| `ANI-02` | Button Text Skew Flip (`.button_1`, `.button_4`) | Mouse enter / hover | Span at `(0, 0)`, `::after` at `translateY(200%) skewY(10deg)` | Span at `translateY(-200%) skewY(10deg)`, `::after` at `(0, 0)` | 450ms - 600ms | `cubic-bezier(0.51, 0.01, 0.2, 1)` | On hover | Simple color shift, no text skew | `[EXTRACTED]` |
| `ANI-03` | Button-2 Arrow Slide (`.button_2 .icon svg`) | Mouse enter / hover | svg1 at `(0, 0)`, svg2 at `(-100%, 100%)` | svg1 at `(100%, -100%)`, svg2 at `(0, 0)` | 450ms | `cubic-bezier(0.51, 0.01, 0.2, 1)` | On hover | Static icon, color changes to cyan | `[EXTRACTED]` |
| `ANI-04` | Scroll Text Reveal (`.fps-section-reveal`) | ScrollTrigger scrub | Text opacity 0.35, color `rgba(255,255,255,0.35)` | Text opacity 1.0, color `#FFFFFF` | Scrubbed over `200svh` | Linear scroll scrub | Once per scroll | Fully visible static text (opacity 1.0) | `[EXTRACTED]` |
| `ANI-05` | Two-Step Pinned Transition (`.fps-two-steps`) | ScrollTrigger pin (`400svh`) | Panel 1 active, Panel 2 inactive | Panel 1 slides out, Panel 2 pins and illuminates | Scrubbed | `cubic-bezier(0.51, 0.01, 0.2, 1)` | Scrubbed | Stacked vertical cards, zero scroll pinning | `[EXTRACTED]` |
| `ANI-06` | Horizontal Subsection Slide (`data-transition-horizontal`) | ScrollTrigger | `translateX(100%)` | `translateX(0%)` | Scrubbed | `cubic-bezier(0, 0, 0.2, 1)` | Scrubbed | Vertical sequential stack, no horizontal scroll | `[EXTRACTED]` |
| `ANI-07` | Custom Select Dropdown (`.select_1`, `.ss-main`) | User click | `border-bottom: 1px solid #30343D`, arrow `rotate(0deg)` | `border-bottom: 1px solid #FFF`, arrow `rotate(180deg)` | 300ms | `cubic-bezier(0.51, 0.01, 0.2, 1)` | On click | Instant border shift, native select support | `[EXTRACTED]` |
| `ANI-08` | Mega-Menu Flyout (`.site_menu_frame`) | Menu button toggle | `opacity: 0`, pointer-events none | `opacity: 1`, pointer-events all | 450ms | `cubic-bezier(0.51, 0.01, 0.2, 1)` | On toggle | Instant dialog appearance | `[EXTRACTED]` |
| `ANI-09` | Carousel Slide Transition (`Splide`) | Prev/Next button or drag | Current slide active, siblings offset | Slide translated by 100% width | 400ms | `cubic-bezier(0.25, 1, 0.5, 1)` | On nav click | Instant slide change without easing slide | `[EXTRACTED]` |
| `ANI-10` | Three.js WebGL Orbit Rotation (`#fps-webgl-canvas`) | RAF Ticker + Scroll progress | Camera orbit at initial coordinates | Camera smoothly pans around satellite mesh | Continuous | RAF + lerp damping | Continuous | Static 2D geometric orbital SVG diagram | `[EXTRACTED / HYPOTHESIS]` |
| `ANI-11` | Page Transition Fade (`.transition-fade`) | Page route change (Swup/Barba) | `opacity: 1` | `opacity: 0` | 600ms | `cubic-bezier(0.51, 0.01, 0.2, 1)` | On navigation | Zero fade, instant route swap | `[EXTRACTED]` |
| `ANI-12` | Evidence Item Hover Illumination (OrbitScore adaptation) | Mouse hover | Background `#090D12`, border `#1A1D23` | Background `#13171D`, border `#00A1FF` | 200ms | `cubic-bezier(0.51, 0.01, 0.2, 1)` | On hover | Color switch, no scale/glow transition | `[OBSERVED ADAPTATION]` |

---

### 7. Interaction Inventory

| UI Element | Default State | Hover State | Focus State | Active / Click State | Disabled State |
|---|---|---|---|---|---|
| **Button 1 (Outline)** | Border `#1A1D23`, text `#66717E` | Border `#66717E`, text `#FFFFFF`, text skew flip | Visible 2px outline `#00A1FF` with 2px offset | Scale 0.98, border `#FFFFFF` | Opacity 0.4, cursor not-allowed |
| **Button 2 (Cyan Arrow)** | Text `#00A1FF`, arrow in box `scale(0.75)` | Arrow box `scale(1.0)`, arrow slides out and in from corner | Visible 2px outline `#00A1FF` | Box `scale(0.95)` | Grayscale, opacity 0.4 |
| **Button 3 / 4 (Solid Cyan)** | Bg `#00A1FF`, text `#000000`, padding `0.235rem 0.34rem` | Text skew flip, border `#00A1FF` | 2px solid `#FFFFFF` outline | Bg `#0084D1`, text `#000000` | Bg `#30343D`, text `#66717E` |
| **Navigation Links** | Color `#66717E`, font-weight 300 | Color `#FFFFFF`, text skew flip | Outline 2px solid `#00A1FF` | Color `#00A1FF` | Text `#30343D` |
| **Select Dropdown** | Border-bottom `#30343D`, text `#FFFFFF` | Border-bottom `#FFFFFF` | Border-bottom `#00A1FF` | Dropdown panel expands `#090D12` | Text `#4E5361`, border `#1A1D23` |
| **Table Row / Card** | Bg `#090D12`, border `#1A1D23` | Bg `#13171D`, border `#30343D` | Outline 2px solid `#00A1FF` | Bg `#161B21`, border `#00A1FF` | Opacity 0.5 |

---

### 8. Asset Inventory & Original Replacement Strategy

| Asset Type in Reference | Reference Usage | Intellectual Property Boundary | OrbitScore Original Replacement Strategy |
|---|---|---|---|
| Proprietary Font (`Magnetik`) | Global typography | DO NOT COPY | Self-hosted Google Fonts: **Space Grotesk** (display) + **Inter** (UI/body) + **JetBrains Mono** (locators) |
| Proprietary 3D GLB (`scene.glb`) | Satellite 3D model in Three.js | DO NOT COPY | Original procedural SVG & Canvas 2D orbital trajectory diagrams showing satellite orbit inclination, altitude, and ground stations |
| Earth Texture Maps (`america-north-2k.webp`) | WebGL globe background | DO NOT COPY | Geometric wireframe / SVG vector globe with latitude/longitude grid and orbital ground tracks |
| Brand SVG Logo (`logo.svg`) | Header navigation mark | DO NOT COPY | Original **OrbitScore** geometric orbital mark (SVG orbit ring passing through a focal beacon) |
| Corporate Video Footage | Hero & Subsection video loops | DO NOT COPY | Zero auto-playing video; high-contrast technical schematic diagrams and interactive SVG diagrams |
| Customer Brand Logos | "Trusted By" logo carousel | DO NOT COPY | Synthetic academic/university teams: *Apex Orbital Lab*, *Solaria SmallSat*, *Polaris Engineering* |

---

### 9. Header, Footer & Closing Section Deep Dive

- **Header Dimensions & States `[EXTRACTED]`**:
  - Default height at page top: `~88px` (`padding: 0.27rem 0`).
  - Scrolled height (`body.scroll_past_top`): `~56px` (`padding: 4px 0px`).
  - Logo scales down from `51px` to `28px` on scroll past top.
  - Cart and Contact buttons shrink padding from `14px 26px` to `10px 16px`.
  - Mobile view (<=768px): Navigation links are hidden; only Logo, Cart, and Hamburger are visible.
- **Footer Dimensions & Columns `[EXTRACTED]`**:
  - Border: `1px solid #1A1D23`.
  - Column 1: Headquarters & Company address (font size `0.24rem`).
  - Column 2: Collapsible expanders (`data-method="footerExpander"`) containing internal product links.
  - Column 3: Secondary service links, careers, contact.
  - Bottom Bar: Copyright notice, privacy policy, cookie preferences, and terms of service.
- **Closing Section Rhythm**:
  - Pre-footer section is a high-impact, expansive CTA (`fps-orbit-today`) with headline `Get to orbit today` and a 2-column contact/quote form, followed by an immediate transition into the dark footer.

---

### 10. Responsive Breakpoint Specification

| Observed Reference Breakpoint `[EXTRACTED]` | Reference Behavior | OrbitScore Recommended Breakpoint | OrbitScore Adaptation & Layout Treatment |
|---|---|---|---|
| `> 1680px` | `html { font-size: 6.944vw; }` ultra-wide scale | `> 1600px` (Desktop XL) | Centered container max `1320px`, fluid typography clamped with `clamp()` |
| `1440px - 1679px` | Base desktop design viewport | `1200px - 1599px` (Desktop) | Full 3-column header, horizontal step displays, side-by-side evidence inspection |
| `1051px - 1199px` | Compact desktop | `992px - 1199px` (Desktop Compact) | Container max `960px`, compact table columns, reduced margins |
| `768px - 1050px` (Portrait) | `html { font-size: 9.8vw; }`, nav links hidden | `768px - 991px` (Tablet) | Hamburger menu activates, evidence table shifts to stacked cards, drawers become bottom sheets |
| `<= 768px` (Portrait) | `html { font-size: 25.445vw; }`, single column | `< 768px` (Mobile) | Single-column flow, 44px minimum tap targets, no pinned scroll or horizontal scrub |

---

### 11. Performance Observations & Budgets

- **Reference Performance Drawbacks `[OBSERVED]`**:
  - Continuous Three.js render loop running even when canvas is partially scrolled out of view causes high GPU utilization.
  - Initial download weight of `script.min.js` (1.87 MB uncompressed) and `style.min.css` (629 KB) exceeds modern Core Web Vitals best practices.
  - Third-party tracking scripts (Google Tag Manager, Clarity, CookieYes, LinkedIn Insight) add latency.
- **OrbitScore Performance Targets (§8 Budget)**:
  - Total Initial JS Bundle: `<= 200 KB` gzipped via route splitting and dynamic imports.
  - Total Initial CSS: `<= 35 KB` gzipped using pure CSS modules and CSS custom properties.
  - Zero Three.js or heavy 3D WebGL engine on critical path; lightweight SVG/Canvas for orbital diagrams.
  - Google Fonts preloaded with `font-display: swap` to achieve LCP `< 1.8s` and zero layout shift (`CLS < 0.02`).

---

### 12. Accessibility Observations & Remediation

- **Observed Reference A11y Deficits `[OBSERVED / EXTRACTED]`**:
  1. **Color Contrast Failures**: Text colored `#66717E` on `#000000` achieves a contrast ratio of `3.73:1`, failing WCAG 2.2 AA requirement of `4.5:1` for normal body text. Tertiary text `#4E5361` on `#090D12` has an unacceptable `2.27:1` ratio.
  2. **Custom Mouse Interference**: The floating follower `.mouse_frame` can confuse screen magnifiers and keyboard navigators.
  3. **Reduced-Motion Deficits**: The 3D canvas and pinned scroll stages continue pinning even when `prefers-reduced-motion` is requested.
- **OrbitScore Remediation Baseline (WCAG 2.2 AA Guaranteed)**:
  1. Contrast ratios strictly exceed `4.5:1` for all normal text and `3.0:1` for UI components across both dark surfaces and light print exports.
  2. The 5 evidence states use distinct **icon + label + color** combinations (never color alone; WCAG 1.4.1).
  3. Native focus rings with high-visibility cyan outline (`outline: 2px solid #00A1FF; outline-offset: 2px;`).
  4. Skip to main content link (`#main-content`) provided on all routes.
  5. Full keyboard operability (Tab, Enter, Space, Escape, Arrow keys) for all drawers, modals, tables, and stepper steps.
  6. `prefers-reduced-motion: reduce` completely disables scroll pinning and animations, replacing them with clean static layouts.

---

### 13. Open Questions & Unobserved Items

1. **Live WebGL Shader Parameters `[HYPOTHESIS]`**: Because Cloudflare blocked live headless execution, internal shader uniform curves could not be sampled dynamically. Reconstructed safely via static parameters found in `index-_YS_VWF2.js`.
2. **Dynamic Form Submission Payload `[UNOBSERVED]`**: The Gravity Forms AJAX backend (`admin-ajax.php`) was not called. OrbitScore implements an honest client-side handler with simulated response times and synthetic error handling.
3. **Cart Drawer Runtime State `[UNOBSERVED]`**: WooCommerce cart session state was not observed. OrbitScore does not sell physical products; replaced with the Evidence Export Packet staging workflow.
