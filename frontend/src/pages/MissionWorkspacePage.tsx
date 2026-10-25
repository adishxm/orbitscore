import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, ArrowRight, RotateCcw, Bot } from 'lucide-react';
import { useOrbitStore } from '../store/useOrbitStore';
import { Stepper, WorkspaceStep } from '../components/workspace/Stepper';
import { MissionContextCard } from '../components/workspace/MissionContextCard';
import { OrbitalContextCard } from '../components/workspace/OrbitalContextCard';
import { ReadinessIndexCard } from '../components/workspace/ReadinessIndexCard';
import { DataTable } from '../components/workspace/DataTable';
import { SidePanel } from '../components/workspace/SidePanel';
import { AddEvidenceModal } from '../components/workspace/AddEvidenceModal';
import { ProfileGateCard } from '../components/workspace/ProfileGateCard';
import { FindingsView } from '../components/workspace/FindingsView';
import { ReviewDecisionForm } from '../components/workspace/ReviewDecisionForm';
import { OpenIssuesList } from '../components/workspace/OpenIssuesList';
import { ExportGateBlocker } from '../components/workspace/ExportGateBlocker';
import { ExportPacketView } from '../components/workspace/ExportPacketView';
import { CounterfactualLab } from '../components/workspace/CounterfactualLab';
import { Agent37Copilot } from '../components/workspace/Agent37Copilot';
import { ASTERIA_3_MISSION } from '../fixtures/asteria-3';
import styles from './pages.module.css';

