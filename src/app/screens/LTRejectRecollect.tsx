/**
 * LT-06 Reject / Re-collect — Lab tech rejects a sample and requests
 * re-collection with a structured reason and optional notes.
 *
 * Layout:
 *   Top bar → "Reject / Re-collect" + back arrow
 *   Patient + order summary card
 *   Reason dropdown (5 preset reasons + Other)
 *   Notes text area
 *   CTA: "Mark Re-collect Required" (destructive / error style)
 *   Confirmation modal: "This will notify reception/clinician"
 *
 * On confirm:
 *   1. rejectSample() → order status → re-collect
 *   2. Toast "Sample rejected — re-collection required"
 *   3. pushNotification → Reception notified
 *   4. Navigate to LT-01 worklist (Pending Collection tab)
 *
 * Inner page: back arrow, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { LTStatusChip } from '../components/aba/LTStatusChip';
import { LTConfirmModal } from '../components/aba/LTConfirmModal';
import { LTWarningBanner } from '../components/aba/LTWarningBanner';
import { showToast } from '../components/aba/Toast';
import { pushNotification } from '../data/notificationStore';
import { useLabTechStore, rejectSample } from '../data/labTechStore';
import {
  User,
  FlaskConical,
  Clock,
  Stethoscope,
  Droplets,
  ChevronDown,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

/* ── Reject reason options ── */

const REJECT_REASONS = [
  { value: '', label: 'Select a reason…' },
  { value: 'insufficient_sample', label: 'Insufficient sample' },
  { value: 'wrong_container', label: 'Wrong container' },
  { value: 'clotted_sample', label: 'Clotted sample' },
  { value: 'patient_not_found', label: 'Patient not found' },
  { value: 'other', label: 'Other' },
] as const;

/** Map value key to a human-readable label for the store */
const reasonLabel: Record<string, string> = {
  insufficient_sample: 'Insufficient sample',
  wrong_container: 'Wrong container',
  clotted_sample: 'Clotted sample',
  patient_not_found: 'Patient not found',
  other: 'Other',
};

