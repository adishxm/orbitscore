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
            Clear technical boundaries protect spacecraft developers, flight directors, and regulatory bodies.
            Here is what OrbitScore is and what it strictly is not.
          </p>
        </section>

        {/* Mandatory Scope Callout */}
        <div className={styles.disclaimerCallout} role="note">
          <ShieldAlert size={24} color="var(--color-state-conflicting)" aria-hidden="true" />
          <div>
            <div className={styles.disclaimerCalloutTitle}>Mandatory Non-Certification Notice</div>
            <p style={{ margin: 0, fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
              Despite the name, OrbitScore does not score or certify missions; it organizes evidence for human review.
            </p>
          </div>
        </div>

        {/* What It Is vs What It Is Not Grid */}
        <section aria-labelledby="comparison-heading" style={{ marginTop: 'var(--space-8)' }}>
          <h2 id="comparison-heading" className={styles.title} style={{ fontSize: 'var(--font-size-2xl)' }}>
            Comparative Boundary Matrix
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
            {/* What it is */}
            <div className={styles.card} style={{ borderTop: '4px solid var(--color-brand-cyan)' }}>
              <h3 className={styles.cardTitle} style={{ color: 'var(--color-brand-cyan)' }}>
                What OrbitScore Is
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-3)' }}>
                <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <span style={{ color: 'var(--color-brand-cyan)' }}>✓</span>
                  <span>An evidence preparation workspace linking parameters to exact document citations.</span>
                </li>
                <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <span style={{ color: 'var(--color-brand-cyan)' }}>✓</span>
                  <span>A deterministic engine detecting discrepancies between engineering documents.</span>
                </li>
                <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <span style={{ color: 'var(--color-brand-cyan)' }}>✓</span>
                  <span>A client-side audit dossier generator for human technical reviewers.</span>
                </li>
                <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <span style={{ color: 'var(--color-brand-cyan)' }}>✓</span>
                  <span>A tracking ledger for engineering waivers, review decisions, and open issues.</span>
                </li>
              </ul>
            </div>

            {/* What it is NOT */}
            <div className={styles.card} style={{ borderTop: '4px solid var(--color-state-conflicting)' }}>
              <h3 className={styles.cardTitle} style={{ color: 'var(--color-state-conflicting)' }}>
                What OrbitScore Is NOT
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-3)' }}>
                <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <span style={{ color: 'var(--color-state-conflicting)' }}>✕</span>
                  <span>Not a certification authority, launch license, or regulatory body.</span>
                </li>
                <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <span style={{ color: 'var(--color-state-conflicting)' }}>✕</span>
                  <span>Not an evaluator that issues numerical percentages, grades, or rankings.</span>
                </li>
                <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <span style={{ color: 'var(--color-state-conflicting)' }}>✕</span>
                  <span>Not a substitute for qualified systems engineering review or orbital debris modeling.</span>
                </li>
                <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <span style={{ color: 'var(--color-state-conflicting)' }}>✕</span>
                  <span>Not an endorsement of flight readiness or launch vehicle suitability.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Why the Name Section */}
        <section aria-labelledby="name-heading" style={{ marginTop: 'var(--space-12)' }}>
          <h2 id="name-heading" className={styles.title} style={{ fontSize: 'var(--font-size-2xl)' }}>
            Why the Project Name "OrbitScore"?
          </h2>
          <p className={styles.cardText} style={{ maxWidth: '72ch' }}>
            The project name OrbitScore is an open-source product designation. However, in mission-critical space
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
