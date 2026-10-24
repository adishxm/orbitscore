import {
  type CounterfactualSuggestion, type EvidenceArtifact, type EvidenceState, type EvaluationLogic,
  type ExtractedField, type Finding, type JsonValue, type MissionProfile, type ProvenanceEvent,
  type ReviewDecision, type ReviewDecisionType, type Rule, type RuleCatalog, type SourceCitation,
  type ExportPacket, type ExportLocked, type VerificationResult,
} from "./schemas";
import { sha256 as nobleSha256 } from "@noble/hashes/sha256";

export const STORAGE_KEY = "orbitscore.frontend.state.v1";
export const DEFAULT_MISSION_ID = "mission_complete";

interface PersistedState {
  missions: Record<string, MissionProfile>;
  artifacts: Record<string, EvidenceArtifact>;
  findings: Record<string, Finding>;
  reviews: Record<string, ReviewDecision>;
  counterfactuals: Record<string, CounterfactualSuggestion>;
  provenance: ProvenanceEvent[];
}

const memoryStorage = new Map<string, string>();
if (typeof globalThis.localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", { value: {
    getItem: (key: string) => memoryStorage.get(key) ?? null,
    setItem: (key: string, value: string) => void memoryStorage.set(key, value),
    removeItem: (key: string) => void memoryStorage.delete(key),
  }, configurable: true });
}
const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

const citation = (document: string, clause: string, interpretation_type: SourceCitation["interpretation_type"] = "INSPIRED"): SourceCitation => ({
  document, clause, interpretation_type, published_date: "2024-01-01",
});
const fallbackRule = (profile_id: string, rule_id: string, title: string, threshold: number, critical_gap = true): Rule => ({
  rule_id, version: "1.0.0", profile_id, title, jurisdiction_scope: "Synthetic mission assessment scope",
  source_citation: citation(profile_id, rule_id), required_fields: ["disposal_lifetime_years"],
  scope_condition: undefined,
  evaluation_logic: { field: "disposal_lifetime_years", operator: "<=", threshold, unit: "years" },
  require_confirmed_evidence: true, critical_gap, remediation_lever: "Reduce post-mission disposal lifetime or add a compliant disposal mechanism.",
  limitation_notice: "Synthetic deterministic rule used for engineering review; it is not legal certification.",
});
const fallbackCatalog: RuleCatalog = {
  profiles: [
    { profile_id: "india-dfsm-inspired", name: "India DFSM-inspired", description: "ISRO debris-free mission inspired checks", rules: [
      fallbackRule("india-dfsm-inspired", "IN-DFSM-PMD-5Y", "Post-mission disposal lifetime", 5),
      { ...fallbackRule("india-dfsm-inspired", "IN-DFSM-PASSIVATION", "Passivation evidence", 1), evaluation_logic: { field: "passivation_complete", operator: "==", threshold: true, unit: "boolean" }, required_fields: ["passivation_complete"] },
    ] },
    { profile_id: "nasa-std-8719-14c-inspired", name: "NASA-STD-8719.14C-inspired", description: "NASA debris assessment inspired checks", rules: [
      fallbackRule("nasa-std-8719-14c-inspired", "NASA-4.6-PMD-25Y", "Post-mission disposal lifetime", 25),
      { ...fallbackRule("nasa-std-8719-14c-inspired", "NASA-4.4-2-PASSIVATION", "Post-mission passivation", 1), evaluation_logic: { field: "passivation_complete", operator: "==", threshold: true, unit: "boolean" }, required_fields: ["passivation_complete"] },
    ] },
    { profile_id: "fcc-22-74-inspired", name: "FCC 22-74-inspired", description: "Scoped covered LEO station checks", rules: [
      { ...fallbackRule("fcc-22-74-inspired", "FCC-22-74-5Y", "Covered LEO post-mission disposal lifetime", 5), scope_condition: { field: "orbit_altitude_km", operator: "<", threshold: 2000 },
        limitation_notice: "Only applies to covered LEO space stations below 2,000 km using uncontrolled atmospheric reentry." },
      { ...fallbackRule("fcc-22-74-inspired", "FCC-22-74-TRACKABILITY", "Trackability disclosure", 1), evaluation_logic: { field: "trackability_disclosed", operator: "==", threshold: true, unit: "boolean" }, required_fields: ["trackability_disclosed"] },
    ] },
    { profile_id: "internal-pre-review", name: "Internal pre-review", description: "Student/smallsat design review checklist", rules: [
      fallbackRule("internal-pre-review", "INTERNAL-PMD-5Y", "Design review disposal target", 5),
      { ...fallbackRule("internal-pre-review", "INTERNAL-EVIDENCE", "Evidence package completeness", 1), evaluation_logic: { field: "evidence_package_complete", operator: "==", threshold: true, unit: "boolean" }, required_fields: ["evidence_package_complete"] },
    ] },
  ],
};

