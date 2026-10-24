/**
 * OrbitScore Domain Types
 * Strict domain models for evidence registration, deterministic checking engine,
 * human review decisions, and cited export dossiers.
 */

export type EvidenceState =
  | 'confirmed'
  | 'unconfirmed'
  | 'missing'
  | 'conflicting'
  | 'out-of-scope'
  | 'out_of_scope'
  | 'stale';

export type MissionObjectType =
  | 'cubesat'
  | 'smallsat'
  | 'payload'
  | 'other';

export interface ConflictingValueRecord {
  value: number | string | boolean;
  source: string;
  ref: string;
}

export interface EvidenceItem {
  id: string;
  mission_id: string;
  parameter_key: string;
  label: string;
  category:
    | 'mass_properties'
    | 'envelope'
    | 'orbit_lifetime'
    | 'electrical'
    | 'rf_licensing'
    | 'thermal'
    | 'deployment'
    | 'general';
  value: number | string | boolean | null;
  unit?: string;
  value_type: 'numeric' | 'string' | 'boolean';
  source_doc_title: string;
  source_doc_ref: string;
  source_doc_date: string; // ISO date string e.g. '2024-03-15'
  page_number?: number;
  paragraph?: string;
  locator?: string;
  state: EvidenceState;
  conflicting_values?: ConflictingValueRecord[];
  notes?: string;
  human_confirmed_by?: string;
  human_confirmed_at?: string;
}

export interface Mission {
  id: string;
  name: string;
  object_type: MissionObjectType;
  form_factor: string; // e.g. '3U', '6U', 'ESPA', 'Other'
  target_orbit: string;
  mass_budget_kg: number;
  baseline_threshold_date: string; // ISO date string for staleness comparison
  created_at: string;
  updated_at: string;
}

export type FindingOutcome =
  | 'documented'
  | 'needs_attention_missing'
  | 'needs_attention_conflicting'
  | 'needs_attention_unconfirmed'
  | 'out_of_profile_scope';

export type FindingSeverity = 'info' | 'advisory' | 'action_required';

export interface Finding {
  id: string;
  check_id: string;
  check_title: string;
  outcome: FindingOutcome;
  severity: FindingSeverity;
  summary: string;
  details: string;
  affected_evidence_keys: string[];
  recommendation: string;
}

export interface CheckDef {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: FindingSeverity;
  requires_human_signoff: boolean;
}

export interface ProfileApplicability {
  object_types: MissionObjectType[];
  form_factors: string[];
}

export interface Profile {
  id: string;
  name: string;
  version: string;
  title: string;
  description: string;
  applicability: ProfileApplicability;
  checks: CheckDef[];
}

export interface CheckRun {
  id: string;
  profile_id: string;
  profile_version: string;
  executed_at: string;
  is_applicable: boolean;
  inapplicability_reason?: string;
  input_snapshot_hash: string;
  evidence_snapshot: EvidenceItem[];
  findings: Finding[];
}

export type ReviewDecisionType =
  | 'accepted_for_packet'
  | 'needs_more_evidence'
  | 'disputed'
  | 'deferred_to_specialist'
  | 'noted_no_action'
  | 'accepted_as_is'
  | 'mitigation_filed'
  | 'waiver_granted'
  | 'action_pending';

export interface ReviewDecision {
  id: string;
  finding_id: string;
  decision: ReviewDecisionType;
  rationale: string;
  reviewer_name: string;
  reviewer_role: string;
  recorded_at: string;
}

export type OpenIssueStatus = 'open' | 'addressed';

export interface OpenIssue {
  id: string;
  finding_id: string;
  title: string;
  assigned_to: string;
  due_date: string;
  status: OpenIssueStatus;
}

export interface ExportPacketMetadata {
  app_version: string;
  export_id: string;
  export_engine: string;
}

export interface ExportPacket {
  schema_version: string;
  exported_at: string;
  metadata: ExportPacketMetadata;
  mission: Mission;
  profile: {
    id: string;
    version: string;
    title: string;
  };
  check_run: CheckRun;
  decisions: ReviewDecision[];
  open_issues: OpenIssue[];
  disclaimers: string[];
}
