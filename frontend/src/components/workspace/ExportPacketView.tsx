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
      `orbitscore-dossier-${mission.id}.md`,
      'text/markdown;charset=utf-8'
    );
  };

  const handleDownloadJson = () => {
    downloadFile(
      jsonContent,
      `orbitscore-dossier-${mission.id}.json`,
      'application/json;charset=utf-8'
    );
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
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
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Dossier Card */}
      <section className={styles.card} aria-labelledby="dossier-title">
        <div className={styles.kicker}>Stage 6 • Complete Cited Evidence Dossier</div>
        <div className={styles.titleRow}>
          <div>
            <h2 id="dossier-title" className={styles.title}>
              {mission.name} Review Dossier
            </h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Export ID: <code>{packet.metadata.export_id}</code> • Generated: {new Date(packet.exported_at).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Mandatory Scope Callout */}
        <div
          role="note"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-3)',
            background: 'var(--color-surface-sunken)',
            border: '1px solid var(--color-border-subtle)',
            borderLeft: '3px solid var(--color-brand-cyan)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <ShieldAlert size={20} color="var(--color-brand-cyan)" aria-hidden="true" />
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
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
            <FileText size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} aria-hidden="true" />
            <span>Formatted Dossier View</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'markdown'}
            className={`${styles.tabBtn} ${activeTab === 'markdown' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('markdown')}
          >
            <Code2 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} aria-hidden="true" />
            <span>Raw Markdown (.md)</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'json'}
            className={`${styles.tabBtn} ${activeTab === 'json' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('json')}
          >
            <Code2 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} aria-hidden="true" />
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
                      <td className={styles.td} style={{ width: '240px', fontWeight: 600 }}>Vehicle Class / Form Factor</td>
                      <td className={styles.td}>{mission.object_type} ({mission.form_factor})</td>
                    </tr>
                    <tr>
                      <td className={styles.td} style={{ fontWeight: 600 }}>Target Orbit</td>
                      <td className={styles.td}>{mission.target_orbit}</td>
                    </tr>
                    <tr>
                      <td className={styles.td} style={{ fontWeight: 600 }}>Baseline Mass Budget</td>
                      <td className={styles.td}>{mission.mass_budget_kg} kg</td>
                    </tr>
                    <tr>
                      <td className={styles.td} style={{ fontWeight: 600 }}>Applied Inspection Profile</td>
                      <td className={styles.td}>{profile.title} ({profile.id} {profile.version})</td>
                    </tr>
                    <tr>
                      <td className={styles.td} style={{ fontWeight: 600 }}>Input Snapshot Hash</td>
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
                          {item.source_doc_ref && <div><code style={{ fontSize: '10px' }}>{item.source_doc_ref}</code></div>}
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
                <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
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
                <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                  No open issues recorded.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Raw Markdown */}
        {activeTab === 'markdown' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-2)' }}>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-2)' }}>
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
