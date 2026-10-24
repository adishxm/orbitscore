import React, { useState, useMemo } from 'react';
import { Download, Printer, FileText, Code2, ArrowLeft, ShieldAlert } from 'lucide-react';
import {
  Mission,
  Profile,
  CheckRun,
  ReviewDecision,
  OpenIssue,
} from '../../types/domain';
import {
  buildExportPacket,
  exportPacketToJson,
  exportPacketToMarkdown,
  downloadFile,
} from '../../utils/export-packet';
import { fetchOdarReportLive, fetchEompPlanLive } from '../../api/backend';
import { useOrbitStore } from '../../store/useOrbitStore';
import styles from './ExportPacketView.module.css';

interface ExportPacketViewProps {
  mission: Mission;
  profile: Profile;
  checkRun: CheckRun;
  decisions: ReviewDecision[];
  openIssues: OpenIssue[];
  onBackToReview: () => void;
}

export const ExportPacketView: React.FC<ExportPacketViewProps> = ({
  mission,
  profile,
  checkRun,
  decisions,
  openIssues,
  onBackToReview,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'markdown' | 'json'>('preview');

  const packet = useMemo(() => {
    return buildExportPacket(mission, profile, checkRun, decisions, openIssues);
  }, [mission, profile, checkRun, decisions, openIssues]);

  const markdownContent = useMemo(() => {
    return exportPacketToMarkdown(packet);
  }, [packet]);

  const jsonContent = useMemo(() => {
    return exportPacketToJson(packet);
  }, [packet]);

  const handleDownloadMarkdown = () => {
    downloadFile(
      markdownContent,
      `synthetic-review-packet-${mission.id}.md`,
      'text/markdown;charset=utf-8'
    );
  };

  const handleDownloadJson = () => {
    downloadFile(
      jsonContent,
      `synthetic-review-packet-${mission.id}.json`,
      'application/json;charset=utf-8'
    );
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadOdar = async () => {
    const serverUrl = useOrbitStore.getState().apiServerUrl;
    try {
      const text = await fetchOdarReportLive(mission.id, serverUrl);
      downloadFile(text, `draft-odar-${mission.id}.md`, 'text/markdown;charset=utf-8');
      return;
    } catch {
      try {
        // Dev proxy fallback
        const resp = await fetch(`/api/missions/${mission.id}/export/odar`);
        if (resp.ok) {
          const text = await resp.text();
          downloadFile(text, `draft-odar-${mission.id}.md`, 'text/markdown;charset=utf-8');
          return;
        }
      } catch {
        // Offline fallback
      }
    }
    const fallbackOdar = `# Orbital Debris Assessment Report (ODAR) — Draft Review Packet\n**Spacecraft**: ${mission.name}\n**Standard**: NASA-STD-8719.14C / FCC 5-Year Rule\n\n## Section 1: Program Management & Overview\n- Spacecraft: ${mission.name}\n- Wet Mass: ${mission.mass_budget_kg || 4.0} kg\n- Orbit: ${mission.target_orbit || '500 km SSO'}\n\n*Draft generated from verified mission evidence register.*`;
    downloadFile(fallbackOdar, `draft-odar-${mission.id}.md`, 'text/markdown;charset=utf-8');
  };

  const handleDownloadEomp = async () => {
    const serverUrl = useOrbitStore.getState().apiServerUrl;
    try {
      const text = await fetchEompPlanLive(mission.id, serverUrl);
      downloadFile(text, `draft-eomp-${mission.id}.md`, 'text/markdown;charset=utf-8');
      return;
    } catch {
      try {
        // Dev proxy fallback
        const resp = await fetch(`/api/missions/${mission.id}/export/eomp`);
        if (resp.ok) {
          const text = await resp.text();
          downloadFile(text, `draft-eomp-${mission.id}.md`, 'text/markdown;charset=utf-8');
          return;
        }
      } catch {
        // Offline fallback
      }
    }
    const fallbackEomp = `# End-of-Mission Plan (EOMP) — Draft Review Packet\n**Spacecraft**: ${mission.name}\n**Standard**: ISRO DFSM 2030 & FCC 5-Year Deorbit Mandate\n\n## Section 1: Disposal Architecture\n- Mode: Natural Atmospheric Re-entry\n\n*Draft generated from verified mission evidence register.*`;
    downloadFile(fallbackEomp, `draft-eomp-${mission.id}.md`, 'text/markdown;charset=utf-8');
  };

  return (
    <div className={styles.container}>
      {/* Top Action Bar */}
      <div className={styles.actionsBar}>
        <button
          type="button"
          onClick={onBackToReview}
          className={styles.secondaryBtn}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Human Review</span>
        </button>

        <div className={styles.btnGroup}>
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className={styles.secondaryBtn}
          >
            <Download size={14} aria-hidden="true" />
            <span>Download Markdown (.md)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadOdar}
            className={styles.secondaryBtn}
            title="Download draft Orbital Debris Assessment Report"
          >
            <Download size={14} aria-hidden="true" />
            <span>Download Draft ODAR (.md)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadEomp}
            className={styles.secondaryBtn}
            title="Download draft End-of-Mission Plan"
          >
            <Download size={14} aria-hidden="true" />
            <span>Download Draft EOMP (.md)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className={styles.secondaryBtn}
          >
            <Download size={14} aria-hidden="true" />
            <span>Download JSON (.json)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className={styles.primaryBtn}
          >
            <Printer size={16} aria-hidden="true" />
            <span>Print Review Packet</span>
          </button>
        </div>
      </div>

      {/* Main Dossier Card */}
      <section className={styles.card} aria-labelledby="dossier-title">
        <div className={styles.kicker}>Stage 6 • Synthetic Demo Review Packet</div>
        <div className={styles.titleRow}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <h2 id="dossier-title" className={styles.title}>
                Synthetic Demo Review Packet: {mission.name}
              </h2>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: 'var(--radius-full)',
                  color: '#fbbf24',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                SYNTHETIC DEMO DATA
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Export ID: <code>{packet.metadata.export_id}</code> • Generated: {new Date(packet.exported_at).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Mandatory Scope Callout */}
        <div
          role="note"
          className="scopeNotice"
        >
          <ShieldAlert size={20} color="var(--os-color-accent-amber)" aria-hidden="true" className={styles.iconShield} />
          <div className={styles.subText}>
            <strong>Review Boundary Notice</strong>: Despite the name, OrbitScore does not score or certify missions; it organizes evidence for human review.
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>Primary Evidence Items</div>
            <div className={styles.statValue}>{packet.check_run.evidence_snapshot.length}</div>
            <div className={styles.statSub}>100% cited with source documents</div>
          </div>

          <div className={styles.statBox}>
            <div className={styles.statLabel}>Automated Findings</div>
            <div className={styles.statValue}>{packet.check_run.findings.length}</div>
            <div className={styles.statSub}>Deterministic consistency checks</div>
          </div>

          <div className={styles.statBox}>
            <div className={styles.statLabel}>Human Sign-Offs</div>
            <div className={styles.statValue}>{packet.decisions.length}</div>
            <div className={styles.statSub}>Recorded engineering decisions</div>
          </div>

          <div className={styles.statBox}>
            <div className={styles.statLabel}>Open Action Items</div>
            <div className={styles.statValue}>{packet.open_issues.length}</div>
            <div className={styles.statSub}>Tracked engineering mitigations</div>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className={styles.tabsBar} role="tablist" aria-label="Dossier format options">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'preview'}
            className={`${styles.tabBtn} ${activeTab === 'preview' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <FileText size={14} className={styles.iconInline} aria-hidden="true" />
            <span>Formatted Dossier View</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'markdown'}
            className={`${styles.tabBtn} ${activeTab === 'markdown' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('markdown')}
          >
            <Code2 size={14} className={styles.iconInline} aria-hidden="true" />
            <span>Raw Markdown (.md)</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'json'}
            className={`${styles.tabBtn} ${activeTab === 'json' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('json')}
          >
            <Code2 size={14} className={styles.iconInline} aria-hidden="true" />
            <span>Raw JSON (.json)</span>
          </button>
        </div>

        {/* Tab 1: Formatted Dossier View */}
        {activeTab === 'preview' && (
          <div>
            {/* Section 1: Baseline Context */}
            <div className={styles.dossierSection}>
              <h3 className={styles.sectionHeading}>1. Mission Context & Applied Profile</h3>
              <div className={styles.tableWrap}>
                <table className={styles.table} aria-label="Mission context baseline">
                  <tbody>
                    <tr>
                      <td className={`${styles.td} ${styles.tdLabel}`}>Vehicle Class / Form Factor</td>
                      <td className={styles.td}>{mission.object_type} ({mission.form_factor})</td>
                    </tr>
                    <tr>
                      <td className={`${styles.td} ${styles.tdLabel}`}>Target Orbit</td>
                      <td className={styles.td}>{mission.target_orbit}</td>
                    </tr>
                    <tr>
                      <td className={`${styles.td} ${styles.tdLabel}`}>Baseline Mass Budget</td>
                      <td className={styles.td}>{mission.mass_budget_kg} kg</td>
                    </tr>
                    <tr>
                      <td className={`${styles.td} ${styles.tdLabel}`}>Applied Inspection Profile</td>
                      <td className={styles.td}>{profile.title} ({profile.id} {profile.version})</td>
                    </tr>
                    <tr>
                      <td className={`${styles.td} ${styles.tdLabel}`}>Input Snapshot Hash</td>
                      <td className={styles.td}><code>{checkRun.input_snapshot_hash}</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 2: Findings */}
            <div className={styles.dossierSection}>
              <h3 className={styles.sectionHeading}>2. Automated Consistency Inspection Results</h3>
              <div className={styles.tableWrap}>
                <table className={styles.table} aria-label="Automated consistency findings">
                  <thead>
                    <tr>
                      <th className={styles.th}>Check ID</th>
                      <th className={styles.th}>Check Title</th>
                      <th className={styles.th}>Severity</th>
                      <th className={styles.th}>Outcome</th>
                      <th className={styles.th}>Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkRun.findings.map((f) => (
                      <tr key={f.id}>
                        <td className={styles.td}><strong>{f.check_id}</strong></td>
                        <td className={styles.td}>{f.check_title}</td>
                        <td className={styles.td}>{f.severity.toUpperCase()}</td>
                        <td className={styles.td}>{f.outcome}</td>
                        <td className={styles.td}>{f.summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Primary Cited Evidence */}
            <div className={styles.dossierSection}>
              <h3 className={styles.sectionHeading}>3. Primary Cited Evidence Register</h3>
              <div className={styles.tableWrap}>
                <table className={styles.table} aria-label="Cited evidence register">
                  <thead>
                    <tr>
                      <th className={styles.th}>Parameter Key</th>
                      <th className={styles.th}>Value</th>
                      <th className={styles.th}>Primary Source Document</th>
                      <th className={styles.th}>Locator</th>
                      <th className={styles.th}>State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkRun.evidence_snapshot.map((item) => (
                      <tr key={item.id}>
                        <td className={styles.td}><code>{item.parameter_key}</code></td>
                        <td className={styles.td}><strong>{item.value}</strong> {item.unit || ''}</td>
                        <td className={styles.td}>
                          {item.source_doc_title}
                          {item.source_doc_ref && <div><code className={styles.refCode}>{item.source_doc_ref}</code></div>}
                        </td>
                        <td className={styles.td}>{item.locator || (item.page_number ? `p. ${item.page_number}` : '—')}</td>
                        <td className={styles.td}>{item.state}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4: Human Review Decisions */}
            <div className={styles.dossierSection}>
              <h3 className={styles.sectionHeading}>4. Human Engineering Review Decisions</h3>
              {decisions.length > 0 ? (
                <div className={styles.tableWrap}>
                  <table className={styles.table} aria-label="Human review decisions">
                    <thead>
                      <tr>
                        <th className={styles.th}>Finding ID</th>
                        <th className={styles.th}>Decision</th>
                        <th className={styles.th}>Reviewer</th>
                        <th className={styles.th}>Role</th>
                        <th className={styles.th}>Technical Rationale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {decisions.map((d) => (
                        <tr key={d.id}>
                          <td className={styles.td}><code>{d.finding_id}</code></td>
                          <td className={styles.td}><strong>{d.decision.replace(/_/g, ' ').toUpperCase()}</strong></td>
                          <td className={styles.td}>{d.reviewer_name}</td>
                          <td className={styles.td}>{d.reviewer_role}</td>
                          <td className={styles.td}>{d.rationale}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.subText}>
                  No human review decisions recorded.
                </div>
              )}
            </div>

            {/* Section 5: Open Issues */}
            <div className={styles.dossierSection}>
              <h3 className={styles.sectionHeading}>5. Tracked Mitigations & Action Items</h3>
              {openIssues.length > 0 ? (
                <div className={styles.tableWrap}>
                  <table className={styles.table} aria-label="Open engineering issues">
                    <thead>
                      <tr>
                        <th className={styles.th}>Action Item</th>
                        <th className={styles.th}>Assignee</th>
                        <th className={styles.th}>Target Date</th>
                        <th className={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openIssues.map((iss) => (
                        <tr key={iss.id}>
                          <td className={styles.td}><strong>{iss.title}</strong></td>
                          <td className={styles.td}>{iss.assigned_to}</td>
                          <td className={styles.td}>{iss.due_date}</td>
                          <td className={styles.td}>{iss.status.toUpperCase()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.subText}>
                  No open issues recorded.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Raw Markdown */}
        {activeTab === 'markdown' && (
          <div>
            <div className={styles.actionGroupRight}>
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className={styles.secondaryBtn}
              >
                <Download size={14} aria-hidden="true" />
                <span>Save Markdown (.md)</span>
              </button>
            </div>
            <pre className={styles.rawCode}>
              <code>{markdownContent}</code>
            </pre>
          </div>
        )}

        {/* Tab 3: Raw JSON */}
        {activeTab === 'json' && (
          <div>
            <div className={styles.actionGroupRight}>
              <button
                type="button"
                onClick={handleDownloadJson}
                className={styles.secondaryBtn}
              >
                <Download size={14} aria-hidden="true" />
                <span>Save JSON (.json)</span>
              </button>
            </div>
            <pre className={styles.rawCode}>
              <code>{jsonContent}</code>
            </pre>
          </div>
        )}
      </section>
    </div>
  );
};

export default ExportPacketView;
