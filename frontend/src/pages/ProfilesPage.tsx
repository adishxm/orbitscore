import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import styles from './pages.module.css';

interface ProfileRule {
  ruleId: string;
  title: string;
  field: string;
  condition: string;
  unit?: string;
  remediation: string;
  criticalGap: boolean;
  citation: {
    document: string;
    clause: string;
    url?: string;
  };
}

interface ProfileDefinition {
  id: string;
  label: string;
  version: string;
  governingAuthority: string;
  applicability: string;
  humanReviewGate: string;
  summary: string;
  rules: ProfileRule[];
}

const PROFILES_CATALOG: ProfileDefinition[] = [
  {
    id: 'india-dfsm-inspired',
    label: 'India DFSM Inspired',
    version: '1.0.0 (2024 Reference)',
    governingAuthority: 'ISRO / IN-SPACe (Debris-Free Space Missions 2030 Initiative)',
    applicability: 'All Indian and foreign commercial missions licensed for launch or operation within Indian jurisdiction.',
    humanReviewGate: 'All telemetry and analysis fields require qualified human engineer sign-off before export generation.',
    summary:
      'Modeled after the ISRO 2024 Debris-Free Space Missions guidelines. Demands rigorous post-mission disposal reliability (>99%), reduction of remaining orbital lifetime to below 5 years by 2030, avoidance of the 370–430 km human-spaceflight band, and documented object trackability.',
    rules: [
      {
        ruleId: 'IN-DFSM-PMD-PROB',
        title: 'Post-Mission Disposal Probability Exceeds 99%',
        field: 'pmd_probability',
        condition: '> 0.99',
        unit: 'probability',
        remediation: 'Improve disposal system reliability and provide validated probability evidence.',
        criticalGap: true,
        citation: {
          document: 'ISRO Debris-Free Space Missions initiative (2024)',
          clause: 'DFSM Clause 3.1',
          url: 'https://www.isro.gov.in/DFSM.html',
        },
      },
      {
        ruleId: 'IN-DFSM-ORBIT-LIFE',
        title: 'Remaining Orbital Life Below 5 Years',
        field: 'remaining_orbital_life_years',
        condition: '< 5.0',
        unit: 'years',
        remediation: 'Reduce post-mission orbital lifetime through deorbit propulsion, drag augmentation, or initial orbit selection.',
        criticalGap: true,
        citation: {
          document: 'ISRO Debris-Free Space Missions initiative (2024)',
          clause: 'DFSM Section 4',
          url: 'https://www.isro.gov.in/DFSM.html',
        },
      },
      {
        ruleId: 'IN-DFSM-HSF-BAND',
        title: 'Avoid 370–430 km Human-Spaceflight Altitude Band',
        field: 'operational_altitude_km',
        condition: 'Outside [370, 430]',
        unit: 'km',
        remediation: 'Select operational orbit outside the 400±30 km human spaceflight corridor.',
        criticalGap: true,
        citation: {
          document: 'ISRO Debris-Free Space Missions initiative (2024)',
          clause: 'DFSM Protected Region Guidelines',
          url: 'https://www.isro.gov.in/DFSM.html',
        },
      },
      {
        ruleId: 'IN-DFSM-TRACK',
        title: 'Object Trackability Evidence',
        field: 'trackability_confirmed',
        condition: 'is_true',
        remediation: 'Provide optical/radar cross-section analysis and telemetry tracking agreement.',
        criticalGap: false,
        citation: {
          document: 'ISRO Debris-Free Space Missions initiative (2024)',
          clause: 'DFSM Clause 5.2',
          url: 'https://www.isro.gov.in/DFSM.html',
        },
      },
    ],
  },
  {
    id: 'nasa-std-8719-14c-inspired',
    label: 'NASA-STD-8719.14C Inspired',
    version: 'Revision C (August 2021)',
    governingAuthority: 'NASA Office of Safety and Mission Assurance',
    applicability: 'NASA orbital missions, payloads, and launch services; international benchmark standard for LEO spacecraft.',
    humanReviewGate: 'Formal engineering sign-off required on ballistic decay models and debris casualty expectations.',
    summary:
      'Implements pre-review criteria derived from NASA Technical Standard NASA-STD-8719.14C (Process for Limiting Orbital Debris). Enforces the 25-year post-mission decay rule (Req 4.6-1), collision risk probability ceiling with large objects (< 0.001, Req 4.5-1), and human casualty risk ceiling (< 1e-4, Req 4.7-1).',
    rules: [
      {
        ruleId: 'NASA-4.6-1-LIFETIME',
        title: 'Post-Mission Orbital Lifetime Ceiling (25-Year Rule)',
        field: 'remaining_orbital_life_years',
        condition: '<= 25.0',
        unit: 'years',
        remediation: 'Incorporate drag sail, deployable tether, or chemical propulsion for accelerated decay.',
        criticalGap: true,
        citation: {
          document: 'NASA-STD-8719.14C',
          clause: 'Requirement 4.6-1',
          url: 'https://standards.nasa.gov/',
        },
      },
      {
        ruleId: 'NASA-4.5-1-COLLISION',
        title: 'Probability of Collision With Large Objects During Disposal',
        field: 'disposal_collision_probability',
        condition: '< 0.001',
        unit: 'probability',
        remediation: 'Evaluate conjunction screening and implement collision avoidance capability.',
        criticalGap: true,
        citation: {
          document: 'NASA-STD-8719.14C',
          clause: 'Requirement 4.5-1',
          url: 'https://standards.nasa.gov/',
        },
      },
      {
        ruleId: 'NASA-4.7-1-CASUALTY',
        title: 'Human Casualty Expectation from Surviving Debris Below 1 in 10,000',
        field: 'ground_casualty_risk',
        condition: '< 0.0001',
        unit: 'dimensionless (Ec)',
        remediation: 'Execute design-for-demise structural analysis using aluminum or composite components.',
        criticalGap: true,
        citation: {
          document: 'NASA-STD-8719.14C',
          clause: 'Requirement 4.7-1',
          url: 'https://standards.nasa.gov/',
        },
      },
      {
        ruleId: 'NASA-4.4-1-PASSIVATION',
        title: 'Depletion of All Onboard Stored Energy at EOM',
        field: 'stored_energy_passivation_documented',
        condition: 'is_true',
        remediation: 'Document battery discharge resistors, propellant venting valves, and momentum wheel spin-down procedures.',
        criticalGap: true,
        citation: {
          document: 'NASA-STD-8719.14C',
          clause: 'Requirement 4.4-1',
          url: 'https://standards.nasa.gov/',
        },
      },
    ],
  },
  {
    id: 'fcc-22-74-inspired',
    label: 'FCC 22-74 Inspired (5-Year Rule)',
    version: 'FCC Docket 22-74 (Adopted September 2022)',
    governingAuthority: 'US Federal Communications Commission (International Bureau)',
    applicability: 'All commercial and private satellites licensed by the FCC operating in low Earth orbit.',
    humanReviewGate: 'All disposal timelines and license filing attachments must be signed off by authorized counsel or mission lead.',
    summary:
      'Implements the FCC landmark 5-year post-mission disposal requirement for LEO space stations. Replaces the legacy 25-year guideline with an accelerated 5-year deorbit mandate to curb debris proliferation in congested orbital altitude bands.',
    rules: [
      {
        ruleId: 'FCC-22-74-DEORBIT-5Y',
        title: 'Post-Mission Disposal Within 5 Years of Mission Completion',
        field: 'remaining_orbital_life_years',
        condition: '<= 5.0',
        unit: 'years',
        remediation: 'Design spacecraft trajectory and ballistic coefficient for reentry within 5 years.',
        criticalGap: true,
        citation: {
          document: 'FCC 22-74 Report and Order',
          clause: '47 CFR § 25.114(d)(14)(vii)',
          url: 'https://docs.fcc.gov/public/attachments/FCC-22-74A1.pdf',
        },
      },
      {
        ruleId: 'FCC-CASUALTY-RISK',
        title: 'Disposal Casualty Expectation Within Regulatory Standard',
        field: 'ground_casualty_risk',
        condition: '< 0.0001',
        unit: 'dimensionless (Ec)',
        remediation: 'Provide DAS or DRAMA reentry survivability analysis demonstrating zero hazardous fragments.',
        criticalGap: true,
        citation: {
          document: 'FCC 22-74 Report and Order',
          clause: '47 CFR § 25.114',
          url: 'https://docs.fcc.gov/',
        },
      },
    ],
  },
  {
    id: 'internal-pre-review',
    label: 'Internal Baseline Pre-Review',
    version: '1.2.0 (Engineering Baseline)',
    governingAuthority: 'OrbitScore Systems Engineering Review Board',
    applicability: 'General CubeSat and SmallSat pre-launch technical reviews prior to formal regulatory submission.',
    humanReviewGate: 'Multi-disciplinary engineering gate covering mechanical, electrical, and thermal domains.',
    summary:
      'A cross-disciplinary checklist designed to catch common pre-launch evidence gaps, conflicting engineering documents (e.g. CAD model mass vs ICD specification), stale thermal cycle records, and unconfirmed battery safety documentation.',
    rules: [
      {
        ruleId: 'INT-MASS-CROSSCHECK',
        title: 'CAD and ICD Mass Budget Cross-Validation',
        field: 'mass_kg',
        condition: 'Conflict Free',
        unit: 'kg',
        remediation: 'Resolve discrepancy between mechanical model weight and electrical ICD budget.',
        criticalGap: true,
        citation: {
          document: 'OrbitScore Verification Handbook',
          clause: 'Section 2.1 (Mass Discipline)',
        },
      },
      {
        ruleId: 'INT-TVAC-VALIDITY',
        title: 'Thermal Vacuum Chamber Test Currency',
        field: 'tvac_report_confirmed',
        condition: 'is_true',
        remediation: 'Ensure TVAC test report covers current flight-model configuration, not preliminary engineering model.',
        criticalGap: true,
        citation: {
          document: 'OrbitScore Verification Handbook',
          clause: 'Section 4.3 (Environmental Qualification)',
        },
      },
    ],
  },
];