// vite.config.ts injects the real ../fixtures/rules_profiles.json into this symbol. The
// fallback keeps frontend-service independently testable before the backend fixture lands.
declare const __ORBIT_RULES_PROFILES__: unknown;
function injectedRules(): unknown {
  try { return typeof __ORBIT_RULES_PROFILES__ !== "undefined" ? __ORBIT_RULES_PROFILES__ : undefined; } catch { return undefined; }
}
function asRule(raw: any, profileId: string): Rule | null {
  if (!raw || typeof raw !== "object") return null;
  const logic = raw.evaluation_logic ?? {};
  const source = raw.source_citation ?? citation(String(raw.document ?? profileId), String(raw.clause ?? raw.rule_id ?? "unknown"), "INSPIRED");
  if (!raw.rule_id || !logic.field || !logic.operator) return null;
  return {
    rule_id: String(raw.rule_id), version: String(raw.version ?? "1.0.0"), profile_id: String(raw.profile_id ?? profileId),
    title: String(raw.title ?? raw.rule_id), description: raw.description ? String(raw.description) : undefined,
    jurisdiction_scope: String(raw.jurisdiction_scope ?? "Unspecified"), source_citation: source,
    required_fields: Array.isArray(raw.required_fields) ? raw.required_fields.map(String) : [String(logic.field)],
    scope_condition: raw.scope_condition, evaluation_logic: logic as EvaluationLogic,
    require_confirmed_evidence: Boolean(raw.require_confirmed_evidence), critical_gap: Boolean(raw.critical_gap),
    remediation_lever: String(raw.remediation_lever ?? "Collect evidence and remediate the finding."),
    limitation_notice: String(raw.limitation_notice ?? "Interpretation is limited to this deterministic review."),
    rule_version: raw.rule_version,
  };
}
function normalizeCatalog(raw: unknown): RuleCatalog {
  if (!raw) return fallbackCatalog;
  const root: any = raw;
  const rawProfiles = Array.isArray(root) ? root : (Array.isArray(root.profiles) ? root.profiles : []);
  const profiles = rawProfiles.map((p: any) => {
    const profileId = String(p.profile_id ?? p.id ?? "unknown-profile");
    const rawRules = Array.isArray(p.rules) ? p.rules : (Array.isArray(p.rule_catalog) ? p.rule_catalog : []);
    return { profile_id: profileId, name: p.name ? String(p.name) : undefined, description: p.description ? String(p.description) : undefined,
      rules: rawRules.map((r: any) => asRule(r, profileId)).filter(Boolean) as Rule[] };
  }).filter((p: { rules: Rule[] }) => p.rules.length > 0);
  return profiles.length ? { profiles } : fallbackCatalog;
}
export function getRuleCatalog(): RuleCatalog {
  return normalizeCatalog(injectedRules());
}
export function getProfiles() { return getRuleCatalog().profiles.map(({ rules: _rules, ...profile }) => profile); }

