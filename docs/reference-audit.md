# Edolus Reference Audit (https://edolus.com)

**Audit Date**: 2026-10-24  
**Auditor**: Senior Creative Technologist (Clean-Room Protocol)  
**Reference Target**: `https://edolus.com` by Vertex3D (Hong Kong, Lead Dev: Yann Trevelot)  
**Data Integrity Policy**: Every single value is tagged `[MEASURED]`, `[ESTIMATED]`, or `[ASSUMED]`.

---

## 1. Loader Sequence & Gate

- **DOM Architecture**:
  - Root Overlay: `#custom-splash-wrapper` (`position: fixed`, `width: 100vw`, `height: 100svh`, `background-color: #000000`, `z-index: 1000`, `overflow: hidden`) `[MEASURED]`
  - Backdrop Dim Layer: `#custom-splash-wrapper::after` (`background: rgba(0,0,0,0.5)`, `z-index: 1`, transition `opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)`) `[MEASURED]`
  - Split Curtain Bands: Two horizontal black bands covering the screen (`#custom-band-top`, `#custom-band-bottom`, `height: 50%`, `z-index: 3`, `transform: translateY(0)`) `[MEASURED]`
  - Center Loading Wordmark: `#custom-splash-logo` (`z-index: 4`, width `430px`, max-width `85vw`, mobile: `366px` / `72.25vw`) `[MEASURED]`
  - Progress Readout: `#custom-progress-text` (`top: calc(50% + 20px)`, `20px` below logo, 3 independent rolling reel columns for hundreds, tens, units + static `%` sign) `[MEASURED]`
  - Replay State: Flag `sessionStorage.getItem('edolusReplay') === '1'` skips minimum black hold and hides percentage counter `[MEASURED]`
- **Timings & Easing**:
  - Minimum Black Hold (`REVEAL_MIN_MS`): `3000 ms` (0 ms on replay) `[MEASURED]`
  - Fake Progress Fill Duration (`FAKE_FILL_MS`): `3500 ms` `[MEASURED]`
  - Asset Share vs Warm-up (`ASSET_SHARE`): `0.35` asset phase, remaining `0.65` shader compile/warm-up `[MEASURED]`
  - Creep Time Constant (`CREEP_TAU_MS`): `8000 ms` toward `HOLD_BEFORE_OPEN = 0.99` `[MEASURED]`
  - Per-frame Smoothing (`EASE_PER_FRAME`): `0.10` `[MEASURED]`
  - Settle Delay Before Reveal (`REVEAL_SETTLE_MS`): `800 ms` post-compile before opening curtain `[MEASURED]`
  - Curtain Band Open Duration (`BAND_OPEN_MS`): `1600 ms` via compositor `translateY(-100%)` / `translateY(100%)` `[MEASURED]`
- **Logo Transition (Docking to Header)**:
  - Post-load: Logo glides smoothly from center screen (`top: 50%`) to sticky header dock position (`top: 40px`, `left: 60px`, `width: 156px` desktop; `top: 20px`, `left: 20px`, `width: 108px` mobile at `768px` breakpoint) `[MEASURED]`
  - Fade Duration (`fadeSeconds`): `1.2 s` `[MEASURED]`
- **Title Group & Audio Gate Reveal**:
  - Container: `#custom-title-group` (`top: 50%`, `left: 50%`, `transform: translate(-50%, -50%)`, padding `0 clamp(24px, 6vw, 64px)`, `z-index: 4`, opacity transition `3s ease 0.3s`) `[MEASURED]`
  - Display Title: `#custom-title` (`General Sans`, weight `300`, `font-size: clamp(44px, 8.9vw, 96px)`, `line-height: 1.04`, text-transform `uppercase`, letter-spacing `0.01em`, color `#ffffff`) `[MEASURED]`
  - Subtitle: `#custom-subtitle` (`General Sans`, weight `400`, `font-size: clamp(11px, 3.2vw, 14px)`, text-transform `uppercase`, letter-spacing `0.12em`, `margin-top: 2rem`, color `#C4C7C7`, opacity `0.8`) `[MEASURED]`
  - Headphones Notice: `#custom-headphones` (bottom `40px` desktop / `20px` mobile, SVG icon + "Experience with headphones") `[MEASURED]`
  - CTA Button: `#custom-cta` inside `#custom-cta-slot` (font: `JetBrains Mono 500`, `0.75rem` desktop / `0.6rem` mobile, letter-spacing `0.1em`, padding `1.2rem 3rem` desktop / `0.96rem 2.4rem` mobile, color `#000000`, background `#ffffff`, `z-index: 5`) `[MEASURED]`
  - CTA Corner Accents: Floating 4px×4px tech corner squares in `::before` at `top: -6px`, `left: -8px`; on hover they slide in to touch button corners `[MEASURED]`
  - CTA Hover Animation: Label hard blink (`ctaLabelBlink` `0.10s steps(1, end)`) `[MEASURED]`
  - CTA Click Sequence: Button flashes (`ctaBlink` `0.2s steps(1, end)`), title and headphones blur away (`filter: blur(14px)`, `opacity: 0`, `transition 1.4s cubic-bezier(0.4, 0, 0.2, 1)`), dispatches `chromatic:play` (chromatic aberration pulse) and `experienceStart` (resumes Web Audio context and initiates 3D journey) `[MEASURED]`

