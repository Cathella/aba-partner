/**
 * AC-08 Refund / Dispute Detail — Review and approve/reject a request.
 *
 * Sections:
 *   1. Summary: amount, method, reference, service, staff
 *   2. Reason + notes
 *   3. Approve (PIN modal) / Reject (reason + confirm)
 *   4. Audit trail
 *
 * Inner page: back arrow, no bottom nav.
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { ACConfirmModal } from '../components/aba/ACConfirmModal';
import { showToast } from '../components/aba/Toast';
import {
  useAccountantStore,
  formatUGX,
  approveRequest,
  rejectRequest,
} from '../data/accountantStore';
import type { ACPaymentMethod, ACRequestStatus } from '../data/accountantStore';
import {
  Banknote,
  Smartphone,
  CreditCard,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  FileText,
  Hash,
  Stethoscope,
  Lock,
  ChevronDown,
} from 'lucide-react';

/* ── method helpers ── */

const methodMeta: Record<ACPaymentMethod, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
  cash: { label: 'Cash', icon: <Banknote className="w-4 h-4" />, bg: 'bg-[#E9F8F0]', text: 'text-[#38C172]' },
  'mobile-money': { label: 'Aba Wallet', icon: <Smartphone className="w-4 h-4" />, bg: 'bg-[#E8F2FF]', text: 'text-[#3A8DFF]' },
  card: { label: 'Card', icon: <CreditCard className="w-4 h-4" />, bg: 'bg-[#FFF3DC]', text: 'text-[#D97706]' },
  insurance: { label: 'Corporate', icon: <ShieldCheck className="w-4 h-4" />, bg: 'bg-[#F5F3FF]', text: 'text-[#8B5CF6]' },
};

/* ── status config ── */

const statusConfig: Record<ACRequestStatus, { label: string; dot: string; bg: string; text: string }> = {
  awaiting: { label: 'Awaiting Approval', dot: 'bg-[#FFB649]', bg: 'bg-[#FFF3DC]', text: 'text-[#D97706]' },
  approved: { label: 'Approved', dot: 'bg-[#38C172]', bg: 'bg-[#E9F8F0]', text: 'text-[#38C172]' },
  rejected: { label: 'Rejected', dot: 'bg-[#E44F4F]', bg: 'bg-[#FDECEC]', text: 'text-[#E44F4F]' },
};

/* ── rejection reasons ── */

const rejectReasons = [
  'Charge confirmed correct after verification',
  'Insufficient supporting documentation',
  'Duplicate request — already processed',
  'Policy does not cover this refund type',
  'Other (specify in notes)',
];

/* ════════════════════════════════════════ */

