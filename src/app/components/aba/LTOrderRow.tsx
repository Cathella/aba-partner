/**
 * LTOrderRow — Reusable list row for lab orders in the Lab Tech module.
 * Shows patient name + age, requested tests summary, order time,
 * priority chip, and status chip.
 */

import { ChevronRight, RotateCcw, Paperclip, Stethoscope, UserCircle, ExternalLink, ShieldCheck, Wallet, Clock } from 'lucide-react';
import { LTStatusChip } from './LTStatusChip';
import type { LTLabOrder, LTRequestSource } from '../../data/labTechStore';

/* ── request source chip config ── */
const sourceConfig: Record<LTRequestSource, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  internal: {
    label: 'Internal',
    bg: 'bg-[#EBF3FF]',
    text: 'text-[#3A8DFF]',
    Icon: Stethoscope,
  },
  'self-requested': {
    label: 'Self-requested',
    bg: 'bg-[#F3F0FF]',
    text: 'text-[#7C3AED]',
    Icon: UserCircle,
  },
  'external-referral': {
    label: 'External referral',
    bg: 'bg-[#FFF3DC]',
    text: 'text-[#D97706]',
    Icon: ExternalLink,
  },
};

interface LTOrderRowProps {
  order: LTLabOrder;
  onClick?: () => void;
  onQuickReject?: () => void;
  showStatus?: boolean;
  showPriority?: boolean;
  className?: string;
}

export function LTOrderRow({
  order,
  onClick,
  onQuickReject,
  showStatus = true,
  showPriority = true,
  className = '',
}: LTOrderRowProps) {
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

  const p = priorityConfig[order.urgency];

  /* request source chip */
  const source = order.requestSource ? sourceConfig[order.requestSource] : null;
  const hasAttachments =
    order.requestSource === 'external-referral' &&
    order.referralAttachments &&
    order.referralAttachments.length > 0;

  /* Left accent bar colour by priority */
  const accentColor =
    order.urgency === 'stat'
      ? 'bg-[#E44F4F]'
      : order.urgency === 'urgent'
      ? 'bg-[#FFB649]'
      : 'bg-[#E5E8EC]';

  /* Whether we have any secondary metadata to show */
  const hasSecondaryMeta = source || order.coverageStatus || order.displayVisitId || hasAttachments;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-stretch gap-0 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left ${className}`}
    >
      {/* Accent bar */}
      <div className={`w-[3px] flex-shrink-0 rounded-r-full my-2 ${accentColor}`} />

      {/* Content */}
      <div className="flex-1 flex gap-2.5 px-3.5 py-3">
        {/* Main info area */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* ── Row 1: Patient name + age  |  Time ── */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="text-sm font-medium text-[#1A1A1A] truncate">
                {order.patientName}
              </p>
              <span className="text-[11px] text-[#8F9AA1] flex-shrink-0">
                {order.patientAge} yrs
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Clock className="w-3 h-3 text-[#C9D0DB]" />
              <span className="text-[11px] text-[#8F9AA1]">
                {order.orderedAt}
              </span>
            </div>
          </div>

          {/* ── Row 2: Test name ── */}
          <p className="text-xs text-[#4A4F55] truncate">
            {order.testName}
          </p>

          {/* ── Row 3: Priority + Status (clinical chips) ── */}
          <div className="flex items-center gap-1.5">
            {showPriority && order.urgency !== 'routine' && (
              <span
                className={`inline-flex items-center gap-1 font-semibold px-1.5 py-[2px] rounded-full ${p.bg} ${p.text} text-[12px]`}
              >
                <span className={`w-1 h-1 rounded-full ${p.dot}`} />
                {p.label}
              </span>
            )}
            {showStatus && <LTStatusChip status={order.status} />}
          </div>

          {/* ── Row 4: Source / Coverage / Visit ID (secondary metadata) ── */}
          {hasSecondaryMeta && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Request source chip */}
              {source && (
                <span
                  className={`inline-flex items-center gap-1 font-semibold px-1.5 py-[2px] rounded-full ${source.bg} ${source.text} text-[12px]`}
                >
                  <source.Icon className="w-2.5 h-2.5" />
                  {source.label}
                </span>
              )}
              {/* Attachment indicator for external referrals */}
              {hasAttachments && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-[#D97706]">
                  <Paperclip className="w-2.5 h-2.5" />
                  <span className="font-medium">{order.referralAttachments!.length}</span>
                </span>
              )}
              {/* Coverage chip */}
              {order.coverageStatus && (
                <span
                  className={`inline-flex items-center gap-0.5 font-semibold px-1.5 py-[2px] rounded-full ${ order.coverageStatus === 'Covered' || order.coverageStatus === 'Discount applied' ? 'bg-[#E9F8F0] text-[#38C172]' : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]' } text-[12px]`}
                >
                  {order.coverageStatus === 'Covered' || order.coverageStatus === 'Discount applied'
                    ? <ShieldCheck className="w-2.5 h-2.5" />
                    : <Wallet className="w-2.5 h-2.5" />}
                  {order.coverageStatus === 'Covered' ? 'Covered' : order.coverageStatus === 'Discount applied' ? 'Discount' : 'OOP'}
                </span>
              )}
              {/* Visit ID label */}
              {order.displayVisitId && (
                <span className="text-[10px] text-[#C9D0DB] font-mono">
                  {order.displayVisitId}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right actions area */}
        <div className="flex flex-col items-center justify-center gap-2 flex-shrink-0">
          {/* Quick reject shortcut for re-collect orders */}
          {onQuickReject && order.status === 're-collect' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickReject();
              }}
              className="px-2 py-1.5 rounded-lg bg-[#FDECEC] text-[10px] font-semibold text-[#E44F4F] flex items-center gap-1 hover:bg-[#FBD9D9] active:bg-[#F9C5C5] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reject
            </button>
          )}

          {/* Chevron */}
          <ChevronRight className="w-4 h-4 text-[#C9D0DB]" />
        </div>
      </div>
    </button>
  );
}