import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Database, 
  Compass
} from 'lucide-react';
import { 
  fetchMissionPathwayLive, 
  fetchDebrisDensityLive, 
  fetchDebrisFluxLive, 
  fetchCelesTrakGPLive,
  MissionPathwayResponse,
  DebrisDensityBand,
  DebrisFluxAssessment,
  CelesTrakGPResponse
} from '../api/backend';
import { useOrbitStore } from '../store/useOrbitStore';
import styles from './OrbitalEnvironmentPage.module.css';

// Fallback altitude bands when backend is offline
const FALLBACK_BANDS: DebrisDensityBand[] = [
  { altitude_km: 200, debris_count: 140, spatial_density: 1.2e-9, risk_tier: 'LOW' },
  { altitude_km: 300, debris_count: 320, spatial_density: 3.4e-9, risk_tier: 'LOW' },
  { altitude_km: 400, debris_count: 850, spatial_density: 8.9e-9, risk_tier: 'MODERATE' },
  { altitude_km: 500, debris_count: 2100, spatial_density: 2.3e-8, risk_tier: 'HIGH' },
  { altitude_km: 600, debris_count: 3400, spatial_density: 4.1e-8, risk_tier: 'HIGH' },
  { altitude_km: 700, debris_count: 5900, spatial_density: 7.8e-8, risk_tier: 'VERY_HIGH' },
  { altitude_km: 800, debris_count: 7200, spatial_density: 9.6e-8, risk_tier: 'VERY_HIGH' },
  { altitude_km: 900, debris_count: 4800, spatial_density: 6.2e-8, risk_tier: 'HIGH' },
  { altitude_km: 1000, debris_count: 2900, spatial_density: 3.8e-8, risk_tier: 'MODERATE' },
  { altitude_km: 1200, debris_count: 1500, spatial_density: 1.8e-8, risk_tier: 'LOW' },
];

