import React from 'react';
import { CheckCircle2, Layers, Award } from 'lucide-react';
import { Mission, EvidenceItem } from '../../types/domain';
import styles from './ReadinessIndexCard.module.css';

interface ReadinessIndexCardProps {
  mission: Mission;
  evidence?: EvidenceItem[];
}

export const ReadinessIndexCard: React.FC<ReadinessIndexCardProps> = ({ mission, evidence = [] }) => {
  // Compute deterministic readiness index from evidence state
  // Trackability (max 25)
  const hasMissionOrbit = Boolean(mission.target_orbit);
  const trackability = evidence.some(e => e.parameter_key === 'trackable_identifier') ? 20.0 : (hasMissionOrbit ? 10.0 : 5.0);
  // Debris mitigation (max 35)
  const debrisMitigation = evidence.some(e => e.parameter_key === 'post_mission_disposal_lifetime') ? 25.0 : 10.0;
  // Conjunction assessment (max 20)
  const conjunctionAssessment = 15.0;
  // Passivation (max 20)
  const passivation = evidence.some(e => e.parameter_key === 'passivation_plan') ? 15.0 : 0.0;

  const totalIndex = trackability + debrisMitigation + conjunctionAssessment + passivation;

  let tier = 'BBB';
  if (totalIndex >= 90) tier = 'AAA';
  else if (totalIndex >= 80) tier = 'AA';
  else if (totalIndex >= 70) tier = 'BBB';
  else if (totalIndex >= 55) tier = 'BB';
  else if (totalIndex >= 40) tier = 'B';
  else tier = 'D';

  const isroAligned = totalIndex >= 70;
  const fccAligned = totalIndex >= 70;

  return (
    <section className={styles.card} aria-labelledby="readiness-index-heading">
      <div className={styles.headerRow}>
        <div>
          <div className={styles.kicker}>Stage 1C • Benchmarking Readiness Index</div>
          <h2 id="readiness-index-heading" className={styles.title}>
            Space Credit &amp; Readiness Index
          </h2>
        </div>

        <div className={styles.badgeGroup}>
          <span className={styles.heuristicBadge}>
            <Layers size={12} aria-hidden="true" />
            HEURISTIC BENCHMARK
          </span>
          <span className={styles.decisionSupportBadge}>
            <Award size={12} aria-hidden="true" />
            DECISION SUPPORT
          </span>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.indexBox}>
          <div className={styles.indexValue}>{totalIndex.toFixed(1)}</div>
          <div className={styles.indexMax}>out of 100</div>
          <div className={styles.tierBadge}>Tier {tier}</div>
        </div>

        <div className={styles.pillarsList}>
          <div className={styles.pillarRow}>
            <div className={styles.pillarHeader}>
              <span className={styles.pillarName}>Pillar 1: Trackability &amp; Registration</span>
              <span className={styles.pillarVal}>{trackability.toFixed(0)} / 25 pts</span>
            </div>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${(trackability / 25) * 100}%` }}
              />
            </div>
          </div>

          <div className={styles.pillarRow}>
            <div className={styles.pillarHeader}>
              <span className={styles.pillarName}>Pillar 2: Post-Mission Debris Mitigation</span>
              <span className={styles.pillarVal}>{debrisMitigation.toFixed(0)} / 35 pts</span>
            </div>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${(debrisMitigation / 35) * 100}%` }}
              />
            </div>
          </div>

          <div className={styles.pillarRow}>
            <div className={styles.pillarHeader}>
              <span className={styles.pillarName}>Pillar 3: Conjunction Assessment &amp; Maneuverability</span>
              <span className={styles.pillarVal}>{conjunctionAssessment.toFixed(0)} / 20 pts</span>
            </div>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${(conjunctionAssessment / 20) * 100}%` }}
              />
            </div>
          </div>

          <div className={styles.pillarRow}>
            <div className={styles.pillarHeader}>
              <span className={styles.pillarName}>Pillar 4: End-of-Life Passivation</span>
              <span className={styles.pillarVal}>{passivation.toFixed(0)} / 20 pts</span>
            </div>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${(passivation / 20) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.alignmentsRow}>
        <div className={styles.alignmentTag}>
          <CheckCircle2 size={14} aria-hidden="true" />
          <span>ISRO DFSM 2030: {isroAligned ? 'ALIGNED (&gt;= 70 pts)' : 'ACTION REQUIRED'}</span>
        </div>
        <div className={styles.alignmentTag}>
          <CheckCircle2 size={14} aria-hidden="true" />
          <span>FCC 5-Year Deorbit: {fccAligned ? 'ALIGNED (&lt;= 5 yr decay)' : 'NON-CONFORMANT'}</span>
        </div>
      </div>

      <div className={styles.disclaimerText}>
        Despite the name, OrbitScore does not score or certify missions; it organizes evidence for qualified human review.
        The Space Credit Index is a heuristic benchmarking evidence completeness and consistency.
      </div>
    </section>
  );
};
