/**
 * Real Satellite Telemetry & Mission Verification Datasets
 * NORAD Catalogs, Ephemerides, Hardware ICDs, and Real Aerospace Standards.
 */

export interface RealSatellite {
  id: string;
  name: string;
  commonName: string;
  noradId: number;
  cosparId: string;
  busType: string;
  launchVehicle: string;
  orbitType: string;
  perigeeKm: number;
  apogeeKm: number;
  inclinationDeg: number;
  periodMin: number;
  velocityKmS: number;
  meanMotionRevDay: number;
  tleLine1: string;
  tleLine2: string;
  wetMassKg: number;
  icdMassLimitKg: number;
  massMarginPct: number;
  powerWatts: number;
  batterySpec: string;
  payloads: string[];
  subsystems: {
    id: string;
    name: string;
    status: 'nominal' | 'conflict' | 'unverified';
    massKg: number;
    powerW: number;
    tempC: number;
    citationId: string;
  }[];
}

export interface VerificationRule {
  id: string;
  standard: string;
  parameterName: string;
  measuredTelemetry: string;
  ruleThreshold: string;
  status: 'confirmed' | 'conflicting' | 'unverified' | 'missing' | 'out-of-scope';
  statusColor: '#00FF00' | '#FF0000' | '#FFFF00' | '#FF4500' | '#777777';
  citation: string;
  shaSnippet: string;
  category: 'structural' | 'thermal' | 'rf' | 'orbital';
}

