import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { ProfileGateCard } from '../components/workspace/ProfileGateCard';
import { FindingsView } from '../components/workspace/FindingsView';
import { FindingCard } from '../components/workspace/FindingCard';
import { DEMO_PROFILE, executeProfileChecks } from '../profiles/demo-evidence-completeness';
import { ASTERIA_3_MISSION, ASTERIA_3_EVIDENCE } from '../fixtures/asteria-3';
import { MICROSAT_X_MISSION } from '../fixtures/microsat-x';
import { Finding } from '../types/domain';

describe('Slice 6: Profile Gate, Check Execution & Findings Flow', () => {
  it('applicability gate blocks out-of-scope vehicle (Microsat-X)', () => {
    const handleRunChecks = vi.fn();

    render(
      <ProfileGateCard
        mission={MICROSAT_X_MISSION}
        profile={DEMO_PROFILE}
        checkRun={null}
        isStale={false}
        onRunChecks={handleRunChecks}
      />
    );

    // Gate should indicate vehicle is outside defined scope
    expect(
      screen.getByText(/Applicability Gate: NOT APPLICABLE/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/falls outside this boundary/i)
    ).toBeInTheDocument();

    // Check Run button should be disabled
    const runBtn = screen.getByRole('button', { name: /execute profile inspection/i });
    expect(runBtn).toBeDisabled();

    fireEvent.click(runBtn);
    expect(handleRunChecks).not.toHaveBeenCalled();
  });

  it('applicability gate allows in-scope vehicle (Asteria-3) to run checks', () => {
    const handleRunChecks = vi.fn();

    render(
      <ProfileGateCard
        mission={ASTERIA_3_MISSION}
        profile={DEMO_PROFILE}
        checkRun={null}
        isStale={false}
        onRunChecks={handleRunChecks}
      />
    );

    expect(
      screen.getByText(/Applicability Gate: APPLICABLE/i)
    ).toBeInTheDocument();

    const runBtn = screen.getByRole('button', { name: /execute profile inspection/i });
    expect(runBtn).not.toBeDisabled();

    fireEvent.click(runBtn);
    expect(handleRunChecks).toHaveBeenCalledTimes(1);
  });

  it('check execution on Asteria-3 produces exactly 6 findings with expected outcomes', () => {
    const checkRun = executeProfileChecks(ASTERIA_3_MISSION, ASTERIA_3_EVIDENCE);

    expect(checkRun.is_applicable).toBe(true);
    expect(checkRun.findings).toHaveLength(6);

    const c01 = checkRun.findings.find((f) => f.check_id === 'C-01');
    expect(c01?.outcome).toBe('needs_attention_missing');
    expect(c01?.severity).toBe('action_required');

    const c02 = checkRun.findings.find((f) => f.check_id === 'C-02');
    expect(c02?.outcome).toBe('documented');
    expect(c02?.severity).toBe('info');

    const c03 = checkRun.findings.find((f) => f.check_id === 'C-03');
    expect(c03?.outcome).toBe('needs_attention_conflicting');
    expect(c03?.severity).toBe('action_required');

    const c05 = checkRun.findings.find((f) => f.check_id === 'C-05');
    expect(c05?.outcome).toBe('needs_attention_unconfirmed');
    expect(c05?.severity).toBe('advisory');

    const c06 = checkRun.findings.find((f) => f.check_id === 'C-06');
    expect(c06?.outcome).toBe('documented');
    expect(c06?.severity).toBe('info');
  });

  it('FindingCard displays finding details, rationale, and navigates to affected parameters', () => {
    const finding: Finding = {
      id: 'finding-c03',
      check_id: 'C-03',
      check_title: 'Cross-Document Parameter Discrepancy Detection',
      severity: 'action_required',
      outcome: 'needs_attention_conflicting',
      summary: 'Conflicting values discovered between specification sheet and mass budget.',
      details: 'CAD model states 3.82 kg while launch specification states 4.15 kg.',
      affected_evidence_keys: ['physical.total_mass_kg'],
      recommendation: 'Reconcile mass budget with payload manifest before review.',
    };

    const handleNavigate = vi.fn();

    render(
      <FindingCard
        finding={finding}
        decisionRecorded={false}
        onNavigateToEvidence={handleNavigate}
      />
    );

    expect(screen.getByText('C-03')).toBeInTheDocument();
    expect(screen.getByText('Cross-Document Parameter Discrepancy Detection')).toBeInTheDocument();
    expect(screen.getByText(/Conflicting values discovered/i)).toBeInTheDocument();
    expect(screen.getByText(/CAD model states 3.82 kg/i)).toBeInTheDocument();

    const paramBtn = screen.getByRole('button', { name: /physical\.total_mass_kg/i });
    expect(paramBtn).toBeInTheDocument();

    fireEvent.click(paramBtn);
    expect(handleNavigate).toHaveBeenCalledWith('physical.total_mass_kg');
  });

  it('FindingsView filters findings by outcome and severity and notifies on navigation', () => {
    const checkRun = executeProfileChecks(ASTERIA_3_MISSION, ASTERIA_3_EVIDENCE);
    const handleNavigate = vi.fn();
    const handleProceed = vi.fn();
    const handleBack = vi.fn();

    render(
      <FindingsView
        checkRun={checkRun}
        decisionsMap={{ 'C-03': true }}
        onNavigateToEvidence={handleNavigate}
        onProceedToReview={handleProceed}
        onBackToGate={handleBack}
      />
    );

    // Initial state: all 6 findings
    expect(screen.getByText('C-01')).toBeInTheDocument();
    expect(screen.getByText('C-02')).toBeInTheDocument();
    expect(screen.getByText('C-03')).toBeInTheDocument();

    // Filter by outcome: needs_attention
    const outcomeSelect = screen.getByLabelText(/filter findings by outcome/i);
    fireEvent.change(outcomeSelect, { target: { value: 'needs_attention' } });

    expect(screen.getByText('C-01')).toBeInTheDocument();
    expect(screen.getByText('C-03')).toBeInTheDocument();
    expect(screen.queryByText('C-02')).not.toBeInTheDocument(); // C-02 is documented

    // Filter by outcome: documented
    fireEvent.change(outcomeSelect, { target: { value: 'documented' } });
    expect(screen.getByText('C-02')).toBeInTheDocument();
    expect(screen.queryByText('C-01')).not.toBeInTheDocument();
    expect(screen.queryByText('C-03')).not.toBeInTheDocument();

    // Reset filter and test proceed to review
    fireEvent.change(outcomeSelect, { target: { value: 'all' } });
    const proceedBtn = screen.getByRole('button', { name: /proceed to human review/i });
    fireEvent.click(proceedBtn);
    expect(handleProceed).toHaveBeenCalledTimes(1);

    // Test back button
    const backBtn = screen.getByRole('button', { name: /back to profile gate/i });
    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('ProfileGateCard renders stale evaluation warning when isStale is true', () => {
    const checkRun = executeProfileChecks(ASTERIA_3_MISSION, ASTERIA_3_EVIDENCE);

    render(
      <ProfileGateCard
        mission={ASTERIA_3_MISSION}
        profile={DEMO_PROFILE}
        checkRun={checkRun}
        isStale={true}
        onRunChecks={vi.fn()}
      />
    );

    expect(screen.getByText(/Stale \(Evidence Changed\)/i)).toBeInTheDocument();
  });

  it('passes axe accessibility checks on ProfileGateCard and FindingsView', async () => {
    const checkRun = executeProfileChecks(ASTERIA_3_MISSION, ASTERIA_3_EVIDENCE);

    const { container: gateContainer } = render(
      <ProfileGateCard
        mission={ASTERIA_3_MISSION}
        profile={DEMO_PROFILE}
        checkRun={checkRun}
        isStale={false}
        onRunChecks={vi.fn()}
      />
    );

    const gateResults = await axe.run(gateContainer);
    expect(gateResults.violations).toHaveLength(0);

    const { container: findingsContainer } = render(
      <FindingsView
        checkRun={checkRun}
        decisionsMap={{}}
        onNavigateToEvidence={vi.fn()}
        onProceedToReview={vi.fn()}
        onBackToGate={vi.fn()}
      />
    );

    const findingsResults = await axe.run(findingsContainer);
    expect(findingsResults.violations).toHaveLength(0);
  });
});
