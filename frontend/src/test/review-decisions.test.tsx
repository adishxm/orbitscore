import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { ReviewDecisionForm } from '../components/workspace/ReviewDecisionForm';
import { OpenIssuesList } from '../components/workspace/OpenIssuesList';
import { ExportGateBlocker } from '../components/workspace/ExportGateBlocker';
import { Finding, ReviewDecision, OpenIssue } from '../types/domain';

const MOCK_FINDINGS: Finding[] = [
  {
    id: 'finding-c01',
    check_id: 'C-01',
    check_title: 'Mandatory Mission Baseline Parameters',
    outcome: 'needs_attention_missing',
    severity: 'action_required',
    summary: 'Missing 1 mandatory baseline parameter: deployment_epoch_target',
    details: 'The mission baseline lacks target epoch.',
    affected_evidence_keys: ['mission.deployment_epoch_target'],
    recommendation: 'Specify target launch window.',
  },
  {
    id: 'finding-c02',
    check_id: 'C-02',
    check_title: 'Standard Physical Units Validation',
    outcome: 'documented',
    severity: 'info',
    summary: 'All units valid',
    details: 'SI units properly declared.',
    affected_evidence_keys: ['physical.mass_wet_kg'],
    recommendation: '',
  },
  {
    id: 'finding-c03',
    check_id: 'C-03',
    check_title: 'Cross-Document Parameter Discrepancy Detection',
    outcome: 'needs_attention_conflicting',
    severity: 'action_required',
    summary: 'Mass conflict: 4.15 kg vs 3.82 kg',
    details: 'CAD model states 3.82 kg while launch specification states 4.15 kg.',
    affected_evidence_keys: ['physical.total_mass_kg'],
    recommendation: 'Reconcile mass budget.',
  },
];

const MOCK_DECISIONS: ReviewDecision[] = [
  {
    id: 'dec-1',
    finding_id: 'finding-c01',
    decision: 'mitigation_filed',
    rationale: 'Deployment window pending launch provider manifest freeze; tracked in issue ISS-01.',
    reviewer_name: 'S. Thorne',
    reviewer_role: 'Lead Systems Engineer',
    recorded_at: '2026-10-24T12:00:00Z',
  },
];

const MOCK_ISSUES: OpenIssue[] = [
  {
    id: 'iss-1',
    finding_id: 'finding-c01',
    title: 'Obtain ride-share manifest launch slot confirmation',
    assigned_to: 'Mission Operations Lead',
    due_date: '2026-11-15',
    status: 'open',
  },
  {
    id: 'iss-2',
    finding_id: 'finding-c03',
    title: 'Weigh qualification mass model on calibrated load cell',
    assigned_to: 'Mechanical Lead',
    due_date: '2026-11-01',
    status: 'addressed',
  },
];

