/**
 * PH-32 OTC Prepare Order — Editable quantities + substitution + Mark Ready.
 * Reuses PH-04 patterns (qty stepper, substitution field).
 * Inner page: back arrow, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { PHConfirmModal } from '../components/aba/PHConfirmModal';
import { showToast } from '../components/aba/Toast';
import {
  usePharmacistStore,
  updateOtcItemQty,
  completeOtcOrder,
  addOtcSubstitution,
} from '../data/pharmacistStore';
import {
  deductStockOnDispense,
} from '../data/pharmacyInventoryStore';
import type { PHOtcItem } from '../data/pharmacistStore';
import {
  ShoppingBag,
  Minus,
  Plus,
  CheckCircle2,
  ArrowRightLeft,
  PackageCheck,
  PackageMinus,
  PackageX,
} from 'lucide-react';

/* ── Stock config ── */
const stockCfg: Record<PHOtcItem['stockLevel'], { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
  'in-stock': { label: 'In Stock', icon: <PackageCheck className="w-3 h-3" />, bg: 'bg-[#E9F8F0]', text: 'text-[#38C172]', border: 'border-[#38C172]/20' },
  'low-stock': { label: 'Low', icon: <PackageMinus className="w-3 h-3" />, bg: 'bg-[#FFF3DC]', text: 'text-[#D97706]', border: 'border-[#D97706]/20' },
  'out-of-stock': { label: 'Out', icon: <PackageX className="w-3 h-3" />, bg: 'bg-[#FDECEC]', text: 'text-[#E44F4F]', border: 'border-[#E44F4F]/20' },
};

