/**
 * CL-18 Transfer / Referral — Select a transfer destination,
 * add notes, confirm via modal, toast, and return to queue.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { CLConfirmModal } from '../components/aba/CLConfirmModal';
import { showToast } from '../components/aba/Toast';
import {
  useClinicianStore,
  transferPatient,
} from '../data/clinicianStore';
import type { TransferType } from '../data/clinicianStore';
import {
  FlaskConical,
  Pill,
  UserRoundCheck,
  CalendarCheck,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

/* ── Transfer options ── */
interface TransferOption {
  type: TransferType;
  label: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  statusHint: string;
}

const TRANSFER_OPTIONS: TransferOption[] = [
  {
    type: 'lab',
    label: 'Send to Lab',
    description: 'Patient needs laboratory tests before continuing consultation.',
    icon: <FlaskConical className="w-5 h-5" />,
    iconBg: 'bg-[#FFFBEB]',
    iconColor: 'text-[#F59E0B]',
    statusHint: 'Status will change to Lab Pending',
  },
  {
    type: 'pharmacy',
    label: 'Send to Pharmacy',
    description: 'Consultation complete — patient proceeds to collect medication.',
    icon: <Pill className="w-5 h-5" />,
    iconBg: 'bg-[#F5F3FF]',
    iconColor: 'text-[#8B5CF6]',
    statusHint: 'Status will change to Transferred',
  },
  {
    type: 'reception',
    label: 'Return to Reception',
    description: 'Send patient back to the reception desk for further assistance.',
    icon: <UserRoundCheck className="w-5 h-5" />,
    iconBg: 'bg-aba-primary-50',
    iconColor: 'text-aba-primary-main',
    statusHint: 'Status will change to Waiting',
  },
  {
    type: 'follow-up',
    label: 'Schedule Follow-up',
    description: 'End visit and schedule a follow-up appointment for the patient.',
    icon: <CalendarCheck className="w-5 h-5" />,
    iconBg: 'bg-aba-success-50',
    iconColor: 'text-aba-success-main',
    statusHint: 'Status will change to Completed',
  },
];

