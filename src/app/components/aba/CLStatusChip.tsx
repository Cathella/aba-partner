/**
 * CLStatusChip — Clinician workflow status indicators.
 * Covers: waiting, in-consultation, lab-pending, lab-results, completed, no-show
 */

import type { CLVisitStatus } from '../../data/clinicianStore';

interface CLStatusChipProps {
  status: CLVisitStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<
  CLVisitStatus,
  { label: string; dot: string; bg: string; text: string; border: string }
> = {
  waiting: {
    label: 'Waiting',
    dot: 'bg-aba-warning-main',
    bg: 'bg-aba-warning-50',
    text: 'text-aba-neutral-900',
    border: 'border-aba-warning-main/20',
  },
  'in-consultation': {
    label: 'In Consultation',
    dot: 'bg-[#8B5CF6]',
    bg: 'bg-[#F5F3FF]',
    text: 'text-aba-neutral-900',
    border: 'border-[#8B5CF6]/20',
  },
  'lab-pending': {
    label: 'Lab Pending',
    dot: 'bg-[#F59E0B]',
    bg: 'bg-[#FFFBEB]',
    text: 'text-aba-neutral-900',
    border: 'border-[#F59E0B]/20',
  },
  'lab-results': {
    label: 'Lab Results',
    dot: 'bg-aba-secondary-main',
    bg: 'bg-aba-secondary-50',
    text: 'text-aba-neutral-900',
    border: 'border-aba-secondary-main/20',
  },
  completed: {
    label: 'Completed',
    dot: 'bg-aba-success-main',
    bg: 'bg-aba-success-50',
    text: 'text-aba-neutral-900',
    border: 'border-aba-success-main/20',
  },
  'no-show': {
    label: 'No-show',
    dot: 'bg-aba-error-main',
    bg: 'bg-aba-error-50',
    text: 'text-aba-neutral-900',
    border: 'border-aba-error-main/20',
  },
  transferred: {
    label: 'Transferred',
    dot: 'bg-aba-secondary-main',
    bg: 'bg-aba-secondary-50',
    text: 'text-aba-neutral-900',
    border: 'border-aba-secondary-main/20',
  },
};

export function CLStatusChip({ status, size = 'sm', className = '' }: CLStatusChipProps) {
  const cfg = statusConfig[status];
  const sizeStyles = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeStyles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function getCLStatusLabel(status: CLVisitStatus): string {
  return statusConfig[status].label;
}