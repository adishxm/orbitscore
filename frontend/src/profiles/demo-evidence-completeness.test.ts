import { describe, it, expect } from 'vitest';
import {
  DEMO_PROFILE,
  executeProfileChecks,
  computeSnapshotHash,
} from './demo-evidence-completeness';
import { Mission, EvidenceItem } from '../types/domain';

const BASE_VALID_MISSION: Mission = {
  id: 'mission-valid-01',
  name: 'TestSat-1',
  object_type: 'cubesat',
  form_factor: '3U',
  target_orbit: '500 km SSO',
  mass_budget_kg: 4.0,
  baseline_threshold_date: '2024-01-01',
  created_at: '2024-06-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
};

const BASE_VALID_EVIDENCE: EvidenceItem[] = [
  {
    id: 'ev-01',
    mission_id: 'mission-valid-01',
    parameter_key: 'mass_wet_kg',
    label: 'Total Wet Mass',
    category: 'mass_properties',
    value: 3.82,
    unit: 'kg',
    value_type: 'numeric',
    source_doc_title: 'Mass Properties Budget Report',
    source_doc_ref: 'MPB-REV-C',
    source_doc_date: '2024-03-15',
    page_number: 4,
    paragraph: 'Table 2',
    locator: 'Page 4, Table 2',
    state: 'confirmed',
    human_confirmed_by: 'Lead Systems Engineer (LSE)',
    human_confirmed_at: '2024-03-20T10:00:00Z',
  },
  {
    id: 'ev-02',
    mission_id: 'mission-valid-01',
    parameter_key: 'dimensions_folded_mm',
    label: 'Stowed Envelope Dimensions',
    category: 'envelope',
    value: '100x100x340',
    unit: 'mm',
    value_type: 'string',
    source_doc_title: 'Structural Interface Control Document',
    source_doc_ref: 'ICD-STR-04',
    source_doc_date: '2024-02-10',
    page_number: 12,
    locator: 'Page 12, Section 3.1',
    state: 'confirmed',
    human_confirmed_by: 'Structural Lead',
    human_confirmed_at: '2024-02-15T14:30:00Z',
  },
  {
    id: 'ev-03',
    mission_id: 'mission-valid-01',
    parameter_key: 'orbit_regime_declared',
    label: 'Declared Orbit Regime',
    category: 'orbit_lifetime',
    value: '500 km Sun-Synchronous Orbit',
    value_type: 'string',
    source_doc_title: 'Mission Concept of Operations',
    source_doc_ref: 'CONOPS-V2',
    source_doc_date: '2024-02-01',
    page_number: 8,
    locator: 'Page 8, Section 2.2',
    state: 'confirmed',
    human_confirmed_by: 'Mission Architect',
    human_confirmed_at: '2024-02-05T09:00:00Z',
  },
  {
    id: 'ev-04',
    mission_id: 'mission-valid-01',
    parameter_key: 'deployment_epoch_target',
    label: 'Target Deployment Epoch',
    category: 'deployment',
    value: '2025-Q2',
    value_type: 'string',
    source_doc_title: 'Launch Service Agreement Draft',
    source_doc_ref: 'LSA-SCHEDULE-01',
    source_doc_date: '2024-04-01',
    page_number: 3,
    locator: 'Page 3, Paragraph 1',
    state: 'confirmed',
    human_confirmed_by: 'Project Manager',
    human_confirmed_at: '2024-04-02T11:00:00Z',
  },
  {
    id: 'ev-05',
    mission_id: 'mission-valid-01',
    parameter_key: 'primary_contact_document',
    label: 'Primary Point of Contact Documentation',
    category: 'general',
    value: 'University SmallSat Laboratory Team Lead',
    value_type: 'string',
    source_doc_title: 'Project Organization Plan',
    source_doc_ref: 'POP-2024',
    source_doc_date: '2024-01-15',
    page_number: 2,
    locator: 'Page 2',
    state: 'confirmed',
    human_confirmed_by: 'Faculty Advisor',
    human_confirmed_at: '2024-01-20T16:00:00Z',
  },
];

