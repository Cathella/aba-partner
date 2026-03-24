/**
 * PH-04 Substitution & Stock Handling — Handle out-of-stock medications.
 *
 * Layout:
 *   Title: "Out of Stock Options" + back
 *   For each OOS medication:
 *     – Option A: Select substitution (text input placeholder)
 *     – Option B: Partial fill (enter dispensed qty now)
 *     – Option C: Mark awaiting stock
 *   Notes to clinician (optional textarea)
 *   CTA: "Confirm Changes" (primary)
 *
 * On confirm:
 *   Toast "Updated prescription plan"
 *   Return to PH-03 with updated med list and badges
 *
 * Bottom nav present.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { PharmacyBottomNav } from '../components/aba/PharmacyBottomNav';
import { showToast } from '../components/aba/Toast';
import {
  usePharmacistStore,
  addSubstitution,
  updateDispensedQty,
  markMedAwaitingStock,
  updatePharmacistNotes,
} from '../data/pharmacistStore';
import {
  Pill,
  PackageX,
  ArrowRightLeft,
  Hash,
  Clock,
  CheckCircle2,
  StickyNote,
  AlertTriangle,
} from 'lucide-react';

/* ── Decision type per med ── */
type Decision = 'substitution' | 'partial-fill' | 'awaiting-stock';

interface MedDecision {
  decision: Decision;
  substitutionName: string;
  partialQty: number;
}

/* ── Mock substitution suggestions per drug name ── */
const substitutionSuggestions: Record<string, string[]> = {
  'Ferrous Sulphate': [
    'Ferrous Fumarate 200 mg',
    'Ferrous Gluconate 300 mg',
    'Iron Polymaltose 100 mg',
  ],
  Amoxicillin: [
    'Azithromycin 500 mg',
    'Cephalexin 500 mg',
    'Erythromycin 500 mg',
  ],
  default: [
    'Alternative A (same class)',
    'Alternative B (different class)',
    'Consult prescriber for recommendation',
  ],
};

function getSuggestions(drugName: string): string[] {
  return substitutionSuggestions[drugName] || substitutionSuggestions['default'];
}

