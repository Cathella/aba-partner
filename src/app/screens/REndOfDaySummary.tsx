/**
 * R-51 End of Day Summary — Summary cards (patients served, wallet total,
 * cash total, pending payments), Export Summary (modal → toast), Close Shift (confirm → success).
 * Bottom nav present.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ReceptionistBottomNav } from '../components/aba/ReceptionistBottomNav';
import { ABAButton } from '../components/aba/ABAButton';
import { ABAModal } from '../components/aba/ABAModal';
import { ABABadge } from '../components/aba/ABABadge';
import { showToast } from '../components/aba/Toast';
import {
  usePaymentsStore,
  fmtUGX,
  getEndOfDaySummary as getEoD,
} from '../data/paymentsStore';
import { getSchedule } from '../data/scheduleStore';
import {
  Users,
  Wallet,
  Banknote,
  Clock,
  Download,
  Power,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Mail,
  FileText,
  Printer,
  ArrowRight,
} from 'lucide-react';

type ShiftState = 'active' | 'closed';

export function REndOfDaySummary() {
  const navigate = useNavigate();
  const { payments } = usePaymentsStore();

  /* ── derive stats ── */
  const summary = useMemo(() => getEoD(), [payments]);
  const schedule = useMemo(() => getSchedule(), []);
  const patientsServed = useMemo(
    () => schedule.filter((s) => s.status === 'completed').length,
    [schedule]
  );

  /* ── state ── */
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [closeShiftModalOpen, setCloseShiftModalOpen] = useState(false);
  const [shiftState, setShiftState] = useState<ShiftState>('active');
  const [isClosing, setIsClosing] = useState(false);

  /* ── handlers ── */
  const handleExport = (format: string) => {
    setExportModalOpen(false);
    showToast(`Summary exported as ${format}`, 'success');
  };

  const handleCloseShift = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setCloseShiftModalOpen(false);
      setShiftState('closed');
      showToast('Shift closed successfully', 'success');
    }, 1500);
  };

  /* ── closed-shift success view ── */
  if (shiftState === 'closed') {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Shift Closed" showBack onBackClick={() => navigate('/r/more')} />

        <div className="flex-1 overflow-y-auto pb-20">
          <div className="flex flex-col items-center text-center px-6 pt-12">
            <div className="w-20 h-20 rounded-full bg-aba-success-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-aba-success-main" />
            </div>
            <h2 className="text-xl font-semibold text-aba-neutral-900 mb-2">
              Shift Closed
            </h2>
            <p className="text-sm text-aba-neutral-600 max-w-[280px] mb-2">
              Great work today, Grace! Your shift has been closed and the summary is saved.
            </p>
            <p className="text-xs text-aba-neutral-400 mb-8">
              Feb 13, 2026 &bull; Mukono Family Clinic
            </p>

            {/* ── Quick stats ── */}
            <div className="w-full bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <MiniStat label="Patients Served" value={String(patientsServed)} />
                <MiniStat label="Total Collected" value={fmtUGX(summary.totalCollected)} />
                <MiniStat label="Wallet" value={fmtUGX(summary.walletTotal)} />
                <MiniStat label="Cash" value={fmtUGX(summary.cashTotal)} />
              </div>
            </div>

            <div className="flex gap-3 w-full max-w-xs">
              <ABAButton
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate('/r/more')}
              >
                Back to More
              </ABAButton>
            </div>
          </div>
        </div>

        <ReceptionistBottomNav />
      </div>
    );
  }

  /* ── active-shift view ── */
  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="End of Day Summary" showBack onBackClick={() => navigate('/r/more')} />

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">

          {/* ── Date header ── */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-aba-neutral-600" />
            <p className="text-xs font-medium text-aba-neutral-600">
              Today &bull; Feb 13, 2026 &bull; Mukono Family Clinic
            </p>
          </div>

          {/* ── Patients Served card ── */}
          <SummaryCard
            icon={<Users className="w-5 h-5 text-aba-secondary-main" />}
            iconBg="bg-aba-secondary-50"
            label="Patients Served"
            value={String(patientsServed)}
            subtitle={`${schedule.length} total scheduled`}
          />

          {/* ── Collection breakdown ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
            <div className="px-4 py-3 bg-aba-neutral-100/50 border-b border-aba-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-aba-neutral-600" />
                <h4 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">
                  Collections
                </h4>
              </div>
              <ABABadge variant="success" size="sm">
                {summary.paidCount} paid
              </ABABadge>
            </div>
            <div className="p-4 space-y-0">
              {/* Wallet */}
              <div className="flex items-center justify-between py-3 border-b border-aba-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-aba-primary-50 flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-4 h-4 text-aba-primary-main" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-aba-neutral-900">Aba Wallet</p>
                    <p className="text-xs text-aba-neutral-400 text-[#8f9aa1]">Digital payments</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-aba-neutral-900">
                  {fmtUGX(summary.walletTotal)}
                </p>
              </div>

              {/* Cash */}
              <div className="flex items-center justify-between py-3 border-b border-aba-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-aba-success-50 flex items-center justify-center flex-shrink-0">
                    <Banknote className="w-4 h-4 text-aba-success-main" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-aba-neutral-900">Cash</p>
                    <p className="text-xs text-aba-neutral-400 text-[#8f9aa1]">Physical payments</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-aba-neutral-900">
                  {fmtUGX(summary.cashTotal)}
                </p>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-3">
                <p className="text-sm font-bold text-aba-neutral-900">Total Collected</p>
                <p className="text-base font-bold text-aba-primary-main">
                  {fmtUGX(summary.totalCollected)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Pending Payments card ── */}
          <SummaryCard
            icon={<Clock className="w-5 h-5 text-aba-warning-main" />}
            iconBg="bg-aba-warning-50"
            label="Pending Payments"
            value={String(summary.pendingCount)}
            subtitle={`${fmtUGX(summary.pendingTotal)} outstanding`}
            alert={summary.pendingCount > 0}
          />

          {/* ── Pending payments warning ── */}
          {summary.pendingCount > 0 && (
            <div className="bg-aba-warning-50/50 rounded-2xl border border-aba-warning-main/20 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-aba-warning-main flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-aba-neutral-900 mb-0.5">
                  {summary.pendingCount} payment{summary.pendingCount > 1 ? 's' : ''} still outstanding
                </p>
                <p className="text-aba-neutral-600 text-[14px]">
                  You can still close your shift — pending payments will carry over to the next session.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Fixed bottom action buttons ── */}
      <div className="flex-shrink-0 border-t border-aba-neutral-200 bg-aba-neutral-0 px-4 py-3 space-y-3">
        <ABAButton
          variant="outline"
          size="lg"
          fullWidth
          onClick={() => setExportModalOpen(true)}
        >
          <Download className="w-5 h-5" />
          Export Summary
        </ABAButton>

        <ABAButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => setCloseShiftModalOpen(true)}
        >
          <Power className="w-5 h-5" />
          Close Shift
          <ArrowRight className="w-4 h-4" />
        </ABAButton>
      </div>

      {/* ── Export Summary Modal ── */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
      />

      {/* ── Close Shift Modal ── */}
      <ABAModal
        isOpen={closeShiftModalOpen}
        onClose={() => setCloseShiftModalOpen(false)}
        title="Close Shift?"
        description={`You're about to close your shift for today. ${
          summary.pendingCount > 0
            ? `${summary.pendingCount} pending payment(s) will carry over.`
            : 'All payments are settled.'
        }`}
        confirmText="Close Shift"
        cancelText="Cancel"
        onConfirm={handleCloseShift}
        isLoading={isClosing}
      />

      <ReceptionistBottomNav />
    </div>
  );
}

