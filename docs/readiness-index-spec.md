# OrbitScore Readiness & Space Credit Index Specification

> **Engineering Review Boundary Notice**: The OrbitScore Space Credit Index is a deterministic readiness heuristic over evidence completeness and consistency. It does NOT certify compliance, assess collision probabilities ($S_{\text{coll}}$ excluded), or replace qualified regulatory approval.

---

## 1. Index Formulation & Weighting

The Space Credit Index is a composite score bounded between $0.0$ and $100.0$, divided into four equal 25-point pillars:

$$\text{Space Credit Index} = P_{\text{orbit}} + P_{\text{footprint}} + P_{\text{passivation}} + P_{\text{provenance}}$$

### Pillar 1: Orbital Lifetime & Decay Vector ($P_{\text{orbit}} \in [0, 25]$)
- Benchmarks predicted natural orbital decay against international deorbit thresholds:
  - $\tau_{\text{decay}} \le 5.0 \text{ years}$ (FCC-22-74 & ISRO DFSM 2030): **25.0 points**
  - $5.0 < \tau_{\text{decay}} \le 10.0 \text{ years}$: **18.0 points**
  - $10.0 < \tau_{\text{decay}} \le 25.0 \text{ years}$ (NASA STD 8719.14 baseline): **12.0 points**
  - $\tau_{\text{decay}} > 25.0 \text{ years}$: **5.0 points**

### Pillar 2: Collision Footprint & Form Factor ($P_{\text{footprint}} \in [0, 25]$)
- Vehicle mass and geometric cross-section penalty:
  - Base points: $25.0$
  - If $\text{Mass} > 500 \text{ kg}$: $-12.0$ points
  - If $\text{Mass} > 100 \text{ kg}$: $-7.0$ points
  - If $\text{Mass} > 25 \text{ kg}$: $-4.0$ points
  - If non-standard deployable appendages exist without lock verification: $-3.0$ points

### Pillar 3: Disposal & Passivation Readiness ($P_{\text{passivation}} \in [0, 25]$)
- Base score: $20.0$ points for 100% atmospheric demisable smallsats ($< 10 \text{ kg}$, $< 15 \text{ J}$ kinetic impact energy).
- $+5.0$ points bonus when battery electrical isolation, circuit shunt depletion, and propellant venting are human-verified.

### Pillar 4: Sourced Evidence Provenance ($P_{\text{provenance}} \in [0, 25]$)
- Based on ratio of verified parameters to total parameters:
  $$\text{Base} = \left(\frac{N_{\text{confirmed}}}{N_{\text{total}}}\right) \times 25.0$$
- Discrepancy penalty: $-3.0$ points per conflicting parameter.
- Unresolved gap penalty: $-2.0$ points per missing parameter.

---

## 2. Rating Tiers

| Overall Score | Rating Tier | Description |
|---|---|---|
| **90.0 – 100.0** | **AAA** | Exceptional evidence completeness; fully aligned with ISRO DFSM 2030 & FCC 5-year deorbit. |
| **80.0 – 89.9** | **AA** | High evidence completeness; minor non-critical documentation citations pending review. |
| **70.0 – 79.9** | **A** | Substantial evidence confirmed; minor gaps in non-critical subsystem documentation. |
| **60.0 – 69.9** | **BBB** | Moderate completeness; requires additional engineering verification for passivations. |
| **50.0 – 59.9** | **BB** | Incomplete evidence; unconfirmed critical parameters present. |
| **< 50.0** | **C** | Critical evidence gaps or cross-subsystem numerical conflicts detected. |

---

## 3. Transparency & Disclaimers

Every API response returning the Space Credit Index includes:
- Breakdown across all 4 pillars with individual point tallies.
- Specific engineering recommendations for score improvement.
- Prominent disclaimer declaring that the index represents evidence-readiness, not legal certification.
