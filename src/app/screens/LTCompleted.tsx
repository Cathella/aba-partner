/**
 * Completed tab — List of all verified & released lab orders.
 * Main navigation tab (Completed). Shows LabBottomNav.
 *
 * Each row shows: patient name + age, test name, verified date/time,
 * and clinician who ordered. Tapping opens LT-07 Completed Result Detail.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LabBottomNav } from '../components/aba/LabBottomNav';
import { useLabTechStore } from '../data/labTechStore';
import type { LTLabOrder, LTRequestSource } from '../data/labTechStore';
import {
  Search,
  CheckCircle2,
  Inbox,
  ChevronRight,
  ShieldCheck,
  FlaskConical,
  Clock,
  CalendarDays,
  Stethoscope,
  UserCircle,
  ExternalLink,
  Paperclip,
} from 'lucide-react';

/* ── Date filter options ── */
type DateFilter = 'all' | 'today' | 'yesterday' | 'week';

const dateFilters: { id: DateFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'This Week' },
];

/* ── request source chip config (inline) ── */
const srcChipConfig: Record<LTRequestSource, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  internal: { label: 'Internal', bg: 'bg-[#EBF3FF]', text: 'text-[#3A8DFF]', Icon: Stethoscope },
  'self-requested': { label: 'Self-requested', bg: 'bg-[#F3F0FF]', text: 'text-[#7C3AED]', Icon: UserCircle },
  'external-referral': { label: 'External referral', bg: 'bg-[#FFF3DC]', text: 'text-[#D97706]', Icon: ExternalLink },
};

/* ── Completed order row ── */
function CompletedRow({
  order,
  onClick,
}: {
  order: LTLabOrder;
  onClick: () => void;
}) {
  const src = order.requestSource ? srcChipConfig[order.requestSource] : null;
  const SrcIcon = src?.Icon;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-stretch border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
    >
      {/* Green accent bar */}
      <div className="w-[3px] flex-shrink-0 rounded-r-full my-2 bg-[#38C172]" />

      <div className="flex-1 flex items-center gap-3 px-3.5 py-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-[#E9F8F0] flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-[#38C172]" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Row 1: Patient name + age */}
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-[#1A1A1A] truncate">
              {order.patientName}
            </p>
            <span className="text-xs text-[#8F9AA1] flex-shrink-0">
              {order.patientAge} yrs
            </span>
          </div>

          {/* Row 2: Test name */}
          <p className="text-xs text-[#4A4F55] truncate mt-0.5">
            {order.testName}
          </p>

          {/* Row 3: Verified timestamp + source + ordered by */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {order.verifiedAt && (
              <span className="inline-flex items-center gap-1 text-[#38C172] font-medium text-[12px]">
                <CheckCircle2 className="w-3 h-3" />
                Verified {order.verifiedAt}
              </span>
            )}
            {!order.verifiedAt && order.resultedAt && (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#8F9AA1]">
                <Clock className="w-3 h-3" />
                {order.resultedAt}
              </span>
            )}
            {src && SrcIcon && (
              <span className={`inline-flex items-center gap-1 font-semibold px-1.5 py-[2px] rounded-full ${src.bg} ${src.text} text-[12px]`}>
                <SrcIcon className="w-2.5 h-2.5" />
                {src.label}
              </span>
            )}
            {order.requestSource === 'external-referral' && order.referralAttachments && order.referralAttachments.length > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-[#D97706]">
                <Paperclip className="w-2.5 h-2.5" />
              </span>
            )}
            <span className="text-[#C9D0DB] ml-auto flex-shrink-0 text-[12px]">
              {order.orderedBy}
            </span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
      </div>
    </button>
  );
}

export function LTCompleted() {
  const navigate = useNavigate();
  const { completed, stats } = useLabTechStore();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const filtered = completed.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.patientName.toLowerCase().includes(q) ||
      o.testName.toLowerCase().includes(q) ||
      o.orderedBy.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      {/* Top bar */}
      <div className="bg-[#FFFFFF] border-b border-[#E5E8EC] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#38C172]" />
          <h1 className="text-lg font-semibold text-[#1A1A1A]">Completed</h1>
        </div>
        <span className="text-xs font-medium text-[#8F9AA1]">
          {stats.completed} total
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9D0DB]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search completed orders…"
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#E5E8EC] bg-[#FFFFFF] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all"
            />
          </div>

          {/* Date filter */}
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9D0DB]" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#E5E8EC] bg-[#FFFFFF] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all"
            >
              {dateFilters.map((filter) => (
                <option key={filter.id} value={filter.id}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          {/* Summary strip */}
          {filtered.length > 0 && (
            <div className="flex items-center gap-2 px-1">
              <FlaskConical className="w-3.5 h-3.5 text-[#8F9AA1]" />
              <p className="text-xs text-[#8F9AA1]">
                {filtered.length} verified & released{' '}
                {filtered.length === 1 ? 'order' : 'orders'}
              </p>
            </div>
          )}

          {/* List */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            {filtered.length > 0 ? (
              filtered.map((order) => (
                <CompletedRow
                  key={order.id}
                  order={order}
                  onClick={() => navigate(`/lt/completed-detail/${order.id}`)}
                />
              ))
            ) : (
              <div className="py-12 text-center">
                <Inbox className="w-8 h-8 text-[#C9D0DB] mx-auto mb-2" />
                <p className="text-sm text-[#8F9AA1]">
                  {search
                    ? 'No orders match your search'
                    : 'No completed orders yet'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <LabBottomNav />
    </div>
  );
}