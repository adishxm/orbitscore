import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Twitter, Linkedin, Github } from 'lucide-react';
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
            <strong>Mandatory Scope Notice:</strong> Despite the name, OrbitScore does not score or certify missions; it organizes evidence for human review. It does not replace qualified engineering oversight, space agency consultation, or formal regulatory filings.
          </div>
        </div>

        {/* 4-Column Footer Grid matching Astro Sweepers */}
        <div className={styles.grid}>
          {/* Col 1: Brand & Mission */}
          <div className={styles.colBrand}>
            <Link to="/" className={styles.brandTitle} aria-label="OrbitScore Homepage">
              OrbitScore
            </Link>
            <p className={styles.brandDesc}>
              Saving Space, One Satellite at a Time. Real-time debris tracking, deterministic
              evidence registers, and AI-powered collision avoidance.
            </p>
            <div className={styles.statusChip}>
              <span className={styles.statusDot} />
              <span>Evidence Register Framework v0.1.0</span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className={styles.colNav}>
            <div className={styles.colTitle}>Product</div>
            <ul className={styles.linkList}>
              <li>
                <Link to="/solution" className={styles.link}>
                  Solution
                </Link>
              </li>
              <li>
                <Link to="/missions" className={styles.link}>
                  Workspaces
                </Link>
              </li>
              <li>
                <Link to="/conjunctions" className={styles.link}>
                  Conjunctions
                </Link>
              </li>
              <li>
                <Link to="/orbital-environment" className={styles.link}>
                  Environment &amp; TLEs
                </Link>
              </li>
              <li>
                <Link to="/scenarios" className={styles.link}>
                  Scenarios
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Architecture */}
          <div className={styles.colNav}>
            <div className={styles.colTitle}>Company</div>
            <ul className={styles.linkList}>
              <li>
                <Link to="/how-it-works" className={styles.link}>
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/about-limits" className={styles.link}>
                  Operational Limits
                </Link>
              </li>
              <li>
                <Link to="/profiles" className={styles.link}>
                  Profiles &amp; Rules
                </Link>
              </li>
              <li>
                <Link to="/status" className={styles.link}>
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Governance */}
          <div className={styles.colNav}>
            <div className={styles.colTitle}>Legal</div>
            <ul className={styles.linkList}>
              <li>
                <Link to="/about-limits" className={styles.link}>
                  Scope of Authority
                </Link>
              </li>
              <li>
                <Link to="/about-limits" className={styles.link}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/about-limits" className={styles.link}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Socials & NASA note */}
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            &copy; 2025-2026 OrbitScore. All rights reserved.
          </div>

          <div className={styles.socialRow}>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label="Twitter"
            >
              <Twitter size={18} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>
          </div>

          <div className={styles.nasaNote}>
            Inspired by NASA Space Apps Challenge 2025
          </div>

          <div className={styles.legalNotice}>
            Evidence-preparation packet. Not a certification, compliance determination, or official filing.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
