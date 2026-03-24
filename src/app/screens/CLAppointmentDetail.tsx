/**
 * CL-92 Appointment Detail — Patient summary, appointment details,
 * and context-sensitive CTAs (Start Consultation / View Queue).
 * Inner page: back arrow to /cl/schedule, no bottom nav.
 */
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import {
  User,
  Clock,
  Stethoscope,
  FileText,
  Calendar,
  MessageSquare,
} from 'lucide-react';

type ApptStatus = 'scheduled' | 'checked-in' | 'completed';

interface AppointmentData {
  id: string;
  patient: string;
  age: string;
  gender: string;
  phone: string;
  isMember: boolean;
  time: string;
  service: string;
  status: ApptStatus;
  notes: string;
  visitId?: string; // linked queue visit ID for checked-in patients
}

const statusDisplay: Record<ApptStatus, { label: string; dot: string; bg: string; border: string }> = {
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

/* ── Mock lookup ── */
const mockAppointments: Record<string, AppointmentData> = {
  'appt-01': { id: 'appt-01', patient: 'Nansubuga Mary', age: '28', gender: 'Female', phone: '0772777888', isMember: false, time: '08:00 AM', service: 'Parent Consultation', status: 'completed', notes: 'Follow-up on daughter Joy\'s developmental milestones.', visitId: 'clv-06' },
  'appt-02': { id: 'appt-02', patient: 'Jane Nakamya', age: '32', gender: 'Female', phone: '0772123456', isMember: true, time: '09:00 AM', service: 'Speech Therapy', status: 'checked-in', notes: 'Returning patient — follow-up on articulation therapy.', visitId: 'clv-01' },
  'appt-03': { id: 'appt-03', patient: 'Grace Atim', age: '12', gender: 'Female', phone: '0772333444', isMember: false, time: '10:15 AM', service: 'Parent Consult', status: 'checked-in', notes: 'Walk-in. Behavioral concerns at school.', visitId: 'clv-04' },
  'appt-04': { id: 'appt-04', patient: 'Mugisha Brian', age: '7', gender: 'Male', phone: '0772888999', isMember: true, time: '11:00 AM', service: 'Behavioral Assessment', status: 'scheduled', notes: 'New patient referral from school counselor.' },
  'appt-05': { id: 'appt-05', patient: 'Tendo Sarah', age: '24', gender: 'Female', phone: '0772444555', isMember: false, time: '01:30 PM', service: 'Follow-up', status: 'scheduled', notes: 'Post-therapy review.' },
  'appt-06': { id: 'appt-06', patient: 'Kiiza Dennis', age: '9', gender: 'Male', phone: '0772666777', isMember: true, time: '02:30 PM', service: 'OT Session', status: 'scheduled', notes: 'Continuation of fine motor skills program.' },
};

/* Also handle week view appointments with a default */
function getAppt(id: string): AppointmentData {
  return (
    mockAppointments[id] ?? {
      id,
      patient: 'Unknown Patient',
      age: '—',
      gender: '—',
      phone: '—',
      isMember: false,
      time: '—',
      service: 'General Appointment',
      status: 'scheduled' as ApptStatus,
      notes: 'No additional notes.',
    }
  );
}

export function CLAppointmentDetail() {
  const navigate = useNavigate();
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const appt = getAppt(appointmentId ?? '');

  const sCfg = statusDisplay[appt.status];

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar
        title="Appointment Detail"
        showBack
        onBackClick={() => navigate('/cl/schedule')}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Patient Summary Card */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#F7F9FC] flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-[#8F9AA1]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-base font-medium text-[#1A1A1A] truncate">
                    {appt.patient}
                  </p>
                  {appt.isMember && (
                    <span className="text-[10px] font-semibold text-aba-primary-main bg-aba-primary-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      MEMBER
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8F9AA1] mt-0.5">
                  {appt.age} yrs &middot; {appt.gender} &middot; {appt.phone}
                </p>
              </div>
            </div>

            {/* Status */}
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full border px-2.5 py-1 ${sCfg.bg} text-[#1A1A1A] ${sCfg.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
              {sCfg.label}
            </span>
          </div>

          {/* Appointment Details */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4 space-y-3.5">
            <h3 className="text-sm font-semibold text-[#1A1A1A]">
              Appointment Details
            </h3>

            <DetailRow
              icon={<Clock className="w-4 h-4 text-[#8F9AA1]" />}
              label="Time"
              value={appt.time}
            />
            <DetailRow
              icon={<Stethoscope className="w-4 h-4 text-[#8F9AA1]" />}
              label="Service"
              value={appt.service}
            />
            <DetailRow
              icon={<Calendar className="w-4 h-4 text-[#8F9AA1]" />}
              label="Date"
              value="Today"
            />
            <div className="border-t border-[#E5E8EC] pt-3">
              <div className="flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-[#8F9AA1] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#8F9AA1] mb-1">Notes</p>
                  <p className="text-sm text-[#4A4F55]">{appt.notes}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {appt.status === 'checked-in' && appt.visitId && (
              <ABAButton
                fullWidth
                size="lg"
                onClick={() => navigate(`/cl/consult/${appt.visitId}`)}
              >
                Start Consultation
              </ABAButton>
            )}

            {appt.status === 'scheduled' && (
              <ABAButton
                variant="secondary"
                fullWidth
                size="lg"
                onClick={() => navigate('/cl/queue')}
              >
                View Queue
              </ABAButton>
            )}

            {appt.status === 'completed' && appt.visitId && (
              <ABAButton
                variant="outline"
                fullWidth
                size="lg"
                onClick={() => navigate(`/cl/visit/${appt.visitId}`)}
              >
                View Visit Summary
              </ABAButton>
            )}

            {/* Message Reception — disabled placeholder */}
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 h-12 rounded-md border-2 border-[#E5E8EC] bg-[#F7F9FC] text-[#C9D0DB] text-base font-semibold cursor-not-allowed"
            >
              <MessageSquare className="w-4 h-4" />
              Message Reception
              <span className="text-[10px] bg-[#E5E8EC] text-[#8F9AA1] px-1.5 py-0.5 rounded-full ml-1">
                Coming soon
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {icon}
      <div className="flex-1 flex items-center justify-between">
        <p className="text-xs text-[#8F9AA1]">{label}</p>
        <p className="text-sm font-medium text-[#1A1A1A]">{value}</p>
      </div>
    </div>
  );
}