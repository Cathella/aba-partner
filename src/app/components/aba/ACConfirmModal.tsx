/**
 * ACConfirmModal — Confirmation modal for accountant actions.
 * Used for refunds, dispute resolutions, etc.
 */
import { X } from 'lucide-react';
import { ABAButton } from './ABAButton';

interface ACConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  confirmVariant?: 'primary' | 'destructive';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function ACConfirmModal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  iconBg = 'bg-[#FFF3DC]',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  confirmVariant = 'primary',
  isLoading = false,
  children,
}: ACConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#FFFFFF] rounded-t-3xl w-full pb-8">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-[#C9D0DB]" />
        </div>

        <div className="px-5">
          {/* Header row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {icon && (
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                  {icon}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A]">{title}</h3>
                {description && (
                  <p className="text-sm text-[#8F9AA1] mt-1">{description}</p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#F7F9FC] transition-colors">
              <X className="w-5 h-5 text-[#8F9AA1]" />
            </button>
          </div>

          {children && <div className="mb-5">{children}</div>}

          <div className="flex gap-3">
            <ABAButton variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
              {cancelText}
            </ABAButton>
            <ABAButton
              variant={confirmVariant}
              className="flex-1"
              onClick={onConfirm}
              isLoading={isLoading}
            >
              {confirmText}
            </ABAButton>
          </div>
        </div>
      </div>
    </div>
  );
}