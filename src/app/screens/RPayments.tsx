/**
 * R-40 Payments Home — Search, filter chips (Unpaid · Paid Today · Pending),
 * list rows (patient, service, amount, status).
 * Tapping a row → R-41 Billing Summary.
 * Bottom nav present (main nav screen).
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ReceptionistBottomNav } from '../components/aba/ReceptionistBottomNav';
import { SearchHeader } from '../components/aba/SearchHeader';
import { KPICard, ListCard } from '../components/aba/Cards';
import { RListRow } from '../components/aba/RListRow';
import { ABABadge } from '../components/aba/ABABadge';
import { EmptyState } from '../components/aba/EmptyState';
import {
  usePaymentsStore,
  fmtUGX,
  type PaymentRecord,
  type PaymentStatus,
} from '../data/paymentsStore';
import {
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Wallet,
  Banknote,
  Smartphone,
  DollarSign,
} from 'lucide-react';

/* ── filter chip config ── */
interface FilterChip {
  id: string;
  label: string;
  /** Which statuses this chip includes (empty = all) */
  statuses: PaymentStatus[];
}

const filters: FilterChip[] = [
  { id: 'all', label: 'All', statuses: [] },
  { id: 'unpaid', label: 'Unpaid', statuses: ['unpaid'] },
  { id: 'paid', label: 'Paid Today', statuses: ['paid'] },
  { id: 'pending', label: 'Pending', statuses: ['pending', 'failed'] },
];

/* ── badge variant mapping ── */
function statusBadge(status: PaymentStatus): { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' } {
  switch (status) {
    case 'paid':
      return { label: 'Paid', variant: 'success' };
    case 'unpaid':
      return { label: 'Unpaid', variant: 'warning' };
    case 'pending':
      return { label: 'Pending', variant: 'neutral' };
    case 'failed':
      return { label: 'Failed', variant: 'error' };
  }
}

/* ── method icon ── */
function methodIcon(method?: string) {
  if (method === 'wallet') return <Wallet className="w-5 h-5 text-aba-primary-main" />;
  if (method === 'cash') return <Banknote className="w-5 h-5 text-aba-success-main" />;
  if (method === 'mobile-money') return <Smartphone className="w-5 h-5 text-aba-secondary-main" />;
  if (method === 'split') return <DollarSign className="w-5 h-5 text-[#8B5CF6]" />;
  return <DollarSign className="w-5 h-5 text-aba-neutral-600" />;
}

export function RPayments() {
  const navigate = useNavigate();
  const { payments, getPaymentKPIs } = usePaymentsStore();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const kpis = useMemo(() => getPaymentKPIs(), [payments]);

  /* ── filtered list ── */
  const filtered = useMemo(() => {
    const chip = filters.find((f) => f.id === activeFilter)!;
    let list: PaymentRecord[] = payments;

    // status filter
    if (chip.statuses.length > 0) {
      list = list.filter((p) => chip.statuses.includes(p.status));
    }

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.patient.toLowerCase().includes(q) ||
          p.service.toLowerCase().includes(q) ||
          p.phone.includes(q)
      );
    }

    return list;
  }, [payments, activeFilter, search]);

  /* ── filter chip counts ── */
  const chipCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filters.forEach((f) => {
      counts[f.id] =
        f.statuses.length === 0
          ? payments.length
          : payments.filter((p) => f.statuses.includes(p.status)).length;
    });
    return counts;
  }, [payments]);

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Payments" />

      <div className="flex-1 overflow-y-auto pb-20">
        {/* ── KPIs ── */}
        <div className="grid grid-cols-3 gap-2 px-4 pt-3 pb-1">
          <MiniKPI
            label="Collected"
            value={fmtUGX(kpis.collected)}
            icon={<CheckCircle className="w-4 h-4 text-aba-success-main" />}
            bg="bg-aba-success-50/50"
          />
          <MiniKPI
            label="Unpaid"
            value={fmtUGX(kpis.unpaidAmt)}
            icon={<AlertCircle className="w-4 h-4 text-aba-warning-main" />}
            bg="bg-aba-warning-50/50"
          />
          <MiniKPI
            label="Pending"
            value={fmtUGX(kpis.pendingAmt)}
            icon={<Clock className="w-4 h-4 text-aba-neutral-600" />}
            bg="bg-aba-neutral-100"
          />
        </div>

        {/* ── Search ── */}
        <SearchHeader
          value={search}
          onChange={setSearch}
          placeholder="Search patient or member…"
        />

        {/* ── Filter chips ── */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {filters.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                  isActive
                    ? 'bg-aba-neutral-900 text-white border-aba-neutral-900'
                    : 'bg-aba-neutral-0 text-aba-neutral-700 border-aba-neutral-200 hover:bg-aba-neutral-100'
                }`}
              >
                {f.label}
                <span
                  className={`min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? 'bg-aba-neutral-0 text-aba-neutral-900'
                      : 'bg-aba-neutral-200 text-aba-neutral-600'
                  }`}
                >
                  {chipCounts[f.id]}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── List ── */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Search className="w-10 h-10" />}
            title="No payments found"
            message="Try adjusting your search or filter."
          />
        ) : (
          <div className="px-4">
            <ListCard>
              {filtered.map((p) => {
                const badge = statusBadge(p.status);
                return (
                  <RListRow
                    key={p.id}
                    icon={methodIcon(p.method)}
                    title={p.patient}
                    subtitle={`${p.service} \u2022 ${p.visitTime}`}
                    meta={p.isMember ? `Member \u2022 ${p.coverage?.provider}` : undefined}
                    trailing={
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-semibold text-aba-neutral-900">
                          {fmtUGX(p.amountDue)}
                        </span>
                        <ABABadge variant={badge.variant} size="sm">
                          {badge.label}
                        </ABABadge>
                      </div>
                    }
                    showChevron
                    onClick={() => navigate(`/r/payments/billing/${p.id}`)}
                  />
                );
              })}
            </ListCard>
          </div>
        )}
        <div className="h-4" />
      </div>

      <ReceptionistBottomNav />
    </div>
  );
}

/* ── Mini KPI card ── */
function MiniKPI({
  label,
  value,
  icon,
  bg,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <div className={`rounded-2xl border border-aba-neutral-200 bg-aba-neutral-0 p-3 ${bg}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-[10px] font-medium text-aba-neutral-600 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-sm font-bold text-aba-neutral-900 truncate">{value}</p>
    </div>
  );
}