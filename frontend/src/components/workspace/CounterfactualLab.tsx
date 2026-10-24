import React, { useState } from 'react';
import { Play, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import styles from './CounterfactualLab.module.css';

interface CounterfactualLabProps {
  missionId: string;
  onSimulationRun?: (lever: string, proposedValue: any) => void;
}

interface PresetLever {
  id: string;
  label: string;
  parameterKey: string;
  currentValue: string;
  proposedValue: string;
  leverDescription: string;
  expectedOutcome: string;
}

const DEFAULT_LEVER: PresetLever = {
  id: 'lever-disposal',
  label: 'Post-Mission Disposal Lifetime',
  parameterKey: 'disposal_lifetime_years',
  currentValue: '8.4 years',
  proposedValue: '4.9 years',
  leverDescription: 'Test re-evaluating under the 5-year post-mission disposal threshold',
  expectedOutcome: 'Resolves orbital lifetime threshold under 5-year profile guidelines',
};

const PRESET_LEVERS: PresetLever[] = [
  DEFAULT_LEVER,
  {
    id: 'lever-orbit',
    label: 'Initial Insertion Altitude',
    parameterKey: 'orbit_altitude_km',
    currentValue: '550 km',
    proposedValue: '480 km',
    leverDescription: 'Lower initial deployment altitude to increase natural atmospheric drag',
    expectedOutcome: 'Decreases estimated natural orbital decay duration',
  },
  {
    id: 'lever-passivation',
    label: 'Stored Energy Depletion',
    parameterKey: 'passivation_plan',
    currentValue: 'Unconfirmed plan',
    proposedValue: 'Documented plan',
    leverDescription: 'Provide documented passivation procedure for battery & reaction wheels',
    expectedOutcome: 'Satisfies end-of-mission passivation review criteria',
  },
];

export const CounterfactualLab: React.FC<CounterfactualLabProps> = ({
  missionId,
  onSimulationRun,
}) => {
  const [selectedLeverId, setSelectedLeverId] = useState<string>(DEFAULT_LEVER.id);
  const [customValue, setCustomValue] = useState<string>(DEFAULT_LEVER.proposedValue);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    lever: string;
    before: string;
    after: string;
    explanation: string;
  } | null>(null);

  const selectedLever: PresetLever =
    PRESET_LEVERS.find((l) => l.id === selectedLeverId) ?? DEFAULT_LEVER;

  const handleLeverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextId = e.target.value;
    setSelectedLeverId(nextId);
    const found = PRESET_LEVERS.find((l) => l.id === nextId);
    if (found) {
      setCustomValue(found.proposedValue);
      setSimulationResult(null);
    }
  };

  const handleRunSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      setSimulationResult({
        lever: selectedLever.label,
        before: 'REQUIRES ATTENTION (Above Threshold)',
        after: 'SATISFIES THRESHOLD CRITERIA',
        explanation: `${selectedLever.leverDescription}. When adjusted to ${customValue}, the deterministic check evaluates that the simulated parameter satisfies the specified profile threshold.`,
      });
      setIsRunning(false);
      if (onSimulationRun) {
        onSimulationRun(selectedLever.parameterKey, customValue);
      }
    }, 450);
  };

  return (
    <section className={styles.container} aria-labelledby="counterfactual-heading">
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.eyebrow}>
            <Sparkles size={13} style={{ display: 'inline', marginRight: 4 }} aria-hidden="true" />
            Counterfactual Lab
          </span>
          <h3 id="counterfactual-heading" className={styles.title}>
            Bounded Policy Lever Simulation
          </h3>
          <p className={styles.description}>
            Explore what-if engineering scenarios by testing hypothetical parameter adjustments
            against deterministic profile thresholds before formal documentation updates.
          </p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlField}>
          <label htmlFor="lever-select" className={styles.label}>
            Select Policy Lever
          </label>
          <select
            id="lever-select"
            className={styles.select}
            value={selectedLeverId}
            onChange={handleLeverChange}
          >
            {PRESET_LEVERS.map((lever) => (
              <option key={lever.id} value={lever.id}>
                {lever.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.controlField}>
          <label htmlFor="custom-val" className={styles.label}>
            Hypothetical Value (Current: {selectedLever.currentValue})
          </label>
          <input
            id="custom-val"
            type="text"
            className={styles.input}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
          />
        </div>

        <button
          type="button"
          className={styles.runButton}
          onClick={handleRunSimulation}
          disabled={isRunning}
          aria-label="Run Bounded Simulation"
        >
          <Play size={14} aria-hidden="true" />
          <span>{isRunning ? 'Simulating…' : 'Run Simulation'}</span>
        </button>
      </div>

      {simulationResult && (
        <div className={styles.resultPanel} role="region" aria-label="Simulation Result">
          <div className={styles.resultHeader}>
            <CheckCircle2 size={15} aria-hidden="true" />
            <span>Simulated Outcome for {missionId}</span>
          </div>

          <div className={styles.comparisonRow}>
            <span className={styles.statusBefore}>{simulationResult.before}</span>
            <ArrowRight size={16} color="var(--os-color-text-muted)" aria-hidden="true" />
            <span className={styles.statusAfter}>{simulationResult.after}</span>
          </div>

          <p className={styles.resultExplanation}>{simulationResult.explanation}</p>

          <p className={styles.disclaimer}>
            Notice: Counterfactual simulations are exploratory sandbox calculations for mission trade studies. They do not alter primary records or replace qualified human engineering sign-offs.
          </p>
        </div>
      )}
    </section>
  );
};

export default CounterfactualLab;
