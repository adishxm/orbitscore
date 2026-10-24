import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import StateChip from '../components/common/StateChip';
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
            register. Here is how evidence flows from primary documents to human review packets.
          </p>
        </section>

        {/* 4-Step Process */}
        <section className={styles.section} aria-labelledby="steps-heading">
          <div className={styles.sectionHeader}>
            <h2 id="steps-heading" className={styles.sectionTitle}>
              The Four-Stage Evidence Pipeline
            </h2>
          </div>

          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <div className={styles.kicker}>Stage 01</div>
              <h3 className={styles.cardTitle}>Context Definition</h3>
              <p className={styles.cardText}>
                Teams record basic mission parameters: form factor (e.g. 3U CubeSat), target orbit,
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
              <h3 className={styles.cardTitle}>Deterministic Checks</h3>
              <p className={styles.cardText}>
                The client-side inspection engine runs deterministic checks against the selected profile.
                It flags missing fields, stale references, and conflicting values.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.kicker}>Stage 04</div>
              <h3 className={styles.cardTitle}>Human Review Decisions</h3>
              <p className={styles.cardText}>
                Qualified engineers inspect each finding, record standard review decisions (accepted,
                needs more evidence, disputed, deferred, or noted), and compile export review packets.
              </p>
            </div>
          </div>
        </section>

        {/* Evidence States Explanation */}
        <section className={styles.section} aria-labelledby="states-heading">
          <div className={styles.sectionHeader}>
            <h2 id="states-heading" className={styles.sectionTitle}>
              The Five Deterministic Evidence States
            </h2>
            <p className={styles.lead}>
              Every parameter in OrbitScore evaluates to exactly one of five mutually exclusive states (§3.3).
            </p>
          </div>

          <div className={styles.cardGrid}>
            <div className={`${styles.card} ${styles.stateCardMissing}`}>
              <StateChip state="missing" />
              <h3 className={`${styles.cardTitle} ${styles.cardTitleSpaced}`}>Missing</h3>
              <p className={styles.cardText}>
                No primary source document or parameter value has been recorded for a required profile check.
              </p>
            </div>

            <div className={`${styles.card} ${styles.stateCardUnconfirmed}`}>
              <StateChip state="unconfirmed" />
              <h3 className={`${styles.cardTitle} ${styles.cardTitleSpaced}`}>Unconfirmed</h3>
              <p className={styles.cardText}>
                A value and source citation are recorded, but have not yet been verified by a qualified human reviewer.
              </p>
            </div>

            <div className={`${styles.card} ${styles.stateCardConfirmed}`}>
              <StateChip state="confirmed" />
              <h3 className={`${styles.cardTitle} ${styles.cardTitleSpaced}`}>Confirmed</h3>
              <p className={styles.cardText}>
                A qualified human reviewer has inspected the cited primary document and confirmed value alignment.
              </p>
            </div>

            <div className={`${styles.card} ${styles.stateCardConflicting}`}>
              <StateChip state="conflicting" />
              <h3 className={`${styles.cardTitle} ${styles.cardTitleSpaced}`}>Conflicting</h3>
              <p className={styles.cardText}>
                Two or more recorded sources cite divergent values for the same technical parameter without resolution.
              </p>
            </div>

            <div className={`${styles.card} ${styles.stateCardOutOfScope}`}>
              <StateChip state="out-of-scope" />
              <h3 className={`${styles.cardTitle} ${styles.cardTitleSpaced}`}>Out of Scope</h3>
              <p className={styles.cardText}>
                Parameter falls outside the applicability boundary of the active inspection profile (e.g. non-CubeSat).
              </p>
            </div>
          </div>

          {/* Stale freshness note */}
          <div className={styles.staleExplainerCard} role="note">
            <Clock size={20} color="var(--os-color-accent-amber)" aria-hidden="true" className={styles.clockIcon} />
            <div>
              <div className={`${styles.kicker} ${styles.kickerAmber}`}>
                Temporal Qualifier: Stale Badge
              </div>
              <p className={`${styles.cardText} ${styles.scopeNoticeText}`}>
                <strong>"Stale" is not an evidence state.</strong> It is a temporal freshness warning badge displayed when a document revision or test date predates the latest mission configuration baseline or has exceeded its review validity horizon.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className={styles.cardActions}>
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
