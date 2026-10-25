import React from 'react';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        {/* Full-Bleed 4-Column Aerospace Grid */}
        <div className={styles.grid}>
          {/* Col 1: Brand & Architecture */}
          <div className={styles.colBrand}>
            <Link to="/" className={styles.brandTitle} aria-label="OrbitScore Engine Homepage">
              <span className={styles.brandDot} />
              <span>ORBITSCORE</span>
            </Link>
            <p className={styles.brandDesc}>
              Deterministic Flight Telemetry, Real Spacecraft Ephemeris &amp; SHA-256 Provenance Verification Engine.
            </p>
            <div className={styles.kernelPill}>
              <span className={styles.dotGreen} />
              <span>DETERMINISTIC KERNEL v4.2.0 // NORAD LINKED</span>
            </div>
          </div>

          {/* Col 2: Telemetry & Flight Fleet */}
          <div className={styles.colNav}>
            <div className={styles.colTitle}>LIVE FLEET &amp; ORBIT</div>
            <ul className={styles.linkList}>
              <li>
                <Link to="/orbital-environment" className={styles.link}>
                  NORAD SGP4 Ephemeris
                </Link>
              </li>
              <li>
                <Link to="/conjunctions" className={styles.link}>
                  Conjunction Probability (Pc)
                </Link>
              </li>
              <li>
                <Link to="/missions" className={styles.link}>
                  Active Mission Workspaces
                </Link>
              </li>
              <li>
                <Link to="/scenarios" className={styles.link}>
                  Atmospheric Decay Scenarios
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Rules & Aerospace Standards */}
          <div className={styles.colNav}>
            <div className={styles.colTitle}>STANDARDS &amp; RULES</div>
            <ul className={styles.linkList}>
              <li>
                <Link to="/profiles" className={styles.link}>
                  NASA-STD-8719.14C Bounds
                </Link>
              </li>
              <li>
                <Link to="/profiles" className={styles.link}>
                  ISO 24113 Space Debris Limits
                </Link>
              </li>
              <li>
                <Link to="/profiles" className={styles.link}>
                  ECSS-E-ST-10C Mass &amp; Power
                </Link>
              </li>
              <li>
                <Link to="/status" className={styles.link}>
                  FastAPI Engine &amp; SQLite WAL
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Cryptographic Provenance */}
          <div className={styles.colNav}>
            <div className={styles.colTitle}>SECURITY &amp; AUDIT</div>
            <ul className={styles.linkList}>
              <li>
                <Link to="/about-limits#governance" className={styles.link}>
                  Human Authority Gate
                </Link>
              </li>
              <li>
                <Link to="/status" className={styles.link}>
                  SHA-256 Merkle Provenance
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className={styles.link}>
                  Deterministic Architecture
                </Link>
              </li>
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
              <Github size={16} />
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
