/**
 * R-42 Collect Payment — Method cards: Aba Wallet (recommended), Cash,
 * Mobile Money (disabled / "Integration pending"), split payment toggle (wallet + cash).
 * CTA: Confirm Payment with "Processing…" loading state.
 * On success → R-43 Receipt. On wallet failure → R-44 Payment Failed.
 * Bottom nav present.
 */
import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ReceptionistBottomNav } from '../components/aba/ReceptionistBottomNav';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import {
  usePaymentsStore,
  fmtUGX,
  type PaymentMethod,
} from '../data/paymentsStore';
import {
  Wallet,
  Banknote,
  Smartphone,
  CheckCircle,
  Star,
  Lock,
  SplitSquareVertical,
  ArrowRight,
  Loader2,
  Info,
} from 'lucide-react';

/* ── method option ── */
interface MethodOption {
  id: PaymentMethod;
  label: string;
  desc: string;
  icon: React.ReactNode;
  recommended?: boolean;
  disabled?: boolean;
  disabledLabel?: string;
}

const methodOptions: MethodOption[] = [
  {
    id: 'wallet',
    label: 'Aba Wallet',
    desc: 'Debit from patient\'s Aba Wallet balance',
    icon: <Wallet className="w-5 h-5" />,
    recommended: true,
  },
  {
    id: 'cash',
    label: 'Cash',
    desc: 'Receive cash payment at the desk',
    icon: <Banknote className="w-5 h-5" />,
  },
  {
    id: 'mobile-money',
    label: 'Mobile Money',
    desc: 'MTN / Airtel Money',
    icon: <Smartphone className="w-5 h-5" />,
    disabled: true,
    disabledLabel: 'Integration pending',
  },
];

