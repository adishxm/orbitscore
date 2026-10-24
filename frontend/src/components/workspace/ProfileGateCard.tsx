import { Play, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Mission, Profile, CheckRun } from '../../types/domain';
import styles from './ProfileGateCard.module.css';

interface ProfileGateCardProps {
  mission: Mission;
  profile: Profile;
  checkRun: CheckRun | null;
  isStale: boolean;
  onRunChecks: () => void;
  onProceedToFindings?: () => void;
}

export const ProfileGateCard: React.FC<ProfileGateCardProps> = ({
  mission,
  profile,
  checkRun,
  isStale,
  onRunChecks,
  onProceedToFindings,
}) => {
  // Applicability Gate
  const isObjectTypeApplicable = profile.applicability.object_types.includes(
    mission.object_type
  );
  const isFormFactorApplicable = profile.applicability.form_factors.includes(
    mission.form_factor
  );
  const isApplicable = isObjectTypeApplicable && isFormFactorApplicable;

  return (
    <section className={styles.card} aria-labelledby="gate-heading">
      <div className={styles.headerRow}>
        <div>
          <div className={styles.kicker}>Evaluation Profile Gate</div>
          <h2 id="gate-heading" className={styles.title}>
            {profile.title}
          </h2>
          <div className={styles.metaText}>
            ID: <code>{profile.id}</code> • Version: <code>{profile.version}</code> • Checks: {profile.checks.length}
          </div>
        </div>

        <span
          style={{
            background: 'var(--color-surface-sunken)',
            border: '1px solid var(--color-border-subtle)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-brand-cyan)',
          }}
        >
          {profile.version} STABLE
        </span>
      </div>

      {/* Profile Boundary Declaration */}
      <div className={styles.boundaryBox}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
          Calibrated Vehicle Classes
        </div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Object Types: <strong>{profile.applicability.object_types.join(', ')}</strong> • Form Factors: <strong>{profile.applicability.form_factors.join(', ')}</strong>
        </div>
      </div>

      {/* Applicability Evaluation Banner */}
      {isApplicable ? (
        <div className={styles.gateAlertSuccess} role="status">
          <CheckCircle2 size={20} color="var(--color-state-confirmed)" aria-hidden="true" />
          <div>
            <div className={styles.alertTitle} style={{ color: 'var(--color-state-confirmed)' }}>
              Applicability Gate: APPLICABLE
            </div>
            <p className={styles.alertDesc}>
              Mission <strong>{mission.name}</strong> ({mission.form_factor} {mission.object_type}) matches the declared domain of this profile.
              Automated deterministic consistency checks can be executed.
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.gateAlertError} role="alert">
          <AlertTriangle size={20} color="var(--color-state-conflicting)" aria-hidden="true" />
          <div>
            <div className={styles.alertTitle} style={{ color: 'var(--color-state-conflicting)' }}>
              Applicability Gate: NOT APPLICABLE (Out of Profile Scope)
            </div>
            <p className={styles.alertDesc}>
              Profile <strong>{profile.id} {profile.version}</strong> is calibrated solely for integrated CubeSat and SmallSat platforms (1U to 27U).
              Mission object type <code>{mission.object_type}</code> with form factor <code>{mission.form_factor}</code> falls outside this boundary.
              Automated checks are halted to prevent misleading findings.
            </p>
          </div>
        </div>
      )}

      {/* Check Run Metadata if Run has executed */}
      {checkRun && (
        <div className={styles.runMetadata}>
          <div className={styles.metaItem}>
            <span className={styles.metaItemLabel}>Execution Timestamp</span>
            <span className={styles.metaItemValue}>
              {new Date(checkRun.executed_at).toLocaleString()}
            </span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaItemLabel}>Snapshot Hash</span>
            <span className={styles.metaItemValue}>
              <code>{checkRun.input_snapshot_hash}</code>
            </span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaItemLabel}>Findings Evaluated</span>
            <span className={styles.metaItemValue}>{checkRun.findings.length} findings</span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaItemLabel}>Currency Status</span>
            <div>
              {isStale ? (
                <span className={styles.staleChip}>Stale (Evidence Changed)</span>
              ) : (
                <span className={styles.freshChip}>Fresh</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onRunChecks}
          disabled={!isApplicable}
          className={styles.actionButton}
        >
          {checkRun ? (
            <>
              <RefreshCw size={14} aria-hidden="true" />
              <span>{isStale ? 'Re-Run Checks (Inputs Stale)' : 'Re-Run Checks'}</span>
            </>
          ) : (
            <>
              <Play size={14} aria-hidden="true" />
              <span>Execute Profile Inspection</span>
            </>
          )}
        </button>

        {checkRun && onProceedToFindings && (
          <button
            type="button"
            onClick={onProceedToFindings}
            style={{
              background: 'transparent',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-3) var(--space-4)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
            }}
          >
            <span>View {checkRun.findings.length} Findings</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default ProfileGateCard;
