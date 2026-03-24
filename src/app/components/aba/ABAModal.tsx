import { X } from 'lucide-react';
import { ABAButton } from './ABAButton';

interface ABAModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  confirmVariant?: 'primary' | 'destructive';
  isLoading?: boolean;
}

export function ABAModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  confirmVariant = 'primary',
  isLoading = false,
}: ABAModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-aba-neutral-0 rounded-t-3xl sm:rounded-3xl w-full max-w-[390px] p-6 animate-in slide-in-from-bottom duration-300 sm:slide-in-from-bottom-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-aba-neutral-900">{title}</h3>
            {description && (
              <p className="mt-2 text-sm text-aba-neutral-600">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 -mt-1 -mr-1 rounded-lg hover:bg-aba-neutral-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-aba-neutral-600" />
          </button>
        </div>

        {children && <div className="mb-6">{children}</div>}

        <div className="flex gap-3">
          <ABAButton
            variant="text"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            {cancelText}
          </ABAButton>
          {onConfirm && (
            <ABAButton
              variant={confirmVariant}
              onClick={onConfirm}
              className="flex-1"
              isLoading={isLoading}
            >
              {confirmText}
            </ABAButton>
          )}
        </div>
      </div>
    </div>
  );
}
