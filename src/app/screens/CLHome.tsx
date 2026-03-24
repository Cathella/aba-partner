/**
 * CL-01 Clinician Home — Optional dashboard with KPI cards and quick actions.
 */
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ClinicianBottomNav } from '../components/aba/ClinicianBottomNav';
import { KPICard, ListCard, ListCardItem } from '../components/aba/Cards';
import { ABABadge } from '../components/aba/ABABadge';
import { useClinicianStore } from '../data/clinicianStore';
import {
  Clock,
  Stethoscope,
  FlaskConical,
  CheckCircle2,
  ListOrdered,
  Search,
  Bell,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function CLHome() {
  const navigate = useNavigate();
  const { getQueueStats: stats } = useClinicianStore();

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const kpis = [
    {
      id: 'waiting',
      label: 'Assigned Waiting',
      value: stats.waiting,
      icon: Clock,
      trend: stats.waiting > 3 ? { value: 'High', positive: false } : undefined,
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      value: stats.inConsult,
      icon: Stethoscope,
    },
    {
      id: 'awaiting',
      label: 'Awaiting Results',
      value: stats.labPending,
      icon: FlaskConical,
    },
    {
      id: 'completed',
      label: 'Completed Today',
      value: stats.completed,
      icon: CheckCircle2,
      trend: stats.completed > 0 ? { value: `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%`, positive: true } : undefined,
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      {/* ── Top bar ── */}
      <AppTopBar
        title={`${getGreeting()}, Dr. Ssekandi`}
        subtitle={`${dateStr} • Clinician`}
        rightAction={
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-aba-neutral-100 transition-colors relative"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="w-5 h-5 text-aba-neutral-900" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-aba-error-main rounded-full" />
          </button>
        }
      />

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-6">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-3">
            {kpis.map((kpi) => {
              const IconComp = kpi.icon;
              return (
                <KPICard
                  key={kpi.id}
                  title={kpi.label}
                  value={kpi.value}
                  icon={<IconComp className="w-5 h-5" />}
                  trend={kpi.trend}
                  variant="dark"
                />
              );
            })}
          </div>

          {/* Quick Actions */}
          <div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: ListOrdered, label: 'View Queue', path: '/cl/queue', iconBg: 'bg-aba-primary-50', iconColor: 'text-aba-primary-main' },
                { icon: Search, label: 'Search Patient', path: '/cl/patients', iconBg: 'bg-aba-secondary-50', iconColor: 'text-aba-secondary-main' },
                { icon: ClipboardList, label: 'Today Summary', path: '/cl/today-summary', iconBg: 'bg-aba-neutral-100', iconColor: 'text-aba-neutral-600' },
              ].map((action) => {
                const IconComp = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center gap-2 py-4 bg-white rounded-2xl border border-aba-neutral-200 active:opacity-70 transition-opacity"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${action.iconBg} flex items-center justify-center`}>
                      <IconComp className={`w-5 h-5 ${action.iconColor}`} />
                    </div>
                    <span className="text-xs text-aba-neutral-700">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today's overview summary */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Today&apos;s Summary
              </h3>
              <ABABadge variant="default" size="sm">
                {stats.total} total
              </ABABadge>
            </div>
            <ListCard>
              <ListCardItem>
                <span className="text-sm text-aba-neutral-600 flex-1">Total patients</span>
                <span className="text-sm font-semibold text-aba-neutral-900">{stats.total}</span>
              </ListCardItem>
              <ListCardItem>
                <span className="text-sm text-aba-neutral-600 flex-1">Completion rate</span>
                <span className="text-sm font-semibold text-aba-success-main">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </span>
              </ListCardItem>
              <ListCardItem>
                <span className="text-sm text-aba-neutral-600 flex-1">Avg wait (est.)</span>
                <span className="text-sm font-semibold text-aba-neutral-900">~18 min</span>
              </ListCardItem>
            </ListCard>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <ClinicianBottomNav />
    </div>
  );
}