export function RCollectPayment() {
  const navigate = useNavigate();
  const { paymentId } = useParams<{ paymentId: string }>();
  const { getPaymentById, recordPayment, payments } = usePaymentsStore();

  const item = useMemo(
    () => (paymentId ? getPaymentById(paymentId) : undefined),
    [paymentId, payments]
  );

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitWallet, setSplitWallet] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const amountDue = item?.amountDue ?? 0;

  /* ── split cash = total − wallet portion ── */
  const walletPortion = splitEnabled ? Math.min(parseInt(splitWallet) || 0, amountDue) : amountDue;
  const cashPortion = splitEnabled ? Math.max(0, amountDue - walletPortion) : 0;

  const canConfirm = useMemo(() => {
    if (!selectedMethod) return false;
    if (splitEnabled) {
      const w = parseInt(splitWallet) || 0;
      return w > 0 && w < amountDue;
    }
    return true;
  }, [selectedMethod, splitEnabled, splitWallet, amountDue]);

  /* ── toggle split ── */
  const toggleSplit = useCallback(() => {
    if (!splitEnabled) {
      setSelectedMethod('split');
      setSplitWallet(String(Math.floor(amountDue / 2)));
    } else {
      setSelectedMethod(null);
      setSplitWallet('');
    }
    setSplitEnabled((v) => !v);
  }, [splitEnabled, amountDue]);

  /* ── select non-split method ── */
  const handleSelectMethod = (m: PaymentMethod) => {
    if (splitEnabled) return; // must toggle split off first
    setSelectedMethod(m);
  };

  /* ── confirm payment ── */
  const handleConfirm = () => {
    if (!item || !selectedMethod) return;
    setIsProcessing(true);

    // Simulate wallet failure ~20 % of the time for prototype
    const isWalletAttempt = selectedMethod === 'wallet' || selectedMethod === 'split';
    const willFail = isWalletAttempt && Math.random() < 0.2;

    setTimeout(() => {
      if (willFail) {
        setIsProcessing(false);
        navigate(`/r/payments/failed/${item.id}`);
        return;
      }

      recordPayment(item.id, {
        method: selectedMethod,
        splitWallet: splitEnabled ? walletPortion : undefined,
        splitCash: splitEnabled ? cashPortion : undefined,
      });
      showToast('Payment recorded successfully!', 'success');
      setIsProcessing(false);
      navigate(`/r/payments/receipt/${item.id}`);
    }, 2000);
  };

  if (!item) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Collect Payment" showBack onBackClick={() => navigate('/r/payments')} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-aba-neutral-600">Payment record not found.</p>
        </div>
        <ReceptionistBottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar
        title="Collect Payment"
        showBack
        onBackClick={() => navigate(`/r/payments/billing/${item.id}`)}
      />

      <div className="flex-1 overflow-y-auto pb-20">
        {/* ── Processing overlay ── */}
        {isProcessing && (
          <div className="fixed inset-0 z-50 bg-black/50 flex flex-col items-center justify-center">
            <div className="bg-aba-neutral-0 rounded-3xl p-8 max-w-[300px] mx-auto flex flex-col items-center text-center shadow-xl">
              <Loader2 className="w-10 h-10 text-aba-primary-main animate-spin mb-4" />
              <p className="text-base font-semibold text-aba-neutral-900 mb-1">Processing…</p>
              <p className="text-sm text-aba-neutral-600">
                {selectedMethod === 'wallet' || selectedMethod === 'split'
                  ? 'Connecting to Aba Wallet'
                  : 'Recording payment'}
              </p>
            </div>
          </div>
        )}

        <div className="p-4 space-y-4">

          {/* ── Amount header ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-5 text-center">
            <p className="text-xs text-aba-neutral-600 mb-1">Amount Due</p>
            <p className="text-2xl font-bold text-aba-neutral-900">{fmtUGX(amountDue)}</p>
            <p className="text-xs text-aba-neutral-400 mt-1">{item.patient} · {item.service}</p>
          </div>

          {/* ── Method cards ── */}
          <div>
            <h3 className="text-sm font-semibold text-aba-neutral-900 mb-3">
              Select Payment Method
            </h3>
            <div className="space-y-3">
              {methodOptions.map((m) => {
                const isSelected = !splitEnabled && selectedMethod === m.id;
                const isDisabled = m.disabled || splitEnabled;

                return (
                  <button
                    key={m.id}
                    onClick={() => !isDisabled && handleSelectMethod(m.id)}
                    disabled={isDisabled}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-aba-primary-main bg-aba-primary-50'
                        : m.disabled
                        ? 'border-aba-neutral-200 bg-aba-neutral-100/50 opacity-60 cursor-not-allowed'
                        : splitEnabled
                        ? 'border-aba-neutral-200 bg-aba-neutral-100/50 opacity-50'
                        : 'border-aba-neutral-200 bg-aba-neutral-0 hover:bg-aba-neutral-100'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-aba-primary-main text-white'
                          : m.disabled
                          ? 'bg-aba-neutral-200 text-aba-neutral-400'
                          : 'bg-aba-neutral-100 text-aba-neutral-700'
                      }`}
                    >
                      {m.disabled ? <Lock className="w-5 h-5" /> : m.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-aba-neutral-900">{m.label}</p>
                        {m.recommended && !m.disabled && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-aba-primary-main/15 text-aba-primary-main">
                            <Star className="w-3 h-3" />
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-aba-neutral-600 truncate">{m.desc}</p>
                      {m.disabled && m.disabledLabel && (
                        <p className="text-[10px] font-medium text-aba-warning-main mt-0.5">
                          {m.disabledLabel}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-aba-primary-main flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Split payment toggle ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SplitSquareVertical className="w-5 h-5 text-[#8B5CF6]" />
                <div>
                  <p className="text-sm font-semibold text-aba-neutral-900">Split Payment</p>
                  <p className="text-xs text-aba-neutral-600">Wallet + Cash combined</p>
                </div>
              </div>
              <button
                onClick={toggleSplit}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  splitEnabled ? 'bg-aba-primary-main' : 'bg-aba-neutral-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    splitEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Split fields */}
            {splitEnabled && (
              <div className="mt-4 space-y-3">
                <div className="bg-aba-neutral-100/50 rounded-xl p-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-aba-secondary-main flex-shrink-0" />
                  <p className="text-xs text-aba-neutral-600">
                    Enter the Wallet portion — the rest is Cash.
                  </p>
                </div>

                {/* Wallet portion */}
                <div>
                  <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                    Wallet Portion (UGX)
                  </label>
                  <input
                    type="number"
                    value={splitWallet}
                    onChange={(e) => setSplitWallet(e.target.value)}
                    placeholder={String(Math.floor(amountDue / 2))}
                    className="w-full h-10 px-4 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-sm text-aba-neutral-900 placeholder:text-aba-neutral-400 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main/30 focus:border-aba-secondary-main transition-all"
                    min={1}
                    max={amountDue - 1}
                  />
                </div>

                {/* Split summary */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-aba-primary-50 rounded-xl p-3 text-center">
                    <Wallet className="w-4 h-4 text-aba-primary-main mx-auto mb-1" />
                    <p className="text-[10px] text-aba-neutral-600">Wallet</p>
                    <p className="text-sm font-bold text-aba-neutral-900">
                      {fmtUGX(walletPortion)}
                    </p>
                  </div>
                  <div className="flex-1 bg-aba-success-50 rounded-xl p-3 text-center">
                    <Banknote className="w-4 h-4 text-aba-success-main mx-auto mb-1" />
                    <p className="text-[10px] text-aba-neutral-600">Cash</p>
                    <p className="text-sm font-bold text-aba-neutral-900">
                      {fmtUGX(cashPortion)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Confirm CTA ── */}
          <div className="pt-1">
            <ABAButton
              variant="primary"
              size="lg"
              fullWidth
              disabled={!canConfirm}
              onClick={handleConfirm}
            >
              <CreditCardIcon />
              Confirm Payment
              <ArrowRight className="w-4 h-4" />
            </ABAButton>
          </div>
        </div>
      </div>

      <ReceptionistBottomNav />
    </div>
  );
}

function CreditCardIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}