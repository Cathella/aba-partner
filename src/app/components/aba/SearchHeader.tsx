/**
 * SearchHeader — Simple search bar with optional filter button.
 * Used at the top of list screens (Bookings, Queue, Payments…).
 */
import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchHeaderProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Show a filter / sort button on the right */
  showFilter?: boolean;
  onFilterClick?: () => void;
  /** Optional active‐filter indicator count */
  filterCount?: number;
  className?: string;
}

export function SearchHeader({
  value,
  onChange,
  placeholder = 'Search…',
  showFilter = false,
  onFilterClick,
  filterCount,
  className = '',
}: SearchHeaderProps) {
  return (
    <div className={`flex items-center gap-2 px-4 py-3 ${className}`}>
      {/* Search input */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aba-neutral-600" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 pl-9 pr-4 rounded-[6px] border border-aba-neutral-200 bg-aba-neutral-0 text-sm text-aba-neutral-900 placeholder:text-aba-neutral-600 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main/30 focus:border-aba-secondary-main transition-all"
        />
      </div>

      {/* Filter button */}
      {showFilter && (
        <button
          onClick={onFilterClick}
          className="relative h-10 w-10 flex items-center justify-center rounded-[6px] border border-aba-neutral-200 bg-aba-neutral-0 hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-aba-neutral-700" />
          {filterCount !== undefined && filterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-aba-primary-main text-[10px] font-bold text-aba-neutral-900 flex items-center justify-center">
              {filterCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
