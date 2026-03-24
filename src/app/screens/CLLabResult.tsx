/**
 * CL-13 Lab Result Detail — Test results table (sample data),
 * Add interpretation note (inline), CTA: Return to Consultation.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import {
  useClinicianStore,
  addInterpretationNote,
  markResultViewed,
} from '../data/clinicianStore';
import type { LabResultRow } from '../data/clinicianStore';
import {
  FlaskConical,
  Clock,
  Droplets,
  FileText,
  CheckCircle2,
  Stethoscope,
  ChevronUp,
  ChevronDown,
  Minus,
  PenLine,
  Save,
  Printer,
} from 'lucide-react';

export function CLLabResult() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { getLabOrderById } = useClinicianStore();

  const lab = getLabOrderById(orderId || '');

  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [noteText, setNoteText] = useState(lab?.interpretationNote || '');

  useEffect(() => {
    if (lab) {
      markResultViewed(lab.id);
    }
  }, [lab]);

  if (!lab) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Lab Result" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-aba-neutral-600">Lab order not found</p>
        </div>
      </div>
    );
  }

  const hasResults = lab.status === 'completed' && lab.resultData;

  const handleSaveNote = () => {
    addInterpretationNote(lab.id, noteText.trim());
    setShowNoteEditor(false);
    showToast('Interpretation note saved', 'success');
  };

  const flagIcon = (flag?: LabResultRow['flag']) => {
    switch (flag) {
      case 'high':
        return <ChevronUp className="w-3.5 h-3.5 text-aba-error-main" />;
      case 'low':
        return <ChevronDown className="w-3.5 h-3.5 text-aba-secondary-main" />;
      case 'critical':
        return <ChevronUp className="w-3.5 h-3.5 text-aba-error-main" />;
      default:
        return <Minus className="w-3.5 h-3.5 text-aba-neutral-400" />;
    }
  };

  const flagColor = (flag?: LabResultRow['flag']) => {
    switch (flag) {
      case 'high':
        return 'text-aba-error-main';
      case 'low':
        return 'text-aba-secondary-main';
      case 'critical':
        return 'text-aba-error-main font-bold';
      default:
        return 'text-aba-neutral-900';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Lab Result" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-4">
          {/* ── Header card ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#FFFBEB] flex items-center justify-center flex-shrink-0">
                <FlaskConical className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-aba-neutral-900 truncate">{lab.testName}</h2>
                <p className="text-sm text-aba-neutral-600 mt-0.5">{lab.patientName}</p>
              </div>
              {/* Result ready chip */}
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-aba-success-50 text-aba-success-main border border-aba-success-main/15 flex-shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                Result Ready
              </span>
            </div>

            {/* Meta row */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-aba-neutral-200">
              <div className="flex items-center gap-2 text-xs text-aba-neutral-600">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                Ordered {lab.orderedAt}
              </div>
              {lab.resultData?.collectedAt && (
                <div className="flex items-center gap-2 text-xs text-aba-neutral-600">
                  <Droplets className="w-3.5 h-3.5 flex-shrink-0" />
                  Collected {lab.resultData.collectedAt}
                </div>
              )}
              {lab.resultData?.resultedAt && (
                <div className="flex items-center gap-2 text-xs text-aba-neutral-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-aba-success-main flex-shrink-0" />
                  Resulted {lab.resultData.resultedAt}
                </div>
              )}
              {lab.resultData?.specimen && (
                <div className="flex items-center gap-2 text-xs text-aba-neutral-600">
                  <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                  {lab.resultData.specimen}
                </div>
              )}
            </div>
          </div>

          {/* ── Results Table ── */}
          {hasResults && lab.resultData && (
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-aba-neutral-200">
                <h3 className="text-sm font-semibold text-aba-neutral-900">Test Results</h3>
                {lab.resultData.method && (
                  <p className="text-[10px] text-aba-neutral-500 mt-0.5">Method: {lab.resultData.method}</p>
                )}
              </div>

              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 px-4 py-2 bg-aba-neutral-100 border-b border-aba-neutral-200">
                <span className="text-[10px] font-semibold text-aba-neutral-500 uppercase tracking-wide">Parameter</span>
                <span className="text-[10px] font-semibold text-aba-neutral-500 uppercase tracking-wide text-right min-w-[56px]">Value</span>
                <span className="text-[10px] font-semibold text-aba-neutral-500 uppercase tracking-wide text-right min-w-[52px]">Unit</span>
                <span className="text-[10px] font-semibold text-aba-neutral-500 uppercase tracking-wide text-right min-w-[72px]">Ref Range</span>
              </div>

              {/* Table rows */}
              {lab.resultData.rows.map((row, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-[1fr_auto_auto_auto] gap-x-2 items-center px-4 py-2.5 border-b border-aba-neutral-200 last:border-b-0 ${
                    row.flag === 'high' || row.flag === 'low' || row.flag === 'critical'
                      ? 'bg-aba-error-50/30'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {flagIcon(row.flag)}
                    <span className="text-sm text-aba-neutral-900">{row.parameter}</span>
                  </div>
                  <span className={`text-sm font-semibold text-right min-w-[56px] ${flagColor(row.flag)}`}>
                    {row.value}
                  </span>
                  <span className="text-xs text-aba-neutral-500 text-right min-w-[52px]">{row.unit}</span>
                  <span className="text-xs text-aba-neutral-500 text-right min-w-[72px]">{row.referenceRange}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── No result data fallback ── */}
          {!hasResults && (
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-6 text-center">
              <p className="text-sm text-aba-neutral-600">
                {lab.status === 'completed'
                  ? 'Detailed results are not available yet.'
                  : `Lab status: ${lab.status === 'pending' ? 'Pending Collection' : 'In Progress'}`
                }
              </p>
              {lab.result && (
                <p className="text-sm font-medium text-aba-neutral-900 mt-2">{lab.result}</p>
              )}
            </div>
          )}

          {/* ── Interpretation Note ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-aba-neutral-900">Doctor Interpretation</h4>
              {lab.interpretationNote && !showNoteEditor && (
                <button
                  onClick={() => {
                    setNoteText(lab.interpretationNote || '');
                    setShowNoteEditor(true);
                  }}
                  className="text-xs font-medium text-aba-secondary-main flex items-center gap-1"
                >
                  <PenLine className="w-3 h-3" />
                  Edit
                </button>
              )}
            </div>

            {showNoteEditor ? (
              <div className="space-y-3">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add your interpretation of these results…"
                  rows={4}
                  autoFocus
                  className="w-full text-sm text-aba-neutral-900 placeholder:text-aba-neutral-500 bg-aba-neutral-100 rounded-lg border border-aba-neutral-200 p-3 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main/30 focus:border-aba-secondary-main transition-all resize-none"
                />
                <div className="flex gap-2">
                  <ABAButton
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowNoteEditor(false)}
                  >
                    Cancel
                  </ABAButton>
                  <ABAButton
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={handleSaveNote}
                    disabled={!noteText.trim()}
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Note
                  </ABAButton>
                </div>
              </div>
            ) : lab.interpretationNote ? (
              <p className="text-sm text-aba-neutral-900 whitespace-pre-wrap leading-relaxed bg-aba-neutral-100 rounded-lg p-3">
                {lab.interpretationNote}
              </p>
            ) : (
              <ABAButton
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => setShowNoteEditor(true)}
              >
                <PenLine className="w-3.5 h-3.5" />
                Add Interpretation Note
              </ABAButton>
            )}
          </div>

          {/* ── Clinical notes from order ── */}
          {lab.notes && (
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
              <h4 className="text-xs font-semibold text-aba-neutral-500 uppercase tracking-wide mb-1.5">
                Order Notes
              </h4>
              <p className="text-sm text-aba-neutral-700">{lab.notes}</p>
            </div>
          )}

          {/* ── Print for Parent ── */}
          {hasResults && (
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => navigate(`/cl/lab-result/${lab.id}/print`)}
            >
              <Printer className="w-4 h-4" />
              Print Summary for Parent
            </ABAButton>
          )}
        </div>
      </div>

      {/* ── Sticky Bottom CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-aba-neutral-0 border-t border-aba-neutral-200 z-30">
        <div className="max-w-[390px] mx-auto p-4">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => navigate(`/cl/consult/${lab.visitId}`, { replace: true })}
          >
            <Stethoscope className="w-5 h-5" />
            Return to Consultation
          </ABAButton>
        </div>
      </div>
    </div>
  );
}