import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, FileText, Trash2, UserCheck } from 'lucide-react';
import { EvidenceItem } from '../../types/domain';
import { StateChip } from '../common/StateChip';
import styles from './SidePanel.module.css';

interface SidePanelProps {
  item: EvidenceItem | null;
  onClose: () => void;
  onConfirm: (id: string, reviewerName: string) => void;
  onDelete?: (id: string) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  item,
  onClose,
  onConfirm,
  onDelete,
}) => {
  const [reviewerName, setReviewerName] = useState('');
  const [confirmError, setConfirmError] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim()) {
      setConfirmError('Please enter your name and engineering role for accountability.');
      return;
    }
    setConfirmError('');
    onConfirm(item.id, reviewerName.trim());
    setReviewerName('');
  };

  return (
    <div
      className={styles.drawerOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleArea}>
            <span className={styles.itemKey}>{item.parameter_key}</span>
            <h2 id="drawer-title" className={styles.itemLabel}>
              {item.label}
            </h2>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <StateChip state={item.state} />
            </div>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close inspector drawer"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Value & Unit */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Recorded Parameter Value</div>
            <div className={styles.valueBox}>
              {item.value !== null ? String(item.value) : 'No value recorded'}
              {item.unit ? ` ${item.unit}` : ''}
            </div>
          </div>

          {/* Primary Source Citation */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Primary Source Document Citation</div>
            <div className={styles.citationCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <FileText size={16} color="var(--color-brand-cyan)" aria-hidden="true" />
                <span className={styles.citationTitle}>
                  {item.source_doc_title || 'Unspecified Document Title'}
                </span>
              </div>
              <div className={styles.citationMeta}>
                <span>Ref: <strong>{item.source_doc_ref || 'None'}</strong></span>
                <span>•</span>
                <span>Date: <strong>{item.source_doc_date || 'Undated'}</strong></span>
                {item.page_number && (
                  <>
                    <span>•</span>
                    <span>Page: <strong>{item.page_number}</strong></span>
                  </>
                )}
                {item.paragraph && (
                  <>
                    <span>•</span>
                    <span>Locator: <strong>{item.paragraph}</strong></span>
                  </>
                )}
              </div>
              {item.locator && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--color-brand-cyan)', marginTop: '4px' }}>
                  Full Locator: {item.locator}
                </div>
              )}
            </div>
          </div>

          {/* Conflicting Values (if any) */}
          {item.conflicting_values && item.conflicting_values.length > 0 && (
            <div className={styles.conflictAlert} role="alert">
              <div className={styles.conflictTitle}>
                <AlertTriangle size={15} style={{ display: 'inline', marginRight: '6px' }} />
                Discrepancy: Diverging Values Detected Across Records
              </div>
              <p style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                The parameter recorded here diverges from other engineering documentation:
              </p>
              {item.conflicting_values.map((conf, idx) => (
                <div
                  key={idx}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--font-size-xs)',
                    background: 'var(--color-surface-sunken)',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: 'var(--space-2)',
                    color: 'var(--color-state-conflicting)',
                  }}
                >
                  <strong>{String(conf.value)}</strong> from <em>{conf.source}</em> ({conf.ref})
                </div>
              ))}
            </div>
          )}

          {/* Engineering Notes */}
          {item.notes && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Engineering Context & Notes</div>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                {item.notes}
              </p>
            </div>
          )}

          {/* Human Review Confirmation Box */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Human Verification Status</div>
            {item.state === 'confirmed' && item.human_confirmed_by ? (
              <div
                style={{
                  background: 'var(--color-state-confirmed-bg)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-state-confirmed)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                  <CheckCircle2 size={16} />
                  <span>Verified by Designated Human Reviewer</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                  Reviewer: <strong>{item.human_confirmed_by}</strong>
                  <br />
                  Timestamp: {item.human_confirmed_at ? new Date(item.human_confirmed_at).toLocaleString() : 'Recorded'}
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmSubmit} className={styles.confirmBox}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  This parameter is currently <strong>{item.state}</strong>. Human verification is required
                  to advance this entry to confirmed status for the review dossier.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <label htmlFor="reviewer-name-input" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    Your Name & Technical Role:
                  </label>
                  <input
                    id="reviewer-name-input"
                    type="text"
                    className={styles.confirmInput}
                    placeholder="e.g. Dr. Alex Vance (Lead Systems Engineer)"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                  />
                  {confirmError && (
                    <span style={{ color: 'var(--color-state-conflicting)', fontSize: 'var(--font-size-xs)' }}>
                      {confirmError}
                    </span>
                  )}
                </div>

                <button type="submit" className={styles.confirmButton}>
                  <UserCheck size={14} aria-hidden="true" />
                  <span>Record Human Confirmation</span>
                </button>
              </form>
            )}
          </div>

          {/* Delete Action */}
          {onDelete && (
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => {
                if (window.confirm(`Delete evidence entry "${item.label}"?`)) {
                  onDelete(item.id);
                  onClose();
                }
              }}
            >
              <Trash2 size={13} aria-hidden="true" />
              <span>Delete Evidence Record</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
