import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABABadge } from '../components/aba/ABABadge';
import { ListCard, ListCardItem } from '../components/aba/Cards';
import {
  Search,
  SlidersHorizontal,
  X,
  Clock,
  User,
  ChevronRight,
  Inbox,
} from 'lucide-react';

/* ── types ── */

type BookingStatus =
  | 'confirmed'
  | 'checked-in'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show'
  | 'pending-reschedule';

type ServiceType =
  | 'Speech Therapy'
  | 'Occupational Therapy'
  | 'Behavioral Assessment'
  | 'Parent Consultation'
  | 'Follow-up Session'
  | 'Initial Consultation'
  | 'Group Therapy';

type DateRange = 'all' | 'today' | 'tomorrow' | 'week' | '30d';

interface Booking {
  id: string;
  patientName: string;
  service: ServiceType;
  date: string;
  time: string;
  assignedStaff: string;
  status: BookingStatus;
  duration: string;
}

/* ── mock data ── */

const mockBookings: Booking[] = [
  {
    id: '1',
    patientName: 'Sarah Johnson',
    service: 'Speech Therapy',
    date: '2026-02-16',
    time: '09:00 AM',
    assignedStaff: 'Dr. Emily Chen',
    status: 'completed',
    duration: '60 min',
  },
  {
    id: '2',
    patientName: 'Michael Smith',
    service: 'Occupational Therapy',
    date: '2026-02-16',
    time: '10:30 AM',
    assignedStaff: 'Dr. James Wilson',
    status: 'in-progress',
    duration: '45 min',
  },
  {
    id: '3',
    patientName: 'Emma Davis',
    service: 'Behavioral Assessment',
    date: '2026-02-16',
    time: '11:00 AM',
    assignedStaff: 'Dr. Sarah Martinez',
    status: 'checked-in',
    duration: '90 min',
  },
  {
    id: '4',
    patientName: 'Olivia Brown',
    service: 'Parent Consultation',
    date: '2026-02-16',
    time: '02:00 PM',
    assignedStaff: 'Dr. Emily Chen',
    status: 'confirmed',
    duration: '45 min',
  },
  {
    id: '5',
    patientName: 'Noah Williams',
    service: 'Follow-up Session',
    date: '2026-02-17',
    time: '09:30 AM',
    assignedStaff: 'Dr. James Wilson',
    status: 'confirmed',
    duration: '60 min',
  },
  {
    id: '6',
    patientName: 'Ava Taylor',
    service: 'Initial Consultation',
    date: '2026-02-17',
    time: '11:00 AM',
    assignedStaff: 'Dr. Sarah Martinez',
    status: 'pending-reschedule',
    duration: '60 min',
  },
  {
    id: '7',
    patientName: 'Liam Anderson',
    service: 'Speech Therapy',
    date: '2026-02-15',
    time: '02:00 PM',
    assignedStaff: 'Dr. Emily Chen',
    status: 'no-show',
    duration: '45 min',
  },
  {
    id: '8',
    patientName: 'Sophia Martinez',
    service: 'Group Therapy',
    date: '2026-02-15',
    time: '10:00 AM',
    assignedStaff: 'Dr. James Wilson',
    status: 'cancelled',
    duration: '90 min',
  },
];

/* ── config maps ── */

const statusConfig: Record<
  BookingStatus,
  { label: string; variant: 'success' | 'primary' | 'info' | 'warning' | 'danger' | 'default' }
> = {
  confirmed: { label: 'Confirmed', variant: 'info' },
  'checked-in': { label: 'Checked In', variant: 'primary' },
  'in-progress': { label: 'In Progress', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
  'no-show': { label: 'No-show', variant: 'danger' },
  'pending-reschedule': { label: 'Pending Reschedule', variant: 'warning' },
};

/* ── filter option definitions ── */

type StatusFilter = 'all' | BookingStatus;
type ServiceFilter = 'all' | ServiceType;

const dateRangeOptions: { key: DateRange; label: string }[] = [
  { key: 'all', label: 'All Dates' },
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'week', label: 'This Week' },
  { key: '30d', label: '30 Days' },
];

