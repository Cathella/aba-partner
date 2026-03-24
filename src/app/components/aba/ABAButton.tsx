import { Loader2 } from 'lucide-react';

interface ABAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'destructive' | 'destructive-soft';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function ABAButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ABAButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-aba-primary-main text-aba-neutral-900 border-[1.5px] border-aba-neutral-900 hover:bg-aba-primary-600 active:bg-aba-primary-700',
    secondary: 'bg-[#DFF7EE] text-aba-neutral-900 border-[1.5px] border-aba-neutral-900 hover:bg-[#C9F0E3] active:bg-[#B3E9D7]',
    outline: 'border-2 border-aba-neutral-300 bg-white text-aba-neutral-900 hover:bg-aba-neutral-50 active:bg-aba-neutral-100',
    text: 'text-aba-secondary-main hover:bg-aba-secondary-50 active:bg-aba-secondary-50/70',
    destructive: 'bg-aba-error-main text-white hover:bg-aba-error-600 active:bg-aba-error-700',
    'destructive-soft': 'bg-[#FEE2E2] text-[#1A1A1A] border-[1.5px] border-aba-neutral-900 hover:bg-[#FDD5D5] active:bg-[#FCCACA]',
  };
  
  const sizeStyles = {
    sm: 'h-9 px-4 text-[14px] rounded-md',
    md: 'h-10 px-6 text-[14px] rounded-md',
    lg: 'h-12 px-7 text-[14px] rounded-md',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}