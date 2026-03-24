/**
 * CL-91 My Schedule — Clinician schedule with Today / Week tabs.
 * Inner page: back arrow to /cl/more, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { Clock, ChevronRight } from 'lucide-react';

type ScheduleTab = 'today' | 'week';

type ApptStatus = 'scheduled' | 'checked-in' | 'completed';

interface Appointment {
  id: string;
  time: string;
  patient: string;
  service: string;
  status: ApptStatus;
}

const statusStyles: Record<ApptStatus, { label: string; dot: string; bg: string; border: string }> = {
  scheduled: {
    label: 'Scheduled',
    dot: 'bg-aba-secondary-main',
    bg: 'bg-aba-secondary-50',
    border: 'border-aba-secondary-main/20',
  },
  'checked-in': {
    label: 'Checked In',
    dot: 'bg-aba-primary-main',
    bg: 'bg-aba-primary-50',
    border: 'border-aba-primary-main/20',
  },
  completed: {
    label: 'Completed',
    dot: 'bg-aba-success-main',
    bg: 'bg-aba-success-50',
    border: 'border-aba-success-main/20',
  },
};

/* ── Mock data ── */
const todayAppointments: Appointment[] = [
  { id: 'appt-01', time: '08:00 AM', patient: 'Nansubuga Mary', service: 'Parent Consultation', status: 'completed' },
  { id: 'appt-02', time: '09:00 AM', patient: 'Jane Nakamya', service: 'Speech Therapy', status: 'checked-in' },
  { id: 'appt-03', time: '10:15 AM', patient: 'Grace Atim', service: 'Parent Consult', status: 'checked-in' },
  { id: 'appt-04', time: '11:00 AM', patient: 'Mugisha Brian', service: 'Behavioral Assessment', status: 'scheduled' },
  { id: 'appt-05', time: '01:30 PM', patient: 'Tendo Sarah', service: 'Follow-up', status: 'scheduled' },
  { id: 'appt-06', time: '02:30 PM', patient: 'Kiiza Dennis', service: 'OT Session', status: 'scheduled' },
];

const weekData: { date: string; dateLabel: string; appointments: Appointment[] }[] = [
  {
    date: 'Mon, Feb 16',
    dateLabel: 'Monday',
    appointments: [
      { id: 'w-01', time: '08:30 AM', patient: 'Amina Laker', service: 'Speech Therapy', status: 'scheduled' },
      { id: 'w-02', time: '10:00 AM', patient: 'Opio Mark', service: 'OT Session', status: 'scheduled' },
      { id: 'w-03', time: '01:00 PM', patient: 'Namwanje Joy', service: 'Follow-up', status: 'scheduled' },
    ],
  },
  {
    date: 'Tue, Feb 17',
    dateLabel: 'Tuesday',
    appointments: [
      { id: 'w-04', time: '09:00 AM', patient: 'Kato Joseph', service: 'Behavioral Assessment', status: 'scheduled' },
      { id: 'w-05', time: '11:30 AM', patient: 'Nakitto Agnes', service: 'Parent Consultation', status: 'scheduled' },
    ],
  },
  {
    date: 'Wed, Feb 18',
    dateLabel: 'Wednesday',
    appointments: [
      { id: 'w-06', time: '08:00 AM', patient: 'Ssemujju Fred', service: 'Speech Therapy', status: 'scheduled' },
      { id: 'w-07', time: '10:00 AM', patient: 'Acan Stella', service: 'OT Session', status: 'scheduled' },
      { id: 'w-08', time: '02:00 PM', patient: 'Mugisha Brian', service: 'Follow-up', status: 'scheduled' },
    ],
  },
  {
    date: 'Thu, Feb 19',
    dateLabel: 'Thursday',
    appointments: [
      { id: 'w-09', time: '09:30 AM', patient: 'Tendo Sarah', service: 'Speech Therapy', status: 'scheduled' },
      { id: 'w-10', time: '01:00 PM', patient: 'Grace Atim', service: 'Parent Consult', status: 'scheduled' },
    ],
  },
  {
    date: 'Fri, Feb 20',
    dateLabel: 'Friday',
    appointments: [
      { id: 'w-11', time: '08:00 AM', patient: 'Kiiza Dennis', service: 'OT Session', status: 'scheduled' },
      { id: 'w-12', time: '11:00 AM', patient: 'Jane Nakamya', service: 'Follow-up', status: 'scheduled' },
      { id: 'w-13', time: '03:00 PM', patient: 'Nansubuga Mary', service: 'Parent Consultation', status: 'scheduled' },
    ],
  },
];

function StatusChip({ status }: { status: ApptStatus }) {
  const cfg = statusStyles[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full border px-2 py-0.5 ${cfg.bg} text-[#1A1A1A] ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function AppointmentRow({ appt, onTap }: { appt: Appointment; onTap: () => void }) {
  return (
    <button
      onClick={onTap}
      className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC] transition-colors text-left"
    >
      <div className="flex flex-col items-center justify-center flex-shrink-0 w-12">
        
        <span className="text-xs font-medium leading-none text-center text-[#8f9aa1]">{appt.time}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1A1A1A] truncate">{appt.patient}</p>
        <p className="text-xs text-[#8F9AA1] mt-0.5 truncate">{appt.service}</p>
      </div>
      <StatusChip status={appt.status} />
      <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
    </button>
  );
}

export function CLSchedule() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ScheduleTab>('today');

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar
        title="My Schedule"
        showBack
        onBackClick={() => navigate('/cl/more')}
      />

      {/* Tabs */}
      <div className="px-4 pt-3 pb-1 flex gap-2">
        {(['today', 'week'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-[#FFFFFF] text-[#4A4F55] border border-[#E5E8EC]'
            }`}
          >
            {t === 'today' ? 'Today' : 'Week'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {tab === 'today' ? (
            /* Today Tab */
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
              {todayAppointments.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-[#8F9AA1]">No appointments today</p>
                </div>
              ) : (
                todayAppointments.map((appt) => (
                  <AppointmentRow
                    key={appt.id}
                    appt={appt}
                    onTap={() => navigate(`/cl/appointment/${appt.id}`)}
                  />
                ))
              )}
            </div>
          ) : (
            /* Week Tab */
            weekData.map((day) => (
              <div key={day.date}>
                <p className="text-xs font-medium text-[#8F9AA1] mb-2 px-1 uppercase tracking-wide">
                  {day.date}
                </p>
                <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
                  {day.appointments.map((appt) => (
                    <AppointmentRow
                      key={appt.id}
                      appt={appt}
                      onTap={() => navigate(`/cl/appointment/${appt.id}`)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}