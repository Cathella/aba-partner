/**
 * NU-06 Transfer Patient — Send patient to Lab / Pharmacy / Room / Reception.
 *
 * Lab & Pharmacy now use the full multi-step AbaAccess approval handshake
 * (patient-confirm → approval-pending → approved/declined/timed-out/failed-sync
 *  → out-of-pocket → already-transferred).
 * Room & Reception keep the simple note+confirm pattern.
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import {
  useNurseStore,
  transferPatient,
  transferPatientWithCoverage,
} from '../data/nurseStore';
import type { NUStationType, NUQueueItem } from '../data/nurseStore';
import {
  FlaskConical,
  Pill,
  DoorOpen,
  ArrowLeft,
  User,
  Users,
  Send,
  ShieldCheck,
  Clock,
  CheckCircle,
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
type ApprovalPhase =
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

/* ── Transfer option type ── */
interface TransferOption {
  id: NUStationType;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
}

const options: TransferOption[] = [
  {
    id: 'lab',
    label: 'Send to Lab',
    subtitle: 'For sample collection or lab tests',
    icon: <FlaskConical className="w-5 h-5 text-[#D97706]" />,
    iconBg: 'bg-[#FFF3DC]',
  },
  {
    id: 'pharmacy',
    label: 'Send to Pharmacy',
    subtitle: 'For medication pickup',
    icon: <Pill className="w-5 h-5 text-[#EC4899]" />,
    iconBg: 'bg-[#FDF2F8]',
  },
  {
    id: 'room',
    label: 'Send to Room',
    subtitle: 'Assign to OPD or procedure room',
    icon: <DoorOpen className="w-5 h-5 text-[#3A8DFF]" />,
    iconBg: 'bg-[#EBF3FF]',
  },
  {
    id: 'reception',
    label: 'Return to Reception',
    subtitle: 'Send back to reception desk',
    icon: <ArrowLeft className="w-5 h-5 text-[#8F9AA1]" />,
    iconBg: 'bg-[#F7F9FC]',
  },
];

const stationLabels: Record<NUStationType, string> = {
  lab: 'Lab',
  pharmacy: 'Pharmacy',
  room: 'Room',
  reception: 'Reception',
};

/* ── Coverage-eligible stations ── */
const COVERAGE_STATIONS: NUStationType[] = ['lab', 'pharmacy'];