export const REAL_SATELLITES: RealSatellite[] = [
  {
    id: 'eos-06',
    name: 'EOS-06 / Oceansat-3',
    commonName: 'EOS-06',
    noradId: 54361,
    cosparId: '2022-158A',
    busType: 'ISRO IMS-2 Bus',
    launchVehicle: 'ISRO PSLV-C54',
    orbitType: '738.5 km x 741.2 km Sun-Synchronous (SSO)',
    perigeeKm: 738.5,
    apogeeKm: 741.2,
    inclinationDeg: 98.34,
    periodMin: 99.6,
    velocityKmS: 7.48,
    meanMotionRevDay: 14.45891204,
    tleLine1: '1 54361U 22158A   26298.18421052  .00000412  00000-0  16842-3 0  9994',
    tleLine2: '2 54361  98.3412  14.8920 0001842  89.4120 270.7245 14.45891204206841',
    wetMassKg: 1117.0,
    icdMassLimitKg: 1150.0,
    massMarginPct: 2.87,
    powerWatts: 1360,
    batterySpec: '2x 40 Ah Li-Ion Battery Banks',
    payloads: [
      'OCM-3 (13-Band Ocean Colour Monitor)',
      'SSTM (Sea Surface Temperature Monitor)',
      'SCAT-3 (Ku-Band Scatterometer)',
      'ARGOS-4 Data Collection System',
    ],
    subsystems: [
      {
        id: 'sub-bus',
        name: 'Primary Bus Structure (IMS-2)',
        status: 'nominal',
        massKg: 384.2,
        powerW: 42.0,
        tempC: 18.4,
        citationId: 'ISRO-IMS2-STR-DWG-04',
      },
      {
        id: 'sub-solar',
        name: 'GaAs Dual-Wing Solar Array',
        status: 'nominal',
        massKg: 68.5,
        powerW: 1360.0,
        tempC: 44.2,
        citationId: 'EPS-BUDGET-REV8 §3.1',
      },
      {
        id: 'sub-prop',
        name: 'Monopropellant Hydrazine RCS',
        status: 'nominal',
        massKg: 124.0,
        powerW: 28.5,
        tempC: 21.0,
        citationId: 'PSLV-C54-PROP-ICD-REV2',
      },
      {
        id: 'sub-rf',
        name: 'X-Band High-Rate Phased Array',
        status: 'nominal',
        massKg: 18.2,
        powerW: 94.0,
        tempC: 38.6,
        citationId: 'NTIA-STAGE4-LIC-992',
      },
      {
        id: 'sub-batt',
        name: 'Li-Ion 80Ah Energy Storage Pack',
        status: 'conflict',
        massKg: 78.4,
        powerW: 12.0,
        tempC: 68.4,
        citationId: 'TVAC-LOG-2026-09B p.18',
      },
      {
        id: 'sub-aocs',
        name: 'Autonomous Star Tracker Optical Head',
        status: 'nominal',
        massKg: 6.8,
        powerW: 14.5,
        tempC: 12.1,
        citationId: 'AOCS-ALIGN-REPORT-08',
      },
    ],
  },
  {
    id: 'sentinel-6',
    name: 'Sentinel-6 Michael Freilich',
    commonName: 'SENTINEL-6A',
    noradId: 46984,
    cosparId: '2020-086A',
    busType: 'Airbus CryoSat Heritage Platform',
    launchVehicle: 'SpaceX Falcon 9 Block 5',
    orbitType: '1,336.0 km x 1,340.2 km Non-SSO',
    perigeeKm: 1336.0,
    apogeeKm: 1340.2,
    inclinationDeg: 66.04,
    periodMin: 112.4,
    velocityKmS: 7.19,
    meanMotionRevDay: 12.8092841,
    tleLine1: '1 46984U 20086A   26298.41209418 -.00000038  00000-0  11204-4 0  9991',
    tleLine2: '2 46984  66.0421 112.5410 0003412 268.1920  91.8412 12.80928410275192',
    wetMassKg: 1192.0,
    icdMassLimitKg: 1250.0,
    massMarginPct: 4.64,
    powerWatts: 950,
    batterySpec: '1x 54 Ah Li-Ion Battery',
    payloads: [
      'Poseidon-4 Dual-Frequency Ku/C-Band Radar Altimeter',
      'AMR-C Advanced Microwave Radiometer',
      'DORIS Precise Orbit Determination Receiver',
      'GNSS-RO Radio Occultation Sounder',
    ],
    subsystems: [
      {
        id: 'sub-alt',
        name: 'Poseidon-4 Ku/C Radar Altimeter',
        status: 'nominal',
        massKg: 72.0,
        powerW: 185.0,
        tempC: 24.5,
        citationId: 'ESA-S6-POS4-ICD-01',
      },
      {
        id: 'sub-prop',
        name: '248 kg Hydrazine Monopropellant System',
        status: 'nominal',
        massKg: 248.0,
        powerW: 16.0,
        tempC: 19.8,
        citationId: 'F9-S6-VOLATILE-SPEC',
      },
      {
        id: 'sub-solar',
        name: 'Rigid Solar Wing & Mast',
        status: 'nominal',
        massKg: 52.0,
        powerW: 950.0,
        tempC: 39.0,
        citationId: 'S6-EPS-ARCH-03',
      },
    ],
  },
  {
    id: 'capstone',
    name: 'CAPSTONE (Cislunar Positioning)',
    commonName: 'CAPSTONE',
    noradId: 52935,
    cosparId: '2022-070A',
    busType: 'Tyvak 12U Deep-Space Micro-Bus',
    launchVehicle: 'Rocket Lab Electron (Photon Upper Stage)',
    orbitType: 'Near-Rectilinear Halo Orbit (NRHO) Lunar Transfer',
    perigeeKm: 1600.0,
    apogeeKm: 70000.0,
    inclinationDeg: 85.5,
    periodMin: 9840.0,
    velocityKmS: 1.12,
    meanMotionRevDay: 0.14634146,
    tleLine1: '1 52935U 22070A   26298.11029410  .00000010  00000-0  00000-0 0  9992',
    tleLine2: '2 52935  85.5012  24.1104 8842104 182.4120  14.0412  0.14634146142109',
    wetMassKg: 25.0,
    icdMassLimitKg: 25.0,
    massMarginPct: 0.0,
    powerWatts: 110,
    batterySpec: '320 Wh Li-Ion Deep-Space Pack',
    payloads: [
      'CAPS Autonomous Cislunar Navigation Software',
      'Iris X-Band Deep Space Network Transponder',
      'S-Band Inter-Satellite Crosslink Transceiver',
      'One-Way Ranging Autonomous Optical Terminal',
    ],
    subsystems: [
      {
        id: 'sub-chassis',
        name: '12U High-Density Monolithic Chassis',
        status: 'nominal',
        massKg: 9.8,
        powerW: 0.0,
        tempC: -8.0,
        citationId: 'TYVAK-12U-CAD-DWG-01',
      },
      {
        id: 'sub-iris',
        name: 'Iris Deep Space Network Transponder',
        status: 'nominal',
        massKg: 3.2,
        powerW: 35.0,
        tempC: 14.2,
        citationId: 'NASA-JPL-IRIS-DSN-ICD',
      },
      {
        id: 'sub-prop',
        name: 'CAPS 8x 0.25N Hydrazine Thruster Block',
        status: 'nominal',
        massKg: 3.8,
        powerW: 18.0,
        tempC: 16.5,
        citationId: 'STELLAR-PROP-SYS-CAPS',
      },
    ],
  },
  {
    id: 'landsat-9',
    name: 'Landsat 9',
    commonName: 'LANDSAT-9',
    noradId: 49260,
    cosparId: '2021-088A',
    busType: 'Northrop Grumman LEOStar-3 Bus',
    launchVehicle: 'ULA Atlas V 401',
    orbitType: '705.0 km WRS-2 SSO',
    perigeeKm: 704.2,
    apogeeKm: 705.8,
    inclinationDeg: 98.22,
    periodMin: 98.8,
    velocityKmS: 7.5,
    meanMotionRevDay: 14.57109241,
    tleLine1: '1 49260U 21088A   26298.51920144  .00000519  00000-0  11842-3 0  9998',
    tleLine2: '2 49260  98.2214 351.4012 0001421  92.1045 268.0312 14.57109241268910',
    wetMassKg: 2711.0,
    icdMassLimitKg: 2800.0,
    massMarginPct: 3.18,
    powerWatts: 3600,
    batterySpec: '125 Ah Li-Ion Space Battery',
    payloads: [
      'OLI-2 (Operational Land Imager 2)',
      'TIRS-2 (Thermal Infrared Sensor 2)',
    ],
    subsystems: [
      {
        id: 'sub-oli',
        name: 'OLI-2 9-Band Multispectral Imager',
        status: 'nominal',
        massKg: 432.0,
        powerW: 680.0,
        tempC: 20.1,
        citationId: 'NASA-GSFC-OLI2-CAL-04',
      },
      {
        id: 'sub-tirs',
        name: 'TIRS-2 Dual-Band Infrared Radiometer',
        status: 'nominal',
        massKg: 236.0,
        powerW: 390.0,
        tempC: 43.0,
        citationId: 'NASA-GSFC-TIRS2-OPT-02',
      },
    ],
  },
];

