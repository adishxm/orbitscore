export const EVIDENCE_STATES = [
  "PASS_UNDER_PROFILE",
  "WARNING",
  "NEEDS_EVIDENCE",
  "CONFLICT",
  "NOT_EVALUATED",
] as const;
export type EvidenceState = (typeof EVIDENCE_STATES)[number];

export const REVIEW_DECISIONS = ["APPROVED", "REJECTED", "WAIVED_WITH_NOTE"] as const;
export type ReviewDecisionType = (typeof REVIEW_DECISIONS)[number];

export type Scalar = string | number | boolean | null;
export type JsonValue = Scalar | JsonValue[] | { [key: string]: JsonValue };

export interface SourceCitation {
  document: string;
  clause: string;
  url?: string;
  published_date?: string;
  interpretation_type: "DIRECT" | "INSPIRED" | "INTERNAL" | "SYNTHETIC";
}

export interface MissionProfile {
  mission_id: string;
  name: string;
  operator?: string;
  mission_type?: string;
  selected_profile_id: string;
  fields: ExtractedField[];
  artifact_ids: string[];
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, JsonValue>;
}

export interface EvidenceArtifact {
  artifact_id: string;
  mission_id: string;
  filename: string;
  media_type: string;
  sha256?: string;
  source_uri?: string;
  uploaded_at: string;
  page_count?: number;
  locators?: Array<{ page?: number; span?: string; section?: string; quote?: string }>;
  extraction_status?: "PENDING" | "EXTRACTED" | "FAILED";
  metadata?: Record<string, JsonValue>;
}

export interface ExtractedField {
  field_id: string;
  label?: string;
  value: Scalar | Scalar[];
  unit?: string;
  source_artifact_id?: string;
  source_locator?: { page?: number; span?: string; section?: string; quote?: string };
  human_confirmed: boolean;
  evidence_state?: EvidenceState;
  confidence?: number;
  candidate_values?: Array<{ value: Scalar; source_artifact_id?: string; locator?: string }>;
  conflict?: boolean;
  updated_at?: string;
}

export type EvaluationOperator = "<" | "<=" | ">" | ">=" | "==" | "!=" | "IN" | "BETWEEN" | "EXISTS";

export interface EvaluationLogic {
  field: string;
  operator: EvaluationOperator;
  threshold?: number | string | boolean | JsonValue[];
  upper_threshold?: number;
  unit?: string;
  pass_state?: EvidenceState;
  fail_state?: EvidenceState;
}

export interface RuleVersion {
  version: string;
  effective_date?: string;
  supersedes?: string;
  status?: "ACTIVE" | "RETIRED" | "DRAFT";
}

export interface Rule {
  rule_id: string;
  version: string;
  profile_id: string;
  title: string;
  description?: string;
  jurisdiction_scope: string;
  source_citation: SourceCitation;
  required_fields: string[];
  scope_condition?: string | Record<string, JsonValue>;
  evaluation_logic: EvaluationLogic;
  require_confirmed_evidence: boolean;
  critical_gap: boolean;
  remediation_lever: string;
  limitation_notice: string;
  rule_version?: RuleVersion;
}

export interface Finding {
  finding_id: string;
  mission_id: string;
  profile_id: string;
  rule_id: string;
  rule_version: string;
  title: string;
  status: EvidenceState;
  critical_gap: boolean;
  required_fields: string[];
  observed_value?: Scalar | Scalar[];
  observed_unit?: string;
  threshold?: number | string | boolean | JsonValue[];
  remediation_lever: string;
  limitation_notice: string;
  source_citation: SourceCitation;
  evaluated_at: string;
  rationale: string;
}

export interface CounterfactualSuggestion {
  counterfactual_id: string;
  mission_id: string;
  profile_id: string;
  lever: string;
  field_id: string;
  current_value: Scalar;
  proposed_value: Scalar;
  affected_finding_ids: string[];
  before_statuses: EvidenceState[];
  after_statuses: EvidenceState[];
  bounded: boolean;
  created_at: string;
}

export interface ReviewDecision {
  review_id: string;
  mission_id: string;
  finding_id: string;
  decision: ReviewDecisionType;
  note?: string;
  reviewer: string;
  decided_at: string;
}

export interface ProvenanceEvent {
  sequence: number;
  event_id: string;
  event_type: string;
  mission_id?: string;
  payload: Record<string, JsonValue>;
  created_at: string;
  previous_hash: string;
  hash: string;
}

export interface RuleCatalog {
  profiles: Array<{ profile_id: string; name?: string; description?: string; rules: Rule[] }>;
}

