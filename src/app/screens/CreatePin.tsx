import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ABAButton } from '../components/aba/ABAButton';
import { PINInput } from '../components/aba/SpecialInputs';
import { showToast } from '../components/aba/Toast';
import { ArrowLeft, Lock } from 'lucide-react';

export function CreatePin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pinValue, setPinValue] = useState('');
  const [confirmPinValue, setConfirmPinValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = () => {
    if (step === 'create') {
      if (pinValue.length !== 4) {
        showToast('Please enter a 4-digit PIN', 'error');
        return;
      }
      setStep('confirm');
      setConfirmPinValue('');
    } else {
      // Confirm step
      if (confirmPinValue.length !== 4) {
        showToast('Please confirm your PIN', 'error');
        return;
      }

      if (pinValue !== confirmPinValue) {
        showToast('PINs do not match. Please try again.', 'error');
        setConfirmPinValue('');
        return;
      }

      // Save PIN
      setIsSaving(true);
      setTimeout(() => {
        // Simulate API call
        localStorage.setItem('userPin', pinValue);
        setIsSaving(false);
        showToast('PIN saved successfully!', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 500);
      }, 1000);
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('create');
      setConfirmPinValue('');
    } else {
      navigate(-1);
    }
  };

  const currentValue = step === 'create' ? pinValue : confirmPinValue;
  const setValue = step === 'create' ? setPinValue : setConfirmPinValue;

  return (
    <div className="min-h-screen bg-aba-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[390px]">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-aba-neutral-700 mb-6 hover:text-aba-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="bg-aba-neutral-0 rounded-3xl p-8 shadow-xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-aba-primary-50 flex items-center justify-center">
              <Lock className="w-10 h-10 text-aba-neutral-900" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-2">
            <h1 className="text-2xl font-semibold text-aba-neutral-900 mb-2">
              {step === 'create' ? 'Create Your PIN' : 'Confirm Your PIN'}
            </h1>
            <p className="text-sm text-aba-neutral-600 mb-6">
              {step === 'create'
                ? 'Use this PIN for quick sign-in'
                : 'Enter your PIN again to confirm'}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex gap-2 justify-center mb-8">
            <div
              className={`h-1 flex-1 rounded-full transition-colors ${
                step === 'create' ? 'bg-aba-primary-main' : 'bg-aba-success-main'
              }`}
            />
            <div
              className={`h-1 flex-1 rounded-full transition-colors ${
                step === 'confirm' ? 'bg-aba-primary-main' : 'bg-aba-neutral-200'
              }`}
            />
          </div>

          {/* PIN Input */}
          <div className="mb-8">
            <PINInput
              value={currentValue}
              onChange={setValue}
              length={4}
              masked={true}
              error={false}
            />
          </div>

          {/* Helper Text */}
          <div className="bg-aba-secondary-50 rounded-2xl p-4 mb-8">
            <p className="text-xs text-aba-neutral-700 text-center">
              Choose a PIN you can easily remember but others can't guess. Avoid simple patterns like 1234.
            </p>
          </div>

          {/* Continue Button */}
          <ABAButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleContinue}
            isLoading={isSaving}
            disabled={currentValue.length !== 4}
          >
            {step === 'create' ? 'Continue' : 'Save PIN'}
          </ABAButton>
        </div>
      </div>
    </div>
  );
}