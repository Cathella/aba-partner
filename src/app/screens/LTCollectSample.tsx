/**
 * LT-03 Collect Sample — Sample collection form.
 *
 * Fields:
 *   Sample type dropdown (Blood / Urine / Stool / etc.)
 *   Quantity
 *   Sample ID / Barcode (auto-generated placeholder)
 *   Notes (optional)
 *
 * CTA: "Mark as Collected"
 * On success → toast + status changes to "In Progress" + navigate to LT-04 Result Entry.
 *
 * Inner page: back arrow, no bottom nav.
 */
import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { LTStatusChip } from '../components/aba/LTStatusChip';
import { LTWarningBanner } from '../components/aba/LTWarningBanner';
import { showToast } from '../components/aba/Toast';
import { useLabTechStore, collectSample } from '../data/labTechStore';
import {
  User,
  FlaskConical,
  Droplets,
  Hash,
  StickyNote,
  ChevronDown,
  CheckCircle2,
  Beaker,
  Barcode,
  ScanLine,
} from 'lucide-react';

/* ── sample type options ── */
const sampleTypes = [
  'Venous Blood',
  'Capillary Blood',
  'Mid-stream Urine',
  'Stool Sample',
  'Swab',
  'Sputum',
  'CSF',
  'Other',
];

/* ── auto-generated barcode-style sample ID ── */
function generateSampleId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `SMP-${date}-${seq}`;
}

export function LTCollectSample() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById } = useLabTechStore();

  const order = getOrderById(orderId || '');

  /* ── form state ── */
  const autoId = useMemo(() => generateSampleId(), []);
  const [sampleType, setSampleType] = useState(order?.specimen || sampleTypes[0]);
  const [quantity, setQuantity] = useState('');
  const [sampleId, setSampleId] = useState(autoId);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!order) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Collect Sample" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Order not found</p>
        </div>
      </div>
    );
  }

  const handleCollect = () => {
    setIsSubmitting(true);

    // Short delay to simulate processing
    setTimeout(() => {
      collectSample(order.id, {
        sampleType,
        quantity: quantity.trim() || undefined,
        sampleId: sampleId.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      showToast('Sample collected — order is now In Progress', 'success');

      // Navigate to LT-04 Result Entry
      navigate(`/lt/result-entry/${order.id}`, { replace: true });
    }, 400);
  };

  const canSubmit = sampleType.trim().length > 0;

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Collect Sample" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-4 space-y-3">
          {/* ── STAT banner ── */}
          {order.urgency === 'stat' && (
            <LTWarningBanner
              variant="error"
              title="STAT Order"
              message="Prioritise collection. Results needed urgently."
            />
          )}

          {/* ── Re-collect banner ── */}
          {order.status === 're-collect' && order.rejectReason && (
            <LTWarningBanner
              variant="warning"
              title="Re-collection"
              message={order.rejectReason}
            />
          )}

          {/* ── Patient + Order summary strip ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-[#3A8DFF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                  {order.patientName}
                </p>
                <p className="text-xs text-[#8F9AA1]">
                  {order.patientAge} yrs &middot; {order.patientGender}
                </p>
              </div>
              <LTStatusChip status={order.status} />
            </div>
            <div className="mt-3 pt-3 border-t border-[#E5E8EC] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
                <FlaskConical className="w-4 h-4 text-[#3A8DFF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#1A1A1A] truncate">{order.testName}</p>
                <p className="text-xs text-[#8F9AA1]">{order.testCategory}</p>
              </div>
            </div>
          </div>

          {/* ── Form Card ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4 space-y-4">
            <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
              Collection Details
            </h3>

            {/* Sample type */}
            <div>
              <label className="text-xs font-medium text-[#4A4F55] mb-1.5 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-[#C9D0DB]" />
                Sample Type
              </label>
              <div className="relative">
                <select
                  value={sampleType}
                  onChange={(e) => setSampleType(e.target.value)}
                  className="w-full h-11 px-3 pr-10 rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] appearance-none focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all cursor-pointer"
                >
                  {sampleTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F9AA1] pointer-events-none" />
              </div>
              {/* Hint: expected specimen */}
              {order.specimen !== 'N/A' && order.specimen !== sampleType && (
                <p className="text-[10px] text-[#FFB649] mt-1">
                  Order expects: {order.specimen}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="text-xs font-medium text-[#4A4F55] mb-1.5 flex items-center gap-1.5">
                <Beaker className="w-3.5 h-3.5 text-[#C9D0DB]" />
                Quantity
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 5 mL, 2 tubes"
                className="w-full h-11 px-3 rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all"
              />
            </div>

            {/* Sample ID / Barcode */}
            <div>
              <label className="text-xs font-medium text-[#4A4F55] mb-1.5 flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-[#C9D0DB]" />
                Sample ID / Barcode
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={sampleId}
                  onChange={(e) => setSampleId(e.target.value)}
                  placeholder="Auto-generated"
                  className="w-full h-11 px-3 pr-20 rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] font-mono placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-[#32C28A] bg-[#E9F8F0] px-1.5 py-0.5 rounded-full">
                  Auto
                </span>
              </div>

              {/* Scan Barcode hardware stub */}
              <button
                onClick={() => {
                  showToast('Barcode scanner — hardware not connected (stub)', 'warning');
                }}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[#3A8DFF]/40 bg-[#EBF3FF]/30 text-sm font-medium text-[#3A8DFF] hover:bg-[#EBF3FF]/60 active:bg-[#EBF3FF] transition-colors"
              >
                <ScanLine className="w-4 h-4" />
                Scan Barcode
              </button>

              {/* Visual barcode placeholder */}
              <div className="mt-2 flex items-center gap-[2px] justify-center opacity-40">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#1A1A1A] rounded-[0.5px]"
                    style={{
                      width: i % 3 === 0 ? 2 : 1,
                      height: 20,
                    }}
                  />
                ))}
              </div>
              <p className="text-center text-[10px] text-[#C9D0DB] mt-0.5 font-mono">
                {sampleId}
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-medium text-[#4A4F55] mb-1.5 flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-[#C9D0DB]" />
                Notes
                <span className="text-[#C9D0DB]">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any observations during collection…"
                rows={3}
                className="w-full text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-3 focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleCollect}
            disabled={!canSubmit}
            isLoading={isSubmitting}
          >
            <CheckCircle2 className="w-5 h-5" />
            Mark as Collected
          </ABAButton>
        </div>
      </div>
    </div>
  );
}