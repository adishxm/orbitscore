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
  // Find all findings with severity 'action_required'
  const actionRequiredFindings = findings.filter(
    (f) => f.severity === 'action_required'
  );

  // Check which action-required findings lack a valid human decision
  const pendingFindings = actionRequiredFindings.filter((finding) => {
    const dec = decisions.find((d) => d.finding_id === finding.id);
    return !dec || dec.decision === 'action_pending';
  });

  const isGateBlocked = pendingFindings.length > 0;

  return (
    <section
      className={`${styles.card} ${
        isGateBlocked ? styles.cardBlocked : styles.cardReady
      }`}
      aria-labelledby="export-gate-title"
    >
      <div className={styles.headerRow}>
        {isGateBlocked ? (
          <ShieldAlert size={32} color="var(--color-state-conflicting)" aria-hidden="true" />
        ) : (
          <ShieldCheck size={32} color="var(--color-state-confirmed)" aria-hidden="true" />
        )}
        <div style={{ flex: 1 }}>
          <div
            className={styles.kicker}
            style={{
              color: isGateBlocked
                ? 'var(--color-state-conflicting)'
                : 'var(--color-state-confirmed)',
            }}
          >
            Phase Gate Verification
          </div>
          <h2
            id="export-gate-title"
            className={styles.title}
            style={{
              color: isGateBlocked
                ? 'var(--color-state-conflicting)'
                : 'var(--color-state-confirmed)',
            }}
          >
            {isGateBlocked
              ? 'Export Dossier Gate: Sign-Off Pending'
              : 'Export Dossier Gate: Ready for Export Packet'}
          </h2>
          <p className={styles.desc}>
            {isGateBlocked
              ? `Formal cited evidence packet generation is gated. There are ${pendingFindings.length} finding(s) with required actions that need documented engineering decisions by a qualified reviewer before generating the final export.`
              : 'All action-required findings have documented engineering sign-offs. You may now generate and export the complete cited review dossier.'}
          </p>
        </div>
      </div>

      {isGateBlocked ? (
        <div className={styles.pendingList}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-state-conflicting)',
              textTransform: 'uppercase',
              marginBottom: 'var(--space-2)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
            }}
          >
            <AlertTriangle size={14} aria-hidden="true" />
            <span>Pending Findings Requiring Human Review Decision ({pendingFindings.length})</span>
          </div>

          {pendingFindings.map((finding) => (
            <div key={finding.id} className={styles.pendingItem}>
              <div>
                <strong>{finding.check_id}</strong>: {finding.check_title}
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
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
        <div
          style={{
            background: 'var(--color-surface-sunken)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-3) var(--space-4)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-state-confirmed)',
          }}
        >
          ✓ {actionRequiredFindings.length} of {actionRequiredFindings.length} action-required items evaluated and signed off by engineering authority.
        </div>
      )}

      <div className={styles.actionsRow}>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
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
