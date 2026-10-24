import {
  LucideIcon,
  CircleDashed,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  History,
} from 'lucide-react';
import { EvidenceState } from '../../types/domain';
import styles from './StateChip.module.css';

interface StateChipProps {
  state: EvidenceState;
  className?: string;
  showIcon?: boolean;
}

const STATE_CONFIG: Record<
  EvidenceState,
  { label: string; icon: LucideIcon }
> = {
  missing: {
    label: 'Missing',
    icon: CircleDashed,
  },
  unconfirmed: {
    label: 'Unconfirmed',
    icon: HelpCircle,
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
  },
  conflicting: {
    label: 'Conflicting',
    icon: AlertTriangle,
  },
  stale: {
    label: 'Stale',
    icon: History,
  },
};

export const StateChip: React.FC<StateChipProps> = ({
  state,
  className = '',
  showIcon = true,
}) => {
  const config = STATE_CONFIG[state] || STATE_CONFIG.missing;
  const IconComponent = config.icon;

  return (
    <span
      className={`${styles.chip} ${styles[state]} ${className}`}
      title={`Evidence state: ${config.label}`}
      role="status"
    >
      {showIcon && <IconComponent size={13} className={styles.chipIcon} />}
      <span>{config.label}</span>
    </span>
  );
};

export default StateChip;