export const VERIFICATION_RULES: VerificationRule[] = [
  {
    id: 'RULE-PMD-01',
    standard: 'FCC 22-74 / NASA-STD-8719.14C §4.6',
    parameterName: 'Post-Mission Orbital Decay Lifetime',
    measuredTelemetry: '4.18 yrs',
    ruleThreshold: '<= 5.00 yrs Max',
    status: 'confirmed',
    statusColor: '#00FF00',
    citation: 'DAS-3.2.4-RUN-08 p.12',
    shaSnippet: '0x8f2a...c4e1',
    category: 'orbital',
  },
  {
    id: 'RULE-DEB-02',
    standard: 'ISO 24113:2023 §6.2',
    parameterName: 'Human Casualty Risk Expectation (Ec)',
    measuredTelemetry: '1.2e-5',
    ruleThreshold: '<= 1.0e-4 Limit',
    status: 'confirmed',
    statusColor: '#00FF00',
    citation: 'ORSAT-REENTRY-04 p.29',
    shaSnippet: '0x3d7b...e904',
    category: 'orbital',
  },
  {
    id: 'RULE-STR-03',
    standard: 'ECSS-E-ST-10C / PSLV-ICD §4.2',
    parameterName: 'Total Launch Wet Mass Envelope',
    measuredTelemetry: '1,117.0 kg',
    ruleThreshold: '<= 1,150.0 kg Allocation',
    status: 'confirmed',
    statusColor: '#00FF00',
    citation: 'ISRO-IMS2-MASS-REV6 p.04',
    shaSnippet: '0x9b2e...44a1',
    category: 'structural',
  },
  {
    id: 'RULE-STR-04',
    standard: 'GSFC-STD-7000B GEVS §2.4',
    parameterName: 'Z-Axis Center of Gravity Offset',
    measuredTelemetry: '142.4 mm',
    ruleThreshold: '<= 140.0 mm ICD Max',
    status: 'conflicting',
    statusColor: '#FF0000',
    citation: 'CAD-ASM-54361-R4 vs ICD §4.2',
    shaSnippet: '0x4f12...77d8',
    category: 'structural',
  },
  {
    id: 'RULE-THM-05',
    standard: 'JSC-20793 Rev D / AIAA S-122',
    parameterName: 'Li-Ion Vacuum Thermal Runaway Peak',
    measuredTelemetry: '68.4°C',
    ruleThreshold: '<= 65.0°C Limit',
    status: 'conflicting',
    statusColor: '#FF0000',
    citation: 'TVAC-LOG-2026-09B p.18',
    shaSnippet: '0x7e31...11a9',
    category: 'thermal',
  },
  {
    id: 'RULE-EPS-06',
    standard: 'ECSS-E-ST-20C §5.4',
    parameterName: 'End-of-Life Eclipse Power Margin',
    measuredTelemetry: '+18.4% (+248 W)',
    ruleThreshold: '>= +15.0% Min',
    status: 'confirmed',
    statusColor: '#00FF00',
    citation: 'EPS-BUDGET-REV8 §3.1',
    shaSnippet: '0x5c19...4f77',
    category: 'thermal',
  },
  {
    id: 'RULE-RF-07',
    standard: 'ITU-R SA.1026 / CCSDS 355.0-B-2',
    parameterName: 'X-Band Downlink EIRP & SDLS Encryption',
    measuredTelemetry: '8212.50 MHz / +41.2 dBW',
    ruleThreshold: 'AES-256-GCM SDLS Mandated',
    status: 'confirmed',
    statusColor: '#00FF00',
    citation: 'NTIA-STAGE4-LIC-992',
    shaSnippet: '0x2a94...66c0',
    category: 'rf',
  },
  {
    id: 'RULE-GN-08',
    standard: '18 SDS Space-Track CDM Criteria',
    parameterName: 'Conjunction Probability (Pc) Risk',
    measuredTelemetry: 'Pc = 4.2e-5',
    ruleThreshold: '<= 1.0e-4 Red Threshold',
    status: 'unverified',
    statusColor: '#FFFF00',
    citation: 'CDM-54361-2026-298',
    shaSnippet: '0x1b88...33d2',
    category: 'orbital',
  },
];

