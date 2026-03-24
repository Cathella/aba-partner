/**
 * LT-01 Lab Worklist — Main screen showing lab orders by status tab.
 *
 * Layout:
 *   Top bar → "Lab Worklist" + date
 *   Search → "Search patient, order ID, member ID"
 *   Segmented control → Pending Collection | In Progress | Results Ready | Completed
 *   Filter chips → All | Urgent | Routine
 *   Order list → tappable rows → LT-02 Order Detail
 *   Empty state per tab
 *   Bottom nav present.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { LabBottomNav } from '../components/aba/LabBottomNav';
import { LTOrderRow } from '../components/aba/LTOrderRow';
import { ABABadge } from '../components/aba/ABABadge';
import { EmptyState } from '../components/aba/EmptyState';
import { useLabTechStore } from '../data/labTechStore';
import type { LTOrderStatus } from '../data/labTechStore';
import { Search, Inbox, Bell, SlidersHorizontal, X } from 'lucide-react';

/* ─── status tab definitions ─── */

type StatusTab = 'pending' | 'in-progress' | 'results-ready' | 'completed';

const statusTabs: { id: StatusTab; label: string; statuses: LTOrderStatus[] }[] = [
  {
    id: 'pending',
    label: 'Pending Collection',
    statuses: ['pending-collection', 're-collect'],
  },
  {
    id: 'in-progress',
    label: 'In Progress',
    statuses: ['in-progress'],
  },
  {
    id: 'results-ready',
    label: 'Results Ready',
    statuses: ['results-ready'],
  },
  {
    id: 'completed',
    label: 'Completed',
    statuses: ['completed'],
  },
];

/* ─── urgency filter definitions ─── */

type UrgencyFilter = 'all' | 'urgent' | 'routine';

const urgencyFilters: { id: UrgencyFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'routine', label: 'Routine' },
];

/* ─── reject category filter definitions ─── */

type RejectCategoryFilter = 'all' | 'insufficient_sample' | 'wrong_container' | 'clotted_sample' | 'patient_not_found' | 'other';

const rejectCategoryFilters: { id: RejectCategoryFilter; label: string }[] = [
  { id: 'all', label: 'All reasons' },
  { id: 'insufficient_sample', label: 'Insufficient' },
  { id: 'wrong_container', label: 'Wrong container' },
  { id: 'clotted_sample', label: 'Clotted' },
  { id: 'patient_not_found', label: 'No patient' },
  { id: 'other', label: 'Other' },
];

/* ─── per-tab empty state copy ─── */

const emptyStateMap: Record<StatusTab, { title: string; subtitle: string }> = {
  pending: {
    title: 'No orders here yet',
    subtitle: 'New orders from doctors will appear here for sample collection.',
  },
  'in-progress': {
    title: 'No orders here yet',
    subtitle: 'Orders move here once a sample has been collected and processing begins.',
  },
  'results-ready': {
    title: 'No orders here yet',
    subtitle: 'Submitted results waiting for verification will show up here.',
  },
  completed: {
    title: 'No orders here yet',
    subtitle: 'Verified and released orders will appear here.',
  },
};

/* ─── helpers ─── */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ─── component ─── */

