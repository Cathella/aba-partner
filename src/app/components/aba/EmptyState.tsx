import { ABAButton } from './ABAButton';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {icon && (
        <div className="w-20 h-20 rounded-full bg-aba-neutral-100 flex items-center justify-center mb-4 text-aba-neutral-600">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-aba-neutral-900 mb-2">{title}</h3>
      <p className="text-sm text-aba-neutral-600 mb-6 max-w-sm">{message}</p>
      
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          {actionLabel && onAction && (
            <ABAButton variant="primary" onClick={onAction} className="w-full sm:flex-1">
              {actionLabel}
            </ABAButton>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <ABAButton variant="secondary" onClick={onSecondaryAction} className="w-full sm:flex-1">
              {secondaryActionLabel}
            </ABAButton>
          )}
        </div>
      )}
    </div>
  );
}
