import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { ABABadge } from '../components/aba/ABABadge';
import { ABAModal } from '../components/aba/ABAModal';
import { KPICard } from '../components/aba/Cards';
import { showToast } from '../components/aba/Toast';
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  UserX,
  Download,
  FileText,
  BarChart3,
  User,
  Clock,
  DollarSign,
} from 'lucide-react';

interface VisitData {
  id: string;
  dateTime: string;
  memberName: string;
  service: string;
  staff: string;
  status: 'completed' | 'cancelled' | 'no-show';
  paymentStatus: 'paid' | 'pending' | 'unpaid';
  notes?: string;
}

const mockVisits: VisitData[] = [
  {
    id: '1',
    dateTime: '2026-02-12 09:00 AM',
    memberName: 'Emma Wilson',
    service: 'General Consultation',
    staff: 'Dr. Sarah Miller',
    status: 'completed',
    paymentStatus: 'paid',
    notes: 'Follow-up in 2 weeks',
  },
  {
    id: '2',
    dateTime: '2026-02-12 09:30 AM',
    memberName: 'James Anderson',
    service: 'Pediatrics',
    staff: 'Dr. Michael Chen',
    status: 'completed',
    paymentStatus: 'paid',
  },
  {
    id: '3',
    dateTime: '2026-02-12 10:00 AM',
    memberName: 'Olivia Brown',
    service: 'Lab Test',
    staff: 'Nurse Lisa Johnson',
    status: 'no-show',
    paymentStatus: 'unpaid',
    notes: 'Patient did not arrive',
  },
  {
    id: '4',
    dateTime: '2026-02-12 10:30 AM',
    memberName: 'Noah Davis',
    service: 'Physical Therapy',
    staff: 'Dr. Sarah Miller',
    status: 'completed',
    paymentStatus: 'pending',
  },
  {
    id: '5',
    dateTime: '2026-02-12 11:00 AM',
    memberName: 'Sophia Martinez',
    service: 'General Consultation',
    staff: 'Dr. Michael Chen',
    status: 'cancelled',
    paymentStatus: 'unpaid',
    notes: 'Rescheduled to next week',
  },
  {
    id: '6',
    dateTime: '2026-02-12 11:30 AM',
    memberName: 'Liam Garcia',
    service: 'Pediatrics',
    staff: 'Dr. Sarah Miller',
    status: 'completed',
    paymentStatus: 'paid',
  },
];

const serviceBreakdown = [
  { service: 'General Consultation', visits: 42, share: 35 },
  { service: 'Pediatrics', visits: 28, share: 23 },
  { service: 'Physical Therapy', visits: 24, share: 20 },
  { service: 'Lab Test', visits: 18, share: 15 },
  { service: 'Dental', visits: 8, share: 7 },
];

const staffBreakdown = [
  { staff: 'Dr. Sarah Miller', visits: 38, completed: 35, noShows: 3 },
  { staff: 'Dr. Michael Chen', visits: 32, completed: 30, noShows: 2 },
  { staff: 'Nurse Lisa Johnson', visits: 24, completed: 22, noShows: 2 },
  { staff: 'Dr. Emily Davis', visits: 18, completed: 17, noShows: 1 },
  { staff: 'Nurse John Smith', visits: 8, completed: 7, noShows: 1 },
];

const dailyVisits = [
  { day: 'Mon', visits: 12 },
  { day: 'Tue', visits: 15 },
  { day: 'Wed', visits: 14 },
  { day: 'Thu', visits: 18 },
  { day: 'Fri', visits: 16 },
  { day: 'Sat', visits: 10 },
  { day: 'Sun', visits: 8 },
];

