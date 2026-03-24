/**
 * CL-03 Visit Summary — Pre-consultation view for a queue item.
 * Shows patient card (name, age, member tag, masked phone), visit info
 * (reason/service, check-in time, reception notes), and CTAs:
 *   Primary: Start Consultation → CL-05 Consultation Workspace
 *   Secondary: Send to Lab, View History (placeholder)
 */
import { useNavigate, useParams, useLocation } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { AppTopBar } from '../components/aba/AppTopBar';
import { CLStatusChip } from '../components/aba/CLStatusChip';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import {
  useClinicianStore,
  startConsultation,
  sendToLabWithCoverage,
  sendToPharmacyWithCoverage,
  reassignVisit,
} from '../data/clinicianStore';
import type { CLQueueItem } from '../data/clinicianStore';
import {
  User,
  Users,
  Phone,
  Shield,
  ShieldCheck,
  Clock,
  Stethoscope,
  MapPin,
  FileText,
  FlaskConical,
  Pill,
  History,
  Play,
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  UserCog,
  HeartPulse,
  Thermometer,
  Activity,
  Wind,
  Weight,
  Wallet,
  Timer,
  RefreshCw,
  Keyboard,
  ChevronDown,
  ChevronUp,
  WifiOff,
  ShieldOff,
  Info,
  Lock,
  Eye,
} from 'lucide-react';

/* ── Sample dependents ── */
const SAMPLE_DEPENDENTS = [
  { id: 'dep-1', name: 'Amina K. (Daughter, 5 yrs)' },
  { id: 'dep-2', name: 'Hassan K. (Son, 12 yrs)' },
];

/* ── Lab approval phases ── */
type LabPhase = 'patient-confirm' | 'approval-pending' | 'approved' | 'out-of-pocket' | 'declined' | 'timed-out' | 'failed-sync' | 'already-transferred';

/* ── Pharmacy approval phases (reuse same type shape) ── */
type PharmPhase = LabPhase;

