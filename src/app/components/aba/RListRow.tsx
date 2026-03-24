/**
 * RListRow — Reusable list row for Receptionist screens.
 * Leading icon/avatar + title + subtitle + optional trailing element (badge / chip / chevron).
 */
import { ChevronRight } from 'lucide-react';

interface RListRowProps {
  /** Background‐coloured circle icon on the left */
  icon?: React.ReactNode;
  /** Avatar initials fallback (if no icon) */
  initials?: string;
  /** Primary text */
  title: string;
  /** Secondary text */
  subtitle?: string;
  /** Third‐line hint (e.g. time, service name) */
  meta?: string;
  /** Anything rendered on the right: badge, StatusChip, amount, etc. */
  trailing?: React.ReactNode;
  /** Show a chevron arrow on the far right */
  showChevron?: boolean;
  /** Click handler – makes the row interactive */
  onClick?: () => void;
  className?: string;
}

export function RListRow({
  icon,
  initials,
  title,
  subtitle,
  meta,
  trailing,
  showChevron = false,
  onClick,
  className = '',
}: RListRowProps) {
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 border-b border-aba-neutral-200 last:border-b-0 ${
        onClick
          ? 'hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors text-left cursor-pointer'
          : ''
      } ${className}`}
    >
      {/* Leading */}
      {icon && (
        <div className="w-10 h-10 rounded-full bg-aba-primary-50 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      )}
      {!icon && initials && (
        <div className="w-10 h-10 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-aba-secondary-main text-[#1a1a1a]">
            {initials}
          </span>
        </div>
      )}

      {/* Center */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-aba-neutral-900 truncate">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-aba-neutral-600 truncate">{subtitle}</p>
        )}
        {meta && (
          <p className="text-xs text-aba-neutral-400 truncate mt-0.5">{meta}</p>
        )}
      </div>

      {/* Trailing */}
      {trailing && <div className="flex-shrink-0">{trailing}</div>}

      {showChevron && (
        <ChevronRight className="w-5 h-5 text-aba-neutral-400 flex-shrink-0" />
      )}
    </Wrapper>
  );
}
