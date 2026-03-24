/**
 * NU More — Nurse "More" menu.
 * Items: Home Dashboard, Today Summary, Help Center, Privacy Policy, Profile.
 * Bottom nav present.
 */
import { useNavigate } from 'react-router';
import { NurseBottomNav } from '../components/aba/NurseBottomNav';
import { ListCard } from '../components/aba/Cards';
import { useNurseStore } from '../data/nurseStore';
import {
  User,
  BarChart3,
  LayoutDashboard,
  HelpCircle,
  FileText,
  ChevronRight,
  LogOut,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  path?: string;
}

export function NUMore() {
  const navigate = useNavigate();
  const { stats } = useNurseStore();

  const profileItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'My Profile',
      subtitle: 'Nurse Nambi — Nursing',
      icon: <User className="w-5 h-5 text-[#3A8DFF]" />,
      iconBg: 'bg-[#EBF3FF]',
      path: '/profile-settings',
    },
  ];

  const toolItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Home Dashboard',
      subtitle: 'Overview of clinic activity',
      icon: <LayoutDashboard className="w-5 h-5 text-[#8B5CF6]" />,
      iconBg: 'bg-[#F5F3FF]',
      path: '/nu/queue',
    },
    {
      id: 'summary',
      label: 'Today Summary',
      subtitle: `${stats.waitingTriage} waiting, ${stats.readyForClinician} ready, ${stats.inStation} in station`,
      icon: <BarChart3 className="w-5 h-5 text-[#32C28A]" />,
      iconBg: 'bg-[#E9F8F0]',
      path: '/nu/today-summary',
    },
  ];

  const settingsItems: MenuItem[] = [
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

          {/* Nurse Tools */}
          <div>
            <p className="text-xs font-medium text-[#8F9AA1] mb-2 px-1 uppercase tracking-wide">
              Nurse Tools
            </p>
            {renderSection(toolItems)}
          </div>

          {/* Info */}
          <div>
            <p className="text-xs font-medium text-[#8F9AA1] mb-2 px-1 uppercase tracking-wide">
              Info & Support
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
            ABA Partner v1.0.0 · Nursing
          </p>
        </div>
      </div>

      <NurseBottomNav />
    </div>
  );
}
