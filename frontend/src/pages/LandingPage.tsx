import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  History,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { StateChip } from '../components/common/StateChip';
import { EvidenceState } from '../types/domain';
import { SpacecraftCanvas } from '../components/3d/SpacecraftCanvas';
import { OrbitHudNav } from '../components/common/OrbitHudNav';
import { useOrbitStore } from '../store/useOrbitStore';
import styles from './LandingPage.module.css';

const CinematicExperience = React.lazy(() => import('../cinematic/CinematicExperience'));

interface StateExplanation {
  state: EvidenceState;
  shortDesc: string;
  definition: string;
  cubeSatExample: string;
  actionRequired: string;
}

const STATE_EXPLANATIONS: StateExplanation[] = [
  {
    state: 'confirmed',
    shortDesc: 'Human verified against primary citation',
    definition:
      'A human team member with named technical role has verified the parameter against the cited primary document, revision, and locator.',
    cubeSatExample:
      'Stowed envelope 100x100x340.5 mm confirmed against ICD-AST3-004 Drawing DWG-3U-01 by Mechanical Lead.',
    actionRequired:
      'Record is verified. Eligible for evaluation checks and cited export packaging.',
  },
  {
    state: 'unconfirmed',
    shortDesc: 'Awaiting engineering review and verification',
    definition:
      'An evidence entry has been authored or extracted from primary documentation, but has not yet received human engineering verification.',
    cubeSatExample:
      'Battery vacuum runaway test report uploaded by vendor; pending review by lead thermal engineer.',
    actionRequired:
      'A qualified human engineer must inspect the cited section and explicitly confirm the record.',
  },
  {
    state: 'missing',
    shortDesc: 'Mandatory parameter absent from register',
    definition:
      'A required baseline parameter has no citation or entry in the register, preventing complete evaluation.',
    cubeSatExample:
      'Deployment target epoch missing from launch agreement documentation.',
    actionRequired:
      'Add citation to launch service agreement or manifest freeze notice.',
  },
  {
    state: 'conflicting',
    shortDesc: 'Active source documents disagree beyond tolerance',
    definition:
      'Multiple values exist across active engineering documents exceeding the declared subsystem tolerance threshold.',
    cubeSatExample:
      'Mass budget reports 3.82 kg in CAD model vs 4.15 kg in launch vehicle interface specification.',
    actionRequired:
      'Engineering discrepancy detected. Human reviewer must record a decision, file mitigation, or update documents.',
  },
  {
    state: 'out-of-scope',
    shortDesc: 'Parameter belongs outside profile applicability',
    definition:
      'Parameter belongs to a subsystem, payload, or vehicle class outside the declared applicability boundary of the active evaluation profile.',
    cubeSatExample:
      'Micro-thruster cold gas impulse parameter on a passive 3U CubeSat profile with no propulsion rules.',
    actionRequired:
      'Parameter is preserved in register for completeness but excluded from automated profile checks.',
  },
];

