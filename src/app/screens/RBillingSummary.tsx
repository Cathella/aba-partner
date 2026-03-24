/**
 * R-41 Billing Summary — Line items, total, member coverage snippet, CTA: Collect Payment.
 * If already paid → shows receipt info instead of CTA.
 * Inside page — no bottom nav.
 */
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { ABABadge } from '../components/aba/ABABadge';
import { usePaymentsStore, fmtUGX } from '../data/paymentsStore';
import {
  User,
  Phone,
  Receipt,
  ShieldCheck,
  CreditCard,
  Clock,
  Hash,
  Calendar,
  Stethoscope,
  ArrowRight,
} from 'lucide-react';

export function RBillingSummary() {
  const navigate = useNavigate();
  const { paymentId } = useParams<{ paymentId: string }>();
  const { getPaymentById, payments } = usePaymentsStore();

  const item = useMemo(() => {
    return paymentId ? getPaymentById(paymentId) : undefined;
  }, [paymentId, payments]);

  if (!item) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Billing" showBack onBackClick={() => navigate('/r/payments')} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-aba-neutral-600">Payment record not found.</p>
        </div>
      </div>
    );
  }

  const isPaid = item.status === 'paid';
  const isPending = item.status === 'pending';
  const isFailed = item.status === 'failed';

  const statusBadge = isPaid
    ? { label: 'Paid', variant: 'success' as const }
    : isPending
    ? { label: 'Pending', variant: 'neutral' as const }
    : isFailed
    ? { label: 'Failed', variant: 'error' as const }
    : { label: 'Unpaid', variant: 'warning' as const };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Billing Summary" showBack onBackClick={() => navigate('/r/payments')} />

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="p-4 space-y-4">

          {/* ── Patient card ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-aba-secondary-main" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-aba-neutral-900">{item.patient}</p>
                  <p className="text-xs text-aba-neutral-600">{item.phone}</p>
                </div>
              </div>
              <ABABadge variant={statusBadge.variant} size="sm">
                {statusBadge.label}
              </ABABadge>
            </div>
            <div className="flex items-center gap-4 text-xs text-aba-neutral-600 pt-2 border-t border-aba-neutral-200">
              <span className="flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5" />
                {item.service}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {item.visitDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {item.visitTime}
              </span>
            </div>
          </div>

          {/* ── Line items ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
            <div className="px-4 py-3 bg-aba-neutral-100/50 border-b border-aba-neutral-200 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-aba-neutral-600" />
              <h4 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">
                Invoice Items
              </h4>
            </div>
            <div className="p-4">
              {item.items.map((li) => (
                <div
                  key={li.id}
                  className="flex items-start justify-between py-2.5 border-b border-aba-neutral-200 last:border-b-0"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-sm text-aba-neutral-900">{li.description}</p>
                    <p className="text-xs text-aba-neutral-400">
                      {li.qty} × {fmtUGX(li.unitPrice)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-aba-neutral-900 flex-shrink-0">
                    {fmtUGX(li.total)}
                  </p>
                </div>
              ))}

              {/* Subtotal */}
              <div className="flex items-center justify-between pt-3 mt-1 border-t border-aba-neutral-200">
                <p className="text-sm text-aba-neutral-600">Subtotal</p>
                <p className="text-sm font-medium text-aba-neutral-900">{fmtUGX(item.subtotal)}</p>
              </div>

              {/* Coverage deduction */}
              {item.coverage && (
                <div className="flex items-center justify-between py-1">
                  <p className="text-sm text-aba-success-main">
                    Coverage ({item.coverage.percentage}%)
                  </p>
                  <p className="text-sm font-medium text-aba-success-main">
                    −{fmtUGX(item.coverage.amount)}
                  </p>
                </div>
              )}

              {/* Total due */}
              <div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-aba-neutral-900/10">
                <p className="text-sm font-bold text-aba-neutral-900">Amount Due</p>
                <p className="text-lg font-bold text-aba-neutral-900">{fmtUGX(item.amountDue)}</p>
              </div>
            </div>
          </div>

          {/* ── Coverage & Approval card ── */}
          {item.coverage && (() => {
            const isCovered = item.coverage.percentage >= 100;
            const hasDiscount = !isCovered && item.coverage.percentage > 0;
            const coverageResult = isCovered ? 'Covered' : hasDiscount ? 'Discount applied' : 'Out-of-pocket';
            const approvalStatus = 'Approved' as const;
            const appliedPackage = item.coverage.percentage >= 50 ? 'Care Bundle' : 'Consultation Only';
            const remainingBal = `UGX ${(150000 - item.coverage.amount).toLocaleString()}`;
            return (
              <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-aba-neutral-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-aba-primary-main" />
                  <h4 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">
                    Coverage & Approval
                  </h4>
                </div>
                <div className="p-4 space-y-3">
                  {/* Approval status */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-aba-neutral-600">Approval</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-aba-success-50 text-aba-success-main">
                      {approvalStatus}
                    </span>
                  </div>
                  {/* Coverage result */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-aba-neutral-600">Coverage</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      coverageResult === 'Covered'
                        ? 'bg-aba-success-50 text-aba-success-main'
                        : coverageResult === 'Discount applied'
                        ? 'bg-aba-secondary-50 text-aba-secondary-main'
                        : 'bg-aba-neutral-100 text-aba-neutral-600 border border-aba-neutral-200'
                    }`}>
                      {coverageResult}
                    </span>
                  </div>
                  {/* Applied Package */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-aba-neutral-600">Applied Package</span>
                    <span className="text-sm font-medium text-aba-neutral-900">{appliedPackage}</span>
                  </div>
                  {/* Separator */}
                  <div className="border-t border-aba-neutral-100" />
                  {/* Provider + Member ID */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-aba-neutral-600">Provider</span>
                    <span className="text-sm font-medium text-aba-neutral-900">{item.coverage.provider}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-aba-neutral-600">Member ID</span>
                    <span className="text-sm font-medium text-aba-neutral-900">{item.coverage.memberId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-aba-neutral-600">Coverage Amount</span>
                    <span className="text-sm font-medium text-aba-primary-main">
                      {item.coverage.percentage}% — {fmtUGX(item.coverage.amount)}
                    </span>
                  </div>
                  {/* Remaining balance */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-aba-neutral-600">Remaining Balance</span>
                    <span className="text-sm font-medium text-aba-primary-main">{remainingBal}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── Paid info (if already paid) ── */}
          {isPaid && (
            <div className="bg-aba-success-50/50 rounded-2xl border border-aba-success-main/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-aba-success-main" />
                <h4 className="text-sm font-semibold text-aba-neutral-900">Payment Recorded</h4>
              </div>
              <div className="space-y-1.5 text-xs text-aba-neutral-700">
                <div className="flex justify-between">
                  <span>Method</span>
                  <span className="font-medium text-aba-neutral-900 capitalize">
                    {item.method === 'mobile-money' ? 'Mobile Money' : item.method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Paid at</span>
                  <span className="font-medium text-aba-neutral-900">{item.paidAt}</span>
                </div>
                {item.reference && (
                  <div className="flex justify-between">
                    <span>Reference</span>
                    <span className="font-medium font-mono text-aba-neutral-900">{item.reference}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CTAs ── */}
          <div className="space-y-3 pt-1">
            {!isPaid && (
              <ABAButton
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate(`/r/payments/collect/${item.id}`)}
              >
                <CreditCard className="w-5 h-5" />
                Collect Payment
                <ArrowRight className="w-4 h-4" />
              </ABAButton>
            )}

            {isPaid && (
              <ABAButton
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate(`/r/payments/receipt/${item.id}`)}
              >
                <Receipt className="w-5 h-5" />
                View Receipt
              </ABAButton>
            )}

            {(isPending || isFailed) && (
              <ABAButton
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => navigate(`/r/payments/collect/${item.id}`)}
              >
                <CreditCard className="w-5 h-5" />
                Retry Payment
              </ABAButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}