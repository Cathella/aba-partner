import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ABAButton } from '../components/aba/ABAButton';
import { PINInput } from '../components/aba/SpecialInputs';
import { showToast } from '../components/aba/Toast';
import { ArrowLeft, Lock, AlertCircle } from 'lucide-react';

export function StaffEnterPin() {
  const navigate = useNavigate();
  const [pinValue, setPinValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const handleVerify = () => {
    if (pinValue.length !== 4) {
      showToast('Please enter your 4-digit PIN', 'error');
      return;
    }

    setIsVerifying(true);

    // Simulate API call — accept any 4-digit PIN for prototype
    setTimeout(() => {
      setIsVerifying(false);
      showToast('PIN verified!', 'success');
      setTimeout(() => {
        navigate('/role-router');
      }, 500);
    }, 1000);
  };

  const handleForgotPin = () => {
    // Navigate to a simplified reset flow using the existing ResetPin pattern
    navigate('/staff-reset-pin');
  };

  return (
    <div className="min-h-screen bg-aba-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[390px]">
        {/* Back Button */}
        <button
          onClick={() => navigate('/staff-otp-verification')}
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
              Enter Your PIN
            </h1>
            <p className="text-sm text-aba-neutral-600">
              Enter your 4-digit security PIN to continue
            </p>
          </div>

          {/* PIN Label */}
          <div className="text-center mb-4 mt-6">
            <label className="text-sm font-medium text-aba-neutral-900">
              Security PIN
            </label>
          </div>

          {/* PIN Input */}
          <div className="mb-6">
            <PINInput
              value={pinValue}
              onChange={setPinValue}
              length={4}
              masked={true}
              error={attemptCount > 0}
            />
          </div>

          {/* Forgot PIN */}
          <div className="text-center mb-8">
            <button
              onClick={handleForgotPin}
              className="text-sm font-medium text-aba-secondary-main hover:underline"
            >
              Forgot PIN?
            </button>
          </div>

          {/* Verify Button */}
          <ABAButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleVerify}
            isLoading={isVerifying}
            disabled={pinValue.length !== 4}
          >
            Continue
          </ABAButton>

          {/* Attempt Warning */}
          {attemptCount > 0 && (
            <div className="mt-4 bg-aba-error-50 border border-aba-error-main/20 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-aba-error-main mt-0.5 flex-shrink-0" />
              <p className="text-xs text-aba-error-main">
                {attemptCount === 1
                  ? 'Incorrect PIN. Please try again.'
                  : `${attemptCount} failed attempts. Contact support if you need help.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