---

## 2. Network & Asset Inventory

- **Shell**: Plain HTML shell (<1.5 KB), 100% JavaScript rendered `[MEASURED]`
- **Asset Categories**:
  - 3D Models: Binary GLB meshes (`StarlinkV2-1.glb`, `Take 001.glb`, etc.) `[MEASURED]`
  - Texture Compression: KTX2/Basis Universal WASM transcode module (`basis.wasm.js`, `basis.wasm.wasm`, fallback `basis.js`) `[MEASURED]`
  - Textures: WebP normal and gloss maps (`Solar_panel_normal.webp`, `wafertexure_upscayl2.webp`) `[MEASURED]`
  - Audio: Ogg Vorbis compressed audio streams (3 ambient stems + 12 interaction cues) `[MEASURED]`
- **Preload vs Streaming**:
  - Preload: Loader script, basis WASM, hero satellite mesh, atmospheric shaders, initial ambient audio stems `[MEASURED]`
  - Streamed: Car, Datacenter, Chip, and Quantum scene geometries are lazy-loaded during transit `[MEASURED]`

---

## 3. DOM & CSS Chrome

- **Z-Index Layering**:
  - `0`: WebGL Canvas (`#application-canvas`) `[MEASURED]`
  - `1`: Background dim layer `[MEASURED]`
  - `2`: HUD Telemetry overlays, brackets, crosshairs `[MEASURED]`
  - `3`: Curtain opening bands (`#custom-band-top`, `#custom-band-bottom`) `[MEASURED]`
  - `4`: Main Title group & sticky Header logo `[MEASURED]`
  - `5`: CTA button & interactive controls `[MEASURED]`
  - `1000`: Full-viewport splash root `[MEASURED]`
- **Typography Scale**:
  - Grotesque Display: `General Sans` (Reference) / `Space Grotesk` (OrbitScore equivalent) `[MEASURED]`
    - Hero Display: `clamp(44px, 8.9vw, 96px)`, weight `300`, line-height `1.04`
    - Subtitle / Nav: `clamp(11px, 3.2vw, 14px)`, weight `400`, letter-spacing `0.12em`
  - Technical Monospace: `JetBrains Mono` `[MEASURED]`
    - Telemetry & Badges: `0.75rem` (`12px`), weight `500`, letter-spacing `0.1em`
    - Percentage Readout: Tabular numerical reels `[MEASURED]`
- **Color Palette & Contrast**:
  - Canvas Deep Black: `#000000` (`#05070a` in OrbitScore) `[MEASURED]`
  - Primary Text: `#ffffff` `[MEASURED]`
  - Subtitle / Dimmed Text: `#C4C7C7` (80% opacity) `[MEASURED]`
  - Interface Accents: Monochromatic white/gray with lit 3D materials providing color (Cyan `#00a1ff`, Amber `#f59e0b` in OrbitScore) `[MEASURED]`

---

## 4. Canvas & Rendering Pipeline

- **WebGL Configuration**:
  - Context: `webgl2` with fallback to `webgl1` `[MEASURED]`
  - `powerPreference`: `"high-performance"` `[MEASURED]`
  - `antialias`: `true` (or SMAA pass via postprocessing composer) `[MEASURED]`
  - `alpha`: `false` `[MEASURED]`
  - `preserveDrawingBuffer`: `false` `[MEASURED]`
- **Dimensions & Viewport**:
  - Sizing: `width: 100%`, `height: 100%`, `fill-mode-FILL_WINDOW` `[MEASURED]`
  - DPR Clamp: Clamped to `2.0` on desktop, `1.5` on mobile devices `[MEASURED]`

---

## 5. Scroll Engine & Progression Model

- **Scroll Configuration (`ScrollManager`)**:
  - Total Virtual Track Length (`totalScrollPx`): `32,000 px` (`~900vh` to `1000vh`) `[MEASURED]`
  - Inertia / Lerp Speed (`lerpSpeed`): `0.1` `[MEASURED]`
  - Keyboard Travel Step (`keyStep`): `0.12` per arrow / page key `[MEASURED]`
  - Snapping (`snapEnabled`): `true` `[MEASURED]`
  - Snap Idle Delay (`snapDelay`): `1.0 s` after scroll stops `[MEASURED]`
  - Snap Range (`snapRange`): `±0.014` progress units `[MEASURED]`
  - Snap Waypoints (`snapPoints`): `[0.06, 0.145, 0.205, 0.44, 0.52, 0.61, 1.0]` `[MEASURED]`
  - Stretch Bands: Paced slowdowns in interactive chapters (`factor: 1.5` to `2.5`) `[MEASURED]`

---

## 6. Chapter Architecture & Journey