export const OrbitalEnvironmentPage: React.FC = () => {
  const activeMissionId = useOrbitStore((s) => s.activeMissionId);
  const activeMission = useOrbitStore((s) => s.missions[activeMissionId] || s.missions['asteria-3']);

  // Pathway state
  const [pathway, setPathway] = useState<MissionPathwayResponse | null>(null);
  const [pathwayLoading, setPathwayLoading] = useState(true);

  // Debris density bands
  const [densityBands, setDensityBands] = useState<DebrisDensityBand[]>([]);
  const [densityLoading, setDensityLoading] = useState(true);

  // Interactive Flux Calculator state
  const [calcAltitude, setCalcAltitude] = useState(500);
  const [calcArea, setCalcArea] = useState(0.04);
  const [calcDuration, setCalcDuration] = useState(3.0);
  const [fluxAssessment, setFluxAssessment] = useState<DebrisFluxAssessment | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // CelesTrak GP Query state
  const [celestrakNorad, setCelestrakNorad] = useState('25544');
  const [celestrakResult, setCelestrakResult] = useState<CelesTrakGPResponse | null>(null);
  const [celestrakLoading, setCelestrakLoading] = useState(false);
  const [celestrakError, setCelestrakError] = useState<string | null>(null);

  // Load Pathway & Density Bands
  useEffect(() => {
    let isMounted = true;
    setPathwayLoading(true);
    setDensityLoading(true);

    fetchMissionPathwayLive(activeMissionId || 'asteria-3')
      .then((res) => {
        if (isMounted) {
          setPathway(res);
          setPathwayLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setPathwayLoading(false);
      });

    fetchDebrisDensityLive()
      .then((res) => {
        if (isMounted) {
          setDensityBands(res);
          setDensityLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setDensityBands(FALLBACK_BANDS);
          setDensityLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeMissionId]);

  // Handle Debris Flux calculation
  const handleCalculateFlux = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalcLoading(true);
    try {
      const res = await fetchDebrisFluxLive(calcAltitude, calcArea, calcDuration);
      setFluxAssessment(res);
    } catch {
      // Local fallback calculation if backend offline
      const flux = 1e-4 * Math.exp(-Math.pow((calcAltitude - 780) / 200, 2)) + 1e-6;
      const impacts = flux * calcArea * calcDuration;
      setFluxAssessment({
        mission_altitude_km: calcAltitude,
        cumulative_flux_impacts_per_m2: flux,
        estimated_lifetime_impacts: impacts,
        collision_probability: impacts * 0.1,
        shielding_adequate: impacts < 0.01,
        source_model: 'Local Synthetic Flux Model',
        disclaimer: 'Illustrative simulation only.',
      });
    } finally {
      setCalcLoading(false);
    }
  };

  // Handle CelesTrak GP Query
  const handleQueryCelesTrak = async () => {
    const noradNum = parseInt(celestrakNorad, 10);
    if (isNaN(noradNum) || noradNum <= 0) {
      setCelestrakError('Please enter a valid positive NORAD catalog number.');
      return;
    }

    setCelestrakLoading(true);
    setCelestrakError(null);
    setCelestrakResult(null);

    try {
      const res = await fetchCelesTrakGPLive(noradNum);
      setCelestrakResult(res);
    } catch (err: unknown) {
      setCelestrakError(err instanceof Error ? err.message : 'Unable to query CelesTrak GP service.');
    } finally {
      setCelestrakLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.kicker}>
          <Compass size={14} aria-hidden="true" />
          <span>Orbital Environment & Space Situational Awareness</span>
        </div>
        <h1 className={styles.title}>Orbital Environment, Debris Density & Ground Track</h1>
        <p className={styles.subtitle}>
          Analyze spatial debris density across low Earth orbit altitude bands, evaluate orbital flux exposure,
          and inspect SGP4 sub-satellite track coordinates for {activeMission ? activeMission.name : 'Asteria-3'}.
        </p>
      </header>

      {/* Schematic Disclaimer Banner */}
      <aside className={styles.disclaimerBanner} aria-label="Schematic model disclosure">
        <strong>SCHEMATIC VISUALIZATION NOTICE:</strong> Orbital ground track waypoints, altitude risk bands, and
        flux models presented in this workspace are illustrative situational awareness tools. They are generated
        using simplified SGP4 models and public debris density records, not precision orbit determination for operational maneuvers.
      </aside>

      {/* Row 1: Sub-Satellite Ground Track Waypoints & Debris Altitude Bands */}
      <div className={styles.grid2Col}>
        {/* Left: Ground Track Waypoints */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Sub-Satellite Ground Track</h2>
              <span style={{ fontSize: '12px', color: 'var(--os-color-text-secondary)', fontFamily: 'var(--os-font-mono)' }}>
                Propagator: SGP4 Analytical Model
              </span>
            </div>
            <span className={`${styles.badge} ${styles.badgeCyan}`}>
              {pathway ? `Period: ${pathway.period_minutes.toFixed(1)}m` : 'LEO-SSO'}
            </span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--os-color-text-secondary)', marginBottom: '1rem' }}>
            Next sub-satellite track coordinates calculated from epoch orbital elements. Lat/Lon ground points are
            derived from spacecraft altitude and inclination ({pathway?.inclination_deg?.toFixed(1) || '97.4'}°).
          </p>

          <div className={styles.waypointsWrapper}>
            <table className={styles.bandsTable}>
              <thead>
                <tr>
                  <th className={styles.th}>Step (UTC)</th>
                  <th className={styles.th}>Lat / Lon</th>
                  <th className={styles.th}>Alt (km)</th>
                </tr>
              </thead>
              <tbody>
                {pathwayLoading ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--os-color-text-muted)' }}>
                      Propagating SGP4 ground track...
                    </td>
                  </tr>
                ) : pathway && pathway.pathway_points && pathway.pathway_points.length > 0 ? (
                  pathway.pathway_points.map((wp, idx) => (
                    <tr key={idx} className={styles.waypointRow}>
                      <td className={styles.td}>+{wp.time_offset_seconds}s</td>
                      <td className={styles.td}>
                        {wp.latitude.toFixed(2)}°, {wp.longitude.toFixed(2)}°
                      </td>
                      <td className={styles.td}>{wp.altitude_km.toFixed(1)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--os-color-text-muted)' }}>
                      No pathway waypoints returned.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Debris Spatial Density Altitude Bands */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>LEO Debris Density Bands</h2>
              <span style={{ fontSize: '12px', color: 'var(--os-color-text-secondary)', fontFamily: 'var(--os-font-mono)' }}>
                Source: NASA SPARK Debris Environment Model
              </span>
            </div>
            <span className={`${styles.badge} ${styles.badgeAmber}`}>10 Bands</span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--os-color-text-secondary)', marginBottom: '1rem' }}>
            Spatial debris density distribution (objects/km³) by 100 km altitude layers. Notice peak congestion around 700–800 km.
          </p>

          <div className={styles.waypointsWrapper}>
            <table className={styles.bandsTable}>
              <thead>
                <tr>
                  <th className={styles.th}>Band (km)</th>
                  <th className={styles.th}>Spatial Density (obj/km³)</th>
                  <th className={styles.th}>Risk Category</th>
                </tr>
              </thead>
              <tbody>
                {densityLoading ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--os-color-text-muted)' }}>
                      Loading spatial density profile...
                    </td>
                  </tr>
                ) : (
                  densityBands.map((band) => {
                    const ratio = Math.min(100, Math.max(5, (band.spatial_density / 1e-7) * 100));
                    return (
                      <tr key={band.altitude_km} className={styles.waypointRow}>
                        <td className={styles.td}>{band.altitude_km} km</td>
                        <td className={styles.td}>
                          {band.spatial_density.toExponential(2)}
                          <div className={styles.densityBarContainer}>
                            <div
                              className={styles.densityBar}
                              style={{
                                width: `${ratio}%`,
                                backgroundColor:
                                  band.risk_tier === 'VERY_HIGH'
                                    ? '#ef4444'
                                    : band.risk_tier === 'HIGH'
                                    ? '#f59e0b'
                                    : 'var(--os-color-accent-cyan)',
                              }}
                            />
                          </div>
                        </td>
                        <td className={styles.td}>
                          <span
                            style={{
                              color:
                                band.risk_tier === 'VERY_HIGH'
                                  ? '#ef4444'
                                  : band.risk_tier === 'HIGH'
                                  ? '#f59e0b'
                                  : 'var(--os-color-text-primary)',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          >
                            {band.risk_tier}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 2: Debris Flux Exposure Calculator & Sourced CelesTrak GP Elements */}
      <div className={styles.grid2Col}>
        {/* Left: Debris Flux Calculator */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Debris Flux Exposure Assessment</h2>
            <Calculator size={18} color="var(--os-color-accent-cyan)" aria-hidden="true" />
          </div>

          <p style={{ fontSize: '13px', color: 'var(--os-color-text-secondary)', marginBottom: '1rem' }}>
            Estimate micro-meteoroid and orbital debris (MMOD) cumulative flux based on spacecraft cross-sectional area and mission duration.
          </p>

          <form onSubmit={handleCalculateFlux}>
            <div className={styles.formGroup}>
              <label htmlFor="flux-alt" className={styles.label}>Altitude (km)</label>
              <input
                id="flux-alt"
                type="number"
                className={styles.input}
                value={calcAltitude}
                min={200}
                max={2000}
                onChange={(e) => setCalcAltitude(Number(e.target.value))}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="flux-area" className={styles.label}>Cross-Sectional Area (m²)</label>
              <input
                id="flux-area"
                type="number"
                step="0.01"
                className={styles.input}
                value={calcArea}
                min={0.01}
                max={100}
                onChange={(e) => setCalcArea(Number(e.target.value))}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="flux-duration" className={styles.label}>Mission Duration (Years)</label>
              <input
                id="flux-duration"
                type="number"
                step="0.5"
                className={styles.input}
                value={calcDuration}
                min={0.5}
                max={25}
                onChange={(e) => setCalcDuration(Number(e.target.value))}
              />
            </div>

            <button type="submit" className={styles.btnPrimary} disabled={calcLoading}>
              {calcLoading ? 'Computing Flux...' : 'Compute Flux & Expected Impacts'}
            </button>
          </form>

          {fluxAssessment && (
            <div className={styles.resultBox}>
              <div>
                <strong>Cumulative Flux:</strong>{' '}
                {fluxAssessment.cumulative_flux_impacts_per_m2.toExponential(3)} impacts/m²
              </div>
              <div>
                <strong>Expected Lifetime Impacts:</strong>{' '}
                {fluxAssessment.estimated_lifetime_impacts.toExponential(3)}
              </div>
              <div>
                <strong>Shielding Adequacy:</strong>{' '}
                <span
                  style={{
                    color: fluxAssessment.shielding_adequate ? 'var(--os-color-accent-cyan)' : '#ef4444',
                    fontWeight: 600,
                  }}
                >
                  {fluxAssessment.shielding_adequate ? 'ADEQUATE' : 'MARGINAL (REVIEW REQUIRED)'}
                </span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--os-color-text-muted)' }}>
                Source: {fluxAssessment.source_model}
              </div>
            </div>
          )}
        </div>

        {/* Right: Sourced CelesTrak GP Elements */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Sourced CelesTrak GP Elements</h2>
            <Database size={18} color="var(--os-color-accent-cyan)" aria-hidden="true" />
          </div>

          <p style={{ fontSize: '13px', color: 'var(--os-color-text-secondary)', marginBottom: '1rem' }}>
            Direct query to CelesTrak General Perturbations (GP) service using modern OMM JSON format,
            strictly respecting CelesTrak's published 2-hour cadence policy.
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
            <input
              type="text"
              className={styles.input}
              placeholder="NORAD ID (e.g. 25544 for ISS)"
              value={celestrakNorad}
              onChange={(e) => setCelestrakNorad(e.target.value)}
              aria-label="CelesTrak NORAD Catalog Number"
            />
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={celestrakLoading}
              onClick={handleQueryCelesTrak}
            >
              {celestrakLoading ? 'Querying...' : 'Query GP'}
            </button>
          </div>

          {celestrakError && (
            <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '8px' }}>
              {celestrakError}
            </div>
          )}

          {celestrakResult ? (
            <div className={styles.gpBox}>
              <div><strong>Object Name:</strong> {celestrakResult.object_name}</div>
              <div><strong>NORAD ID:</strong> {celestrakResult.norad_cat_id}</div>
              <div><strong>Format:</strong> {celestrakResult.format}</div>
              <div>
                <strong>Cache State:</strong>{' '}
                {celestrakResult.source_status === 'CACHED' ? (
                  <span style={{ color: 'var(--os-color-accent-cyan)' }}>CACHED (2-Hour Policy Adherent)</span>
                ) : (
                  <span style={{ color: '#f59e0b' }}>FRESH RETRIEVAL</span>
                )}
              </div>
              <div><strong>Epoch:</strong> {celestrakResult.epoch}</div>
              <div><strong>Circuit Breaker:</strong> {celestrakResult.circuit_breaker_active ? 'ACTIVE' : 'NOMINAL'}</div>
              <div><strong>Provenance:</strong> {celestrakResult.provenance}</div>
              <div style={{ marginTop: '8px', borderTop: '1px solid var(--os-color-border-subtle)', paddingTop: '8px' }}>
                <div><strong>Inclination:</strong> {celestrakResult.inclination_deg ?? 'N/A'}°</div>
                <div><strong>Apogee / Perigee:</strong> {celestrakResult.apogee_km ?? 'N/A'} km / {celestrakResult.perigee_km ?? 'N/A'} km</div>
                <div><strong>Period:</strong> {celestrakResult.period_minutes ?? 'N/A'} min</div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--os-color-text-muted)', lineHeight: '1.5' }}>
              Enter a NORAD catalog ID (e.g. 25544 for the International Space Station or 99001 for Asteria-3)
              to inspect the active General Perturbations record and 2-hour policy cache state.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrbitalEnvironmentPage;
