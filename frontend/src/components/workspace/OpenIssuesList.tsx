import React, { useState } from 'react';
import { Plus, Check, Clock, AlertCircle } from 'lucide-react';
import { OpenIssue, OpenIssueStatus, Finding } from '../../types/domain';
import styles from './OpenIssuesList.module.css';

interface OpenIssuesListProps {
  issues: OpenIssue[];
  findings?: Finding[];
  onAddIssue: (issue: Omit<OpenIssue, 'id'>) => void;
  onUpdateStatus: (id: string, status: OpenIssueStatus) => void;
}

export const OpenIssuesList: React.FC<OpenIssuesListProps> = ({
  issues,
  findings = [],
  onAddIssue,
  onUpdateStatus,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [linkedFindingId, setLinkedFindingId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignedTo.trim() || !dueDate.trim()) return;

    onAddIssue({
      title: title.trim(),
      assigned_to: assignedTo.trim(),
      due_date: dueDate.trim(),
      status: 'open',
      finding_id: linkedFindingId || 'general',
    });

    setTitle('');
    setAssignedTo('');
    setDueDate('');
    setLinkedFindingId('');
    setIsAdding(false);
  };

  const openCount = issues.filter((i) => i.status === 'open').length;

  return (
    <section className={styles.card} aria-labelledby="issues-heading">
      <div className={styles.kicker}>Mitigation Tracking</div>
      <div className={styles.titleRow}>
        <div>
          <h2 id="issues-heading" className={styles.title}>
            Open Engineering Issues & Action Items
          </h2>
          <div className={styles.headerSubtitle}>
            Track assigned mitigations, pending lab tests, and documented technical actions.
          </div>
        </div>

        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus size={16} aria-hidden="true" />
          <span>{isAdding ? 'Close Action Form' : 'Add Action Item'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className={styles.addForm}>
          <div className={styles.formGrid}>
            <div>
              <label htmlFor="issue-title" className={styles.label}>
                Action Item Title *
              </label>
              <input
                id="issue-title"
                type="text"
                className={styles.input}
                placeholder="e.g. Schedule secondary TVAC thermal sensor test"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="issue-assignee" className={styles.label}>
                Assignee *
              </label>
              <input
                id="issue-assignee"
                type="text"
                className={styles.input}
                placeholder="e.g. J. Miller (Thermal Lead)"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="issue-due" className={styles.label}>
                Target Date *
              </label>
              <input
                id="issue-due"
                type="date"
                className={styles.input}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={!title.trim() || !assignedTo.trim() || !dueDate.trim()}
                className={styles.primaryBtn}
              >
                <span>Save Action Item</span>
              </button>
            </div>
          </div>

          {findings.length > 0 && (
            <div className={styles.findingSelectGroup}>
              <label htmlFor="linked-finding" className={styles.label}>
                Link to Automated Finding (Optional)
              </label>
              <select
                id="linked-finding"
                className={styles.select}
                value={linkedFindingId}
                onChange={(e) => setLinkedFindingId(e.target.value)}
              >
                <option value="">General (Not Linked)</option>
                {findings.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.check_id}: {f.check_title} ({f.severity.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </form>
      )}

      {issues.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table} aria-label="Open engineering issues">
            <thead>
              <tr>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Action Item</th>
                <th className={styles.th}>Linked Finding</th>
                <th className={styles.th}>Assignee</th>
                <th className={styles.th}>Target Date</th>
                <th className={`${styles.th} ${styles.thRight}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => {
                const linked = findings.find((f) => f.id === issue.finding_id);
                return (
                  <tr key={issue.id}>
                    <td className={styles.td}>
                      {issue.status === 'open' ? (
                        <span className={styles.statusOpen}>
                          <AlertCircle size={12} aria-hidden="true" />
                          <span>OPEN</span>
                        </span>
                      ) : (
                        <span className={styles.statusAddressed}>
                          <Check size={12} aria-hidden="true" />
                          <span>ADDRESSED</span>
                        </span>
                      )}
                    </td>
                    <td className={`${styles.td} ${styles.tdTitle}`}>
                      {issue.title}
                    </td>
                    <td className={styles.td}>
                      {linked ? (
                        <code>{linked.check_id}</code>
                      ) : (
                        <span className={styles.emptyPlaceholder}>—</span>
                      )}
                    </td>
                    <td className={styles.td}>{issue.assigned_to}</td>
                    <td className={styles.td}>
                      <Clock size={12} className={styles.iconInline} aria-hidden="true" />
                      {issue.due_date}
                    </td>
                    <td className={`${styles.td} ${styles.tdRight}`}>
                      <button
                        type="button"
                        className={styles.toggleBtn}
                        onClick={() =>
                          onUpdateStatus(
                            issue.id,
                            issue.status === 'open' ? 'addressed' : 'open'
                          )
                        }
                      >
                        {issue.status === 'open' ? 'Mark Addressed' : 'Reopen'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          No action items or open issues recorded. Add one above if mitigations or follow-up actions are required.
        </div>
      )}

      {issues.length > 0 && (
        <div className={styles.summaryBar}>
          <span>TOTAL: {issues.length}</span>
          <span className={openCount > 0 ? styles.statOpen : styles.statAddressed}>
            ● {openCount} Open Action Item(s)
          </span>
          <span className={styles.statAddressed}>
            ● {issues.length - openCount} Addressed
          </span>
        </div>
      )}
    </section>
  );
};

export default OpenIssuesList;
