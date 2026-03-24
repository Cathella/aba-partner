import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ReceptionistBottomNav } from '../components/aba/ReceptionistBottomNav';
import { KPICard, ListCard } from '../components/aba/Cards';
import { StatusChip, type VisitStatus } from '../components/aba/StatusChip';
import {
  Bell,
  UserCheck,
  Clock,
  CalendarCheck,
  CreditCard,
  UserPlus,
  ClipboardCheck,
  AlertTriangle,
  ChevronRight,
  CalendarPlus,
} from 'lucide-react';

/* ─────────── mock data ─────────── */

interface Arrival {
  id: string;
  time: string;
  patient: string;
  service: string;
  status: VisitStatus;
  type: 'appointment' | 'walk-in';
}

const arrivals: Arrival[] = [
  { id: 'sch-01', time: '08:30 AM', patient: 'David Ssemwogerere', service: 'Speech Therapy', status: 'completed', type: 'appointment' },
  { id: 'sch-02', time: '09:00 AM', patient: 'Jane Nakamya', service: 'Speech Therapy', status: 'checked-in', type: 'appointment' },
  { id: 'sch-03', time: '09:30 AM', patient: 'Peter Ochieng', service: 'OT Session', status: 'in-consultation', type: 'appointment' },
  { id: 'sch-04', time: '10:00 AM', patient: 'Ruth Amongi', service: 'Assessment', status: 'waiting', type: 'appointment' },
  { id: 'sch-05', time: '10:15 AM', patient: 'Grace Atim', service: 'Parent Consult', status: 'arrived', type: 'walk-in' },
  { id: 'sch-06', time: '10:30 AM', patient: 'Moses Okello', service: 'Follow-up', status: 'confirmed', type: 'appointment' },
];

const alerts = [
  { text: '2 pending no-shows need confirmation', variant: 'warning' as const },
  { text: '1 payment still pending from morning', variant: 'error' as const },
];

const todayStats = [
  {
    label: 'Today Bookings',
    value: '24',
    subtitle: '4 walk-ins',
    icon: CalendarCheck,
    trend: undefined,
  },
  {
    label: 'Checked In',
    value: '8',
    subtitle: '+3 vs yesterday',
    icon: UserCheck,
    trend: { value: '12%', positive: true },
  },
  {
    label: 'In Queue',
    value: '5',
    subtitle: 'avg 12 min wait',
    icon: Clock,
    trend: undefined,
  },
  {
    label: 'Unpaid',
    value: '3',
    subtitle: 'UGX 210K owing',
    icon: CreditCard,
    trend: undefined,
  },
];

/* ─────────── component ─────────── */

export function RToday() {
  const navigate = useNavigate();

  const handleArrivalTap = (a: Arrival) => {
    navigate(`/r/schedule/${a.id}`);
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* ── Top bar ── */}
      <AppTopBar
        title="Hi, Grace"
        subtitle="Mukono Family Clinic • Receptionist"
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
        <div className="p-4 space-y-5">

          {/* ── KPI Cards 2×2 ── */}
          <div className="grid grid-cols-2 gap-3">
            {todayStats.map((stat) => {
              const IconComp = stat.icon;
              return (
                <KPICard
                  key={stat.label}
                  title={stat.label}
                  value={stat.value}
                  icon={<IconComp className="w-5 h-5" />}
                  subtitle={stat.subtitle}
                  trend={stat.trend}
                  variant="dark"
                />
              );
            })}
          </div>

          {/* ── Quick Actions ── */}
          <div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: UserPlus, label: 'Walk-in', path: '/r/walk-in', iconBg: 'bg-aba-primary-50', iconColor: 'text-aba-primary-main' },
                { icon: ClipboardCheck, label: 'Check-in', path: '/r/schedule', iconBg: 'bg-aba-secondary-50', iconColor: 'text-aba-secondary-main' },
                { icon: CreditCard, label: 'Payment', path: '/r/payments', iconBg: 'bg-aba-neutral-100', iconColor: 'text-aba-neutral-600' },
                { icon: CalendarPlus, label: 'Booking', path: '/r/bookings', iconBg: 'bg-aba-neutral-100', iconColor: 'text-aba-neutral-600' },
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

          {/* ── Arrivals Today ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Arrivals Today
              </h3>
              <span className="text-xs font-medium text-aba-neutral-600">
                {arrivals.length} patients
              </span>
            </div>

            <ListCard>
              {arrivals.map((a) => (
                <button
                  key={a.id}
                  onClick={() => handleArrivalTap(a)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-aba-neutral-200 last:border-b-0 hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors text-left"
                >
                  {/* Time column */}
                  <div className="w-[44px] flex-shrink-0 text-center">
                    <span className="text-sm font-semibold text-[#8F9AA1] block leading-tight">
                      {a.time.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-aba-neutral-600 block leading-tight">
                      {a.time.split(' ')[1]}
                    </span>
                  </div>

                  {/* Divider dot */}
                  <div className="w-1.5 h-1.5 rounded-full bg-aba-neutral-400 flex-shrink-0" />

                  {/* Patient + service */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-aba-neutral-900 truncate">
                      {a.patient}
                      {a.type === 'walk-in' && (
                        <span className="ml-1.5 text-[10px] font-semibold text-aba-neutral-700 bg-aba-neutral-100 px-1.5 py-0.5 rounded-full">
                          WALK-IN
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-aba-neutral-600 truncate">
                      {a.service}
                    </p>
                  </div>

                  {/* Status + chevron */}
                  <StatusChip status={a.status} />
                  <ChevronRight className="w-4 h-4 text-aba-neutral-400 flex-shrink-0" />
                </button>
              ))}
            </ListCard>
          </div>

          {/* ── Quick Alerts ── */}
          <div>
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
              Quick Alerts
            </h3>
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
              {alerts.map((alert, i) => (
                <button
                  key={i}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors ${
                    i < alerts.length - 1
                      ? 'border-b border-aba-neutral-200'
                      : ''
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 flex-shrink-0 ${
                      alert.variant === 'error'
                        ? 'text-aba-error-main'
                        : 'text-aba-warning-main'
                    }`}
                  />
                  <p className="flex-1 text-sm text-aba-neutral-900">
                    {alert.text}
                  </p>
                  <ChevronRight className="w-4 h-4 text-aba-neutral-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* bottom spacing */}
          <div className="h-2" />
        </div>
      </div>

      {/* ── Bottom Nav ── */}
      <ReceptionistBottomNav />
    </div>
  );
}