/* ── Timer helper ── */
function fmtTimer(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/* ── Phone mask helper ── */
function maskPhone(phone: string) {
  if (phone.length <= 4) return phone;
  return phone.slice(0, 4) + '****' + phone.slice(-2);
}

export function CLVisitSummary() {
  const navigate = useNavigate();
  const { visitId } = useParams<{ visitId: string }>();
  const { getVisitById } = useClinicianStore();
  const location = useLocation();

  const visit = getVisitById(visitId || '');
  const [showReassign, setShowReassign] = useState(false);
  const [showLabSheet, setShowLabSheet] = useState(false);
  const [labPhase, setLabPhase] = useState<LabPhase>('patient-confirm');
  const [labPatientType, setLabPatientType] = useState<'member' | 'dependent'>('member');
  const [labSelectedDep, setLabSelectedDep] = useState(SAMPLE_DEPENDENTS[0].id);
  const [labTimerSeconds, setLabTimerSeconds] = useState(120);
  const [labShowFallback, setLabShowFallback] = useState(false);
  const [labFallbackCode, setLabFallbackCode] = useState('');
  const [labOopConfirm, setLabOopConfirm] = useState(false);
  const [labSubmitting, setLabSubmitting] = useState(false);
  const [labResendCount, setLabResendCount] = useState(0);
  const [labShowAlreadyDetail, setLabShowAlreadyDetail] = useState(false);

  /* ── Pharmacy approval state ── */
  const [showPharmSheet, setShowPharmSheet] = useState(false);
  const [pharmPhase, setPharmPhase] = useState<PharmPhase>('patient-confirm');
  const [pharmPatientType, setPharmPatientType] = useState<'member' | 'dependent'>('member');
  const [pharmSelectedDep, setPharmSelectedDep] = useState(SAMPLE_DEPENDENTS[0].id);
  const [pharmTimerSeconds, setPharmTimerSeconds] = useState(120);
  const [pharmShowFallback, setPharmShowFallback] = useState(false);
  const [pharmFallbackCode, setPharmFallbackCode] = useState('');
  const [pharmOopConfirm, setPharmOopConfirm] = useState(false);
  const [pharmSubmitting, setPharmSubmitting] = useState(false);
  const [pharmResendCount, setPharmResendCount] = useState(0);
  const [pharmShowAlreadyDetail, setPharmShowAlreadyDetail] = useState(false);

  /* ── Lab approval timer ── */
  const labTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const labAutoApproveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* ── Pharmacy approval timer ── */
  const pharmTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pharmAutoApproveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (labTimerRef.current) clearInterval(labTimerRef.current);
      if (labAutoApproveRef.current) clearTimeout(labAutoApproveRef.current);
      if (pharmTimerRef.current) clearInterval(pharmTimerRef.current);
      if (pharmAutoApproveRef.current) clearTimeout(pharmAutoApproveRef.current);
    };
  }, []);

  // Auto-open sheet when navigated from CLTransferReferral with state
  useEffect(() => {
    const st = (location.state as { openSheet?: string } | null);
    if (!st?.openSheet || !visit) return;
    if (st.openSheet === 'lab') {
      if (visit.labCoverageStatus) { setLabPhase('already-transferred'); } else { setLabPhase('patient-confirm'); }
      setLabShowAlreadyDetail(false);
      setShowLabSheet(true);
    } else if (st.openSheet === 'pharmacy') {
      if (visit.pharmCoverageStatus) { setPharmPhase('already-transferred'); } else { setPharmPhase('patient-confirm'); }
      setPharmShowAlreadyDetail(false);
      setShowPharmSheet(true);
    }
    window.history.replaceState({}, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearLabTimers = () => {
    if (labTimerRef.current) { clearInterval(labTimerRef.current); labTimerRef.current = null; }
    if (labAutoApproveRef.current) { clearTimeout(labAutoApproveRef.current); labAutoApproveRef.current = null; }
  };

  const closeLabSheet = () => {
    clearLabTimers();
    setShowLabSheet(false);
    setLabPhase('patient-confirm');
    setLabPatientType('member');
    setLabSelectedDep(SAMPLE_DEPENDENTS[0].id);
    setLabTimerSeconds(120);
    setLabShowFallback(false);
    setLabFallbackCode('');
    setLabOopConfirm(false);
    setLabSubmitting(false);
    setLabResendCount(0);
    setLabShowAlreadyDetail(false);
  };

  const startLabTimer = () => {
    clearLabTimers();
    setLabTimerSeconds(120);
    labTimerRef.current = setInterval(() => {
      setLabTimerSeconds((prev) => {
        if (prev <= 1) {
          if (labTimerRef.current) clearInterval(labTimerRef.current);
          if (labAutoApproveRef.current) clearTimeout(labAutoApproveRef.current);
          setTimeout(() => setLabPhase('timed-out'), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    labAutoApproveRef.current = setTimeout(() => {
      if (labTimerRef.current) clearInterval(labTimerRef.current);
      setLabPhase('approved');
    }, 5000);
  };

  const startLabApproval = () => {
    setLabShowFallback(false);
    setLabFallbackCode('');
    setLabOopConfirm(false);
    setLabResendCount(0);
    setLabPhase('approval-pending');
    startLabTimer();
  };

  const handleLabResend = () => {
    setLabResendCount((c) => c + 1);
    setLabPhase('approval-pending');
    startLabTimer();
    // toast handled inline
  };

  const handleLabRetrySync = () => {
    setLabPhase('approval-pending');
    startLabTimer();
  };

  const handleLabValidateFallback = () => {
    if (labFallbackCode.length === 6) {
      clearLabTimers();
      setLabPhase('approved');
    }
  };

  const handleLabProceedOOP = () => {
    clearLabTimers();
    setLabPhase('out-of-pocket');
  };

  const handleLabCancelApproval = () => {
    clearLabTimers();
    setLabPhase('patient-confirm');
    setLabTimerSeconds(120);
  };

  /* ── Pharmacy helpers ── */
  const clearPharmTimers = () => {
    if (pharmTimerRef.current) { clearInterval(pharmTimerRef.current); pharmTimerRef.current = null; }
    if (pharmAutoApproveRef.current) { clearTimeout(pharmAutoApproveRef.current); pharmAutoApproveRef.current = null; }
  };
  const closePharmSheet = () => {
    clearPharmTimers();
    setShowPharmSheet(false); setPharmPhase('patient-confirm'); setPharmPatientType('member');
    setPharmSelectedDep(SAMPLE_DEPENDENTS[0].id); setPharmTimerSeconds(120);
    setPharmShowFallback(false); setPharmFallbackCode(''); setPharmOopConfirm(false);
    setPharmSubmitting(false); setPharmResendCount(0); setPharmShowAlreadyDetail(false);
  };
  const startPharmTimer = () => {
    clearPharmTimers(); setPharmTimerSeconds(120);
    pharmTimerRef.current = setInterval(() => {
      setPharmTimerSeconds((prev) => {
        if (prev <= 1) { if (pharmTimerRef.current) clearInterval(pharmTimerRef.current); if (pharmAutoApproveRef.current) clearTimeout(pharmAutoApproveRef.current); setTimeout(() => setPharmPhase('timed-out'), 0); return 0; }
        return prev - 1;
      });
    }, 1000);
    pharmAutoApproveRef.current = setTimeout(() => { if (pharmTimerRef.current) clearInterval(pharmTimerRef.current); setPharmPhase('approved'); }, 5000);
  };
  const startPharmApproval = () => { setPharmShowFallback(false); setPharmFallbackCode(''); setPharmOopConfirm(false); setPharmResendCount(0); setPharmPhase('approval-pending'); startPharmTimer(); };
  const handlePharmResend = () => { setPharmResendCount((c) => c + 1); setPharmPhase('approval-pending'); startPharmTimer(); };
  const handlePharmRetrySync = () => { setPharmPhase('approval-pending'); startPharmTimer(); };
  const handlePharmValidateFallback = () => { if (pharmFallbackCode.length === 6) { clearPharmTimers(); setPharmPhase('approved'); } };
  const handlePharmProceedOOP = () => { clearPharmTimers(); setPharmPhase('out-of-pocket'); };
  const handlePharmCancelApproval = () => { clearPharmTimers(); setPharmPhase('patient-confirm'); setPharmTimerSeconds(120); };

  if (!visit) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Visit Summary" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-aba-neutral-600">Visit not found</p>
        </div>
      </div>
    );
  }

  const isWaiting = visit.status === 'waiting';
  const isInConsult = visit.status === 'in-consultation';
  const isCompleted = visit.status === 'completed';
  const isLabPending = visit.status === 'lab-pending' || visit.status === 'lab-results';

  const handleStartConsultation = () => {
    startConsultation(visit.id);
    showToast('Consultation started', 'success');
    navigate(`/cl/consult/${visit.id}`);
  };

  const handleContinueConsultation = () => {
    navigate(`/cl/consult/${visit.id}`);
  };

  const handleViewHistory = () => {
    navigate(`/cl/patients/${visit.patientId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Visit Summary" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-36">
        <div className="p-4 space-y-4">
          {/* ── Patient Card ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-5">
            <div className="flex items-start gap-3.5">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-semibold text-aba-secondary-main">
                  {visit.patientName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-semibold text-aba-neutral-900">
                    {visit.patientName}
                  </h2>
                  <CLStatusChip status={visit.status} />
                </div>

                <p className="text-sm text-aba-neutral-600 mt-1">
                  {visit.age} yrs &middot; {visit.gender}
                </p>

                {/* Tags row */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {visit.isMember ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-aba-primary-main bg-aba-primary-50 px-2 py-0.5 rounded-full">
                      <Shield className="w-3 h-3" />
                      Member
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-aba-neutral-600 bg-aba-neutral-100 px-2 py-0.5 rounded-full">
                      <User className="w-3 h-3" />
                      Non-member
                    </span>
                  )}
                  {visit.type === 'walk-in' && (
                    <span className="text-[11px] font-semibold text-[#8B5CF6] bg-[#F5F3FF] px-2 py-0.5 rounded-full">
                      Walk-in
                    </span>
                  )}
                  <span className="text-[11px] text-aba-neutral-600 bg-aba-neutral-100 px-2 py-0.5 rounded-full">
                    {visit.ticket}
                  </span>
                </div>
              </div>
            </div>

            {/* Phone (masked) */}
            <div className="mt-4 pt-3 border-t border-aba-neutral-200 flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-aba-neutral-600 flex-shrink-0" />
              <span className="text-sm text-aba-neutral-700">{maskPhone(visit.phone)}</span>
            </div>
          </div>

          {/* ── Visit Info Card ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-5">
            <h3 className="text-sm font-semibold text-aba-neutral-900 mb-3">
              Visit Information
            </h3>
            <div className="space-y-3">
              {/* Service / Reason */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-aba-secondary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Stethoscope className="w-4 h-4 text-aba-secondary-main" />
                </div>
                <div>
                  <p className="text-xs text-aba-neutral-500 uppercase tracking-wide">
                    Reason / Service
                  </p>
                  <p className="text-sm text-aba-neutral-900 mt-0.5">{visit.service}</p>
                </div>
              </div>

              {/* Check-in time */}
              {visit.checkedInAt && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-aba-success-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-aba-success-main" />
                  </div>
                  <div>
                    <p className="text-xs text-aba-neutral-500 uppercase tracking-wide">
                      Check-in Time
                    </p>
                    <p className="text-sm text-aba-neutral-900 mt-0.5">
                      {visit.checkedInAt}
                      <span className="text-aba-neutral-500 ml-1">
                        (Scheduled {visit.scheduledTime})
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Room */}
              {visit.room && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-aba-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-aba-neutral-700" />
                  </div>
                  <div>
                    <p className="text-xs text-aba-neutral-500 uppercase tracking-wide">
                      Room
                    </p>
                    <p className="text-sm text-aba-neutral-900 mt-0.5">{visit.room}</p>
                  </div>
                </div>
              )}

              {/* Chief Complaint */}
              {visit.chiefComplaint && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-aba-warning-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-aba-warning-main" />
                  </div>
                  <div>
                    <p className="text-xs text-aba-neutral-500 uppercase tracking-wide">
                      Chief Complaint
                    </p>
                    <p className="text-sm text-aba-neutral-900 mt-0.5">{visit.chiefComplaint}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Vitals & Triage (from Nurse) ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-aba-neutral-200">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[#E44F4F]" />
                <h3 className="text-sm font-semibold text-aba-neutral-900">
                  Vitals & Triage
                </h3>
              </div>
              {visit.vitals?.recordedAt && (
                <span className="text-[10px] text-aba-neutral-500">
                  {visit.vitals.recordedAt}
                </span>
              )}
            </div>

            {visit.vitals ? (
              <>
                <div className="grid grid-cols-3 gap-px bg-aba-neutral-200">
                  {visit.vitals.bloodPressure && (
                    <div className="bg-aba-neutral-0 p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-aba-neutral-500 mb-1">
                        <Activity className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium uppercase">BP</span>
                      </div>
                      <p className="text-sm font-semibold text-aba-neutral-900">{visit.vitals.bloodPressure}</p>
                    </div>
                  )}
                  {visit.vitals.temperature && (
                    <div className="bg-aba-neutral-0 p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-aba-neutral-500 mb-1">
                        <Thermometer className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium uppercase">Temp</span>
                      </div>
                      <p className="text-sm font-semibold text-aba-neutral-900">{visit.vitals.temperature}°C</p>
                    </div>
                  )}
                  {visit.vitals.pulse && (
                    <div className="bg-aba-neutral-0 p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-aba-neutral-500 mb-1">
                        <HeartPulse className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium uppercase">Pulse</span>
                      </div>
                      <p className="text-sm font-semibold text-aba-neutral-900">{visit.vitals.pulse} bpm</p>
                    </div>
                  )}
                  {visit.vitals.spo2 && (
                    <div className="bg-aba-neutral-0 p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-aba-neutral-500 mb-1">
                        <Wind className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium uppercase">SpO2</span>
                      </div>
                      <p className="text-sm font-semibold text-aba-neutral-900">{visit.vitals.spo2}%</p>
                    </div>
                  )}
                  {visit.vitals.weight && (
                    <div className="bg-aba-neutral-0 p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-aba-neutral-500 mb-1">
                        <Weight className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium uppercase">Weight</span>
                      </div>
                      <p className="text-sm font-semibold text-aba-neutral-900">{visit.vitals.weight} kg</p>
                    </div>
                  )}
                  {/* Filler cell to keep grid even */}
                  {(() => {
                    const count = [visit.vitals.bloodPressure, visit.vitals.temperature, visit.vitals.pulse, visit.vitals.spo2, visit.vitals.weight].filter(Boolean).length;
                    return count % 3 !== 0 ? Array.from({ length: 3 - (count % 3) }).map((_, i) => (
                      <div key={`filler-${i}`} className="bg-aba-neutral-0" />
                    )) : null;
                  })()}
                </div>

                {/* Attribution */}
                <div className="px-5 py-2.5 bg-[#F7F9FC] flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#E9F8F0] flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 text-[#38C172]" />
                  </div>
                  <span className="text-xs text-aba-neutral-600">
                    Captured by <span className="font-semibold text-aba-neutral-900">{visit.vitals.capturedBy || 'Nurse'}</span>
                  </span>
                </div>
              </>
            ) : (
              <div className="px-5 py-6 text-center">
                <div className="w-10 h-10 rounded-full bg-aba-neutral-100 flex items-center justify-center mx-auto mb-2.5">
                  <HeartPulse className="w-5 h-5 text-aba-neutral-400" />
                </div>
                <p className="text-sm font-medium text-aba-neutral-700">No vitals recorded yet</p>
                <p className="text-xs text-aba-neutral-500 mt-1">
                  Nurse will capture vitals during triage.
                </p>
              </div>
            )}
          </div>

          {/* ── Notes from Reception ── */}
          {visit.receptionNotes && (
            <div className="bg-[#FFFBEB] rounded-2xl border border-[#F59E0B]/15 p-4">
              <div className="flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-aba-neutral-900 uppercase tracking-wide mb-1">
                    Notes from Reception
                  </p>
                  <p className="text-sm text-aba-neutral-700 leading-relaxed">
                    {visit.receptionNotes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Coverage Summary (read-only) ── */}
          {(visit.consultCoverageStatus || visit.labCoverageStatus || visit.pharmCoverageStatus) && (
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-aba-neutral-200">
                <ShieldCheck className="w-4 h-4 text-[#32C28A]" />
                <h3 className="text-sm font-semibold text-aba-neutral-900">Coverage Summary</h3>
              </div>
              <div className="px-5 py-3 space-y-2.5">
                <CLCoverageRow
                  icon={<Stethoscope className="w-3.5 h-3.5" />}
                  label="Consultation"
                  status={visit.consultCoverageStatus}
                  packageName={visit.consultCoveragePackage}
                />
                {visit.labCoverageStatus && (
                  <CLCoverageRow
                    icon={<FlaskConical className="w-3.5 h-3.5" />}
                    label="Lab"
                    status={visit.labCoverageStatus}
                    packageName={visit.labCoveragePackage}
                  />
                )}
                {visit.pharmCoverageStatus && (
                  <CLCoverageRow
                    icon={<Pill className="w-3.5 h-3.5" />}
                    label="Pharmacy"
                    status={visit.pharmCoverageStatus}
                    packageName={visit.pharmCoveragePackage}
                  />
                )}
              </div>
            </div>
          )}

          {/* ── Completed visit summary ── */}
          {isCompleted && (
            <div className="bg-aba-success-50 rounded-2xl border border-aba-success-main/15 p-4">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-aba-success-main flex-shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-aba-neutral-900 uppercase tracking-wide">
                    Visit Completed
                  </p>
                  {visit.diagnosisSummary && (
                    <p className="text-sm text-aba-neutral-900">
                      <span className="font-medium">Diagnosis:</span> {visit.diagnosisSummary}
                    </p>
                  )}
                  {visit.followUp && (
                    <p className="text-sm text-aba-neutral-700">
                      Follow-up in {visit.followUp}
                    </p>
                  )}
                  {visit.completedAt && (
                    <p className="text-xs text-aba-success-main font-medium">
                      Completed at {visit.completedAt}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky CTA bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-aba-neutral-0 border-t border-aba-neutral-200 z-30">
        <div className="max-w-[390px] mx-auto p-4 space-y-2.5">
          {/* Primary CTA */}
          {isWaiting && (
            <ABAButton
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleStartConsultation}
            >
              <Play className="w-5 h-5" />
              Start Consultation
            </ABAButton>
          )}

          {isInConsult && (
            <ABAButton
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleContinueConsultation}
            >
              <Stethoscope className="w-5 h-5" />
              Continue Consultation
            </ABAButton>
          )}

          {isLabPending && (
            <ABAButton
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleContinueConsultation}
            >
              <FlaskConical className="w-5 h-5" />
              Review &amp; Continue
            </ABAButton>
          )}

          {isCompleted && (
            <ABAButton
              variant="outline"
              fullWidth
              size="lg"
              onClick={handleContinueConsultation}
            >
              <FileText className="w-5 h-5" />
              View Consultation Notes
            </ABAButton>
          )}

          {/* Secondary actions */}
          {!isCompleted && (
            <div className="flex gap-2.5">
              {visit.assignedTo === 'unassigned' && (
                <ABAButton
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowReassign(true)}
                >
                  <UserCog className="w-4 h-4" />
                  Reassign
                </ABAButton>
              )}
              <ABAButton
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (visit.labCoverageStatus) {
                    setLabPhase('already-transferred');
                  } else {
                    setLabPhase('patient-confirm');
                  }
                  setLabShowAlreadyDetail(false);
                  setShowLabSheet(true);
                }}
                disabled={isLabPending}
              >
                <FlaskConical className="w-4 h-4" />
                Lab
                {visit.labCoverageStatus && <span className="ml-auto text-[10px] font-semibold text-[#32C28A] bg-[#E9F8F0] px-1.5 py-0.5 rounded-full">Applied</span>}
              </ABAButton>
              <ABAButton
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (visit.pharmCoverageStatus) {
                    setPharmPhase('already-transferred');
                  } else {
                    setPharmPhase('patient-confirm');
                  }
                  setPharmShowAlreadyDetail(false);
                  setShowPharmSheet(true);
                }}
              >
                <Pill className="w-4 h-4" />
                Pharmacy
                {visit.pharmCoverageStatus && <span className="ml-auto text-[10px] font-semibold text-[#32C28A] bg-[#E9F8F0] px-1.5 py-0.5 rounded-full">Applied</span>}
              </ABAButton>
              <ABAButton
                variant="outline"
                className="flex-1"
                onClick={handleViewHistory}
              >
                <History className="w-4 h-4" />
                History
              </ABAButton>
            </div>
          )}
        </div>
      </div>

      {/* ── Reassign Action Sheet ── */}
      {showReassign && visit && (
        <ReassignSheet
          visitId={visit.id}
          currentAssignee={visit.assignedTo}
          onClose={() => setShowReassign(false)}
        />
      )}

      {/* ── Lab Sheet ── */}
      {showLabSheet && visit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) closeLabSheet(); }}>
          <div className="bg-white rounded-t-3xl w-full max-w-[390px] mx-auto pb-8 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-center py-3"><div className="w-10 h-1 rounded-full bg-[#C9D0DB]" /></div>
            <div className="px-5">
              <div className="flex items-center gap-2 mb-1">
                <FlaskConical className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="text-lg font-semibold text-[#1A1A1A]">Transfer to Lab</h3>
              </div>

              {/* ── Already Transferred (Lab) ── */}
              {labPhase === 'already-transferred' && (<>
                <div className="bg-[#EBF3FF] rounded-xl border border-[#3A8DFF]/20 p-4 mt-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EBF3FF] flex items-center justify-center flex-shrink-0"><Info className="w-5 h-5 text-[#3A8DFF]" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#3A8DFF]">Already transferred</p>
                      <p className="text-xs text-[#8F9AA1] mt-0.5">Already transferred to Lab ({visit.labCoverageStatus === 'Out-of-pocket' ? 'out-of-pocket' : 'coverage applied'}).</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[#8F9AA1] mb-4">A coverage deduction has already been recorded for this station during this visit. Transferring again would cause a duplicate deduction.</p>
                {labShowAlreadyDetail && visit.labCoverageStatus && (
                  <div className="bg-white rounded-xl border border-[#E5E8EC] overflow-hidden mb-4">
                    <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#32C28A]" /><h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">Coverage & Approval</h4></div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Coverage</span><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${visit.labCoverageStatus === 'Covered' ? 'bg-[#E9F8F0] text-[#38C172]' : visit.labCoverageStatus === 'Discount applied' ? 'bg-[#EBF3FF] text-[#3A8DFF]' : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'}`}>{visit.labCoverageStatus}</span></div>
                      <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Applied Package</span><span className="text-sm font-medium text-[#1A1A1A]">{visit.labCoveragePackage || 'N/A'}</span></div>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <ABAButton variant="outline" size="md" fullWidth onClick={() => setLabShowAlreadyDetail(!labShowAlreadyDetail)}><Eye className="w-4 h-4" />{labShowAlreadyDetail ? 'Hide details' : 'View details'}</ABAButton>
                  <ABAButton variant="outline" size="md" fullWidth disabled><Lock className="w-4 h-4" />Undo transfer (admin only)</ABAButton>
                  <button onClick={closeLabSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Close</button>
                </div>
              </>)}

              {/* ── Patient Confirm ── */}
              {labPhase === 'patient-confirm' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">Confirm patient details and coverage before sending to Lab.</p>
                <div className="mb-4"><label className="block text-sm font-medium text-[#1A1A1A] mb-2">Patient type</label>
                  <div className="flex gap-2">
                    {(['member','dependent'] as const).map(t => (
                      <button key={t} onClick={() => setLabPatientType(t)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${labPatientType===t ? 'border-[#32C28A] bg-[#E9F8F0] text-[#1A1A1A]' : 'border-[#E5E8EC] bg-white text-[#8F9AA1]'}`}>
                        {t==='member' ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}{t==='member' ? 'Member' : 'Dependent'}
                      </button>
                    ))}
                  </div>
                </div>
                {labPatientType === 'dependent' && (
                  <div className="mb-4"><label className="block text-sm font-medium text-[#1A1A1A] mb-2">Select dependent</label>
                    <div className="relative">
                      <select value={labSelectedDep} onChange={e => setLabSelectedDep(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-sm text-[#1A1A1A] appearance-none focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]">
                        {SAMPLE_DEPENDENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F9AA1] pointer-events-none" />
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  <ABAButton variant="primary" size="lg" fullWidth onClick={startLabApproval}><ShieldCheck className="w-5 h-5" />Request Approval</ABAButton>
                  <ABAButton variant="outline" size="lg" fullWidth onClick={() => setLabOopConfirm(true)}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                  <button onClick={closeLabSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button>
                </div>
                {labOopConfirm && (
                  <div className="mt-4 p-4 bg-[#FFF3DC] rounded-xl border border-[#D97706]/20">
                    <p className="text-sm text-[#1A1A1A] mb-3">Proceed as out-of-pocket for lab services?</p>
                    <div className="flex gap-2">
                      <ABAButton variant="primary" size="md" fullWidth onClick={() => { setLabOopConfirm(false); setLabPhase('out-of-pocket'); }}>Confirm</ABAButton>
                      <ABAButton variant="outline" size="md" fullWidth onClick={() => setLabOopConfirm(false)}>Back</ABAButton>
                    </div>
                  </div>
                )}
              </>)}

              {/* ── Approval Pending ── */}
              {labPhase === 'approval-pending' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">Waiting for member to approve lab coverage in AbaAccess.</p>
                <div className="bg-[#FFF3DC] rounded-xl border border-[#D97706]/20 p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFF3DC] flex items-center justify-center"><Timer className="w-5 h-5 text-[#D97706]" /></div>
                    <div><p className="text-sm font-semibold text-[#1A1A1A]">Approval requested</p><p className="text-xs text-[#8F9AA1] mt-0.5">Member approves in AbaAccess using PIN.</p></div>
                  </div>
                  <div className="flex items-center justify-center gap-2 py-3 bg-white rounded-lg">
                    <Clock className="w-4 h-4 text-[#D97706]" />
                    <span className="text-2xl font-bold text-[#1A1A1A] font-mono tracking-wider">{fmtTimer(labTimerSeconds)}</span>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <ABAButton variant="secondary" size="md" fullWidth onClick={handleLabResend}><RefreshCw className="w-4 h-4" />Resend request</ABAButton>
                  {labResendCount >= 2 && <p className="text-[10px] text-[#D97706] text-center font-medium">Multiple resend attempts. Consider using fallback code or proceeding out-of-pocket.</p>}
                  <ABAButton variant="outline" size="md" fullWidth onClick={handleLabCancelApproval}>Cancel</ABAButton>
                </div>
                <div className="border-t border-[#E5E8EC] pt-3">
                  <button onClick={() => setLabShowFallback(!labShowFallback)} className="flex items-center gap-2 text-sm text-[#3A8DFF] font-medium hover:underline w-full">
                    <Keyboard className="w-4 h-4" />Enter approval code (fallback){labShowFallback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                  {labShowFallback && (
                    <div className="mt-3 space-y-3"><div className="flex gap-2">
                      <input type="text" maxLength={6} value={labFallbackCode} onChange={e => setLabFallbackCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" className="flex-1 px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-center text-lg font-mono tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]" />
                      <ABAButton variant="primary" size="md" onClick={handleLabValidateFallback} disabled={labFallbackCode.length !== 6}>Validate</ABAButton>
                    </div><p className="text-[10px] text-[#8F9AA1] text-center">Use only if sync fails.</p></div>
                  )}
                </div>
                <div className="border-t border-[#E5E8EC] pt-3 mt-3">
                  {!labOopConfirm ? (
                    <ABAButton variant="outline" size="md" fullWidth onClick={() => setLabOopConfirm(true)}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                  ) : (
                    <div className="p-4 bg-[#FFF3DC] rounded-xl border border-[#D97706]/20">
                      <p className="text-sm text-[#1A1A1A] mb-3">Proceed as out-of-pocket for lab services?</p>
                      <div className="flex gap-2">
                        <ABAButton variant="primary" size="md" fullWidth onClick={handleLabProceedOOP}>Confirm</ABAButton>
                        <ABAButton variant="outline" size="md" fullWidth onClick={() => setLabOopConfirm(false)}>Back</ABAButton>
                      </div>
                    </div>
                  )}
                </div>
              </>)}

              {/* ── Declined ── */}
              {labPhase === 'declined' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">The member declined the lab approval request.</p>
                <div className="bg-[#FEF2F2] rounded-xl border border-[#E44F4F]/20 p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center"><ShieldOff className="w-5 h-5 text-[#E44F4F]" /></div>
                    <div><p className="text-sm font-semibold text-[#E44F4F]">Declined</p><p className="text-xs text-[#8F9AA1] mt-0.5">Approval declined by member.</p></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <ABAButton variant="secondary" size="md" fullWidth onClick={handleLabResend}><RefreshCw className="w-4 h-4" />Resend request</ABAButton>
                  {labResendCount >= 2 && <p className="text-[10px] text-[#D97706] text-center font-medium">Multiple resend attempts. Consider proceeding out-of-pocket.</p>}
                  <ABAButton variant="outline" size="md" fullWidth onClick={handleLabProceedOOP}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                  <button onClick={closeLabSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button>
                </div>
              </>)}

              {/* ── Timed out ── */}
              {labPhase === 'timed-out' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">No response received within the timeout window.</p>
                <div className="bg-[#FFF3DC] rounded-xl border border-[#D97706]/20 p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFF3DC] flex items-center justify-center"><Timer className="w-5 h-5 text-[#D97706]" /></div>
                    <div><p className="text-sm font-semibold text-[#D97706]">Timed out</p><p className="text-xs text-[#8F9AA1] mt-0.5">No response. Request timed out.</p></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <ABAButton variant="secondary" size="md" fullWidth onClick={handleLabResend}><RefreshCw className="w-4 h-4" />Resend request</ABAButton>
                  {labResendCount >= 2 && <p className="text-[10px] text-[#D97706] text-center font-medium">Multiple resend attempts. Consider using fallback code or proceeding out-of-pocket.</p>}
                  <ABAButton variant="outline" size="md" fullWidth onClick={handleLabProceedOOP}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                </div>
                <div className="border-t border-[#E5E8EC] pt-3">
                  <button onClick={() => setLabShowFallback(!labShowFallback)} className="flex items-center gap-2 text-sm text-[#3A8DFF] font-medium hover:underline w-full">
                    <Keyboard className="w-4 h-4" />Enter approval code (fallback){labShowFallback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                  {labShowFallback && (
                    <div className="mt-3 space-y-3"><div className="flex gap-2">
                      <input type="text" maxLength={6} value={labFallbackCode} onChange={e => setLabFallbackCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" className="flex-1 px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-center text-lg font-mono tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]" />
                      <ABAButton variant="primary" size="md" onClick={handleLabValidateFallback} disabled={labFallbackCode.length !== 6}>Validate</ABAButton>
                    </div></div>
                  )}
                </div>
                <div className="border-t border-[#E5E8EC] pt-3 mt-3"><button onClick={closeLabSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button></div>
              </>)}

              {/* ── Failed sync ── */}
              {labPhase === 'failed-sync' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">A network issue prevented sync. Use fallback code if the member already approved.</p>
                <div className="bg-[#FEF2F2] rounded-xl border border-[#E44F4F]/20 p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center"><WifiOff className="w-5 h-5 text-[#E44F4F]" /></div>
                    <div><p className="text-sm font-semibold text-[#E44F4F]">Failed sync</p><p className="text-xs text-[#8F9AA1] mt-0.5">Network issue. Use fallback code if the member already approved.</p></div>
                  </div>
                </div>
                <div className="mb-4">
                  <button onClick={() => setLabShowFallback(!labShowFallback)} className="flex items-center gap-2 text-sm text-[#3A8DFF] font-medium hover:underline w-full mb-3">
                    <Keyboard className="w-4 h-4" />Enter approval code (fallback){labShowFallback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                  {labShowFallback && (
                    <div className="space-y-3"><div className="flex gap-2">
                      <input type="text" maxLength={6} value={labFallbackCode} onChange={e => setLabFallbackCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" className="flex-1 px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-center text-lg font-mono tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]" />
                      <ABAButton variant="primary" size="md" onClick={handleLabValidateFallback} disabled={labFallbackCode.length !== 6}>Validate</ABAButton>
                    </div></div>
                  )}
                </div>
                <div className="space-y-2">
                  <ABAButton variant="secondary" size="md" fullWidth onClick={handleLabRetrySync}><RefreshCw className="w-4 h-4" />Retry sync</ABAButton>
                  <ABAButton variant="outline" size="md" fullWidth onClick={handleLabProceedOOP}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                  <button onClick={closeLabSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button>
                </div>
              </>)}

              {/* ── Approved ── */}
              {labPhase === 'approved' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">Lab coverage approved. Confirm transfer.</p>
                <div className="bg-[#E9F8F0] rounded-xl border border-[#38C172]/20 p-4 mb-4">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#E9F8F0] flex items-center justify-center"><CheckCircle className="w-5 h-5 text-[#38C172]" /></div>
                    <div><p className="text-sm font-semibold text-[#38C172]">Approved</p><p className="text-xs text-[#4A4F55] mt-0.5">Approved via AbaAccess PIN</p></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-[#E5E8EC] overflow-hidden mb-5">
                  <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#32C28A]" /><h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">Coverage & Approval</h4></div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Approval</span><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E9F8F0] text-[#38C172]">Approved</span></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Coverage</span><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E9F8F0] text-[#38C172]">Covered</span></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Applied Package</span><span className="text-sm font-medium text-[#1A1A1A]">Lab Only</span></div>
                    <div className="border-t border-[#F7F9FC]" />
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Remaining Lab Credits</span><span className="text-sm font-medium text-[#32C28A]">8 of 10</span></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <ABAButton variant="primary" size="lg" fullWidth isLoading={labSubmitting} onClick={() => { setLabSubmitting(true); setTimeout(() => { sendToLabWithCoverage(visit.id, { status: 'Covered', packageName: 'Lab Only' }); showToast('Transferred to Lab. Coverage applied.','success'); closeLabSheet(); }, 500); }}>
                    <CheckCircle className="w-5 h-5" />Confirm transfer to Lab
                  </ABAButton>
                  <button onClick={closeLabSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button>
                </div>
              </>)}

              {/* ── Out-of-pocket ── */}
              {labPhase === 'out-of-pocket' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">Patient will proceed without lab coverage. Confirm transfer.</p>
                <div className="bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-4 mb-4">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#F7F9FC] flex items-center justify-center"><Wallet className="w-5 h-5 text-[#8F9AA1]" /></div>
                    <div><p className="text-sm font-semibold text-[#1A1A1A]">Out-of-pocket</p><p className="text-xs text-[#8F9AA1] mt-0.5">No coverage applied — patient pays full lab fees.</p></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-[#E5E8EC] overflow-hidden mb-5">
                  <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#8F9AA1]" /><h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">Coverage & Approval</h4></div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Coverage</span><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]">Out-of-pocket</span></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Applied Package</span><span className="text-sm font-medium text-[#8F9AA1]">N/A</span></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <ABAButton variant="primary" size="lg" fullWidth isLoading={labSubmitting} onClick={() => { setLabSubmitting(true); setTimeout(() => { sendToLabWithCoverage(visit.id, { status: 'Out-of-pocket' }); showToast('Transferred to Lab. Out-of-pocket.','success'); closeLabSheet(); }, 500); }}>
                    <CheckCircle className="w-5 h-5" />Confirm transfer to Lab
                  </ABAButton>
                  <button onClick={closeLabSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button>
                </div>
              </>)}
            </div>
          </div>
        </div>
      )}

      {/* ── Pharmacy Sheet ── */}
      {showPharmSheet && visit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) closePharmSheet(); }}>
          <div className="bg-white rounded-t-3xl w-full max-w-[390px] mx-auto pb-8 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-center py-3"><div className="w-10 h-1 rounded-full bg-[#C9D0DB]" /></div>
            <div className="px-5">
              <div className="flex items-center gap-2 mb-1">
                <Pill className="w-5 h-5 text-[#EC4899]" />
                <h3 className="text-lg font-semibold text-[#1A1A1A]">Transfer to Pharmacy</h3>
              </div>

              {/* ── Already Transferred ── */}
              {pharmPhase === 'already-transferred' && (<>
                <div className="bg-[#EBF3FF] rounded-xl border border-[#3A8DFF]/20 p-4 mt-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EBF3FF] flex items-center justify-center flex-shrink-0"><Info className="w-5 h-5 text-[#3A8DFF]" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#3A8DFF]">Already transferred</p>
                      <p className="text-xs text-[#8F9AA1] mt-0.5">Already transferred to Pharmacy ({visit.pharmCoverageStatus === 'Out-of-pocket' ? 'out-of-pocket' : 'coverage applied'}).</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[#8F9AA1] mb-4">A coverage deduction has already been recorded for this station during this visit.</p>
                {pharmShowAlreadyDetail && visit.pharmCoverageStatus && (
                  <div className="bg-white rounded-xl border border-[#E5E8EC] overflow-hidden mb-4">
                    <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#32C28A]" /><h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">Coverage & Approval</h4></div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Coverage</span><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${visit.pharmCoverageStatus === 'Covered' ? 'bg-[#E9F8F0] text-[#38C172]' : visit.pharmCoverageStatus === 'Discount applied' ? 'bg-[#EBF3FF] text-[#3A8DFF]' : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'}`}>{visit.pharmCoverageStatus}</span></div>
                      <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Applied Package</span><span className="text-sm font-medium text-[#1A1A1A]">{visit.pharmCoveragePackage || 'N/A'}</span></div>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <ABAButton variant="outline" size="md" fullWidth onClick={() => setPharmShowAlreadyDetail(!pharmShowAlreadyDetail)}><Eye className="w-4 h-4" />{pharmShowAlreadyDetail ? 'Hide details' : 'View details'}</ABAButton>
                  <ABAButton variant="outline" size="md" fullWidth disabled><Lock className="w-4 h-4" />Undo transfer (admin only)</ABAButton>
                  <button onClick={closePharmSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Close</button>
                </div>
              </>)}

              {/* ── Patient Confirm ── */}
              {pharmPhase === 'patient-confirm' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">Confirm patient details and coverage before sending to Pharmacy.</p>
                <div className="mb-4"><label className="block text-sm font-medium text-[#1A1A1A] mb-2">Patient type</label>
                  <div className="flex gap-2">
                    {(['member','dependent'] as const).map(t => (
                      <button key={t} onClick={() => setPharmPatientType(t)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${pharmPatientType===t ? 'border-[#32C28A] bg-[#E9F8F0] text-[#1A1A1A]' : 'border-[#E5E8EC] bg-white text-[#8F9AA1]'}`}>
                        {t==='member' ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}{t==='member' ? 'Member' : 'Dependent'}
                      </button>
                    ))}
                  </div>
                </div>
                {pharmPatientType === 'dependent' && (
                  <div className="mb-4"><label className="block text-sm font-medium text-[#1A1A1A] mb-2">Select dependent</label>
                    <div className="relative">
                      <select value={pharmSelectedDep} onChange={e => setPharmSelectedDep(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-sm text-[#1A1A1A] appearance-none focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]">
                        {SAMPLE_DEPENDENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F9AA1] pointer-events-none" />
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  <ABAButton variant="primary" size="lg" fullWidth onClick={startPharmApproval}><ShieldCheck className="w-5 h-5" />Request Approval</ABAButton>
                  <ABAButton variant="outline" size="lg" fullWidth onClick={() => setPharmOopConfirm(true)}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                  <button onClick={closePharmSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button>
                </div>
                {pharmOopConfirm && (
                  <div className="mt-4 p-4 bg-[#FFF3DC] rounded-xl border border-[#D97706]/20">
                    <p className="text-sm text-[#1A1A1A] mb-3">Proceed as out-of-pocket for pharmacy services?</p>
                    <div className="flex gap-2">
                      <ABAButton variant="primary" size="md" fullWidth onClick={() => { setPharmOopConfirm(false); setPharmPhase('out-of-pocket'); }}>Confirm</ABAButton>
                      <ABAButton variant="outline" size="md" fullWidth onClick={() => setPharmOopConfirm(false)}>Back</ABAButton>
                    </div>
                  </div>
                )}
              </>)}

              {/* ── Approval Pending ── */}
              {pharmPhase === 'approval-pending' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">Waiting for member to approve pharmacy coverage in AbaAccess.</p>
                <div className="bg-[#FFF3DC] rounded-xl border border-[#D97706]/20 p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFF3DC] flex items-center justify-center"><Timer className="w-5 h-5 text-[#D97706]" /></div>
                    <div><p className="text-sm font-semibold text-[#1A1A1A]">Approval requested</p><p className="text-xs text-[#8F9AA1] mt-0.5">Member approves in AbaAccess using PIN.</p></div>
                  </div>
                  <div className="flex items-center justify-center gap-2 py-3 bg-white rounded-lg">
                    <Clock className="w-4 h-4 text-[#D97706]" />
                    <span className="text-2xl font-bold text-[#1A1A1A] font-mono tracking-wider">{fmtTimer(pharmTimerSeconds)}</span>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <ABAButton variant="secondary" size="md" fullWidth onClick={handlePharmResend}><RefreshCw className="w-4 h-4" />Resend request</ABAButton>
                  {pharmResendCount >= 2 && <p className="text-[10px] text-[#D97706] text-center font-medium">Multiple resend attempts.</p>}
                  <ABAButton variant="outline" size="md" fullWidth onClick={handlePharmCancelApproval}>Cancel</ABAButton>
                </div>
                <div className="border-t border-[#E5E8EC] pt-3">
                  <button onClick={() => setPharmShowFallback(!pharmShowFallback)} className="flex items-center gap-2 text-sm text-[#3A8DFF] font-medium hover:underline w-full">
                    <Keyboard className="w-4 h-4" />Enter approval code (fallback){pharmShowFallback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                  {pharmShowFallback && (
                    <div className="mt-3 space-y-3"><div className="flex gap-2">
                      <input type="text" maxLength={6} value={pharmFallbackCode} onChange={e => setPharmFallbackCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" className="flex-1 px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-center text-lg font-mono tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]" />
                      <ABAButton variant="primary" size="md" onClick={handlePharmValidateFallback} disabled={pharmFallbackCode.length !== 6}>Validate</ABAButton>
                    </div><p className="text-[10px] text-[#8F9AA1] text-center">Use only if sync fails.</p></div>
                  )}
                </div>
                <div className="border-t border-[#E5E8EC] pt-3 mt-3">
                  {!pharmOopConfirm ? (
                    <ABAButton variant="outline" size="md" fullWidth onClick={() => setPharmOopConfirm(true)}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                  ) : (
                    <div className="p-4 bg-[#FFF3DC] rounded-xl border border-[#D97706]/20">
                      <p className="text-sm text-[#1A1A1A] mb-3">Proceed as out-of-pocket for pharmacy services?</p>
                      <div className="flex gap-2">
                        <ABAButton variant="primary" size="md" fullWidth onClick={handlePharmProceedOOP}>Confirm</ABAButton>
                        <ABAButton variant="outline" size="md" fullWidth onClick={() => setPharmOopConfirm(false)}>Back</ABAButton>
                      </div>
                    </div>
                  )}
                </div>
              </>)}

              {/* ── Declined ── */}
              {pharmPhase === 'declined' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">The member declined the pharmacy approval request.</p>
                <div className="bg-[#FEF2F2] rounded-xl border border-[#E44F4F]/20 p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center"><ShieldOff className="w-5 h-5 text-[#E44F4F]" /></div>
                    <div><p className="text-sm font-semibold text-[#E44F4F]">Declined</p><p className="text-xs text-[#8F9AA1] mt-0.5">Approval declined by member.</p></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <ABAButton variant="secondary" size="md" fullWidth onClick={handlePharmResend}><RefreshCw className="w-4 h-4" />Resend request</ABAButton>
                  <ABAButton variant="outline" size="md" fullWidth onClick={handlePharmProceedOOP}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                  <button onClick={closePharmSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button>
                </div>
              </>)}

              {/* ── Timed out ── */}
              {pharmPhase === 'timed-out' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">No response received within the timeout window.</p>
                <div className="bg-[#FFF3DC] rounded-xl border border-[#D97706]/20 p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFF3DC] flex items-center justify-center"><Timer className="w-5 h-5 text-[#D97706]" /></div>
                    <div><p className="text-sm font-semibold text-[#D97706]">Timed out</p><p className="text-xs text-[#8F9AA1] mt-0.5">No response. Request timed out.</p></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <ABAButton variant="secondary" size="md" fullWidth onClick={handlePharmResend}><RefreshCw className="w-4 h-4" />Resend request</ABAButton>
                  <ABAButton variant="outline" size="md" fullWidth onClick={handlePharmProceedOOP}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                </div>
                <div className="border-t border-[#E5E8EC] pt-3">
                  <button onClick={() => setPharmShowFallback(!pharmShowFallback)} className="flex items-center gap-2 text-sm text-[#3A8DFF] font-medium hover:underline w-full">
                    <Keyboard className="w-4 h-4" />Enter approval code (fallback){pharmShowFallback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                  {pharmShowFallback && (
                    <div className="mt-3 space-y-3"><div className="flex gap-2">
                      <input type="text" maxLength={6} value={pharmFallbackCode} onChange={e => setPharmFallbackCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" className="flex-1 px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-center text-lg font-mono tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]" />
                      <ABAButton variant="primary" size="md" onClick={handlePharmValidateFallback} disabled={pharmFallbackCode.length !== 6}>Validate</ABAButton>
                    </div></div>
                  )}
                </div>
                <div className="border-t border-[#E5E8EC] pt-3 mt-3"><button onClick={closePharmSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button></div>
              </>)}

              {/* ── Failed sync ── */}
              {pharmPhase === 'failed-sync' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">A network issue prevented sync. Use fallback code if the member already approved.</p>
                <div className="bg-[#FEF2F2] rounded-xl border border-[#E44F4F]/20 p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center"><WifiOff className="w-5 h-5 text-[#E44F4F]" /></div>
                    <div><p className="text-sm font-semibold text-[#E44F4F]">Failed sync</p><p className="text-xs text-[#8F9AA1] mt-0.5">Network issue. Use fallback code if the member already approved.</p></div>
                  </div>
                </div>
                <div className="mb-4">
                  <button onClick={() => setPharmShowFallback(!pharmShowFallback)} className="flex items-center gap-2 text-sm text-[#3A8DFF] font-medium hover:underline w-full mb-3">
                    <Keyboard className="w-4 h-4" />Enter approval code (fallback){pharmShowFallback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                  {pharmShowFallback && (
                    <div className="space-y-3"><div className="flex gap-2">
                      <input type="text" maxLength={6} value={pharmFallbackCode} onChange={e => setPharmFallbackCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" className="flex-1 px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-center text-lg font-mono tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]" />
                      <ABAButton variant="primary" size="md" onClick={handlePharmValidateFallback} disabled={pharmFallbackCode.length !== 6}>Validate</ABAButton>
                    </div></div>
                  )}
                </div>
                <div className="space-y-2">
                  <ABAButton variant="secondary" size="md" fullWidth onClick={handlePharmRetrySync}><RefreshCw className="w-4 h-4" />Retry sync</ABAButton>
                  <ABAButton variant="outline" size="md" fullWidth onClick={handlePharmProceedOOP}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                  <button onClick={closePharmSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button>
                </div>
              </>)}

              {/* ── Approved ── */}
              {pharmPhase === 'approved' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">Pharmacy coverage approved. Confirm transfer.</p>
                <div className="bg-[#E9F8F0] rounded-xl border border-[#38C172]/20 p-4 mb-4">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#E9F8F0] flex items-center justify-center"><CheckCircle className="w-5 h-5 text-[#38C172]" /></div>
                    <div><p className="text-sm font-semibold text-[#38C172]">Approved</p><p className="text-xs text-[#4A4F55] mt-0.5">Approved via AbaAccess PIN</p></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-[#E5E8EC] overflow-hidden mb-5">
                  <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#32C28A]" /><h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">Coverage & Approval</h4></div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Approval</span><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E9F8F0] text-[#38C172]">Approved</span></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Coverage</span><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E9F8F0] text-[#38C172]">Covered</span></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Applied Package</span><span className="text-sm font-medium text-[#1A1A1A]">Pharmacy Only</span></div>
                    <div className="border-t border-[#F7F9FC]" />
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Remaining Credits</span><span className="text-sm font-medium text-[#32C28A]">8 of 10</span></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <ABAButton variant="primary" size="lg" fullWidth isLoading={pharmSubmitting} onClick={() => { setPharmSubmitting(true); setTimeout(() => { sendToPharmacyWithCoverage(visit.id, { status: 'Covered', packageName: 'Pharmacy Only' }); showToast('Transferred to Pharmacy. Coverage applied.','success'); closePharmSheet(); }, 500); }}>
                    <CheckCircle className="w-5 h-5" />Confirm transfer to Pharmacy
                  </ABAButton>
                  <button onClick={closePharmSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button>
                </div>
              </>)}

              {/* ── Out-of-pocket ── */}
              {pharmPhase === 'out-of-pocket' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">Patient will proceed without pharmacy coverage. Confirm transfer.</p>
                <div className="bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-4 mb-4">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#F7F9FC] flex items-center justify-center"><Wallet className="w-5 h-5 text-[#8F9AA1]" /></div>
                    <div><p className="text-sm font-semibold text-[#1A1A1A]">Out-of-pocket</p><p className="text-xs text-[#8F9AA1] mt-0.5">No coverage applied — patient pays full pharmacy fees.</p></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-[#E5E8EC] overflow-hidden mb-5">
                  <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#8F9AA1]" /><h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">Coverage & Approval</h4></div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Coverage</span><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]">Out-of-pocket</span></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Applied Package</span><span className="text-sm font-medium text-[#8F9AA1]">N/A</span></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <ABAButton variant="primary" size="lg" fullWidth isLoading={pharmSubmitting} onClick={() => { setPharmSubmitting(true); setTimeout(() => { sendToPharmacyWithCoverage(visit.id, { status: 'Out-of-pocket' }); showToast('Transferred to Pharmacy. Out-of-pocket.','success'); closePharmSheet(); }, 500); }}>
                    <CheckCircle className="w-5 h-5" />Confirm transfer to Pharmacy
                  </ABAButton>
                  <button onClick={closePharmSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button>
                </div>
              </>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Reassign Sheet ── */
const clinicianOptions: { id: CLQueueItem['assignedTo']; label: string; subtitle: string }[] = [
  { id: 'dr-ssekandi', label: 'Dr. Ssekandi', subtitle: 'Doctor — Available' },
  { id: 'dr-nambi', label: 'Dr. Nambi', subtitle: 'Doctor — Available' },
];

function ReassignSheet({
  visitId,
  currentAssignee,
  onClose,
}: {
  visitId: string;
  currentAssignee: CLQueueItem['assignedTo'];
  onClose: () => void;
}) {
  const handleReassign = (newAssignee: CLQueueItem['assignedTo']) => {
    reassignVisit(visitId, newAssignee);
    const label = clinicianOptions.find((c) => c.id === newAssignee)?.label ?? newAssignee;
    showToast(`Patient reassigned to ${label}`, 'success');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#FFFFFF] rounded-t-3xl w-full max-w-[390px] mx-auto pb-8">
        {/* Handle bar */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-[#C9D0DB]" />
        </div>

        <div className="px-5 pb-2">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">Reassign Patient</h3>
          <p className="text-sm text-[#8F9AA1] mt-1">Select a doctor to assign this visit to</p>
        </div>

        <div className="px-5 space-y-2 mt-2">
          {clinicianOptions
            .filter((c) => c.id !== currentAssignee)
            .map((c) => (
              <button
                key={c.id}
                onClick={() => handleReassign(c.id)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border border-[#E5E8EC] bg-[#FFFFFF] hover:bg-[#F7F9FC] active:bg-[#E5E8EC] transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                  <UserCog className="w-5 h-5 text-aba-secondary-main" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A]">{c.label}</p>
                  <p className="text-xs text-[#8F9AA1]">{c.subtitle}</p>
                </div>
              </button>
            ))}

          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-medium text-[#8F9AA1] hover:underline mt-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Coverage Row ── */
function CLCoverageRow({
  icon,
  label,
  status,
  packageName,
}: {
  icon: React.ReactNode;
  label: string;
  status?: string;
  packageName?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-shrink-0 text-aba-neutral-500">{icon}</div>
      <span className="text-xs text-aba-neutral-600 w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 flex items-center justify-end gap-1.5">
        {status === 'Covered' ? (
          <span className="text-[10px] font-semibold px-1.5 py-[1px] rounded-full bg-[#E9F8F0] text-[#38C172]">Covered</span>
        ) : status === 'Out-of-pocket' ? (
          <span className="text-[10px] font-semibold px-1.5 py-[1px] rounded-full bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]">Out-of-pocket</span>
        ) : status === 'Discount applied' ? (
          <span className="text-[10px] font-semibold px-1.5 py-[1px] rounded-full bg-[#EBF3FF] text-[#3A8DFF]">Discount applied</span>
        ) : (
          <span className="text-[10px] font-medium text-aba-neutral-400">Pending</span>
        )}
        {packageName && <span className="text-[10px] text-aba-neutral-500">{packageName}</span>}
      </div>
    </div>
  );
}