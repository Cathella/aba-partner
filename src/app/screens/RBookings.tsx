import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ReceptionistBottomNav } from '../components/aba/ReceptionistBottomNav';
import { SearchHeader } from '../components/aba/SearchHeader';
import { ListCard } from '../components/aba/Cards';
import { StatusChip } from '../components/aba/StatusChip';
import { ABABadge } from '../components/aba/ABABadge';
import { EmptyState } from '../components/aba/EmptyState';
import { useBookingsStore, type BookingTab } from '../data/bookingsStore';
import {
  Calendar,
  Search,
  ChevronRight,
  Clock,
  User,
} from 'lucide-react';

/* ── tab / filter config ── */
const tabs: { id: BookingTab; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
];

type FilterId = 'all' | 'pending' | 'confirmed';
const filters: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
];

export function RBookings() {
  const navigate = useNavigate();
  const { bookings } = useBookingsStore();
  const [activeTab, setActiveTab] = useState<BookingTab>('new');
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [search, setSearch] = useState('');

  /* Counts per tab (for badges) */
  const tabCounts = useMemo(() => {
    const counts: Record<BookingTab, number> = { new: 0, today: 0, upcoming: 0 };
    for (const b of bookings) {
      // only count actionable statuses
      if (['pending', 'reschedule-requested'].includes(b.status)) {
        counts[b.tab]++;
      }
    }
    return counts;
  }, [bookings]);

  /* Filtered list */
  const filtered = useMemo(() => {
    let list = bookings.filter((b) => b.tab === activeTab);

    if (activeFilter === 'pending') {
      list = list.filter((b) => ['pending', 'reschedule-requested'].includes(b.status));
    } else if (activeFilter === 'confirmed') {
      list = list.filter((b) => b.status === 'confirmed');
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.memberName.toLowerCase().includes(q) ||
          b.service.toLowerCase().includes(q) ||
          b.memberPhone.includes(q)
      );
    }
    return list;
  }, [bookings, activeTab, activeFilter, search]);

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Bookings" />

      {/* ── Tab bar ── */}
      <div className="bg-aba-neutral-0 border-b border-aba-neutral-200">
        <div className="flex">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            const count = tabCounts[t.id];
            return (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); setActiveFilter('all'); }}
                className={`flex-1 relative py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-aba-primary-main'
                    : 'text-aba-neutral-600 hover:text-aba-neutral-900'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {t.label}
                  {count > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-aba-error-main text-[10px] font-bold text-white">
                      {count}
                    </span>
                  )}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-aba-primary-main rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Search ── */}
      <SearchHeader
        value={search}
        onChange={setSearch}
        placeholder="Search member, service…"
      />

      {/* ── Filter chips ── */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
              activeFilter === f.id
                ? 'bg-aba-neutral-900 text-white border-aba-neutral-900'
                : 'bg-aba-neutral-0 text-aba-neutral-700 border-aba-neutral-200 hover:bg-aba-neutral-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Booking list ── */}
      <div className="flex-1 overflow-y-auto pb-20">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Search className="w-10 h-10" />}
            title="No bookings found"
            message={
              activeFilter !== 'all'
                ? 'Try changing the filter or search term.'
                : `No ${activeTab} booking requests right now.`
            }
          />
        ) : (
          <div className="px-4 space-y-2">
            {filtered.map((b) => (
              <button
                key={b.id}
                onClick={() => navigate(`/r/bookings/${b.id}`)}
                className="w-full bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4 hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors text-left"
              >
                {/* Top row: name + status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-aba-secondary-main" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-aba-neutral-900 truncate">
                        {b.memberName}
                      </p>
                      <p className="text-xs text-aba-neutral-600 truncate">
                        {b.service}
                      </p>
                    </div>
                  </div>
                  <StatusChip status={b.status} />
                </div>

                {/* Bottom row: date/time + chevron */}
                <div className="flex items-center justify-between mt-2 pl-[46px]">
                  <div className="flex items-center gap-3 text-xs text-aba-neutral-600">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {b.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {b.time}
                    </span>
                    {b.duration && (
                      <span className="text-aba-neutral-400">{b.duration}</span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-aba-neutral-400 flex-shrink-0" />
                </div>
              </button>
            ))}
            <div className="h-4" />
          </div>
        )}
      </div>

      <ReceptionistBottomNav />
    </div>
  );
}