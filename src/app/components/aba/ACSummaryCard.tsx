/**
 * ACSummaryCard — Compact finance KPI card for the accountant overview.
 * Icon + value + label, with variant coloring.
 */

interface ACSummaryCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  subtitle?: string;
}

export function ACSummaryCard({ label, value, icon, iconBg, iconColor, subtitle }: ACSummaryCardProps) {
  return (
    <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center mb-3 ${iconColor}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-[#1A1A1A]">{value}</p>
      <p className="text-xs text-[#8F9AA1] mt-0.5">{label}</p>
      {subtitle && (
        <p className="text-[10px] text-[#C9D0DB] mt-1">{subtitle}</p>
      )}
    </div>
  );
}
