/**
 * CLActionSheet — Slide-up bottom action sheet for clinician quick actions.
 * Actions: Order Lab, Write Prescription, Complete Visit, etc.
 */

import { X } from 'lucide-react';

export interface CLAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'primary' | 'destructive';
  disabled?: boolean;
}

interface CLActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  actions: CLAction[];
  onAction: (actionId: string) => void;
}

export function CLActionSheet({
  isOpen,
  onClose,
  title,
  actions,
  onAction,
}: CLActionSheetProps) {
  if (!isOpen) return null;

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const variantStyles = {
    default:
      'bg-aba-neutral-0 text-aba-neutral-900 border border-aba-neutral-200 hover:bg-aba-neutral-100 active:bg-aba-neutral-200',
    primary:
      'bg-aba-primary-main text-aba-neutral-900 border-[1.5px] border-aba-neutral-900 hover:opacity-90 active:opacity-80',
    destructive:
      'bg-aba-error-50 text-aba-error-main border border-aba-error-main/20 hover:bg-aba-error-50/80 active:bg-aba-error-50/60',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={handleBackdrop}
    >
      <div className="bg-aba-neutral-0 rounded-t-3xl w-full max-w-[390px] p-6 pb-8">
        {/* Handle */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 rounded-full bg-aba-neutral-400" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-aba-neutral-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 -mr-1 rounded-lg hover:bg-aba-neutral-100 transition-colors"
          >
            <X className="w-5 h-5 text-aba-neutral-600" />
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                onAction(action.id);
                onClose();
              }}
              disabled={action.disabled}
              className={`w-full flex items-center gap-3 h-12 px-4 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                variantStyles[action.variant || 'default']
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
