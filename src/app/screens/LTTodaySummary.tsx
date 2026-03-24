/**
 * LT-08 Today's Summary — Daily summary dashboard for the Lab Tech.
 *
 * Cards:
 *   1. Completed Today
 *   2. Pending Collection
 *   3. In Progress
 *   4. Avg Turnaround (placeholder)
 *
 * Additional:
 *   - QC summary strip
 *   - STAT orders alert (if any)
 *   - Export button (placeholder → toast)
 *
 * Inner page: back arrow, no bottom nav.
 */
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { KPICard } from '../components/aba/Cards';
import { showToast } from '../components/aba/Toast';
import { useLabTechStore, computeAvgTAT, getLTOrders } from '../data/labTechStore';
import {
  CheckCircle2,
  Clock,
  FlaskConical,
  Timer,
  Zap,
  Beaker,
  Download,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';

/* ── Stat card ── */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  accent?: string;
  subtitle?: string;
}

function StatCard({ label, value, icon, iconBg, accent = 'text-[#1A1A1A]', subtitle }: StatCardProps) {
  return (
    <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#8F9AA1] uppercase tracking-wide">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className={`text-3xl font-bold ${accent}`}>{value}</p>
      {subtitle && (
        <p className="text-[10px] text-[#8F9AA1] mt-1">{subtitle}</p>
      )}
    </div>
  );
}

export function LTTodaySummary() {
  const navigate = useNavigate();
  const { stats, qcLog } = useLabTechStore();

  const qcPass = qcLog.filter((e) => e.status === 'pass').length;
  const qcWarn = qcLog.filter((e) => e.status === 'warning').length;
  const qcFail = qcLog.filter((e) => e.status === 'fail').length;
  const qcTotal = qcLog.length;

  const turnaroundAvg = computeAvgTAT();

  const dateStr = new Date().toLocaleDateString('en-UG', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handleExport = () => {
    // Generate a CSV blob and trigger download
    const csvHeader = 'Order ID,Patient,Test,Status,Ordered At,Verified At,Method\n';
    const allOrders = getLTOrders();
    const csvRows = allOrders
      .map(
        (o) =>
          `${o.id},"${o.patientName}","${o.testName}",${o.status},${o.orderedAt || ''},${o.verifiedAt || ''},${o.method || ''}`
      )
      .join('\n');

    const csv = csvHeader + csvRows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lab-summary-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Summary exported as CSV', 'success');
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar
        title="Today's Summary"
        showBack
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-4 space-y-4">
          {/* ── Date header ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4 text-center">
            <p className="text-xs text-[#8F9AA1] uppercase tracking-wide">
              {dateStr}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <BarChart3 className="w-5 h-5 text-[#32C28A]" />
              <h2 className="text-lg font-semibold text-[#1A1A1A]">
                Lab Activity
              </h2>
            </div>
          </div>

          {/* ── 4 Key stat cards (2 × 2 grid) ── */}
          <div>
            <p className="text-xs font-medium text-[#8F9AA1] mb-2 px-1 uppercase tracking-wide">
              Key Metrics
            </p>
            <div className="grid grid-cols-2 gap-3">
              <KPICard
                title="Completed"
                value={stats.completed}
                icon={<CheckCircle2 className="w-5 h-5" />}
                variant="dark"
                trend={stats.completed > 0 ? { value: 'Verified & released', positive: true } : undefined}
              />

              <KPICard
                title="Pending"
                value={stats.pendingCollection}
                icon={<Clock className="w-5 h-5" />}
                variant="dark"
                trend={stats.pendingCollection > 0 ? { value: 'Awaiting collection', positive: false } : undefined}
              />

              <KPICard
                title="In Progress"
                value={stats.inProgress}
                icon={<FlaskConical className="w-5 h-5" />}
                variant="dark"
              />

              <KPICard
                title="Avg TAT"
                value={turnaroundAvg}
                icon={<Timer className="w-5 h-5" />}
                variant="dark"
                subtitle="Order → Verified"
              />
            </div>
          </div>

          {/* ── Additional stats row ── */}
          <div className="flex gap-3">
            <div className="flex-1 bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-3 text-center">
              <p className="text-2xl font-bold text-aba-neutral-900">{stats.resultsReady}</p>
              <p className="text-[10px] text-[#8F9AA1] mt-0.5">Results Ready</p>
            </div>
            <div className="flex-1 bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-3 text-center">
              <p className="text-2xl font-bold text-aba-error-main">{stats.reCollect}</p>
              <p className="text-[10px] text-[#8F9AA1] mt-0.5">Re-collect</p>
            </div>
            <div className="flex-1 bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-3 text-center">
              <p className="text-2xl font-bold text-aba-neutral-900">{stats.total}</p>
              <p className="text-[10px] text-[#8F9AA1] mt-0.5">Total Orders</p>
            </div>
          </div>

          {/* ── STAT alert ── */}
          {stats.statOrders > 0 && (
            <div className="bg-[#FDECEC] rounded-2xl border border-[#E44F4F]/20 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-[#E44F4F]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#E44F4F]">
                    {stats.statOrders} STAT Order{stats.statOrders !== 1 ? 's' : ''} Active
                  </p>
                  <p className="text-xs text-[#4A4F55] mt-0.5">
                    Requires immediate priority processing
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── QC Summary ── */}
          <div>
            <p className="text-xs font-medium text-[#8F9AA1] mb-2 px-1 uppercase tracking-wide">
              Quality Control
            </p>
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#F5F3FF] flex items-center justify-center flex-shrink-0">
                  <Beaker className="w-4.5 h-4.5 text-[#8B5CF6]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {qcTotal} QC Checks Today
                  </p>
                  <p className="text-xs text-[#8F9AA1]">
                    Instrument calibration & controls
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#E9F8F0] p-2.5 text-center rounded-[14px]">
                  <p className="text-lg font-bold text-[#38C172]">{qcPass}</p>
                  <p className="text-[10px] text-[#38C172] font-medium">Pass</p>
                </div>
                <div className="bg-[#FFF3DC] p-2.5 text-center rounded-[14px]">
                  <p className="text-lg font-bold text-[#D97706]">{qcWarn}</p>
                  <p className="text-[10px] text-[#D97706] font-medium">Warning</p>
                </div>
                <div className="bg-[#FDECEC] p-2.5 text-center rounded-[14px]">
                  <p className="text-lg font-bold text-[#E44F4F]">{qcFail}</p>
                  <p className="text-[10px] text-[#E44F4F] font-medium">Fail</p>
                </div>
              </div>

              {qcFail > 0 && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E8EC]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#E44F4F] flex-shrink-0" />
                  <p className="text-xs text-[#E44F4F]">
                    {qcFail} failed check{qcFail !== 1 ? 's' : ''} — review required
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Export button ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleExport}
          >
            <Download className="w-5 h-5" />
            Export Today's Summary
          </ABAButton>
        </div>
      </div>
    </div>
  );
}