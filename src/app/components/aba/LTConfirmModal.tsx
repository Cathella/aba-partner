/**
 * LTConfirmModal — Confirmation modal for Lab Tech actions.
 * Used for: Verify & Release, Reject Sample, Submit Results, etc.
 */

import { ABAButton } from './ABAButton';

interface LTConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon?: React.ReactNode;
  iconBg?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  confirmVariant?: 'primary' | 'destructive';
  isLoading?: boolean;
}

export function LTConfirmModal({
  isOpen,
  onClose,
  icon,
  iconBg = 'bg-[#EBF3FF]',
  title,
  description,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  confirmVariant = 'primary',
  isLoading = false,
}: LTConfirmModalProps) {
  if (!isOpen) return null;

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
      onClick={handleBackdrop}
    >
      <div className="bg-[#FFFFFF] rounded-3xl w-full max-w-[340px] p-6">
        {/* Icon */}
        {icon && (
          <div className="flex justify-center mb-4">
            <div
              className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center`}
            >
              {icon}
            </div>
          </div>
        )}

        {/* Title + description */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">{title}</h3>
          {description && (
            <p className="mt-2 text-sm text-[#8F9AA1]">{description}</p>
          )}
        </div>

        {/* Custom content */}
        {children && <div className="mb-5">{children}</div>}

        {/* Buttons */}
        <div className="flex gap-3">
          <ABAButton
            variant="outline"
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