export function CLTransferReferral() {
  const navigate = useNavigate();
  const { visitId } = useParams<{ visitId: string }>();
  const { getVisitById, getVisitOrders } = useClinicianStore();

  const visit = getVisitById(visitId || '');
  const orders = visit ? getVisitOrders(visit.id) : null;

  const [selected, setSelected] = useState<TransferType | null>(null);
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!visit) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Transfer / Referral" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-aba-neutral-600">Visit not found</p>
        </div>
      </div>
    );
  }

  const selectedOption = TRANSFER_OPTIONS.find((o) => o.type === selected);

  const handleConfirm = () => {
    if (!selected) return;

    // Lab & Pharmacy route through the coverage approval flow on Visit Summary
    if (selected === 'lab' || selected === 'pharmacy') {
      navigate(`/cl/visit/${visit.id}`, { state: { openSheet: selected }, replace: true });
      return;
    }

    setIsSubmitting(true);

    // Simulate brief async
    setTimeout(() => {
      transferPatient(visit.id, selected, notes.trim() || undefined);

      const label = selectedOption?.label || 'Transfer';
      showToast(`${visit.patientName} — ${label} confirmed`, 'success');

      setIsSubmitting(false);
      setShowConfirm(false);

      // Navigate to queue
      navigate('/cl/queue', { replace: true });
    }, 600);
  };

  // Contextual warnings
  const warnings: string[] = [];
  if (selected === 'pharmacy' && orders && orders.prescriptions.length === 0) {
    warnings.push('No prescriptions found for this visit. Consider creating one before sending to pharmacy.');
  }
  if (selected === 'lab' && orders && orders.labs.length === 0) {
    warnings.push('No lab orders found for this visit. Consider ordering a lab test first.');
  }

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Transfer / Referral" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Patient strip */}
        <div className="bg-aba-neutral-0 border-b border-aba-neutral-200 px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-aba-secondary-main">
              {visit.patientName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-aba-neutral-900">{visit.patientName}</p>
            <p className="text-xs text-aba-neutral-600">
              {visit.service} &middot; {visit.ticket} &middot; {visit.room || 'No room'}
            </p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* ── Transfer options ── */}
          <div>
            <h3 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide mb-2.5 px-1">
              Select Destination
            </h3>
            <div className="space-y-2.5">
              {TRANSFER_OPTIONS.map((opt) => {
                const isSelected = selected === opt.type;
                const hasApplied = (opt.type === 'lab' && !!visit.labCoverageStatus)
                  || (opt.type === 'pharmacy' && !!visit.pharmCoverageStatus);
                return (
                  <button
                    key={opt.type}
                    onClick={() => setSelected(opt.type)}
                    className={`w-full text-left bg-aba-neutral-0 rounded-2xl border-2 p-4 transition-all ${
                      isSelected
                        ? 'border-aba-secondary-main shadow-sm'
                        : 'border-aba-neutral-200 hover:border-aba-neutral-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Radio indicator */}
                      <div
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'border-aba-secondary-main'
                            : 'border-aba-neutral-400'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-aba-secondary-main" />
                        )}
                      </div>

                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl ${opt.iconBg} flex items-center justify-center flex-shrink-0 ${opt.iconColor}`}
                      >
                        {opt.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-aba-neutral-900">
                            {opt.label}
                          </p>
                          {hasApplied && (
                            <span className="text-[10px] font-semibold text-[#56D8A8] bg-[#E9F8F0] px-1.5 py-0.5 rounded-full flex-shrink-0 inline-flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" />Applied
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-aba-neutral-600 mt-0.5 leading-relaxed">
                          {opt.description}
                        </p>
                        {isSelected && (
                          <p className="text-[10px] font-medium text-aba-secondary-main mt-1.5 uppercase tracking-wide">
                            {opt.statusHint}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Context warnings ── */}
          {warnings.length > 0 && (
            <div className="space-y-2">
              {warnings.map((w, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 bg-aba-warning-50 border border-aba-warning-main/20 rounded-xl px-3.5 py-3"
                >
                  <AlertTriangle className="w-4 h-4 text-aba-warning-main flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-aba-neutral-800 leading-relaxed">{w}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Notes ── */}
          <div>
            <label className="block text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide mb-2 px-1">
              Transfer Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any relevant notes for the receiving department…"
              rows={3}
              className="w-full text-sm text-aba-neutral-900 placeholder:text-aba-neutral-500 bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main/30 focus:border-aba-secondary-main transition-all resize-none"
            />
          </div>

          {/* ── Visit summary snapshot ── */}
          {(orders && (orders.labs.length > 0 || orders.prescriptions.length > 0)) && (
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-aba-neutral-200">
                <h4 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">
                  Active Orders for This Visit
                </h4>
              </div>
              {orders.labs.map((lab) => (
                <div
                  key={lab.id}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-aba-neutral-200 last:border-b-0"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#FFFBEB] flex items-center justify-center flex-shrink-0">
                    <FlaskConical className="w-3 h-3 text-[#F59E0B]" />
                  </div>
                  <p className="text-xs text-aba-neutral-900 flex-1 truncate">{lab.testName}</p>
                  <span className="text-[10px] text-aba-neutral-600 capitalize">{lab.status}</span>
                </div>
              ))}
              {orders.prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-aba-neutral-200 last:border-b-0"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#F5F3FF] flex items-center justify-center flex-shrink-0">
                    <Pill className="w-3 h-3 text-[#8B5CF6]" />
                  </div>
                  <p className="text-xs text-aba-neutral-900 flex-1 truncate">
                    {rx.medication} — {rx.dosage}
                  </p>
                  <span className="text-[10px] text-aba-neutral-600 capitalize">{rx.rxStatus}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-aba-neutral-0 border-t border-aba-neutral-200 z-30">
        <div className="max-w-[390px] mx-auto p-4">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            disabled={!selected}
            onClick={() => {
              if (!selected) return;
              if (selected === 'lab' || selected === 'pharmacy') {
                handleConfirm();
              } else {
                setShowConfirm(true);
              }
            }}
          >
            <ArrowRightLeft className="w-4.5 h-4.5" />
            {selected === 'lab' || selected === 'pharmacy' ? 'Continue to Coverage Approval' : 'Confirm Transfer'}
          </ABAButton>
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      <CLConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        icon={
          selectedOption ? (
            <div className={`${selectedOption.iconColor}`}>{selectedOption.icon}</div>
          ) : (
            <ArrowRightLeft className="w-6 h-6 text-aba-secondary-main" />
          )
        }
        iconBg={selectedOption?.iconBg || 'bg-aba-secondary-50'}
        title={`${selectedOption?.label || 'Transfer'}?`}
        description={`${visit.patientName} will be ${
          selected === 'lab'
            ? 'sent to the laboratory'
            : selected === 'pharmacy'
            ? 'sent to the pharmacy'
            : selected === 'reception'
            ? 'returned to reception'
            : 'scheduled for a follow-up'
        }. This will end the current consultation.`}
        confirmText="Confirm"
        cancelText="Go Back"
        onConfirm={handleConfirm}
        isLoading={isSubmitting}
      >
        {/* Summary inside modal */}
        <div className="bg-aba-neutral-100 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-aba-neutral-600">Patient</span>
            <span className="font-medium text-aba-neutral-900">{visit.patientName}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-aba-neutral-600">Destination</span>
            <span className="font-medium text-aba-neutral-900">{selectedOption?.label}</span>
          </div>
          {notes.trim() && (
            <div className="flex items-start justify-between text-xs pt-1 border-t border-aba-neutral-200">
              <span className="text-aba-neutral-600">Notes</span>
              <span className="font-medium text-aba-neutral-900 text-right max-w-[60%] leading-relaxed">
                {notes.trim().length > 80 ? `${notes.trim().slice(0, 80)}…` : notes.trim()}
              </span>
            </div>
          )}
        </div>
      </CLConfirmModal>
    </div>
  );
}