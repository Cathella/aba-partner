/**
 * PH-31 OTC Request Detail — Full view of a single OTC order.
 *
 * Content: customer summary, items list with stock badges, payment status.
 * Actions: Approve & Prepare, Request Prescription, Decline, Hold (Payment).
 * Inner page: back arrow, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { PHConfirmModal } from '../components/aba/PHConfirmModal';
import { showToast } from '../components/aba/Toast';
import { pushNotification } from '../data/notificationStore';
import {
  usePharmacistStore,
  startOtcPreparing,
  declineOtcOrder,
  markOtcPaid,
} from '../data/pharmacistStore';
import type { PHOtcItem } from '../data/pharmacistStore';
import {
  User,
  Phone,
  ShoppingBag,
  Clock,
  PackageCheck,
  PackageMinus,
  PackageX,
  Play,
  XCircle,
  FileText,
  CreditCard,
  ShieldAlert,
  PauseCircle,
} from 'lucide-react';

/* ── Stock badge ── */
const stockCfg: Record<PHOtcItem['stockLevel'], { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
  'in-stock': { label: 'In Stock', icon: <PackageCheck className="w-3 h-3" />, bg: 'bg-[#E9F8F0]', text: 'text-[#38C172]', border: 'border-[#38C172]/20' },
  'low-stock': { label: 'Low', icon: <PackageMinus className="w-3 h-3" />, bg: 'bg-[#FFF3DC]', text: 'text-[#D97706]', border: 'border-[#D97706]/20' },
  'out-of-stock': { label: 'Out', icon: <PackageX className="w-3 h-3" />, bg: 'bg-[#FDECEC]', text: 'text-[#E44F4F]', border: 'border-[#E44F4F]/20' },
};

const payCfg: Record<string, { label: string; bg: string; text: string }> = {
  paid: { label: 'Paid', bg: 'bg-[#E9F8F0]', text: 'text-[#32C28A]' },
  pending: { label: 'Pending', bg: 'bg-[#FFF3DC]', text: 'text-[#D97706]' },
  waived: { label: 'Waived', bg: 'bg-[#F7F9FC]', text: 'text-[#8F9AA1]' },
};

const statusLabel: Record<string, { label: string; dot: string; bg: string }> = {
  pending: { label: 'Pending', dot: 'bg-[#3A8DFF]', bg: 'bg-[#EBF3FF]' },
  preparing: { label: 'Preparing', dot: 'bg-[#FFB649]', bg: 'bg-[#FFF3DC]' },
  ready: { label: 'Ready', dot: 'bg-[#32C28A]', bg: 'bg-[#E9F8F0]' },
  completed: { label: 'Completed', dot: 'bg-[#38C172]', bg: 'bg-[#E9F8F0]' },
  declined: { label: 'Declined', dot: 'bg-[#E44F4F]', bg: 'bg-[#FDECEC]' },
};

