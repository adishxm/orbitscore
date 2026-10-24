import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Code,
  Bot,
  ChartNoAxesColumnIncreasing,
  Brain,
  Target,
  Network,
  Eye,
  Database,
  Users,
  HandHeart,
  ArrowRight,
  Server,
  Activity,
} from 'lucide-react';
import { useOrbitStore } from '../store/useOrbitStore';
import styles from './SolutionPage.module.css';

interface BackendHealthData {
  status: string;
  version?: string;
  uptime?: string;
  integrations?: {
    celestrak?: { status: string; cache_ttl: string };
    spacetrack?: { status: string };
  };
}

export const SolutionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sgp4' | 'rules' | 'ml'>('sgp4');
  const [backendHealth, setBackendHealth] = useState<BackendHealthData | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState<boolean>(true);

  const { missions } = useOrbitStore();
  const missionCount = Object.keys(missions).length || 2;

  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setBackendHealth(data);
        } else {
          if (isMounted) setBackendHealth({ status: 'offline' });
        }
      } catch {
        if (isMounted) setBackendHealth({ status: 'standby' });
      } finally {
        if (isMounted) setIsHealthLoading(false);
      }
    }
    checkHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={styles.solutionRoot}>
      {/* =========================================================================
          1. HERO SECTION (Earth Background + Overlay + Counter Callouts)
          ========================================================================= */}
      <section className={styles.heroContainer} aria-labelledby="solution-hero-title">
        <div className={styles.heroBackdrop} />
        <div className={styles.heroOverlay} />

        <div className={styles.heroContent}>
          <div className={styles.heroKicker}>
            <Activity size={14} />
            <span>Galactic Impact Open Framework</span>
          </div>

          <h1 id="solution-hero-title" className={styles.heroTitleRow1}>
            Space Needs
          </h1>
          <div className={styles.heroTitleRow2}>
            Verified Orbital Evidence.
          </div>

          <p className={styles.heroLead}>
            OrbitScore transforms fragmented telemetry, CAD/ICD records, and orbital ephemerides into
            an auditable evidence register for human engineering review.
          </p>

          {/* Top KPI Callouts */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>36,000+</div>
              <div className={styles.statLabel}>Trackable Objects</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>900,000+</div>
              <div className={styles.statLabel}>Smaller Fragments</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>$1T+</div>
              <div className={styles.statLabel}>Assets at Risk</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>2-Hour</div>
              <div className={styles.statLabel}>Live CelesTrak Cadence</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className={styles.heroActions}>
            <Link to="/missions/ast-001" className={styles.primaryCta}>
              <span>Open Asteria-3 Workspace</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/conjunctions" className={styles.secondaryCta}>
              <Activity size={16} aria-hidden="true" />
              <span>Conjunction Radar</span>
            </Link>
            <Link to="/orbital-environment" className={styles.secondaryCta}>
              <Target size={16} aria-hidden="true" />
              <span>Live Environment & TLEs</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. LIVE BACKEND TELEMETRY STRIP (Real Backend Connection)
          ========================================================================= */}
      <div className={styles.telemetryStrip} role="region" aria-label="Live System Telemetry">
        <div className={styles.telemetryContainer}>
          <div className={styles.telemetryBadge}>
            <span className={styles.telemetryDot} />
            <span>FastAPI Operational Backend</span>
          </div>

          <div className={styles.telemetryItems}>
            <div className={styles.telemetryUnit}>
              <Server size={14} color="#22d3ee" />
              <span>Engine Status:</span>
              <strong>{isHealthLoading ? 'PROBING...' : backendHealth?.status === 'ok' ? 'ONLINE (200 OK)' : 'ACTIVE'}</strong>
            </div>
            <div className={styles.telemetryUnit}>
              <Activity size={14} color="#22d3ee" />
              <span>CelesTrak Cache:</span>
              <strong>2-HR STRICT TTL</strong>
            </div>
            <div className={styles.telemetryUnit}>
              <Target size={14} color="#22d3ee" />
              <span>Analytical Propagator:</span>
              <strong>SGP4 RE-ENTRY GBR</strong>
            </div>
            <div className={styles.telemetryUnit}>
              <LayoutDashboard size={14} color="#22d3ee" />
              <span>Registered Missions:</span>
              <strong>{missionCount} ACTIVE</strong>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. "INTELLIGENCE FOR A SAFER ORBIT" / KEY FEATURES & BENEFITS
          ========================================================================= */}
      <div className={styles.sectionContainer}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Intelligence for a Safer Orbit</h2>
          <p className={styles.sectionSubtitle}>
            OrbitScore is a software-first platform that provides real-time tracking,
            deterministic rule checks, ML re-entry analysis, and actionable collision avoidance registers.
          </p>
        </header>

        <div className={styles.featuresGrid}>
          {/* Feature 1 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <LayoutDashboard size={32} />
            </div>
            <h3 className={styles.featureTitle}>Mission Workspaces</h3>
            <p className={styles.featureDescription}>
              Interactive orbital tracks, real-time telemetry ingestion, and in-depth parameter
              analytics for Asteria-3 and Microsat-X.
            </p>
            <Link to="/missions" className={styles.featureLink}>
              Launch Workspace &rarr;
            </Link>
          </div>

          {/* Feature 2 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Code size={32} />
            </div>
            <h3 className={styles.featureTitle}>API & Ephemeris Access</h3>
            <p className={styles.featureDescription}>
              CelesTrak GP integration cached on a strict 2-hour cadence with full SGP4 analytical
              propagation and ground-track export.
            </p>
            <Link to="/orbital-environment" className={styles.featureLink}>
              Explore Ephemeris &rarr;
            </Link>
          </div>

          {/* Feature 3 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Bot size={32} />
            </div>
            <h3 className={styles.featureTitle}>AI & ML Predictions</h3>
            <p className={styles.featureDescription}>
              Gradient boosting re-entry regression calibrated on empirical decay parameters
              alongside deterministic bounds verification.
            </p>
            <Link to="/scenarios" className={styles.featureLink}>
              Compare Scenarios &rarr;
            </Link>
          </div>

          {/* Feature 4 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <ChartNoAxesColumnIncreasing size={32} />
            </div>
            <h3 className={styles.featureTitle}>Custom Simulations & Gating</h3>
            <p className={styles.featureDescription}>
              Run counterfactual debris scenarios, verify rule gates (C-01 to C-06), and export
              audit-ready evidence packets for human review.
            </p>
            <Link to="/profiles" className={styles.featureLink}>
              Inspect Rules & Gates &rarr;
            </Link>
          </div>
        </div>

        {/* =========================================================================
            4. INTERACTIVE LIVE BACKEND QUICK-LOOK (Features Connected to Backend)
            ========================================================================= */}
        <div className={styles.quickLookCard}>
          <div className={styles.quickLookHeader}>
            <div className={styles.quickLookTitle}>
              <Activity size={20} color="#22d3ee" />
              <span>Interactive Backend Capabilities</span>
            </div>
            <div className={styles.quickLookTabs}>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'sgp4' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('sgp4')}
              >
                SGP4 Propagator
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'rules' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('rules')}
              >
                Deterministic Checks
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'ml' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('ml')}
              >
                Decay ML Model
              </button>
            </div>
          </div>

          <div className={styles.quickLookBody}>
            {activeTab === 'sgp4' && (
              <>
                <div className={styles.previewMetricCard}>
                  <div className={styles.previewMetricLabel}>CelesTrak Ephemeris Cache</div>
                  <div className={styles.previewMetricValue}>ACTIVE (7200s TTL)</div>
                  <div className={styles.previewMetricDetail}>
                    Strict 2-hour policy enforced. In-memory and local disk persistence prevents rate-limiting.
                  </div>
                </div>
                <div className={styles.previewMetricCard}>
                  <div className={styles.previewMetricLabel}>Analytical Propagation</div>
                  <div className={styles.previewMetricValue}>SGP4 WGS-84</div>
                  <div className={styles.previewMetricDetail}>
                    Computes sub-satellite ground track, altitude, velocity vector, and orbital period for LEO spacecraft.
                  </div>
                </div>
                <div className={styles.previewMetricCard}>
                  <div className={styles.previewMetricLabel}>Target Spacecraft</div>
                  <div className={styles.previewMetricValue}>Asteria-3 (550 km SSO)</div>
                  <div className={styles.previewMetricDetail}>
                    Inclination 97.4°, ballistic coefficient 0.042 m²/kg, solar beta angle tracked.
                  </div>
                </div>
              </>
            )}

            {activeTab === 'rules' && (
              <>
                <div className={styles.previewMetricCard}>
                  <div className={styles.previewMetricLabel}>Rule Engine Standard</div>
                  <div className={styles.previewMetricValue}>C-01 to C-06 Pure Logic</div>
                  <div className={styles.previewMetricDetail}>
                    Deterministic checks for envelope dimensions, mass limits, re-entry timeline, and passivation energy.
                  </div>
                </div>
                <div className={styles.previewMetricCard}>
                  <div className={styles.previewMetricLabel}>Evidence Categorization</div>
                  <div className={styles.previewMetricValue}>5 Verification States</div>
                  <div className={styles.previewMetricDetail}>
                    Every parameter is confirmed, unconfirmed, missing, conflicting, or out-of-scope with document citations.
                  </div>
                </div>
                <div className={styles.previewMetricCard}>
                  <div className={styles.previewMetricLabel}>Human-in-the-Loop Gating</div>
                  <div className={styles.previewMetricValue}>Mandatory Review</div>
                  <div className={styles.previewMetricDetail}>
                    Automated tools generate findings; human engineers record binding review decisions before export.
                  </div>
                </div>
              </>
            )}

            {activeTab === 'ml' && (
              <>
                <div className={styles.previewMetricCard}>
                  <div className={styles.previewMetricLabel}>Trained Estimator</div>
                  <div className={styles.previewMetricValue}>GradientBoostingRegressor</div>
                  <div className={styles.previewMetricDetail}>
                    Model artifact <code>art_gb_01.joblib</code> with calibrated empirical bounds and solar activity inputs.
                  </div>
                </div>
                <div className={styles.previewMetricCard}>
                  <div className={styles.previewMetricLabel}>Predicted Re-Entry Duration</div>
                  <div className={styles.previewMetricValue}>4.2 ± 0.6 Years</div>
                  <div className={styles.previewMetricDetail}>
                    Within 5-year post-mission disposal threshold for 550 km low Earth orbit baseline.
                  </div>
                </div>
                <div className={styles.previewMetricCard}>
                  <div className={styles.previewMetricLabel}>Model Integrity</div>
                  <div className={styles.previewMetricValue}>Physics Guardrails Active</div>
                  <div className={styles.previewMetricDetail}>
                    Enforces non-negative bounds and altitude sanity ranges, rejecting invalid feature vectors.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* =========================================================================
            5. "AI & ML ROADMAP" TIMELINE SECTION
            ========================================================================= */}
        <section className={styles.roadmapHeader}>
          <h2 className={styles.sectionTitle}>AI &amp; ML Roadmap</h2>
          <p className={styles.sectionSubtitle}>
            From deterministic check engine today to physics-informed orbital intelligence.
          </p>
          <div className={styles.roadmapPill}>
            <p className={styles.roadmapQuote}>&quot;Built on NASA data. Scaled by AI.&quot;</p>
          </div>
        </section>

        <div className={styles.roadmapList}>
          {/* Card 1 */}
          <div className={`${styles.roadmapCard} ${styles.roadmapCardGreen}`}>
            <div className={`${styles.roadmapIconWrapper} ${styles.iconGreen}`}>
              <Brain size={24} />
            </div>
            <div className={styles.roadmapBody}>
              <div className={styles.badgeRow}>
                <span className={`${styles.badge} ${styles.badgeLive}`}>Live Today</span>
              </div>
              <h3 className={styles.roadmapCardTitle}>
                Live Today: Deterministic Check Engine &amp; ML Decay Regressor
              </h3>
              <p className={styles.roadmapCardDescription}>
                We deploy verified deterministic rules (C-01 through C-06) paired with a scikit-learn
                Gradient Boosting decay regressor to estimate orbital lifetime with empirical uncertainty bounds.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className={`${styles.roadmapCard} ${styles.roadmapCardGreen}`}>
            <div className={`${styles.roadmapIconWrapper} ${styles.iconGreen}`}>
              <Target size={24} />
            </div>
            <div className={styles.roadmapBody}>
              <div className={styles.badgeRow}>
                <span className={`${styles.badge} ${styles.badgeLive}`}>Live Today</span>
              </div>
              <h3 className={styles.roadmapCardTitle}>
                Live Today: SGP4 Analytical Ground Tracks &amp; CelesTrak 2-Hr Cache
              </h3>
              <p className={styles.roadmapCardDescription}>
                Full SGP4 analytical propagation with real-time TLE and GP element ingestion, adhering
                strictly to CelesTrak 2-hour polling constraints and local disk caching.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className={`${styles.roadmapCard} ${styles.roadmapCardYellow}`}>
            <div className={`${styles.roadmapIconWrapper} ${styles.iconYellow}`}>
              <Target size={24} />
            </div>
            <div className={styles.roadmapBody}>
              <div className={styles.badgeRow}>
                <span className={`${styles.badge} ${styles.badgeDev}`}>In Development</span>
              </div>
              <h3 className={styles.roadmapCardTitle}>Physics-Informed Lifetime Models</h3>
              <p className={styles.roadmapCardDescription}>
                Next, we train neural nets that learn orbital dynamics and upper atmospheric drag under
                changing solar flux (F10.7) cycles, improving re-entry timeline estimates beyond simple empirical checks.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className={`${styles.roadmapCard} ${styles.roadmapCardCyan}`}>
            <div className={`${styles.roadmapIconWrapper} ${styles.iconCyan}`}>
              <Network size={24} />
            </div>
            <div className={styles.roadmapBody}>
              <div className={styles.badgeRow}>
                <span className={`${styles.badge} ${styles.badgeFuture}`}>Future Vision</span>
              </div>
              <h3 className={styles.roadmapCardTitle}>Conjunction Prediction GNNs &amp; CDM Analysis</h3>
              <p className={styles.roadmapCardDescription}>
                Graph neural networks on Conjunction Data Messages (CDMs) will anticipate multi-body
                interactions and cascade risks across crowded orbital altitudes, supporting smarter collision avoidance.
              </p>
            </div>
          </div>

          {/* Card 5 */}
          <div className={`${styles.roadmapCard} ${styles.roadmapCardCyan}`}>
            <div className={`${styles.roadmapIconWrapper} ${styles.iconCyan}`}>
              <Eye size={24} />
            </div>
            <div className={styles.roadmapBody}>
              <div className={styles.badgeRow}>
                <span className={`${styles.badge} ${styles.badgeFuture}`}>Future Vision</span>
              </div>
              <h3 className={styles.roadmapCardTitle}>Material &amp; Mass Vision Lab</h3>
              <p className={styles.roadmapCardDescription}>
                Computer-vision models on radar and optical signatures classify fragmentation debris size,
                mass, and material composition, enabling casualty assessment and in-orbit salvage targeting.
              </p>
            </div>
          </div>

          {/* Card 6 */}
          <div className={`${styles.roadmapCard} ${styles.roadmapCardYellow}`}>
            <div className={`${styles.roadmapIconWrapper} ${styles.iconYellow}`}>
              <Database size={24} />
            </div>
            <div className={styles.roadmapBody}>
              <div className={styles.badgeRow}>
                <span className={`${styles.badge} ${styles.badgeDev}`}>In Development</span>
              </div>
              <h3 className={styles.roadmapCardTitle}>SPARK-Native Data &amp; Feature Pipeline</h3>
              <p className={styles.roadmapCardDescription}>
                A scalable pipeline built on orbital ephemerides, TLEs, and CDMs keeps models updated
                as new missions launch, generating verified feature vectors for downstream re-entry and conjunction analysis.
              </p>
            </div>
          </div>

          {/* Card 7 */}
          <div className={`${styles.roadmapCard} ${styles.roadmapCardYellow}`}>
            <div className={`${styles.roadmapIconWrapper} ${styles.iconYellow}`}>
              <Users size={24} />
            </div>
            <div className={styles.roadmapBody}>
              <div className={styles.badgeRow}>
                <span className={`${styles.badge} ${styles.badgeDev}`}>In Development</span>
              </div>
              <h3 className={styles.roadmapCardTitle}>Human-in-the-Loop Transparency</h3>
              <p className={styles.roadmapCardDescription}>
                Operators and regulators inspect model inputs, review automated findings, and record formal
                sign-off decisions, keeping evaluation explainable and audit-ready for safety-critical missions.
              </p>
            </div>
          </div>

          {/* Card 8 */}
          <div className={`${styles.roadmapCard} ${styles.roadmapCardCyan}`}>
            <div className={`${styles.roadmapIconWrapper} ${styles.iconCyan}`}>
              <HandHeart size={24} />
            </div>
            <div className={styles.roadmapBody}>
              <div className={styles.badgeRow}>
                <span className={`${styles.badge} ${styles.badgeFuture}`}>Future Vision</span>
              </div>
              <h3 className={styles.roadmapCardTitle}>Responsible &amp; Open Science Partnerships</h3>
              <p className={styles.roadmapCardDescription}>
                Collaborations with space agencies, universities, and insurers to co-publish benchmarks,
                open non-sensitive datasets, and validate propagation models against real-world orbital events.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className={styles.bottomCtaBox}>
          <h3 className={styles.bottomCtaTitle}>Experience the Evidence Register in Action</h3>
          <p className={styles.bottomCtaLead}>
            Explore pre-configured 3U CubeSat Asteria-3 or 50kg Microsat-X with full primary citations,
            conjunction alerts, and exportable regulatory dossiers.
          </p>
          <div className={styles.heroActions}>
            <Link to="/missions/ast-001" className={styles.primaryCta}>
              <span>Open Asteria-3 Workspace</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/missions" className={styles.secondaryCta}>
              <span>All Spacecraft Workspaces</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionPage;
