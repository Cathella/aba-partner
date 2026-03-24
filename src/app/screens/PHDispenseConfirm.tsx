/**
 * PH-06 Dispense Confirmation — Final summary before marking as dispensed.
 *
 * Layout:
 *   Title: "Dispense Confirmation" + back
 *   Patient summary
 *   Final medication summary (read-only) with dispensed quantities
 *   Checkbox: "Patient counselled"
 *   CTA: "Mark as Dispensed" (primary)
 *   Secondary: "Back to Edit"
 *
 * On complete:
 *   Toast "Dispensed successfully"
 *   Rx moves to Completed
 *   Route to PH-07 (Completed Rx Detail)
 *
 * Bottom nav present.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { PHStatusChip } from '../components/aba/PHStatusChip';
import { PharmacyBottomNav } from '../components/aba/PharmacyBottomNav';
import { showToast } from '../components/aba/Toast';
import {
  usePharmacistStore,
  completeDispensing,
} from '../data/pharmacistStore';
import {
  deductStockOnDispense,
} from '../data/pharmacyInventoryStore';
import {
  User,
  Pill,
  CheckCircle2,
  PackageCheck,
  PackageMinus,
  PackageX,
  Stethoscope,
  CreditCard,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Package,
} from 'lucide-react';

export function PHDispenseConfirm() {
  const navigate = useNavigate();
  const { rxId } = useParams<{ rxId: string }>();
  const { getRxById } = usePharmacistStore();

  const rx = getRxById(rxId || '');

  const [counselled, setCounselled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Not found ── */
  if (!rx) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Dispense Confirmation" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Prescription not found</p>
        </div>
        <PharmacyBottomNav />
      </div>
    );
  }

  const totalItems = rx.medications.length;
  const allFull = rx.medications.every((m) => m.dispensedQty >= m.quantity);
  const somePartial = rx.medications.some(
    (m) => m.dispensedQty > 0 && m.dispensedQty < m.quantity
  );

  /* ── Handlers ── */

  const handleDispense = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      completeDispensing(rx.id);
      // Auto-deduct stock for each dispensed medication
      for (const med of rx.medications) {
        if (med.dispensedQty > 0) {
          const drugName = med.substitution || med.name;
          deductStockOnDispense(drugName, med.dispensedQty, 'Prescription');
        }
      }
      showToast('Dispensed successfully. Stock updated.', 'success');
      navigate(`/ph/completed-detail/${rx.id}`, { replace: true });
    }, 500);
  };

  const handleBackToEdit = () => {
    navigate(`/ph/dispense/${rx.id}`);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Dispense Confirmation" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-56">
        <div className="p-4 space-y-3">

          {/* ── Status banner ── */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#EBF3FF] border border-[#3A8DFF]/20">
            <ShieldCheck className="w-5 h-5 text-[#3A8DFF] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#3A8DFF]">Final Review</p>
              <p className="text-[10px] text-[#4A4F55] mt-0.5">
                Confirm all items are correct before dispensing to the patient.
              </p>
            </div>
          </div>

          {/* ── Patient summary ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-[#3A8DFF]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                    {rx.patientName}
                  </p>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-[1px] rounded-full flex-shrink-0 ${
                      rx.isMember
                        ? 'bg-[#EBF3FF] text-[#3A8DFF]'
                        : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'
                    }`}
                  >
                    {rx.isMember ? 'Member' : 'Non-member'}
                  </span>
                </div>
                <p className="text-xs text-[#8F9AA1]">
                  {rx.patientAge} yrs · {rx.patientGender}
                  {rx.weight ? ` · ${rx.weight}` : ''}
                </p>
              </div>
              <PHStatusChip status={rx.status} />
            </div>

            {/* Prescriber */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E8EC] text-xs text-[#8F9AA1]">
              <Stethoscope className="w-3.5 h-3.5 flex-shrink-0" />
              Prescribed by {rx.prescribedBy} at {rx.prescribedAt}
            </div>
          </div>

          {/* ── Medication summary (read-only) ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#32C28A]" />
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Medications to Dispense ({totalItems})
                </h3>
              </div>
              {allFull && (
                <span className="text-[10px] font-semibold text-[#38C172] bg-[#E9F8F0] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  All full
                </span>
              )}
              {somePartial && !allFull && (
                <span className="text-[10px] font-semibold text-[#D97706] bg-[#FFF3DC] px-2 py-0.5 rounded-full">
                  Partial fill
                </span>
              )}
            </div>

            {rx.medications.map((med) => {
              const isFull = med.dispensedQty >= med.quantity;
              const isPartial = med.dispensedQty > 0 && med.dispensedQty < med.quantity;
              const isZero = med.dispensedQty === 0;

              const stockIcon =
                med.stockLevel === 'in-stock' ? (
                  <PackageCheck className="w-3 h-3" />
                ) : med.stockLevel === 'low-stock' ? (
                  <PackageMinus className="w-3 h-3" />
                ) : (
                  <PackageX className="w-3 h-3" />
                );

              return (
                <div
                  key={med.id}
                  className="px-4 py-3.5 border-b border-[#E5E8EC] last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    {/* Status icon */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isFull
                          ? 'bg-[#E9F8F0]'
                          : isPartial
                          ? 'bg-[#FFF3DC]'
                          : 'bg-[#F7F9FC]'
                      }`}
                    >
                      {isFull ? (
                        <CheckCircle2 className="w-4 h-4 text-[#38C172]" />
                      ) : isPartial ? (
                        <Clock className="w-4 h-4 text-[#D97706]" />
                      ) : (
                        <Pill className="w-4 h-4 text-[#C9D0DB]" />
                      )}
                    </div>

                    {/* Med details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">
                        {med.substitution ? (
                          <span>
                            <s className="text-[#C9D0DB]">{med.name}</s>{' '}
                            <span className="text-[#32C28A]">{med.substitution}</span>
                          </span>
                        ) : (
                          med.name
                        )}
                      </p>
                      <p className="text-xs text-[#8F9AA1] mt-0.5">
                        {med.dosage} · {med.form} · {med.frequency}
                      </p>
                      <p className="text-xs text-[#8F9AA1] mt-0.5">
                        Duration: {med.duration}
                      </p>
                    </div>

                    {/* Qty badge */}
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`text-sm font-semibold ${
                          isFull
                            ? 'text-[#38C172]'
                            : isPartial
                            ? 'text-[#D97706]'
                            : 'text-[#C9D0DB]'
                        }`}
                      >
                        {med.dispensedQty}/{med.quantity}
                      </p>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-[1px] rounded mt-0.5 inline-block ${
                          isFull
                            ? 'bg-[#E9F8F0] text-[#38C172]'
                            : isPartial
                            ? 'bg-[#FFF3DC] text-[#D97706]'
                            : isZero
                            ? 'bg-[#FDECEC] text-[#E44F4F]'
                            : 'bg-[#F7F9FC] text-[#8F9AA1]'
                        }`}
                      >
                        {isFull ? 'Full' : isPartial ? 'Partial' : 'None'}
                      </span>
                    </div>
                  </div>

                  {/* Substitution / awaiting info */}
                  {med.substitution && (
                    <div className="ml-9 mt-1.5 flex items-center gap-1.5 text-[10px] text-[#32C28A]">
                      {stockIcon}
                      Substituted from {med.name}
                    </div>
                  )}
                  {med.awaitingStock && (
                    <div className="ml-9 mt-1.5 flex items-center gap-1.5 text-[10px] text-[#3A8DFF]">
                      <Clock className="w-3 h-3" />
                      Awaiting stock
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Payment status ── */}
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
              {rx.paymentStatus === 'paid'
                ? 'Paid'
                : rx.paymentStatus === 'pending'
                ? 'Pending'
                : 'Waived'}
            </span>
          </div>

          {/* ── Stock auto-deduct notice ── */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#E9F8F0] border border-[#32C28A]/20">
            <Package className="w-5 h-5 text-[#32C28A] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#1A1A1A]">Stock Auto-Deduct</p>
              <p className="text-[10px] text-[#4A4F55] mt-0.5">
                Stock will be deducted automatically when you mark as dispensed.
              </p>
            </div>
          </div>

          {/* ── Patient counselled checkbox ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <button
              onClick={() => setCounselled(!counselled)}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
            >
              <div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  counselled
                    ? 'bg-[#32C28A] border-[#32C28A]'
                    : 'bg-[#FFFFFF] border-[#C9D0DB]'
                }`}
              >
                {counselled && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A]">Patient counselled</p>
                <p className="text-xs text-[#8F9AA1] mt-0.5">
                  I have explained dosage, frequency, potential side effects, and storage instructions to the patient or guardian.
                </p>
              </div>
            </button>
          </div>

          {/* ── Pharmacist notes (if any) ── */}
          {rx.pharmacistNotes && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <p className="text-[10px] font-semibold text-[#8F9AA1] uppercase tracking-wide mb-1">
                Pharmacist Notes
              </p>
              <p className="text-xs text-[#4A4F55] leading-relaxed">
                {rx.pharmacistNotes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky actions ── */}
      <div className="fixed bottom-16 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4 space-y-2">
          {/* Primary: Mark as Dispensed */}
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleDispense}
            disabled={!counselled}
            isLoading={isSubmitting}
          >
            <CheckCircle2 className="w-5 h-5" />
            Mark as Dispensed
          </ABAButton>
          {!counselled && (
            <p className="text-[10px] text-[#8F9AA1] text-center">
              Check "Patient counselled" to proceed
            </p>
          )}

          {/* Secondary: Back to Edit */}
          <ABAButton variant="outline" fullWidth onClick={handleBackToEdit}>
            <ArrowLeft className="w-4 h-4" />
            Back to Edit
          </ABAButton>
        </div>
      </div>

      {/* ── Bottom nav ── */}
      <PharmacyBottomNav />
    </div>
  );
}