/**
 * AC-05 Settlement Detail — Full breakdown of a settlement period.
 *
 * Sections:
 *   1. Header: period + status badge
 *   2. Summary card: gross, refunds deducted, net payout
 *   3. Payout destination card: Bank/MoMo (masked)
 *   4. Timeline stepper: Generated → Processing → Paid
 *   5. "Included Transactions" list (top 10) — amount + method
 *   6. Actions: Export statement (toast), Report issue (toast)
 *
 * Pending settlements show warning note.
 * Inner page: back arrow, no bottom nav.
 */
import { useNavigate, useParams } from 'react-router';
import { copyToClipboard } from '../utils/clipboard';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { ACStatusChip } from '../components/aba/ACStatusChip';
import { showToast } from '../components/aba/Toast';
import {
  useAccountantStore,
  formatUGX,
} from '../data/accountantStore';
import type { ACPaymentMethod } from '../data/accountantStore';
import {
  Landmark,
  Banknote,
  Smartphone,
  CreditCard,
  ShieldCheck,
  FileDown,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Clock,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

/* ── method helpers ── */

const methodMeta: Record<ACPaymentMethod, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
  cash: { label: 'Cash', icon: <Banknote className="w-3.5 h-3.5" />, bg: 'bg-[#E9F8F0]', text: 'text-[#38C172]' },
  'mobile-money': { label: 'Wallet', icon: <Smartphone className="w-3.5 h-3.5" />, bg: 'bg-[#E8F2FF]', text: 'text-[#3A8DFF]' },
  card: { label: 'Card', icon: <CreditCard className="w-3.5 h-3.5" />, bg: 'bg-[#FFF3DC]', text: 'text-[#D97706]' },
  insurance: { label: 'Corporate', icon: <ShieldCheck className="w-3.5 h-3.5" />, bg: 'bg-[#F5F3FF]', text: 'text-[#8B5CF6]' },
};

/* ════════════════════════════════════════ */

