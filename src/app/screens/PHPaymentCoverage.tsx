/**
 * PH-05 Payment & Coverage — View payment status, coverage, and trigger actions.
 *
 * Layout:
 *   Title: "Payment & Coverage" + back
 *   Patient summary card
 *   Coverage card (mock data):
 *     – Package coverage: Covered / Not covered
 *     – Co-pay amount
 *     – Wallet balance
 *   Medication cost breakdown
 *   Payment status chip: Paid / Pending / Waived
 *   Buttons:
 *     – "Notify Reception to Collect Payment" (secondary) → toast
 *     – "Put Prescription On Hold" (warning) → on-hold status → PH-01
 *     – "Mark Paid" (secondary, prototype only)
 *
 * Bottom nav present.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { PHStatusChip } from '../components/aba/PHStatusChip';
import { PHConfirmModal } from '../components/aba/PHConfirmModal';
import { PharmacyBottomNav } from '../components/aba/PharmacyBottomNav';
import { showToast } from '../components/aba/Toast';
import { pushNotification } from '../data/notificationStore';
import {
  usePharmacistStore,
  putOnHold,
  markPaid,
} from '../data/pharmacistStore';
import {
  User,
  CreditCard,
  ShieldCheck,
  Wallet,
  Receipt,
  Bell,
  PauseCircle,
  BadgeCheck,
  Pill,
  CheckCircle2,
} from 'lucide-react';

/* ── Mock coverage data per patient ── */
interface CoverageInfo {
  packageName: string;
  appliedPackage: string;
  isCovered: boolean;
  coverageResult: 'Covered' | 'Discount applied' | 'Out-of-pocket';
  approvalStatus: 'Requested' | 'Approved' | 'Declined' | 'Timed out' | 'Failed';
  copayPercent: number;
  copayAmount: string;
  walletBalance: string;
  remainingBalance: string;
  totalCost: string;
  coveredAmount: string;
  patientOwes: string;
}

function getMockCoverage(rxId: string, isMember?: boolean, paymentAmount?: string): CoverageInfo {
  if (isMember) {
    return {
      packageName: 'ABA Family Health Plan',
      appliedPackage: 'Pharmacy Only',
      isCovered: true,
      coverageResult: 'Covered',
      approvalStatus: 'Approved',
      copayPercent: 20,
      copayAmount: paymentAmount || 'UGX 5,000',
      walletBalance: 'UGX 120,000',
      remainingBalance: 'UGX 95,000',
      totalCost: paymentAmount ? `UGX ${(parseInt(paymentAmount.replace(/[^0-9]/g, '')) * 5).toLocaleString()}` : 'UGX 125,000',
      coveredAmount: paymentAmount ? `UGX ${(parseInt(paymentAmount.replace(/[^0-9]/g, '')) * 4).toLocaleString()}` : 'UGX 100,000',
      patientOwes: paymentAmount || 'UGX 25,000',
    };
  }
  return {
    packageName: 'None',
    appliedPackage: 'N/A',
    isCovered: false,
    coverageResult: 'Out-of-pocket',
    approvalStatus: 'Declined',
    copayPercent: 100,
    copayAmount: paymentAmount || 'UGX 12,000',
    walletBalance: 'N/A',
    remainingBalance: 'N/A',
    totalCost: paymentAmount || 'UGX 12,000',
    coveredAmount: 'UGX 0',
    patientOwes: paymentAmount || 'UGX 12,000',
  };
}

/* ── Payment status config ── */
const paymentStatusConfig: Record<
  'paid' | 'pending' | 'waived',
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  paid: {
    label: 'Paid',
    bg: 'bg-[#E9F8F0]',
    text: 'text-[#38C172]',
    border: 'border-[#38C172]/20',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  pending: {
    label: 'Pending',
    bg: 'bg-[#FFF3DC]',
    text: 'text-[#D97706]',
    border: 'border-[#D97706]/20',
    icon: <CreditCard className="w-4 h-4" />,
  },
  waived: {
    label: 'Waived',
    bg: 'bg-[#EBF3FF]',
    text: 'text-[#3A8DFF]',
    border: 'border-[#3A8DFF]/20',
    icon: <BadgeCheck className="w-4 h-4" />,
  },
};

