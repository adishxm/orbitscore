import { describe, it, expect, beforeEach } from 'vitest';
import { useOrbitStore } from '../store/useOrbitStore';
import { ASTERIA_3_EVIDENCE } from '../fixtures/asteria-3';

describe('Slice 4: State Store & Synthetic Fixtures', () => {
  beforeEach(() => {
    useOrbitStore.getState().resetDemo();
  });

  it('initializes with Asteria-3 active and synthetic fixtures loaded', () => {
    const state = useOrbitStore.getState();
    expect(state.activeMissionId).toBe('asteria-3');
    expect(state.missions['asteria-3']).toBeDefined();
    expect(state.missions['microsat-x']).toBeDefined();

    const asteriaEvidence = state.evidence['asteria-3'] || [];
    expect(asteriaEvidence).toHaveLength(ASTERIA_3_EVIDENCE.length);
  });

  it('runs deterministic checks for Asteria-3 and marks check run fresh', () => {
    const checkRun = useOrbitStore.getState().runChecks('asteria-3');
    expect(checkRun.is_applicable).toBe(true);
    expect(checkRun.findings.length).toBeGreaterThanOrEqual(6);

    const isStale = useOrbitStore.getState().isCheckRunStale['asteria-3'];
    expect(isStale).toBe(false);
  });

  it('marks check run stale when an evidence item is updated', () => {
    useOrbitStore.getState().runChecks('asteria-3');
    expect(useOrbitStore.getState().isCheckRunStale['asteria-3']).toBe(false);

    // Update an evidence item
    const firstItem = useOrbitStore.getState().evidence['asteria-3']?.[0];
    expect(firstItem).toBeDefined();

    useOrbitStore.getState().updateEvidenceItem('asteria-3', firstItem!.id, {
      notes: 'Updated engineering note',
    });

    expect(useOrbitStore.getState().isCheckRunStale['asteria-3']).toBe(true);
  });

  it('promotes an evidence item to confirmed with human sign-off metadata', () => {
    const unconfirmedItem = useOrbitStore
      .getState()
      .evidence['asteria-3']?.find((e) => e.state === 'unconfirmed');

    expect(unconfirmedItem).toBeDefined();

    useOrbitStore
      .getState()
      .confirmEvidenceItem('asteria-3', unconfirmedItem!.id, 'Dr. Sarah Lin (Thermal Lead)');

    const updatedItem = useOrbitStore
      .getState()
      .evidence['asteria-3']?.find((e) => e.id === unconfirmedItem!.id);

    expect(updatedItem?.state).toBe('confirmed');
    expect(updatedItem?.human_confirmed_by).toBe('Dr. Sarah Lin (Thermal Lead)');
    expect(updatedItem?.human_confirmed_at).toBeDefined();
  });

  it('records human review decisions and replaces previous decisions for the same finding', () => {
    useOrbitStore.getState().recordDecision('asteria-3', {
      finding_id: 'finding-demo-evidence-completeness-c03-conflicting',
      decision: 'waiver_granted',
      rationale: 'CAD mass includes 8% harness contingency; deployer vendor confirmed 4.15 kg margin acceptable.',
      reviewer_name: 'Alex Vance',
      reviewer_role: 'Lead Systems Engineer',
    });

    let decisions = useOrbitStore.getState().reviewDecisions['asteria-3'] || [];
    expect(decisions).toHaveLength(1);
    expect(decisions[0]?.decision).toBe('waiver_granted');
    expect(decisions[0]?.reviewer_name).toBe('Alex Vance');

    // Update the decision
    useOrbitStore.getState().recordDecision('asteria-3', {
      finding_id: 'finding-demo-evidence-completeness-c03-conflicting',
      decision: 'mitigation_filed',
      rationale: 'Mitigation plan filed to measure flight model dry mass on calibrated load cell.',
      reviewer_name: 'Alex Vance',
      reviewer_role: 'Lead Systems Engineer',
    });

    decisions = useOrbitStore.getState().reviewDecisions['asteria-3'] || [];
    expect(decisions).toHaveLength(1);
    expect(decisions[0]?.decision).toBe('mitigation_filed');
  });

  it('manages open issues tracking and status transitions', () => {
    useOrbitStore.getState().addOpenIssue('asteria-3', {
      finding_id: 'finding-demo-evidence-completeness-c01-missing',
      title: 'Obtain launch provider integration schedule and antenna inhibit specs',
      assigned_to: 'Flight Dynamics Lead',
      due_date: '2024-08-01',
      status: 'open',
    });

    const issues = useOrbitStore.getState().openIssues['asteria-3'] || [];
    expect(issues).toHaveLength(1);
    expect(issues[0]?.status).toBe('open');

    // Transition status to addressed
    useOrbitStore.getState().updateOpenIssueStatus('asteria-3', issues[0]!.id, 'addressed');

    const updatedIssues = useOrbitStore.getState().openIssues['asteria-3'] || [];
    expect(updatedIssues[0]?.status).toBe('addressed');
  });

  it('resets Asteria-3 demo to default pristine state', () => {
    // Delete an item
    const firstItem = useOrbitStore.getState().evidence['asteria-3']?.[0];
    useOrbitStore.getState().deleteEvidenceItem('asteria-3', firstItem!.id);

    expect(useOrbitStore.getState().evidence['asteria-3']?.length).toBe(
      ASTERIA_3_EVIDENCE.length - 1
    );

    // Call resetDemo
    useOrbitStore.getState().resetDemo();
    expect(useOrbitStore.getState().evidence['asteria-3']?.length).toBe(
      ASTERIA_3_EVIDENCE.length
    );
  });
});
