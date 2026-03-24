import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { BottomNav } from '../components/aba/BottomNav';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Clock,
  Settings,
} from 'lucide-react';

interface ReportTile {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
}

const reportTiles: ReportTile[] = [
  {
    id: 'visits',
    title: 'Visits Summary',
    description: 'Track visit volume, services, staff load',
    icon: Calendar,
    color: 'text-aba-primary-main',
    bgColor: 'bg-aba-primary-50',
  },
  {
    id: 'revenue',
    title: 'Revenue Report',
    description: 'Income, settlements, and payment methods',
    icon: DollarSign,
    color: 'text-aba-success-main',
    bgColor: 'bg-aba-success-50',
  },
  {
    id: 'booking-trends',
    title: 'Booking Trends',
    description: 'Booking patterns and peak times',
    icon: TrendingUp,
    color: 'text-aba-secondary-main',
    bgColor: 'bg-aba-secondary-50',
  },
];

const quickStats = [
  {
    label: 'Reports Generated',
    value: '127',
    subtext: 'This month',
  },
  {
    label: 'Scheduled Reports',
    value: '3',
    subtext: 'Active schedules',
  },
];

export function ReportsHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reports');

  const handleReportClick = (reportId: string) => {
    if (reportId === 'visits') {
      navigate('/visits-summary');
    } else if (reportId === 'revenue') {
      navigate('/finance-overview');
    } else if (reportId === 'booking-trends') {
      navigate('/bookings-list');
    } else {
      navigate(`/report-viewer/${reportId}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Reports"
        rightAction={
          <button
            onClick={() => navigate('/schedule-reports')}
            className="p-2 -mr-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
          >
            <Settings className="w-5 h-5 text-aba-neutral-900" />
          </button>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            {quickStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl border border-aba-neutral-200 p-4"
              >
                <p className="text-xs text-aba-neutral-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-aba-neutral-900 mb-0.5">
                  {stat.value}
                </p>
                <p className="text-xs text-aba-neutral-500">{stat.subtext}</p>
              </div>
            ))}
          </div>

          {/* Report Types */}
          <div>
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
              Report Types
            </h3>
            <div className="space-y-3">
              {reportTiles.map((report) => {
                const IconComponent = report.icon;
                return (
                  <button
                    key={report.id}
                    onClick={() => handleReportClick(report.id)}
                    className="w-full bg-white rounded-2xl border border-aba-neutral-200 p-4 hover:border-aba-primary-main hover:shadow-sm transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${report.bgColor} flex items-center justify-center flex-shrink-0`}
                      >
                        <IconComponent className={`w-6 h-6 ${report.color}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-aba-neutral-900 mb-1 text-[14px]">
                          {report.title}
                        </h4>
                        <p className="text-aba-neutral-600 text-[12px]">
                          {report.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <FileText className="w-5 h-5 text-aba-neutral-400" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Reports */}
          <div>
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
              Recent Reports
            </h3>
            <div className="bg-white rounded-2xl border border-aba-neutral-200 divide-y divide-aba-neutral-200">
              {[
                {
                  name: 'Revenue Report - February 2026',
                  date: 'Feb 11, 2026',
                  type: 'Revenue',
                },
                {
                  name: 'Visits Summary - Week 6',
                  date: 'Feb 10, 2026',
                  type: 'Visits',
                },
                {
                  name: 'Booking Trends - January 2026',
                  date: 'Feb 1, 2026',
                  type: 'Trends',
                },
              ].map((report, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 hover:bg-aba-neutral-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-aba-neutral-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-aba-neutral-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-aba-neutral-900 truncate">
                      {report.name}
                    </p>
                    <p className="text-xs text-aba-neutral-600">{report.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Reports CTA */}
          <div className="bg-aba-secondary-main rounded-2xl p-6 text-white bg-[#000000]">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold mb-1">
                  Automate Your Reports
                </h4>
                <p className="opacity-90 text-[14px] text-[#c9d0db]">
                  Schedule weekly or monthly reports to be sent directly to your
                  email
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/schedule-reports')}
              className="w-full bg-white text-aba-secondary-main px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-white/90 transition-colors text-[#000000]"
            >
              Set Up Scheduled Reports
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}