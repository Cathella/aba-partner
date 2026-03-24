/**
 * AC-06 Cash Reconciliation — Daily cash drawer reconciliation.
 *
 * Layout:
 *   1. Date selector (Today default)
 *   2. System Cash Total card with reception-shift breakdown
 *   3. Counted Cash input: "Cash counted (UGX)" + "Notes (optional)"
 *   4. Auto variance card with WARNING banner when variance ≠ 0
 *   5. "Submit Reconciliation" → confirmation modal → success toast
 *   6. Reconciliation History (last 3 days)
 *
 * Main navigation page: AccountantBottomNav present.
 * Prototype: Overview → Reconcile Cash → submit → success → back to Overview.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ABAButton } from '../components/aba/ABAButton';
import { ACConfirmModal } from '../components/aba/ACConfirmModal';
import { showToast } from '../components/aba/Toast';
import { useAccountantStore, formatUGX } from '../data/accountantStore';
import {
  Banknote,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  CalendarDays,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  History,
  ShieldCheck,
} from 'lucide-react';

/* ── date options ── */

type DateKey = 'today' | 'yesterday' | '12-feb';

const dateOptions: { key: DateKey; label: string; date: string }[] = [
  { key: 'today', label: 'Today', date: '2026-02-14' },
  { key: 'yesterday', label: 'Yesterday', date: '2026-02-13' },
  { key: '12-feb', label: '12 Feb', date: '2026-02-12' },
];

/* ── sample shift breakdown (prototype) ── */
interface ShiftEntry {
  shift: string;
  staff: string;
  amount: number;
  txCount: number;
}

const shiftBreakdowns: Record<string, ShiftEntry[]> = {
  '2026-02-14': [
    { shift: 'Morning Shift (8 AM – 1 PM)', staff: 'Receptionist Apio', amount: 85000, txCount: 1 },
    { shift: 'Afternoon Shift (1 PM – 6 PM)', staff: 'Receptionist Nambi', amount: 0, txCount: 0 },
  ],
  '2026-02-13': [
    { shift: 'Morning Shift (8 AM – 1 PM)', staff: 'Receptionist Apio', amount: 0, txCount: 0 },
    { shift: 'Afternoon Shift (1 PM – 6 PM)', staff: 'Receptionist Nambi', amount: 65000, txCount: 1 },
  ],
  '2026-02-12': [
    { shift: 'Morning Shift (8 AM – 1 PM)', staff: 'Receptionist Apio', amount: 28000, txCount: 1 },
    { shift: 'Afternoon Shift (1 PM – 6 PM)', staff: 'Receptionist Nambi', amount: 0, txCount: 0 },
  ],
};

/* ── sample reconciliation history (prototype) ── */
interface ReconRecord {
  id: string;
  date: string;
  dateLabel: string;
  systemTotal: number;
  counted: number;
  variance: number;
  status: 'submitted' | 'reviewed';
  submittedBy: string;
  submittedAt: string;
}

const reconciliationHistory: ReconRecord[] = [
  {
    id: 'rec-001',
    date: '2026-02-13',
    dateLabel: '13 Feb 2026',
    systemTotal: 65000,
    counted: 65000,
    variance: 0,
    status: 'reviewed',
    submittedBy: 'Accountant Byaruhanga',
    submittedAt: '13 Feb, 6:15 PM',
  },
  {
    id: 'rec-002',
    date: '2026-02-12',
    dateLabel: '12 Feb 2026',
    systemTotal: 28000,
    counted: 27000,
    variance: -1000,
    status: 'reviewed',
    submittedBy: 'Accountant Byaruhanga',
    submittedAt: '12 Feb, 5:45 PM',
  },
  {
    id: 'rec-003',
    date: '2026-02-11',
    dateLabel: '11 Feb 2026',
    systemTotal: 0,
    counted: 0,
    variance: 0,
    status: 'submitted',
    submittedBy: 'Accountant Byaruhanga',
    submittedAt: '11 Feb, 6:00 PM',
  },
];

/* ════════════════════════════════════════ */