function getStorage(): { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void } {
  try {
    if (typeof globalThis.localStorage !== "undefined") {
      const probe = "__orbitscore_probe__"; globalThis.localStorage.setItem(probe, "1"); globalThis.localStorage.removeItem(probe); return globalThis.localStorage;
    }
  } catch { /* private browsing / Node */ }
  return { getItem: (k) => memoryStorage.get(k) ?? null, setItem: (k, v) => void memoryStorage.set(k, v), removeItem: (k) => void memoryStorage.delete(k) };
}
const blankState = (): PersistedState => ({ missions: {}, artifacts: {}, findings: {}, reviews: {}, counterfactuals: {}, provenance: [] });
function seedMission(missionId = DEFAULT_MISSION_ID): MissionProfile {
  const fields: ExtractedField[] = [
    { field_id: "disposal_lifetime_years", label: "Post-mission disposal lifetime", value: 8.4, unit: "years", human_confirmed: true, evidence_state: "PASS_UNDER_PROFILE", source_locator: { page: 2, span: "§4.2" } },
    { field_id: "orbit_altitude_km", label: "Operating orbit altitude", value: 550, unit: "km", human_confirmed: true, evidence_state: "PASS_UNDER_PROFILE" },
    { field_id: "passivation_complete", label: "Passivation plan complete", value: true, unit: "boolean", human_confirmed: true, evidence_state: "PASS_UNDER_PROFILE" },
    { field_id: "trackability_disclosed", label: "Trackability disclosed", value: true, unit: "boolean", human_confirmed: true, evidence_state: "PASS_UNDER_PROFILE" },
    { field_id: "evidence_package_complete", label: "Evidence package complete", value: true, unit: "boolean", human_confirmed: true, evidence_state: "PASS_UNDER_PROFILE" },
  ];
  return { mission_id: missionId, name: "Asteria-3 Synthetic Mission", operator: "TwinForge", mission_type: "LEO smallsat", selected_profile_id: "nasa-std-8719-14c-inspired", fields, artifact_ids: [], created_at: now(), updated_at: now(), metadata: { synthetic: true } };
}
function readState(): PersistedState {
  const raw = getStorage().getItem(STORAGE_KEY);
  if (!raw) { const fresh = blankState(); const mission = seedMission(); fresh.missions[mission.mission_id] = mission; for (const alias of ["mission_complete", "mission_gap_heavy", "mission_conflict"]) fresh.missions[alias] = { ...mission, mission_id: alias }; saveState(fresh); return fresh; }
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return { ...blankState(), ...parsed, missions: parsed.missions ?? {}, artifacts: parsed.artifacts ?? {}, findings: parsed.findings ?? {}, reviews: parsed.reviews ?? {}, counterfactuals: parsed.counterfactuals ?? {}, provenance: parsed.provenance ?? [] };
  } catch { return blankState(); }
}
function saveState(state: PersistedState) { getStorage().setItem(STORAGE_KEY, JSON.stringify(state)); }
export function resetDemoState(): void { getStorage().removeItem(STORAGE_KEY); memoryStorage.delete(STORAGE_KEY); readState(); }
export function getStateSnapshot(): PersistedState { return structuredClone(readState()); }
export function listMissions(): MissionProfile[] { return Object.values(readState().missions); }
export function getMission(missionId = DEFAULT_MISSION_ID): MissionProfile { return readState().missions[missionId] ?? seedMission(missionId); }
function saveMission(mission: MissionProfile) { const state = readState(); state.missions[mission.mission_id] = { ...mission, updated_at: now() }; saveState(state); }
function fieldMap(mission: MissionProfile) { return new Map(mission.fields.map((field) => [field.field_id, field])); }
function scalar(value: unknown): value is string | number | boolean | null { return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean"; }
function compare(value: unknown, logic: EvaluationLogic): boolean {
  const threshold = logic.threshold;
  switch (logic.operator) {
    case "<": return Number(value) < Number(threshold);
    case "<=": return Number(value) <= Number(threshold);
    case ">": return Number(value) > Number(threshold);
    case ">=": return Number(value) >= Number(threshold);
    case "==": return value === threshold || String(value) === String(threshold);
    case "!=": return value !== threshold && String(value) !== String(threshold);
    case "IN": return Array.isArray(threshold) && threshold.includes(value as never);
    case "BETWEEN": return Number(value) >= Number(threshold) && Number(value) <= Number(logic.upper_threshold);
    case "EXISTS": return value !== undefined && value !== null && value !== "";
    default: return false;
  }
}
function scopeApplies(rule: Rule, fields: Map<string, ExtractedField>): boolean {
  if (!rule.scope_condition) return true;
  if (typeof rule.scope_condition === "string") return true; // descriptive scope is retained in the finding limitation.
  const condition: any = rule.scope_condition;
  if (!condition.field || !condition.operator) return true;
  const field = fields.get(String(condition.field));
  return Boolean(field && compare(field.value, { field: String(condition.field), operator: condition.operator, threshold: condition.threshold, upper_threshold: condition.upper_threshold }));
}
function statusFor(rule: Rule, fields: Map<string, ExtractedField>): { status: EvidenceState; field?: ExtractedField; rationale: string } {
  const target = fields.get(rule.evaluation_logic.field);
  const required = rule.required_fields.map((fieldId) => fields.get(fieldId));
  if (!scopeApplies(rule, fields)) return { status: "NOT_EVALUATED", rationale: "Rule scope condition is not satisfied by the mission inputs." };
  if (required.some((field) => field?.conflict || field?.evidence_state === "CONFLICT")) return { status: "CONFLICT", field: target, rationale: "Conflicting candidate values require human adjudication." };
  if (!target || (rule.require_confirmed_evidence && !target.human_confirmed) || target.value === null || target.value === undefined) return { status: "NEEDS_EVIDENCE", field: target, rationale: "A required field is absent or is not human-confirmed." };
  if (!scalar(target.value) && !Array.isArray(target.value)) return { status: "NEEDS_EVIDENCE", field: target, rationale: "The field value is not a supported scalar." };
  const passed = compare(target.value, rule.evaluation_logic);
  return { status: passed ? "PASS_UNDER_PROFILE" : "WARNING", field: target, rationale: passed ? "Confirmed evidence satisfies the selected profile rule." : "Confirmed evidence does not satisfy the selected profile threshold." };
}
export function evaluateMission(missionId = DEFAULT_MISSION_ID, profileId?: string): Finding[] {
  const state = readState(); const mission = state.missions[missionId] ?? seedMission(missionId);
  const selectedProfile = profileId ?? mission.selected_profile_id;
  const profile = getRuleCatalog().profiles.find((candidate) => candidate.profile_id === selectedProfile) ?? getRuleCatalog().profiles[0];
  if (!profile) return [];
  if (mission.selected_profile_id !== selectedProfile) { mission.selected_profile_id = selectedProfile; state.missions[missionId] = mission; }
  const fields = fieldMap(mission); const evaluatedAt = now();
  const findings = profile.rules.map((rule): Finding => {
    const result = statusFor(rule, fields);
    const key = `${missionId}:${selectedProfile}:${rule.rule_id}`;
    return { finding_id: key, mission_id: missionId, profile_id: selectedProfile, rule_id: rule.rule_id, rule_version: rule.version, title: rule.title,
      status: result.status, critical_gap: rule.critical_gap, required_fields: rule.required_fields, observed_value: result.field?.value, observed_unit: result.field?.unit,
      threshold: rule.evaluation_logic.threshold, remediation_lever: rule.remediation_lever, limitation_notice: rule.limitation_notice,
      source_citation: rule.source_citation, evaluated_at: evaluatedAt, rationale: result.rationale };
  });
  for (const finding of findings) state.findings[finding.finding_id] = finding;
  saveState(state); return findings;
}
export function getFindings(missionId = DEFAULT_MISSION_ID, profileId?: string): Finding[] { return evaluateMission(missionId, profileId); }
export function confirmField(missionId: string, fieldId: string, confirmed = true): ExtractedField {
  const mission = getMission(missionId); const field = fieldMap(mission).get(fieldId); if (!field) throw new Error(`FIELD_NOT_FOUND:${fieldId}`);
  field.human_confirmed = confirmed; field.updated_at = now(); if (confirmed && field.evidence_state === "NEEDS_EVIDENCE") field.evidence_state = undefined; saveMission(mission); appendProvenanceEvent("FIELD_CONFIRMED", missionId, { field_id: fieldId, human_confirmed: confirmed }); return field;
}
export function updateFieldValue(missionId: string, fieldId: string, value: ExtractedField["value"], unit?: string): ExtractedField {
  const mission = getMission(missionId); const field = fieldMap(mission).get(fieldId); if (!field) throw new Error(`FIELD_NOT_FOUND:${fieldId}`);
  field.value = value; if (unit) field.unit = unit; field.updated_at = now(); saveMission(mission); appendProvenanceEvent("FIELD_UPDATED", missionId, { field_id: fieldId, value: value as JsonValue }); return field;
}
export function uploadArtifact(missionId: string, artifact: Omit<EvidenceArtifact, "artifact_id" | "mission_id" | "uploaded_at"> & Partial<Pick<EvidenceArtifact, "artifact_id" | "mission_id" | "uploaded_at">>): EvidenceArtifact {
  const state = readState(); const mission = state.missions[missionId] ?? seedMission(missionId); const saved: EvidenceArtifact = { ...artifact, artifact_id: artifact.artifact_id ?? id("artifact"), mission_id: missionId, uploaded_at: artifact.uploaded_at ?? now() };
  state.artifacts[saved.artifact_id] = saved; mission.artifact_ids = [...new Set([...mission.artifact_ids, saved.artifact_id])]; state.missions[missionId] = mission; saveState(state); appendProvenanceEvent("ARTIFACT_UPLOADED", missionId, { artifact_id: saved.artifact_id, filename: saved.filename }); return saved;
}
function reviewComplete(findings: Finding[], state: PersistedState) { return findings.every((finding) => Object.values(state.reviews).some((review) => review.finding_id === finding.finding_id && ["APPROVED", "REJECTED", "WAIVED_WITH_NOTE"].includes(review.decision))); }
export function submitReviewDecision(missionId: string, findingId: string, decision: ReviewDecisionType, note = "", reviewer = "human-reviewer"): ReviewDecision {
  if (!["APPROVED", "REJECTED", "WAIVED_WITH_NOTE"].includes(decision)) throw new Error("INVALID_REVIEW_DECISION");
  const state = readState(); const review: ReviewDecision = { review_id: id("review"), mission_id: missionId, finding_id: findingId, decision, note: note || undefined, reviewer, decided_at: now() }; state.reviews[review.review_id] = review; saveState(state); appendProvenanceEvent("REVIEW_DECISION_SUBMITTED", missionId, { finding_id: findingId, decision, reviewer }); return review;
}
function toJson(value: unknown): JsonValue { if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value; if (Array.isArray(value)) return value.map(toJson); if (typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, toJson(v)])); return String(value); }
export function runCounterfactual(missionId: string, profileId: string, fieldId: string, proposedValue: ExtractedField["value"]): CounterfactualSuggestion;
export function runCounterfactual(missionId: string, request: { profile_id?: string; field_id: string; proposed_value: ExtractedField["value"] }): CounterfactualSuggestion;
export function runCounterfactual(missionId: string, profileOrRequest: string | { profile_id?: string; field_id: string; proposed_value: ExtractedField["value"] }, maybeField?: string, maybeValue?: ExtractedField["value"]): CounterfactualSuggestion {
  const profileId = typeof profileOrRequest === "string" ? profileOrRequest : (profileOrRequest.profile_id ?? getMission(missionId).selected_profile_id);
  const fieldId = typeof profileOrRequest === "string" ? maybeField! : profileOrRequest.field_id;
  const proposedValue = typeof profileOrRequest === "string" ? maybeValue! : profileOrRequest.proposed_value;
  const mission = getMission(missionId); const original = fieldMap(mission).get(fieldId); if (!original) throw new Error(`FIELD_NOT_FOUND:${fieldId}`);
  const before = evaluateMission(missionId, profileId); const simulated = { ...mission, fields: mission.fields.map((field) => field.field_id === fieldId ? { ...field, value: proposedValue, human_confirmed: true } : { ...field }) };
  const state = readState(); state.missions[`__counterfactual__${missionId}`] = simulated; saveState(state); const after = evaluateMission(`__counterfactual__${missionId}`, profileId); delete state.missions[`__counterfactual__${missionId}`]; for (const key of Object.keys(state.findings)) if (key.startsWith(`__counterfactual__${missionId}:`)) delete state.findings[key]; saveState(state);
  const suggestion: CounterfactualSuggestion = { counterfactual_id: id("cf"), mission_id: missionId, profile_id: profileId, lever: getRuleCatalog().profiles.flatMap((p) => p.rules).find((rule) => rule.evaluation_logic.field === fieldId)?.remediation_lever ?? "Change the field and re-evaluate.", field_id: fieldId, current_value: original.value as any, proposed_value: proposedValue as any, affected_finding_ids: before.map((finding) => finding.finding_id), before_statuses: before.map((finding) => finding.status), after_statuses: after.map((finding) => finding.status), bounded: true, created_at: now() };
  const finalState = readState(); finalState.counterfactuals[suggestion.counterfactual_id] = suggestion; saveState(finalState); appendProvenanceEvent("COUNTERFACTUAL_RUN", missionId, { counterfactual_id: suggestion.counterfactual_id, field_id: fieldId, proposed_value: toJson(proposedValue) }); return suggestion;
}

