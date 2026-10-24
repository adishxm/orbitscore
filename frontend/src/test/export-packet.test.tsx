import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import {
  buildExportPacket,
  exportPacketToJson,
  exportPacketToMarkdown,
  MANDATORY_DISCLAIMER,
} from '../utils/export-packet';
import { ExportPacketView } from '../components/workspace/ExportPacketView';
import { DEMO_PROFILE } from '../profiles/demo-evidence-completeness';
import { ASTERIA_3_MISSION, ASTERIA_3_EVIDENCE } from '../fixtures/asteria-3';
import { executeProfileChecks } from '../profiles/demo-evidence-completeness';
import { ReviewDecision, OpenIssue } from '../types/domain';

const MOCK_DECISIONS: ReviewDecision[] = [
  {
    id: 'dec-1',
    finding_id: 'finding-c01',
    decision: 'mitigation_filed',
    rationale: 'Deployment window pending launch provider manifest freeze.',
    reviewer_name: 'S. Thorne',
    reviewer_role: 'Lead Systems Engineer',
    recorded_at: '2026-10-24T12:00:00Z',
  },
  {
    id: 'dec-2',
    finding_id: 'finding-c03',
    decision: 'accepted_as_is',
    rationale: 'Mass discrepancy of 0.33 kg accepted within dispenser payload envelope.',
    reviewer_name: 'Dr. Jane Vance',
    reviewer_role: 'Chief Engineer',
    recorded_at: '2026-10-24T12:30:00Z',
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
];

describe('Slice 8: Cited Export Packet Generator & Print Stylesheet', () => {
  const checkRun = executeProfileChecks(ASTERIA_3_MISSION, ASTERIA_3_EVIDENCE);

  it('buildExportPacket constructs a complete, valid ExportPacket', () => {
    const packet = buildExportPacket(
      ASTERIA_3_MISSION,
      DEMO_PROFILE,
      checkRun,
      MOCK_DECISIONS,
      MOCK_ISSUES
    );

    expect(packet.schema_version).toBe('1.0.0');
    expect(packet.metadata.app_version).toBe('0.1.0');
    expect(packet.metadata.export_id).toContain('dossier-asteria-3');
    expect(packet.mission.name).toBe(ASTERIA_3_MISSION.name);
    expect(packet.profile.id).toBe(DEMO_PROFILE.id);
    expect(packet.check_run.findings.length).toBe(checkRun.findings.length);
    expect(packet.decisions).toHaveLength(2);
    expect(packet.open_issues).toHaveLength(1);
    expect(packet.disclaimers[0]).toBe(MANDATORY_DISCLAIMER);
  });

  it('exportPacketToJson produces valid parseable JSON', () => {
    const packet = buildExportPacket(
      ASTERIA_3_MISSION,
      DEMO_PROFILE,
      checkRun,
      MOCK_DECISIONS,
      MOCK_ISSUES
    );

    const json = exportPacketToJson(packet);
    const parsed = JSON.parse(json);

    expect(parsed.schema_version).toBe('1.0.0');
    expect(parsed.mission.id).toBe('asteria-3');
    expect(parsed.check_run.findings).toHaveLength(6);
    expect(parsed.decisions[0].decision).toBe('mitigation_filed');
  });

  it('exportPacketToMarkdown produces complete formatted dossier with required tables and no banned words', () => {
    const packet = buildExportPacket(
      ASTERIA_3_MISSION,
      DEMO_PROFILE,
      checkRun,
      MOCK_DECISIONS,
      MOCK_ISSUES
    );

    const md = exportPacketToMarkdown(packet);

    // Verify sections
    expect(md).toContain('# OrbitScore Cited Evidence Review Dossier');
    expect(md).toContain('## 1. Dossier Metadata');
    expect(md).toContain('## 2. Mission Context Baseline');
    expect(md).toContain('## 3. Applied Evaluation Profile');
    expect(md).toContain('## 4. Automated Deterministic Consistency Findings');
    expect(md).toContain('## 5. Primary Cited Evidence Register');
    expect(md).toContain('## 6. Human Engineering Review Decisions');
    expect(md).toContain('## 7. Open Engineering Issues & Mitigations');
    expect(md).toContain('## 8. Programmatic Limitations & Legal Disclaimers');

    // Verify mandatory disclaimer
    expect(md).toContain(MANDATORY_DISCLAIMER);

    // Verify cited primary documents
    expect(md).toContain('Asteria-3 Master Interface Control Document');
    expect(md).toContain('Battery Vendor Acceptance Screening Document');
  });

  it('ExportPacketView renders summary metrics, toggles tabs, and triggers print/download', () => {
    const handleBack = vi.fn();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <ExportPacketView
        mission={ASTERIA_3_MISSION}
        profile={DEMO_PROFILE}
        checkRun={checkRun}
        decisions={MOCK_DECISIONS}
        openIssues={MOCK_ISSUES}
        onBackToReview={handleBack}
      />
    );

    // Verify metrics
    expect(screen.getByText('Primary Evidence Items')).toBeInTheDocument();
    expect(screen.getByText('Automated Findings')).toBeInTheDocument();
    expect(screen.getByText('Human Sign-Offs')).toBeInTheDocument();
    expect(screen.getByText('Open Action Items')).toBeInTheDocument();

    // Verify back navigation
    const backBtn = screen.getByRole('button', { name: /Back to Human Review/i });
    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalledTimes(1);

    // Verify print call
    const printBtn = screen.getByRole('button', { name: /Print Dossier/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalledTimes(1);

    // Switch to Raw Markdown tab
    const mdTab = screen.getByRole('tab', { name: /Raw Markdown/i });
    fireEvent.click(mdTab);
    expect(screen.getByRole('button', { name: /Save Markdown/i })).toBeInTheDocument();

    // Switch to Raw JSON tab
    const jsonTab = screen.getByRole('tab', { name: /Raw JSON/i });
    fireEvent.click(jsonTab);
    expect(screen.getByRole('button', { name: /Save JSON/i })).toBeInTheDocument();

    printSpy.mockRestore();
  });

  it('passes axe accessibility checks on ExportPacketView', async () => {
    const { container } = render(
      <ExportPacketView
        mission={ASTERIA_3_MISSION}
        profile={DEMO_PROFILE}
        checkRun={checkRun}
        decisions={MOCK_DECISIONS}
        openIssues={MOCK_ISSUES}
        onBackToReview={vi.fn()}
      />
    );

    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });
});
