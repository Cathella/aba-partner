/**
 * R-20 Today Schedule — List of today's bookings.
 * Tapping a row navigates to the detail page where actions live.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ReceptionistBottomNav } from '../components/aba/ReceptionistBottomNav';
import { SearchHeader } from '../components/aba/SearchHeader';
import { ListCard } from '../components/aba/Cards';
import { StatusChip, type VisitStatus } from '../components/aba/StatusChip';
import { ABABadge } from '../components/aba/ABABadge';
import { EmptyState } from '../components/aba/EmptyState';
import {
  useScheduleStore,
  isNotArrived,
  isArrived,
  isCheckedIn,
  isDone,
  type ScheduleItem,
} from '../data/scheduleStore';
import {
  ChevronRight,
  Search,
} from 'lucide-react';

/* ── filter tabs ── */
const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'not-arrived', label: 'Not Arrived' },
  { id: 'arrived', label: 'Arrived' },
  { id: 'checked-in', label: 'Checked In' },
  { id: 'done', label: 'Done' },
];

export function RSchedule() {
  const navigate = useNavigate();
  const { items } = useScheduleStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  /* ── filtered list ── */
  const filtered = useMemo(() => {
    let list = items;

    if (filter === 'not-arrived') list = list.filter((i) => isNotArrived(i.status));
    else if (filter === 'arrived') list = list.filter((i) => isArrived(i.status));
    else if (filter === 'checked-in') list = list.filter((i) => isCheckedIn(i.status));
    else if (filter === 'done') list = list.filter((i) => isDone(i.status));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.patient.toLowerCase().includes(q) ||
          i.service.toLowerCase().includes(q) ||
          i.phone.includes(q) ||
          i.provider.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, search, filter]);

  const notArrivedCount = items.filter((i) => isNotArrived(i.status)).length;
  const arrivedCount = items.filter((i) => isArrived(i.status)).length;
  const needsActionCount = notArrivedCount + arrivedCount;

  /* ── row tap → booking detail ── */
  const handleRowTap = (item: ScheduleItem) => {
    navigate(`/r/schedule/${item.id}`);
  };

  /* ── status colour dot for the time column ── */
  const timeDotColor = (s: VisitStatus) => {
    if (isNotArrived(s)) return 'bg-aba-neutral-400';
    if (isArrived(s)) return 'bg-aba-primary-main';
    if (isCheckedIn(s)) return 'bg-aba-success-main';
    return 'bg-aba-neutral-300';
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Today's Schedule" showBack onBackClick={() => navigate(-1)} />

      {/* ── Summary strip ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-aba-neutral-0 border-b border-aba-neutral-200">
        <p className="text-sm text-aba-neutral-600">
          <span className="font-semibold text-aba-neutral-900">{items.length}</span> patients today
        </p>
        {needsActionCount > 0 && (
          <ABABadge variant="warning" size="sm">
            {needsActionCount} need action
          </ABABadge>
        )}
      </div>

      {/* ── Search ── */}
      <SearchHeader
        value={search}
        onChange={setSearch}
        placeholder="Search patient, phone, service…"
      />

      {/* ── Filter tabs ── */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
        {filterTabs.map((t) => {
          let count = 0;
          if (t.id === 'not-arrived') count = notArrivedCount;
          else if (t.id === 'arrived') count = arrivedCount;
          else if (t.id === 'checked-in') count = items.filter((i) => isCheckedIn(i.status)).length;
          else if (t.id === 'done') count = items.filter((i) => isDone(i.status)).length;
          return (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                filter === t.id
                  ? 'bg-aba-neutral-900 text-white border-aba-neutral-900'
                  : 'bg-aba-neutral-0 text-aba-neutral-700 border-aba-neutral-200 hover:bg-aba-neutral-100'
              }`}
            >
              {t.label}
              {t.id !== 'all' && count > 0 && (
                <span className="ml-1 opacity-70">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Schedule list ── */}
      <div className="flex-1 overflow-y-auto pb-20">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Search className="w-10 h-10" />}
            title="No matches"
            message="Adjust your search or filter to see patients."
          />
        ) : (
          <div className="px-4 pb-8">
            <ListCard>
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleRowTap(item)}
                  className="w-full flex items-start gap-3 px-4 py-3.5 border-b border-aba-neutral-200 last:border-b-0 hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors text-left"
                >
                  {/* Time column */}
                  <div className="w-[44px] flex-shrink-0 pt-0.5 text-center">
                    <span className="text-xs font-semibold text-aba-neutral-900 block text-[#8f9aa1]">
                      {item.time.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-aba-neutral-500 block text-[#8f9aa1]">
                      {item.time.split(' ')[1]}
                    </span>
                  </div>

                  {/* Status dot */}
                  <div className={`w-2 h-2 rounded-full ${timeDotColor(item.status)} flex-shrink-0 mt-1.5`} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-aba-neutral-900 truncate">
                        {item.patient}
                      </p>
                      {item.type === 'walk-in' && (
                        <span className="text-[10px] font-semibold text-aba-primary-main bg-aba-primary-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          WALK-IN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-aba-neutral-600 truncate mt-0.5">
                      {item.service} &bull; {item.provider}
                    </p>
                    {item.room && (
                      <p className="text-[11px] text-aba-neutral-400 truncate mt-0.5">
                        {item.room}{item.checkedInAt ? ` \u2022 Checked in ${item.checkedInAt}` : ''}
                      </p>
                    )}
                  </div>

                  {/* Status + chevron */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                    <StatusChip status={item.status} />
                    <ChevronRight className="w-4 h-4 text-aba-neutral-400" />
                  </div>
                </button>
              ))}
            </ListCard>
          </div>
        )}
      </div>

      <ReceptionistBottomNav />
    </div>
  );
}