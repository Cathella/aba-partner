import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { BottomNav } from '../components/aba/BottomNav';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import {
  ChevronLeft,
  Download,
  FileText,
  Calendar,
  TrendingUp,
} from 'lucide-react';

type ReportType = 'visits' | 'revenue' | 'booking-trends';

interface ReportConfig {
  title: string;
  description: string;
}

const reportConfigs: Record<ReportType, ReportConfig> = {
  visits: {
    title: 'Visits Summary Report',
    description: 'Patient visits, attendance rates, and no-show analysis',
  },
  revenue: {
    title: 'Revenue Report',
    description: 'Income analysis, settlements, and payment method breakdown',
  },
  'booking-trends': {
    title: 'Booking Trends Report',
    description: 'Booking patterns, peak times, and service demand analysis',
  },
};

// Mock data for charts
const visitsData = [
  { day: 'Mon', visits: 45, noShows: 3 },
  { day: 'Tue', visits: 52, noShows: 2 },
  { day: 'Wed', visits: 48, noShows: 5 },
  { day: 'Thu', visits: 61, noShows: 4 },
  { day: 'Fri', visits: 55, noShows: 2 },
  { day: 'Sat', visits: 38, noShows: 1 },
  { day: 'Sun', visits: 25, noShows: 0 },
];

const revenueData = [
  { method: 'ABA Wallet', amount: 4850000, percentage: 56 },
  { method: 'Mobile Money', amount: 2680000, percentage: 31 },
  { method: 'Cash', amount: 1240000, percentage: 13 },
];

const bookingTrendsData = [
  { time: '09:00 AM', bookings: 12 },
  { time: '10:00 AM', bookings: 15 },
  { time: '11:00 AM', bookings: 18 },
  { time: '02:00 PM', bookings: 14 },
  { time: '03:00 PM', bookings: 11 },
  { time: '04:00 PM', bookings: 8 },
];

