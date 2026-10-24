import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import styles from './pages.module.css';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className={styles.pageRoot}>
      <div className="container">
        <section className={styles.heroSection} aria-labelledby="how-heading">
          <div className={styles.kicker}>
            <span>Methodology</span>
            <span>•</span>
            <span>Inspection Engine</span>
          </div>
          <h1 id="how-heading" className={styles.title}>
            How OrbitScore Works
          </h1>
          <p className={styles.lead}>
            OrbitScore transforms unorganized engineering artifacts into a structured, source-linked evidence
            register. Here is how evidence flows from raw documents to reviewer review.
          </p>
        </section>

        {/* 4-Step Process */}
        <section aria-labelledby="steps-heading" style={{ marginBottom: 'var(--space-12)' }}>
          <h2 id="steps-heading" className={styles.title} style={{ fontSize: 'var(--font-size-2xl)' }}>
            The Four-Stage Pipeline
          </h2>

          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <div className={styles.kicker}>Stage 01</div>
              <h3 className={styles.cardTitle}>Context Definition</h3>
              <p className={styles.cardText}>
                Teams record the basic mission parameters: form factor (e.g. 3U CubeSat), target orbit,
                mass budget ceiling, and operational timeline.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.kicker}>Stage 02</div>
              <h3 className={styles.cardTitle}>Evidence Register</h3>
              <p className={styles.cardText}>
                Parameters are entered alongside explicit document identifiers, exact page numbers,
                paragraph citations, and revision timestamps.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.kicker}>Stage 03</div>
              <h3 className={styles.cardTitle}>Rule Inspection</h3>
              <p className={styles.cardText}>
                The client-side inspection engine runs deterministic checks against the selected profile.
                It flags missing fields, stale references, and conflicting values.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.kicker}>Stage 04</div>
              <h3 className={styles.cardTitle}>Reviewer Sign-Off</h3>
              <p className={styles.cardText}>
                Flight directors and domain experts inspect each finding, document waivers or mitigation
                rationales, and produce an export dossier.
              </p>
            </div>
          </div>
        </section>

        {/* Evidence States Explanation */}
        <section aria-labelledby="states-heading" style={{ marginBottom: 'var(--space-12)' }}>
          <h2 id="states-heading" className={styles.title} style={{ fontSize: 'var(--font-size-2xl)' }}>
            The Five Deterministic Evidence States
          </h2>
          <div className={styles.cardGrid}>
            <div className={styles.card} style={{ borderLeft: '4px solid var(--color-state-missing)' }}>
              <div className={styles.cardTitle}>Missing</div>
              <p className={styles.cardText}>
                No source document or value has been provided for a required technical parameter.
              </p>
            </div>

            <div className={styles.card} style={{ borderLeft: '4px solid var(--color-state-unconfirmed)' }}>
              <div className={styles.cardTitle}>Unconfirmed</div>
              <p className={styles.cardText}>
                A value and citation are recorded, but have not yet received formal human verification.
              </p>
            </div>

            <div className={styles.card} style={{ borderLeft: '4px solid var(--color-state-confirmed)' }}>
              <div className={styles.cardTitle}>Confirmed</div>
              <p className={styles.cardText}>
                A human reviewer has inspected the primary source and confirmed the cited value matches.
              </p>
            </div>

            <div className={styles.card} style={{ borderLeft: '4px solid var(--color-state-conflicting)' }}>
              <div className={styles.cardTitle}>Conflicting</div>
              <p className={styles.cardText}>
                Two or more sources provide divergent values for the same parameter without resolution.
              </p>
            </div>

            <div className={styles.card} style={{ borderLeft: '4px solid var(--color-state-stale)' }}>
              <div className={styles.cardTitle}>Stale</div>
              <p className={styles.cardText}>
                The source document revision or test date predates the latest mission configuration baseline.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div style={{ marginTop: 'var(--space-8)' }}>
          <Link to="/missions" className={styles.actionButton}>
            <span>Explore Interactive Demo</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
