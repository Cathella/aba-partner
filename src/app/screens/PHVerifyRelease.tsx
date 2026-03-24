/**
 * PH-04 Verify & Release — Final check before handing medications to patient.
 *
 * Layout:
 *   Top bar → "Verify & Release" + back
 *   Patient info summary
 *   Final medication checklist (read-only with ✓ marks)
 *   Allergy re-confirmation
 *   Payment confirmation
 *   CTA: "Confirm & Hand to Patient"
 *
 * On confirm → completeDispensing() → toast → navigate to PH-01
 *
 * Inner page: back arrow, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { PHStatusChip } from '../components/aba/PHStatusChip';
import { PHConfirmModal } from '../components/aba/PHConfirmModal';
import { showToast } from '../components/aba/Toast';
import {
  usePharmacistStore,
  completeDispensing,
} from '../data/pharmacistStore';
import {
  User,
  Pill,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  HandMetal,
} from 'lucide-react';

export function PHVerifyRelease() {
  const navigate = useNavigate();
  const { rxId } = useParams<{ rxId: string }>();
  const { getRxById } = usePharmacistStore();

  const rx = getRxById(rxId || '');

  const [confirmModal, setConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  if (!rx) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Verify & Release" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Prescription not found</p>
        </div>
      </div>
    );
  }

  const hasAllergy = rx.allergies && rx.allergies.length > 0;

  // Verification checklist items
  const verifyItems = [
    { id: 'patient', label: 'Patient identity verified' },
    { id: 'meds', label: 'All medications match prescription' },
    { id: 'dosage', label: 'Dosage and quantities confirmed' },
    ...(hasAllergy ? [{ id: 'allergy', label: `Allergy check (${rx.allergies!.join(', ')})` }] : []),
    { id: 'instructions', label: 'Patient counselled on usage' },
    { id: 'payment', label: `Payment status: ${rx.paymentStatus}` },
  ];

  const allChecked = verifyItems.every((item) => checks[item.id]);

  const toggleCheck = (id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleComplete = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      navigate(`/ph/dispense-confirm/${rx.id}`, { replace: true });
    }, 300);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Verify & Release" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-4 space-y-3">
          {/* ── Allergy alert ── */}
          {hasAllergy && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FDECEC] border border-[#E44F4F]/20">
              <ShieldAlert className="w-5 h-5 text-[#E44F4F] flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#E44F4F]">Final Allergy Check</p>
                <p className="text-[10px] text-[#4A4F55] mt-0.5">
                  Allergies: {rx.allergies!.join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* ── Patient summary ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-[#3A8DFF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                  {rx.patientName}
                </p>
                <p className="text-xs text-[#8F9AA1]">
                  {rx.patientAge} yrs &middot; {rx.patientGender}
                </p>
              </div>
              <PHStatusChip status={rx.status} />
            </div>
          </div>

          {/* ── Medications summary (read-only) ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#32C28A]" />
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Medications to Dispense
              </h3>
            </div>
            {rx.medications.map((med) => {
              const isPartial = med.dispensedQty < med.quantity;
              return (
                <div
                  key={med.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E8EC] last:border-b-0"
                >
                  <CheckCircle2
                    className={`w-4 h-4 flex-shrink-0 ${
                      isPartial ? 'text-[#FFB649]' : 'text-[#38C172]'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1A1A1A] truncate">
                      {med.substitution || med.name}
                    </p>
                    <p className="text-xs text-[#8F9AA1]">
                      {med.dosage} &middot; {med.dispensedQty}/{med.quantity} dispensed
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-[2px] rounded-full ${
                      isPartial
                        ? 'bg-[#FFF3DC] text-[#D97706]'
                        : 'bg-[#E9F8F0] text-[#38C172]'
                    }`}
                  >
                    {isPartial ? 'Partial' : 'Full'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Verification checklist ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#32C28A]" />
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Verification Checklist
              </h3>
            </div>
            {verifyItems.map((item) => {
              const checked = checks[item.id] || false;
              return (
                <button
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      checked
                        ? 'bg-[#32C28A] border-[#32C28A]'
                        : 'bg-[#FFFFFF] border-[#C9D0DB]'
                    }`}
                  >
                    {checked && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      checked ? 'text-[#8F9AA1] line-through' : 'text-[#1A1A1A]'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Payment card ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-[#8F9AA1]" />
              <div>
                <p className="text-xs font-medium text-[#1A1A1A]">Payment</p>
                {rx.paymentAmount && (
                  <p className="text-[10px] text-[#8F9AA1]">{rx.paymentAmount}</p>
                )}
              </div>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                rx.paymentStatus === 'paid'
                  ? 'bg-[#E9F8F0] text-[#38C172]'
                  : rx.paymentStatus === 'pending'
                  ? 'bg-[#FFF3DC] text-[#D97706]'
                  : 'bg-[#EBF3FF] text-[#3A8DFF]'
              }`}
            >
              {rx.paymentStatus === 'paid' ? 'Paid' : rx.paymentStatus === 'pending' ? 'Pending' : 'Waived'}
            </span>
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
            onClick={() => setConfirmModal(true)}
            disabled={!allChecked}
          >
            <HandMetal className="w-5 h-5" />
            Confirm & Hand to Patient
          </ABAButton>
          {!allChecked && (
            <p className="text-[10px] text-[#8F9AA1] text-center mt-2">
              Complete all checklist items to proceed
            </p>
          )}
        </div>
      </div>

      {/* ── Confirm modal ── */}
      <PHConfirmModal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        icon={<ShieldCheck className="w-7 h-7 text-[#32C28A]" />}
        iconBg="bg-[#E9F8F0]"
        title="Confirm Dispensing"
        description={`Hand ${rx.medications.length} medication(s) to ${rx.patientName}. This action cannot be undone.`}
        confirmText="Dispense"
        onConfirm={handleComplete}
        isLoading={isSubmitting}
      />
    </div>
  );
}