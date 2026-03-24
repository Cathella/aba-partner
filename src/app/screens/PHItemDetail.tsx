/**
 * PH-21 Item Detail — Medicine detail with stock info, actions, and audit log.
 *
 * Inner page: showBack, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import {
  usePharmacyInventoryStore,
  getStockStatus,
  updateReorderLevel,
  type StockStatus,
} from '../data/pharmacyInventoryStore';
import { showToast } from '../components/aba/Toast';
import {
  Package,
  PackageCheck,
  PackageMinus,
  PackageX,
  PackagePlus,
  ArrowUpDown,
  Clock,
  Hash,
  Pencil,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

/* ── stock badge config ── */

const badgeConfig: Record<
  StockStatus,
  { label: string; icon: React.ReactNode; bg: string; text: string; border: string }
> = {
  'in-stock': {
    label: 'In Stock',
    icon: <PackageCheck className="w-3.5 h-3.5" />,
    bg: 'bg-[#E9F8F0]',
    text: 'text-[#38C172]',
    border: 'border-[#38C172]/20',
  },
  'low-stock': {
    label: 'Low Stock',
    icon: <PackageMinus className="w-3.5 h-3.5" />,
    bg: 'bg-[#FFF3DC]',
    text: 'text-[#D97706]',
    border: 'border-[#D97706]/20',
  },
  'out-of-stock': {
    label: 'Out of Stock',
    icon: <PackageX className="w-3.5 h-3.5" />,
    bg: 'bg-[#FDECEC]',
    text: 'text-[#E44F4F]',
    border: 'border-[#E44F4F]/20',
  },
};

/* ── audit action labels ── */
function auditLabel(action: string, delta: number, reason?: string): string {
  if (action === 'received') return `+${delta} received`;
  if (action === 'dispensed') return `${delta} dispensed${reason ? ` (${reason})` : ''}`;
  if (action === 'adjustment') return `${delta > 0 ? '+' : ''}${delta} adjustment${reason ? ` — ${reason}` : ''}`;
  if (action === 'reorder-update') return 'Reorder level updated';
  return action;
}

function auditIcon(action: string, delta: number) {
  if (action === 'received') return <TrendingUp className="w-3.5 h-3.5 text-[#38C172]" />;
  if (action === 'dispensed') return <TrendingDown className="w-3.5 h-3.5 text-[#3A8DFF]" />;
  if (action === 'adjustment' && delta < 0) return <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />;
  if (action === 'adjustment') return <RefreshCw className="w-3.5 h-3.5 text-[#32C28A]" />;
  return <RefreshCw className="w-3.5 h-3.5 text-[#8F9AA1]" />;
}

export function PHItemDetail() {
  const navigate = useNavigate();
  const { itemId } = useParams<{ itemId: string }>();
  const { getItemById, getAudit } = usePharmacyInventoryStore();

  const item = getItemById(itemId || '');

  const [editingReorder, setEditingReorder] = useState(false);
  const [reorderInput, setReorderInput] = useState('');

  /* ── Not found ── */
  if (!item) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Item Detail" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Item not found</p>
        </div>
      </div>
    );
  }

  const status = getStockStatus(item);
  const badge = badgeConfig[status];
  const audit = getAudit(item.id).slice(0, 6); // last 6

  const handleSaveReorder = () => {
    const val = parseInt(reorderInput, 10);
    if (isNaN(val) || val < 0) {
      showToast('Enter a valid number', 'error');
      return;
    }
    updateReorderLevel(item.id, val);
    showToast('Reorder level updated', 'success');
    setEditingReorder(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Item Detail" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-48">
        <div className="p-4 space-y-3">
          {/* ── Header card: name + badge ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${badge.bg}`}>
                <Package className={`w-5 h-5 ${badge.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-semibold text-[#1A1A1A]">{item.name}</h2>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {badge.icon}
                    {badge.label}
                  </span>
                </div>
                <p className="text-xs text-[#8F9AA1] mt-1">
                  {item.form} · {item.dosage} · SKU: {item.sku}
                </p>
              </div>
            </div>
          </div>

          {/* ── Quantity on hand (large) ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-[#C9D0DB]" />
              <span className="text-xs font-medium text-[#8F9AA1] uppercase tracking-wide">
                Quantity on Hand
              </span>
            </div>
            <p className={`text-4xl font-bold leading-none ${status === 'out-of-stock' ? 'text-[#E44F4F]' : status === 'low-stock' ? 'text-[#D97706]' : 'text-[#1A1A1A]'}`}>
              {item.quantityOnHand}
            </p>
          </div>

          {/* ── Reorder level (editable) ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-[#C9D0DB]" />
                <span className="text-xs font-medium text-[#8F9AA1] uppercase tracking-wide">
                  Reorder Level
                </span>
              </div>
              {!editingReorder && (
                <button
                  onClick={() => {
                    setReorderInput(String(item.reorderLevel));
                    setEditingReorder(true);
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-[#3A8DFF] hover:underline"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
              )}
            </div>
            {editingReorder ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={reorderInput}
                  onChange={(e) => setReorderInput(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all"
                  autoFocus
                  min={0}
                />
                <button
                  onClick={handleSaveReorder}
                  className="w-10 h-10 rounded-lg bg-[#32C28A] flex items-center justify-center text-white hover:brightness-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingReorder(false)}
                  className="w-10 h-10 rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] flex items-center justify-center text-[#8F9AA1] hover:bg-[#E5E8EC] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-2xl font-bold text-[#1A1A1A] leading-none">
                {item.reorderLevel}
              </p>
            )}
          </div>

          {/* ── Last updated ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-[#C9D0DB]" />
              <span className="text-xs font-medium text-[#8F9AA1] uppercase tracking-wide">
                Last Updated
              </span>
            </div>
            <p className="text-sm font-medium text-[#1A1A1A]">{item.lastUpdated}</p>
          </div>

          {/* ── Audit log (last 6) ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC]">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Recent Activity
              </h3>
            </div>
            {audit.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-[#C9D0DB]">No activity yet</p>
              </div>
            ) : (
              <>
                {audit.map((entry) => (
                  <div
                    key={entry.id}
                    className="px-4 py-3 border-b border-[#E5E8EC] last:border-b-0 flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#F7F9FC] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {auditIcon(entry.action, entry.delta)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A]">
                        {auditLabel(entry.action, entry.delta, entry.reason)}
                      </p>
                      {entry.note && (
                        <p className="text-xs text-[#8F9AA1] mt-0.5">{entry.note}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-[#C9D0DB] flex-shrink-0 mt-0.5">
                      {entry.timestamp}
                    </span>
                  </div>
                ))}
                {/* View full history placeholder */}
                <div className="px-4 py-3 border-t border-[#E5E8EC]">
                  <button
                    disabled
                    className="text-xs font-medium text-[#C9D0DB] cursor-not-allowed flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" />
                    View full history
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky bottom actions ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4 space-y-2">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => navigate(`/ph/inventory/adjust/${item.id}`)}
          >
            <ArrowUpDown className="w-5 h-5" />
            Adjust Stock
          </ABAButton>
          <ABAButton
            variant="secondary"
            fullWidth
            onClick={() => navigate(`/ph/inventory/receive?item=${item.id}`)}
          >
            <PackagePlus className="w-4 h-4" />
            Receive Stock
          </ABAButton>
        </div>
      </div>
    </div>
  );
}