export function ReportViewer() {
  const navigate = useNavigate();
  const { reportType } = useParams<{ reportType: ReportType }>();
  const [activeTab, setActiveTab] = useState('reports');
  const [startDate, setStartDate] = useState('2026-02-01');
  const [endDate, setEndDate] = useState('2026-02-11');

  if (!reportType || !reportConfigs[reportType]) {
    return (
      <div className="flex flex-col h-screen bg-aba-bg-primary">
        <AppTopBar
          title="Report Viewer"
          leftAction={
            <button
              onClick={() => navigate('/reports-home')}
              className="p-2 -ml-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-aba-neutral-900" />
            </button>
          }
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-aba-neutral-600">Report not found</p>
        </div>
      </div>
    );
  }

  const config = reportConfigs[reportType];

  const handleExportPDF = () => {
    showToast('PDF export started', 'success');
  };

  const handleExportExcel = () => {
    showToast('Excel export started', 'success');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title={config.title}
        leftAction={
          <button
            onClick={() => navigate('/reports-home')}
            className="p-2 -ml-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-aba-neutral-900" />
          </button>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {/* Description */}
          <div className="bg-aba-secondary-50 border border-aba-secondary-200 rounded-xl p-4">
            <p className="text-sm text-aba-neutral-900">{config.description}</p>
          </div>

          {/* Date Range Filter */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-aba-primary-main" />
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Date Range
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-aba-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-aba-secondary-main"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-aba-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-aba-secondary-main"
                />
              </div>
            </div>
            <p className="text-xs text-aba-neutral-500 mt-2">
              Showing data from {formatDate(startDate)} to {formatDate(endDate)}
            </p>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-aba-primary-main" />
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  Visual Overview
                </h3>
              </div>
            </div>

            {/* Simple Bar Chart Visualization */}
            {reportType === 'visits' && (
              <div className="space-y-3">
                {visitsData.map((data) => {
                  const maxVisits = Math.max(...visitsData.map((d) => d.visits));
                  const percentage = (data.visits / maxVisits) * 100;
                  return (
                    <div key={data.day}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-aba-neutral-700">
                          {data.day}
                        </span>
                        <span className="text-xs text-aba-neutral-600">
                          {data.visits} visits ({data.noShows} no-shows)
                        </span>
                      </div>
                      <div className="h-2 bg-aba-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-aba-primary-main rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {reportType === 'revenue' && (
              <div className="space-y-3">
                {revenueData.map((data) => (
                  <div key={data.method}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-aba-neutral-700">
                        {data.method}
                      </span>
                      <span className="text-xs text-aba-neutral-600">
                        UGX {data.amount.toLocaleString()} ({data.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-aba-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-aba-success-main rounded-full transition-all"
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {reportType === 'booking-trends' && (
              <div className="space-y-3">
                {bookingTrendsData.map((data) => {
                  const maxBookings = Math.max(
                    ...bookingTrendsData.map((d) => d.bookings)
                  );
                  const percentage = (data.bookings / maxBookings) * 100;
                  return (
                    <div key={data.time}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-aba-neutral-700">
                          {data.time}
                        </span>
                        <span className="text-xs text-aba-neutral-600">
                          {data.bookings} bookings
                        </span>
                      </div>
                      <div className="h-2 bg-aba-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-aba-secondary-main rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Table Preview */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-aba-primary-main" />
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Data Preview
              </h3>
            </div>

            {reportType === 'visits' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-aba-neutral-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-aba-neutral-700">
                        Day
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-aba-neutral-700">
                        Visits
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-aba-neutral-700">
                        No-Shows
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-aba-neutral-700">
                        Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitsData.map((data) => {
                      const rate = (
                        ((data.visits - data.noShows) / data.visits) *
                        100
                      ).toFixed(1);
                      return (
                        <tr
                          key={data.day}
                          className="border-b border-aba-neutral-100 last:border-0"
                        >
                          <td className="py-2 px-3 text-aba-neutral-900">
                            {data.day}
                          </td>
                          <td className="py-2 px-3 text-right text-aba-neutral-900 font-medium">
                            {data.visits}
                          </td>
                          <td className="py-2 px-3 text-right text-aba-error-main font-medium">
                            {data.noShows}
                          </td>
                          <td className="py-2 px-3 text-right text-aba-success-main font-medium">
                            {rate}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'revenue' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-aba-neutral-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-aba-neutral-700">
                        Payment Method
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-aba-neutral-700">
                        Amount
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-aba-neutral-700">
                        Share
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.map((data) => (
                      <tr
                        key={data.method}
                        className="border-b border-aba-neutral-100 last:border-0"
                      >
                        <td className="py-2 px-3 text-aba-neutral-900">
                          {data.method}
                        </td>
                        <td className="py-2 px-3 text-right text-aba-neutral-900 font-medium">
                          UGX {data.amount.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right text-aba-success-main font-medium">
                          {data.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'booking-trends' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-aba-neutral-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-aba-neutral-700">
                        Time Slot
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-aba-neutral-700">
                        Bookings
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-aba-neutral-700">
                        Demand
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingTrendsData.map((data) => {
                      const maxBookings = Math.max(
                        ...bookingTrendsData.map((d) => d.bookings)
                      );
                      const demand =
                        data.bookings === maxBookings
                          ? 'High'
                          : data.bookings > maxBookings * 0.6
                          ? 'Medium'
                          : 'Low';
                      return (
                        <tr
                          key={data.time}
                          className="border-b border-aba-neutral-100 last:border-0"
                        >
                          <td className="py-2 px-3 text-aba-neutral-900">
                            {data.time}
                          </td>
                          <td className="py-2 px-3 text-right text-aba-neutral-900 font-medium">
                            {data.bookings}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                demand === 'High'
                                  ? 'bg-aba-error-50 text-aba-error-main'
                                  : demand === 'Medium'
                                  ? 'bg-aba-warning-50 text-aba-warning-main'
                                  : 'bg-aba-success-50 text-aba-success-main'
                              }`}
                            >
                              {demand}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Export Buttons */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
              Export Report
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <ABAButton
                variant="primary"
                size="md"
                onClick={handleExportPDF}
              >
                <Download className="w-5 h-5" />
                Export PDF
              </ABAButton>
              <ABAButton
                variant="secondary"
                size="md"
                onClick={handleExportExcel}
              >
                <Download className="w-5 h-5" />
                Export Excel
              </ABAButton>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}