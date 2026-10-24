/**
 * OrbitScore Live FastAPI Backend Client
 * Connects to the local/remote OrbitScore FastAPI server (default: http://127.0.0.1:8000).
 * Provides dual-mode capability: live server evaluation and provenance verification,
 * with safe offline fallback to the local deterministic check engine.
 */

export const DEFAULT_API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined'
      ? window.sessionStorage?.getItem('orbitscore_auth_token') ||
        window.localStorage?.getItem('orbitscore_auth_token') ||
        (import.meta as any).env?.VITE_API_KEY ||
        ''
      : '';
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
      'X-API-Key': token,
    };
  }
  return {};
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage?.setItem('orbitscore_auth_token', token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage?.removeItem('orbitscore_auth_token');
  }
}

export interface ApiHealthResponse {
  ok: boolean;
  version?: string;
  ai_enabled?: boolean;
  database?: string;
}

export interface BackendProfile {
  profile_id: string;
  name: string;
  description?: string;
  rules?: any[];
}

export interface BackendMission {
  mission_id: string;
  name: string;
  operator?: string;
  mission_type?: string;
  selected_profile_id?: string;
  fields: Array<{
    field_id: string;
    label?: string;
    value: any;
    unit?: string;
    human_confirmed?: boolean;
    evidence_state?: string;
    source_locator?: any;
  }>;
}

export interface BackendEvaluationResponse {
  mission_id: string;
  profile_id: string;
  evaluated_at: string;
  findings: Array<{
    finding_id: string;
    rule_id: string;
    rule_version?: string;
    title: string;
    status: string;
    critical_gap?: boolean;
    observed_value?: any;
    observed_unit?: string;
    threshold?: any;
    rationale?: string;
    remediation_lever?: string;
    limitation_notice?: string;
    source_citation?: {
      document: string;
      clause: string;
      interpretation_type?: string;
    };
  }>;
}

export interface ProvenanceResponse {
  events: Array<{
    event_id: string;
    event_type: string;
    mission_id?: string;
    timestamp: string;
    payload?: any;
    prev_hash?: string;
    event_hash?: string;
  }>;
  verification: {
    valid: boolean;
    checked_events: number;
    head_hash?: string;
  };
}

export interface CounterfactualResponse {
  counterfactual_id?: string;
  mission_id: string;
  profile_id?: string;
  finding_id?: string;
  lever: string;
  field_id?: string;
  current_value?: any;
  proposed_value: any;
  before_status?: string;
  after_status?: string;
  before_statuses?: string[];
  after_statuses?: string[];
  bounded?: boolean;
}

/**
 * Health check on FastAPI backend
 */
export async function checkApiHealth(
  baseUrl = DEFAULT_API_BASE_URL
): Promise<ApiHealthResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Health check returned status ${res.status}`);
    }
    return (await res.json()) as ApiHealthResponse;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch registered policy profiles from FastAPI backend
 */
export async function fetchProfilesLive(
  baseUrl = DEFAULT_API_BASE_URL
): Promise<BackendProfile[]> {
  const res = await fetch(`${baseUrl}/profiles`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Failed to load profiles (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.profiles ?? []);
}

/**
 * List missions stored in SQLite on FastAPI backend
 */
export async function fetchMissionsLive(
  baseUrl = DEFAULT_API_BASE_URL
): Promise<BackendMission[]> {
  const res = await fetch(`${baseUrl}/missions`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Failed to list missions (${res.status})`);
  return (await res.json()) as BackendMission[];
}

/**
 * Get single mission details from backend
 */
export async function fetchMissionLive(
  missionId: string,
  baseUrl = DEFAULT_API_BASE_URL
): Promise<BackendMission> {
  const res = await fetch(`${baseUrl}/missions/${encodeURIComponent(missionId)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Mission ${missionId} not found (${res.status})`);
  return (await res.json()) as BackendMission;
}

/**
 * Trigger deterministic policy evaluation on FastAPI backend
 */
