/**
 * PH-01 Pharmacy Queue — Main queue screen with Prescriptions / OTC toggle.
 *
 * Layout:
 *   Top bar -> "Pharmacy Queue" + date
 *   Top-level toggle: Prescriptions | OTC Requests
 *   Prescriptions sub-tab: New | In Progress | Ready | Completed + filter chips
 *   OTC sub-tab: Pending | Preparing | Ready
 *   Bottom nav present.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { PharmacyBottomNav } from '../components/aba/PharmacyBottomNav';
import { PHRxRow } from '../components/aba/PHRxRow';
import { ABABadge } from '../components/aba/ABABadge';
import { EmptyState } from '../components/aba/EmptyState';
import { usePharmacistStore } from '../data/pharmacistStore';
import type { PHRxStatus, PHOtcOrder, PHOtcStatus } from '../data/pharmacistStore';
import {
  Search,
  Pill,
  Inbox,
  AlertTriangle,
  Bell,
  ShoppingBag,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';

/* ─── Rx tab definitions ─── */

type QueueTab = 'new' | 'in-progress' | 'ready' | 'completed';

const queueTabs: { id: QueueTab; label: string; statuses: PHRxStatus[] }[] = [
  { id: 'new', label: 'New', statuses: ['new'] },
  { id: 'in-progress', label: 'In Progress', statuses: ['in-progress'] },
  { id: 'ready', label: 'Ready', statuses: ['ready', 'partial-fill'] },
  { id: 'completed', label: 'Completed', statuses: ['completed'] },
];

/* ─── Rx filter chip definitions ─── */

type FilterChip = 'all' | 'urgent' | 'awaiting-payment' | 'out-of-stock';

const filterChips: { id: FilterChip; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'awaiting-payment', label: 'Awaiting payment' },
  { id: 'out-of-stock', label: 'Out of stock' },
];

/* ─── OTC tab definitions ─── */

type OtcTab = 'pending' | 'preparing' | 'ready';

const otcTabs: { id: OtcTab; label: string; statuses: PHOtcStatus[] }[] = [
  { id: 'pending', label: 'Pending', statuses: ['pending'] },
  { id: 'preparing', label: 'Preparing', statuses: ['preparing'] },
  { id: 'ready', label: 'Ready', statuses: ['ready'] },
];

/* ─── OTC filter definitions ─── */

type OtcPaymentFilter = 'all' | 'paid' | 'pending' | 'waived';
type OtcCustomerFilter = 'all' | 'member' | 'non-member';

const otcPaymentFilters: { id: OtcPaymentFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'paid', label: 'Paid' },
  { id: 'pending', label: 'Pending' },
  { id: 'waived', label: 'Waived' },
];

const otcCustomerFilters: { id: OtcCustomerFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'member', label: 'Member' },
  { id: 'non-member', label: 'Non-member' },
];

