/**
 * ACStatusChip — Finance transaction/settlement status indicators.
 * Statuses: Paid, Pending, Failed, Refunded, Disputed, Settled, Processing
 */

export type ACChipStatus = 'paid' | 'pending' | 'failed' | 'refunded' | 'disputed' | 'settled' | 'processing';

interface ACStatusChipProps {
  status: ACChipStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const config: Record<ACChipStatus, { label: string; dot: string; bg: string; text: string }> = {
  paid: {
    label: 'Paid',
    dot: 'bg-[#38C172]',
    bg: 'bg-[#E9F8F0]',
    text: 'text-[#38C172]',
  },
  pending: {
    label: 'Pending',
    dot: 'bg-[#FFB649]',
    bg: 'bg-[#FFF3DC]',
    text: 'text-[#D97706]',
  },
  failed: {
    label: 'Failed',
    dot: 'bg-[#E44F4F]',
    bg: 'bg-[#FDECEC]',
    text: 'text-[#E44F4F]',
  },
  refunded: {
    label: 'Refunded',
    dot: 'bg-[#8B5CF6]',
    bg: 'bg-[#F5F3FF]',
    text: 'text-[#8B5CF6]',
  },
  disputed: {
    label: 'Disputed',
    dot: 'bg-[#E44F4F]',
    bg: 'bg-[#FDECEC]',
    text: 'text-[#E44F4F]',
  },
  settled: {
    label: 'Settled',
    dot: 'bg-[#38C172]',
    bg: 'bg-[#E9F8F0]',
    text: 'text-[#38C172]',
  },
  processing: {
    label: 'Processing',
    dot: 'bg-[#3A8DFF]',
    bg: 'bg-[#E8F2FF]',
    text: 'text-[#3A8DFF]',
  },
};

export function ACStatusChip({ status, size = 'sm', className = '' }: ACStatusChipProps) {
  const c = config[status];
  const sizeStyles = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${c.bg} ${c.text} ${sizeStyles} ${className} text-[12px]`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