describe('Slice 3: Pure Deterministic Check Engine', () => {
  describe('Profile Metadata & Integrity', () => {
    it('declares the demo profile v0.1.0 with 6 required check definitions', () => {
      expect(DEMO_PROFILE.id).toBe('demo-evidence-completeness');
      expect(DEMO_PROFILE.version).toBe('v0.1.0');
      expect(DEMO_PROFILE.checks).toHaveLength(6);
      expect(DEMO_PROFILE.checks.map((c) => c.id)).toEqual([
        'C-01',
        'C-02',
        'C-03',
        'C-04',
        'C-05',
        'C-06',
      ]);
    });
  });

  describe('Applicability Gate', () => {
    it('accepts standard 3U CubeSat mission and executes all checks', () => {
      const run = executeProfileChecks(BASE_VALID_MISSION, BASE_VALID_EVIDENCE);
      expect(run.is_applicable).toBe(true);
      expect(run.findings).toHaveLength(6);
      expect(run.findings.every((f) => f.outcome === 'documented')).toBe(true);
    });

    it('rejects out-of-scope vehicle form factors and outputs a single out_of_profile_scope finding', () => {
      const outOfScopeMission: Mission = {
        ...BASE_VALID_MISSION,
        object_type: 'other',
        form_factor: 'ESPA',
      };

      const run = executeProfileChecks(outOfScopeMission, BASE_VALID_EVIDENCE);
      expect(run.is_applicable).toBe(false);
      expect(run.inapplicability_reason).toContain('calibrated solely for integrated CubeSat and SmallSat platforms');
      expect(run.findings).toHaveLength(1);
      expect(run.findings[0]?.outcome).toBe('out_of_profile_scope');
      expect(run.findings[0]?.check_id).toBe('GATE-01');
    });
  });

  describe('Check C-01: Mandatory Baseline Parameters', () => {
    it('flags missing required parameters with needs_attention_missing', () => {
      // Remove mass and dimensions
      const incompleteEvidence = BASE_VALID_EVIDENCE.filter(
        (e) => e.parameter_key !== 'mass_wet_kg' && e.parameter_key !== 'dimensions_folded_mm'
      );

      const run = executeProfileChecks(BASE_VALID_MISSION, incompleteEvidence);
      const c01Finding = run.findings.find((f) => f.check_id === 'C-01');

      expect(c01Finding).toBeDefined();
      expect(c01Finding?.outcome).toBe('needs_attention_missing');
      expect(c01Finding?.severity).toBe('action_required');
      expect(c01Finding?.affected_evidence_keys).toContain('mass_wet_kg');
      expect(c01Finding?.affected_evidence_keys).toContain('dimensions_folded_mm');
    });
  });

  describe('Check C-02: Physical Units Validation', () => {
    it('flags non-standard physical units', () => {
      const invalidUnitsEvidence: EvidenceItem[] = [
        ...BASE_VALID_EVIDENCE,
        {
          id: 'ev-invalid-unit',
          mission_id: 'mission-valid-01',
          parameter_key: 'payload_mass',
          label: 'Payload Mass',
          category: 'mass_properties',
          value: 2.5,
          unit: 'pounds', // Invalid non-SI unit
          value_type: 'numeric',
          source_doc_title: 'Supplier Sheet',
          source_doc_ref: 'SUP-01',
          source_doc_date: '2024-03-01',
          page_number: 1,
          locator: 'Page 1',
          state: 'confirmed',
          human_confirmed_by: 'Engineer',
        },
      ];

      const run = executeProfileChecks(BASE_VALID_MISSION, invalidUnitsEvidence);
      const c02Finding = run.findings.find((f) => f.check_id === 'C-02');

      expect(c02Finding).toBeDefined();
      expect(c02Finding?.outcome).toBe('needs_attention_missing');
      expect(c02Finding?.affected_evidence_keys).toContain('payload_mass');
    });
  });

  describe('Check C-03: Cross-Document Discrepancies', () => {
    it('flags conflicting evidence items across documents', () => {
      const conflictingEvidence: EvidenceItem[] = [
        ...BASE_VALID_EVIDENCE.filter((e) => e.parameter_key !== 'mass_wet_kg'),
        {
          id: 'ev-mass-conflict',
          mission_id: 'mission-valid-01',
          parameter_key: 'mass_wet_kg',
          label: 'Wet Mass',
          category: 'mass_properties',
          value: 3.82,
          unit: 'kg',
          value_type: 'numeric',
          source_doc_title: 'Mass Budget Sheet',
          source_doc_ref: 'MBS-01',
          source_doc_date: '2024-03-10',
          page_number: 2,
          locator: 'Page 2',
          state: 'conflicting',
          conflicting_values: [
            { value: 4.15, source: 'CAD Model Master', ref: 'CAD-ASM-09' },
          ],
          human_confirmed_by: 'Systems Lead',
        },
      ];

      const run = executeProfileChecks(BASE_VALID_MISSION, conflictingEvidence);
      const c03Finding = run.findings.find((f) => f.check_id === 'C-03');

      expect(c03Finding).toBeDefined();
      expect(c03Finding?.outcome).toBe('needs_attention_conflicting');
      expect(c03Finding?.severity).toBe('action_required');
      expect(c03Finding?.details).toContain('CAD Model Master');
    });
  });

  describe('Check C-04: Citation Locators', () => {
    it('flags items missing document titles or explicit page locators', () => {
      const missingLocatorEvidence: EvidenceItem[] = [
        ...BASE_VALID_EVIDENCE.filter((e) => e.parameter_key !== 'primary_contact_document'),
        {
          id: 'ev-no-locator',
          mission_id: 'mission-valid-01',
          parameter_key: 'primary_contact_document',
          label: 'Point of Contact',
          category: 'general',
          value: 'Lead Contact',
          value_type: 'string',
          source_doc_title: 'Unpublished Notes',
          source_doc_ref: 'NOTE-1',
          source_doc_date: '2024-01-01',
          locator: '', // Missing locator
          state: 'confirmed',
          human_confirmed_by: 'Engineer',
        },
      ];

      const run = executeProfileChecks(BASE_VALID_MISSION, missingLocatorEvidence);
      const c04Finding = run.findings.find((f) => f.check_id === 'C-04');

      expect(c04Finding).toBeDefined();
      expect(c04Finding?.outcome).toBe('needs_attention_missing');
      expect(c04Finding?.affected_evidence_keys).toContain('primary_contact_document');
    });
  });

  describe('Check C-05: Temporal Baseline Currency', () => {
    it('flags evidence predating the mission baseline threshold date', () => {
      const staleEvidence: EvidenceItem[] = [
        ...BASE_VALID_EVIDENCE.filter((e) => e.parameter_key !== 'deployment_epoch_target'),
        {
          id: 'ev-stale',
          mission_id: 'mission-valid-01',
          parameter_key: 'deployment_epoch_target',
          label: 'Target Deployment Epoch',
          category: 'deployment',
          value: '2025-Q2',
          value_type: 'string',
          source_doc_title: 'Preliminary Feasibility Study',
          source_doc_ref: 'PFS-001',
          source_doc_date: '2022-05-15', // Predates baseline_threshold_date (2024-01-01)
          locator: 'Page 5',
          state: 'stale',
          human_confirmed_by: 'Engineer',
        },
      ];

      const run = executeProfileChecks(BASE_VALID_MISSION, staleEvidence);
      const c05Finding = run.findings.find((f) => f.check_id === 'C-05');

      expect(c05Finding).toBeDefined();
      expect(c05Finding?.outcome).toBe('needs_attention_unconfirmed');
      expect(c05Finding?.severity).toBe('advisory');
      expect(c05Finding?.affected_evidence_keys).toContain('deployment_epoch_target');
    });
  });

  describe('Check C-06: Human Verification Status', () => {
    it('flags unconfirmed required parameters', () => {
      const firstItem = BASE_VALID_EVIDENCE[0] as EvidenceItem;
      const unconfirmedItem: EvidenceItem = {
        ...firstItem,
        state: 'unconfirmed',
        human_confirmed_by: undefined,
        human_confirmed_at: undefined,
      };

      const unconfirmedEvidence: EvidenceItem[] = [
        ...BASE_VALID_EVIDENCE.filter((e) => e.parameter_key !== 'mass_wet_kg'),
        unconfirmedItem,
      ];

      const run = executeProfileChecks(BASE_VALID_MISSION, unconfirmedEvidence);
      const c06Finding = run.findings.find((f) => f.check_id === 'C-06');

      expect(c06Finding).toBeDefined();
      expect(c06Finding?.outcome).toBe('needs_attention_unconfirmed');
      expect(c06Finding?.severity).toBe('action_required');
      expect(c06Finding?.affected_evidence_keys).toContain('mass_wet_kg');
    });
  });

  describe('Snapshot Hash Reproducibility', () => {
    it('generates consistent snapshot hash for identical input', () => {
      const hash1 = computeSnapshotHash(BASE_VALID_MISSION, BASE_VALID_EVIDENCE);
      const hash2 = computeSnapshotHash(BASE_VALID_MISSION, BASE_VALID_EVIDENCE);
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^snap-[0-9a-f]{8}$/);
    });

    it('alters snapshot hash when an input evidence value is modified', () => {
      const hash1 = computeSnapshotHash(BASE_VALID_MISSION, BASE_VALID_EVIDENCE);
      const firstItem = BASE_VALID_EVIDENCE[0] as EvidenceItem;
      const modifiedEvidence: EvidenceItem[] = [
        {
          ...firstItem,
          value: 3.99,
        },
        ...BASE_VALID_EVIDENCE.slice(1),
      ];
      const hash2 = computeSnapshotHash(BASE_VALID_MISSION, modifiedEvidence);
      expect(hash1).not.toBe(hash2);
    });
  });
});
