import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABABadge } from '../components/aba/ABABadge';
import { ABAButton } from '../components/aba/ABAButton';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  DollarSign,
  UserPlus,
  Calendar,
  Clock,
  Settings,
  Trash2,
} from 'lucide-react';

type NotificationType = 'alert' | 'success' | 'info' | 'warning';
type NotificationCategory = 'all' | 'bookings' | 'finance' | 'staff' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    category: 'finance',
    title: 'Pending Settlements',
    message: 'You have 3 pending settlements that require approval',
    time: '5 min ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'info',
    category: 'staff',
    title: 'Staff Invites Pending',
    message: '2 staff members have not accepted their invitations',
    time: '1 hour ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'success',
    category: 'bookings',
    title: 'Booking Confirmed',
    message: 'New booking for Speech Therapy with John Doe at 2:00 PM',
    time: '2 hours ago',
    isRead: true,
  },
  {
    id: '4',
    type: 'alert',
    category: 'bookings',
    title: 'Session Canceled',
    message: 'Emily Brown canceled her 3:30 PM appointment',
    time: '3 hours ago',
    isRead: true,
  },
  {
    id: '5',
    type: 'info',
    category: 'system',
    title: 'System Update',
    message: 'New features available: Enhanced reporting and analytics',
    time: 'Yesterday',
    isRead: true,
  },
  {
    id: '6',
    type: 'success',
    category: 'finance',
    title: 'Payment Received',
    message: 'UGX 150,000 received from Sarah Johnson',
    time: 'Yesterday',
    isRead: true,
  },
  {
    id: '7',
    type: 'warning',
    category: 'bookings',
    title: 'Upcoming Session',
    message: 'You have 5 sessions scheduled for tomorrow',
    time: '2 days ago',
    isRead: true,
  },
  {
    id: '8',
    type: 'info',
    category: 'staff',
    title: 'New Staff Member',
    message: 'Michael Chen has joined your clinic team',
    time: '3 days ago',
    isRead: true,
  },
];

const notificationConfig = {
  alert: {
    icon: AlertTriangle,
    bgColor: 'bg-aba-error-50',
    iconColor: 'text-aba-error-main',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-aba-success-50',
    iconColor: 'text-aba-success-main',
  },
  info: {
    icon: Info,
    bgColor: 'bg-aba-secondary-50',
    iconColor: 'text-aba-secondary-main',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-aba-warning-50',
    iconColor: 'text-aba-warning-main',
  },
};

const categories = [
  { id: 'all' as const, label: 'All' },
  { id: 'bookings' as const, label: 'Bookings' },
  { id: 'finance' as const, label: 'Finance' },
  { id: 'staff' as const, label: 'Staff' },
  { id: 'system' as const, label: 'System' },
];

export function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter(
    (notification) =>
      activeCategory === 'all' || notification.category === activeCategory
  );

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Notifications"
        showBack
        onBackClick={() => navigate(-1)}
        rightAction={
          <button
            className="text-sm font-medium text-aba-primary-main"
            onClick={handleMarkAllAsRead}
          >
            Mark all read
          </button>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Unread Count */}
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 bg-aba-primary-50 border border-aba-primary-200 rounded-xl">
              <Bell className="w-5 h-5 text-aba-primary-main" />
              <p className="text-sm font-medium text-aba-neutral-900">
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-aba-neutral-900 text-white'
                      : 'bg-white text-aba-neutral-700 border border-aba-neutral-200 hover:bg-aba-neutral-50'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-aba-neutral-200 p-12 flex flex-col items-center justify-center">
                <Bell className="w-12 h-12 text-aba-neutral-400 mb-3" />
                <p className="text-sm font-medium text-aba-neutral-900 mb-1">
                  No notifications
                </p>
                <p className="text-xs text-aba-neutral-600 text-center">
                  You're all caught up! Check back later for updates.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const config = notificationConfig[notification.type];
                const IconComponent = config.icon;

                return (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-2xl border transition-all ${
                      notification.isRead
                        ? 'border-aba-neutral-200'
                        : 'border-aba-primary-200 shadow-sm'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div
                          className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}
                        >
                          <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-aba-neutral-900">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 rounded-full bg-aba-primary-main flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-aba-neutral-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-aba-neutral-500">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{notification.time}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {!notification.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="text-xs font-medium text-aba-primary-main hover:text-aba-primary-dark transition-colors"
                                >
                                  Mark as read
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(notification.id)}
                                className="p-1.5 rounded-lg hover:bg-aba-neutral-100 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-aba-neutral-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Settings Link */}
          {filteredNotifications.length > 0 && (
            <div className="pt-2">
              <button
                onClick={() => navigate('/notification-settings')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl border border-aba-neutral-200 text-sm font-medium text-aba-neutral-900 hover:bg-aba-neutral-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Notification Settings
              </button>
            </div>
          )}

          {/* Bottom Padding */}
          <div className="h-4"></div>
        </div>
      </div>
    </div>
  );
}