describe('Slice 7: Human Review Decisions, Open Issues & Export Gate', () => {
  it('ReviewDecisionForm displays findings, authority callout, and submits decision', () => {
    const handleRecord = vi.fn();

    render(
      <ReviewDecisionForm
        findings={MOCK_FINDINGS}
        decisions={[]}
        onRecordDecision={handleRecord}
      />
    );

    // Verify authority callout
    expect(
      screen.getByText(/Engineering Authority Boundary/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/only qualified human engineers make review decisions/i)
    ).toBeInTheDocument();

    // Verify tabs
    expect(screen.getByRole('tab', { name: /C-01:/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /C-03:/i })).toBeInTheDocument();

    // Select C-03 tab
    const tabC03 = screen.getByRole('tab', { name: /C-03:/i });
    fireEvent.click(tabC03);

    expect(screen.getByText(/Mass conflict: 4.15 kg vs 3.82 kg/i)).toBeInTheDocument();

    // Fill form
    const reviewerNameInput = screen.getByLabelText(/Reviewer Name \*/i);
    const reviewerRoleInput = screen.getByLabelText(/Reviewer Engineering Role \*/i);
    const rationaleInput = screen.getByLabelText(/Engineering Technical Rationale \*/i);
    const decisionSelect = screen.getByLabelText(/Review Decision Type \*/i);

    fireEvent.change(reviewerNameInput, { target: { value: 'Dr. Jane Vance' } });
    fireEvent.change(reviewerRoleInput, { target: { value: 'Chief Engineer' } });
    fireEvent.change(rationaleInput, {
      target: { value: 'Launch adapter dispenser accepts up to 4.5 kg; 4.15 kg satisfies margin.' },
    });
    fireEvent.change(decisionSelect, { target: { value: 'waiver_granted' } });

    const submitBtn = screen.getByRole('button', { name: /Record Review Decision/i });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    expect(handleRecord).toHaveBeenCalledWith({
      finding_id: 'finding-c03',
      decision: 'waiver_granted',
      reviewer_name: 'Dr. Jane Vance',
      reviewer_role: 'Chief Engineer',
      rationale: 'Launch adapter dispenser accepts up to 4.5 kg; 4.15 kg satisfies margin.',
    });
  });

  it('ReviewDecisionForm renders status badge when decision is already recorded', () => {
    render(
      <ReviewDecisionForm
        findings={MOCK_FINDINGS}
        decisions={MOCK_DECISIONS}
        onRecordDecision={vi.fn()}
        selectedFindingId="finding-c01"
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent(/Decision Recorded:/i);
    expect(screen.getByRole('status')).toHaveTextContent(/MITIGATION FILED/i);
    expect(screen.getByRole('status')).toHaveTextContent(/S. Thorne/i);
  });

  it('OpenIssuesList renders issues, allows toggling status and adding a new issue', () => {
    const handleAdd = vi.fn();
    const handleUpdate = vi.fn();

    render(
      <OpenIssuesList
        issues={MOCK_ISSUES}
        findings={MOCK_FINDINGS}
        onAddIssue={handleAdd}
        onUpdateStatus={handleUpdate}
      />
    );

    expect(
      screen.getByText('Obtain ride-share manifest launch slot confirmation')
    ).toBeInTheDocument();
    expect(screen.getByText('OPEN')).toBeInTheDocument();
    expect(screen.getByText('ADDRESSED')).toBeInTheDocument();

    // Toggle status of first issue
    const markAddressedBtn = screen.getByRole('button', { name: /Mark Addressed/i });
    fireEvent.click(markAddressedBtn);
    expect(handleUpdate).toHaveBeenCalledWith('iss-1', 'addressed');

    // Open add issue form
    const toggleFormBtn = screen.getByRole('button', { name: /Add Action Item/i });
    fireEvent.click(toggleFormBtn);

    // Fill new issue
    const titleInput = screen.getByLabelText(/Action Item Title \*/i);
    const assigneeInput = screen.getByLabelText(/Assignee \*/i);
    const dueDateInput = screen.getByLabelText(/Target Date \*/i);

    fireEvent.change(titleInput, { target: { value: 'Inspect solar panel solder joints' } });
    fireEvent.change(assigneeInput, { target: { value: 'Power Subsystem Lead' } });
    fireEvent.change(dueDateInput, { target: { value: '2026-11-20' } });

    const saveBtn = screen.getByRole('button', { name: /Save Action Item/i });
    fireEvent.click(saveBtn);

    expect(handleAdd).toHaveBeenCalledWith({
      title: 'Inspect solar panel solder joints',
      assigned_to: 'Power Subsystem Lead',
      due_date: '2026-11-20',
      status: 'open',
      finding_id: 'general',
    });
  });

  it('ExportGateBlocker blocks export when action-required findings lack sign-off', () => {
    const handleSelect = vi.fn();
    const handleProceed = vi.fn();

    // C-01 is signed, but C-03 is pending
    render(
      <ExportGateBlocker
        findings={MOCK_FINDINGS}
        decisions={MOCK_DECISIONS}
        onSelectFinding={handleSelect}
        onProceedToExport={handleProceed}
      />
    );

    expect(
      screen.getByText(/Export Dossier Gate: Sign-Off Pending/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Pending Findings Requiring Human Review Decision \(1\)/i)
    ).toBeInTheDocument();

    const proceedBtn = screen.getByRole('button', { name: /Proceed to Export Dossier/i });
    expect(proceedBtn).toBeDisabled();

    // Click Record Decision button for C-03
    const recordBtn = screen.getByRole('button', { name: /Record Decision/i });
    fireEvent.click(recordBtn);
    expect(handleSelect).toHaveBeenCalledWith('finding-c03');
  });

  it('ExportGateBlocker clears gate when all action-required findings have valid sign-offs', () => {
    const handleProceed = vi.fn();

    const allDecisions: ReviewDecision[] = [
      ...MOCK_DECISIONS,
      {
        id: 'dec-2',
        finding_id: 'finding-c03',
        decision: 'accepted_as_is',
        rationale: 'Mass margin verified with launcher envelope.',
        reviewer_name: 'Lead Mechanical Engineer',
        reviewer_role: 'Structures Lead',
        recorded_at: '2026-10-24T13:00:00Z',
      },
    ];

    render(
      <ExportGateBlocker
        findings={MOCK_FINDINGS}
        decisions={allDecisions}
        onSelectFinding={vi.fn()}
        onProceedToExport={handleProceed}
      />
    );

    expect(
      screen.getByText(/Export Dossier Gate: Ready for Export Packet/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/2 of 2 action-required items evaluated and signed off/i)
    ).toBeInTheDocument();

    const proceedBtn = screen.getByRole('button', { name: /Proceed to Export Dossier/i });
    expect(proceedBtn).not.toBeDisabled();

    fireEvent.click(proceedBtn);
    expect(handleProceed).toHaveBeenCalledTimes(1);
  });

  it('passes axe accessibility checks on ReviewDecisionForm, OpenIssuesList, and ExportGateBlocker', async () => {
    const { container: formContainer } = render(
      <ReviewDecisionForm
        findings={MOCK_FINDINGS}
        decisions={MOCK_DECISIONS}
        onRecordDecision={vi.fn()}
      />
    );
    const formResults = await axe.run(formContainer);
    expect(formResults.violations).toHaveLength(0);

    const { container: issuesContainer } = render(
      <OpenIssuesList
        issues={MOCK_ISSUES}
        findings={MOCK_FINDINGS}
        onAddIssue={vi.fn()}
        onUpdateStatus={vi.fn()}
      />
    );
    const issuesResults = await axe.run(issuesContainer);
    expect(issuesResults.violations).toHaveLength(0);

    const { container: gateContainer } = render(
      <ExportGateBlocker
        findings={MOCK_FINDINGS}
        decisions={MOCK_DECISIONS}
        onSelectFinding={vi.fn()}
        onProceedToExport={vi.fn()}
      />
    );
    const gateResults = await axe.run(gateContainer);
    expect(gateResults.violations).toHaveLength(0);
  });
});
