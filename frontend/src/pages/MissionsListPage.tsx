import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import styles from './pages.module.css';

export const MissionsListPage: React.FC = () => {
  return (
    <div className={styles.pageRoot}>
      <div className="container">
        <section className={styles.heroSection} aria-labelledby="missions-heading">
          <div className={styles.kicker}>
            <span>Workspaces</span>
            <span>•</span>
            <span>Mission Registry</span>
          </div>
          <h1 id="missions-heading" className={styles.title}>
            Select or Initialize Mission Workspace
          </h1>
          <p className={styles.lead}>
            Choose a pre-configured synthetic mission fixture to inspect OrbitScore's deterministic check
            engine and evidence register, or initialize a custom mission configuration.
          </p>
        </section>

        {/* Missions Selection Grid */}
        <section aria-labelledby="fixtures-heading">
          <h2 id="fixtures-heading" className={styles.title} style={{ fontSize: 'var(--font-size-2xl)' }}>
            Available Synthetic Mission Fixtures
          </h2>

          <div className={styles.cardGrid}>
            {/* Asteria-3 */}
            <div className={styles.card} style={{ borderColor: 'var(--color-brand-cyan)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <span className={styles.kicker} style={{ margin: 0 }}>Primary Demo</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--font-size-xs)',
                  background: 'rgba(78, 205, 196, 0.1)',
                  color: 'var(--color-brand-cyan)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  SYNTHETIC 3U
                </span>
              </div>

              <h3 className={styles.cardTitle}>Asteria-3 Mission</h3>
              <p className={styles.cardText}>
                A synthetic 3U CubeSat in 500 km SSO with multi-spectral imager payload.
                Contains realistic intentional anomalies: conflicting mass records (CAD vs ICD),
                stale thermal vacuum test reports, missing launch deployment dates, and an unconfirmed battery report.
              </p>

              <div style={{ marginTop: 'var(--space-6)' }}>
                <Link to="/missions/asteria-3" className={styles.actionButton}>
                  <span>Open Asteria-3 Workspace</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Microsat-X */}
            <div className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <span className={styles.kicker} style={{ margin: 0, color: 'var(--color-state-stale)' }}>Boundary Fixture</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--font-size-xs)',
                  background: 'rgba(217, 119, 6, 0.1)',
                  color: 'var(--color-state-stale)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  OUT OF SCOPE
                </span>
              </div>

              <h3 className={styles.cardTitle}>Microsat-X Test Vehicle</h3>
              <p className={styles.cardText}>
                A 150 kg ESPA-class smallsat targeting geostationary transfer orbit.
                Demonstrates how the profile engine handles form factor applicability gates by
                halting automated CubeSat checks and requesting a tailored profile.
              </p>

              <div style={{ marginTop: 'var(--space-6)' }}>
                <Link to="/missions/microsat-x" className={styles.actionButtonSecondary}>
                  <span>Open Boundary Workspace</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MissionsListPage;
