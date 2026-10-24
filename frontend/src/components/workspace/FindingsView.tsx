import React, { useState, useMemo } from 'react';
import { ArrowRight, ArrowLeft, RefreshCw, Layers } from 'lucide-react';
import { CheckRun } from '../../types/domain';
import { FindingCard } from './FindingCard';
import styles from './FindingsView.module.css';

interface FindingsViewProps {
  checkRun: CheckRun | null;
  decisionsMap?: Record<string, boolean>;
  onNavigateToEvidence: (key: string) => void;
  onProceedToReview: () => void;
  onBackToGate: () => void;
  onReRunChecks?: () => void;
}

export const FindingsView: React.FC<FindingsViewProps> = ({
  checkRun,
  decisionsMap = {},
  onNavigateToEvidence,
  onProceedToReview,
  onBackToGate,
  onReRunChecks,
}) => {
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const findings = checkRun?.findings || [];

  const counts = useMemo(() => {
    return findings.reduce(
      (acc, f) => {
        if (f.outcome === 'documented') acc.documented++;
        else acc.needsAttention++;

        if (f.severity === 'action_required') acc.actionRequired++;
        else if (f.severity === 'advisory') acc.advisory++;
        else acc.info++;

        return acc;
      },
      {
        total: findings.length,
        documented: 0,
        needsAttention: 0,
        actionRequired: 0,
        advisory: 0,
        info: 0,
      }
    );
  }, [findings]);

  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      if (outcomeFilter === 'documented' && f.outcome !== 'documented') return false;
      if (outcomeFilter === 'needs_attention' && f.outcome === 'documented') return false;
      if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
      return true;
    });
  }, [findings, outcomeFilter, severityFilter]);

  if (!checkRun) {
    return (
      <div className={styles.emptyCard}>
        <Layers size={36} className={styles.emptyIcon} aria-hidden="true" />
        <h3>No Check Run Evaluated Yet</h3>
        <p className={styles.emptyLead}>
          Please execute the evaluation profile gate to inspect consistency rules across registered evidence items.
        </p>
        <button
          type="button"
          onClick={onBackToGate}
          className={styles.btnPrimary}
        >
          Return to Profile Gate
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Controls & Summary Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.summaryGroup}>
          <span className={styles.summaryBadge}>
            TOTAL: <strong>{counts.total}</strong>
          </span>
          <span className={`${styles.summaryBadge} ${styles.actionRequiredBadge}`}>
            ● {counts.actionRequired} Action Required
          </span>
          <span className={`${styles.summaryBadge} ${styles.advisoryBadge}`}>
            ● {counts.advisory} Advisory
          </span>
          <span className={`${styles.summaryBadge} ${styles.documentedBadge}`}>
            ● {counts.documented} Documented
          </span>
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.select}
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            aria-label="Filter findings by outcome"
          >
            <option value="all">All Outcomes</option>
            <option value="needs_attention">Needs Attention Only</option>
            <option value="documented">Documented Only</option>
          </select>

          <select
            className={styles.select}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            aria-label="Filter findings by severity"
          >
            <option value="all">All Severities</option>
            <option value="action_required">Action Required</option>
            <option value="advisory">Advisory</option>
            <option value="info">Info</option>
          </select>

          {onReRunChecks && (
            <button
              type="button"
              onClick={onReRunChecks}
              className={styles.btnSecondary}
              title="Re-run deterministic checks"
            >
              <RefreshCw size={12} aria-hidden="true" />
              <span>Re-Run</span>
            </button>
          )}
        </div>
      </div>

      {/* Findings Cards List */}
      <div>
        {filteredFindings.length > 0 ? (
          filteredFindings.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              onNavigateToEvidence={onNavigateToEvidence}
              decisionRecorded={Boolean(decisionsMap[finding.id])}
            />
          ))
        ) : (
          <div className={styles.emptyCard}>
            No findings match the selected outcome and severity filters.
          </div>
        )}
      </div>

      {/* Stage Navigation Actions */}
      <div className={styles.actionsRow}>
        <button
          type="button"
          onClick={onBackToGate}
          className={styles.btnSecondary}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Profile Gate</span>
        </button>

        <button
          type="button"
          onClick={onProceedToReview}
          className={styles.btnPrimary}
        >
          <span>Proceed to Human Review</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default FindingsView;
