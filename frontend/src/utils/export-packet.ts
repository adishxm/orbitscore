import {
  Mission,
  Profile,
  CheckRun,
  ReviewDecision,
  OpenIssue,
  ExportPacket,
} from '../types/domain';

export const MANDATORY_DISCLAIMER =
  'Despite the name, OrbitScore does not score or certify missions; it organizes evidence for human review.';

export const STANDARD_DISCLAIMERS: string[] = [
  MANDATORY_DISCLAIMER,
  'SYNTHETIC DEMO DATA: All parameters, measurements, documents, and orbital data in this review packet are synthetic fixture data for demonstration purposes only.',
  'This cited evidence review packet is compiled for qualified engineering review prior to formal mission milestones.',
  'Automated findings reflect deterministic consistency checks against declared profile boundaries only, not a safety or compliance assessment.',
  'Technical decisions, waivers, and mitigations are the sole authority of designated human reviewers.',
];

export function buildExportPacket(
  mission: Mission,
  profile: Profile,
  checkRun: CheckRun,
  decisions: ReviewDecision[],
  openIssues: OpenIssue[]
): ExportPacket {
  const exportTimestamp = new Date().toISOString();
  const exportId = `dossier-${mission.id}-${Date.now().toString(36)}`;

  return {
    schema_version: '1.0.0',
    exported_at: exportTimestamp,
    metadata: {
      app_version: '0.1.0',
      export_id: exportId,
      export_engine: 'OrbitScore-Deterministic-Core-v1',
    },
    mission: { ...mission },
    profile: {
      id: profile.id,
      version: profile.version,
      title: profile.title,
    },
    check_run: { ...checkRun },
    decisions: [...decisions],
    open_issues: [...openIssues],
    disclaimers: [...STANDARD_DISCLAIMERS],
  };
}

export function exportPacketToJson(packet: ExportPacket): string {
  return JSON.stringify(packet, null, 2);
}

