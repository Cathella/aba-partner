import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ABAButton } from '../components/aba/ABAButton';
import { InputField } from '../components/aba/InputField';
import { Phone, ArrowRight } from 'lucide-react';

export function StaffSignIn() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    // Store phone for OTP screen context
    sessionStorage.setItem('staffPhone', phoneNumber);
    navigate('/staff-otp-verification');
  };

  return (
    <div className="min-h-screen bg-aba-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[390px]">
        <div className="bg-aba-neutral-0 rounded-3xl p-8 shadow-xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-aba-secondary-50 flex items-center justify-center">
              <Phone className="w-10 h-10 text-aba-neutral-900" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-aba-neutral-900 mb-2">
              Staff Sign-in
            </h1>
            <p className="text-sm text-aba-neutral-600">
              Enter your registered phone number to continue
            </p>
          </div>

          {/* Phone Input */}
          <div className="mb-6">
            <InputField
              label="Phone Number"
              type="tel"
              inputMode="numeric"
              placeholder="+256 700 000 000"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (error) setError('');
              }}
              leftIcon={<Phone className="w-5 h-5" />}
              error={error}
              helperText="We'll send you a verification code"
            />
          </div>

          {/* Continue Button */}
          <ABAButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleContinue}
            disabled={!phoneNumber}
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </ABAButton>

          {/* Invite Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm font-medium text-aba-secondary-main hover:underline"
            >
              I have an invite instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
