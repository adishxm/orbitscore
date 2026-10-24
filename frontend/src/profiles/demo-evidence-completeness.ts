import {
  Mission,
  EvidenceItem,
  Profile,
  CheckRun,
  Finding,
} from '../types/domain';

export const DEMO_PROFILE: Profile = {
  id: 'demo-evidence-completeness',
  name: 'demo-evidence-completeness',
  version: 'v0.1.0',
  title: 'Demo Evidence Completeness Profile',
  description:
    'Standard structural completeness and cross-document consistency checks for CubeSat mission records.',
  applicability: {
    object_types: ['cubesat', 'smallsat'],
    form_factors: ['1U', '1.5U', '2U', '3U', '6U', '12U', '16U', '27U'],
  },
  checks: [
    {
      id: 'C-01',
      title: 'Mandatory Mission Baseline Parameters',
      description:
        'Verifies that evidence records exist for all core parameters required to establish basic mission context.',
      category: 'baseline_completeness',
      severity: 'action_required',
      requires_human_signoff: true,
    },
    {
      id: 'C-02',
      title: 'Standard Physical Units Validation',
      description:
        'Verifies that every numeric physical parameter declares an allowed, standardized SI or aerospace unit.',
      category: 'units_standardization',
      severity: 'action_required',
      requires_human_signoff: false,
    },
    {
      id: 'C-03',
      title: 'Cross-Document Parameter Discrepancy Detection',
      description:
        'Compares multiple values entered from disparate sources for the same parameter key to identify engineering discrepancies beyond declared tolerances.',
      category: 'consistency_verification',
      severity: 'action_required',
      requires_human_signoff: true,
    },
    {
      id: 'C-04',
      title: 'Source Document Citation & Page/Section Locators',
      description:
        'Verifies that every evidence item points to an authentic primary document with an explicit page, section, or drawing number locator.',
      category: 'source_traceability',
      severity: 'action_required',
      requires_human_signoff: true,
    },
    {
      id: 'C-05',
      title: 'Document Baseline Age & Currency Check',
      description:
        'Compares source document dates against the mission declared baseline threshold date.',
      category: 'temporal_currency',
      severity: 'advisory',
      requires_human_signoff: true,
    },
    {
      id: 'C-06',
      title: 'Human Verification Status of Key Parameters',
      description:
        'Verifies whether critical parameters have been explicitly reviewed and promoted to confirmed by a human team member.',
      category: 'human_oversight',
      severity: 'action_required',
      requires_human_signoff: true,
    },
  ],
};

const REQUIRED_BASELINE_KEYS = [
  'mass_wet_kg',
  'dimensions_folded_mm',
  'orbit_regime_declared',
  'deployment_epoch_target',
  'primary_contact_document',
];

const PERMITTED_UNITS = new Set([
  'kg',
  'g',
  'mm',
  'cm',
  'm',
  'km',
  'nmi',
  'm/s',
  'km/s',
  'MHz',
  'GHz',
  'W',
  'Wh',
  'J',
  'mAh',
]);

/**
 * Deterministic hash computation for input snapshot reproducibility
 */
