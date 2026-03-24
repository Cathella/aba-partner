/**
 * AC-09 Reports & Exports — Generate and export financial reports.
 *
 * Cards:
 *   1. Daily Collections Report
 *   2. Cash Reconciliation Report
 *   3. Settlements Statement
 *
 * Each card opens an export modal with format (PDF / CSV) and date range.
 * Main navigation page: bottom nav present.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AccountantBottomNav } from '../components/aba/AccountantBottomNav';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import {
  Banknote,
  BarChart3,
  Landmark,
  FileText,
  FileSpreadsheet,
  Download,
  CalendarDays,
  X,
  ChevronDown,
  Clock,
  CheckCircle2,
} from 'lucide-react';

/* ── report definitions ── */

interface ReportDef {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  lastGenerated?: string;
}

const reports: ReportDef[] = [
  {
    id: 'daily-collections',
    title: 'Daily Collections Report',
    description:
      'Itemised summary of all payments collected per day — by service category, payment method, and transaction status.',
    icon: <BarChart3 className="w-6 h-6 text-[#32C28A]" />,
    iconBg: 'bg-[#E9F8F0]',
    lastGenerated: '14 Feb 2026, 06:00 PM',
  },
  {
    id: 'cash-reconciliation',
    title: 'Cash Reconciliation Report',
    description:
      'Compares system-recorded cash totals against physical cash counts, highlighting variances by shift and date.',
    icon: <Banknote className="w-6 h-6 text-[#D97706]" />,
    iconBg: 'bg-[#FFF3DC]',
    lastGenerated: '13 Feb 2026, 06:15 PM',
  },
  {
    id: 'settlements-statement',
    title: 'Settlements Statement',
    description:
      'Detailed payout statement covering all settlement batches — including deductions, refunds, and payout destinations.',
    icon: <Landmark className="w-6 h-6 text-[#3A8DFF]" />,
    iconBg: 'bg-[#E8F2FF]',
    lastGenerated: '12 Feb 2026, 11:30 PM',
  },
];

/* ── date range presets ── */

type RangeKey = 'today' | 'yesterday' | '7d' | '30d' | 'custom';

interface RangeOption {
  key: RangeKey;
  label: string;
  from: string;
  to: string;
}

const ranges: RangeOption[] = [
  { key: 'today', label: 'Today', from: '2026-02-15', to: '2026-02-15' },
  { key: 'yesterday', label: 'Yesterday', from: '2026-02-14', to: '2026-02-14' },
  { key: '7d', label: 'Last 7 Days', from: '2026-02-09', to: '2026-02-15' },
  { key: '30d', label: 'Last 30 Days', from: '2026-01-17', to: '2026-02-15' },
  { key: 'custom', label: 'Custom Range', from: '', to: '' },
];

/* ── format options ── */

type FormatKey = 'pdf' | 'csv';

const formats: { key: FormatKey; label: string; subtitle: string; icon: React.ReactNode; iconBg: string }[] = [
  {
    key: 'pdf',
    label: 'PDF',
    subtitle: 'Print-ready document',
    icon: <FileText className="w-5 h-5 text-[#E44F4F]" />,
    iconBg: 'bg-[#FDECEC]',
  },
  {
    key: 'csv',
    label: 'CSV',
    subtitle: 'Spreadsheet-compatible',
    icon: <FileSpreadsheet className="w-5 h-5 text-[#38C172]" />,
    iconBg: 'bg-[#E9F8F0]',
  },
];

/* ════════════════════════════════════════ */

