/**
 * AC-04 Settlements Ledger — Tabbed settlement list.
 *
 * Tabs: Pending, Processing, Paid
 * Each row: settlement period, total amount, status chip, expected payout date.
 * Tap row → AC-05 Settlement Detail.
 * Main navigation page: AccountantBottomNav present.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AccountantBottomNav } from '../components/aba/AccountantBottomNav';
import { ACStatusChip } from '../components/aba/ACStatusChip';
import { ACExportModal } from '../components/aba/ACExportModal';
import { useAccountantStore, formatUGX } from '../data/accountantStore';
import type { ACSettlement, ACSettlementStatus } from '../data/accountantStore';
import {
  Download,
  Landmark,
  TrendingUp,
  ChevronRight,
  Calendar,
  Inbox,
} from 'lucide-react';

/* ── tab config ── */

type SettlementTab = 'pending' | 'processing' | 'settled';

const tabs: { key: SettlementTab; label: string; storeStatus: ACSettlementStatus }[] = [
  { key: 'pending', label: 'Pending', storeStatus: 'pending' },
  { key: 'processing', label: 'Processing', storeStatus: 'processing' },
  { key: 'settled', label: 'Paid', storeStatus: 'settled' },
];

/* ════════════════════════════════════════ */

export function ACSettlements() {
  const navigate = useNavigate();
  const { settlements } = useAccountantStore();
  const [activeTab, setActiveTab] = useState<SettlementTab>('pending');
  const [showExport, setShowExport] = useState(false);

  /* Filtered settlements for each tab */
  const tabCounts = useMemo(() => ({
    pending: settlements.filter((s) => s.status === 'pending').length,
    processing: settlements.filter((s) => s.status === 'processing').length,
    settled: settlements.filter((s) => s.status === 'settled').length,
  }), [settlements]);

  const filtered = useMemo(
    () => settlements.filter((s) => s.status === tabs.find((t) => t.key === activeTab)!.storeStatus),
    [settlements, activeTab]
  );

  /* Summary KPIs */
  const totalSettled = settlements
    .filter((s) => s.status === 'settled')
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const pendingTotal = settlements
    .filter((s) => s.status !== 'settled')
    .reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      {/* ═══ Header ═══ */}
      <div className="bg-[#FFFFFF] border-b border-[#E5E8EC] px-4 h-14 flex items-center justify-between flex-shrink-0">
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Settlements</h1>
        <button
          onClick={() => setShowExport(true)}
          className="p-2 rounded-xl bg-[#F7F9FC] border border-[#E5E8EC] hover:bg-[#E5E8EC] transition-colors"
        >
          <Download className="w-4 h-4 text-[#4A4F55]" />
        </button>
      </div>

      {/* ═══ Tabs ═══ */}
      <div className="bg-[#FFFFFF] border-b border-[#E5E8EC] flex-shrink-0">
        <div className="flex">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 text-center transition-all relative ${
                  isActive ? 'text-[#1A1A1A]' : 'text-[#8F9AA1]'
                }`}
              >
                <span className="text-sm font-semibold">{tab.label}</span>
                {tabCounts[tab.key] > 0 && (
                  <span className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold px-1 ${
                    isActive
                      ? tab.key === 'pending'
                        ? 'bg-[#FFB649] text-white'
                        : tab.key === 'processing'
                        ? 'bg-[#3A8DFF] text-white'
                        : 'bg-[#38C172] text-white'
                      : 'bg-[#E5E8EC] text-[#8F9AA1]'
                  }`}>
                    {tabCounts[tab.key]}
                  </span>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#1A1A1A] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ Content ═══ */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-3">

          {/* ── Summary KPI row ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <div className="w-8 h-8 rounded-lg bg-[#E9F8F0] flex items-center justify-center mb-2">
                <TrendingUp className="w-4 h-4 text-[#38C172]" />
              </div>
              <p className="text-lg font-bold text-[#1A1A1A]">{formatUGX(totalSettled)}</p>
              <p className="text-xs text-[#8F9AA1] mt-0.5">Total Paid Out</p>
            </div>
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <div className="w-8 h-8 rounded-lg bg-[#FFF3DC] flex items-center justify-center mb-2">
                <Landmark className="w-4 h-4 text-[#FFB649]" />
              </div>
              <p className="text-lg font-bold text-[#1A1A1A]">{formatUGX(pendingTotal)}</p>
              <p className="text-xs text-[#8F9AA1] mt-0.5">Awaiting Payout</p>
            </div>
          </div>

          {/* ── Settlement list ── */}
          {filtered.length > 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
              {filtered.map((s) => (
                <SettlementRow
                  key={s.id}
                  settlement={s}
                  onClick={() => navigate(`/ac/settlement/${s.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-16">
              <div className="w-14 h-14 rounded-2xl bg-[#F7F9FC] border border-[#E5E8EC] flex items-center justify-center mb-4">
                <Inbox className="w-6 h-6 text-[#C9D0DB]" />
              </div>
              <p className="text-sm font-medium text-[#4A4F55]">No {tabs.find((t) => t.key === activeTab)?.label.toLowerCase()} settlements</p>
              <p className="text-xs text-[#8F9AA1] mt-1">Check back later.</p>
            </div>
          )}
        </div>
      </div>

      <AccountantBottomNav />
      <ACExportModal isOpen={showExport} onClose={() => setShowExport(false)} title="Export Settlements" />
    </div>
  );
}

/* ═══════ Settlement Row ═══════ */

function SettlementRow({ settlement, onClick }: { settlement: ACSettlement; onClick: () => void }) {
  const isPaid = settlement.status === 'settled';
  const isPending = settlement.status === 'pending';

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-4 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isPaid ? 'bg-[#E9F8F0]' : isPending ? 'bg-[#FFF3DC]' : 'bg-[#E8F2FF]'
      }`}>
        <Landmark className={`w-5 h-5 ${
          isPaid ? 'text-[#38C172]' : isPending ? 'text-[#FFB649]' : 'text-[#3A8DFF]'
        }`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1A1A1A]">{settlement.periodLabel}</p>
        <div className="flex items-center gap-2 mt-1">
          <ACStatusChip status={settlement.status} />
          <span className="text-[12px] text-[#8f9aa1]">
            {settlement.transactionCount} txn{settlement.transactionCount !== 1 ? 's' : ''}
          </span>
        </div>
        {/* Expected payout or settled date */}
        <div className="flex items-center gap-1 mt-1.5">
          <Calendar className="w-3 h-3 text-[#C9D0DB]" />
          <span className="text-[#8F9AA1] text-[12px]">
            {isPaid
              ? `Paid ${settlement.settledAt}`
              : settlement.expectedPayoutDate
              ? `Expected payout: ${settlement.expectedPayoutDate}`
              : 'Payout date TBD'}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0 ml-1">
        <p className="text-sm font-semibold text-[#1A1A1A]">{formatUGX(settlement.totalAmount)}</p>
      </div>

      <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
    </button>
  );
}
