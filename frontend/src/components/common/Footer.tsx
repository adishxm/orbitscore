import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ExternalLink } from 'lucide-react';
import { Logo } from './Logo';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className="container">
        {/* Top Disclaimer Banner */}
        <div className={styles.disclaimerBox}>
          <div className={styles.disclaimerIcon}>
            <ShieldAlert size={20} aria-hidden="true" />
          </div>
          <div className={styles.disclaimerText}>
            <strong>Mandatory Scope Notice:</strong> Despite the name, OrbitScore does not score or certify missions; it organizes evidence for human review. It does not replace qualified engineering oversight, agency consultation, or formal regulatory filings.
          </div>
        </div>

        {/* 3-Column Footer Grid */}
        <div className={styles.grid}>
          {/* Col 1: Brand & Purpose */}
          <div className={styles.colBrand}>
            <Link to="/" aria-label="OrbitScore Homepage">
              <Logo size="md" />
            </Link>
            <p className={styles.brandDesc}>
              A source-linked, human-reviewed workspace that helps student, university, and small
              spacecraft teams organize mission evidence before qualified expert review.
            </p>
            <div className={styles.statusChip}>
              <span className={styles.statusDot} />
              <span>Client-Side Evaluation Engine v0.1.0</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className={styles.colNav}>
            <div className={styles.colTitle}>Workspace & Spec</div>
            <ul className={styles.linkList}>
              <li>
                <Link to="/" className={styles.link}>
                  Product Overview
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className={styles.link}>
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/profiles" className={styles.link}>
                  Demo Profile & Rules
                </Link>
              </li>
              <li>
                <Link to="/app/missions" className={styles.link}>
                  Mission Workspaces
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Boundaries & Technical Transparency */}
          <div className={styles.colNav}>
            <div className={styles.colTitle}>Transparency & Limits</div>
            <ul className={styles.linkList}>
              <li>
                <Link to="/about-limits" className={styles.link}>
                  What OrbitScore Is / Is Not
                </Link>
              </li>
              <li>
                <Link to="/status" className={styles.link}>
                  System Status & Roadmap
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer noopener"
                  className={styles.linkExternal}
                >
                  <span>Architecture Contract</span>
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} OrbitScore. Open-source mission evidence tooling for small
            spacecraft teams.
          </div>
          <div className={styles.legalNotice}>
            Evidence-preparation packet. Not a certification, compliance determination, or official
            filing.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
