import React, { useEffect, useRef, useState, useId } from 'react';
import { REAL_SATELLITES, RealSatellite } from '../../data/realMissions';
import styles from './HeroOrbitVisual.module.css';

interface HeroOrbitVisualProps {
  selectedSatId: string;
  onSelectSatId: (id: string) => void;
}

interface OrbitConfig {
  sat: RealSatellite;
  rx: number;
  ry: number;
  tiltDeg: number;
  periodSec: number;
  color: string;
  altitudeKm: number;
}

export const HeroOrbitVisual: React.FC<HeroOrbitVisualProps> = ({
  selectedSatId,
  onSelectSatId,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredSatId, setHoveredSatId] = useState<string | null>(null);
  const [markerPos, setMarkerPos] = useState<{ [key: string]: { x: number; y: number } }>({});
  const idPrefix = useId().replace(/:/g, '');

  const activeSat = REAL_SATELLITES.find((s) => s.id === selectedSatId) || REAL_SATELLITES[0]!;

  // 4 Data-driven real satellite orbital geometries
  const orbits: OrbitConfig[] = [
    {
      sat: REAL_SATELLITES[0]!, // EOS-06 [54361] SSO 741km
      rx: 155,
      ry: 52,
      tiltDeg: -35,
      periodSec: 28,
      color: '#6aa5ff',
      altitudeKm: 741,
    },
    {
      sat: REAL_SATELLITES[1]!, // Sentinel-6A [46984] LEO 1336km
      rx: 185,
      ry: 64,
      tiltDeg: 42,
      periodSec: 34,
      color: '#22d3ee',
      altitudeKm: 1336,
    },
    {
      sat: REAL_SATELLITES[2]!, // CAPSTONE [52918] NRHO Cislunar
      rx: 215,
      ry: 78,
      tiltDeg: -15,
      periodSec: 42,
      color: '#ffb454',
      altitudeKm: 384000,
    },
    {
      sat: REAL_SATELLITES[3]!, // Landsat-9 [49260] SSO 705km
      rx: 140,
      ry: 46,
      tiltDeg: 68,
      periodSec: 26,
      color: '#34d399',
      altitudeKm: 705,
    },
  ];

  useEffect(() => {
    let animId: number | null = null;
    let isVisible = document.visibilityState === 'visible';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const startTime = performance.now();

    const updateLoop = (now: number) => {
      if (!isVisible) {
        animId = null;
        return;
      }

      const elapsed = (now - startTime) / 1000;
      const nextPos: { [key: string]: { x: number; y: number } } = {};

      for (const orb of orbits) {
        const angle = prefersReducedMotion
          ? 0.75 * Math.PI
          : ((elapsed % orb.periodSec) / orb.periodSec) * Math.PI * 2;

        // Position on 2D ellipse before tilt
        const rawX = orb.rx * Math.cos(angle);
        const rawY = orb.ry * Math.sin(angle);

        // Apply tilt rotation
        const rad = (orb.tiltDeg * Math.PI) / 180;
        const rotatedX = rawX * Math.cos(rad) - rawY * Math.sin(rad);
        const rotatedY = rawX * Math.sin(rad) + rawY * Math.cos(rad);

        nextPos[orb.sat.id] = {
          x: 240 + rotatedX,
          y: 200 + rotatedY,
        };
      }

      setMarkerPos(nextPos);

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(updateLoop);
      }
    };

    const handleVisibility = () => {
      isVisible = document.visibilityState === 'visible';
      if (isVisible && !prefersReducedMotion && animId === null) {
        animId = requestAnimationFrame(updateLoop);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    if (prefersReducedMotion) {
      updateLoop(startTime);
    } else {
      animId = requestAnimationFrame(updateLoop);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animId !== null) cancelAnimationFrame(animId);
    };
  }, []);

  const activeMarker = markerPos[selectedSatId] || { x: 320, y: 160 };

  return (
    <div
      ref={containerRef}
      className={styles.orbitVisualContainer}
      aria-label="Interactive Spacecraft Orbital Telemetry Engine Visualizer"
    >
      <svg
        viewBox="0 0 480 400"
        className={styles.orbitSvg}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Holographic Radar Hub Center Glow */}
          <radialGradient
            id={`${idPrefix}-radarCenter`}
            cx="50%"
            cy="50%"
            r="50%"
          >
            <stop offset="0%" stopColor="#6aa5ff" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#2563eb" stopOpacity="0.08" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Marker Glow Filter */}
          <filter id={`${idPrefix}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Central Holographic Telemetry Hub (Nadir & Radar Range Reticles) */}
        <g className={styles.telemetryHub}>
          {/* Ambient Hub Glow */}
          <circle
            cx="240"
            cy="200"
            r="96"
            fill={`url(#${idPrefix}-radarCenter)`}
          />

          {/* Outer Range Reticle (r=96) */}
          <circle
            cx="240"
            cy="200"
            r="96"
            stroke="rgba(148, 170, 210, 0.12)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />

          {/* Intermediate Range Reticle (r=54) */}
          <circle
            cx="240"
            cy="200"
            r="54"
            stroke="rgba(106, 165, 255, 0.22)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />

          {/* Core Telemetry Node Ring (r=22) */}
          <circle
            cx="240"
            cy="200"
            r="22"
            stroke="rgba(106, 165, 255, 0.45)"
            strokeWidth="1.2"
            fill="rgba(7, 12, 22, 0.75)"
          />

          {/* Cardinal Crosshair Ticks */}
          <line x1="240" y1="168" x2="240" y2="192" stroke="rgba(106, 165, 255, 0.4)" strokeWidth="1" />
          <line x1="240" y1="208" x2="240" y2="232" stroke="rgba(106, 165, 255, 0.4)" strokeWidth="1" />
          <line x1="208" y1="200" x2="232" y2="200" stroke="rgba(106, 165, 255, 0.4)" strokeWidth="1" />
          <line x1="248" y1="200" x2="272" y2="200" stroke="rgba(106, 165, 255, 0.4)" strokeWidth="1" />

          {/* 45-degree angle tick pips */}
          <circle cx="278" cy="162" r="1.5" fill="rgba(148, 170, 210, 0.3)" />
          <circle cx="202" cy="162" r="1.5" fill="rgba(148, 170, 210, 0.3)" />
          <circle cx="278" cy="238" r="1.5" fill="rgba(148, 170, 210, 0.3)" />
          <circle cx="202" cy="238" r="1.5" fill="rgba(148, 170, 210, 0.3)" />

          {/* Pulsing Central Core Beacon */}
          <circle
            cx="240"
            cy="200"
            r="4"
            fill="var(--accent)"
            filter={`url(#${idPrefix}-glow)`}
          />
          <circle
            cx="240"
            cy="200"
            r="1.5"
            fill="#ffffff"
          />

          {/* Technical Telemetry Label */}
          <text
            x="240"
            y="214"
            textAnchor="middle"
            fill="var(--text-2)"
            fontSize="6.5"
            fontFamily="var(--font-mono)"
            letterSpacing="0.12em"
          >
            NADIR // 0,0,0
          </text>
        </g>

        {/* 2. Unified 360° Spacecraft Orbit Tracks */}
        <g className={styles.orbitTracks}>
          {orbits.map((orb) => {
            const isSelected = orb.sat.id === selectedSatId;
            const isHighlighted = isSelected || orb.sat.id === hoveredSatId;
            return (
              <g
                key={`orbit-${orb.sat.id}`}
                className={styles.orbitHitGroup}
                onClick={() => onSelectSatId(orb.sat.id)}
                onMouseEnter={() => setHoveredSatId(orb.sat.id)}
                onMouseLeave={() => setHoveredSatId(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Wide invisible stroke for generous hit target */}
                <ellipse
                  cx="240"
                  cy="200"
                  rx={orb.rx}
                  ry={orb.ry}
                  transform={`rotate(${orb.tiltDeg} 240 200)`}
                  stroke="transparent"
                  strokeWidth="20"
                  fill="none"
                />
                {/* Subtle base dash track */}
                <ellipse
                  cx="240"
                  cy="200"
                  rx={orb.rx}
                  ry={orb.ry}
                  transform={`rotate(${orb.tiltDeg} 240 200)`}
                  stroke={orb.color}
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  opacity={isSelected ? 0.3 : 0.2}
                  fill="none"
                />
                {/* Primary orbital ellipse stroke */}
                <ellipse
                  cx="240"
                  cy="200"
                  rx={orb.rx}
                  ry={orb.ry}
                  transform={`rotate(${orb.tiltDeg} 240 200)`}
                  stroke={isHighlighted ? 'var(--accent)' : orb.color}
                  strokeWidth={isHighlighted ? '2.5' : '1.2'}
                  opacity={isSelected ? 1 : isHighlighted ? 0.85 : 0.55}
                  filter={isHighlighted ? `url(#${idPrefix}-glow)` : undefined}
                  fill="none"
                />
              </g>
            );
          })}
        </g>

        {/* 4. Satellite Moving Markers */}
        {orbits.map((orb) => {
          const pos = markerPos[orb.sat.id];
          if (!pos) return null;
          const isSelected = orb.sat.id === selectedSatId;

          return (
            <g
              key={`marker-${orb.sat.id}`}
              className={styles.markerGroup}
              transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => onSelectSatId(orb.sat.id)}
              style={{ cursor: 'pointer' }}
            >
              {isSelected && (
                <circle
                  r="10"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  opacity="0.8"
                  filter={`url(#${idPrefix}-glow)`}
                />
              )}
              <circle
                r={isSelected ? '5' : '3.5'}
                fill={isSelected ? '#ffffff' : orb.color}
                stroke={isSelected ? 'var(--accent-fill)' : '#04060b'}
                strokeWidth="1.5"
              />
            </g>
          );
        })}
      </svg>

      {/* 5. Floating Telemetry Card for Selected Spacecraft */}
      <div
        className={styles.satelliteTelemetryCard}
        style={{
          left: `${(activeMarker.x / 480) * 100}%`,
          top: `${(activeMarker.y / 400) * 100}%`,
        }}
      >
        <div className={styles.cardHeader}>
          <span className={styles.satName}>{activeSat.commonName}</span>
          <span className={styles.satNorad}>[{activeSat.noradId}]</span>
        </div>
        <div className={styles.cardStats}>
          <span className={styles.statItem}>
            ALT <strong>{activeSat.apogeeKm} KM</strong>
          </span>
          <span className={styles.statItem}>
            VEL <strong>{activeSat.velocityKmS} KM/S</strong>
          </span>
          <span className={styles.statItem}>
            INC <strong>{activeSat.inclinationDeg}°</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeroOrbitVisual;
