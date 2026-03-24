/**
 * R-44 Payment Pending / Failed — "Wallet connection unstable" message.
 * CTAs: Retry → R-42, Mark as Pending → back to R-40.
 * Bottom nav present.
 */
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ReceptionistBottomNav } from '../components/aba/ReceptionistBottomNav';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { usePaymentsStore } from '../data/paymentsStore';
import {
  WifiOff,
  RefreshCcw,
  Clock,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';

export function RPaymentFailed() {
  const navigate = useNavigate();
  const { paymentId } = useParams<{ paymentId: string }>();
  const { markPending } = usePaymentsStore();

  const handleRetry = () => {
    if (paymentId) {
      navigate(`/r/payments/collect/${paymentId}`);
    }
  };

  const handleMarkPending = () => {
    if (paymentId) {
      markPending(paymentId);
      showToast('Payment marked as pending', 'warning');
      navigate('/r/payments');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Payment Issue" showBack onBackClick={() => navigate('/r/payments')} />

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-5">

          {/* ── Illustration & message ── */}
          <div className="flex flex-col items-center text-center pt-8 pb-2">
            <div className="w-20 h-20 rounded-full bg-aba-error-50 flex items-center justify-center mb-4 relative">
              <WifiOff className="w-9 h-9 text-aba-error-main" />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-aba-warning-50 border-2 border-aba-neutral-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-aba-warning-main" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-aba-neutral-900 mb-2">
              Payment Failed
            </h2>
            <p className="text-sm text-aba-neutral-600 max-w-[280px]">
              Wallet connection unstable. The payment could not be processed at this time.
            </p>
          </div>

          {/* ── Info card ── */}
          <div className="bg-aba-warning-50/50 rounded-2xl border border-aba-warning-main/20 p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-aba-warning-main flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-xs text-aba-neutral-700">
                <p>
                  <span className="font-semibold">What happened?</span> The connection to the
                  patient's Aba Wallet timed out. No funds were deducted.
                </p>
                <p>
                  <span className="font-semibold">What can you do?</span>
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    <span className="font-medium">Retry</span> — attempt the wallet charge again.
                  </li>
                  <li>
                    <span className="font-medium">Mark as Pending</span> — save the bill and
                    collect later when connectivity improves.
                  </li>
                  <li>
                    Go back and choose <span className="font-medium">Cash</span> instead.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* ── CTAs ── */}
          <div className="space-y-3 pt-2">
            <ABAButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleRetry}
            >
              <RefreshCcw className="w-5 h-5" />
              Retry Payment
            </ABAButton>

            <ABAButton
              variant="outline"
              size="lg"
              fullWidth
              onClick={handleMarkPending}
            >
              <Clock className="w-5 h-5" />
              Mark as Pending
            </ABAButton>
          </div>

        </div>
      </div>

      <ReceptionistBottomNav />
    </div>
  );
}
