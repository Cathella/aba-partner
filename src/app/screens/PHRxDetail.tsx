/**
 * PH-02 Prescription Detail — Full view of a single prescription.
 *
 * Content:
 *   Patient summary card: name, age, member/non-member tag, phone masked
 *   Prescriber card: clinician name, time, department
 *   Medication list card: drug name, dosage, frequency, duration, notes, stock badge
 *   Alert banner: "Check allergies" (placeholder)
 *
 * Actions:
 *   Primary CTA: "Start Filling" → PH-03 Fill Preparation
 *   Secondary: "Payment & Coverage" → PH-05
 *   Text link: "Request Clarification" (disabled — "Coming soon")
 *   Danger: "Cancel Prescription" (requires reason modal)
 *
 * Bottom nav present.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { PHStatusChip } from '../components/aba/PHStatusChip';
import { PHConfirmModal } from '../components/aba/PHConfirmModal';
import { PharmacyBottomNav } from '../components/aba/PharmacyBottomNav';
import { showToast } from '../components/aba/Toast';
import {
  usePharmacistStore,
  startDispensing,
  putOnHold,
  verifyExternalRx,
} from '../data/pharmacistStore';
import type { PHMedItem, PHRequestSource } from '../data/pharmacistStore';
import {
  User,
  Pill,
  Clock,
  Stethoscope,
  ShieldAlert,
  Phone,
  CreditCard,
  FileText,
  Play,
  XCircle,
  MessageSquare,
  PackageCheck,
  PackageMinus,
  PackageX,
  ExternalLink,
  Paperclip,
  Eye,
  CheckCircle2,
  X,
  CheckSquare,
  Square,
  ShieldCheck,
  Wallet,
  BadgePercent,
  AlertTriangle,
  Hash,
} from 'lucide-react';

/* ── Stock badge helper ── */

const stockConfig: Record<
  PHMedItem['stockLevel'],
  { label: string; icon: React.ReactNode; bg: string; text: string; border: string }
> = {
  'in-stock': {
    label: 'In Stock',
    icon: <PackageCheck className="w-3 h-3" />,
    bg: 'bg-[#E9F8F0]',
    text: 'text-[#38C172]',
    border: 'border-[#38C172]/20',
  },
  'low-stock': {
    label: 'Low',
    icon: <PackageMinus className="w-3 h-3" />,
    bg: 'bg-[#FFF3DC]',
    text: 'text-[#D97706]',
    border: 'border-[#D97706]/20',
  },
  'out-of-stock': {
    label: 'Out',
    icon: <PackageX className="w-3 h-3" />,
    bg: 'bg-[#FDECEC]',
    text: 'text-[#E44F4F]',
    border: 'border-[#E44F4F]/20',
  },
};

/* ── Request source config ── */
const requestSourceConfig: Record<PHRequestSource, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  internal: { label: 'Internal Doctor Order', bg: 'bg-[#EBF3FF]', text: 'text-[#3A8DFF]', Icon: Stethoscope },
  'external-rx': { label: 'External Prescription', bg: 'bg-[#FFF3DC]', text: 'text-[#D97706]', Icon: ExternalLink },
};