/* ─────────── Sub-components ─────────── */

/** Summary stat card */
function SummaryCard({
  icon,
  iconBg,
  label,
  value,
  subtitle,
  alert = false,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  subtitle?: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`bg-aba-neutral-0 rounded-2xl border p-4 flex items-center gap-4 ${
        alert ? 'border-aba-warning-main/30' : 'border-aba-neutral-200'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-aba-neutral-600 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-aba-neutral-900">{value}</p>
        {subtitle && <p className="text-xs text-aba-neutral-400 mt-0.5 text-[#8f9aa1]">{subtitle}</p>}
      </div>
    </div>
  );
}

/** Mini stat for the shift-closed view */
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-aba-neutral-600 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-bold text-aba-neutral-900">{value}</p>
    </div>
  );
}

/** Export format selection bottom-sheet modal */
function ExportModal({
  isOpen,
  onClose,
  onExport,
}: {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: string) => void;
}) {
  if (!isOpen) return null;

  const formats = [
    {
      id: 'pdf',
      label: 'PDF Report',
      desc: 'Formatted summary with clinic branding',
      icon: FileText,
    },
    {
      id: 'csv',
      label: 'CSV Spreadsheet',
      desc: 'Raw data for accounting software',
      icon: FileSpreadsheet,
    },
    {
      id: 'email',
      label: 'Email to Admin',
      desc: 'Send summary to clinic admin inbox',
      icon: Mail,
    },
    {
      id: 'print',
      label: 'Print',
      desc: 'Print a physical copy',
      icon: Printer,
    },
  ];

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 animate-in fade-in duration-200"
      onClick={handleBackdrop}
    >
      <div className="bg-aba-neutral-0 rounded-t-3xl w-full max-w-[390px] p-6 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-aba-neutral-900">Export Summary</h3>
          <button
            onClick={onClose}
            className="p-1 -mt-1 -mr-1 rounded-lg hover:bg-aba-neutral-100 transition-colors text-aba-neutral-600"
          >
            &times;
          </button>
        </div>
        <p className="text-sm text-aba-neutral-600 mb-4">
          Choose a format to export today's end-of-day summary.
        </p>
        <div className="space-y-2">
          {formats.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => onExport(f.label)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-aba-neutral-200 bg-aba-neutral-0 hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-aba-secondary-main" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-aba-neutral-900">{f.label}</p>
                  <p className="text-xs text-aba-neutral-600">{f.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-aba-neutral-400 flex-shrink-0" />
              </button>
            );
          })}
        </div>
        <div className="mt-4">
          <ABAButton variant="text" size="md" fullWidth onClick={onClose}>
            Cancel
          </ABAButton>
        </div>
      </div>
    </div>
  );
}