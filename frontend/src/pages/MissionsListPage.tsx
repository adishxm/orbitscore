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
        <section className={styles.section} aria-labelledby="fixtures-heading">
          <div className={styles.sectionHeader}>
            <h2 id="fixtures-heading" className={styles.sectionTitle}>
              Available Synthetic Mission Fixtures
            </h2>
          </div>

          <div className={styles.cardGrid}>
            {/* Asteria-3 */}
            <div className={`${styles.card} ${styles.cardPrimary}`}>
              <div className={styles.cardHeaderRow}>
                <span className={`${styles.kicker} ${styles.kickerPlain}`}>Primary Demo</span>
                <span className={styles.badgeCyan}>
                  SYNTHETIC 3U
                </span>
              </div>

              <h3 className={styles.cardTitle}>Asteria-3 Mission</h3>
              <p className={styles.cardText}>
                A synthetic 3U CubeSat in 500 km SSO with multi-spectral imager payload.
                Contains realistic intentional anomalies: conflicting mass records (CAD vs ICD),
                stale thermal vacuum test reports, missing launch deployment dates, and an unconfirmed battery report.
              </p>

              <div className={styles.cardActions}>
                <Link to="/missions/asteria-3" className={styles.actionButton}>
                  <span>Open Asteria-3 Workspace</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Microsat-X */}
            <div className={styles.card}>
              <div className={styles.cardHeaderRow}>
                <span className={`${styles.kicker} ${styles.kickerAmber} ${styles.kickerPlain}`}>Boundary Fixture</span>
                <span className={styles.badgeAmber}>
                  OUT OF SCOPE
                </span>
              </div>

              <h3 className={styles.cardTitle}>Microsat-X Test Vehicle</h3>
              <p className={styles.cardText}>
                A 150 kg ESPA-class smallsat targeting geostationary transfer orbit.
                Demonstrates how the profile engine handles form factor applicability gates by
                halting automated CubeSat checks and requesting a tailored profile.
              </p>

              <div className={styles.cardActions}>
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
