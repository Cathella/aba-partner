/**
 * CL-93 Today's Summary — Stats cards, visits-by-hour mini chart,
 * completed visits list, and export button.
 * Inner page: back arrow to /cl/more, no bottom nav.
 */
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { useClinicianStore } from '../data/clinicianStore';
import {
  CheckCircle2,
  Clock,
  FlaskConical,
  Pill,
  Download,
} from 'lucide-react';

/* ── Mini bar-chart data ── */
const hourlyData = [
  { hour: '8', count: 2 },
  { hour: '9', count: 3 },
  { hour: '10', count: 1 },
  { hour: '11', count: 2 },
  { hour: '12', count: 0 },
  { hour: '1', count: 1 },
  { hour: '2', count: 2 },
  { hour: '3', count: 1 },
];

/* ── Mock completed visits ── */
const completedVisits = [
  { id: 'cv-1', time: '08:45 AM', patient: 'Nansubuga Mary', service: 'Parent Consultation' },
  { id: 'cv-2', time: '09:32 AM', patient: 'Amina Laker', service: 'Speech Therapy' },
  { id: 'cv-3', time: '10:15 AM', patient: 'Opio Mark', service: 'OT Session' },
  { id: 'cv-4', time: '11:20 AM', patient: 'Ssemujju Fred', service: 'Behavioral Assessment' },
  { id: 'cv-5', time: '01:10 PM', patient: 'Namwanje Joy', service: 'Follow-up' },
  { id: 'cv-6', time: '02:00 PM', patient: 'Acan Stella', service: 'Speech Therapy' },
  { id: 'cv-7', time: '02:45 PM', patient: 'Mugisha Brian', service: 'Parent Consult' },
  { id: 'cv-8', time: '03:15 PM', patient: 'Tendo Sarah', service: 'Follow-up' },
  { id: 'cv-9', time: '03:50 PM', patient: 'Kato Joseph', service: 'Behavioral Assessment' },
  { id: 'cv-10', time: '04:20 PM', patient: 'Grace Atim', service: 'OT Session' },
];

const maxBar = Math.max(...hourlyData.map((d) => d.count), 1);

export function CLTodaySummary() {
  const navigate = useNavigate();
  const { getQueueStats: stats } = useClinicianStore();

  const summaryCards = [
    {
      id: 'completed',
      label: 'Completed',
      value: stats.completed || 5,
      icon: <CheckCircle2 className="w-4 h-4" />,
      iconBg: 'bg-aba-success-50',
      iconColor: 'text-aba-success-main',
    },
    {
      id: 'waiting',
      label: 'Waiting',
      value: stats.waiting || 2,
      icon: <Clock className="w-4 h-4" />,
      iconBg: 'bg-aba-warning-50',
      iconColor: 'text-aba-warning-main',
    },
    {
      id: 'lab',
      label: 'Lab Ordered',
      value: 3,
      icon: <FlaskConical className="w-4 h-4" />,
      iconBg: 'bg-[#FFFBEB]',
      iconColor: 'text-[#F59E0B]',
    },
    {
      id: 'rx',
      label: 'Prescriptions Sent',
      value: 4,
      icon: <Pill className="w-4 h-4" />,
      iconBg: 'bg-[#F5F3FF]',
      iconColor: 'text-[#8B5CF6]',
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar
        title="Today's Summary"
        showBack
        onBackClick={() => navigate('/cl/more')}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 pb-24">
          {/* Summary KPI 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            {summaryCards.map((c) => (
              <div
                key={c.id}
                className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] px-3 py-3.5"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-full ${c.iconBg} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className={c.iconColor}>{c.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-[#1A1A1A] leading-none">
                      {c.value}
                    </p>
                    <p className="text-[11px] text-[#8F9AA1] mt-1 truncate">
                      {c.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mini Chart — Visits by Hour */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">
              Visits by Hour
            </h3>
            <div className="flex items-end gap-2.5 h-28">
              {hourlyData.map((d) => (
                <div key={d.hour} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-medium text-[#4A4F55]">
                    {d.count}
                  </span>
                  <div className="w-full flex justify-center">
                    <div
                      className="w-6 rounded-t-md bg-aba-primary-main/80 transition-all"
                      style={{
                        height: `${Math.max((d.count / maxBar) * 72, 4)}px`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-[#8F9AA1]">{d.hour}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Visits List */}
          <div>
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2 px-1">
              Completed Visits
            </h3>
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
              {completedVisits.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E8EC] last:border-b-0"
                >
                  <div className="w-8 h-8 rounded-full bg-aba-success-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-aba-success-main" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">
                      {v.patient}
                    </p>
                    <p className="text-xs text-[#8F9AA1] truncate">{v.service}</p>
                  </div>
                  <span className="text-xs text-[#8F9AA1] flex-shrink-0">
                    {v.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-aba-neutral-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <ABAButton
          variant="secondary"
          fullWidth
          size="lg"
          onClick={() => {
            showToast('Summary exported to Downloads', 'success');
          }}
        >
          <Download className="w-4 h-4" />
          Export Summary
        </ABAButton>
      </div>
    </div>
  );
}