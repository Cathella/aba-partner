/**
 * LT-05 Review & Publish — Lab tech reviews submitted results (read-only)
 * and publishes them after confirming accuracy.
 *
 * Layout:
 *   Top bar → "Review & Publish" + back arrow
 *   Warning banners (critical / abnormal)
 *   Patient + order summary card
 *   Read-only results table with flag indicators
 *   Lab notes / Clinical notes
 *   Confirmation checkbox: "I confirm results are accurate"
 *   CTAs: "Back to Edit" (secondary) | "Publish Results" (primary)
 *
 * On publish:
 *   1. verifyAndRelease() → order moves to Completed
 *   2. Toast "Results published"
 *   3. pushNotification → Doctor notified
 *   4. Navigate to LT-07 Completed Result Detail
 *
 * Inner page: back arrow, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { LTStatusChip } from '../components/aba/LTStatusChip';
import { LTWarningBanner } from '../components/aba/LTWarningBanner';
import { LTResultTableRow, LTResultTableHeader } from '../components/aba/LTResultTableRow';
import { showToast } from '../components/aba/Toast';
import { pushNotification } from '../data/notificationStore';
import { useLabTechStore, verifyAndRelease } from '../data/labTechStore';
import {
  User,
  FlaskConical,
  Clock,
  Droplets,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  PenLine,
  Send,
} from 'lucide-react';

export function LTReviewRelease() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById } = useLabTechStore();

  const order = getOrderById(orderId || '');
  const [confirmed, setConfirmed] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  if (!order) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Review & Publish" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Order not found</p>
        </div>
      </div>
    );
  }

  const hasCritical = order.results.some((r) => r.flag === 'critical');
  const hasAbnormal = order.results.some(
    (r) => r.flag === 'high' || r.flag === 'low'
  );

  /* count normal / abnormal / critical */
  const normalCount = order.results.filter(
    (r) => !r.flag || r.flag === 'normal'
  ).length;
  const abnormalCount = order.results.filter(
    (r) => r.flag === 'high' || r.flag === 'low'
  ).length;
  const criticalCount = order.results.filter(
    (r) => r.flag === 'critical'
  ).length;

  const handlePublish = () => {
    setIsPublishing(true);

    setTimeout(() => {
      verifyAndRelease(order.id);
      showToast('Results published', 'success');

      // Push cross-role notification to the ordering doctor
      pushNotification(
        'doctor',
        'Lab Technician',
        'Lab Results Ready',
        `Results for ${order.patientName} (${order.testName}) have been published.`,
        `/cl/queue`
      );
      setTimeout(() => {
        showToast('Doctor notified — results available', 'success');
      }, 600);

      navigate(`/lt/completed-detail/${order.id}`, { replace: true });
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Review & Publish" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-36">
        <div className="p-4 space-y-3">
          {/* ── Warning banners ── */}
          {hasCritical && (
            <LTWarningBanner
              variant="error"
              title="Critical values present"
              message="This result contains critical values. Double-check before publishing."
            />
          )}

          {hasAbnormal && !hasCritical && (
            <LTWarningBanner
              variant="warning"
              title="Abnormal values detected"
              message="Some parameters are outside the reference range."
            />
          )}

          {/* ── Patient + Order summary ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            {/* Patient */}
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

            {/* Order */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
                <FlaskConical className="w-4 h-4 text-[#3A8DFF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A] truncate">
                  {order.testName}
                </p>
                <p className="text-xs text-[#8F9AA1]">{order.testCategory}</p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[10px] text-[#8F9AA1]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Ordered {order.orderedAt}
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
              {order.resultedAt && (
                <span className="flex items-center gap-1 text-[#38C172]">
                  <CheckCircle2 className="w-3 h-3" />
                  Resulted {order.resultedAt}
                </span>
              )}
            </div>
          </div>

          {/* ── Read-only Results table ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#1A1A1A]">
                  Results Summary
                </h3>
                {order.method && (
                  <p className="text-[10px] text-[#8F9AA1] mt-0.5">
                    Method: {order.method}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {normalCount > 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-[2px] rounded-full bg-[#E9F8F0] text-[#38C172]">
                    {normalCount} N
                  </span>
                )}
                {abnormalCount > 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-[2px] rounded-full bg-[#FFF3DC] text-[#D97706]">
                    {abnormalCount} Abn
                  </span>
                )}
                {criticalCount > 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-[2px] rounded-full bg-[#E44F4F] text-white">
                    {criticalCount} Crit
                  </span>
                )}
              </div>
            </div>
            <LTResultTableHeader />
            {order.results.map((row, idx) => (
              <LTResultTableRow key={idx} row={row} />
            ))}
          </div>

          {/* ── Lab notes ── */}
          {order.labNotes && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-2">
                Lab Notes
              </h3>
              <p className="text-sm text-[#4A4F55] leading-relaxed">
                {order.labNotes}
              </p>
            </div>
          )}

          {/* ── Clinical notes ── */}
          {order.clinicalNotes && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-2">
                Clinical Notes (from Doctor)
              </h3>
              <p className="text-sm text-[#4A4F55] leading-relaxed">
                {order.clinicalNotes}
              </p>
            </div>
          )}

          {/* ── Confirmation checkbox ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                    confirmed
                      ? 'bg-[#32C28A] border-[#32C28A]'
                      : 'bg-[#FFFFFF] border-[#C9D0DB] group-hover:border-[#8F9AA1]'
                  }`}
                >
                  {confirmed && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  I confirm results are accurate
                </p>
                <p className="text-xs text-[#8F9AA1] mt-0.5 leading-relaxed">
                  I have reviewed all parameter values, reference ranges, and flags.
                  These results are ready to be published to the ordering doctor.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* ── Sticky bottom buttons ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4 space-y-2">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handlePublish}
            disabled={!confirmed}
            isLoading={isPublishing}
          >
            <Send className="w-5 h-5" />
            Publish Results
          </ABAButton>
          <ABAButton
            variant="outline"
            fullWidth
            onClick={() => navigate(`/lt/result-entry/${order.id}`)}
          >
            <PenLine className="w-4 h-4" />
            Back to Edit
          </ABAButton>
        </div>
      </div>
    </div>
  );
}