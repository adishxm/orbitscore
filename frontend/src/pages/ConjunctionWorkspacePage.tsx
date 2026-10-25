import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Info, 
  Clock, 
  Activity, 
  Radio, 
  X,
  Sparkles
} from 'lucide-react';
import { 
  fetchCollisionAlertsLive, 
  runCdmForecastLive, 
  CollisionAlert 
} from '../api/backend';
import { useOrbitStore } from '../store/useOrbitStore';
import styles from './ConjunctionWorkspacePage.module.css';

// Synthetic fallback events when offline
const SYNTHETIC_SCREENING_EVENTS: CollisionAlert[] = [
  {
    cdm_id: 'cdm_demo_001',
    primary_norad: 99001,
    primary_name: 'Asteria-3',
    secondary_norad: 25544,
    secondary_name: 'ISS (ZARYA)',
    time_of_closest_approach: '2026-10-28T14:22:05Z',
    miss_distance_meters: 840,
    radial_miss_meters: 120,
    relative_speed_kms: 14.8,
    collision_probability: 2.1e-4,
    alert_level: 'CRITICAL',
    data_mode: 'SYNTHETIC_SCREENING',
  },
  {
    cdm_id: 'cdm_demo_002',
    primary_norad: 99001,
    primary_name: 'Asteria-3',
    secondary_norad: 48274,
    secondary_name: 'STARLINK-2561 DEBRIS',
    time_of_closest_approach: '2026-10-29T08:15:30Z',
    miss_distance_meters: 2350,
    radial_miss_meters: 380,
    relative_speed_kms: 11.2,
    collision_probability: 3.4e-6,
    alert_level: 'ADVISORY',
    data_mode: 'SYNTHETIC_SCREENING',
  },
  {
    cdm_id: 'cdm_demo_003',
    primary_norad: 99001,
    primary_name: 'Asteria-3',
    secondary_norad: 39159,
    secondary_name: 'CZ-4B DEBRIS',
    time_of_closest_approach: '2026-10-30T22:40:11Z',
    miss_distance_meters: 6420,
    radial_miss_meters: 910,
    relative_speed_kms: 9.7,
    collision_probability: 1.2e-7,
    alert_level: 'WIDE',
    data_mode: 'SYNTHETIC_SCREENING',
  },
  {
    cdm_id: 'cdm_demo_004',
    primary_norad: 99001,
    primary_name: 'Asteria-3',
    secondary_norad: 43204,
    secondary_name: 'COSMOS 1408 DEBRIS',
    time_of_closest_approach: '2026-10-31T03:19:44Z',
    miss_distance_meters: 4120,
    radial_miss_meters: 490,
    relative_speed_kms: 13.5,
    collision_probability: 8.7e-7,
    alert_level: 'ADVISORY',
    data_mode: 'SYNTHETIC_SCREENING',
  },
];

