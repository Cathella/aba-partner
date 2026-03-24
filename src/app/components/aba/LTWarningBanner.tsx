/**
 * LTWarningBanner — Reusable alert/warning banner for the Lab Tech module.
 * Variants: info, warning, error, success
 */

import { AlertTriangle, Info, XCircle, CheckCircle2 } from 'lucide-react';

type BannerVariant = 'info' | 'warning' | 'error' | 'success';

interface LTWarningBannerProps {
  variant?: BannerVariant;
  title?: string;
  message: string;
  className?: string;
  onDismiss?: () => void;
}

const variantConfig: Record<
  BannerVariant,
  { bg: string; border: string; icon: React.ReactNode; titleColor: string; textColor: string }
> = {
  info: {
    bg: 'bg-[#EBF3FF]',
    border: 'border-[#3A8DFF]/20',
    icon: <Info className="w-4 h-4 text-[#3A8DFF] flex-shrink-0 mt-0.5" />,
    titleColor: 'text-[#3A8DFF]',
    textColor: 'text-[#4A4F55]',
  },
  warning: {
    bg: 'bg-[#FFF3DC]',
    border: 'border-[#FFB649]/20',
    icon: <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />,
    titleColor: 'text-[#D97706]',
    textColor: 'text-[#4A4F55]',
  },
  error: {
    bg: 'bg-[#FDECEC]',
    border: 'border-[#E44F4F]/20',
    icon: <XCircle className="w-4 h-4 text-[#E44F4F] flex-shrink-0 mt-0.5" />,
    titleColor: 'text-[#E44F4F]',
    textColor: 'text-[#4A4F55]',
  },
  success: {
    bg: 'bg-[#E9F8F0]',
    border: 'border-[#38C172]/20',
    icon: <CheckCircle2 className="w-4 h-4 text-[#38C172] flex-shrink-0 mt-0.5" />,
    titleColor: 'text-[#38C172]',
    textColor: 'text-[#4A4F55]',
  },
};

export function LTWarningBanner({
  variant = 'warning',
  title,
  message,
  className = '',
  onDismiss,
}: LTWarningBannerProps) {
  const cfg = variantConfig[variant];

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-2xl border ${cfg.bg} ${cfg.border} ${className}`}
    >
      {cfg.icon}
      <div className="flex-1 min-w-0">
        {title && (
          <p className={`text-xs font-semibold ${cfg.titleColor} mb-0.5`}>
            {title}
          </p>
        )}
        <p className={`text-xs ${cfg.textColor} leading-relaxed`}>{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-0.5 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <XCircle className="w-3.5 h-3.5 text-[#C9D0DB]" />
        </button>
      )}
    </div>
  );
}
