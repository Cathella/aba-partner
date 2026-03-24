/**
 * PharmacyBottomNav — Bottom tab bar for the Pharmacist role.
 * Tabs: Queue, Completed, Inventory, More
 */
import { ClipboardList, CheckCircle2, MoreHorizontal, Package } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { usePharmacistStore } from '../../data/pharmacistStore';
import { usePharmacyInventoryStore } from '../../data/pharmacyInventoryStore';

interface PHNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badgeKey?: 'stat' | 'new' | 'inventory-alert';
}

const navItems: PHNavItem[] = [
  {
    id: 'queue',
    label: 'Queue',
    icon: <ClipboardList className="w-5 h-5" />,
    path: '/ph/queue',
    badgeKey: 'new',
  },
  {
    id: 'completed',
    label: 'Completed',
    icon: <CheckCircle2 className="w-5 h-5" />,
    path: '/ph/completed',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: <Package className="w-5 h-5" />,
    path: '/ph/inventory',
    badgeKey: 'inventory-alert',
  },
  {
    id: 'more',
    label: 'More',
    icon: <MoreHorizontal className="w-5 h-5" />,
    path: '/ph/more',
  },
];

export function PharmacyBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { stats } = usePharmacistStore();
  const { stats: invStats } = usePharmacyInventoryStore();
  const queueBadge = stats.newCount + stats.statOrders;
  const inventoryBadge = invStats.outOfStock + invStats.lowStock;

  const activeTab =
    navItems.find((i) => location.pathname.startsWith(i.path))?.id ?? 'queue';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-40">
      <div className="flex items-center justify-around h-16 max-w-[390px] mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const badgeCount =
            item.badgeKey === 'new'
              ? queueBadge
              : item.badgeKey === 'inventory-alert'
              ? inventoryBadge
              : 0;
          const showBadge = badgeCount > 0;
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
                    {badgeCount}
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