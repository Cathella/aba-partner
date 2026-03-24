import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block font-medium text-aba-neutral-900 mb-2 text-[12px] text-[#8f9aa1]">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-aba-neutral-600">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`w-full h-12 px-4 text-[14px] ${leftIcon ? 'pl-10' : ''} ${
              isPassword || rightIcon ? 'pr-10' : ''
            } rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-aba-neutral-900 placeholder:text-aba-neutral-600 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main focus:border-transparent transition-all ${
              error ? 'border-aba-error-main focus:ring-aba-error-main' : ''
            } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-aba-neutral-600 hover:text-aba-neutral-900"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
          {!isPassword && rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-aba-neutral-600">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-aba-error-main">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-sm text-aba-neutral-600">{helperText}</p>}
      </div>
    );
  }
);

InputField.displayName = 'InputField';