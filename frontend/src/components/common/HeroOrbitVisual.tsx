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
          {/* Earth Atmosphere Rim Glow */}
          <radialGradient
            id={`${idPrefix}-earthAtmosphere`}
            cx="45%"
            cy="40%"
            r="60%"
          >
            <stop offset="0%" stopColor="#0d1829" />
            <stop offset="65%" stopColor="#080e1a" />
            <stop offset="92%" stopColor="#1e3a6a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.95" />
          </radialGradient>

          {/* Sunrise Rim Light */}
          <linearGradient id={`${idPrefix}-sunriseRim`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffb454" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#22d3ee" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>

          {/* Marker Glow Filter */}
          <filter id={`${idPrefix}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Back Orbit Arcs (Faked Depth Behind Earth) */}
        <g className={styles.backOrbits} opacity="0.45">
          {orbits.map((orb) => {
            const isSelected = orb.sat.id === selectedSatId;
            return (
              <ellipse
                key={`back-${orb.sat.id}`}
                cx="240"
                cy="200"
                rx={orb.rx}
                ry={orb.ry}
                transform={`rotate(${orb.tiltDeg} 240 200)`}
                stroke={isSelected ? 'var(--accent)' : orb.color}
                strokeWidth={isSelected ? '2' : '1'}
                strokeDasharray="4 3"
                opacity={isSelected ? 0.9 : 0.4}
              />
            );
          })}
        </g>

        {/* 2. Earth Central Sphere (Radius 78px at 240, 200) */}
        <g className={styles.earthGroup}>
          {/* Outer Atmospheric Glow */}
          <circle
            cx="240"
            cy="200"
            r="82"
            fill="none"
            stroke="rgba(34, 211, 238, 0.25)"
            strokeWidth="4"
          />

          {/* Earth Body */}
          <circle
            cx="240"
            cy="200"
            r="78"
            fill={`url(#${idPrefix}-earthAtmosphere)`}
          />

          {/* Subtle Graticule Lines (Lat/Long) */}
          <ellipse
            cx="240"
            cy="200"
            rx="78"
            ry="30"
            stroke="rgba(148, 170, 210, 0.12)"
            strokeWidth="1"
            fill="none"
          />
          <ellipse
            cx="240"
            cy="200"
            rx="78"
            ry="60"
            stroke="rgba(148, 170, 210, 0.08)"
            strokeWidth="1"
            fill="none"
          />
          <line
            x1="240"
            y1="122"
            x2="240"
            y2="278"
            stroke="rgba(148, 170, 210, 0.12)"
            strokeWidth="1"
          />

          {/* Terminator & Sunrise Atmospheric Edge */}
          <path
            d="M 240 122 A 78 78 0 0 1 318 200 A 78 78 0 0 1 240 278 Z"
            fill="rgba(0, 0, 0, 0.45)"
          />
          <circle
            cx="240"
            cy="200"
            r="78"
            fill="none"
            stroke={`url(#${idPrefix}-sunriseRim)`}
            strokeWidth="2.5"
          />
        </g>

        {/* 3. Front Orbit Arcs (Over Earth Front Face) */}
        <g className={styles.frontOrbits}>
          {orbits.map((orb) => {
            const isSelected = orb.sat.id === selectedSatId;
            const isHighlighted = isSelected || orb.sat.id === hoveredSatId;
            return (
              <g
                key={`front-${orb.sat.id}`}
                className={styles.orbitHitGroup}
                onClick={() => onSelectSatId(orb.sat.id)}
                onMouseEnter={() => setHoveredSatId(orb.sat.id)}
                onMouseLeave={() => setHoveredSatId(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Thick invisible stroke for hit target */}
                <ellipse
                  cx="240"
                  cy="200"
                  rx={orb.rx}
                  ry={orb.ry}
                  transform={`rotate(${orb.tiltDeg} 240 200)`}
                  stroke="transparent"
                  strokeWidth="16"
                  fill="none"
                />
                {/* Visible front stroke */}
                <ellipse
                  cx="240"
                  cy="200"
                  rx={orb.rx}
                  ry={orb.ry}
                  transform={`rotate(${orb.tiltDeg} 240 200)`}
                  stroke={isHighlighted ? 'var(--accent)' : orb.color}
                  strokeWidth={isHighlighted ? '2.5' : '1.2'}
                  opacity={isSelected ? 1 : 0.65}
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
          left: Math.min(360, Math.max(16, activeMarker.x - 70)),
          top: Math.max(16, activeMarker.y - 65),
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
