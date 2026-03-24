/**
 * PH-03 Fill Preparation — Pharmacist fills medications with editable qty & instructions.
 *
 * Layout:
 *   Top bar → "Fill Prescription" + back
 *   OOS warning banner + "Handle substitutions" → PH-04
 *   Medication list with:
 *     – Quantity to dispense (stepper)
 *     – Instructions to patient (editable note)
 *     – Stock badge: In Stock / Low / Out
 *   Actions:
 *     – "Save as In Progress" (secondary) → toast
 *     – "Mark Ready for Pickup" (primary) → payment gate if pending
 *
 * Prototype:
 *   If payment pending → modal: "Payment not confirmed. Hold?"
 *     → Hold (go to PH-05 placeholder)
 *     → Continue (proceed)
 *
 * Bottom nav present.
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { PHStatusChip } from '../components/aba/PHStatusChip';
import { PHConfirmModal } from '../components/aba/PHConfirmModal';
import { PharmacyBottomNav } from '../components/aba/PharmacyBottomNav';
import { showToast } from '../components/aba/Toast';
import {
  usePharmacistStore,
  updateDispensedQty,
  markReady,
  addSubstitution,
  updatePharmacistNotes,
} from '../data/pharmacistStore';
import type { PHMedItem } from '../data/pharmacistStore';
import {
  usePharmacyInventoryStore,
} from '../data/pharmacyInventoryStore';
import {
  User,
  ShieldAlert,
  Pill,
  CheckCircle2,
  StickyNote,
  ArrowRightLeft,
  AlertTriangle,
  PackageCheck,
  PackageMinus,
  PackageX,
  Save,
  CreditCard,
  PauseCircle,
  Warehouse,
} from 'lucide-react';

/* ── Stock badge config ── */

const stockConfig: Record<
  PHMedItem['stockLevel'],
  { label: string; icon: React.ReactNode; bg: string; text: string; border: string }
> = {
  'in-stock': {
    label: 'In Stock',
    icon: <PackageCheck className="w-3 h-3" />,
    bg: 'bg-[#E9F8F0]',
    text: 'text-[#38C172]',
    border: 'border-[#38C172]/20',
  },
  'low-stock': {
    label: 'Low',
    icon: <PackageMinus className="w-3 h-3" />,
    bg: 'bg-[#FFF3DC]',
    text: 'text-[#D97706]',
    border: 'border-[#D97706]/20',
  },
  'out-of-stock': {
    label: 'Out',
    icon: <PackageX className="w-3 h-3" />,
    bg: 'bg-[#FDECEC]',
    text: 'text-[#E44F4F]',
    border: 'border-[#E44F4F]/20',
  },
};

