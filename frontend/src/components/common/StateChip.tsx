import React from 'react';
import {
  LucideIcon,
  CircleDashed,
  Clock,
  CheckCircle2,
  GitCompare,
  Slash,
  History,
} from 'lucide-react';
import { EvidenceState } from '../../types/domain';
import styles from './StateChip.module.css';

interface StateChipProps {
  state: EvidenceState | string;
  className?: string;
  showIcon?: boolean;
}

const STATE_CONFIG: Record<
  string,
  { label: string; icon: LucideIcon; classKey: string }
> = {
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    classKey: 'confirmed',
  },
  unconfirmed: {
    label: 'Unconfirmed',
    icon: Clock,
    classKey: 'unconfirmed',
  },
  missing: {
    label: 'Missing',
    icon: CircleDashed,
    classKey: 'missing',
  },
  conflicting: {
    label: 'Conflicting',
    icon: GitCompare,
    classKey: 'conflicting',
  },
  'out-of-scope': {
    label: 'Out of Scope',
    icon: Slash,
    classKey: 'outofscope',
  },
  out_of_scope: {
    label: 'Out of Scope',
    icon: Slash,
    classKey: 'outofscope',
  },
  stale: {
    label: 'Stale',
    icon: History,
    classKey: 'stale',
  },
};

export const StateChip: React.FC<StateChipProps> = ({
  state,
  className = '',
  showIcon = true,
}) => {
  const normalizedKey = (state || 'missing').toLowerCase().replace(/_/g, '-');
  const config =
    STATE_CONFIG[state] ||
    STATE_CONFIG[normalizedKey] ||
    STATE_CONFIG['missing']!;
  const IconComponent = config.icon;
  const chipClass = styles[config.classKey] || styles.missing;

  return (
    <span
      className={`${styles.chip} ${chipClass} ${className}`}
      title={`Evidence state: ${config.label}`}
      role="status"
    >
      {showIcon && <IconComponent size={12} className={styles.chipIcon} aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  );
};

export default StateChip;
