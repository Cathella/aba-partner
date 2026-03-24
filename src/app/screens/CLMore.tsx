/**
 * CL-10 More — Clinician "More" menu with quick links, stats, settings.
 * Main navigation tab (More).
 */
import { useNavigate } from 'react-router';
import { ClinicianBottomNav } from '../components/aba/ClinicianBottomNav';
import { ListCard } from '../components/aba/Cards';
import { useClinicianStore } from '../data/clinicianStore';
import {
  User,
  BarChart3,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Shield,
  Bell,
  Calendar,
  LayoutDashboard,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  path?: string;
  destructive?: boolean;
}

export function CLMore() {
  const navigate = useNavigate();
  const { getQueueStats } = useClinicianStore();
  const stats = getQueueStats;

  const profileItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'My Profile',
      subtitle: 'Dr. Ssekandi — Doctor',
      icon: <User className="w-5 h-5 text-aba-secondary-main" />,
      iconBg: 'bg-aba-secondary-50',
      path: '/profile-settings',
    },
  ];

  const mainItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Home Dashboard',
      subtitle: 'KPIs, quick actions, daily overview',
      icon: <LayoutDashboard className="w-5 h-5 text-aba-secondary-main" />,
      iconBg: 'bg-aba-secondary-50',
      path: '/cl/dashboard',
    },
    {
      id: 'schedule',
      label: 'My Schedule',
      subtitle: 'View your upcoming appointments',
      icon: <Calendar className="w-5 h-5 text-aba-primary-main" />,
      iconBg: 'bg-aba-primary-50',
      path: '/cl/schedule',
    },
    {
      id: 'stats',
      label: 'Today\'s Summary',
      subtitle: `${stats.completed} completed, ${stats.waiting} waiting`,
      icon: <BarChart3 className="w-5 h-5 text-[#8B5CF6]" />,
      iconBg: 'bg-[#F5F3FF]',
      path: '/cl/today-summary',
    },
    {
      id: 'templates',
      label: 'Note Templates',
      subtitle: 'SOAP templates & quick phrases',
      icon: <FileText className="w-5 h-5 text-[#F59E0B]" />,
      iconBg: 'bg-[#FFFBEB]',
      path: '/cl/note-templates',
    },
  ];

  const settingsItems: MenuItem[] = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5 text-aba-neutral-700" />,
      iconBg: 'bg-aba-neutral-100',
      path: '/notification-settings',
    },
    {
      id: 'security',
      label: 'Security & PIN',
      icon: <Shield className="w-5 h-5 text-aba-neutral-700" />,
      iconBg: 'bg-aba-neutral-100',
      path: '/security-and-pin',
    },
    {
      id: 'help',
      label: 'Help Center',
      icon: <HelpCircle className="w-5 h-5 text-aba-neutral-700" />,
      iconBg: 'bg-aba-neutral-100',
      path: '/help-center',
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      icon: <FileText className="w-5 h-5 text-aba-neutral-700" />,
      iconBg: 'bg-aba-neutral-100',
      path: '/privacy-policy',
    },
  ];

  const logoutItem: MenuItem = {
    id: 'logout',
    label: 'Sign Out',
    icon: <LogOut className="w-5 h-5 text-aba-error-main" />,
    iconBg: 'bg-aba-error-50',
    path: '/role-router',
    destructive: true,
  };

  const renderSection = (items: MenuItem[]) => (
    <ListCard>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => item.path && navigate(item.path)}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-aba-neutral-200 last:border-b-0 hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors text-left"
        >
          <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
            {item.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${item.destructive ? 'text-aba-error-main' : 'text-aba-neutral-900'}`}>
              {item.label}
            </p>
            {item.subtitle && (
              <p className="text-xs text-aba-neutral-600 truncate">{item.subtitle}</p>
            )}
          </div>
          <ChevronRight className={`w-4 h-4 flex-shrink-0 ${item.destructive ? 'text-aba-error-main/40' : 'text-aba-neutral-400'}`} />
        </button>
      ))}
    </ListCard>
  );

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      {/* Top bar */}
      <div className="bg-aba-neutral-0 border-b border-aba-neutral-200 px-4 h-14 flex items-center">
        <h1 className="text-lg font-semibold text-aba-neutral-900">More</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {/* Profile */}
          {renderSection(profileItems)}

          {/* Doctor tools */}
          <div>
            <p className="text-xs font-medium text-aba-neutral-600 mb-2 px-1 uppercase tracking-wide">
              Doctor Tools
            </p>
            {renderSection(mainItems)}
          </div>

          {/* Settings */}
          <div>
            <p className="text-xs font-medium text-aba-neutral-600 mb-2 px-1 uppercase tracking-wide">
              Settings
            </p>
            {renderSection(settingsItems)}
          </div>

          {/* Logout */}
          <button
            onClick={() => navigate('/role-router')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-aba-error-50 hover:bg-aba-error-100/60 active:bg-aba-error-100 transition-colors"
          >
            <LogOut className="w-5 h-5 text-aba-error-main" />
            <span className="text-sm font-medium text-aba-error-main">Sign Out</span>
          </button>

          {/* Version */}
          <p className="text-center text-xs text-aba-neutral-600 pt-2">
            ABA Partner v1.0.0 &middot; Doctor
          </p>
        </div>
      </div>

      <ClinicianBottomNav />
    </div>
  );
}