export const MissionWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const missionId = id || 'asteria-3';

  const {
    missions,
    evidence,
    activeMissionId,
    setActiveMission,
    activeProfile,
    checkRuns,
    isCheckRunStale,
    reviewDecisions,
    openIssues,
    selectedEvidenceId,
    selectEvidenceItem,
    confirmEvidenceItem,
    deleteEvidenceItem,
    addEvidenceItem,
    runChecks,
    recordDecision,
    addOpenIssue,
    updateOpenIssueStatus,
    resetDemo,
  } = useOrbitStore();

  const [currentStep, setCurrentStep] = useState<WorkspaceStep>('evidence');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAgent37Open, setIsAgent37Open] = useState(false);
  const [selectedReviewFindingId, setSelectedReviewFindingId] = useState<string>('');

  useEffect(() => {
    if (missionId !== activeMissionId) {
      setActiveMission(missionId);
    }
  }, [missionId, activeMissionId, setActiveMission]);

  const currentMission = missions[missionId] || ASTERIA_3_MISSION;
  const currentEvidence = evidence[missionId] || [];
  const currentCheckRun = checkRuns[missionId] || null;
  const isStale = Boolean(isCheckRunStale[missionId]);
  const currentDecisions = reviewDecisions[missionId] || [];
  const currentIssues = openIssues[missionId] || [];

  const selectedItem =
    currentEvidence.find((e) => e.id === selectedEvidenceId) || null;

  const decisionsMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const d of currentDecisions) {
      map[d.finding_id] = true;
    }
    return map;
  }, [currentDecisions]);

  const completedSteps: WorkspaceStep[] = ['context'];
  if (currentEvidence.length > 0) completedSteps.push('evidence');
  if (currentCheckRun) {
    completedSteps.push('profile');
    completedSteps.push('findings');
  }
  const actionRequiredFindings = (currentCheckRun?.findings || []).filter(
    (f) => f.severity === 'action_required'
  );
  const isReviewComplete =
    actionRequiredFindings.length > 0 &&
    actionRequiredFindings.every((f) =>
      currentDecisions.some((d) => d.finding_id === f.id && d.decision !== 'action_pending')
    );
  if (isReviewComplete) {
    completedSteps.push('review');
  }

  const stateCounts = useMemo(() => {
    return currentEvidence.reduce(
      (acc, item) => {
        acc[item.state] = (acc[item.state] || 0) + 1;
        return acc;
      },
      {
        confirmed: 0,
        unconfirmed: 0,
        conflicting: 0,
        stale: 0,
        missing: 0,
        out_of_scope: 0,
      } as Record<string, number>
    );
  }, [currentEvidence]);

  return (
    <div className={styles.pageRoot}>
      <div className="container">
        {/* 1. Top Bar: Breadcrumb, Synthetic Indicator, Demo Reset & Copilot */}
        <div className={styles.workspaceTopBar}>
          <Link
            to="/missions"
            className={styles.breadcrumbLink}
            aria-label="Return to all workspaces"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>All workspaces</span>
          </Link>

          <div className={styles.topBarActions}>
            <div className={styles.syntheticIndicator} role="status">
              <span className={styles.syntheticIndicatorDot} aria-hidden="true" />
              <span>Synthetic Demo Fixture • Stored locally in browser session</span>
            </div>

            <button
              type="button"
              onClick={() => resetDemo()}
              className={styles.resetButton}
              title="Restore pristine Asteria-3 synthetic fixture data"
              aria-label="Reset Demo Data"
            >
              <RotateCcw size={12} aria-hidden="true" />
              <span>Reset Demo Data</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAgent37Open(true)}
              className={styles.copilotButton}
              title="Open Agent 37 Mission Triage Copilot"
            >
              <Bot size={13} aria-hidden="true" />
              <span>Agent 37 Copilot</span>
            </button>
          </div>
        </div>

        {/* 2. Workspace Title & Subtitle */}
        <header className={styles.workspaceHeader}>
          <div className={styles.workspaceTitleGroup}>
            <h2 className={styles.workspaceTitle}>{currentMission.name}</h2>
            <p className={styles.workspaceSubtitle}>
              {currentMission.form_factor} • {currentMission.target_orbit} • Mass budget: {currentMission.mass_budget_kg.toFixed(2)} kg • Engineering review workspace
            </p>
          </div>
        </header>

        {/* 3. Restrained Mandatory Scope Callout */}
        <div className={styles.scopeBoundaryNotice} role="note">
          <ShieldAlert size={16} className={styles.scopeIcon} aria-hidden="true" />
          <span>
            Despite the name, OrbitScore does not score or certify missions; it organizes evidence for qualified human review. All findings are deterministic consistency checks.
          </span>
        </div>

        {/* 4. Evidence Register Counts Summary (Not an engineering conclusion) */}
        <div className={styles.summaryBar} aria-label="Evidence Register Counts">
          <div className={styles.summaryBarHeader}>
            <span className={styles.summaryBarTitle}>Evidence Register Counts</span>
            <span className={styles.summaryBarMeta}>
              Tabulated across {currentEvidence.length} parameters (not a mission rating or engineering conclusion)
            </span>
          </div>
          <div className={styles.summaryPills}>
            <div className={styles.summaryPill}>
              <span className={styles.pillLabel}>Total</span>
              <span className={styles.pillValue}>{currentEvidence.length}</span>
            </div>
            <div className={styles.summaryPill}>
              <span className={styles.pillDot} style={{ background: 'var(--os-color-state-confirmed, #10b981)' }} />
              <span className={styles.pillLabel}>Confirmed</span>
              <span className={styles.pillValue}>{stateCounts.confirmed || 0}</span>
            </div>
            <div className={styles.summaryPill}>
              <span className={styles.pillDot} style={{ background: 'var(--os-color-state-unconfirmed, #f59e0b)' }} />
              <span className={styles.pillLabel}>Unconfirmed</span>
              <span className={styles.pillValue}>{stateCounts.unconfirmed || 0}</span>
            </div>
            <div className={styles.summaryPill}>
              <span className={styles.pillDot} style={{ background: 'var(--os-color-state-conflicting, #c084fc)' }} />
              <span className={styles.pillLabel}>Conflicting</span>
              <span className={styles.pillValue}>{stateCounts.conflicting || 0}</span>
            </div>
            <div className={styles.summaryPill}>
              <span className={styles.pillDot} style={{ background: 'var(--os-color-state-missing, #ef4444)' }} />
              <span className={styles.pillLabel}>Missing</span>
              <span className={styles.pillValue}>{stateCounts.missing || 0}</span>
            </div>
            {(stateCounts.stale || 0) > 0 && (
              <div className={styles.summaryPill}>
                <span className={styles.pillDot} style={{ background: 'var(--os-color-state-stale, #fb923c)' }} />
                <span className={styles.pillLabel}>Stale</span>
                <span className={styles.pillValue}>{stateCounts.stale || 0}</span>
              </div>
            )}
          </div>
        </div>

        {/* 5. One Compact Six-Stage Navigator */}
        <Stepper
          currentStep={currentStep}
          onStepChange={(step) => setCurrentStep(step)}
          completedSteps={completedSteps}
        />

        {/* Slide-Like Focused Stage Views */}

        {/* Stage 1: Mission Baseline Parameters */}
        {currentStep === 'context' && (
          <div>
            <MissionContextCard
              mission={currentMission}
              evidence={currentEvidence}
              onUpdateMission={(updates) => {
                const updatedMission = { ...currentMission, ...updates };
                useOrbitStore.setState((state) => ({
                  missions: {
                    ...state.missions,
                    [missionId]: updatedMission,
                  },
                }));
              }}
            />

            <details className={styles.disclosureSection}>
              <summary className={styles.disclosureSummary}>▸ View Orbital Mechanics & Ephemeris Details</summary>
              <div className={styles.disclosureContent}>
                <OrbitalContextCard mission={currentMission} />
              </div>
            </details>

            <details className={styles.disclosureSection}>
              <summary className={styles.disclosureSummary}>▸ View Evidence Completeness Overview</summary>
              <div className={styles.disclosureContent}>
                <ReadinessIndexCard mission={currentMission} evidence={currentEvidence} />
              </div>
            </details>

            <div className={styles.buttonGroupEnd}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => setCurrentStep('evidence')}
              >
                <span>Proceed to Evidence Register</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Stage 2: Evidence Register */}
        {currentStep === 'evidence' && (
          <div>
            <DataTable
              items={currentEvidence}
              selectedId={selectedEvidenceId}
              onSelectItem={(itemSelId) => selectEvidenceItem(itemSelId)}
              onAddItem={() => setIsAddModalOpen(true)}
            />

            <div className={styles.buttonGroupBetween}>
              <button
                type="button"
                className={styles.actionButtonSecondary}
                onClick={() => setCurrentStep('context')}
              >
                <span>Back to Context</span>
              </button>

              <button
                type="button"
                className={styles.actionButton}
                onClick={() => setCurrentStep('profile')}
              >
                <span>Proceed to Profile Gate</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Stage 3: Profile Gate */}
        {currentStep === 'profile' && (
          <div>
            <ProfileGateCard
              mission={currentMission}
              profile={activeProfile}
              checkRun={currentCheckRun}
              isStale={isStale}
              onRunChecks={() => {
                const run = runChecks(missionId);
                if (run.is_applicable) {
                  setCurrentStep('findings');
                }
              }}
              onProceedToFindings={() => setCurrentStep('findings')}
            />

            <div className={styles.buttonGroupStart}>
              <button
                type="button"
                className={styles.actionButtonSecondary}
                onClick={() => setCurrentStep('evidence')}
              >
                <span>Back to Evidence Register</span>
              </button>
            </div>
          </div>
        )}

        {/* Stage 4: Automated Findings */}
        {currentStep === 'findings' && (
          <div>
            <FindingsView
              checkRun={currentCheckRun}
              decisionsMap={decisionsMap}
              onNavigateToEvidence={(key) => {
                setCurrentStep('evidence');
                const found = currentEvidence.find((e) => e.parameter_key === key);
                if (found) {
                  selectEvidenceItem(found.id);
                }
              }}
              onProceedToReview={() => setCurrentStep('review')}
              onBackToGate={() => setCurrentStep('profile')}
              onReRunChecks={() => runChecks(missionId)}
            />

            <details className={styles.disclosureSection}>
              <summary className={styles.disclosureSummary}>▸ View Counterfactual Sensitivity Lab</summary>
              <div className={styles.disclosureContent}>
                <CounterfactualLab missionId={missionId} />
              </div>
            </details>
          </div>
        )}

        {/* Stage 5: Review Decisions & Gating */}
        {currentStep === 'review' && (
          <div>
            <ReviewDecisionForm
              findings={currentCheckRun?.findings || []}
              decisions={currentDecisions}
              selectedFindingId={selectedReviewFindingId}
              onRecordDecision={(decisionData) => {
                recordDecision(missionId, decisionData);
              }}
            />

            <OpenIssuesList
              issues={currentIssues}
              findings={currentCheckRun?.findings || []}
              onAddIssue={(issueData) => {
                addOpenIssue(missionId, issueData);
              }}
              onUpdateStatus={(issueId, status) => {
                updateOpenIssueStatus(missionId, issueId, status);
              }}
            />

            <ExportGateBlocker
              findings={currentCheckRun?.findings || []}
              decisions={currentDecisions}
              onSelectFinding={(findingId) => {
                setSelectedReviewFindingId(findingId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onProceedToExport={() => setCurrentStep('export')}
            />

            <div className={styles.buttonGroupStart}>
              <button
                type="button"
                className={styles.actionButtonSecondary}
                onClick={() => setCurrentStep('findings')}
              >
                <span>Back to Automated Findings</span>
              </button>
            </div>
          </div>
        )}

        {/* Stage 6: Cited Export Dossier */}
        {currentStep === 'export' && currentCheckRun && (
          <ExportPacketView
            mission={currentMission}
            profile={activeProfile}
            checkRun={currentCheckRun}
            decisions={currentDecisions}
            openIssues={currentIssues}
            onBackToReview={() => setCurrentStep('review')}
          />
        )}

        {/* Side Panel Inspector Drawer */}
        <SidePanel
          item={selectedItem}
          onClose={() => selectEvidenceItem(null)}
          onConfirm={(itemId, reviewerName) => {
            confirmEvidenceItem(missionId, itemId, reviewerName);
          }}
          onDelete={(itemId) => {
            deleteEvidenceItem(missionId, itemId);
          }}
        />

        {/* Add Evidence Modal */}
        <AddEvidenceModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={(newItem) => {
            addEvidenceItem(missionId, newItem);
          }}
        />

        {/* Agent 37 Triage & Copilot Drawer */}
        <Agent37Copilot
          isOpen={isAgent37Open}
          onClose={() => setIsAgent37Open(false)}
        />
      </div>
    </div>
  );
};

export default MissionWorkspacePage;
