/**
 * ACSettlementRow — Reusable row for settlement ledger lists.
 * Shows period, total amount, transaction count, status chip.
 */
import { ChevronRight, Landmark } from 'lucide-react';
import { ACStatusChip } from './ACStatusChip';
import type { ACSettlement } from '../../data/accountantStore';
import { formatUGX } from '../../data/accountantStore';

interface ACSettlementRowProps {
  settlement: ACSettlement;
  onClick: () => void;
}

export function ACSettlementRow({ settlement, onClick }: ACSettlementRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-4 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
    >
      {/* Bank icon */}
      <div className="w-10 h-10 rounded-xl bg-[#E8F2FF] flex items-center justify-center flex-shrink-0">
        <Landmark className="w-5 h-5 text-[#3A8DFF]" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1A1A1A]">{settlement.periodLabel}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-[#8F9AA1]">
            {settlement.transactionCount} transaction{settlement.transactionCount !== 1 ? 's' : ''}
          </span>
          <ACStatusChip status={settlement.status} />
        </div>
        <p className="text-[10px] text-[#C9D0DB] mt-1">{settlement.bankAccount}</p>
      </div>

      <div className="text-right flex-shrink-0 ml-1">
        <p className="text-sm font-semibold text-[#1A1A1A]">{formatUGX(settlement.totalAmount)}</p>
        {settlement.settledAt && (
          <p className="text-[10px] text-[#38C172] mt-0.5">Settled {settlement.settledAt}</p>
        )}
      </div>

      <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
    </button>
  );
}
