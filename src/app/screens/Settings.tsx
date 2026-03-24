import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { BottomNav } from '../components/aba/BottomNav';
import { ListCard, ListCardItem } from '../components/aba/Cards';
import {
  User,
  Lock,
  Bell,
  Shield,
  FileText,
  ChevronRight,
  Building2,
  CreditCard,
  HelpCircle,
  LogOut,
  Clock,
  Tag,
} from 'lucide-react';

const settingsSections = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Profile Settings', subtitle: '', route: '/profile-settings' },
      { icon: Lock, label: 'Security & PIN', subtitle: '', route: '/security-and-pin' },
      { icon: Bell, label: 'Notifications', subtitle: '', route: '/notification-settings' },
    ],
  },
  {
    title: 'Clinic',
    items: [
      {
        icon: Building2,
        label: 'Facility Information',
        subtitle: '',
        route: '/clinic-information',
      },
      { 
        icon: Clock, 
        label: 'Operating Hours', 
        subtitle: '',
        route: '/operating-hours' 
      },
      { 
        icon: Tag, 
        label: 'Services & Pricing', 
        subtitle: '',
        route: '/services-list' 
      },
      { 
        icon: CreditCard, 
        label: 'Payment Methods', 
        subtitle: '',
        route: '/payment-methods' 
      },
    ],
  },
  {
    title: 'Compliance & Security',
    items: [
      { icon: Shield, label: 'Audit Logs', subtitle: '', route: '/audit-logs' },
      { icon: FileText, label: 'Privacy Policy', subtitle: '', route: '/privacy-policy' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help Center', subtitle: '', route: '/help-center' },
    ],
  },
];

export function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('settings');

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar title="Settings" />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-6">
          {/* Admin Info Card */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-aba-primary-50 flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-aba-primary-main" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-aba-neutral-900">
                  Dr. Sarah Chen
                </p>
                <p className="text-aba-neutral-600 text-[12px]">Facility Admin</p>
                <p className="text-xs text-aba-neutral-500">
                  admin@mukono.clinic
                </p>
              </div>
            </div>
          </div>

          {/* Settings Sections */}
          {settingsSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-aba-neutral-700 mb-3 px-1">
                {section.title}
              </h3>
              <ListCard>
                {section.items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <ListCardItem
                      key={item.label}
                      onClick={() => navigate(item.route)}
                    >
                      <div className="w-10 h-10 rounded-full bg-aba-neutral-100 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-aba-neutral-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-aba-neutral-900">
                          {item.label}
                        </p>
                        {item.subtitle && (
                          <p className="text-xs text-aba-neutral-500">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-aba-neutral-400 flex-shrink-0" />
                    </ListCardItem>
                  );
                })}
              </ListCard>
            </div>
          ))}

          {/* Sign Out */}
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-white rounded-2xl border border-aba-neutral-200 p-4 hover:bg-aba-neutral-50 active:bg-aba-neutral-100 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5 text-aba-error-main" />
            <span className="text-sm font-medium text-aba-error-main">
              Sign Out
            </span>
          </button>

          {/* Version Info */}
          <div className="text-center">
            <p className="text-xs text-aba-neutral-500">
              ABA Partner Facility Admin
            </p>
            <p className="text-xs text-aba-neutral-400">Version 1.0.0</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}