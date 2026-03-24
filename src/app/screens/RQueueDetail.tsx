/**
 * R-31 Queue Item Detail — Patient summary + visit info + actions.
 * Actions: Start Consultation (with coverage approval flow), Transfer to Lab,
 * Transfer to Pharmacy, Remove (reason required).
 * Includes inline R-32 Transfer modal (add note + confirm) and Remove modal (reason picker).
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { StatusChip, type VisitStatus } from '../components/aba/StatusChip';
import { ABAButton } from '../components/aba/ABAButton';
import { ABABadge } from '../components/aba/ABABadge';
import { showToast } from '../components/aba/Toast';
import {
  useScheduleStore,
  advanceActionLabel,
  nextStatus,
  advanceWithCoverage,
  transferToLabWithCoverage,
  transferToPharmacyWithCoverage,
  removalReasons,
  type ScheduleItem,
} from '../data/scheduleStore';
import {
  User,
  Phone,
  Stethoscope,
  Clock,
  DoorOpen,
  ArrowRightCircle,
  FlaskConical,
  Pill,
  UserMinus,
  X,
  CheckCircle,
  FileText,
  AlertTriangle,
  Activity,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Timer,
  Keyboard,
  Wallet,
  Users,
  WifiOff,
  ShieldOff,
  Info,
  Lock,
  Eye,
} from 'lucide-react';

/* ── Modal types ── */
type ModalType = null | 'advance' | 'transfer-consult' | 'transfer-lab' | 'transfer-pharmacy' | 'remove';

/* ── Transfer-to-consultation phases ── */
type ConsultPhase = 'patient-confirm' | 'approval-pending' | 'approved' | 'out-of-pocket' | 'declined' | 'timed-out' | 'failed-sync' | 'already-transferred';
type PatientType = 'member' | 'dependent';

const SAMPLE_DEPENDENTS = [
  { id: 'dep-1', name: 'Ben Ochieng' },
  { id: 'dep-2', name: 'Anna Ochieng' },
];

