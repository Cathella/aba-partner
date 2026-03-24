/**
 * LT-04 Result Entry — Lab tech enters / edits result values for an order.
 *
 * Layout:
 *   Top bar → "Result Entry" + back arrow
 *   Patient + order summary header
 *   Result table: Test | Result input | Unit | Ref Range | Flag
 *   Method / Instrument + Lab Notes
 *   Warnings for abnormal and critical values
 *   Buttons: "Save Draft" (secondary) | "Review & Publish" (primary)
 *
 * Prototype:
 *   Save Draft → toast "Draft saved"
 *   Review & Publish → submits results → navigates to LT-05 Review & Release
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
import {
  useLabTechStore,
  savePartialResults,
  submitResults,
} from '../data/labTechStore';
import type { LTResultRow } from '../data/labTechStore';
import {
  User,
  FlaskConical,
  Clock,
  Stethoscope,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  Send,
  AlertTriangle,
  CheckCircle2,
  Minus,
  RotateCcw,
} from 'lucide-react';

/* ──────────── helpers ──────────── */

/** Default blank result templates by test category */
const defaultTemplates: Record<string, LTResultRow[]> = {
  Hematology: [
    { parameter: 'WBC', value: '', unit: '×10³/µL', referenceRange: '4.5–11.0' },
    { parameter: 'RBC', value: '', unit: '×10⁶/µL', referenceRange: '4.0–5.5' },
    { parameter: 'Hemoglobin', value: '', unit: 'g/dL', referenceRange: '11.5–15.5' },
    { parameter: 'Hematocrit', value: '', unit: '%', referenceRange: '35–45' },
    { parameter: 'Platelets', value: '', unit: '×10³/µL', referenceRange: '150–400' },
  ],
  'Clinical Chemistry': [
    { parameter: 'Result', value: '', unit: '', referenceRange: '' },
  ],
  Parasitology: [
    { parameter: 'Ova', value: '', unit: '', referenceRange: 'Not Seen' },
    { parameter: 'Cysts', value: '', unit: '', referenceRange: 'Not Seen' },
    { parameter: 'Trophozoites', value: '', unit: '', referenceRange: 'Not Seen' },
    { parameter: 'Mucus', value: '', unit: '', referenceRange: 'Negative' },
    { parameter: 'RBCs', value: '', unit: '', referenceRange: 'Not Seen' },
  ],
  Microbiology: [
    { parameter: 'Result', value: '', unit: '', referenceRange: 'Negative' },
  ],
};

function autoFlag(value: string, refRange: string): LTResultRow['flag'] {
  if (!value) return 'normal';
  // qualitative tests
  if (refRange === 'Negative') {
    return value.toLowerCase() !== 'negative' ? 'high' : 'normal';
  }
  if (refRange === 'Not Seen') {
    return value.toLowerCase() !== 'not seen' ? 'high' : 'normal';
  }
  // quantitative range check
  const match = refRange.match(/([\d.]+)\s*[–-]\s*([\d.]+)/);
  if (!match) return 'normal';
  const lo = parseFloat(match[1]);
  const hi = parseFloat(match[2]);
  const v = parseFloat(value);
  if (isNaN(v)) return 'normal';
  if (v < lo) return 'low';
  if (v > hi) return 'high';
  return 'normal';
}

/* ── flag rendering helpers ── */

const flagMeta: Record<
  NonNullable<LTResultRow['flag']>,
  { label: string; abbr: string; bg: string; text: string; icon: React.ReactNode }