export function ACReconcileCash() {
  const navigate = useNavigate();
  const { transactions } = useAccountantStore();

  const [selectedDate, setSelectedDate] = useState<DateKey>('today');
  const [countedInput, setCountedInput] = useState('');
  const [note, setNote] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* ── computed values ── */
  const dateStr = dateOptions.find((d) => d.key === selectedDate)!.date;

  const systemCashTotal = useMemo(
    () =>
      transactions
        .filter((t) => t.date === dateStr && t.method === 'cash' && t.status === 'paid')
        .reduce((s, t) => s + t.amount, 0),
    [transactions, dateStr]
  );

  const shifts = shiftBreakdowns[dateStr] || [];
  const counted = parseInt(countedInput.replace(/,/g, ''), 10) || 0;
  const variance = counted - systemCashTotal;
  const isBalanced = counted > 0 && variance === 0;
  const hasVariance = counted > 0 && variance !== 0;

  /* ── handlers ── */
  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowConfirm(false);
      setSubmitted(true);
      showToast(
        isBalanced
          ? 'Cash reconciled — no variance detected'
          : `Reconciliation submitted — variance of ${formatUGX(Math.abs(variance))} recorded`,
        isBalanced ? 'success' : 'warning'
      );
    }, 600);
  };

  const handleReset = () => {
    setSubmitted(false);
    setCountedInput('');
    setNote('');
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      {/* ═══ Header ═══ */}
      <div className="bg-[#FFFFFF] border-b border-[#E5E8EC] px-4 h-14 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F7F9FC] transition-colors mr-2 -ml-1"
          >
            <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <h1 className="text-lg font-semibold text-[#1A1A1A]">Cash Reconciliation</h1>
        </div>
        <button
          onClick={() => navigate('/ac/overview')}
          className="text-xs font-semibold text-[#3A8DFF] hover:text-[#3A8DFF]/80 transition-colors"
        >
          Overview
        </button>
      </div>

      {/* ═══ Content ═══ */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-3">

          {/* ── 1. Date Selector ── */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {dateOptions.map((d) => (
              <button
                key={d.key}
                onClick={() => {
                  setSelectedDate(d.key);
                  handleReset();
                }}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedDate === d.key
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-[#FFFFFF] text-[#8F9AA1] border border-[#E5E8EC] hover:text-[#4A4F55]'
                }`}
              >
                <CalendarDays className="w-3 h-3" />
                {d.label}
              </button>
            ))}
          </div>

          {/* ── Success State ── */}
          {submitted ? (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#E9F8F0] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#38C172]" />
              </div>
              <h2 className="text-lg font-semibold text-[#1A1A1A] mb-1">Reconciliation Submitted</h2>
              <p className="text-sm text-[#8F9AA1] mb-2">
                {isBalanced
                  ? 'Cash drawer balances with system records.'
                  : `Variance of ${variance > 0 ? '+' : ''}${formatUGX(Math.abs(variance))} recorded for review.`}
              </p>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E9F8F0] text-[#38C172] text-xs font-semibold mb-5">
                <CheckCircle2 className="w-3 h-3" />
                Submitted
              </div>

              <div className="space-y-2">
                <ABAButton variant="primary" fullWidth onClick={() => navigate('/ac/overview')}>
                  Back to Finance Overview
                </ABAButton>
                <ABAButton variant="outline" fullWidth onClick={handleReset}>
                  Reconcile Again
                </ABAButton>
              </div>
            </div>
          ) : (
            <>
              {/* ── 2. System Cash Total ── */}
              <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-[#E9F8F0] flex items-center justify-center flex-shrink-0">
                      <Calculator className="w-5 h-5 text-[#38C172]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#8F9AA1] uppercase tracking-wide">System Cash Total</p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">{formatUGX(systemCashTotal)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#8F9AA1] mt-2">
                    Total cash payments recorded for {dateOptions.find((d) => d.key === selectedDate)?.label.toLowerCase() ?? 'today'}.
                  </p>
                </div>

                {/* Shift breakdown */}
                {shifts.length > 0 && (
                  <div className="border-t border-[#E5E8EC]">
                    <div className="px-4 py-2.5">
                      <p className="text-[10px] font-semibold text-[#8F9AA1] uppercase tracking-wide">
                        Reception Shift Breakdown
                      </p>
                    </div>
                    {shifts.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-4 py-3 border-t border-[#E5E8EC]"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#F7F9FC] flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-[#4A4F55]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#1A1A1A]">{s.shift}</p>
                          <p className="text-[#8F9AA1] mt-0.5 text-[12px]">
                            {s.staff} &middot; {s.txCount} transaction{s.txCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-[#1A1A1A] flex-shrink-0">
                          {formatUGX(s.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── 3. Counted Cash Input ── */}
              <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Banknote className="w-4 h-4 text-[#4A4F55]" />
                  <h3 className="text-sm font-semibold text-[#1A1A1A]">Counted Cash</h3>
                </div>

                {/* Amount field */}
                <label className="block mb-1.5">
                  <span className="text-xs text-[#8F9AA1]">Cash counted (UGX)</span>
                </label>
                <div className="relative mb-4">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8F9AA1]">UGX</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={countedInput}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setCountedInput(raw ? parseInt(raw, 10).toLocaleString('en-UG') : '');
                    }}
                    placeholder="0"
                    className="w-full h-12 pl-12 pr-4 border border-[#E5E8EC] bg-[#F7F9FC] text-lg font-semibold text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all rounded-[14px]"
                  />
                </div>

                {/* Notes field */}
                <label className="block mb-1.5">
                  <span className="text-xs text-[#8F9AA1]">Notes (optional)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Any notes about this reconciliation..."
                  className="w-full border border-[#E5E8EC] bg-[#F7F9FC] p-3 text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all resize-none rounded-[14px]"
                />
              </div>

              {/* ── 4. Variance Card ── */}
              {counted > 0 && (
                <div className={`rounded-2xl border p-4 ${
                  isBalanced
                    ? 'bg-[#E9F8F0] border-[#38C172]/20'
                    : 'bg-[#FFFFFF] border-[#E5E8EC]'
                }`}>
                  {/* Variance value */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[#8F9AA1] uppercase tracking-wide font-semibold">Variance</span>
                    <span className={`text-lg font-bold ${
                      isBalanced ? 'text-[#38C172]' : variance > 0 ? 'text-[#D97706]' : 'text-[#E44F4F]'
                    }`}>
                      {isBalanced ? formatUGX(0) : `${variance > 0 ? '+' : '-'} ${formatUGX(Math.abs(variance))}`}
                    </span>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-1.5 text-xs mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8F9AA1]">Counted</span>
                      <span className="font-medium text-[#1A1A1A]">{formatUGX(counted)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8F9AA1]">System</span>
                      <span className="font-medium text-[#1A1A1A]">{formatUGX(systemCashTotal)}</span>
                    </div>
                  </div>

                  {/* Status indicator */}
                  {isBalanced ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[#32C28A]/10">
                      <CheckCircle2 className="w-4 h-4 text-[#38C172] flex-shrink-0" />
                      <p className="text-sm font-semibold text-[#38C172]">Balanced — no variance</p>
                    </div>
                  ) : (
                    <div className={`p-3 rounded-xl flex items-start gap-2.5 ${
                      variance > 0 ? 'bg-[#FFF3DC] border border-[#FFB649]/20' : 'bg-[#FDECEC] border border-[#E44F4F]/20'
                    }`}>
                      <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        variance > 0 ? 'text-[#D97706]' : 'text-[#E44F4F]'
                      }`} />
                      <div>
                        <p className={`text-sm font-semibold ${
                          variance > 0 ? 'text-[#D97706]' : 'text-[#E44F4F]'
                        }`}>
                          Variance detected
                        </p>
                        <p className="text-xs text-[#8F9AA1] mt-0.5">
                          {variance > 0
                            ? 'Physical count exceeds system records. Please verify.'
                            : 'Physical count is below system records. Please verify.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── 5. Submit Button ── */}
              <ABAButton
                variant="primary"
                fullWidth
                size="lg"
                disabled={!counted}
                onClick={() => setShowConfirm(true)}
              >
                <CheckCircle2 className="w-5 h-5" />
                Submit Reconciliation
              </ABAButton>
            </>
          )}

          {/* ── 6. Reconciliation History ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E5E8EC]">
              <History className="w-3.5 h-3.5 text-[#8F9AA1]" />
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Reconciliation History
              </h3>
            </div>
            {reconciliationHistory.length > 0 ? (
              reconciliationHistory.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E8EC] last:border-b-0"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    rec.status === 'reviewed' ? 'bg-[#E9F8F0]' : 'bg-[#E8F2FF]'
                  }`}>
                    {rec.status === 'reviewed' ? (
                      <ShieldCheck className="w-4 h-4 text-[#38C172]" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#3A8DFF]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#1A1A1A]">{rec.dateLabel}</p>
                      <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${ rec.status === 'reviewed' ? 'bg-[#E9F8F0] text-[#38C172]' : 'bg-[#E8F2FF] text-[#3A8DFF]' } text-[12px]`}>
                        {rec.status === 'reviewed' ? 'Reviewed' : 'Submitted'}
                      </span>
                    </div>
                    <p className="text-xs text-[#8F9AA1] mt-0.5">
                      System: {formatUGX(rec.systemTotal)} &middot; Counted: {formatUGX(rec.counted)}
                    </p>
                    {rec.variance !== 0 && (
                      <p className={`font-semibold mt-0.5 ${ rec.variance > 0 ? 'text-[#D97706]' : 'text-[#E44F4F]' } text-[12px]`}>
                        Variance: {rec.variance > 0 ? '+' : ''}{formatUGX(Math.abs(rec.variance))}
                      </p>
                    )}
                    {rec.variance === 0 && (
                      <p className="font-semibold mt-0.5 text-[#38C172] text-[12px]">Balanced</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[#C9D0DB] text-[12px]">{rec.submittedAt}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-[#8F9AA1]">No history yet.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ═══ Confirmation Modal ═══ */}
      <ACConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Submit Cash Reconciliation?"
        description={
          hasVariance
            ? `A variance of ${variance > 0 ? '+' : ''}${formatUGX(Math.abs(variance))} will be recorded for review.`
            : 'Cash drawer matches system records. No variance detected.'
        }
        icon={
          hasVariance
            ? <AlertTriangle className="w-5 h-5 text-[#D97706]" />
            : <CheckCircle2 className="w-5 h-5 text-[#38C172]" />
        }
        iconBg={hasVariance ? 'bg-[#FFF3DC]' : 'bg-[#E9F8F0]'}
        confirmText="Submit"
        onConfirm={handleSubmit}
        isLoading={isSubmitting}
      >
        <div className="bg-[#F7F9FC] rounded-xl p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#8F9AA1]">Date</span>
            <span className="font-medium text-[#1A1A1A]">
              {dateOptions.find((d) => d.key === selectedDate)?.label}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8F9AA1]">System Total</span>
            <span className="font-medium text-[#1A1A1A]">{formatUGX(systemCashTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8F9AA1]">Counted</span>
            <span className="font-medium text-[#1A1A1A]">{formatUGX(counted)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-[#E5E8EC] pt-2">
            <span className="text-[#8F9AA1] font-semibold">Variance</span>
            <span className={`font-bold ${
              isBalanced ? 'text-[#38C172]' : variance > 0 ? 'text-[#D97706]' : 'text-[#E44F4F]'
            }`}>
              {isBalanced ? formatUGX(0) : `${variance > 0 ? '+' : '-'} ${formatUGX(Math.abs(variance))}`}
            </span>
          </div>
          {note.trim() && (
            <div className="border-t border-[#E5E8EC] pt-2">
              <span className="text-[#8F9AA1]">Notes: </span>
              <span className="text-[#4A4F55]">{note}</span>
            </div>
          )}
        </div>
      </ACConfirmModal>
    </div>
  );
}