/**
 * AC-07 Refunds & Disputes — Tabbed list of refund requests and disputes.
 *
 * Tabs: Refund Requests, Disputes
 * Rows: patient name, amount, short reason, status chip, time raised.
 * Tap row → AC-08 detail.
 * Main navigation page: bottom nav present.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAccountantStore, formatUGX } from '../data/accountantStore';
import type { ACRefundDisputeRequest, ACRequestStatus } from '../data/accountantStore';
import {
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

/* ── status chip config ── */

const statusConfig: Record<ACRequestStatus, { label: string; dot: string; bg: string; text: string }> = {
  awaiting: { label: 'Awaiting Approval', dot: 'bg-[#FFB649]', bg: 'bg-[#FFF3DC]', text: 'text-[#D97706]' },
  approved: { label: 'Approved', dot: 'bg-[#38C172]', bg: 'bg-[#E9F8F0]', text: 'text-[#38C172]' },
  rejected: { label: 'Rejected', dot: 'bg-[#E44F4F]', bg: 'bg-[#FDECEC]', text: 'text-[#E44F4F]' },
};

function RequestStatusChip({ status }: { status: ACRequestStatus }) {
  const c = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full px-2 py-0.5 ${c.bg} ${c.text} text-[12px]`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

/* ── tabs ── */

type TabKey = 'refund' | 'dispute';

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'refund', label: 'Refund Requests', icon: <RotateCcw className="w-3.5 h-3.5" /> },
  { key: 'dispute', label: 'Disputes', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
];

/* ════════════════════════════════════════ */

export function ACRefundsDisputes() {
  const navigate = useNavigate();
  const { requests, alertStats } = useAccountantStore();
  const [activeTab, setActiveTab] = useState<TabKey>('refund');

  const refundList = useMemo(() => requests.filter((r) => r.type === 'refund'), [requests]);
  const disputeList = useMemo(() => requests.filter((r) => r.type === 'dispute'), [requests]);
  const filtered = activeTab === 'refund' ? refundList : disputeList;

  const tabCounts = {
    refund: refundList.filter((r) => r.status === 'awaiting').length,
    dispute: disputeList.filter((r) => r.status === 'awaiting').length,
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      {/* ═══ Header ═══ */}
      <div className="bg-[#FFFFFF] border-b border-[#E5E8EC] px-4 h-14 flex items-center flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F7F9FC] transition-colors mr-2 -ml-1"
        >
          <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
        </button>
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Refunds & Disputes</h1>
      </div>

      {/* ═══ Tabs ═══ */}
      <div className="bg-[#FFFFFF] border-b border-[#E5E8EC] flex-shrink-0">
        <div className="flex">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tabCounts[tab.key];
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 text-center transition-all relative ${
                  isActive ? 'text-[#1A1A1A]' : 'text-[#8F9AA1]'
                }`}
              >
                <span className="inline-flex items-center gap-1.5 font-semibold text-[12px]">
                  {tab.icon}
                  {tab.label}
                </span>
                {count > 0 && (
                  <span className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold px-1 ${
                    isActive
                      ? 'bg-[#FFB649] text-white'
                      : 'bg-[#E5E8EC] text-[#8F9AA1]'
                  }`}>
                    {count}
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

          {/* Summary KPI */}
          <div className="grid grid-cols-3 gap-2">
            {(['awaiting', 'approved', 'rejected'] as ACRequestStatus[]).map((st) => {
              const cnt = filtered.filter((r) => r.status === st).length;
              const c = statusConfig[st];
              const icons = { awaiting: <Clock className="w-3.5 h-3.5" />, approved: <CheckCircle2 className="w-3.5 h-3.5" />, rejected: <XCircle className="w-3.5 h-3.5" /> };
              return (
                <div key={st} className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-3 text-center">
                  <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center mx-auto mb-1.5 ${c.text}`}>
                    {icons[st]}
                  </div>
                  <p className="text-lg font-bold text-[#1A1A1A]">{cnt}</p>
                  <p className="text-[#8F9AA1] mt-0.5 text-[12px]">{c.label}</p>
                </div>
              );
            })}
          </div>

          {/* List */}
          {filtered.length > 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
              {filtered.map((req) => (
                <RequestRow
                  key={req.id}
                  request={req}
                  onClick={() => navigate(`/ac/refund-dispute/${req.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-16">
              <div className="w-14 h-14 rounded-2xl bg-[#F7F9FC] border border-[#E5E8EC] flex items-center justify-center mb-4">
                <Inbox className="w-6 h-6 text-[#C9D0DB]" />
              </div>
              <p className="text-sm font-medium text-[#4A4F55]">
                No {activeTab === 'refund' ? 'refund requests' : 'disputes'}
              </p>
              <p className="text-xs text-[#8F9AA1] mt-1">All clear for now.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

/* ═══════ Row ═══════ */

function RequestRow({ request, onClick }: { request: ACRefundDisputeRequest; onClick: () => void }) {
  const isRefund = request.type === 'refund';
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-4 py-4 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isRefund ? 'bg-[#F5F3FF]' : 'bg-[#FDECEC]'
      }`}>
        {isRefund ? (
          <RotateCcw className="w-5 h-5 text-[#8B5CF6]" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-[#E44F4F]" />
        )}
      </div>

      {/* Content + Amount row */}
      <div className="flex-1 min-w-0">
        {/* Top row: name + amount */}
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium text-[#1A1A1A] truncate">{request.patientName}</p>
          <p className="text-sm font-semibold text-[#1A1A1A] flex-shrink-0 whitespace-nowrap">{formatUGX(request.amount)}</p>
        </div>

        {/* Status chip */}
        <div className="mt-1">
          <RequestStatusChip status={request.status} />
        </div>

        {/* Reason */}
        <p className="text-xs text-[#8F9AA1] mt-1 truncate">{request.reason}</p>

        {/* Date */}
        <p className="text-[#C9D0DB] mt-1 text-[12px]">{request.raisedAt}</p>
      </div>

      <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0 mt-3" />
    </button>
  );
}