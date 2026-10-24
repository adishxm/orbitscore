/**
 * Declarative Chapter Configurations for the 6-Chapter Cinematic Journey
 * Single source of truth for timeline, camera, HUD, and audio automation.
 */

export interface CameraKey {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
}

export interface HudItem {
  id: string;
  label: string;
  value: string;
  unit?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'floating';
  scramble?: boolean;
}

export interface ChapterConfig {
  id: string;
  index: number;
  title: string;
  kicker: string;
  subheading: string;
  description: string;
  scroll: { start: number; end: number };
  camera: { keys: CameraKey[]; ease: string };
  input: 'pointer' | 'scroll' | 'both';
  hud: HudItem[];
  audio: {
    bed: string;
    cues: Record<string, string>;
    gain: number;
    stems: { melody: number; bass: number; instruments: number };
  };
  transitionOut: 'dolly' | 'dissolve' | 'warp' | 'cut';
}

export const CHAPTERS: ChapterConfig[] = [
  {
    id: 'orbital-telemetry',
    index: 1,
    title: 'Orbital Telemetry',
    kicker: 'CHAPTER 01 / 06',
    subheading: '500 km Sun-Synchronous Orbit Baseline',
    description:
      'Grounded spacecraft parameters: 3U CubeSat with stowed 100x100x340.5 mm envelope, solar arrays, and primary citation traceability before launch manifest freeze.',
    scroll: { start: 0.0, end: 0.14 },
    camera: {
      keys: [
        { position: [0, 1.8, 8.5], lookAt: [0, 0, 0], fov: 42 },
        { position: [0.8, 1.2, 7.0], lookAt: [0, 0.1, 0], fov: 40 },
      ],
      ease: 'power3.inOut',
    },
    input: 'pointer',
    hud: [
      { id: 'alt', label: 'ORBITAL ALTITUDE', value: '500.0', unit: 'km', position: 'top-left', scramble: true },
      { id: 'inc', label: 'INCLINATION (SSO)', value: '97.40', unit: 'deg', position: 'top-left' },
      { id: 'env', label: 'STOWED ENVELOPE', value: '100x100x340.5', unit: 'mm', position: 'bottom-left' },
      { id: 'beta', label: 'BETA ANGLE', value: '+22.4', unit: 'deg', position: 'top-right' },
      { id: 'state', label: 'EVIDENCE STATUS', value: 'HUMAN CONFIRMED', position: 'bottom-right' },
    ],
    audio: {
      bed: 'ambient-orbit',
      cues: { enter: 'orbit-swell', hover: 'telemetry-tick' },
      gain: 1.0,
      stems: { melody: 0.0, bass: 0.6, instruments: 1.0 },
    },
    transitionOut: 'dolly',
  },
  {
    id: 'planetary-network',
    index: 2,
    title: 'Planetary Network & Debris Flux',
    kicker: 'CHAPTER 02 / 06',
    subheading: 'Global Ground Stations & LEO Spatial Density',
    description:
      'Interactive terrestrial contact passes, Space-Track TLE ephemeris sync, and NASA SPARK/ORDEM baseline debris flux distribution mapping across orbital shells.',
    scroll: { start: 0.14, end: 0.28 },
    camera: {
      keys: [
        { position: [0, 0.5, 5.2], lookAt: [0, -0.2, 0], fov: 45 },
        { position: [-0.6, 0.3, 4.4], lookAt: [0, -0.1, 0], fov: 42 },
      ],
      ease: 'power3.inOut',
    },
    input: 'pointer',
    hud: [
      { id: 'tracks', label: 'SPACE-TRACK NORAD', value: '59482 (ASTERIA-3)', position: 'top-left' },
      { id: 'stations', label: 'TERRESTRIAL NODES', value: '8 ACTIVE CONTACTS', position: 'top-left', scramble: true },
      { id: 'flux', label: 'DEBRIS FLUX DENSITY', value: '1.42e-5', unit: 'obj/m²/yr', position: 'top-right' },
      { id: 'latency', label: 'MEAN GROUND LATENCY', value: '48.2', unit: 'ms', position: 'bottom-left' },
    ],
    audio: {
      bed: 'ambient-network',
      cues: { enter: 'map-ping', hover: 'node-highlight' },
      gain: 0.9,
      stems: { melody: 0.6, bass: 0.0, instruments: 1.0 },
    },
    transitionOut: 'warp',
  },
  {
    id: 'deterministic-rules',
    index: 3,
    title: 'Deterministic Rule Engine',
    kicker: 'CHAPTER 03 / 06',
    subheading: 'Rule Profiles C-01 Through C-06 Verification',
    description:
      'Pure mathematical verification matrix scanning mass margins, battery thermal test reports, and flagging cross-subsystem numerical discrepancies without subjective guessing.',
    scroll: { start: 0.28, end: 0.54 },
    camera: {
      keys: [
        { position: [-1.2, 0.2, 3.8], lookAt: [0, 0, -1], fov: 48 },
        { position: [1.2, -0.1, 3.4], lookAt: [0, 0, -1], fov: 46 },
      ],
      ease: 'power3.inOut',
    },
    input: 'both',
    hud: [
      { id: 'rule-profile', label: 'ACTIVE PROFILE', value: 'UNIVERSITY CUBESAT V1', position: 'top-left' },
      { id: 'checks', label: 'DETERMINISTIC CHECKS', value: '6 / 6 EXECUTED', position: 'top-left' },
      { id: 'conflict', label: 'DISCREPANCY ALERT', value: 'CAD 3.82kg vs ICD 4.15kg', position: 'top-right', scramble: true },
      { id: 'eval', label: 'EVALUATION OUTCOME', value: 'ACTION REQUIRED', position: 'bottom-right' },
    ],
    audio: {
      bed: 'ambient-datacenter',
      cues: { enter: 'rack-hum', hover: 'discrepancy-chirp' },
      gain: 0.85,
      stems: { melody: 0.8, bass: 0.0, instruments: 0.2 },
    },
    transitionOut: 'dissolve',
  },
  {
    id: 'space-credit-core',
    index: 4,
    title: 'Evidence Core & Provenance Ledger',
    kicker: 'CHAPTER 04 / 06',
    subheading: 'Demonstration 4-Pillar Scenario & Cryptographic SHA-256 Ledger',
    description:
      'Demonstration scenario benchmarking (orbital lifetime, footprint, passivation, and primary citation provenance) locked in a tamper-evident SHA-256 cryptographic chain.',
    scroll: { start: 0.54, end: 0.71 },
    camera: {
      keys: [
        { position: [0, 0, 2.4], lookAt: [0, 0, 0], fov: 50 },
        { position: [0, 0, 2.0], lookAt: [0, 0, 0], fov: 52 },
      ],
      ease: 'expo.out',
    },
    input: 'pointer',
    hud: [
      { id: 'index', label: '[SIMULATED SCENARIO] DEMO INDEX', value: 'DEMO PROTOTYPE ONLY', position: 'top-left', scramble: true },
      { id: 'decay', label: 'SIMULATED DECAY EST', value: 'SYNTHETIC BENCHMARK', position: 'top-right' },
      { id: 'sha', label: 'PROVENANCE INTEGRITY', value: 'SHA-256 CHAIN VALID', position: 'bottom-left' },
      { id: 'tamper', label: 'TAMPER EVIDENCE', value: '14 VERIFIED EVENTS', position: 'bottom-right' },
    ],
    audio: {
      bed: 'ambient-quantum',
      cues: { enter: 'quantum-pulse', click: 'core-ripple' },
      gain: 1.0,
      stems: { melody: 1.0, bass: 1.0, instruments: 1.0 },
    },
    transitionOut: 'dissolve',
  },
  {
    id: 'human-review-gate',
    index: 5,
    title: 'Human Review & Decision Gate',
    kicker: 'CHAPTER 05 / 06',
    subheading: 'Designated Authority Sign-off & Export Blocker',
    description:
      'The engineering authority boundary: human review decisions, technical mitigations, and the strict HTTP 423 export lock preventing unverified dossier releases.',
    scroll: { start: 0.71, end: 0.85 },
    camera: {
      keys: [
        { position: [1.5, -0.4, 4.0], lookAt: [0, 0, 0], fov: 44 },
        { position: [0.5, -0.2, 3.6], lookAt: [0, 0, 0], fov: 42 },
      ],
      ease: 'power3.inOut',
    },
    input: 'scroll',
    hud: [
      { id: 'gate', label: 'EXPORT PHASE GATE', value: 'HTTP 423 LOCKED', position: 'top-left' },
      { id: 'authority', label: 'REVIEW AUTHORITY', value: 'CHIEF ENGINEER SIGN-OFF', position: 'top-right' },
      { id: 'mitigation', label: 'RECORDED DECISION', value: 'DISPENSER 4.5kg ACCEPTED', position: 'bottom-left' },
      { id: 'boundary', label: 'GOVERNANCE NOTICE', value: 'ZERO AUTONOMOUS CLEARANCE', position: 'bottom-right' },
    ],
    audio: {
      bed: 'ambient-car',
      cues: { enter: 'gate-swell', tick: 'decision-click' },
      gain: 0.8,
      stems: { melody: 0.2, bass: 0.0, instruments: 0.4 },
    },
    transitionOut: 'dolly',
  },
  {
    id: 'mission-dossier',
    index: 6,
    title: 'Regulatory Mission Dossier',
    kicker: 'CHAPTER 06 / 06',
    subheading: 'Automated NASA ODAR & ISRO EOMP Export',
    description:
      'Generate section-aligned draft NASA-STD-8719.14 ODAR and ISRO DFSM 2030 / FCC 5-year End-of-Mission Plans with cryptographic hashes. Launch Asteria-3 workspace or return to orbit.',
    scroll: { start: 0.85, end: 1.0 },
    camera: {
      keys: [
        { position: [0, 1.2, 7.0], lookAt: [0, 0, 0], fov: 46 },
        { position: [0, 2.0, 9.5], lookAt: [0, 0, 0], fov: 48 },
      ],
      ease: 'expo.out',
    },
    input: 'pointer',
    hud: [
      { id: 'odar', label: 'NASA-STD-8719.14', value: 'ODAR REVIEW DRAFT', position: 'top-left' },
      { id: 'eomp', label: 'ISRO DFSM 2030', value: 'DRAFT EOMP TEMPLATE (UNVERIFIED)', position: 'top-right' },
      { id: 'hash', label: 'PACKAGE HASH', value: 'e3b0c44298fc1c149afb...', position: 'bottom-left', scramble: true },
      { id: 'cta', label: 'WORKSPACE ACTION', value: 'LAUNCH ASTERIA-3 DEMO', position: 'bottom-right' },
    ],
    audio: {
      bed: 'ambient-ending',
      cues: { enter: 'completion-chime', return: 'return-whoosh' },
      gain: 0.75,
      stems: { melody: 0.2, bass: 0.0, instruments: 0.2 },
    },
    transitionOut: 'dolly',
  },
];