interface WorkflowStage {
  step: number;
  name: string;
  kicker: string;
  purpose: string;
  inputs: string;
  outputs: string;
  safetyControl: string;
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    step: 1,
    name: 'Mission Context',
    kicker: 'Baseline Declaration',
    purpose:
      'Declare core spacecraft parameters: object type, form factor, target orbit, mass budget, and baseline threshold date.',
    inputs: 'System specifications, launch agreement terms.',
    outputs: 'Mission Context record with frozen parameter boundary.',
    safetyControl:
      'Changes to context mark downstream findings stale and prompt re-evaluation.',
  },
  {
    step: 2,
    name: 'Evidence Register',
    kicker: 'Primary Citations',
    purpose:
      'Maintain a source-linked register where every single parameter declares an exact document title, revision, date, and locator.',
    inputs: 'ICDs, test reports, CAD models, vendor acceptance sheets.',
    outputs: '5-state categorized evidence records.',
    safetyControl:
      'No ungrounded or un-cited parameters can enter the register.',
  },
  {
    step: 3,
    name: 'Profile Gate',
    kicker: 'Boundary Applicability',
    purpose:
      'Evaluate whether the vehicle fits within the declared boundary domain of the chosen evaluation profile.',
    inputs: 'Mission object type and form factor vs profile boundary rules.',
    outputs: 'Applicability gate decision (Applicable vs Out of Scope).',
    safetyControl:
      'Automated checks are halted on out-of-scope vehicles to prevent false findings.',
  },
  {
    step: 4,
    name: 'Deterministic Checks',
    kicker: 'Automated Findings',
    purpose:
      'Execute pure, deterministic, rule-based verification checks against the evidence register.',
    inputs: 'Profile check definitions (C-01 to C-06) and evidence snapshot.',
    outputs: 'Findings list with outcome categories and severity levels.',
    safetyControl:
      'Software generates findings only; never produces ratings, scores, or launch decisions.',
  },
  {
    step: 5,
    name: 'Human Review',
    kicker: 'Designated Authority',
    purpose:
      'Human engineering authorities evaluate findings and record formal decisions, rationales, and action items.',
    inputs: 'Automated findings and primary documents.',
    outputs:
      'Recorded review decisions with reviewer name, role, and technical rationale.',
    safetyControl:
      'Export is strictly gated until all action-required findings have recorded decisions.',
  },
  {
    step: 6,
    name: 'Cited Export Dossier',
    kicker: 'Exportable Review Packet',
    purpose:
      'Generate complete, cited evidence dossiers in Markdown, JSON, and clean printable formats.',
    inputs:
      'Complete workspace state (Context, Evidence, CheckRun, Decisions, Issues).',
    outputs: 'Portable, auditable review dossiers with input snapshot hash.',
    safetyControl:
      'Includes mandatory boundary disclaimer and complete citations on every item.',
  },
];

