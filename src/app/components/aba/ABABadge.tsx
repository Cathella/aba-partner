interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export function ABABadge({ children, variant = 'neutral', size = 'md', className = '' }: BadgeProps) {
  const variantStyles = {
    success: 'bg-aba-success-50 text-aba-neutral-900 border-aba-success-main/20',
    warning: 'bg-aba-warning-50 text-aba-neutral-900 border-aba-warning-main/20',
    error: 'bg-aba-error-50 text-aba-neutral-900 border-aba-error-main/20',
    info: 'bg-aba-secondary-50 text-aba-neutral-900 border-aba-secondary-main/20',
    neutral: 'bg-aba-neutral-100 text-aba-neutral-900 border-aba-neutral-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className} m-[0px]`}
    >
      {children}
    </span>
  );
}