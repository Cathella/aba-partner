/**
 * CL-02 My Queue — Clinician's primary landing screen.
 * Tabs: "Assigned to Me" / "All". Search bar. Queue item cards with
 * ticket no., patient name, service, wait time, status chip.
 * Tapping an item opens CL-03 Visit Summary.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ClinicianBottomNav } from '../components/aba/ClinicianBottomNav';
import { CLStatusChip } from '../components/aba/CLStatusChip';
import { SearchHeader } from '../components/aba/SearchHeader';
import { KPICard } from '../components/aba/Cards';
import { ABABadge } from '../components/aba/ABABadge';
import { EmptyState } from '../components/aba/EmptyState';
import {
  Bell,
  Clock,
  Stethoscope,
  FlaskConical,
  CheckCircle2,
  ChevronRight,
  Users,
  Shield,
  Inbox,
} from 'lucide-react';
import { useClinicianStore, type CLVisitStatus, type CLQueueItem } from '../data/clinicianStore';

type QueueTab = 'mine' | 'all';

/** Mock: the signed-in clinician is always dr-ssekandi */
const CURRENT_CLINICIAN = 'dr-ssekandi';

/** Compute a human-friendly wait time from a checkedInAt timestamp string */
function computeWaitTime(checkedInAt?: string): string {
  if (!checkedInAt) return '—';
  // Parse "09:22 AM"-style string
  const match = checkedInAt.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '—';
  let hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  const checkIn = new Date();
  checkIn.setHours(hours, mins, 0, 0);
  const now = new Date();
  const diff = Math.max(0, Math.floor((now.getTime() - checkIn.getTime()) / 60000));
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff} min`;
  return `${Math.floor(diff / 60)}h ${diff % 60}m`;
}

export function CLQueue() {
  const navigate = useNavigate();
  const { queue, getQueueStats: stats } = useClinicianStore();

  const [activeTab, setActiveTab] = useState<QueueTab>('mine');
  const [search, setSearch] = useState('');

  const today = new Date();
  const dateChip = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  /* ── Filter logic ── */
  const filtered = useMemo(() => {
    let list: CLQueueItem[] = queue;

    // Tab filter
    if (activeTab === 'mine') {
      list = list.filter((v) => v.assignedTo === CURRENT_CLINICIAN);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.patientName.toLowerCase().includes(q) ||
          v.ticket.toLowerCase().includes(q) ||
          v.service.toLowerCase().includes(q)
      );
    }

    return list;
  }, [queue, activeTab, search]);

  /* ── Sort: in-consultation → waiting → lab → completed → no-show ── */
  const statusOrder: Record<CLVisitStatus, number> = {
    'in-consultation': 0,
    waiting: 1,
    'lab-pending': 2,
    'lab-results': 2,
    completed: 3,
    transferred: 3,
    'no-show': 4,
  };
  const sorted = [...filtered].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  const mineCount = queue.filter((v) => v.assignedTo === CURRENT_CLINICIAN).length;

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      {/* ── Top bar ── */}
      <AppTopBar
        title="My Queue"
        rightAction={
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-aba-primary-50 text-xs font-semibold text-aba-neutral-900 border border-aba-primary-main/15">
              {dateChip}
            </span>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-aba-neutral-100 transition-colors relative"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="w-[18px] h-[18px] text-aba-neutral-900" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-aba-error-main rounded-full ring-2 ring-white" />
            </button>
          </div>
        }
      />

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* KPI Row */}
        <div className="px-4 pt-4 pb-1">
          <div className="grid grid-cols-2 gap-3">
            <KPICard
              title="Assigned Waiting"
              value={stats.waiting}
              icon={<Clock className="w-5 h-5" />}
              trend={stats.waiting > 3 ? { value: 'High', positive: false } : undefined}
              variant="dark"
            />
            <KPICard
              title="In Progress"
              value={stats.inConsult}
              icon={<Stethoscope className="w-5 h-5" />}
              variant="dark"
            />
            <KPICard
              title="Awaiting Results"
              value={stats.labPending}
              icon={<FlaskConical className="w-5 h-5" />}
              variant="dark"
            />
            <KPICard
              title="Completed Today"
              value={stats.completed}
              icon={<CheckCircle2 className="w-5 h-5" />}
              trend={stats.completed > 0 ? { value: `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%`, positive: true } : undefined}
              variant="dark"
            />
          </div>
        </div>

        {/* Tabs: Assigned to Me / All */}
        <div className="px-4 pt-4 pb-1 flex gap-2">
          <button
            onClick={() => setActiveTab('mine')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'mine'
                ? 'bg-aba-neutral-900 text-aba-neutral-0'
                : 'bg-aba-neutral-0 text-aba-neutral-700 border border-aba-neutral-200'
            }`}
          >
            Assigned to Me
            <span className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-1 text-[10px] font-bold ${
              activeTab === 'mine'
                ? 'bg-aba-neutral-0/20 text-aba-neutral-0'
                : 'bg-aba-neutral-200 text-aba-neutral-700'
            }`}>
              {mineCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-aba-neutral-900 text-aba-neutral-0'
                : 'bg-aba-neutral-0 text-aba-neutral-700 border border-aba-neutral-200'
            }`}
          >
            All
            <span className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-1 text-[10px] font-bold ${
              activeTab === 'all'
                ? 'bg-aba-neutral-0/20 text-aba-neutral-0'
                : 'bg-aba-neutral-200 text-aba-neutral-700'
            }`}>
              {queue.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <SearchHeader
          value={search}
          onChange={setSearch}
          placeholder="Search name, ticket, service…"
        />

        {/* Queue List */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-aba-neutral-900">
              Patients
            </h3>
            <ABABadge variant="info" size="sm">
              {sorted.length} patient{sorted.length !== 1 ? 's' : ''}
            </ABABadge>
          </div>

          {sorted.length === 0 ? (
            <EmptyState
              icon={<Inbox className="w-10 h-10" />}
              title="No patients"
              message={search ? 'No results for your search.' : 'No patients match this filter.'}
            />
          ) : (
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
              {sorted.map((v) => (
                <button
                  key={v.id}
                  onClick={() => navigate(`/cl/visit/${v.id}`)}
                  className="w-full flex items-start gap-3 px-4 py-3.5 border-b border-aba-neutral-200 last:border-b-0 hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors text-left"
                >
                  {/* Left: ticket badge */}
                  <div className="w-10 h-10 rounded-xl bg-aba-neutral-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-aba-neutral-700">{v.ticket}</span>
                  </div>

                  {/* Center: info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium text-aba-neutral-900 truncate">
                        {v.patientName}
                      </p>
                      {v.isMember && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-aba-primary-main bg-aba-primary-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          <Shield className="w-2.5 h-2.5" />
                          MEMBER
                        </span>
                      )}
                      {v.type === 'walk-in' && (
                        <span className="text-[10px] font-semibold text-[#8B5CF6] bg-[#F5F3FF] px-1.5 py-0.5 rounded-full flex-shrink-0">
                          WALK-IN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-aba-neutral-600 mt-0.5 truncate">
                      {v.service}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-aba-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {computeWaitTime(v.checkedInAt)}
                      </span>
                      {v.room && (
                        <span className="text-[11px] text-aba-neutral-500">
                          &middot; {v.room}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: status + chevron */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0 pt-0.5">
                    <CLStatusChip status={v.status} />
                    <ChevronRight className="w-4 h-4 text-aba-neutral-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <ClinicianBottomNav />
    </div>
  );
}