export const LandingPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [selectedStateIndex, setSelectedStateIndex] = useState<number>(0);
  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('mechanical');

  const {
    apiMode,
    isApiConnected,
    apiServerUrl,
    provenance,
    toggleApiMode,
    syncProvenance,
  } = useOrbitStore();

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(height > 0 ? scrollY / height : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const selectedState: StateExplanation =
    STATE_EXPLANATIONS[selectedStateIndex] ?? STATE_EXPLANATIONS[0]!;
  const selectedStage: WorkflowStage =
    WORKFLOW_STAGES[selectedStageIndex] ?? WORKFLOW_STAGES[0]!;

  const fadeIn = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: shouldReduceMotion ? 0 : 0.4 } },
  };

  return (
    <div className={styles.landingRoot}>
      {/* 0. Fullscreen Cinematic 3D Tour (Edolus-Inspired WebGL Experience) */}
      <section id="cinematic-tour" aria-label="Cinematic 3D Mission Tour">
        <React.Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}>
          <CinematicExperience />
        </React.Suspense>
      </section>

      {/* Floating Scroll-Driven HUD Navigation Bar */}
      <OrbitHudNav />

      {/* 1. Hero Section (Full Viewport Composition) */}
      <section
        id="hero-section"
        className={styles.heroSection}
        aria-labelledby="hero-title"
      >
        <div className="container">
          <div className={styles.heroGrid}>
            <motion.div
              className={styles.heroText}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className={styles.kicker}>
                <span className={styles.kickerBadge}>EVIDENCE PREPARATION SYSTEM</span>
                <span className={styles.kickerDot}>•</span>
                <span className={styles.kickerSub}>DETERMINISTIC CORE</span>
              </div>

              <div className={styles.orbitalBadgeRow}>
                <span className={styles.syntheticBadge}>SYNTHETIC DEMO DATA</span>
                <span className={styles.demoOnlyBadge}>DEMO ONLY — NOT LIVE TRACKING</span>
              </div>

              <h1 id="hero-title" className={styles.heroTitle}>
                Organize Mission Evidence Before Human Review
              </h1>

              <p className={styles.heroLead}>
                A source-linked pre-review workspace for student, university, and small spacecraft engineering teams.
                Consolidate technical parameters, track exact primary document citations, detect parameter conflicts,
                and generate organized evidence dossiers for qualified technical review.
              </p>

              <div className={styles.ctaRow}>
                <Link to="/missions/asteria-3" className={styles.primaryCta}>
                  <span>Open demo workspace</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link to="/how-it-works" className={styles.secondaryCta}>
                  <span>How It Works</span>
                </Link>
              </div>

              <div className={styles.pillRow}>
                <span className={styles.pill}>100% Deterministic Engine</span>
                <span className={styles.pill}>Zero Flight Safety Claims</span>
                <span className={styles.pill}>Automated axe-core Checked (0 Violations)</span>
              </div>

              <div className={styles.heroAnnotation}>
                <span className={styles.annotationLabel}>BOUNDARY DECLARATION:</span>
                <span className={styles.annotationValue}>
                  Deterministic evaluation &amp; provenance only — never produces autonomous decisions.
                </span>
              </div>
            </motion.div>

            {/* 3D Aerospace Spacecraft Viewport */}
            <div className={styles.heroCanvasWrap}>
              <SpacecraftCanvas scrollProgress={scrollProgress} />
              <p className={styles.persistentCaption} role="note">
                Illustrative synthetic data — not live tracking, collision prediction, or operational guidance.
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={styles.scrollCue} aria-hidden="true">
          <div className={styles.scrollIndicatorLine} />
          <span className={styles.scrollCueText}>Scroll to explore mission lifecycle</span>
        </div>
      </section>

      {/* 2. Challenge Section (EnduroSat High-Contrast Reveal) */}
      <section
        id="challenge-section"
        className={styles.editorialSection}
        aria-labelledby="challenge-heading"
      >
        <div className="container">
          <div className={styles.editorialInner}>
            <div className={styles.editorialKickerAmber}>The Challenge</div>
            <h2 id="challenge-heading" className={styles.editorialDisplay}>
              Missions face fragmented documentation, unverifiable spreadsheets, and costly regulatory delays.
            </h2>
            <p className={styles.editorialBody}>
              Small spacecraft programs often spread critical mass budgets, battery thermal test results, and RF licensing
              data across CAD files, PDF reports, and contractor spreadsheets. A single discrepancy between a structural
              drawing and a launch vehicle ICD can jeopardize manifest approval weeks before integration.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Solution Section (EnduroSat High-Contrast Reveal) */}
      <section
        id="solution-section"
        className={styles.editorialSection}
        aria-labelledby="solution-heading"
      >
        <div className="container">
          <div className={styles.editorialInner}>
            <div className={styles.editorialKickerCyan}>The Solution</div>
            <h2 id="solution-heading" className={styles.editorialDisplay}>
              Deterministic rule profiles, source-linked evidence registers, and tamper-evident provenance.
            </h2>
            <p className={styles.editorialBody}>
              OrbitScore binds every single engineering parameter directly to an exact primary document citation, page
              number, and revision. Deterministic rule profiles detect discrepancies automatically, while strict phase gates
              guarantee no dossier is exported without a qualified human engineer's documented review decision.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Two-Step Mission Workflow Overview */}
      <section
        id="workflow-section"
        className={styles.twoStepSection}
        aria-labelledby="two-step-title"
      >
        <div className="container">
          <div className={styles.sectionHeaderCentered}>
            <div className={styles.kicker}>System Architecture</div>
            <h2 id="two-step-title" className={styles.sectionTitleOversized}>
              Your mission evidence in <span className={styles.accentText}>Two Steps</span>
            </h2>
          </div>

          <div className={styles.twoStepsGrid}>
            {/* Step 1 */}
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>01</div>
              <h3 className={styles.stepTitle}>Define &amp; Ingest</h3>
              <p className={styles.stepSub}>Primary citations &amp; candidate parameters</p>
              <p className={styles.stepDesc}>
                Populate the evidence register with parameters grounded in primary drawings, ICDs, and test reports.
                Upload synthetic evidence artifacts to extract unconfirmed candidates with exact SHA-256 locators.
              </p>
            </div>

            {/* Middle Progress Milestone */}
            <div className={styles.stepDividerCol}>
              <div className={styles.dividerBadge}>Deterministic verification in seconds</div>
              <div className={styles.dividerBar}>
                <div className={styles.dividerFill} />
              </div>
              <div className={styles.dividerMilestones}>
                <span>Input Register</span>
                <span>Rule Verification (C-01 to C-06)</span>
                <span>Export Gate</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>02</div>
              <h3 className={styles.stepTitle}>Review &amp; Export</h3>
              <p className={styles.stepSub}>Documented engineering review dossiers</p>
              <p className={styles.stepDesc}>
                Qualified engineers evaluate automated discrepancy findings, record rationales, and resolve action items.
                Generate verifiable, cited review packets locked with cryptographic SHA-256 provenance hashes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive 6-Stage Lifecycle Stepper */}
      <section
        id="stepper-section"
        className={styles.stepperSection}
        aria-labelledby="stepper-title"
      >
        <div className="container">
          <div className={styles.sectionHeaderCentered}>
            <div className={styles.kicker}>Phase Gate Lifecycle</div>
            <h2 id="stepper-title" className={styles.sectionTitle}>
              Six-Stage Pre-Review Workflow
            </h2>
            <p className={styles.sectionLead}>
              Select any stage below to inspect its data inputs, outputs, and safety controls.
            </p>
          </div>

          <div
            className={styles.stepperTabs}
            role="tablist"
            aria-label="Workflow Lifecycle Stages"
          >
            {WORKFLOW_STAGES.map((stage, idx) => {
              const isActive = selectedStageIndex === idx;
              return (
                <button
                  key={stage.step}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`stage-panel-${stage.step}`}
                  id={`stage-tab-${stage.step}`}
                  className={`${styles.stepperTab} ${isActive ? styles.stepperTabActive : ''}`}
                  onClick={() => setSelectedStageIndex(idx)}
                >
                  <span className={styles.stepperTabNum}>
                    STAGE {stage.step < 10 ? `0${stage.step}` : stage.step}
                  </span>
                  <span className={styles.stepperTabName}>{stage.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Stage Detailed Panel */}
          <div
            id={`stage-panel-${selectedStage.step}`}
            role="tabpanel"
            aria-labelledby={`stage-tab-${selectedStage.step}`}
            className={styles.stagePanel}
          >
            <div className={styles.stagePanelHeader}>
              <div>
                <span className={styles.stagePanelKicker}>{selectedStage.kicker}</span>
                <h3 className={styles.stagePanelTitle}>
                  Stage {selectedStage.step < 10 ? `0${selectedStage.step}` : selectedStage.step}: {selectedStage.name}
                </h3>
              </div>
              <span className={styles.stageStepBadge}>STAGE {selectedStage.step} OF 6</span>
            </div>

            <p className={styles.stagePanelPurpose}>{selectedStage.purpose}</p>

            <div className={styles.stageGrid}>
              <div className={styles.stageGridItem}>
                <span className={styles.gridItemLabel}>INPUT ARTIFACTS:</span>
                <p className={styles.gridItemValue}>{selectedStage.inputs}</p>
              </div>
              <div className={styles.stageGridItem}>
                <span className={styles.gridItemLabel}>DELIVERABLE OUTPUTS:</span>
                <p className={styles.gridItemValue}>{selectedStage.outputs}</p>
              </div>
              <div className={`${styles.stageGridItem} ${styles.stageGridItemAlert}`}>
                <span className={styles.gridItemLabel}>MANDATORY SAFETY CONTROL:</span>
                <p className={styles.gridItemValue}>{selectedStage.safetyControl}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Subsystem Evidence Telemetry Panel (EnduroSat In-Flight Style) */}
      <section
        id="subsystems-section"
        className={styles.telemetrySection}
        aria-labelledby="telemetry-title"
      >
        <div className="container">
          <div className={styles.telemetryWrapper}>
            <div className={styles.telemetryTextCol}>
              <div className={styles.kicker}>Subsystem Verification</div>
              <h2 id="telemetry-title" className={styles.telemetryTitle}>
                Evidence telemetry &amp; live citations
              </h2>
              <p className={styles.telemetryLead}>
                Every parameter in the mission register tracks exact measured values, primary source citations,
                and discrepancy boundaries against applicable agency standards.
              </p>

              <div className={styles.subsystemPills}>
                <button
                  type="button"
                  className={`${styles.subsystemPill} ${selectedSubsystem === 'mechanical' ? styles.subsystemPillActive : ''}`}
                  onClick={() => setSelectedSubsystem('mechanical')}
                >
                  Mechanical &amp; Envelope
                </button>
                <button
                  type="button"
                  className={`${styles.subsystemPill} ${selectedSubsystem === 'electrical' ? styles.subsystemPillActive : ''}`}
                  onClick={() => setSelectedSubsystem('electrical')}
                >
                  Battery &amp; Power
                </button>
                <button
                  type="button"
                  className={`${styles.subsystemPill} ${selectedSubsystem === 'rf' ? styles.subsystemPillActive : ''}`}
                  onClick={() => setSelectedSubsystem('rf')}
                >
                  RF &amp; Licensing
                </button>
                <button
                  type="button"
                  className={`${styles.subsystemPill} ${selectedSubsystem === 'orbit' ? styles.subsystemPillActive : ''}`}
                  onClick={() => setSelectedSubsystem('orbit')}
                >
                  Orbital Lifetime
                </button>
              </div>
            </div>

            {/* Telemetry Gauge Panel */}
            <div className={styles.telemetryPanel}>
              <div className={styles.panelHeaderRow}>
                <span className={styles.panelHeaderTitle}>ACTIVE MISSION: ASTERIA-3</span>
                <span className={styles.panelHeaderStatus}>PROFILE: UNIVERSITY CUBESAT V1</span>
              </div>

              <ul className={styles.telemetryList}>
                <li className={styles.telemetryItem}>
                  <div className={styles.telemetryItemHeader}>
                    <span className={styles.telemetryItemName}>Mass Budget Margin</span>
                    <span className={styles.telemetryItemValueAlert}>4.15 kg (vs 4.00 kg limit)</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFillAmber} style={{ width: '103.75%' }} />
                  </div>
                  <span className={styles.telemetryCitation}>
                    Conflict: CAD Model (3.82 kg) vs Launch Spec ICD-AST3-004 (4.15 kg)
                  </span>
                </li>

                <li className={styles.telemetryItem}>
                  <div className={styles.telemetryItemHeader}>
                    <span className={styles.telemetryItemName}>Stowed 3U Envelope</span>
                    <span className={styles.telemetryItemValueGreen}>100.0 x 100.0 x 340.5 mm</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFillGreen} style={{ width: '100%' }} />
                  </div>
                  <span className={styles.telemetryCitation}>
                    Confirmed: Drawing DWG-3U-01 Rev C (Verified by Structures Lead)
                  </span>
                </li>

                <li className={styles.telemetryItem}>
                  <div className={styles.telemetryItemHeader}>
                    <span className={styles.telemetryItemName}>Battery Vacuum Runaway Test</span>
                    <span className={styles.telemetryItemValueAmber}>UNCONFIRMED VENDOR REPORT</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFillAmber} style={{ width: '50%' }} />
                  </div>
                  <span className={styles.telemetryCitation}>
                    Awaiting Lead Thermal Engineer review: TR-BAT-092 Rev B
                  </span>
                </li>

                <li className={styles.telemetryItem}>
                  <div className={styles.telemetryItemHeader}>
                    <span className={styles.telemetryItemName}>Orbital Lifetime &amp; Deorbit</span>
                    <span className={styles.telemetryItemValueGreen}>12.4 Years (&lt; 25-yr rule)</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFillGreen} style={{ width: '49.6%' }} />
                  </div>
                  <span className={styles.telemetryCitation}>
                    NASA DAS 3.2 simulation at 500 km SSO with 0.012 m²/kg area-to-mass
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Interactive 5-State Evidence Model */}
      <section
        id="states-section"
        className={styles.statesSection}
        aria-labelledby="states-heading"
      >
        <div className="container">
          <div className={styles.sectionHeaderCentered}>
            <div className={styles.kicker}>Data Integrity Standard</div>
            <h2 id="states-heading" className={styles.sectionTitle}>
              Five-State Evidence Taxonomy
            </h2>
            <p className={styles.sectionLead}>
              OrbitScore prohibits binary unverified claims. Every single parameter is classified into one of five mutually
              exclusive evidence states with explicit verification criteria.
            </p>
          </div>

          {/* State Tabs */}
          <div
            className={styles.stateTabs}
            role="tablist"
            aria-label="Five Evidence States"
          >
            {STATE_EXPLANATIONS.map((item, idx) => {
              const isActive = selectedStateIndex === idx;
              return (
                <button
                  key={item.state}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`state-panel-${item.state}`}
                  id={`state-tab-${item.state}`}
                  className={`${styles.stateTab} ${isActive ? styles.stateTabActive : ''}`}
                  onClick={() => setSelectedStateIndex(idx)}
                >
                  <StateChip state={item.state} />
                  <span className={styles.stateTabDesc}>{item.shortDesc}</span>
                </button>
              );
            })}
          </div>

          {/* Active State Detail Panel */}
          <div
            id={`state-panel-${selectedState.state}`}
            role="tabpanel"
            aria-labelledby={`state-tab-${selectedState.state}`}
            className={styles.statePanel}
          >
            <div className={styles.statePanelHeader}>
              <StateChip state={selectedState.state} />
              <h3 className={styles.statePanelTitle}>{selectedState.shortDesc}</h3>
            </div>

            <div className={styles.stateDetailsGrid}>
              <div className={styles.stateDetailBlock}>
                <span className={styles.detailLabel}>STANDARD DEFINITION</span>
                <p className={styles.detailText}>{selectedState.definition}</p>
              </div>

              <div className={styles.stateDetailBlock}>
                <span className={styles.detailLabel}>SYNTHETIC CUBESAT EXAMPLE</span>
                <p className={styles.detailTextExample}>{selectedState.cubeSatExample}</p>
              </div>

              <div className={`${styles.stateDetailBlock} ${styles.stateDetailBlockAction}`}>
                <span className={styles.detailLabel}>ACTION REQUIRED BEFORE EXPORT</span>
                <p className={styles.detailText}>{selectedState.actionRequired}</p>
              </div>
            </div>

            {/* Temporal Currency Notice */}
            <div className={styles.temporalNotice}>
              <History size={16} aria-hidden="true" />
              <span>
                <strong>Temporal Currency Notice:</strong> Parameters with source document dates older than the mission
                baseline threshold trigger advisory staleness notices and require explicit reviewer confirmation.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Truth-In-Advertising & Governance Boundary Matrix */}
      <section
        id="limits-section"
        className={styles.honestySection}
        aria-labelledby="honesty-heading"
      >
        <div className="container">
          <div className={styles.sectionHeaderCentered}>
            <div className={styles.kicker}>Truth In Advertising</div>
            <h2 id="honesty-heading" className={styles.sectionTitle}>
              Engineering Authority Boundary
            </h2>
            <p className={styles.sectionLead}>
              OrbitScore does not certify, grade, or approve spaceflights. Software flags discrepancies deterministically;
              only designated human authorities sign off on review decisions.
            </p>
          </div>

          <div className={styles.honestyGrid}>
            {/* What It Is */}
            <div className={styles.honestyCardPositive}>
              <div className={styles.honestyCardHeader}>
                <CheckCircle2 size={24} color="var(--os-color-accent-green)" aria-hidden="true" />
                <h3 className={styles.honestyCardTitle}>What OrbitScore Is</h3>
              </div>
              <ul className={styles.honestyList}>
                <li>
                  <strong>Primary Evidence Register:</strong> A source-linked catalog mapping every parameter to title,
                  revision, date, and page locator.
                </li>
                <li>
                  <strong>Deterministic Rules Engine:</strong> Executes pure, mathematically bounded rules (C-01 to C-06)
                  with zero subjective guessing.
                </li>
                <li>
                  <strong>Cryptographic Provenance Chain:</strong> Appends every verification event to a SHA-256 hash
                  chain for audit tamper-evidence.
                </li>
                <li>
                  <strong>Formal Review Dossier:</strong> Packages cited parameters and human sign-off rationales into
                  clean, portable review packets.
                </li>
              </ul>
            </div>

            {/* What It Is NOT */}
            <div className={styles.honestyCardNegative}>
              <div className={styles.honestyCardHeader}>
                <XCircle size={24} color="var(--os-color-accent-red)" aria-hidden="true" />
                <h3 className={styles.honestyCardTitle}>What OrbitScore Is NOT</h3>
              </div>
              <ul className={styles.honestyList}>
                <li>
                  <strong>Not a Flight Safety Certification:</strong> Does not certify launch vehicle compatibility or
                  range safety approvals.
                </li>
                <li>
                  <strong>Not a Scoring or Grading System:</strong> Despite the brand name, OrbitScore never produces numeric
                  evaluative ratings or grades.
                </li>
                <li>
                  <strong>Not an Automated Approval Tool:</strong> Cannot approve waivers or grant regulatory deviations
                  without named human engineering sign-off.
                </li>
                <li>
                  <strong>Not an Autonomous Agent Authority:</strong> AI extraction is auxiliary, strictly unconfirmed by default,
                  and never makes decisions.
                </li>
              </ul>
            </div>
          </div>

          {/* Mandatory Formal Boundary Disclaimer */}
          <div className={styles.boundaryCallout} role="note">
            <ShieldAlert size={28} color="var(--os-color-accent-amber)" aria-hidden="true" />
            <div className={styles.boundaryCalloutText}>
              <strong>Engineering Review Boundary Notice:</strong> Despite the name, OrbitScore does not score or certify missions; it organizes evidence for human review. All findings, discrepancies, and export dossiers are designed to assist qualified human engineering authorities, not replace them.
            </div>
          </div>
        </div>
      </section>

      {/* 9. Traceability Chain Example */}
      <section
        id="traceability-section"
        className={styles.traceSection}
        aria-labelledby="trace-heading"
      >
        <div className="container">
          <div className={styles.sectionHeaderCentered}>
            <div className={styles.kicker}>Provenance Model</div>
            <h2 id="trace-heading" className={styles.sectionTitle}>
              End-to-End Audit Traceability
            </h2>
            <p className={styles.sectionLead}>
              Inspect the exact lineage from primary engineering drawings down to recorded human review sign-offs.
            </p>
          </div>

          <div className={styles.traceGrid}>
            <div className={styles.traceNode}>
              <span className={styles.traceStepNum}>01. PRIMARY CITATION</span>
              <h3 className={styles.traceTitle}>ICD-AST3-004</h3>
              <p className={styles.traceText}>
                Launch Vehicle Interface Control Document, Drawing DWG-3U-01 Rev C, Sheet 2, Section 4.1.
              </p>
            </div>

            <div className={styles.traceConnector}>→</div>

            <div className={styles.traceNode}>
              <span className={styles.traceStepNum}>02. DETERMINISTIC RULE</span>
              <h3 className={styles.traceTitle}>Finding C-03</h3>
              <p className={styles.traceText}>
                Cross-document discrepancy detected: CAD model (3.82 kg) vs Launch Spec ICD (4.15 kg).
              </p>
            </div>

            <div className={styles.traceConnector}>→</div>

            <div className={styles.traceNode}>
              <span className={styles.traceStepNum}>03. HUMAN SIGN-OFF</span>
              <h3 className={styles.traceTitle}>Accepted for packet</h3>
              <p className={styles.traceText}>
                Chief Engineer Dr. J. Vance documented technical rationale: dispenser accepts 4.50 kg max.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Operational Interface & Real Backend Integration */}
      <section
        id="backend-section"
        className={styles.backendSection}
        aria-labelledby="backend-heading"
      >
        <div className="container">
          <div className={styles.sectionHeaderCentered}>
            <div className={styles.kicker}>Operational Architecture</div>
            <h2 id="backend-heading" className={styles.sectionTitle}>
              Live FastAPI &amp; Provenance Integration
            </h2>
            <p className={styles.sectionLead}>
              OrbitScore connects directly to an active FastAPI backend with SQLite persistence, deterministic evaluation,
              and tamper-evident SHA-256 provenance chaining.
            </p>
          </div>

          <div className={styles.backendCard}>
            <div className={styles.backendCardHeader}>
              <div className={styles.backendStatusIndicator}>
                <span className={isApiConnected ? styles.dotGreen : styles.dotAmber} />
                <span className={styles.backendStatusText}>
                  {apiMode === 'live' && isApiConnected
                    ? 'CONNECTED TO LIVE FASTAPI BACKEND'
                    : 'RUNNING DETERMINISTIC LOCAL CLIENT ENGINE'}
                </span>
              </div>
              <div className={styles.backendEndpoint}>
                <code>{apiServerUrl}</code>
              </div>
            </div>

            <div className={styles.backendGrid}>
              <div className={styles.backendItem}>
                <span className={styles.backendItemLabel}>PROVENANCE INTEGRITY</span>
                <span className={styles.backendItemValGreen}>
                  {provenance.valid ? `SHA-256 CHAIN VALID (${provenance.checkedEvents} events)` : 'INTEGRITY CHECK PENDING'}
                </span>
              </div>
              <div className={styles.backendItem}>
                <span className={styles.backendItemLabel}>EVALUATION PROFILE</span>
                <span className={styles.backendItemVal}>UNIVERSITY CUBESAT V1 (6 CHECKS)</span>
              </div>
              <div className={styles.backendItem}>
                <span className={styles.backendItemLabel}>EXPORT PHASE GATE</span>
                <span className={styles.backendItemValAlert}>HTTP 423 STRICTLY LOCKED UNTIL SIGN-OFF</span>
              </div>
            </div>

            <div className={styles.backendActions}>
              <button
                type="button"
                onClick={() => toggleApiMode()}
                className={styles.backendToggleBtn}
              >
                <RefreshCw size={14} aria-hidden="true" />
                <span>{apiMode === 'live' ? 'Switch to Local Core' : 'Connect to Live Backend'}</span>
              </button>
              <button
                type="button"
                onClick={() => syncProvenance()}
                className={styles.backendSyncBtn}
              >
                <span>Verify Provenance Hash Chain</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Synthetic Mission Fixtures Workspaces */}
      <section
        id="missions-section"
        className={styles.fixturesSection}
        aria-labelledby="fixtures-heading"
      >
        <div className="container">
          <div className={styles.sectionHeaderCentered}>
            <div className={styles.kicker}>Mission Fixtures</div>
            <h2 id="fixtures-heading" className={styles.sectionTitle}>
              Available Synthetic Test Workspaces
            </h2>
            <p className={styles.sectionLead}>
              Launch interactive workspaces populated with realistic aerospace engineering documentation and synthetic
              discrepancies.
            </p>
          </div>

          <div className={styles.fixturesGrid}>
            {/* Asteria-3 */}
            <div className={styles.fixtureCard}>
              <div className={styles.fixtureBadgeRow}>
                <span className={styles.fixtureBadgeCyan}>SYNTHETIC 3U</span>
                <span className={styles.fixtureKicker}>PRIMARY DEMO</span>
              </div>
              <h3 className={styles.fixtureTitle}>Asteria-3 Technology Demo</h3>
              <p className={styles.fixtureDesc}>
                A synthetic 3U CubeSat in 500 km SSO with multi-spectral imager payload. Contains realistic intentional
                anomalies: conflicting mass records (CAD vs ICD), stale thermal vacuum test reports, missing launch deployment
                dates, and an unconfirmed battery report.
              </p>
              <div className={styles.fixtureFooter}>
                <Link to="/missions/asteria-3" className={styles.fixtureCtaPrimary}>
                  <span>Launch Asteria-3 Workspace</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Microsat-X */}
            <div className={styles.fixtureCard}>
              <div className={styles.fixtureBadgeRow}>
                <span className={styles.fixtureBadgeAmber}>OUT OF SCOPE</span>
                <span className={styles.fixtureKicker}>BOUNDARY GATE</span>
              </div>
              <h3 className={styles.fixtureTitle}>Microsat-X ESPA Class</h3>
              <p className={styles.fixtureDesc}>
                A 150 kg ESPA-class smallsat targeting geostationary transfer orbit. Demonstrates how the profile engine
                handles form factor applicability gates by halting automated CubeSat checks and requiring a tailored
                evaluation profile.
              </p>
              <div className={styles.fixtureFooter}>
                <Link to="/missions/microsat-x" className={styles.fixtureCtaSecondary}>
                  <span>Inspect Boundary Gate</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Closing Call to Action (EnduroSat Style) */}
      <section className={styles.closingSection} aria-labelledby="closing-title">
        <div className="container">
          <div className={styles.closingInner}>
            <div className={styles.kicker}>Begin Engineering Review</div>
            <h2 id="closing-title" className={styles.closingTitle}>
              Ready to Inspect Mission Evidence?
            </h2>
            <p className={styles.closingLead}>
              Launch the Asteria-3 workspace to inspect parameter citations, evaluate deterministic rules, and generate
              audit-ready review dossiers.
            </p>
            <div className={styles.closingCtaRow}>
              <Link to="/missions/asteria-3" className={styles.closingPrimaryCta}>
                <span>Launch Asteria-3 Workspace</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/profiles" className={styles.closingSecondaryCta}>
                <span>Inspect Rule Profiles</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
