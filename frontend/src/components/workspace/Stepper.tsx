import React from 'react';
import { Check } from 'lucide-react';
import styles from './Stepper.module.css';

export type WorkspaceStep =
  | 'context'
  | 'evidence'
  | 'profile'
  | 'findings'
  | 'review'
  | 'export';

interface StepDefinition {
  id: WorkspaceStep;
  label: string;
  subtext: string;
}

const STEPS: StepDefinition[] = [
  { id: 'context', label: '1. Mission Context', subtext: 'Parameters & Orbit' },
  { id: 'evidence', label: '2. Evidence Register', subtext: 'Citations & Locators' },
  { id: 'profile', label: '3. Profile Gate', subtext: 'Applicability' },
  { id: 'findings', label: '4. Findings', subtext: 'Automated Checks' },
  { id: 'review', label: '5. Review Decisions', subtext: 'Human Sign-off' },
  { id: 'export', label: '6. Export Packet', subtext: 'Cited Dossier' },
];

interface StepperProps {
  currentStep: WorkspaceStep;
  onStepChange: (step: WorkspaceStep) => void;
  completedSteps?: WorkspaceStep[];
}

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  onStepChange,
  completedSteps = [],
}) => {
  return (
    <nav className={styles.stepperWrap} aria-label="Mission Evaluation Workflow">
      <ol className={styles.stepList}>
        {STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id);

          return (
            <li
              key={step.id}
              className={`${styles.stepItem} ${isActive ? styles.active : ''} ${
                isCompleted ? styles.completed : ''
              }`}
            >
              <button
                type="button"
                className={styles.stepButton}
                onClick={() => onStepChange(step.id)}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className={styles.stepNumber}>
                  {isCompleted && !isActive ? (
                    <Check size={13} aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                <div className={styles.stepContent}>
                  <span className={styles.stepLabel}>{step.label}</span>
                  <span className={styles.stepSubtext}>{step.subtext}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;
