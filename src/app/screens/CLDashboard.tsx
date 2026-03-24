/**
 * CL-90 Home Dashboard — Clinician dashboard with KPI cards,
 * next patient, continue consultation, and shortcut buttons.
 * Inner page: back arrow to /cl/more, no bottom nav.
 */
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { CLStatusChip } from '../components/aba/CLStatusChip';
import { ABAButton } from '../components/aba/ABAButton';
import { useClinicianStore } from '../data/clinicianStore';
import {
  Clock,
  Stethoscope,
  FlaskConical,
  CheckCircle2,
  ChevronRight,
  ListOrdered,
  ClipboardList,
  Users,
  PlayCircle,
} from 'lucide-react';

export function CLDashboard() {
  const navigate = useNavigate();
  const { queue, getQueueStats: stats } = useClinicianStore();

  /* Next waiting patient assigned to the current clinician */
  const nextPatient = queue.find(
    (v) => v.status === 'waiting' && v.assignedTo === 'dr-ssekandi'
  );

  /* First in-consultation patient (to continue) */
  const activeVisit = queue.find(
    (v) => v.status === 'in-consultation' && v.assignedTo === 'dr-ssekandi'
  );

  const kpis = [
    {
      id: 'waiting',
      label: 'Waiting',
      value: stats.waiting,
      icon: <Clock className="w-4 h-4" />,
      iconBg: 'bg-aba-warning-50',
      iconColor: 'text-aba-warning-main',
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      value: stats.inConsult,
      icon: <Stethoscope className="w-4 h-4" />,
      iconBg: 'bg-[#F5F3FF]',
      iconColor: 'text-[#8B5CF6]',
    },
    {
      id: 'completed',
      label: 'Completed',
      value: stats.completed,
      icon: <CheckCircle2 className="w-4 h-4" />,
      iconBg: 'bg-aba-success-50',
      iconColor: 'text-aba-success-main',
    },
    {
      id: 'results',
      label: 'Results Ready',
      value: stats.labPending,
      icon: <FlaskConical className="w-4 h-4" />,
      iconBg: 'bg-[#FFFBEB]',
      iconColor: 'text-[#F59E0B]',
    },
  ];

  const shortcuts = [
    {
      id: 'queue',
      label: 'My Queue',
      icon: <ListOrdered className="w-5 h-5" />,
      iconBg: 'bg-aba-primary-50',
      iconColor: 'text-aba-primary-main',
      path: '/cl/queue',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <ClipboardList className="w-5 h-5" />,
      iconBg: 'bg-aba-secondary-50',
      iconColor: 'text-aba-secondary-main',
      path: '/cl/orders',
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: <Users className="w-5 h-5" />,
      iconBg: 'bg-[#F5F3FF]',
      iconColor: 'text-[#8B5CF6]',
      path: '/cl/patients',
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar
        title="Home Dashboard"
        showBack
        onBackClick={() => navigate('/cl/more')}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* KPI Grid 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            {kpis.map((kpi) => (
              <div
                key={kpi.id}
                className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] px-3 py-3.5"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-full ${kpi.iconBg} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className={kpi.iconColor}>{kpi.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-[#1A1A1A] leading-none">
                      {kpi.value}
                    </p>
                    <p className="text-[11px] text-[#8F9AA1] mt-1 truncate">
                      {kpi.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Next Patient Card */}
          {nextPatient && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#1A1A1A]">
                  Next Patient
                </h3>
                <CLStatusChip status="waiting" />
              </div>
              <div className="mb-3">
                <p className="text-base font-medium text-[#1A1A1A]">
                  {nextPatient.patientName}
                </p>
                <p className="text-xs text-[#8F9AA1] mt-0.5">
                  {nextPatient.service} &middot; {nextPatient.ticket}
                </p>
              </div>
              <ABAButton
                fullWidth
                onClick={() => navigate(`/cl/visit/${nextPatient.id}`)}
              >
                Open Visit
              </ABAButton>
            </div>
          )}

          {/* Continue Consultation Card */}
          {activeVisit && (
            <button
              onClick={() => navigate(`/cl/consult/${activeVisit.id}`)}
              className="w-full bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4 flex items-center gap-3 hover:bg-[#F7F9FC] active:bg-[#E5E8EC] transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-[#F5F3FF] flex items-center justify-center flex-shrink-0">
                <PlayCircle className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A]">
                  Continue last consultation
                </p>
                <p className="text-xs text-[#8F9AA1] mt-0.5 truncate">
                  {activeVisit.patientName} &middot; {activeVisit.service}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
            </button>
          )}

          {/* Shortcuts Row */}
          <div>
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">
              Shortcuts
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {shortcuts.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(s.path)}
                  className="flex flex-col items-center gap-2 bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] py-4 hover:bg-[#F7F9FC] active:bg-[#E5E8EC] transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full ${s.iconBg} flex items-center justify-center`}
                  >
                    <span className={s.iconColor}>{s.icon}</span>
                  </div>
                  <span className="text-xs font-medium text-[#4A4F55]">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
