/**
 * OrbitScore Agent37 Integration Client
 * Provides API communication with the Agent37 sandbox infrastructure.
 * Includes candidate evidence triage, copilot conversational assistance, and status monitoring.
 */

import { DEFAULT_API_BASE_URL } from './backend';

export interface Agent37Candidate {
  field: string;
  value: any;
  unit?: string | null;
  exact_quote: string;
  source_identifier: string;
  uncertainty: number;
  confidence_tier: 'HIGH' | 'MEDIUM' | 'LOW';
  human_confirmed: boolean; // Must always be false until reviewed
}

export interface Agent37TriageResponse {
  status: 'SUCCESS' | 'FALLBACK_PARSED' | 'DISABLED' | 'ERROR';
  provider: string;
  model_template: string;
  request_time: string;
  source_hash: string;
  candidates: Agent37Candidate[];
  session_id?: string | null;
  agent_id?: string | null;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cost_usd?: number;
  } | null;
  disclaimer: string;
  message?: string | null;
}

export interface Agent37ChatResponse {
  status: 'SUCCESS' | 'FALLBACK' | 'ERROR';
  agent: string;
  response: string;
  session_id?: string | null;
  request_id?: string | null;
  timestamp: string;
  disclaimer: string;
}

export interface Agent37StatusResponse {
  enabled: boolean;
  configured: boolean;
  instance_id: string;
  instance_url: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'UNCONFIGURED';
  agent_name: string;
  latency_ms?: number | null;
  detail?: string | null;
}

/**
 * Triage an uploaded excerpt or telemetry document section via Agent37.
 */
export async function triageExcerptWithAgent37(
  excerpt: string,
  sourceIdentifier: string = 'user_upload_spec',
  missionId?: string,
  baseUrl: string = DEFAULT_API_BASE_URL
): Promise<Agent37TriageResponse> {
  try {
    const res = await fetch(`${baseUrl}/integrations/agent37/triage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        excerpt,
        source_identifier: sourceIdentifier,
        mission_id: missionId,
      }),
    });

    if (!res.ok) {
      throw new Error(`Agent37 triage request failed: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    // Graceful client fallback: local deterministic candidate parser
    return parseCandidatesLocally(excerpt, sourceIdentifier, err);
  }
}

/**
 * Send a query to the Agent37 Mission Copilot.
 */
export async function chatWithAgent37(
  message: string,
  sessionId?: string | null,
  missionId?: string,
  baseUrl: string = DEFAULT_API_BASE_URL
): Promise<Agent37ChatResponse> {
  try {
    const res = await fetch(`${baseUrl}/integrations/agent37/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        session_id: sessionId || undefined,
        mission_id: missionId,
      }),
    });

    if (!res.ok) {
      throw new Error(`Agent37 chat request failed: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    return {
      status: 'FALLBACK',
      agent: 'orbitscore_client_fallback',
      response: `[Local Fallback] Agent37 server query failed (${(err as Error).message}). OrbitScore guidelines mandate human review for all orbital safety claims (NASA-STD-8719.14 & FCC 2022).`,
      timestamp: new Date().toISOString(),
      disclaimer: 'Agent37 assistance only. Not an official compliance determination.',
    };
  }
}

/**
 * Check live status of the Agent37 sandbox instance.
 */
export async function getAgent37Status(
  baseUrl: string = DEFAULT_API_BASE_URL
): Promise<Agent37StatusResponse> {
  try {
    const res = await fetch(`${baseUrl}/integrations/agent37/status`);
    if (!res.ok) {
      throw new Error(`Status probe failed: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    return {
      enabled: true,
      configured: true,
      instance_id: 'z2dhn46l7d',
      instance_url: 'https://z2dhn46l7d.agent37.app',
      status: 'OFFLINE',
      agent_name: 'hermes',
      detail: (err as Error).message,
    };
  }
}

/**
 * Pure deterministic fallback extraction when backend is unreachable.
 */
function parseCandidatesLocally(
  excerpt: string,
  sourceId: string,
  _errorCause: any
): Agent37TriageResponse {
  const candidates: Agent37Candidate[] = [];

  // Disposal duration
  const dispMatch = excerpt.match(/(?:disposal|re-?entry|de-?orbit)\s+(?:within|time|duration|period)?\s*(?:of)?\s*([0-9]+(?:\.[0-9]+)?)\s*(years?|yr)/i);
  if (dispMatch && dispMatch[1]) {
    candidates.push({
      field: 'disposal_duration_years',
      value: parseFloat(dispMatch[1]),
      unit: 'years',
      exact_quote: dispMatch[0],
      source_identifier: sourceId,
      uncertainty: 0.05,
      confidence_tier: 'HIGH',
      human_confirmed: false,
    });
  }

  // Mass
  const massMatch = excerpt.match(/(?:dry\s+mass|wet\s+mass|spacecraft\s+mass|launch\s+mass|mass)\s*(?:of|is|:)?\s*([0-9]+(?:\.[0-9]+)?)\s*(kg|kilograms?)/i);
  if (massMatch && massMatch[1]) {
    candidates.push({
      field: 'wet_mass_kg',
      value: parseFloat(massMatch[1]),
      unit: 'kg',
      exact_quote: massMatch[0],
      source_identifier: sourceId,
      uncertainty: 0.1,
      confidence_tier: 'HIGH',
      human_confirmed: false,
    });
  }

  // Altitude
  const altMatch = excerpt.match(/(?:perigee|apogee|altitude|orbit)\s*(?:is|of|:)?\s*([0-9]+(?:\.[0-9]+)?)\s*(km|kilometers?)/i);
  if (altMatch && altMatch[1]) {
    candidates.push({
      field: 'perigee_altitude_km',
      value: parseFloat(altMatch[1]),
      unit: 'km',
      exact_quote: altMatch[0],
      source_identifier: sourceId,
      uncertainty: 0.15,
      confidence_tier: 'MEDIUM',
      human_confirmed: false,
    });
  }

  return {
    status: 'FALLBACK_PARSED',
    provider: 'agent37_local_deterministic',
    model_template: 'spacecraft-evidence-triage-v1',
    request_time: new Date().toISOString(),
    source_hash: 'local_hash_' + Math.random().toString(36).substring(7),
    candidates,
    disclaimer: 'Agent37 candidate extraction only. Requires independent human engineering confirmation.',
    message: 'Parsed via deterministic client fallback.',
  };
}
