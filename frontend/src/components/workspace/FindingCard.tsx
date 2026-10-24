import React from 'react';
import {
  LucideIcon,
  CheckCircle2,
  AlertTriangle,
  CircleDashed,
  HelpCircle,
  Compass,
  ExternalLink,
} from 'lucide-react';
import { Finding, FindingOutcome, FindingSeverity } from '../../types/domain';
import styles from './FindingCard.module.css';

interface FindingCardProps {
  finding: Finding;
  onNavigateToEvidence?: (key: string) => void;
  decisionRecorded?: boolean;
}

const OUTCOME_CONFIG: Record<
  FindingOutcome,
  { label: string; className?: string; icon: LucideIcon }
> = {
  documented: {
    label: 'Documented',
    className: styles.outcomeDocumented,
    icon: CheckCircle2,
  },
  needs_attention_missing: {
    label: 'Needs Attention: Missing',
    className: styles.outcomeMissing,
    icon: CircleDashed,
  },
  needs_attention_conflicting: {
    label: 'Needs Attention: Conflicting',
    className: styles.outcomeConflicting,
    icon: AlertTriangle,
  },
  needs_attention_unconfirmed: {
    label: 'Needs Attention: Unconfirmed',
    className: styles.outcomeUnconfirmed,
    icon: HelpCircle,
  },
  out_of_profile_scope: {
    label: 'Out of Profile Scope',
    className: styles.outcomeOutOfScope,
    icon: Compass,
  },
};

const SEVERITY_CONFIG: Record<
  FindingSeverity,
  { label: string; className?: string; cardClass?: string }
> = {
  action_required: {
    label: 'Action Required',
    className: styles.badgeActionRequired,
    cardClass: styles.severityActionRequired,
  },
  advisory: {
    label: 'Advisory',
    className: styles.badgeAdvisory,
    cardClass: styles.severityAdvisory,
  },
  info: {
    label: 'Info',
    className: styles.badgeInfo,
    cardClass: styles.severityInfo,
  },
};

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  onNavigateToEvidence,
  decisionRecorded,
}) => {
  const outcomeInfo = OUTCOME_CONFIG[finding.outcome] || OUTCOME_CONFIG.documented;
  const severityInfo = SEVERITY_CONFIG[finding.severity] || SEVERITY_CONFIG.info;
  const OutcomeIcon = outcomeInfo.icon;

  return (
    <article
      className={`${styles.card} ${severityInfo.cardClass}`}
      aria-labelledby={`finding-title-${finding.id}`}
    >
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <span className={styles.checkId}>{finding.check_id}</span>
          <h3 id={`finding-title-${finding.id}`} className={styles.checkTitle}>
            {finding.check_title}
          </h3>
        </div>

        <div className={styles.badgeGroup}>
          <span className={`${styles.severityBadge} ${severityInfo.className}`}>
            {severityInfo.label}
          </span>
          <span className={`${styles.outcomeBadge} ${outcomeInfo.className}`}>
            <OutcomeIcon size={12} />
            <span>{outcomeInfo.label}</span>
          </span>
          {decisionRecorded && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--color-state-confirmed)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              Sign-Off Recorded
            </span>
          )}
        </div>
      </div>

      <div className={styles.summary}>{finding.summary}</div>
      <p className={styles.details}>{finding.details}</p>

      {finding.recommendation && (
        <div className={styles.recommendationBox}>
          <div className={styles.recommendationLabel}>Actionable Recommendation</div>
          <p className={styles.recommendationText}>{finding.recommendation}</p>
        </div>
      )}

      {/* Bidirectional Traceability Links */}
      {(finding.affected_evidence_keys || []).length > 0 && (
        <div className={styles.traceabilitySection}>
          <span className={styles.traceabilityLabel}>Affected Parameters:</span>
          {(finding.affected_evidence_keys || []).map((key) => (
            <button
              key={key}
              type="button"
              className={styles.traceLink}
              onClick={() => onNavigateToEvidence && onNavigateToEvidence(key)}
              title={`Jump to evidence register for ${key}`}
            >
              <span>{key}</span>
              <ExternalLink size={10} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </article>
  );
};

export default FindingCard;
