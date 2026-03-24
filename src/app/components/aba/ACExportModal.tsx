/**
 * ACExportModal — Export modal for finance data.
 * Options: CSV, PDF, Print. Simulates export with a success toast.
 */
import { useState } from 'react';
import { X, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { ABAButton } from './ABAButton';
import { showToast } from './Toast';

interface ACExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

interface ExportOption {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
}

const options: ExportOption[] = [
  {
    id: 'csv',
    label: 'Export as CSV',
    subtitle: 'Spreadsheet-compatible format',
    icon: <FileSpreadsheet className="w-5 h-5 text-[#38C172]" />,
    iconBg: 'bg-[#E9F8F0]',
  },
  {
    id: 'pdf',
    label: 'Export as PDF',
    subtitle: 'Print-ready document',
    icon: <FileText className="w-5 h-5 text-[#E44F4F]" />,
    iconBg: 'bg-[#FDECEC]',
  },
  {
    id: 'print',
    label: 'Print',
    subtitle: 'Send directly to printer',
    icon: <Printer className="w-5 h-5 text-[#3A8DFF]" />,
    iconBg: 'bg-[#E8F2FF]',
  },
];

export function ACExportModal({ isOpen, onClose, title = 'Export Data' }: ACExportModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    if (!selected) return;
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      onClose();
      const label = options.find((o) => o.id === selected)?.label ?? 'Export';
      showToast(`${label} — file ready in Downloads`, 'success');
    }, 500);
  };

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

        <div className="px-5 flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#F7F9FC] transition-colors">
            <X className="w-5 h-5 text-[#8F9AA1]" />
          </button>
        </div>

        <div className="px-5 space-y-2">
          {options.map((opt) => {
            const isActive = selected === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-colors text-left ${
                  isActive
                    ? 'border-[#56D8A8] bg-[#E9F8F0]'
                    : 'border-[#E5E8EC] bg-[#FFFFFF] hover:bg-[#F7F9FC]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isActive ? 'border-[#56D8A8] bg-[#56D8A8]' : 'border-[#C9D0DB]'
                }`}>
                  {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className={`w-10 h-10 rounded-xl ${opt.iconBg} flex items-center justify-center flex-shrink-0`}>
                  {opt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A]">{opt.label}</p>
                  <p className="text-xs text-[#8F9AA1]">{opt.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-5 mt-5 space-y-2">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleExport}
            disabled={!selected}
            isLoading={isExporting}
          >
            Export
          </ABAButton>
          <ABAButton variant="outline" fullWidth onClick={onClose}>
            Cancel
          </ABAButton>
        </div>
      </div>
    </div>
  );
}