const statusOptions: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'checked-in', label: 'Checked In' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'no-show', label: 'No-show' },
  { key: 'pending-reschedule', label: 'Pending Reschedule' },
];

const serviceOptions: { key: ServiceFilter; label: string }[] = [
  { key: 'all', label: 'All Services' },
  { key: 'Speech Therapy', label: 'Speech Therapy' },
  { key: 'Occupational Therapy', label: 'Occupational Therapy' },
  { key: 'Behavioral Assessment', label: 'Behavioral Assessment' },
  { key: 'Parent Consultation', label: 'Parent Consultation' },
  { key: 'Follow-up Session', label: 'Follow-up Session' },
  { key: 'Initial Consultation', label: 'Initial Consultation' },
  { key: 'Group Therapy', label: 'Group Therapy' },
];

/* ── date-range helper ── */
function inDateRange(booking: Booking, range: DateRange): boolean {
  if (range === 'all') return true;
  if (range === 'today') return booking.date === '2026-02-16';
  if (range === 'tomorrow') return booking.date === '2026-02-17';
  if (range === 'week') return booking.date >= '2026-02-16' && booking.date <= '2026-02-22';
  if (range === '30d') return booking.date >= '2026-01-18' && booking.date <= '2026-03-18';
  return true;
}

/* ── date grouping ── */
function groupByDate(bookings: Booking[]): { label: string; items: Booking[] }[] {
  const groups = new Map<string, Booking[]>();
  for (const b of bookings) {
    const label =
      b.date === '2026-02-16'
        ? 'Today — 16 Feb'
        : b.date === '2026-02-17'
        ? 'Tomorrow — 17 Feb'
        : b.date === '2026-02-15'
        ? 'Yesterday — 15 Feb'
        : new Date(b.date).toLocaleDateString('en-UG', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
    const arr = groups.get(label) || [];
    arr.push(b);
    groups.set(label, arr);
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

/* ════════════════════════════════════════ */

export function BookingsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('all');

  /* Active filter count */
  const activeFiltersCount =
    (dateRange !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (serviceFilter !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setDateRange('all');
    setStatusFilter('all');
    setServiceFilter('all');
  };

  /* Status counts within current date range + service */
  const statusCounts = useMemo(() => {
    let base = mockBookings.filter((b) => inDateRange(b, dateRange));
    if (serviceFilter !== 'all') {
      base = base.filter((b) => b.service === serviceFilter);
    }
    const counts: Record<StatusFilter, number> = {
      all: base.length,
      confirmed: base.filter((b) => b.status === 'confirmed').length,
      'checked-in': base.filter((b) => b.status === 'checked-in').length,
      'in-progress': base.filter((b) => b.status === 'in-progress').length,
      completed: base.filter((b) => b.status === 'completed').length,
      cancelled: base.filter((b) => b.status === 'cancelled').length,
      'no-show': base.filter((b) => b.status === 'no-show').length,
      'pending-reschedule': base.filter((b) => b.status === 'pending-reschedule').length,
    };
    return counts;
  }, [dateRange, serviceFilter]);

  /* Service counts within current date range + status */
  const serviceCounts = useMemo(() => {
    let base = mockBookings.filter((b) => inDateRange(b, dateRange));
    if (statusFilter !== 'all') {
      base = base.filter((b) => b.status === statusFilter);
    }
    const counts: Record<ServiceFilter, number> = {
      all: base.length,
      'Speech Therapy': base.filter((b) => b.service === 'Speech Therapy').length,
      'Occupational Therapy': base.filter((b) => b.service === 'Occupational Therapy').length,
      'Behavioral Assessment': base.filter((b) => b.service === 'Behavioral Assessment').length,
      'Parent Consultation': base.filter((b) => b.service === 'Parent Consultation').length,
      'Follow-up Session': base.filter((b) => b.service === 'Follow-up Session').length,
      'Initial Consultation': base.filter((b) => b.service === 'Initial Consultation').length,
      'Group Therapy': base.filter((b) => b.service === 'Group Therapy').length,
    };
    return counts;
  }, [dateRange, statusFilter]);

  /* Apply all filters */
  const filtered = useMemo(() => {
    let items = mockBookings.filter((b) => inDateRange(b, dateRange));

    if (statusFilter !== 'all') {
      items = items.filter((b) => b.status === statusFilter);
    }

    if (serviceFilter !== 'all') {
      items = items.filter((b) => b.service === serviceFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (b) =>
          b.patientName.toLowerCase().includes(q) ||
          b.service.toLowerCase().includes(q) ||
          b.assignedStaff.toLowerCase().includes(q),
      );
    }

    return items;
  }, [dateRange, statusFilter, serviceFilter, searchQuery]);

  const grouped = groupByDate(filtered);

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      {/* Top Bar */}
      <AppTopBar
        title="Bookings"
        showBack
        onBackClick={() => navigate(-1)}
      />

      {/* Booking List */}
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
                placeholder="Search patient, service, or staff..."
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
              {serviceFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium pl-2.5 pr-1.5 py-1 rounded-full bg-aba-neutral-900 text-white">
                  {serviceOptions.find((s) => s.key === serviceFilter)?.label}
                  <button
                    onClick={() => setServiceFilter('all')}
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
              {filtered.length} {filtered.length === 1 ? 'booking' : 'bookings'} found
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
                  {group.items.map((booking) => (
                    <ListCardItem
                      key={booking.id}
                      onClick={() => navigate(`/booking-detail/${booking.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-aba-neutral-900 truncate">
                            {booking.patientName}
                          </p>
                          <ABABadge
                            variant={statusConfig[booking.status].variant}
                            size="sm"
                          >
                            {statusConfig[booking.status].label}
                          </ABABadge>
                        </div>
                        <p className="text-aba-neutral-900 mb-0.5 truncate text-[12px]">
                          {booking.service}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-aba-neutral-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {booking.time} ({booking.duration})
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            <span>{booking.assignedStaff}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-aba-neutral-400 flex-shrink-0" />
                    </ListCardItem>
                  ))}
                </ListCard>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-24 px-4">
            <div className="w-14 h-14 rounded-2xl bg-aba-neutral-100 border border-aba-neutral-200 flex items-center justify-center mb-4">
              <Inbox className="w-6 h-6 text-aba-neutral-400" />
            </div>
            <p className="text-sm font-medium text-aba-neutral-700">No bookings found</p>
            <p className="text-xs text-aba-neutral-600 mt-1 text-center max-w-[220px]">
              {searchQuery.trim()
                ? 'Try a different search term.'
                : 'No bookings match the current filters.'}
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
          <div className="relative bg-white rounded-t-2xl px-4 pt-3 pb-6 max-h-[80vh] overflow-y-auto">
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

            {/* Section 2: Booking Status */}
            <div className="mb-5">
              <p className="text-xs font-medium text-aba-neutral-600 uppercase tracking-wide mb-2.5">
                Booking Status
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

            {/* Section 3: Service Type */}
            <div className="mb-5">
              <p className="text-xs font-medium text-aba-neutral-600 uppercase tracking-wide mb-2.5">
                Service Type
              </p>
              <div className="flex gap-2 flex-wrap">
                {serviceOptions.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setServiceFilter(s.key)}
                    className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                      serviceFilter === s.key
                        ? 'bg-aba-neutral-900 text-white border-aba-neutral-900'
                        : 'bg-white text-aba-neutral-700 border-aba-neutral-200 hover:bg-aba-neutral-100'
                    }`}
                  >
                    {s.label}
                    {serviceCounts[s.key] > 0 && (
                      <span className={`ml-1 ${serviceFilter === s.key ? 'text-white/60' : 'text-aba-neutral-400'}`}>
                        {serviceCounts[s.key]}
                      </span>
                    )}
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