export function PHPaymentCoverage() {
  const navigate = useNavigate();
  const { rxId } = useParams<{ rxId: string }>();
  const { getRxById } = usePharmacistStore();

  const rx = getRxById(rxId || '');

  const [holdModal, setHoldModal] = useState(false);
  const [isHolding, setIsHolding] = useState(false);

  /* ── Not found ── */
  if (!rx) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Payment & Coverage" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Prescription not found</p>
        </div>
        <PharmacyBottomNav />
      </div>
    );
  }

  const coverage = getMockCoverage(rx.id, rx.isMember, rx.paymentAmount);
  const psCfg = paymentStatusConfig[rx.paymentStatus];
  const isPending = rx.paymentStatus === 'pending';
  const isPaid = rx.paymentStatus === 'paid';

  /* ── Handlers ── */

  const handleNotifyReception = () => {
    pushNotification(
      'reception',
      'Pharmacist',
      'Payment Collection Needed',
      `Payment required for ${rx.patientName}'s prescription (${rx.medications.length} items).`,
      `/r/payments`
    );
    showToast('Reception notified — payment collection requested', 'success');
  };

  const handleHoldConfirm = () => {
    setIsHolding(true);
    setTimeout(() => {
      putOnHold(rx.id, 'On Hold (Payment)');
      showToast('Prescription on hold — awaiting payment', 'warning');
      navigate('/ph/queue', { replace: true });
    }, 400);
  };

  const handleMarkPaid = () => {
    markPaid(rx.id);
    showToast('Payment recorded (prototype)', 'success');
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Payment & Coverage" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-48">
        <div className="p-4 space-y-3">

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
                  {rx.patientPhone ? ` · ${rx.patientPhone}` : ''}
                </p>
              </div>
              <PHStatusChip status={rx.status} />
            </div>
          </div>

          {/* ── Payment status banner ── */}
          <div className={`flex items-center gap-3 p-4 rounded-2xl border ${psCfg.bg} ${psCfg.border}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${psCfg.bg}`}>
              <span className={psCfg.text}>{psCfg.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${psCfg.text}`}>
                Payment {psCfg.label}
              </p>
              <p className="text-xs text-[#4A4F55] mt-0.5">
                {isPaid
                  ? 'This prescription has been fully paid.'
                  : rx.paymentStatus === 'waived'
                  ? 'Payment has been waived for this prescription.'
                  : 'Payment has not yet been collected.'}
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${psCfg.bg} ${psCfg.text} ${psCfg.border}`}
            >
              {psCfg.label}
            </span>
          </div>

          {/* ── Coverage card ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#32C28A]" />
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Coverage & Approval
              </h3>
            </div>

            <div className="p-4 space-y-3">
              {/* Approval status */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F9AA1]">Approval</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    coverage.approvalStatus === 'Approved'
                      ? 'bg-[#E9F8F0] text-[#38C172]'
                      : coverage.approvalStatus === 'Requested'
                      ? 'bg-[#FFF3DC] text-[#D97706]'
                      : coverage.approvalStatus === 'Timed out'
                      ? 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'
                      : 'bg-[#FDECEC] text-[#E44F4F]'
                  }`}
                >
                  {coverage.approvalStatus}
                </span>
              </div>

              {/* Coverage result */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F9AA1]">Coverage</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    coverage.coverageResult === 'Covered'
                      ? 'bg-[#E9F8F0] text-[#38C172]'
                      : coverage.coverageResult === 'Discount applied'
                      ? 'bg-[#EBF3FF] text-[#3A8DFF]'
                      : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'
                  }`}
                >
                  {coverage.coverageResult}
                </span>
              </div>

              {/* Applied Package */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F9AA1]">Applied Package</span>
                <span className="text-sm font-medium text-[#1A1A1A]">
                  {coverage.appliedPackage}
                </span>
              </div>

              {/* Separator */}
              <div className="border-t border-[#F7F9FC]" />

              {/* Co-pay */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F9AA1]">Co-pay ({coverage.copayPercent}%)</span>
                <span className="text-sm font-medium text-[#1A1A1A]">
                  {coverage.copayAmount}
                </span>
              </div>

              {/* Wallet balance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-[#8F9AA1]" />
                  <span className="text-xs text-[#8F9AA1]">Wallet Balance</span>
                </div>
                <span className="text-sm font-medium text-[#1A1A1A]">
                  {coverage.walletBalance}
                </span>
              </div>

              {/* Remaining balance */}
              {coverage.isCovered && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8F9AA1]">Remaining Balance</span>
                  <span className="text-sm font-medium text-[#32C28A]">
                    {coverage.remainingBalance}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Cost breakdown card ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#3A8DFF]" />
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Cost Breakdown
              </h3>
            </div>

            {/* Medication line items */}
            <div className="divide-y divide-[#F7F9FC]">
              {rx.medications.map((med) => {
                // Mock per-item cost
                const unitCost = Math.round(
                  parseInt(coverage.totalCost.replace(/[^0-9]/g, '')) / Math.max(rx.medications.length, 1)
                );
                return (
                  <div key={med.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Pill className="w-3.5 h-3.5 text-[#3A8DFF] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#1A1A1A] truncate">
                          {med.substitution || med.name}
                        </p>
                        <p className="text-[10px] text-[#8F9AA1]">
                          {med.dosage} · Qty {med.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[#1A1A1A] flex-shrink-0">
                      UGX {unitCost.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="px-4 py-3 bg-[#F7F9FC] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F9AA1]">Total Cost</span>
                <span className="text-xs font-medium text-[#1A1A1A]">{coverage.totalCost}</span>
              </div>
              {coverage.isCovered && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8F9AA1]">Covered by Plan</span>
                  <span className="text-xs font-medium text-[#38C172]">
                    −{coverage.coveredAmount}
                  </span>
                </div>
              )}
              <div className="border-t border-[#E5E8EC] pt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1A1A1A]">Patient Owes</span>
                <span className="text-sm font-semibold text-[#1A1A1A]">
                  {coverage.patientOwes}
                </span>
              </div>
            </div>
          </div>

          {/* ── Prescriber reference ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#8F9AA1]">Prescribed by</p>
              <p className="text-sm font-medium text-[#1A1A1A] mt-0.5">{rx.prescribedBy}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#8F9AA1]">Prescription ID</p>
              <p className="text-sm font-medium text-[#1A1A1A] mt-0.5">{rx.id.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky actions ── */}
      <div className="fixed bottom-16 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4 space-y-2">
          {/* Notify Reception */}
          {isPending && (
            <ABAButton variant="secondary" fullWidth onClick={handleNotifyReception}>
              <Bell className="w-4 h-4" />
              Notify Reception to Collect Payment
            </ABAButton>
          )}

          {/* Mark Paid (prototype) */}
          {isPending && (
            <ABAButton variant="outline" fullWidth onClick={handleMarkPaid}>
              <BadgeCheck className="w-4 h-4" />
              Mark Paid
              <span className="text-[10px] font-normal text-[#C9D0DB] ml-1">(prototype)</span>
            </ABAButton>
          )}

          {/* Put On Hold */}
          {isPending && (
            <button
              onClick={() => setHoldModal(true)}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-[6px] border-2 border-[#D97706]/40 bg-[#FFF3DC] text-sm font-semibold text-[#D97706] hover:bg-[#FFE9B8] active:bg-[#FFD88A] transition-colors"
            >
              <PauseCircle className="w-4 h-4" />
              Put Prescription On Hold
            </button>
          )}

          {/* When already paid or waived, show a return button */}
          {!isPending && (
            <ABAButton variant="primary" fullWidth onClick={() => navigate(-1)}>
              <CheckCircle2 className="w-4 h-4" />
              Return to Prescription
            </ABAButton>
          )}
        </div>
      </div>

      {/* ── Bottom nav ── */}
      <PharmacyBottomNav />

      {/* ── Hold confirmation modal ── */}
      <PHConfirmModal
        isOpen={holdModal}
        onClose={() => setHoldModal(false)}
        icon={<PauseCircle className="w-7 h-7 text-[#D97706]" />}
        iconBg="bg-[#FFF3DC]"
        title="Put Prescription On Hold?"
        description={`${rx.patientName}'s prescription will be placed on hold pending payment. The queue will show the updated status.`}
        confirmText="Confirm Hold"
        onConfirm={handleHoldConfirm}
        isLoading={isHolding}
      />
    </div>
  );
}