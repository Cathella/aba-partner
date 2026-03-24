/**
 * AC-06 Financial Reports — Report categories with detail navigation.
 * Inner page: back arrow, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ACExportModal } from '../components/aba/ACExportModal';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  FileBarChart2,
  Calendar,
  ChevronRight,
  Download,
} from 'lucide-react';

interface ReportItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
}

const reports: ReportItem[] = [
  {
    id: 'daily',
    label: 'Daily Revenue Report',
    description: 'Breakdown of revenue by service, method, and status',
    icon: <BarChart3 className="w-5 h-5 text-[#32C28A]" />,
    iconBg: 'bg-[#E9F8F0]',
  },
  {
    id: 'weekly',
    label: 'Weekly Summary',
    description: 'Aggregated revenue and trends for the past 7 days',
    icon: <TrendingUp className="w-5 h-5 text-[#3A8DFF]" />,
    iconBg: 'bg-[#E8F2FF]',
  },
  {
    id: 'method',
    label: 'Payment Method Breakdown',
    description: 'Revenue split by Cash, Mobile Money, Card, Insurance',
    icon: <PieChart className="w-5 h-5 text-[#8B5CF6]" />,
    iconBg: 'bg-[#F5F3FF]',
  },
  {
    id: 'outstanding',
    label: 'Outstanding & Disputes',
    description: 'Pending payments, failed transactions, and open disputes',
    icon: <FileBarChart2 className="w-5 h-5 text-[#E44F4F]" />,
    iconBg: 'bg-[#FDECEC]',
  },
  {
    id: 'monthly',
    label: 'Monthly Reconciliation',
    description: 'Full monthly reconciliation with settlement matching',
    icon: <Calendar className="w-5 h-5 text-[#D97706]" />,
    iconBg: 'bg-[#FFF3DC]',
  },
];

export function ACReports() {
  const navigate = useNavigate();
  const [showExport, setShowExport] = useState(false);

  const handleReportTap = (id: string) => {
    navigate(`/ac/report/${id}`);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar
        title="Financial Reports"
        showBack
        onBackClick={() => navigate(-1)}
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

          {/* Header */}
          <div className="bg-[#E8F2FF] rounded-2xl p-4">
            <p className="text-sm font-medium text-[#1A1A1A]">Financial Reports</p>
            <p className="text-xs text-[#4A4F55] mt-1">
              Generate and export financial reports. Data covers all clinic transactions.
            </p>
          </div>

          {/* Report list */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => handleReportTap(report.id)}
                className="w-full flex items-center gap-3 px-4 py-4 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
              >
                <div className={`w-10 h-10 rounded-xl ${report.iconBg} flex items-center justify-center flex-shrink-0`}>
                  {report.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A]">{report.label}</p>
                  <p className="text-xs text-[#8F9AA1] mt-0.5 leading-relaxed">{report.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <ACExportModal isOpen={showExport} onClose={() => setShowExport(false)} title="Export Report" />
    </div>
  );
}