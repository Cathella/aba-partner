/**
 * AC-01 Finance Overview — Accountant landing / dashboard.
 *
 * Sections:
 *   1. Header: "Finance" + date-filter chips (Today / 7 days / 30 days / Custom)
 *   2. KPI cards (2×2): Total Collected, Aba Wallet, Cash Collected, Pending Payments
 *   3. "Collections by Channel" — horizontal bar chart for Aba Wallet / Cash / Corporate
 *   4. "Quick Alerts" — pending settlements, refund requests, disputed payments
 *   5. Quick actions row: Reconcile Cash, View Transactions, View Settlements
 *   6. "Recent Transactions" (last 6) — tap → AC-03
 *
 * Main nav page: AccountantBottomNav present.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { AccountantBottomNav } from '../components/aba/AccountantBottomNav';
import { KPICard } from '../components/aba/Cards';
import { ACTransactionRow } from '../components/aba/ACTransactionRow';
import { useAccountantStore, formatUGX } from '../data/accountantStore';
import {
  TrendingUp,
  Wallet,
  Banknote,
  Clock,
  ChevronRight,
  Landmark,
  ArrowLeftRight,
  RotateCcw,
  AlertCircle,
  Calculator,
  CalendarDays,
  Bell,
} from 'lucide-react';

/* ── helpers ── */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ── date-range helpers ── */
type DateRange = 'today' | '7d' | '30d' | 'custom';
const rangeLabels: { key: DateRange; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: 'custom', label: 'Custom' },
];