export function exportPacketToMarkdown(packet: ExportPacket): string {
  const lines: string[] = [];

  // Title and Header
  lines.push(`# Synthetic Demo Review Packet: ${packet.mission.name}`);
  lines.push(``);
  lines.push(`**CLASSIFICATION**: SYNTHETIC DEMO DATA — DRAFT EVIDENCE SUMMARY FOR HUMAN REVIEW`);
  lines.push(``);
  lines.push(`> [!NOTE]`);
  lines.push(`> **Review Boundary Notice**: ${packet.disclaimers[0]}`);
  lines.push(`> **Demonstration Boundary**: ${packet.disclaimers[1]}`);
  lines.push(``);

  // Metadata Table
  lines.push(`## 1. Dossier Metadata`);
  lines.push(``);
  lines.push(`| Field | Value |`);
  lines.push(`| :--- | :--- |`);
  lines.push(`| **Dossier Identifier** | \`${packet.metadata.export_id}\` |`);
  lines.push(`| **Export Timestamp** | ${packet.exported_at} |`);
  lines.push(`| **Schema Version** | \`${packet.schema_version}\` |`);
  lines.push(`| **Engine Generator** | ${packet.metadata.export_engine} |`);
  lines.push(`| **Input Snapshot Hash** | \`${packet.check_run.input_snapshot_hash}\` |`);
  lines.push(``);

  // Mission Context
  lines.push(`## 2. Mission Context Baseline`);
  lines.push(``);
  lines.push(`| Parameter | Specification |`);
  lines.push(`| :--- | :--- |`);
  lines.push(`| **Mission Name** | ${packet.mission.name} |`);
  lines.push(`| **Mission Identifier** | \`${packet.mission.id}\` |`);
  lines.push(`| **Vehicle Class** | ${packet.mission.object_type} |`);
  lines.push(`| **Form Factor** | ${packet.mission.form_factor} |`);
  lines.push(`| **Target Orbit** | ${packet.mission.target_orbit} |`);
  lines.push(`| **Baseline Mass Budget** | ${packet.mission.mass_budget_kg} kg |`);
  lines.push(`| **Baseline Date Threshold** | ${packet.mission.baseline_threshold_date} |`);
  lines.push(``);

  // Applied Profile
  lines.push(`## 3. Applied Evaluation Profile`);
  lines.push(``);
  lines.push(`- **Profile ID**: \`${packet.profile.id}\``);
  lines.push(`- **Profile Version**: \`${packet.profile.version}\``);
  lines.push(`- **Profile Title**: ${packet.profile.title}`);
  lines.push(`- **Applicability Status**: ${packet.check_run.is_applicable ? 'APPLICABLE' : 'OUT OF PROFILE BOUNDARY'}`);
  lines.push(``);

  // Automated Findings
  lines.push(`## 4. Automated Deterministic Consistency Findings`);
  lines.push(``);
  lines.push(`The software inspection generated ${packet.check_run.findings.length} findings from immutable primary evidence:`);
  lines.push(``);
  lines.push(`| Check ID | Check Title | Severity | Outcome | Affected Parameters | Summary |`);
  lines.push(`| :--- | :--- | :--- | :--- | :--- | :--- |`);
  for (const f of packet.check_run.findings) {
    const params = f.affected_evidence_keys.map((k) => `\`${k}\``).join(', ') || '—';
    lines.push(
      `| **${f.check_id}** | ${f.check_title} | \`${f.severity.toUpperCase()}\` | \`${f.outcome}\` | ${params} | ${f.summary} |`
    );
  }
  lines.push(``);

  // Cited Evidence Register
  lines.push(`## 5. Primary Cited Evidence Register`);
  lines.push(``);
  lines.push(`Complete record of cited primary documents supporting mission parameters:`);
  lines.push(``);
  lines.push(
    `| Parameter Key | Parameter Label | Value | Primary Source Document | Reference / Date | Page / Locator | State | Reviewer Confirmation |`
  );
  lines.push(
    `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |`
  );

  for (const item of packet.check_run.evidence_snapshot) {
    const refDate = `${item.source_doc_ref || 'N/A'} (${item.source_doc_date || 'Undated'})`;
    const loc = item.locator || (item.page_number ? `p. ${item.page_number}` : 'N/A');
    const reviewer = item.human_confirmed_by
      ? `${item.human_confirmed_by}`
      : 'Unconfirmed';
    lines.push(
      `| \`${item.parameter_key}\` | ${item.label} | **${item.value}** ${item.unit || ''} | ${item.source_doc_title} | ${refDate} | ${loc} | \`${item.state}\` | ${reviewer} |`
    );
  }
  lines.push(``);

  // Human Review Decisions
  lines.push(`## 6. Human Engineering Review Decisions`);
  lines.push(``);
  lines.push(`Designated engineering authorities recorded the following technical decisions:`);
  lines.push(``);
  if (packet.decisions.length === 0) {
    lines.push(`*No formal review decisions recorded.*`);
  } else {
    lines.push(
      `| Finding ID | Review Decision | Reviewer | Engineering Role | Timestamp | Technical Rationale |`
    );
    lines.push(
      `| :--- | :--- | :--- | :--- | :--- | :--- |`
    );
    for (const d of packet.decisions) {
      lines.push(
        `| \`${d.finding_id}\` | **${d.decision.replace(/_/g, ' ').toUpperCase()}** | ${d.reviewer_name} | ${d.reviewer_role} | ${d.recorded_at} | ${d.rationale} |`
      );
    }
  }
  lines.push(``);

  // Open Issues & Action Items
  lines.push(`## 7. Open Engineering Issues & Mitigations`);
  lines.push(``);
  if (packet.open_issues.length === 0) {
    lines.push(`*No outstanding open issues or action items recorded.*`);
  } else {
    lines.push(
      `| Action Item Title | Linked Finding | Assignee | Target Date | Status |`
    );
    lines.push(
      `| :--- | :--- | :--- | :--- | :--- |`
    );
    for (const iss of packet.open_issues) {
      lines.push(
        `| ${iss.title} | \`${iss.finding_id}\` | ${iss.assigned_to} | ${iss.due_date} | \`${iss.status.toUpperCase()}\` |`
      );
    }
  }
  lines.push(``);

  // Disclaimers and Limitations
  lines.push(`## 8. Programmatic Limitations & Legal Disclaimers`);
  lines.push(``);
  for (const disc of packet.disclaimers) {
    lines.push(`- ${disc}`);
  }
  lines.push(``);

  return lines.join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
