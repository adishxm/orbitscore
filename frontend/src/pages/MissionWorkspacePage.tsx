import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Layers, ShieldAlert } from 'lucide-react';
import styles from './pages.module.css';

export const MissionWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const missionName = id === 'microsat-x' ? 'Microsat-X Test Vehicle' : 'Asteria-3 CubeSat';

  return (
    <div className={styles.pageRoot}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Link
            to="/missions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--font-size-xs)'
            }}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Back to Mission Registry</span>
          </Link>
        </div>

        {/* Mission Header */}
        <section className={styles.heroSection} aria-labelledby="workspace-heading">
          <div className={styles.kicker}>
            <span>Active Mission Workspace</span>
            <span>•</span>
            <span style={{ color: 'var(--color-brand-cyan)' }}>{id?.toUpperCase()}</span>
          </div>
          <h1 id="workspace-heading" className={styles.title}>
            {missionName}
          </h1>
          <p className={styles.lead}>
            Evidence register and deterministic evaluation workspace for mission parameters,
            source citations, and human review sign-offs.
          </p>
        </section>

        {/* Mandatory Scope Callout */}
        <div className={styles.disclaimerCallout} role="note">
          <ShieldAlert size={22} color="var(--color-state-conflicting)" aria-hidden="true" />
          <div>
            <div className={styles.disclaimerCalloutTitle}>Workspace Review Boundary</div>
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Despite the name, OrbitScore does not score or certify missions; it organizes evidence for human review.
              All findings are deterministic consistency checks and must be evaluated by a qualified engineer.
            </p>
          </div>
        </div>

        {/* Workspace Flow Placeholder / Skeleton */}
        <div className={styles.card} style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
          <Layers size={36} style={{ color: 'var(--color-brand-cyan)', margin: '0 auto var(--space-4)' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-2)' }}>
            Workspace Flow Active
          </h2>
          <p className={styles.cardText} style={{ maxWidth: '60ch', margin: '0 auto var(--space-6)' }}>
            Loaded fixture: <code>{id}</code>. The six-stage workflow (Mission Context, Evidence Register,
            Profile Inspection Gate, Automated Findings, Review Decisions, and Export Packet) is ready.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MissionWorkspacePage;