export function ACRefundDisputeDetail() {
  const navigate = useNavigate();
  const { requestId } = useParams<{ requestId: string }>();
  const { getRequestById } = useAccountantStore();
  const req = getRequestById(requestId || '');

  /* PIN modal state */
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState('');
  const [approving, setApproving] = useState(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* Reject modal state */
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [rejectDropdownOpen, setRejectDropdownOpen] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  /* Focus first PIN input when modal opens */
  useEffect(() => {
    if (showPin) {
      setPin(['', '', '', '']);
      setPinError('');
      setTimeout(() => pinRefs.current[0]?.focus(), 100);
    }
  }, [showPin]);

  /* ── not found ── */
  if (!req) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Request Detail" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Request not found</p>
        </div>
      </div>
    );
  }

  const mm = methodMeta[req.method];
  const sc = statusConfig[req.status];
  const isRefund = req.type === 'refund';
  const isAwaiting = req.status === 'awaiting';
  const typeLabel = isRefund ? 'Refund' : 'Dispute';

  /* ── PIN handlers ── */
  const handlePinInput = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setPinError('');
    if (value && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handleApproveSubmit = () => {
    const entered = pin.join('');
    if (entered.length !== 4) {
      setPinError('Enter all 4 digits');
      return;
    }
    /* Prototype: accept any 4-digit PIN */
    setApproving(true);
    setTimeout(() => {
      approveRequest(req.id);
      setApproving(false);
      setShowPin(false);
      showToast(`${typeLabel} approved successfully`, 'success');
    }, 600);
  };

  /* ── Reject handlers ── */
  const handleRejectSubmit = () => {
    if (!rejectReason) {
      showToast('Please select a rejection reason', 'error');
      return;
    }
    setRejecting(true);
    setTimeout(() => {
      const fullReason = rejectNote.trim()
        ? `${rejectReason} — ${rejectNote.trim()}`
        : rejectReason;
      rejectRequest(req.id, fullReason);
      setRejecting(false);
      setShowReject(false);
      showToast(`${typeLabel} rejected`, 'warning');
    }, 600);
  };

  /* ── Audit trail ── */
  const auditEntries: { icon: React.ReactNode; iconBg: string; label: string; actor: string; time: string }[] = [
    {
      icon: <FileText className="w-3.5 h-3.5 text-[#3A8DFF]" />,
      iconBg: 'bg-[#E8F2FF]',
      label: 'Request raised',
      actor: req.raisedBy,
      time: req.raisedAt,
    },
  ];
  if (req.approvedBy && req.approvedAt) {
    auditEntries.push({
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#38C172]" />,
      iconBg: 'bg-[#E9F8F0]',
      label: 'Approved',
      actor: req.approvedBy,
      time: req.approvedAt,
    });
  }
  if (req.rejectedBy && req.rejectedAt) {
    auditEntries.push({
      icon: <XCircle className="w-3.5 h-3.5 text-[#E44F4F]" />,
      iconBg: 'bg-[#FDECEC]',
      label: 'Rejected',
      actor: req.rejectedBy,
      time: req.rejectedAt,
    });
  }

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title={`${typeLabel} Detail`} showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-40">
        <div className="p-4 space-y-3">

          {/* ═══ 1. Header + Status ═══ */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-5 text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              isRefund ? 'bg-[#F5F3FF]' : 'bg-[#FDECEC]'
            }`}>
              {isRefund ? (
                <RotateCcw className="w-6 h-6 text-[#8B5CF6]" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-[#E44F4F]" />
              )}
            </div>
            <p className="text-sm text-[#8F9AA1] mb-1">{req.patientName}</p>
            <p className="text-3xl font-bold text-[#1A1A1A]">{formatUGX(req.amount)}</p>
            <div className="flex items-center justify-center gap-2 mt-2.5">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 ${sc.bg} ${sc.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                {sc.label}
              </span>
            </div>
          </div>

          {/* ═══ 2. Summary Card ═══ */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC]">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                {typeLabel} Summary
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <DetailRow
                icon={<User className="w-3.5 h-3.5 text-[#8F9AA1]" />}
                label="Patient"
                value={req.patientName}
              />
              <DetailRow
                icon={<Hash className="w-3.5 h-3.5 text-[#8F9AA1]" />}
                label="Reference"
                value={req.reference}
              />
              <DetailRow
                icon={mm.icon}
                label="Payment Method"
                value={mm.label}
              />
              <DetailRow
                icon={<Stethoscope className="w-3.5 h-3.5 text-[#8F9AA1]" />}
                label="Service"
                value={req.service}
              />
              <DetailRow
                icon={<User className="w-3.5 h-3.5 text-[#8F9AA1]" />}
                label="Raised By"
                value={req.staffName}
              />
            </div>
          </div>

          {/* ═══ 3. Reason + Notes ═══ */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-3">
              Reason
            </h3>
            <p className="text-sm text-[#1A1A1A] leading-relaxed">{req.reason}</p>
            {req.notes && (
              <div className="mt-3 p-3 rounded-xl bg-[#F7F9FC]">
                <p className="text-xs text-[#8F9AA1] mb-1 font-semibold">Additional Notes</p>
                <p className="text-sm text-[#4A4F55] leading-relaxed">{req.notes}</p>
              </div>
            )}
          </div>

          {/* ═══ Rejection reason (if rejected) ═══ */}
          {req.status === 'rejected' && req.rejectionReason && (
            <div className="bg-[#FDECEC] rounded-2xl border border-[#E44F4F]/15 p-4 flex items-start gap-2.5">
              <XCircle className="w-4 h-4 text-[#E44F4F] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[#1A1A1A] mb-0.5">Rejection Reason</p>
                <p className="text-sm text-[#4A4F55] leading-relaxed">{req.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* ═══ 4. Audit Trail ═══ */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC]">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Audit Trail
              </h3>
            </div>
            <div className="p-4">
              {auditEntries.map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full ${entry.iconBg} flex items-center justify-center flex-shrink-0`}>
                      {entry.icon}
                    </div>
                    {i < auditEntries.length - 1 && (
                      <div className="w-0.5 flex-1 min-h-[24px] bg-[#E5E8EC]" />
                    )}
                  </div>
                  <div className={`pb-4 ${i === auditEntries.length - 1 ? 'pb-0' : ''}`}>
                    <p className="text-sm font-medium text-[#1A1A1A]">{entry.label}</p>
                    <p className="text-xs text-[#8F9AA1] mt-0.5">{entry.actor}</p>
                    <p className="text-[10px] text-[#C9D0DB] mt-0.5">{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ═══ Sticky Actions (only if awaiting) ═══ */}
      {isAwaiting && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
          <div className="max-w-[390px] mx-auto p-4 space-y-2">
            <ABAButton variant="primary" fullWidth size="lg" onClick={() => setShowPin(true)}>
              <CheckCircle2 className="w-5 h-5" />
              Approve {typeLabel}
            </ABAButton>
            <ABAButton variant="destructive-soft" fullWidth size="lg" onClick={() => setShowReject(true)}>
              Reject {typeLabel}
            </ABAButton>
          </div>
        </div>
      )}

      {/* ═══ PIN Modal ═══ */}
      {showPin && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPin(false); }}
        >
          <div className="bg-[#FFFFFF] rounded-t-3xl w-full max-w-[390px] mx-auto pb-8">
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 rounded-full bg-[#C9D0DB]" />
            </div>
            <div className="px-5 text-center">
              <div className="w-14 h-14 rounded-full bg-[#E8F2FF] flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-[#3A8DFF]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">Enter PIN to Approve</h3>
              <p className="text-sm text-[#8F9AA1] mb-6">
                Enter your 4-digit PIN to confirm {typeLabel.toLowerCase()} of {formatUGX(req.amount)}.
              </p>

              {/* PIN Inputs */}
              <div className="flex justify-center gap-3 mb-4">
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { pinRefs.current[i] = el; }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinInput(i, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(i, e)}
                    className={`w-14 h-14 rounded-xl border-2 text-center text-2xl font-bold transition-all focus:outline-none ${
                      pinError
                        ? 'border-[#E44F4F] bg-[#FDECEC]/40 text-[#E44F4F]'
                        : digit
                        ? 'border-[#32C28A] bg-[#E9F8F0]/40 text-[#1A1A1A]'
                        : 'border-[#E5E8EC] bg-[#F7F9FC] text-[#1A1A1A]'
                    } focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A]`}
                  />
                ))}
              </div>

              {pinError && (
                <p className="text-xs text-[#E44F4F] font-medium mb-4">{pinError}</p>
              )}

              <div className="flex gap-3">
                <ABAButton variant="outline" className="flex-1" onClick={() => setShowPin(false)} disabled={approving}>
                  Cancel
                </ABAButton>
                <ABAButton variant="primary" className="flex-1" onClick={handleApproveSubmit} isLoading={approving}>
                  Confirm
                </ABAButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Reject Modal ═══ */}
      <ACConfirmModal
        isOpen={showReject}
        onClose={() => { setShowReject(false); setRejectReason(''); setRejectNote(''); setRejectDropdownOpen(false); }}
        title={`Reject ${typeLabel}?`}
        description={`This will reject the ${typeLabel.toLowerCase()} of ${formatUGX(req.amount)} for ${req.patientName}.`}
        icon={<XCircle className="w-5 h-5 text-[#E44F4F]" />}
        iconBg="bg-[#FDECEC]"
        confirmText="Reject"
        confirmVariant="destructive"
        onConfirm={handleRejectSubmit}
        isLoading={rejecting}
      >
        <div className="space-y-3">
          {/* Reason dropdown */}
          <div>
            <label className="block text-xs text-[#8F9AA1] mb-1.5">Rejection Reason *</label>
            <div className="relative">
              <button
                onClick={() => setRejectDropdownOpen(!rejectDropdownOpen)}
                className={`w-full h-11 px-3 rounded-xl border bg-[#F7F9FC] text-left flex items-center justify-between transition-all ${
                  rejectReason ? 'border-[#32C28A] text-[#1A1A1A]' : 'border-[#E5E8EC] text-[#C9D0DB]'
                }`}
              >
                <span className="text-sm truncate">{rejectReason || 'Select a reason...'}</span>
                <ChevronDown className={`w-4 h-4 text-[#8F9AA1] transition-transform ${rejectDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {rejectDropdownOpen && (
                <div className="absolute left-0 right-0 top-12 bg-[#FFFFFF] border border-[#E5E8EC] rounded-xl shadow-lg z-10 overflow-hidden">
                  {rejectReasons.map((r) => (
                    <button
                      key={r}
                      onClick={() => { setRejectReason(r); setRejectDropdownOpen(false); }}
                      className={`w-full px-3 py-2.5 text-sm text-left transition-colors hover:bg-[#F7F9FC] border-b border-[#E5E8EC] last:border-b-0 ${
                        rejectReason === r ? 'bg-[#E9F8F0] text-[#32C28A] font-semibold' : 'text-[#1A1A1A]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Optional note */}
          <div>
            <label className="block text-xs text-[#8F9AA1] mb-1.5">Additional Notes (optional)</label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={2}
              placeholder="Add any context..."
              className="w-full rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] p-3 text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all resize-none"
            />
          </div>
        </div>
      </ACConfirmModal>
    </div>
  );
}

/* ═══════ Sub-components ═══════ */

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#8F9AA1] flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium text-[#1A1A1A] text-right max-w-[55%] truncate">{value}</span>
    </div>
  );
}