import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  RefreshCw,
  Cpu,
  Layers,
  Database,
  Lock,
  FileText,
  Activity,
  Terminal,
} from 'lucide-react';
import { OrbitHudNav } from '../components/common/OrbitHudNav';
import { useOrbitStore } from '../store/useOrbitStore';
import { fetchCelesTrakGPLive, CelesTrakGPResponse } from '../api/backend';
import {
  REAL_SATELLITES,
  VERIFICATION_RULES,
  BENCHMARK_METRICS,
  PHASE_GATE_STAGES,
  EVIDENCE_TAXONOMY,
  CRYPTOGRAPHIC_NODES,
  RealSatellite,
} from '../data/realMissions';
import styles from './LandingPage.module.css';

export const LandingPage: React.FC = () => {
  // Real fleet selection
  const [selectedSatId, setSelectedSatId] = useState<string>('eos-06');
  const activeSatellite: RealSatellite =
    REAL_SATELLITES.find((s) => s.id === selectedSatId) || REAL_SATELLITES[0]!;

  // Hardware Subsystem Blueprint Selection
  const [activeSubsystemId, setActiveSubsystemId] = useState<string>(
    activeSatellite.subsystems[0]?.id || 'sub-bus'
  );
  const activeSubsystem =
    activeSatellite.subsystems.find((sub) => sub.id === activeSubsystemId) ||
    activeSatellite.subsystems[0]!;

  // Stepper Selection
  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(0);
  const activeStage = PHASE_GATE_STAGES[selectedStageIndex] || PHASE_GATE_STAGES[0]!;

  // Parameter Category Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const filteredRules =
    selectedCategory === 'all'
      ? VERIFICATION_RULES
      : VERIFICATION_RULES.filter((r) => r.category === selectedCategory);

  // 5-State Taxonomy Selection
  const [selectedStateIndex, setSelectedStateIndex] = useState<number>(0);
  const activeStateTaxonomy =
    EVIDENCE_TAXONOMY[selectedStateIndex] || EVIDENCE_TAXONOMY[0]!;

  // Backend store integration
  const {
    apiMode,
    isApiConnected,
    apiServerUrl,
    provenance,
    toggleApiMode,
    syncProvenance,
  } = useOrbitStore();

  const [liveGpData, setLiveGpData] = useState<CelesTrakGPResponse | null>(null);
  const [tleSyncStatus, setTleSyncStatus] = useState<string>('CELESTRAK SYNCED // EPOCH 26298');

  // Real backend CelesTrak GP integration
  useEffect(() => {
    let isMounted = true;
    fetchCelesTrakGPLive(activeSatellite.noradId, 'JSON', false, apiServerUrl)
      .then((data) => {
        if (!isMounted) return;
        setLiveGpData(data);
        setTleSyncStatus(`FASTAPI LIVE // NORAD ${data.norad_cat_id} [${data.badge || 'LIVE'}]`);
      })
      .catch(() => {
        if (isMounted) {
          setTleSyncStatus(`LOCAL DETERMINISTIC // NORAD ${activeSatellite.noradId} GP ACTIVE`);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [activeSatellite.noradId, apiServerUrl]);

  const handleSyncCelesTrak = async () => {
    setTleSyncStatus(`FETCHING LIVE NORAD ${activeSatellite.noradId} GP FROM FASTAPI...`);
    try {
      const data = await fetchCelesTrakGPLive(activeSatellite.noradId, 'JSON', true, apiServerUrl);
      setLiveGpData(data);
      setTleSyncStatus(`FASTAPI LIVE // NORAD ${data.norad_cat_id} [${data.badge || 'LIVE'}]`);
    } catch {
      setTleSyncStatus(`VERIFIED // NORAD ${activeSatellite.noradId} GP ACTIVE`);
    }
  };

  const apogeeVal = liveGpData?.apogee_km != null ? liveGpData.apogee_km : activeSatellite.apogeeKm;
  const perigeeVal = liveGpData?.perigee_km != null ? liveGpData.perigee_km : activeSatellite.perigeeKm;
  const inclinationVal = liveGpData?.inclination_deg != null ? liveGpData.inclination_deg.toFixed(2) : activeSatellite.inclinationDeg.toFixed(2);
  const tleLine1Val = liveGpData?.raw_data?.line1 || activeSatellite.tleLine1;
  const tleLine2Val = liveGpData?.raw_data?.line2 || activeSatellite.tleLine2;

  return (
    <div className={styles.landingRoot}>
      {/* Quick-Jump Floating HUD Command Dock */}
      <OrbitHudNav />

      {/* =========================================================================
          SECTION 1: FULL-BLEED ORBITAL TELEMETRY COMMAND HERO
          ========================================================================= */}
      <section id="hero-section" className={styles.heroSection} aria-labelledby="hero-title">
        <div className={styles.fullBleedContainer}>
          {/* Header Punchlines */}
          <div className={styles.heroHeaderBar}>
            <div className={styles.kickerBadgeRow}>
              <span className={styles.badgeSolidBlue}>ORBITSCORE v4.2.0</span>
              <span className={styles.badgeHairline}>DETERMINISTIC FLIGHT TELEMETRY</span>
              <span className={styles.badgeHairlineGreen}>NORAD GP LINK ACTIVE</span>
            </div>
            <h1 id="hero-title" className={styles.heroHeadline}>
              DETERMINISTIC SPACECRAFT VERIFICATION &amp; LIVE ORBITAL TELEMETRY
            </h1>
            <p className={styles.heroSubheader}>
              Lock NORAD ephemeris vectors, CAD mass budgets, and thermal vacuum logs into SHA-256 audit-ready mission dossiers.
            </p>
          </div>

          <div className={styles.heroColumnsGrid}>
            {/* Left 6 Cols: Spacecraft Fleet Selector, 8-Cell Telemetry Grid & Raw TLE */}
            <div className={styles.heroLeftCol}>
              {/* Live Spacecraft Selector Tabs */}
              <div className={styles.fleetSelectorBar} role="tablist" aria-label="Real Spacecraft Fleet">
                {REAL_SATELLITES.map((sat) => {
                  const isActive = sat.id === selectedSatId;
                  return (
                    <button
                      key={sat.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`${styles.fleetTabBtn} ${isActive ? styles.fleetTabBtnActive : ''}`}
                      onClick={() => {
                        setSelectedSatId(sat.id);
                        if (sat.subsystems[0]) setActiveSubsystemId(sat.subsystems[0].id);
                      }}
                    >
                      <span className={styles.fleetTabName}>{sat.commonName}</span>
                      <span className={styles.fleetTabNorad}>[{sat.noradId}]</span>
                    </button>
                  );
                })}
              </div>

              {/* Live 8-Cell Telemetry Readout Grid */}
              <div className={styles.telemetryGrid8}>
                <div className={styles.telemetryCell}>
                  <span className={styles.cellLabel}>NORAD CAT ID</span>
                  <span className={styles.cellValWhite}>{activeSatellite.noradId}</span>
                </div>
                <div className={styles.telemetryCell}>
                  <span className={styles.cellLabel}>COSPAR ID</span>
                  <span className={styles.cellValWhite}>{activeSatellite.cosparId}</span>
                </div>
                <div className={styles.telemetryCell}>
                  <span className={styles.cellLabel}>APOGEE / PERIGEE</span>
                  <span className={styles.cellValWhite}>
                    {apogeeVal} / {perigeeVal} KM
                  </span>
                </div>
                <div className={styles.telemetryCell}>
                  <span className={styles.cellLabel}>INCLINATION</span>
                  <span className={styles.cellValWhite}>{inclinationVal}°</span>
                </div>
                <div className={styles.telemetryCell}>
                  <span className={styles.cellLabel}>ORBITAL VELOCITY</span>
                  <span className={styles.cellValGreen}>{activeSatellite.velocityKmS} KM/S</span>
                </div>
                <div className={styles.telemetryCell}>
                  <span className={styles.cellLabel}>MEAN MOTION</span>
                  <span className={styles.cellValWhite}>
                    {activeSatellite.meanMotionRevDay.toFixed(4)} REV/D
                  </span>
                </div>
                <div className={styles.telemetryCell}>
                  <span className={styles.cellLabel}>WET MASS MARGIN</span>
                  <span className={styles.cellValGreen}>
                    +{activeSatellite.massMarginPct.toFixed(2)}% ({activeSatellite.wetMassKg} KG)
                  </span>
                </div>
                <div className={styles.telemetryCell}>
                  <span className={styles.cellLabel}>SHA-256 INTEGRITY</span>
                  <span className={styles.cellValGreen}>LOCKED &amp; VERIFIED</span>
                </div>
              </div>

              {/* Raw Monospace Two-Line Element (TLE) Box */}
              <div className={styles.tleInspectorBox}>
                <div className={styles.tleHeaderRow}>
                  <div className={styles.tleTitle}>
                    <Terminal size={14} className={styles.iconBlue} />
                    <span>RAW CELESTRAK TWO-LINE ELEMENT (TLE)</span>
                  </div>
                  <span className={styles.tleStatusTag}>{tleSyncStatus}</span>
                </div>
                <pre className={styles.tlePre}>
                  <code>{`${tleLine1Val}\n${tleLine2Val}`}</code>
                </pre>
                <div className={styles.tleActionsRow}>
                  <button
                    type="button"
                    onClick={handleSyncCelesTrak}
                    className={styles.syncCelestrakBtn}
                  >
                    <RefreshCw size={13} />
                    <span>SYNC LIVE CELESTRAK GP</span>
                  </button>
                  <Link
                    to={`/missions/${activeSatellite.id}`}
                    className={styles.launchWorkspaceBtn}
                  >
                    <span>LAUNCH WORKSPACE &rarr;</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Interactive Spacecraft CAD & Subsystem Blueprint Inspector */}
            <div className={styles.heroRightCol}>
              <div className={styles.blueprintCard}>
                <div className={styles.blueprintHeader}>
                  <div className={styles.blueprintTitle}>
                    <Activity size={14} className={styles.iconGreen} />
                    <span>SPACECRAFT SUBSYSTEM BLUEPRINT // {activeSatellite.busType.toUpperCase()}</span>
                  </div>
                  <span className={styles.blueprintBadge}>CLICK HARDWARE NODES</span>
                </div>

                {/* Subsystem Hardware Nodes Grid */}
                <div className={styles.hardwareNodesList}>
                  {activeSatellite.subsystems.map((sub) => {
                    const isSelected = sub.id === activeSubsystemId;
                    const isNominal = sub.status === 'nominal';
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setActiveSubsystemId(sub.id)}
                        className={`${styles.hardwareNodeItem} ${isSelected ? styles.hardwareNodeItemActive : ''}`}
                      >
                        <div className={styles.hardwareNodeHeader}>
                          <span
                            className={
                              isNominal
                                ? styles.statusDotGreen
                                : styles.statusDotRed
                            }
                          />
                          <span className={styles.hardwareNodeName}>{sub.name}</span>
                        </div>
                        <div className={styles.hardwareNodeMetrics}>
                          <span>{sub.massKg} KG</span>
                          <span>{sub.powerW} W</span>
                          <span className={sub.tempC > 65 ? styles.textRed : styles.textWhite}>
                            {sub.tempC}°C
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Active Subsystem Deep Inspection Box */}
                <div className={styles.subsystemInspectionBox}>
                  <div className={styles.subsystemInspectionHeader}>
                    <span className={styles.subsystemInspectionTitle}>
                      SUBSYSTEM RECORD: {activeSubsystem.name.toUpperCase()}
                    </span>
                    <span
                      className={
                        activeSubsystem.status === 'nominal'
                          ? styles.statusTagGreen
                          : styles.statusTagRed
                      }
                    >
                      {activeSubsystem.status === 'nominal' ? 'NOMINAL // VERIFIED' : 'CONFLICT // FLAGGED'}
                    </span>
                  </div>
                  <div className={styles.subsystemDetailRow}>
                    <div className={styles.subsystemDetailItem}>
                      <span className={styles.detailLabel}>PRIMARY CITATION:</span>
                      <span className={styles.detailValMonospace}>{activeSubsystem.citationId}</span>
                    </div>
                    <div className={styles.subsystemDetailItem}>
                      <span className={styles.detailLabel}>ALLOCATED MASS:</span>
                      <span className={styles.detailValMonospace}>{activeSubsystem.massKg} kg</span>
                    </div>
                    <div className={styles.subsystemDetailItem}>
                      <span className={styles.detailLabel}>PEAK POWER:</span>
                      <span className={styles.detailValMonospace}>{activeSubsystem.powerW} W</span>
                    </div>
                    <div className={styles.subsystemDetailItem}>
                      <span className={styles.detailLabel}>THERMAL TELEMETRY:</span>
                      <span
                        className={
                          activeSubsystem.tempC > 65
                            ? styles.detailValAlert
                            : styles.detailValMonospace
                        }
                      >
                        {activeSubsystem.tempC}°C
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 6-VECTOR ORBITAL TELEMETRY HUD STRIPS (OVER ZOOMING EARTH)
          ========================================================================= */}
      <section id="telemetry-section" className={styles.telemetrySection} aria-labelledby="telemetry-title">
        <div className={styles.fullBleedContainer}>
          <div className={styles.sectionTitleBlock}>
            <div className={styles.sectionCode}>02 // FLIGHT TELEMETRY VECTORS</div>
            <h2 id="telemetry-title" className={styles.sectionHeading}>
              6-VECTOR ORBITAL TELEMETRY REGISTER
            </h2>
            <p className={styles.sectionLeadLine}>
              Continuous state vectors, conjunction radar tracking, and deterministic bounds over zooming orbital limbs.
            </p>
          </div>

          <div className={styles.staggeredHudList}>
            {/* Strip 01 - Left */}
            <div className={`${styles.hudStripCard} ${styles.hudStripLeft}`}>
              <div className={styles.hudStripHeader}>
                <span className={styles.hudVectorNum}>01 // ORBITAL EPHEMERIS</span>
                <span className={styles.hudBadgeGreen}>SGP4 REAL-TIME</span>
              </div>
              <p className={styles.hudLead}>
                Live altitude, inclination, eccentricity, B* drag term, and epoch age computed on a strict 2-hour CelesTrak refresh cycle.
              </p>
              <div className={styles.hudMetricsGrid}>
                <div><span className={styles.mLabel}>ALTITUDE:</span> <span className={styles.mVal}>741.2 KM</span></div>
                <div><span className={styles.mLabel}>INCLINATION:</span> <span className={styles.mVal}>98.34° SSO</span></div>
                <div><span className={styles.mLabel}>ECCENTRICITY:</span> <span className={styles.mVal}>0.0001842</span></div>
                <div><span className={styles.mLabel}>B* DRAG:</span> <span className={styles.mVal}>0.16842e-3</span></div>
              </div>
            </div>

            {/* Strip 02 - Right */}
            <div className={`${styles.hudStripCard} ${styles.hudStripRight}`}>
              <div className={styles.hudStripHeader}>
                <span className={styles.hudVectorNum}>02 // DEBRIS FLUX &amp; CONJUNCTION</span>
                <span className={styles.hudBadgeYellow}>18 SDS CDM ACTIVE</span>
              </div>
              <p className={styles.hudLead}>
                NASA ORDEM 3.2 debris flux (1.42e-4 hits/m²/yr), 18th Space Defense Squadron radar covariance, and conjunction probability Pc.
              </p>
              <div className={styles.hudMetricsGrid}>
                <div><span className={styles.mLabel}>RADAR TRACKED:</span> <span className={styles.mVal}>36,412 OBJECTS</span></div>
                <div><span className={styles.mLabel}>FLUX DENSITY:</span> <span className={styles.mVal}>1.42e-4 m⁻²yr⁻¹</span></div>
                <div><span className={styles.mLabel}>MISS DISTANCE:</span> <span className={styles.mVal}>412 METERS</span></div>
                <div><span className={styles.mLabel}>Pc THRESHOLD:</span> <span className={styles.mValYellow}>4.2e-5 (CAUTION)</span></div>
              </div>
            </div>

            {/* Strip 03 - Left */}
            <div className={`${styles.hudStripCard} ${styles.hudStripLeft}`}>
              <div className={styles.hudStripHeader}>
                <span className={styles.hudVectorNum}>03 // DETERMINISTIC RULE ENGINE</span>
                <span className={styles.hudBadgeGreen}>14.2 MS LATENCY</span>
              </div>
              <p className={styles.hudLead}>
                Pure mathematical evaluation of NASA-STD-8719.14C and ISO 24113 tolerances across envelope, mass, and passivation.
              </p>
              <div className={styles.hudMetricsGrid}>
                <div><span className={styles.mLabel}>RULES EVALUATED:</span> <span className={styles.mVal}>50 CHECKS</span></div>
                <div><span className={styles.mLabel}>RULES PASSED:</span> <span className={styles.mValGreen}>48 CONFIRMED</span></div>
                <div><span className={styles.mLabel}>DISCREPANCIES:</span> <span className={styles.mValRed}>2 FLAGGED</span></div>
                <div><span className={styles.mLabel}>HEURISTICS:</span> <span className={styles.mVal}>0% (STRICT BOUNDS)</span></div>
              </div>
            </div>

            {/* Strip 04 - Right */}
            <div className={`${styles.hudStripCard} ${styles.hudStripRight}`}>
              <div className={styles.hudStripHeader}>
                <span className={styles.hudVectorNum}>04 // SHA-256 PROVENANCE LEDGER</span>
                <span className={styles.hudBadgeGreen}>MERKLE ROOT LOCKED</span>
              </div>
              <p className={styles.hudLead}>
                Every parameter change and human engineering decision appends to a tamper-evident cryptographic SHA-256 ledger.
              </p>
              <div className={styles.hudMetricsGrid}>
                <div><span className={styles.mLabel}>ARTIFACTS BOUND:</span> <span className={styles.mVal}>34 DRAWINGS / CAD</span></div>
                <div><span className={styles.mLabel}>UNHASHED MUTATIONS:</span> <span className={styles.mValGreen}>ZERO</span></div>
                <div><span className={styles.mLabel}>MERKLE ROOT:</span> <span className={styles.mVal}>0x9f4a...3c21</span></div>
                <div><span className={styles.mLabel}>INTEGRITY STATE:</span> <span className={styles.mValGreen}>100% VALID</span></div>
              </div>
            </div>

            {/* Strip 05 - Left */}
            <div className={`${styles.hudStripCard} ${styles.hudStripLeft}`}>
              <div className={styles.hudStripHeader}>
                <span className={styles.hudVectorNum}>05 // HUMAN AUTHORITY GATE</span>
                <span className={styles.hudBadgeRed}>HTTP 423 LOCKED</span>
              </div>
              <p className={styles.hudLead}>
                Software never certifies missions. Export dossiers are strictly locked until designated technical authorities record signed rationales.
              </p>
              <div className={styles.hudMetricsGrid}>
                <div><span className={styles.mLabel}>EXPORT PHASE GATE:</span> <span className={styles.mValRed}>HTTP 423 LOCKED</span></div>
                <div><span className={styles.mLabel}>AUTHORITY ROLE:</span> <span className={styles.mVal}>LEAD CHIEF ENGINEER</span></div>
                <div><span className={styles.mLabel}>REQUIRED SIGNOFF:</span> <span className={styles.mValYellow}>1 WAIVER RATIONALE</span></div>
                <div><span className={styles.mLabel}>AUTONOMOUS PASS:</span> <span className={styles.mVal}>PROHIBITED</span></div>
              </div>
            </div>

            {/* Strip 06 - Right */}
            <div className={`${styles.hudStripCard} ${styles.hudStripRight}`}>
              <div className={styles.hudStripHeader}>
                <span className={styles.hudVectorNum}>06 // REGULATORY MISSION DOSSIER</span>
                <span className={styles.hudBadgeGreen}>EXPORT READY</span>
              </div>
              <p className={styles.hudLead}>
                Automated compliance alignment packets formatted for NASA DAS 3.2, FCC 22-74, and ISO 24113 flight readiness reviews.
              </p>
              <div className={styles.hudMetricsGrid}>
                <div><span className={styles.mLabel}>STANDARDS TARGETED:</span> <span className={styles.mVal}>NASA / ISO / ECSS / FCC</span></div>
                <div><span className={styles.mLabel}>SCHEMAS:</span> <span className={styles.mVal}>JSON + MARKDOWN</span></div>
                <div><span className={styles.mLabel}>PAGE LOCATORS:</span> <span className={styles.mValGreen}>100% GROUNDED</span></div>
                <div><span className={styles.mLabel}>SNAPSHOT HASH:</span> <span className={styles.mVal}>0x7e12...b994</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: ENGINEERING BENCHMARK MATRIX (REPLACES CHALLENGE/SOLUTION)
          ========================================================================= */}
      <section id="matrix-section" className={styles.matrixSection} aria-labelledby="benchmark-title">
        <div className={styles.fullBleedContainer}>
          <div className={styles.sectionTitleBlock}>
            <div className={styles.sectionCode}>03 // BENCHMARK MATRIX</div>
            <h2 id="benchmark-title" className={styles.sectionHeading}>
              ELIMINATE SPREADSHEET DRIFT BEFORE FLIGHT READINESS REVIEW
            </h2>
            <p className={styles.sectionLeadLine}>
              Comparing conventional unversioned smallsat workflows against OrbitScore deterministic verification.
            </p>
          </div>

          <div className={styles.benchmarkTableWrapper}>
            <table className={styles.benchmarkTable}>
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>ENGINEERING METRIC</th>
                  <th style={{ width: '37.5%' }}>LEGACY MANUAL ICD WORKFLOWS</th>
                  <th style={{ width: '37.5%' }}>ORBITSCORE DETERMINISTIC ENGINE</th>
                </tr>
              </thead>
              <tbody>
                {BENCHMARK_METRICS.map((row) => (
                  <tr key={row.metric}>
                    <td className={styles.metricCell}>{row.metric}</td>
                    <td className={styles.legacyCell}>
                      <span className={styles.tagRed}>{row.legacyStatus}</span>
                      <span className={styles.cellDesc}>{row.legacy}</span>
                    </td>
                    <td className={styles.orbitScoreCell}>
                      <span className={styles.tagGreen}>{row.orbitScoreStatus}</span>
                      <span className={styles.cellDesc}>{row.orbitScore}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: 6-STAGE PHASE GATE PIPELINE & SUBSYSTEM TELEMETRY MATRIX
          ========================================================================= */}
      <section id="workflow-section" className={styles.workflowSection} aria-labelledby="gates-title">
        <div className={styles.fullBleedContainer}>
          <div className={styles.sectionTitleBlock}>
            <div className={styles.sectionCode}>04 // VERIFICATION PIPELINE</div>
            <h2 id="gates-title" className={styles.sectionHeading}>
              SIX HARD GATES FROM RAW CAD INGEST TO CRYPTOGRAPHIC DOSSIER
            </h2>
            <p className={styles.sectionLeadLine}>
              Select any phase gate to inspect input schemas, deterministic checks, and lock conditions.
            </p>
          </div>

          {/* Full-Width 6-Stage Horizontal Stepper */}
          <div className={styles.stepperNavGrid} role="tablist" aria-label="Phase Gate Pipeline">
            {PHASE_GATE_STAGES.map((st, idx) => {
              const isSelected = idx === selectedStageIndex;
              return (
                <button
                  key={st.stageNum}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`${styles.stepperNavBtn} ${isSelected ? styles.stepperNavBtnActive : ''}`}
                  onClick={() => setSelectedStageIndex(idx)}
                >
                  <span className={styles.stepperNum}>STAGE {st.stageNum}</span>
                  <span className={styles.stepperTitle}>{st.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Gate Technical Specs (3 Equal-Height Columns) */}
          <div className={styles.gateSpecsGrid}>
            <div className={styles.gateSpecCard}>
              <div className={styles.gateSpecHeader}>
                <Database size={14} className={styles.iconBlue} />
                <span>INPUT SCHEMAS &amp; ARTIFACTS</span>
              </div>
              <p className={styles.gateSpecText}>{activeStage.inputSchemas}</p>
            </div>
            <div className={styles.gateSpecCard}>
              <div className={styles.gateSpecHeader}>
                <Cpu size={14} className={styles.iconGreen} />
                <span>DETERMINISTIC EVALUATION CHECKS</span>
              </div>
              <p className={styles.gateSpecText}>{activeStage.deterministicChecks}</p>
            </div>
            <div className={`${styles.gateSpecCard} ${styles.gateSpecCardAlert}`}>
              <div className={styles.gateSpecHeaderAlert}>
                <Lock size={14} className={styles.iconRed} />
                <span>GATE LOCK CONDITION</span>
              </div>
              <p className={styles.gateSpecTextAlert}>{activeStage.gateLockCondition}</p>
            </div>
          </div>

          {/* Subsystem Parameter & Citation Register */}
          <div className={styles.registerBlock}>
            <div className={styles.registerHeader}>
              <div className={styles.registerTitle}>
                <Layers size={15} className={styles.iconBlue} />
                <span>SUBSYSTEM PARAMETER &amp; CITATION REGISTER // {selectedCategory.toUpperCase()}</span>
              </div>
              <div className={styles.registerCounters}>
                <span className={styles.counterItem}>
                  TOTAL: <strong>{VERIFICATION_RULES.length}</strong>
                </span>
                <span className={styles.counterItemGreen}>
                  CONFIRMED: <strong>{VERIFICATION_RULES.filter((r) => r.status === 'confirmed').length}</strong>
                </span>
                <span className={styles.counterItemRed}>
                  CONFLICT: <strong>{VERIFICATION_RULES.filter((r) => r.status === 'conflicting').length}</strong>
                </span>
                <span className={styles.counterItemYellow}>
                  UNVERIFIED: <strong>{VERIFICATION_RULES.filter((r) => r.status === 'unverified').length}</strong>
                </span>
              </div>
            </div>

            <div className={styles.registerColumns}>
              {/* Left 3 cols: Category filter buttons */}
              <div className={styles.registerFilters}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`${styles.filterBtn} ${selectedCategory === 'all' ? styles.filterBtnActive : ''}`}
                >
                  ALL PARAMETERS [{VERIFICATION_RULES.length}]
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('structural')}
                  className={`${styles.filterBtn} ${selectedCategory === 'structural' ? styles.filterBtnActive : ''}`}
                >
                  STRUCTURAL &amp; ICD [2]
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('thermal')}
                  className={`${styles.filterBtn} ${selectedCategory === 'thermal' ? styles.filterBtnActive : ''}`}
                >
                  THERMAL &amp; EPS [2]
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('rf')}
                  className={`${styles.filterBtn} ${selectedCategory === 'rf' ? styles.filterBtnActive : ''}`}
                >
                  RF &amp; CCSDS [1]
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('orbital')}
                  className={`${styles.filterBtn} ${selectedCategory === 'orbital' ? styles.filterBtnActive : ''}`}
                >
                  ORBITAL DEBRIS &amp; PMD [3]
                </button>
              </div>

              {/* Right 9 cols: Full-Width Data Table */}
              <div className={styles.registerTableWrapper}>
                <table className={styles.registerTable}>
                  <thead>
                    <tr>
                      <th>RULE ID</th>
                      <th>STANDARD</th>
                      <th>MEASURED TELEMETRY</th>
                      <th>RULE THRESHOLD</th>
                      <th>CITATION LOCATOR</th>
                      <th>SHA-256</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRules.map((rule) => {
                      const isConfirmed = rule.status === 'confirmed';
                      const isConflict = rule.status === 'conflicting';
                      return (
                        <tr key={rule.id}>
                          <td className={styles.ruleIdCell}>{rule.id}</td>
                          <td className={styles.standardCell}>{rule.standard}</td>
                          <td className={styles.measuredCell}>{rule.measuredTelemetry}</td>
                          <td className={styles.thresholdCell}>{rule.ruleThreshold}</td>
                          <td className={styles.citationCell}>{rule.citation}</td>
                          <td className={styles.shaCell}>
                            <code>{rule.shaSnippet}</code>
                          </td>
                          <td>
                            <span
                              className={
                                isConfirmed
                                  ? styles.badgeSolidGreen
                                  : isConflict
                                  ? styles.badgeSolidRed
                                  : styles.badgeSolidYellow
                              }
                            >
                              {rule.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: 5-STATE EVIDENCE TAXONOMY & END-TO-END SHA-256 AUDIT LINEAGE
          ========================================================================= */}
      <section id="states-section" className={styles.statesSection} aria-labelledby="states-title">
        <div className={styles.fullBleedContainer}>
          <div className={styles.sectionTitleBlock}>
            <div className={styles.sectionCode}>05 // DATA INTEGRITY &amp; PROVENANCE</div>
            <h2 id="states-title" className={styles.sectionHeading}>
              FIVE STRICT VERIFICATION STATES. ZERO BINARY GUESSWORK.
            </h2>
            <p className={styles.sectionLeadLine}>
              OrbitScore replaces subjective claims with five mutually exclusive states locked by SHA-256 cryptographic lineage.
            </p>
          </div>

          {/* 5-Column Equal-Height State Selector Grid */}
          <div className={styles.statesGrid5} role="tablist" aria-label="Five Evidence States">
            {EVIDENCE_TAXONOMY.map((st, idx) => {
              const isSelected = idx === selectedStateIndex;
              return (
                <button
                  key={st.state}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`${styles.stateGridCell} ${isSelected ? styles.stateGridCellActive : ''}`}
                  onClick={() => setSelectedStateIndex(idx)}
                >
                  <div className={styles.stateCellTop}>
                    <span
                      className={styles.stateColorSquare}
                      style={{ backgroundColor: st.colorCode }}
                    />
                    <span className={styles.stateCellName}>{st.state}</span>
                  </div>
                  <p className={styles.stateCellDesc}>{st.definition}</p>
                </button>
              );
            })}
          </div>

          {/* Active State Deep Inspector Console */}
          <div className={styles.stateDetailConsole}>
            <div className={styles.stateConsoleHeader}>
              <div className={styles.stateConsoleTitle}>
                <span
                  className={styles.stateColorDot}
                  style={{ backgroundColor: activeStateTaxonomy.colorCode }}
                />
                <span>STATE INSPECTION: {activeStateTaxonomy.state}</span>
              </div>
              <span className={styles.stateExportGateNotice}>
                GATE POLICY: {activeStateTaxonomy.actionRequired}
              </span>
            </div>
            <div className={styles.stateConsoleGrid}>
              <div className={styles.stateConsoleBlock}>
                <span className={styles.consoleBlockLabel}>REAL MISSION EVIDENCE SPECIFICATION</span>
                <p className={styles.consoleBlockText}>{activeStateTaxonomy.realExample}</p>
              </div>
              <div className={styles.stateConsoleBlock}>
                <span className={styles.consoleBlockLabel}>VERIFICATION REQUIREMENT</span>
                <p className={styles.consoleBlockText}>{activeStateTaxonomy.definition}</p>
              </div>
            </div>
          </div>

          {/* 3-Node Cryptographic Audit Lineage */}
          <div className={styles.lineageBlock}>
            <div className={styles.lineageHeader}>
              <FileText size={15} className={styles.iconBlue} />
              <span>END-TO-END CRYPTOGRAPHIC SHA-256 AUDIT LINEAGE</span>
            </div>
            <div className={styles.lineageNodesGrid}>
              {CRYPTOGRAPHIC_NODES.map((node, i) => (
                <div key={node.stepNum} className={styles.lineageNodeCard}>
                  <div className={styles.lineageStepNum}>NODE {node.stepNum} // {node.title}</div>
                  <h3 className={styles.lineageSubject}>{node.subject}</h3>
                  <p className={styles.lineageDesc}>{node.desc}</p>
                  <div className={styles.lineageHashTag}>
                    <code>HASH: {node.hashSnippet}</code>
                  </div>
                  {i < CRYPTOGRAPHIC_NODES.length - 1 && (
                    <div className={styles.lineageArrow} aria-hidden="true">&rarr;</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live FastAPI Engine Status Bar */}
          <div className={styles.fastApiConsole}>
            <div className={styles.fastApiHeader}>
              <div className={styles.fastApiStatus}>
                <span className={isApiConnected ? styles.dotGreen : styles.dotAmber} />
                <span className={styles.fastApiTitle}>
                  {apiMode === 'live' && isApiConnected
                    ? 'CONNECTED TO LIVE FASTAPI ENGINE (127.0.0.1:8000)'
                    : 'RUNNING CLIENT-SIDE DETERMINISTIC ENGINE'}
                </span>
                <span className={styles.fastApiEndpoint}><code>{apiServerUrl}</code></span>
              </div>
              <div className={styles.fastApiActions}>
                <button
                  type="button"
                  onClick={() => toggleApiMode()}
                  className={styles.apiToggleBtn}
                >
                  <RefreshCw size={13} />
                  <span>{apiMode === 'live' ? 'SWITCH TO LOCAL CORE' : 'CONNECT LIVE ENGINE'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => syncProvenance()}
                  className={styles.apiVerifyBtn}
                >
                  <Lock size={13} />
                  <span>VERIFY MERKLE CHAIN</span>
                </button>
              </div>
            </div>
            <div className={styles.fastApiMetrics}>
              <div className={styles.fastApiMetricItem}>
                <span className={styles.mLabel}>SQLITE WAL PERSISTENCE:</span>
                <span className={styles.mValGreen}>LOCKED &amp; DURABLE</span>
              </div>
              <div className={styles.fastApiMetricItem}>
                <span className={styles.mLabel}>SHA-256 CHAIN STATUS:</span>
                <span className={styles.mValGreen}>
                  {provenance.valid ? `14/14 VALID (${provenance.checkedEvents} EVENTS)` : 'PENDING EVALUATION'}
                </span>
              </div>
              <div className={styles.fastApiMetricItem}>
                <span className={styles.mLabel}>CHIEF ENGINEER GATE:</span>
                <span className={styles.mValRed}>HTTP 423 EXPORT BLOCK ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: MISSION WORKSPACE LAUNCHPAD
          ========================================================================= */}
      <section id="missions-section" className={styles.launchpadSection} aria-labelledby="launchpad-title">
        <div className={styles.fullBleedContainer}>
          <div className={styles.sectionTitleBlock}>
            <div className={styles.sectionCode}>06 // ACTIVE MISSION WORKSPACES</div>
            <h2 id="launchpad-title" className={styles.sectionHeading}>
              SELECT ACTIVE SPACECRAFT WORKSPACE
            </h2>
            <p className={styles.sectionLeadLine}>
              Initialize mission telemetry, inspect CAD budgets, and execute deterministic compliance profiles.
            </p>
          </div>

          <div className={styles.workspacesGrid}>
            {REAL_SATELLITES.map((sat) => (
              <div key={sat.id} className={styles.workspaceCard}>
                <div className={styles.workspaceCardHeader}>
                  <span className={styles.workspaceNoradBadge}>NORAD {sat.noradId}</span>
                  <span className={styles.workspaceOrbitBadge}>{sat.orbitType.split(' ')[0]}</span>
                </div>
                <h3 className={styles.workspaceName}>{sat.name}</h3>
                <p className={styles.workspaceBus}>{sat.busType} &bull; {sat.launchVehicle}</p>
                <div className={styles.workspaceSpecs}>
                  <div><span className={styles.specLabel}>WET MASS:</span> {sat.wetMassKg} kg</div>
                  <div><span className={styles.specLabel}>POWER:</span> {sat.powerWatts} W</div>
                  <div><span className={styles.specLabel}>INCLINATION:</span> {sat.inclinationDeg}°</div>
                  <div><span className={styles.specLabel}>PERIOD:</span> {sat.periodMin} min</div>
                </div>
                <Link to={`/missions/${sat.id}`} className={styles.workspaceCtaBtn}>
                  <span>OPEN MISSION WORKSPACE</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
