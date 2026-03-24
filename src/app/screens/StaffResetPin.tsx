import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { Lock, AlertCircle, Eye, EyeOff, Smartphone } from 'lucide-react';

type Step = 'otp' | 'new' | 'confirm';

export function StaffResetPin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('otp');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);
  const input3Ref = useRef<HTMLInputElement>(null);
  const input4Ref = useRef<HTMLInputElement>(null);
  const input5Ref = useRef<HTMLInputElement>(null);
  const input6Ref = useRef<HTMLInputElement>(null);

  const CORRECT_OTP = '123456';
  const phone = sessionStorage.getItem('staffPhone') || '+256 700 ***';

  useEffect(() => {
    input1Ref.current?.focus();
    setError('');
  }, [step]);

  useEffect(() => {
    if (step === 'otp' && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, resendTimer]);

  const getCurrentValue = () => {
    if (step === 'otp') return otp;
    if (step === 'new') return newPin;
    return confirmPin;
  };

  const setCurrentValue = (value: string) => {
    if (step === 'otp') setOtp(value);
    else if (step === 'new') setNewPin(value);
    else setConfirmPin(value);
  };

  const getInputRefs = () => {
    if (step === 'otp') {
      return [input1Ref, input2Ref, input3Ref, input4Ref, input5Ref, input6Ref];
    }
    return [input1Ref, input2Ref, input3Ref, input4Ref];
  };

  const getMaxLength = () => (step === 'otp' ? 6 : 4);

  const handleDigitChange = (index: number, value: string) => {
    const currentValue = getCurrentValue();
    if (value.length > 1) value = value[value.length - 1];

    const newValue =
      currentValue.substring(0, index) +
      value +
      currentValue.substring(index + 1);

    setCurrentValue(newValue);
    setError('');

    const refs = getInputRefs();
    if (value && index < refs.length - 1) {
      refs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !getCurrentValue()[index] && index > 0) {
      const refs = getInputRefs();
      refs[index - 1]?.current?.focus();
    }
  };

  const handleContinue = () => {
    const value = getCurrentValue();
    const maxLength = getMaxLength();

    if (value.length !== maxLength) {
      setError(
        `Please enter a ${maxLength}-digit ${step === 'otp' ? 'OTP' : 'PIN'}`
      );
      return;
    }

    if (step === 'otp') {
      if (value !== CORRECT_OTP) {
        setError('Incorrect OTP. Please try again.');
        setOtp('');
        input1Ref.current?.focus();
        return;
      }
      setStep('new');
    } else if (step === 'new') {
      if (/^(.)\1{3}$/.test(value) || value === '1234' || value === '4321') {
        setError('Avoid repeated or sequential digits');
        return;
      }
      setStep('confirm');
    } else {
      if (value !== newPin) {
        setError('PINs do not match. Please try again.');
        setConfirmPin('');
        input1Ref.current?.focus();
        return;
      }
      showToast('PIN reset successfully', 'success');
      navigate('/staff-enter-pin');
    }
  };

  const handleResendOtp = () => {
    setResendTimer(30);
    showToast('OTP resent to your phone', 'success');
  };

  const getStepTitle = () => {
    if (step === 'otp') return 'Verify Your Phone';
    if (step === 'new') return 'Create New PIN';
    return 'Confirm New PIN';
  };

  const getStepDescription = () => {
    if (step === 'otp') return `Enter the 6-digit code sent to ${phone}`;
    if (step === 'new') return 'Choose a secure 4-digit PIN';
    return 'Enter your new PIN again';
  };

  const currentValue = getCurrentValue();
  const inputRefs = getInputRefs();

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar
        title="Reset PIN"
        showBack
        onBackClick={() => navigate('/staff-enter-pin')}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            
            <div
              className={`w-2 h-2 rounded-full ${
                step === 'new' ? 'bg-aba-primary-main' : 'bg-aba-neutral-300'
              }`}
            />
            <div
              className={`w-2 h-2 rounded-full ${
                step === 'confirm'
                  ? 'bg-aba-primary-main'
                  : 'bg-aba-neutral-300'
              }`}
            />
          </div>

          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-6">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  step === 'otp' ? 'bg-aba-secondary-50' : 'bg-aba-primary-50'
                }`}
              >
                {step === 'otp' ? (
                  <Smartphone className="w-8 h-8 text-aba-secondary-main" />
                ) : (
                  <Lock className="w-8 h-8 text-aba-primary-main" />
                )}
              </div>
            </div>

            <h2 className="text-xl font-bold text-aba-neutral-900 text-center mb-2">
              {getStepTitle()}
            </h2>
            <p className="text-sm text-aba-neutral-600 text-center mb-8">
              {getStepDescription()}
            </p>

            {/* Input */}
            <div className="flex justify-center gap-2 mb-6">
              {inputRefs.map((ref, index) => (
                <input
                  key={index}
                  ref={ref}
                  type={step === 'otp' || showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={1}
                  value={currentValue[index] || ''}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`${ step === 'otp' ? 'w-12 h-12 text-xl' : 'w-14 h-14 text-2xl' } text-center font-bold border-2 border-aba-neutral-300 focus:border-aba-primary-main focus:outline-none transition-colors rounded-[14px] px-[0px] py-[28px]`}
                />
              ))}
            </div>

            {step !== 'otp' && (
              <button
                onClick={() => setShowPin(!showPin)}
                className="flex items-center justify-center gap-2 text-xs text-aba-neutral-600 hover:text-aba-neutral-900 mx-auto mb-6 transition-colors"
              >
                {showPin ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Hide PIN</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Show PIN</span>
                  </>
                )}
              </button>
            )}

            {step === 'otp' && (
              <div className="flex justify-center mb-6">
                {resendTimer > 0 ? (
                  <p className="text-xs text-aba-neutral-600">
                    Resend code in {resendTimer}s
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="text-aba-secondary-main font-semibold hover:text-aba-secondary-main/80 transition-colors text-[14px]"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="bg-aba-error-50 border border-aba-error-main/20 rounded-xl p-3 mb-6 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-aba-error-main mt-0.5 flex-shrink-0" />
                <p className="text-xs text-aba-error-main font-medium">
                  {error}
                </p>
              </div>
            )}

            {step === 'new' && !error && (
              <div className="bg-aba-warning-50 border border-aba-warning-main/20 rounded-xl p-3 mb-6 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-aba-warning-main mt-0.5 flex-shrink-0" />
                <p className="text-xs text-aba-neutral-700">
                  Choose a PIN that's hard to guess. Avoid repeated or
                  sequential numbers.
                </p>
              </div>
            )}

            <ABAButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleContinue}
              disabled={currentValue.length !== getMaxLength()}
            >
              {step === 'confirm'
                ? 'Save New PIN'
                : step === 'otp'
                ? 'Verify'
                : 'Continue'}
            </ABAButton>
          </div>
        </div>
      </div>
    </div>
  );
}
