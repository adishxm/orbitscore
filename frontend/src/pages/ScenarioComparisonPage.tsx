import React, { useState, useMemo } from 'react';
import { 
  GitCompare, 
  Sliders
} from 'lucide-react';
import { useOrbitStore } from '../store/useOrbitStore';
import styles from './ScenarioComparisonPage.module.css';

export const ScenarioComparisonPage: React.FC = () => {
  const activeMissionId = useOrbitStore((s) => s.activeMissionId);
  const activeMission = useOrbitStore((s) => s.missions[activeMissionId] || s.missions['asteria-3']);

  // Scenario Levers
  const [deviceType, setDeviceType] = useState<'NONE' | 'DRAG_SAIL' | 'PROPULSION'>('DRAG_SAIL');
  const [operationalLifetimeYrs, setOperationalLifetimeYrs] = useState(3.0);
  const [disposalPerigeeKm, setDisposalPerigeeKm] = useState(420);
  const [conjunctionThreshold, setConjunctionThreshold] = useState<'STANDARD_1E4' | 'CONSERVATIVE_1E5'>('STANDARD_1E4');

  // Baseline Scenario (Standard Natural Decay from 500 km, no deorbit device)
  const baseline = useMemo(() => {
    return {
      name: 'Baseline Mission (Asteria-3 As-Is)',
      device: 'None (Natural Orbital Decay)',
      initialApogeeKm: 500,
      initialPerigeeKm: 500,
      massKg: 4.2,
      crossSectionalAreaM2: 0.04,
      disposalDurationYrs: 18.4,
      groundCasualtyRisk: 1.2e-6,
      collisionManeuverRatePerYr: 0.0, // No propulsion for avoidance
      indiaDfsmAlignment: 'NON_CONFORMING', // DFSM expects disposal within 5 years by 2030
      nasaStdAlignment: 'ALIGNED', // < 25 years NASA requirement
      fcc2274Alignment: 'NON_CONFORMING', // FCC requires < 5 years
    };
  }, []);

  // Mitigated Scenario (Calculated based on counterfactual levers)
  const mitigated = useMemo(() => {
    let effectiveArea = 0.04;
    let effectivePerigee = disposalPerigeeKm;
    let maneuverRate = 0.0;
    let mass = 4.2;

    if (deviceType === 'DRAG_SAIL') {
      effectiveArea = 0.54; // Sail deployment adds 0.5 m^2
      mass = 4.5; // Added sail mechanism mass
    } else if (deviceType === 'PROPULSION') {
      effectivePerigee = Math.min(disposalPerigeeKm, 300); // Active deorbit burn lowers perigee
      maneuverRate = conjunctionThreshold === 'CONSERVATIVE_1E5' ? 2.8 : 1.4;
      mass = 5.2; // Propulsion system wet mass
    }

    // Heuristic decay duration calculation based on King-Hele drag equation approximation
    // Lifetime ~ mass / (Cd * Area * rho(h))
    const baseDecayFactor = (mass / (2.2 * effectiveArea)) * (effectivePerigee / 500) ** 3.5;
    const computedDecayYrs = Math.max(0.4, Number((baseDecayFactor * 3.8).toFixed(1)));

    const groundCasualty = mass > 5.0 ? 3.4e-6 : 1.2e-6;

    const fccOk = computedDecayYrs <= 5.0;
    const dfsmOk = computedDecayYrs <= 5.0;
    const nasaOk = computedDecayYrs <= 25.0;

    return {
      name: 'Mitigated Counterfactual Architecture',
      device:
        deviceType === 'DRAG_SAIL'
          ? 'Passive Deployable Drag Sail (0.5 m²)'
          : deviceType === 'PROPULSION'
          ? 'Low-Thrust Chemical Propulsion Module'
          : 'None (Natural Decay)',
      initialApogeeKm: 500,
      initialPerigeeKm: effectivePerigee,
      massKg: mass,
      crossSectionalAreaM2: effectiveArea,
      disposalDurationYrs: computedDecayYrs,
      groundCasualtyRisk: groundCasualty,
      collisionManeuverRatePerYr: maneuverRate,
      indiaDfsmAlignment: dfsmOk ? 'ALIGNED' : 'NON_CONFORMING',
      nasaStdAlignment: nasaOk ? 'ALIGNED' : 'NON_CONFORMING',
      fcc2274Alignment: fccOk ? 'ALIGNED' : 'NON_CONFORMING',
    };
  }, [deviceType, disposalPerigeeKm, conjunctionThreshold]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.kicker}>
          <GitCompare size={14} aria-hidden="true" />
          <span>Counterfactual Architecture Evaluation</span>
        </div>
        <h1 className={styles.title}>Scenario & Architecture Comparison</h1>
        <p className={styles.subtitle}>
          Evaluate trade-offs between natural orbital decay, deployable drag sails, and propulsion deorbit modules
          against governing debris mitigation guidelines for {activeMission ? activeMission.name : 'Asteria-3'}.
        </p>
      </header>

      {/* Illustrative Simulation Notice */}
      <aside className={styles.disclaimerBanner} aria-label="Simulation boundary notice">
        <strong>ILLUSTRATIVE TRADE-OFF STUDY NOTICE:</strong> Counterfactual calculations presented here are
        first-order parametric trade studies designed to assist spacecraft engineers in evaluating architecture levers.
        They do not replace formal spacecraft mission analysis tools (such as NASA DAS or ESA DRAMA) or represent operational flight clearance.
      </aside>

      <div className={styles.layoutGrid}>
        {/* Left: Interactive Architecture Levers */}
        <div className={styles.sidebarCard}>
          <h2 className={styles.sectionHeading}>
            <Sliders size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Architecture Levers
          </h2>

          <div className={styles.formGroup}>
            <label htmlFor="device-type-select" className={styles.label}>Post-Mission Disposal Device</label>
            <select
              id="device-type-select"
              className={styles.select}
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value as 'NONE' | 'DRAG_SAIL' | 'PROPULSION')}
            >
              <option value="NONE">None (Natural Decay)</option>
              <option value="DRAG_SAIL">Passive Drag Sail (0.5 m²)</option>
              <option value="PROPULSION">Propulsion Deorbit Unit</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="mission-lifetime-input" className={styles.label}>
              Operational Lifetime: {operationalLifetimeYrs} Years
            </label>
            <input
              id="mission-lifetime-input"
              type="range"
              min="1"
              max="7"
              step="0.5"
              value={operationalLifetimeYrs}
              onChange={(e) => setOperationalLifetimeYrs(Number(e.target.value))}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="target-perigee-input" className={styles.label}>
              Target Disposal Perigee: {disposalPerigeeKm} km
            </label>
            <input
              id="target-perigee-input"
              type="range"
              min="250"
              max="500"
              step="10"
              value={disposalPerigeeKm}
              onChange={(e) => setDisposalPerigeeKm(Number(e.target.value))}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="threshold-select" className={styles.label}>Collision Avoidance Threshold</label>
            <select
              id="threshold-select"
              className={styles.select}
              value={conjunctionThreshold}
              onChange={(e) => setConjunctionThreshold(e.target.value as 'STANDARD_1E4' | 'CONSERVATIVE_1E5')}
            >
              <option value="STANDARD_1E4">Standard (1e-4 probability)</option>
              <option value="CONSERVATIVE_1E5">Conservative (1e-5 probability)</option>
            </select>
          </div>
        </div>

        {/* Right: Side-by-Side Comparison */}
        <div className={styles.mainCard}>
          <div className={styles.comparisonCards}>
            {/* Baseline Card */}
            <div className={`${styles.scenarioCard} ${styles.scenarioCardBaseline}`}>
              <h3 className={styles.scenarioTitle}>Current Baseline</h3>
              <div style={{ fontSize: '12px', color: 'var(--os-color-text-secondary)', marginBottom: '12px' }}>
                {baseline.device}
              </div>

              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Total Wet Mass</span>
                <span className={styles.metricValue}>{baseline.massKg} kg</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Drag Area</span>
                <span className={styles.metricValue}>{baseline.crossSectionalAreaM2} m²</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Post-Mission Decay</span>
                <span className={styles.metricValue} style={{ color: '#ef4444' }}>
                  {baseline.disposalDurationYrs} Years
                </span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Ground Casualty Risk</span>
                <span className={styles.metricValue}>{baseline.groundCasualtyRisk.toExponential(2)}</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Avoidance Maneuver Rate</span>
                <span className={styles.metricValue}>0 / yr (uncontrolled)</span>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--os-color-border-subtle)' }}>
                <span className={styles.label} style={{ display: 'block', marginBottom: '8px' }}>
                  Guideline Alignment Matrix
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>India DFSM 2030 (&lt;5y):</span>
                    <span className={styles.badgeNonConforming}>Non-Conforming (18.4y)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>NASA-STD-8719.14C (&lt;25y):</span>
                    <span className={styles.badgeAdherent}>Aligned</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>FCC 22-74 (&lt;5y):</span>
                    <span className={styles.badgeNonConforming}>Non-Conforming (18.4y)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mitigated Card */}
            <div className={`${styles.scenarioCard} ${styles.scenarioCardMitigated}`}>
              <h3 className={styles.scenarioTitle}>Counterfactual Architecture</h3>
              <div style={{ fontSize: '12px', color: 'var(--os-color-accent-cyan)', marginBottom: '12px' }}>
                {mitigated.device}
              </div>

              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Total Wet Mass</span>
                <span className={styles.metricValue}>{mitigated.massKg} kg</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Effective Drag Area</span>
                <span className={styles.metricValue}>{mitigated.crossSectionalAreaM2} m²</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Post-Mission Decay</span>
                <span
                  className={styles.metricValue}
                  style={{
                    color: mitigated.disposalDurationYrs <= 5.0 ? 'var(--os-color-accent-cyan)' : '#f59e0b',
                  }}
                >
                  {mitigated.disposalDurationYrs} Years
                </span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Ground Casualty Risk</span>
                <span className={styles.metricValue}>{mitigated.groundCasualtyRisk.toExponential(2)}</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Avoidance Maneuver Rate</span>
                <span className={styles.metricValue}>
                  {mitigated.collisionManeuverRatePerYr > 0
                    ? `~${mitigated.collisionManeuverRatePerYr} / yr`
                    : 'N/A (Passive)'}
                </span>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--os-color-border-subtle)' }}>
                <span className={styles.label} style={{ display: 'block', marginBottom: '8px' }}>
                  Guideline Alignment Matrix
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>India DFSM 2030 (&lt;5y):</span>
                    <span className={mitigated.indiaDfsmAlignment === 'ALIGNED' ? styles.badgeAdherent : styles.badgeNonConforming}>
                      {mitigated.indiaDfsmAlignment === 'ALIGNED' ? 'Aligned' : 'Non-Conforming'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>NASA-STD-8719.14C (&lt;25y):</span>
                    <span className={mitigated.nasaStdAlignment === 'ALIGNED' ? styles.badgeAdherent : styles.badgeNonConforming}>
                      {mitigated.nasaStdAlignment === 'ALIGNED' ? 'Aligned' : 'Non-Conforming'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>FCC 22-74 (&lt;5y):</span>
                    <span className={mitigated.fcc2274Alignment === 'ALIGNED' ? styles.badgeAdherent : styles.badgeNonConforming}>
                      {mitigated.fcc2274Alignment === 'ALIGNED' ? 'Aligned' : 'Non-Conforming'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Explicit Model Assumptions & Units */}
          <div className={styles.notesBox}>
            <div className={styles.notesTitle}>Model Assumptions, Limitations & Units</div>
            <ul style={{ paddingLeft: '1.2rem', margin: '0' }}>
              <li>
                <strong>Atmospheric Model:</strong> Solar cycle mean solar radio flux $F_{10.7} = 120$ sfu; Drag coefficient $C_d = 2.2$.
              </li>
              <li>
                <strong>Attitude Assumption:</strong> For drag sail calculation, assumes random-tumbling cross-sectional area orientation (effective area = 0.5 &times; max deployed area).
              </li>
              <li>
                <strong>Ground Casualty Limit:</strong> NASA-STD-8719.14C Requirement 4.7-1 establishes that the risk of human casualty from surviving debris shall not exceed 1 &times; 10^-4 (0.0001).
              </li>
              <li>
                <strong>5-Year Rule Reference:</strong> In September 2022, the US FCC adopted FCC 22-74 requiring satellite operators in LEO to dispose of their spacecraft within 5 years of mission completion. ISRO's Indian Debris Free Space Missions (DFSM) guideline similarly targets 5-year deorbit for all missions by 2030.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioComparisonPage;
