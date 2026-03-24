interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    positive?: boolean;
    direction?: 'up' | 'down';
  };
  variant?: 'default' | 'success' | 'warning' | 'error' | 'dark';
}

interface ListCardProps {
  children: React.ReactNode;
  className?: string;
}

interface ListCardItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
}: KPICardProps) {
  const variantStyles = {
    default: 'border-aba-neutral-200 bg-aba-neutral-0',
    success: 'border-aba-success-main/20 bg-aba-success-50/30',
    warning: 'border-aba-warning-main/20 bg-aba-warning-50/30',
    error: 'border-aba-error-main/20 bg-aba-error-50/30',
    dark: 'border-aba-neutral-800 bg-aba-neutral-900',
  };

  const isDark = variant === 'dark';

  return (
    <div
      className={`rounded-2xl border p-4 ${variantStyles[variant]}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs ${isDark ? 'text-aba-neutral-400' : 'text-aba-neutral-600'}`}>{title}</span>
        {icon && (
          <div className={`p-1.5 rounded-lg ${isDark ? 'bg-white/10' : 'bg-aba-secondary-50'}`}>
            <div className={`${isDark ? 'text-white' : 'text-aba-secondary-main'} w-4 h-4 flex items-center justify-center`}>{icon}</div>
          </div>
        )}
      </div>
      <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-aba-neutral-900'}`}>
        {value}
      </div>
      <div className="flex items-center gap-2">
        {subtitle && (
          <span 
            className={`text-xs ${
              isDark
                ? 'text-aba-neutral-400'
                : typeof subtitle === 'string' && subtitle.startsWith('+') 
                ? 'text-aba-success-main font-medium' 
                : typeof subtitle === 'string' && subtitle.startsWith('-')
                ? 'text-aba-error-main font-medium'
                : 'text-aba-neutral-600'
            }`}
          >
            {subtitle}
          </span>
        )}
        {trend && (
          <span
            className={`text-xs font-medium ${
              isDark
                ? trend.positive ? 'text-aba-success-main' : 'text-aba-error-main'
                : trend.positive ? 'text-aba-success-main' : 'text-aba-error-main'
            }`}
          >
            {(trend.direction ?? (trend.positive ? 'up' : 'down')) === 'up' ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

export function ListCard({ children, className = '' }: ListCardProps) {
  return (
    <div className={`rounded-2xl border border-aba-neutral-200 bg-aba-neutral-0 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function ListCardItem({ children, onClick, className = '' }: ListCardItemProps) {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 border-b border-aba-neutral-200 last:border-b-0 ${
        onClick ? 'hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors text-left' : ''
      } ${className}`}
    >
      {children}
    </Component>
  );
}