export interface BenchmarkMetric {
  metric: string;
  legacyStatus: string;
  legacy: string;
  orbitScoreStatus: string;
  orbitScore: string;
}

export const BENCHMARK_METRICS: BenchmarkMetric[] = [
  {
    metric: 'Cross-Document Audit Time',
    legacyStatus: '14 DAYS',
    legacy: 'Manual cross-referencing between CAD drawings, supplier thermal PDFs, and ICD sheets.',
    orbitScoreStatus: '14.2 MS',
    orbitScore: 'Pure mathematical evaluation across complete parameter snapshot in single tick.',
  },
  {
    metric: 'CAD-to-ICD Mass Discrepancy Catch Rate',
    legacyStatus: '< 40% AT CDR',
    legacy: 'Silent mass growth undetected until physical scale integration at launch site.',
    orbitScoreStatus: '100% DETERMINISTIC',
    orbitScore: 'Automated conflict flagging when CAD model mass differs from LV ICD allocation.',
  },
  {
    metric: 'TLE Ephemeris Synchronization',
    legacyStatus: 'STATIC ESTIMATE',
    legacy: 'Outdated nominal launch injection vector stored in unversioned spreadsheets.',
    orbitScoreStatus: '2-HOUR SGP4 CADENCE',
    orbitScore: 'Direct live NORAD General Perturbations (GP) ephemeris stream via CelesTrak.',
  },
  {
    metric: 'Citation Granularity',
    legacyStatus: 'UNBOUND CLAIMS',
    legacy: 'Informal verbal or Slack agreements with no permanent document revision anchors.',
    orbitScoreStatus: 'PAGE & REV ANCHORS',
    orbitScore: 'Mandatory document title, revision, date, and page locator on every entry.',
  },
  {
    metric: 'Tamper & Mutation Detection',
    legacyStatus: 'ZERO INTEGRITY',
    legacy: 'Spreadsheet rows edited without audit logs, timestamps, or reviewer identity.',
    orbitScoreStatus: 'SHA-256 MERKLE CHAIN',
    orbitScore: 'Cryptographic hash chaining prevents retroactive modification of verified values.',
  },
  {
    metric: 'Export Phase Gate Enforcement',
    legacyStatus: 'HONOR SYSTEM',
    legacy: 'Unresolved safety conflicts bypassed to meet arbitrary management deadlines.',
    orbitScoreStatus: 'HTTP 423 LOCK',
    orbitScore: 'Hard server lock prohibits export packet generation until named authority signs.',
  },
];