export function PHOtcDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { getOtcById } = usePharmacistStore();

  const order = getOtcById(orderId || '');

  const [declineModal, setDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  if (!order) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="OTC Request" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Order not found</p>
        </div>
      </div>
    );
  }

  const isPending = order.status === 'pending';
  const isPreparing = order.status === 'preparing';
  const isReady = order.status === 'ready';
  const isCompleted = order.status === 'completed';
  const isDeclined = order.status === 'declined';
  const hasRestricted = order.items.some((i) => i.isRestricted);
  const pay = payCfg[order.paymentStatus];
  const st = statusLabel[order.status] || statusLabel.pending;

  const handleApprove = () => {
    startOtcPreparing(order.id);
    showToast('Order approved — prepare items', 'success');
    navigate(`/ph/otc-prepare/${order.id}`, { replace: true });
  };

  const handleContinuePrepare = () => {
    navigate(`/ph/otc-prepare/${order.id}`);
  };

  const handleRequestPrescription = () => {
    pushNotification(
      'doctor',
      'Pharmacist',
      'Prescription Requested',
      `OTC customer requests a prescription for ${order.items.map(i => i.name).join(', ')}.`,
      `/cl/queue`
    );
    showToast('Prescription requested — doctor notified', 'warning');
  };

  const handleHoldPayment = () => {
    pushNotification(
      'reception',
      'Pharmacist',
      'OTC Payment Hold',
      `OTC order for ${order.customerName} is on hold pending payment.`,
      `/r/payments`
    );
    showToast('Reception notified — on hold for payment', 'warning');
  };

  const handleDecline = () => {
    if (!declineReason.trim()) return;
    declineOtcOrder(order.id, declineReason.trim());
    setDeclineModal(false);
    setDeclineReason('');
    showToast('OTC request declined', 'warning');
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="OTC Request" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-48">
        <div className="p-4 space-y-3">

          {/* Restricted item warning */}
          {hasRestricted && isPending && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FFF3DC] border border-[#D97706]/20">
              <ShieldAlert className="w-4 h-4 text-[#D97706] flex-shrink-0" />
              <p className="text-xs text-[#4A4F55]">
                <span className="font-semibold text-[#D97706]">Restricted item:</span> One or more items may require a prescription.
              </p>
            </div>
          )}

          {/* ── Customer summary ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#F3F0FF] flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">{order.customerName}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-[1px] rounded flex-shrink-0 ${order.isMember ? 'bg-[#EBF3FF] text-[#3A8DFF]' : 'bg-[#F7F9FC] text-[#8F9AA1] border border-[#E5E8EC]'}`}>
                    {order.isMember ? 'Member' : 'Non-member'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-[2px] rounded-full bg-[#F3F0FF] text-[#7C3AED]">
                    <ShoppingBag className="w-2.5 h-2.5" /> OTC
                  </span>
                  <span className="text-xs text-[#8F9AA1]">{order.id.toUpperCase()}</span>
                </div>
              </div>
              {/* Status chip */}
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2 py-0.5 ${st.bg} text-[#1A1A1A]`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                {st.label}
              </span>
            </div>
            {order.customerPhone && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E8EC]">
                <Phone className="w-3.5 h-3.5 text-[#C9D0DB]" />
                <span className="text-xs text-[#8F9AA1]">{order.customerPhone}</span>
              </div>
            )}
          </div>

          {/* ── Order info card ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8F9AA1]">Requested at</span>
              <span className="text-sm text-[#1A1A1A] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#C9D0DB]" /> {order.requestedAt}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8F9AA1]">Total Amount</span>
              <span className="text-sm font-semibold text-[#1A1A1A]">{order.totalAmount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8F9AA1]">Payment</span>
              <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-[2px] rounded-full ${pay.bg} ${pay.text}`}>
                {pay.label}
              </span>
            </div>
          </div>

          {/* ── Items list ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#7C3AED]" />
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Items ({order.items.length})
              </h3>
            </div>
            {order.items.map((item) => {
              const sc = stockCfg[item.stockLevel];
              return (
                <div key={item.id} className="px-4 py-3 border-b border-[#E5E8EC] last:border-b-0">
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
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#4A4F55]">
                        <span>Qty: {item.quantity}</span>
                        <span>{item.unitPrice}</span>
                      </div>
                      {item.isRestricted && (
                        <p className="text-[10px] text-[#D97706] bg-[#FFF3DC] px-2 py-1 rounded-lg mt-1.5 leading-relaxed">
                          May require prescription
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completed / Declined banners */}
          {isCompleted && order.completedAt && (
            <div className="bg-[#E9F8F0] rounded-2xl border border-[#38C172]/20 p-4">
              <p className="text-xs font-semibold text-[#38C172]">Completed</p>
              <p className="text-xs text-[#4A4F55] mt-0.5">{order.completedBy} &middot; {order.completedAt}</p>
            </div>
          )}
          {isDeclined && order.declineReason && (
            <div className="bg-[#FDECEC] rounded-2xl border border-[#E44F4F]/20 p-4">
              <p className="text-xs font-semibold text-[#E44F4F]">Declined</p>
              <p className="text-xs text-[#4A4F55] mt-0.5">{order.declineReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky actions ── */}
      {(isPending || isPreparing || isReady) && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
          <div className="max-w-[390px] mx-auto p-4 space-y-2">
            {isPending && (
              <>
                <ABAButton variant="primary" fullWidth size="lg" onClick={handleApprove}>
                  <Play className="w-4.5 h-4.5" />
                  Approve & Prepare
                </ABAButton>
                {/* Payment hold for pending payment */}
                {order.paymentStatus === 'pending' && (
                  <ABAButton variant="outline" fullWidth onClick={handleHoldPayment}>
                    <PauseCircle className="w-4 h-4" />
                    Hold (Payment)
                  </ABAButton>
                )}
                {hasRestricted && (
                  <button
                    onClick={handleRequestPrescription}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-[#D97706] hover:bg-[#FFF3DC]/50 active:bg-[#FFF3DC] transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Request Prescription
                  </button>
                )}
                <button
                  onClick={() => setDeclineModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-[#E44F4F] hover:bg-[#FDECEC]/50 active:bg-[#FDECEC] transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Decline
                </button>
              </>
            )}
            {isPreparing && (
              <ABAButton variant="primary" fullWidth size="lg" onClick={handleContinuePrepare}>
                <ShoppingBag className="w-4.5 h-4.5" />
                Continue Preparing
              </ABAButton>
            )}
            {isReady && (
              <ABAButton variant="primary" fullWidth size="lg" onClick={handleContinuePrepare}>
                <ShoppingBag className="w-4.5 h-4.5" />
                View Prepared Order
              </ABAButton>
            )}
          </div>
        </div>
      )}

      {/* ── Decline modal ── */}
      <PHConfirmModal
        isOpen={declineModal}
        onClose={() => { setDeclineModal(false); setDeclineReason(''); }}
        icon={<XCircle className="w-7 h-7 text-[#E44F4F]" />}
        iconBg="bg-[#FDECEC]"
        title="Decline OTC Request"
        description="Please provide a reason for declining."
        confirmText="Decline"
        confirmVariant="destructive"
        onConfirm={handleDecline}
      >
        <textarea
          value={declineReason}
          onChange={(e) => setDeclineReason(e.target.value)}
          placeholder="e.g. Restricted item, out of stock..."
          rows={3}
          autoFocus
          className="w-full text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] bg-[#F7F9FC] rounded-xl border border-[#E5E8EC] p-3 focus:outline-none focus:ring-2 focus:ring-[#E44F4F]/30 focus:border-[#E44F4F] transition-all resize-none"
        />
      </PHConfirmModal>
    </div>
  );
}