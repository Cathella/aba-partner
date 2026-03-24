import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ReceptionistBottomNav } from '../components/aba/ReceptionistBottomNav';
import { KPICard, ListCard, ListCardItem } from '../components/aba/Cards';
import { ABABadge } from '../components/aba/ABABadge';
import { showToast } from '../components/aba/Toast';
import {
  Bell,
  UserCheck,
  Clock,
  Users,
  CalendarCheck,
  ChevronRight,
  CreditCard,
  UserPlus,
} from 'lucide-react';

// Mock data
const todayStats = [
  {
    label: 'Checked In',
    value: '8',
    subtitle: '3 waiting',
    icon: UserCheck,
    trend: { value: '12%', positive: true },
  },
  {
    label: 'In Queue',
    value: '5',
    subtitle: 'avg 12 min wait',
    icon: Clock,
  },
  {
    label: 'Scheduled',
    value: '22',
    subtitle: '14 remaining',
    icon: CalendarCheck,
    trend: { value: '8%', positive: true },
  },
  {
    label: 'Walk-ins',
    value: '3',
    subtitle: 'today',
    icon: Users,
  },
];

const upcomingAppointments = [
  {
    time: '10:30 AM',
    patient: 'Jane Nakamya',
    service: 'Speech Therapy',
    status: 'checked-in' as const,
  },
  {
    time: '11:00 AM',
    patient: 'Moses Okello',
    service: 'Occupational Therapy',
    status: 'scheduled' as const,
  },
  {
    time: '11:30 AM',
    patient: 'Grace Atim',
    service: 'Behavioral Assessment',
    status: 'scheduled' as const,
  },
  {
    time: '12:00 PM',
    patient: 'David Ssemwogerere',
    service: 'Follow-up Session',
    status: 'scheduled' as const,
  },
  {
    time: '01:30 PM',
    patient: 'Amina Nambi',
    service: 'Parent Consultation',
    status: 'scheduled' as const,
  },
];

const queueItems = [
  { position: 1, patient: 'Jane Nakamya', waitTime: '5 min', service: 'Speech Therapy' },
  { position: 2, patient: 'Peter Ochieng', waitTime: '12 min', service: 'OT Session' },
  { position: 3, patient: 'Ruth Amongi', waitTime: '18 min', service: 'Assessment' },
];

const statusConfig = {
  'checked-in': { label: 'Checked In', variant: 'success' as const },
  scheduled: { label: 'Scheduled', variant: 'default' as const },
};

export function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-6">
          {/* KPI Cards */}
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

          {/* Quick Actions */}
          <div>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: UserCheck, label: 'Walk-in', path: '/r/walk-in', iconBg: 'bg-aba-primary-50', iconColor: 'text-aba-primary-main' },
                { icon: CreditCard, label: 'Payment', path: '/r/payments', iconBg: 'bg-aba-secondary-50', iconColor: 'text-aba-secondary-main' },
                { icon: UserPlus, label: 'Add Patient', path: '/r/add-patient', iconBg: 'bg-aba-neutral-100', iconColor: 'text-aba-neutral-600' },
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

          {/* Current Queue Snapshot */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Current Queue
              </h3>
              <ABABadge variant="info" size="sm">
                {queueItems.length} in queue
              </ABABadge>
            </div>
            <ListCard>
              {queueItems.map((item) => (
                <ListCardItem
                  key={item.position}
                  onClick={() =>
                    showToast(`Viewing ${item.patient}'s details`, 'info')
                  }
                >
                  <div className="w-10 h-10 rounded-full bg-aba-primary-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-aba-primary-main text-[#1a1a1a]">
                      #{item.position}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-aba-neutral-900">
                      {item.patient}
                    </p>
                    <p className="text-xs text-aba-neutral-600">
                      {item.service} &bull; waiting {item.waitTime}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-aba-neutral-400 flex-shrink-0" />
                </ListCardItem>
              ))}
            </ListCard>
          </div>

          {/* Upcoming Appointments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Upcoming Appointments
              </h3>
              <ABABadge variant="default" size="sm">
                {upcomingAppointments.length} total
              </ABABadge>
            </div>
            <ListCard>
              {upcomingAppointments.map((appt, index) => (
                <ListCardItem
                  key={index}
                  onClick={() =>
                    showToast(
                      `Check in ${appt.patient} for ${appt.service}`,
                      'info'
                    )
                  }
                >
                  <div className="flex-shrink-0 text-center w-14">
                    <div className="text-sm font-semibold text-[#8F9AA1]">
                      {appt.time.split(' ')[0]}
                    </div>
                    <div className="text-xs text-aba-neutral-600">
                      {appt.time.split(' ')[1]}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-aba-neutral-900">
                      {appt.patient}
                    </p>
                    <p className="text-xs text-aba-neutral-600">
                      {appt.service}
                    </p>
                  </div>
                  <ABABadge
                    variant={statusConfig[appt.status].variant}
                    size="sm"
                  >
                    {statusConfig[appt.status].label}
                  </ABABadge>
                </ListCardItem>
              ))}
            </ListCard>
          </div>

          {/* Bottom Padding */}
          <div className="h-4" />
        </div>
      </div>

      {/* Bottom Nav */}
      <ReceptionistBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}