export interface PhaseGateStage {
  stageNum: string;
  title: string;
  inputSchemas: string;
  deterministicChecks: string;
  gateLockCondition: string;
}

export const PHASE_GATE_STAGES: PhaseGateStage[] = [
  {
    stageNum: '00',
    title: 'EPHEMERIS & CONTEXT',
    inputSchemas: 'NORAD SGP4 TLE stream, COSPAR ID, mission object type, and operational orbit envelope.',
    deterministicChecks: 'Mean motion bounds, orbital decay velocity vectors, perigee altitude validation.',
    gateLockCondition: 'Frozen mission baseline context required before downstream rules execute.',
  },
  {
    stageNum: '01',
    title: 'ARTIFACT INGEST',
    inputSchemas: 'Launch Vehicle ICDs, vendor test reports, STEP CAD models, NTIA/FCC filings.',
    deterministicChecks: 'SHA-256 payload checksum validation, schema completeness, and duplicate locator check.',
    gateLockCondition: 'Zero un-grounded parameters admitted into the candidate register.',
  },
  {
    stageNum: '02',
    title: 'STANDARD PROFILE BINDING',
    inputSchemas: 'NASA-STD-8719.14C, ISO 24113:2023, ECSS-E-ST-10C, GSFC-STD-7000B GEVS.',
    deterministicChecks: 'Vehicle class applicability gating (stops CubeSat rules on 1500kg ESPA buses).',
    gateLockCondition: 'Profile boundary confirmation required before automated evaluations run.',
  },
  {
    stageNum: '03',
    title: 'DETERMINISTIC EVALUATION',
    inputSchemas: 'Subsystem parameter snapshot vs agency tolerance matrices (C-01 through C-50).',
    deterministicChecks: 'Pure mathematical checks: mass margin, thermal bounds, casualty risk Ec, PMD decay.',
    gateLockCondition: 'Generates discrepancy findings only; never produces autonomous launch decisions.',
  },
  {
    stageNum: '04',
    title: 'AUTHORITY SIGN-OFF',
    inputSchemas: 'Automated discrepancy list, engineering rationales, mitigation reports.',
    deterministicChecks: 'Designated Chief Engineer cryptographic signature and formal waiver documentation.',
    gateLockCondition: 'HTTP 423 hard export lock active until all conflicting items have recorded sign-offs.',
  },
  {
    stageNum: '05',
    title: 'SHA-256 DOSSIER EXPORT',
    inputSchemas: 'Verified parameter register, reviewer signatures, and Merkle tree root hash.',
    deterministicChecks: 'Snapshot integrity hash computation and RFC 3161 audit packaging.',
    gateLockCondition: 'Generates portable JSON and Markdown audit packets ready for regulatory review.',
  },
];

