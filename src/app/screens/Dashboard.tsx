import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { BottomNav } from '../components/aba/BottomNav';
import { KPICard, ListCard, ListCardItem } from '../components/aba/Cards';
import { ABAButton } from '../components/aba/ABAButton';
import { ABABadge } from '../components/aba/ABABadge';
import { showToast } from '../components/aba/Toast';
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  DollarSign,
  Bell,
  Plus,
  ChevronRight,
  LogOut
} from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('userPin');
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  return (
    <div className="w-full min-h-screen bg-aba-neutral-100 flex items-center justify-center">
      {/* Mobile Frame Container */}
      <div className="w-[390px] h-[844px] bg-aba-neutral-100 relative overflow-hidden shadow-2xl">
        {/* Top Bar */}
        <AppTopBar
          title="Dashboard"
          rightAction={
            <>
              <button 
                className="p-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors relative"
                onClick={() => showToast('You have 3 new notifications', 'info')}
              >
                <Bell className="w-5 h-5 text-aba-neutral-900" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-aba-error-main rounded-full"></span>
              </button>
              <button
                className="p-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 text-aba-neutral-900" />
              </button>
            </>
          }
        />

        {/* Scrollable Content */}
        <div className="h-[calc(844px-56px-64px)] overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Welcome Section */}
            <div className="mb-2">
              <h2 className="text-xl font-semibold text-aba-neutral-900 mb-1">
                Welcome, Dr. Sarah
              </h2>
              <p className="text-sm text-aba-neutral-600">
                Mukono Family Clinic • Facility Admin
              </p>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              <KPICard
                title="Today's Sessions"
                value="12"
                subtitle="3 upcoming"
                icon={<Calendar className="w-5 h-5" />}
                trend={{ value: '8%', positive: true }}
              />
              <KPICard
                title="Active Clients"
                value="48"
                subtitle="This month"
                icon={<Users className="w-5 h-5" />}
              />
              <KPICard
                title="Revenue (MTD)"
                value="$24.5K"
                icon={<DollarSign className="w-5 h-5" />}
                trend={{ value: '12%', positive: true }}
                variant="success"
              />
              <KPICard
                title="Completion Rate"
                value="94%"
                icon={<TrendingUp className="w-5 h-5" />}
                trend={{ value: '3%', positive: true }}
              />
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
                Quick Actions
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                <ABAButton 
                  variant="primary" 
                  size="md"
                  onClick={() => showToast('Booking created successfully', 'success')}
                >
                  <Plus className="w-5 h-5" />
                  New Booking
                </ABAButton>
                <ABAButton 
                  variant="secondary" 
                  size="md"
                  onClick={() => navigate('/reports-home')}
                >
                  View Reports
                </ABAButton>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  Recent Activity
                </h3>
                <ABABadge variant="info" size="sm">
                  5 new
                </ABABadge>
              </div>
              
              <ListCard>
                <ListCardItem onClick={() => {}}>
                  <div className="w-10 h-10 rounded-full bg-aba-primary-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-aba-primary-main" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-aba-neutral-900">
                      Session Completed
                    </p>
                    <p className="text-xs text-aba-neutral-600">
                      John Doe • 2 hours ago
                    </p>
                  </div>
                  <ABABadge variant="success" size="sm">
                    Completed
                  </ABABadge>
                </ListCardItem>

                <ListCardItem onClick={() => {}}>
                  <div className="w-10 h-10 rounded-full bg-aba-warning-50 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-aba-warning-main" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-aba-neutral-900">
                      Pending Approval
                    </p>
                    <p className="text-xs text-aba-neutral-600">
                      New booking request • 3 hours ago
                    </p>
                  </div>
                  <ABABadge variant="warning" size="sm">
                    Pending
                  </ABABadge>
                </ListCardItem>

                <ListCardItem onClick={() => {}}>
                  <div className="w-10 h-10 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-aba-secondary-main" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-aba-neutral-900">
                      Payment Received
                    </p>
                    <p className="text-xs text-aba-neutral-600">
                      Invoice #1234 • Yesterday
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-aba-neutral-400" />
                </ListCardItem>
              </ListCard>
            </div>

            {/* Bottom Padding */}
            <div className="h-4"></div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}