export function PHRxDetail() {
  const navigate = useNavigate();
  const { rxId } = useParams<{ rxId: string }>();
  const { getRxById } = usePharmacistStore();

  const rx = getRxById(rxId || '');

  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showAttachmentViewer, setShowAttachmentViewer] = useState(false);
  const [viewingAttachment, setViewingAttachment] = useState<{ fileName: string; fileType: string; fileSize: string } | null>(null);

  /* ── Not found ── */
  if (!rx) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Prescription Detail" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Prescription not found</p>
        </div>
        <PharmacyBottomNav />
      </div>
    );
  }

  const isNew = rx.status === 'new';
  const isInProgress = rx.status === 'in-progress';
  const isReady = rx.status === 'ready' || rx.status === 'partial-fill';
  const isCompleted = rx.status === 'completed';
  const hasAllergy = rx.allergies && rx.allergies.length > 0;

  /* Request source derived values */
  const srcKey = rx.requestSource || 'internal';
  const srcConfig = requestSourceConfig[srcKey];
  const SrcIcon = srcConfig.Icon;
  const isExternalRx = srcKey === 'external-rx';
  const hasAttachments = isExternalRx && rx.rxAttachments && rx.rxAttachments.length > 0;
  const needsVerify = isExternalRx && !rx.rxVerified;

  /* ── Handlers ── */

  const handleStartFilling = () => {
    if (isNew) startDispensing(rx.id);
    showToast('Started filling — prepare medications', 'success');
    navigate(`/ph/dispense/${rx.id}`, { replace: true });
  };

  const handleContinueFilling = () => {
    navigate(`/ph/dispense/${rx.id}`);
  };

  const handleVerify = () => {
    navigate(`/ph/verify/${rx.id}`);
  };

  const handlePayment = () => {
    navigate(`/ph/payment-coverage/${rx.id}`);
  };

  const handleCancelRx = () => {
    if (!cancelReason.trim()) return;
    putOnHold(rx.id, `Cancelled: ${cancelReason.trim()}`);
    setCancelModal(false);
    setCancelReason('');
    showToast('Prescription cancelled', 'warning');
    navigate(-1);
  };

  const handleVerifyExternalRx = () => {
    verifyExternalRx(rx.id);
    showToast('External prescription verified', 'success');
    navigate(`/ph/verify/${rx.id}`);
  };

  const handleViewAttachment = (attachment: { fileName: string; fileType: string; fileSize: string }) => {
    setViewingAttachment(attachment);
    setShowAttachmentViewer(true);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Prescription Detail" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-56">
        <div className="p-4 space-y-3">

          {/* ── Allergy alert banner ── */}
          {hasAllergy && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FDECEC] border border-[#E44F4F]/20">
              <ShieldAlert className="w-5 h-5 text-[#E44F4F] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#E44F4F]">
                  Check Allergies
                </p>
                <p className="text-[10px] text-[#4A4F55] mt-0.5">
                  Patient allergies: {rx.allergies!.join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* placeholder alert when no allergy data */}
          {!hasAllergy && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#EBF3FF] border border-[#3A8DFF]/15">
              <ShieldAlert className="w-4 h-4 text-[#3A8DFF] flex-shrink-0" />
              <p className="text-xs text-[#4A4F55]">
                <span className="font-semibold text-[#3A8DFF]">Check allergies</span> — confirm with patient before dispensing
              </p>
            </div>
          )}

          {/* ── Patient summary card ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-[#3A8DFF]" />
              </div>
              <div className="flex-1 min-w-0">
                {/* Name + member tag */}
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                    {rx.patientName}
                  </p>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-[1px] rounded flex-shrink-0 ${
                      rx.isMember
                        ? 'bg-[#EBF3FF] text-[#3A8DFF]'
                        : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'
                    }`}
                  >
                    {rx.isMember ? 'Member' : 'Non-member'}
                  </span>
                </div>
                {/* Age + gender */}
                <p className="text-xs text-[#8F9AA1] mt-0.5">
                  {rx.patientAge} yrs · {rx.patientGender}
                </p>
              </div>
              <PHStatusChip status={rx.status} />
            </div>

            {/* Phone (masked) */}
            {rx.patientPhone && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E8EC]">
                <Phone className="w-3.5 h-3.5 text-[#C9D0DB]" />
                <span className="text-xs text-[#8F9AA1]">{rx.patientPhone}</span>
              </div>
            )}
          </div>

          {/* ── Prescriber card ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="w-4 h-4 text-[#32C28A]" />
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Prescriber
              </h3>
            </div>
            <div className="space-y-2">
              {/* Request Source row */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F9AA1]">Request Source</span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-[2px] rounded-full ${srcConfig.bg} ${srcConfig.text}`}>
                  <SrcIcon className="w-3 h-3" />
                  {srcConfig.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F9AA1]">Doctor</span>
                <span className="text-sm font-medium text-[#1A1A1A]">{rx.prescribedBy}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F9AA1]">Time</span>
                <span className="text-sm text-[#1A1A1A] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#C9D0DB]" />
                  {rx.prescribedAt}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F9AA1]">Department</span>
                <span className="text-sm text-[#1A1A1A]">General Practice</span>
              </div>
              {rx.urgency !== 'routine' && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8F9AA1]">Priority</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rx.urgency === 'stat'
                        ? 'bg-[#FDECEC] text-[#E44F4F]'
                        : 'bg-[#FFF3DC] text-[#D97706]'
                    }`}
                  >
                    {rx.urgency === 'stat' ? 'STAT' : 'Urgent'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Coverage & Payment card (read-only) ── */}
          {(rx.coverageStatus || rx.displayVisitId) && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#32C28A]" />
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Coverage
                </h3>
              </div>

              {rx.coverageStatus && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8F9AA1]">Coverage</span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-[2px] rounded-full ${
                        rx.coverageStatus === 'Covered'
                          ? 'bg-[#E9F8F0] text-[#38C172]'
                          : rx.coverageStatus === 'Discount applied'
                          ? 'bg-[#EBF3FF] text-[#3A8DFF]'
                          : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'
                      }`}
                    >
                      {rx.coverageStatus === 'Covered'
                        ? <ShieldCheck className="w-3 h-3" />
                        : rx.coverageStatus === 'Discount applied'
                        ? <BadgePercent className="w-3 h-3" />
                        : <Wallet className="w-3 h-3" />}
                      {rx.coverageStatus}
                    </span>
                  </div>
                  <div className="border-t border-[#E5E8EC]" />
                </>
              )}

              {rx.coveragePackage && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8F9AA1]">Applied Package</span>
                    <span className="text-sm font-medium text-[#1A1A1A]">{rx.coveragePackage}</span>
                  </div>
                  <div className="border-t border-[#E5E8EC]" />
                </>
              )}

              {rx.coverageStatus === 'Out-of-pocket' && rx.coveragePaymentStatus && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8F9AA1]">Payment Status</span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-[2px] rounded-full ${
                        rx.coveragePaymentStatus === 'Paid'
                          ? 'bg-[#E9F8F0] text-[#38C172]'
                          : rx.coveragePaymentStatus === 'Pending'
                          ? 'bg-[#FFF3DC] text-[#D97706]'
                          : 'bg-[#FDECEC] text-[#E44F4F]'
                      }`}
                    >
                      <CreditCard className="w-3 h-3" />
                      {rx.coveragePaymentStatus}
                    </span>
                  </div>
                  <div className="border-t border-[#E5E8EC]" />
                </>
              )}

              {rx.displayVisitId && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8F9AA1]">Visit ID</span>
                  <span className="text-sm font-medium text-[#1A1A1A] font-mono">{rx.displayVisitId}</span>
                </div>
              )}

              {/* Out-of-pocket inline notice */}
              {rx.coverageStatus === 'Out-of-pocket' && rx.coveragePaymentStatus !== 'Paid' && (
                <div className="flex items-start gap-2.5 mt-1 pt-2.5 border-t border-[#E5E8EC]">
                  <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#4A4F55] leading-relaxed">
                    <span className="font-semibold text-[#D97706]">Out-of-pocket payment required.</span>{' '}
                    Collect payment before dispensing or use Payment & Coverage below.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Prescription Attachment (External Rx only) ── */}
          {isExternalRx && hasAttachments && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="w-4 h-4 text-[#D97706]" />
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Prescription Attachments
                </h3>
                <span className="ml-auto text-[10px] font-semibold text-[#8F9AA1] bg-[#F7F9FC] px-1.5 py-0.5 rounded-full">
                  {rx.rxAttachments!.length}
                </span>
              </div>
              <div className="space-y-2">
                {rx.rxAttachments!.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-[#F7F9FC] rounded-xl p-3 border border-[#E5E8EC]">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${att.fileType === 'PDF' ? 'bg-[#FDECEC]' : 'bg-[#EBF3FF]'}`}>
                      <FileText className={`w-5 h-5 ${att.fileType === 'PDF' ? 'text-[#E44F4F]' : 'text-[#3A8DFF]'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">{att.fileName}</p>
                      <p className="text-[10px] text-[#8F9AA1] mt-0.5">{att.fileType} &middot; {att.fileSize}</p>
                    </div>
                    <button
                      onClick={() => { setViewingAttachment(att); setShowAttachmentViewer(true); }}
                      className="px-3 py-1.5 rounded-lg border border-[#E5E8EC] bg-white text-xs font-semibold text-[#3A8DFF] hover:bg-[#EBF3FF] active:bg-[#D6E7FF] transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Verify Prescription checkbox (External Rx, before dispense) ── */}
          {isExternalRx && !isCompleted && (
            <div className={`rounded-2xl border p-4 ${needsVerify ? 'bg-[#FFF3DC] border-[#D97706]/20' : 'bg-[#E9F8F0] border-[#38C172]/20'}`}>
              <button
                onClick={() => {
                  if (needsVerify) {
                    verifyExternalRx(rx.id);
                    showToast('Prescription verified', 'success');
                  }
                }}
                className="flex items-center gap-3 w-full text-left"
              >
                {needsVerify ? (
                  <Square className="w-5 h-5 text-[#D97706] flex-shrink-0" />
                ) : (
                  <CheckSquare className="w-5 h-5 text-[#38C172] flex-shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-semibold ${needsVerify ? 'text-[#D97706]' : 'text-[#38C172]'}`}>
                    {needsVerify ? 'Verify Prescription' : 'Prescription Verified'}
                  </p>
                  <p className="text-xs text-[#4A4F55] mt-0.5">
                    {needsVerify
                      ? 'Confirm the external prescription is valid before dispensing.'
                      : 'This external prescription has been verified.'}
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* ── Medication list card ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#32C28A]" />
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Medications ({rx.medications.length})
              </h3>
            </div>

            {rx.medications.map((med) => {
              const stock = stockConfig[med.stockLevel];
              return (
                <div
                  key={med.id}
                  className="px-4 py-3 border-b border-[#E5E8EC] last:border-b-0"
                >
                  {/* Row 1: drug name + stock badge */}
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#EBF3FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Pill className="w-4 h-4 text-[#3A8DFF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#1A1A1A] truncate">
                          {med.name}
                        </p>
                        {/* Stock badge */}
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-[2px] rounded-full border flex-shrink-0 ${stock.bg} ${stock.text} ${stock.border}`}
                        >
                          {stock.icon}
                          {stock.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#4A4F55] mt-0.5">
                        {med.dosage} · {med.form}
                      </p>
                    </div>
                  </div>

                  {/* Details: frequency, duration, qty */}
                  <div className="ml-10 mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-[#C9D0DB] text-[10px] uppercase tracking-wide">Frequency</p>
                      <p className="text-[#4A4F55] mt-0.5">{med.frequency}</p>
                    </div>
                    <div>
                      <p className="text-[#C9D0DB] text-[10px] uppercase tracking-wide">Duration</p>
                      <p className="text-[#4A4F55] mt-0.5">{med.duration}</p>
                    </div>
                    <div>
                      <p className="text-[#C9D0DB] text-[10px] uppercase tracking-wide">Qty</p>
                      <p className="text-[#4A4F55] mt-0.5">{med.quantity}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {med.notes && (
                    <div className="ml-10 mt-2">
                      <p className="text-[10px] text-[#D97706] bg-[#FFF3DC] px-2 py-1 rounded-lg leading-relaxed">
                        {med.notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Clinical notes ── */}
          {rx.clinicalNotes && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-3.5 h-3.5 text-[#C9D0DB]" />
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Clinical Notes
                </h3>
              </div>
              <p className="text-sm text-[#4A4F55] leading-relaxed">
                {rx.clinicalNotes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky action bar ── */}
      {!isCompleted && (
        <div className="fixed bottom-16 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
          <div className="max-w-[390px] mx-auto p-4 space-y-2">

            {/* Primary CTA — status-aware */}
            {isNew && (
              <ABAButton variant="primary" fullWidth size="lg" onClick={handleStartFilling}>
                <Play className="w-4.5 h-4.5" />
                Start Filling
              </ABAButton>
            )}
            {isInProgress && (
              <ABAButton variant="primary" fullWidth size="lg" onClick={handleContinueFilling}>
                <Pill className="w-4.5 h-4.5" />
                Continue Filling
              </ABAButton>
            )}
            {isReady && (
              <ABAButton variant="primary" fullWidth size="lg" onClick={handleVerify}>
                <Pill className="w-4.5 h-4.5" />
                Verify & Release
              </ABAButton>
            )}

            {/* Secondary: Payment & Coverage */}
            <ABAButton variant="outline" fullWidth onClick={handlePayment}>
              <CreditCard className="w-4 h-4" />
              Payment & Coverage
            </ABAButton>

            {/* Text links row */}
            <div className="flex items-center justify-between pt-1">
              {/* Request Clarification — disabled */}
              <button
                disabled
                className="flex items-center gap-1.5 text-xs text-[#C9D0DB] cursor-not-allowed"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Request Clarification
                <span className="text-[9px] font-medium bg-[#F7F9FC] border border-[#E5E8EC] px-1.5 py-[1px] rounded-full text-[#C9D0DB] ml-0.5">
                  Coming soon
                </span>
              </button>

              {/* Cancel Prescription */}
              <button
                onClick={() => setCancelModal(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-[#E44F4F] hover:text-[#C83030] transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom nav ── */}
      <PharmacyBottomNav />

      {/* ── Cancel Prescription modal ── */}
      <PHConfirmModal
        isOpen={cancelModal}
        onClose={() => {
          setCancelModal(false);
          setCancelReason('');
        }}
        icon={<XCircle className="w-7 h-7 text-[#E44F4F]" />}
        iconBg="bg-[#FDECEC]"
        title="Cancel Prescription"
        description="This prescription will be cancelled. Please provide a reason."
        confirmText="Cancel Prescription"
        confirmVariant="destructive"
        onConfirm={handleCancelRx}
      >
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="e.g. Patient declined treatment, duplicate order…"
          rows={3}
          autoFocus
          className="w-full text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-3 focus:outline-none focus:ring-2 focus:ring-[#E44F4F]/30 focus:border-[#E44F4F] transition-all resize-none"
        />
      </PHConfirmModal>

      {/* ── Attachment viewer modal ── */}
      {showAttachmentViewer && viewingAttachment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAttachmentViewer(false); }}
        >
          <div className="bg-[#FFFFFF] rounded-3xl w-full max-w-[360px] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E8EC]">
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="w-4 h-4 text-[#D97706] flex-shrink-0" />
                <p className="text-sm font-semibold text-[#1A1A1A] truncate">{viewingAttachment.fileName}</p>
              </div>
              <button
                onClick={() => setShowAttachmentViewer(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F7F9FC] flex items-center justify-center flex-shrink-0"
              >
                <X className="w-4 h-4 text-[#8F9AA1]" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-[#F7F9FC] rounded-2xl border-2 border-dashed border-[#E5E8EC] aspect-[3/4] flex flex-col items-center justify-center gap-3">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${viewingAttachment.fileType === 'PDF' ? 'bg-[#FDECEC]' : 'bg-[#EBF3FF]'}`}>
                  <FileText className={`w-8 h-8 ${viewingAttachment.fileType === 'PDF' ? 'text-[#E44F4F]' : 'text-[#3A8DFF]'}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-[#4A4F55]">Document Preview</p>
                  <p className="text-xs text-[#8F9AA1] mt-1">{viewingAttachment.fileType} &middot; {viewingAttachment.fileSize}</p>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <ABAButton variant="primary" fullWidth onClick={() => setShowAttachmentViewer(false)}>
                Close
              </ABAButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}