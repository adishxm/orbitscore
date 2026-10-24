import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, CheckCircle2, Clock } from 'lucide-react';
import { Finding, ReviewDecision, ReviewDecisionType } from '../../types/domain';
import styles from './ReviewDecisionForm.module.css';

interface ReviewDecisionFormProps {
  findings: Finding[];
  decisions: ReviewDecision[];
  onRecordDecision: (decision: Omit<ReviewDecision, 'id' | 'recorded_at'>) => void;
  selectedFindingId?: string;
}

export const ReviewDecisionForm: React.FC<ReviewDecisionFormProps> = ({
  findings,
  decisions,
  onRecordDecision,
  selectedFindingId,
}) => {
  // Filter for findings that require human review or display all
  const actionableFindings = findings.filter(
    (f) => f.severity === 'action_required' || f.severity === 'advisory'
  );

  const [activeFindingId, setActiveFindingId] = useState<string>(
    selectedFindingId || actionableFindings[0]?.id || findings[0]?.id || ''
  );

  useEffect(() => {
    if (selectedFindingId) {
      setActiveFindingId(selectedFindingId);
    }
  }, [selectedFindingId]);

  const activeFinding = findings.find((f) => f.id === activeFindingId);
  const existingDecision = decisions.find((d) => d.finding_id === activeFindingId);

  // Form states
  const [decisionType, setDecisionType] = useState<ReviewDecisionType>(
    existingDecision?.decision || 'accepted_for_packet'
  );
  const [rationale, setRationale] = useState<string>(
    existingDecision?.rationale || ''
  );
  const [reviewerName, setReviewerName] = useState<string>(
    existingDecision?.reviewer_name || ''
  );
  const [reviewerRole, setReviewerRole] = useState<string>(
    existingDecision?.reviewer_role || ''
  );

  // Sync form inputs when active finding or existing decision changes
  useEffect(() => {
    if (existingDecision) {
      setDecisionType(existingDecision.decision);
      setRationale(existingDecision.rationale);
      setReviewerName(existingDecision.reviewer_name);
      setReviewerRole(existingDecision.reviewer_role);
    } else {
      setDecisionType('accepted_for_packet');
      setRationale('');
      setReviewerName('');
      setReviewerRole('');
    }
  }, [activeFindingId, existingDecision]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFindingId || !rationale.trim() || !reviewerName.trim() || !reviewerRole.trim()) {
      return;
    }

    onRecordDecision({
      finding_id: activeFindingId,
      decision: decisionType,
      rationale: rationale.trim(),
      reviewer_name: reviewerName.trim(),
      reviewer_role: reviewerRole.trim(),
    });
  };

  const isFormValid =
    Boolean(activeFindingId) &&
    rationale.trim().length > 0 &&
    reviewerName.trim().length > 0 &&
    reviewerRole.trim().length > 0;

  return (
    <section className={styles.card} aria-labelledby="review-decision-heading">
      <div className={styles.kicker}>Human Engineering Review</div>
      <h2 id="review-decision-heading" className={styles.title}>
        Human Review Decisions & Sign-Off
      </h2>

      {/* Authority Callout */}
      <div className={styles.authorityCallout} role="note">
        <ShieldCheck size={20} color="var(--color-brand-cyan)" aria-hidden="true" />
        <div>
          <div className={styles.authorityTitle}>Engineering Authority Boundary</div>
          <p className={styles.authorityText}>
            Automated software flags discrepancies deterministically; only qualified human
            engineers make review decisions. Despite the name, OrbitScore does not score or certify missions; it organizes evidence for human review.
          </p>
        </div>
      </div>

      {/* Finding Selector Tabs */}
      <div className={styles.selectorSection}>
        <span className={styles.selectorLabel}>Select Finding to Evaluate</span>
        <div className={styles.findingTabs} role="tablist" aria-label="Findings requiring review">
          {findings.map((f) => {
            const hasSigned = decisions.some(
              (d) => d.finding_id === f.id && d.decision !== 'action_pending'
            );
            const isSelected = f.id === activeFindingId;

            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={`panel-${f.id}`}
                id={`tab-${f.id}`}
                className={`${styles.findingTab} ${
                  isSelected ? styles.findingTabActive : ''
                } ${hasSigned ? styles.findingTabSigned : ''}`}
                onClick={() => setActiveFindingId(f.id)}
              >
                <span
                  className={hasSigned ? styles.signIndicator : styles.signIndicatorPending}
                  aria-hidden="true"
                />
                <span>
                  {f.check_id}: {f.check_title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeFinding ? (
        <div id={`panel-${activeFinding.id}`} role="tabpanel" aria-labelledby={`tab-${activeFinding.id}`}>
          {/* Active Finding Context */}
          <div className={styles.findingContextBox}>
            <div className={styles.contextHeader}>
              <h3 className={styles.contextTitle}>
                {activeFinding.check_id} — {activeFinding.check_title}
              </h3>
              <span className={styles.severityBadge}>
                Severity: {activeFinding.severity.toUpperCase()}
              </span>
            </div>
            <div className={styles.contextSummary}>{activeFinding.summary}</div>
            <p className={styles.contextDetails}>{activeFinding.details}</p>
          </div>

          {/* Existing Decision Alert if present */}
          {existingDecision && (
            <div className={styles.recordedSignoffBox} role="status">
              <div className={styles.recordedStatusGroup}>
                <CheckCircle2 size={16} color="var(--os-color-accent-green)" aria-hidden="true" />
                <span className={styles.recordedText}>
                  Decision Recorded: <strong>{existingDecision.decision.replace(/_/g, ' ').toUpperCase()}</strong> by {existingDecision.reviewer_name} ({existingDecision.reviewer_role})
                </span>
              </div>
              <span className={styles.timestampBadge}>
                <Clock size={12} aria-hidden="true" />
                {new Date(existingDecision.recorded_at).toLocaleString()}
              </span>
            </div>
          )}

          {/* Sign-off Form */}
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="decision-type-select" className={styles.label}>
                  Review Decision Type *
                </label>
                <select
                  id="decision-type-select"
                  className={styles.select}
                  value={decisionType}
                  onChange={(e) => setDecisionType(e.target.value as ReviewDecisionType)}
                  required
                >
                  <option value="accepted_for_packet">
                    Accepted for packet
                  </option>
                  <option value="accepted_as_is">
                    Accepted as-is
                  </option>
                  <option value="waiver_granted">
                    Waiver granted / Authorized deviation
                  </option>
                  <option value="mitigation_filed">
                    Mitigation filed
                  </option>
                  <option value="needs_more_evidence">
                    Needs more evidence
                  </option>
                  <option value="disputed">
                    Disputed
                  </option>
                  <option value="deferred_to_specialist">
                    Deferred to specialist
                  </option>
                  <option value="noted_no_action">
                    Noted – no action
                  </option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="reviewer-name-input" className={styles.label}>
                  Reviewer Name *
                </label>
                <input
                  id="reviewer-name-input"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. S. Thorne"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="reviewer-role-input" className={styles.label}>
                  Reviewer Engineering Role *
                </label>
                <input
                  id="reviewer-role-input"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Lead Systems Engineer"
                  value={reviewerRole}
                  onChange={(e) => setReviewerRole(e.target.value)}
                  required
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label htmlFor="rationale-input" className={styles.label}>
                  Engineering Technical Rationale *
                </label>
                <textarea
                  id="rationale-input"
                  className={styles.textarea}
                  placeholder="Document specific engineering justification, compensating controls, or reference to signed program deviation documentation..."
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className={styles.saveButton}
            >
              <UserCheck size={16} aria-hidden="true" />
              <span>{existingDecision ? 'Update Review Decision' : 'Record Review Decision'}</span>
            </button>
          </form>
        </div>
      ) : (
        <div className={styles.emptyFindingsText}>
          No findings available to review. Run automated checks first.
        </div>
      )}
    </section>
  );
};

export default ReviewDecisionForm;
