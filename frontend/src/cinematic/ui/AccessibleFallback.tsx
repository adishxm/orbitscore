import { Link } from 'react-router-dom';
import { Info, ArrowRight, ExternalLink } from 'lucide-react';
import { CHAPTERS } from '../config/chapters.config';
import styles from './AccessibleFallback.module.css';

interface AccessibleFallbackProps {
  reason?: string;
}

export const AccessibleFallback: React.FC<AccessibleFallbackProps> = () => {
  return (
    <section className={styles.fallbackRoot} aria-labelledby="fallback-title">
      <div className={styles.container}>
        {/* Poster Header */}
        <div className={styles.posterWrap} role="img" aria-label="OrbitScore synthetic 3U CubeSat in 500 km SSO orbit">
          <div className={styles.modeBadge}>ORBITAL MISSION TOUR • 2D MODE</div>
          <div className={styles.posterIllustration} aria-hidden="true" />
          <h2 id="fallback-title" className={styles.posterTitle}>
            OrbitScore: Mission Evidence Workspace
          </h2>
          <p className={styles.posterSubtitle}>
            A source-linked pre-review workspace for student, university, and small spacecraft engineering teams.
          </p>
        </div>

        {/* Experience Mode Status */}
        <div className={styles.noticeBox} role="status">
          <Info size={20} color="#22d3ee" aria-hidden="true" />
          <div>
            <h3>2D Interactive Mode Active</h3>
            <p>
              Interactive 3D orbital visualization is presented in 2D preview mode on this display.
              All mission evidence registers, deterministic rule engines, and review decision tools remain 100% accessible below.
            </p>
          </div>
        </div>

        {/* Semantic Chapter Content */}
        <div className={styles.chapterList}>
          {CHAPTERS.map((ch) => (
            <article key={ch.id} className={styles.chapterCard}>
              <div className={styles.chapterKicker}>{ch.kicker}</div>
              <h2 className={styles.chapterTitle}>{ch.title}</h2>
              <div className={styles.chapterSub}>{ch.subheading}</div>
              <p className={styles.chapterDesc}>{ch.description}</p>
              <div className={styles.hudSummary} aria-label="Subsystem Telemetry Highlights">
                {ch.hud.map((item) => (
                  <span key={item.id} className={styles.hudPill}>
                    <strong>{item.label}:</strong> {item.value} {item.unit ?? ''}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* Direct Action Links */}
        <div className={styles.actions}>
          <Link to="/missions/asteria-3" className={styles.actionPrimary}>
            <span>Open Asteria-3 Demo Workspace</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link to="/profiles" className={styles.actionSecondary}>
            <span>View Rule Profiles</span>
            <ExternalLink size={16} aria-hidden="true" />
          </Link>
          <Link to="/about-limits" className={styles.actionSecondary}>
            <span>Engineering Review Boundary Notice</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AccessibleFallback;