export interface ExportPacket {
  status: "READY";
  mission: MissionProfile;
  profile_id: string;
  findings: Finding[];
  reviews: ReviewDecision[];
  provenance: ProvenanceEvent[];
  generated_at: string;
}

export interface ExportLocked {
  status: "EXPORT_LOCKED";
  missing_finding_ids: string[];
  message: string;
}

export interface VerificationResult {
  valid: boolean;
  checked_events: number;
  sequence?: number;
  reason?: string;
}

export function isEvidenceState(value: unknown): value is EvidenceState {
  return typeof value === "string" && (EVIDENCE_STATES as readonly string[]).includes(value);
}
export function isReviewDecision(value: unknown): value is ReviewDecisionType {
  return typeof value === "string" && (REVIEW_DECISIONS as readonly string[]).includes(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isScalar(value: unknown): value is Scalar {
  return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

export function isSourceCitation(value: unknown): value is SourceCitation {
  if (!isObject(value)) return false;
  return typeof value.document === "string" && typeof value.clause === "string" &&
    ["DIRECT", "INSPIRED", "INTERNAL", "SYNTHETIC"].includes(String(value.interpretation_type));
}
export function isMissionProfile(value: unknown): value is MissionProfile {
  return isObject(value) && typeof value.mission_id === "string" && typeof value.name === "string" &&
    typeof value.selected_profile_id === "string" && Array.isArray(value.fields) && value.fields.every(isExtractedField) &&
    Array.isArray(value.artifact_ids) && value.artifact_ids.every((item) => typeof item === "string");
}
export function isEvidenceArtifact(value: unknown): value is EvidenceArtifact {
  return isObject(value) && typeof value.artifact_id === "string" && typeof value.mission_id === "string" &&
    typeof value.filename === "string" && typeof value.media_type === "string" && typeof value.uploaded_at === "string";
}
export function isExtractedField(value: unknown): value is ExtractedField {
  if (!isObject(value)) return false;
  return typeof value.field_id === "string" && isScalar(value.value) && typeof value.human_confirmed === "boolean";
}
export function isRuleVersion(value: unknown): value is RuleVersion {
  return isObject(value) && typeof value.version === "string" &&
    (value.status === undefined || ["ACTIVE", "RETIRED", "DRAFT"].includes(String(value.status)));
}
export function isRule(value: unknown): value is Rule {
  if (!isObject(value)) return false;
  const logic = value.evaluation_logic;
  return typeof value.rule_id === "string" && typeof value.version === "string" &&
    typeof value.profile_id === "string" && typeof value.title === "string" &&
    Array.isArray(value.required_fields) && isSourceCitation(value.source_citation) && isObject(logic) &&
    typeof logic.field === "string" && typeof logic.operator === "string" && typeof value.require_confirmed_evidence === "boolean" &&
    typeof value.critical_gap === "boolean" && typeof value.remediation_lever === "string" && typeof value.limitation_notice === "string";
}
export function isFinding(value: unknown): value is Finding {
  return isObject(value) && typeof value.finding_id === "string" && typeof value.mission_id === "string" &&
    typeof value.rule_id === "string" && isEvidenceState(value.status);
}
export function isReviewDecisionEntity(value: unknown): value is ReviewDecision {
  return isObject(value) && typeof value.review_id === "string" && typeof value.finding_id === "string" &&
    isReviewDecision(value.decision) && typeof value.reviewer === "string";
}
export function isCounterfactualSuggestion(value: unknown): value is CounterfactualSuggestion {
  return isObject(value) && typeof value.counterfactual_id === "string" && typeof value.mission_id === "string" &&
    typeof value.profile_id === "string" && typeof value.lever === "string" && typeof value.field_id === "string" &&
    Array.isArray(value.affected_finding_ids) && Array.isArray(value.before_statuses) && Array.isArray(value.after_statuses) &&
    typeof value.bounded === "boolean" && typeof value.created_at === "string";
}
export function isProvenanceEvent(value: unknown): value is ProvenanceEvent {
  return isObject(value) && typeof value.sequence === "number" && typeof value.event_id === "string" &&
    typeof value.event_type === "string" && isObject(value.payload) && typeof value.created_at === "string" &&
    typeof value.previous_hash === "string" && typeof value.hash === "string";
}
export function assertDomain<T>(value: unknown, guard: (input: unknown) => input is T, name: string): asserts value is T {
  if (!guard(value)) throw new Error(`Invalid ${name}`);
}
