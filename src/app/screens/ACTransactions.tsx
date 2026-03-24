/**
 * AC-02 Transactions — Searchable, filterable transaction list.
 *
 * Filter layers:
 *   1. Date-range chips: Today / 7 days / 30 days / Custom
 *   2. Status chips: All, Paid, Pending, Failed, Refunded, Disputed
 *   3. Method chips: Wallet, Cash, Corporate, Mobile Money (disabled)
 *
 * Transaction row: patient name, service, amount, method chip, status chip, time.
 * Tap row → AC-03 Transaction Detail.
 * Main navigation page: AccountantBottomNav present.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AccountantBottomNav } from '../components/aba/AccountantBottomNav';
import { ACStatusChip } from '../components/aba/ACStatusChip';
import { ACExportModal } from '../components/aba/ACExportModal';
import { useAccountantStore, formatUGX } from '../data/accountantStore';
import type { ACTxStatus, ACPaymentMethod, ACTransaction } from '../data/accountantStore';
import {
  Search,
  Download,
  Inbox,
  CalendarDays,
  ChevronRight,
  Wallet,
  Banknote,
  Building2,
  Smartphone,
  Lock,
  SlidersHorizontal,
  X,
  ShieldCheck,
} from 'lucide-react';

/* ── filter types ── */

type DateRange = 'today' | '7d' | '30d' | 'custom';
type StatusFilter = 'all' | ACTxStatus;
type MethodFilter = 'all' | 'wallet' | 'cash' | 'corporate' | 'mobile-money';

const dateRanges: { key: DateRange; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: 'custom', label: 'Custom' },
];

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
  { key: 'refunded', label: 'Refunded' },
  { key: 'disputed', label: 'Disputed' },
];

interface MethodChip {
  key: MethodFilter;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  disabledLabel?: string;
  storeMethod?: ACPaymentMethod;
}

const methodChips: MethodChip[] = [
  { key: 'all', label: 'All Methods', icon: null },
  { key: 'wallet', label: 'Wallet', icon: <Wallet className="w-3 h-3" />, storeMethod: 'mobile-money' },
  { key: 'cash', label: 'Cash', icon: <Banknote className="w-3 h-3" />, storeMethod: 'cash' },
  { key: 'corporate', label: 'Corporate', icon: <Building2 className="w-3 h-3" />, storeMethod: 'insurance' },
  {
    key: 'mobile-money',
    label: 'Mobile Money',
    icon: <Smartphone className="w-3 h-3" />,
    disabled: true,
    disabledLabel: 'Integration pending',
  },
];

/* ── method display helpers ── */

const methodDisplayMeta: Record<ACPaymentMethod, { label: string; bg: string; text: string }> = {
  'mobile-money': { label: 'Wallet', bg: 'bg-[#E8F2FF]', text: 'text-[#3A8DFF]' },
  cash: { label: 'Cash', bg: 'bg-[#E9F8F0]', text: 'text-[#38C172]' },
  insurance: { label: 'Corporate', bg: 'bg-[#F5F3FF]', text: 'text-[#8B5CF6]' },
  card: { label: 'Card', bg: 'bg-[#FFF3DC]', text: 'text-[#D97706]' },
};

/* ── date grouping ── */

