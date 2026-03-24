/**
 * AC-07 Daily Summary — Today's financial summary with stats and breakdown.
 * Inner page: back arrow, no bottom nav.
 */
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { KPICard } from '../components/aba/Cards';
import { useAccountantStore, formatUGX } from '../data/accountantStore';
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  RotateCcw,
  Banknote,
  Smartphone,
  CreditCard,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export function ACDailySummary() {
  const navigate = useNavigate();
  const { transactions, stats } = useAccountantStore();

  const todayTxs = transactions.filter((t) => t.date === '2026-02-14');
  const cashToday = todayTxs.filter((t) => t.method === 'cash' && t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const mobileToday = todayTxs.filter((t) => t.method === 'mobile-money' && t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const cardToday = todayTxs.filter((t) => t.method === 'card' && t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const insuranceToday = todayTxs.filter((t) => t.method === 'insurance' && t.status === 'paid').reduce((s, t) => s + t.amount, 0);

  const methodBreakdown = [
    { label: 'Cash', icon: <Banknote className="w-4 h-4 text-[#38C172]" />, bg: 'bg-[#E9F8F0]', amount: cashToday },
    { label: 'Mobile Money', icon: <Smartphone className="w-4 h-4 text-[#FFB649]" />, bg: 'bg-[#FFF3DC]', amount: mobileToday },
    { label: 'Card', icon: <CreditCard className="w-4 h-4 text-[#3A8DFF]" />, bg: 'bg-[#E8F2FF]', amount: cardToday },
    { label: 'Insurance', icon: <ShieldCheck className="w-4 h-4 text-[#8B5CF6]" />, bg: 'bg-[#F5F3FF]', amount: insuranceToday },
  ];

  const dateStr = 'Saturday, 14 Feb 2026';

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Daily Summary" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="p-4 space-y-3">
          <p className="text-xs text-[#8F9AA1] text-center">{dateStr}</p>

          {/* ── KPI grid ── */}
          <div className="grid grid-cols-2 gap-3">
            <KPICard
              title="Today's Revenue"
              value={formatUGX(stats.todayRevenue)}
              icon={<TrendingUp className="w-5 h-5" />}
              subtitle={`${stats.todayTransactions} transactions`}
              variant="dark"
            />
            <KPICard
              title="Pending"
              value={formatUGX(stats.pendingAmount)}
              icon={<Clock className="w-5 h-5" />}
              subtitle={`${stats.pendingCount} awaiting`}
              variant="warning"
            />
            <KPICard
              title="Failed"
              value={String(stats.failedCount)}
              icon={<AlertTriangle className="w-5 h-5" />}
              variant="error"
            />
            <KPICard
              title="Disputed"
              value={String(stats.disputedCount)}
              icon={<AlertCircle className="w-5 h-5" />}
              variant="error"
            />
          </div>

          {/* ── Method breakdown ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC]">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Revenue by Payment Method
              </h3>
            </div>
            {methodBreakdown.map((row) => (
              <div
                key={row.label}
                className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E8EC] last:border-b-0"
              >
                <div className={`w-8 h-8 rounded-lg ${row.bg} flex items-center justify-center flex-shrink-0`}>
                  {row.icon}
                </div>
                <span className="flex-1 text-sm text-[#1A1A1A]">{row.label}</span>
                <span className="text-sm font-semibold text-[#1A1A1A]">
                  {row.amount > 0 ? formatUGX(row.amount) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}