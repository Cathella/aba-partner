/**
 * PH-07 Completed Rx Detail — Read-only view of a dispensed prescription.
 *
 * Shows dispense time, pharmacist name, all timestamps, patient info,
 * medications dispensed, and pharmacist notes.
 *
 * Buttons: "Print Label" and "Share" (placeholders).
 * Back to Completed list.
 * Bottom nav present.
 */
import { useNavigate, useParams } from 'react-router';
import { ABAButton } from '../components/aba/ABAButton';
import { AppTopBar } from '../components/aba/AppTopBar';
import { PHStatusChip } from '../components/aba/PHStatusChip';
import { PHMedItemRow } from '../components/aba/PHMedItemRow';
import { PharmacyBottomNav } from '../components/aba/PharmacyBottomNav';
import { showToast } from '../components/aba/Toast';
import { usePharmacistStore } from '../data/pharmacistStore';
import { copyToClipboard } from '../utils/clipboard';
import {
  User,
  Pill,
  Stethoscope,
  ShieldCheck,
  CreditCard,
  FileText,
  ArrowLeft,
  Printer,
  Share2,
  Clock,
  UserCheck,
  CalendarCheck,
  Package,
} from 'lucide-react';

export function PHCompletedDetail() {
  const navigate = useNavigate();
  const { rxId } = useParams<{ rxId: string }>();
  const { getRxById } = usePharmacistStore();

  const rx = getRxById(rxId || '');

  if (!rx) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Prescription Detail" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Prescription not found</p>
        </div>
        <PharmacyBottomNav />
      </div>
    );
  }

  /* ── Timeline ── */
  const timeline: { label: string; time: string; icon: React.ReactNode; accent: string }[] = [];
  timeline.push({
    label: 'Prescribed',
    time: rx.prescribedAt,
    icon: <Stethoscope className="w-3.5 h-3.5" />,
    accent: 'text-[#3A8DFF]',
  });
  if (rx.startedAt) {
    timeline.push({
      label: 'Started filling',
      time: rx.startedAt,
      icon: <Pill className="w-3.5 h-3.5" />,
      accent: 'text-[#FFB649]',
    });
  }
  if (rx.readyAt) {
    timeline.push({
      label: 'Ready for pickup',
      time: rx.readyAt,
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      accent: 'text-[#32C28A]',
    });
  }
  if (rx.dispensedAt) {
    timeline.push({
      label: 'Dispensed',
      time: rx.dispensedAt,
      icon: <CalendarCheck className="w-3.5 h-3.5" />,
      accent: 'text-[#38C172]',
    });
  }

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Completed Prescription" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-56">
        <div className="p-4 space-y-3">

          {/* ── Dispensed success banner ── */}
          {rx.status === 'completed' && rx.dispensedAt && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#E9F8F0] border border-[#38C172]/20">
              <div className="w-10 h-10 rounded-full bg-[#E9F8F0] flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#38C172]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#38C172]">Dispensed Successfully</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-[#4A4F55]">
                    <Clock className="w-3 h-3 text-[#8F9AA1]" />
                    {rx.dispensedAt}
                  </span>
                  {rx.dispensedBy && (
                    <span className="flex items-center gap-1 text-xs text-[#4A4F55]">
                      <UserCheck className="w-3 h-3 text-[#8F9AA1]" />
                      {rx.dispensedBy}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Patient card ── */}
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
                  {rx.patientPhone ? ` · ${rx.patientPhone}` : ''}
                </p>
              </div>
              <PHStatusChip status={rx.status} />
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E8EC] text-xs text-[#8F9AA1]">
              <Stethoscope className="w-3.5 h-3.5 flex-shrink-0" />
              Prescribed by {rx.prescribedBy}
            </div>
          </div>

          {/* ── Timeline ── */}
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
                      idx === timeline.length - 1 ? 'bg-[#E9F8F0]' : 'bg-[#F7F9FC]'
                    } ${entry.accent}`}
                  >
                    {entry.icon}
                  </div>
                  <div className={`${idx === timeline.length - 1 ? 'pb-0' : 'pb-4'}`}>
                    <p className="text-sm font-medium text-[#1A1A1A]">{entry.label}</p>
                    <p className="text-xs text-[#8F9AA1]">{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Dispensed Medications ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#32C28A]" />
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Dispensed Medications
              </h3>
            </div>
            {rx.medications.map((med) => (
              <PHMedItemRow key={med.id} med={med} />
            ))}
          </div>

          {/* ── Payment ── */}
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

          {/* ── Inventory updated note ── */}
          {rx.status === 'completed' && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#F7F9FC] border border-[#E5E8EC]">
              <Package className="w-4 h-4 text-[#32C28A] flex-shrink-0" />
              <p className="text-xs text-[#8F9AA1]">
                Inventory updated.
              </p>
            </div>
          )}

          {/* ── Pharmacist notes ── */}
          {rx.pharmacistNotes && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-3.5 h-3.5 text-[#C9D0DB]" />
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Pharmacist Notes
                </h3>
              </div>
              <p className="text-sm text-[#4A4F55] leading-relaxed">
                {rx.pharmacistNotes}
              </p>
            </div>
          )}

          {/* ── Clinical notes ── */}
          {rx.clinicalNotes && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-3.5 h-3.5 text-[#C9D0DB]" />
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

      {/* ── Sticky actions ── */}
      <div className="fixed bottom-16 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4 space-y-2">
          {/* Action buttons row */}
          <div className="flex gap-2">
            <ABAButton
              variant="secondary"
              fullWidth
              onClick={() => {
                showToast('Label sent to printer', 'success');
              }}
            >
              <Printer className="w-4 h-4" />
              Print Label
            </ABAButton>
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => {
                const text = `Dispensed: ${rx.patientName}\nPrescription #${rx.id}\nItems: ${rx.medications.length}`;
                copyToClipboard(text);
                showToast('Details copied to clipboard', 'success');
              }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </ABAButton>
          </div>

          {/* Back to Completed */}
          <ABAButton
            variant="primary"
            fullWidth
            onClick={() => navigate('/ph/completed', { replace: true })}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Completed
          </ABAButton>
        </div>
      </div>

      {/* ── Bottom nav ── */}
      <PharmacyBottomNav />
    </div>
  );
}