export function PHOtcPrepare() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { getOtcById } = usePharmacistStore();

  const order = getOtcById(orderId || '');

  const [subModal, setSubModal] = useState<{ itemId: string; itemName: string } | null>(null);
  const [subValue, setSubValue] = useState('');
  const [confirmReady, setConfirmReady] = useState(false);

  if (!order) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Prepare Order" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Order not found</p>
        </div>
      </div>
    );
  }

  const allPrepared = order.items.every((i) => i.preparedQty >= i.quantity || i.stockLevel === 'out-of-stock');

  const handleIncrement = (itemId: string, item: PHOtcItem) => {
    if (item.preparedQty < item.quantity) {
      updateOtcItemQty(order.id, itemId, item.preparedQty + 1);
    }
  };

  const handleDecrement = (itemId: string, item: PHOtcItem) => {
    if (item.preparedQty > 0) {
      updateOtcItemQty(order.id, itemId, item.preparedQty - 1);
    }
  };

  const handleSetFull = (itemId: string, item: PHOtcItem) => {
    updateOtcItemQty(order.id, itemId, item.quantity);
  };

  const handleSubstitution = () => {
    if (!subModal || !subValue.trim()) return;
    addOtcSubstitution(order.id, subModal.itemId, subValue.trim());
    showToast(`Substitution added for ${subModal.itemName}`, 'success');
    setSubModal(null);
    setSubValue('');
  };

  const handleMarkReady = () => {
    completeOtcOrder(order.id);
    // Auto-deduct stock for each prepared OTC item
    for (const item of order.items) {
      if (item.preparedQty > 0) {
        const itemName = item.substitution || item.name;
        deductStockOnDispense(itemName, item.preparedQty, 'OTC');
      }
    }
    showToast('Order completed. Stock updated.', 'success');
    navigate('/ph/queue', { replace: true });
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Prepare Order" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-4 space-y-3">

          {/* ── Customer header ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#7C3AED]" />
              <p className="text-sm font-semibold text-[#1A1A1A]">{order.customerName}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-[2px] rounded-full bg-[#F3F0FF] text-[#7C3AED]">OTC</span>
            </div>
            <p className="text-xs text-[#8F9AA1] mt-1">{order.id.toUpperCase()} &middot; {order.totalAmount}</p>
          </div>

          {/* ── Items with qty stepper ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC]">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Prepare Items
              </h3>
            </div>
            {order.items.map((item) => {
              const sc = stockCfg[item.stockLevel];
              const isFull = item.preparedQty >= item.quantity;
              const isOos = item.stockLevel === 'out-of-stock';

              return (
                <div key={item.id} className="px-4 py-3 border-b border-[#E5E8EC] last:border-b-0">
                  {/* Item info */}
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F3F0FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShoppingBag className="w-4 h-4 text-[#7C3AED]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.name}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-[2px] rounded-full border flex-shrink-0 ${sc.bg} ${sc.text} ${sc.border}`}>
                          {sc.icon} {sc.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#4A4F55] mt-0.5">{item.unitPrice} &middot; Requested: {item.quantity}</p>
                      {item.substitution && (
                        <p className="text-[10px] text-[#32C28A] bg-[#E9F8F0] px-2 py-1 rounded-lg mt-1.5">
                          Substituted: {item.substitution}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Qty stepper */}
                  <div className="ml-10 mt-2.5 flex items-center gap-3">
                    <div className="flex items-center gap-0 border border-[#E5E8EC] rounded-xl overflow-hidden">
                      <button
                        onClick={() => handleDecrement(item.id, item)}
                        disabled={item.preparedQty === 0 || isOos}
                        className="w-9 h-9 flex items-center justify-center hover:bg-[#F7F9FC] active:bg-[#E5E8EC] transition-colors disabled:opacity-30"
                      >
                        <Minus className="w-3.5 h-3.5 text-[#4A4F55]" />
                      </button>
                      <span className={`w-10 text-center text-sm font-semibold ${isFull ? 'text-[#38C172]' : 'text-[#1A1A1A]'}`}>
                        {item.preparedQty}
                      </span>
                      <button
                        onClick={() => handleIncrement(item.id, item)}
                        disabled={isFull || isOos}
                        className="w-9 h-9 flex items-center justify-center hover:bg-[#F7F9FC] active:bg-[#E5E8EC] transition-colors disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#4A4F55]" />
                      </button>
                    </div>
                    <span className="text-xs text-[#8F9AA1]">/ {item.quantity}</span>

                    {/* Quick fill button */}
                    {!isFull && !isOos && (
                      <button
                        onClick={() => handleSetFull(item.id, item)}
                        className="text-[10px] font-semibold text-[#3A8DFF] hover:underline ml-auto"
                      >
                        Fill all
                      </button>
                    )}
                    {isFull && (
                      <CheckCircle2 className="w-4 h-4 text-[#38C172] ml-auto" />
                    )}
                  </div>

                  {/* Substitution option for OOS */}
                  {isOos && !item.substitution && (
                    <div className="ml-10 mt-2">
                      <button
                        onClick={() => setSubModal({ itemId: item.id, itemName: item.name })}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#3A8DFF] hover:underline"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        Add Substitution
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Sticky bottom ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4 space-y-2">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => setConfirmReady(true)}
          >
            <CheckCircle2 className="w-5 h-5" />
            Mark Ready
          </ABAButton>
        </div>
      </div>

      {/* ── Confirm Ready modal ── */}
      <PHConfirmModal
        isOpen={confirmReady}
        onClose={() => setConfirmReady(false)}
        icon={<CheckCircle2 className="w-7 h-7 text-[#32C28A]" />}
        iconBg="bg-[#E9F8F0]"
        title="Mark Order Ready"
        description={`Complete OTC order for ${order.customerName}? ${allPrepared ? 'All items prepared.' : 'Some items are not fully prepared.'}`}
        confirmText="Mark Ready"
        onConfirm={handleMarkReady}
      />

      {/* ── Substitution modal ── */}
      <PHConfirmModal
        isOpen={!!subModal}
        onClose={() => { setSubModal(null); setSubValue(''); }}
        icon={<ArrowRightLeft className="w-7 h-7 text-[#3A8DFF]" />}
        iconBg="bg-[#EBF3FF]"
        title="Add Substitution"
        description={subModal ? `Suggest a substitute for ${subModal.itemName}` : ''}
        confirmText="Add"
        onConfirm={handleSubstitution}
      >
        <input
          value={subValue}
          onChange={(e) => setSubValue(e.target.value)}
          placeholder="e.g. Generic equivalent..."
          autoFocus
          className="w-full text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-3 focus:outline-none focus:ring-2 focus:ring-[#3A8DFF]/30 focus:border-[#3A8DFF] transition-all"
        />
      </PHConfirmModal>
    </div>
  );
}