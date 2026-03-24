/**
 * AC-03 Transaction Detail — Full detail view for a single transaction.
 *
 * Sections:
 *   1. Summary card: amount, status, method chip, reference ID, timestamp
 *   2. Linked visit info: service, department, staff (sample enrichment)
 *   3. Actions: Export receipt (toast), Flag dispute, Request refund/void (→ AC-08)
 *   4. Audit snippet: "Created by …", "Updated by …"
 *
 * Inner page: back arrow, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { copyToClipboard } from '../utils/clipboard';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { ACStatusChip } from '../components/aba/ACStatusChip';
import { ACConfirmModal } from '../components/aba/ACConfirmModal';
import { showToast } from '../components/aba/Toast';
import {
  useAccountantStore,
  formatUGX,
  markDisputed,
} from '../data/accountantStore';
import type { ACPaymentMethod } from '../data/accountantStore';
import {
  Banknote,
  Smartphone,
  CreditCard,
  ShieldCheck,
  Clock,
  Hash,
  Copy,
  FileDown,
  AlertCircle,
  RotateCcw,
  Stethoscope,
  Building,
  User,
  History,
  CheckCircle2,
  Wallet,
  FlaskConical,
  Pill,
} from 'lucide-react';

/* ── method display config ── */

const methodMeta: Record<ACPaymentMethod, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  cash: { label: 'Cash', icon: <Banknote className="w-5 h-5" />, color: 'text-[#38C172]', bg: 'bg-[#E9F8F0]' },
  'mobile-money': { label: 'Aba Wallet', icon: <Smartphone className="w-5 h-5" />, color: 'text-[#3A8DFF]', bg: 'bg-[#E8F2FF]' },
  card: { label: 'Card', icon: <CreditCard className="w-5 h-5" />, color: 'text-[#D97706]', bg: 'bg-[#FFF3DC]' },
  insurance: { label: 'Corporate', icon: <ShieldCheck className="w-5 h-5" />, color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]' },
};

/* ── department enrichment (prototype sample) ── */

const deptMap: Record<string, string> = {
  consultation: 'Outpatient Department',
  lab: 'Laboratory',
  pharmacy: 'Pharmacy',
  procedure: 'Minor Theatre',
  membership: 'Front Desk',
  other: 'General',
};

const staffMap: Record<string, string> = {
  consultation: 'Dr. Mugisha K.',
  lab: 'Lab Tech Wamala',
  pharmacy: 'Pharmacist Lule',
  procedure: 'Dr. Mugisha K.',
  membership: 'Receptionist Apio',
  other: 'Staff Member',
};

/* ════════════════════════════════════════ */

