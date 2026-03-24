/**
 * PHRxRow — Reusable list row for prescriptions in the Pharmacist module.
 * Shows: patient name + member tag, prescription ID + time,
 * medication item count, status chip, payment chip, priority indicator.
 */

import { ChevronRight, Pill, Stethoscope, ExternalLink, Paperclip, ShieldCheck, Wallet, BadgePercent } from 'lucide-react';
import { PHStatusChip } from './PHStatusChip';
import type { PHPrescription, PHRequestSource } from '../../data/pharmacistStore';

/* ── request source chip config ── */
const sourceConfig: Record<PHRequestSource, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  internal: { label: 'Internal', bg: 'bg-[#EBF3FF]', text: 'text-[#3A8DFF]', Icon: Stethoscope },
  'external-rx': { label: 'External Rx', bg: 'bg-[#FFF3DC]', text: 'text-[#D97706]', Icon: ExternalLink },
};

interface PHRxRowProps {
  rx: PHPrescription;
  onClick?: () => void;
  showStatus?: boolean;
  showPriority?: boolean;
  className?: string;
}

const paymentConfig: Record<string, { label: string; bg: string; text: string }> = {
  paid: { label: 'Paid', bg: 'bg-[#E9F8F0]', text: 'text-[#56D8A8]' },
  pending: { label: 'Pending', bg: 'bg-[#FFF3DC]', text: 'text-[#D97706]' },
  waived: { label: 'Waived', bg: 'bg-[#F7F9FC]', text: 'text-[#8F9AA1]' },
};

export function PHRxRow({
  rx,
  onClick,
  showStatus = true,
  showPriority = true,
  className = '',
}: PHRxRowProps) {
  const priorityConfig: Record<
    string,
    { label: string; bg: string; text: string; dot: string }
  > = {
    stat: {
      label: 'STAT',
      bg: 'bg-[#FDECEC]',
      text: 'text-[#E44F4F]',
      dot: 'bg-[#E44F4F]',
    },
    urgent: {
      label: 'Urgent',
      bg: 'bg-[#FFF3DC]',
      text: 'text-[#D97706]',
      dot: 'bg-[#FFB649]',
    },
    routine: {
      label: 'Routine',
      bg: 'bg-[#F7F9FC]',
      text: 'text-[#8F9AA1]',
      dot: 'bg-[#C9D0DB]',
    },
  };

  const p = priorityConfig[rx.urgency];

  const accentColor =
    rx.urgency === 'stat'
      ? 'bg-[#E44F4F]'
      : rx.urgency === 'urgent'
      ? 'bg-[#FFB649]'
      : 'bg-[#E5E8EC]';

  const itemCount = rx.medications.length;
  const itemLabel = itemCount === 1 ? '1 item' : `${itemCount} items`;

  const pay = paymentConfig[rx.paymentStatus];

  const src = rx.requestSource ? sourceConfig[rx.requestSource] : null;
  const SrcIcon = src?.Icon;
  const hasAttachments =
    rx.requestSource === 'external-rx' && rx.rxAttachments && rx.rxAttachments.length > 0;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-stretch gap-0 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left ${className}`}
    >
      {/* Accent bar */}
      <div className={`w-[3px] flex-shrink-0 rounded-r-full my-2 ${accentColor}`} />

      {/* Content */}
      <div className="flex-1 flex items-center gap-3 px-3.5 py-3">
        <div className="flex-1 min-w-0">
          {/* Row 1: Patient name + member tag */}
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-[#1A1A1A] truncate">
              {rx.patientName}
            </p>
            <span
              className={`font-semibold px-1.5 py-[1px] rounded-full flex-shrink-0 ${ rx.isMember ? 'bg-[#EBF3FF] text-[#3A8DFF]' : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]' } text-[12px]`}
            >
              {rx.isMember ? 'Member' : 'Non-member'}
            </span>
          </div>

          {/* Row 2: Prescription ID + time */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-[#8F9AA1]">{rx.id.toUpperCase()}</span>
            <span className="text-[10px] text-[#C9D0DB]">·</span>
            <span className="text-xs text-[#8F9AA1]">{rx.prescribedAt}</span>
          </div>

          {/* Row 3: Medication count + chips */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {/* Medication count */}
            <span className="inline-flex items-center gap-1 text-xs text-[#8f9aa1]">
              <Pill className="w-3 h-3 text-[#C9D0DB] flex-shrink-0" />
              {itemLabel}
            </span>

            <span className="text-[10px] text-[#E5E8EC]">|</span>

            {/* Priority chip (non-routine only) */}
            {showPriority && rx.urgency !== 'routine' && (
              <span
                className={`inline-flex items-center gap-1 font-semibold px-1.5 py-[2px] rounded-full ${p.bg} ${p.text} text-[12px]`}
              >
                <span className={`w-1 h-1 rounded-full ${p.dot}`} />
                {p.label}
              </span>
            )}

            {/* Status chip */}
            {showStatus && <PHStatusChip status={rx.status} />}

            {/* Payment chip */}
            {pay && (
              <span
                className={`inline-flex items-center font-semibold px-1.5 py-[2px] rounded-full ${pay.bg} ${pay.text} text-[12px]`}
              >
                {pay.label}
              </span>
            )}

            {/* Request source chip */}
            {src && SrcIcon && (
              <span
                className={`inline-flex items-center gap-1 font-semibold px-1.5 py-[2px] rounded-full ${src.bg} ${src.text} text-[12px]`}
              >
                <SrcIcon className="w-2.5 h-2.5" />
                {src.label}
              </span>
            )}
            {/* Attachment indicator */}
            {hasAttachments && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-[#D97706]">
                <Paperclip className="w-2.5 h-2.5" />
                <span className="font-medium">{rx.rxAttachments!.length}</span>
              </span>
            )}
            {/* Coverage chip */}
            {rx.coverageStatus && (
              <span
                className={`inline-flex items-center gap-0.5 font-semibold px-1.5 py-[2px] rounded-full ${ rx.coverageStatus === 'Covered' ? 'bg-[#E9F8F0] text-[#38C172]' : rx.coverageStatus === 'Discount applied' ? 'bg-[#EBF3FF] text-[#3A8DFF]' : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]' } text-[12px]`}
              >
                {rx.coverageStatus === 'Covered'
                  ? <ShieldCheck className="w-2.5 h-2.5" />
                  : rx.coverageStatus === 'Discount applied'
                  ? <BadgePercent className="w-2.5 h-2.5" />
                  : <Wallet className="w-2.5 h-2.5" />}
                {rx.coverageStatus === 'Covered' ? 'Covered' : rx.coverageStatus === 'Discount applied' ? 'Discount' : 'OOP'}
              </span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
      </div>
    </button>
  );
}