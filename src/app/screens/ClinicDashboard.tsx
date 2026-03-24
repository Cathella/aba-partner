import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { BottomNav } from '../components/aba/BottomNav';
import { ListCard, ListCardItem, KPICard } from '../components/aba/Cards';
import { ABAButton } from '../components/aba/ABAButton';
import { ABABadge } from '../components/aba/ABABadge';
import { 
  Calendar, 
  UserCheck, 
  CheckCircle, 
  XCircle,
  Bell,
  UserPlus,
  Plus,
  DollarSign,
  Clock,
} from 'lucide-react';

// Mock data for KPIs
const kpiData = [
  {
    label: "Today's Sessions",
    value: '12',
    subtitle: '3 upcoming',
    trend: {
      value: '8%',
      positive: true,
    },
    icon: Calendar,
  },
  {
    label: 'Checked-in',
    value: '18',
    subtitle: '2 pending',
    trend: {
      value: '5%',
      positive: true,
    },
    icon: UserCheck,
  },
  {
    label: 'Completed',
    value: '15',
    subtitle: '3 remaining',
    trend: {
      value: '12%',
      positive: true,
    },
    icon: CheckCircle,
  },
  {
    label: 'No-shows',
    value: '2',
    subtitle: 'vs 4 yesterday',
    trend: {
      value: '50%',
      positive: false,
    },
    icon: XCircle,
  },
];

// Mock data for alerts
const alerts = [
  { text: '3 pending settlements', badge: '3', type: 'warning' as const },
  { text: '2 staff invites pending', badge: '2', type: 'info' as const },
];

// Mock data for today's snapshot
const todayAppointments = [
  { time: '09:00 AM', service: 'Speech Therapy', patient: 'John Doe', status: 'completed' as const },
  { time: '10:30 AM', service: 'Occupational Therapy', patient: 'Sarah Smith', status: 'in-progress' as const },
  { time: '11:00 AM', service: 'Behavioral Assessment', patient: 'Mike Johnson', status: 'checked-in' as const },
  { time: '02:00 PM', service: 'Parent Consultation', patient: 'Emily Brown', status: 'scheduled' as const },
  { time: '03:30 PM', service: 'Follow-up Session', patient: 'David Lee', status: 'scheduled' as const },
];

const statusConfig = {
  completed: { label: 'Completed', variant: 'success' as const },
  'in-progress': { label: 'In Progress', variant: 'primary' as const },
  'checked-in': { label: 'Checked In', variant: 'info' as const },
  scheduled: { label: 'Scheduled', variant: 'default' as const },
};

export function ClinicDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Get current date
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'bookings':
        navigate('/bookings-list');
        return null;
      case 'finance':
        navigate('/finance-overview');
        return null;
      case 'reports':
        navigate('/reports-home');
        return null;
      case 'settings':
        navigate('/settings');
        return null;
      default:
        return <DashboardContent dateString={dateString} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Hi, Dr. Sarah"
        subtitle="Mukono Family Clinic • Facility Admin"
        rightAction={
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-aba-neutral-100 transition-colors"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="w-5 h-5 text-aba-neutral-900" />
          </button>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

function DashboardContent({ dateString }: { dateString: string }) {
  const navigate = useNavigate();
  
  return (
    <div className="p-4 space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {kpiData.map((kpi) => {
          const IconComponent = kpi.icon;
          return (
            <KPICard
              key={kpi.label}
              title={kpi.label}
              value={kpi.value}
              icon={<IconComponent className="w-5 h-5" />}
              subtitle={kpi.subtitle}
              trend={kpi.trend}
              variant="dark"
            />
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: UserPlus, label: 'Add Staff', path: '/invite-staff', iconBg: 'bg-aba-primary-50', iconColor: 'text-aba-primary-main' },
            { icon: Plus, label: 'Add Service', path: '/add-service', iconBg: 'bg-aba-secondary-50', iconColor: 'text-aba-secondary-main' },
            { icon: DollarSign, label: 'Settlements', path: '/settlement-ledger', iconBg: 'bg-aba-neutral-100', iconColor: 'text-aba-neutral-600' },
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

      {/* Today's Snapshot */}
      <div>
        <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
          Today's Snapshot
        </h3>
        <ListCard>
          {todayAppointments.map((appointment, index) => (
            <ListCardItem key={index} onClick={() => {}}>
              <div className="flex-shrink-0 text-center">
                <div className="text-sm font-semibold text-[#8F9AA1]">
                  {appointment.time.split(' ')[0]}
                </div>
                <div className="text-xs text-aba-neutral-600">
                  {appointment.time.split(' ')[1]}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-aba-neutral-900">
                  {appointment.service}
                </p>
                <p className="text-xs text-aba-neutral-600">
                  {appointment.patient}
                </p>
              </div>
              <ABABadge variant={statusConfig[appointment.status].variant} size="sm">
                {statusConfig[appointment.status].label}
              </ABABadge>
            </ListCardItem>
          ))}
        </ListCard>
      </div>

      {/* Bottom Padding */}
      <div className="h-4"></div>
    </div>
  );
}