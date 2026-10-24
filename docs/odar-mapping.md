# OrbitScore ODAR & EOMP Evidence Mapping Specification

This document maps regulatory evidence fields required by **NASA-STD-8719.14 (Orbital Debris Assessment Report - ODAR)** and **ISRO DFSM 2030 / FCC 5-Year (End-of-Mission Plan - EOMP)** directly to OrbitScore's sourced evidence parameters.

---

## 1. NASA-STD-8719.14 ODAR Mapping Matrix

| ODAR Section | Title | Primary Required Parameter | OrbitScore Field Key | Source Evidence Required |
|---|---|---|---|---|
| **Section 1** | Program & Mission Overview | Spacecraft designation, mission objectives, launch date/provider | `mission_name`, `owner`, `launch_provider` | Launch Service Agreement, Mission Ops Plan |
| **Section 2** | Spacecraft Description | Physical dimensions, stowed envelope, wet mass, dry mass | `stowed_envelope`, `wet_mass`, `dry_mass`, `mass_budget_kg` | Mass Properties Report, ICD, CAD Assembly Spec |
| **Section 3** | Assessment of Debris Released During Normal Ops | Release mechanisms, separation springs, lens caps | `debris_release_flags`, `separation_mechanisms` | Payload Dispenser ICD, Release Review |
| **Section 4** | Assessment of Intentional Breakup & Passivation | Energy storage depletion, battery disconnect circuits, propellant venting | `battery_passivation`, `passivation_plan`, `power_storage_wh` | Electrical Power Subsystem (EPS) Schematic, Battery Test |
| **Section 5** | Assessment of Potential for On-Orbit Collisions | Orbital altitude (perigee/apogee), inclination, cross-sectional area | `perigee_km`, `apogee_km`, `inclination_deg`, `cross_section_area_m2` | Mission Trajectory Spec, NASA SPARK Flux Model |
| **Section 6** | Post-Mission Disposal & Decay Timeline | Natural atmospheric decay timeline (< 5 yr FCC / 25 yr NASA) | `disposal_lifetime_years`, `reentry_mode`, `ballistic_coeff` | King-Hele Atmospheric Model, Scikit-Learn Decay GBR |
| **Section 7** | Assessment of Reentry Casualty Risk | Total demisability (< 15 Joules kinetic energy on impact) | `demisability_assessment`, `material_composition` | DAS Demisability Report, Vehicle Materials List |
| **Section 8** | Tether & Subsystem Hazard Risk | Tether deployment mechanisms, pyrotechnics | `tether_system_flag`, `pyro_devices` | Structural ICD |

---

## 2. ISRO DFSM 2030 & FCC 5-Year EOMP Mapping Matrix

| EOMP Clause | Regulatory Standard | Required Mission Attribute | OrbitScore Field Key | Status in Demo (Asteria-3) |
|---|---|---|---|---|
| **EOMP-01** | ISRO DFSM 2030 Zero Debris | Natural decay timeline $\le 5$ years in LEO (< 600 km) | `disposal_lifetime_years` | ~3.8 years at 500 km SSO (Compliant) |
| **EOMP-02** | FCC-22-74 5-Year Deorbit | Active or passive deorbit acceleration verification | `deorbit_device_type` | Drag augmentation via deployable arrays |
| **EOMP-03** | ISRO Space Debris Mitigation | Depletion of all chemical, mechanical, and electrical energy | `passivation_plan` | Battery shunt depletion & isolation relays |
| **EOMP-04** | Collision Avoidance | Conjunction probability assessment $< 10^{-4}$ | `conjunction_risk_assessment` | Random Forest Collision Classifier (Low Tier) |
| **EOMP-05** | Trackability | Smallsat RF beacon and radar cross-section compliance | `rf_beacon_frequency`, `rcs_m2` | 3U CubeSat structure (~0.034 m² optical cross-section) |

---

## 3. Human Review & Gatekeeper Workflow

1. **Extraction**: Parameters are ingested from PDFs/spreadsheets by regex or schema-validated LLM extraction with `human_confirmed=False`.
2. **Review Decision**: A human engineer must verify locators, values, and units against original documents before promoting to `human_confirmed=True`.
3. **Lock Gate**: ODAR draft and EOMP generation endpoints are locked (`HTTP 423 EXPORT_LOCKED`) until all findings receive recorded engineering sign-offs.
