/**
 * AC-08 Refund / Void Request — Prefilled refund form for a specific transaction.
 * Reached from AC-03 "Request Refund / Void" danger button.
 *
 * Layout:
 *   - Prefilled summary (patient, amount, method, reference)
 *   - Refund type: Full Refund / Partial Refund / Void
 *   - Reason textarea (required)
 *   - Authorisation note (prototype: auto-approved)
 *   - Submit CTA
 *
 * Inner page: back arrow, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { ACStatusChip } from '../components/aba/ACStatusChip';
import { showToast } from '../components/aba/Toast';
import { useAccountantStore, formatUGX, markRefunded } from '../data/accountantStore';
import type { ACPaymentMethod } from '../data/accountantStore';
import {
  Banknote,
  Smartphone,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Ban,
  AlertTriangle,
} from 'lucide-react';

const methodLabel: Record<ACPaymentMethod, string> = {
  cash: 'Cash',
  'mobile-money': 'Aba Wallet',
  card: 'Card',
  insurance: 'Corporate',
};

const methodIcon: Record<ACPaymentMethod, React.ReactNode> = {
  cash: <Banknote className="w-4 h-4 text-[#38C172]" />,
  'mobile-money': <Smartphone className="w-4 h-4 text-[#3A8DFF]" />,
  card: <CreditCard className="w-4 h-4 text-[#D97706]" />,
  insurance: <ShieldCheck className="w-4 h-4 text-[#8B5CF6]" />,
};

type RefundType = 'full' | 'partial' | 'void';

const refundTypes: { key: RefundType; label: string; desc: string; icon: React.ReactNode; iconBg: string }[] = [
  {
    key: 'full',
    label: 'Full Refund',
    desc: 'Refund the entire amount to the patient',
    icon: <RotateCcw className="w-5 h-5 text-[#8B5CF6]" />,
    iconBg: 'bg-[#F5F3FF]',
  },
  {
    key: 'partial',
    label: 'Partial Refund',
    desc: 'Refund a portion of the amount',
    icon: <RotateCcw className="w-5 h-5 text-[#3A8DFF]" />,
    iconBg: 'bg-[#E8F2FF]',
  },
  {
    key: 'void',
    label: 'Void Transaction',
    desc: 'Cancel the transaction entirely',
    icon: <Ban className="w-5 h-5 text-[#E44F4F]" />,
    iconBg: 'bg-[#FDECEC]',
  },
];

export function ACRefundRequest() {
  const navigate = useNavigate();
  const { txId } = useParams<{ txId: string }>();
  const { getTransactionById } = useAccountantStore();
  const tx = getTransactionById(txId || '');

  const [type, setType] = useState<RefundType>('full');
  const [reason, setReason] = useState('');
  const [partialAmount, setPartialAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!tx) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Refund Request" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Transaction not found</p>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!reason.trim()) {
      showToast('Please provide a reason for this refund', 'error');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      markRefunded(tx.id, reason);
      setIsSubmitting(false);
      setSubmitted(true);
      showToast('Refund request submitted successfully', 'success');
    }, 600);
  };

  /* ── Success state ── */
  if (submitted) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Refund Request" showBack onBackClick={() => navigate('/ac/transactions')} />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-6 w-full text-center">
            <div className="w-16 h-16 rounded-full bg-[#E9F8F0] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#38C172]" />
            </div>
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-1">
              {type === 'void' ? 'Void Processed' : 'Refund Submitted'}
            </h2>
            <p className="text-sm text-[#8F9AA1] mb-2">
              {type === 'void'
                ? `Transaction ${tx.reference} has been voided.`
                : `${formatUGX(type === 'partial' ? (parseInt(partialAmount.replace(/,/g, ''), 10) || 0) : tx.amount)} will be refunded to ${tx.patientName}.`}
            </p>
            <ACStatusChip status="refunded" size="md" />

            <div className="mt-6 space-y-2">
              <ABAButton variant="primary" fullWidth onClick={() => navigate(`/ac/transaction/${tx.id}`)}>
                View Transaction
              </ABAButton>
              <ABAButton variant="outline" fullWidth onClick={() => navigate('/ac/transactions')}>
                Back to Transactions
              </ABAButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Request Refund / Void" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-4 space-y-3">

          {/* ── Prefilled summary ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">Transaction</span>
              <ACStatusChip status={tx.status} size="sm" />
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F9AA1]">Patient</span>
                <span className="text-sm font-medium text-[#1A1A1A]">{tx.patientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F9AA1]">Amount</span>
                <span className="text-sm font-bold text-[#1A1A1A]">{formatUGX(tx.amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F9AA1]">Method</span>
                <span className="inline-flex items-center gap-1.5 text-sm text-[#1A1A1A]">
                  {methodIcon[tx.method]}
                  {methodLabel[tx.method]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8F9AA1]">Reference</span>
                <span className="text-xs font-medium text-[#4A4F55]">{tx.reference}</span>
              </div>
            </div>
          </div>

          {/* ── Refund type selector ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-3">
              Refund Type
            </h3>
            <div className="space-y-2">
              {refundTypes.map((rt) => {
                const isActive = type === rt.key;
                return (
                  <button
                    key={rt.key}
                    onClick={() => setType(rt.key)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-colors text-left ${
                      isActive
                        ? 'border-[#32C28A] bg-[#DFF7EE]/40'
                        : 'border-[#E5E8EC] bg-[#FFFFFF] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'border-[#32C28A] bg-[#32C28A]' : 'border-[#C9D0DB]'
                    }`}>
                      {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className={`w-9 h-9 rounded-xl ${rt.iconBg} flex items-center justify-center flex-shrink-0`}>
                      {rt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A]">{rt.label}</p>
                      <p className="text-xs text-[#8F9AA1]">{rt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Partial amount (if partial) ── */}
          {type === 'partial' && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-3">
                Refund Amount
              </h3>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8F9AA1]">UGX</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={partialAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setPartialAmount(raw ? parseInt(raw, 10).toLocaleString('en-UG') : '');
                  }}
                  placeholder="0"
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] text-lg font-semibold text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all"
                />
              </div>
              <p className="text-xs text-[#8F9AA1] mt-2">
                Maximum refundable: {formatUGX(tx.amount)}
              </p>
            </div>
          )}

          {/* ── Reason ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-3">
              Reason <span className="text-[#E44F4F]">*</span>
            </h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Describe the reason for this refund or void..."
              className="w-full rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] p-3 text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all resize-none"
            />
          </div>

          {/* ── Authorisation note ── */}
          <div className="bg-[#FFF3DC] rounded-2xl border border-[#FFB649]/15 p-4 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide mb-1">
                Authorisation
              </p>
              <p className="text-sm text-[#4A4F55] leading-relaxed">
                This refund will be auto-approved in prototype mode.
                In production, refunds above UGX 100,000 require Facility Admin approval.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4 space-y-2">
          <ABAButton
            variant="destructive"
            fullWidth
            size="lg"
            onClick={handleSubmit}
            disabled={!reason.trim()}
            isLoading={isSubmitting}
          >
            <RotateCcw className="w-5 h-5" />
            {type === 'void' ? 'Void Transaction' : 'Submit Refund Request'}
          </ABAButton>
          <ABAButton variant="outline" fullWidth onClick={() => navigate(-1)}>
            Cancel
          </ABAButton>
        </div>
      </div>
    </div>
  );
}