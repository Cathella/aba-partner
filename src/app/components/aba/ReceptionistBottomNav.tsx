import {
  CalendarCheck,
  CalendarDays,
  ListOrdered,
  CreditCard,
  MoreHorizontal,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

interface ReceptionistNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: ReceptionistNavItem[] = [
  {
    id: 'today',
    label: 'Today',
    icon: <CalendarCheck className="w-5 h-5" />,
    path: '/r/today',
  },
  {
    id: 'bookings',
    label: 'Bookings',
    icon: <CalendarDays className="w-5 h-5" />,
    path: '/r/bookings',
  },
  {
    id: 'queue',
    label: 'Queue',
    icon: <ListOrdered className="w-5 h-5" />,
    path: '/r/queue',
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: <CreditCard className="w-5 h-5" />,
    path: '/r/payments',
  },
  {
    id: 'more',
    label: 'More',
    icon: <MoreHorizontal className="w-5 h-5" />,
    path: '/r/more',
  },
];

export function ReceptionistBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab =
    navItems.find((i) => location.pathname.startsWith(i.path))?.id ?? 'today';

  return (
    null
  );
}