export const ConjunctionWorkspacePage: React.FC = () => {
  const activeMissionId = useOrbitStore((s) => s.activeMissionId);
  const activeMission = useOrbitStore((s) => s.missions[activeMissionId] || s.missions['asteria-3']);

  const [alerts, setAlerts] = useState<CollisionAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceProvenance, setSourceProvenance] = useState<string>('SYNTHETIC_SCREENING');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'ADVISORY' | 'WIDE'>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<CollisionAlert | null>(null);

  // Research CDM forecast state
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastResult, setForecastResult] = useState<any>(null);
  const [forecastError, setForecastError] = useState<string | null>(null);

  // Load alerts from backend or fallback
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchCollisionAlertsLive(activeMissionId || 'asteria-3')
      .then((response) => {
        if (isMounted) {
          setAlerts(response.alerts || []);
          setSourceProvenance(response.data_mode || 'FASTAPI_BACKEND_SCREENING');
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAlerts(SYNTHETIC_SCREENING_EVENTS);
          setSourceProvenance('SYNTHETIC_FIXTURE_LOCAL');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeMissionId]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch =
        alert.secondary_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(alert.secondary_norad).includes(searchQuery) ||
        alert.cdm_id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity =
        severityFilter === 'ALL' || alert.alert_level === severityFilter;

      return matchesSearch && matchesSeverity;
    });
  }, [alerts, searchQuery, severityFilter]);

  // KPI Metrics
  const kpiStats = useMemo(() => {
    const total = alerts.length;
    const critical = alerts.filter((a) => a.alert_level === 'CRITICAL').length;
    const advisory = alerts.filter((a) => a.alert_level === 'ADVISORY' || a.alert_level === 'WARNING').length;
    const wide = alerts.filter((a) => a.alert_level === 'WIDE').length;
    return { total, critical, advisory, wide };
  }, [alerts]);

  const handleRunForecast = async (event: CollisionAlert) => {
    setForecastLoading(true);
    setForecastError(null);
    setForecastResult(null);

    const prob = Math.max(1e-15, Math.min(1.0, event.collision_probability || 1e-4));
    const logRisk = Math.min(0.0, Math.log10(prob));

    try {
      const res = await runCdmForecastLive({
        event_id: event.cdm_id,
        time_to_tca_days: 2.0,
        miss_distance_m: event.miss_distance_meters,
        relative_speed_m_s: event.relative_speed_kms * 1000,
        latest_early_risk: logRisk,
      });
      setForecastResult(res);
    } catch (err: unknown) {
      setForecastError(err instanceof Error ? err.message : 'CDM forecast service encountered an error.');
    } finally {
      setForecastLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.kicker}>
          <Radio size={14} aria-hidden="true" />
          <span>Orbital Safety Screening Workspace</span>
        </div>
        <h1 className={styles.title}>Conjunction Assessment & Close-Approach Registry</h1>
        <p className={styles.subtitle}>
          Track projected close-approach geometries, estimated collision probabilities ($P_c$), and radial separation
          for asset {activeMission ? activeMission.name : 'Asteria-3'} (NORAD ID {activeMission ? (activeMission as any).norad_id || 99001 : 99001}).
        </p>
      </header>

      {/* Disclaimers & Provenance */}
      <aside className={styles.disclaimerBanner} aria-label="Operational boundary notice">
        <strong>NON-OPERATIONAL SCREENING NOTICE:</strong> Conjunction calculations, miss distances, and
        probabilities displayed in this interface are generated from public orbital element snapshots and synthetic
        screening matrices. They do not constitute operational flight safety navigation guidance or tactical avoidance maneuver orders.
        Provenance source: <code>{sourceProvenance}</code>.
      </aside>

      {/* KPI Cards */}
      <section className={styles.kpiGrid} aria-label="Conjunction Screening Summary">
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Screened Events</span>
          <span className={styles.kpiValue}>{loading ? '...' : kpiStats.total}</span>
          <span className={styles.kpiDetail}>72-Hour Screening Window</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel} style={{ color: '#ef4444' }}>Critical (&lt; 1 km)</span>
          <span className={styles.kpiValue} style={{ color: '#ef4444' }}>{loading ? '...' : kpiStats.critical}</span>
          <span className={styles.kpiDetail}>Requires Engineering Review</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel} style={{ color: '#f59e0b' }}>Advisory (1-5 km)</span>
          <span className={styles.kpiValue} style={{ color: '#f59e0b' }}>{loading ? '...' : kpiStats.advisory}</span>
          <span className={styles.kpiDetail}>Under Observation</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel} style={{ color: '#60a5fa' }}>Wide (&gt; 5 km)</span>
          <span className={styles.kpiValue} style={{ color: '#60a5fa' }}>{loading ? '...' : kpiStats.wide}</span>
          <span className={styles.kpiDetail}>Baseline Monitoring</span>
        </div>
      </section>

      {/* Search & Filter Controls */}
      <section className={styles.controlsBar} aria-label="Event filtering controls">
        <div className={styles.searchGroup}>
          <Search size={16} color="var(--os-color-text-muted)" aria-hidden="true" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by object name, NORAD ID, or event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter conjunction events"
          />
        </div>

        <div className={styles.filterGroup} role="group" aria-label="Severity filter buttons">
          <Filter size={15} color="var(--os-color-text-muted)" aria-hidden="true" />
          {(['ALL', 'CRITICAL', 'ADVISORY', 'WIDE'] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              className={`${styles.filterButton} ${severityFilter === tier ? styles.filterButtonActive : ''}`}
              onClick={() => setSeverityFilter(tier)}
              aria-pressed={severityFilter === tier}
            >
              {tier}
            </button>
          ))}
        </div>
      </section>

      {/* Events Table */}
      <section className={styles.tableWrapper} aria-label="Conjunction events table">
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Secondary Object</th>
              <th className={styles.th}>Secondary NORAD</th>
              <th className={styles.th}>TCA (UTC)</th>
              <th className={styles.th}>Miss Distance</th>
              <th className={styles.th}>Radial Miss</th>
              <th className={styles.th}>Relative Speed</th>
              <th className={styles.th}>Collision Prob (Pc)</th>
              <th className={styles.th}>Alert Tier</th>
              <th className={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading orbital screening records...
                </td>
              </tr>
            ) : filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
                  No close-approach events match the current filter criteria.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((event) => (
                <tr key={event.cdm_id} className={styles.row}>
                  <td className={styles.td}>
                    <strong>{event.secondary_name}</strong>
                  </td>
                  <td className={`${styles.td} ${styles.mono}`}>{event.secondary_norad}</td>
                  <td className={`${styles.td} ${styles.mono}`}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} aria-hidden="true" />
                      {new Date(event.time_of_closest_approach).toISOString().replace('.000Z', 'Z')}
                    </span>
                  </td>
                  <td className={`${styles.td} ${styles.mono}`}>
                    {(event.miss_distance_meters / 1000).toFixed(2)} km
                  </td>
                  <td className={`${styles.td} ${styles.mono}`}>
                    {event.radial_miss_meters.toFixed(0)} m
                  </td>
                  <td className={`${styles.td} ${styles.mono}`}>
                    {event.relative_speed_kms.toFixed(1)} km/s
                  </td>
                  <td className={`${styles.td} ${styles.mono}`}>
                    {event.collision_probability.toExponential(2)}
                  </td>
                  <td className={styles.td}>
                    {event.alert_level === 'CRITICAL' && (
                      <span className={styles.tierCritical}>
                        <AlertTriangle size={11} aria-hidden="true" />
                        CRITICAL
                      </span>
                    )}
                    {(event.alert_level === 'ADVISORY' || event.alert_level === 'WARNING') && (
                      <span className={styles.tierAdvisory}>
                        <Activity size={11} aria-hidden="true" />
                        ADVISORY
                      </span>
                    )}
                    {event.alert_level === 'WIDE' && (
                      <span className={styles.tierWide}>
                        <Info size={11} aria-hidden="true" />
                        WIDE
                      </span>
                    )}
                  </td>
                  <td className={styles.td}>
                    <button
                      type="button"
                      className={styles.inspectBtn}
                      onClick={() => {
                        setSelectedEvent(event);
                        setForecastResult(null);
                        setForecastError(null);
                      }}
                      aria-label={`Inspect event details for ${event.secondary_name}`}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* Event Details & Research CDM Modal */}
      {selectedEvent && (
        <div 
          className={styles.modalOverlay} 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedEvent(null);
          }}
        >
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.kicker}>Event Inspector</span>
                <h2 id="modal-title" className={styles.title} style={{ fontSize: '1.25rem' }}>
                  {selectedEvent.secondary_name} (NORAD {selectedEvent.secondary_norad})
                </h2>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setSelectedEvent(null)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.grid2Col}>
              <div className={styles.detailField}>
                <div className={styles.fieldLabel}>Event ID</div>
                <div className={styles.fieldValue}>{selectedEvent.cdm_id}</div>
              </div>
              <div className={styles.detailField}>
                <div className={styles.fieldLabel}>Time of Closest Approach</div>
                <div className={styles.fieldValue}>{selectedEvent.time_of_closest_approach}</div>
              </div>
              <div className={styles.detailField}>
                <div className={styles.fieldLabel}>Total Miss Distance</div>
                <div className={styles.fieldValue}>
                  {(selectedEvent.miss_distance_meters / 1000).toFixed(3)} km ({selectedEvent.miss_distance_meters} m)
                </div>
              </div>
              <div className={styles.detailField}>
                <div className={styles.fieldLabel}>Radial Miss Distance</div>
                <div className={styles.fieldValue}>{selectedEvent.radial_miss_meters.toFixed(1)} m</div>
              </div>
              <div className={styles.detailField}>
                <div className={styles.fieldLabel}>Relative Speed</div>
                <div className={styles.fieldValue}>{selectedEvent.relative_speed_kms.toFixed(2)} km/s</div>
              </div>
              <div className={styles.detailField}>
                <div className={styles.fieldLabel}>Collision Probability</div>
                <div className={styles.fieldValue}>{selectedEvent.collision_probability.toExponential(3)}</div>
              </div>
            </div>

            {/* Research ML Conjunction Data Message Forecast */}
            <div className={styles.cdmBox}>
              <div className={styles.cdmTitle}>
                <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Research ML Conjunction Forecast (CDM Model)
              </div>
              <p className={styles.cdmNotice}>
                OrbitScore includes an experimental gradient-boosted ML regressor trained on research CDM message evolutions.
                This provides an exploratory trend estimate of miss distance uncertainty as TCA approaches.
                <strong> Note: This is a non-validated experimental research demonstration model.</strong>
              </p>

              <button
                type="button"
                className={styles.forecastBtn}
                disabled={forecastLoading}
                onClick={() => handleRunForecast(selectedEvent)}
              >
                {forecastLoading ? 'Evaluating ML Model...' : 'Execute Research ML Forecast'}
              </button>

              {forecastError && (
                <div style={{ color: '#ef4444', marginTop: '8px', fontSize: '12px' }}>
                  {forecastError}
                </div>
              )}

              {forecastResult && (
                <div className={styles.cdmResult}>
                  <div><strong>Model Status:</strong> {forecastResult.model_status || (forecastResult.research_only ? 'RESEARCH_EVALUATED' : 'BASELINE_PERSISTENCE')}</div>
                  <div><strong>Artifact ID:</strong> {forecastResult.model_artifact_id || forecastResult.model_version || 'Baseline-Regression'}</div>
                  <div>
                    <strong>Reported Log10 Risk:</strong>{' '}
                    {typeof forecastResult.forecasted_final_log10_risk === 'number'
                      ? `${forecastResult.forecasted_final_log10_risk.toFixed(2)} (${(10 ** forecastResult.forecasted_final_log10_risk).toExponential(2)} Pc)`
                      : typeof forecastResult.predicted_miss_distance_m === 'number'
                      ? `${forecastResult.predicted_miss_distance_m.toFixed(1)} m`
                      : 'N/A'}
                  </div>
                  <div><strong>Risk Classification:</strong> {forecastResult.forecast_alert_tier || (forecastResult.derived_high_risk_flag ? 'CRITICAL / ACTION REQUIRED' : 'ADVISORY / MONITORING')}</div>
                  <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--os-color-text-muted)' }}>
                    Limitation: {forecastResult.notes || forecastResult.disclaimer || 'Research exploratory forecast.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConjunctionWorkspacePage;
