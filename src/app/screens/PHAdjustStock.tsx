/**
 * PH-23 Adjust Stock — Quick stock adjustment with increase/decrease toggle,
 * reason dropdown, confirmation modal on decrease, and audit trail.
 *
 * Inner page: showBack, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { PHConfirmModal } from '../components/aba/PHConfirmModal';
import {
  usePharmacyInventoryStore,
  getStockStatus,
  adjustStock,
} from '../data/pharmacyInventoryStore';
import { showToast } from '../components/aba/Toast';
import {
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Package,
  Hash,
  AlertTriangle,
} from 'lucide-react';

/* ── reason options ── */

const reasons = [
  'Stock count correction',
  'Damaged/expired',
  'Returned',
  'Other',
];

export function PHAdjustStock() {
  const navigate = useNavigate();
  const { itemId } = useParams<{ itemId: string }>();
  const { getItemById } = usePharmacyInventoryStore();

  const item = getItemById(itemId || '');

  /* ── form state ── */
  const [direction, setDirection] = useState<'increase' | 'decrease'>('increase');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ── Not found ── */
  if (!item) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Adjust Stock" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Item not found</p>
        </div>
      </div>
    );
  }

  const qty = parseInt(quantity, 10) || 0;
  const delta = direction === 'increase' ? qty : -qty;
  const newQty = Math.max(0, item.quantityOnHand + delta);
  const canSubmit = qty > 0 && reason.length > 0;

  const handleAttemptSave = () => {
    if (!canSubmit) return;
    if (direction === 'decrease') {
      setShowConfirm(true);
    } else {
      doAdjust();
    }
  };

  const doAdjust = () => {
    setIsSubmitting(true);
    setShowConfirm(false);

    setTimeout(() => {
      adjustStock(item.id, delta, reason, notes.trim() || undefined);
      showToast('Stock adjusted', 'success');
      navigate(`/ph/inventory/${item.id}`, { replace: true });
    }, 400);
  };

  const status = getStockStatus(item);

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Adjust Stock" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-40">
        <div className="p-4 space-y-4">

          {/* ── Item header ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                status === 'out-of-stock' ? 'bg-[#FDECEC]' : status === 'low-stock' ? 'bg-[#FFF3DC]' : 'bg-[#E9F8F0]'
              }`}>
                <Package className={`w-5 h-5 ${
                  status === 'out-of-stock' ? 'text-[#E44F4F]' : status === 'low-stock' ? 'text-[#D97706]' : 'text-[#32C28A]'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1A1A1A] truncate">{item.name}</p>
                <p className="text-xs text-[#8F9AA1]">{item.form} · {item.dosage}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-[#C9D0DB]" />
              <span className="text-xs text-[#8F9AA1]">Current quantity:</span>
              <span className="text-sm font-bold text-[#1A1A1A]">{item.quantityOnHand}</span>
            </div>
          </div>

          {/* ── Direction toggle ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <label className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-3 block">
              Adjustment Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setDirection('increase')}
                className={`flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border-[1.5px] text-sm font-semibold transition-all ${
                  direction === 'increase'
                    ? 'bg-[#E9F8F0] border-[#32C28A] text-[#1A1A1A]'
                    : 'bg-[#F7F9FC] border-[#E5E8EC] text-[#8F9AA1] hover:bg-[#FFFFFF]'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Increase
              </button>
              <button
                onClick={() => setDirection('decrease')}
                className={`flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border-[1.5px] text-sm font-semibold transition-all ${
                  direction === 'decrease'
                    ? 'bg-[#FDECEC] border-[#E44F4F] text-[#1A1A1A]'
                    : 'bg-[#F7F9FC] border-[#E5E8EC] text-[#8F9AA1] hover:bg-[#FFFFFF]'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Decrease
              </button>
            </div>
          </div>

          {/* ── Quantity ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <label className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-2 block">
              Quantity *
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter amount"
              min={1}
              className="w-full h-11 px-3 rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all"
            />
            {qty > 0 && (
              <p className="text-xs mt-2 text-[#8F9AA1]">
                New quantity will be:{' '}
                <span className={`font-bold ${newQty <= 0 ? 'text-[#E44F4F]' : 'text-[#1A1A1A]'}`}>
                  {newQty}
                </span>
              </p>
            )}
          </div>

          {/* ── Reason dropdown ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <label className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-2 block">
              Reason *
            </label>
            <div className="space-y-2">
              {reasons.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left text-sm transition-colors ${
                    reason === r
                      ? 'bg-[#E9F8F0] border-[#32C28A] text-[#1A1A1A] font-medium'
                      : 'bg-[#F7F9FC] border-[#E5E8EC] text-[#4A4F55] hover:bg-[#FFFFFF]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      reason === r ? 'border-[#32C28A] bg-[#32C28A]' : 'border-[#C9D0DB]'
                    }`}
                  >
                    {reason === r && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* ── Notes ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <label className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-2 block">
              Notes
              <span className="text-[#C9D0DB] font-normal ml-1">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details…"
              rows={3}
              className="w-full text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-3 focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleAttemptSave}
            disabled={!canSubmit}
            isLoading={isSubmitting}
          >
            <ArrowUpDown className="w-5 h-5" />
            Save Adjustment
          </ABAButton>
        </div>
      </div>

      {/* ── Confirmation modal for decreasing stock ── */}
      <PHConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        icon={<AlertTriangle className="w-7 h-7 text-[#D97706]" />}
        iconBg="bg-[#FFF3DC]"
        title="Decrease Stock?"
        description={`This will remove ${qty} unit${qty !== 1 ? 's' : ''} of ${item.name}. New quantity will be ${newQty}. This action is logged.`}
        confirmText="Confirm Decrease"
        cancelText="Cancel"
        onConfirm={doAdjust}
        isLoading={isSubmitting}
      />
    </div>
  );
}