export function PHStockHandling() {
  const navigate = useNavigate();
  const { rxId } = useParams<{ rxId: string }>();
  const { getRxById } = usePharmacistStore();

  const rx = getRxById(rxId || '');

  /* Per-med decision state */
  const [decisions, setDecisions] = useState<Record<string, MedDecision>>(() => {
    if (!rx) return {};
    const init: Record<string, MedDecision> = {};
    for (const med of rx.medications) {
      if (med.stockLevel === 'out-of-stock' && !med.substitution) {
        init[med.id] = {
          decision: 'substitution',
          substitutionName: '',
          partialQty: 0,
        };
      }
    }
    return init;
  });

  const [clinicianNote, setClinicianNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Not found ── */
  if (!rx) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Out of Stock Options" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Prescription not found</p>
        </div>
        <PharmacyBottomNav />
      </div>
    );
  }

  const oosMeds = rx.medications.filter(
    (m) => m.stockLevel === 'out-of-stock' && !m.substitution
  );

  /* ── Helpers ── */

  const updateDecision = (medId: string, patch: Partial<MedDecision>) => {
    setDecisions((prev) => ({
      ...prev,
      [medId]: { ...prev[medId], ...patch },
    }));
  };

  const canConfirm = Object.entries(decisions).every(([, d]) => {
    if (d.decision === 'substitution') return d.substitutionName.trim().length > 0;
    if (d.decision === 'partial-fill') return d.partialQty > 0;
    return true; // awaiting-stock always valid
  });

  /* ── Confirm handler ── */

  const handleConfirm = () => {
    setIsSubmitting(true);

    // Apply each decision to the store
    for (const [medId, d] of Object.entries(decisions)) {
      switch (d.decision) {
        case 'substitution':
          if (d.substitutionName.trim()) {
            addSubstitution(rx.id, medId, d.substitutionName.trim());
          }
          break;
        case 'partial-fill':
          if (d.partialQty > 0) {
            updateDispensedQty(rx.id, medId, d.partialQty);
          }
          break;
        case 'awaiting-stock':
          markMedAwaitingStock(rx.id, medId);
          break;
      }
    }

    // Save clinician note
    if (clinicianNote.trim()) {
      const existing = rx.pharmacistNotes || '';
      const combined = existing
        ? `${existing} | Note to doctor: ${clinicianNote.trim()}`
        : `Note to doctor: ${clinicianNote.trim()}`;
      updatePharmacistNotes(rx.id, combined);
    }

    setTimeout(() => {
      showToast('Updated prescription plan', 'success');
      navigate(`/ph/dispense/${rx.id}`, { replace: true });
    }, 300);
  };

  /* ── No OOS items → redirect back ── */
  if (oosMeds.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Out of Stock Options" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-[#38C172] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#1A1A1A]">All items resolved</p>
            <p className="text-xs text-[#8F9AA1] mt-1">
              No out-of-stock items remaining. Return to fill preparation.
            </p>
            <ABAButton
              variant="primary"
              className="mt-4"
              onClick={() => navigate(`/ph/dispense/${rx.id}`, { replace: true })}
            >
              Back to Fill Prescription
            </ABAButton>
          </div>
        </div>
        <PharmacyBottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Out of Stock Options" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-48">
        <div className="p-4 space-y-3">

          {/* ── Header banner ── */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FFF3DC] border border-[#FFB649]/20">
            <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#D97706]">
                {oosMeds.length} medication{oosMeds.length > 1 ? 's' : ''} out of stock
              </p>
              <p className="text-[10px] text-[#4A4F55] mt-0.5">
                Choose how to handle each item below. Changes apply when you confirm.
              </p>
            </div>
          </div>

          {/* ── OOS medication cards ── */}
          {oosMeds.map((med) => {
            const d = decisions[med.id];
            if (!d) return null;
            const suggestions = getSuggestions(med.name);

            return (
              <div
                key={med.id}
                className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden"
              >
                {/* Med header */}
                <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FDECEC] flex items-center justify-center flex-shrink-0">
                    <Pill className="w-4 h-4 text-[#E44F4F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{med.name}</p>
                    <p className="text-xs text-[#8F9AA1]">
                      {med.dosage} · {med.form} · Qty {med.quantity}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-[2px] rounded-full border flex-shrink-0 bg-[#FDECEC] text-[#E44F4F] border-[#E44F4F]/20">
                    <PackageX className="w-3 h-3" />
                    Out
                  </span>
                </div>

                {/* Decision options */}
                <div className="p-4 space-y-3">

                  {/* Option A: Substitution */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="mt-0.5">
                      <input
                        type="radio"
                        name={`decision-${med.id}`}
                        checked={d.decision === 'substitution'}
                        onChange={() => updateDecision(med.id, { decision: 'substitution' })}
                        className="sr-only peer"
                      />
                      <div className="w-[18px] h-[18px] rounded-full border-2 border-[#C9D0DB] peer-checked:border-[#32C28A] peer-checked:bg-[#32C28A] flex items-center justify-center transition-colors group-hover:border-[#8F9AA1]">
                        {d.decision === 'substitution' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-[#3A8DFF]" />
                        <span className="text-sm font-medium text-[#1A1A1A]">
                          Select substitution
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8F9AA1] mt-0.5">
                        Replace with an equivalent medication
                      </p>
                    </div>
                  </label>

                  {/* Substitution detail */}
                  {d.decision === 'substitution' && (
                    <div className="ml-[30px] space-y-2">
                      {/* Quick suggestions */}
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => updateDecision(med.id, { substitutionName: s })}
                            className={`text-[10px] font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
                              d.substitutionName === s
                                ? 'bg-[#32C28A] text-white border-[#32C28A]'
                                : 'bg-[#F7F9FC] text-[#4A4F55] border-[#E5E8EC] hover:bg-[#EBF3FF] hover:border-[#3A8DFF]/30'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      {/* Custom input */}
                      <input
                        type="text"
                        value={d.substitutionName}
                        onChange={(e) =>
                          updateDecision(med.id, { substitutionName: e.target.value })
                        }
                        placeholder="Or type a custom substitution…"
                        className="w-full h-10 px-3 rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] text-xs text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all"
                      />
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-[#F7F9FC]" />

                  {/* Option B: Partial fill */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="mt-0.5">
                      <input
                        type="radio"
                        name={`decision-${med.id}`}
                        checked={d.decision === 'partial-fill'}
                        onChange={() => updateDecision(med.id, { decision: 'partial-fill' })}
                        className="sr-only peer"
                      />
                      <div className="w-[18px] h-[18px] rounded-full border-2 border-[#C9D0DB] peer-checked:border-[#32C28A] peer-checked:bg-[#32C28A] flex items-center justify-center transition-colors group-hover:border-[#8F9AA1]">
                        {d.decision === 'partial-fill' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-[#D97706]" />
                        <span className="text-sm font-medium text-[#1A1A1A]">
                          Partial fill
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8F9AA1] mt-0.5">
                        Dispense available quantity now, patient returns for the rest
                      </p>
                    </div>
                  </label>

                  {/* Partial fill detail */}
                  {d.decision === 'partial-fill' && (
                    <div className="ml-[30px] flex items-center gap-3">
                      <label className="text-xs text-[#4A4F55] font-medium">
                        Qty to dispense now:
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            updateDecision(med.id, {
                              partialQty: Math.max(0, d.partialQty - 1),
                            })
                          }
                          className="w-8 h-8 rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] flex items-center justify-center text-[#4A4F55] hover:bg-[#E5E8EC] active:bg-[#C9D0DB] transition-colors text-sm font-bold disabled:opacity-40"
                          disabled={d.partialQty <= 0}
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold min-w-[32px] text-center text-[#1A1A1A]">
                          {d.partialQty}
                        </span>
                        <button
                          onClick={() =>
                            updateDecision(med.id, {
                              partialQty: Math.min(med.quantity, d.partialQty + 1),
                            })
                          }
                          className="w-8 h-8 rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] flex items-center justify-center text-[#4A4F55] hover:bg-[#E5E8EC] active:bg-[#C9D0DB] transition-colors text-sm font-bold"
                        >
                          +
                        </button>
                        <span className="text-xs text-[#C9D0DB] ml-1">/ {med.quantity}</span>
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-[#F7F9FC]" />

                  {/* Option C: Awaiting stock */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="mt-0.5">
                      <input
                        type="radio"
                        name={`decision-${med.id}`}
                        checked={d.decision === 'awaiting-stock'}
                        onChange={() => updateDecision(med.id, { decision: 'awaiting-stock' })}
                        className="sr-only peer"
                      />
                      <div className="w-[18px] h-[18px] rounded-full border-2 border-[#C9D0DB] peer-checked:border-[#32C28A] peer-checked:bg-[#32C28A] flex items-center justify-center transition-colors group-hover:border-[#8F9AA1]">
                        {d.decision === 'awaiting-stock' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#8F9AA1]" />
                        <span className="text-sm font-medium text-[#1A1A1A]">
                          Mark awaiting stock
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8F9AA1] mt-0.5">
                        Item will be held until stock is replenished
                      </p>
                    </div>
                  </label>

                  {d.decision === 'awaiting-stock' && (
                    <div className="ml-[30px]">
                      <div className="flex items-center gap-2 p-2.5 bg-[#F7F9FC] rounded-lg border border-[#E5E8EC]">
                        <Clock className="w-3.5 h-3.5 text-[#C9D0DB] flex-shrink-0" />
                        <p className="text-[10px] text-[#8F9AA1]">
                          Patient and doctor will be notified when stock is available.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* ── Notes to clinician ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <label className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <StickyNote className="w-3.5 h-3.5 text-[#C9D0DB]" />
              Notes to Doctor
              <span className="text-[#C9D0DB] font-normal">(optional)</span>
            </label>
            <textarea
              value={clinicianNote}
              onChange={(e) => setClinicianNote(e.target.value)}
              placeholder="e.g. Ferrous Sulphate unavailable — suggested Ferrous Fumarate pending your approval…"
              rows={3}
              className="w-full text-xs text-[#1A1A1A] placeholder:text-[#C9D0DB] bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-3 focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all resize-none"
            />
          </div>

          {/* ── Summary chips ── */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(decisions).map(([medId, d]) => {
              const med = oosMeds.find((m) => m.id === medId);
              if (!med) return null;
              const labels: Record<Decision, { text: string; bg: string; fg: string }> = {
                substitution: { text: 'Substitution', bg: 'bg-[#EBF3FF]', fg: 'text-[#3A8DFF]' },
                'partial-fill': { text: 'Partial fill', bg: 'bg-[#FFF3DC]', fg: 'text-[#D97706]' },
                'awaiting-stock': { text: 'Awaiting stock', bg: 'bg-[#F7F9FC]', fg: 'text-[#8F9AA1]' },
              };
              const l = labels[d.decision];
              return (
                <div
                  key={medId}
                  className={`text-[10px] font-medium px-2.5 py-1.5 rounded-lg ${l.bg} ${l.fg} flex items-center gap-1.5`}
                >
                  <span className="font-semibold truncate max-w-[120px]">{med.name}</span>
                  <span className="opacity-60">→</span>
                  <span>{l.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-16 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleConfirm}
            disabled={!canConfirm}
            isLoading={isSubmitting}
          >
            <CheckCircle2 className="w-5 h-5" />
            Confirm Changes
          </ABAButton>
          {!canConfirm && (
            <p className="text-[10px] text-[#8F9AA1] text-center mt-2">
              Complete all selections to confirm
            </p>
          )}
        </div>
      </div>

      {/* ── Bottom nav ── */}
      <PharmacyBottomNav />
    </div>
  );
}