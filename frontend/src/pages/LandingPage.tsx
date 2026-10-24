import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, AlertCircle, FileText, Layers, ShieldCheck } from 'lucide-react';
import styles from './pages.module.css';

export const LandingPage: React.FC = () => {
  return (
    <div className={styles.pageRoot}>
      <div className="container">
        {/* Hero Section */}
        <section className={styles.heroSection} aria-labelledby="hero-heading">
          <div className={styles.kicker}>
            <span>Evidence Preparation System</span>
            <span>•</span>
            <span>Open Source</span>
          </div>
          <h1 id="hero-heading" className={styles.title}>
            Organize Mission Evidence Before Human Review
          </h1>
          <p className={styles.lead}>
            A source-linked workspace for student, university, and small spacecraft teams.
            Consolidate technical parameters, track exact document citations, detect conflicts,
            and export review-ready dossiers for qualified flight directors and safety engineers.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Link to="/missions" className={styles.actionButton}>
              <span>Open Asteria-3 Demo</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/how-it-works" className={styles.actionButtonSecondary}>
              <span>How It Works</span>
            </Link>
          </div>
        </section>

        {/* Mandatory Scope Callout */}
        <div className={styles.disclaimerCallout} role="note">
          <ShieldCheck size={22} color="var(--color-state-conflicting)" aria-hidden="true" />
          <div>
            <div className={styles.disclaimerCalloutTitle}>Technical Boundary Notice</div>
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Despite the name, OrbitScore does not score or certify missions; it organizes evidence for human review.
              It performs automated structural consistency checks on source-linked data to surface missing citations,
              stale dates, and numerical conflicts prior to formal human evaluation.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <section aria-labelledby="pillars-heading">
          <h2 id="pillars-heading" className={styles.title} style={{ fontSize: 'var(--font-size-2xl)' }}>
            Core Evidence Pillars
          </h2>
          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <FileText size={20} style={{ color: 'var(--color-brand-cyan)', marginBottom: '8px' }} />
                <div>Source Citations</div>
              </div>
              <p className={styles.cardText}>
                Every parameter links to an exact primary document, revision, page number, and paragraph.
                No ungrounded claims are accepted into the review dossier.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <AlertCircle size={20} style={{ color: 'var(--color-state-conflicting)', marginBottom: '8px' }} />
                <div>Conflict Detection</div>
              </div>
              <p className={styles.cardText}>
                Automated deterministic rules detect discrepancies between engineering budgets, ICD sheets,
                and mass properties documents before submission.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <CheckCircle2 size={20} style={{ color: 'var(--color-state-confirmed)', marginBottom: '8px' }} />
                <div>Human Sign-Off</div>
              </div>
              <p className={styles.cardText}>
                Clear division between automated consistency findings and human technical decisions.
                Reviewers record rationales, waivers, or open action items explicitly.
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <Layers size={20} style={{ color: 'var(--color-brand-lavender)', marginBottom: '8px' }} />
                <div>Portable Dossier</div>
              </div>
              <p className={styles.cardText}>
                Export comprehensive, cited dossiers in Markdown, JSON, and clean printable formats for
                formal design reviews and safety boards.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
