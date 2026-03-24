/**
 * LTStatusChip — Lab Tech order status indicators.
 * Covers: pending-collection, in-progress, results-ready, completed, re-collect
 */

import type { LTOrderStatus } from '../../data/labTechStore';

interface LTStatusChipProps {
  status: LTOrderStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<
  LTOrderStatus,
  { label: string; dot: string; bg: string; text: string; border: string }
> = {
  'pending-collection': {
    label: 'Pending Collection',
    dot: 'bg-[#FFB649]',
    bg: 'bg-[#FFF3DC]',
    text: 'text-[#1A1A1A]',
    border: 'border-[#FFB649]/20',
  },
  'in-progress': {
    label: 'In Progress',
    dot: 'bg-[#3A8DFF]',
    bg: 'bg-[#EBF3FF]',
    text: 'text-[#1A1A1A]',
    border: 'border-[#3A8DFF]/20',
  },
  'results-ready': {
    label: 'Results Ready',
    dot: 'bg-[#8B5CF6]',
    bg: 'bg-[#F5F3FF]',
    text: 'text-[#1A1A1A]',
    border: 'border-[#8B5CF6]/20',
  },
  completed: {
    label: 'Completed',
    dot: 'bg-[#38C172]',
    bg: 'bg-[#E9F8F0]',
    text: 'text-[#1A1A1A]',
    border: 'border-[#38C172]/20',
  },
  're-collect': {
    label: 'Re-collect Required',
    dot: 'bg-[#E44F4F]',
    bg: 'bg-[#FDECEC]',
    text: 'text-[#1A1A1A]',
    border: 'border-[#E44F4F]/20',
  },
};

export function LTStatusChip({ status, size = 'sm', className = '' }: LTStatusChipProps) {
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

export function getLTStatusLabel(status: LTOrderStatus): string {
  return statusConfig[status].label;
}