export function PHDispense() {
  const navigate = useNavigate();
  const { rxId } = useParams<{ rxId: string }>();
  const { getRxById } = usePharmacistStore();
  const { items: inventoryItems } = usePharmacyInventoryStore();

  const rx = getRxById(rxId || '');

  /** Find matching inventory item by fuzzy name match */
  const findInventoryItem = (medName: string) => {
    const lowerName = medName.toLowerCase();
    return inventoryItems.find((i) => i.name.toLowerCase().includes(lowerName) || lowerName.includes(i.name.toLowerCase().split(' ')[0]));
  };

  /* ── Local state ── */
  const [instructions, setInstructions] = useState<Record<string, string>>({});
  const [subModal, setSubModal] = useState<string | null>(null);
  const [subName, setSubName] = useState('');
  const [paymentGateModal, setPaymentGateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const oosRef = useRef<HTMLDivElement>(null);

  /* seed instructions from existing notes */
  useEffect(() => {
    if (rx) {
      const init: Record<string, string> = {};
      for (const med of rx.medications) {
        init[med.id] = med.notes || '';
      }
      setInstructions(init);
    }
  }, [rx?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Not found ── */
  if (!rx) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Fill Prescription" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Prescription not found</p>
        </div>
        <PharmacyBottomNav />
      </div>
    );
  }

  const allFullyDispensed = rx.medications.every((m) => m.dispensedQty >= m.quantity);
  const someDispensed = rx.medications.some((m) => m.dispensedQty > 0);
  const hasAllergy = rx.allergies && rx.allergies.length > 0;
  const hasOOS = rx.medications.some((m) => m.stockLevel === 'out-of-stock');
  const isPaymentPending = rx.paymentStatus === 'pending';

  /* ── Handlers ── */

  const handleSaveInProgress = () => {
    if (rx.pharmacistNotes !== Object.values(instructions).filter(Boolean).join(' | ')) {
      const combinedNotes = Object.entries(instructions)
        .filter(([, v]) => v.trim())
        .map(([, v]) => v.trim())
        .join(' | ');
      if (combinedNotes) updatePharmacistNotes(rx.id, combinedNotes);
    }
    showToast('Progress saved — prescription is in progress', 'success');
  };

  const handleMarkReadyAttempt = () => {
    if (isPaymentPending) {
      setPaymentGateModal(true);
      return;
    }
    proceedMarkReady();
  };

  const proceedMarkReady = () => {
    setIsSubmitting(true);
    setPaymentGateModal(false);
    // save instructions as pharmacist notes
    const combinedNotes = Object.entries(instructions)
      .filter(([, v]) => v.trim())
      .map(([, v]) => v.trim())
      .join(' | ');
    if (combinedNotes) updatePharmacistNotes(rx.id, combinedNotes);

    setTimeout(() => {
      markReady(rx.id);
      const label = allFullyDispensed
        ? 'All medications filled — ready for pickup'
        : 'Partial fill — ready for pickup';
      showToast(label, 'success');
      navigate(`/ph/rx/${rx.id}`, { replace: true });
    }, 400);
  };

  const handlePaymentHold = () => {
    setPaymentGateModal(false);
    showToast('Redirecting to Payment & Coverage…', 'info');
    navigate(`/ph/payment-coverage/${rx.id}`);
  };

  const handleSubstitution = () => {
    if (!subModal || !subName.trim()) return;
    addSubstitution(rx.id, subModal, subName.trim());
    showToast('Substitution recorded', 'success');
    setSubModal(null);
    setSubName('');
  };

  const handleScrollToOOS = () => {
    oosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Fill Prescription" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-64">
        <div className="p-4 space-y-3">

          {/* ── Allergy warning ── */}
          {hasAllergy && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FDECEC] border border-[#E44F4F]/20">
              <ShieldAlert className="w-5 h-5 text-[#E44F4F] flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#E44F4F]">Allergy Alert</p>
                <p className="text-[10px] text-[#4A4F55] mt-0.5">
                  {rx.allergies!.join(', ')} — verify all medications
                </p>
              </div>
            </div>
          )}

          {/* ── Out-of-stock warning banner ── */}
          {hasOOS && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FFF3DC] border border-[#FFB649]/20">
              <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#D97706]">
                  Some items are out of stock
                </p>
                <p className="text-[10px] text-[#4A4F55] mt-0.5">
                  Consider substitutions or partial fill before marking ready.
                </p>
              </div>
              <button
                onClick={() => navigate(`/ph/stock-handling/${rx.id}`)}
                className="text-[10px] font-semibold text-[#3A8DFF] bg-[#EBF3FF] px-2.5 py-1.5 rounded-lg hover:bg-[#D6E8FF] active:bg-[#BDDAFF] transition-colors flex-shrink-0 flex items-center gap-1"
              >
                <ArrowRightLeft className="w-3 h-3" />
                Handle substitutions
              </button>
            </div>
          )}

          {/* ── Patient summary strip ── */}
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
          </div>

          {/* ── Medications with fill controls ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#32C28A]" />
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Fill Medications ({rx.medications.length})
                </h3>
              </div>
              {allFullyDispensed && (
                <span className="text-[10px] font-semibold text-[#38C172] bg-[#E9F8F0] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  All filled
                </span>
              )}
            </div>

            {rx.medications.map((med) => {
              const stock = stockConfig[med.stockLevel];
              const isOOS = med.stockLevel === 'out-of-stock';
              const isFullyDispensed = med.dispensedQty >= med.quantity;

              return (
                <div
                  key={med.id}
                  ref={isOOS ? oosRef : undefined}
                  className={`px-4 py-4 border-b border-[#E5E8EC] last:border-b-0 ${
                    isOOS ? 'bg-[#FDECEC]/30' : ''
                  }`}
                >
                  {/* Header: drug name + stock badge */}
                  <div className="flex items-start gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isOOS ? 'bg-[#FDECEC]' : 'bg-[#EBF3FF]'
                      }`}
                    >
                      <Pill className={`w-4 h-4 ${isOOS ? 'text-[#E44F4F]' : 'text-[#3A8DFF]'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
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
                        {/* Stock badge — tappable → PH-21 Item Detail */}
                        {(() => {
                          const invItem = findInventoryItem(med.name);
                          return (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (invItem) navigate(`/ph/inventory/${invItem.id}`);
                                else navigate('/ph/inventory');
                              }}
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-[2px] rounded-full border flex-shrink-0 hover:opacity-80 active:opacity-60 transition-opacity cursor-pointer ${stock.bg} ${stock.text} ${stock.border}`}
                            >
                              {stock.icon}
                              {stock.label}
                            </button>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-[#4A4F55] mt-0.5">
                        {med.dosage} · {med.form} · {med.frequency}
                      </p>
                      <p className="text-[10px] text-[#8F9AA1] mt-0.5">
                        Duration: {med.duration} · Prescribed qty: {med.quantity}
                      </p>
                    </div>
                  </div>

                  {/* Quantity to dispense — stepper */}
                  <div className="ml-10 mt-3 flex items-center gap-3">
                    <label className="text-xs text-[#4A4F55] font-medium min-w-[72px]">
                      Qty to fill:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          updateDispensedQty(rx.id, med.id, Math.max(0, med.dispensedQty - 1))
                        }
                        className="w-8 h-8 rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] flex items-center justify-center text-[#4A4F55] hover:bg-[#E5E8EC] active:bg-[#C9D0DB] transition-colors text-sm font-bold disabled:opacity-40"
                        disabled={med.dispensedQty <= 0}
                      >
                        −
                      </button>
                      <span
                        className={`text-sm font-semibold min-w-[32px] text-center ${
                          isFullyDispensed ? 'text-[#38C172]' : 'text-[#1A1A1A]'
                        }`}
                      >
                        {med.dispensedQty}
                      </span>
                      <button
                        onClick={() =>
                          updateDispensedQty(rx.id, med.id, med.dispensedQty + 1)
                        }
                        className="w-8 h-8 rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] flex items-center justify-center text-[#4A4F55] hover:bg-[#E5E8EC] active:bg-[#C9D0DB] transition-colors text-sm font-bold"
                      >
                        +
                      </button>
                      <span className="text-xs text-[#C9D0DB] ml-1">/ {med.quantity}</span>
                      {isFullyDispensed && (
                        <span className="text-[10px] font-semibold text-[#38C172] bg-[#E9F8F0] px-1.5 py-0.5 rounded-full ml-1">
                          Full
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Instructions to patient */}
                  <div className="ml-10 mt-2.5">
                    <label className="text-[10px] text-[#8F9AA1] uppercase tracking-wide font-medium flex items-center gap-1 mb-1">
                      <StickyNote className="w-3 h-3 text-[#C9D0DB]" />
                      Instructions to patient
                    </label>
                    <textarea
                      value={instructions[med.id] || ''}
                      onChange={(e) =>
                        setInstructions((prev) => ({ ...prev, [med.id]: e.target.value }))
                      }
                      placeholder="e.g. Take after meals, avoid dairy products…"
                      rows={2}
                      className="w-full text-xs text-[#1A1A1A] placeholder:text-[#C9D0DB] bg-[#F7F9FC] rounded-lg border border-[#E5E8EC] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all resize-none"
                    />
                  </div>

                  {/* Substitution button for OOS items */}
                  {isOOS && !med.substitution && (
                    <div className="ml-10 mt-2 space-y-1.5">
                      <button
                        onClick={() => {
                          setSubModal(med.id);
                          setSubName('');
                        }}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#3A8DFF] hover:underline"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        Suggest Substitution
                      </button>
                      <button
                        onClick={() => navigate('/ph/inventory')}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#32C28A] hover:underline"
                      >
                        <Warehouse className="w-3.5 h-3.5" />
                        Go to Inventory
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Clinical notes (read-only context) ── */}
          {rx.clinicalNotes && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <div className="flex items-center gap-2 mb-2">
                <StickyNote className="w-3.5 h-3.5 text-[#C9D0DB]" />
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Clinical Notes
                </h3>
              </div>
              <p className="text-sm text-[#4A4F55] leading-relaxed">
                {rx.clinicalNotes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky bottom actions ── */}
      <div className="fixed bottom-16 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4 space-y-2">
          {/* Primary: Mark Ready for Pickup */}
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleMarkReadyAttempt}
            disabled={!someDispensed}
            isLoading={isSubmitting}
          >
            <CheckCircle2 className="w-5 h-5" />
            {allFullyDispensed ? 'Mark Ready for Pickup' : 'Mark as Partial Fill'}
          </ABAButton>

          {/* Secondary: Save as In Progress */}
          <ABAButton variant="outline" fullWidth onClick={handleSaveInProgress}>
            <Save className="w-4 h-4" />
            Save as In Progress
          </ABAButton>
        </div>
      </div>

      {/* ── Bottom nav ── */}
      <PharmacyBottomNav />

      {/* ── Payment gate modal ── */}
      <PHConfirmModal
        isOpen={paymentGateModal}
        onClose={() => setPaymentGateModal(false)}
        icon={<CreditCard className="w-7 h-7 text-[#D97706]" />}
        iconBg="bg-[#FFF3DC]"
        title="Payment Not Confirmed"
        description="This prescription has a pending payment. Would you like to hold it or continue anyway?"
        confirmText="Continue Anyway"
        cancelText="Hold"
        onConfirm={proceedMarkReady}
      >
        {/* Extra hold option */}
        <button
          onClick={handlePaymentHold}
          className="w-full flex items-center justify-center gap-2 py-2.5 mb-2 rounded-[6px] border-2 border-[#D97706]/30 bg-[#FFF3DC] text-sm font-semibold text-[#D97706] hover:bg-[#FFE9B8] active:bg-[#FFD88A] transition-colors"
        >
          <PauseCircle className="w-4 h-4" />
          Hold — Go to Payment & Coverage
        </button>
      </PHConfirmModal>

      {/* ── Substitution modal ── */}
      <PHConfirmModal
        isOpen={subModal !== null}
        onClose={() => {
          setSubModal(null);
          setSubName('');
        }}
        icon={<ArrowRightLeft className="w-7 h-7 text-[#3A8DFF]" />}
        iconBg="bg-[#EBF3FF]"
        title="Suggest Substitution"
        description="Enter the substitute medication name. The original will be crossed out."
        confirmText="Apply Substitution"
        onConfirm={handleSubstitution}
      >
        <input
          type="text"
          value={subName}
          onChange={(e) => setSubName(e.target.value)}
          placeholder="e.g. Azithromycin 500 mg"
          autoFocus
          className="w-full h-11 px-3 rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#3A8DFF]/30 focus:border-[#3A8DFF] transition-all"
        />
      </PHConfirmModal>
    </div>
  );
}