export function LTRejectRecollect() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById } = useLabTechStore();

  const order = getOrderById(orderId || '');

  const [selectedReason, setSelectedReason] = useState('');
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!order) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar
          title="Reject / Re-collect"
          showBack
          onBackClick={() => navigate(-1)}
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Order not found</p>
        </div>
      </div>
    );
  }

  /* Determine if form is valid */
  const isValid =
    selectedReason !== '' &&
    (selectedReason !== 'other' || notes.trim().length > 0);

  /* Build a formatted reason string for the store */
  const buildReasonString = (): string => {
    const label = reasonLabel[selectedReason] || selectedReason;
    if (notes.trim()) {
      return `${label} — ${notes.trim()}`;
    }
    return label;
  };

  const handleConfirmReject = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      rejectSample(order.id, buildReasonString(), {
        category: selectedReason,
        notes: notes.trim(),
      });

      setShowConfirm(false);
      showToast('Sample rejected — re-collection required', 'warning');

      pushNotification(
        'reception',
        'Lab Technician',
        'Sample Re-collection Required',
        `Sample for ${order.patientName} (${order.testName}) was rejected. New sample needed.`,
        `/r/queue`
      );
      setTimeout(() => {
        showToast('Reception notified — re-collection needed', 'success');
      }, 600);

      navigate('/lt/worklist', { replace: true });
    }, 400);
  };

  /* Priority chip */
  const prioConfig: Record<string, { label: string; bg: string; text: string }> = {
    stat: { label: 'STAT', bg: 'bg-[#FDECEC]', text: 'text-[#E44F4F]' },
    urgent: { label: 'Urgent', bg: 'bg-[#FFF3DC]', text: 'text-[#D97706]' },
    routine: { label: 'Routine', bg: 'bg-[#F7F9FC]', text: 'text-[#8F9AA1]' },
  };
  const prio = prioConfig[order.urgency];

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar
        title="Reject / Re-collect"
        showBack
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-4 space-y-3">
          {/* ── Info banner ── */}
          <LTWarningBanner
            variant="warning"
            title="Re-collection request"
            message="Rejecting this sample will notify the reception desk and ordering doctor that a new sample is needed."
          />

          {/* ── Patient + Order summary ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            {/* Patient row */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-[#3A8DFF]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                    {order.patientName}
                  </p>
                  <span className="text-xs text-[#8F9AA1] flex-shrink-0">
                    {order.patientAge} yrs
                  </span>
                </div>
                <p className="text-xs text-[#8F9AA1]">{order.patientGender}</p>
              </div>
              <LTStatusChip status={order.status} />
            </div>

            <div className="border-t border-[#E5E8EC] my-3" />

            {/* Order info */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
                <FlaskConical className="w-4 h-4 text-[#3A8DFF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A] truncate">
                  {order.testName}
                </p>
                <p className="text-xs text-[#8F9AA1]">
                  {order.testCategory} · {order.specimen}
                </p>
              </div>
              {order.urgency !== 'routine' && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-[2px] rounded-full ${prio.bg} ${prio.text}`}
                >
                  {prio.label}
                </span>
              )}
            </div>

            {/* Meta strip */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[10px] text-[#8F9AA1]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {order.orderedAt}
              </span>
              <span className="flex items-center gap-1">
                <Stethoscope className="w-3 h-3" />
                {order.orderedBy}
              </span>
              {order.collectedAt && (
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  Collected {order.collectedAt}
                </span>
              )}
            </div>
          </div>

          {/* ── Reject Reason dropdown ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <label className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide block mb-2">
              Reason for rejection <span className="text-[#E44F4F]">*</span>
            </label>

            {/* Quick-tap reason chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {REJECT_REASONS.filter((r) => r.value !== '').map((r) => (
                <button
                  key={r.value}
                  onClick={() => setSelectedReason(r.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedReason === r.value
                      ? 'bg-[#FDECEC] text-[#E44F4F] border-[#E44F4F]/30'
                      : 'bg-[#F7F9FC] text-[#4A4F55] border-[#E5E8EC] hover:bg-[#E5E8EC]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full h-11 pl-3 pr-10 rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] appearance-none focus:outline-none focus:ring-2 focus:ring-[#E44F4F]/20 focus:border-[#E44F4F] transition-all cursor-pointer"
              >
                {REJECT_REASONS.map((r) => (
                  <option key={r.value} value={r.value} disabled={r.value === ''}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F9AA1] pointer-events-none" />
            </div>

            {/* Reason descriptions */}
            {selectedReason && selectedReason !== 'other' && (
              <p className="mt-2 text-xs text-[#8F9AA1] leading-relaxed">
                {selectedReason === 'insufficient_sample' &&
                  'The sample volume or quantity is not adequate for the requested test.'}
                {selectedReason === 'wrong_container' &&
                  'The specimen was collected in an incorrect tube or container type.'}
                {selectedReason === 'clotted_sample' &&
                  'The blood sample shows visible clotting and cannot be processed.'}
                {selectedReason === 'patient_not_found' &&
                  'The patient information does not match records or the patient is unavailable.'}
              </p>
            )}
          </div>

          {/* ── Notes ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <label className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide block mb-2">
              Additional notes{' '}
              {selectedReason === 'other' && (
                <span className="text-[#E44F4F]">*</span>
              )}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                selectedReason === 'other'
                  ? 'Please describe the reason for rejection…'
                  : 'Optional — add details for the doctor or reception…'
              }
              rows={4}
              className="w-full text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-3 focus:outline-none focus:ring-2 focus:ring-[#E44F4F]/20 focus:border-[#E44F4F] transition-all resize-none"
            />
            <p className="mt-1.5 text-[10px] text-[#C9D0DB]">
              {notes.length}/300 characters
            </p>
          </div>

          {/* ── Previous rejection info (if already rejected before) ── */}
          {order.rejectReason && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-2">
                Previous rejection
              </h3>
              <p className="text-sm text-[#4A4F55] leading-relaxed">
                {order.rejectReason}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky bottom CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4">
          <ABAButton
            variant="destructive"
            fullWidth
            size="lg"
            disabled={!isValid}
            onClick={() => setShowConfirm(true)}
          >
            <RotateCcw className="w-5 h-5" />
            Mark Re-collect Required
          </ABAButton>
        </div>
      </div>

      {/* ── Confirmation modal ── */}
      <LTConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        icon={<AlertTriangle className="w-7 h-7 text-[#E44F4F]" />}
        iconBg="bg-[#FDECEC]"
        title="Reject Sample?"
        description="This will notify reception and the ordering doctor that a new sample collection is required."
        confirmText="Reject & Notify"
        confirmVariant="destructive"
        onConfirm={handleConfirmReject}
        isLoading={isSubmitting}
      >
        {/* Summary inside modal */}
        <div className="bg-[#F7F9FC] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#8F9AA1] uppercase">
              Patient
            </span>
            <span className="text-xs text-[#1A1A1A]">{order.patientName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#8F9AA1] uppercase">
              Test
            </span>
            <span className="text-xs text-[#1A1A1A]">{order.testName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#8F9AA1] uppercase">
              Reason
            </span>
            <span className="text-xs text-[#E44F4F] font-medium">
              {reasonLabel[selectedReason] || selectedReason}
            </span>
          </div>
          {notes.trim() && (
            <div>
              <span className="text-[10px] font-semibold text-[#8F9AA1] uppercase block mb-0.5">
                Notes
              </span>
              <p className="text-xs text-[#4A4F55] leading-relaxed">
                {notes.trim()}
              </p>
            </div>
          )}
        </div>
      </LTConfirmModal>
    </div>
  );
}