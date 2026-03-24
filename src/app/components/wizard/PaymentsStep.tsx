import { ABAButton } from '../aba/ABAButton';
import { CreditCard, Smartphone, Wallet, Clock, CheckCircle2, Info } from 'lucide-react';

interface PaymentsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function PaymentsStep({ onNext, onBack }: PaymentsStepProps) {
  const paymentMethods = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: 'Mobile Money',
      description: 'MTN, Airtel Money',
      enabled: true,
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Card Payments',
      description: 'Visa, Mastercard',
      enabled: true,
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      title: 'Cash',
      description: 'In-person payments',
      enabled: true,
    },
  ];

  return (
    <div className="p-4 space-y-6 pb-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-aba-neutral-900 mb-2">
          Payments & Settlement
        </h2>
        <p className="text-sm text-aba-neutral-600">
          Review available payment options for your clinic
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-aba-secondary-50 border border-aba-secondary-main/20 rounded-xl p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-aba-secondary-main flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-aba-neutral-900 mb-1">
              Payment Processing Enabled
            </p>
            <p className="text-xs text-aba-neutral-700">
              Your clinic is pre-configured to accept multiple payment methods. You can customize these settings later.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-aba-neutral-900">
          Available Payment Methods
        </h3>
        {paymentMethods.map((method, index) => (
          <div
            key={index}
            className="bg-aba-neutral-0 border border-aba-neutral-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-aba-success-50 flex items-center justify-center text-aba-success-main">
                {method.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-aba-neutral-900">
                  {method.title}
                </h4>
                <p className="text-xs text-aba-neutral-600 mt-0.5">
                  {method.description}
                </p>
              </div>
              <div className="w-6 h-6 rounded-full bg-aba-success-main flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Settlement Info */}
      <div className="bg-aba-neutral-0 border border-aba-neutral-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-aba-primary-50 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-aba-primary-main" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-aba-neutral-900 mb-1">
              Settlement Timeline
            </h4>
            <p className="text-xs text-aba-neutral-700 mb-3">
              Payments are automatically processed and settled to your clinic wallet within <span className="font-semibold text-aba-neutral-900">24–48 hours</span> after transaction completion.
            </p>
            <div className="bg-aba-neutral-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-aba-primary-main"></div>
                <span className="text-aba-neutral-700">Transaction fees: 2.5% + UGX 500</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-aba-primary-main"></div>
                <span className="text-aba-neutral-700">Instant settlement available for premium accounts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Preview */}
      <div className="bg-gradient-to-br from-aba-primary-main to-aba-primary-100 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-5 h-5" />
          <h4 className="text-sm font-semibold">Clinic Wallet</h4>
        </div>
        <div className="mb-1">
          <p className="text-xs opacity-90">Available Balance</p>
          <p className="text-2xl font-bold">UGX 0</p>
        </div>
        <p className="text-xs opacity-75 mt-2">
          Your wallet will be activated after clinic approval
        </p>
      </div>

      {/* Support Note */}
      <div className="bg-aba-neutral-50 rounded-xl p-4">
        <p className="text-xs text-aba-neutral-700 text-center">
          Need custom payment options? <button className="font-medium text-aba-secondary-main hover:underline">Contact Support</button>
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <ABAButton
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onBack}
        >
          Back
        </ABAButton>
        <ABAButton
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={onNext}
        >
          Continue
        </ABAButton>
      </div>
    </div>
  );
}
