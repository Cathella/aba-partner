/**
 * R-43 Receipt — Receipt card: amount, method, date/time, reference.
 * Buttons: Share, Print (placeholders). CTA: Done → R-40.
 * Bottom nav present.
 */
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { copyToClipboard } from '../utils/clipboard';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ReceptionistBottomNav } from '../components/aba/ReceptionistBottomNav';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { usePaymentsStore, fmtUGX } from '../data/paymentsStore';
import {
  CheckCircle2,
  Receipt,
  Wallet,
  Banknote,
  Smartphone,
  DollarSign,
  Clock,
  Hash,
  Calendar,
  User,
  Share2,
  Printer,
  Home,
  SplitSquareVertical,
} from 'lucide-react';

/* ── method label + icon ── */
function methodMeta(method?: string): { label: string; icon: React.ReactNode } {
  switch (method) {
    case 'wallet':
      return { label: 'Aba Wallet', icon: <Wallet className="w-5 h-5 text-aba-primary-main" /> };
    case 'cash':
      return { label: 'Cash', icon: <Banknote className="w-5 h-5 text-aba-success-main" /> };
    case 'mobile-money':
      return { label: 'Mobile Money', icon: <Smartphone className="w-5 h-5 text-aba-secondary-main" /> };
    case 'split':
      return { label: 'Split (Wallet + Cash)', icon: <SplitSquareVertical className="w-5 h-5 text-[#8B5CF6]" /> };
    default:
      return { label: 'Unknown', icon: <DollarSign className="w-5 h-5 text-aba-neutral-600" /> };
  }
}

export function RReceipt() {
  const navigate = useNavigate();
  const { paymentId } = useParams<{ paymentId: string }>();
  const { getPaymentById, payments } = usePaymentsStore();

  const item = useMemo(
    () => (paymentId ? getPaymentById(paymentId) : undefined),
    [paymentId, payments]
  );

  if (!item) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Receipt" showBack onBackClick={() => navigate('/r/payments')} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-aba-neutral-600">Receipt not found.</p>
        </div>
        <ReceptionistBottomNav />
      </div>
    );
  }

  const { label: methodLabel, icon: methodIcon } = methodMeta(item.method);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Payment Receipt',
        text: `Receipt for ${item.patient} — ${fmtUGX(item.amountDue)}`,
      }).catch(() => {});
    } else {
      copyToClipboard(
        `Receipt #${item.reference ?? item.id}\nPatient: ${item.patient}\nAmount: ${fmtUGX(item.amountDue)}\nMethod: ${methodLabel}\nDate: ${item.visitDate}`
      );
      showToast('Receipt copied to clipboard', 'success');
    }
  };

  const handlePrint = () => {
    showToast('Preparing print view…', 'info');
    setTimeout(() => window.print(), 300);
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Receipt" showBack onBackClick={() => navigate(`/r/payments/billing/${item.id}`)} />

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">

          {/* ── Success banner ── */}
          <div className="flex flex-col items-center text-center pt-4 pb-2">
            <div className="w-16 h-16 rounded-full bg-aba-success-50 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8 text-aba-success-main" />
            </div>
            <p className="text-lg font-semibold text-aba-neutral-900">Payment Successful</p>
            <p className="text-sm text-aba-neutral-600 mt-0.5">
              {item.patient}'s payment has been recorded.
            </p>
          </div>

          {/* ── Receipt card ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-aba-neutral-100/50 border-b border-aba-neutral-200 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-aba-neutral-600" />
              <h4 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">
                Payment Receipt
              </h4>
            </div>

            <div className="p-4 space-y-0">
              {/* Amount */}
              <div className="text-center py-4 border-b border-dashed border-aba-neutral-200">
                <p className="text-xs text-aba-neutral-600 mb-1">Amount Paid</p>
                <p className="text-3xl font-bold text-aba-neutral-900">
                  {fmtUGX(item.amountDue)}
                </p>
              </div>

              {/* Details */}
              <div className="py-3 space-y-3">
                <ReceiptRow
                  icon={<User className="w-4 h-4" />}
                  label="Patient"
                  value={item.patient}
                />
                <ReceiptRow
                  icon={methodIcon}
                  label="Method"
                  value={methodLabel}
                />
                {item.method === 'split' && item.splitWallet !== undefined && (
                  <>
                    <ReceiptRow
                      icon={<Wallet className="w-4 h-4 text-aba-primary-main" />}
                      label="  Wallet Portion"
                      value={fmtUGX(item.splitWallet)}
                    />
                    <ReceiptRow
                      icon={<Banknote className="w-4 h-4 text-aba-success-main" />}
                      label="  Cash Portion"
                      value={fmtUGX(item.splitCash ?? 0)}
                    />
                  </>
                )}
                <ReceiptRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Date"
                  value={item.visitDate}
                />
                <ReceiptRow
                  icon={<Clock className="w-4 h-4" />}
                  label="Time"
                  value={item.paidAt ?? '—'}
                />
                <ReceiptRow
                  icon={<Hash className="w-4 h-4" />}
                  label="Reference"
                  value={item.reference ?? '—'}
                  mono
                />
              </div>

              {/* Dotted separator */}
              <div className="border-t border-dashed border-aba-neutral-200" />

              {/* Service */}
              <div className="pt-3">
                <p className="text-xs text-aba-neutral-600 mb-1">Service</p>
                <p className="text-sm font-medium text-aba-neutral-900">{item.service}</p>
                {item.coverage && (() => {
                  const isFull = item.coverage.percentage >= 100;
                  const hasPartial = !isFull && item.coverage.percentage > 0;
                  const resultLabel = isFull ? 'Covered' : hasPartial ? 'Discount applied' : 'Out-of-pocket';
                  return (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`text-[10px] font-semibold px-1.5 py-[1px] rounded-full ${
                        resultLabel === 'Covered'
                          ? 'bg-aba-success-50 text-aba-success-main'
                          : resultLabel === 'Discount applied'
                          ? 'bg-aba-secondary-50 text-aba-secondary-main'
                          : 'bg-aba-neutral-100 text-aba-neutral-600'
                      }`}>
                        {resultLabel}
                      </span>
                      <span className="text-xs text-aba-primary-main">
                        {item.coverage.percentage}% by {item.coverage.provider}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex gap-3">
            <ABAButton
              variant="outline"
              size="md"
              fullWidth
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              Share
            </ABAButton>
            <ABAButton
              variant="outline"
              size="md"
              fullWidth
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4" />
              Print
            </ABAButton>
          </div>

          {/* ── Done CTA ── */}
          <ABAButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/r/payments')}
          >
            <Home className="w-5 h-5" />
            Done
          </ABAButton>
        </div>
      </div>

      <ReceptionistBottomNav />
    </div>
  );
}

/* ── Receipt detail row ── */
function ReceiptRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-aba-neutral-600">
        <span className="flex-shrink-0">{icon}</span>
        <span className="text-xs">{label}</span>
      </div>
      <span
        className={`text-sm font-medium text-aba-neutral-900 ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}