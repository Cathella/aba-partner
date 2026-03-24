/**
 * ACReportDetail — Full report detail view for each report type.
 * Inner page: back arrow, no bottom nav.
 * Uses accountantStore data to render meaningful report content.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ACSummaryCard } from '../components/aba/ACSummaryCard';
import { ACExportModal } from '../components/aba/ACExportModal';
import { useAccountantStore, formatUGX } from '../data/accountantStore';
import type { ACTransaction, ACPaymentMethod, ACTxStatus } from '../data/accountantStore';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  FileBarChart2,
  Calendar,
  Download,
  DollarSign,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Banknote,
  Smartphone,
  CreditCard,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

/* ── report config ── */

interface ReportConfig {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  accentColor: string;
}

const reportConfigs: Record<string, ReportConfig> = {
  daily: {
    title: 'Daily Revenue Report',
    subtitle: 'Breakdown of revenue by service, method, and status',
    icon: <BarChart3 className="w-5 h-5 text-[#32C28A]" />,
    iconBg: 'bg-[#E9F8F0]',
    accentColor: '#32C28A',
  },
  weekly: {
    title: 'Weekly Summary',
    subtitle: 'Aggregated revenue and trends for the past 7 days',
    icon: <TrendingUp className="w-5 h-5 text-[#3A8DFF]" />,
    iconBg: 'bg-[#E8F2FF]',
    accentColor: '#3A8DFF',
  },
  method: {
    title: 'Payment Method Breakdown',
    subtitle: 'Revenue split by Cash, Mobile Money, Card, Insurance',
    icon: <PieChart className="w-5 h-5 text-[#8B5CF6]" />,
    iconBg: 'bg-[#F5F3FF]',
    accentColor: '#8B5CF6',
  },
  outstanding: {
    title: 'Outstanding & Disputes',
    subtitle: 'Pending payments, failed transactions, and open disputes',
    icon: <FileBarChart2 className="w-5 h-5 text-[#E44F4F]" />,
    iconBg: 'bg-[#FDECEC]',
    accentColor: '#E44F4F',
  },
  monthly: {
    title: 'Monthly Reconciliation',
    subtitle: 'Full monthly reconciliation with settlement matching',
    icon: <Calendar className="w-5 h-5 text-[#D97706]" />,
    iconBg: 'bg-[#FFF3DC]',
    accentColor: '#D97706',
  },
};

/* ── helpers ── */

const methodLabels: Record<ACPaymentMethod, string> = {
  cash: 'Cash',
  'mobile-money': 'Mobile Money',
  card: 'Card',
  insurance: 'Insurance',
};

const methodIcons: Record<ACPaymentMethod, React.ReactNode> = {
  cash: <Banknote className="w-4 h-4 text-[#38C172]" />,
  'mobile-money': <Smartphone className="w-4 h-4 text-[#FFB649]" />,
  card: <CreditCard className="w-4 h-4 text-[#3A8DFF]" />,
  insurance: <ShieldCheck className="w-4 h-4 text-[#8B5CF6]" />,
};

const methodBgs: Record<ACPaymentMethod, string> = {
  cash: 'bg-[#E9F8F0]',
  'mobile-money': 'bg-[#FFF3DC]',
  card: 'bg-[#E8F2FF]',
  insurance: 'bg-[#F5F3FF]',
};

const statusLabels: Record<ACTxStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded',
  disputed: 'Disputed',
};

const statusColors: Record<ACTxStatus, { text: string; bg: string }> = {
  paid: { text: 'text-[#38C172]', bg: 'bg-[#E9F8F0]' },
  pending: { text: 'text-[#FFB649]', bg: 'bg-[#FFF3DC]' },
  failed: { text: 'text-[#E44F4F]', bg: 'bg-[#FDECEC]' },
  refunded: { text: 'text-[#3A8DFF]', bg: 'bg-[#E8F2FF]' },
  disputed: { text: 'text-[#E44F4F]', bg: 'bg-[#FDECEC]' },
};

