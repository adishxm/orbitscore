import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, ArrowRight, RotateCcw } from 'lucide-react';
import { useOrbitStore } from '../store/useOrbitStore';
import { Stepper, WorkspaceStep } from '../components/workspace/Stepper';
import { MissionContextCard } from '../components/workspace/MissionContextCard';
import { OrbitalContextCard } from '../components/workspace/OrbitalContextCard';
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

  return (
    <div className={styles.pageRoot}>
      <div className="container">
        {/* Navigation Breadcrumb and Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-4)',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
          }}
        >
          <Link
            to="/missions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--font-size-xs)',
            }}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Back to Mission Registry</span>
          </Link>

          <button
            type="button"
            onClick={() => resetDemo()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 10px',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              cursor: 'pointer',
            }}
            title="Restore pristine Asteria-3 synthetic fixture data"
          >
            <RotateCcw size={12} aria-hidden="true" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        {/* Stepper Workflow Header */}
        <Stepper
          currentStep={currentStep}
          onStepChange={(step) => setCurrentStep(step)}
          completedSteps={completedSteps}
        />

        {/* Mandatory Scope Callout */}
        <div className={styles.disclaimerCallout} role="note">
          <ShieldAlert size={22} color="var(--color-state-conflicting)" aria-hidden="true" />
          <div>
            <div className={styles.disclaimerCalloutTitle}>Workspace Review Boundary</div>
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Despite the name, OrbitScore does not score or certify missions; it organizes evidence for human review.
              All findings are deterministic consistency checks and must be evaluated by a qualified engineer.
            </p>
          </div>
        </div>

        {/* Step 1: Mission Context & Orbital Visual */}
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

            <OrbitalContextCard mission={currentMission} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
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

        {/* Step 2: Evidence Register */}
        {currentStep === 'evidence' && (
          <div>
            <MissionContextCard
              mission={currentMission}
              evidence={currentEvidence}
            />

            <DataTable
              items={currentEvidence}
              selectedId={selectedEvidenceId}
              onSelectItem={(itemSelId) => selectEvidenceItem(itemSelId)}
              onAddItem={() => setIsAddModalOpen(true)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-6)' }}>
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

        {/* Step 3: Profile Gate */}
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

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 'var(--space-6)' }}>
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

        {/* Step 4: Automated Findings */}
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

            <CounterfactualLab missionId={missionId} />
          </div>
        )}

        {/* Step 5: Review Decisions & Gating */}
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
                // Scroll to top of review section
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onProceedToExport={() => setCurrentStep('export')}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 'var(--space-6)' }}>
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

        {/* Step 6: Cited Export Dossier */}
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
      </div>
    </div>
  );
};

export default MissionWorkspacePage;