function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(",")}}`;
}
// Small synchronous SHA-256 implementation so browser, Node, and Vitest share the same chain.
function sha256(input: string): string {
  return Array.from(nobleSha256(new TextEncoder().encode(input)) as Uint8Array).map((byte: number) => byte.toString(16).padStart(2, "0")).join("");
  /*
  const words = [
    "428a2f98","71374491","b5c0fbcf","e9b5dba5","3956c25b","59f111f1","923f82a4","ab1c5ed5",
    "d807aa98","12835b01","243185be","550c7dc3","72be5d74","80deb1fe","9bdc06a7","c19bf174",
    "e49b69c1","efbe4786","0fc19dc6","240ca1cc","2de92c6f","4a7484aa","5cb0a9dc","76f988da",
    "983e5152","a831c66b","b00327c8","bf597fc7","c6e00bf3","d5a79147","06ca6351","14292967",
    "27b70a85","2e1b2138","4d2c6dfc","53380d13","650a7354","766a0abb","81c2c92e","92722c85",
    "a2bfe8a1","a81a664b","c24b8b70","c76c51a3","d192e819","d6990624","f40e3585","106aa070",
    "19a4c116","1e376c08","2748774c","34b0bcb5","391c0cb3","4ed8aa4a","5b9cca4f","682e6ff3",
    "748f82ee","78a5636f","84c87814","8cc70208","90befffa","a4506ceb","bef9a3f7","c67178f2",
  ].map((value) => BigInt(`0x${value}`));
  const mask = 0xffffffffn;
  const rotateRight = (value: bigint, amount: number) => ((value >> BigInt(amount)) | (value << BigInt(32 - amount))) & mask;
  const add = (...values: bigint[]) => values.reduce((sum, value) => (sum + value) & mask, 0n);
  const bytes = new TextEncoder().encode(input);
  const bitLength = BigInt(bytes.length) * 8n;
  const padded: number[] = Array.from(bytes);
  padded.push(0x80);
  while (padded.length % 64 !== 56) padded.push(0);
  for (let shift = 56n; shift >= 0n; shift -= 8n) padded.push(Number((bitLength >> shift) & 0xffn));
  let hash = ["6a09e667","bb67ae85","3c6ef372","a54ff53a","510e527f","9b05688c","1f83d9ab","5be0cd19"].map((value) => BigInt(`0x${value}`));
  for (let offset = 0; offset < padded.length; offset += 64) {
    const schedule: bigint[] = [];
    for (let index = 0; index < 16; index++) {
      const at = offset + index * 4;
      schedule[index] = BigInt((padded[at] << 24) | (padded[at + 1] << 16) | (padded[at + 2] << 8) | padded[at + 3]) & mask;
    }
    for (let index = 16; index < 64; index++) {
      const previous15 = schedule[index - 15];
      const previous2 = schedule[index - 2];
      const s0 = (rotateRight(previous15, 7) ^ rotateRight(previous15, 18) ^ (previous15 >> 3n)) & mask;
      const s1 = (rotateRight(previous2, 17) ^ rotateRight(previous2, 19) ^ (previous2 >> 10n)) & mask;
      schedule[index] = add(schedule[index - 16], s0, schedule[index - 7], s1);
    }
    let [a, b, c, d, e, f, g, h] = hash;
    for (let index = 0; index < 64; index++) {
      const s1 = (rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25)) & mask;
      const choice = ((e & f) ^ ((~e) & g)) & mask;
      const temp1 = add(h, s1, choice, words[index], schedule[index]);
      const s0 = (rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22)) & mask;
      const majority = ((a & b) ^ (a & c) ^ (b & c)) & mask;
      const temp2 = add(s0, majority);
      [h, g, f, e, d, c, b, a] = [g, f, e, add(d, temp1), c, b, a, add(temp1, temp2)];
    }
    hash = hash.map((value, index) => add(value, [a, b, c, d, e, f, g, h][index]));
  }
  return hash.map((value) => value.toString(16).padStart(8, "0")).join(""); */
}

function eventHash(event: Omit<ProvenanceEvent, "hash">) { return sha256(canonical(event)); }
export function appendProvenanceEvent(event_type: string, mission_id: string | undefined, payload: Record<string, JsonValue>): ProvenanceEvent {
  const state = readState(); const previous_hash = state.provenance.at(-1)?.hash ?? "GENESIS"; const event: Omit<ProvenanceEvent, "hash"> = { sequence: state.provenance.length + 1, event_id: id("evt"), event_type, mission_id, payload, created_at: now(), previous_hash }; const complete = { ...event, hash: eventHash(event) }; state.provenance.push(complete); saveState(state); return complete;
}
export function verifyProvenanceChain(): VerificationResult {
  const chain = readState().provenance; let previous = "GENESIS";
  for (let index=0; index<chain.length; index++) { const event = chain[index]; if (event.sequence !== index + 1 || event.previous_hash !== previous) return { valid: false, checked_events: index, sequence: event.sequence, reason: "SEQUENCE_OR_PREVIOUS_HASH_MISMATCH" }; const { hash, ...withoutHash } = event; if (eventHash(withoutHash) !== hash) return { valid: false, checked_events: index, sequence: event.sequence, reason: "HASH_MISMATCH" }; previous = hash; }
  return { valid: true, checked_events: chain.length };
}
export function exportPacket(missionId = DEFAULT_MISSION_ID): ExportPacket | ExportLocked {
  const mission = getMission(missionId); const findings = evaluateMission(missionId, mission.selected_profile_id); const state = readState(); const missing = findings.filter((finding) => !Object.values(state.reviews).some((review) => review.finding_id === finding.finding_id)).map((finding) => finding.finding_id);
  if (missing.length) return { status: "EXPORT_LOCKED", missing_finding_ids: missing, message: "Human Review Gate: every finding needs a persisted APPROVED, REJECTED, or WAIVED_WITH_NOTE decision." };
  return { status: "READY", mission, profile_id: mission.selected_profile_id, findings, reviews: Object.values(state.reviews).filter((review) => review.mission_id === missionId), provenance: state.provenance, generated_at: now() };
}
export const isExportReady = (result: ExportPacket | ExportLocked): result is ExportPacket => result.status === "READY";
export const __testing = { canonical, sha256, memoryStorage, reviewComplete };

export const DEFAULT_API_BASE_URL = typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL
  ? String((import.meta as any).env.VITE_API_BASE_URL)
  : "http://localhost:8000";

export function isMockModeConfigured(): boolean {
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_USE_MOCK !== undefined) {
    return (import.meta as any).env.VITE_USE_MOCK !== "false";
  }
  return true;
}

export function normalizeLiveMission(data: any): MissionProfile {
  return {
    mission_id: String(data.mission_id || "mission_complete"),
    name: String(data.name || data.mission_id || "Live Mission"),
    selected_profile_id: String(data.selected_profile_id || "nasa-std-8719-14c-inspired"),
    fields: (data.fields || []).map((f: any) => ({
      field_id: String(f.field_id || f.field || "unnamed_field"),
      label: f.label ? String(f.label) : String(f.field_id || f.field || "").replace(/_/g, " "),
      value: f.value,
      unit: f.unit ? String(f.unit) : undefined,
      human_confirmed: Boolean(f.human_confirmed),
      source_artifact_id: f.artifact_id,
      source_locator: f.locator,
    })),
    artifact_ids: (data.artifacts || []).map((a: any) => String(a.artifact_id || a)),
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    metadata: { synthetic: true },
  };
}

export async function checkApiHealth(baseUrl = DEFAULT_API_BASE_URL): Promise<{ ok: boolean; version?: string }> {
  const res = await fetch(`${baseUrl}/health`);
  if (!res.ok) throw new Error(`API health check failed with status ${res.status}`);
  return res.json();
}

export async function fetchProfilesLive(baseUrl = DEFAULT_API_BASE_URL): Promise<Array<{ profile_id: string; name: string; description?: string }>> {
  const res = await fetch(`${baseUrl}/profiles`);
  if (!res.ok) throw new Error(`Failed to fetch profiles: ${res.status}`);
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (data && data.profiles && typeof data.profiles === "object") {
    return Object.entries(data.profiles).map(([id, p]: [string, any]) => ({
      profile_id: id,
      name: p.label || p.name || id,
      description: p.description,
    }));
  }
  return getProfiles().map((p) => ({
    profile_id: p.profile_id,
    name: p.name || p.profile_id,
    description: p.description,
  }));
}

export async function fetchMissionsLive(baseUrl = DEFAULT_API_BASE_URL): Promise<MissionProfile[]> {
  const res = await fetch(`${baseUrl}/missions`);
  if (!res.ok) throw new Error(`Failed to list missions: ${res.status}`);
  const data = await res.json();
  return (data || []).map(normalizeLiveMission);
}

export async function fetchMissionLive(missionId: string, baseUrl = DEFAULT_API_BASE_URL): Promise<MissionProfile> {
  const res = await fetch(`${baseUrl}/missions/${missionId}`);
  if (!res.ok) throw new Error(`Failed to fetch mission ${missionId}: ${res.status}`);
  const data = await res.json();
  return normalizeLiveMission(data);
}

export async function evaluateMissionLive(
  missionId: string,
  profileId: string,
  baseUrl = DEFAULT_API_BASE_URL
): Promise<{ findings: Finding[]; msri?: any; conflicts?: any[] }> {
  const res = await fetch(`${baseUrl}/missions/${missionId}/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile_id: profileId }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Live evaluation failed (${res.status}): ${err}`);
  }
  const data = await res.json();
  const findings: Finding[] = (data.findings || []).map((f: any) => ({
    finding_id: f.finding_id,
    mission_id: missionId,
    profile_id: profileId,
    rule_id: f.rule_id,
    rule_version: f.rule_version || "1.0.0",
    title: f.title,
    status: f.status,
    critical_gap: Boolean(f.critical_gap),
    required_fields: f.required_fields || [],
    observed_value: f.observed_value,
    observed_unit: f.unit || f.observed_unit,
    threshold: f.threshold,
    remediation_lever: f.remediation_lever,
    limitation_notice: f.limitation_notice,
    source_citation: f.source_citation || { document: "Controlling source", clause: f.rule_id, interpretation_type: "DIRECT" },
    evaluated_at: new Date().toISOString(),
    rationale: f.message || f.rationale || "Evaluated by live FastAPI engine.",
  }));
  return { findings, msri: data.msri, conflicts: data.conflicts };
}

export async function submitReviewDecisionLive(
  missionId: string,
  findingId: string,
  decision: ReviewDecisionType,
  note = "Reviewed in live console.",
  baseUrl = DEFAULT_API_BASE_URL
): Promise<ReviewDecision> {
  const res = await fetch(`${baseUrl}/missions/${missionId}/findings/${encodeURIComponent(findingId)}/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision, note, reviewer: "human-reviewer" }),
  });
  if (!res.ok) throw new Error(`Failed to submit decision (${res.status})`);
  return res.json();
}

