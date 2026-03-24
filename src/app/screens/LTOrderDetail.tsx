/**
 * LT-02 Order Detail — Full detail view of a lab order.
 *
 * Layout:
 *   Patient summary card — name, age, member tag, masked phone
 *   Order details card — ID, requested by, time, priority
 *   Tests list with sample requirements
 *   Clinical notes
 *   Results table (if available)
 *   Collection info (if already collected)
 *   Verified banner (if completed)
 *
 * Actions:
 *   Primary: "Collect Sample"  → LT-03 Collect Sample
 *   Secondary: "Start Test"    → LT-04 Result Entry (enabled once collected)
 *   Danger/text: "Reject / Re-collect" → modal → back to worklist
 *
 * Inner page: back arrow, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { LTStatusChip } from '../components/aba/LTStatusChip';
import { LTWarningBanner } from '../components/aba/LTWarningBanner';
import { LTConfirmModal } from '../components/aba/LTConfirmModal';
import { LTResultTableRow, LTResultTableHeader } from '../components/aba/LTResultTableRow';
import { useLabTechStore } from '../data/labTechStore';
import { showToast } from '../components/aba/Toast';
import type { LTRequestSource } from '../data/labTechStore';
import {
  User,
  Phone,
  Clock,
  Stethoscope,
  FlaskConical,
  Droplets,
  XCircle,
  PenLine,
  CheckCircle2,
  ShieldCheck,
  Hash,
  FileText,
  Beaker,
  Zap,
  AlertTriangle,
  RotateCcw,
  Paperclip,
  UserCircle,
  ExternalLink,
  Eye,
  CalendarCheck,
  X,
  Check,
  ClipboardList,
  Wallet,
  CreditCard,
} from 'lucide-react';

/* ── specimen icon lookup ── */
const specimenIcon: Record<string, React.ReactNode> = {
  Blood: <Droplets className="w-4 h-4 text-[#E44F4F]" />,
  'Venous Blood': <Droplets className="w-4 h-4 text-[#E44F4F]" />,
  'Capillary Blood': <Droplets className="w-4 h-4 text-[#E44F4F]" />,
  Urine: <Beaker className="w-4 h-4 text-[#FFB649]" />,
  'Mid-stream Urine': <Beaker className="w-4 h-4 text-[#FFB649]" />,
  Stool: <Beaker className="w-4 h-4 text-[#8B5CF6]" />,
  'Stool Sample': <Beaker className="w-4 h-4 text-[#8B5CF6]" />,
};

/* ── request source config ── */
const requestSourceConfig: Record<LTRequestSource, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  internal: { label: 'Internal Doctor Order', bg: 'bg-[#EBF3FF]', text: 'text-[#3A8DFF]', Icon: Stethoscope },
  'self-requested': { label: 'Self-requested', bg: 'bg-[#F3F0FF]', text: 'text-[#7C3AED]', Icon: UserCircle },
  'external-referral': { label: 'External Referral', bg: 'bg-[#FFF3DC]', text: 'text-[#D97706]', Icon: ExternalLink },
};

