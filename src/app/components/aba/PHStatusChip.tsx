/**
 * PHStatusChip — Pharmacy prescription status indicators.
 * Covers: new, in-progress, ready, completed, on-hold, out-of-stock, partial-fill
 */

import type { PHRxStatus } from '../../data/pharmacistStore';

interface PHStatusChipProps {
  status: PHRxStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<
  PHRxStatus,
  { label: string; dot: string; bg: string; text: string; border: string }
> = {
  new: {
    label: 'New',
    dot: 'bg-[#3A8DFF]',
    bg: 'bg-[#EBF3FF]',
    text: 'text-[#1A1A1A]',
    border: 'border-[#3A8DFF]/20',
  },
  'in-progress': {
    label: 'In Progress',
    dot: 'bg-[#FFB649]',
    bg: 'bg-[#FFF3DC]',
    text: 'text-[#1A1A1A]',
    border: 'border-[#FFB649]/20',
  },
  ready: {
    label: 'Ready',
    dot: 'bg-[#56D8A8]',
    bg: 'bg-[#E9F8F0]',
    text: 'text-[#1A1A1A]',
    border: 'border-[#56D8A8]/20',
  },
  completed: {
    label: 'Completed',
    dot: 'bg-[#38C172]',
    bg: 'bg-[#E9F8F0]',
    text: 'text-[#1A1A1A]',
    border: 'border-[#38C172]/20',
  },
  'on-hold': {
    label: 'On Hold',
    dot: 'bg-[#D97706]',
    bg: 'bg-[#FFF3DC]',
    text: 'text-[#1A1A1A]',
    border: 'border-[#D97706]/20',
  },
  'out-of-stock': {
    label: 'Out of Stock',
    dot: 'bg-[#E44F4F]',
    bg: 'bg-[#FDECEC]',
    text: 'text-[#1A1A1A]',
    border: 'border-[#E44F4F]/20',
  },
  'partial-fill': {
    label: 'Partial Fill',
    dot: 'bg-[#8B5CF6]',
    bg: 'bg-[#F5F3FF]',
    text: 'text-[#1A1A1A]',
    border: 'border-[#8B5CF6]/20',
  },
};

export function PHStatusChip({ status, size = 'sm', className = '' }: PHStatusChipProps) {
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

export function getPHStatusLabel(status: PHRxStatus): string {
  return statusConfig[status].label;
}