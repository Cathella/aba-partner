import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABABadge } from '../components/aba/ABABadge';
import { ListCard, ListCardItem } from '../components/aba/Cards';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronRight,
  Wallet,
  DollarSign,
  Smartphone,
  Inbox,
} from 'lucide-react';

/* ── types ── */

type PaymentMethod = 'wallet' | 'cash' | 'momo';
type TransactionStatus = 'completed' | 'pending' | 'disputed' | 'refunded' | 'voided';
type DateRange = 'all' | 'today' | '7d' | '30d';

interface Transaction {
  id: string;
  patientName: string;
  service: string;
  amount: string;
  method: PaymentMethod;
  status: TransactionStatus;
  date: string;
  time: string;
  reference: string;
}

/* ── mock data ── */

const mockTransactions: Transaction[] = [
  {
    id: '1',
    patientName: 'Sarah Johnson',
    service: 'Speech Therapy',
    amount: '150,000',
    method: 'wallet',
    status: 'completed',
    date: '2026-02-16',
    time: '09:15 AM',
    reference: 'TXN-2026-001234',
  },
  {
    id: '2',
    patientName: 'Michael Smith',
    service: 'Occupational Therapy',
    amount: '100,000',
    method: 'momo',
    status: 'completed',
    date: '2026-02-16',
    time: '10:45 AM',
    reference: 'TXN-2026-001235',
  },
  {
    id: '3',
    patientName: 'Emma Davis',
    service: 'Behavioral Assessment',
    amount: '200,000',
    method: 'cash',
    status: 'pending',
    date: '2026-02-16',
    time: '11:20 AM',
    reference: 'TXN-2026-001236',
  },
  {
    id: '4',
    patientName: 'Olivia Brown',
    service: 'Parent Consultation',
    amount: '100,000',
    method: 'wallet',
    status: 'disputed',
    date: '2026-02-16',
    time: '02:30 PM',
    reference: 'TXN-2026-001237',
  },
  {
    id: '5',
    patientName: 'Noah Williams',
    service: 'Follow-up Session',
    amount: '100,000',
    method: 'momo',
    status: 'completed',
    date: '2026-02-16',
    time: '03:45 PM',
    reference: 'TXN-2026-001238',
  },
  {
    id: '6',
    patientName: 'Ava Taylor',
    service: 'Initial Consultation',
    amount: '150,000',
    method: 'cash',
    status: 'refunded',
    date: '2026-02-15',
    time: '09:00 AM',
    reference: 'TXN-2026-001220',
  },
  {
    id: '7',
    patientName: 'Liam Anderson',
    service: 'Speech Therapy',
    amount: '100,000',
    method: 'wallet',
    status: 'voided',
    date: '2026-02-15',
    time: '02:15 PM',
    reference: 'TXN-2026-001225',
  },
];

/* ── config maps ── */

const statusConfig: Record<
  TransactionStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' | 'info' }
> = {
  completed: { label: 'Completed', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  disputed: { label: 'Disputed', variant: 'danger' },
  refunded: { label: 'Refunded', variant: 'info' },
  voided: { label: 'Voided', variant: 'default' },
};

const methodConfig: Record<PaymentMethod, { label: string; icon: any }> = {
  wallet: { label: 'ABA Wallet', icon: Wallet },
  cash: { label: 'Cash', icon: DollarSign },
  momo: { label: 'Mobile Money', icon: Smartphone },
};

/* ── filter option definitions ── */

type StatusFilter = 'all' | TransactionStatus;
type MethodFilter = 'all' | PaymentMethod;

const dateRangeOptions: { key: DateRange; label: string }[] = [
  { key: 'all', label: 'All Dates' },
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
];

const statusOptions: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
  { key: 'disputed', label: 'Disputed' },
  { key: 'refunded', label: 'Refunded' },
  { key: 'voided', label: 'Voided' },
];

const methodOptions: { key: MethodFilter; label: string }[] = [
  { key: 'all', label: 'All Methods' },
  { key: 'wallet', label: 'ABA Wallet' },
  { key: 'cash', label: 'Cash' },
  { key: 'momo', label: 'Mobile Money' },
];

/* ── date-range helper ── */
function inDateRange(tx: Transaction, range: DateRange): boolean {
  if (range === 'all') return true;
  if (range === 'today') return tx.date === '2026-02-16';
  if (range === '7d') return tx.date >= '2026-02-10';
  if (range === '30d') return tx.date >= '2026-01-18';
  return true;
}

