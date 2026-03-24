/**
 * NU-01 Nurse Queue — Tabbed patient queue with search.
 *
 * Tabs: Waiting for Triage | Ready for Clinician | In Station
 * Queue cards: ticket, patient name, service, time, status chip.
 * Tap → NU-02 Patient Triage Summary.
 * Bottom nav present.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { NurseBottomNav } from '../components/aba/NurseBottomNav';
import { EmptyState } from '../components/aba/EmptyState';
import { useNurseStore } from '../data/nurseStore';
import type { NUQueueItem, NUQueueStatus } from '../data/nurseStore';
import {
  Search,
  Inbox,
  ChevronRight,
  Clock,
  User,
  Stethoscope,
  FlaskConical,
  Pill,
  DoorOpen,
  ArrowLeft,
  Bell,
} from 'lucide-react';

/* ── Status chip ── */
const statusMeta: Record<NUQueueStatus, { label: string; dot: string; bg: string }> = {
  'waiting-triage': { label: 'Waiting for Triage', dot: 'bg-[#FFB649]', bg: 'bg-[#FFF3DC]' },
  'ready-for-clinician': { label: 'Ready for Doctor', dot: 'bg-[#56D8A8]', bg: 'bg-[#E9F8F0]' },
  'in-station': { label: 'In Station', dot: 'bg-[#3A8DFF]', bg: 'bg-[#EBF3FF]' },
};

function NUStatusChip({ status }: { status: NUQueueStatus }) {
  const m = statusMeta[status];
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold px-2 py-0.5 rounded-full ${m.bg} text-[#1A1A1A] text-[12px]`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

/* ── Station icon helper ── */
function StationIcon({ type }: { type?: string }) {
  switch (type) {
    case 'lab': return <FlaskConical className="w-3 h-3 text-[#D97706]" />;
    case 'pharmacy': return <Pill className="w-3 h-3 text-[#EC4899]" />;
    case 'room': return <DoorOpen className="w-3 h-3 text-[#3A8DFF]" />;
    case 'reception': return <ArrowLeft className="w-3 h-3 text-[#8F9AA1]" />;
    default: return null;
  }
}

/* ── Queue row ── */
function QueueRow({ item, onClick }: { item: NUQueueItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
        <User className="w-5 h-5 text-[#3A8DFF]" />
      </div>

      <div className="flex-1 min-w-0">
        {/* Row 1: ticket + name */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[#3A8DFF] bg-[#EBF3FF] px-1.5 py-[1px] rounded-full flex-shrink-0 text-[12px]">
            {item.ticketNo}
          </span>
          <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.patientName}</p>
        </div>

        {/* Row 2: service */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <Stethoscope className="w-3 h-3 text-[#C9D0DB] flex-shrink-0" />
          <p className="text-xs text-[#4A4F55] truncate">{item.service}</p>
        </div>

        {/* Row 3: time + station + status */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[#8F9AA1] flex items-center gap-1 text-[12px]">
            <Clock className="w-3 h-3" />
            {item.arrivalTime}
          </span>
          {item.stationLabel && (
            <span className="text-[10px] text-[#4A4F55] flex items-center gap-1">
              <StationIcon type={item.stationType} />
              {item.stationLabel}
            </span>
          )}
          <NUStatusChip status={item.status} />
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
    </button>
  );
}

/* ── Tabs ── */
type TabKey = 'waiting-triage' | 'ready-for-clinician' | 'in-station';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'waiting-triage', label: 'Waiting for Triage' },
  { key: 'ready-for-clinician', label: 'Ready for Doctor' },
  { key: 'in-station', label: 'In Station' },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ── Main ── */

export function NUQueue() {
  const navigate = useNavigate();
  const { waitingTriage, readyForClinician, inStation, stats } = useNurseStore();
  const [activeTab, setActiveTab] = useState<TabKey>('waiting-triage');
  const [search, setSearch] = useState('');

  const today = new Date();
  const dateChip = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const tabData: Record<TabKey, NUQueueItem[]> = {
    'waiting-triage': waitingTriage,
    'ready-for-clinician': readyForClinician,
    'in-station': inStation,
  };

  const tabCounts: Record<TabKey, number> = {
    'waiting-triage': stats.waitingTriage,
    'ready-for-clinician': stats.readyForClinician,
    'in-station': stats.inStation,
  };

  const filtered = useMemo(() => {
    const items = tabData[activeTab];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.patientName.toLowerCase().includes(q) ||
        item.ticketNo.toLowerCase().includes(q) ||
        item.service.toLowerCase().includes(q)
    );
  }, [activeTab, waitingTriage, readyForClinician, inStation, search]);

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      {/* Top bar */}
      <AppTopBar
        title={`${getGreeting()}, Nurse Namutebi`}
        subtitle="Mukono Family Clinic • Nurse"
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
        <div className="bg-[#FFFFFF] border border-[#E5E8EC] mx-4 mt-3 rounded-2xl px-4 pt-3 pb-3 space-y-3">
          {/* Segmented control */}
          <div className="flex bg-[#F7F9FC] rounded-xl p-1 gap-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 px-1 rounded-lg text-xs font-semibold text-center transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#FFFFFF] text-[#1A1A1A] shadow-sm'
                    : 'text-[#8F9AA1] hover:text-[#4A4F55]'
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1 text-[10px] font-bold px-1.5 py-[1px] rounded-full ${
                    activeTab === tab.key
                      ? 'bg-[#56D8A8] text-white'
                      : 'bg-[#E5E8EC] text-[#8F9AA1]'
                  }`}
                >
                  {tabCounts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9D0DB]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ticket, or service..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#56D8A8]/30 focus:border-[#56D8A8] transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="p-4">
          {filtered.length > 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
              {filtered.map((item) => (
                <QueueRow
                  key={item.id}
                  item={item}
                  onClick={() => navigate(`/nu/triage/${item.id}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Inbox className="w-6 h-6 text-[#C9D0DB]" />}
              title="No patients"
              message={
                search.trim()
                  ? 'No results match your search.'
                  : 'No patients in this tab right now.'
              }
            />
          )}
        </div>
      </div>

      <NurseBottomNav />
    </div>
  );
}