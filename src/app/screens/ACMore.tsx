/**
 * Accountant "More" menu.
 *
 * Items (in order):
 *   • Reports & Exports → AC-09
 *   • Today Summary
 *   • Help Center
 *   • Privacy Policy
 *   • Profile
 *   • Sign Out
 *
 * Main navigation page with bottom nav.
 */
import { useNavigate } from 'react-router';
import { AccountantBottomNav } from '../components/aba/AccountantBottomNav';
import { ListCard } from '../components/aba/Cards';
import { useAccountantStore, formatUGX } from '../data/accountantStore';
import {
  User,
  BarChart3,
  FileBarChart2,
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

export function ACMore() {
  const navigate = useNavigate();
  const { stats } = useAccountantStore();

  const mainItems: MenuItem[] = [
    {
      id: 'reports-exports',
      label: 'Reports & Exports',
      subtitle: 'Daily collections, reconciliation, settlements',
      icon: <FileBarChart2 className="w-5 h-5 text-[#3A8DFF]" />,
      iconBg: 'bg-[#E8F2FF]',
      path: '/ac/reports-exports',
    },
    {
      id: 'daily-summary',
      label: 'Today Summary',
      subtitle: `Today: ${formatUGX(stats.todayRevenue)} revenue`,
      icon: <BarChart3 className="w-5 h-5 text-[#32C28A]" />,
      iconBg: 'bg-[#E9F8F0]',
      path: '/ac/daily-summary',
    },
  ];

  const supportItems: MenuItem[] = [
    {
      id: 'help',
      label: 'Help Center',
      subtitle: 'FAQs, support tickets, contact us',
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

  const profileItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'My Profile',
      subtitle: 'Accountant Byaruhanga — Finance',
      icon: <User className="w-5 h-5 text-[#3A8DFF]" />,
      iconBg: 'bg-[#E8F2FF]',
      path: '/profile-settings',
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
            <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.label}</p>
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
      <div className="bg-[#FFFFFF] border-b border-[#E5E8EC] px-4 h-14 flex items-center flex-shrink-0">
        <h1 className="text-lg font-semibold text-[#1A1A1A]">More</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {/* Reports & Today Summary */}
          {renderSection(mainItems)}

          {/* Support */}
          <div>
            <p className="text-xs font-medium text-[#8F9AA1] mb-2 px-1 uppercase tracking-wide">
              Support
            </p>
            {renderSection(supportItems)}
          </div>

          {/* Profile */}
          <div>
            <p className="text-xs font-medium text-[#8F9AA1] mb-2 px-1 uppercase tracking-wide">
              Account
            </p>
            {renderSection(profileItems)}
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
            ABA Partner v1.0.0 &middot; Finance
          </p>
        </div>
      </div>

      <AccountantBottomNav />
    </div>
  );
}