/* ── date grouping ── */
function groupByDate(txs: Transaction[]): { label: string; items: Transaction[] }[] {
  const groups = new Map<string, Transaction[]>();
  for (const tx of txs) {
    const label =
      tx.date === '2026-02-16'
        ? 'Today — 16 Feb'
        : tx.date === '2026-02-15'
        ? 'Yesterday — 15 Feb'
        : new Date(tx.date).toLocaleDateString('en-UG', { day: '2-digit', month: 'short', year: 'numeric' });
    const arr = groups.get(label) || [];
    arr.push(tx);
    groups.set(label, arr);
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

/* ════════════════════════════════════════ */

export function TransactionsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all');

  /* Active filter count */
  const activeFiltersCount =
    (dateRange !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (methodFilter !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setDateRange('all');
    setStatusFilter('all');
    setMethodFilter('all');
  };

  /* Status counts within current date range + method */
  const statusCounts = useMemo(() => {
    let base = mockTransactions.filter((t) => inDateRange(t, dateRange));
    if (methodFilter !== 'all') {
      base = base.filter((t) => t.method === methodFilter);
    }
    const counts: Record<StatusFilter, number> = {
      all: base.length,
      completed: base.filter((t) => t.status === 'completed').length,
      pending: base.filter((t) => t.status === 'pending').length,
      disputed: base.filter((t) => t.status === 'disputed').length,
      refunded: base.filter((t) => t.status === 'refunded').length,
      voided: base.filter((t) => t.status === 'voided').length,
    };
    return counts;
  }, [dateRange, methodFilter]);

  /* Apply all filters */
  const filtered = useMemo(() => {
    let items = mockTransactions.filter((t) => inDateRange(t, dateRange));

    if (statusFilter !== 'all') {
      items = items.filter((t) => t.status === statusFilter);
    }

    if (methodFilter !== 'all') {
      items = items.filter((t) => t.method === methodFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (t) =>
          t.patientName.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q) ||
          t.service.toLowerCase().includes(q)
      );
    }

    return items;
  }, [dateRange, statusFilter, methodFilter, searchQuery]);

  const grouped = groupByDate(filtered);

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      {/* Top Bar */}
      <AppTopBar
        title="Transactions"
        showBack
        onBackClick={() => navigate('/finance-overview')}
      />

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto">
        {/* Search + Filter bar */}
        <div className="border-b border-aba-neutral-200 px-4 pt-3 pb-3 space-y-2.5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aba-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient or reference..."
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-aba-neutral-200 bg-aba-neutral-100 text-sm text-aba-neutral-900 placeholder:text-aba-neutral-400 focus:outline-none focus:ring-2 focus:ring-aba-primary-main/30 focus:border-aba-primary-main transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl border border-aba-neutral-200 bg-aba-neutral-100 hover:bg-aba-neutral-200 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-aba-neutral-700" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-aba-primary-main text-white text-[10px] font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Active filter tags */}
          {activeFiltersCount > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {dateRange !== 'all' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium pl-2.5 pr-1.5 py-1 rounded-full bg-aba-neutral-900 text-white">
                  {dateRangeOptions.find((r) => r.key === dateRange)?.label}
                  <button
                    onClick={() => setDateRange('all')}
                    className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium pl-2.5 pr-1.5 py-1 rounded-full bg-aba-neutral-900 text-white">
                  {statusOptions.find((s) => s.key === statusFilter)?.label}
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {methodFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium pl-2.5 pr-1.5 py-1 rounded-full bg-aba-neutral-900 text-white">
                  {methodOptions.find((m) => m.key === methodFilter)?.label}
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

        {grouped.length > 0 ? (
          <div className="p-4 space-y-3">
            {/* Results count */}
            <p className="text-xs text-aba-neutral-600 px-1">
              {filtered.length} {filtered.length === 1 ? 'transaction' : 'transactions'} found
            </p>

            {grouped.map((group) => (
              <div key={group.label}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-[10px] font-semibold text-aba-neutral-600 uppercase tracking-wide">
                    {group.label}
                  </p>
                  <p className="text-[10px] text-aba-neutral-400">
                    {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <ListCard>
                  {group.items.map((transaction) => {
                    const MethodIcon = methodConfig[transaction.method].icon;
                    return (
                      <ListCardItem
                        key={transaction.id}
                        onClick={() => navigate(`/transaction-detail/${transaction.id}`)}
                      >
                        <div className="w-10 h-10 rounded-full bg-aba-neutral-100 flex items-center justify-center flex-shrink-0">
                          <MethodIcon className="w-5 h-5 text-aba-neutral-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-aba-neutral-900 truncate">
                              {transaction.patientName}
                            </p>
                            <ABABadge
                              variant={statusConfig[transaction.status].variant}
                              size="sm"
                            >
                              {statusConfig[transaction.status].label}
                            </ABABadge>
                          </div>
                          <p className="text-aba-neutral-900 mb-0.5 truncate text-[12px] text-[#8f9aa1]">
                            {transaction.service}
                          </p>
                          <p className="text-xs text-aba-neutral-600">
                            {methodConfig[transaction.method].label} &middot; {transaction.time}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-aba-neutral-900">
                            UGX {transaction.amount}
                          </p>
                          <ChevronRight className="w-5 h-5 text-aba-neutral-400 ml-auto mt-1" />
                        </div>
                      </ListCardItem>
                    );
                  })}
                </ListCard>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-24 px-4">
            <div className="w-14 h-14 rounded-2xl bg-aba-neutral-100 border border-aba-neutral-200 flex items-center justify-center mb-4">
              <Inbox className="w-6 h-6 text-aba-neutral-400" />
            </div>
            <p className="text-sm font-medium text-aba-neutral-700">No transactions found</p>
            <p className="text-xs text-aba-neutral-600 mt-1 text-center max-w-[220px]">
              {searchQuery.trim()
                ? 'Try a different search term.'
                : 'No transactions match the current filters.'}
            </p>
          </div>
        )}
      </div>

      {/* ── Filter bottom sheet ── */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowFilters(false)}
          />
          {/* Sheet */}
          <div className="relative bg-white rounded-t-2xl px-4 pt-3 pb-6">
            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-aba-neutral-200 mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-aba-neutral-900">Filters</h3>
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="text-xs font-medium text-aba-error-main">
                  Clear all
                </button>
              )}
            </div>

            {/* Section 1: Date Range */}
            <div className="mb-5">
              <p className="text-xs font-medium text-aba-neutral-600 uppercase tracking-wide mb-2.5">
                Date Range
              </p>
              <div className="flex gap-2 flex-wrap">
                {dateRangeOptions.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setDateRange(r.key)}
                    className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                      dateRange === r.key
                        ? 'bg-aba-neutral-900 text-white border-aba-neutral-900'
                        : 'bg-white text-aba-neutral-700 border-aba-neutral-200 hover:bg-aba-neutral-100'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Transaction Status */}
            <div className="mb-5">
              <p className="text-xs font-medium text-aba-neutral-600 uppercase tracking-wide mb-2.5">
                Transaction Status
              </p>
              <div className="flex gap-2 flex-wrap">
                {statusOptions.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setStatusFilter(s.key)}
                    className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                      statusFilter === s.key
                        ? 'bg-aba-neutral-900 text-white border-aba-neutral-900'
                        : 'bg-white text-aba-neutral-700 border-aba-neutral-200 hover:bg-aba-neutral-100'
                    }`}
                  >
                    {s.label}
                    {statusCounts[s.key] > 0 && (
                      <span className={`ml-1 ${statusFilter === s.key ? 'text-white/60' : 'text-aba-neutral-400'}`}>
                        {statusCounts[s.key]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Payment Method */}
            <div className="mb-5">
              <p className="text-xs font-medium text-aba-neutral-600 uppercase tracking-wide mb-2.5">
                Payment Method
              </p>
              <div className="flex gap-2 flex-wrap">
                {methodOptions.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMethodFilter(m.key)}
                    className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                      methodFilter === m.key
                        ? 'bg-aba-neutral-900 text-white border-aba-neutral-900'
                        : 'bg-white text-aba-neutral-700 border-aba-neutral-200 hover:bg-aba-neutral-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply */}
            <button
              onClick={() => setShowFilters(false)}
              className="w-full h-11 rounded-xl bg-aba-primary-main text-white text-sm font-semibold hover:bg-aba-primary-100 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}