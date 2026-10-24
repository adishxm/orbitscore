# OrbitScore Asset Inventory & Provenance (`ASSETS.md`)

This document records all graphical assets, fonts, icons, diagrams, and synthetic datasets used in the OrbitScore application. In accordance with §2 (Legal, IP, and Replication Boundaries) and §10 of `orbitscore_master_prompt_v2.md`, zero proprietary assets, logos, brand photography, copyrighted fonts, or 3D models were copied from EnduroSat or any third party.

---

## 1. Typefaces & Fonts

| Font Family | Weights Used | Role in OrbitScore | License / Origin | Self-Hosted File Paths |
|---|---|---|---|---|
| **Space Grotesk** | Medium (500), SemiBold (600), Bold (700) | Display headings, section titles, hero banner, stat numbers | SIL Open Font License (OFL) v1.1 via Google Fonts (Florian Karsten) | `/public/fonts/space-grotesk-*.woff2` |
| **Inter** | Regular (400), Medium (500), SemiBold (600) | UI body text, data table content, navigation links, forms, buttons | SIL Open Font License (OFL) v1.1 via Google Fonts (Rasmus Andersson) | `/public/fonts/inter-*.woff2` |
| **JetBrains Mono** | Regular (400), Medium (500) | Parameter keys, citations, document locators, telemetry values, timestamps | Apache License 2.0 via JetBrains | `/public/fonts/jetbrains-mono-*.woff2` |

---

## 2. Iconography

| Asset / Library | Role in OrbitScore | License / Origin | Notes |
|---|---|---|---|
| **Lucide Icons (`lucide-react`)** | All UI icons, 5 evidence state indicators, navigation glyphs, actions | ISC License (Lucide Contributors) | Used for accessible icon+label pairings (e.g., `CheckCircle2`, `Clock`, `AlertCircle`, `GitCompare`, `Slash`) |

---

## 3. Vector Graphics & Schematics (Original OrbitScore Assets)

| Asset ID | File / Component | Visual Description | Creation / Provenance |
|---|---|---|---|
| `ASSET-LOGO-01` | `<OrbitScoreLogo />` (`/src/components/common/Logo.tsx`) | Minimal geometric orbital beacon: dual elliptical orbital rings passing through a central focal point with a high-visibility cyan core. | 100% Original SVG vector design authored for OrbitScore. |
| `ASSET-ORBIT-01` | `<OrbitalDiagram />` (`/src/components/visual/OrbitalDiagram.tsx`) | 2D vector schematic illustrating Low Earth Orbit (LEO) inclination, nodal regression, and ground station pass elevation angles. | 100% Original SVG vector with CSS dasharray stroke motion; replaces reference Three.js WebGL canvas. |
| `ASSET-GROUND-01` | `<GroundStationMap />` (`/src/components/visual/GroundStationMap.tsx`) | High-contrast vector world map projection with latitude/longitude grid, ground station coordinate nodes, and simulated satellite ground track. | 100% Original SVG vector diagram; zero third-party map tiles or proprietary imagery. |
| `ASSET-TRACE-01` | `<TraceabilityDiagram />` (`/src/components/visual/TraceabilityDiagram.tsx`) | Interactive blueprint node graph linking Finding nodes to Evidence rows to Primary Citations. | 100% Original SVG/HTML interactive component. |

---

## 4. Synthetic Datasets & Scenarios

| Dataset ID | Mission Slug | Scenario Details | Provenance |
|---|---|---|---|
| `DATA-ASTERIA-3` | `asteria-3` | Synthetic 3U CubeSat from fictional "Apex Orbital Lab" (University of Horizon). Contains conflicting mass parameters, missing deployment date, unconfirmed battery energy, out-of-scope propulsion entry, stale mission timeline document, and confirmed communication link parameters. | 100% Synthetic data created specifically for OrbitScore testing. Clearly tagged `SYNTHETIC` on all screens and exports. |
| `DATA-MICROSAT-X` | `microsat-x` | Synthetic "Other" payload object from "Polaris Dynamics" to demonstrate the profile applicability gate ("Not applicable" branch). | 100% Synthetic data. Tagged `SYNTHETIC`. |

---

## 5. Compliance Verification

- **Zero Hotlinking**: No assets are linked or streamed from `www.endurosat.com` or external CDNs.
- **Offline / Local Operability**: All fonts and SVG assets are bundled locally in the repository.
- **Zero Commercial Font Licensing Required**: All typefaces are permissively licensed open-source fonts.
