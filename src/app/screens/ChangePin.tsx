import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

type Step = 'current' | 'new' | 'confirm';

export function ChangePin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  
  // Refs for inputs
  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);
  const input3Ref = useRef<HTMLInputElement>(null);
  const input4Ref = useRef<HTMLInputElement>(null);
  
  const CORRECT_PIN = '1234'; // Mock current PIN
  
  useEffect(() => {
    // Focus first input on mount and step change
    input1Ref.current?.focus();
    setError('');
  }, [step]);
  
  const getCurrentPinValue = () => {
    if (step === 'current') return currentPin;
    if (step === 'new') return newPin;
    return confirmPin;
  };
  
  const setCurrentPinValue = (value: string) => {
    if (step === 'current') setCurrentPin(value);
    else if (step === 'new') setNewPin(value);
    else setConfirmPin(value);
  };
  
  const handleDigitChange = (index: number, value: string) => {
    const pinValue = getCurrentPinValue();
    
    // Only allow single digit
    if (value.length > 1) {
      value = value[value.length - 1];
    }
    
    // Build new pin
    const newPinValue = 
      pinValue.substring(0, index) + 
      value + 
      pinValue.substring(index + 1);
    
    setCurrentPinValue(newPinValue);
    setError('');
    
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = [input1Ref, input2Ref, input3Ref, input4Ref][index + 1];
      nextInput?.current?.focus();
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !getCurrentPinValue()[index] && index > 0) {
      const prevInput = [input1Ref, input2Ref, input3Ref, input4Ref][index - 1];
      prevInput?.current?.focus();
    }
  };
  
  const checkWeakPin = (pin: string): string | null => {
    // Check for repeated digits
    if (/^(.)\1{3}$/.test(pin)) {
      return 'Avoid using repeated digits (e.g., 1111)';
    }
    // Check for sequential digits
    if (pin === '1234' || pin === '4321' || pin === '0123') {
      return 'Avoid using sequential digits (e.g., 1234)';
    }
    return null;
  };
  
  const handleContinue = () => {
    const pinValue = getCurrentPinValue();
    
    if (pinValue.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }
    
    if (step === 'current') {
      if (pinValue !== CORRECT_PIN) {
        setError('Incorrect PIN. Please try again.');
        setCurrentPin('');
        input1Ref.current?.focus();
        return;
      }
      setStep('new');
    } else if (step === 'new') {
      const weakness = checkWeakPin(pinValue);
      if (weakness) {
        setError(weakness);
        return;
      }
      setStep('confirm');
    } else {
      // Confirm step
      if (pinValue !== newPin) {
        setError('PINs do not match. Please try again.');
        setConfirmPin('');
        input1Ref.current?.focus();
        return;
      }
      // Success
      showToast('PIN updated successfully', 'success');
      navigate('/security-and-pin');
    }
  };
  
  const getStepTitle = () => {
    if (step === 'current') return 'Enter Current PIN';
    if (step === 'new') return 'Enter New PIN';
    return 'Confirm New PIN';
  };
  
  const getStepDescription = () => {
    if (step === 'current') return 'Verify your identity';
    if (step === 'new') return 'Choose a secure 4-digit PIN';
    return 'Enter your new PIN again';
  };
  
  const pinValue = getCurrentPinValue();
  
  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Change PIN"
        showBack
        onBackClick={() => navigate('/security-and-pin')}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            
            <div className={`w-2 h-2 rounded-full ${step === 'new' ? 'bg-aba-primary-main' : 'bg-aba-neutral-300'}`}></div>
            <div className={`w-2 h-2 rounded-full ${step === 'confirm' ? 'bg-aba-primary-main' : 'bg-aba-neutral-300'}`}></div>
          </div>
          
          {/* Card */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-6">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-aba-primary-50 flex items-center justify-center">
                <Lock className="w-8 h-8 text-aba-primary-main" />
              </div>
            </div>
            
            {/* Title */}
            <h2 className="font-bold text-aba-neutral-900 text-center mb-2 text-[16px]">
              {getStepTitle()}
            </h2>
            <p className="text-sm text-aba-neutral-600 text-center mb-8">
              {getStepDescription()}
            </p>
            
            {/* PIN Input */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={[input1Ref, input2Ref, input3Ref, input4Ref][index]}
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={1}
                  value={pinValue[index] || ''}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-aba-neutral-300 focus:border-aba-primary-main focus:outline-none transition-colors rounded-[14px]"
                />
              ))}
            </div>
            
            {/* Show/Hide PIN Toggle */}
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
                  <span className="text-[14px]">Show PIN</span>
                </>
              )}
            </button>
            
            {/* Error Message */}
            {error && (
              <div className="bg-aba-error-50 border border-aba-error-200 rounded-xl p-3 mb-6 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-aba-error-main mt-0.5 flex-shrink-0" />
                <p className="text-xs text-aba-error-main font-medium">{error}</p>
              </div>
            )}
            
            {/* Warning for weak PIN (only on new step) */}
            {step === 'new' && !error && (
              <div className="bg-aba-warning-50 border border-aba-warning-200 rounded-xl p-3 mb-6 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-aba-warning-main mt-0.5 flex-shrink-0" />
                <p className="text-xs text-aba-neutral-700">
                  Choose a PIN that's hard to guess. Avoid repeated or sequential numbers.
                </p>
              </div>
            )}
            
            {/* Continue Button */}
            <ABAButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleContinue}
              disabled={pinValue.length !== 4}
            >
              {step === 'confirm' ? 'Update PIN' : 'Continue'}
            </ABAButton>
          </div>
        </div>
      </div>
    </div>
  );
}