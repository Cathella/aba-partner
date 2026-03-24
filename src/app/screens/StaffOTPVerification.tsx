import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ABAButton } from '../components/aba/ABAButton';
import { OTPInput } from '../components/aba/SpecialInputs';
import { showToast } from '../components/aba/Toast';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export function StaffOTPVerification() {
  const navigate = useNavigate();
  const [otpValue, setOtpValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const phone = sessionStorage.getItem('staffPhone') || '+256 700 ***';

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerify = async () => {
    if (otpValue.length !== 6) {
      showToast('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    setIsVerifying(true);

    // Simulate API call
    setTimeout(() => {
      setIsVerifying(false);

      if (otpValue.length === 6) {
        showToast('OTP verified successfully!', 'success');
        setTimeout(() => {
          navigate('/staff-enter-pin');
        }, 500);
      } else {
        showToast('Invalid OTP. Please try again.', 'error');
        setOtpValue('');
      }
    }, 1500);
  };

  const handleResend = () => {
    if (!canResend) return;

    setTimer(60);
    setCanResend(false);
    setOtpValue('');
    showToast('OTP sent successfully!', 'success');
  };

  return (
    <div className="min-h-screen bg-aba-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[390px]">
        {/* Back Button */}
        <button
          onClick={() => navigate('/staff-sign-in')}
          className="flex items-center gap-2 text-aba-neutral-700 mb-6 hover:text-aba-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="bg-aba-neutral-0 rounded-3xl p-8 shadow-xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-aba-secondary-50 flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-aba-neutral-900" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-aba-neutral-900 mb-2">
              Verify Your Identity
            </h1>
            <p className="text-sm text-aba-neutral-600">
              Enter the 6-digit code sent to{' '}
              <span className="font-semibold text-aba-neutral-900">{phone}</span>
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <OTPInput
              value={otpValue}
              onChange={setOtpValue}
              length={6}
              error={false}
            />
          </div>

          {/* Timer / Resend */}
          <div className="text-center mb-8">
            {!canResend ? (
              <p className="text-sm text-aba-neutral-600">
                Resend code in{' '}
                <span className="font-semibold text-aba-primary-main">
                  {timer}s
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm font-medium text-aba-secondary-main hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>

          {/* Verify Button */}
          <ABAButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleVerify}
            isLoading={isVerifying}
            disabled={otpValue.length !== 6}
          >
            Verify
          </ABAButton>
        </div>
      </div>
    </div>
  );
}