function groupByDate(txs: ACTransaction[]): { label: string; items: ACTransaction[] }[] {
  const groups = new Map<string, ACTransaction[]>();
  for (const tx of txs) {
    const label =
      tx.date === '2026-02-14'
        ? 'Today — 14 Feb'
        : tx.date === '2026-02-13'
        ? 'Yesterday — 13 Feb'
        : new Date(tx.date).toLocaleDateString('en-UG', { day: '2-digit', month: 'short', year: 'numeric' });
    const arr = groups.get(label) || [];
    arr.push(tx);
    groups.set(label, arr);
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

/* ── date filter helper ── */
function inDateRange(tx: ACTransaction, range: DateRange): boolean {
  if (range === 'today') return tx.date === '2026-02-14';
  if (range === '7d') return tx.date >= '2026-02-08';
  if (range === '30d') return tx.date >= '2026-01-16';
  return true; // custom = all
}

/* ════════════════════════════════════════ */

export function ACTransactions() {
  const navigate = useNavigate();
  const { transactions, stats } = useAccountantStore();
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all');
  const [showExport, setShowExport] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  /* Active filter count (dateRange 'today' is the default, so only non-default counts) */
  const activeFilterCount =
    (dateRange !== 'today' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (methodFilter !== 'all' ? 1 : 0);

  /* Compute status tab counts */
  const statusCounts = useMemo(() => {
    let base = transactions.filter((t) => inDateRange(t, dateRange));
    if (methodFilter !== 'all') {
      const mc = methodChips.find((m) => m.key === methodFilter);
      if (mc?.storeMethod) base = base.filter((t) => t.method === mc.storeMethod);
    }
    const counts: Record<StatusFilter, number> = {
      all: base.length,
      paid: base.filter((t) => t.status === 'paid').length,
      pending: base.filter((t) => t.status === 'pending').length,
      failed: base.filter((t) => t.status === 'failed').length,
      refunded: base.filter((t) => t.status === 'refunded').length,
      disputed: base.filter((t) => t.status === 'disputed').length,
    };
    return counts;
  }, [transactions, dateRange, methodFilter]);

  /* Apply all filters */
  const filtered = useMemo(() => {
    let items = transactions.filter((t) => inDateRange(t, dateRange));

    if (statusFilter !== 'all') {
      items = items.filter((t) => t.status === statusFilter);
    }

    if (methodFilter !== 'all') {
      const mc = methodChips.find((m) => m.key === methodFilter);
      if (mc?.storeMethod) items = items.filter((t) => t.method === mc.storeMethod);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (t) =>
          t.patientName.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q) ||
          (t.invoiceNo && t.invoiceNo.toLowerCase().includes(q))
      );
    }

    return items;
  }, [transactions, dateRange, statusFilter, methodFilter, search]);

  const grouped = groupByDate(filtered);

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      {/* ═══ Header ═══ */}
      <div className="bg-[#FFFFFF] border-b border-[#E5E8EC] px-4 h-14 flex items-center justify-between flex-shrink-0">
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Transactions</h1>
        <button
          onClick={() => setShowExport(true)}
          className="p-2 rounded-xl bg-[#F7F9FC] border border-[#E5E8EC] hover:bg-[#E5E8EC] transition-colors"
        >
          <Download className="w-4 h-4 text-[#4A4F55]" />
        </button>
      </div>

      {/* ═══ Filter Section ═══ */}
      <div className="bg-[#FFFFFF] border-b border-[#E5E8EC] flex-shrink-0 px-4 pt-3 pb-3 space-y-2.5">
        {/* Search + filter icon */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9D0DB]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient, receipt, reference"
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#56D8A8]/30 focus:border-[#56D8A8] transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] hover:bg-[#EEF1F5] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#4A4F55]" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[#56D8A8] text-white text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active filter tags */}
        {activeFilterCount > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {dateRange !== 'today' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium pl-2.5 pr-1.5 py-1 rounded-full bg-[#1A1A1A] text-white">
                {dateRanges.find((r) => r.key === dateRange)?.label}
                <button
                  onClick={() => setDateRange('today')}
                  className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium pl-2.5 pr-1.5 py-1 rounded-full bg-[#56D8A8] text-white">
                {statusFilters.find((s) => s.key === statusFilter)?.label}
                <button
                  onClick={() => setStatusFilter('all')}
                  className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {methodFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium pl-2.5 pr-1.5 py-1 rounded-full bg-[#3A8DFF] text-white">
                {methodChips.find((m) => m.key === methodFilter)?.label}
                <button
                  onClick={() => setMethodFilter('all')}
                  className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ═══ Transaction List ═══ */}
      <div className="flex-1 overflow-y-auto pb-20">
        {grouped.length > 0 ? (
          <div className="p-4 space-y-3">
            {grouped.map((group) => (
              <div key={group.label}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-[10px] font-semibold text-[#8F9AA1] uppercase tracking-wide">
                    {group.label}
                  </p>
                  <p className="text-[12px] text-[#8f9aa1]">{group.items.length} item{group.items.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
                  {group.items.map((tx) => (
                    <TxRow key={tx.id} tx={tx} onClick={() => navigate(`/ac/transaction/${tx.id}`)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-24">
            <div className="w-14 h-14 rounded-2xl bg-[#F7F9FC] border border-[#E5E8EC] flex items-center justify-center mb-4">
              <Inbox className="w-6 h-6 text-[#C9D0DB]" />
            </div>
            <p className="text-sm font-medium text-[#4A4F55]">No transactions found</p>
            <p className="text-xs text-[#8F9AA1] mt-1 text-center max-w-[220px]">
              {search.trim() ? 'Try a different search term.' : 'No transactions match the current filters.'}
            </p>
          </div>
        )}
      </div>

      <AccountantBottomNav />
      <ACExportModal isOpen={showExport} onClose={() => setShowExport(false)} title="Export Transactions" />

      {/* ── Filter bottom sheet ── */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowFilters(false)}
          />
          {/* Sheet */}
          <div className="relative bg-white rounded-t-2xl px-4 pt-3 pb-6 animate-in slide-in-from-bottom duration-200">
            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-[#E5E8EC] mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-[#1A1A1A]">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setDateRange('today');
                    setStatusFilter('all');
                    setMethodFilter('all');
                  }}
                  className="text-xs font-medium text-[#E44F4F]"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Section 1: Date Range */}
            <div className="mb-5">
              <p className="text-xs font-medium text-[#8F9AA1] uppercase tracking-wide mb-2.5">
                Date Range
              </p>
              <div className="flex gap-2 flex-wrap">
                {dateRanges.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setDateRange(r.key)}
                    className={`inline-flex items-center gap-1 text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                      dateRange === r.key
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : 'bg-[#FFFFFF] text-[#4A4F55] border-[#E5E8EC] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    {r.key === 'custom' && <CalendarDays className="w-3 h-3" />}
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Status */}
            <div className="mb-5">
              <p className="text-xs font-medium text-[#8F9AA1] uppercase tracking-wide mb-2.5">
                Transaction Status
              </p>
              <div className="flex gap-2 flex-wrap">
                {statusFilters.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setStatusFilter(s.key)}
                    className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                      statusFilter === s.key
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : 'bg-[#FFFFFF] text-[#4A4F55] border-[#E5E8EC] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    {s.label}
                    {statusCounts[s.key] > 0 && (
                      <span className={`ml-1 ${statusFilter === s.key ? 'text-white/60' : 'text-[#C9D0DB]'}`}>
                        {statusCounts[s.key]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Payment Method */}
            <div className="mb-5">
              <p className="text-xs font-medium text-[#8F9AA1] uppercase tracking-wide mb-2.5">
                Payment Method
              </p>
              <div className="flex gap-2 flex-wrap">
                {methodChips.map((m) => {
                  if (m.disabled) {
                    return (
                      <span
                        key={m.key}
                        className="inline-flex items-center gap-1 text-xs font-medium px-4 py-2 rounded-full bg-[#F7F9FC] text-[#C9D0DB] border border-dashed border-[#E5E8EC] cursor-not-allowed"
                      >
                        <Lock className="w-3 h-3" />
                        {m.label}
                      </span>
                    );
                  }
                  return (
                    <button
                      key={m.key}
                      onClick={() => setMethodFilter(m.key)}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                        methodFilter === m.key
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                          : 'bg-[#FFFFFF] text-[#4A4F55] border-[#E5E8EC] hover:bg-[#F7F9FC]'
                      }`}
                    >
                      {m.icon}
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Apply */}
            <button
              onClick={() => setShowFilters(false)}
              className="w-full h-11 rounded-[14px] bg-[#56D8A8] text-white text-sm font-semibold hover:bg-[#45C99A] transition-colors text-[#1a1a1a]"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════ Transaction Row ═══════ */

function TxRow({ tx, onClick }: { tx: ACTransaction; onClick: () => void }) {
  const mm = methodDisplayMeta[tx.method];
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-4 py-3.5 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
    >
      {/* Left: patient + service + chips */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1A1A1A] truncate">{tx.patientName}</p>
        <p className="text-xs text-[#8F9AA1] truncate mt-0.5">{tx.description}</p>
        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
          {/* Method chip */}
          <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${mm.bg} ${mm.text} text-[12px]`}>
            {mm.label}
          </span>
          {/* Status chip */}
          <ACStatusChip status={tx.status} />
          {/* Coverage source chip */}
          {tx.coverageSource && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold px-1.5 py-[2px] rounded-full ${ tx.coverageSource === 'Package' ? 'bg-[#E9F8F0] text-[#38C172]' : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]' } text-[12px]`}
            >
              {tx.coverageSource === 'Package'
                ? <ShieldCheck className="w-2.5 h-2.5" />
                : <Wallet className="w-2.5 h-2.5" />}
              {tx.coverageSource === 'Package' ? (tx.coveragePackage || 'Package') : 'OOP'}
            </span>
          )}
          {/* Visit ID */}
          {tx.displayVisitId && (
            <>
              <span className="text-[#E5E8EC]">·</span>
              <span className="text-[#C9D0DB] font-mono text-[12px]">{tx.displayVisitId}</span>
            </>
          )}
        </div>
      </div>

      {/* Right: amount + time */}
      <div className="text-right flex-shrink-0 ml-1 pt-0.5">
        <p className={`text-sm font-semibold ${
          tx.status === 'refunded' ? 'text-[#8B5CF6]' : tx.status === 'failed' ? 'text-[#E44F4F]' : 'text-[#1A1A1A]'
        }`}>
          {tx.status === 'refunded' ? '-' : ''}{formatUGX(tx.amount)}
        </p>
        <p className="text-[#C9D0DB] text-[12px] mt-0.5">{tx.time}</p>
      </div>

      <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0 mt-1" />
    </button>
  );
}