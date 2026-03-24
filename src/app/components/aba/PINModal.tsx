import { useState, useEffect } from 'react';
import { ABAModal } from './ABAModal';
import { Lock, AlertCircle } from 'lucide-react';

interface PINModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  description?: string;
}

export function PINModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
}: PINModalProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all digits are entered
    if (index === 3 && value) {
      const fullPin = [...newPin.slice(0, 3), value].join('');
      if (fullPin.length === 4) {
        handleSubmit(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (fullPin?: string) => {
    const pinToCheck = fullPin || pin.join('');
    
    if (pinToCheck.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    setIsSubmitting(true);

    // Simulate PIN verification (in real app, this would call an API)
    setTimeout(() => {
      // For demo purposes, accept any 4-digit PIN
      // In production, verify against the actual admin PIN
      if (pinToCheck.length === 4) {
        onSuccess();
      } else {
        setError('Invalid PIN. Please try again.');
        setPin(['', '', '', '']);
        const firstInput = document.getElementById('pin-0');
        firstInput?.focus();
      }
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <ABAModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        {/* Description */}
        {description && (
          <p className="text-sm text-aba-neutral-600 text-center">{description}</p>
        )}

        {/* PIN Input */}
        <div className="flex justify-center gap-3 py-4">
          {pin.map((digit, index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isSubmitting}
              className={`w-14 h-14 text-center text-2xl font-bold rounded-md border-2 transition-all ${
                error
                  ? 'border-aba-error-main bg-aba-error-50'
                  : 'border-aba-neutral-300 bg-white focus:border-aba-primary-main focus:ring-2 focus:ring-aba-primary-50'
              } focus:outline-none disabled:opacity-50`}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-aba-error-50 border border-aba-error-200 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-aba-error-main flex-shrink-0" />
            <p className="text-sm text-aba-error-main">{error}</p>
          </div>
        )}

        {/* Audit Note */}
        <div className="bg-aba-neutral-50 border border-aba-neutral-200 rounded-xl p-3 flex items-start gap-2">
          <Lock className="w-4 h-4 text-aba-neutral-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-aba-neutral-700">
            <span className="font-medium">Audit Note:</span> This action will be
            logged with your admin credentials for compliance and security purposes.
          </p>
        </div>
      </div>
    </ABAModal>
  );
}