const categoryLabels: Record<string, string> = {
  consultation: 'Consultation',
  lab: 'Laboratory',
  pharmacy: 'Pharmacy',
  procedure: 'Procedure',
  membership: 'Membership',
  other: 'Other',
};

function groupByKey<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

/* ── bar helper ── */

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-2 rounded-full bg-[#F0F2F5] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

/* ── mock weekly data (trending) ── */

const weeklyMockData = [
  { day: 'Mon 10', revenue: 415000, transactions: 4 },
  { day: 'Tue 11', revenue: 30000, transactions: 1 },
  { day: 'Wed 12', revenue: 258000, transactions: 3 },
  { day: 'Thu 13', revenue: 685000, transactions: 3 },
  { day: 'Fri 14', revenue: 282000, transactions: 5 },
  { day: 'Sat 15', revenue: 0, transactions: 0 },
  { day: 'Sun 16', revenue: 0, transactions: 0 },
];

/* ── monthly mock data ── */

const monthlyMockData = {
  period: 'February 2026 (1 - 16 Feb)',
  totalRevenue: 1670000,
  totalTransactions: 16,
  settledAmount: 703000,
  pendingSettlement: 967000,
  settledBatches: 4,
  pendingBatches: 2,
  refundsIssued: 65000,
  disputesOpen: 2,
  reconciliationRate: 89,
};

/* ════════════════════════════════════════════════ */

export function ACReportDetail() {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const [showExport, setShowExport] = useState(false);

  const store = useAccountantStore();
  const { transactions, settlements, stats } = store;

  const config = reportId ? reportConfigs[reportId] : null;

  if (!config || !reportId) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Report" showBack onBackClick={() => navigate('/ac/reports')} />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-[#8F9AA1]">Report not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar
        title={config.title}
        showBack
        onBackClick={() => navigate('/ac/reports')}
        rightAction={
          <button
            onClick={() => setShowExport(true)}
            className="p-2 rounded-xl bg-[#F7F9FC] border border-[#E5E8EC] hover:bg-[#E5E8EC] transition-colors"
          >
            <Download className="w-4 h-4 text-[#4A4F55]" />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="p-4 space-y-3">
          {/* Report header */}
          <div className="flex items-start gap-3 bg-white rounded-2xl border border-[#E5E8EC] p-4">
            <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1A1A1A]">{config.title}</p>
              <p className="text-xs text-[#8F9AA1] mt-0.5 leading-relaxed">{config.subtitle}</p>
              <p className="text-[10px] text-[#C9D0DB] mt-1.5">
                Generated: 16 Feb 2026, 12:00 PM
              </p>
            </div>
          </div>

          {/* Report-specific content */}
          {reportId === 'daily' && (
            <DailyRevenueContent transactions={transactions} stats={stats} />
          )}
          {reportId === 'weekly' && (
            <WeeklySummaryContent transactions={transactions} />
          )}
          {reportId === 'method' && (
            <PaymentMethodContent transactions={transactions} />
          )}
          {reportId === 'outstanding' && (
            <OutstandingContent transactions={transactions} stats={stats} />
          )}
          {reportId === 'monthly' && (
            <MonthlyReconciliationContent settlements={settlements} />
          )}
        </div>
      </div>

      <ACExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        title={`Export ${config.title}`}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════ */
/* ── Daily Revenue Report ── */
/* ════════════════════════════════════════════════ */

function DailyRevenueContent({
  transactions,
  stats,
}: {
  transactions: ACTransaction[];
  stats: ReturnType<typeof useAccountantStore>['stats'];
}) {
  const todayTxs = transactions.filter((t) => t.date === '2026-02-14');
  const paidToday = todayTxs.filter((t) => t.status === 'paid');
  const totalRevenue = paidToday.reduce((s, t) => s + t.amount, 0);
  const avgAmount = paidToday.length > 0 ? Math.round(totalRevenue / paidToday.length) : 0;

  // By category
  const byCat = groupByKey(paidToday, (t) => t.category);
  const catTotals = Object.entries(byCat)
    .map(([cat, txs]) => ({
      category: cat,
      label: categoryLabels[cat] || cat,
      total: txs.reduce((s, t) => s + t.amount, 0),
      count: txs.length,
    }))
    .sort((a, b) => b.total - a.total);

  // By method
  const byMethod = groupByKey(paidToday, (t) => t.method);
  const methodTotals = (['cash', 'mobile-money', 'card', 'insurance'] as ACPaymentMethod[]).map(
    (m) => ({
      method: m,
      label: methodLabels[m],
      total: (byMethod[m] || []).reduce((s, t) => s + t.amount, 0),
      count: (byMethod[m] || []).length,
    }),
  );

  // By status
  const byStatus = groupByKey(todayTxs, (t) => t.status);
  const statusTotals = (['paid', 'pending', 'failed', 'refunded', 'disputed'] as ACTxStatus[])
    .map((s) => ({
      status: s,
      label: statusLabels[s],
      total: (byStatus[s] || []).reduce((sum, t) => sum + t.amount, 0),
      count: (byStatus[s] || []).length,
    }))
    .filter((s) => s.count > 0);

  return (
    <>
      {/* Date */}
      <p className="text-xs text-[#8F9AA1] text-center">Friday, 14 February 2026</p>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3">
        <ACSummaryCard
          label="Total Revenue"
          value={formatUGX(totalRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-[#E9F8F0]"
          iconColor="text-[#38C172]"
          subtitle={`${paidToday.length} paid transactions`}
        />
        <ACSummaryCard
          label="Average Amount"
          value={formatUGX(avgAmount)}
          icon={<BarChart3 className="w-5 h-5" />}
          iconBg="bg-[#E8F2FF]"
          iconColor="text-[#3A8DFF]"
          subtitle="per transaction"
        />
        <ACSummaryCard
          label="Pending"
          value={formatUGX(stats.pendingAmount)}
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-[#FFF3DC]"
          iconColor="text-[#FFB649]"
          subtitle={`${stats.pendingCount} awaiting`}
        />
        <ACSummaryCard
          label="Total Transactions"
          value={String(todayTxs.length)}
          icon={<FileBarChart2 className="w-5 h-5" />}
          iconBg="bg-[#F5F3FF]"
          iconColor="text-[#8B5CF6]"
          subtitle="all statuses"
        />
      </div>

      {/* By Service Category */}
      <div className="bg-white rounded-2xl border border-[#E5E8EC] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E5E8EC]">
          <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
            Revenue by Service
          </h3>
        </div>
        {catTotals.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-[#C9D0DB]">No paid transactions today</p>
          </div>
        ) : (
          catTotals.map((row) => (
            <div
              key={row.category}
              className="px-4 py-3 border-b border-[#E5E8EC] last:border-b-0"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-[#1A1A1A]">{row.label}</span>
                <span className="text-sm font-semibold text-[#1A1A1A]">
                  {formatUGX(row.total)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ProgressBar value={row.total} max={totalRevenue} color="#32C28A" />
                <span className="text-[10px] text-[#C9D0DB] flex-shrink-0 w-14 text-right">
                  {row.count} txn{row.count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* By Payment Method */}
      <div className="bg-white rounded-2xl border border-[#E5E8EC] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E5E8EC]">
          <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
            Revenue by Payment Method
          </h3>
        </div>
        {methodTotals.map((row) => (
          <div
            key={row.method}
            className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E8EC] last:border-b-0"
          >
            <div
              className={`w-8 h-8 rounded-lg ${methodBgs[row.method]} flex items-center justify-center flex-shrink-0`}
            >
              {methodIcons[row.method]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#1A1A1A]">{row.label}</p>
              <p className="text-[10px] text-[#C9D0DB]">
                {row.count} transaction{row.count !== 1 ? 's' : ''}
              </p>
            </div>
            <span className="text-sm font-semibold text-[#1A1A1A]">
              {row.total > 0 ? formatUGX(row.total) : '\u2014'}
            </span>
          </div>
        ))}
      </div>

      {/* By Status */}
      <div className="bg-white rounded-2xl border border-[#E5E8EC] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E5E8EC]">
          <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
            Transaction Status Breakdown
          </h3>
        </div>
        {statusTotals.map((row) => (
          <div
            key={row.status}
            className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E8EC] last:border-b-0"
          >
            <div
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[row.status].bg} ${statusColors[row.status].text}`}
            >
              {row.label}
            </div>
            <span className="flex-1 text-sm text-[#1A1A1A]">
              {row.count} transaction{row.count !== 1 ? 's' : ''}
            </span>
            <span className="text-sm font-semibold text-[#1A1A1A]">{formatUGX(row.total)}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════ */
/* ── Weekly Summary ── */
/* ════════════════════════════════════════════════ */

function WeeklySummaryContent({ transactions }: { transactions: ACTransaction[] }) {
  const weekTotal = weeklyMockData.reduce((s, d) => s + d.revenue, 0);
  const weekTxCount = weeklyMockData.reduce((s, d) => s + d.transactions, 0);
  const maxDayRevenue = Math.max(...weeklyMockData.map((d) => d.revenue), 1);
  const avgDaily = Math.round(weekTotal / 5); // 5 working days
  const prevWeekTotal = 1420000; // mock
  const weekChange = weekTotal - prevWeekTotal;
  const weekChangePct = prevWeekTotal > 0 ? ((weekChange / prevWeekTotal) * 100).toFixed(1) : '0';
  const isUp = weekChange >= 0;

  // Best and worst days
  const activeDays = weeklyMockData.filter((d) => d.revenue > 0);
  const bestDay = activeDays.length > 0
    ? activeDays.reduce((a, b) => (a.revenue > b.revenue ? a : b))
    : null;
  const worstDay = activeDays.length > 0
    ? activeDays.reduce((a, b) => (a.revenue < b.revenue ? a : b))
    : null;

  return (
    <>
      <p className="text-xs text-[#8F9AA1] text-center">10 Feb - 16 Feb 2026</p>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3">
        <ACSummaryCard
          label="Total Revenue"
          value={formatUGX(weekTotal)}
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-[#E9F8F0]"
          iconColor="text-[#38C172]"
          subtitle={`${weekTxCount} transactions`}
        />
        <ACSummaryCard
          label="Daily Average"
          value={formatUGX(avgDaily)}
          icon={<BarChart3 className="w-5 h-5" />}
          iconBg="bg-[#E8F2FF]"
          iconColor="text-[#3A8DFF]"
          subtitle="5 working days"
        />
      </div>

      {/* Week-over-week change */}
      <div className="bg-white rounded-2xl border border-[#E5E8EC] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#8F9AA1]">Compared to Previous Week</p>
            <p className="text-lg font-semibold text-[#1A1A1A] mt-1">
              {isUp ? '+' : ''}{formatUGX(weekChange)}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isUp ? 'bg-[#E9F8F0] text-[#38C172]' : 'bg-[#FDECEC] text-[#E44F4F]'
            }`}
          >
            {isUp ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {isUp ? '+' : ''}{weekChangePct}%
          </div>
        </div>
      </div>

      {/* Daily chart (bar) */}
      <div className="bg-white rounded-2xl border border-[#E5E8EC] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E5E8EC]">
          <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
            Daily Revenue
          </h3>
        </div>
        <div className="p-4 space-y-2.5">
          {weeklyMockData.map((day) => (
            <div key={day.day}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#4A4F55]">{day.day}</span>
                <span className="text-xs font-medium text-[#1A1A1A]">
                  {day.revenue > 0 ? formatUGX(day.revenue) : '\u2014'}
                </span>
              </div>
              <ProgressBar value={day.revenue} max={maxDayRevenue} color="#3A8DFF" />
            </div>
          ))}
        </div>
      </div>

      {/* Highlights */}
      <div className="bg-white rounded-2xl border border-[#E5E8EC] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E5E8EC]">
          <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
            Highlights
          </h3>
        </div>
        <div className="px-4 py-3 space-y-3">
          {bestDay && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E9F8F0] flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-[#38C172]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#8F9AA1]">Best Day</p>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {bestDay.day} \u2014 {formatUGX(bestDay.revenue)}
                </p>
              </div>
            </div>
          )}
          {worstDay && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FDECEC] flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-4 h-4 text-[#E44F4F]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#8F9AA1]">Slowest Day</p>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {worstDay.day} \u2014 {formatUGX(worstDay.revenue)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════ */
/* ── Payment Method Breakdown ── */
/* ════════════════════════════════════════════════ */

function PaymentMethodContent({ transactions }: { transactions: ACTransaction[] }) {
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | 'all'>('7d');

  const periodFilters: Record<string, (t: ACTransaction) => boolean> = {
    today: (t) => t.date === '2026-02-14',
    '7d': (t) => t.date >= '2026-02-08',
    '30d': (t) => t.date >= '2026-01-16',
    all: () => true,
  };

  const filtered = transactions.filter(periodFilters[period]).filter((t) => t.status === 'paid');
  const total = filtered.reduce((s, t) => s + t.amount, 0);

  const methods: ACPaymentMethod[] = ['cash', 'mobile-money', 'card', 'insurance'];
  const breakdown = methods.map((m) => {
    const txs = filtered.filter((t) => t.method === m);
    const amount = txs.reduce((s, t) => s + t.amount, 0);
    return {
      method: m,
      label: methodLabels[m],
      amount,
      count: txs.length,
      pct: total > 0 ? ((amount / total) * 100).toFixed(1) : '0',
    };
  });

  const methodBarColors: Record<ACPaymentMethod, string> = {
    cash: '#38C172',
    'mobile-money': '#FFB649',
    card: '#3A8DFF',
    insurance: '#8B5CF6',
  };

  const periods = [
    { key: 'today', label: 'Today' },
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: 'all', label: 'All Time' },
  ] as const;

  return (
    <>
      {/* Period selector */}
      <div className="flex gap-2">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
              period === p.key
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-white border border-[#E5E8EC] text-[#4A4F55] hover:bg-[#F7F9FC]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="bg-white rounded-2xl border border-[#E5E8EC] p-4 text-center">
        <p className="text-xs text-[#8F9AA1]">Total Collected</p>
        <p className="text-2xl font-bold text-[#1A1A1A] mt-1">{formatUGX(total)}</p>
        <p className="text-[10px] text-[#C9D0DB] mt-0.5">
          {filtered.length} paid transaction{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Visual breakdown bar */}
      <div className="bg-white rounded-2xl border border-[#E5E8EC] p-4">
        <div className="flex h-4 rounded-full overflow-hidden bg-[#F0F2F5]">
          {breakdown
            .filter((b) => b.amount > 0)
            .map((b) => (
              <div
                key={b.method}
                className="h-full transition-all duration-500"
                style={{
                  width: `${b.pct}%`,
                  backgroundColor: methodBarColors[b.method],
                }}
              />
            ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {breakdown
            .filter((b) => b.amount > 0)
            .map((b) => (
              <div key={b.method} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: methodBarColors[b.method] }}
                />
                <span className="text-[10px] text-[#8F9AA1]">
                  {b.label} ({b.pct}%)
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Method detail cards */}
      <div className="bg-white rounded-2xl border border-[#E5E8EC] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E5E8EC]">
          <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
            Method Detail
          </h3>
        </div>
        {breakdown.map((row) => (
          <div
            key={row.method}
            className="px-4 py-3 border-b border-[#E5E8EC] last:border-b-0"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-8 h-8 rounded-lg ${methodBgs[row.method]} flex items-center justify-center flex-shrink-0`}
              >
                {methodIcons[row.method]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A]">{row.label}</p>
                <p className="text-[10px] text-[#C9D0DB]">
                  {row.count} transaction{row.count !== 1 ? 's' : ''} \u00B7 {row.pct}%
                </p>
              </div>
              <span className="text-sm font-semibold text-[#1A1A1A]">
                {row.amount > 0 ? formatUGX(row.amount) : '\u2014'}
              </span>
            </div>
            <ProgressBar value={row.amount} max={total} color={methodBarColors[row.method]} />
          </div>
        ))}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════ */
/* ── Outstanding & Disputes ── */
/* ════════════════════════════════════════════════ */

function OutstandingContent({
  transactions,
  stats,
}: {
  transactions: ACTransaction[];
  stats: ReturnType<typeof useAccountantStore>['stats'];
}) {
  const pendingTxs = transactions.filter((t) => t.status === 'pending');
  const failedTxs = transactions.filter((t) => t.status === 'failed');
  const disputedTxs = transactions.filter((t) => t.status === 'disputed');
  const pendingTotal = pendingTxs.reduce((s, t) => s + t.amount, 0);
  const failedTotal = failedTxs.reduce((s, t) => s + t.amount, 0);
  const disputedTotal = disputedTxs.reduce((s, t) => s + t.amount, 0);
  const totalAtRisk = pendingTotal + failedTotal + disputedTotal;

  return (
    <>
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <ACSummaryCard
          label="Total at Risk"
          value={formatUGX(totalAtRisk)}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBg="bg-[#FDECEC]"
          iconColor="text-[#E44F4F]"
          subtitle="requires attention"
        />
        <ACSummaryCard
          label="Pending"
          value={String(pendingTxs.length)}
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-[#FFF3DC]"
          iconColor="text-[#FFB649]"
          subtitle={formatUGX(pendingTotal)}
        />
        <ACSummaryCard
          label="Failed"
          value={String(failedTxs.length)}
          icon={<XCircle className="w-5 h-5" />}
          iconBg="bg-[#FDECEC]"
          iconColor="text-[#E44F4F]"
          subtitle={formatUGX(failedTotal)}
        />
        <ACSummaryCard
          label="Disputed"
          value={String(disputedTxs.length)}
          icon={<AlertCircle className="w-5 h-5" />}
          iconBg="bg-[#FDECEC]"
          iconColor="text-[#E44F4F]"
          subtitle={formatUGX(disputedTotal)}
        />
      </div>

      {/* Pending Transactions */}
      {pendingTxs.length > 0 && (
        <TransactionListSection
          title="Pending Payments"
          transactions={pendingTxs}
          badgeColor={{ text: 'text-[#FFB649]', bg: 'bg-[#FFF3DC]' }}
        />
      )}

      {/* Failed Transactions */}
      {failedTxs.length > 0 && (
        <TransactionListSection
          title="Failed Transactions"
          transactions={failedTxs}
          badgeColor={{ text: 'text-[#E44F4F]', bg: 'bg-[#FDECEC]' }}
        />
      )}

      {/* Disputed Transactions */}
      {disputedTxs.length > 0 && (
        <TransactionListSection
          title="Open Disputes"
          transactions={disputedTxs}
          badgeColor={{ text: 'text-[#E44F4F]', bg: 'bg-[#FDECEC]' }}
        />
      )}
    </>
  );
}

function TransactionListSection({
  title,
  transactions,
  badgeColor,
}: {
  title: string;
  transactions: ACTransaction[];
  badgeColor: { text: string; bg: string };
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E8EC] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">{title}</h3>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColor.bg} ${badgeColor.text}`}
        >
          {transactions.length}
        </span>
      </div>
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="px-4 py-3 border-b border-[#E5E8EC] last:border-b-0"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1A1A1A] truncate">{tx.patientName}</p>
              <p className="text-xs text-[#8F9AA1] mt-0.5">{tx.description}</p>
            </div>
            <div className="text-right ml-3">
              <p className="text-sm font-semibold text-[#1A1A1A]">{formatUGX(tx.amount)}</p>
              <p className="text-[10px] text-[#C9D0DB] mt-0.5">
                {tx.date} \u00B7 {tx.time}
              </p>
            </div>
          </div>
          {tx.notes && (
            <p className="text-[10px] text-[#8F9AA1] mt-1.5 bg-[#F7F9FC] rounded-lg px-2.5 py-1.5 leading-relaxed">
              {tx.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════ */
/* ── Monthly Reconciliation ── */
/* ════════════════════════════════════════════════ */

function MonthlyReconciliationContent({
  settlements,
}: {
  settlements: ReturnType<typeof useAccountantStore>['settlements'];
}) {
  const d = monthlyMockData;
  const settledPct = d.reconciliationRate;

  return (
    <>
      <p className="text-xs text-[#8F9AA1] text-center">{d.period}</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <ACSummaryCard
          label="Total Revenue"
          value={formatUGX(d.totalRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-[#E9F8F0]"
          iconColor="text-[#38C172]"
          subtitle={`${d.totalTransactions} transactions`}
        />
        <ACSummaryCard
          label="Settled"
          value={formatUGX(d.settledAmount)}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBg="bg-[#E9F8F0]"
          iconColor="text-[#38C172]"
          subtitle={`${d.settledBatches} batches`}
        />
        <ACSummaryCard
          label="Pending Settlement"
          value={formatUGX(d.pendingSettlement)}
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-[#FFF3DC]"
          iconColor="text-[#FFB649]"
          subtitle={`${d.pendingBatches} batches`}
        />
        <ACSummaryCard
          label="Refunds Issued"
          value={formatUGX(d.refundsIssued)}
          icon={<ArrowDownRight className="w-5 h-5" />}
          iconBg="bg-[#E8F2FF]"
          iconColor="text-[#3A8DFF]"
          subtitle={`${d.disputesOpen} open disputes`}
        />
      </div>

      {/* Reconciliation progress */}
      <div className="bg-white rounded-2xl border border-[#E5E8EC] p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
            Reconciliation Progress
          </p>
          <span className="text-xs font-semibold text-[#32C28A]">{settledPct}%</span>
        </div>
        <ProgressBar value={settledPct} max={100} color="#32C28A" />
        <p className="text-[10px] text-[#C9D0DB] mt-2">
          {formatUGX(d.settledAmount)} of {formatUGX(d.totalRevenue)} reconciled
        </p>
      </div>

      {/* Settlement batches */}
      <div className="bg-white rounded-2xl border border-[#E5E8EC] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E5E8EC]">
          <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
            Settlement Batches
          </h3>
        </div>
        {settlements.map((stl) => {
          const statusStyle =
            stl.status === 'settled'
              ? { text: 'text-[#38C172]', bg: 'bg-[#E9F8F0]', label: 'Settled' }
              : stl.status === 'processing'
                ? { text: 'text-[#3A8DFF]', bg: 'bg-[#E8F2FF]', label: 'Processing' }
                : { text: 'text-[#FFB649]', bg: 'bg-[#FFF3DC]', label: 'Pending' };

          return (
            <div
              key={stl.id}
              className="px-4 py-3 border-b border-[#E5E8EC] last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A]">{stl.periodLabel}</p>
                  <p className="text-[10px] text-[#C9D0DB] mt-0.5">
                    {stl.reference} \u00B7 {stl.transactionCount} txns
                  </p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    {formatUGX(stl.totalAmount)}
                  </p>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    {statusStyle.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reconciliation notes */}
      <div className="bg-[#FFF3DC] rounded-2xl p-4 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-[#D97706] mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-[#1A1A1A]">Action Required</p>
          <p className="text-xs text-[#4A4F55] mt-0.5 leading-relaxed">
            {d.pendingBatches} settlement batch{d.pendingBatches !== 1 ? 'es' : ''} and{' '}
            {d.disputesOpen} dispute{d.disputesOpen !== 1 ? 's' : ''} require attention before
            month-end reconciliation can be finalised.
          </p>
        </div>
      </div>
    </>
  );
}