export async function evaluateMissionLive(
  missionId: string,
  profileId: string,
  baseUrl = DEFAULT_API_BASE_URL
): Promise<BackendEvaluationResponse> {
  const res = await fetch(
    `${baseUrl}/missions/${encodeURIComponent(missionId)}/evaluate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ profile_id: profileId }),
    }
  );
  if (!res.ok) throw new Error(`Evaluation failed (${res.status})`);
  return (await res.json()) as BackendEvaluationResponse;
}

/**
 * Submit human engineering sign-off decision to backend
 */
export async function submitReviewDecisionLive(
  missionId: string,
  findingId: string,
  decision: 'ACCEPTED' | 'REJECTED' | 'WAIVED_WITH_NOTE' | string,
  rationale = '',
  reviewer = 'Human Engineer',
  baseUrl = DEFAULT_API_BASE_URL
): Promise<any> {
  const res = await fetch(
    `${baseUrl}/missions/${encodeURIComponent(missionId)}/findings/${encodeURIComponent(findingId)}/decision`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        decision,
        rationale: rationale || undefined,
        reviewer,
        timestamp: new Date().toISOString(),
      }),
    }
  );
  if (!res.ok) throw new Error(`Review submission failed (${res.status})`);
  return await res.json();
}

/**
 * Run counterfactual simulation against the backend policy rules
 */
export async function runCounterfactualLive(
  missionId: string,
  findingId: string,
  lever: string,
  proposedValue: any,
  baseUrl = DEFAULT_API_BASE_URL
): Promise<CounterfactualResponse> {
  const res = await fetch(
    `${baseUrl}/missions/${encodeURIComponent(missionId)}/counterfactual`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        finding_id: findingId,
        lever,
        proposed_value: proposedValue,
      }),
    }
  );
  if (!res.ok) throw new Error(`Counterfactual simulation failed (${res.status})`);
  return (await res.json()) as CounterfactualResponse;
}

/**
 * Fetch tamper-evident SHA-256 provenance chain from SQLite backend
 */
export async function fetchProvenanceLive(
  baseUrl = DEFAULT_API_BASE_URL
): Promise<ProvenanceResponse> {
  const res = await fetch(`${baseUrl}/provenance`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Provenance fetch failed (${res.status})`);
  return (await res.json()) as ProvenanceResponse;
}

/**
 * Fetch generated export dossier from backend
 */
export async function fetchExportLive(
  missionId: string,
  baseUrl = DEFAULT_API_BASE_URL
): Promise<{ status: string; packet?: any; message?: string }> {
  const res = await fetch(`${baseUrl}/export/${encodeURIComponent(missionId)}`, {
    headers: {
      Accept: 'application/json',
      ...getAuthHeaders(),
    },
  });
  if (res.status === 423) {
    const errorData = await res.json().catch(() => ({}));
    return {
      status: 'EXPORT_LOCKED',
      message: errorData.detail?.message || 'Export locked pending required human decisions.',
    };
  }
  if (!res.ok) throw new Error(`Export fetch failed (${res.status})`);
  const data = await res.json();
  return { status: 'READY', packet: data };
}

export interface CollisionAlert {
  cdm_id: string;
  primary_norad: number;
  primary_name: string;
  secondary_norad: number;
  secondary_name: string;
  time_of_closest_approach: string;
  miss_distance_meters: number;
  radial_miss_meters: number;
  relative_speed_kms: number;
  collision_probability: number;
  alert_level: 'ADVISORY' | 'WARNING' | 'CRITICAL' | string;
  data_mode?: string;
  disclaimer?: string;
}

export interface CollisionAlertsResponse {
  mission_id: string;
  norad_cat_id: number;
  total_alerts: number;
  highest_severity: string;
  bands: {
    critical_sub_1km: number;
    advisory_1_to_5km: number;
    wide_above_5km: number;
  };
  alerts: CollisionAlert[];
  data_mode: string;
  disclaimer: string;
}

export interface PathwayPoint {
  step: number;
  time_offset_seconds: number;
  latitude: number;
  longitude: number;
  altitude_km: number;
}