export function LTWorklist() {
  const navigate = useNavigate();
  const { orders } = useLabTechStore();

  const [activeTab, setActiveTab] = useState<StatusTab>('pending');
  const [urgency, setUrgency] = useState<UrgencyFilter>('all');
  const [rejectFilter, setRejectFilter] = useState<RejectCategoryFilter>('all');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const today = new Date();
  const dateChip = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  /* counts per tab (for badge) */
  const tabCounts = useMemo(() => {
    const counts: Record<StatusTab, number> = {
      pending: 0,
      'in-progress': 0,
      'results-ready': 0,
      completed: 0,
    };
    for (const o of orders) {
      for (const t of statusTabs) {
        if (t.statuses.includes(o.status)) {
          counts[t.id]++;
          break;
        }
      }
    }
    return counts;
  }, [orders]);

  /* filtered + sorted list */
  const visibleOrders = useMemo(() => {
    const tab = statusTabs.find((t) => t.id === activeTab)!;
    let list = orders.filter((o) => tab.statuses.includes(o.status));

    /* urgency filter */
    if (urgency === 'urgent') {
      list = list.filter((o) => o.urgency === 'stat' || o.urgency === 'urgent');
    } else if (urgency === 'routine') {
      list = list.filter((o) => o.urgency === 'routine');
    }

    /* reject category filter (pending tab only, for re-collect orders) */
    if (activeTab === 'pending' && rejectFilter !== 'all') {
      list = list.filter(
        (o) => o.status === 're-collect' && o.rejectCategory === rejectFilter
      );
    }

    /* search */
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.patientName.toLowerCase().includes(q) ||
          o.testName.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
      );
    }

    /* sort: stat → urgent → routine */
    const rank = { stat: 0, urgent: 1, routine: 2 };
    return [...list].sort(
      (a, b) => (rank[a.urgency] ?? 2) - (rank[b.urgency] ?? 2)
    );
  }, [orders, activeTab, urgency, rejectFilter, search]);

  const empty = emptyStateMap[activeTab];

  /* active filter count (for badge on filter icon) */
  const activeFilterCount =
    (urgency !== 'all' ? 1 : 0) +
    (activeTab === 'pending' && rejectFilter !== 'all' ? 1 : 0);

  /* whether reject filter is relevant right now */
  const showRejectSection =
    activeTab === 'pending' && orders.some((o) => o.status === 're-collect');

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      {/* ── Top bar ── */}
      <AppTopBar
        title={`${getGreeting()}, Lab Tech Kizza`}
        subtitle="Mukono Family Clinic • Lab Technician"
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
        {/* Controls card */}
        <div className="bg-[#FFFFFF] border border-[#E5E8EC] mx-4 mt-4 rounded-2xl px-4 pt-3 pb-3 space-y-3">
          {/* Search + filter button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9D0DB]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient, order ID, member ID"
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
              {urgency !== 'all' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium pl-2.5 pr-1.5 py-1 rounded-full bg-[#1A1A1A] text-white">
                  {urgency === 'urgent' ? 'Urgent' : 'Routine'}
                  <button
                    onClick={() => setUrgency('all')}
                    className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {activeTab === 'pending' && rejectFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium pl-2.5 pr-1.5 py-1 rounded-full bg-[#E44F4F] text-white">
                  {rejectCategoryFilters.find((f) => f.id === rejectFilter)?.label}
                  <button
                    onClick={() => setRejectFilter('all')}
                    className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Segmented control */}
          <div className="flex bg-[#F7F9FC] rounded-xl p-0.5 gap-0.5 overflow-x-auto no-scrollbar">
            {statusTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = tabCounts[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap relative text-center px-3 py-2 rounded-[10px] transition-all text-[11px] font-medium leading-tight flex-shrink-0 ${
                    isActive
                      ? 'bg-[#FFFFFF] text-[#1A1A1A] shadow-sm'
                      : 'text-[#8F9AA1] hover:text-[#4A4F55]'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`ml-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-[#56D8A8] text-white'
                          : 'bg-[#E5E8EC] text-[#8F9AA1]'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Order list ── */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-aba-neutral-900">
              Orders
            </h3>
            <ABABadge variant="info" size="sm">
              {visibleOrders.length} order{visibleOrders.length !== 1 ? 's' : ''}
            </ABABadge>
          </div>
          {visibleOrders.length > 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
              {visibleOrders.map((order) => (
                <LTOrderRow
                  key={order.id}
                  order={order}
                  onClick={() => navigate(`/lt/order/${order.id}`)}
                  onQuickReject={
                    order.status === 're-collect'
                      ? () => navigate(`/lt/reject-recollect/${order.id}`)
                      : undefined
                  }
                />
              ))}
            </div>
          ) : (
            /* ── Empty state ── */
            <EmptyState
              icon={<Inbox className="w-10 h-10" />}
              title={empty.title}
              message={empty.subtitle}
            />
          )}
        </div>
      </div>

      <LabBottomNav />

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
                    setUrgency('all');
                    setRejectFilter('all');
                  }}
                  className="text-xs font-medium text-[#E44F4F]"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Urgency */}
            <div className="mb-5">
              <p className="text-xs font-medium text-[#8F9AA1] uppercase tracking-wide mb-2.5">
                Urgency
              </p>
              <div className="flex gap-2">
                {urgencyFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setUrgency(f.id)}
                    className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                      urgency === f.id
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : 'bg-[#FFFFFF] text-[#4A4F55] border-[#E5E8EC] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reject category — only when relevant */}
            {showRejectSection && (
              <div className="mb-5">
                <p className="text-xs font-medium text-[#8F9AA1] uppercase tracking-wide mb-2.5">
                  Re-collect Reason
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {rejectCategoryFilters.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setRejectFilter(f.id)}
                      className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-colors ${
                        rejectFilter === f.id
                          ? 'bg-[#FDECEC] text-[#E44F4F] border-[#E44F4F]/30'
                          : 'bg-[#FFFFFF] text-[#8F9AA1] border-[#E5E8EC] hover:bg-[#F7F9FC]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
    </div>
  );
}