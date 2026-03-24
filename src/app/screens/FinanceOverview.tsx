import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { KPICard } from '../components/aba/Cards';
import {
  Wallet,
  DollarSign,
  Smartphone,
  Clock,
  TrendingUp,
  FileText,
  ArrowUpRight,
} from 'lucide-react';

const financialData = {
  wallet: {
    label: 'ABA Wallet',
    amount: 'UGX 4,850,000',
    count: '86 transactions',
    icon: Wallet,
  },
  cash: {
    label: 'Cash',
    amount: 'UGX 1,240,000',
    count: '23 transactions',
    icon: DollarSign,
  },
  momo: {
    label: 'Mobile Money',
    amount: 'UGX 2,680,000',
    count: '47 transactions',
    icon: Smartphone,
  },
  pending: {
    label: 'Pending Settlements',
    amount: 'UGX 3,125,000',
    count: '5 batches',
    icon: Clock,
  },
};

const summaryStats = [
  {
    label: "Today's Revenue",
    value: 'UGX 1,850,000',
    change: '+12.5%',
    icon: TrendingUp,
  },
  {
    label: 'This Week',
    value: 'UGX 8,770,000',
    change: '+8.3%',
    icon: TrendingUp,
  },
];

const recentActivity = [
  { label: 'Completed Transactions', count: 156, color: 'text-aba-success-main' },
  { label: 'Pending Approvals', count: 8, color: 'text-aba-warning-main' },
  { label: 'Disputed', count: 2, color: 'text-aba-error-main' },
];

export function FinanceOverview() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Finance Overview"
        showBack
        onBackClick={() => navigate(-1)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Payment Methods Grid */}
          <div>
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
              Payment Methods
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(financialData).map((data) => {
                const IconComponent = data.icon;
                return (
                  <div
                    key={data.label}
                    className="bg-aba-neutral-900 rounded-2xl border border-aba-neutral-800 p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs font-medium text-aba-neutral-400">
                        {data.label}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-white mb-1">
                      {data.amount}
                    </p>
                    <p className="text-xs text-aba-neutral-400">{data.count}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Stats */}
          <div>
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
              Revenue Summary
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {summaryStats.map((stat) => {
                const IconComponent = stat.icon;
                return (
                  <KPICard
                    key={stat.label}
                    title={stat.label}
                    value={
                      <div className="flex flex-col items-start">
                        <span className="text-xs font-normal text-aba-neutral-600 mb-0.5">UGX</span>
                        <span className="font-bold text-aba-neutral-900 text-[18px]">
                          {stat.value.replace('UGX ', '')}
                        </span>
                      </div>
                    }
                    subtitle={stat.change}
                    icon={<IconComponent className="w-5 h-5" />}
                  />
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
              Transaction Activity
            </h3>
            <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4 space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.label}
                  className="flex items-center justify-between"
                >
                  <p className="text-sm text-aba-neutral-900">
                    {activity.label}
                  </p>
                  <p className={`font-bold ${activity.color} text-[16px]`}>
                    {activity.count}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <ABAButton
                variant="primary"
                size="md"
                onClick={() => navigate('/settlement-ledger')}
              >
                <FileText className="w-5 h-5" />
                Settlements
              </ABAButton>
              <ABAButton
                variant="secondary"
                size="md"
                onClick={() => navigate('/transactions-list')}
              >
                <ArrowUpRight className="w-5 h-5" />
                Transactions
              </ABAButton>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-aba-secondary-50 border border-aba-secondary-200 rounded-xl p-4">
            <p className="text-sm font-medium text-aba-neutral-900 mb-1">
              Settlement Schedule
            </p>
            <p className="text-aba-neutral-700 text-[14px]">
              Settlements are processed every Monday and Thursday. Pending
              settlements will be batched and transferred to your designated
              account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}