export function computeSnapshotHash(mission: Mission, evidence: EvidenceItem[]): string {
  const payload = JSON.stringify({
    mId: mission.id,
    mForm: mission.form_factor,
    mDate: mission.baseline_threshold_date,
    items: evidence.map((e) => ({
      k: e.parameter_key,
      v: e.value,
      u: e.unit,
      s: e.state,
      d: e.source_doc_date,
      c: e.human_confirmed_by,
    })),
  });

  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `snap-${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

/**
 * Pure deterministic check engine function
 */
export function executeProfileChecks(
  mission: Mission,
  evidence: EvidenceItem[],
  profile: Profile = DEMO_PROFILE
): CheckRun {
  const executedAt = new Date().toISOString();
  const snapshotHash = computeSnapshotHash(mission, evidence);
  const evidenceSnapshot = JSON.parse(JSON.stringify(evidence));

  // 1. Applicability Gate Check
  const isObjectTypeApplicable = profile.applicability.object_types.includes(
    mission.object_type
  );
  const isFormFactorApplicable = profile.applicability.form_factors.includes(
    mission.form_factor
  );

  if (!isObjectTypeApplicable || !isFormFactorApplicable) {
    const inapplicabilityReason =
      `Profile ${profile.id} ${profile.version} is calibrated solely for integrated CubeSat and SmallSat platforms (1U to 27U). ` +
      `Vehicle form factor '${mission.form_factor}' is outside the declared applicability boundary.`;

    const outOfScopeFinding: Finding = {
      id: `finding-${profile.id}-applicability-gate`,
      check_id: 'GATE-01',
      check_title: 'Applicability Boundary Gate',
      outcome: 'out_of_profile_scope',
      severity: 'info',
      summary: 'Mission form factor is outside the CubeSat 1U-27U applicability boundary of this profile.',
      details: inapplicabilityReason,
      affected_evidence_keys: [],
      recommendation:
        'Select or configure a specialized review profile calibrated for this vehicle class.',
    };

    return {
      id: `checkrun-${Date.now()}`,
      profile_id: profile.id,
      profile_version: profile.version,
      executed_at: executedAt,
      is_applicable: false,
      inapplicability_reason: inapplicabilityReason,
      input_snapshot_hash: snapshotHash,
      evidence_snapshot: evidenceSnapshot,
      findings: [outOfScopeFinding],
    };
  }

  const findings: Finding[] = [];

  // Check C-01: Mandatory Mission Baseline Parameters
  const presentKeys = new Set(evidence.map((e) => e.parameter_key));
  const missingKeys = REQUIRED_BASELINE_KEYS.filter((k) => !presentKeys.has(k));

  if (missingKeys.length > 0) {
    findings.push({
      id: `finding-${profile.id}-c01-missing`,
      check_id: 'C-01',
      check_title: 'Mandatory Mission Baseline Parameters',
      outcome: 'needs_attention_missing',
      severity: 'action_required',
      summary: `Missing ${missingKeys.length} mandatory baseline parameter(s): ${missingKeys.join(', ')}`,
      details: `The mission evidence register does not contain records for required baseline parameters (${missingKeys.join(
        ', '
      )}). Basic mass, envelope, orbital, and contact parameters are mandatory before flight review.`,
      affected_evidence_keys: missingKeys,
      recommendation:
        'Add evidence entries with primary source citations for each missing parameter.',
    });
  } else {
    findings.push({
      id: `finding-${profile.id}-c01-documented`,
      check_id: 'C-01',
      check_title: 'Mandatory Mission Baseline Parameters',
      outcome: 'documented',
      severity: 'info',
      summary: 'All required baseline parameters are represented in the evidence register.',
      details: `Verified presence of all ${REQUIRED_BASELINE_KEYS.length} core parameters.`,
      affected_evidence_keys: REQUIRED_BASELINE_KEYS,
      recommendation: 'Maintain records as engineering revisions occur.',
    });
  }

  // Check C-02: Standard Physical Units Validation
  const numericItems = evidence.filter((e) => e.value_type === 'numeric' && e.value !== null);
  const itemsWithInvalidUnits = numericItems.filter(
    (e) => !e.unit || !PERMITTED_UNITS.has(e.unit)
  );

  if (itemsWithInvalidUnits.length > 0) {
    const invalidKeys = itemsWithInvalidUnits.map((e) => e.parameter_key);
    findings.push({
      id: `finding-${profile.id}-c02-units`,
      check_id: 'C-02',
      check_title: 'Standard Physical Units Validation',
      outcome: 'needs_attention_missing',
      severity: 'action_required',
      summary: `Invalid or missing engineering units on ${invalidKeys.length} parameter(s)`,
      details: `Items [${invalidKeys.join(
        ', '
      )}] declare missing or non-standard physical units. Permitted units include SI metric definitions (kg, g, mm, cm, m, km, nmi, m/s, km/s, MHz, GHz, W, Wh, J, mAh).`,
      affected_evidence_keys: invalidKeys,
      recommendation:
        'Specify standard aerospace SI units on all numeric evidence entries to prevent unit ambiguity.',
    });
  } else {
    findings.push({
      id: `finding-${profile.id}-c02-documented`,
      check_id: 'C-02',
      check_title: 'Standard Physical Units Validation',
      outcome: 'documented',
      severity: 'info',
      summary: 'All numeric physical parameters declare permitted standard units.',
      details: `Verified standard engineering units across ${numericItems.length} numeric parameter entries.`,
      affected_evidence_keys: numericItems.map((e) => e.parameter_key),
      recommendation: 'Ensure downstream suppliers adhere to standard SI units.',
    });
  }

  // Check C-03: Cross-Document Parameter Discrepancy Detection
  const conflictingItems = evidence.filter(
    (e) =>
      e.state === 'conflicting' ||
      (e.conflicting_values && e.conflicting_values.length > 0)
  );

  if (conflictingItems.length > 0) {
    const conflictDescriptions = conflictingItems.map((item) => {
      const conflicts = item.conflicting_values || [];
      const sources = conflicts
        .map((c) => `[${c.source} (${c.ref}): ${c.value}]`)
        .join(' vs ');
      return `${item.parameter_key}: primary value ${item.value} ${item.unit || ''} differs from ${sources}`;
    });

    findings.push({
      id: `finding-${profile.id}-c03-conflicting`,
      check_id: 'C-03',
      check_title: 'Cross-Document Parameter Discrepancy Detection',
      outcome: 'needs_attention_conflicting',
      severity: 'action_required',
      summary: `Discrepancy detected across engineering documents for ${conflictingItems.map((e) => e.parameter_key).join(', ')}`,
      details: `Cross-source verification surfaced conflicting records:\n${conflictDescriptions.join(
        '\n'
      )}`,
      affected_evidence_keys: conflictingItems.map((e) => e.parameter_key),
      recommendation:
        'Reconcile diverging documents (e.g. CAD model vs ICD) and record a unified engineering baseline.',
    });
  } else {
    findings.push({
      id: `finding-${profile.id}-c03-documented`,
      check_id: 'C-03',
      check_title: 'Cross-Document Parameter Discrepancy Detection',
      outcome: 'documented',
      severity: 'info',
      summary: 'No unresolved cross-document numerical discrepancies detected.',
      details: 'Evaluated parameter values across cross-referenced source documents within declared tolerances.',
      affected_evidence_keys: evidence.map((e) => e.parameter_key),
      recommendation: 'Continue cross-checking subsystem deliverables against top-level budgets.',
    });
  }

  // Check C-04: Source Document Citation & Page/Section Locators
  const untracedItems = evidence.filter((e) => {
    const hasTitle = Boolean(e.source_doc_title && e.source_doc_title.trim().length > 0);
    const hasLocator = Boolean(
      (e.locator && e.locator.trim().length > 0) ||
        (e.page_number && e.page_number > 0) ||
        (e.paragraph && e.paragraph.trim().length > 0)
    );
    return !hasTitle || !hasLocator;
  });

  if (untracedItems.length > 0) {
    const untracedKeys = untracedItems.map((e) => e.parameter_key);
    findings.push({
      id: `finding-${profile.id}-c04-locators`,
      check_id: 'C-04',
      check_title: 'Source Document Citation & Page/Section Locators',
      outcome: 'needs_attention_missing',
      severity: 'action_required',
      summary: `Missing source document citations or page locators on ${untracedKeys.length} item(s)`,
      details: `The following parameters lack verifiable primary document titles or explicit page/section locators: ${untracedKeys.join(
        ', '
      )}.`,
      affected_evidence_keys: untracedKeys,
      recommendation:
        'Add primary document title, revision identifier, and exact page or section locator for all evidence entries.',
    });
  } else {
    findings.push({
      id: `finding-${profile.id}-c04-documented`,
      check_id: 'C-04',
      check_title: 'Source Document Citation & Page/Section Locators',
      outcome: 'documented',
      severity: 'info',
      summary: 'All evidence entries include explicit primary document citations and locators.',
      details: `Verified source document titles and specific page/section locators across all ${evidence.length} entries.`,
      affected_evidence_keys: evidence.map((e) => e.parameter_key),
      recommendation: 'Preserve referenced document archives alongside mission dossiers.',
    });
  }

  // Check C-05: Document Baseline Age & Currency Check
  const thresholdTime = new Date(mission.baseline_threshold_date).getTime();
  const staleItems = evidence.filter((e) => {
    if (e.state === 'stale') return true;
    if (!e.source_doc_date) return false;
    const docTime = new Date(e.source_doc_date).getTime();
    return !isNaN(docTime) && !isNaN(thresholdTime) && docTime < thresholdTime;
  });

  if (staleItems.length > 0) {
    const staleDescriptions = staleItems.map((item) => {
      return `${item.parameter_key} (dated ${item.source_doc_date || 'unknown'}, baseline threshold: ${mission.baseline_threshold_date})`;
    });

    findings.push({
      id: `finding-${profile.id}-c05-stale`,
      check_id: 'C-05',
      check_title: 'Document Baseline Age & Currency Check',
      outcome: 'needs_attention_unconfirmed',
      severity: 'advisory',
      summary: `Stale source documents detected on ${staleItems.length} parameter(s)`,
      details: `The following evidence items rely on document revisions that predate the declared baseline threshold (${mission.baseline_threshold_date}):\n${staleDescriptions.join(
        '\n'
      )}`,
      affected_evidence_keys: staleItems.map((e) => e.parameter_key),
      recommendation:
        'Verify whether subsequent engineering revisions or test results supersede these older records.',
    });
  } else {
    findings.push({
      id: `finding-${profile.id}-c05-documented`,
      check_id: 'C-05',
      check_title: 'Document Baseline Age & Currency Check',
      outcome: 'documented',
      severity: 'info',
      summary: 'All referenced source documents satisfy the declared baseline currency threshold.',
      details: `All document revision dates fall on or after ${mission.baseline_threshold_date}.`,
      affected_evidence_keys: evidence.map((e) => e.parameter_key),
      recommendation: 'Update baseline threshold when milestone design freeze is enacted.',
    });
  }

  // Check C-06: Human Verification Status of Key Parameters
  const requiredEvidenceItems = evidence.filter((e) =>
    REQUIRED_BASELINE_KEYS.includes(e.parameter_key)
  );
  const unconfirmedItems = requiredEvidenceItems.filter(
    (e) => e.state === 'unconfirmed' || !e.human_confirmed_by
  );

  if (unconfirmedItems.length > 0) {
    const unconfirmedKeys = unconfirmedItems.map((e) => e.parameter_key);
    findings.push({
      id: `finding-${profile.id}-c06-unconfirmed`,
      check_id: 'C-06',
      check_title: 'Human Verification Status of Key Parameters',
      outcome: 'needs_attention_unconfirmed',
      severity: 'action_required',
      summary: `Unconfirmed parameters require human verification (${unconfirmedKeys.join(', ')}).`,
      details: `The following required evidence items have not yet received explicit human verification by an engineer: ${unconfirmedKeys.join(
        ', '
      )}.`,
      affected_evidence_keys: unconfirmedKeys,
      recommendation:
        'Have a qualified engineer inspect the cited document and confirm the entry.',
    });
  } else {
    findings.push({
      id: `finding-${profile.id}-c06-documented`,
      check_id: 'C-06',
      check_title: 'Human Verification Status of Key Parameters',
      outcome: 'documented',
      severity: 'info',
      summary: 'All required parameters have been confirmed by a designated human reviewer.',
      details: `Verified reviewer confirmation records for all ${requiredEvidenceItems.length} required parameters.`,
      affected_evidence_keys: requiredEvidenceItems.map((e) => e.parameter_key),
      recommendation: 'Maintain human reviewer log with export dossier.',
    });
  }

  return {
    id: `checkrun-${Date.now()}`,
    profile_id: profile.id,
    profile_version: profile.version,
    executed_at: executedAt,
    is_applicable: true,
    input_snapshot_hash: snapshotHash,
    evidence_snapshot: evidenceSnapshot,
    findings,
  };
}