export function ACTransactionDetail() {
  const navigate = useNavigate();
  const { txId } = useParams<{ txId: string }>();
  const { getTransactionById } = useAccountantStore();
  const tx = getTransactionById(txId || '');

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeNote, setDisputeNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  /* ── not found ── */
  if (!tx) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Transaction Detail" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Transaction not found</p>
        </div>
      </div>
    );
  }

  const mm = methodMeta[tx.method];
  const department = tx.department || deptMap[tx.category] || 'General';
  const staff = tx.staffName || staffMap[tx.category] || tx.processedBy || 'Staff Member';
  const createdBy = tx.createdBy || tx.processedBy || 'Receptionist Apio';
  const updatedBy = tx.updatedBy || 'Accountant Byaruhanga';

  /* Copy helper */
  const handleCopy = (text: string) => {
    copyToClipboard(text);
    showToast('Copied to clipboard', 'success');
  };

  /* Action: export receipt */
  const handleExportReceipt = () => {
    copyToClipboard(
      `Transaction #${tx.id}\nPatient: ${tx.patient}\nAmount: UGX ${tx.amount.toLocaleString()}\nMethod: ${tx.method}\nDate: ${tx.date}`
    );
    showToast('Receipt details copied to clipboard', 'success');
  };

  /* Action: flag dispute modal → store mutation */
  const handleFlagDispute = () => {
    setIsProcessing(true);
    setTimeout(() => {
      markDisputed(tx.id, disputeNote || 'Flagged by Accountant');
      setIsProcessing(false);
      setShowDisputeModal(false);
      setDisputeNote('');
      showToast('Transaction flagged as disputed', 'warning');
    }, 500);
  };

  /* Action: request refund/void → navigate to AC-08 */
  const handleRequestRefund = () => {
    navigate(`/ac/refund-request/${tx.id}`);
  };

  /* Actionable? */
  const canDispute = tx.status === 'paid' || tx.status === 'pending';
  const canRefund = tx.status === 'paid';
  const showActions = canDispute || canRefund;

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Transaction Detail" showBack onBackClick={() => navigate(-1)} />

      <div className={`flex-1 overflow-y-auto ${showActions ? 'pb-44' : 'pb-6'}`}>
        <div className="p-4 space-y-3">

          {/* ═══ 1. Summary Card ═══ */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-5">
            {/* Amount */}
            <p className="text-3xl font-bold text-center text-[#1A1A1A]">
              {tx.status === 'refunded' ? '-' : ''}{formatUGX(tx.amount)}
            </p>

            {/* Status + method */}
            <div className="flex items-center justify-center gap-2.5 mt-3">
              <ACStatusChip status={tx.status} size="md" />
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${mm.bg} ${mm.color}`}>
                {mm.label}
              </span>
            </div>

            {/* Meta rows */}
            <div className="mt-5 space-y-3 pt-4 border-t border-[#E5E8EC]">
              <SummaryRow
                icon={<Hash className="w-3.5 h-3.5 text-[#8F9AA1]" />}
                label="Reference"
                value={tx.reference}
                onCopy={() => handleCopy(tx.reference)}
              />
              {tx.invoiceNo && (
                <SummaryRow
                  icon={<Hash className="w-3.5 h-3.5 text-[#8F9AA1]" />}
                  label="Invoice"
                  value={tx.invoiceNo}
                  onCopy={() => handleCopy(tx.invoiceNo!)}
                />
              )}
              <SummaryRow
                icon={<Clock className="w-3.5 h-3.5 text-[#8F9AA1]" />}
                label="Timestamp"
                value={`${tx.date} at ${tx.time}`}
              />
            </div>
          </div>

          {/* ═══ 2. Linked Visit Info ═══ */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC]">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Linked Visit Information
              </h3>
            </div>

            <div className="p-4 space-y-3.5">
              <VisitInfoRow
                icon={<Stethoscope className="w-4 h-4 text-[#56D8A8]" />}
                iconBg="bg-[#DFF7EE]"
                label="Service"
                value={tx.description}
              />
              <VisitInfoRow
                icon={<Building className="w-4 h-4 text-[#3A8DFF]" />}
                iconBg="bg-[#E8F2FF]"
                label="Department"
                value={department}
              />
              <VisitInfoRow
                icon={<User className="w-4 h-4 text-[#4A4F55]" />}
                iconBg="bg-[#F7F9FC]"
                label="Staff"
                value={staff}
              />
              {tx.visitId && (
                <VisitInfoRow
                  icon={<Hash className="w-4 h-4 text-[#C9D0DB]" />}
                  iconBg="bg-[#F7F9FC]"
                  label="Visit ID"
                  value={tx.visitId}
                />
              )}
            </div>
          </div>

          {/* ═══ 2b. Coverage Traceability ═══ */}
          {(tx.coverageSource || tx.displayVisitId) && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#56D8A8]" />
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Coverage
                </h3>
              </div>

              <div className="p-4 space-y-3.5">
                {tx.coverageSource && (
                  <VisitInfoRow
                    icon={
                      tx.coverageSource === 'Package'
                        ? <ShieldCheck className="w-4 h-4 text-[#38C172]" />
                        : <Wallet className="w-4 h-4 text-[#8F9AA1]" />
                    }
                    iconBg={tx.coverageSource === 'Package' ? 'bg-[#E9F8F0]' : 'bg-[#F7F9FC]'}
                    label="Coverage Source"
                    value={tx.coverageSource}
                  />
                )}
                {tx.coveragePackage && (
                  <VisitInfoRow
                    icon={<ShieldCheck className="w-4 h-4 text-[#56D8A8]" />}
                    iconBg="bg-[#DFF7EE]"
                    label="Applied Package"
                    value={tx.coveragePackage}
                  />
                )}
                {tx.stationType && (
                  <VisitInfoRow
                    icon={
                      tx.stationType === 'Lab'
                        ? <FlaskConical className="w-4 h-4 text-[#3A8DFF]" />
                        : tx.stationType === 'Pharmacy'
                        ? <Pill className="w-4 h-4 text-[#8B5CF6]" />
                        : <Stethoscope className="w-4 h-4 text-[#56D8A8]" />
                    }
                    iconBg={
                      tx.stationType === 'Lab'
                        ? 'bg-[#E8F2FF]'
                        : tx.stationType === 'Pharmacy'
                        ? 'bg-[#F5F3FF]'
                        : 'bg-[#DFF7EE]'
                    }
                    label="Station Type"
                    value={tx.stationType}
                  />
                )}
                {tx.displayVisitId && (
                  <VisitInfoRow
                    icon={<Hash className="w-4 h-4 text-[#C9D0DB]" />}
                    iconBg="bg-[#F7F9FC]"
                    label="Visit ID"
                    value={tx.displayVisitId}
                  />
                )}
                {/* Payment status + method summary */}
                <div className="flex items-center gap-3 pt-2 border-t border-[#E5E8EC]">
                  <div className={`w-8 h-8 rounded-lg ${mm.bg} flex items-center justify-center flex-shrink-0`}>
                    <CreditCard className={`w-4 h-4 ${mm.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-[#8F9AA1] uppercase tracking-wide">Payment</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <ACStatusChip status={tx.status} />
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-[2px] rounded-full ${mm.bg} ${mm.color}`}>
                        {mm.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ Notes / Dispute / Refund info ═══ */}
          {(tx.notes || tx.refundReason) && (
            <div className={`rounded-2xl border p-4 ${
              tx.status === 'disputed'
                ? 'bg-[#FDECEC] border-[#E44F4F]/15'
                : tx.status === 'refunded'
                ? 'bg-[#F5F3FF] border-[#8B5CF6]/15'
                : 'bg-[#FFF3DC] border-[#FFB649]/15'
            }`}>
              <div className="flex items-start gap-2.5">
                <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  tx.status === 'disputed' ? 'text-[#E44F4F]' : tx.status === 'refunded' ? 'text-[#8B5CF6]' : 'text-[#D97706]'
                }`} />
                <div>
                  <p className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide mb-1">
                    {tx.status === 'refunded' ? 'Refund Reason' : tx.status === 'disputed' ? 'Dispute Note' : 'Notes'}
                  </p>
                  <p className="text-sm text-[#4A4F55] leading-relaxed">{tx.refundReason || tx.notes}</p>
                  {tx.refundedAt && (
                    <p className="text-xs text-[#8B5CF6] font-medium mt-2">Refunded at {tx.refundedAt}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ 3. Audit Snippet ═══ */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC]">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Audit Trail
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <AuditEntry
                label="Created"
                value={`${createdBy} — ${tx.date} at ${tx.time}`}
                icon={<CheckCircle2 className="w-3 h-3 text-[#38C172]" />}
              />
              <AuditEntry
                label="Last updated"
                value={`${updatedBy} — ${tx.date} at ${tx.time}`}
                icon={<History className="w-3 h-3 text-[#3A8DFF]" />}
              />
              {tx.status === 'refunded' && tx.refundedAt && (
                <AuditEntry
                  label="Refunded"
                  value={`${updatedBy} — ${tx.date} at ${tx.refundedAt}`}
                  icon={<RotateCcw className="w-3 h-3 text-[#8B5CF6]" />}
                />
              )}
              {tx.status === 'disputed' && (
                <AuditEntry
                  label="Disputed"
                  value={`${updatedBy} — flagged for review`}
                  icon={<AlertCircle className="w-3 h-3 text-[#E44F4F]" />}
                />
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ═══ 4. Sticky Actions ═══ */}
      {showActions && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
          <div className="p-4 space-y-2">
            {/* Export receipt — always available */}
            <ABAButton variant="outline" fullWidth onClick={handleExportReceipt}>
              <FileDown className="w-4 h-4" />
              Export Receipt
            </ABAButton>

            {/* Flag dispute */}
            {canDispute && tx.status !== 'disputed' && (
              <ABAButton variant="outline" fullWidth onClick={() => setShowDisputeModal(true)}>
                <AlertCircle className="w-4 h-4" />
                Flag Dispute
              </ABAButton>
            )}

            {/* Request refund/void */}
            {canRefund && (
              <ABAButton variant="destructive" fullWidth onClick={handleRequestRefund}>
                <RotateCcw className="w-4 h-4" />
                Request Refund / Void
              </ABAButton>
            )}
          </div>
        </div>
      )}

      {/* ═══ Dispute Modal ═══ */}
      <ACConfirmModal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        title="Flag Dispute"
        description="Mark this transaction as disputed for further review."
        icon={<AlertCircle className="w-5 h-5 text-[#E44F4F]" />}
        iconBg="bg-[#FDECEC]"
        confirmText="Flag as Disputed"
        confirmVariant="destructive"
        onConfirm={handleFlagDispute}
        isLoading={isProcessing}
      >
        <textarea
          value={disputeNote}
          onChange={(e) => setDisputeNote(e.target.value)}
          placeholder="Describe the dispute..."
          rows={3}
          className="w-full border border-[#E5E8EC] bg-[#F7F9FC] p-3 text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#56D8A8]/30 focus:border-[#56D8A8] transition-all resize-none rounded-[14px]"
        />
      </ACConfirmModal>
    </div>
  );
}

/* ═══════ Sub-components ═══════ */

function SummaryRow({
  icon,
  label,
  value,
  onCopy,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onCopy?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#8F9AA1] flex items-center gap-1.5">{icon}{label}</span>
      {onCopy ? (
        <button onClick={onCopy} className="flex items-center gap-1.5 group">
          <span className="text-xs font-medium text-[#1A1A1A]">{value}</span>
          <Copy className="w-3 h-3 text-[#C9D0DB] group-hover:text-[#3A8DFF] transition-colors" />
        </button>
      ) : (
        <span className="text-xs font-medium text-[#1A1A1A]">{value}</span>
      )}
    </div>
  );
}

function VisitInfoRow({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[#8F9AA1] uppercase tracking-wide text-[12px]">{label}</p>
        <p className="text-sm text-[#1A1A1A] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function AuditEntry({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-5 h-5 rounded-full bg-[#F7F9FC] flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[#8F9AA1] uppercase tracking-wide text-[12px]">{label}</p>
        <p className="text-xs text-[#4A4F55] mt-0.5">{value}</p>
      </div>
    </div>
  );
}