export interface MissionPathwayResponse {
  mission_id: string;
  epoch: string;
  period_minutes: number;
  inclination_deg: number;
  altitude_km: number;
  pathway_points: PathwayPoint[];
  data_mode: string;
  disclaimer: string;
}

export interface DebrisDensityBand {
  altitude_km: number;
  debris_count: number;
  spatial_density: number;
  risk_tier: string;
}

export interface DebrisFluxAssessment {
  mission_altitude_km: number;
  cumulative_flux_impacts_per_m2: number;
  estimated_lifetime_impacts: number;
  collision_probability: number;
  shielding_adequate: boolean;
  source_model: string;
  disclaimer: string;
}

export interface DecayPathResponse {
  mission_id: string;
  initial_altitude_km: number;
  reentry_altitude_km: number;
  estimated_lifetime_years: number;
  model_status: string;
  decay_series: Array<{ year: number; altitude_km: number }>;
  data_mode: string;
  disclaimer: string;
}

export interface SpaceCreditIndexExplainResponse {
  mission_id: string;
  overall_score: number;
  rating_tier: string;
  isro_dfsm_aligned: boolean;
  fcc_5yr_aligned: boolean;
  summary: string;
  pillars: Array<{
    category: string;
    points_awarded: number;
    max_points: number;
    percentage: number;
    status: string;
    notes: string;
  }>;
  missing_pillars: string[];
  recommendations: string[];
  data_mode: string;
  disclaimer: string;
}

export interface CelesTrakGPResponse {
  norad_cat_id: number;
  object_name: string;
  epoch: string;
  format: string;
  inclination_deg?: number;
  eccentricity?: number;
  semi_major_axis_km?: number;
  perigee_km?: number;
  apogee_km?: number;
  period_minutes?: number;
  raw_data?: any;
  source_status: 'LIVE' | 'CACHED' | 'OUTAGE_FALLBACK' | 'SYNTHETIC' | string;
  provenance: string;
  badge: string;
  source: string;
  cached_at?: string;
  expires_at?: string;
  cache_age_seconds?: number;
  circuit_breaker_active: boolean;
  disclaimer: string;
  error?: string;
}

/**
 * Fetch proximity screening collision alerts for mission's operational altitude
 */
export async function fetchCollisionAlertsLive(
  missionId: string,
  baseUrl = DEFAULT_API_BASE_URL
): Promise<CollisionAlertsResponse> {
  const res = await fetch(`${baseUrl}/missions/${encodeURIComponent(missionId)}/collision-alerts`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Collision alerts fetch failed (${res.status})`);
  return (await res.json()) as CollisionAlertsResponse;
}

/**
 * Fetch Keplerian sub-satellite pathway waypoints for mission
 */
export async function fetchMissionPathwayLive(
  missionId: string,
  baseUrl = DEFAULT_API_BASE_URL
): Promise<MissionPathwayResponse> {
  const res = await fetch(`${baseUrl}/missions/${encodeURIComponent(missionId)}/pathway`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Pathway fetch failed (${res.status})`);
  return (await res.json()) as MissionPathwayResponse;
}

/**
 * Fetch LEO spatial debris density distribution from NASA SPARK model
 */
export async function fetchDebrisDensityLive(
  baseUrl = DEFAULT_API_BASE_URL
): Promise<DebrisDensityBand[]> {
  const res = await fetch(`${baseUrl}/integrations/nasa-spark/debris-density`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Debris density fetch failed (${res.status})`);
  return (await res.json()) as DebrisDensityBand[];
}

/**
 * Assess cumulative orbital debris flux against NASA SPARK models
 */
export async function fetchDebrisFluxLive(
  altitudeKm = 500.0,
  areaM2 = 0.03,
  lifetimeYears = 3.8,
  baseUrl = DEFAULT_API_BASE_URL
): Promise<DebrisFluxAssessment> {
  const params = new URLSearchParams({
    altitude_km: String(altitudeKm),
    area_m2: String(areaM2),
    lifetime_years: String(lifetimeYears),
  });
  const res = await fetch(`${baseUrl}/integrations/nasa-spark/assess-flux?${params}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Debris flux fetch failed (${res.status})`);
  return (await res.json()) as DebrisFluxAssessment;
}

/**
 * Fetch schematic atmospheric decay trajectory curve
 */
export async function fetchDecayPathLive(
  missionId: string,
  baseUrl = DEFAULT_API_BASE_URL
): Promise<DecayPathResponse> {
  const res = await fetch(`${baseUrl}/missions/${encodeURIComponent(missionId)}/decay-path`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Decay path fetch failed (${res.status})`);
  return (await res.json()) as DecayPathResponse;
}

