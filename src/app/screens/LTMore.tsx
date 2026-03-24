/**
 * LT-06 More — Lab Tech "More" menu.
 * Quick links: QC Log, Profile, Settings, Sign Out.
 * Main navigation tab (More). Shows LabBottomNav.
 */
import { useNavigate } from 'react-router';
import { LabBottomNav } from '../components/aba/LabBottomNav';
import { ListCard } from '../components/aba/Cards';
import { useLabTechStore } from '../data/labTechStore';
import {
  User,
  Shield,
  Bell,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Beaker,
  BarChart3,
  FlaskConical,
  ClipboardList,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  path?: string;
}

export function LTMore() {
  const navigate = useNavigate();
  const { stats } = useLabTechStore();

  const profileItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'My Profile',
      subtitle: 'Lab Tech Mukasa — Laboratory',
      icon: <User className="w-5 h-5 text-[#3A8DFF]" />,
      iconBg: 'bg-[#EBF3FF]',
      path: '/profile-settings',
    },
  ];

  const labItems: MenuItem[] = [
    {
      id: 'qc-log',
      label: 'QC Log',
      subtitle: 'Quality control records & instrument checks',
      icon: <Beaker className="w-5 h-5 text-[#8B5CF6]" />,
      iconBg: 'bg-[#F5F3FF]',
      path: '/lt/qc-log',
    },
    {
      id: 'stats',
      label: "Today's Summary",
      subtitle: `${stats.completed} completed, ${stats.pendingCollection + stats.inProgress} active`,
      icon: <BarChart3 className="w-5 h-5 text-[#32C28A]" />,
      iconBg: 'bg-[#E9F8F0]',
      path: '/lt/today-summary',
    },
    {
      id: 'worksheet',
      label: 'Lab Worksheet',
      subtitle: 'Printable worklist for bench use',
      icon: <ClipboardList className="w-5 h-5 text-[#3A8DFF]" />,
      iconBg: 'bg-[#EBF3FF]',
      path: '/lt/lab-worksheet',
    },
  ];

  const settingsItems: MenuItem[] = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5 text-[#4A4F55]" />,
      iconBg: 'bg-[#F7F9FC]',
      path: '/notification-settings',
    },
    {
      id: 'security',
      label: 'Security & PIN',
      icon: <Shield className="w-5 h-5 text-[#4A4F55]" />,
      iconBg: 'bg-[#F7F9FC]',
      path: '/security-and-pin',
    },
    {
      id: 'help',
      label: 'Help Center',
      icon: <HelpCircle className="w-5 h-5 text-[#4A4F55]" />,
      iconBg: 'bg-[#F7F9FC]',
      path: '/help-center',
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      icon: <FileText className="w-5 h-5 text-[#4A4F55]" />,
      iconBg: 'bg-[#F7F9FC]',
      path: '/privacy-policy',
    },
  ];

  const renderSection = (items: MenuItem[]) => (
    <ListCard>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => item.path && navigate(item.path)}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC] transition-colors text-left"
        >
          <div
            className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}
          >
            {item.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1A1A1A] truncate">
              {item.label}
            </p>
            {item.subtitle && (
              <p className="text-xs text-[#8F9AA1] truncate">{item.subtitle}</p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
        </button>
      ))}
    </ListCard>
  );

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      {/* Top bar */}
      <div className="bg-[#FFFFFF] border-b border-[#E5E8EC] px-4 h-14 flex items-center">
        <h1 className="text-lg font-semibold text-[#1A1A1A]">More</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {/* Profile */}
          {renderSection(profileItems)}

          {/* Lab Tools */}
          <div>
            <p className="text-xs font-medium text-[#8F9AA1] mb-2 px-1 uppercase tracking-wide">
              Lab Tools
            </p>
            {renderSection(labItems)}
          </div>

          {/* Settings */}
          <div>
            <p className="text-xs font-medium text-[#8F9AA1] mb-2 px-1 uppercase tracking-wide">
              Settings
            </p>
            {renderSection(settingsItems)}
          </div>

          {/* Sign Out */}
          <button
            onClick={() => navigate('/role-router')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#FDECEC] hover:bg-[#FBD9D9] active:bg-[#F9C5C5] transition-colors"
          >
            <LogOut className="w-5 h-5 text-[#E44F4F]" />
            <span className="text-sm font-medium text-[#E44F4F]">Sign Out</span>
          </button>

          {/* Version */}
          <p className="text-center text-xs text-[#8F9AA1] pt-2">
            ABA Partner v1.0.0 &middot; Lab Tech
          </p>
        </div>
      </div>

      <LabBottomNav />
    </div>
  );
}