import React, { useState } from 'react';
import { AlertTriangle, Database, Info, Trash2, X, Radio } from 'lucide-react';
import styles from './StatusBanner.module.css';

interface StatusBannerProps {
  onClearData?: () => void;
  syntheticMissionName?: string;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  onClearData,
  syntheticMissionName = 'Asteria-3',
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showNotImplemented, setShowNotImplemented] = useState(false);

  return (
    <>
      <aside
        className={`${styles.banner} ${collapsed ? styles.collapsed : ''}`}
        role="region"
        aria-label="Application Environment Status"
      >
        <div className={styles.inner}>
          <div className={styles.badgeGroup}>
            <span className={`${styles.badge} ${styles.badgeMock}`}>
              <AlertTriangle className={styles.badgeIcon} size={13} aria-hidden="true" />
              DEMO / MOCK
            </span>
            <span className={`${styles.badge} ${styles.badgeSynthetic}`}>
              <Database className={styles.badgeIcon} size={13} aria-hidden="true" />
              SYNTHETIC DATA: {syntheticMissionName}
            </span>
            <span className={`${styles.badge} ${styles.badgeLocal}`}>
              <Info className={styles.badgeIcon} size={13} aria-hidden="true" />
              LOCAL ONLY (not saved)
            </span>
          </div>

          <div className={styles.noticeText}>
            Stored only in this browser; not durable or private from other users of this device.
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => setShowNotImplemented(true)}
              className={styles.modeToggleBtn}
              title="Connect to Live Server"
              aria-label="Connect Live API"
            >
              <Radio size={12} aria-hidden="true" />
              <span>Connect Live API</span>
            </button>

            {onClearData && (
              <button
                type="button"
                onClick={onClearData}
                className={styles.clearBtn}
                title="Clear all stored evidence and reset to clean demo"
                aria-label="Clear all local data"
              >
                <Trash2 size={13} aria-hidden="true" />
                <span>Clear local data</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className={styles.toggleBtn}
              title={collapsed ? 'Expand status banner' : 'Minimize status banner'}
              aria-label={collapsed ? 'Expand status banner' : 'Minimize status banner'}
            >
              {collapsed ? <Info size={14} /> : <X size={14} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Not Implemented Modal Panel */}
      {showNotImplemented && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="not-implemented-title"
          onClick={() => setShowNotImplemented(false)}
        >
          <div
            className={styles.modalDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 id="not-implemented-title" className={styles.modalTitle}>
                Not Implemented in This Build
              </h2>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setShowNotImplemented(false)}
                aria-label="Close notification"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>
                Live remote API synchronization and external server connectivity are <strong>not implemented in this build</strong>.
              </p>
              <p>
                OrbitScore currently operates entirely in client-side demonstration mode using local browser storage and synthetic test fixtures. All parameter checks execute deterministically inside your browser without outbound network requests.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalPrimaryBtn}
                onClick={() => setShowNotImplemented(false)}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StatusBanner;
