/**
 * LTResultTableRow — Reusable table row for displaying or editing
 * a single lab result parameter in the Lab Tech module.
 */

import { ChevronUp, ChevronDown, Minus } from 'lucide-react';
import type { LTResultRow } from '../../data/labTechStore';

interface LTResultTableRowProps {
  row: LTResultRow;
  editable?: boolean;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function LTResultTableRow({
  row,
  editable = false,
  onValueChange,
  className = '',
}: LTResultTableRowProps) {
  const isAbnormal =
    row.flag === 'high' || row.flag === 'low' || row.flag === 'critical';

  const flagIcon = () => {
    switch (row.flag) {
      case 'high':
        return <ChevronUp className="w-3.5 h-3.5 text-[#E44F4F]" />;
      case 'low':
        return <ChevronDown className="w-3.5 h-3.5 text-[#3A8DFF]" />;
      case 'critical':
        return <ChevronUp className="w-3.5 h-3.5 text-[#E44F4F]" />;
      default:
        return <Minus className="w-3.5 h-3.5 text-[#C9D0DB]" />;
    }
  };

  const valueColor = () => {
    switch (row.flag) {
      case 'high':
        return 'text-[#E44F4F]';
      case 'low':
        return 'text-[#3A8DFF]';
      case 'critical':
        return 'text-[#E44F4F] font-bold';
      default:
        return 'text-[#1A1A1A]';
    }
  };

  return (
    <div
      className={`grid grid-cols-[1fr_auto_auto_auto] gap-x-2 items-center px-4 py-2.5 border-b border-[#E5E8EC] last:border-b-0 ${
        isAbnormal ? 'bg-[#FDECEC]/30' : ''
      } ${className}`}
    >
      {/* Parameter */}
      <div className="flex items-center gap-1.5">
        {flagIcon()}
        <span className="text-sm text-[#1A1A1A]">{row.parameter}</span>
      </div>

      {/* Value */}
      {editable ? (
        <input
          type="text"
          value={row.value}
          onChange={(e) => onValueChange?.(e.target.value)}
          className={`text-sm font-semibold text-right min-w-[64px] w-16 bg-[#F7F9FC] border border-[#E5E8EC] rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#3A8DFF]/30 focus:border-[#3A8DFF] ${valueColor()}`}
        />
      ) : (
        <span
          className={`text-sm font-semibold text-right min-w-[56px] ${valueColor()}`}
        >
          {row.value}
        </span>
      )}

      {/* Unit */}
      <span className="text-xs text-[#8F9AA1] text-right min-w-[52px]">
        {row.unit}
      </span>

      {/* Reference range */}
      <span className="text-xs text-[#8F9AA1] text-right min-w-[72px]">
        {row.referenceRange}
      </span>
    </div>
  );
}

/** Header row for the result table */
export function LTResultTableHeader() {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 px-4 py-2 bg-[#F7F9FC] border-b border-[#E5E8EC]">
      <span className="text-[10px] font-semibold text-[#8F9AA1] uppercase tracking-wide">
        Parameter
      </span>
      <span className="text-[10px] font-semibold text-[#8F9AA1] uppercase tracking-wide text-right min-w-[56px]">
        Value
      </span>
      <span className="text-[10px] font-semibold text-[#8F9AA1] uppercase tracking-wide text-right min-w-[52px]">
        Unit
      </span>
      <span className="text-[10px] font-semibold text-[#8F9AA1] uppercase tracking-wide text-right min-w-[72px]">
        Ref Range
      </span>
    </div>
  );
}
