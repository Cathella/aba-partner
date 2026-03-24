/**
 * ACTransactionRow — Reusable row for finance transaction lists.
 * Shows patient name, description, amount, method icon, status chip.
 */
import { ChevronRight, Smartphone, Banknote, CreditCard, ShieldCheck } from 'lucide-react';
import { ACStatusChip } from './ACStatusChip';
import type { ACTransaction, ACPaymentMethod } from '../../data/accountantStore';
import { formatUGX } from '../../data/accountantStore';

interface ACTransactionRowProps {
  tx: ACTransaction;
  onClick: () => void;
}

const methodMeta: Record<ACPaymentMethod, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  cash: {
    icon: <Banknote className="w-4 h-4" />,
    label: 'Cash',
    color: 'text-[#38C172]',
    bg: 'bg-[#E9F8F0]',
  },
  'mobile-money': {
    icon: <Smartphone className="w-4 h-4" />,
    label: 'Mobile Money',
    color: 'text-[#FFB649]',
    bg: 'bg-[#FFF3DC]',
  },
  card: {
    icon: <CreditCard className="w-4 h-4" />,
    label: 'Card',
    color: 'text-[#3A8DFF]',
    bg: 'bg-[#E8F2FF]',
  },
  insurance: {
    icon: <ShieldCheck className="w-4 h-4" />,
    label: 'Insurance',
    color: 'text-[#8B5CF6]',
    bg: 'bg-[#F5F3FF]',
  },
};

export function ACTransactionRow({ tx, onClick }: ACTransactionRowProps) {
  const mm = methodMeta[tx.method];

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
    >
      {/* Method icon */}
      <div className={`w-10 h-10 rounded-xl ${mm.bg} flex items-center justify-center flex-shrink-0 ${mm.color}`}>
        {mm.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-[#1A1A1A] truncate">{tx.patientName}</p>
        </div>
        <p className="text-xs text-[#8F9AA1] truncate mt-0.5">{tx.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[#C9D0DB] text-[12px]">{tx.time}</span>
          <ACStatusChip status={tx.status} />
        </div>
      </div>

      <div className="text-right flex-shrink-0 ml-1">
        <p className={`text-sm font-semibold ${tx.status === 'refunded' ? 'text-[#8B5CF6]' : tx.status === 'failed' ? 'text-[#E44F4F]' : 'text-[#1A1A1A]'}`}>
          {tx.status === 'refunded' ? '-' : ''}{formatUGX(tx.amount)}
        </p>
        <p className="text-[#C9D0DB] mt-0.5 text-[12px]">{mm.label}</p>
      </div>

      <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
    </button>
  );
}
