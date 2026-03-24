/**
 * AccountantBottomNav — Bottom tab bar for the Accountant/Finance role.
 * Tabs: Overview, Transactions, Settlements, More
 */
import { LayoutDashboard, ArrowLeftRight, Landmark, MoreHorizontal } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useAccountantStore } from '../../data/accountantStore';

interface ACNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

export function AccountantBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { stats } = useAccountantStore();

  const navItems: ACNavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/ac/overview',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <ArrowLeftRight className="w-5 h-5" />,
      path: '/ac/transactions',
      badge: stats.pendingCount > 0 ? stats.pendingCount : undefined,
    },
    {
      id: 'settlements',
      label: 'Settlements',
      icon: <Landmark className="w-5 h-5" />,
      path: '/ac/settlements',
    },
    {
      id: 'more',
      label: 'More',
      icon: <MoreHorizontal className="w-5 h-5" />,
      path: '/ac/more',
    },
  ];

  const activeTab =
    navItems.find((i) => location.pathname.startsWith(i.path))?.id ?? 'overview';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-aba-neutral-0 border-t border-aba-neutral-200 z-40">
      <div className="flex items-center justify-around h-16 max-w-[390px] mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors relative ${
                isActive
                  ? 'text-aba-primary-main'
                  : 'text-aba-neutral-600'
              } hover:text-aba-primary-main active:text-aba-primary-100`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-aba-error-main text-white text-[10px] font-bold px-1 ring-2 ring-white">
                    {item.badge}
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