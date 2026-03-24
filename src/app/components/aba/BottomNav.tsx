import { LayoutDashboard, Users, BarChart3, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems: BottomNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/clinic-dashboard' },
  { id: 'staff', label: 'Staff', icon: <Users className="w-5 h-5" />, path: '/staff-list' },
  { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" />, path: '/reports-home' },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const navigate = useNavigate();
  
  const handleTabClick = (item: BottomNavItem) => {
    onTabChange(item.id);
    navigate(item.path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-aba-neutral-0 border-t border-aba-neutral-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-[390px] mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive ? 'text-aba-primary-main' : 'text-aba-neutral-600'
              } hover:text-aba-primary-main active:text-aba-primary-100`}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}