/**
 * Fetch explainability breakdown for Space Credit Index
 */
export async function fetchSpaceCreditIndexExplainLive(
  missionId: string,
  baseUrl = DEFAULT_API_BASE_URL
): Promise<SpaceCreditIndexExplainResponse> {
  const res = await fetch(`${baseUrl}/missions/${encodeURIComponent(missionId)}/space-credit-index/explain`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Space credit index breakdown failed (${res.status})`);
  return (await res.json()) as SpaceCreditIndexExplainResponse;
}

/**
 * Fetch CelesTrak GP element set with 2-hour policy caching
 */
export async function fetchCelesTrakGPLive(
  noradId = 25544,
  format = 'JSON',
  forceRefresh = false,
  baseUrl = DEFAULT_API_BASE_URL
): Promise<CelesTrakGPResponse> {
  const params = new URLSearchParams({
    format,
    force_refresh: String(forceRefresh),
  });
  const res = await fetch(`${baseUrl}/integrations/celestrak/gp/${noradId}?${params}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`CelesTrak fetch failed (${res.status})`);
  return (await res.json()) as CelesTrakGPResponse;
}

/**
 * Fetch draft NASA ODAR markdown report from backend
 */
export async function fetchOdarReportLive(
  missionId: string,
  baseUrl = DEFAULT_API_BASE_URL
): Promise<string> {
  const res = await fetch(`${baseUrl}/missions/${encodeURIComponent(missionId)}/export/odar`, {
    headers: { Accept: 'text/markdown, text/html, */*' },
  });
  if (res.status === 423) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail?.message || 'ODAR export locked: complete human review first.');
  }
  if (!res.ok) throw new Error(`ODAR export failed (${res.status})`);
  return await res.text();
}

/**
 * Fetch draft ISRO DFSM / FCC EOMP markdown report from backend
 */
export async function fetchEompPlanLive(
  missionId: string,
  baseUrl = DEFAULT_API_BASE_URL
): Promise<string> {
  const res = await fetch(`${baseUrl}/missions/${encodeURIComponent(missionId)}/export/eomp`, {
    headers: { Accept: 'text/markdown, text/html, */*' },
  });
  if (res.status === 423) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail?.message || 'EOMP export locked: complete human review first.');
  }
  if (!res.ok) throw new Error(`EOMP export failed (${res.status})`);
  return await res.text();
}

/**
 * Run offline research CDM risk forecast
 */
export async function runCdmForecastLive(
  payload: {
    event_id: string;
    time_to_tca_days: number;
    miss_distance_m: number;
    relative_speed_m_s: number;
    latest_early_risk: number;
  },
  baseUrl = DEFAULT_API_BASE_URL
): Promise<any> {
  const res = await fetch(`${baseUrl}/research/cdm-forecast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`CDM forecast request failed (${res.status})`);
  return await res.json();
}

/**
 * Register a new mission profile in backend SQLite
 */
export async function createMissionLive(
  mission: {
    mission_id: string;
    name: string;
    fields?: Array<{ field: string; value: any; human_confirmed?: boolean }>;
    artifacts?: any[];
  },
  baseUrl = DEFAULT_API_BASE_URL
): Promise<any> {
  const res = await fetch(`${baseUrl}/missions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Reviewer-Key': 'dev-reviewer-key',
    },
    body: JSON.stringify(mission),
  });
  if (!res.ok) throw new Error(`Create mission failed (${res.status})`);
  return await res.json();
}