export function ACReportsExports() {
  const navigate = useNavigate();

  /* modal state */
  const [activeReport, setActiveReport] = useState<ReportDef | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<FormatKey>('pdf');
  const [selectedRange, setSelectedRange] = useState<RangeKey>('7d');
  const [customFrom, setCustomFrom] = useState('2026-02-01');
  const [customTo, setCustomTo] = useState('2026-02-15');
  const [isExporting, setIsExporting] = useState(false);
  const [rangeDropOpen, setRangeDropOpen] = useState(false);

  const openExport = (report: ReportDef) => {
    setActiveReport(report);
    setSelectedFormat('pdf');
    setSelectedRange('7d');
    setRangeDropOpen(false);
  };

  const closeExport = () => {
    setActiveReport(null);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      closeExport();
      showToast(
        `${activeReport?.title ?? 'Report'} exported as ${selectedFormat.toUpperCase()} — saved to Downloads`,
        'success',
      );
    }, 800);
  };

  const activeRange = ranges.find((r) => r.key === selectedRange)!;

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      {/* ═══ Header ═══ */}
      <div className="bg-[#FFFFFF] border-b border-[#E5E8EC] px-4 h-14 flex items-center flex-shrink-0">
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Reports & Exports</h1>
      </div>

      {/* ═══ Content ═══ */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-3">
          {/* Intro */}
          <div className="bg-[#E8F2FF] rounded-2xl p-4">
            <p className="text-sm font-medium text-[#1A1A1A]">Generate Financial Reports</p>
            <p className="text-xs text-[#4A4F55] mt-1 leading-relaxed">
              Choose a report type below. Select a date range and export format,
              then tap Export to generate.
            </p>
          </div>

          {/* Report cards */}
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => openExport(report)}
              className="w-full bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-5 text-left hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl ${report.iconBg} flex items-center justify-center flex-shrink-0`}
                >
                  {report.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#1A1A1A]">{report.title}</p>
                    <Download className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
                  </div>
                  <p className="text-xs text-[#8F9AA1] mt-1 leading-relaxed">
                    {report.description}
                  </p>
                  {report.lastGenerated && (
                    <div className="flex items-center gap-1 mt-2.5">
                      <Clock className="w-3 h-3 text-[#C9D0DB]" />
                      <span className="text-[#C9D0DB] text-[12px]">
                        Last generated: {report.lastGenerated}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}

          {/* Quick-export history (sample) */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC]">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Recent Exports
              </h3>
            </div>
            {[
              {
                id: 'exp-1',
                label: 'Daily Collections — 14 Feb',
                format: 'PDF',
                time: '14 Feb, 06:00 PM',
              },
              {
                id: 'exp-2',
                label: 'Cash Reconciliation — 13 Feb',
                format: 'CSV',
                time: '13 Feb, 06:15 PM',
              },
              {
                id: 'exp-3',
                label: 'Settlements Statement — Week 6',
                format: 'PDF',
                time: '12 Feb, 11:30 PM',
              },
            ].map((exp) => (
              <div
                key={exp.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E8EC] last:border-b-0"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    exp.format === 'PDF' ? 'bg-[#FDECEC]' : 'bg-[#E9F8F0]'
                  }`}
                >
                  {exp.format === 'PDF' ? (
                    <FileText className="w-4 h-4 text-[#E44F4F]" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4 text-[#38C172]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1A1A1A] truncate">{exp.label}</p>
                  <p className="text-[#C9D0DB] mt-0.5 text-[12px]">{exp.time}</p>
                </div>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full ${ exp.format === 'PDF' ? 'bg-[#FDECEC] text-[#E44F4F]' : 'bg-[#E9F8F0] text-[#38C172]' } text-[12px]`}
                >
                  {exp.format}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AccountantBottomNav />

      {/* ═══ Export Modal ═══ */}
      {activeReport && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeExport();
          }}
        >
          <div className="bg-[#FFFFFF] rounded-t-3xl w-full pb-8 max-h-[85vh] flex flex-col">
            {/* Handle */}
            <div className="flex justify-center py-3 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-[#C9D0DB]" />
            </div>

            {/* Header */}
            <div className="px-5 flex items-start justify-between mb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${activeReport.iconBg} flex items-center justify-center flex-shrink-0`}
                >
                  {activeReport.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] text-[18px]">Export Report</h3>
                  <p className="text-xs text-[#8F9AA1] mt-0.5">{activeReport.title}</p>
                </div>
              </div>
              <button
                onClick={closeExport}
                className="p-1 rounded-lg hover:bg-[#F7F9FC] transition-colors"
              >
                <X className="w-5 h-5 text-[#8F9AA1]" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 space-y-5 flex-1">
              {/* Format selector */}
              <div>
                <label className="block text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-2">
                  Format
                </label>
                <div className="flex gap-2">
                  {formats.map((fmt) => {
                    const isActive = selectedFormat === fmt.key;
                    return (
                      <button
                        key={fmt.key}
                        onClick={() => setSelectedFormat(fmt.key)}
                        className={`flex-1 flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${
                          isActive
                            ? 'border-[#32C28A] bg-[#E9F8F0]/40'
                            : 'border-[#E5E8EC] bg-[#FFFFFF] hover:bg-[#F7F9FC]'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg ${fmt.iconBg} flex items-center justify-center flex-shrink-0`}
                        >
                          {fmt.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1A1A1A]">{fmt.label}</p>
                          <p className="text-[#8F9AA1] text-[10px]">{fmt.subtitle}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date range selector */}
              <div>
                <label className="block text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-2">
                  Date Range
                </label>

                {/* Range dropdown */}
                <div className="relative mb-2">
                  <button
                    onClick={() => setRangeDropOpen(!rangeDropOpen)}
                    className="w-full h-11 px-3 rounded-[14px] border border-[#E5E8EC] bg-[#F7F9FC] text-left flex items-center justify-between transition-all hover:border-[#C9D0DB]"
                  >
                    <span className="flex items-center gap-2 text-sm text-[#1A1A1A]">
                      <CalendarDays className="w-4 h-4 text-[#8F9AA1]" />
                      {activeRange.label}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#8F9AA1] transition-transform ${
                        rangeDropOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {rangeDropOpen && (
                    <div className="absolute left-0 right-0 top-12 bg-[#FFFFFF] border border-[#E5E8EC] rounded-xl shadow-lg z-10 overflow-hidden">
                      {ranges.map((r) => (
                        <button
                          key={r.key}
                          onClick={() => {
                            setSelectedRange(r.key);
                            setRangeDropOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 text-sm text-left transition-colors hover:bg-[#F7F9FC] border-b border-[#E5E8EC] last:border-b-0 flex items-center justify-between ${
                            selectedRange === r.key
                              ? 'bg-[#E9F8F0] text-[#32C28A] font-semibold'
                              : 'text-[#1A1A1A]'
                          }`}
                        >
                          {r.label}
                          {selectedRange === r.key && (
                            <CheckCircle2 className="w-4 h-4 text-[#32C28A]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom date inputs */}
                {selectedRange === 'custom' && (
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1">
                      <label className="block text-[10px] text-[#8F9AA1] mb-1">From</label>
                      <input
                        type="date"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-[#8F9AA1] mb-1">To</label>
                      <input
                        type="date"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Range preview */}
                {selectedRange !== 'custom' && (
                  <p className="text-[10px] text-[#C9D0DB] mt-1">
                    {activeRange.from} &mdash; {activeRange.to}
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="bg-[#F7F9FC] rounded-xl p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#8F9AA1]">Report</span>
                  <span className="font-medium text-[#1A1A1A]">{activeReport.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8F9AA1]">Format</span>
                  <span className="font-medium text-[#1A1A1A]">
                    {selectedFormat.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8F9AA1]">Period</span>
                  <span className="font-medium text-[#1A1A1A]">{activeRange.label}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="px-5 mt-5 space-y-2 flex-shrink-0">
              <ABAButton
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleExport}
                isLoading={isExporting}
              >
                <Download className="w-5 h-5" />
                Export
              </ABAButton>
              <ABAButton variant="outline" fullWidth onClick={closeExport}>
                Cancel
              </ABAButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}