export function ACOverview() {
  const navigate = useNavigate();
  const { transactions, stats, channelStats, alertStats } = useAccountantStore();
  const [range, setRange] = useState<DateRange>('today');

  /* Pick the right channel stats bucket for the selected range */
  const ch =
    range === 'today'
      ? channelStats.today
      : range === '7d'
      ? channelStats['7d']
      : range === '30d'
      ? channelStats['30d']
      : channelStats.all;

  /* Pending payments are global (not period-scoped in prototype) */
  const pendingCount = stats.pendingCount;
  const pendingAmount = stats.pendingAmount;

  /* Bar-chart max for normalizing widths */
  const barMax = Math.max(ch.abaWallet, ch.cash, ch.corporate, 1);

  /* Recent 6 transactions */
  const recentTxs = transactions.slice(0, 6);

  /* Total alerts */
  const totalAlerts =
    alertStats.pendingSettlements +
    alertStats.refundRequests +
    alertStats.disputedPayments;

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* ═══════════ Header ═══════════ */}
      <AppTopBar
        title={`${getGreeting()}, Accountant Byaruhanga`}
        subtitle="Mukono Family Clinic • Finance"
        rightAction={
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-aba-neutral-100 transition-colors relative"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="w-5 h-5 text-aba-neutral-900" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-aba-error-main rounded-full" />
          </button>
        }
      />

      {/* ═══════════ Scrollable body ═══════════ */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">

          {/* Date-range chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-0.5">
            {rangeLabels.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  range === r.key
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC] hover:text-[#4A4F55]'
                }`}
              >
                {r.key === 'custom' && <CalendarDays className="w-3 h-3" />}
                {r.label}
              </button>
            ))}
          </div>

          {/* ── 1. KPI Grid (2×2) ── */}
          <div className="grid grid-cols-2 gap-3">
            <KPICard
              title="Total Collected"
              value={formatUGX(ch.totalCollected)}
              icon={<TrendingUp className="w-5 h-5" />}
              subtitle={`${pendingCount} pending`}
              variant="dark"
            />
            <KPICard
              title="Aba Wallet"
              value={formatUGX(ch.abaWallet)}
              icon={<Wallet className="w-5 h-5" />}
              variant="dark"
            />
            <KPICard
              title="Cash Collected"
              value={formatUGX(ch.cash)}
              icon={<Banknote className="w-5 h-5" />}
              variant="dark"
            />
            <KPICard
              title="Pending Payments"
              value={formatUGX(pendingAmount)}
              icon={<Clock className="w-5 h-5" />}
              subtitle={pendingCount > 0 ? `${pendingCount} invoices` : undefined}
              variant="warning"
            />
          </div>

          {/* ── 2. Collections by Channel ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-4">
              Collections by Channel
            </h3>

            <div className="space-y-4">
              <ChannelBar
                label="Aba Wallet"
                amount={ch.abaWallet}
                color="bg-[#3A8DFF]"
                barBg="bg-[#E8F2FF]"
                max={barMax}
              />
              <ChannelBar
                label="Cash"
                amount={ch.cash}
                color="bg-[#56D8A8]"
                barBg="bg-[#DFF7EE]"
                max={barMax}
              />
              <ChannelBar
                label="Corporate"
                amount={ch.corporate}
                color="bg-[#8B5CF6]"
                barBg="bg-[#F5F3FF]"
                max={barMax}
              />
            </div>
          </div>

          {/* ── 3. Quick Alerts ── */}
          {totalAlerts > 0 && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E8EC]">
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Quick Alerts
                </h3>
              </div>

              {alertStats.pendingSettlements > 0 && (
                <AlertRow
                  icon={<Landmark className="w-4 h-4 text-[#FFB649]" />}
                  iconBg="bg-[#FFF3DC]"
                  label={`${alertStats.pendingSettlements} pending settlement${alertStats.pendingSettlements !== 1 ? 's' : ''}`}
                  onClick={() => navigate('/ac/settlements')}
                />
              )}
              {alertStats.refundRequests > 0 && (
                <AlertRow
                  icon={<RotateCcw className="w-4 h-4 text-[#8B5CF6]" />}
                  iconBg="bg-[#F5F3FF]"
                  label={`${alertStats.refundRequests} refund request${alertStats.refundRequests !== 1 ? 's' : ''} awaiting approval`}
                  onClick={() => navigate('/ac/refunds-disputes')}
                />
              )}
              {alertStats.disputedPayments > 0 && (
                <AlertRow
                  icon={<AlertCircle className="w-4 h-4 text-[#E44F4F]" />}
                  iconBg="bg-[#FDECEC]"
                  label={`${alertStats.disputedPayments} disputed payment${alertStats.disputedPayments !== 1 ? 's' : ''}`}
                  onClick={() => navigate('/ac/refunds-disputes')}
                />
              )}
            </div>
          )}

          {/* ── 4. Quick Actions Row ── */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Calculator, label: 'Reconcile Cash', path: '/ac/reconcile-cash', iconBg: 'bg-aba-primary-50', iconColor: 'text-aba-primary-main' },
              { icon: ArrowLeftRight, label: 'Transactions', path: '/ac/transactions', iconBg: 'bg-aba-secondary-50', iconColor: 'text-aba-secondary-main' },
              { icon: Landmark, label: 'Settlements', path: '/ac/settlements', iconBg: 'bg-[#F5F3FF]', iconColor: 'text-[#8B5CF6]' },
            ].map((action) => {
              const IconComp = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2 py-4 bg-white rounded-2xl border border-aba-neutral-200 active:opacity-70 transition-opacity"
                >
                  <div className={`w-12 h-12 rounded-2xl ${action.iconBg} flex items-center justify-center`}>
                    <IconComp className={`w-5 h-5 ${action.iconColor}`} />
                  </div>
                  <span className="text-xs text-aba-neutral-700">{action.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── 5. Recent Transactions ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E8EC]">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Recent Transactions
              </h3>
              <button
                onClick={() => navigate('/ac/transactions')}
                className="text-xs font-medium text-[#3A8DFF] hover:underline flex items-center gap-0.5"
              >
                View All
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {recentTxs.map((tx) => (
              <ACTransactionRow
                key={tx.id}
                tx={tx}
                onClick={() => navigate(`/ac/transaction/${tx.id}`)}
              />
            ))}
          </div>

        </div>
      </div>

      <AccountantBottomNav />
    </div>
  );
}

/* ═══════════ Sub-components ═══════════ */

function ChannelBar({
  label,
  amount,
  color,
  barBg,
  max,
}: {
  label: string;
  amount: number;
  color: string;
  barBg: string;
  max: number;
}) {
  const pct = max > 0 ? Math.max((amount / max) * 100, 2) : 2;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-[#4A4F55]">{label}</span>
        <span className="text-sm font-semibold text-[#1A1A1A]">{formatUGX(amount)}</span>
      </div>
      <div className={`h-2.5 rounded-full ${barBg} overflow-hidden`}>
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function AlertRow({
  icon,
  iconBg,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
    >
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <span className="flex-1 text-sm text-[#1A1A1A]">{label}</span>
      <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
    </button>
  );
}