export function VisitsSummary() {
  const navigate = useNavigate();
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<VisitData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [scheduleReport, setScheduleReport] = useState(false);

  const [filters, setFilters] = useState({
    dateRange: '7days',
    department: 'all',
    service: 'all',
    staff: 'all',
  });

  // Simulated KPI data
  const [kpis, setKpis] = useState({
    totalVisits: { value: 120, change: 12 },
    completed: { value: 98, change: 8 },
    cancelled: { value: 14, change: -5 },
    noShows: { value: 8, change: -3 },
  });

  const handleApplyFilters = () => {
    // Simulate filter application with slight changes to KPIs
    const randomChange = () => Math.floor(Math.random() * 20) - 10;
    setKpis({
      totalVisits: { value: 120 + randomChange(), change: randomChange() },
      completed: { value: 98 + randomChange(), change: randomChange() },
      cancelled: { value: 14 + randomChange(), change: randomChange() },
      noShows: { value: 8 + randomChange(), change: randomChange() },
    });
    setFiltersExpanded(false);
    showToast('Filters applied successfully', 'success');
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: '7days',
      department: 'all',
      service: 'all',
      staff: 'all',
    });
    setKpis({
      totalVisits: { value: 120, change: 12 },
      completed: { value: 98, change: 8 },
      cancelled: { value: 14, change: -5 },
      noShows: { value: 8, change: -3 },
    });
    showToast('Filters reset', 'success');
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    showToast(`Exporting report as ${format.toUpperCase()}...`, 'success');
  };

  const handleVisitClick = (visit: VisitData) => {
    setSelectedVisit(visit);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <ABABadge variant="success" size="sm">Completed</ABABadge>;
      case 'cancelled':
        return <ABABadge variant="warning" size="sm">Cancelled</ABABadge>;
      case 'no-show':
        return <ABABadge variant="error" size="sm">No-show</ABABadge>;
      default:
        return null;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <ABABadge variant="success" size="sm">Paid</ABABadge>;
      case 'pending':
        return <ABABadge variant="warning" size="sm">Pending</ABABadge>;
      case 'unpaid':
        return <ABABadge variant="error" size="sm">Unpaid</ABABadge>;
      default:
        return null;
    }
  };

  const maxVisits = Math.max(...dailyVisits.map(d => d.visits));

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Visits Summary"
        showBack
        onBackClick={() => navigate('/reports-home')}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Filters Card */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 overflow-hidden">
            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="w-full flex items-center justify-between p-4 hover:bg-aba-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-aba-secondary-main" />
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  Filters
                </h3>
              </div>
              {filtersExpanded ? (
                <ChevronUp className="w-5 h-5 text-aba-neutral-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-aba-neutral-600" />
              )}
            </button>

            {filtersExpanded && (
              <div className="p-4 pt-0 space-y-4 border-t border-aba-neutral-200">
                {/* Date Range */}
                <div>
                  <label className="block text-xs font-medium text-aba-neutral-700 mb-2">
                    Date Range
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['today', '7days', '30days', 'custom'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setFilters({ ...filters, dateRange: range })}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          filters.dateRange === range
                            ? 'bg-aba-primary-main text-white'
                            : 'bg-aba-neutral-100 text-aba-neutral-700 hover:bg-aba-neutral-200'
                        }`}
                      >
                        {range === 'today' && 'Today'}
                        {range === '7days' && '7 Days'}
                        {range === '30days' && '30 Days'}
                        {range === 'custom' && 'Custom'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-medium text-aba-neutral-700 mb-2">
                    Department
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-aba-neutral-300 rounded-lg text-sm text-aba-neutral-900 focus:outline-none focus:ring-2 focus:ring-aba-primary-main focus:border-transparent"
                  >
                    <option value="all">All Departments</option>
                    <option value="opd">OPD</option>
                    <option value="lab">Lab</option>
                    <option value="pharmacy">Pharmacy</option>
                  </select>
                </div>

                {/* Service */}
                <div>
                  <label className="block text-xs font-medium text-aba-neutral-700 mb-2">
                    Service
                  </label>
                  <select
                    value={filters.service}
                    onChange={(e) => setFilters({ ...filters, service: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-aba-neutral-300 rounded-lg text-sm text-aba-neutral-900 focus:outline-none focus:ring-2 focus:ring-aba-primary-main focus:border-transparent"
                  >
                    <option value="all">All Services</option>
                    <option value="general">General Consultation</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="therapy">Physical Therapy</option>
                    <option value="lab">Lab Test</option>
                  </select>
                </div>

                {/* Staff */}
                <div>
                  <label className="block text-xs font-medium text-aba-neutral-700 mb-2">
                    Staff
                  </label>
                  <select
                    value={filters.staff}
                    onChange={(e) => setFilters({ ...filters, staff: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-aba-neutral-300 rounded-lg text-sm text-aba-neutral-900 focus:outline-none focus:ring-2 focus:ring-aba-primary-main focus:border-transparent"
                  >
                    <option value="all">All Staff</option>
                    <option value="miller">Dr. Sarah Miller</option>
                    <option value="chen">Dr. Michael Chen</option>
                    <option value="johnson">Nurse Lisa Johnson</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleResetFilters}
                    className="text-sm font-medium text-aba-secondary-main hover:text-aba-secondary-600 transition-colors"
                  >
                    Reset
                  </button>
                  <ABAButton
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={handleApplyFilters}
                  >
                    Apply Filters
                  </ABAButton>
                </div>
              </div>
            )}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Visits */}
            <KPICard
              title="Total Visits"
              value={kpis.totalVisits.value}
              icon={<Users className="w-4 h-4" />}
              variant="dark"
              trend={{
                value: `${Math.abs(kpis.totalVisits.change)}% vs prev`,
                positive: kpis.totalVisits.change >= 0,
              }}
            />

            {/* Completed */}
            <KPICard
              title="Completed"
              value={kpis.completed.value}
              variant="dark"
              icon={<CheckCircle className="w-4 h-4" />}
              trend={{
                value: `${Math.abs(kpis.completed.change)}% vs prev`,
                positive: kpis.completed.change >= 0,
              }}
            />

            {/* Cancelled */}
            <KPICard
              title="Cancelled"
              value={kpis.cancelled.value}
              variant="dark"
              icon={<XCircle className="w-4 h-4" />}
              trend={{
                value: `${Math.abs(kpis.cancelled.change)}% vs prev`,
                positive: kpis.cancelled.change >= 0,
                direction: kpis.cancelled.change >= 0 ? 'up' : 'down',
              }}
            />

            {/* No-shows */}
            <KPICard
              title="No-shows"
              value={kpis.noShows.value}
              variant="dark"
              icon={<UserX className="w-4 h-4" />}
              trend={{
                value: `${Math.abs(kpis.noShows.change)}% vs prev`,
                positive: kpis.noShows.change >= 0,
                direction: kpis.noShows.change >= 0 ? 'up' : 'down',
              }}
            />
          </div>

          {/* Visits Trend Chart */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-4">
              Visits Trend (Last 7 Days)
            </h3>
            <div className="flex items-end justify-between gap-2 h-40 mb-3">
              {dailyVisits.map((day, index) => {
                const height = (day.visits / maxVisits) * 100;
                const isPeak = day.visits === maxVisits;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center h-32">
                      <div
                        className={`w-full max-w-[32px] rounded-t-lg transition-all hover:opacity-80 cursor-pointer ${
                          isPeak ? 'bg-aba-primary-main' : 'bg-aba-primary-200'
                        }`}
                        style={{ height: `${height}%` }}
                        title={`${day.day}: ${day.visits} visits`}
                      />
                    </div>
                    <p className="text-xs font-medium text-aba-neutral-600">{day.day}</p>
                  </div>
                );
              })}
            </div>
            <div className="bg-aba-primary-50 rounded-lg p-3">
              <p className="text-xs text-aba-neutral-700">
                <span className="font-medium">Peak day:</span> Thursday (18 visits)
              </p>
            </div>
          </div>

          {/* Visits by Service */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-4">
              Visits by Service
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-aba-neutral-200">
                    <th className="text-left text-xs font-medium text-aba-neutral-600 pb-3">
                      Service
                    </th>
                    <th className="text-right text-xs font-medium text-aba-neutral-600 pb-3">
                      Visits
                    </th>
                    <th className="text-right text-xs font-medium text-aba-neutral-600 pb-3">
                      Share %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {serviceBreakdown.map((item, index) => (
                    <tr key={index} className="border-b border-aba-neutral-100 last:border-0">
                      <td className="text-sm text-aba-neutral-900 py-3">{item.service}</td>
                      <td className="text-sm font-medium text-aba-neutral-900 text-right">
                        {item.visits}
                      </td>
                      <td className="text-sm text-aba-neutral-600 text-right">
                        {item.share}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visits by Staff */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-4">
              Visits by Staff
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-aba-neutral-200">
                    <th className="text-left text-xs font-medium text-aba-neutral-600 pb-3">
                      Staff
                    </th>
                    <th className="text-right text-xs font-medium text-aba-neutral-600 pb-3">
                      Visits
                    </th>
                    <th className="text-right text-xs font-medium text-aba-neutral-600 pb-3">
                      Completed
                    </th>
                    <th className="text-right text-xs font-medium text-aba-neutral-600 pb-3">
                      No-shows
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {staffBreakdown.map((item, index) => (
                    <tr key={index} className="border-b border-aba-neutral-100 last:border-0">
                      <td className="text-sm text-aba-neutral-900 py-3">{item.staff}</td>
                      <td className="text-sm font-medium text-aba-neutral-900 text-right">
                        {item.visits}
                      </td>
                      <td className="text-sm text-aba-success-main text-right">
                        {item.completed}
                      </td>
                      <td className="text-sm text-aba-error-main text-right">
                        {item.noShows}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Visits */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-4">
              Recent Visits
            </h3>
            <div className="space-y-3">
              {mockVisits.map((visit) => (
                <button
                  key={visit.id}
                  onClick={() => handleVisitClick(visit)}
                  className="w-full bg-aba-neutral-50 rounded-xl p-3 border border-aba-neutral-200 hover:bg-aba-neutral-100 transition-colors text-left"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-aba-neutral-600" />
                      <p className="text-sm font-medium text-aba-neutral-900">
                        {visit.memberName}
                      </p>
                    </div>
                    {getStatusBadge(visit.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-aba-neutral-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {visit.dateTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {visit.service}
                    </div>
                  </div>
                  <p className="text-xs text-aba-neutral-500 mt-1">Staff: {visit.staff}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Export & Schedule */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-4">
              Export & Schedule
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <ABAButton
                  variant="outline"
                  size="md"
                  onClick={() => handleExport('pdf')}
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </ABAButton>
                <ABAButton
                  variant="outline"
                  size="md"
                  onClick={() => handleExport('excel')}
                >
                  <Download className="w-4 h-4" />
                  Export Excel
                </ABAButton>
              </div>
              <div className="flex items-center justify-between p-3 bg-aba-neutral-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-aba-secondary-main" />
                  <span className="text-sm text-aba-neutral-900">Schedule weekly report</span>
                </div>
                <button
                  onClick={() => {
                    setScheduleReport(!scheduleReport);
                    showToast(
                      scheduleReport ? 'Weekly report disabled' : 'Weekly report enabled',
                      'success'
                    );
                  }}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    scheduleReport ? 'bg-aba-primary-main' : 'bg-aba-neutral-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      scheduleReport ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visit Detail Modal */}
      <ABAModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedVisit(null);
        }}
        title="Visit Details"
      >
        {selectedVisit && (
          <div className="space-y-4">
            {/* Member Info */}
            <div className="bg-aba-neutral-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-aba-primary-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-aba-primary-main" />
                </div>
                <div>
                  <p className="text-base font-semibold text-aba-neutral-900">
                    {selectedVisit.memberName}
                  </p>
                  <p className="text-sm text-aba-neutral-600">{selectedVisit.dateTime}</p>
                </div>
              </div>
            </div>

            {/* Visit Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <p className="text-sm text-aba-neutral-600">Service</p>
                <p className="text-sm font-medium text-aba-neutral-900">
                  {selectedVisit.service}
                </p>
              </div>
              <div className="flex justify-between items-start">
                <p className="text-sm text-aba-neutral-600">Staff</p>
                <p className="text-sm font-medium text-aba-neutral-900">
                  {selectedVisit.staff}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-aba-neutral-600">Status</p>
                {getStatusBadge(selectedVisit.status)}
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-aba-neutral-600">Payment</p>
                {getPaymentBadge(selectedVisit.paymentStatus)}
              </div>
              {selectedVisit.notes && (
                <div className="pt-3 border-t border-aba-neutral-200">
                  <p className="text-sm text-aba-neutral-600 mb-1">Notes</p>
                  <p className="text-sm text-aba-neutral-900">{selectedVisit.notes}</p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <ABAButton
              variant="outline"
              size="md"
              fullWidth
              onClick={() => {
                setShowDetailModal(false);
                setSelectedVisit(null);
              }}
            >
              Close
            </ABAButton>
          </div>
        )}
      </ABAModal>
    </div>
  );
}