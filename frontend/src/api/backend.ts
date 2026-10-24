/**
 * OrbitScore Live FastAPI Backend Client
 * Connects to the local/remote OrbitScore FastAPI server (default: http://127.0.0.1:8000).
 * Provides dual-mode capability: live server evaluation and provenance verification,
 * with safe offline fallback to the local deterministic check engine.
 */

export const DEFAULT_API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

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
    headers: { Accept: 'application/json' },
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
