/**
 * ClinicianBottomNav — Bottom tab bar for the Clinician role.
 * Tabs: Queue, Orders (with new-results badge), Patients, More
 */
import {
  ListOrdered,
  ClipboardList,
  Users,
  MoreHorizontal,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useClinicianStore } from '../../data/clinicianStore';

interface CLNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: CLNavItem[] = [
  {
    id: 'queue',
    label: 'Queue',
    icon: <ListOrdered className="w-5 h-5" />,
    path: '/cl/queue',
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: <ClipboardList className="w-5 h-5" />,
    path: '/cl/orders',
  },
  {
    id: 'patients',
    label: 'Patients',
    icon: <Users className="w-5 h-5" />,
    path: '/cl/patients',
  },
  {
    id: 'more',
    label: 'More',
    icon: <MoreHorizontal className="w-5 h-5" />,
    path: '/cl/more',
  },
];

export function ClinicianBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getNewResultsCount } = useClinicianStore();
  const newResults = getNewResultsCount();

  const activeTab =
    navItems.find((i) => location.pathname.startsWith(i.path))?.id ?? 'queue';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-aba-neutral-0 border-t border-aba-neutral-200 z-40">
      <div className="flex items-center justify-around h-16 max-w-[390px] mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const showBadge = item.id === 'orders' && newResults > 0;
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
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-aba-error-main text-white text-[10px] font-bold px-1 ring-2 ring-white">
                    {newResults}
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