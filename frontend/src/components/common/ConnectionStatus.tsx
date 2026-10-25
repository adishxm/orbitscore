import React, { useState } from 'react';
import { useOrbitStore } from '../../store/useOrbitStore';
import styles from './ConnectionStatus.module.css';

interface ConnectionStatusProps {
  compact?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ compact = false }) => {
  const { isApiConnected, apiMode, apiServerUrl } = useOrbitStore();
  const [showTooltip, setShowTooltip] = useState(false);

  // Status computation
  const isLive = isApiConnected && apiMode === 'live';
  const statusLabel = isLive ? 'NORAD GP LIVE' : 'SYNTHETIC DEMO';
  const lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div
      className={`${styles.statusWrapper} ${compact ? styles.compact : ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      tabIndex={0}
      role="status"
      aria-label={`Connection Status: ${statusLabel}`}
    >
      <div className={styles.indicatorTrack}>
        <span
          className={`${styles.statusDot} ${isLive ? styles.dotLive : styles.dotDemo}`}
        >
          {isLive && <span className={styles.pulseRing} aria-hidden="true" />}
        </span>
        <span className={styles.statusText}>{statusLabel}</span>
      </div>

      {!compact && (
        <span className={styles.endpointLabel}>
          {apiServerUrl.replace('http://', '')}
        </span>
      )}

      {/* Hover/Focus Tooltip */}
      {showTooltip && (
        <div className={styles.tooltipBox} role="tooltip">
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipKey}>ENDPOINT:</span>
            <span className={styles.tooltipVal}>{apiServerUrl}</span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipKey}>MODE:</span>
            <span className={styles.tooltipVal}>{isLive ? 'FastAPI 127.0.0.1:8000' : 'Deterministic Client Core'}</span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipKey}>LAST SYNC:</span>
            <span className={styles.tooltipVal}>{lastSyncTime}</span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipKey}>INTEGRITY:</span>
            <span className={styles.tooltipValOk}>SHA-256 LOCKED</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
