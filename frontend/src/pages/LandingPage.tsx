import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { StateChip } from '../components/common/StateChip';
import { EvidenceState } from '../types/domain';
import styles from './LandingPage.module.css';

interface StateExplanation {
  state: EvidenceState;
  definition: string;
  cubeSatExample: string;
  actionRequired: string;
}

const STATE_EXPLANATIONS: StateExplanation[] = [
  {
    state: 'missing',
    definition: 'A required baseline parameter has no citation or entry in the register, preventing complete evaluation.',
    cubeSatExample: 'Deployment target epoch missing from launch agreement documentation.',
    actionRequired: 'Add citation to launch service agreement or manifest freeze notice.',
  },
  {
    state: 'unconfirmed',
    definition: 'An evidence entry has been authored or extracted from primary documentation, but has not yet received human engineering verification.',
    cubeSatExample: 'Battery vacuum runaway test report uploaded by vendor; pending review by lead thermal engineer.',
    actionRequired: 'A qualified human engineer must inspect the cited section and explicitly confirm the record.',
  },
  {
    state: 'confirmed',
    definition: 'A human team member with named technical role has verified the parameter against the cited primary document, revision, and locator.',
    cubeSatExample: 'Stowed envelope 100x100x340.5 mm confirmed against ICD-AST3-004 Drawing DWG-3U-01 by Mechanical Lead.',
    actionRequired: 'Record is verified. Eligible for evaluation checks and cited export packaging.',
  },
  {
    state: 'conflicting',
    definition: 'Multiple values exist across active engineering documents exceeding the declared subsystem tolerance threshold.',
    cubeSatExample: 'Mass budget reports 3.82 kg in CAD model vs 4.15 kg in launch vehicle interface specification.',
    actionRequired: 'Engineering discrepancy detected. Human reviewer must file mitigation, authorize a waiver, or update documents.',
  },
  {
    state: 'stale',
    definition: 'The cited document revision or test record predates the declared program baseline threshold date.',
    cubeSatExample: 'TVAC cycling test report dated 2022-09-12 predates the declared 2024-01-01 baseline threshold.',
    actionRequired: 'Reviewer must verify whether subsequent engineering qualification superseded this test.',
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
    purpose: 'Declare core spacecraft parameters: object type, form factor, target orbit, mass budget, and baseline threshold date.',
    inputs: 'System specifications, launch agreement terms.',
    outputs: 'Mission Context record with frozen parameter boundary.',
    safetyControl: 'Changes to context invalidate downstream check runs and mark findings stale.',
  },
  {
    step: 2,
    name: 'Evidence Register',
    kicker: 'Primary Citations',
    purpose: 'Maintain a source-linked register where every single parameter declares an exact document title, revision, date, and locator.',
    inputs: 'ICDs, test reports, CAD models, vendor acceptance sheets.',
    outputs: '5-state categorized evidence records.',
    safetyControl: 'No ungrounded or un-cited parameters can enter the register.',
  },
  {
    step: 3,
    name: 'Profile Gate',
    kicker: 'Boundary Applicability',
    purpose: 'Evaluate whether the vehicle fits within the declared boundary domain of the chosen evaluation profile.',
    inputs: 'Mission object type and form factor vs profile boundary rules.',
    outputs: 'Applicability gate decision (Applicable vs Out of Scope).',
    safetyControl: 'Automated checks are halted on out-of-scope vehicles to prevent false findings.',
  },
  {
    step: 4,
    name: 'Deterministic Checks',
    kicker: 'Automated Findings',
    purpose: 'Execute pure, deterministic, rule-based verification checks against the evidence register.',
    inputs: 'Profile check definitions (C-01 to C-06) and evidence snapshot.',
    outputs: 'Findings list with outcome categories and severity levels.',
    safetyControl: 'Software generates findings only; never produces ratings, scores, or launch decisions.',
  },
  {
    step: 5,
    name: 'Human Review',
    kicker: 'Designated Authority',
    purpose: 'Human engineering authorities evaluate findings and record formal decisions, waivers, rationales, and action items.',
    inputs: 'Automated findings and primary documents.',
    outputs: 'Recorded review decisions with reviewer name, role, and technical rationale.',
    safetyControl: 'Export is strictly gated until all action-required findings have recorded decisions.',
  },
  {
    step: 6,
    name: 'Cited Export Dossier',
    kicker: 'Immutable Review Packet',
    purpose: 'Generate complete, immutable, cited evidence dossiers in Markdown, JSON, and clean printable formats.',
    inputs: 'Complete workspace state (Context, Evidence, CheckRun, Decisions, Issues).',
    outputs: 'Portable, auditable review dossiers with input snapshot hash.',
    safetyControl: 'Includes mandatory boundary disclaimer and complete citations on every item.',
  },
];

