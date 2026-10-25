import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, RefreshCw, ArrowRight, Lock, Copy, Check } from 'lucide-react';
import { REAL_SATELLITES, RealSatellite } from '../../data/realMissions';
import styles from './FleetCard.module.css';

interface FleetCardProps {
  selectedSatId: string;
  onSelectSatId: (id: string) => void;
  apogeeVal: number;
  perigeeVal: number;
  inclinationVal: string;
  tleLine1Val: string;
  tleLine2Val: string;
  tleSyncStatus: string;
  isSyncing: boolean;
  onSyncCelesTrak: () => void;
}

export const FleetCard: React.FC<FleetCardProps> = ({
  selectedSatId,
  onSelectSatId,
  apogeeVal,
  perigeeVal,
  inclinationVal,
  tleLine1Val,
  tleLine2Val,
  tleSyncStatus,
  isSyncing,
  onSyncCelesTrak,
}) => {
  const [copiedTle, setCopiedTle] = useState(false);

  const activeSatellite: RealSatellite =
    REAL_SATELLITES.find((s) => s.id === selectedSatId) || REAL_SATELLITES[0]!;

  const handleCopyTle = () => {
    navigator.clipboard.writeText(`${tleLine1Val}\n${tleLine2Val}`);
    setCopiedTle(true);
    setTimeout(() => setCopiedTle(false), 2000);
  };

  const handleKeyDownTabs = (e: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % REAL_SATELLITES.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + REAL_SATELLITES.length) % REAL_SATELLITES.length;
    }
    if (nextIndex !== currentIndex) {
      e.preventDefault();
      onSelectSatId(REAL_SATELLITES[nextIndex]!.id);
    }
  };

  return (
    <div className={styles.fleetCardRoot} aria-labelledby="fleet-heading">
      {/* 1. Satellite Tabs (Segmented Control Track) */}
      <div
        className={styles.tabsTrack}
        role="tablist"
        aria-label="Real Spacecraft Fleet"
      >
        {REAL_SATELLITES.map((sat, idx) => {
          const isActive = sat.id === selectedSatId;
          return (
            <button
              key={sat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onKeyDown={(e) => handleKeyDownTabs(e, idx)}
              className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ''}`}
              onClick={() => onSelectSatId(sat.id)}
            >
              <span className={styles.tabName}>{sat.commonName}</span>
              <span className={styles.tabNorad}>[{sat.noradId}]</span>
            </button>
          );
        })}
      </div>

      {/* 2. 8-Cell Telemetry Readout Grid (4x2 Tiles Separated by Hairlines) */}
      <div className={styles.metricsGrid8}>
        {/* Row 1: Identity & Orbit Envelope */}
        <div className={styles.metricTile}>
          <span className={styles.microLabel}>NORAD CAT ID</span>
          <span className={styles.dataValue}>{activeSatellite.noradId}</span>
        </div>

        <div className={styles.metricTile}>
          <span className={styles.microLabel}>COSPAR ID</span>
          <span className={styles.dataValue}>{activeSatellite.cosparId}</span>
        </div>

        <div className={styles.metricTile}>
          <span className={styles.microLabel}>APOGEE / PERIGEE</span>
          <span className={styles.dataValue}>
            {apogeeVal} / {perigeeVal} <span className={styles.dataUnit}>KM</span>
          </span>
        </div>

        <div className={styles.metricTile}>
          <span className={styles.microLabel}>INCLINATION</span>
          <span className={styles.dataValue}>
            {inclinationVal}<span className={styles.dataUnit}>° SSO</span>
          </span>
        </div>

        {/* Row 2: Live Flight Physics & Integrity */}
        <div className={styles.metricTile}>
          <span className={styles.microLabel}>ORBITAL VELOCITY</span>
          <div className={styles.metricVisualRow}>
            <span className={styles.dataValueAccent}>
              {activeSatellite.velocityKmS} <span className={styles.dataUnit}>KM/S</span>
            </span>
            {/* Mini velocity arc indicator */}
            <svg width="24" height="14" viewBox="0 0 24 14" fill="none" aria-hidden="true">
              <path d="M 2 12 A 10 10 0 0 1 22 12" stroke="var(--border-strong)" strokeWidth="2.5" />
              <path d="M 2 12 A 10 10 0 0 1 18 4" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className={styles.metricTile}>
          <span className={styles.microLabel}>MEAN MOTION</span>
          <span className={styles.dataValue}>
            {activeSatellite.meanMotionRevDay.toFixed(4)} <span className={styles.dataUnit}>REV/D</span>
          </span>
        </div>

        <div className={styles.metricTile}>
          <span className={styles.microLabel}>WET MASS MARGIN</span>
          <div className={styles.massMarginWrapper}>
            <span className={styles.dataValueOk}>
              +{activeSatellite.massMarginPct.toFixed(2)}%
            </span>
            <span className={styles.massSubtext}>({activeSatellite.wetMassKg} KG)</span>
            <div className={styles.progressBarBg} aria-hidden="true">
              <div
                className={styles.progressBarFill}
                style={{ width: `${Math.min(100, activeSatellite.massMarginPct * 18)}%` }}
              />
            </div>
          </div>
        </div>

        <div className={styles.metricTile}>
          <span className={styles.microLabel}>SHA-256 INTEGRITY</span>
          <div className={styles.integrityChip}>
            <Lock size={12} className={styles.lockIcon} aria-hidden="true" />
            <span className={styles.integrityText}>LOCKED &amp; VERIFIED</span>
          </div>
        </div>
      </div>

      {/* 3. Raw Monospace TLE Inspector Box */}
      <div className={styles.tleInspectorBox}>
        <div className={styles.tleHeaderRow}>
          <div className={styles.tleTitleGroup}>
            <Terminal size={14} className={styles.iconTerminal} aria-hidden="true" />
            <span className={styles.tleTitle}>RAW CELESTRAK TWO-LINE ELEMENT (TLE)</span>
          </div>
          <div className={styles.tleMetaGroup}>
            <span className={styles.demoBadge}>Demo data</span>
            <span className={styles.tleStatusTag}>{tleSyncStatus}</span>
          </div>
        </div>

        {/* TLE Code Block with Line Numbers & Copy Button */}
        <div className={styles.codeBlockWrapper}>
          <pre className={styles.tleCode}>
            <div className={styles.tleLineRow}>
              <span className={styles.lineNumber}>1</span>
              <code>{tleLine1Val}</code>
            </div>
            <div className={styles.tleLineRow}>
              <span className={styles.lineNumber}>2</span>
              <code>{tleLine2Val}</code>
            </div>
          </pre>
          <button
            type="button"
            onClick={handleCopyTle}
            className={styles.copyTleBtn}
            title="Copy TLE to clipboard"
            aria-label="Copy Two-Line Element lines"
          >
            {copiedTle ? <Check size={13} color="var(--ok)" /> : <Copy size={13} />}
            <span>{copiedTle ? 'COPIED' : 'COPY TLE'}</span>
          </button>
        </div>

        {/* TLE Action Buttons */}
        <div className={styles.tleActionsRow}>
          <button
            type="button"
            onClick={onSyncCelesTrak}
            disabled={isSyncing}
            className={styles.syncBtn}
          >
            <RefreshCw size={13} className={isSyncing ? styles.spinner : ''} />
            <span>{isSyncing ? 'SYNCING CELESTRAK...' : 'SYNC LIVE CELESTRAK GP'}</span>
          </button>

          <Link
            to={`/missions/${activeSatellite.id}`}
            className={styles.launchBtn}
          >
            <span>LAUNCH WORKSPACE</span>
            <ArrowRight size={14} className={styles.btnArrow} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FleetCard;
