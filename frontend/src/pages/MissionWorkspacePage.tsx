import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, Layers, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { useOrbitStore } from '../store/useOrbitStore';
import { Stepper, WorkspaceStep } from '../components/workspace/Stepper';
import { MissionContextCard } from '../components/workspace/MissionContextCard';
import { DataTable } from '../components/workspace/DataTable';
import { SidePanel } from '../components/workspace/SidePanel';
import { AddEvidenceModal } from '../components/workspace/AddEvidenceModal';
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
    selectedEvidenceId,
    selectEvidenceItem,
    confirmEvidenceItem,
    deleteEvidenceItem,
    addEvidenceItem,
  } = useOrbitStore();

  const [currentStep, setCurrentStep] = useState<WorkspaceStep>('evidence');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (missionId !== activeMissionId) {
      setActiveMission(missionId);
    }
  }, [missionId, activeMissionId, setActiveMission]);

  const currentMission = missions[missionId] || ASTERIA_3_MISSION;
  const currentEvidence = evidence[missionId] || [];
  const selectedItem =
    currentEvidence.find((e) => e.id === selectedEvidenceId) || null;

  return (
    <div className={styles.pageRoot}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
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
        </div>

        {/* Stepper Workflow Header */}
        <Stepper
          currentStep={currentStep}
          onStepChange={(step) => setCurrentStep(step)}
          completedSteps={['context']}
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

        {/* Step 1: Mission Context */}
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

        {/* Step 3: Profile Gate Placeholder */}
        {currentStep === 'profile' && (
          <div className={styles.card} style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
            <Layers size={36} style={{ color: 'var(--color-brand-cyan)', margin: '0 auto var(--space-4)' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-2)' }}>
              Stage 3: Profile Gate & Rule Inspection
            </h2>
            <p className={styles.cardText} style={{ maxWidth: '60ch', margin: '0 auto var(--space-6)' }}>
              Active Profile: <strong>Demo Evidence Completeness v0.1.0</strong>.
              Ready to evaluate deterministic consistency checks against {currentEvidence.length} recorded parameters.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
              <button
                type="button"
                className={styles.actionButtonSecondary}
                onClick={() => setCurrentStep('evidence')}
              >
                <span>Back to Evidence Register</span>
              </button>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => setCurrentStep('findings')}
              >
                <span>Run Inspection Checks</span>
                <Play size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Findings Placeholder */}
        {currentStep === 'findings' && (
          <div className={styles.card} style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
            <Layers size={36} style={{ color: 'var(--color-brand-lavender)', margin: '0 auto var(--space-4)' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-2)' }}>
              Stage 4: Automated Consistency Findings
            </h2>
            <p className={styles.cardText} style={{ maxWidth: '60ch', margin: '0 auto var(--space-6)' }}>
              Automated deterministic findings will be reviewed here with bidirectional traceability links to evidence records.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
              <button
                type="button"
                className={styles.actionButtonSecondary}
                onClick={() => setCurrentStep('profile')}
              >
                <span>Back to Profile</span>
              </button>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => setCurrentStep('review')}
              >
                <span>Proceed to Human Review</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review Decisions Placeholder */}
        {currentStep === 'review' && (
          <div className={styles.card} style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
            <CheckCircle2 size={36} style={{ color: 'var(--color-state-confirmed)', margin: '0 auto var(--space-4)' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-2)' }}>
              Stage 5: Designated Review Decisions & Open Issues
            </h2>
            <p className={styles.cardText} style={{ maxWidth: '60ch', margin: '0 auto var(--space-6)' }}>
              Technical reviewers record rationales, waivers, and action items before export gating is unlocked.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
              <button
                type="button"
                className={styles.actionButtonSecondary}
                onClick={() => setCurrentStep('findings')}
              >
                <span>Back to Findings</span>
              </button>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => setCurrentStep('export')}
              >
                <span>Proceed to Export Dossier</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Export Dossier Placeholder */}
        {currentStep === 'export' && (
          <div className={styles.card} style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
            <Layers size={36} style={{ color: 'var(--color-brand-cyan)', margin: '0 auto var(--space-4)' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-2)' }}>
              Stage 6: Cited Export Packet
            </h2>
            <p className={styles.cardText} style={{ maxWidth: '60ch', margin: '0 auto var(--space-6)' }}>
              Generate complete, immutable, cited review dossiers in Markdown, JSON, and printable formats.
            </p>
            <button
              type="button"
              className={styles.actionButtonSecondary}
              onClick={() => setCurrentStep('review')}
            >
              <span>Back to Review</span>
            </button>
          </div>
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