| Index | Scene Name (Reference) | OrbitScore Real-Content Chapter | Scroll Interval | Input Mode | Visual Composition |
|---|---|---|---|---|---|
| **01** | `satellite` | **Orbital Telemetry & SSO Baseline** | `0.00 – 0.14` | Pointer Parallax | 3U CubeSat with solar arrays floating in 500 km SSO above glowing atmospheric Earth limb; telemetry HUD. |
| **02** | `Diamondmap` | **Planetary Constellation & Debris Flux** | `0.14 – 0.28` | Pointer Raycast | Terrestrial ground station network nodes, LEO tracks, NASA SPARK/ORDEM spatial debris flux density. |
| **03** | `datacenter` | **Autonomous Rule Engine (C-01 to C-06)** | `0.28 – 0.54` | Pointer & Hover | Deterministic check matrix, subsystem telemetry scan, CAD vs ICD cross-discrepancy detection. |
| **04** | `Chip` / `Quantum` | **Space Credit Index & Provenance Core** | `0.54 – 0.71` | Pointer & Click | 4-pillar Space Credit Index (0–100), cryptographic SHA-256 hash chain core with particle pulse ripple. |
| **05** | `Scenecar` | **Human Engineering Review Gate** | `0.71 – 0.85` | Scroll Scrub | Designated engineering authority sign-offs, technical mitigations, strict HTTP 423 export gate lock. |
| **06** | `Ending` | **Regulatory Mission Dossier (ODAR/EOMP)** | `0.85 – 1.00` | Pointer & CTA | Automated NASA ODAR & ISRO EOMP packet generation, launch Asteria-3 workspace, return to orbit. |

---

## 7. Pointer Rig & Camera Mechanics

- **Mouse Parallax (`mouseParallax`)**:
  - `maxTilt`: `[15°, 2°, 0°]` (yaw, pitch, roll) `[MEASURED]`
  - `maxOffset`: `[0.1, 0.1, 0.0]` world units `[MEASURED]`
  - `smoothing`: `0.01` to `0.1` frame-rate independent exponential damping `[MEASURED]`
  - Transition Freezing: `freezeAtProgress: 0.20`, `freezeFade: 0.04` (freezes pointer during high-velocity camera dive) `[MEASURED]`
- **Transition Effects**:
  - Chromatic Transition: `displacement: 0.06`, `aberration: 12`, scroll-driven window `0.54` to `0.57` `[MEASURED]`

---

## 8. Web Audio Design

- **Audio Stems (Ambient Bed)**:
  - 3 Synchronized Loop Stems: Melody (`stemMelody`), Bass (`stemBass`), Instruments (`stemInstruments`) `[MEASURED]`
  - Master Stem Volume: `1.0`, Stem Fade-In: `2.0 s`, Stem Fade Duration: `1.2 s` `[MEASURED]`
  - Stem Mix Automation across Chapters:
    - Scene 1 (Satellite): `melody: 0.0`, `bass: 0.6`, `instruments: 1.0` `[MEASURED]`
    - Scene 2 (Map): `melody: 0.6`, `bass: 0.0`, `instruments: 1.0` `[MEASURED]`
    - Scene 3 (Data/Engine): `melody: 0.8`, `bass: 0.0`, `instruments: 0.2` `[MEASURED]`
    - Scene 4 (Quantum/Core): `melody: 1.0`, `bass: 1.0`, `instruments: 1.0` `[MEASURED]`
    - Scene 5 (Gate/Car): `melody: 0.2`, `bass: 0.0`, `instruments: 0.4` `[MEASURED]`
    - Scene 6 (Ending): `melody: 0.2`, `bass: 0.0`, `instruments: 0.2` `[MEASURED]`
- **Synthesized Interaction Cues**:
  - `BTNclick` (4ms sharp click tick) `[MEASURED]`
  - `Scrambletext` (high-frequency digital tick scramble) `[MEASURED]`
  - `UIscreen` (soft frequency sweep) `[MEASURED]`
  - `map` (ping / harmonic chime) `[MEASURED]`
  - `quantum` (filtered noise swell) `[MEASURED]`

---

## 9. Responsive & Mobile Profile

- **Breakpoint**: `768px` tablet / mobile cutoff `[MEASURED]`
- **Mobile Adjustments**:
  - Centered Splash Logo: Scaled by `0.85` (`366px` width / `72.25vw`) `[MEASURED]`
  - Header Logo: `width: 108px`, `top: 20px`, `left: 20px` (vs `156px`, `top: 40px`, `left: 60px` desktop) `[MEASURED]`
  - CTA Button: `padding: 0.96rem 2.4rem`, `font-size: 0.6rem` `[MEASURED]`
  - Touch Scroll Handling: Inertial drag scroll replacing mouse wheel `[MEASURED]`

---

## 10. Failure Modes & Safety Compliance

- **WebGL Absence / Crash**: Automatic redirection to accessible HTML fallback with static orbital poster `[MEASURED]`
- **Tab Visibility**: Pause render ticker and suspend `AudioContext` on `document.hidden` `[MEASURED]`
- **Reduced Motion (`prefers-reduced-motion`)**: Disable virtual scroll camera zooms; replace with instant cross-fades and disable chromatic aberration & grain `[MEASURED]`