> = {
  normal: {
    label: 'Normal',
    abbr: 'N',
    bg: 'bg-[#E9F8F0]',
    text: 'text-[#38C172]',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  high: {
    label: 'High',
    abbr: 'H',
    bg: 'bg-[#FDECEC]',
    text: 'text-[#E44F4F]',
    icon: <ChevronUp className="w-3 h-3" />,
  },
  low: {
    label: 'Low',
    abbr: 'L',
    bg: 'bg-[#EBF3FF]',
    text: 'text-[#3A8DFF]',
    icon: <ChevronDown className="w-3 h-3" />,
  },
  critical: {
    label: 'Critical',
    abbr: 'C',
    bg: 'bg-[#E44F4F]',
    text: 'text-white',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
};

/* ──────────── component ──────────── */

export function LTResultEntry() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById } = useLabTechStore();

  const order = getOrderById(orderId || '');

  // Initialise from existing results or category template
  const initRows = (): LTResultRow[] => {
    if (order && order.results.length > 0)
      return order.results.map((r) => ({ ...r }));
    if (order) {
      const tpl = defaultTemplates[order.testCategory];
      if (tpl) return tpl.map((r) => ({ ...r }));
    }
    return [{ parameter: '', value: '', unit: '', referenceRange: '' }];
  };

  const [rows, setRows] = useState<LTResultRow[]>(initRows);
  const [method, setMethod] = useState(order?.method || '');
  const [notes, setNotes] = useState(order?.labNotes || '');

  if (!order) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Result Entry" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Order not found</p>
        </div>
      </div>
    );
  }

  /* ── row mutations ── */

  const updateRow = (idx: number, field: keyof LTResultRow, val: string) => {
    setRows((prev) => {
      const next = prev.map((r) => ({ ...r }));
      (next[idx] as any)[field] = val;
      if (field === 'value') {
        next[idx].flag = autoFlag(val, next[idx].referenceRange);
      }
      return next;
    });
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { parameter: '', value: '', unit: '', referenceRange: '', flag: 'normal' },
    ]);
  };

  const removeRow = (idx: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ── derived flags ── */

  const flaggedRows = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        flag: r.flag || autoFlag(r.value, r.referenceRange),
      })),
    [rows]
  );

  const hasCritical = flaggedRows.some((r) => r.flag === 'critical');
  const hasAbnormal = flaggedRows.some(
    (r) => r.flag === 'high' || r.flag === 'low'
  );
  const hasEmptyValues = rows.some(
    (r) => r.parameter.trim() && !r.value.trim()
  );

  /* ── actions ── */

  const handleSaveDraft = () => {
    savePartialResults(order.id, flaggedRows, method, notes);
    showToast('Draft saved', 'success');
  };

  const handleReviewPublish = () => {
    // Submit results (status → results-ready) and navigate to LT-05 Review & Release
    submitResults(order.id, flaggedRows, method, notes);
    showToast('Results submitted — review before publishing', 'success');
    navigate(`/lt/review/${order.id}`, { replace: true });
  };

  /* ── priority chip ── */
  const prioConfig: Record<string, { label: string; bg: string; text: string }> = {
    stat: { label: 'STAT', bg: 'bg-[#FDECEC]', text: 'text-[#E44F4F]' },
    urgent: { label: 'Urgent', bg: 'bg-[#FFF3DC]', text: 'text-[#D97706]' },
    routine: { label: 'Routine', bg: 'bg-[#F7F9FC]', text: 'text-[#8F9AA1]' },
  };
  const prio = prioConfig[order.urgency];

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Result Entry" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-4 space-y-3">
          {/* ── Warning banners ── */}
          {hasCritical && (
            <LTWarningBanner
              variant="error"
              title="Critical value detected"
              message="One or more results contain critical values. Confirm accuracy before publishing."
            />
          )}

          {hasAbnormal && !hasCritical && (
            <LTWarningBanner
              variant="warning"
              title="Some results are out of range"
              message="Review flagged values before proceeding."
            />
          )}

          {/* ── Patient + Order summary header ── */}
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

            {/* Divider */}
            <div className="border-t border-[#E5E8EC] my-3" />

            {/* Order info row */}
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
              {order.urgency !== 'routine' && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-[2px] rounded-full ${prio.bg} ${prio.text}`}
                >
                  {prio.label}
                </span>
              )}
            </div>

            {/* Meta strip */}
            <div className="flex items-center gap-4 mt-3 text-[10px] text-[#8F9AA1]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {order.orderedAt}
              </span>
              <span className="flex items-center gap-1">
                <Stethoscope className="w-3 h-3" />
                {order.orderedBy}
              </span>
              {order.collectedAt && (
                <span className="flex items-center gap-1 text-[#38C172]">
                  <CheckCircle2 className="w-3 h-3" />
                  Collected
                </span>
              )}
            </div>
          </div>

          {/* ── Result Entry Table ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            {/* Table header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E5E8EC] bg-[#F7F9FC]">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Results
              </h3>
              <button
                onClick={addRow}
                className="text-[11px] font-medium text-[#3A8DFF] flex items-center gap-0.5 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_80px_48px_72px_36px] gap-1 px-3 py-2 border-b border-[#E5E8EC] bg-[#F7F9FC]/60">
              <span className="text-[10px] font-semibold text-[#8F9AA1] uppercase">
                Test
              </span>
              <span className="text-[10px] font-semibold text-[#8F9AA1] uppercase">
                Result
              </span>
              <span className="text-[10px] font-semibold text-[#8F9AA1] uppercase">
                Unit
              </span>
              <span className="text-[10px] font-semibold text-[#8F9AA1] uppercase">
                Ref
              </span>
              <span className="text-[10px] font-semibold text-[#8F9AA1] uppercase text-center">
                Flag
              </span>
            </div>

            {/* Data rows */}
            {rows.map((row, idx) => {
              const flag = row.flag || 'normal';
              const fm = flagMeta[flag];
              const isAbnormalRow =
                flag === 'high' || flag === 'low' || flag === 'critical';

              return (
                <div
                  key={idx}
                  className={`grid grid-cols-[1fr_80px_48px_72px_36px] gap-1 px-3 py-2 border-b border-[#E5E8EC] last:border-b-0 items-center ${
                    isAbnormalRow ? 'bg-[#FDECEC]/10' : ''
                  }`}
                >
                  {/* Test / Parameter */}
                  <div className="flex items-center gap-1 min-w-0">
                    <input
                      type="text"
                      value={row.parameter}
                      onChange={(e) =>
                        updateRow(idx, 'parameter', e.target.value)
                      }
                      placeholder="Test"
                      className="w-full text-xs font-medium text-[#1A1A1A] bg-transparent placeholder:text-[#C9D0DB] focus:outline-none truncate"
                    />
                    {rows.length > 1 && (
                      <button
                        onClick={() => removeRow(idx)}
                        className="p-0.5 text-[#C9D0DB] hover:text-[#E44F4F] transition-colors flex-shrink-0 opacity-0 hover:opacity-100 focus:opacity-100"
                        tabIndex={-1}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Result input */}
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => updateRow(idx, 'value', e.target.value)}
                    placeholder="—"
                    tabIndex={idx + 1}
                    className={`h-8 px-2 rounded-lg border text-xs font-semibold placeholder:text-[#C9D0DB] focus:outline-none focus:ring-1 focus:ring-[#32C28A]/40 focus:border-[#32C28A] transition-all ${
                      isAbnormalRow
                        ? 'border-[#E44F4F]/30 bg-[#FDECEC]/20'
                        : 'border-[#E5E8EC] bg-[#F7F9FC]'
                    } ${
                      flag === 'high' || flag === 'critical'
                        ? 'text-[#E44F4F]'
                        : flag === 'low'
                        ? 'text-[#3A8DFF]'
                        : 'text-[#1A1A1A]'
                    }`}
                  />

                  {/* Unit */}
                  <span className="text-[10px] text-[#8F9AA1] truncate">
                    {row.unit}
                  </span>

                  {/* Reference range */}
                  <span className="text-[10px] text-[#8F9AA1] truncate">
                    {row.referenceRange || '—'}
                  </span>

                  {/* Flag chip */}
                  <div className="flex justify-center">
                    {row.value.trim() ? (
                      <span
                        className={`inline-flex items-center justify-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded-full ${fm.bg} ${fm.text}`}
                        title={fm.label}
                      >
                        {fm.icon}
                        {fm.abbr}
                      </span>
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-[#E5E8EC]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Quick-entry presets for qualitative results ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Quick Entry
              </h3>
              <button
                onClick={() => {
                  const tpl = defaultTemplates[order.testCategory];
                  if (tpl) {
                    setRows(tpl.map((r) => ({ ...r })));
                    showToast('Reset to default template', 'success');
                  } else {
                    showToast('No template available for this category', 'warning');
                  }
                }}
                className="text-[11px] font-medium text-[#8F9AA1] flex items-center gap-0.5 hover:text-[#4A4F55]"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Template
              </button>
            </div>
            <p className="text-[10px] text-[#8F9AA1] mb-2">
              Tap to fill the selected result field with a common qualitative value
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Positive', 'Negative', 'Trace', 'Not Seen', 'Reactive', 'Non-Reactive'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    // Fill the first empty result value, or the last row
                    const emptyIdx = rows.findIndex((r) => r.parameter.trim() && !r.value.trim());
                    const idx = emptyIdx >= 0 ? emptyIdx : rows.length - 1;
                    updateRow(idx, 'value', preset);
                    showToast(`Set "${rows[idx]?.parameter || 'Result'}" → ${preset}`, 'success');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] text-xs font-medium text-[#4A4F55] hover:bg-[#E5E8EC] active:bg-[#C9D0DB]/50 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* ── Method / Instrument ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <label className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide block mb-2">
              Method / Instrument
            </label>
            <input
              type="text"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              placeholder="e.g. Automated Hematology Analyzer"
              className="w-full h-10 px-3 rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all"
            />
          </div>

          {/* ── Lab Notes ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <label className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide block mb-2">
              Lab Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional observations…"
              rows={3}
              className="w-full text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-3 focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* ── Sticky bottom buttons ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4 flex gap-3">
          <ABAButton
            variant="outline"
            className="flex-1"
            onClick={handleSaveDraft}
          >
            <Save className="w-4 h-4" />
            Save Draft
          </ABAButton>
          <ABAButton
            variant="primary"
            className="flex-1"
            onClick={handleReviewPublish}
            disabled={hasEmptyValues}
          >
            <Send className="w-4 h-4" />
            Review & Publish
          </ABAButton>
        </div>
      </div>
    </div>
  );
}