export const LandingPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [selectedStateIndex, setSelectedStateIndex] = useState<number>(0);
  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(0);

  const selectedState: StateExplanation =
    STATE_EXPLANATIONS[selectedStateIndex] ?? STATE_EXPLANATIONS[0]!;
  const selectedStage: WorkflowStage =
    WORKFLOW_STAGES[selectedStageIndex] ?? WORKFLOW_STAGES[0]!;

  // Motion variants with reduced motion fallback
  const fadeIn = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: shouldReduceMotion ? 0 : 0.4 } },
  };

  return (
    <div className={styles.landingRoot}>
      <div className="container">
        {/* 1. Hero Section */}
        <section className={styles.heroSection} aria-labelledby="hero-title">
          <motion.div
            className={styles.heroText}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className={styles.kicker}>
              <span>Evidence Preparation System</span>
              <span>•</span>
              <span>Deterministic Core</span>
            </div>

            <h1 id="hero-title" className={styles.heroTitle}>
              Organize Mission Evidence Before Human Review
            </h1>

            <p className={styles.heroLead}>
              A source-linked workspace for student, university, and small spacecraft teams.
              Consolidate technical parameters, track exact primary document citations, detect engineering conflicts,
              and export review-ready dossiers for qualified flight directors and safety engineers.
            </p>

            <div className={styles.ctaRow}>
              <Link to="/missions/asteria-3" className={styles.primaryCta}>
                <span>Open Asteria-3 Demo</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/how-it-works" className={styles.secondaryCta}>
                <span>How It Works</span>
              </Link>
            </div>

            <div className={styles.pillRow}>
              <span className={styles.pill}>100% Deterministic Engine</span>
              <span className={styles.pill}>Zero Flight Safety Claims</span>
              <span className={styles.pill}>WCAG 2.2 AA Audited</span>
            </div>
          </motion.div>

          {/* Aerospace Orbital Schematic Visual */}
          <div className={styles.orbitalGraphicWrap} aria-hidden="true">
            <svg
              className={styles.orbitalSvg}
              viewBox="0 0 440 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Planetary Horizon Arc */}
              <circle
                cx="220"
                cy="540"
                r="360"
                stroke="var(--color-border-subtle)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M-20 280 C 120 260, 320 260, 460 280"
                stroke="var(--color-border-subtle)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Orbital Trajectory Ellipse */}
              <ellipse
                cx="220"
                cy="170"
                rx="180"
                ry="90"
                transform="rotate(-15 220 170)"
                stroke="var(--color-brand-cyan)"
                strokeWidth="1.5"
                className={styles.orbitPath}
              />

              {/* Reference Grid & Line of Nodes */}
              <line
                x1="40"
                y1="190"
                x2="400"
                y2="150"
                stroke="var(--color-border-subtle)"
                strokeWidth="1"
                strokeDasharray="2 4"
              />

              {/* CubeSat Satellite Icon along Trajectory */}
              <g transform="translate(290, 115)">
                {/* CubeSat Chassis */}
                <rect
                  x="-12"
                  y="-12"
                  width="24"
                  height="24"
                  fill="var(--color-surface-card)"
                  stroke="var(--color-brand-cyan)"
                  strokeWidth="2"
                  rx="2"
                />
                {/* Solar Panels */}
                <line
                  x1="-30"
                  y1="0"
                  x2="-12"
                  y2="0"
                  stroke="var(--color-brand-cyan)"
                  strokeWidth="2.5"
                />
                <line
                  x1="12"
                  y1="0"
                  x2="30"
                  y2="0"
                  stroke="var(--color-brand-cyan)"
                  strokeWidth="2.5"
                />
                {/* Antenna */}
                <line
                  x1="0"
                  y1="-12"
                  x2="-8"
                  y2="-26"
                  stroke="var(--color-brand-cyan)"
                  strokeWidth="1"
                />
                {/* Ping Beacon */}
                <circle cx="0" cy="0" r="3" fill="var(--color-brand-cyan)" />
              </g>

              {/* Orbit Altitude & Inclination Annotation */}
              <text
                x="20"
                y="50"
                fill="var(--color-brand-cyan)"
                fontFamily="var(--font-mono)"
                fontSize="11"
                letterSpacing="1"
              >
                TARGET ORBIT: 500 KM SSO • INCLINATION: 97.4°
              </text>
              <text
                x="20"
                y="70"
                fill="var(--color-text-muted)"
                fontFamily="var(--font-mono)"
                fontSize="10"
              >
                APPLICABILITY PROFILE: DEMO-EVIDENCE-COMPLETENESS
              </text>
            </svg>
          </div>
        </section>

        {/* 2. Mandatory Truth-in-Advertising Callout */}
        <div
          role="note"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-3)',
            background: 'var(--color-surface-sunken)',
            border: '1px solid var(--color-border-subtle)',
            borderLeft: '4px solid var(--color-brand-cyan)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-4) var(--space-5)',
            marginBottom: 'var(--space-12)',
          }}
        >
          <ShieldAlert size={24} color="var(--color-brand-cyan)" aria-hidden="true" />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--color-brand-cyan)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--letter-spacing-wide)',
                marginBottom: '4px',
              }}
            >
              Engineering Review Boundary Notice
            </div>
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-normal)' }}>
              Despite the name, OrbitScore does not score or certify missions; it organizes evidence for human review.
              It executes deterministic structural consistency checks on source-linked parameters to surface missing citations,
              stale dates, and numerical conflicts prior to formal evaluation by qualified aerospace professionals.
            </p>
          </div>
        </div>

        {/* 3. What OrbitScore Is & Isn't (Two-Column Table) */}
        <section className={styles.truthSection} aria-labelledby="truth-heading">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionKicker}>Clear Operating Scope</div>
            <h2 id="truth-heading" className={styles.sectionTitle}>
              What OrbitScore Is & What It Is Not
            </h2>
            <p className={styles.sectionSubtitle}>
              Rigorous adherence to technical boundaries ensures smallsat teams and reviewers know exactly what this tool provides.
            </p>
          </div>

          <div className={styles.truthGrid}>
            {/* What It Is */}
            <div className={`${styles.truthCard} ${styles.truthCardIs}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <CheckCircle2 size={20} color="var(--color-state-confirmed)" aria-hidden="true" />
                <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)' }}>
                  What OrbitScore Is
                </h3>
              </div>
              <ul className={styles.truthList}>
                <li className={styles.truthItem}>
                  <CheckCircle2 size={16} color="var(--color-state-confirmed)" aria-hidden="true" />
                  <span><strong>Primary Evidence Register</strong>: Links every parameter to an authentic primary document, revision, date, and page locator.</span>
                </li>
                <li className={styles.truthItem}>
                  <CheckCircle2 size={16} color="var(--color-state-confirmed)" aria-hidden="true" />
                  <span><strong>Deterministic Conflict Detector</strong>: Flags numerical and structural discrepancies across separate engineering files automatically.</span>
                </li>
                <li className={styles.truthItem}>
                  <CheckCircle2 size={16} color="var(--color-state-confirmed)" aria-hidden="true" />
                  <span><strong>Human Review Workflow</strong>: Records engineer rationales, waivers, and assigned mitigations separately from software checks.</span>
                </li>
                <li className={styles.truthItem}>
                  <CheckCircle2 size={16} color="var(--color-state-confirmed)" aria-hidden="true" />
                  <span><strong>Portable Cited Dossier Generator</strong>: Produces immutable Markdown, JSON, and printable dossiers for flight safety boards.</span>
                </li>
              </ul>
            </div>

            {/* What It Is NOT */}
            <div className={`${styles.truthCard} ${styles.truthCardIsNot}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <XCircle size={20} color="var(--color-state-conflicting)" aria-hidden="true" />
                <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)' }}>
                  What OrbitScore Is NOT
                </h3>
              </div>
              <ul className={styles.truthList}>
                <li className={styles.truthItem}>
                  <XCircle size={16} color="var(--color-state-conflicting)" aria-hidden="true" />
                  <span><strong>Not a Flight Safety Certification</strong>: Does not grant flight clearance, launch approvals, or regulatory permits.</span>
                </li>
                <li className={styles.truthItem}>
                  <XCircle size={16} color="var(--color-state-conflicting)" aria-hidden="true" />
                  <span><strong>Not a Scoring or Grading System</strong>: Never produces percentage scores, letter grades, readiness rankings, or traffic lights.</span>
                </li>
                <li className={styles.truthItem}>
                  <XCircle size={16} color="var(--color-state-conflicting)" aria-hidden="true" />
                  <span><strong>Not a Substitute for Engineers</strong>: Automated checks surface data inconsistencies; qualified human engineers make decisions.</span>
                </li>
                <li className={styles.truthItem}>
                  <XCircle size={16} color="var(--color-state-conflicting)" aria-hidden="true" />
                  <span><strong>Not an Autonomous Approver</strong>: Does not file regulatory submissions or claim compliance with aerospace agencies.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. The 6-Stage Workflow Stepper Showcase */}
        <section className={styles.stepperSection} aria-labelledby="stepper-heading">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionKicker}>End-To-End Architecture</div>
            <h2 id="stepper-heading" className={styles.sectionTitle}>
              Structured 6-Stage Evidence Lifecycle
            </h2>
            <p className={styles.sectionSubtitle}>
              From declaring baseline mission context to exporting cited review packets, each stage enforces strict boundary controls.
            </p>
          </div>

          <div className={styles.workflowGrid} role="tablist" aria-label="Workflow stages">
            {WORKFLOW_STAGES.map((stg, idx) => {
              const isActive = idx === selectedStageIndex;
              return (
                <button
                  key={stg.step}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  id={`stage-tab-${stg.step}`}
                  aria-controls={`stage-panel-${stg.step}`}
                  className={`${styles.stageCard} ${isActive ? styles.stageCardActive : ''}`}
                  onClick={() => setSelectedStageIndex(idx)}
                >
                  <span className={styles.stageNum}>STAGE 0{stg.step}</span>
                  <span className={styles.stageName}>{stg.name}</span>
                  <span className={styles.stageDesc}>{stg.kicker}</span>
                </button>
              );
            })}
          </div>

          <div
            id={`stage-panel-${selectedStage.step}`}
            role="tabpanel"
            aria-labelledby={`stage-tab-${selectedStage.step}`}
            className={styles.stageDetailBox}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)' }}>
                Stage 0{selectedStage.step}: {selectedStage.name}
              </h3>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-brand-cyan)' }}>
                {selectedStage.kicker}
              </span>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
              {selectedStage.purpose}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)', fontSize: 'var(--font-size-xs)' }}>
              <div>
                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: '2px' }}>Inputs:</strong>
                <span style={{ color: 'var(--color-text-muted)' }}>{selectedStage.inputs}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: '2px' }}>Outputs:</strong>
                <span style={{ color: 'var(--color-text-muted)' }}>{selectedStage.outputs}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--color-brand-cyan)', display: 'block', marginBottom: '2px' }}>Safety Control:</strong>
                <span style={{ color: 'var(--color-text-muted)' }}>{selectedStage.safetyControl}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. The 5-State Evidence Model Interactive Showcase */}
        <section className={styles.stateModelSection} aria-labelledby="state-model-heading">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionKicker}>Evidence Semantics</div>
            <h2 id="state-model-heading" className={styles.sectionTitle}>
              The 5-State Evidence Classification Model
            </h2>
            <p className={styles.sectionSubtitle}>
              Every technical parameter is tagged with a deterministic state reflecting its verification currency and document backing.
            </p>
          </div>

          <div className={styles.stateTabGrid} role="tablist" aria-label="Evidence state models">
            {STATE_EXPLANATIONS.map((item, idx) => {
              const isActive = idx === selectedStateIndex;
              return (
                <button
                  key={item.state}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  id={`state-tab-${item.state}`}
                  aria-controls={`state-panel-${item.state}`}
                  className={`${styles.stateCard} ${isActive ? styles.stateCardActive : ''}`}
                  onClick={() => setSelectedStateIndex(idx)}
                >
                  <div className={styles.stateChipPreview}>
                    <StateChip state={item.state} />
                  </div>
                  <div className={styles.stateDesc}>
                    {item.state.toUpperCase().replace(/_/g, ' ')}
                  </div>
                </button>
              );
            })}
          </div>

          <div
            id={`state-panel-${selectedState.state}`}
            role="tabpanel"
            aria-labelledby={`state-tab-${selectedState.state}`}
            className={styles.stateDetailCard}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <StateChip state={selectedState.state} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Classification Criteria & Smallsat Example
              </span>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
              {selectedState.definition}
            </p>
            <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-3)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-brand-cyan)', textTransform: 'uppercase', marginBottom: '2px' }}>
                CubeSat Example (Asteria-3)
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-primary)' }}>
                {selectedState.cubeSatExample}
              </div>
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              <strong>Action Required:</strong> {selectedState.actionRequired}
            </div>
          </div>
        </section>

        {/* 6. Traceability Showcase */}
        <section className={styles.traceSection} aria-labelledby="trace-heading">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionKicker}>End-To-End Audit Chain</div>
            <h2 id="trace-heading" className={styles.sectionTitle}>
              Bidirectional Traceability Architecture
            </h2>
            <p className={styles.sectionSubtitle}>
              Every review decision traces backward through deterministic checks to the exact primary document page.
            </p>
          </div>

          <div className={styles.traceChain}>
            <div className={styles.traceStep}>
              <div className={styles.traceStepLabel}>1. Primary Document</div>
              <div className={styles.traceStepValue}>ICD-AST3-004</div>
              <div className={styles.traceStepDetail}>Section 3.2, Table 3-1, p. 14</div>
            </div>

            <div className={styles.traceStep}>
              <div className={styles.traceStepLabel}>2. Register Entry</div>
              <div className={styles.traceStepValue}>3.82 kg Total Mass</div>
              <div className={styles.traceStepDetail}>CAD model vs 4.15 kg manifest</div>
            </div>

            <div className={styles.traceStep}>
              <div className={styles.traceStepLabel}>3. Check Inspection</div>
              <div className={styles.traceStepValue}>Finding C-03</div>
              <div className={styles.traceStepDetail}>Discrepancy: 0.33 kg delta</div>
            </div>

            <div className={styles.traceStep}>
              <div className={styles.traceStepLabel}>4. Human Decision</div>
              <div className={styles.traceStepValue}>Waiver Granted</div>
              <div className={styles.traceStepDetail}>By Chief Engineer with rationale</div>
            </div>
          </div>
        </section>

        {/* 7. Synthetic Fixtures Section */}
        <section className={styles.fixturesSection} aria-labelledby="fixtures-heading">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionKicker}>Evaluation Scenarios</div>
            <h2 id="fixtures-heading" className={styles.sectionTitle}>
              Synthetic Test Scenarios
            </h2>
            <p className={styles.sectionSubtitle}>
              Inspect complete mission records with realistic discrepancy patterns or test out-of-scope profile gating.
            </p>
          </div>

          <div className={styles.fixturesGrid}>
            <div className={styles.fixtureCard}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-brand-cyan)' }}>
                    DEMO / MOCK • 3U CUBESAT
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-state-confirmed)' }}>
                    IN-SCOPE
                  </span>
                </div>
                <h3 style={{ margin: '0 0 var(--space-2) 0', fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)' }}>
                  Asteria-3 Technology Demo
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                  Realistic 3U CubeSat evidence register containing 7 cited documents, a mass conflict (3.82 vs 4.15 kg),
                  a stale TVAC cycling report, an unconfirmed battery screening, and an out-of-scope propulsion trade study.
                </p>
              </div>
              <Link to="/missions/asteria-3" className={styles.primaryCta} style={{ alignSelf: 'flex-start' }}>
                <span>Launch Asteria-3 Workspace</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            <div className={styles.fixtureCard}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-state-conflicting)' }}>
                    SYNTHETIC / BOUNDARY TEST
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-state-conflicting)' }}>
                    OUT OF SCOPE
                  </span>
                </div>
                <h3 style={{ margin: '0 0 var(--space-2) 0', fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)' }}>
                  Microsat-X ESPA Class
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                  150 kg ESPA-class small satellite fixture designed to demonstrate profile boundary protection.
                  The Profile Gate halts automated checks to prevent misleading findings on uncalibrated vehicle classes.
                </p>
              </div>
              <Link to="/missions/microsat-x" className={styles.secondaryCta} style={{ alignSelf: 'flex-start' }}>
                <span>Inspect Boundary Gate</span>
                <ExternalLink size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
