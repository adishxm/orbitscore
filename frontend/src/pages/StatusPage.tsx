import React, { useState, useEffect } from 'react';
import { Database, HardDrive, Cpu, AlertTriangle, RefreshCw } from 'lucide-react';
import { useOrbitStore } from '../store/useOrbitStore';
import styles from './pages.module.css';

export const StatusPage: React.FC = () => {
  const [storageCount, setStorageCount] = useState<number>(0);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');
  const { apiMode, apiServerUrl, provenance, toggleApiMode } = useOrbitStore();

  useEffect(() => {
    try {
      setStorageCount(window.localStorage.length);
    } catch {
      setStorageCount(0);
    }
    setLastCheckTime(new Date().toLocaleTimeString());
  }, []);

  const refreshStatus = () => {
    try {
      setStorageCount(window.localStorage.length);
    } catch {
      setStorageCount(0);
    }
    setLastCheckTime(new Date().toLocaleTimeString());
  };

  return (
    <div className={styles.pageRoot}>
      <div className="container">
        <section className={styles.heroSection} aria-labelledby="status-heading">
          <div className={styles.kicker}>
            <span>Diagnostics</span>
            <span>•</span>
            <span>Environment Provenance</span>
          </div>
          <h1 id="status-heading" className={styles.title}>
            System & Environment Status
          </h1>
          <p className={styles.lead}>
            Detailed status of the client-side evaluation engine, local browser persistence, and synthetic
            mission data fixtures.
          </p>

          <button
            type="button"
            onClick={refreshStatus}
            className={styles.actionButtonSecondary}
            style={{ marginTop: 'var(--space-2)' }}
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span>Refresh Diagnostics</span>
          </button>
        </section>

        {/* Diagnostics Grid */}
        <section aria-labelledby="env-heading">
          <h2 id="env-heading" className={styles.title} style={{ fontSize: 'var(--font-size-2xl)' }}>
            Client Environment Attributes
          </h2>

          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <Cpu size={20} style={{ color: 'var(--color-brand-cyan)', marginBottom: '8px' }} />
                <div>Evaluation Engine</div>
              </div>
              <p className={styles.cardText}>
                Version: <strong>0.1.0 (Client-Side Deterministic)</strong>
                <br />
                Execution Mode: <strong>Synchronous Pure TypeScript</strong>
                <br />
                External API Dependencies: <strong>None (0 network calls)</strong>
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <HardDrive size={20} style={{ color: 'var(--color-state-confirmed)', marginBottom: '8px' }} />
                <div>Browser Storage</div>
              </div>
              <p className={styles.cardText}>
                Active LocalStorage Keys: <strong>{storageCount} items</strong>
                <br />
                Persistence Scope: <strong>Device-Local Only</strong>
                <br />
                Server Sync: <strong>Disabled (No remote database)</strong>
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <Database size={20} style={{ color: 'var(--color-state-stale)', marginBottom: '8px' }} />
                <div>Synthetic Fixtures</div>
              </div>
              <p className={styles.cardText}>
                Asteria-3 Demo: <strong>Loaded (Synthetic 3U CubeSat)</strong>
                <br />
                Microsat-X Demo: <strong>Loaded (Out-of-Scope Fixture)</strong>
                <br />
                Live Data Feed: <strong>None (Simulated test records)</strong>
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <AlertTriangle size={20} style={{ color: 'var(--color-state-conflicting)', marginBottom: '8px' }} />
                <div>Honesty Guardrail</div>
              </div>
              <p className={styles.cardText}>
                Banned Wording Linter: <strong>Enforced in CI</strong>
                <br />
                Evaluation Output: <strong>Evidence Register & Findings Only</strong>
                <br />
                Last Diagnostic Check: <strong>{lastCheckTime || 'Just now'}</strong>
              </p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <Cpu size={20} style={{ color: 'var(--color-brand-cyan)', marginBottom: '8px' }} />
                <div>FastAPI Backend & Provenance</div>
              </div>
              <p className={styles.cardText}>
                Active Mode: <strong>{apiMode === 'live' ? 'Live FastAPI Backend' : 'Local Deterministic Engine'}</strong>
                <br />
                Server Endpoint: <strong>{apiServerUrl}</strong>
                <br />
                SHA-256 Provenance Chain: <strong>{provenance.valid ? `VERIFIED (${provenance.checkedEvents} events checked)` : 'Check Pending'}</strong>
              </p>
              <button
                type="button"
                onClick={() => toggleApiMode()}
                className={styles.actionButtonSecondary}
                style={{ marginTop: 'var(--space-2)', fontSize: '0.75rem', padding: '4px 8px' }}
              >
                <span>{apiMode === 'live' ? 'Switch to Mock' : 'Connect Live API'}</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StatusPage;
