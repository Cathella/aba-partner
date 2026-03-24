import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ABAButton } from '../components/aba/ABAButton';
import { PINInput } from '../components/aba/SpecialInputs';
import { showToast } from '../components/aba/Toast';
import { LogIn, User } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [pinValue, setPinValue] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const handleSignIn = () => {
    if (pinValue.length !== 4) {
      showToast('Please enter your 4-digit PIN', 'error');
      return;
    }

    setIsSigningIn(true);

    // Simulate API call
    setTimeout(() => {
      const savedPin = localStorage.getItem('userPin');
      
      if (pinValue === savedPin) {
        showToast('Welcome back!', 'success');
        setTimeout(() => {
          navigate('/setup-wizard');
        }, 500);
      } else {
        setAttemptCount((prev) => prev + 1);
        showToast('Incorrect PIN. Please try again.', 'error');
        setPinValue('');
        setIsSigningIn(false);
      }
    }, 1000);
  };

  const handleForgotPin = () => {
    // In a real app, this would navigate to a password reset flow
    showToast('Password reset link sent to your email', 'warning');
  };

  return (
    <div className="min-h-screen bg-aba-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[390px]">
        <div className="bg-aba-neutral-0 rounded-3xl p-8 shadow-xl">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-aba-primary-main to-aba-primary-100 flex items-center justify-center shadow-lg">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-2">
            <h1 className="text-2xl font-semibold text-aba-neutral-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-sm text-aba-neutral-600">
              Mukono Family Clinic
            </p>
          </div>

          {/* User Info */}
          <div className="bg-aba-neutral-100 rounded-2xl p-4 mb-8 mt-6">
            <p className="text-sm text-aba-neutral-700 text-center">
              Signing in as <span className="font-semibold text-aba-neutral-900">Facility Admin</span>
            </p>
          </div>

          {/* PIN Label */}
          <div className="text-center mb-4">
            <label className="text-sm font-medium text-aba-neutral-900">
              Enter your PIN
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

          {/* Sign In Button */}
          <ABAButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSignIn}
            isLoading={isSigningIn}
            disabled={pinValue.length !== 4}
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </ABAButton>

          {/* Attempt Warning */}
          {attemptCount > 0 && (
            <div className="mt-4 bg-aba-error-50 border border-aba-error-main/20 rounded-xl p-3">
              <p className="text-xs text-aba-error-main text-center">
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