export async function fetchProvenanceLive(baseUrl = DEFAULT_API_BASE_URL): Promise<VerificationResult & { events?: any[] }> {
  const res = await fetch(`${baseUrl}/provenance`);
  if (!res.ok) throw new Error(`Failed to fetch provenance: ${res.status}`);
  const data = await res.json();
  const v = data.verification || {};
  return {
    valid: Boolean(v.valid),
    checked_events: (data.events || []).length,
    sequence: v.tampered_sequence,
    events: data.events || [],
  };
}

export async function fetchExportLive(missionId: string, baseUrl = DEFAULT_API_BASE_URL): Promise<ExportPacket | ExportLocked> {
  const res = await fetch(`${baseUrl}/export/${missionId}`);
  if (res.status === 423) {
    const errData = await res.json().catch(() => ({}));
    const unreviewed = errData.detail?.unreviewed_findings || [];
    return {
      status: "EXPORT_LOCKED",
      missing_finding_ids: unreviewed,
      message: `${unreviewed.length} finding(s) still require review decision before export is unlocked.`,
    };
  }
  if (!res.ok) {
    throw new Error(`Export fetch failed with status ${res.status}`);
  }
  const data = await res.json();
  return {
    status: "READY",
    ...data,
  };
}

export async function updateFieldLive(
  missionId: string,
  fieldName: string,
  value: any,
  humanConfirmed?: boolean,
  baseUrl = DEFAULT_API_BASE_URL
): Promise<any> {
  const res = await fetch(`${baseUrl}/missions/${missionId}/fields/${fieldName}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value, human_confirmed: humanConfirmed }),
  });
  if (!res.ok) throw new Error(`Failed to update field (${res.status})`);
  return res.json();
}

export async function runCounterfactualLive(
  missionId: string,
  findingId: string,
  lever: string,
  proposedValue: any,
  baseUrl = DEFAULT_API_BASE_URL
): Promise<any> {
  const res = await fetch(`${baseUrl}/missions/${missionId}/counterfactual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ finding_id: findingId, lever, proposed_value: proposedValue }),
  });
  if (!res.ok) throw new Error(`Failed to run counterfactual (${res.status})`);
  return res.json();
}

export async function resetDemoLive(baseUrl = DEFAULT_API_BASE_URL): Promise<void> {
  await fetch(`${baseUrl}/reset`, { method: "POST" }).catch(() => {});
}