export function NUTransferPatient() {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const { getById } = useNurseStore();

  const patient = getById(patientId || '');

  /* ── Destination selection ── */
  const [selected, setSelected] = useState<NUStationType | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Approval modal (Lab / Pharmacy) ── */
  const [showApprovalSheet, setShowApprovalSheet] = useState(false);
  const [approvalPhase, setApprovalPhase] = useState<ApprovalPhase>('patient-confirm');
  const [patientType, setPatientType] = useState<'member' | 'dependent'>('member');
  const [selectedDep, setSelectedDep] = useState(SAMPLE_DEPENDENTS[0].id);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackCode, setFallbackCode] = useState('');
  const [oopConfirm, setOopConfirm] = useState(false);
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
        <AppTopBar title="Transfer Patient" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Patient not found</p>
        </div>
      </div>
    );
  }

  /* ── Helpers ── */

  const clearTimers = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (autoApproveRef.current) { clearTimeout(autoApproveRef.current); autoApproveRef.current = null; }
  };

  const closeSheet = () => {
    clearTimers();
    setShowApprovalSheet(false);
    setApprovalPhase('patient-confirm');
    setPatientType('member');
    setSelectedDep(SAMPLE_DEPENDENTS[0].id);
    setTimerSeconds(120);
    setShowFallback(false);
    setFallbackCode('');
    setOopConfirm(false);
    setResendCount(0);
    setShowAlreadyDetail(false);
    setIsSubmitting(false);
  };

  const startTimer = () => {
    clearTimers();
    setTimerSeconds(120);
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (autoApproveRef.current) clearTimeout(autoApproveRef.current);
          setTimeout(() => setApprovalPhase('timed-out'), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    // Demo: auto-approve after 5s
    autoApproveRef.current = setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      setApprovalPhase('approved');
    }, 5000);
  };

  const startApproval = () => {
    setShowFallback(false);
    setFallbackCode('');
    setOopConfirm(false);
    setResendCount(0);
    setApprovalPhase('approval-pending');
    startTimer();
  };

  const handleResend = () => {
    setResendCount((c) => c + 1);
    setApprovalPhase('approval-pending');
    startTimer();
  };

  const handleRetrySync = () => {
    setApprovalPhase('approval-pending');
    startTimer();
  };

  const handleValidateFallback = () => {
    if (fallbackCode.length === 6) {
      clearTimers();
      setApprovalPhase('approved');
    }
  };

  const handleProceedOOP = () => {
    clearTimers();
    setApprovalPhase('out-of-pocket');
  };

  const handleCancelApproval = () => {
    clearTimers();
    setApprovalPhase('patient-confirm');
    setTimerSeconds(120);
  };

  /* ── Already-transferred detection ── */
  const labAlreadyApplied = !!patient.labCoverageStatus;
  const pharmAlreadyApplied = !!patient.pharmCoverageStatus;

  const getCoverageStatusForStation = (station: NUStationType) =>
    station === 'lab' ? patient.labCoverageStatus : patient.pharmCoverageStatus;
  const getCoveragePackageForStation = (station: NUStationType) =>
    station === 'lab' ? patient.labCoveragePackage : patient.pharmCoveragePackage;
  const isAlreadyApplied = (station: NUStationType) =>
    station === 'lab' ? labAlreadyApplied : pharmAlreadyApplied;

  /* ── Open approval sheet ── */
  const openApprovalSheet = (station: NUStationType) => {
    if (isAlreadyApplied(station)) {
      setApprovalPhase('already-transferred');
    } else {
      setApprovalPhase('patient-confirm');
    }
    setShowAlreadyDetail(false);
    setShowApprovalSheet(true);
  };

  /* ── Confirm simple transfer (Room / Reception) ── */
  const handleSimpleConfirm = () => {
    if (!selected) return;
    setIsSubmitting(true);
    setTimeout(() => {
      transferPatient(patient.id, selected, stationLabels[selected], note.trim() || undefined);
      showToast(`${patient.patientName} transferred to ${stationLabels[selected]}`, 'success');
      navigate('/nu/queue', { replace: true });
    }, 400);
  };

  /* ── Confirm with coverage (Lab / Pharmacy) ── */
  const handleCoverageConfirm = () => {
    if (!selected) return;
    setIsSubmitting(true);
    const coverageStatus = approvalPhase === 'out-of-pocket' ? 'Out-of-pocket' as const : 'Covered' as const;
    const packageName = approvalPhase === 'out-of-pocket' ? undefined : `${stationLabels[selected]} Only`;
    setTimeout(() => {
      transferPatientWithCoverage(
        patient.id,
        selected,
        stationLabels[selected],
        { status: coverageStatus, packageName },
        note.trim() || undefined
      );
      showToast(
        coverageStatus === 'Covered'
          ? `Transferred to ${stationLabels[selected]}. Coverage applied.`
          : `Transferred to ${stationLabels[selected]}. Out-of-pocket.`,
        'success'
      );
      closeSheet();
      navigate('/nu/queue', { replace: true });
    }, 500);
  };

  /* ── Confirm button handler ── */
  const handleConfirm = () => {
    if (!selected) return;
    if (COVERAGE_STATIONS.includes(selected)) {
      openApprovalSheet(selected);
    } else {
      handleSimpleConfirm();
    }
  };

  /* ── Station label helpers for modal ── */
  const stationLabel = selected ? stationLabels[selected] : '';
  const stationIcon = selected === 'lab'
    ? <FlaskConical className="w-5 h-5 text-[#D97706]" />
    : <Pill className="w-5 h-5 text-[#EC4899]" />;

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Transfer Patient" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-4 space-y-3">

          {/* Patient bar */}
          <div className="bg-[#EBF3FF] rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-[#3A8DFF]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1A1A1A] truncate">{patient.patientName}</p>
              <p className="text-xs text-[#8F9AA1]">
                {patient.ticketNo} · {patient.service}
              </p>
            </div>
          </div>

          {/* Coverage status lines (read-only, after transfer) */}
          {(patient.labCoverageStatus || patient.pharmCoverageStatus) && (
            <div className="bg-white rounded-2xl border border-[#E5E8EC] p-4 space-y-2.5">
              <h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">Coverage Applied</h4>
              {patient.labCoverageStatus && (
                <CoverageStatusLine
                  icon={<FlaskConical className={`w-4 h-4 ${patient.labCoverageStatus === 'Covered' ? 'text-[#F59E0B]' : 'text-[#8F9AA1]'}`} />}
                  label="Lab coverage"
                  status={patient.labCoverageStatus}
                  packageName={patient.labCoveragePackage}
                />
              )}
              {patient.pharmCoverageStatus && (
                <CoverageStatusLine
                  icon={<Pill className={`w-4 h-4 ${patient.pharmCoverageStatus === 'Covered' ? 'text-[#EC4899]' : 'text-[#8F9AA1]'}`} />}
                  label="Pharmacy coverage"
                  status={patient.pharmCoverageStatus}
                  packageName={patient.pharmCoveragePackage}
                />
              )}
            </div>
          )}

          {/* Destination options */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC]">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Select Destination
              </h3>
            </div>
            {options.map((opt) => {
              const isSelected = selected === opt.id;
              const applied = opt.id === 'lab' ? labAlreadyApplied : opt.id === 'pharmacy' ? pharmAlreadyApplied : false;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelected(opt.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E8EC] last:border-b-0 transition-colors text-left ${
                    isSelected ? 'bg-[#E9F8F0]' : 'hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60'
                  }`}
                >
                  {/* Radio circle */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'border-[#32C28A] bg-[#32C28A]'
                        : 'border-[#C9D0DB] bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  <div className={`w-10 h-10 rounded-xl ${opt.iconBg} flex items-center justify-center flex-shrink-0`}>
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A]">{opt.label}</p>
                    <p className="text-xs text-[#8F9AA1]">{opt.subtitle}</p>
                  </div>
                  {applied && (
                    <span className="text-[10px] font-semibold text-[#32C28A] bg-[#E9F8F0] px-1.5 py-0.5 rounded-full flex-shrink-0">Applied</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Optional note */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <p className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-2">
              Transfer Note (Optional)
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for the receiving station…"
              rows={3}
              className="w-full rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] p-3 text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all resize-none"
            />
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
            onClick={handleConfirm}
            disabled={!selected}
            isLoading={isSubmitting && !showApprovalSheet}
          >
            <Send className="w-4.5 h-4.5" />
            Confirm Transfer
          </ABAButton>
          <ABAButton variant="outline" fullWidth onClick={() => navigate(-1)}>
            Cancel
          </ABAButton>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
           Approval Bottom Sheet (Lab / Pharmacy)
         ═══════════════════════════════════════════ */}
      {showApprovalSheet && selected && COVERAGE_STATIONS.includes(selected) && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) closeSheet(); }}
        >
          <div className="bg-white rounded-t-3xl w-full max-w-[390px] mx-auto pb-8 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-center py-3"><div className="w-10 h-1 rounded-full bg-[#C9D0DB]" /></div>
            <div className="px-5">
              <div className="flex items-center gap-2 mb-1">
                {stationIcon}
                <h3 className="text-lg font-semibold text-[#1A1A1A]">Transfer to {stationLabel}</h3>
              </div>

              {/* ── Already Transferred ── */}
              {approvalPhase === 'already-transferred' && (<>
                <div className="bg-[#EBF3FF] rounded-xl border border-[#3A8DFF]/20 p-4 mt-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EBF3FF] flex items-center justify-center flex-shrink-0"><Info className="w-5 h-5 text-[#3A8DFF]" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#3A8DFF]">Already transferred</p>
                      <p className="text-xs text-[#8F9AA1] mt-0.5">Already transferred to {stationLabel} ({getCoverageStatusForStation(selected) === 'Out-of-pocket' ? 'out-of-pocket' : 'coverage applied'}).</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[#8F9AA1] mb-4">A coverage deduction has already been recorded for this station during this visit. Transferring again would cause a duplicate deduction.</p>
                {showAlreadyDetail && getCoverageStatusForStation(selected) && (
                  <div className="bg-white rounded-xl border border-[#E5E8EC] overflow-hidden mb-4">
                    <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#32C28A]" /><h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">Coverage & Approval</h4></div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Coverage</span><CoverageBadge status={getCoverageStatusForStation(selected)!} /></div>
                      <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Applied Package</span><span className="text-sm font-medium text-[#1A1A1A]">{getCoveragePackageForStation(selected) || 'N/A'}</span></div>
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
              {approvalPhase === 'patient-confirm' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">Confirm patient details and coverage before transferring to {stationLabel}.</p>
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
                    <p className="text-sm text-[#1A1A1A] mb-3">Proceed as out-of-pocket for {stationLabel.toLowerCase()} services?</p>
                    <div className="flex gap-2">
                      <ABAButton variant="primary" size="md" fullWidth onClick={() => { setOopConfirm(false); setApprovalPhase('out-of-pocket'); }}>Confirm</ABAButton>
                      <ABAButton variant="outline" size="md" fullWidth onClick={() => setOopConfirm(false)}>Back</ABAButton>
                    </div>
                  </div>
                )}
              </>)}

              {/* ── Approval Pending ── */}
              {approvalPhase === 'approval-pending' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">Waiting for member to approve {stationLabel.toLowerCase()} coverage in AbaAccess.</p>
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
                      <p className="text-sm text-[#1A1A1A] mb-3">Proceed as out-of-pocket for {stationLabel.toLowerCase()} services?</p>
                      <div className="flex gap-2">
                        <ABAButton variant="primary" size="md" fullWidth onClick={handleProceedOOP}>Confirm</ABAButton>
                        <ABAButton variant="outline" size="md" fullWidth onClick={() => setOopConfirm(false)}>Back</ABAButton>
                      </div>
                    </div>
                  )}
                </div>
              </>)}

              {/* ── Declined ── */}
              {approvalPhase === 'declined' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">The member declined the {stationLabel.toLowerCase()} approval request.</p>
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
              {approvalPhase === 'timed-out' && (<>
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
              {approvalPhase === 'failed-sync' && (<>
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
              {approvalPhase === 'approved' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">{stationLabel} coverage approved. Confirm transfer.</p>
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
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Applied Package</span><span className="text-sm font-medium text-[#1A1A1A]">{stationLabel} Only</span></div>
                    <div className="border-t border-[#F7F9FC]" />
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Remaining Credits</span><span className="text-sm font-medium text-[#32C28A]">8 of 10</span></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <ABAButton variant="primary" size="lg" fullWidth isLoading={isSubmitting} onClick={handleCoverageConfirm}>
                    <CheckCircle className="w-5 h-5" />Confirm transfer to {stationLabel}
                  </ABAButton>
                  <button onClick={closeSheet} className="w-full py-2 text-sm font-medium text-[#8F9AA1] hover:underline">Cancel</button>
                </div>
              </>)}

              {/* ── Out-of-pocket ── */}
              {approvalPhase === 'out-of-pocket' && (<>
                <p className="text-sm text-[#8F9AA1] mb-5">Patient will proceed without {stationLabel.toLowerCase()} coverage. Confirm transfer.</p>
                <div className="bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-4 mb-4">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#F7F9FC] flex items-center justify-center"><Wallet className="w-5 h-5 text-[#8F9AA1]" /></div>
                    <div><p className="text-sm font-semibold text-[#1A1A1A]">Out-of-pocket</p><p className="text-xs text-[#8F9AA1] mt-0.5">No coverage applied — patient pays full fees.</p></div>
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
                  <ABAButton variant="primary" size="lg" fullWidth isLoading={isSubmitting} onClick={handleCoverageConfirm}>
                    <CheckCircle className="w-5 h-5" />Confirm transfer to {stationLabel}
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

/* ── Shared tiny components ── */

function CoverageBadge({ status }: { status: 'Covered' | 'Discount applied' | 'Out-of-pocket' }) {
  const cls = status === 'Covered'
    ? 'bg-[#E9F8F0] text-[#38C172]'
    : status === 'Discount applied'
    ? 'bg-[#EBF3FF] text-[#3A8DFF]'
    : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]';
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>{status}</span>;
}

function CoverageStatusLine({
  icon, label, status, packageName,
}: {
  icon: React.ReactNode;
  label: string;
  status: 'Covered' | 'Discount applied' | 'Out-of-pocket';
  packageName?: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2.5 bg-[#F7F9FC] rounded-xl border border-[#E5E8EC]">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#8F9AA1]">{label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <CoverageBadge status={status} />
          {packageName && <span className="text-[10px] text-[#8F9AA1]">{packageName}</span>}
        </div>
      </div>
    </div>
  );
}