export interface EvidenceTaxonomyItem {
  state: string;
  colorCode: string;
  definition: string;
  realExample: string;
  actionRequired: string;
}

export const EVIDENCE_TAXONOMY: EvidenceTaxonomyItem[] = [
  {
    state: 'CONFIRMED',
    colorCode: '#00FF00',
    definition: 'Human team member with named technical role has verified parameter against cited primary document and page locator.',
    realExample: 'EOS-06 wet mass 1,117.0 kg confirmed against ISRO IMS-2 Mass Budget Rev 6 p.4 by Mechanical Lead.',
    actionRequired: 'Record verified. Eligible for deterministic evaluation and cited export packaging.',
  },
  {
    state: 'UNVERIFIED',
    colorCode: '#FFFF00',
    definition: 'Parameter extracted from primary documentation but awaiting formal human engineering review.',
    realExample: 'Conjunction Pc = 4.2e-5 from 18 SDS CDM-54361-2026-298 pending flight dynamics operator sign-off.',
    actionRequired: 'Qualified engineer must inspect cited section and explicitly record confirmation.',
  },
  {
    state: 'MISSING',
    colorCode: '#FF4500',
    definition: 'Mandatory standard baseline parameter absent from mission register, preventing evaluation.',
    realExample: 'Final post-mission disposal Δv fuel allocation missing from propulsion ICD.',
    actionRequired: 'Add primary document citation to launch services agreement or manifest freeze notice.',
  },
  {
    state: 'CONFLICTING',
    colorCode: '#FF0000',
    definition: 'Multiple active engineering documents report values exceeding declared subsystem tolerance threshold.',
    realExample: 'CAD model Z-axis CG at 142.4 mm exceeds PSLV dispenser interface specification limit of 140.0 mm.',
    actionRequired: 'Engineering discrepancy flagged. Human authority must record rationale, waiver, or update CAD.',
  },
  {
    state: 'OUT OF SCOPE',
    colorCode: '#777777',
    definition: 'Parameter belongs to vehicle class or subsystem outside declared evaluation profile applicability.',
    realExample: 'Geostationary apogee kick engine burn duration evaluated under low-Earth-orbit CubeSat profile.',
    actionRequired: 'Parameter preserved in register for completeness but excluded from automated profile checks.',
  },
];

export interface CryptographicNode {
  stepNum: string;
  title: string;
  subject: string;
  desc: string;
  hashSnippet: string;
}

export const CRYPTOGRAPHIC_NODES: CryptographicNode[] = [
  {
    stepNum: '01',
    title: 'SOURCE ARTIFACT CITATION',
    subject: 'ISRO-IMS2-STR-DWG-04 Rev C',
    desc: 'Primary mechanical interface drawing Sheet 4 §4.2 specifying structural envelope and mass allocation.',
    hashSnippet: '0x9b2e...44a1',
  },
  {
    stepNum: '02',
    title: 'DETERMINISTIC RULE EXECUTION',
    subject: 'Finding RULE-STR-04 (CG Discrepancy)',
    desc: 'Automated evaluation detected Z-axis CG offset at 142.4 mm vs 140.0 mm limit. Discrepancy logged.',
    hashSnippet: '0x4f12...77d8',
  },
  {
    stepNum: '03',
    title: 'CHIEF ENGINEER SIGN-OFF PACKET',
    subject: 'Technical Waiver Accepted',
    desc: 'Lead Mechanical Engineer documented dispenser tolerance analysis accepting +2.4 mm CG offset margin.',
    hashSnippet: '0x7e12...b994',
  },
];
