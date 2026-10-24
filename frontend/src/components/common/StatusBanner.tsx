import React, { useState } from 'react';
import { AlertTriangle, Database, Info, Trash2, X } from 'lucide-react';
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

  return (
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
  );
};

export default StatusBanner;
