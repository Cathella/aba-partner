/**
 * LT-07 Completed Result Detail — Read-only view of a completed lab order.
 *
 * Features:
 *   - Full result data, all timestamps (ordered → collected → resulted → verified)
 *   - Patient info, clinician info, lab notes
 *   - Amendment audit trail (if any)
 *   - "Amend Results" action for post-verification corrections
 *   - "Share / Print" button with print-optimised view
 *
 * Inner page: back arrow, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { LTStatusChip } from '../components/aba/LTStatusChip';
import { LTResultTableRow, LTResultTableHeader } from '../components/aba/LTResultTableRow';
import { LTWarningBanner } from '../components/aba/LTWarningBanner';
import { LTConfirmModal } from '../components/aba/LTConfirmModal';
import { showToast } from '../components/aba/Toast';
import { pushNotification } from '../data/notificationStore';
import { useLabTechStore, amendResults } from '../data/labTechStore';
import type { LTRequestSource } from '../data/labTechStore';
import {
  User,
  FlaskConical,
  Clock,
  Droplets,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  Printer,
  ArrowLeft,
  FileText,
  Beaker,
  PenLine,
  History,
  UserCircle,
  ExternalLink,
} from 'lucide-react';

/* ── request source config ── */
const requestSourceConfig: Record<LTRequestSource, { label: string; bg: string; text: string; Icon: React.ElementType }> = {
  internal: { label: 'Internal Doctor Order', bg: 'bg-[#EBF3FF]', text: 'text-[#3A8DFF]', Icon: Stethoscope },
  'self-requested': { label: 'Self-requested', bg: 'bg-[#F3F0FF]', text: 'text-[#7C3AED]', Icon: UserCircle },
  'external-referral': { label: 'External Referral', bg: 'bg-[#FFF3DC]', text: 'text-[#D97706]', Icon: ExternalLink },
};

