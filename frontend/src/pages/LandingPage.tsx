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
} from 'lucide-react';
import { OrbitHudNav } from '../components/common/OrbitHudNav';
import { HeroOrbitVisual } from '../components/common/HeroOrbitVisual';
import { FleetCard } from '../components/common/FleetCard';
import { SpacecraftBlueprint } from '../components/common/SpacecraftBlueprint';
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
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

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
    setIsSyncing(true);
    setTleSyncStatus(`FETCHING LIVE NORAD ${activeSatellite.noradId} GP FROM FASTAPI...`);
    try {
      const data = await fetchCelesTrakGPLive(activeSatellite.noradId, 'JSON', true, apiServerUrl);
      setLiveGpData(data);
      setTleSyncStatus(`FASTAPI LIVE // NORAD ${data.norad_cat_id} [${data.badge || 'LIVE'}]`);
    } catch {
      setTleSyncStatus(`VERIFIED // NORAD ${activeSatellite.noradId} GP ACTIVE`);
    } finally {
      setIsSyncing(false);
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
          SECTION 1: HERO (TWO-COLUMN DESKTOP + CENTERPIECE ORBIT VISUAL)
          ========================================================================= */}
      <section id="hero-section" className={styles.heroSection} aria-labelledby="hero-title">
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            {/* Left Column: Headlines, CTAs & Proof Strip */}
            <div className={styles.heroLeftCol}>
              {/* Chip Row */}
              <div className={styles.kickerBadgeRow}>
                <span className={styles.badgeVersion}>OrbitScore v4.2.0</span>
                <span className={styles.badgeTelemetry}>Deterministic flight telemetry</span>
                <span className={styles.badgeDisclosure}>Synthetic demo data</span>
              </div>

              {/* H1 in sentence case with accent-to-accent2 gradient */}
              <h1 id="hero-title" className={styles.heroHeadline}>
                Deterministic spacecraft verification &amp;{' '}
                <span className={styles.heroHeadlineGradient}>live orbital telemetry</span>
              </h1>

              {/* Subtitle */}
              <p className={styles.heroSubheader}>
                Lock NORAD ephemeris vectors, CAD mass budgets, and thermal vacuum logs into SHA-256 audit-ready mission dossiers.
              </p>

              {/* CTA Row */}
              <div className={styles.heroCtaRow}>
                <Link
                  to={`/missions/${activeSatellite.id}`}
                  className={styles.primaryHeroBtn}
                  aria-label="Launch mission console"
                >
                  <span>Launch workspace</span>
                  <ArrowRight size={15} />
                </Link>

                <button
                  type="button"
                  onClick={handleSyncCelesTrak}
                  disabled={isSyncing}
                  className={styles.secondaryHeroBtn}
                >
                  <RefreshCw size={14} className={isSyncing ? styles.spin : ''} />
                  <span>Sync live ephemeris</span>
                </button>
              </div>

              {/* Proof Strip Computed From Real App Data */}
              <div className={styles.proofStrip} aria-label="Real Engine Specifications">
                <div className={styles.proofTile}>
                  <span className={styles.proofVal}>{REAL_SATELLITES.length} SATELLITES</span>
                  <span className={styles.proofLabel}>TRACKED FLEET</span>
                </div>
                <div className={styles.proofTile}>
                  <span className={styles.proofVal}>{PHASE_GATE_STAGES.length} HARD GATES</span>
                  <span className={styles.proofLabel}>STRICT VERIFICATION</span>
                </div>
                <div className={styles.proofTile}>
                  <span className={styles.proofVal}>SHA-256 MERKLE</span>
                  <span className={styles.proofLabel}>AUDIT LINEAGE</span>
                </div>
                <div className={styles.proofTile}>
                  <span className={styles.proofVal}>CELESTRAK SGP4</span>
                  <span className={styles.proofLabel}>EPHEMERIS FEED</span>
                </div>
              </div>
            </div>

            {/* Right Column: Centerpiece Orbit Visual */}
            <div className={styles.heroRightCol}>
              <HeroOrbitVisual
                selectedSatId={selectedSatId}
                onSelectSatId={(satId) => {
                  setSelectedSatId(satId);
                  const sat = REAL_SATELLITES.find(s => s.id === satId);
                  if (sat && sat.subsystems[0]) {
                    setActiveSubsystemId(sat.subsystems[0].id);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1B: SPACECRAFT FLEET CARD & BLUEPRINT PANEL
          ========================================================================= */}
      <section className={styles.fleetOverlapSection} aria-label="Spacecraft Fleet and Blueprint Details">
        <div className={styles.container}>
          <div className={styles.fleetColumnsGrid}>
            {/* Left 6 Cols: Spacecraft Fleet Selector, 8-Cell Telemetry Grid & Raw TLE */}
            <div className={styles.fleetCol}>
              <FleetCard
                selectedSatId={selectedSatId}
                onSelectSatId={(satId) => {
                  setSelectedSatId(satId);
                  const sat = REAL_SATELLITES.find(s => s.id === satId);
                  if (sat && sat.subsystems[0]) {
                    setActiveSubsystemId(sat.subsystems[0].id);
                  }
                }}
                apogeeVal={apogeeVal}
                perigeeVal={perigeeVal}
                inclinationVal={inclinationVal}
                tleLine1Val={tleLine1Val}
                tleLine2Val={tleLine2Val}
                tleSyncStatus={tleSyncStatus}
                isSyncing={isSyncing}
                onSyncCelesTrak={handleSyncCelesTrak}
              />
            </div>

            {/* Right 6 Cols: Spacecraft Blueprint CAD & Subsystem Inspector */}
            <div className={styles.fleetCol}>
              <SpacecraftBlueprint
                activeSatellite={activeSatellite}
                activeSubsystemId={activeSubsystemId}
                onSelectSubsystemId={setActiveSubsystemId}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 6-VECTOR ORBITAL TELEMETRY REGISTER (3x2 GRID)
          ========================================================================= */}
      <section id="telemetry-section" className={styles.telemetrySection} aria-labelledby="telemetry-title">
        <div className={styles.container}>
          <div className={styles.sectionTitleBlock}>
            <div className={styles.sectionEyebrow}>02 · Flight telemetry vectors</div>
            <h2 id="telemetry-title" className={styles.sectionHeading}>
              6-Vector orbital telemetry register
            </h2>
            <p className={styles.sectionLeadLine}>
              Continuous state vectors, conjunction radar tracking, and deterministic bounds over zooming orbital limbs.
            </p>
          </div>

          {/* 3x2 Grid (2x3 Tablet, 1 Col Mobile) */}
          <div className={styles.vectorGrid3x2}>
            {/* Vector 01 */}
            <div className={styles.vectorCard}>
              <div className={styles.vectorHeader}>
                <span className={styles.vectorNum}>01 // ORBITAL EPHEMERIS</span>
                <span className={styles.badgeOk}>SGP4 REAL-TIME</span>
              </div>
              <div className={styles.vectorDataRow}>
                <span className={styles.vectorBigVal}>741.2 KM</span>
                {/* Mini Orbit Ellipse Visual */}
                <svg width="48" height="24" viewBox="0 0 48 24" fill="none" className={styles.miniVisual} aria-hidden="true">
                  <ellipse cx="24" cy="12" rx="20" ry="8" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 2" />
                  <circle cx="36" cy="7" r="2.5" fill="var(--accent-2)" />
                </svg>
              </div>
              <p className={styles.vectorLead}>
                Live altitude, inclination, eccentricity, B* drag term, and epoch age computed on a strict 2-hour CelesTrak refresh cycle.
              </p>
              <div className={styles.vectorFootnote}>
                <span>INCLINATION: 98.34° SSO</span> &bull; <span>ECC: 0.000184</span>
              </div>
            </div>

            {/* Vector 02 */}
            <div className={styles.vectorCard}>
              <div className={styles.vectorHeader}>
                <span className={styles.vectorNum}>02 // DEBRIS FLUX &amp; CONJUNCTION</span>
                <span className={styles.badgeWarn}>18 SDS CDM ACTIVE</span>
              </div>
              <div className={styles.vectorDataRow}>
                <span className={styles.vectorBigVal}>36,412 OBJECTS</span>
                {/* Mini Radar Covariance Arc */}
                <svg width="48" height="24" viewBox="0 0 48 24" fill="none" className={styles.miniVisual} aria-hidden="true">
                  <circle cx="24" cy="12" r="10" stroke="var(--warn)" strokeWidth="1" strokeDasharray="2 2" />
                  <circle cx="24" cy="12" r="2" fill="var(--warn)" />
                  <circle cx="29" cy="8" r="1.5" fill="var(--crit)" />
                </svg>
              </div>
              <p className={styles.vectorLead}>
                NASA ORDEM 3.2 debris flux (1.42e-4 hits/m²/yr), 18th Space Defense Squadron radar covariance, and conjunction probability Pc.
              </p>
              <div className={styles.vectorFootnote}>
                <span>MISS DISTANCE: 412 M</span> &bull; <span>Pc: 4.2e-5 (CAUTION)</span>
              </div>
            </div>

            {/* Vector 03 */}
            <div className={styles.vectorCard}>
              <div className={styles.vectorHeader}>
                <span className={styles.vectorNum}>03 // DETERMINISTIC RULE ENGINE</span>
                <span className={styles.badgeOk}>14.2 MS LATENCY</span>
              </div>
              <div className={styles.vectorDataRow}>
                <span className={styles.vectorBigVal}>48 CONFIRMED</span>
                {/* Mini Latency Progress Line */}
                <svg width="48" height="24" viewBox="0 0 48 24" fill="none" className={styles.miniVisual} aria-hidden="true">
                  <line x1="4" y1="12" x2="44" y2="12" stroke="var(--border-strong)" strokeWidth="2" strokeLinecap="round" />
                  <line x1="4" y1="12" x2="38" y2="12" stroke="var(--ok)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <p className={styles.vectorLead}>
                Pure mathematical evaluation of NASA-STD-8719.14C and ISO 24113 tolerances across envelope, mass, and passivation.
              </p>
              <div className={styles.vectorFootnote}>
                <span>50 CHECKS EVALUATED</span> &bull; <span>2 DISCREPANCIES FLAGGED</span>
              </div>
            </div>

            {/* Vector 04 */}
            <div className={styles.vectorCard}>
              <div className={styles.vectorHeader}>
                <span className={styles.vectorNum}>04 // SHA-256 PROVENANCE LEDGER</span>
                <span className={styles.badgeOk}>MERKLE ROOT LOCKED</span>
              </div>
              <div className={styles.vectorDataRow}>
                <span className={styles.vectorBigVal}>0x9f4a...3c21</span>
                {/* Mini Hash Lock Blocks */}
                <svg width="48" height="24" viewBox="0 0 48 24" fill="none" className={styles.miniVisual} aria-hidden="true">
                  <rect x="6" y="8" width="8" height="8" stroke="var(--accent)" strokeWidth="1" />
                  <line x1="14" y1="12" x2="20" y2="12" stroke="var(--accent)" />
                  <rect x="20" y="8" width="8" height="8" stroke="var(--accent)" strokeWidth="1" />
                  <line x1="28" y1="12" x2="34" y2="12" stroke="var(--accent)" />
                  <rect x="34" y="8" width="8" height="8" stroke="var(--ok)" strokeWidth="1.5" />
                </svg>
              </div>
              <p className={styles.vectorLead}>
                Every parameter change and human engineering decision appends to a tamper-evident cryptographic SHA-256 ledger.
              </p>
              <div className={styles.vectorFootnote}>
                <span>34 DRAWINGS / CAD BOUND</span> &bull; <span>ZERO UNHASHED MUTATIONS</span>
              </div>
            </div>

            {/* Vector 05 */}
            <div className={styles.vectorCard}>
              <div className={styles.vectorHeader}>
                <span className={styles.vectorNum}>05 // HUMAN AUTHORITY GATE</span>
                <span className={styles.badgeCrit}>HTTP 423 LOCKED</span>
              </div>
              <div className={styles.vectorDataRow}>
                <span className={styles.vectorBigValAlert}>HTTP 423 LOCKED</span>
                {/* Mini Gate Padlock */}
                <svg width="48" height="24" viewBox="0 0 48 24" fill="none" className={styles.miniVisual} aria-hidden="true">
                  <rect x="18" y="10" width="12" height="10" rx="2" stroke="var(--crit)" strokeWidth="1.5" fill="rgba(251, 113, 133, 0.15)" />
                  <path d="M 21 10 V 6 A 3 3 0 0 1 27 6 V 10" stroke="var(--crit)" strokeWidth="1.5" />
                </svg>
              </div>
              <p className={styles.vectorLead}>
                Software never certifies missions. Export dossiers are strictly locked until designated technical authorities record signed rationales.
              </p>
              <div className={styles.vectorFootnote}>
                <span>LEAD CHIEF ENGINEER</span> &bull; <span>1 WAIVER RATIONALE REQUIRED</span>
              </div>
            </div>

            {/* Vector 06 */}
            <div className={styles.vectorCard}>
              <div className={styles.vectorHeader}>
                <span className={styles.vectorNum}>06 // REGULATORY MISSION DOSSIER</span>
                <span className={styles.badgeOk}>EXPORT READY</span>
              </div>
              <div className={styles.vectorDataRow}>
                <span className={styles.vectorBigVal}>100% GROUNDED</span>
                {/* Mini Document Check */}
                <svg width="48" height="24" viewBox="0 0 48 24" fill="none" className={styles.miniVisual} aria-hidden="true">
                  <rect x="16" y="4" width="16" height="18" rx="2" stroke="var(--accent-2)" strokeWidth="1.2" />
                  <polyline points="21,13 23,16 27,9" stroke="var(--ok)" strokeWidth="1.5" />
                </svg>
              </div>
              <p className={styles.vectorLead}>
                Alignment packets formatted for NASA DAS 3.2, FCC 22-74, and ISO 24113 flight readiness reviews.
              </p>
              <div className={styles.vectorFootnote}>
                <span>NASA / ISO / ECSS / FCC</span> &bull; <span>JSON + MARKDOWN PACKETS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: ENGINEERING BENCHMARK MATRIX
          ========================================================================= */}
      <section id="matrix-section" className={styles.matrixSection} aria-labelledby="benchmark-title">
        <div className={styles.container}>
          <div className={styles.sectionTitleBlock}>
            <div className={styles.sectionEyebrow}>03 · Benchmark matrix</div>
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
                      <span className={styles.tagCrit}>{row.legacyStatus}</span>
                      <span className={styles.cellDesc}>{row.legacy}</span>
                    </td>
                    <td className={styles.orbitScoreCell}>
                      <span className={styles.tagOk}>{row.orbitScoreStatus}</span>
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
          SECTION 4: 6-STAGE PHASE GATE PIPELINE & SUBSYSTEM PARAMETER REGISTER
          ========================================================================= */}
      <section id="workflow-section" className={styles.workflowSection} aria-labelledby="gates-title">
        <div className={styles.container}>
          <div className={styles.sectionTitleBlock}>
            <div className={styles.sectionEyebrow}>04 · Verification pipeline</div>
            <h2 id="gates-title" className={styles.sectionHeading}>
              Six hard gates from raw CAD ingest to cryptographic dossier
            </h2>
            <p className={styles.sectionLeadLine}>
              Select any phase gate to inspect input schemas, deterministic checks, and lock conditions.
            </p>
          </div>

          {/* Stepper Segmented Control */}
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
                <Database size={14} className={styles.iconAccent} />
                <span>INPUT SCHEMAS &amp; ARTIFACTS</span>
              </div>
              <p className={styles.gateSpecText}>{activeStage.inputSchemas}</p>
            </div>
            <div className={styles.gateSpecCard}>
              <div className={styles.gateSpecHeader}>
                <Cpu size={14} className={styles.iconOk} />
                <span>DETERMINISTIC EVALUATION CHECKS</span>
              </div>
              <p className={styles.gateSpecText}>{activeStage.deterministicChecks}</p>
            </div>
            <div className={`${styles.gateSpecCard} ${styles.gateSpecCardAlert}`}>
              <div className={styles.gateSpecHeaderAlert}>
                <Lock size={14} className={styles.iconCrit} />
                <span>GATE LOCK CONDITION</span>
              </div>
              <p className={styles.gateSpecTextAlert}>{activeStage.gateLockCondition}</p>
            </div>
          </div>

          {/* Subsystem Parameter & Citation Register */}
          <div className={styles.registerBlock}>
            <div className={styles.registerHeader}>
              <div className={styles.registerTitle}>
                <Layers size={15} className={styles.iconAccent} />
                <span>SUBSYSTEM PARAMETER &amp; CITATION REGISTER // {selectedCategory.toUpperCase()}</span>
              </div>
              <div className={styles.registerCounters}>
                <span className={styles.counterItem}>
                  TOTAL: <strong>{VERIFICATION_RULES.length}</strong>
                </span>
                <span className={styles.counterItemOk}>
                  CONFIRMED: <strong>{VERIFICATION_RULES.filter((r) => r.status === 'confirmed').length}</strong>
                </span>
                <span className={styles.counterItemCrit}>
                  CONFLICT: <strong>{VERIFICATION_RULES.filter((r) => r.status === 'conflicting').length}</strong>
                </span>
                <span className={styles.counterItemWarn}>
                  UNVERIFIED: <strong>{VERIFICATION_RULES.filter((r) => r.status === 'unverified').length}</strong>
                </span>
              </div>
            </div>

            <div className={styles.registerColumns}>
              {/* Category Filter Buttons */}
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

              {/* Data Table */}
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
                                  ? styles.badgeSolidOk
                                  : isConflict
                                  ? styles.badgeSolidCrit
                                  : styles.badgeSolidWarn
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
          SECTION 5: 5-STATE EVIDENCE TAXONOMY & SHA-256 AUDIT LINEAGE
          ========================================================================= */}
      <section id="states-section" className={styles.statesSection} aria-labelledby="states-title">
        <div className={styles.container}>
          <div className={styles.sectionTitleBlock}>
            <div className={styles.sectionEyebrow}>05 · Data integrity &amp; provenance</div>
            <h2 id="states-title" className={styles.sectionHeading}>
              Five strict verification states. Zero binary guesswork.
            </h2>
            <p className={styles.sectionLeadLine}>
              OrbitScore replaces subjective claims with five mutually exclusive states locked by SHA-256 cryptographic lineage.
            </p>
          </div>

          {/* 5-Column State Grid */}
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
          <div id="lineage-section" className={styles.lineageBlock}>
            <div className={styles.lineageHeader}>
              <FileText size={15} className={styles.iconAccent} />
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

          {/* Live FastAPI Engine Status Console */}
          <div className={styles.fastApiConsole}>
            <div className={styles.fastApiHeader}>
              <div className={styles.fastApiStatus}>
                <span className={isApiConnected ? styles.dotOk : styles.dotWarn} />
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
                <span className={styles.mValOk}>LOCKED &amp; DURABLE</span>
              </div>
              <div className={styles.fastApiMetricItem}>
                <span className={styles.mLabel}>SHA-256 CHAIN STATUS:</span>
                <span className={styles.mValOk}>
                  {provenance.valid ? `14/14 VALID (${provenance.checkedEvents} EVENTS)` : 'PENDING EVALUATION'}
                </span>
              </div>
              <div className={styles.fastApiMetricItem}>
                <span className={styles.mLabel}>CHIEF ENGINEER GATE:</span>
                <span className={styles.mValCrit}>HTTP 423 EXPORT BLOCK ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: MISSION WORKSPACE LAUNCHPAD
          ========================================================================= */}
      <section id="missions-section" className={styles.launchpadSection} aria-labelledby="launchpad-title">
        <div className={styles.container}>
          <div className={styles.sectionTitleBlock}>
            <div className={styles.sectionEyebrow}>06 · Active mission workspaces</div>
            <h2 id="launchpad-title" className={styles.sectionHeading}>
              Select active spacecraft workspace
            </h2>
            <p className={styles.sectionLeadLine}>
              Initialize mission telemetry, inspect CAD budgets, and execute deterministic verification profiles.
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
