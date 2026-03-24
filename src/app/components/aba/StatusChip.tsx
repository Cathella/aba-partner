/**
 * StatusChip — Receptionist workflow status indicators
 * 10 statuses covering the full patient journey.
 */

export type VisitStatus =
  | 'pending'
  | 'confirmed'
  | 'arrived'
  | 'checked-in'
  | 'waiting'
  | 'in-consultation'
  | 'lab'
  | 'pharmacy'
  | 'completed'
  | 'no-show'
  | 'reschedule-requested'
  | 'declined'
  | 'proposed';

interface StatusChipProps {
  status: VisitStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<
  VisitStatus,
  { label: string; dot: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: 'Pending',
    dot: 'bg-aba-warning-main',
    bg: 'bg-aba-warning-50',
    text: 'text-aba-neutral-900',
    border: 'border-aba-warning-main/20',
  },
  confirmed: {
    label: 'Confirmed',
    dot: 'bg-aba-secondary-main',
    bg: 'bg-aba-secondary-50',
    text: 'text-aba-neutral-900',
    border: 'border-aba-secondary-main/20',
  },
  arrived: {
    label: 'Arrived',
    dot: 'bg-aba-primary-main',
    bg: 'bg-aba-primary-50',
    text: 'text-aba-neutral-900',
    border: 'border-aba-primary-main/20',
  },
  'checked-in': {
    label: 'Checked In',
    dot: 'bg-aba-success-main',
    bg: 'bg-aba-success-50',
    text: 'text-aba-neutral-900',
    border: 'border-aba-success-main/20',
  },
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
  lab: {
    label: 'Lab',
    dot: 'bg-[#F59E0B]',
    bg: 'bg-[#FFFBEB]',
    text: 'text-aba-neutral-900',
    border: 'border-[#F59E0B]/20',
  },
  pharmacy: {
    label: 'Pharmacy',
    dot: 'bg-[#EC4899]',
    bg: 'bg-[#FDF2F8]',
    text: 'text-aba-neutral-900',
    border: 'border-[#EC4899]/20',
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
  'reschedule-requested': {
    label: 'Reschedule Requested',
    dot: 'bg-aba-warning-main',
    bg: 'bg-aba-warning-50',
    text: 'text-aba-neutral-900',
    border: 'border-aba-warning-main/20',
  },
  declined: {
    label: 'Declined',
    dot: 'bg-aba-error-main',
    bg: 'bg-aba-error-50',
    text: 'text-aba-neutral-900',
    border: 'border-aba-error-main/20',
  },
  proposed: {
    label: 'Proposed',
    dot: 'bg-aba-secondary-main',
    bg: 'bg-aba-secondary-50',
    text: 'text-aba-neutral-900',
    border: 'border-aba-secondary-main/20',
  },
};

export function StatusChip({ status, size = 'sm', className = '' }: StatusChipProps) {
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

/** Utility: get human-readable label for a status */
export function getStatusLabel(status: VisitStatus): string {
  return statusConfig[status].label;
}