export function LTCompletedDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById } = useLabTechStore();

  const order = getOrderById(orderId || '');

  /* ── amend state ── */
  const [showAmend, setShowAmend] = useState(false);
  const [amendReason, setAmendReason] = useState('');

  /* ── print state ── */
  const [showPrintView, setShowPrintView] = useState(false);

  if (!order) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Result Detail" showBack onBackClick={() => navigate(-1)} />
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

  /* timeline entries */
  const timeline: { label: string; time: string; icon: React.ReactNode; accent: string }[] = [];
  timeline.push({
    label: 'Ordered',
    time: order.orderedAt,
    icon: <Clock className="w-3.5 h-3.5" />,
    accent: 'text-[#3A8DFF]',
  });
  if (order.collectedAt) {
    timeline.push({
      label: 'Collected',
      time: order.collectedAt,
      icon: <Droplets className="w-3.5 h-3.5" />,
      accent: 'text-[#FFB649]',
    });
  }
  if (order.resultedAt) {
    timeline.push({
      label: 'Resulted',
      time: order.resultedAt,
      icon: <Beaker className="w-3.5 h-3.5" />,
      accent: 'text-[#8B5CF6]',
    });
  }
  if (order.verifiedAt) {
    timeline.push({
      label: 'Verified',
      time: order.verifiedAt,
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      accent: 'text-[#38C172]',
    });
  }

  const handleSharePrint = () => {
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowPrintView(false), 500);
    }, 300);
  };

  const handleAmend = () => {
    if (!amendReason.trim()) return;
    amendResults(order.id, order.results, amendReason.trim());
    setShowAmend(false);
    setAmendReason('');
    showToast('Results amended — audit trail updated', 'warning');
    pushNotification(
      'doctor',
      'Lab Technician',
      'Lab Results Amended',
      `Results for ${order.patientName} (${order.testName}) have been amended. Reason: ${amendReason.trim()}`,
      `/cl/queue`
    );
    setTimeout(() => {
      showToast('Doctor notified of amendment', 'success');
    }, 600);
  };

  /* ── Print-optimised overlay ── */
  if (showPrintView) {
    return (
      <div className="bg-white p-8 max-w-[600px] mx-auto print:p-4">
        <style>{`@media print { body * { visibility: hidden; } #lt-print-view, #lt-print-view * { visibility: visible; } #lt-print-view { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
        <div id="lt-print-view">
          <div className="text-center border-b border-gray-300 pb-4 mb-4">
            <h1 className="text-xl font-bold">ABA Partner — Lab Report</h1>
            <p className="text-sm text-gray-500 mt-1">
              {new Date().toLocaleDateString('en-UG', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div><strong>Patient:</strong> {order.patientName}</div>
            <div><strong>Age / Gender:</strong> {order.patientAge} yrs / {order.patientGender}</div>
            <div><strong>Test:</strong> {order.testName}</div>
            <div><strong>Category:</strong> {order.testCategory}</div>
            <div><strong>Ordered by:</strong> {order.orderedBy}</div>
            <div><strong>Method:</strong> {order.method || '—'}</div>
          </div>

          <table className="w-full border-collapse text-sm mb-4">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2">Parameter</th>
                <th className="text-left py-2">Result</th>
                <th className="text-left py-2">Unit</th>
                <th className="text-left py-2">Ref Range</th>
                <th className="text-left py-2">Flag</th>
              </tr>
            </thead>
            <tbody>
              {order.results.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-1.5">{row.parameter}</td>
                  <td className="py-1.5 font-semibold">{row.value}</td>
                  <td className="py-1.5 text-gray-500">{row.unit}</td>
                  <td className="py-1.5 text-gray-500">{row.referenceRange}</td>
                  <td className="py-1.5">
                    {row.flag === 'high' && <span className="text-red-600 font-bold">H</span>}
                    {row.flag === 'low' && <span className="text-blue-600 font-bold">L</span>}
                    {row.flag === 'critical' && <span className="text-red-700 font-bold">C!</span>}
                    {row.flag === 'normal' && <span className="text-green-600">N</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-4 gap-4 text-xs text-gray-500 border-t border-gray-300 pt-3 mt-4">
            <div>Ordered: {order.orderedAt}</div>
            <div>Collected: {order.collectedAt || '—'}</div>
            <div>Resulted: {order.resultedAt || '—'}</div>
            <div>Verified: {order.verifiedAt || '—'}</div>
          </div>

          <div className="text-xs text-gray-400 mt-4 text-center">
            Verified by {order.verifiedBy || 'Lab Tech'} &middot; ABA Partner Lab System
          </div>
        </div>

        <div className="mt-6 text-center print:hidden">
          <ABAButton variant="outline" onClick={() => setShowPrintView(false)}>
            Close Preview
          </ABAButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Result Detail" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-36">
        <div className="p-4 space-y-3">
          {/* ── Verified & Released banner ── */}
          {order.status === 'completed' && order.verifiedAt && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#E9F8F0] border border-[#38C172]/20">
              <ShieldCheck className="w-5 h-5 text-[#38C172] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#38C172]">
                  Verified & Published
                </p>
                <p className="text-[10px] text-[#4A4F55] mt-0.5">
                  {order.verifiedBy} &middot; {order.verifiedAt}
                </p>
              </div>
            </div>
          )}

          {/* flag banners (for reference) */}
          {hasCritical && (
            <LTWarningBanner
              variant="error"
              title="Critical values"
              message="This result contains critical values that were flagged to the doctor."
            />
          )}
          {hasAbnormal && !hasCritical && (
            <LTWarningBanner
              variant="warning"
              title="Abnormal values"
              message="Some parameters are outside the reference range."
            />
          )}

          {/* ── Patient + Order card ── */}
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

            {/* Clinician */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E8EC] text-xs text-[#8F9AA1]">
              <Stethoscope className="w-3.5 h-3.5 flex-shrink-0" />
              Requested by {order.orderedBy}
            </div>

            {/* Request Source */}
            {order.requestSource && (() => {
              const src = requestSourceConfig[order.requestSource];
              const SIcon = src.Icon;
              return (
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className={`inline-flex items-center gap-1 font-semibold px-2 py-[2px] rounded-full ${src.bg} ${src.text}`}>
                    <SIcon className="w-3 h-3" />
                    {src.label}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* ── Timeline card ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-3">
              Timeline
            </h3>
            <div className="relative">
              {timeline.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-3 relative">
                  {idx < timeline.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-[1.5px] bg-[#E5E8EC]" />
                  )}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      idx === timeline.length - 1
                        ? 'bg-[#E9F8F0]'
                        : 'bg-[#F7F9FC]'
                    } ${entry.accent}`}
                  >
                    {entry.icon}
                  </div>
                  <div className={`pb-4 ${idx === timeline.length - 1 ? 'pb-0' : ''}`}>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {entry.label}
                    </p>
                    <p className="text-xs text-[#8F9AA1]">{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Results table (read-only) ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC]">
              <h3 className="text-sm font-semibold text-[#1A1A1A]">Results</h3>
              {order.method && (
                <p className="text-[10px] text-[#8F9AA1] mt-0.5">
                  Method: {order.method}
                </p>
              )}
            </div>
            <LTResultTableHeader />
            {order.results.map((row, idx) => (
              <LTResultTableRow key={idx} row={row} />
            ))}
          </div>

          {/* ── Specimen info ── */}
          {(order.collectedSampleId || order.collectedSampleType) && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-2">
                Specimen
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {order.collectedSampleType && (
                  <div>
                    <p className="text-[10px] text-[#8F9AA1] uppercase">Type</p>
                    <p className="text-sm text-[#1A1A1A]">{order.collectedSampleType}</p>
                  </div>
                )}
                {order.specimen && (
                  <div>
                    <p className="text-[10px] text-[#8F9AA1] uppercase">Expected</p>
                    <p className="text-sm text-[#1A1A1A]">{order.specimen}</p>
                  </div>
                )}
                {order.collectedQuantity && (
                  <div>
                    <p className="text-[10px] text-[#8F9AA1] uppercase">Quantity</p>
                    <p className="text-sm text-[#1A1A1A]">{order.collectedQuantity}</p>
                  </div>
                )}
                {order.collectedSampleId && (
                  <div>
                    <p className="text-[10px] text-[#8F9AA1] uppercase">Sample ID</p>
                    <p className="text-sm text-[#1A1A1A] font-mono">{order.collectedSampleId}</p>
                  </div>
                )}
                {order.collectedBy && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-[#8F9AA1] uppercase">Collected by</p>
                    <p className="text-sm text-[#1A1A1A]">{order.collectedBy}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Amendment history ── */}
          {order.amendments.length > 0 && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-3.5 h-3.5 text-[#D97706]" />
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Amendment History ({order.amendments.length})
                </h3>
              </div>
              <div className="space-y-2.5">
                {order.amendments.map((entry, idx) => (
                  <div
                    key={idx}
                    className="bg-[#FFF3DC]/30 rounded-xl p-3 border border-[#D97706]/10"
                  >
                    <p className="text-xs font-medium text-[#D97706]">
                      Amendment #{idx + 1}
                    </p>
                    <p className="text-sm text-[#4A4F55] mt-1 leading-relaxed">
                      {entry.reason}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#8F9AA1]">
                      <Clock className="w-3 h-3" />
                      {entry.timestamp}
                      <span>&middot;</span>
                      {entry.amendedBy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Lab notes ── */}
          {order.labNotes && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-3.5 h-3.5 text-[#C9D0DB]" />
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Lab Notes
                </h3>
              </div>
              <p className="text-sm text-[#4A4F55] leading-relaxed">
                {order.labNotes}
              </p>
            </div>
          )}

          {/* ── Clinical notes ── */}
          {order.clinicalNotes && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-3.5 h-3.5 text-[#C9D0DB]" />
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Clinical Notes
                </h3>
              </div>
              <p className="text-sm text-[#4A4F55] leading-relaxed">
                {order.clinicalNotes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky bottom buttons ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4 space-y-2">
          <div className="flex gap-3">
            <ABAButton
              variant="outline"
              className="flex-1"
              onClick={handleSharePrint}
            >
              <Printer className="w-4 h-4" />
              Share / Print
            </ABAButton>
            <ABAButton
              variant="outline"
              className="flex-1"
              onClick={() => setShowAmend(true)}
            >
              <PenLine className="w-4 h-4" />
              Amend
            </ABAButton>
          </div>
          <ABAButton
            variant="primary"
            fullWidth
            onClick={() => navigate('/lt/completed', { replace: true })}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Completed List
          </ABAButton>
        </div>
      </div>

      {/* ── Amend Results Modal ── */}
      <LTConfirmModal
        isOpen={showAmend}
        onClose={() => {
          setShowAmend(false);
          setAmendReason('');
        }}
        icon={<PenLine className="w-7 h-7 text-[#D97706]" />}
        iconBg="bg-[#FFF3DC]"
        title="Amend Results"
        description="Post-verification amendment. Provide a reason — this will be recorded in the audit trail."
        confirmText="Submit Amendment"
        confirmVariant="primary"
        onConfirm={handleAmend}
      >
        <textarea
          value={amendReason}
          onChange={(e) => setAmendReason(e.target.value)}
          placeholder="e.g. Transcription error on Hemoglobin value — corrected from 12.4 to 13.4"
          rows={3}
          autoFocus
          className="w-full text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-3 focus:outline-none focus:ring-2 focus:ring-[#D97706]/30 focus:border-[#D97706] transition-all resize-none"
        />
      </LTConfirmModal>
    </div>
  );
}