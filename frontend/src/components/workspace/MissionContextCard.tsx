import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { Mission, EvidenceItem } from '../../types/domain';
import styles from './MissionContextCard.module.css';

interface MissionContextCardProps {
  mission: Mission;
  evidence: EvidenceItem[];
  onUpdateMission?: (updated: Partial<Mission>) => void;
}

export const MissionContextCard: React.FC<MissionContextCardProps> = ({
  mission,
  evidence,
  onUpdateMission,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: mission.name,
    form_factor: mission.form_factor,
    target_orbit: mission.target_orbit,
    mass_budget_kg: mission.mass_budget_kg,
    baseline_threshold_date: mission.baseline_threshold_date,
  });

  const stateCounts = evidence.reduce(
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
    } as Record<string, number>
  );

  const handleSave = () => {
    if (onUpdateMission) {
      onUpdateMission({
        name: formData.name,
        form_factor: formData.form_factor,
        target_orbit: formData.target_orbit,
        mass_budget_kg: Number(formData.mass_budget_kg),
        baseline_threshold_date: formData.baseline_threshold_date,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: mission.name,
      form_factor: mission.form_factor,
      target_orbit: mission.target_orbit,
      mass_budget_kg: mission.mass_budget_kg,
      baseline_threshold_date: mission.baseline_threshold_date,
    });
    setIsEditing(false);
  };

  return (
    <section className={styles.card} aria-labelledby="context-heading">
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <span className={styles.missionIdBadge}>
            MISSION CONTEXT • {mission.id.toUpperCase()}
          </span>
          <div className={styles.titleRow}>
            <h2 id="context-heading" className={styles.missionName}>
              {mission.name}
            </h2>
            <span className={styles.syntheticDataBadge}>SYNTHETIC DEMO DATA</span>
          </div>
        </div>

        {onUpdateMission && (
          <div>
            {isEditing ? (
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={handleSave}
                  className={styles.editButton}
                  style={{ borderColor: 'var(--color-state-confirmed)', color: 'var(--color-state-confirmed)' }}
                >
                  <Check size={13} aria-hidden="true" />
                  <span>Save Context</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className={styles.editButton}
                >
                  <X size={13} aria-hidden="true" />
                  <span>Cancel</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={styles.editButton}
                aria-label="Edit mission parameters"
              >
                <Edit2 size={13} aria-hidden="true" />
                <span>Edit Parameters</span>
              </button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="edit-name">
              Mission Name
            </label>
            <input
              id="edit-name"
              className={styles.formInput}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="edit-form-factor">
              Form Factor
            </label>
            <input
              id="edit-form-factor"
              className={styles.formInput}
              value={formData.form_factor}
              onChange={(e) =>
                setFormData({ ...formData, form_factor: e.target.value })
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="edit-orbit">
              Target Orbit
            </label>
            <input
              id="edit-orbit"
              className={styles.formInput}
              value={formData.target_orbit}
              onChange={(e) =>
                setFormData({ ...formData, target_orbit: e.target.value })
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="edit-mass">
              Mass Budget (kg)
            </label>
            <input
              id="edit-mass"
              type="number"
              step="0.1"
              className={styles.formInput}
              value={formData.mass_budget_kg}
              onChange={(e) =>
                setFormData({ ...formData, mass_budget_kg: Number(e.target.value) })
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="edit-threshold">
              Baseline Currency Date
            </label>
            <input
              id="edit-threshold"
              type="date"
              className={styles.formInput}
              value={formData.baseline_threshold_date}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  baseline_threshold_date: e.target.value,
                })
              }
            />
          </div>
        </div>
      ) : (
        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>Form Factor</div>
            <div className={styles.metaValue}>{mission.form_factor}</div>
          </div>
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>Target Orbit</div>
            <div className={styles.metaValue}>{mission.target_orbit}</div>
          </div>
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>Mass Budget Ceiling</div>
            <div className={styles.metaValue}>{mission.mass_budget_kg.toFixed(2)} kg</div>
          </div>
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>Baseline Currency Date</div>
            <div className={styles.metaValue}>{mission.baseline_threshold_date}</div>
          </div>
        </div>
      )}

      {/* Summary Evidence Count Bar */}
      <div className={styles.summaryRow}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
          REGISTERED EVIDENCE: <strong>{evidence.length} ITEMS</strong>
        </div>
        <div className={styles.badgeCluster}>
          <span style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-state-confirmed)' }}>
            ● {stateCounts.confirmed || 0} Confirmed
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-state-unconfirmed)' }}>
            ● {stateCounts.unconfirmed || 0} Unconfirmed
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-state-conflicting)' }}>
            ● {stateCounts.conflicting || 0} Conflicting
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-state-stale)' }}>
            ● {stateCounts.stale || 0} Stale
          </span>
        </div>
      </div>
    </section>
  );
};

export default MissionContextCard;
