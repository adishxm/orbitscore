import React from 'react';
import { Compass, Globe, Info, Clock, Layers } from 'lucide-react';
import { Mission } from '../../types/domain';
import styles from './OrbitalContextCard.module.css';

interface OrbitalContextCardProps {
  mission: Mission;
}

export const OrbitalContextCard: React.FC<OrbitalContextCardProps> = ({ mission }) => {
  return (
    <section className={styles.card} aria-labelledby="orbital-context-heading">
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <div className={styles.kicker}>STAGE 1B • SYNTHETIC ORBITAL CONTEXT</div>
          <h2 id="orbital-context-heading" className={styles.title}>
            <span>Orbital Trajectory & Mission Envelope</span>
          </h2>
        </div>

        <div className={styles.badgeGroup}>
          <span className={styles.syntheticBadge}>
            <Info size={12} aria-hidden="true" />
            SYNTHETIC DEMO DATA
          </span>
          <span className={styles.demoOnlyBadge}>
            <Globe size={12} aria-hidden="true" />
            DEMO ONLY — NOT LIVE TRACKING
          </span>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Visual Schematic */}
        <div className={styles.schematicWrap} aria-hidden="true">
          <svg
            className={styles.orbitalSvg}
            viewBox="0 0 440 280"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Earth horizon arc */}
            <circle
              cx="220"
              cy="480"
              r="340"
              stroke="var(--color-border-subtle)"
              strokeWidth="1.5"
              fill="rgba(10, 18, 30, 0.4)"
            />
            <path
              d="M-20 230 C 120 210, 320 210, 460 230"
              stroke="var(--color-border-subtle)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Orbit path */}
            <ellipse
              cx="220"
              cy="145"
              rx="175"
              ry="80"
              transform="rotate(-14 220 145)"
              stroke="var(--color-brand-cyan)"
              strokeWidth="1.8"
            />

            {/* Reference grid line */}
            <line
              x1="45"
              y1="165"
              x2="395"
              y2="125"
              stroke="var(--color-border-subtle)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />

            {/* Satellite glyph */}
            <g transform="translate(290, 95)">
              <rect
                x="-12"
                y="-12"
                width="24"
                height="24"
                fill="var(--color-surface-card)"
                stroke="var(--color-brand-cyan)"
                strokeWidth="2"
                rx="2"
              />
              <line x1="-28" y1="0" x2="-12" y2="0" stroke="var(--color-brand-cyan)" strokeWidth="2.5" />
              <line x1="12" y1="0" x2="28" y2="0" stroke="var(--color-brand-cyan)" strokeWidth="2.5" />
              <line x1="0" y1="-12" x2="-6" y2="-24" stroke="var(--color-brand-cyan)" strokeWidth="1" />
              <circle cx="0" cy="0" r="3" fill="var(--color-brand-cyan)" />
            </g>

            {/* Annotations */}
            <text
              x="20"
              y="35"
              fill="var(--color-brand-cyan)"
              fontFamily="var(--font-mono)"
              fontSize="11"
              letterSpacing="1"
            >
              500 KM SSO • INCLINATION: 97.4° • PERIOD: 94.6 MIN
            </text>
            <text
              x="20"
              y="54"
              fill="var(--color-text-muted)"
              fontFamily="var(--font-mono)"
              fontSize="10"
            >
              SPACECRAFT: {mission.name.toUpperCase()} ({mission.form_factor})
            </text>
            <text
              x="20"
              y="260"
              fill="var(--color-text-dim)"
              fontFamily="var(--font-mono)"
              fontSize="9"
            >
              GROUND NODES: IN-ISTRAC (BANGALORE) • KSAT (SVALBARD)
            </text>
          </svg>
        </div>

        {/* Telemetry and Scalability Column */}
        <div className={styles.detailsCol}>
          <div className={styles.paramsGrid}>
            <div className={styles.paramCard}>
              <div className={styles.paramLabel}>Target Orbit</div>
              <div className={styles.paramValue}>{mission.target_orbit}</div>
            </div>
            <div className={styles.paramCard}>
              <div className={styles.paramLabel}>Form Factor</div>
              <div className={styles.paramValue}>{mission.form_factor}</div>
            </div>
            <div className={styles.paramCard}>
              <div className={styles.paramLabel}>Mass Budget</div>
              <div className={styles.paramValue}>{mission.mass_budget_kg} kg</div>
            </div>
            <div className={styles.paramCard}>
              <div className={styles.paramLabel}>Synthetic Lifetime</div>
              <div className={styles.paramValue}>~3.8 yrs (Drag)</div>
            </div>
          </div>

          {/* National & Global Scalability Matrix */}
          <div className={styles.scalabilityBox}>
            <div className={styles.scalabilityTitle}>
              <Layers size={13} aria-hidden="true" />
              <span>Scalability Framework: National to Global</span>
            </div>
            <ul className={styles.scalabilityList}>
              <li className={styles.scalabilityItem}>
                <Compass size={14} style={{ color: 'var(--color-brand-cyan)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                <span>
                  <strong>Tier 1 — India ISRO DFSM 2030:</strong> Evaluates orbital lifetime parameters against the Debris-Free Space Missions milestone (deorbit horizon &lt; 5 years post-mission).
                </span>
              </li>
              <li className={styles.scalabilityItem}>
                <Globe size={14} style={{ color: 'var(--color-brand-cyan)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                <span>
                  <strong>Tier 2 — Global Guidelines:</strong> Cross-checks evidence with FCC 5-year post-mission disposal rule (FCC-22-74) and NASA STD 8719.14 disposal requirements.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mandatory Persistent Caption required by brief */}
      <p className={styles.persistentCaption} role="note">
        <Clock size={14} aria-hidden="true" style={{ flexShrink: 0 }} />
        <span>Illustrative synthetic data — not live tracking, collision prediction, or operational guidance.</span>
      </p>
    </section>
  );
};