export function ACSettlementDetail() {
  const navigate = useNavigate();
  const { settlementId } = useParams<{ settlementId: string }>();
  const { getSettlementById, getTransactionsForDate } = useAccountantStore();
  const settlement = getSettlementById(settlementId || '');

  /* ── not found ── */
  if (!settlement) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Settlement Detail" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Settlement not found</p>
        </div>
      </div>
    );
  }

  const txs = getTransactionsForDate(settlement.period).slice(0, 10);
  const refunds = settlement.refundsDeducted ?? 0;
  const netPayout = settlement.totalAmount - refunds;
  const isPending = settlement.status === 'pending';
  const isProcessing = settlement.status === 'processing';
  const isPaid = settlement.status === 'settled';
  const payoutLabel = settlement.payoutMethod === 'mobile-money' ? 'Mobile Money' : 'Bank Transfer';

  /* ── timeline steps ── */
  const steps: { label: string; time?: string; status: 'done' | 'active' | 'upcoming' }[] = [
    {
      label: 'Generated',
      time: settlement.generatedAt,
      status: settlement.generatedAt ? 'done' : 'upcoming',
    },
    {
      label: 'Processing',
      time: settlement.processingAt,
      status: isProcessing ? 'active' : settlement.processingAt ? 'done' : 'upcoming',
    },
    {
      label: 'Paid',
      time: settlement.settledAt,
      status: isPaid ? 'done' : 'upcoming',
    },
  ];

  /* ── actions ── */
  const handleExport = () => {
    copyToClipboard(
      `Settlement #${settlement.id}\nAmount: UGX ${settlement.amount.toLocaleString()}\nStatus: ${settlement.status}\nDate: ${settlement.date}`
    );
    showToast('Settlement statement copied to clipboard', 'success');
  };
  const handleReport = () => showToast('Issue report submitted — we will review', 'success');

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Settlement Detail" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-40">
        <div className="p-4 space-y-3">

          {/* ═══ 1. Header: Period + Status ═══ */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-5 text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              isPaid ? 'bg-[#E9F8F0]' : isPending ? 'bg-[#FFF3DC]' : 'bg-[#E8F2FF]'
            }`}>
              <Landmark className={`w-6 h-6 ${
                isPaid ? 'text-[#38C172]' : isPending ? 'text-[#FFB649]' : 'text-[#3A8DFF]'
              }`} />
            </div>
            <p className="text-sm text-[#8F9AA1] mb-1">{settlement.periodLabel}</p>
            <p className="text-3xl font-bold text-[#1A1A1A]">{formatUGX(netPayout)}</p>
            <div className="flex items-center justify-center gap-2 mt-2.5">
              <ACStatusChip status={settlement.status} size="md" />
            </div>
          </div>

          {/* ═══ Pending warning note ═══ */}
          {isPending && (
            <div className="bg-[#FFF3DC] rounded-2xl border border-[#FFB649]/15 p-4 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[#1A1A1A] mb-0.5">Pending Processing</p>
                <p className="text-sm text-[#4A4F55] leading-relaxed">
                  This settlement is pending processing by Aba Wallet. Expected payout: <span className="font-semibold">{settlement.expectedPayoutDate || 'TBD'}</span>.
                </p>
              </div>
            </div>
          )}

          {/* ═══ 2. Summary Card ═══ */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC]">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">Payout Summary</h3>
            </div>
            <div className="p-4 space-y-3">
              <SummaryLine label="Gross Collections" value={formatUGX(settlement.totalAmount)} />
              <SummaryLine
                label="Refunds Deducted"
                value={refunds > 0 ? `- ${formatUGX(refunds)}` : formatUGX(0)}
                valueColor={refunds > 0 ? 'text-[#E44F4F]' : undefined}
              />
              <div className="border-t border-[#E5E8EC] pt-3">
                <SummaryLine
                  label="Net Payout"
                  value={formatUGX(netPayout)}
                  bold
                  valueColor="text-[#32C28A]"
                />
              </div>
              <div className="pt-1">
                <SummaryLine label="Transactions" value={String(settlement.transactionCount)} />
                <div className="mt-2">
                  <SummaryLine label="Reference" value={settlement.reference} />
                </div>
              </div>
            </div>
          </div>

          {/* ═══ 3. Payout Destination ═══ */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                settlement.payoutMethod === 'mobile-money' ? 'bg-[#FFF3DC]' : 'bg-[#E8F2FF]'
              }`}>
                {settlement.payoutMethod === 'mobile-money' ? (
                  <Smartphone className="w-5 h-5 text-[#D97706]" />
                ) : (
                  <Landmark className="w-5 h-5 text-[#3A8DFF]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#8F9AA1] uppercase tracking-wide">Payout Destination</p>
                <p className="text-sm font-medium text-[#1A1A1A] mt-0.5">{payoutLabel}</p>
                <p className="text-xs text-[#4A4F55] mt-0.5">{settlement.bankAccount}</p>
              </div>
            </div>
          </div>

          {/* ═══ 4. Timeline Stepper ═══ */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC]">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">Settlement Timeline</h3>
            </div>
            <div className="p-4">
              {steps.map((step, i) => (
                <TimelineStep
                  key={step.label}
                  label={step.label}
                  time={step.time}
                  status={step.status}
                  isLast={i === steps.length - 1}
                />
              ))}
            </div>
          </div>

          {/* ═══ 5. Included Transactions ═══ */}
          {txs.length > 0 && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E8EC]">
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Included Transactions
                </h3>
                <span className="text-[10px] text-[#C9D0DB]">
                  Showing {txs.length} of {settlement.transactionCount}
                </span>
              </div>
              {txs.map((tx) => {
                const mm = methodMeta[tx.method];
                return (
                  <button
                    key={tx.id}
                    onClick={() => navigate(`/ac/transaction/${tx.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1A1A1A] truncate">{tx.patientName}</p>
                      <p className="text-xs text-[#8F9AA1] truncate mt-0.5">{tx.description}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${mm.bg} ${mm.text}`}>
                      {mm.icon}
                      {mm.label}
                    </span>
                    <span className="text-sm font-semibold text-[#1A1A1A] flex-shrink-0 ml-1">
                      {formatUGX(tx.amount)}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#C9D0DB] flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {/* ═══ Breakdown by Method ═══ */}
          {settlement.breakdown && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E8EC]">
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">Breakdown by Method</h3>
              </div>
              {[
                { label: 'Cash', amount: settlement.breakdown.cash, icon: <Banknote className="w-4 h-4 text-[#38C172]" />, bg: 'bg-[#E9F8F0]' },
                { label: 'Aba Wallet', amount: settlement.breakdown.mobileMoney, icon: <Smartphone className="w-4 h-4 text-[#3A8DFF]" />, bg: 'bg-[#E8F2FF]' },
                { label: 'Card', amount: settlement.breakdown.card, icon: <CreditCard className="w-4 h-4 text-[#D97706]" />, bg: 'bg-[#FFF3DC]' },
                { label: 'Corporate', amount: settlement.breakdown.insurance, icon: <ShieldCheck className="w-4 h-4 text-[#8B5CF6]" />, bg: 'bg-[#F5F3FF]' },
              ].filter((r) => r.amount > 0).map((row) => (
                <div
                  key={row.label}
                  className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E8EC] last:border-b-0"
                >
                  <div className={`w-8 h-8 rounded-lg ${row.bg} flex items-center justify-center flex-shrink-0`}>
                    {row.icon}
                  </div>
                  <span className="flex-1 text-sm text-[#1A1A1A]">{row.label}</span>
                  <span className="text-sm font-semibold text-[#1A1A1A]">{formatUGX(row.amount)}</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ═══ 6. Sticky Actions ═══ */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4 space-y-2">
          <ABAButton variant="outline" fullWidth onClick={handleExport}>
            <FileDown className="w-4 h-4" />
            Export Settlement Statement
          </ABAButton>
          <ABAButton variant="outline" fullWidth onClick={handleReport}>
            <AlertCircle className="w-4 h-4" />
            Report Issue
          </ABAButton>
        </div>
      </div>
    </div>
  );
}

/* ═══════ Sub-components ═══════ */

function SummaryLine({
  label,
  value,
  bold = false,
  valueColor,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs ${bold ? 'font-semibold text-[#1A1A1A]' : 'text-[#8F9AA1]'}`}>{label}</span>
      <span className={`text-sm ${bold ? 'font-bold' : 'font-medium'} ${valueColor || 'text-[#1A1A1A]'}`}>
        {value}
      </span>
    </div>
  );
}

function TimelineStep({
  label,
  time,
  status,
  isLast,
}: {
  label: string;
  time?: string;
  status: 'done' | 'active' | 'upcoming';
  isLast: boolean;
}) {
  return (
    <div className="flex gap-3">
      {/* Dot + Line */}
      <div className="flex flex-col items-center">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          status === 'done'
            ? 'bg-[#32C28A]'
            : status === 'active'
            ? 'bg-[#3A8DFF]'
            : 'bg-[#E5E8EC]'
        }`}>
          {status === 'done' ? (
            <CheckCircle2 className="w-4 h-4 text-white" />
          ) : status === 'active' ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-[#8F9AA1]" />
          )}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-[28px] ${
            status === 'done' ? 'bg-[#32C28A]' : 'bg-[#E5E8EC]'
          }`} />
        )}
      </div>

      {/* Content */}
      <div className={`pb-5 ${isLast ? 'pb-0' : ''}`}>
        <p className={`text-sm font-medium ${
          status === 'upcoming' ? 'text-[#C9D0DB]' : 'text-[#1A1A1A]'
        }`}>
          {label}
        </p>
        {time ? (
          <p className="text-xs text-[#8F9AA1] mt-0.5">{time}</p>
        ) : (
          <p className="text-xs text-[#C9D0DB] mt-0.5 italic">
            {status === 'upcoming' ? 'Awaiting' : '—'}
          </p>
        )}
      </div>
    </div>
  );
}