/**
 * PH-08 Today's Summary — Pharmacy daily stats dashboard.
 *
 * Layout:
 *   Top bar → "Today's Summary" + back arrow
 *   2×2 stat grid: Dispensed Today, In Progress, On Hold (Payment), Out of Stock Items
 *   Secondary counters: Partial Fills, Ready for Pickup, Pending (New)
 *   Inventory alert card
 *   Overall summary card
 *   Sticky "Export Summary" button (toast placeholder)
 *
 * Inner page: back arrow, no bottom nav.
 */
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { KPICard } from '../components/aba/Cards';
import { showToast } from '../components/aba/Toast';
import { usePharmacistStore } from '../data/pharmacistStore';
import {
  CheckCircle2,
  Clock,
  Pill,
  PauseCircle,
  PackageX,
  AlertTriangle,
  Download,
  TrendingUp,
  CreditCard,
} from 'lucide-react';

export function PHTodaySummary() {
  const navigate = useNavigate();
  const { stats, inventoryAlerts } = usePharmacistStore();

  const dateStr = new Date().toLocaleDateString('en-UG', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const statCards: { label: string; value: string | number; icon: React.ReactNode; variant: 'default' | 'success' | 'warning' | 'error' | 'dark' }[] = [
    {
      label: 'Dispensed Today',
      value: stats.completed,
      icon: <CheckCircle2 className="w-5 h-5" />,
      variant: 'success',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: <Pill className="w-5 h-5" />,
      variant: 'warning',
    },
    {
      label: 'On Hold (Payment)',
      value: stats.onHold,
      icon: <PauseCircle className="w-5 h-5" />,
      variant: 'warning',
    },
    {
      label: 'Out of Stock Items',
      value: stats.outOfStock,
      icon: <PackageX className="w-5 h-5" />,
      variant: 'error',
    },
  ];

  const secondaryCounters = [
    {
      label: 'Partial Fills',
      value: stats.partialFill,
      icon: <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />,
      color: 'text-[#8B5CF6]',
    },
    {
      label: 'Ready for Pickup',
      value: stats.ready,
      icon: <CheckCircle2 className="w-4 h-4 text-[#32C28A]" />,
      color: 'text-[#32C28A]',
    },
    {
      label: 'Pending (New)',
      value: stats.newCount,
      icon: <Clock className="w-4 h-4 text-[#3A8DFF]" />,
      color: 'text-[#3A8DFF]',
    },
  ];

  const handleExport = () => {
    showToast('Summary exported to Downloads', 'success');
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Today's Summary" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-4 space-y-3">
          {/* Date */}
          <p className="text-xs text-[#8F9AA1] text-center">{dateStr}</p>

          {/* ── 2×2 stat grid ── */}
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((card) => (
              <KPICard
                key={card.label}
                title={card.label}
                value={card.value}
                icon={card.icon}
                variant={card.variant}
              />
            ))}
          </div>

          {/* ── Secondary counters ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center justify-around">
              {secondaryCounters.map((c) => (
                <div key={c.label} className="flex flex-col items-center gap-1">
                  {c.icon}
                  <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
                  <p className="text-[#8F9AA1] text-center text-[12px]">{c.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Inventory alerts ── */}
          {inventoryAlerts.length > 0 && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Stock Alerts ({inventoryAlerts.length})
                </h3>
              </div>
              {inventoryAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E8EC] last:border-b-0"
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      alert.severity === 'critical' ? 'bg-[#E44F4F]' : 'bg-[#FFB649]'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1A1A1A] truncate">{alert.medName}</p>
                    <p className="text-xs text-[#8F9AA1]">
                      Stock: {alert.currentStock} / Reorder at: {alert.reorderLevel}
                    </p>
                  </div>
                  <span
                    className={`font-semibold px-1.5 py-[2px] rounded-full ${ alert.severity === 'critical' ? 'bg-[#FDECEC] text-[#E44F4F]' : 'bg-[#FFF3DC] text-[#D97706]' } text-[12px]`}
                  >
                    {alert.severity === 'critical' ? 'Critical' : 'Low'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── Total summary card ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-3">
              Overall
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#4A4F55]">Total prescriptions</span>
              <span className="text-sm font-bold text-[#1A1A1A]">{stats.total}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-[#4A4F55]">STAT orders active</span>
              <span className="text-sm font-bold text-[#E44F4F]">{stats.statOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky export ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30 p-4">
        <ABAButton variant="primary" fullWidth size="lg" onClick={handleExport}>
          <Download className="w-5 h-5" />
          Export Today's Summary
        </ABAButton>
      </div>
    </div>
  );
}