/* ─── payment config ─── */
const payConfig: Record<string, { label: string; bg: string; text: string }> = {
  paid: { label: 'Paid', bg: 'bg-[#E9F8F0]', text: 'text-[#56D8A8]' },
  pending: { label: 'Pending', bg: 'bg-[#FFF3DC]', text: 'text-[#D97706]' },
  waived: { label: 'Waived', bg: 'bg-[#F7F9FC]', text: 'text-[#8F9AA1]' },
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ─── OTC Row component ─── */
function OtcRow({ order, onClick }: { order: PHOtcOrder; onClick: () => void }) {
  const itemCount = order.items.length;
  const itemLabel = itemCount === 1 ? '1 item' : `${itemCount} items`;
  const pay = payConfig[order.paymentStatus];

  const statusCfg: Record<string, { label: string; dot: string; bg: string; text: string }> = {
    pending: { label: 'Pending', dot: 'bg-[#3A8DFF]', bg: 'bg-[#EBF3FF]', text: 'text-[#1A1A1A]' },
    preparing: { label: 'Preparing', dot: 'bg-[#FFB649]', bg: 'bg-[#FFF3DC]', text: 'text-[#1A1A1A]' },
    ready: { label: 'Ready', dot: 'bg-[#56D8A8]', bg: 'bg-[#E9F8F0]', text: 'text-[#1A1A1A]' },
  };
  const st = statusCfg[order.status] || statusCfg.pending;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-stretch gap-0 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
    >
      <div className="w-[3px] flex-shrink-0 rounded-r-full my-2 bg-[#8B5CF6]" />
      <div className="flex-1 flex items-center gap-3 px-3.5 py-3">
        <div className="flex-1 min-w-0">
          {/* Row 1: Customer name + member tag */}
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-[#1A1A1A] truncate">{order.customerName}</p>
            <span
              className={`text-[10px] font-semibold px-1.5 py-[1px] rounded-full flex-shrink-0 ${
                order.isMember
                  ? 'bg-[#EBF3FF] text-[#3A8DFF]'
                  : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'
              }`}
            >
              {order.isMember ? 'Member' : 'Non-member'}
            </span>
          </div>

          {/* Row 2: Order ID + time */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-[#8F9AA1]">{order.id.toUpperCase()}</span>
            <span className="text-[10px] text-[#C9D0DB]">&middot;</span>
            <span className="text-xs text-[#8F9AA1]">{order.requestedAt}</span>
          </div>

          {/* Row 3: Item count + chips */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs text-[#4A4F55]">
              <ShoppingBag className="w-3 h-3 text-[#C9D0DB] flex-shrink-0" />
              {itemLabel}
            </span>
            <span className="text-[10px] text-[#E5E8EC]">|</span>
            {/* Status chip */}
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full border px-2 py-0.5 ${st.bg} ${st.text} border-transparent`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {st.label}
            </span>
            {/* Payment */}
            {pay && (
              <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-[2px] rounded-full ${pay.bg} ${pay.text}`}>
                {pay.label}
              </span>
            )}
            {/* OTC source chip */}
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-[2px] rounded-full bg-[#F3F0FF] text-[#7C3AED]">
              <ShoppingBag className="w-2.5 h-2.5" />
              OTC
            </span>
            {/* Total */}
            <span className="text-[10px] text-[#8F9AA1] ml-auto flex-shrink-0">{order.totalAmount}</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
      </div>
    </button>
  );
}

export function PHQueue() {
  const navigate = useNavigate();
  const { prescriptions, inventoryAlerts, otcOrders } = usePharmacistStore();

  /* ── top-level mode ── */
  type QueueMode = 'prescriptions' | 'otc';
  const [mode, setMode] = useState<QueueMode>('prescriptions');

  /* ── Rx state ── */
  const [activeTab, setActiveTab] = useState<QueueTab>('new');
  const [activeFilter, setActiveFilter] = useState<FilterChip>('all');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  /* ── OTC state ── */
  const [otcTab, setOtcTab] = useState<OtcTab>('pending');
  const [otcSearch, setOtcSearch] = useState('');
  const [otcPaymentFilter, setOtcPaymentFilter] = useState<OtcPaymentFilter>('all');
  const [otcCustomerFilter, setOtcCustomerFilter] = useState<OtcCustomerFilter>('all');
  const [showOtcFilters, setShowOtcFilters] = useState(false);

  const today = new Date();
  const dateChip = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  /* ── Rx counts + filtering ── */
  const tabCounts = useMemo(() => {
    const counts: Record<QueueTab, number> = { new: 0, 'in-progress': 0, ready: 0, completed: 0 };
    for (const rx of prescriptions) {
      for (const t of queueTabs) {
        if (t.statuses.includes(rx.status)) { counts[t.id]++; break; }
      }
    }
    return counts;
  }, [prescriptions]);

  const visibleRxs = useMemo(() => {
    const tab = queueTabs.find((t) => t.id === activeTab)!;
    let list = prescriptions.filter((rx) => tab.statuses.includes(rx.status));
    if (activeFilter === 'urgent') list = list.filter((rx) => rx.urgency === 'stat' || rx.urgency === 'urgent');
    else if (activeFilter === 'awaiting-payment') list = list.filter((rx) => rx.paymentStatus === 'pending');
    else if (activeFilter === 'out-of-stock') list = list.filter((rx) => rx.status === 'out-of-stock' || rx.medications.some((m) => m.stockLevel === 'out-of-stock'));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((rx) => rx.patientName.toLowerCase().includes(q) || rx.id.toLowerCase().includes(q) || (rx.isMember !== undefined && (rx.isMember ? 'member' : 'non-member').includes(q)));
    }
    const rank = { stat: 0, urgent: 1, routine: 2 };
    return [...list].sort((a, b) => (rank[a.urgency] ?? 2) - (rank[b.urgency] ?? 2));
  }, [prescriptions, activeTab, activeFilter, search]);

  /* ── OTC counts + filtering ── */
  const otcTabCounts = useMemo(() => {
    const counts: Record<OtcTab, number> = { pending: 0, preparing: 0, ready: 0 };
    for (const o of otcOrders) {
      for (const t of otcTabs) {
        if (t.statuses.includes(o.status)) { counts[t.id]++; break; }
      }
    }
    return counts;
  }, [otcOrders]);

  const visibleOtc = useMemo(() => {
    const tab = otcTabs.find((t) => t.id === otcTab)!;
    let list = otcOrders.filter((o) => tab.statuses.includes(o.status));
    if (otcPaymentFilter !== 'all') list = list.filter((o) => o.paymentStatus === otcPaymentFilter);
    if (otcCustomerFilter !== 'all') list = list.filter((o) => o.isMember === (otcCustomerFilter === 'member'));
    if (otcSearch.trim()) {
      const q = otcSearch.toLowerCase();
      list = list.filter((o) => o.customerName.toLowerCase().includes(q) || o.id.toLowerCase().includes(q));
    }
    return list;
  }, [otcOrders, otcTab, otcSearch, otcPaymentFilter, otcCustomerFilter]);

  const criticalAlerts = inventoryAlerts.filter((a) => a.severity === 'critical');
  const totalOtcQueue = otcOrders.filter((o) => o.status !== 'completed' && o.status !== 'declined').length;
  const activeFilterCount = activeFilter !== 'all' ? 1 : 0;
  const otcActiveFilterCount =
    (otcPaymentFilter !== 'all' ? 1 : 0) +
    (otcCustomerFilter !== 'all' ? 1 : 0);

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      {/* ── Top bar ── */}
      <AppTopBar
        title={`${getGreeting()}, Pharmacist Lule`}
        subtitle="Mukono Family Clinic • Pharmacist"
        rightAction={
          <div className="flex items-center gap-2.5">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-aba-neutral-100 transition-colors relative"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="w-5 h-5 text-aba-neutral-900" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-aba-error-main rounded-full" />
            </button>
          </div>
        }
      />

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* ── Top-level mode toggle: Prescriptions | OTC Requests ── */}
        <div className="mx-4 mt-4 flex bg-[#FFFFFF] border border-[#E5E8EC] rounded-2xl p-1 gap-1">
          <button
            onClick={() => setMode('prescriptions')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-sm font-medium ${
              mode === 'prescriptions'
                ? 'bg-[#1A1A1A] text-white shadow-sm'
                : 'text-[#8F9AA1] hover:text-[#4A4F55]'
            }`}
          >
            <Pill className="w-4 h-4" />
            Prescriptions
          </button>
          <button
            onClick={() => setMode('otc')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-sm font-medium relative ${
              mode === 'otc'
                ? 'bg-[#1A1A1A] text-white shadow-sm'
                : 'text-[#8F9AA1] hover:text-[#4A4F55]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            OTC Requests
            {totalOtcQueue > 0 && mode !== 'otc' && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[10px] font-bold flex items-center justify-center">
                {totalOtcQueue}
              </span>
            )}
          </button>
        </div>

        {/* ═══ PRESCRIPTIONS MODE ═══ */}
        {mode === 'prescriptions' && (
          <>
            <div className="bg-[#FFFFFF] border border-[#E5E8EC] mx-4 mt-3 rounded-2xl px-4 pt-3 pb-3 space-y-3">
              {/* Critical stock alert banner */}
              {criticalAlerts.length > 0 && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FDECEC] border border-[#E44F4F]/20">
                  <AlertTriangle className="w-4 h-4 text-[#E44F4F] flex-shrink-0" />
                  <p className="text-xs text-[#4A4F55]">
                    <span className="font-semibold text-[#E44F4F]">Stock alert:</span>{' '}
                    {criticalAlerts.map((a) => a.medName).join(', ')} — out of stock
                  </p>
                </div>
              )}

              {/* Search + filter button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9D0DB]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search patient, member ID, prescription ID"
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

              {/* Active filter tags (inline summary) */}
              {activeFilterCount > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium pl-2.5 pr-1.5 py-1 rounded-full bg-[#1A1A1A] text-white">
                    {filterChips.find((f) => f.id === activeFilter)?.label}
                    <button
                      onClick={() => setActiveFilter('all')}
                      className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                </div>
              )}

              {/* Segmented control */}
              <div className="flex bg-[#F7F9FC] rounded-xl p-0.5 gap-0.5 overflow-x-auto no-scrollbar">
                {queueTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const count = tabCounts[tab.id];
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setActiveFilter('all'); }}
                      className={`flex-1 whitespace-nowrap relative text-center px-3 py-2 rounded-[10px] transition-all font-medium leading-tight flex-shrink-0 ${ isActive ? 'bg-[#FFFFFF] text-[#1A1A1A] shadow-sm' : 'text-[#8F9AA1] hover:text-[#4A4F55]' } text-[12px]`}
                    >
                      {tab.label}
                      {count > 0 && (
                        <span className={`ml-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold ${isActive ? 'bg-[#56D8A8] text-white' : 'bg-[#E5E8EC] text-[#8F9AA1]'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rx list */}
            <div className="p-4">
              {visibleRxs.length > 0 ? (
                <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
                  {visibleRxs.map((rx) => (
                    <PHRxRow key={rx.id} rx={rx} onClick={() => navigate(`/ph/rx/${rx.id}`)} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Inbox className="w-6 h-6 text-[#C9D0DB]" />}
                  title="No prescriptions here yet"
                  message={
                    activeFilter !== 'all'
                      ? 'Try changing the filter or check another tab.'
                      : 'Prescriptions matching this status will appear here.'
                  }
                />
              )}
            </div>
          </>
        )}

        {/* ═══ OTC REQUESTS MODE ═══ */}
        {mode === 'otc' && (
          <>
            <div className="bg-[#FFFFFF] border border-[#E5E8EC] mx-4 mt-3 rounded-2xl px-4 pt-3 pb-3 space-y-3">
              {/* Search + filter button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9D0DB]" />
                  <input
                    type="text"
                    value={otcSearch}
                    onChange={(e) => setOtcSearch(e.target.value)}
                    placeholder="Search customer name or order ID"
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#56D8A8]/30 focus:border-[#56D8A8] transition-all"
                  />
                </div>
                <button
                  onClick={() => setShowOtcFilters(true)}
                  className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] hover:bg-[#EEF1F5] transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#4A4F55]" />
                  {otcActiveFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[#56D8A8] text-white text-[10px] font-bold">
                      {otcActiveFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Active OTC filter tags */}
              {otcActiveFilterCount > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {otcPaymentFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium pl-2.5 pr-1.5 py-1 rounded-full bg-[#1A1A1A] text-white">
                      {otcPaymentFilters.find((f) => f.id === otcPaymentFilter)?.label}
                      <button
                        onClick={() => setOtcPaymentFilter('all')}
                        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {otcCustomerFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium pl-2.5 pr-1.5 py-1 rounded-full bg-[#7C3AED] text-white">
                      {otcCustomerFilters.find((f) => f.id === otcCustomerFilter)?.label}
                      <button
                        onClick={() => setOtcCustomerFilter('all')}
                        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* OTC tab control */}
              <div className="flex bg-[#F7F9FC] rounded-xl p-0.5 gap-0.5">
                {otcTabs.map((tab) => {
                  const isActive = otcTab === tab.id;
                  const count = otcTabCounts[tab.id];
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setOtcTab(tab.id)}
                      className={`flex-1 relative text-center py-2 rounded-[10px] transition-all text-[11px] font-medium leading-tight ${
                        isActive ? 'bg-[#FFFFFF] text-[#1A1A1A] shadow-sm' : 'text-[#8F9AA1] hover:text-[#4A4F55]'
                      }`}
                    >
                      {tab.label}
                      {count > 0 && (
                        <span className={`ml-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold ${isActive ? 'bg-[#7C3AED] text-white' : 'bg-[#E5E8EC] text-[#8F9AA1]'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* OTC list */}
            <div className="p-4">
              {visibleOtc.length > 0 ? (
                <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
                  {visibleOtc.map((o) => (
                    <OtcRow key={o.id} order={o} onClick={() => navigate(`/ph/otc/${o.id}`)} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<ShoppingBag className="w-6 h-6 text-[#C9D0DB]" />}
                  title="No OTC requests"
                  message="Over-the-counter requests will appear here."
                />
              )}
            </div>
          </>
        )}
      </div>

      <PharmacyBottomNav />

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
                  onClick={() => setActiveFilter('all')}
                  className="text-xs font-medium text-[#E44F4F]"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Filter options */}
            <div className="mb-5">
              <p className="text-xs font-medium text-[#8F9AA1] uppercase tracking-wide mb-2.5">
                Filter by
              </p>
              <div className="flex gap-2 flex-wrap">
                {filterChips.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                      activeFilter === f.id
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : 'bg-[#FFFFFF] text-[#4A4F55] border-[#E5E8EC] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply */}
            <button
              onClick={() => setShowFilters(false)}
              className="w-full h-11 rounded-xl bg-[#56D8A8] text-white text-sm font-semibold hover:bg-[#45C99A] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* ── OTC Filter bottom sheet ── */}
      {showOtcFilters && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowOtcFilters(false)}
          />
          {/* Sheet */}
          <div className="relative bg-white rounded-t-2xl px-4 pt-3 pb-6 animate-in slide-in-from-bottom duration-200">
            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-[#E5E8EC] mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-[#1A1A1A]">Filters</h3>
              {otcActiveFilterCount > 0 && (
                <button
                  onClick={() => {
                    setOtcPaymentFilter('all');
                    setOtcCustomerFilter('all');
                  }}
                  className="text-xs font-medium text-[#E44F4F]"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Filter options */}
            <div className="mb-5">
              <p className="text-xs font-medium text-[#8F9AA1] uppercase tracking-wide mb-2.5">
                Payment Status
              </p>
              <div className="flex gap-2 flex-wrap">
                {otcPaymentFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setOtcPaymentFilter(f.id)}
                    className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                      otcPaymentFilter === f.id
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : 'bg-[#FFFFFF] text-[#4A4F55] border-[#E5E8EC] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-medium text-[#8F9AA1] uppercase tracking-wide mb-2.5">
                Customer Type
              </p>
              <div className="flex gap-2 flex-wrap">
                {otcCustomerFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setOtcCustomerFilter(f.id)}
                    className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                      otcCustomerFilter === f.id
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : 'bg-[#FFFFFF] text-[#4A4F55] border-[#E5E8EC] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply */}
            <button
              onClick={() => setShowOtcFilters(false)}
              className="w-full h-11 rounded-xl bg-[#56D8A8] text-white text-sm font-semibold hover:bg-[#45C99A] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}