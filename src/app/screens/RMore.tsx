/**
 * R-50 More — Receptionist "More" menu (main nav screen).
 * List items: Patients, End of Day Summary, Help Center, Privacy Policy, Profile.
 * Bottom nav present.
 */
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ReceptionistBottomNav } from '../components/aba/ReceptionistBottomNav';
import { ListCard } from '../components/aba/Cards';
import { RListRow } from '../components/aba/RListRow';
import { showToast } from '../components/aba/Toast';
import {
  User,
  Users,
  ClipboardList,
  HelpCircle,
  FileText,
  LogOut,
  Shield,
  Bell,
} from 'lucide-react';

/* ── Menu sections ── */
const menuSections = [
  {
    title: 'Quick Links',
    items: [
      {
        id: 'patients',
        icon: Users,
        label: 'Patients',
        subtitle: 'View patient directory',
      },
      {
        id: 'end-of-day',
        icon: ClipboardList,
        label: 'End of Day Summary',
        subtitle: 'Shift totals, export & close',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        id: 'profile',
        icon: User,
        label: 'Profile',
        subtitle: 'Grace Akello \u2022 Receptionist',
      },
      {
        id: 'security',
        icon: Shield,
        label: 'Security & PIN',
        subtitle: 'Change your sign-in PIN',
      },
      {
        id: 'notifications',
        icon: Bell,
        label: 'Notifications',
        subtitle: 'Manage alerts & sounds',
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        id: 'help',
        icon: HelpCircle,
        label: 'Help Center',
        subtitle: 'FAQs & support tickets',
      },
      {
        id: 'privacy',
        icon: FileText,
        label: 'Privacy Policy',
        subtitle: 'Terms of use & data',
      },
    ],
  },
];

export function RMore() {
  const navigate = useNavigate();

  const handleTap = (id: string) => {
    switch (id) {
      case 'patients':
        navigate('/r/more/patients');
        break;
      case 'end-of-day':
        navigate('/r/more/end-of-day');
        break;
      case 'profile':
        navigate('/profile-settings');
        break;
      case 'security':
        navigate('/security-and-pin');
        break;
      case 'notifications':
        navigate('/notification-settings');
        break;
      case 'help':
        navigate('/help-center');
        break;
      case 'privacy':
        navigate('/privacy-policy');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('staffPhone');
    showToast('Logged out successfully', 'success');
    setTimeout(() => navigate('/'), 500);
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="More" />

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-5">
          {/* ── Avatar header ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-aba-primary-50 flex items-center justify-center">
              <span className="text-lg font-bold text-aba-primary-main text-[#1a1a1a]">GA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-aba-neutral-900">Grace Akello</p>
              <p className="text-xs text-aba-neutral-600">
                Receptionist &bull; Mukono Family Clinic
              </p>
            </div>
          </div>

          {/* ── Menu sections ── */}
          {menuSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide mb-2 px-1">
                {section.title}
              </h4>
              <ListCard>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <RListRow
                      key={item.id}
                      icon={<Icon className="w-5 h-5 text-aba-neutral-700" />}
                      title={item.label}
                      subtitle={item.subtitle}
                      showChevron
                      onClick={() => handleTap(item.id)}
                    />
                  );
                })}
              </ListCard>
            </div>
          ))}

          {/* ── Sign Out ── */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border border-aba-error-main/20 bg-aba-error-50 text-aba-error-main font-semibold text-sm hover:bg-aba-error-50/80 active:bg-aba-error-50/60 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
        <div className="h-4" />
      </div>

      <ReceptionistBottomNav />
    </div>
  );
}