import React, { useState } from 'react';
import { Activity, ShieldCheck, AlertTriangle, Copy, Check } from 'lucide-react';
import { RealSatellite } from '../../data/realMissions';
import styles from './SpacecraftBlueprint.module.css';

interface SpacecraftBlueprintProps {
  activeSatellite: RealSatellite;
  activeSubsystemId: string;
  onSelectSubsystemId: (id: string) => void;
}

interface Hotspot {
  subId: string;
  num: string;
  x: number;
  y: number;
  label: string;
}

const HOTSPOTS: Hotspot[] = [
  { subId: 'sub-bus', num: '01', x: 220, y: 155, label: 'BUS' },
  { subId: 'sub-solar', num: '02', x: 80, y: 150, label: 'SOLAR' },
  { subId: 'sub-prop', num: '03', x: 220, y: 235, label: 'PROP' },
  { subId: 'sub-rf', num: '04', x: 265, y: 110, label: 'X-BAND' },
  { subId: 'sub-batt', num: '05', x: 180, y: 195, label: 'BATT' },
  { subId: 'sub-aocs', num: '06', x: 175, y: 115, label: 'AOCS' },
];

export const SpacecraftBlueprint: React.FC<SpacecraftBlueprintProps> = ({
  activeSatellite,
  activeSubsystemId,
  onSelectSubsystemId,
}) => {
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [hoveredSubId, setHoveredSubId] = useState<string | null>(null);

  const activeSubsystem =
    activeSatellite.subsystems.find((sub) => sub.id === activeSubsystemId) ||
    activeSatellite.subsystems[0]!;

  const handleCopyCitation = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const highlightedId = hoveredSubId || activeSubsystemId;

  return (
    <div className={styles.blueprintCard} aria-labelledby="blueprint-heading">
      {/* Blueprint Header */}
      <div className={styles.blueprintHeader}>
        <div className={styles.blueprintTitle}>
          <Activity size={15} className={styles.iconAccent} aria-hidden="true" />
          <span id="blueprint-heading">
            SPACECRAFT SUBSYSTEM BLUEPRINT // {activeSatellite.busType.toUpperCase()}
          </span>
        </div>
        <span className={styles.hintChip}>CLICK HARDWARE NODES</span>
      </div>

      {/* SVG Line-Art Spacecraft Schematic with 6 Hotspots */}
      <div className={styles.schematicWrapper}>
        <svg
          viewBox="0 0 440 270"
          className={styles.schematicSvg}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`${activeSatellite.busType} Wireframe Schematic`}
        >
          <defs>
            <linearGradient id="blueprintGridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
            <filter id="alertHeatGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Technical Grid in Schematic */}
          <rect width="440" height="270" fill="url(#blueprintGridGrad)" rx="8" />

          {/* Left Solar Wing */}
          <g opacity={highlightedId === 'sub-solar' ? '1' : '0.65'} className={styles.svgPart}>
            <rect x="25" y="115" width="110" height="70" stroke="var(--accent-2)" strokeWidth="1.2" fill="rgba(34, 211, 238, 0.04)" rx="2" />
            <line x1="62" y1="115" x2="62" y2="185" stroke="var(--border-strong)" strokeDasharray="2 2" />
            <line x1="98" y1="115" x2="98" y2="185" stroke="var(--border-strong)" strokeDasharray="2 2" />
            <line x1="25" y1="150" x2="135" y2="150" stroke="var(--border-strong)" strokeDasharray="2 2" />
            {/* Wing Hinge Yoke */}
            <line x1="135" y1="150" x2="165" y2="150" stroke="var(--text-1)" strokeWidth="2" />
          </g>

          {/* Right Solar Wing */}
          <g opacity={highlightedId === 'sub-solar' ? '1' : '0.65'} className={styles.svgPart}>
            <rect x="275" y="115" width="110" height="70" stroke="var(--accent-2)" strokeWidth="1.2" fill="rgba(34, 211, 238, 0.04)" rx="2" />
            <line x1="312" y1="115" x2="312" y2="185" stroke="var(--border-strong)" strokeDasharray="2 2" />
            <line x1="348" y1="115" x2="348" y2="185" stroke="var(--border-strong)" strokeDasharray="2 2" />
            <line x1="275" y1="150" x2="385" y2="150" stroke="var(--border-strong)" strokeDasharray="2 2" />
            {/* Wing Hinge Yoke */}
            <line x1="245" y1="150" x2="275" y2="150" stroke="var(--text-1)" strokeWidth="2" />
          </g>

          {/* Central Spacecraft Bus Body (IMS-2 Platform) */}
          <g opacity={highlightedId === 'sub-bus' ? '1' : '0.8'} className={styles.svgPart}>
            {/* Main Cubical Avionics Truss */}
            <rect x="165" y="85" width="80" height="110" stroke="var(--accent)" strokeWidth="1.8" fill="rgba(106, 165, 255, 0.06)" rx="4" />
            <line x1="165" y1="125" x2="245" y2="125" stroke="var(--border)" />
            <line x1="165" y1="160" x2="245" y2="160" stroke="var(--border)" />
            <circle cx="205" cy="142" r="14" stroke="var(--border-strong)" strokeDasharray="3 2" fill="none" />
          </g>

          {/* X-Band Antenna Patch (Top Right) */}
          <g opacity={highlightedId === 'sub-rf' ? '1' : '0.7'} className={styles.svgPart}>
            <rect x="235" y="65" width="28" height="24" stroke="var(--accent-2)" strokeWidth="1.2" fill="rgba(34, 211, 238, 0.12)" rx="2" />
            <line x1="249" y1="65" x2="249" y2="52" stroke="var(--accent-2)" strokeWidth="1.5" />
            <circle cx="249" cy="50" r="3" fill="var(--accent-2)" />
          </g>

          {/* Star Tracker Optical Head (Top Left) */}
          <g opacity={highlightedId === 'sub-aocs' ? '1' : '0.7'} className={styles.svgPart}>
            <polygon points="175,70 190,70 186,85 171,85" stroke="var(--sun)" strokeWidth="1.2" fill="rgba(255, 180, 84, 0.12)" />
            <circle cx="182" cy="74" r="2.5" fill="var(--sun)" />
          </g>

          {/* RCS Hydrazine Thruster Pods (Bottom Corners) */}
          <g opacity={highlightedId === 'sub-prop' ? '1' : '0.7'} className={styles.svgPart}>
            <polygon points="160,195 165,190 165,200" stroke="var(--ok)" strokeWidth="1.2" fill="rgba(52, 211, 153, 0.2)" />
            <polygon points="250,195 245,190 245,200" stroke="var(--ok)" strokeWidth="1.2" fill="rgba(52, 211, 153, 0.2)" />
            <polygon points="205,205 198,195 212,195" stroke="var(--ok)" strokeWidth="1.5" fill="rgba(52, 211, 153, 0.2)" />
          </g>

          {/* Battery Pack Internal Module (Lower Bus) */}
          <g opacity={highlightedId === 'sub-batt' ? '1' : '0.8'} className={styles.svgPart}>
            <rect
              x="175"
              y="166"
              width="60"
              height="24"
              stroke={activeSatellite.subsystems.find(s => s.id === 'sub-batt')?.status === 'conflict' ? 'var(--crit)' : 'var(--accent)'}
              strokeWidth="1.2"
              fill={activeSatellite.subsystems.find(s => s.id === 'sub-batt')?.status === 'conflict' ? 'rgba(251, 113, 133, 0.15)' : 'rgba(106, 165, 255, 0.1)'}
              rx="2"
            />
            {/* Battery Cell Divs */}
            <line x1="195" y1="166" x2="195" y2="190" stroke="rgba(255,255,255,0.2)" />
            <line x1="215" y1="166" x2="215" y2="190" stroke="rgba(255,255,255,0.2)" />
          </g>

          {/* 6 Numbered Interactive Hotspots */}
          {HOTSPOTS.map((hp) => {
            const isSelected = hp.subId === activeSubsystemId;
            const isHovered = hp.subId === hoveredSubId;
            const subData = activeSatellite.subsystems.find((s) => s.id === hp.subId);
            const isAlert = subData?.status === 'conflict' || (subData?.tempC || 0) > 65;

            return (
              <g
                key={hp.num}
                className={styles.hotspotGroup}
                onClick={() => onSelectSubsystemId(hp.subId)}
                onMouseEnter={() => setHoveredSubId(hp.subId)}
                onMouseLeave={() => setHoveredSubId(null)}
                style={{ cursor: 'pointer' }}
                tabIndex={0}
                role="button"
                aria-label={`Hotspot ${hp.num}: ${hp.label}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectSubsystemId(hp.subId);
                  }
                }}
              >
                {/* Outer Pulsing Ring */}
                <circle
                  cx={hp.x}
                  cy={hp.y}
                  r={isSelected || isHovered ? '14' : '10'}
                  fill="none"
                  stroke={isAlert ? 'var(--crit)' : isSelected ? 'var(--accent)' : 'var(--border-strong)'}
                  strokeWidth="1"
                  strokeDasharray={isSelected ? 'none' : '2 2'}
                  filter={isAlert ? 'url(#alertHeatGlow)' : undefined}
                  className={isAlert ? styles.pulseAlert : isSelected ? styles.pulseSelected : ''}
                />

                {/* Center Node Button */}
                <circle
                  cx={hp.x}
                  cy={hp.y}
                  r="7"
                  fill={isAlert ? 'var(--crit)' : isSelected ? 'var(--accent-fill)' : 'var(--surface-2)'}
                  stroke={isSelected ? '#ffffff' : 'var(--border-strong)'}
                  strokeWidth="1.2"
                />

                {/* Node Number */}
                <text
                  x={hp.x}
                  y={hp.y + 3}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="7"
                  fontFamily="var(--font-mono)"
                  fontWeight="700"
                >
                  {hp.num}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 6 Hardware Node Cards */}
      <div className={styles.hardwareNodesGrid} role="tablist" aria-label="Subsystem Hardware Nodes">
        {activeSatellite.subsystems.map((sub, idx) => {
          const isSelected = sub.id === activeSubsystemId;
          const isAlert = sub.status === 'conflict' || sub.tempC > 65;
          const hpNum = String(idx + 1).padStart(2, '0');

          return (
            <button
              key={sub.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectSubsystemId(sub.id)}
              onMouseEnter={() => setHoveredSubId(sub.id)}
              onMouseLeave={() => setHoveredSubId(null)}
              className={`${styles.hardwareNodeCard} ${
                isSelected ? styles.nodeCardSelected : ''
              } ${isAlert ? styles.nodeCardAlert : ''}`}
            >
              <div className={styles.nodeHeader}>
                <div className={styles.nodeIdentity}>
                  <span
                    className={`${styles.statusDot} ${
                      isAlert ? styles.dotAlert : styles.dotNominal
                    }`}
                  />
                  <span className={styles.nodeNum}>{hpNum}</span>
                  <span className={styles.nodeName}>{sub.name}</span>
                </div>
              </div>

              <div className={styles.nodeSpecsStrip}>
                <span className={styles.specChip}>
                  MASS <strong>{sub.massKg} KG</strong>
                </span>
                <span className={styles.specChip}>
                  PWR <strong>{sub.powerW} W</strong>
                </span>
                <span
                  className={`${styles.specChip} ${
                    isAlert ? styles.specChipCrit : ''
                  }`}
                >
                  TEMP <strong>{sub.tempC}°C</strong>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Subsystem Record Deep Inspection */}
      <div className={styles.subsystemInspectionBox}>
        <div className={styles.inspectionHeader}>
          <div className={styles.recordTitleGroup}>
            <span className={styles.inspectionSubhead}>SUBSYSTEM RECORD //</span>
            <span className={styles.inspectionName}>{activeSubsystem.name.toUpperCase()}</span>
          </div>

          <div className={styles.inspectionBadgeGroup}>
            {activeSubsystem.status === 'nominal' ? (
              <span className={styles.badgeNominal}>
                <ShieldCheck size={13} />
                <span>NOMINAL // VERIFIED</span>
              </span>
            ) : (
              <span className={styles.badgeConflict}>
                <AlertTriangle size={13} />
                <span>CONFLICT // FLAGGED</span>
              </span>
            )}
          </div>
        </div>

        {/* Hairline Grid of Technical Specs */}
        <div className={styles.inspectionGrid}>
          <div className={styles.specTile}>
            <span className={styles.specTileLabel}>PRIMARY CITATION:</span>
            <div className={styles.citationPillRow}>
              <span className={styles.citationPill}>{activeSubsystem.citationId}</span>
              <button
                type="button"
                onClick={() => handleCopyCitation(activeSubsystem.citationId)}
                className={styles.copyBtn}
                title="Copy Citation ID"
                aria-label={`Copy citation ID ${activeSubsystem.citationId}`}
              >
                {copiedCitation ? <Check size={12} color="var(--ok)" /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          <div className={styles.specTile}>
            <span className={styles.specTileLabel}>ALLOCATED MASS:</span>
            <span className={styles.specTileVal}>{activeSubsystem.massKg} kg</span>
          </div>

          <div className={styles.specTile}>
            <span className={styles.specTileLabel}>PEAK POWER:</span>
            <span className={styles.specTileVal}>{activeSubsystem.powerW} W</span>
          </div>

          <div className={styles.specTile}>
            <span className={styles.specTileLabel}>THERMAL TELEMETRY:</span>
            <span
              className={
                activeSubsystem.tempC > 65
                  ? styles.specTileValAlert
                  : styles.specTileVal
              }
            >
              {activeSubsystem.tempC}°C
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpacecraftBlueprint;
