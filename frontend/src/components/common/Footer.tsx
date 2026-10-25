import React from 'react';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer} role="contentinfo">
      {/* Faint Orbit-Line Divider */}
      <div className={styles.orbitDivider} aria-hidden="true">
        <svg viewBox="0 0 1200 40" fill="none" className={styles.dividerSvg} preserveAspectRatio="none">
          <path
            d="M 0 20 Q 600 -5 1200 20"
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </svg>
      </div>

      <div className={styles.container}>
        {/* Brand & Section Quick Links */}
        <div className={styles.topRow}>
          <div className={styles.brandGroup}>
            <Link to="/" className={styles.brandTitle} aria-label="OrbitScore Engine Homepage">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.logomark}
                aria-hidden="true"
              >
                <ellipse
                  cx="12"
                  cy="12"
                  rx="9.5"
                  ry="4"
                  transform="rotate(-25 12 12)"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeDasharray="2 1.5"
                />
                <circle cx="12" cy="12" r="3.5" fill="#ffffff" />
                <circle cx="18" cy="8.5" r="1.5" fill="var(--accent-2)" />
              </svg>
              <span>OrbitScore</span>
            </Link>
            <span className={styles.tagline}>
              DETERMINISTIC TELEMETRY &amp; VERIFICATION ENGINE
            </span>
          </div>

          {/* The Six Section Links */}
          <nav className={styles.sectionNav} aria-label="Footer Section Navigation">
            <a href="/#hero-section" className={styles.secLink}>01 Overview</a>
            <a href="/#telemetry-section" className={styles.secLink}>02 Fleet</a>
            <a href="/#matrix-section" className={styles.secLink}>03 Rules</a>
            <a href="/#workflow-section" className={styles.secLink}>04 Workflow</a>
            <a href="/#states-section" className={styles.secLink}>05 Citations</a>
            <a href="/#lineage-section" className={styles.secLink}>06 Ledger</a>
          </nav>
        </div>

        {/* 4-Column Aerospace Grid */}
        <div className={styles.grid}>
          {/* Col 1: System Specs */}
          <div className={styles.col}>
            <div className={styles.colTitle}>SYSTEM STATUS</div>
            <p className={styles.colText}>
              Autonomous orbital parameter checks and mathematical boundary evaluations over SGP4 vectors.
            </p>
            <div className={styles.kernelPill}>
              <span className={styles.dotGreen} />
              <span>DETERMINISTIC KERNEL v4.2.0 // NORAD LINKED</span>
            </div>
          </div>

          {/* Col 2: Telemetry & Fleet */}
          <div className={styles.col}>
            <div className={styles.colTitle}>FLIGHT FLEET &amp; ORBIT</div>
            <ul className={styles.linkList}>
              <li><Link to="/orbital-environment" className={styles.link}>NORAD SGP4 Ephemeris</Link></li>
              <li><Link to="/conjunctions" className={styles.link}>Conjunction Covariance (18 SDS)</Link></li>
              <li><Link to="/missions" className={styles.link}>Active Mission Workspaces</Link></li>
              <li><Link to="/scenarios" className={styles.link}>Atmospheric Decay Scenarios</Link></li>
            </ul>
          </div>

          {/* Col 3: Standards */}
          <div className={styles.col}>
            <div className={styles.colTitle}>AEROSPACE STANDARDS</div>
            <ul className={styles.linkList}>
              <li><Link to="/profiles" className={styles.link}>NASA-STD-8719.14C Bounds</Link></li>
              <li><Link to="/profiles" className={styles.link}>ISO 24113 Space Debris Limits</Link></li>
              <li><Link to="/profiles" className={styles.link}>ECSS-E-ST-10C Mass &amp; Power</Link></li>
              <li><Link to="/status" className={styles.link}>FastAPI Engine &amp; SQLite WAL</Link></li>
            </ul>
          </div>

          {/* Col 4: Audit & Lineage */}
          <div className={styles.col}>
            <div className={styles.colTitle}>GOVERNANCE &amp; AUDIT</div>
            <ul className={styles.linkList}>
              <li><Link to="/about-limits#governance" className={styles.link}>Human Authority Gate</Link></li>
              <li><Link to="/status" className={styles.link}>SHA-256 Merkle Provenance</Link></li>
              <li><Link to="/how-it-works" className={styles.link}>Deterministic Architecture</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Monospace Technical Lineage */}
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            &copy; 2026 ORBITSCORE // DETERMINISTIC MISSION TELEMETRY &amp; VERIFICATION ENGINE.
          </div>

          <div className={styles.socialRow}>
            <a
              href="https://github.com/adishxm/orbitscore"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label="OrbitScore GitHub Repository"
              title="OrbitScore GitHub Repository"
            >
              <Github size={15} />
            </a>
          </div>

          <div className={styles.licenseNotice}>
            PROPRIETARY DETERMINISTIC TELEMETRY SPECIFICATION // RFC 3161 TIME-STAMPED
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
