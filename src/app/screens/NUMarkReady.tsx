/**
 * NU-05 Mark Ready for Clinician — Now uses the full AbaAccess approval
 * handshake for consultation coverage before marking the patient ready.
 *
 * Flow: patient-confirm → approval-pending → approved/declined/timed-out/
 *       failed-sync → out-of-pocket → already-transferred.
 * On confirm → status → "Ready for Clinician", return to NU-01.
 */
import { useNurseStore, markReadyWithCoverage } from '../data/nurseStore';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import {
  User,
  Users,
  CheckCircle2,
  CheckCircle,
  HeartPulse,
  FileText,
  ShieldCheck,
  Clock,
  Stethoscope,
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

/* ── Phase type ── */
type ConsultPhase =
  | 'patient-confirm'
  | 'approval-pending'
  | 'approved'
  | 'out-of-pocket'
  | 'declined'
  | 'timed-out'
  | 'failed-sync'
  | 'already-transferred';

/* ── Sample dependents ── */
const SAMPLE_DEPENDENTS = [
  { id: 'dep-1', name: 'Amina K. (Daughter, 5 yrs)' },
  { id: 'dep-2', name: 'Hassan K. (Son, 12 yrs)' },
];

/* ── Timer helper ── */
function fmtTimer(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function NUMarkReady() {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const { getById } = useNurseStore();

  const patient = getById(patientId || '');

  /* ── State ── */
  const [showSheet, setShowSheet] = useState(false);
  const [phase, setPhase] = useState<ConsultPhase>('patient-confirm');
  const [patientType, setPatientType] = useState<'member' | 'dependent'>('member');
  const [selectedDep, setSelectedDep] = useState(SAMPLE_DEPENDENTS[0].id);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackCode, setFallbackCode] = useState('');
  const [oopConfirm, setOopConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [showAlreadyDetail, setShowAlreadyDetail] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoApproveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoApproveRef.current) clearTimeout(autoApproveRef.current);
    };
  }, []);

  if (!patient) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Mark Ready" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Patient not found</p>
        </div>
      </div>
    );
  }

  const hasVitals = patient.vitals && (patient.vitals.bp || patient.vitals.temp);
  const hasNotes = patient.notes.length > 0;
  const isAlreadyReady = patient.status === 'ready-for-clinician';
  const consultAlreadyApplied = !!patient.consultCoverageStatus;

  /* ── Helpers ── */

  const clearTimers = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (autoApproveRef.current) { clearTimeout(autoApproveRef.current); autoApproveRef.current = null; }
  };

  const closeSheet = () => {
    clearTimers();
    setShowSheet(false);
    setPhase('patient-confirm');
    setPatientType('member');
    setSelectedDep(SAMPLE_DEPENDENTS[0].id);
    setTimerSeconds(120);
    setShowFallback(false);
    setFallbackCode('');
    setOopConfirm(false);
    setIsSubmitting(false);
    setResendCount(0);
    setShowAlreadyDetail(false);
  };

  const startTimer = () => {
    clearTimers();
    setTimerSeconds(120);
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (autoApproveRef.current) clearTimeout(autoApproveRef.current);
          setTimeout(() => setPhase('timed-out'), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    autoApproveRef.current = setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase('approved');
    }, 5000);
  };

  const startApproval = () => {
    setShowFallback(false);
    setFallbackCode('');
    setOopConfirm(false);
    setResendCount(0);
    setPhase('approval-pending');
    startTimer();
  };

  const handleResend = () => {
    setResendCount((c) => c + 1);
    setPhase('approval-pending');
    startTimer();
  };

  const handleRetrySync = () => {
    setPhase('approval-pending');
    startTimer();
  };

  const handleValidateFallback = () => {
    if (fallbackCode.length === 6) {
      clearTimers();
      setPhase('approved');
    }
  };

  const handleProceedOOP = () => {
    clearTimers();
    setPhase('out-of-pocket');
  };

  const handleCancelApproval = () => {
    clearTimers();
    setPhase('patient-confirm');
    setTimerSeconds(120);
  };

  /* ── Open the approval sheet ── */
  const openSheet = () => {
    if (consultAlreadyApplied) {
      setPhase('already-transferred');
    } else {
      setPhase('patient-confirm');
    }
    setShowAlreadyDetail(false);
    setShowSheet(true);
  };

  /* ── Final confirm handler ── */
  const handleConfirmWithCoverage = () => {
    setIsSubmitting(true);
    const coverageStatus = phase === 'out-of-pocket' ? 'Out-of-pocket' as const : 'Covered' as const;
    const packageName = phase === 'out-of-pocket' ? undefined : 'Consultation Only';
    setTimeout(() => {
      markReadyWithCoverage(patient.id, { status: coverageStatus, packageName });
      showToast(
        coverageStatus === 'Covered'
          ? `${patient.patientName} is ready for doctor. Coverage applied.`
          : `${patient.patientName} is ready for doctor. Out-of-pocket.`,
        'success'
      );
      closeSheet();
      navigate('/nu/queue', { replace: true });
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Mark Ready for Doctor" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-4 space-y-3">

          {/* Confirm banner */}
          <div className="flex flex-col items-center text-center py-6 bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC]">
            <div className="w-16 h-16 rounded-full bg-[#E9F8F0] flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-[#32C28A]" />
            </div>
            <h2 className="text-base font-semibold text-[#1A1A1A] mb-1">
              Mark Patient Ready?
            </h2>
            <p className="text-xs text-[#8F9AA1] max-w-[280px] leading-relaxed">
              This will move{' '}
              <span className="font-semibold text-[#1A1A1A]">{patient.patientName}</span>{' '}
              to the "Ready for Doctor" queue so a doctor can pick them up.
            </p>
          </div>

          {/* Patient card */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-[#3A8DFF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                  {patient.patientName}
                </p>
                <p className="text-xs text-[#8F9AA1]">
                  {patient.patientAge} yrs · {patient.patientGender} · {patient.ticketNo}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E8EC] text-xs text-[#8F9AA1]">
              <Stethoscope className="w-3.5 h-3.5 flex-shrink-0" />
              {patient.service}
              <span className="ml-auto flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Arrived {patient.arrivalTime}
              </span>
            </div>
          </div>

          {/* Consultation coverage (read-only after applied) */}
          {patient.consultCoverageStatus && (
            <div className="flex items-center gap-2 p-2.5 bg-[#F7F9FC] rounded-xl border border-[#E5E8EC]">
              <ShieldCheck className={`w-4 h-4 flex-shrink-0 ${patient.consultCoverageStatus === 'Covered' ? 'text-[#32C28A]' : 'text-[#8F9AA1]'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#8F9AA1]">Consultation coverage</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-semibold px-1.5 py-[1px] rounded-full ${
                    patient.consultCoverageStatus === 'Covered' ? 'bg-[#E9F8F0] text-[#38C172]'
                    : patient.consultCoverageStatus === 'Discount applied' ? 'bg-[#EBF3FF] text-[#3A8DFF]'
                    : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'
                  }`}>{patient.consultCoverageStatus}</span>
                  {patient.consultCoveragePackage && <span className="text-[10px] text-[#8F9AA1]">{patient.consultCoveragePackage}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Readiness checklist */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-3">
              Triage Readiness
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${hasVitals ? 'bg-[#E9F8F0]' : 'bg-[#FFF3DC]'}`}>
                  <HeartPulse className={`w-3.5 h-3.5 ${hasVitals ? 'text-[#38C172]' : 'text-[#D97706]'}`} />
                </div>
                <span className="text-sm text-[#1A1A1A]">Vitals captured</span>
                <span className={`ml-auto text-[10px] font-semibold px-1.5 py-[1px] rounded-full ${hasVitals ? 'bg-[#E9F8F0] text-[#38C172]' : 'bg-[#FFF3DC] text-[#D97706]'}`}>
                  {hasVitals ? 'Done' : 'Pending'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${hasNotes ? 'bg-[#E9F8F0]' : 'bg-[#F7F9FC]'}`}>
                  <FileText className={`w-3.5 h-3.5 ${hasNotes ? 'text-[#38C172]' : 'text-[#C9D0DB]'}`} />
                </div>
                <span className="text-sm text-[#1A1A1A]">Nursing notes</span>
                <span className={`ml-auto text-[10px] font-semibold px-1.5 py-[1px] rounded-full ${hasNotes ? 'bg-[#E9F8F0] text-[#38C172]' : 'bg-[#F7F9FC] text-[#C9D0DB] border border-[#E5E8EC]'}`}>
                  {hasNotes ? `${patient.notes.length} note(s)` : 'Optional'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4 space-y-2">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={openSheet}
            disabled={isAlreadyReady}
          >
            <CheckCircle2 className="w-5 h-5" />
            {isAlreadyReady ? 'Already Marked Ready' : 'Mark Ready for Doctor'}
            {consultAlreadyApplied && !isAlreadyReady && <span className="ml-auto text-[10px] font-semibold text-white/90 bg-white/20 px-1.5 py-0.5 rounded-full">Applied</span>}
          </ABAButton>
          <ABAButton variant="outline" fullWidth onClick={() => navigate(-1)}>
            Cancel
          </ABAButton>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
           Consultation Approval Bottom Sheet
         ═══════════════════════════════════════════ */}
      {showSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) closeSheet(); }}
        >
          <div className="bg-white rounded-t-3xl w-full max-w-[390px] mx-auto pb-8 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-center py-3"><div className="w-10 h-1 rounded-full bg-[#C9D0DB]" /></div>
            <div className="px-5">
              <div className="flex items-center gap-2 mb-1">
                <Stethoscope className="w-5 h-5 text-aba-primary-main" />
                <h3 className="text-lg font-semibold text-[#1A1A1A]">Transfer to Consultation</h3>
              </div>

              {/* ── Already Transferred ── */}
              {phase === 'already-transferred' && (<>
                <div className="bg-[#EBF3FF] rounded-xl border border-[#3A8DFF]/20 p-4 mt-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EBF3FF] flex items-center justify-center flex-shrink-0"><Info className="w-5 h-5 text-[#3A8DFF]" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#3A8DFF]">Already transferred</p>
                      <p className="text-xs text-[#8F9AA1] mt-0.5">Already transferred to Consultation ({patient.consultCoverageStatus === 'Out-of-pocket' ? 'out-of-pocket' : 'coverage applied'}).</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[#8F9AA1] mb-4">A coverage deduction has already been recorded for this station during this visit. Transferring again would cause a duplicate deduction.</p>
                {showAlreadyDetail && patient.consultCoverageStatus && (
                  <div className="bg-white rounded-xl border border-[#E5E8EC] overflow-hidden mb-4">
                    <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#32C28A]" /><h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">Coverage & Approval</h4></div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Coverage</span><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${patient.consultCoverageStatus === 'Covered' ? 'bg-[#E9F8F0] text-[#38C172]' : patient.consultCoverageStatus === 'Discount applied' ? 'bg-[#EBF3FF] text-[#3A8DFF]' : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'}`}>{patient.consultCoverageStatus}</span></div>
                      <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Applied Package</span><span className="text-sm font-medium text-[#1A1A1A]">{patient.consultCoveragePackage || 'N/A'}</span></div>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <ABAButton variant="outline" size="md" fullWidth onClick={() => setShowAlreadyDetail(!showAlreadyDetail)}><Eye className="w-4 h-4" />{showAlreadyDetail ? 'Hide details' : 'View details'}</ABAButton>
                  <ABAButton variant="outline" size="md" fullWidth disabled><Lock className="w-4 h-4" />Undo transfer (admin only)</ABAButton>
                  <button onClick={closeSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Close</button>
                </div>
              </>)}

              {/* ── Patient Confirm ── */}
              {phase === 'patient-confirm' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">Confirm patient details and type before requesting coverage approval.</p>
                <div className="mb-4"><label className="block text-sm font-medium text-[#1A1A1A] mb-2">Patient type</label>
                  <div className="flex gap-2">
                    {(['member','dependent'] as const).map(t => (
                      <button key={t} onClick={() => setPatientType(t)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${patientType===t ? 'border-[#32C28A] bg-[#E9F8F0] text-[#1A1A1A]' : 'border-[#E5E8EC] bg-white text-[#8F9AA1]'}`}>
                        {t==='member' ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}{t==='member' ? 'Member' : 'Dependent'}
                      </button>
                    ))}
                  </div>
                </div>
                {patientType === 'dependent' && (
                  <div className="mb-4"><label className="block text-sm font-medium text-[#1A1A1A] mb-2">Select dependent</label>
                    <div className="relative">
                      <select value={selectedDep} onChange={e => setSelectedDep(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-sm text-[#1A1A1A] appearance-none focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]">
                        {SAMPLE_DEPENDENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F9AA1] pointer-events-none" />
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  <ABAButton variant="primary" size="lg" fullWidth onClick={startApproval}><ShieldCheck className="w-5 h-5" />Request Approval</ABAButton>
                  <ABAButton variant="outline" size="lg" fullWidth onClick={() => setOopConfirm(true)}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                  <button onClick={closeSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button>
                </div>
                {oopConfirm && (
                  <div className="mt-4 p-4 bg-[#FFF3DC] rounded-xl border border-[#D97706]/20">
                    <p className="text-sm text-[#1A1A1A] mb-3">Proceed as out-of-pocket for consultation?</p>
                    <div className="flex gap-2">
                      <ABAButton variant="primary" size="md" fullWidth onClick={() => { setOopConfirm(false); setPhase('out-of-pocket'); }}>Confirm</ABAButton>
                      <ABAButton variant="outline" size="md" fullWidth onClick={() => setOopConfirm(false)}>Back</ABAButton>
                    </div>
                  </div>
                )}
              </>)}

              {/* ── Approval Pending ── */}
              {phase === 'approval-pending' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">Waiting for member to approve consultation coverage in AbaAccess.</p>
                <div className="bg-[#FFF3DC] rounded-xl border border-[#D97706]/20 p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFF3DC] flex items-center justify-center"><Timer className="w-5 h-5 text-[#D97706]" /></div>
                    <div><p className="text-sm font-semibold text-[#1A1A1A]">Approval requested</p><p className="text-xs text-[#8F9AA1] mt-0.5">Member approves in AbaAccess using PIN.</p></div>
                  </div>
                  <div className="flex items-center justify-center gap-2 py-3 bg-white rounded-lg">
                    <Clock className="w-4 h-4 text-[#D97706]" />
                    <span className="text-2xl font-bold text-[#1A1A1A] font-mono tracking-wider">{fmtTimer(timerSeconds)}</span>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <ABAButton variant="secondary" size="md" fullWidth onClick={handleResend}><RefreshCw className="w-4 h-4" />Resend request</ABAButton>
                  {resendCount >= 2 && <p className="text-[10px] text-[#D97706] text-center font-medium">Multiple resend attempts. Consider using fallback code or proceeding out-of-pocket.</p>}
                  <ABAButton variant="outline" size="md" fullWidth onClick={handleCancelApproval}>Cancel</ABAButton>
                </div>
                <div className="border-t border-[#E5E8EC] pt-3">
                  <button onClick={() => setShowFallback(!showFallback)} className="flex items-center gap-2 text-sm text-[#3A8DFF] font-medium hover:underline w-full">
                    <Keyboard className="w-4 h-4" />Enter approval code (fallback){showFallback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                  {showFallback && (
                    <div className="mt-3 space-y-3"><div className="flex gap-2">
                      <input type="text" maxLength={6} value={fallbackCode} onChange={e => setFallbackCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" className="flex-1 px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-center text-lg font-mono tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]" />
                      <ABAButton variant="primary" size="md" onClick={handleValidateFallback} disabled={fallbackCode.length !== 6}>Validate</ABAButton>
                    </div><p className="text-[10px] text-[#8F9AA1] text-center">Use only if sync fails.</p></div>
                  )}
                </div>
                <div className="border-t border-[#E5E8EC] pt-3 mt-3">
                  {!oopConfirm ? (
                    <ABAButton variant="outline" size="md" fullWidth onClick={() => setOopConfirm(true)}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                  ) : (
                    <div className="p-4 bg-[#FFF3DC] rounded-xl border border-[#D97706]/20">
                      <p className="text-sm text-[#1A1A1A] mb-3">Proceed as out-of-pocket for consultation?</p>
                      <div className="flex gap-2">
                        <ABAButton variant="primary" size="md" fullWidth onClick={handleProceedOOP}>Confirm</ABAButton>
                        <ABAButton variant="outline" size="md" fullWidth onClick={() => setOopConfirm(false)}>Back</ABAButton>
                      </div>
                    </div>
                  )}
                </div>
              </>)}

              {/* ── Declined ── */}
              {phase === 'declined' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">The member declined the consultation approval request.</p>
                <div className="bg-[#FEF2F2] rounded-xl border border-[#E44F4F]/20 p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center"><ShieldOff className="w-5 h-5 text-[#E44F4F]" /></div>
                    <div><p className="text-sm font-semibold text-[#E44F4F]">Declined</p><p className="text-xs text-[#8F9AA1] mt-0.5">Approval declined by member.</p></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <ABAButton variant="secondary" size="md" fullWidth onClick={handleResend}><RefreshCw className="w-4 h-4" />Resend request</ABAButton>
                  {resendCount >= 2 && <p className="text-[10px] text-[#D97706] text-center font-medium">Multiple resend attempts. Consider proceeding out-of-pocket.</p>}
                  <ABAButton variant="outline" size="md" fullWidth onClick={handleProceedOOP}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                  <button onClick={closeSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button>
                </div>
              </>)}

              {/* ── Timed out ── */}
              {phase === 'timed-out' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">No response received within the timeout window.</p>
                <div className="bg-[#FFF3DC] rounded-xl border border-[#D97706]/20 p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFF3DC] flex items-center justify-center"><Timer className="w-5 h-5 text-[#D97706]" /></div>
                    <div><p className="text-sm font-semibold text-[#D97706]">Timed out</p><p className="text-xs text-[#8F9AA1] mt-0.5">No response. Request timed out.</p></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <ABAButton variant="secondary" size="md" fullWidth onClick={handleResend}><RefreshCw className="w-4 h-4" />Resend request</ABAButton>
                  {resendCount >= 2 && <p className="text-[10px] text-[#D97706] text-center font-medium">Multiple resend attempts. Consider using fallback code or proceeding out-of-pocket.</p>}
                  <ABAButton variant="outline" size="md" fullWidth onClick={handleProceedOOP}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                </div>
                <div className="border-t border-[#E5E8EC] pt-3">
                  <button onClick={() => setShowFallback(!showFallback)} className="flex items-center gap-2 text-sm text-[#3A8DFF] font-medium hover:underline w-full">
                    <Keyboard className="w-4 h-4" />Enter approval code (fallback){showFallback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                  {showFallback && (
                    <div className="mt-3 space-y-3"><div className="flex gap-2">
                      <input type="text" maxLength={6} value={fallbackCode} onChange={e => setFallbackCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" className="flex-1 px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-center text-lg font-mono tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]" />
                      <ABAButton variant="primary" size="md" onClick={handleValidateFallback} disabled={fallbackCode.length !== 6}>Validate</ABAButton>
                    </div></div>
                  )}
                </div>
                <div className="border-t border-[#E5E8EC] pt-3 mt-3"><button onClick={closeSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button></div>
              </>)}

              {/* ── Failed sync ── */}
              {phase === 'failed-sync' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">A network issue prevented sync. Use fallback code if the member already approved.</p>
                <div className="bg-[#FEF2F2] rounded-xl border border-[#E44F4F]/20 p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center"><WifiOff className="w-5 h-5 text-[#E44F4F]" /></div>
                    <div><p className="text-sm font-semibold text-[#E44F4F]">Failed sync</p><p className="text-xs text-[#8F9AA1] mt-0.5">Network issue. Use fallback code if the member already approved.</p></div>
                  </div>
                </div>
                <div className="mb-4">
                  <button onClick={() => setShowFallback(!showFallback)} className="flex items-center gap-2 text-sm text-[#3A8DFF] font-medium hover:underline w-full mb-3">
                    <Keyboard className="w-4 h-4" />Enter approval code (fallback){showFallback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                  {showFallback && (
                    <div className="space-y-3"><div className="flex gap-2">
                      <input type="text" maxLength={6} value={fallbackCode} onChange={e => setFallbackCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" className="flex-1 px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-center text-lg font-mono tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]" />
                      <ABAButton variant="primary" size="md" onClick={handleValidateFallback} disabled={fallbackCode.length !== 6}>Validate</ABAButton>
                    </div></div>
                  )}
                </div>
                <div className="space-y-2">
                  <ABAButton variant="secondary" size="md" fullWidth onClick={handleRetrySync}><RefreshCw className="w-4 h-4" />Retry sync</ABAButton>
                  <ABAButton variant="outline" size="md" fullWidth onClick={handleProceedOOP}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                  <button onClick={closeSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button>
                </div>
              </>)}

              {/* ── Approved ── */}
              {phase === 'approved' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">Consultation coverage approved. Confirm to mark ready.</p>
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
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Applied Package</span><span className="text-sm font-medium text-[#1A1A1A]">Consultation Only</span></div>
                    <div className="border-t border-[#F7F9FC]" />
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Remaining Credits</span><span className="text-sm font-medium text-[#32C28A]">8 of 10</span></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <ABAButton variant="primary" size="lg" fullWidth isLoading={isSubmitting} onClick={handleConfirmWithCoverage}>
                    <CheckCircle className="w-5 h-5" />Mark Ready — Coverage Applied
                  </ABAButton>
                  <button onClick={closeSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button>
                </div>
              </>)}

              {/* ── Out-of-pocket ── */}
              {phase === 'out-of-pocket' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">Patient will proceed without consultation coverage. Confirm to mark ready.</p>
                <div className="bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-4 mb-4">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#F7F9FC] flex items-center justify-center"><Wallet className="w-5 h-5 text-[#8F9AA1]" /></div>
                    <div><p className="text-sm font-semibold text-[#1A1A1A]">Out-of-pocket</p><p className="text-xs text-[#8F9AA1] mt-0.5">No coverage applied — patient pays full consultation fees.</p></div>
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
                  <ABAButton variant="primary" size="lg" fullWidth isLoading={isSubmitting} onClick={handleConfirmWithCoverage}>
                    <CheckCircle className="w-5 h-5" />Mark Ready — Out-of-pocket
                  </ABAButton>
                  <button onClick={closeSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button>
                </div>
              </>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}