export function RQueueDetail() {
  const navigate = useNavigate();
  const { queueId } = useParams<{ queueId: string }>();
  const {
    getItemById,
    advanceStatus,
    transferToLab,
    transferToPharmacy,
    removeFromQueue,
    items,
  } = useScheduleStore();

  const [item, setItem] = useState<ScheduleItem | undefined>(undefined);
  const [modal, setModal] = useState<ModalType>(null);
  const [transferNote, setTransferNote] = useState('');
  const [removalReason, setRemovalReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Transfer-to-consultation state ── */
  const [consultPhase, setConsultPhase] = useState<ConsultPhase>('patient-confirm');
  const [patientType, setPatientType] = useState<PatientType>('member');
  const [selectedDependent, setSelectedDependent] = useState(SAMPLE_DEPENDENTS[0].id);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackCode, setFallbackCode] = useState('');
  const [oopConfirm, setOopConfirm] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [showAlreadyDetail, setShowAlreadyDetail] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const approvalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Keep item in sync with store */
  useEffect(() => {
    if (queueId) setItem(getItemById(queueId));
  }, [queueId, items, getItemById]);

  /* Cleanup timers on unmount */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (approvalTimeoutRef.current) clearTimeout(approvalTimeoutRef.current);
    };
  }, []);

  if (!item) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Queue Detail" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-aba-neutral-600">Patient not found in the queue.</p>
        </div>
      </div>
    );
  }

  const advanceLabel = advanceActionLabel(item.status);
  const canAdvance = nextStatus(item.status) !== null;
  const isTransferToConsult = item.status === 'waiting';
  const canTransferLab = ['waiting', 'in-consultation'].includes(item.status);
  const canTransferPharmacy = ['waiting', 'in-consultation'].includes(item.status);
  const canRemove = ['waiting', 'in-consultation', 'lab', 'pharmacy'].includes(item.status);

  /* ── Already-transferred detection ── */
  const consultAlreadyApplied = !!item.coverageStatus;
  const labAlreadyApplied = !!item.labCoverageStatus;
  const pharmAlreadyApplied = !!item.pharmCoverageStatus;

  const openTransferModal = (type: ModalType) => {
    if (type === 'transfer-consult' && consultAlreadyApplied) {
      setConsultPhase('already-transferred');
    } else if (type === 'transfer-lab' && labAlreadyApplied) {
      setConsultPhase('already-transferred');
    } else if (type === 'transfer-pharmacy' && pharmAlreadyApplied) {
      setConsultPhase('already-transferred');
    } else {
      setConsultPhase('patient-confirm');
    }
    setShowAlreadyDetail(false);
    setModal(type);
  };

  /* ── Action handlers ── */

  const closeModal = () => {
    setModal(null);
    setTransferNote('');
    setRemovalReason('');
    setCustomReason('');
    setIsSubmitting(false);
    // Reset consult state
    setConsultPhase('patient-confirm');
    setPatientType('member');
    setSelectedDependent(SAMPLE_DEPENDENTS[0].id);
    setTimerSeconds(120);
    setShowFallback(false);
    setFallbackCode('');
    setOopConfirm(false);
    setResendCount(0);
    setShowAlreadyDetail(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (approvalTimeoutRef.current) { clearTimeout(approvalTimeoutRef.current); approvalTimeoutRef.current = null; }
  };

  const handleAdvance = () => {
    setIsSubmitting(true);
    const next = nextStatus(item.status);
    setTimeout(() => {
      advanceStatus(item.id);
      const label = next === 'completed'
        ? `${item.patient} marked as Complete`
        : next === 'in-consultation'
        ? `${item.patient} moved to Consultation`
        : `${item.patient} returned to Waiting`;
      showToast(label, 'success');
      closeModal();
      if (next === 'completed') navigate('/r/queue');
    }, 500);
  };

  const handleTransferPharmacy = () => {
    setIsSubmitting(true);
    const coverageStatus = consultPhase === 'out-of-pocket' ? 'Out-of-pocket' as const : 'Covered' as const;
    const packageName = consultPhase === 'out-of-pocket' ? undefined : 'Pharmacy Only';
    setTimeout(() => {
      transferToPharmacyWithCoverage(
        item.id,
        { status: coverageStatus, packageName },
        transferNote.trim() || undefined
      );
      showToast(
        coverageStatus === 'Covered'
          ? 'Transferred to Pharmacy. Coverage applied.'
          : 'Transferred to Pharmacy. Out-of-pocket.',
        'success'
      );
      closeModal();
      navigate('/r/queue');
    }, 500);
  };

  const handleRemove = () => {
    const reason = removalReason === 'Other' ? customReason.trim() : removalReason;
    if (!reason) return;
    setIsSubmitting(true);
    setTimeout(() => {
      removeFromQueue(item.id, reason);
      showToast(`${item.patient} removed from queue`, 'warning');
      closeModal();
      navigate('/r/queue');
    }, 500);
  };

  /* ── Transfer-to-consultation handlers ── */

  const startApprovalRequest = () => {
    setConsultPhase('approval-pending');
    setTimerSeconds(120);
    setResendCount(0);

    // Start countdown — transition to 'timed-out' at 0
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (approvalTimeoutRef.current) clearTimeout(approvalTimeoutRef.current);
          // Defer phase change to avoid setState-in-setState
          setTimeout(() => setConsultPhase('timed-out'), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-approve after 5 seconds for demo
    approvalTimeoutRef.current = setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      setConsultPhase('approved');
    }, 5000);
  };

  const handleResendRequest = () => {
    setResendCount((c) => c + 1);
    setConsultPhase('approval-pending');
    setTimerSeconds(120);
    if (timerRef.current) clearInterval(timerRef.current);
    if (approvalTimeoutRef.current) clearTimeout(approvalTimeoutRef.current);

    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (approvalTimeoutRef.current) clearTimeout(approvalTimeoutRef.current);
          setTimeout(() => setConsultPhase('timed-out'), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    approvalTimeoutRef.current = setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      setConsultPhase('approved');
    }, 5000);

    showToast('Approval request resent', 'info');
  };

  const handleRetrySync = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (approvalTimeoutRef.current) clearTimeout(approvalTimeoutRef.current);
    setConsultPhase('approval-pending');
    setTimerSeconds(120);

    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (approvalTimeoutRef.current) clearTimeout(approvalTimeoutRef.current);
          setTimeout(() => setConsultPhase('timed-out'), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    approvalTimeoutRef.current = setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      setConsultPhase('approved');
    }, 5000);

    showToast('Retrying sync…', 'info');
  };

  const handleCancelApproval = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (approvalTimeoutRef.current) { clearTimeout(approvalTimeoutRef.current); approvalTimeoutRef.current = null; }
    setConsultPhase('patient-confirm');
    setTimerSeconds(120);
  };

  const handleValidateFallback = () => {
    if (fallbackCode.length === 6) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (approvalTimeoutRef.current) clearTimeout(approvalTimeoutRef.current);
      setConsultPhase('approved');
      showToast('Approval code validated', 'success');
    }
  };

  const handleProceedOOP = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (approvalTimeoutRef.current) clearTimeout(approvalTimeoutRef.current);
    setConsultPhase('out-of-pocket');
  };

  const handleConfirmTransfer = () => {
    setIsSubmitting(true);
    const coverageStatus = consultPhase === 'out-of-pocket' ? 'Out-of-pocket' as const : 'Covered' as const;
    const packageName = consultPhase === 'out-of-pocket' ? undefined : 'Consultation Only';
    setTimeout(() => {
      advanceWithCoverage(item.id, { status: coverageStatus, packageName });
      showToast(
        coverageStatus === 'Covered'
          ? 'Transferred to Consultation. Coverage applied.'
          : 'Transferred to Consultation. Out-of-pocket.',
        'success'
      );
      closeModal();
    }, 500);
  };

  const handleConfirmLabTransfer = () => {
    setIsSubmitting(true);
    const coverageStatus = consultPhase === 'out-of-pocket' ? 'Out-of-pocket' as const : 'Covered' as const;
    const packageName = consultPhase === 'out-of-pocket' ? undefined : 'Lab Only';
    setTimeout(() => {
      transferToLabWithCoverage(
        item.id,
        { status: coverageStatus, packageName },
        transferNote.trim() || undefined
      );
      showToast(
        coverageStatus === 'Covered'
          ? 'Transferred to Lab. Coverage applied.'
          : 'Transferred to Lab. Out-of-pocket.',
        'success'
      );
      closeModal();
      navigate('/r/queue');
    }, 500);
  };

  /* ── Format timer ── */
  const fmtTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  /* ── Status flow indicator ── */
  const stageOrder: { status: VisitStatus; label: string }[] = [
    { status: 'waiting', label: 'Waiting' },
    { status: 'in-consultation', label: 'Consult' },
    { status: 'completed', label: 'Done' },
  ];

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Queue Detail" showBack onBackClick={() => navigate('/r/queue')} />

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="p-4 space-y-4">

          {/* ── Ticket + Status header ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {item.ticket && (
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-aba-primary-50 text-sm font-bold text-aba-primary-main border border-aba-primary-main/20">
                    {item.ticket}
                  </span>
                )}
                <div>
                  <p className="text-base font-semibold text-aba-neutral-900">{item.patient}</p>
                  <p className="text-xs text-aba-neutral-600">{item.phone}</p>
                </div>
              </div>
              <StatusChip status={item.status} size="md" />
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-1">
              {stageOrder.map((stage, idx) => {
                const isCurrent = item.status === stage.status;
                const isPast =
                  stageOrder.findIndex((s) => s.status === item.status) > idx ||
                  (item.status === 'completed' && idx < stageOrder.length);
                const isLabPharmacy = ['lab', 'pharmacy'].includes(item.status);

                return (
                  <div key={stage.status} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-full h-1.5 rounded-full mb-1 ${
                          isPast || isCurrent
                            ? 'bg-aba-primary-main'
                            : isLabPharmacy && stage.status === 'waiting'
                            ? 'bg-aba-primary-main'
                            : 'bg-aba-neutral-200'
                        }`}
                      />
                      <span
                        className={`text-[10px] ${
                          isCurrent ? 'font-semibold text-aba-primary-main' : 'text-aba-neutral-400'
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lab / Pharmacy detour note */}
            {['lab', 'pharmacy'].includes(item.status) && (
              <div className="mt-3 flex items-center gap-2 p-2 bg-aba-warning-50 rounded-lg">
                <Activity className="w-4 h-4 text-aba-warning-main flex-shrink-0" />
                <p className="text-xs text-aba-neutral-700">
                  Currently in <span className="font-semibold">{item.status === 'lab' ? 'Lab' : 'Pharmacy'}</span> — will return to queue after.
                </p>
              </div>
            )}

            {/* Coverage status line (read-only, shown after transfer) */}
            {item.coverageStatus && (
              <div className="mt-3 flex items-center gap-2 p-2.5 bg-[#F7F9FC] rounded-xl border border-[#E5E8EC]">
                <ShieldCheck className={`w-4 h-4 flex-shrink-0 ${item.coverageStatus === 'Covered' ? 'text-[#32C28A]' : 'text-[#8F9AA1]'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#8F9AA1]">Consultation coverage</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-[1px] rounded-full ${
                      item.coverageStatus === 'Covered'
                        ? 'bg-[#E9F8F0] text-[#38C172]'
                        : item.coverageStatus === 'Discount applied'
                        ? 'bg-[#EBF3FF] text-[#3A8DFF]'
                        : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'
                    }`}>
                      {item.coverageStatus}
                    </span>
                    {item.coveragePackage && (
                      <span className="text-[10px] text-[#8F9AA1]">{item.coveragePackage}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lab coverage status line */}
            {item.labCoverageStatus && (
              <div className="mt-3 flex items-center gap-2 p-2.5 bg-[#F7F9FC] rounded-xl border border-[#E5E8EC]">
                <FlaskConical className={`w-4 h-4 flex-shrink-0 ${item.labCoverageStatus === 'Covered' ? 'text-[#F59E0B]' : 'text-[#8F9AA1]'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#8F9AA1]">Lab coverage</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-[1px] rounded-full ${
                      item.labCoverageStatus === 'Covered'
                        ? 'bg-[#E9F8F0] text-[#38C172]'
                        : item.labCoverageStatus === 'Discount applied'
                        ? 'bg-[#EBF3FF] text-[#3A8DFF]'
                        : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'
                    }`}>
                      {item.labCoverageStatus}
                    </span>
                    {item.labCoveragePackage && (
                      <span className="text-[10px] text-[#8F9AA1]">{item.labCoveragePackage}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pharmacy coverage status line */}
            {item.pharmCoverageStatus && (
              <div className="mt-3 flex items-center gap-2 p-2.5 bg-[#F7F9FC] rounded-xl border border-[#E5E8EC]">
                <Pill className={`w-4 h-4 flex-shrink-0 ${item.pharmCoverageStatus === 'Covered' ? 'text-[#EC4899]' : 'text-[#8F9AA1]'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#8F9AA1]">Pharmacy coverage</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-[1px] rounded-full ${
                      item.pharmCoverageStatus === 'Covered'
                        ? 'bg-[#E9F8F0] text-[#38C172]'
                        : item.pharmCoverageStatus === 'Discount applied'
                        ? 'bg-[#EBF3FF] text-[#3A8DFF]'
                        : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'
                    }`}>
                      {item.pharmCoverageStatus}
                    </span>
                    {item.pharmCoveragePackage && (
                      <span className="text-[10px] text-[#8F9AA1]">{item.pharmCoveragePackage}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Visit Info card ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
            <div className="px-4 py-3 bg-aba-neutral-100/50 border-b border-aba-neutral-200">
              <h4 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">
                Visit Information
              </h4>
            </div>
            <div className="p-4 space-y-3">
              <InfoRow icon={<Stethoscope className="w-4 h-4" />} label="Service" value={item.service} />
              <InfoRow icon={<User className="w-4 h-4" />} label="Staff" value={item.assignedStaff || item.provider} />
              <InfoRow icon={<DoorOpen className="w-4 h-4" />} label="Room" value={item.room || '—'} />
              <InfoRow icon={<Clock className="w-4 h-4" />} label="Checked in" value={item.checkedInAt || '—'} />
              <InfoRow icon={<Clock className="w-4 h-4" />} label="Appointment" value={item.time} />
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={item.phone} />
              {item.type === 'walk-in' && (
                <div className="pt-1">
                  <ABABadge variant="success" size="sm">Walk-in</ABABadge>
                </div>
              )}
            </div>
          </div>

          {/* ── Transfer note (if has one) ── */}
          {item.transferNote && (
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
              <div className="px-4 py-3 bg-aba-neutral-100/50 border-b border-aba-neutral-200">
                <h4 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">
                  Transfer Note
                </h4>
              </div>
              <div className="p-4">
                <p className="text-sm text-aba-neutral-700">{item.transferNote}</p>
              </div>
            </div>
          )}

          {/* ── Actions card ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
            <div className="px-4 py-3 bg-aba-neutral-100/50 border-b border-aba-neutral-200">
              <h4 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">
                Actions
              </h4>
            </div>
            <div className="p-4 space-y-3">
              {/* Advance / Update Status */}
              {canAdvance && (
                <ABAButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => isTransferToConsult ? openTransferModal('transfer-consult') : setModal('advance')}
                >
                  <ArrowRightCircle className="w-5 h-5" />
                  {advanceLabel}
                  {isTransferToConsult && consultAlreadyApplied && <span className="ml-auto text-[10px] font-semibold text-white/90 bg-white/20 px-1.5 py-0.5 rounded-full">Applied</span>}
                </ABAButton>
              )}

              {/* Transfer to Lab */}
              {canTransferLab && (
                <ABAButton
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => openTransferModal('transfer-lab')}
                >
                  <FlaskConical className="w-5 h-5" />
                  Transfer to Lab
                  {labAlreadyApplied && <span className="ml-auto text-[10px] font-semibold text-[#32C28A] bg-[#E9F8F0] px-1.5 py-0.5 rounded-full">Applied</span>}
                </ABAButton>
              )}

              {/* Transfer to Pharmacy */}
              {canTransferPharmacy && (
                <ABAButton
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => openTransferModal('transfer-pharmacy')}
                >
                  <Pill className="w-5 h-5" />
                  Transfer to Pharmacy
                  {pharmAlreadyApplied && <span className="ml-auto text-[10px] font-semibold text-[#32C28A] bg-[#E9F8F0] px-1.5 py-0.5 rounded-full">Applied</span>}
                </ABAButton>
              )}

              {/* Remove */}
              {canRemove && (
                <ABAButton
                  variant="destructive"
                  size="lg"
                  fullWidth
                  onClick={() => setModal('remove')}
                >
                  <UserMinus className="w-5 h-5" />
                  Remove from Queue
                </ABAButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
           Transfer to Consultation — Multi-step approval
         ═══════════════════════════════════════════════ */}
      {modal === 'transfer-consult' && (
        <ModalShell onClose={closeModal}>
          <div className="flex items-center gap-2 mb-1">
            <ArrowRightCircle className="w-5 h-5 text-aba-primary-main" />
            <h3 className="text-lg font-semibold text-aba-neutral-900">Transfer to Consultation</h3>
          </div>

          {/* ── Phase: Already Transferred ── */}
          {consultPhase === 'already-transferred' && (
            <>
              <div className="bg-[#EBF3FF] rounded-xl border border-[#3A8DFF]/20 p-4 mt-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EBF3FF] flex items-center justify-center flex-shrink-0"><Info className="w-5 h-5 text-[#3A8DFF]" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#3A8DFF]">Already transferred</p>
                    <p className="text-xs text-[#8F9AA1] mt-0.5">Already transferred to Consultation ({item.coverageStatus === 'Out-of-pocket' ? 'out-of-pocket' : 'coverage applied'}).</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#8F9AA1] mb-4">A coverage deduction has already been recorded for this station during this visit. Transferring again would cause a duplicate deduction.</p>
              {showAlreadyDetail && item.coverageStatus && (
                <div className="bg-white rounded-xl border border-[#E5E8EC] overflow-hidden mb-4">
                  <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#32C28A]" /><h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">Coverage & Approval</h4></div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Coverage</span><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.coverageStatus === 'Covered' ? 'bg-[#E9F8F0] text-[#38C172]' : item.coverageStatus === 'Discount applied' ? 'bg-[#EBF3FF] text-[#3A8DFF]' : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'}`}>{item.coverageStatus}</span></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Applied Package</span><span className="text-sm font-medium text-[#1A1A1A]">{item.coveragePackage || 'N/A'}</span></div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <ABAButton variant="outline" size="md" fullWidth onClick={() => setShowAlreadyDetail(!showAlreadyDetail)}><Eye className="w-4 h-4" />{showAlreadyDetail ? 'Hide details' : 'View details'}</ABAButton>
                <ABAButton variant="outline" size="md" fullWidth disabled><Lock className="w-4 h-4" />Undo transfer (admin only)</ABAButton>
                <button onClick={closeModal} className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline">Close</button>
              </div>
            </>
          )}

          {/* ── Phase: Patient Confirmation ── */}
          {consultPhase === 'patient-confirm' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">
                Confirm patient details and type before requesting coverage approval.
              </p>

              {/* Patient info */}
              <div className="bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-[#3A8DFF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">{item.patient}</p>
                    <p className="text-xs text-[#8F9AA1]">{item.phone}</p>
                  </div>
                </div>
              </div>

              {/* Patient type selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                  Patient type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPatientType('member')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      patientType === 'member'
                        ? 'border-[#32C28A] bg-[#E9F8F0] text-[#1A1A1A]'
                        : 'border-[#E5E8EC] bg-white text-[#8F9AA1] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Member
                  </button>
                  <button
                    onClick={() => setPatientType('dependent')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      patientType === 'dependent'
                        ? 'border-[#32C28A] bg-[#E9F8F0] text-[#1A1A1A]'
                        : 'border-[#E5E8EC] bg-white text-[#8F9AA1] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Dependent
                  </button>
                </div>
              </div>

              {/* Dependent selector */}
              {patientType === 'dependent' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                    Select dependent
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDependent}
                      onChange={(e) => setSelectedDependent(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-sm text-[#1A1A1A] appearance-none focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]"
                    >
                      {SAMPLE_DEPENDENTS.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F9AA1] pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Visual: from → to */}
              <div className="flex items-center justify-center gap-3 p-3 bg-aba-neutral-100 rounded-xl mb-5">
                <StatusChip status={item.status} size="md" />
                <ArrowRightCircle className="w-5 h-5 text-aba-neutral-400" />
                <StatusChip status="in-consultation" size="md" />
              </div>

              <div className="space-y-3">
                <ABAButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={startApprovalRequest}
                >
                  <ShieldCheck className="w-5 h-5" />
                  Request Approval
                </ABAButton>

                {/* Out-of-pocket escape */}
                <ABAButton
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => setOopConfirm(true)}
                >
                  <Wallet className="w-4 h-4" />
                  Proceed out-of-pocket
                </ABAButton>

                <button
                  onClick={closeModal}
                  className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline"
                >
                  Cancel
                </button>
              </div>

              {/* Out-of-pocket confirmation inline */}
              {oopConfirm && (
                <div className="mt-4 p-4 bg-[#FFF3DC] rounded-xl border border-[#D97706]/20">
                  <p className="text-sm text-[#1A1A1A] mb-3">
                    Proceed as out-of-pocket for consultation?
                  </p>
                  <div className="flex gap-2">
                    <ABAButton
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={handleProceedOOP}
                    >
                      Confirm
                    </ABAButton>
                    <ABAButton
                      variant="outline"
                      size="md"
                      fullWidth
                      onClick={() => setOopConfirm(false)}
                    >
                      Back
                    </ABAButton>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Phase: Approval Pending ── */}
          {consultPhase === 'approval-pending' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">
                Waiting for member to approve in AbaAccess.
              </p>

              {/* Status card */}
              <div className="bg-[#FFF3DC] rounded-xl border border-[#D97706]/20 p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFF3DC] flex items-center justify-center flex-shrink-0">
                    <Timer className="w-5 h-5 text-[#D97706]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A]">Approval requested</p>
                    <p className="text-xs text-[#8F9AA1] mt-0.5">
                      Member approves in AbaAccess using PIN.
                    </p>
                  </div>
                </div>

                {/* Timer countdown */}
                <div className="flex items-center justify-center gap-2 py-3 bg-white rounded-lg">
                  <Clock className="w-4 h-4 text-[#D97706]" />
                  <span className="text-2xl font-bold text-[#1A1A1A] font-mono tracking-wider">
                    {fmtTimer(timerSeconds)}
                  </span>
                </div>

                {timerSeconds === 0 && (
                  <p className="text-xs text-[#E44F4F] text-center mt-2 font-medium">
                    Request timed out. Resend or use fallback.
                  </p>
                )}
              </div>

              {/* Patient context */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] mb-4">
                <User className="w-4 h-4 text-[#8F9AA1] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.patient}</p>
                  <p className="text-[10px] text-[#8F9AA1]">
                    {patientType === 'dependent'
                      ? `Dependent: ${SAMPLE_DEPENDENTS.find((d) => d.id === selectedDependent)?.name}`
                      : 'Member'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 mb-4">
                <ABAButton variant="secondary" size="md" fullWidth onClick={handleResendRequest}>
                  <RefreshCw className="w-4 h-4" />
                  Resend request
                </ABAButton>
                {resendCount >= 2 && (
                  <p className="text-[10px] text-[#D97706] text-center font-medium">
                    Multiple resend attempts. Consider using fallback code or proceeding out-of-pocket.
                  </p>
                )}
                <ABAButton variant="outline" size="md" fullWidth onClick={handleCancelApproval}>
                  Cancel
                </ABAButton>
              </div>

              {/* Fallback section */}
              <div className="border-t border-[#E5E8EC] pt-3">
                <button
                  onClick={() => setShowFallback(!showFallback)}
                  className="flex items-center gap-2 text-sm text-[#3A8DFF] font-medium hover:underline w-full"
                >
                  <Keyboard className="w-4 h-4" />
                  Enter approval code (fallback)
                  {showFallback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                </button>

                {showFallback && (
                  <div className="mt-3 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={fallbackCode}
                        onChange={(e) => setFallbackCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="flex-1 px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-center text-lg font-mono tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]"
                      />
                      <ABAButton
                        variant="primary"
                        size="md"
                        onClick={handleValidateFallback}
                        disabled={fallbackCode.length !== 6}
                      >
                        Validate
                      </ABAButton>
                    </div>
                    <p className="text-[10px] text-[#8F9AA1] text-center">
                      Use only if sync fails.
                    </p>
                  </div>
                )}
              </div>

              {/* Out-of-pocket escape */}
              <div className="border-t border-[#E5E8EC] pt-3 mt-3">
                {!oopConfirm ? (
                  <ABAButton variant="outline" size="md" fullWidth onClick={() => setOopConfirm(true)}>
                    <Wallet className="w-4 h-4" />
                    Proceed out-of-pocket
                  </ABAButton>
                ) : (
                  <div className="p-4 bg-[#FFF3DC] rounded-xl border border-[#D97706]/20">
                    <p className="text-sm text-[#1A1A1A] mb-3">
                      Proceed as out-of-pocket for consultation?
                    </p>
                    <div className="flex gap-2">
                      <ABAButton variant="primary" size="md" fullWidth onClick={handleProceedOOP}>
                        Confirm
                      </ABAButton>
                      <ABAButton variant="outline" size="md" fullWidth onClick={() => setOopConfirm(false)}>
                        Back
                      </ABAButton>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Phase: Declined ── */}
          {consultPhase === 'declined' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">
                The member declined the approval request.
              </p>
              <div className="bg-[#FEF2F2] rounded-xl border border-[#E44F4F]/20 p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center flex-shrink-0">
                    <ShieldOff className="w-5 h-5 text-[#E44F4F]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#E44F4F]">Declined</p>
                    <p className="text-xs text-[#8F9AA1] mt-0.5">
                      Approval declined by member.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <ABAButton variant="secondary" size="md" fullWidth onClick={handleResendRequest}>
                  <RefreshCw className="w-4 h-4" />
                  Resend request
                </ABAButton>
                {resendCount >= 2 && (
                  <p className="text-[10px] text-[#D97706] text-center font-medium">
                    Multiple resend attempts. Consider proceeding out-of-pocket.
                  </p>
                )}
                <ABAButton variant="outline" size="md" fullWidth onClick={handleProceedOOP}>
                  <Wallet className="w-4 h-4" />
                  Proceed out-of-pocket
                </ABAButton>
                <button onClick={closeModal} className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline">
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* ── Phase: Timed out ── */}
          {consultPhase === 'timed-out' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">
                No response received within the timeout window.
              </p>
              <div className="bg-[#FFF3DC] rounded-xl border border-[#D97706]/20 p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFF3DC] flex items-center justify-center flex-shrink-0">
                    <Timer className="w-5 h-5 text-[#D97706]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#D97706]">Timed out</p>
                    <p className="text-xs text-[#8F9AA1] mt-0.5">
                      No response. Request timed out.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <ABAButton variant="secondary" size="md" fullWidth onClick={handleResendRequest}>
                  <RefreshCw className="w-4 h-4" />
                  Resend request
                </ABAButton>
                {resendCount >= 2 && (
                  <p className="text-[10px] text-[#D97706] text-center font-medium">
                    Multiple resend attempts. Consider using fallback code or proceeding out-of-pocket.
                  </p>
                )}
                <ABAButton variant="outline" size="md" fullWidth onClick={handleProceedOOP}>
                  <Wallet className="w-4 h-4" />
                  Proceed out-of-pocket
                </ABAButton>
              </div>
              {/* Fallback section */}
              <div className="border-t border-[#E5E8EC] pt-3">
                <button
                  onClick={() => setShowFallback(!showFallback)}
                  className="flex items-center gap-2 text-sm text-[#3A8DFF] font-medium hover:underline w-full"
                >
                  <Keyboard className="w-4 h-4" />
                  Enter approval code (fallback)
                  {showFallback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                </button>
                {showFallback && (
                  <div className="mt-3 space-y-3">
                    <div className="flex gap-2">
                      <input type="text" maxLength={6} value={fallbackCode} onChange={(e) => setFallbackCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="flex-1 px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-center text-lg font-mono tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]" />
                      <ABAButton variant="primary" size="md" onClick={handleValidateFallback} disabled={fallbackCode.length !== 6}>Validate</ABAButton>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-[#E5E8EC] pt-3 mt-3">
                <button onClick={closeModal} className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline">
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* ── Phase: Failed sync ── */}
          {consultPhase === 'failed-sync' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">
                A network issue prevented sync. Use fallback code if the member already approved.
              </p>
              <div className="bg-[#FEF2F2] rounded-xl border border-[#E44F4F]/20 p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center flex-shrink-0">
                    <WifiOff className="w-5 h-5 text-[#E44F4F]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#E44F4F]">Failed sync</p>
                    <p className="text-xs text-[#8F9AA1] mt-0.5">
                      Network issue. Use fallback code if the member already approved.
                    </p>
                  </div>
                </div>
              </div>
              {/* Fallback section — expanded by default */}
              <div className="mb-4">
                <button
                  onClick={() => setShowFallback(!showFallback)}
                  className="flex items-center gap-2 text-sm text-[#3A8DFF] font-medium hover:underline w-full mb-3"
                >
                  <Keyboard className="w-4 h-4" />
                  Enter approval code (fallback)
                  {showFallback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                </button>
                {showFallback && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input type="text" maxLength={6} value={fallbackCode} onChange={(e) => setFallbackCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="flex-1 px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-center text-lg font-mono tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]" />
                      <ABAButton variant="primary" size="md" onClick={handleValidateFallback} disabled={fallbackCode.length !== 6}>Validate</ABAButton>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <ABAButton variant="secondary" size="md" fullWidth onClick={handleRetrySync}>
                  <RefreshCw className="w-4 h-4" />
                  Retry sync
                </ABAButton>
                <ABAButton variant="outline" size="md" fullWidth onClick={handleProceedOOP}>
                  <Wallet className="w-4 h-4" />
                  Proceed out-of-pocket
                </ABAButton>
                <button onClick={closeModal} className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline">
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* ── Phase: Approved ── */}
          {consultPhase === 'approved' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">
                Member approved the request. Confirm to transfer.
              </p>

              {/* Approved status */}
              <div className="bg-[#E9F8F0] rounded-xl border border-[#38C172]/20 p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E9F8F0] flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-[#38C172]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#38C172]">Approved</p>
                    <p className="text-xs text-[#4A4F55] mt-0.5">
                      Approved via AbaAccess PIN
                    </p>
                  </div>
                </div>
              </div>

              {/* Coverage result card */}
              <div className="bg-white rounded-xl border border-[#E5E8EC] overflow-hidden mb-5">
                <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#32C28A]" />
                  <h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                    Coverage & Approval
                  </h4>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8F9AA1]">Approval</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E9F8F0] text-[#38C172]">
                      Approved
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8F9AA1]">Coverage</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E9F8F0] text-[#38C172]">
                      Covered
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8F9AA1]">Applied Package</span>
                    <span className="text-sm font-medium text-[#1A1A1A]">Consultation Only</span>
                  </div>
                  <div className="border-t border-[#F7F9FC]" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8F9AA1]">Remaining Balance</span>
                    <span className="text-sm font-medium text-[#32C28A]">UGX 140,000</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <ABAButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleConfirmTransfer}
                  isLoading={isSubmitting}
                >
                  <CheckCircle className="w-5 h-5" />
                  Confirm transfer
                </ABAButton>
                <button
                  onClick={closeModal}
                  className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* ── Phase: Out-of-pocket ── */}
          {consultPhase === 'out-of-pocket' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">
                Patient will proceed without coverage. Confirm to transfer.
              </p>

              {/* OOP status */}
              <div className="bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F7F9FC] flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-5 h-5 text-[#8F9AA1]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1A1A1A]">Out-of-pocket</p>
                    <p className="text-xs text-[#8F9AA1] mt-0.5">
                      No coverage applied — patient pays full consultation fee.
                    </p>
                  </div>
                </div>
              </div>

              {/* Coverage result card */}
              <div className="bg-white rounded-xl border border-[#E5E8EC] overflow-hidden mb-5">
                <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#8F9AA1]" />
                  <h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                    Coverage & Approval
                  </h4>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8F9AA1]">Coverage</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]">
                      Out-of-pocket
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8F9AA1]">Applied Package</span>
                    <span className="text-sm font-medium text-[#8F9AA1]">N/A</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <ABAButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleConfirmTransfer}
                  isLoading={isSubmitting}
                >
                  <CheckCircle className="w-5 h-5" />
                  Confirm transfer
                </ABAButton>
                <button
                  onClick={closeModal}
                  className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </ModalShell>
      )}

      {/* ═══════════════════════════════════════════════
           Advance / Update Status Confirm Modal (non-consultation)
         ═══════════════════════════════════════════════ */}
      {modal === 'advance' && (
        <ModalShell onClose={closeModal}>
          <div className="flex items-center gap-2 mb-1">
            <ArrowRightCircle className="w-5 h-5 text-aba-primary-main" />
            <h3 className="text-lg font-semibold text-aba-neutral-900">{advanceLabel}</h3>
          </div>
          <p className="text-sm text-aba-neutral-600 mb-5">
            {nextStatus(item.status) === 'completed'
              ? `Mark ${item.patient}'s visit as complete.`
              : `Return ${item.patient} to the waiting queue.`}
          </p>

          {/* Visual: from → to */}
          <div className="flex items-center justify-center gap-3 p-4 bg-aba-neutral-100 rounded-xl mb-6">
            <StatusChip status={item.status} size="md" />
            <ArrowRightCircle className="w-5 h-5 text-aba-neutral-400" />
            <StatusChip status={nextStatus(item.status)!} size="md" />
          </div>

          <div className="space-y-3">
            <ABAButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleAdvance}
              isLoading={isSubmitting}
            >
              <CheckCircle className="w-5 h-5" />
              Confirm
            </ABAButton>
            <button
              onClick={closeModal}
              className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline"
            >
              Cancel
            </button>
          </div>
        </ModalShell>
      )}

      {/* ═══════════════════════════════════════════════
           R-32 Transfer to Lab — Multi-step approval
         ═══════════════════════════════════════════════ */}
      {modal === 'transfer-lab' && (
        <ModalShell onClose={closeModal}>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-[#F59E0B]" />
            <h3 className="text-lg font-semibold text-aba-neutral-900">Transfer to Lab</h3>
          </div>

          {/* ── Phase: Already Transferred (Lab) ── */}
          {consultPhase === 'already-transferred' && (
            <>
              <div className="bg-[#EBF3FF] rounded-xl border border-[#3A8DFF]/20 p-4 mt-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EBF3FF] flex items-center justify-center flex-shrink-0"><Info className="w-5 h-5 text-[#3A8DFF]" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#3A8DFF]">Already transferred</p>
                    <p className="text-xs text-[#8F9AA1] mt-0.5">Already transferred to Lab ({item.labCoverageStatus === 'Out-of-pocket' ? 'out-of-pocket' : 'coverage applied'}).</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#8F9AA1] mb-4">A coverage deduction has already been recorded for this station during this visit. Transferring again would cause a duplicate deduction.</p>
              {showAlreadyDetail && item.labCoverageStatus && (
                <div className="bg-white rounded-xl border border-[#E5E8EC] overflow-hidden mb-4">
                  <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#32C28A]" /><h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">Coverage & Approval</h4></div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Coverage</span><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.labCoverageStatus === 'Covered' ? 'bg-[#E9F8F0] text-[#38C172]' : item.labCoverageStatus === 'Discount applied' ? 'bg-[#EBF3FF] text-[#3A8DFF]' : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'}`}>{item.labCoverageStatus}</span></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Applied Package</span><span className="text-sm font-medium text-[#1A1A1A]">{item.labCoveragePackage || 'N/A'}</span></div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <ABAButton variant="outline" size="md" fullWidth onClick={() => setShowAlreadyDetail(!showAlreadyDetail)}><Eye className="w-4 h-4" />{showAlreadyDetail ? 'Hide details' : 'View details'}</ABAButton>
                <ABAButton variant="outline" size="md" fullWidth disabled><Lock className="w-4 h-4" />Undo transfer (admin only)</ABAButton>
                <button onClick={closeModal} className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline">Close</button>
              </div>
            </>
          )}

          {/* ── Phase: Patient Confirmation ── */}
          {consultPhase === 'patient-confirm' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">
                Confirm patient details and coverage before transferring to Lab.
              </p>

              {/* Patient info */}
              <div className="bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFFBEB] flex items-center justify-center flex-shrink-0">
                    <FlaskConical className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">{item.patient}</p>
                    <p className="text-xs text-[#8F9AA1]">{item.phone}</p>
                  </div>
                </div>
              </div>

              {/* Patient type selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                  Patient type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPatientType('member')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      patientType === 'member'
                        ? 'border-[#32C28A] bg-[#E9F8F0] text-[#1A1A1A]'
                        : 'border-[#E5E8EC] bg-white text-[#8F9AA1] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Member
                  </button>
                  <button
                    onClick={() => setPatientType('dependent')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      patientType === 'dependent'
                        ? 'border-[#32C28A] bg-[#E9F8F0] text-[#1A1A1A]'
                        : 'border-[#E5E8EC] bg-white text-[#8F9AA1] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Dependent
                  </button>
                </div>
              </div>

              {/* Dependent selector */}
              {patientType === 'dependent' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                    Select dependent
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDependent}
                      onChange={(e) => setSelectedDependent(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-sm text-[#1A1A1A] appearance-none focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]"
                    >
                      {SAMPLE_DEPENDENTS.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F9AA1] pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Note for Lab */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-aba-neutral-600" />
                    Note for Lab (optional)
                  </span>
                </label>
                <textarea
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="E.g. CBC panel, fasting glucose…"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all resize-none"
                />
              </div>

              <div className="space-y-3">
                <ABAButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={startApprovalRequest}
                >
                  <ShieldCheck className="w-5 h-5" />
                  Request Approval
                </ABAButton>

                <ABAButton
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => setOopConfirm(true)}
                >
                  <Wallet className="w-4 h-4" />
                  Proceed out-of-pocket
                </ABAButton>

                <button
                  onClick={closeModal}
                  className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline"
                >
                  Cancel
                </button>
              </div>

              {oopConfirm && (
                <div className="mt-4 p-4 bg-[#FFF3DC] rounded-xl border border-[#D97706]/20">
                  <p className="text-sm text-[#1A1A1A] mb-3">
                    Proceed as out-of-pocket for lab services?
                  </p>
                  <div className="flex gap-2">
                    <ABAButton variant="primary" size="md" fullWidth onClick={handleProceedOOP}>
                      Confirm
                    </ABAButton>
                    <ABAButton variant="outline" size="md" fullWidth onClick={() => setOopConfirm(false)}>
                      Back
                    </ABAButton>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Phase: Approval Pending ── */}
          {consultPhase === 'approval-pending' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">
                Waiting for member to approve lab coverage in AbaAccess.
              </p>

              <div className="bg-[#FFF3DC] rounded-xl border border-[#D97706]/20 p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFF3DC] flex items-center justify-center flex-shrink-0">
                    <Timer className="w-5 h-5 text-[#D97706]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A]">Approval requested</p>
                    <p className="text-xs text-[#8F9AA1] mt-0.5">
                      Member approves in AbaAccess using PIN.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 py-3 bg-white rounded-lg">
                  <Clock className="w-4 h-4 text-[#D97706]" />
                  <span className="text-2xl font-bold text-[#1A1A1A] font-mono tracking-wider">
                    {fmtTimer(timerSeconds)}
                  </span>
                </div>

                {timerSeconds === 0 && (
                  <p className="text-xs text-[#E44F4F] text-center mt-2 font-medium">
                    Request timed out. Resend or use fallback.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 px-4 py-3 bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] mb-4">
                <FlaskConical className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.patient}</p>
                  <p className="text-[10px] text-[#8F9AA1]">
                    {patientType === 'dependent'
                      ? `Dependent: ${SAMPLE_DEPENDENTS.find((d) => d.id === selectedDependent)?.name}`
                      : 'Member'} — Lab transfer
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <ABAButton variant="secondary" size="md" fullWidth onClick={handleResendRequest}>
                  <RefreshCw className="w-4 h-4" />
                  Resend request
                </ABAButton>
                {resendCount >= 2 && (
                  <p className="text-[10px] text-[#D97706] text-center font-medium">
                    Multiple resend attempts. Consider using fallback code or proceeding out-of-pocket.
                  </p>
                )}
                <ABAButton variant="outline" size="md" fullWidth onClick={handleCancelApproval}>
                  Cancel
                </ABAButton>
              </div>

              {/* Fallback */}
              <div className="border-t border-[#E5E8EC] pt-3">
                <button
                  onClick={() => setShowFallback(!showFallback)}
                  className="flex items-center gap-2 text-sm text-[#3A8DFF] font-medium hover:underline w-full"
                >
                  <Keyboard className="w-4 h-4" />
                  Enter approval code (fallback)
                  {showFallback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                </button>

                {showFallback && (
                  <div className="mt-3 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={fallbackCode}
                        onChange={(e) => setFallbackCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="flex-1 px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-center text-lg font-mono tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]"
                      />
                      <ABAButton
                        variant="primary"
                        size="md"
                        onClick={handleValidateFallback}
                        disabled={fallbackCode.length !== 6}
                      >
                        Validate
                      </ABAButton>
                    </div>
                    <p className="text-[10px] text-[#8F9AA1] text-center">
                      Use only if sync fails.
                    </p>
                  </div>
                )}
              </div>

              {/* Out-of-pocket escape */}
              <div className="border-t border-[#E5E8EC] pt-3 mt-3">
                {!oopConfirm ? (
                  <ABAButton variant="outline" size="md" fullWidth onClick={() => setOopConfirm(true)}>
                    <Wallet className="w-4 h-4" />
                    Proceed out-of-pocket
                  </ABAButton>
                ) : (
                  <div className="p-4 bg-[#FFF3DC] rounded-xl border border-[#D97706]/20">
                    <p className="text-sm text-[#1A1A1A] mb-3">
                      Proceed as out-of-pocket for lab services?
                    </p>
                    <div className="flex gap-2">
                      <ABAButton variant="primary" size="md" fullWidth onClick={handleProceedOOP}>
                        Confirm
                      </ABAButton>
                      <ABAButton variant="outline" size="md" fullWidth onClick={() => setOopConfirm(false)}>
                        Back
                      </ABAButton>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Phase: Declined (Lab) ── */}
          {consultPhase === 'declined' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">The member declined the lab approval request.</p>
              <div className="bg-[#FEF2F2] rounded-xl border border-[#E44F4F]/20 p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center flex-shrink-0"><ShieldOff className="w-5 h-5 text-[#E44F4F]" /></div>
                  <div className="flex-1"><p className="text-sm font-semibold text-[#E44F4F]">Declined</p><p className="text-xs text-[#8F9AA1] mt-0.5">Approval declined by member.</p></div>
                </div>
              </div>
              <div className="space-y-2">
                <ABAButton variant="secondary" size="md" fullWidth onClick={handleResendRequest}><RefreshCw className="w-4 h-4" />Resend request</ABAButton>
                {resendCount >= 2 && <p className="text-[10px] text-[#D97706] text-center font-medium">Multiple resend attempts. Consider proceeding out-of-pocket.</p>}
                <ABAButton variant="outline" size="md" fullWidth onClick={handleProceedOOP}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                <button onClick={closeModal} className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline">Cancel</button>
              </div>
            </>
          )}

          {/* ── Phase: Timed out (Lab) ── */}
          {consultPhase === 'timed-out' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">No response received within the timeout window.</p>
              <div className="bg-[#FFF3DC] rounded-xl border border-[#D97706]/20 p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFF3DC] flex items-center justify-center flex-shrink-0"><Timer className="w-5 h-5 text-[#D97706]" /></div>
                  <div className="flex-1"><p className="text-sm font-semibold text-[#D97706]">Timed out</p><p className="text-xs text-[#8F9AA1] mt-0.5">No response. Request timed out.</p></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <ABAButton variant="secondary" size="md" fullWidth onClick={handleResendRequest}><RefreshCw className="w-4 h-4" />Resend request</ABAButton>
                {resendCount >= 2 && <p className="text-[10px] text-[#D97706] text-center font-medium">Multiple resend attempts. Consider using fallback code or proceeding out-of-pocket.</p>}
                <ABAButton variant="outline" size="md" fullWidth onClick={handleProceedOOP}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
              </div>
              <div className="border-t border-[#E5E8EC] pt-3">
                <button onClick={() => setShowFallback(!showFallback)} className="flex items-center gap-2 text-sm text-[#3A8DFF] font-medium hover:underline w-full">
                  <Keyboard className="w-4 h-4" />Enter approval code (fallback){showFallback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                </button>
                {showFallback && (
                  <div className="mt-3 space-y-3"><div className="flex gap-2">
                    <input type="text" maxLength={6} value={fallbackCode} onChange={(e) => setFallbackCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="flex-1 px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-center text-lg font-mono tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]" />
                    <ABAButton variant="primary" size="md" onClick={handleValidateFallback} disabled={fallbackCode.length !== 6}>Validate</ABAButton>
                  </div></div>
                )}
              </div>
              <div className="border-t border-[#E5E8EC] pt-3 mt-3"><button onClick={closeModal} className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline">Cancel</button></div>
            </>
          )}

          {/* ── Phase: Failed sync (Lab) ── */}
          {consultPhase === 'failed-sync' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">A network issue prevented sync. Use fallback code if the member already approved.</p>
              <div className="bg-[#FEF2F2] rounded-xl border border-[#E44F4F]/20 p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center flex-shrink-0"><WifiOff className="w-5 h-5 text-[#E44F4F]" /></div>
                  <div className="flex-1"><p className="text-sm font-semibold text-[#E44F4F]">Failed sync</p><p className="text-xs text-[#8F9AA1] mt-0.5">Network issue. Use fallback code if the member already approved.</p></div>
                </div>
              </div>
              <div className="mb-4">
                <button onClick={() => setShowFallback(!showFallback)} className="flex items-center gap-2 text-sm text-[#3A8DFF] font-medium hover:underline w-full mb-3">
                  <Keyboard className="w-4 h-4" />Enter approval code (fallback){showFallback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                </button>
                {showFallback && (
                  <div className="space-y-3"><div className="flex gap-2">
                    <input type="text" maxLength={6} value={fallbackCode} onChange={(e) => setFallbackCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="flex-1 px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-center text-lg font-mono tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]" />
                    <ABAButton variant="primary" size="md" onClick={handleValidateFallback} disabled={fallbackCode.length !== 6}>Validate</ABAButton>
                  </div></div>
                )}
              </div>
              <div className="space-y-2">
                <ABAButton variant="secondary" size="md" fullWidth onClick={handleRetrySync}><RefreshCw className="w-4 h-4" />Retry sync</ABAButton>
                <ABAButton variant="outline" size="md" fullWidth onClick={handleProceedOOP}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                <button onClick={closeModal} className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline">Cancel</button>
              </div>
            </>
          )}

          {/* ── Phase: Approved ── */}
          {consultPhase === 'approved' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">
                Lab coverage approved. Confirm transfer.
              </p>

              <div className="bg-[#E9F8F0] rounded-xl border border-[#38C172]/20 p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E9F8F0] flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-[#38C172]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#38C172]">Approved</p>
                    <p className="text-xs text-[#4A4F55] mt-0.5">Approved via AbaAccess PIN</p>
                  </div>
                </div>
              </div>

              {/* Coverage & Approval card */}
              <div className="bg-white rounded-xl border border-[#E5E8EC] overflow-hidden mb-5">
                <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#32C28A]" />
                  <h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                    Coverage & Approval
                  </h4>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8F9AA1]">Approval</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E9F8F0] text-[#38C172]">
                      Approved
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8F9AA1]">Coverage</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E9F8F0] text-[#38C172]">
                      Covered
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8F9AA1]">Applied Package</span>
                    <span className="text-sm font-medium text-[#1A1A1A]">Lab Only</span>
                  </div>
                  <div className="border-t border-[#F7F9FC]" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8F9AA1]">Remaining Lab Credits</span>
                    <span className="text-sm font-medium text-[#32C28A]">8 of 10</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <ABAButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleConfirmLabTransfer}
                  isLoading={isSubmitting}
                >
                  <CheckCircle className="w-5 h-5" />
                  Confirm transfer to Lab
                </ABAButton>
                <button
                  onClick={closeModal}
                  className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* ── Phase: Out-of-pocket ── */}
          {consultPhase === 'out-of-pocket' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">
                Patient will proceed without lab coverage. Confirm transfer.
              </p>

              <div className="bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F7F9FC] flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-5 h-5 text-[#8F9AA1]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1A1A1A]">Out-of-pocket</p>
                    <p className="text-xs text-[#8F9AA1] mt-0.5">
                      No coverage applied — patient pays full lab fees.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E5E8EC] overflow-hidden mb-5">
                <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#8F9AA1]" />
                  <h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                    Coverage & Approval
                  </h4>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8F9AA1]">Coverage</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]">
                      Out-of-pocket
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8F9AA1]">Applied Package</span>
                    <span className="text-sm font-medium text-[#8F9AA1]">N/A</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <ABAButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleConfirmLabTransfer}
                  isLoading={isSubmitting}
                >
                  <CheckCircle className="w-5 h-5" />
                  Confirm transfer to Lab
                </ABAButton>
                <button
                  onClick={closeModal}
                  className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </ModalShell>
      )}

      {/* ═══════════════════════════════════════════════
           R-32 Transfer to Pharmacy — Multi-step approval
         ═══════════════════════════════════════════════ */}
      {modal === 'transfer-pharmacy' && (
        <ModalShell onClose={closeModal}>
          <div className="flex items-center gap-2 mb-1">
            <Pill className="w-5 h-5 text-[#EC4899]" />
            <h3 className="text-lg font-semibold text-aba-neutral-900">Transfer to Pharmacy</h3>
          </div>

          {/* ── Phase: Already Transferred (Pharmacy) ── */}
          {consultPhase === 'already-transferred' && (
            <>
              <div className="bg-[#EBF3FF] rounded-xl border border-[#3A8DFF]/20 p-4 mt-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EBF3FF] flex items-center justify-center flex-shrink-0"><Info className="w-5 h-5 text-[#3A8DFF]" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#3A8DFF]">Already transferred</p>
                    <p className="text-xs text-[#8F9AA1] mt-0.5">Already transferred to Pharmacy ({item.pharmCoverageStatus === 'Out-of-pocket' ? 'out-of-pocket' : 'coverage applied'}).</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#8F9AA1] mb-4">A coverage deduction has already been recorded for this station during this visit. Transferring again would cause a duplicate deduction.</p>
              {showAlreadyDetail && item.pharmCoverageStatus && (
                <div className="bg-white rounded-xl border border-[#E5E8EC] overflow-hidden mb-4">
                  <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#32C28A]" /><h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">Coverage & Approval</h4></div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Coverage</span><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.pharmCoverageStatus === 'Covered' ? 'bg-[#E9F8F0] text-[#38C172]' : item.pharmCoverageStatus === 'Discount applied' ? 'bg-[#EBF3FF] text-[#3A8DFF]' : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'}`}>{item.pharmCoverageStatus}</span></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Applied Package</span><span className="text-sm font-medium text-[#1A1A1A]">{item.pharmCoveragePackage || 'N/A'}</span></div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <ABAButton variant="outline" size="md" fullWidth onClick={() => setShowAlreadyDetail(!showAlreadyDetail)}><Eye className="w-4 h-4" />{showAlreadyDetail ? 'Hide details' : 'View details'}</ABAButton>
                <ABAButton variant="outline" size="md" fullWidth disabled><Lock className="w-4 h-4" />Undo transfer (admin only)</ABAButton>
                <button onClick={closeModal} className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline">Close</button>
              </div>
            </>
          )}

          {/* ── Phase: Patient Confirmation ── */}
          {consultPhase === 'patient-confirm' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">
                Confirm patient details and coverage before transferring to Pharmacy.
              </p>
              <div className="bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FDF2F8] flex items-center justify-center flex-shrink-0"><Pill className="w-5 h-5 text-[#EC4899]" /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[#1A1A1A] truncate">{item.patient}</p><p className="text-xs text-[#8F9AA1]">{item.phone}</p></div>
                </div>
              </div>
              <div className="mb-4"><label className="block text-sm font-medium text-aba-neutral-900 mb-2">Patient type</label>
                <div className="flex gap-2">
                  <button onClick={() => setPatientType('member')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${patientType === 'member' ? 'border-[#32C28A] bg-[#E9F8F0] text-[#1A1A1A]' : 'border-[#E5E8EC] bg-white text-[#8F9AA1] hover:bg-[#F7F9FC]'}`}><User className="w-4 h-4" />Member</button>
                  <button onClick={() => setPatientType('dependent')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${patientType === 'dependent' ? 'border-[#32C28A] bg-[#E9F8F0] text-[#1A1A1A]' : 'border-[#E5E8EC] bg-white text-[#8F9AA1] hover:bg-[#F7F9FC]'}`}><Users className="w-4 h-4" />Dependent</button>
                </div>
              </div>
              {patientType === 'dependent' && (
                <div className="mb-4"><label className="block text-sm font-medium text-aba-neutral-900 mb-2">Select dependent</label>
                  <div className="relative">
                    <select value={selectedDependent} onChange={(e) => setSelectedDependent(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-sm text-[#1A1A1A] appearance-none focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]">
                      {SAMPLE_DEPENDENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F9AA1] pointer-events-none" />
                  </div>
                </div>
              )}
              <div className="mb-5">
                <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                  <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-aba-neutral-600" />Note for Pharmacy (optional)</span>
                </label>
                <textarea value={transferNote} onChange={(e) => setTransferNote(e.target.value)} placeholder="E.g. Collect prescribed medication, dosage adjustments…" rows={2} className="w-full px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all resize-none" />
              </div>
              <div className="space-y-3">
                <ABAButton variant="primary" size="lg" fullWidth onClick={startApprovalRequest}><ShieldCheck className="w-5 h-5" />Request Approval</ABAButton>
                <ABAButton variant="outline" size="lg" fullWidth onClick={() => setOopConfirm(true)}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                <button onClick={closeModal} className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline">Cancel</button>
              </div>
              {oopConfirm && (
                <div className="mt-4 p-4 bg-[#FFF3DC] rounded-xl border border-[#D97706]/20">
                  <p className="text-sm text-[#1A1A1A] mb-3">Proceed as out-of-pocket for pharmacy?</p>
                  <div className="flex gap-2">
                    <ABAButton variant="primary" size="md" fullWidth onClick={handleProceedOOP}>Confirm</ABAButton>
                    <ABAButton variant="outline" size="md" fullWidth onClick={() => setOopConfirm(false)}>Back</ABAButton>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Phase: Approval Pending ── */}
          {consultPhase === 'approval-pending' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">Waiting for member to approve pharmacy coverage in AbaAccess.</p>
              <div className="bg-[#FFF3DC] rounded-xl border border-[#D97706]/20 p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFF3DC] flex items-center justify-center flex-shrink-0"><Timer className="w-5 h-5 text-[#D97706]" /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-[#1A1A1A]">Approval requested</p><p className="text-xs text-[#8F9AA1] mt-0.5">Member approves in AbaAccess using PIN.</p></div>
                </div>
                <div className="flex items-center justify-center gap-2 py-3 bg-white rounded-lg"><Clock className="w-4 h-4 text-[#D97706]" /><span className="text-2xl font-bold text-[#1A1A1A] font-mono tracking-wider">{fmtTimer(timerSeconds)}</span></div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] mb-4">
                <Pill className="w-4 h-4 text-[#EC4899] flex-shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-[#1A1A1A] truncate">{item.patient}</p><p className="text-[10px] text-[#8F9AA1]">{patientType === 'dependent' ? `Dependent: ${SAMPLE_DEPENDENTS.find((d) => d.id === selectedDependent)?.name}` : 'Member'} — Pharmacy transfer</p></div>
              </div>
              <div className="space-y-2 mb-4">
                <ABAButton variant="secondary" size="md" fullWidth onClick={handleResendRequest}><RefreshCw className="w-4 h-4" />Resend request</ABAButton>
                {resendCount >= 2 && <p className="text-[10px] text-[#D97706] text-center font-medium">Multiple resend attempts. Consider using fallback code or proceeding out-of-pocket.</p>}
                <ABAButton variant="outline" size="md" fullWidth onClick={handleCancelApproval}>Cancel</ABAButton>
              </div>
              <div className="border-t border-[#E5E8EC] pt-3">
                <button onClick={() => setShowFallback(!showFallback)} className="flex items-center gap-2 text-sm text-[#3A8DFF] font-medium hover:underline w-full"><Keyboard className="w-4 h-4" />Enter approval code (fallback){showFallback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}</button>
                {showFallback && (
                  <div className="mt-3 space-y-3"><div className="flex gap-2">
                    <input type="text" maxLength={6} value={fallbackCode} onChange={(e) => setFallbackCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="flex-1 px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-center text-lg font-mono tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]" />
                    <ABAButton variant="primary" size="md" onClick={handleValidateFallback} disabled={fallbackCode.length !== 6}>Validate</ABAButton>
                  </div><p className="text-[10px] text-[#8F9AA1] text-center">Use only if sync fails.</p></div>
                )}
              </div>
              <div className="border-t border-[#E5E8EC] pt-3 mt-3">
                {!oopConfirm ? (
                  <ABAButton variant="outline" size="md" fullWidth onClick={() => setOopConfirm(true)}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                ) : (
                  <div className="p-4 bg-[#FFF3DC] rounded-xl border border-[#D97706]/20"><p className="text-sm text-[#1A1A1A] mb-3">Proceed as out-of-pocket for pharmacy?</p>
                    <div className="flex gap-2"><ABAButton variant="primary" size="md" fullWidth onClick={handleProceedOOP}>Confirm</ABAButton><ABAButton variant="outline" size="md" fullWidth onClick={() => setOopConfirm(false)}>Back</ABAButton></div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Phase: Declined (Pharmacy) ── */}
          {consultPhase === 'declined' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">The member declined the pharmacy approval request.</p>
              <div className="bg-[#FEF2F2] rounded-xl border border-[#E44F4F]/20 p-4 mb-4">
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center flex-shrink-0"><ShieldOff className="w-5 h-5 text-[#E44F4F]" /></div>
                  <div className="flex-1"><p className="text-sm font-semibold text-[#E44F4F]">Declined</p><p className="text-xs text-[#8F9AA1] mt-0.5">Approval declined by member.</p></div></div>
              </div>
              <div className="space-y-2">
                <ABAButton variant="secondary" size="md" fullWidth onClick={handleResendRequest}><RefreshCw className="w-4 h-4" />Resend request</ABAButton>
                {resendCount >= 2 && <p className="text-[10px] text-[#D97706] text-center font-medium">Multiple resend attempts. Consider proceeding out-of-pocket.</p>}
                <ABAButton variant="outline" size="md" fullWidth onClick={handleProceedOOP}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                <button onClick={closeModal} className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline">Cancel</button>
              </div>
            </>
          )}

          {/* ── Phase: Timed out (Pharmacy) ── */}
          {consultPhase === 'timed-out' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">No response received within the timeout window.</p>
              <div className="bg-[#FFF3DC] rounded-xl border border-[#D97706]/20 p-4 mb-4">
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#FFF3DC] flex items-center justify-center flex-shrink-0"><Timer className="w-5 h-5 text-[#D97706]" /></div>
                  <div className="flex-1"><p className="text-sm font-semibold text-[#D97706]">Timed out</p><p className="text-xs text-[#8F9AA1] mt-0.5">No response. Request timed out.</p></div></div>
              </div>
              <div className="space-y-2 mb-4">
                <ABAButton variant="secondary" size="md" fullWidth onClick={handleResendRequest}><RefreshCw className="w-4 h-4" />Resend request</ABAButton>
                {resendCount >= 2 && <p className="text-[10px] text-[#D97706] text-center font-medium">Multiple resend attempts. Consider using fallback code or proceeding out-of-pocket.</p>}
                <ABAButton variant="outline" size="md" fullWidth onClick={handleProceedOOP}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
              </div>
              <div className="border-t border-[#E5E8EC] pt-3">
                <button onClick={() => setShowFallback(!showFallback)} className="flex items-center gap-2 text-sm text-[#3A8DFF] font-medium hover:underline w-full"><Keyboard className="w-4 h-4" />Enter approval code (fallback){showFallback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}</button>
                {showFallback && (<div className="mt-3 space-y-3"><div className="flex gap-2"><input type="text" maxLength={6} value={fallbackCode} onChange={(e) => setFallbackCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="flex-1 px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-center text-lg font-mono tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]" /><ABAButton variant="primary" size="md" onClick={handleValidateFallback} disabled={fallbackCode.length !== 6}>Validate</ABAButton></div></div>)}
              </div>
              <div className="border-t border-[#E5E8EC] pt-3 mt-3"><button onClick={closeModal} className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline">Cancel</button></div>
            </>
          )}

          {/* ── Phase: Failed sync (Pharmacy) ── */}
          {consultPhase === 'failed-sync' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">A network issue prevented sync. Use fallback code if the member already approved.</p>
              <div className="bg-[#FEF2F2] rounded-xl border border-[#E44F4F]/20 p-4 mb-4">
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center flex-shrink-0"><WifiOff className="w-5 h-5 text-[#E44F4F]" /></div>
                  <div className="flex-1"><p className="text-sm font-semibold text-[#E44F4F]">Failed sync</p><p className="text-xs text-[#8F9AA1] mt-0.5">Network issue. Use fallback code if the member already approved.</p></div></div>
              </div>
              <div className="mb-4">
                <button onClick={() => setShowFallback(!showFallback)} className="flex items-center gap-2 text-sm text-[#3A8DFF] font-medium hover:underline w-full mb-3"><Keyboard className="w-4 h-4" />Enter approval code (fallback){showFallback ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}</button>
                {showFallback && (<div className="space-y-3"><div className="flex gap-2"><input type="text" maxLength={6} value={fallbackCode} onChange={(e) => setFallbackCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="flex-1 px-4 py-3 rounded-xl border border-[#E5E8EC] bg-white text-center text-lg font-mono tracking-[0.3em] text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]" /><ABAButton variant="primary" size="md" onClick={handleValidateFallback} disabled={fallbackCode.length !== 6}>Validate</ABAButton></div></div>)}
              </div>
              <div className="space-y-2">
                <ABAButton variant="secondary" size="md" fullWidth onClick={handleRetrySync}><RefreshCw className="w-4 h-4" />Retry sync</ABAButton>
                <ABAButton variant="outline" size="md" fullWidth onClick={handleProceedOOP}><Wallet className="w-4 h-4" />Proceed out-of-pocket</ABAButton>
                <button onClick={closeModal} className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline">Cancel</button>
              </div>
            </>
          )}

          {/* ── Phase: Approved (Pharmacy) ── */}
          {consultPhase === 'approved' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">Pharmacy coverage approved. Confirm transfer.</p>
              <div className="bg-[#E9F8F0] rounded-xl border border-[#38C172]/20 p-4 mb-4">
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#E9F8F0] flex items-center justify-center flex-shrink-0"><CheckCircle className="w-5 h-5 text-[#38C172]" /></div>
                  <div className="flex-1"><p className="text-sm font-semibold text-[#38C172]">Approved</p><p className="text-xs text-[#4A4F55] mt-0.5">Approved via AbaAccess PIN</p></div></div>
              </div>
              <div className="bg-white rounded-xl border border-[#E5E8EC] overflow-hidden mb-5">
                <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#32C28A]" /><h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">Coverage & Approval</h4></div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Approval</span><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E9F8F0] text-[#38C172]">Approved</span></div>
                  <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Coverage</span><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E9F8F0] text-[#38C172]">Covered</span></div>
                  <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Applied Package</span><span className="text-sm font-medium text-[#1A1A1A]">Pharmacy Only</span></div>
                </div>
              </div>
              <div className="space-y-3">
                <ABAButton variant="primary" size="lg" fullWidth onClick={handleTransferPharmacy} isLoading={isSubmitting}><CheckCircle className="w-5 h-5" />Confirm transfer to Pharmacy</ABAButton>
                <button onClick={closeModal} className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline">Cancel</button>
              </div>
            </>
          )}

          {/* ── Phase: Out-of-pocket (Pharmacy) ── */}
          {consultPhase === 'out-of-pocket' && (
            <>
              <p className="text-sm text-aba-neutral-600 mb-5">Patient will proceed without pharmacy coverage. Confirm transfer.</p>
              <div className="bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-4 mb-4">
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#F7F9FC] flex items-center justify-center flex-shrink-0"><Wallet className="w-5 h-5 text-[#8F9AA1]" /></div>
                  <div className="flex-1"><p className="text-sm font-semibold text-[#1A1A1A]">Out-of-pocket</p><p className="text-xs text-[#8F9AA1] mt-0.5">No coverage applied — patient pays full pharmacy fees.</p></div></div>
              </div>
              <div className="bg-white rounded-xl border border-[#E5E8EC] overflow-hidden mb-5">
                <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#8F9AA1]" /><h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">Coverage & Approval</h4></div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Coverage</span><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]">Out-of-pocket</span></div>
                  <div className="flex items-center justify-between"><span className="text-xs text-[#8F9AA1]">Applied Package</span><span className="text-sm font-medium text-[#8F9AA1]">N/A</span></div>
                </div>
              </div>
              <div className="space-y-3">
                <ABAButton variant="primary" size="lg" fullWidth onClick={handleTransferPharmacy} isLoading={isSubmitting}><CheckCircle className="w-5 h-5" />Confirm transfer to Pharmacy</ABAButton>
                <button onClick={closeModal} className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline">Cancel</button>
              </div>
            </>
          )}
        </ModalShell>
      )}

      {/* ═══════════════════════════════════════════════
           Remove from Queue Modal (reason required)
         ═══════════════════════════════════════════════ */}
      {modal === 'remove' && (
        <ModalShell onClose={closeModal}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-aba-error-main" />
            <h3 className="text-lg font-semibold text-aba-neutral-900">Remove from Queue</h3>
          </div>
          <p className="text-sm text-aba-neutral-600 mb-5">
            Remove <span className="font-medium">{item.patient}</span> from the queue. A reason is required.
          </p>

          {/* Reason picker */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
              Reason
            </label>
            <div className="space-y-2">
              {removalReasons.map((r) => (
                <button
                  key={r}
                  onClick={() => setRemovalReason(r)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                    removalReason === r
                      ? 'border-aba-error-main bg-aba-error-50/50 text-aba-neutral-900 font-medium'
                      : 'border-aba-neutral-200 bg-aba-neutral-0 text-aba-neutral-700 hover:bg-aba-neutral-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Custom reason field (if "Other") */}
          {removalReason === 'Other' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                Please specify
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter reason…"
                rows={2}
                className="w-full px-4 py-3 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-sm text-aba-neutral-900 placeholder:text-aba-neutral-600 focus:outline-none focus:ring-2 focus:ring-aba-error-main/30 focus:border-aba-error-main transition-all resize-none"
              />
            </div>
          )}

          <div className="space-y-3">
            <ABAButton
              variant="destructive"
              size="lg"
              fullWidth
              onClick={handleRemove}
              isLoading={isSubmitting}
              disabled={
                !removalReason ||
                (removalReason === 'Other' && !customReason.trim())
              }
            >
              <UserMinus className="w-5 h-5" />
              Remove Patient
            </ABAButton>
            <button
              onClick={closeModal}
              className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline"
            >
              Cancel
            </button>
          </div>
        </ModalShell>
      )}

    </div>
  );
}

/* ══════════════════════════════════════════
   Reusable pieces
   ══════════════════════════════════════════ */

/** Modal bottom-sheet wrapper */
function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-aba-neutral-0 rounded-t-3xl sm:rounded-3xl w-full max-w-[390px] p-6 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
        {/* Close X */}
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="p-1 -mt-1 -mr-1 rounded-lg hover:bg-aba-neutral-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-aba-neutral-600" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Info row (label + value) */
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-aba-neutral-400 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-aba-neutral-600">{label}</span>
        <p className="text-sm text-aba-neutral-900 truncate">{value}</p>
      </div>
    </div>
  );
}