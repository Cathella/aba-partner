import { ChevronLeft, MoreVertical } from 'lucide-react';

interface AppTopBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackClick?: () => void;
  rightAction?: React.ReactNode;
  showMenu?: boolean;
  onMenuClick?: () => void;
}

export function AppTopBar({
  title,
  subtitle,
  showBack = false,
  onBackClick,
  rightAction,
  showMenu = false,
  onMenuClick,
}: AppTopBarProps) {
  return (
    <div className={`flex items-center justify-between px-5 bg-aba-neutral-0 border-b border-aba-neutral-200 ${subtitle ? 'pt-6 pb-3' : 'h-14'}`}>
      <div className="flex items-center gap-2 flex-1">
        {showBack && (
          <button
            onClick={onBackClick}
            className="p-1 -ml-1 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-aba-neutral-900" />
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="font-semibold text-aba-neutral-900 truncate text-[17px]">{title}</h1>
          {subtitle && (
            <p className="text-[12px] text-aba-neutral-600 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      
      {rightAction && <div className="flex items-center gap-2">{rightAction}</div>}
      
      {showMenu && (
        <button
          onClick={onMenuClick}
          className="p-2 -mr-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
          aria-label="Menu"
        >
          <MoreVertical className="w-5 h-5 text-aba-neutral-900" />
        </button>
      )}
    </div>
  );
}