import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Database, Info, Trash2, X, Radio, CheckCircle2, RefreshCw } from 'lucide-react';
import { useOrbitStore } from '../../store/useOrbitStore';
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
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionFeedback, setConnectionFeedback] = useState<string | null>(null);
  const bannerRef = useRef<HTMLElement>(null);

  const { apiMode, isApiConnected, apiServerUrl, toggleApiMode } = useOrbitStore();

  // Dynamically synchronize the CSS variable `--os-banner-height` so the sticky Header never collides
  useEffect(() => {
    const updateBannerHeight = () => {
      if (collapsed || !bannerRef.current) {
        document.documentElement.style.setProperty('--os-banner-height', '0px');
      } else {
        const height = bannerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--os-banner-height', `${height}px`);
      }
    };

    updateBannerHeight();

    let resizeObserver: ResizeObserver | null = null;
    if (bannerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateBannerHeight();
      });
      resizeObserver.observe(bannerRef.current);
    }

    window.addEventListener('resize', updateBannerHeight);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateBannerHeight);
      document.documentElement.style.setProperty('--os-banner-height', '0px');
    };
  }, [collapsed]);

  const handleToggleApi = async () => {
    setIsConnecting(true);
    setConnectionFeedback(null);
    try {
      await toggleApiMode();
      // Re-read store state
      const state = useOrbitStore.getState();
      if (state.apiMode === 'live' && state.isApiConnected) {
        setConnectionFeedback(`Connected to live FastAPI backend at ${state.apiServerUrl}`);
      } else if (state.apiMode === 'live' && !state.isApiConnected) {
        setConnectionFeedback(`FastAPI backend at ${state.apiServerUrl} is unreachable. Operating in local engine mode.`);
      } else {
        setConnectionFeedback('Operating in client-side demonstration mode with LocalStorage persistence.');
      }
    } catch {
      setConnectionFeedback(`Could not connect to ${apiServerUrl}. Defaulted to local browser mode.`);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <>
      <aside
        ref={bannerRef}
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
            <span
              className={`${styles.badge} ${
                apiMode === 'live' && isApiConnected ? styles.badgeLive : styles.badgeLocal
              }`}
            >
              <Info className={styles.badgeIcon} size={13} aria-hidden="true" />
              {apiMode === 'live' && isApiConnected
                ? 'LIVE API CONNECTED (127.0.0.1:8000)'
                : 'LOCAL ONLY (Saved in LocalStorage)'}
            </span>
          </div>

          <div className={styles.noticeText}>
            Stored only in this browser; not durable or private from other users of this device. Workspace state persists locally in browser storage.
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleToggleApi}
              disabled={isConnecting}
              className={`${styles.modeToggleBtn} ${
                apiMode === 'live' && isApiConnected ? styles.modeToggleActive : ''
              }`}
              title={
                apiMode === 'live' && isApiConnected
                  ? 'Switch back to local client engine'
                  : 'Connect to live FastAPI backend on 127.0.0.1:8000'
              }
              aria-label="Toggle Live API Connection"
            >
              {isConnecting ? (
                <RefreshCw size={12} className={styles.spin} aria-hidden="true" />
              ) : apiMode === 'live' && isApiConnected ? (
                <CheckCircle2 size={12} aria-hidden="true" />
              ) : (
                <Radio size={12} aria-hidden="true" />
              )}
              <span>
                {isConnecting
                  ? 'Connecting...'
                  : apiMode === 'live' && isApiConnected
                  ? 'Live API Active'
                  : 'Connect Live API'}
              </span>
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

        {/* Transient connection feedback notification */}
        {connectionFeedback && (
          <div className={styles.feedbackBar} role="status">
            <span>{connectionFeedback}</span>
            <button
              type="button"
              className={styles.feedbackDismiss}
              onClick={() => setConnectionFeedback(null)}
              aria-label="Dismiss message"
            >
              &times;
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default StatusBanner;
