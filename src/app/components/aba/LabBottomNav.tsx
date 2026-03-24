/**
 * LabBottomNav — Bottom tab bar for the Lab Tech role.
 * Tabs: Worklist, Completed, More
 */
import { ClipboardList, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useLabTechStore } from '../../data/labTechStore';

interface LTNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badgeKey?: 'pending' | 'stat';
}

const navItems: LTNavItem[] = [
  {
    id: 'worklist',
    label: 'Worklist',
    icon: <ClipboardList className="w-5 h-5" />,
    path: '/lt/worklist',
    badgeKey: 'stat',
  },
  {
    id: 'completed',
    label: 'Completed',
    icon: <CheckCircle2 className="w-5 h-5" />,
    path: '/lt/completed',
  },
  {
    id: 'more',
    label: 'More',
    icon: <MoreHorizontal className="w-5 h-5" />,
    path: '/lt/more',
  },
];

export function LabBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { stats } = useLabTechStore();
  const statCount = stats.statOrders;

  const activeTab =
    navItems.find((i) => location.pathname.startsWith(i.path))?.id ?? 'worklist';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-40">
      <div className="flex items-center justify-around h-16 max-w-[390px] mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const showBadge = item.badgeKey === 'stat' && statCount > 0;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors relative ${
                isActive ? 'text-[#56D8A8]' : 'text-[#8F9AA1]'
              } hover:text-[#56D8A8] active:text-[#56D8A8]/70`}
            >
              <div className="relative">
                {item.icon}
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[#E44F4F] text-white text-[10px] font-bold px-1 ring-2 ring-white">
                    {statCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}