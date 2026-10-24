# Edolus & OrbitScore Motion Specification

**Document**: Motion Language, Timeline Tables, and Camera Progression  
**Protocol Status**: Measured from Reference & Adapted to OrbitScore Clean-Room Implementation  
**Precedence**: Explicit Overrides > Measured Audit Values > Defaults  

---

## 1. Master Easing & Timing Tokens

All motion across the 3D camera rig, shader uniforms, HUD elements, and DOM overlays utilizes these standardized easing curves and duration tokens:

| Token Name | Curve / Formula | CSS / GSAP Representation | Usage Domain | Source Tag |
|---|---|---|---|---|
| `EASE_ENTRANCE` | Exponential Deceleration | `power3.out` / `cubic-bezier(0.215, 0.61, 0.355, 1)` | Staggered HUD reveals, badges, state chips | `[MEASURED]` |
| `EASE_HERO_REVEAL` | Strong Exponential Out | `expo.out` / `cubic-bezier(0.16, 1, 0.3, 1)` | Post-curtain camera dolly-in, title reveals | `[MEASURED]` |
| `EASE_TRANSITION` | Symmetrical Acceleration | `power3.inOut` / `cubic-bezier(0.645, 0.045, 0.355, 1)` | Curtain band opening, chapter camera shifts | `[MEASURED]` |
| `EASE_DOCK_LOGO` | Cubic Easing | `cubic-bezier(0.4, 0, 0.2, 1)` | Logo glide from center screen to header dock | `[MEASURED]` |
| `EASE_AMBIENT_LOOP` | Sine Wave | `sine.inOut` | Satellite gentle orbital roll, solar panel drift | `[MEASURED]` |
| `EASE_SCRUB` | Linear | `none` | Scroll-progress bound parameter progression | `[MEASURED]` |

### Frame-Rate Independent Damping
For pointer parallax and camera tracking, damping is calculated using exact exponential decay:
$$\Delta v = (v_{\text{target}} - v) \times (1 - e^{-k \cdot \Delta t})$$
- Pointer Parallax: $k = 5.0$, $\Delta t$ clamped to $\frac{1}{20}\text{ s}$ `[MEASURED]`
- Camera Travel Rig: $k = 2.5$, $\Delta t$ clamped to $\frac{1}{20}\text{ s}$ `[MEASURED]`
- Scroll Smoothing (`lerpSpeed`): $0.10$ `[MEASURED]`

---

## 2. Master Journey Progression & Chapter Timeline

The entire 3D journey is mapped across a normalized scroll domain $p \in [0.0, 1.0]$, corresponding to $32,000\text{ px}$ of virtual track length:

| Chapter # | Chapter Title | Scroll Range ($p$) | Snap Point | Camera Start $(x, y, z)$ | Camera LookAt $(x, y, z)$ | Shader Effects Active | Telemetry / HUD Elements |
|---|---|---|---|---|---|---|---|
| **00** | **Preloader & Gate** | Pre-Scroll | N/A | $(0, 2.5, 12)$ | $(0, 0, 0)$ | Starfield twinkle, Earth rim glow | Wordmark, roll counter, initiate CTA |
| **01** | **Orbital Telemetry** | $0.00 - 0.14$ | $0.060$ | $(0, 1.8, 8.5)$ | $(0, 0, 0)$ | Atmosphere Fresnel scattering, Solar specular | Altitude (500 km), SSO 97.4°, Beta 22.4° |
| **02** | **Planetary Network** | $0.14 - 0.28$ | $0.205$ | $(0, 0.5, 5.2)$ | $(0, -0.2, 0)$ | Great-circle pulse arcs, point cluster glow | Ground station latency, Space-Track TLE |
| **03** | **Deterministic Rules** | $0.28 - 0.54$ | $0.440$ | $(-1.2, 0.2, 3.8)$ | $(0, 0, -1)$ | Grid scanlines, LED light shafts | C-01 to C-06 check matrix, Mass conflict |
| **04** | **Space Credit Core** | $0.54 - 0.71$ | $0.610$ | $(0, 0, 2.4)$ | $(0, 0, 0)$ | Curl-noise particle cloud, emissive pulse | 4-Pillar Score (0–100), SHA-256 nodal chain |
| **05** | **Review Gate** | $0.71 - 0.85$ | $0.780$ | $(1.5, -0.4, 4.0)$ | $(0, 0, 0)$ | Spline trails, chromatic aberration pulse | Human review decisions, HTTP 423 lock |
| **06** | **Mission Dossier** | $0.85 - 1.00$ | $1.000$ | $(0, 1.2, 7.0)$ | $(0, 0, 0)$ | Particle relaxation, atmospheric dawn glow | NASA ODAR / ISRO EOMP preview, Launch CTA |

---

## 3. Transition Micro-Timings

### 3.1 Boot & Reveal Sequence
1. $t = 0\text{ ms}$: Full black `#000000` curtain; logo draws on canvas; progress counter begins weighted fill.
2. $t = 3000\text{ ms}$: Minimum display hold satisfied (`REVEAL_MIN_MS`).
3. $t = 3500\text{ ms}$: Warm-up and shader compilation settle (`REVEAL_SETTLE_MS = 800\text{ ms}`).
4. $t = 3800\text{ ms}$: Split bands `#custom-band-top` and `#custom-band-bottom` open over $1600\text{ ms}$ (`BAND_OPEN_MS`).
5. $t = 4200\text{ ms}$: Center logo docks to top-left header over $1200\text{ ms}$ (`fadeSeconds = 1.2`).
6. $t = 4400\text{ ms}$: `#custom-title-group` and `#custom-headphones` fade in over $3000\text{ ms}$ with $300\text{ ms}$ delay.
7. $t = 4600\text{ ms}$: `#custom-cta` initiates construct-in animation (1px line $\rightarrow$ vertical expand $\rightarrow$ text scramble).
8. **On User Click**: Button flashes with `ctaBlink` ($200\text{ ms}$), title and notice blur/fade with $14\text{px}$ blur over $1400\text{ ms}$, dispatching `chromatic:play` and `experienceStart`.

### 3.2 Inter-Chapter Camera Dollying
- **Chapter 1 $\rightarrow$ 2**: Dolly forward toward planetary limb; atmosphere Fresnel ramp-up over $\Delta p = 0.04$.
- **Chapter 2 $\rightarrow$ 3**: Dive through atmospheric cloud layer with subtle chromatic aberration pulse ($\text{aberration} = 12$, $\text{displacement} = 0.06$).
- **Chapter 3 $\rightarrow$ 4**: Lateral pan and zoom into computing core; rack LEDs fade to background.
- **Chapter 4 $\rightarrow$ 5**: Emissive pulse ripple dissolves core into spline flow lines.
- **Chapter 5 $\rightarrow$ 6**: Flow lines converge into regulatory mission dossier dossier frame; camera pulls out to orbital perspective.

---

## 4. Pointer Interaction Protocol

- **Idle State**: Parallax yaw $\pm 15^\circ$, pitch $\pm 2^\circ$, smoothing $0.1$.
- **Hover State**: When pointer enters interactive targets (satellite solar panels, network nodes, data racks, or score core):
  - Raycaster highlights mesh rim with emissive boost ($1.5\times$).
  - Target HUD label triggers text scramble over $0.25\text{ s}$.
  - Custom cursor shifts to active diamond ring target.
- **Transition Freeze**: During high-velocity chapter camera transitions ($p \in [0.20, 0.24]$ and $[0.54, 0.57]$), pointer parallax is damped to zero with a fade window of $\Delta p = 0.04$ to prevent disorienting camera conflict.