export const ProfilesPage: React.FC = () => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('india-dfsm-inspired');

  const currentProfile: ProfileDefinition =
    PROFILES_CATALOG.find((p) => p.id === selectedProfileId) ?? PROFILES_CATALOG[0]!;

  return (
    <div className={styles.pageRoot}>
      <div className="container">
        <section className={styles.heroSection} aria-labelledby="profiles-heading">
          <div className={styles.kicker}>
            <span>Governance Frameworks</span>
            <span>•</span>
            <span>Inspection Rules Catalog</span>
          </div>
          <h1 id="profiles-heading" className={styles.title}>
            Debris Mitigation Profiles & Verification Rules
          </h1>
          <p className={styles.lead}>
            Profiles define the deterministic criteria OrbitScore uses to inspect mission evidence. Each profile
            declares governing authorities, applicability envelopes, rule definitions, and human-review gate criteria.
          </p>
        </section>

        {/* Profile Selector Tabs */}
        <section className={styles.section} aria-label="Profile selector tabs">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {PROFILES_CATALOG.map((p) => (
              <button
                key={p.id}
                type="button"
                className={selectedProfileId === p.id ? styles.actionButton : styles.actionButtonSecondary}
                onClick={() => setSelectedProfileId(p.id)}
                aria-pressed={selectedProfileId === p.id}
              >
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Active Profile Details Card */}
          <div className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <div>
                <div className={styles.kicker}>Active Policy Specification</div>
                <h2 className={styles.cardTitle}>{currentProfile.label}</h2>
                <div className={styles.metaText}>
                  Identifier: <code>{currentProfile.id}</code> • Version: {currentProfile.version}
                </div>
              </div>
              <span className={styles.badgeCyan}>CONFIGURED SPECIFICATION</span>
            </div>

            <div style={{ margin: '1rem 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div className={styles.codeBlock}>
                <strong>Governing Authority:</strong>
                <div style={{ color: 'var(--os-color-text-secondary)', marginTop: '4px' }}>
                  {currentProfile.governingAuthority}
                </div>
              </div>
              <div className={styles.codeBlock}>
                <strong>Applicability Envelope:</strong>
                <div style={{ color: 'var(--os-color-text-secondary)', marginTop: '4px' }}>
                  {currentProfile.applicability}
                </div>
              </div>
              <div className={styles.codeBlock}>
                <strong>Human-Review Gate:</strong>
                <div style={{ color: 'var(--os-color-accent-amber)', marginTop: '4px' }}>
                  {currentProfile.humanReviewGate}
                </div>
              </div>
            </div>

            <p className={styles.cardText} style={{ marginTop: '0.75rem' }}>
              {currentProfile.summary}
            </p>

            <h3 className={styles.ruleSubheading} style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>
              Declared Verification Rules in Profile ({currentProfile.rules.length}):
            </h3>

            <div className={styles.ruleList}>
              {currentProfile.rules.map((rule) => (
                <div key={rule.ruleId} className={styles.codeBlock} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong>{rule.ruleId}: {rule.title}</strong>
                    {rule.criticalGap && (
                      <span style={{ fontSize: '10px', color: '#ef4444', border: '1px solid #ef4444', padding: '1px 5px', borderRadius: '2px' }}>
                        CRITICAL GATE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--os-color-text-secondary)', marginBottom: '4px' }}>
                    Evaluation Criterion: <code>{rule.field} {rule.condition} {rule.unit || ''}</code>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--os-color-accent-cyan)', marginBottom: '4px' }}>
                    Remediation Lever: {rule.remediation}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--os-color-text-muted)' }}>
                    Citation: {rule.citation.document} • {rule.citation.clause}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.cardActions} style={{ marginTop: '1.5rem' }}>
              <Link to="/missions/asteria-3" className={styles.actionButton}>
                <span>Run Against Asteria-3 Workspace</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* Applicability Boundary Notice */}
        <section className={styles.section} aria-labelledby="boundary-heading">
          <div className={styles.sectionHeader}>
            <h2 id="boundary-heading" className={styles.sectionTitle}>
              Applicability Boundaries & Legal Scope
            </h2>
          </div>
          <p className={styles.lead}>
            When a mission configuration falls outside a profile's declared domain (for example, a GEO communications
            platform evaluated under a CubeSat LEO rule), the engine issues an applicability notice rather than
            producing misleading findings. OrbitScore does not score or certify missions; it organizes evidence for qualified human review.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ProfilesPage;
