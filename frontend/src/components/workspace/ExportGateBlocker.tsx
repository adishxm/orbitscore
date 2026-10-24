import React from 'react';
import { ShieldAlert, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { Finding, ReviewDecision } from '../../types/domain';
import styles from './ExportGateBlocker.module.css';

interface ExportGateBlockerProps {
  findings: Finding[];
  decisions: ReviewDecision[];
  onSelectFinding: (findingId: string) => void;
  onProceedToExport: () => void;
}

export const ExportGateBlocker: React.FC<ExportGateBlockerProps> = ({
  findings,
  decisions,
  onSelectFinding,
  onProceedToExport,
}) => {
  // Gating rule: All findings with severity 'action_required' must have a recorded review decision
  const actionRequiredFindings = findings.filter(
    (f) => f.severity === 'action_required'
  );

  const pendingFindings = actionRequiredFindings.filter((finding) => {
    const dec = decisions.find((d) => d.finding_id === finding.id);
    return !dec || dec.decision === 'action_pending';
  });

  const isGateBlocked = pendingFindings.length > 0;

  return (
    <section
      className={`${styles.card} ${isGateBlocked ? styles.cardBlocked : styles.cardReady}`}
      aria-labelledby="export-gate-title"
    >
      <div className={styles.headerRow}>
        {isGateBlocked ? (
          <ShieldAlert size={32} color="var(--os-color-accent-red)" aria-hidden="true" className={styles.iconShield} />
        ) : (
          <ShieldCheck size={32} color="var(--os-color-accent-green)" aria-hidden="true" className={styles.iconShield} />
        )}
        <div className={styles.headerInfo}>
          <div
            className={`${styles.kicker} ${isGateBlocked ? styles.kickerBlocked : styles.kickerReady}`}
          >
            Phase Gate Verification
          </div>
          <h2
            id="export-gate-title"
            className={`${styles.title} ${isGateBlocked ? styles.titleBlocked : styles.titleReady}`}
          >
            {isGateBlocked
              ? 'Export Dossier Gate: Sign-Off Pending'
              : 'Export Dossier Gate: Ready for Export Packet'}
          </h2>
          <p className={styles.desc}>
            {isGateBlocked
              ? `Formal cited evidence packet generation is gated. There are ${pendingFindings.length} finding(s) with required actions that need documented engineering decisions before generating the review export.`
              : 'All action-required findings have documented engineering review decisions. You may now generate and export the complete cited review packet.'}
          </p>
        </div>
      </div>

      {isGateBlocked ? (
        <div className={styles.pendingList}>
          <div className={styles.pendingTitle}>
            <AlertTriangle size={14} aria-hidden="true" />
            <span>Pending Findings Requiring Human Review Decision ({pendingFindings.length})</span>
          </div>

          {pendingFindings.map((finding) => (
            <div key={finding.id} className={styles.pendingItem}>
              <div>
                <strong>{finding.check_id}</strong>: {finding.check_title}
                <div className={styles.pendingSummary}>
                  {finding.summary}
                </div>
              </div>
              <button
                type="button"
                className={styles.jumpBtn}
                onClick={() => onSelectFinding(finding.id)}
              >
                Record Decision
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.readyBanner}>
          ✓ {actionRequiredFindings.length} of {actionRequiredFindings.length} action-required items evaluated and signed off by engineering authority.
        </div>
      )}

      <div className={styles.actionsRow}>
        <div className={styles.footerHint}>
          {isGateBlocked
            ? 'Complete all required sign-offs above to unlock export generation.'
            : 'Proceed to export generation to download JSON, Markdown, or print packet.'}
        </div>

        <button
          type="button"
          disabled={isGateBlocked}
          onClick={onProceedToExport}
          className={styles.proceedBtn}
        >
          <span>Proceed to Export Dossier</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};

export default ExportGateBlocker;
