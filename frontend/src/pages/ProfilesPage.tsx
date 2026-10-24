import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import styles from './pages.module.css';

export const ProfilesPage: React.FC = () => {
  return (
    <div className={styles.pageRoot}>
      <div className="container">
        <section className={styles.heroSection} aria-labelledby="profiles-heading">
          <div className={styles.kicker}>
            <span>Rule Sets</span>
            <span>•</span>
            <span>Inspection Catalog</span>
          </div>
          <h1 id="profiles-heading" className={styles.title}>
            Profiles & Inspection Rules
          </h1>
          <p className={styles.lead}>
            Profiles define the deterministic criteria OrbitScore uses to inspect evidence. Each profile
            declares applicability boundaries and an explicit set of inspection checks.
          </p>
        </section>

        {/* Demo Profile Details */}
        <section aria-labelledby="active-profile-heading" style={{ marginBottom: 'var(--space-10)' }}>
          <div className={styles.card} style={{ borderColor: 'var(--color-brand-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <div className={styles.kicker}>Active Specification</div>
                <h2 id="active-profile-heading" className={styles.cardTitle} style={{ fontSize: 'var(--font-size-2xl)' }}>
                  Demo Evidence Completeness Profile
                </h2>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                  ID: demo-evidence-completeness-v0.1.0 • Engine: pure client-side deterministic
                </div>
              </div>
              <span style={{
                background: 'var(--color-surface-sunken)',
                border: '1px solid var(--color-border-subtle)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-brand-cyan)'
              }}>
                v0.1.0 STABLE
              </span>
            </div>

            <p className={styles.cardText}>
              Designed for standard low-Earth orbit 1U to 6U CubeSats. Evaluates baseline mass budgets,
              orbital lifetime evidence, electrical power confirmation, communication licensing documentation,
              and thermal vacuum test reports.
            </p>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-lg)', marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>
              Declared Checks in this Profile:
            </h3>

            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              <div className={styles.codeBlock}>
                <strong>C-01 [Mass Budget Ceiling]:</strong> Verifies total measured wet mass does not exceed the mission form factor limit (e.g. 4.0 kg for 3U) and checks for conflicting mass figures across ICD and CAD models.
              </div>
              <div className={styles.codeBlock}>
                <strong>C-02 [Orbital Lifetime Verification]:</strong> Verifies ballistic coefficient and orbital decay simulation evidence exist for deorbit within 25 years (or 5 years where recommended).
              </div>
              <div className={styles.codeBlock}>
                <strong>C-03 [Battery Test Confirmation]:</strong> Checks whether thermal runaway and vacuum discharge test reports have been confirmed by a qualified engineer.
              </div>
              <div className={styles.codeBlock}>
                <strong>C-04 [RF License Filing]:</strong> Checks whether ITU / national frequency coordination application or license documentation is present.
              </div>
              <div className={styles.codeBlock}>
                <strong>C-05 [Thermal Vacuum Report]:</strong> Verifies thermal cycle test evidence is referenced and not marked stale relative to final flight build.
              </div>
              <div className={styles.codeBlock}>
                <strong>C-06 [Deployment Timeline]:</strong> Verifies launch provider integration schedule and antenna deployment inhibits are documented.
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-6)' }}>
              <Link to="/missions" className={styles.actionButton}>
                <span>Run Against Asteria-3 Demo</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* Applicability Boundary */}
        <section aria-labelledby="boundary-heading">
          <h2 id="boundary-heading" className={styles.title} style={{ fontSize: 'var(--font-size-xl)' }}>
            Applicability Boundaries
          </h2>
          <p className={styles.cardText} style={{ maxWidth: '70ch' }}>
            When a mission configuration falls outside a profile's declared domain (for example, a GEO communications
            platform or a deep space probe), the inspection engine issues an applicability notice rather than
            producing misleading findings.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ProfilesPage;