export function LTOrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById } = useLabTechStore();

  const order = getOrderById(orderId || '');

  const [showStatConfirm, setShowStatConfirm] = useState(false);
  const [showAttachmentViewer, setShowAttachmentViewer] = useState(false);
  const [viewingAttachment, setViewingAttachment] = useState<{ fileName: string; fileType: string; fileSize: string } | null>(null);
  const [showConfirmTests, setShowConfirmTests] = useState(false);
  const [testsConfirmed, setTestsConfirmed] = useState(false);

  if (!order) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Order Detail" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Order not found</p>
        </div>
      </div>
    );
  }

  const isPending = order.status === 'pending-collection';
  const isInProgress = order.status === 'in-progress';
  const isResultsReady = order.status === 'results-ready';
  const isCompleted = order.status === 'completed';
  const isReCollect = order.status === 're-collect';
  const canCollect = isPending || isReCollect;
  const canStartTest = isInProgress;

  /* priority config */
  const priorityConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    stat: { label: 'STAT', bg: 'bg-[#FDECEC]', text: 'text-[#E44F4F]', dot: 'bg-[#E44F4F]' },
    urgent: { label: 'Urgent', bg: 'bg-[#FFF3DC]', text: 'text-[#D97706]', dot: 'bg-[#FFB649]' },
    routine: { label: 'Routine', bg: 'bg-[#F7F9FC]', text: 'text-[#8F9AA1]', dot: 'bg-[#C9D0DB]' },
  };
  const prio = priorityConfig[order.urgency];

  /* request source derived values */
  const srcKey = order.requestSource || 'internal';
  const srcConfig = requestSourceConfig[srcKey];
  const SrcIcon = srcConfig.Icon;
  const isExternalReferral = srcKey === 'external-referral';
  const isSelfRequested = srcKey === 'self-requested';
  const hasAttachments = isExternalReferral && order.referralAttachments && order.referralAttachments.length > 0;

  /* simulated test list for Confirm Tests modal (external referral) */
  const simulatedTests = order.testName.includes('+')
    ? order.testName.split('+').map((t) => t.trim())
    : [order.testName];

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Order Detail" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-4 space-y-3">
          {/* ── Banners ── */}
          {isReCollect && order.rejectReason && (
            <LTWarningBanner
              variant="error"
              title="Re-collection Required"
              message={order.rejectReason}
            />
          )}
          {order.urgency === 'stat' && !isCompleted && (
            <LTWarningBanner
              variant="error"
              title="STAT Order"
              message="This order requires immediate priority processing."
            />
          )}

          {/* ── 1. Patient Summary Card ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-[#3A8DFF]" />
              </div>
              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                    {order.patientName}
                  </p>
                  <span className="text-xs text-[#8F9AA1] flex-shrink-0">
                    {order.patientAge} yrs
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {/* Member / Non-member tag */}
                  <span
                    className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-[2px] rounded-full ${
                      order.isMember !== false
                        ? 'bg-[#E9F8F0] text-[#38C172]'
                        : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'
                    }`}
                  >
                    {order.isMember !== false ? 'Member' : 'Non-member'}
                  </span>
                  <span className="text-xs text-[#8F9AA1]">{order.patientGender}</span>
                </div>
              </div>
              {/* Status chip */}
              <LTStatusChip status={order.status} />
            </div>

            {/* Masked phone */}
            {order.patientPhone && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E8EC]">
                <Phone className="w-3.5 h-3.5 text-[#C9D0DB]" />
                <span className="text-xs text-[#8F9AA1]">{order.patientPhone}</span>
              </div>
            )}
          </div>

          {/* ── 2. Order Details Card ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4 space-y-3">
            <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
              Order Details
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {/* Order ID */}
              <div className="flex items-start gap-2">
                <Hash className="w-3.5 h-3.5 text-[#C9D0DB] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-[#8F9AA1] uppercase">Order ID</p>
                  <p className="text-sm text-[#1A1A1A] font-medium">{order.id.toUpperCase()}</p>
                </div>
              </div>
              {/* Request Source */}
              <div className="flex items-start gap-2">
                <SrcIcon className="w-3.5 h-3.5 text-[#C9D0DB] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-[#8F9AA1] uppercase">Request Source</p>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-[2px] rounded-full mt-0.5 ${srcConfig.bg} ${srcConfig.text}`}
                  >
                    <SrcIcon className="w-3 h-3" />
                    {srcConfig.label}
                  </span>
                </div>
              </div>
              {/* Requested by */}
              <div className="flex items-start gap-2">
                <Stethoscope className="w-3.5 h-3.5 text-[#C9D0DB] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-[#8F9AA1] uppercase">Requested by</p>
                  <p className="text-sm text-[#1A1A1A] font-medium">{order.orderedBy}</p>
                </div>
              </div>
              {/* Time */}
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-[#C9D0DB] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-[#8F9AA1] uppercase">Ordered at</p>
                  <p className="text-sm text-[#1A1A1A] font-medium">{order.orderedAt}</p>
                </div>
              </div>
              {/* Priority */}
              <div className="flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-[#C9D0DB] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-[#8F9AA1] uppercase">Priority</p>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-[2px] rounded-full mt-0.5 ${prio.bg} ${prio.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} />
                    {prio.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 2+. Coverage & Payment (read-only) ── */}
          {(order.coverageStatus || order.displayVisitId) && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#32C28A]" />
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Coverage & Payment
                </h3>
              </div>

              {order.coverageStatus && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8F9AA1]">Coverage</span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-[2px] rounded-full ${
                        order.coverageStatus === 'Covered'
                          ? 'bg-[#E9F8F0] text-[#38C172]'
                          : order.coverageStatus === 'Discount applied'
                          ? 'bg-[#EBF3FF] text-[#3A8DFF]'
                          : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'
                      }`}
                    >
                      {order.coverageStatus === 'Covered' || order.coverageStatus === 'Discount applied'
                        ? <ShieldCheck className="w-3 h-3" />
                        : <Wallet className="w-3 h-3" />}
                      {order.coverageStatus}
                    </span>
                  </div>
                  <div className="border-t border-[#E5E8EC]" />
                </>
              )}

              {order.coveragePackage && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8F9AA1]">Applied Package</span>
                    <span className="text-sm font-medium text-[#1A1A1A]">{order.coveragePackage}</span>
                  </div>
                  <div className="border-t border-[#E5E8EC]" />
                </>
              )}

              {order.coverageStatus === 'Out-of-pocket' && order.paymentStatus && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8F9AA1]">Payment Status</span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-[2px] rounded-full ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-[#E9F8F0] text-[#38C172]'
                          : order.paymentStatus === 'Pending'
                          ? 'bg-[#FFF3DC] text-[#D97706]'
                          : 'bg-[#FDECEC] text-[#E44F4F]'
                      }`}
                    >
                      <CreditCard className="w-3 h-3" />
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="border-t border-[#E5E8EC]" />
                </>
              )}

              {order.displayVisitId && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8F9AA1]">Visit ID</span>
                  <span className="text-sm font-medium text-[#1A1A1A] font-mono">{order.displayVisitId}</span>
                </div>
              )}
            </div>
          )}

          {/* ── 2a. Self-request Details (if self-requested) ── */}
          {isSelfRequested && order.selfRequestDetails && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <div className="flex items-center gap-2 mb-3">
                <UserCircle className="w-4 h-4 text-[#7C3AED]" />
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Self-request Details
                </h3>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8F9AA1]">Test Package</span>
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    {order.selfRequestDetails.testPackage}
                  </span>
                </div>
                <div className="border-t border-[#E5E8EC]" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8F9AA1]">Consent Accepted</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${order.selfRequestDetails.consentAccepted ? 'text-[#38C172]' : 'text-[#E44F4F]'}`}>
                    {order.selfRequestDetails.consentAccepted ? (
                      <><Check className="w-3.5 h-3.5" /> Yes</>
                    ) : (
                      <><X className="w-3.5 h-3.5" /> No</>
                    )}
                  </span>
                </div>
                <div className="border-t border-[#E5E8EC]" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8F9AA1]">Collection Preference</span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-[#1A1A1A]">
                    <CalendarCheck className="w-3.5 h-3.5 text-[#7C3AED]" />
                    {order.selfRequestDetails.collectionPreference === 'walk-in' ? 'Walk-in' : `Booked ${order.selfRequestDetails.bookedTime || ''}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── 2b. Referral Attachment (if external referral) ── */}
          {isExternalReferral && hasAttachments && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="w-4 h-4 text-[#D97706]" />
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Referral Attachments
                </h3>
                <span className="ml-auto text-[10px] font-semibold text-[#8F9AA1] bg-[#F7F9FC] px-1.5 py-0.5 rounded-full">
                  {order.referralAttachments!.length}
                </span>
              </div>
              <div className="space-y-2">
                {order.referralAttachments!.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-[#F7F9FC] rounded-xl p-3 border border-[#E5E8EC]"
                  >
                    {/* File type thumbnail */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      att.fileType === 'PDF' ? 'bg-[#FDECEC]' : 'bg-[#EBF3FF]'
                    }`}>
                      <FileText className={`w-5 h-5 ${att.fileType === 'PDF' ? 'text-[#E44F4F]' : 'text-[#3A8DFF]'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">{att.fileName}</p>
                      <p className="text-[10px] text-[#8F9AA1] mt-0.5">{att.fileType} &middot; {att.fileSize}</p>
                    </div>
                    <button
                      onClick={() => {
                        setViewingAttachment(att);
                        setShowAttachmentViewer(true);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#E5E8EC] bg-white text-xs font-semibold text-[#3A8DFF] hover:bg-[#EBF3FF] active:bg-[#D6E7FF] transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 2c. Confirm Tests button (external referral, before collection) ── */}
          {isExternalReferral && canCollect && (
            <div className="bg-[#FFF3DC] rounded-2xl border border-[#D97706]/20 p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FFE9B3] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ClipboardList className="w-4.5 h-4.5 text-[#D97706]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    {testsConfirmed ? 'Tests Confirmed' : 'Confirm Tests Before Collection'}
                  </p>
                  <p className="text-xs text-[#4A4F55] mt-0.5 leading-relaxed">
                    {testsConfirmed
                      ? 'Test list has been reviewed and confirmed.'
                      : 'Review and confirm the test list extracted from the referral before proceeding with sample collection.'}
                  </p>
                </div>
              </div>
              {!testsConfirmed && (
                <button
                  onClick={() => setShowConfirmTests(true)}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-[#D97706]/30 text-sm font-semibold text-[#D97706] hover:bg-[#FFF9E6] active:bg-[#FFE9B3] transition-colors"
                >
                  <ClipboardList className="w-4 h-4" />
                  Confirm Tests
                </button>
              )}
              {testsConfirmed && (
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#38C172]">
                  <CheckCircle2 className="w-4 h-4" />
                  Tests confirmed
                </div>
              )}
            </div>
          )}

          {/* ── 3. Tests & Sample Requirements ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC]">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Requested Tests
              </h3>
            </div>
            <div className="px-4 py-3 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#EBF3FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                <FlaskConical className="w-4.5 h-4.5 text-[#3A8DFF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A]">{order.testName}</p>
                <p className="text-xs text-[#8F9AA1] mt-0.5">{order.testCategory}</p>
              </div>
            </div>

            {/* Specimen requirement */}
            {order.specimen !== 'N/A' && (
              <div className="px-4 py-3 border-t border-[#E5E8EC] bg-[#F7F9FC]/50">
                <p className="text-[10px] text-[#8F9AA1] uppercase tracking-wide mb-1.5">
                  Sample Required
                </p>
                <div className="flex items-center gap-2">
                  {specimenIcon[order.specimen] || (
                    <Droplets className="w-4 h-4 text-[#3A8DFF]" />
                  )}
                  <span className="text-sm text-[#1A1A1A]">{order.specimen}</span>
                </div>
                {order.method && (
                  <p className="text-xs text-[#8F9AA1] mt-1 ml-6">
                    Method: {order.method}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── 4. Clinical Notes ── */}
          {order.clinicalNotes && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-3.5 h-3.5 text-[#C9D0DB]" />
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Clinical Notes
                </h3>
              </div>
              <p className="text-sm text-[#4A4F55] leading-relaxed">
                {order.clinicalNotes}
              </p>
            </div>
          )}

          {/* ── 5. Collection Info (if collected) ── */}
          {order.collectedAt && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#38C172]" />
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Collection Info
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-[10px] text-[#8F9AA1] uppercase">Collected at</p>
                  <p className="text-sm text-[#1A1A1A]">{order.collectedAt}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#8F9AA1] uppercase">Collected by</p>
                  <p className="text-sm text-[#1A1A1A]">{order.collectedBy}</p>
                </div>
                {order.collectedSampleType && (
                  <div>
                    <p className="text-[10px] text-[#8F9AA1] uppercase">Sample type</p>
                    <p className="text-sm text-[#1A1A1A]">{order.collectedSampleType}</p>
                  </div>
                )}
                {order.collectedQuantity && (
                  <div>
                    <p className="text-[10px] text-[#8F9AA1] uppercase">Quantity</p>
                    <p className="text-sm text-[#1A1A1A]">{order.collectedQuantity}</p>
                  </div>
                )}
                {order.collectedSampleId && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-[#8F9AA1] uppercase">Sample ID</p>
                    <p className="text-sm text-[#1A1A1A] font-mono">{order.collectedSampleId}</p>
                  </div>
                )}
              </div>
              {order.collectedNotes && (
                <p className="text-xs text-[#4A4F55] pt-1 border-t border-[#E5E8EC]">
                  {order.collectedNotes}
                </p>
              )}
            </div>
          )}

          {/* ── 6. Results table (if available) ── */}
          {order.results.length > 0 && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E8EC]">
                <h3 className="text-sm font-semibold text-[#1A1A1A]">Results</h3>
                {order.resultedAt && (
                  <p className="text-[10px] text-[#8F9AA1] mt-0.5">
                    Resulted at {order.resultedAt}
                  </p>
                )}
              </div>
              <LTResultTableHeader />
              {order.results.map((row, idx) => (
                <LTResultTableRow key={idx} row={row} />
              ))}
            </div>
          )}

          {/* ── 7. Lab notes ── */}
          {order.labNotes && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-2">
                Lab Notes
              </h3>
              <p className="text-sm text-[#4A4F55] leading-relaxed">{order.labNotes}</p>
            </div>
          )}

          {/* ── 8. Verified banner ── */}
          {isCompleted && order.verifiedAt && (
            <div className="bg-[#E9F8F0] rounded-2xl border border-[#38C172]/20 p-4">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-[#38C172]" />
                <h3 className="text-xs font-semibold text-[#38C172] uppercase tracking-wide">
                  Verified & Released
                </h3>
              </div>
              <p className="text-xs text-[#4A4F55]">
                {order.verifiedBy} &middot; {order.verifiedAt}
              </p>
            </div>
          )}

          {/* ── 9. Reject History (if multiple rejections) ── */}
          {order.rejectHistory.length > 0 && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <div className="flex items-center gap-2 mb-3">
                <RotateCcw className="w-3.5 h-3.5 text-[#E44F4F]" />
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Reject History ({order.rejectHistory.length})
                </h3>
              </div>
              <div className="space-y-2.5">
                {order.rejectHistory.map((entry, idx) => (
                  <div
                    key={idx}
                    className="bg-[#FDECEC]/30 rounded-xl p-3 border border-[#E44F4F]/10"
                  >
                    <p className="text-sm text-[#4A4F55] leading-relaxed">
                      {entry.reason}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#8F9AA1]">
                      <Clock className="w-3 h-3" />
                      {entry.timestamp}
                      <span>&middot;</span>
                      {entry.rejectedBy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Attachment Viewer Modal ── */}
      {showAttachmentViewer && viewingAttachment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAttachmentViewer(false); }}
        >
          <div className="bg-[#FFFFFF] rounded-3xl w-full max-w-[360px] overflow-hidden">
            {/* Modal header */}
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
            {/* Simulated document preview */}
            <div className="p-6">
              <div className="bg-[#F7F9FC] rounded-2xl border-2 border-dashed border-[#E5E8EC] aspect-[3/4] flex flex-col items-center justify-center gap-3">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  viewingAttachment.fileType === 'PDF' ? 'bg-[#FDECEC]' : 'bg-[#EBF3FF]'
                }`}>
                  <FileText className={`w-8 h-8 ${viewingAttachment.fileType === 'PDF' ? 'text-[#E44F4F]' : 'text-[#3A8DFF]'}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-[#4A4F55]">Document Preview</p>
                  <p className="text-xs text-[#8F9AA1] mt-1">{viewingAttachment.fileType} &middot; {viewingAttachment.fileSize}</p>
                </div>
              </div>
            </div>
            {/* Modal footer */}
            <div className="px-4 pb-4">
              <ABAButton
                variant="primary"
                fullWidth
                onClick={() => setShowAttachmentViewer(false)}
              >
                Close
              </ABAButton>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Tests Modal ── */}
      {showConfirmTests && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
          onClick={(e) => { if (e.target === e.currentTarget) setShowConfirmTests(false); }}
        >
          <div className="bg-[#FFFFFF] rounded-3xl w-full max-w-[340px] p-6">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-[#FFF3DC] flex items-center justify-center">
                <ClipboardList className="w-7 h-7 text-[#D97706]" />
              </div>
            </div>
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-[#1A1A1A]">Confirm Tests</h3>
              <p className="mt-2 text-sm text-[#8F9AA1]">
                Review the tests extracted from the referral. You can edit this list if needed.
              </p>
            </div>

            {/* Test list */}
            <div className="bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-3 mb-4 space-y-2">
              {simulatedTests.map((test, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded border border-[#32C28A] bg-[#E9F8F0] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#32C28A]" />
                  </div>
                  <span className="text-sm text-[#1A1A1A]">{test}</span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-[#8F9AA1] text-center mb-5">
              Referring doctor: {order.orderedBy}
            </p>

            <div className="flex gap-3">
              <ABAButton
                variant="outline"
                onClick={() => setShowConfirmTests(false)}
                className="flex-1"
              >
                Cancel
              </ABAButton>
              <ABAButton
                variant="primary"
                onClick={() => {
                  setShowConfirmTests(false);
                  setTestsConfirmed(true);
                  showToast('Tests confirmed', 'success');
                }}
                className="flex-1"
              >
                Confirm
              </ABAButton>
            </div>
          </div>
        </div>
      )}

      {/* ── STAT Confirmation Modal ── */}
      <LTConfirmModal
        isOpen={showStatConfirm}
        onClose={() => setShowStatConfirm(false)}
        icon={<Zap className="w-7 h-7 text-[#E44F4F]" />}
        iconBg="bg-[#FDECEC]"
        title="STAT Order — Confirm Collection"
        description={`This is a STAT priority order for ${order.patientName}. Ensure proper specimen handling and immediate processing.`}
        confirmText="Proceed to Collect"
        onConfirm={() => {
          setShowStatConfirm(false);
          navigate(`/lt/collect/${order.id}`);
        }}
      />

      {/* ── Sticky Bottom Actions ── */}
      {!isCompleted && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
          <div className="max-w-[390px] mx-auto p-4 space-y-2">
            {/* Pending / Re-collect → Collect + Reject */}
            {canCollect && (
              <>
                <ABAButton
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={() =>
                    order.urgency === 'stat'
                      ? setShowStatConfirm(true)
                      : navigate(`/lt/collect/${order.id}`)
                  }
                >
                  <Droplets className="w-5 h-5" />
                  Collect Sample
                </ABAButton>
                <button
                  onClick={() => navigate(`/lt/reject-recollect/${order.id}`)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-[#E44F4F] hover:bg-[#FDECEC]/50 active:bg-[#FDECEC] transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject / Re-collect
                </button>
              </>
            )}

            {/* In progress → Start Test (result entry) + Reject */}
            {canStartTest && (
              <>
                <ABAButton
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={() => navigate(`/lt/result-entry/${order.id}`)}
                >
                  <PenLine className="w-5 h-5" />
                  Start Test
                </ABAButton>
                <button
                  onClick={() => navigate(`/lt/reject-recollect/${order.id}`)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-[#E44F4F] hover:bg-[#FDECEC]/50 active:bg-[#FDECEC] transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject / Re-collect
                </button>
              </>
            )}

            {/* Results ready → Verify & Release */}
            {isResultsReady && (
              <ABAButton
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => navigate(`/lt/review/${order.id}`)}
              >
                <ShieldCheck className="w-5 h-5" />
                Review & Release
              </ABAButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}