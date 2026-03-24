/**
 * PHMedItemRow — Reusable medication item row with stock badge.
 * Shows: medication name, dosage, form, frequency, duration, quantity,
 * dispensed qty, stock level indicator, and optional substitution note.
 */

import { Pill, PackageCheck, PackageMinus, PackageX, ArrowRightLeft, Clock } from 'lucide-react';
import type { PHMedItem } from '../../data/pharmacistStore';

interface PHMedItemRowProps {
  med: PHMedItem;
  editable?: boolean;
  onDispensedChange?: (qty: number) => void;
  onSubstitute?: () => void;
  className?: string;
}

const stockConfig: Record<
  PHMedItem['stockLevel'],
  { label: string; icon: React.ReactNode; bg: string; text: string; border: string }
> = {
  'in-stock': {
    label: 'In Stock',
    icon: <PackageCheck className="w-3 h-3" />,
    bg: 'bg-[#E9F8F0]',
    text: 'text-[#38C172]',
    border: 'border-[#38C172]/20',
  },
  'low-stock': {
    label: 'Low Stock',
    icon: <PackageMinus className="w-3 h-3" />,
    bg: 'bg-[#FFF3DC]',
    text: 'text-[#D97706]',
    border: 'border-[#D97706]/20',
  },
  'out-of-stock': {
    label: 'Out of Stock',
    icon: <PackageX className="w-3 h-3" />,
    bg: 'bg-[#FDECEC]',
    text: 'text-[#E44F4F]',
    border: 'border-[#E44F4F]/20',
  },
};

export function PHMedItemRow({
  med,
  editable = false,
  onDispensedChange,
  onSubstitute,
  className = '',
}: PHMedItemRowProps) {
  const stock = stockConfig[med.stockLevel];
  const isFullyDispensed = med.dispensedQty >= med.quantity;

  return (
    <div
      className={`px-4 py-3 border-b border-[#E5E8EC] last:border-b-0 ${className}`}
    >
      {/* Top row: med name + stock badge */}
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#EBF3FF] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Pill className="w-4 h-4 text-[#3A8DFF]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[#1A1A1A] truncate">
              {med.substitution ? (
                <span>
                  <s className="text-[#C9D0DB]">{med.name}</s>{' '}
                  <span className="text-[#56D8A8]">{med.substitution}</span>
                </span>
              ) : (
                med.name
              )}
            </p>
          </div>
          <p className="text-xs text-[#4A4F55] mt-0.5">
            {med.dosage} &middot; {med.form}
          </p>
        </div>

        {/* Stock badge */}
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-[2px] rounded-full border flex-shrink-0 ${
            med.awaitingStock
              ? 'bg-[#EBF3FF] text-[#3A8DFF] border-[#3A8DFF]/20'
              : `${stock.bg} ${stock.text} ${stock.border}`
          }`}
        >
          {med.awaitingStock ? <Clock className="w-3 h-3" /> : stock.icon}
          {med.awaitingStock ? 'Awaiting' : med.stockCount !== undefined ? med.stockCount : stock.label}
        </span>
      </div>

      {/* Details row */}
      <div className="ml-10 mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8F9AA1]">
        <span>{med.frequency}</span>
        <span>{med.duration}</span>
        <span>Qty: {med.quantity}</span>
      </div>

      {/* Dispensing row */}
      {editable && onDispensedChange ? (
        <div className="ml-10 mt-2 flex items-center gap-3">
          <label className="text-xs text-[#4A4F55] font-medium">Dispensed:</label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onDispensedChange(Math.max(0, med.dispensedQty - 1))}
              className="w-7 h-7 rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] flex items-center justify-center text-[#4A4F55] hover:bg-[#E5E8EC] active:bg-[#C9D0DB] transition-colors text-sm font-bold"
              disabled={med.dispensedQty <= 0}
            >
              −
            </button>
            <span
              className={`text-sm font-semibold min-w-[28px] text-center ${
                isFullyDispensed ? 'text-[#38C172]' : 'text-[#1A1A1A]'
              }`}
            >
              {med.dispensedQty}
            </span>
            <button
              onClick={() => onDispensedChange(med.dispensedQty + 1)}
              className="w-7 h-7 rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] flex items-center justify-center text-[#4A4F55] hover:bg-[#E5E8EC] active:bg-[#C9D0DB] transition-colors text-sm font-bold"
            >
              +
            </button>
            <span className="text-xs text-[#C9D0DB] ml-1">/ {med.quantity}</span>
          </div>
          {isFullyDispensed && (
            <span className="text-[10px] font-semibold text-[#38C172] bg-[#E9F8F0] px-1.5 py-0.5 rounded-full">
              Full
            </span>
          )}
        </div>
      ) : (
        med.dispensedQty > 0 && (
          <div className="ml-10 mt-1.5 text-xs text-[#8F9AA1]">
            Dispensed: {med.dispensedQty} / {med.quantity}
            {isFullyDispensed && (
              <span className="ml-2 text-[10px] font-semibold text-[#38C172] bg-[#E9F8F0] px-1.5 py-0.5 rounded-full">
                Full
              </span>
            )}
          </div>
        )
      )}

      {/* Substitution button */}
      {onSubstitute && med.stockLevel === 'out-of-stock' && !med.substitution && (
        <button
          onClick={onSubstitute}
          className="ml-10 mt-2 flex items-center gap-1.5 text-xs font-medium text-[#3A8DFF] hover:underline"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Suggest Substitution
        </button>
      )}

      {/* Notes */}
      {med.notes && (
        <p className="ml-10 mt-1.5 text-[10px] text-[#D97706] bg-[#FFF3DC] px-2 py-1 rounded-lg">
          {med.notes}
        </p>
      )}
    </div>
  );
}