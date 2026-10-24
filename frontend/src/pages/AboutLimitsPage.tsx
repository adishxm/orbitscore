import React from 'react';
import { ShieldAlert } from 'lucide-react';
import styles from './pages.module.css';

export const AboutLimitsPage: React.FC = () => {
  return (
    <div className={styles.pageRoot}>
      <div className="container">
        <section className={styles.heroSection} aria-labelledby="limits-heading">
          <div className={styles.kicker}>
            <span>Boundaries & Transparency</span>
            <span>•</span>
            <span>Regulatory Notice</span>
          </div>
          <h1 id="limits-heading" className={styles.title}>
            System Limitations & Boundary Statement
          </h1>
          <p className={styles.lead}>
            Clear technical boundaries protect spacecraft developers, engineering reviewers, and mission stakeholders.
            Here is what OrbitScore is and what it strictly is not.
          </p>
        </section>

        {/* Mandatory Scope Callout */}
        <div className={styles.disclaimerCallout} role="note">
          <ShieldAlert size={24} color="var(--os-color-accent-amber)" aria-hidden="true" className={styles.flexShrink0} />
          <div>
            <div className={styles.disclaimerCalloutTitle}>Mandatory Non-Certification Notice</div>
            <p className={`${styles.cardText} ${styles.scopeNoticeText}`}>
              Despite the name, OrbitScore does not score or certify missions; it organizes evidence for human review.
            </p>
          </div>
        </div>

        {/* What It Is vs What It Is Not Grid */}
        <section className={styles.section} aria-labelledby="comparison-heading">
          <div className={styles.sectionHeader}>
            <h2 id="comparison-heading" className={styles.sectionTitle}>
              Comparative Boundary Matrix
            </h2>
          </div>

          <div className={styles.comparisonGrid}>
            {/* What it is */}
            <div className={styles.cardIs}>
              <h3 className={styles.cardTitleCyan}>
                What OrbitScore Is
              </h3>
              <ul className={styles.bulletList}>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletCheck} aria-hidden="true">✓</span>
                  <span>An evidence preparation workspace linking technical parameters to exact document citations.</span>
                </li>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletCheck} aria-hidden="true">✓</span>
                  <span>A deterministic engine detecting discrepancies between engineering documents.</span>
                </li>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletCheck} aria-hidden="true">✓</span>
                  <span>A client-side audit dossier generator for human technical reviewers.</span>
                </li>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletCheck} aria-hidden="true">✓</span>
                  <span>A tracking ledger for engineering mitigations, review decisions, and open issues.</span>
                </li>
              </ul>
            </div>

            {/* What it is NOT */}
            <div className={styles.cardIsNot}>
              <h3 className={styles.cardTitleRed}>
                What OrbitScore Is NOT
              </h3>
              <ul className={styles.bulletList}>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletCross} aria-hidden="true">✕</span>
                  <span>Not a certification authority, launch license, or regulatory body.</span>
                </li>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletCross} aria-hidden="true">✕</span>
                  <span>Not an evaluator that issues numerical percentages, grades, or rankings.</span>
                </li>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletCross} aria-hidden="true">✕</span>
                  <span>Not a substitute for qualified systems engineering review or orbital debris modeling.</span>
                </li>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletCross} aria-hidden="true">✕</span>
                  <span>Not an endorsement of flight readiness or launch vehicle suitability.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Why the Name Section */}
        <section className={styles.section} aria-labelledby="name-heading">
          <div className={styles.sectionHeader}>
            <h2 id="name-heading" className={styles.sectionTitle}>
              Why the Project Name "OrbitScore"?
            </h2>
          </div>
          <p className={styles.lead}>
            The project name OrbitScore is a software product designation. In mission-critical space
            applications, producing a single numerical summary or grade creates dangerous false confidence. OrbitScore
            deliberately avoids calculating any aggregate index. Instead, every parameter stands on its own source citation,
            and human reviewers retain sole responsibility for flight decisions.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutLimitsPage;
