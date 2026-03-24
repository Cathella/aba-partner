/**
 * R-30 Queue Board — Segmented-tab view of the live patient queue.
 * Tabs: Waiting · In Consultation · Lab · Pharmacy · Completed
 * Each card shows ticket #, patient name, service, time-in-queue.
 * Tapping a card → R-31 Queue Item Detail.
 * Bottom nav present (main nav screen).
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ReceptionistBottomNav } from '../components/aba/ReceptionistBottomNav';
import { StatusChip, type VisitStatus } from '../components/aba/StatusChip';
import { ABABadge } from '../components/aba/ABABadge';
import { EmptyState } from '../components/aba/EmptyState';
import { useScheduleStore, type ScheduleItem } from '../data/scheduleStore';
import {
  Clock,
  UserCheck,
  FlaskConical,
  Pill,
  CheckCircle2,
  ChevronRight,
  Users,
  Inbox,
  ShieldCheck,
} from 'lucide-react';

/* ── tab definitions ── */
interface Tab {
  id: VisitStatus | 'completed-tab';
  label: string;
  statuses: VisitStatus[];
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const tabs: Tab[] = [
  {
    id: 'waiting',
    label: 'Waiting',
    statuses: ['waiting'],
    icon: <Clock className="w-3.5 h-3.5" />,
    color: 'text-aba-warning-main',
    bgColor: 'bg-aba-warning-50',
  },
  {
    id: 'in-consultation',
    label: 'Consult',
    statuses: ['in-consultation'],
    icon: <UserCheck className="w-3.5 h-3.5" />,
    color: 'text-[#8B5CF6]',
    bgColor: 'bg-[#F5F3FF]',
  },
  {
    id: 'lab' as VisitStatus,
    label: 'Lab',
    statuses: ['lab'],
    icon: <FlaskConical className="w-3.5 h-3.5" />,
    color: 'text-[#F59E0B]',
    bgColor: 'bg-[#FFFBEB]',
  },
  {
    id: 'pharmacy' as VisitStatus,
    label: 'Pharmacy',
    statuses: ['pharmacy'],
    icon: <Pill className="w-3.5 h-3.5" />,
    color: 'text-[#EC4899]',
    bgColor: 'bg-[#FDF2F8]',
  },
  {
    id: 'completed-tab',
    label: 'Done',
    statuses: ['completed', 'no-show'],
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: 'text-aba-success-main',
    bgColor: 'bg-aba-success-50',
  },
];

/* ── time-in-queue helper ── */
function timeInQueue(checkedInAt?: string): string {
  if (!checkedInAt) return '—';
  // Parse the checkedInAt string (hh:mm AM/PM)
  const match = checkedInAt.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return checkedInAt;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  const checkedIn = new Date();
  checkedIn.setHours(h, m, 0, 0);
  const diff = Math.max(0, Math.floor((Date.now() - checkedIn.getTime()) / 60000));
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff} min`;
  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function RQueue() {
  const navigate = useNavigate();
  const { boardItems } = useScheduleStore();
  const [activeTab, setActiveTab] = useState<string>('waiting');

  const currentTab = tabs.find((t) => t.id === activeTab)!;

  /* ── filter items by active tab ── */
  const tabItems = useMemo(() => {
    return boardItems.filter((i) => currentTab.statuses.includes(i.status));
  }, [boardItems, currentTab]);

  /* ── tab counts ── */
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tabs.forEach((t) => {
      counts[t.id] = boardItems.filter((i) => t.statuses.includes(i.status)).length;
    });
    return counts;
  }, [boardItems]);

  /* ── KPIs ── */
  const totalActive = boardItems.filter((i) =>
    ['waiting', 'in-consultation', 'lab', 'pharmacy'].includes(i.status)
  ).length;
  const waitingCount = tabCounts['waiting'] ?? 0;

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Queue" />

      <div className="flex-1 overflow-y-auto pb-20">
        {/* ── KPI strip ── */}
        <div className="flex gap-3 px-4 pt-4 pb-3">
          <div className="flex-1 bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-aba-secondary-50">
              <Users className="w-4 h-4 text-aba-secondary-main" />
            </div>
            <div>
              <p className="text-xs text-aba-neutral-600">Active</p>
              <p className="text-base font-semibold text-aba-neutral-900">{totalActive}</p>
            </div>
          </div>
          <div className="flex-1 bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-aba-warning-50">
              <Clock className="w-4 h-4 text-aba-warning-main" />
            </div>
            <div>
              <p className="text-xs text-aba-neutral-600">Waiting</p>
              <p className="text-base font-semibold text-aba-neutral-900">{waitingCount}</p>
            </div>
          </div>
        </div>

        {/* ── Segmented tabs ── */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((t) => {
              const isActive = activeTab === t.id;
              const count = tabCounts[t.id] ?? 0;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                    isActive
                      ? 'bg-aba-neutral-900 text-white'
                      : 'bg-aba-neutral-0 border border-aba-neutral-200 text-aba-neutral-600 hover:bg-aba-neutral-100'
                  }`}
                >
                  {t.label}
                  {count > 0 && (
                    <span
                      className={`min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isActive
                          ? 'text-aba-neutral-900 bg-white'
                          : 'text-aba-neutral-600 bg-aba-neutral-200'
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

        {/* ── Tab heading ── */}
        <div className="flex items-center justify-between px-4 pb-2">
          <h3 className="text-sm font-semibold text-aba-neutral-900">
            {currentTab.label}
          </h3>
          <ABABadge variant="info" size="sm">
            {tabItems.length} patient{tabItems.length !== 1 ? 's' : ''}
          </ABABadge>
        </div>

        {/* ── Queue cards ── */}
        {tabItems.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-10 h-10" />}
            title={`No patients in ${currentTab.label}`}
            message="Patients will appear here as they progress through the queue."
          />
        ) : (
          <div className="px-4 space-y-3 pb-4">
            {tabItems.map((item, idx) => (
              <QueueCard
                key={item.id}
                item={item}
                position={idx + 1}
                tab={currentTab}
                onClick={() => navigate(`/r/queue-detail/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <ReceptionistBottomNav />
    </div>
  );
}

/* ══════════════════════════════════════════
   Queue Card sub-component
   ═════════════════════════════════════════ */
function QueueCard({
  item,
  position,
  tab,
  onClick,
}: {
  item: ScheduleItem;
  position: number;
  tab: Tab;
  onClick: () => void;
}) {
  /* Build initials from patient name */
  const initials = item.patient
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const ticketLabel = item.ticket || `#${position}`;

  return (
    <button
      onClick={onClick}
      className="w-full bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 px-3.5 py-3 hover:border-aba-neutral-300 active:bg-aba-neutral-100 transition-all text-left"
    >
      {/* Top row: avatar + name + status */}
      <div className="flex items-center gap-2.5 mb-1.5">
        {/* Initials avatar */}
        <span
          className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold flex-shrink-0 ${tab.bgColor} ${tab.color}`}
        >
          {initials}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-aba-neutral-900 truncate">
              {item.patient}
            </p>
            {item.type === 'walk-in' && (
              <span className="text-[10px] font-semibold text-aba-primary-main bg-aba-primary-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                WALK-IN
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StatusChip status={item.status} />
          <ChevronRight className="w-4 h-4 text-aba-neutral-400" />
        </div>
      </div>

      {/* Info row: ticket · service · provider */}
      <div className="flex items-center gap-1 text-xs text-aba-neutral-600 ml-[46px]">
        <span className={`font-semibold ${tab.color} flex-shrink-0`}>{ticketLabel}</span>
        <span className="text-aba-neutral-300">&middot;</span>
        <span className="truncate">{item.service}</span>
        <span className="text-aba-neutral-300">&middot;</span>
        <span className="truncate">{item.assignedStaff || item.provider}</span>
      </div>

      {/* Bottom row: room + time in queue */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-aba-neutral-200 ml-[46px]">
        {item.room ? (
          <span className="text-xs text-aba-neutral-600">
            {item.room}
          </span>
        ) : (
          <span className="text-xs text-aba-neutral-400">No room</span>
        )}
        <span className="text-xs font-medium text-aba-neutral-700 flex items-center gap-1">
          <Clock className="w-3 h-3 text-aba-neutral-400" />
          {timeInQueue(item.checkedInAt)}
        </span>
      </div>

      {/* Transfer note (if present) */}
      {item.transferNote && (
        <div className="mt-1.5 pt-1.5 border-t border-aba-neutral-200 ml-[46px]">
          <p className="text-[11px] text-aba-neutral-500 italic truncate">
            Note: {item.transferNote}
          </p>
        </div>
      )}

      {/* Coverage chips (consultation + lab) */}
      {(item.coverageStatus || item.labCoverageStatus) && (
        <div className="mt-1.5 pt-1.5 border-t border-aba-neutral-200 ml-[46px] space-y-1">
          {item.coverageStatus && (
            <div className="flex items-center gap-1.5">
              <ShieldCheck className={`w-3 h-3 flex-shrink-0 ${item.coverageStatus === 'Covered' ? 'text-aba-success-main' : 'text-aba-neutral-400'}`} />
              <span className={`text-[10px] font-semibold px-1.5 py-[1px] rounded-full ${
                item.coverageStatus === 'Covered'
                  ? 'bg-aba-success-50 text-aba-success-main'
                  : item.coverageStatus === 'Discount applied'
                  ? 'bg-aba-secondary-50 text-aba-secondary-main'
                  : 'bg-aba-neutral-100 text-aba-neutral-600'
              }`}>
                {item.coverageStatus}
              </span>
              {item.coveragePackage && (
                <span className="text-[10px] text-aba-neutral-500">{item.coveragePackage}</span>
              )}
            </div>
          )}
          {item.labCoverageStatus && (
            <div className="flex items-center gap-1.5">
              <FlaskConical className={`w-3 h-3 flex-shrink-0 ${item.labCoverageStatus === 'Covered' ? 'text-[#F59E0B]' : 'text-aba-neutral-400'}`} />
              <span className={`text-[10px] font-semibold px-1.5 py-[1px] rounded-full ${
                item.labCoverageStatus === 'Covered'
                  ? 'bg-aba-success-50 text-aba-success-main'
                  : item.labCoverageStatus === 'Discount applied'
                  ? 'bg-aba-secondary-50 text-aba-secondary-main'
                  : 'bg-aba-neutral-100 text-aba-neutral-600'
              }`}>
                {item.labCoverageStatus}
              </span>
              {item.labCoveragePackage && (
                <span className="text-[10px] text-aba-neutral-500">{item.labCoveragePackage}</span>
              )}
            </div>
          )}
        </div>
      )}
    </button>
  );
}