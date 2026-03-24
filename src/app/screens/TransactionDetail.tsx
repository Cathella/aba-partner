import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABABadge } from '../components/aba/ABABadge';
import { ABAButton } from '../components/aba/ABAButton';
import { ABAModal } from '../components/aba/ABAModal';
import { PINModal } from '../components/aba/PINModal';
import { showToast } from '../components/aba/Toast';
import {
  Receipt,
  Calendar,
  Clock,
  User,
  FileText,
  DollarSign,
  Wallet,
  Smartphone,
  AlertTriangle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

type PaymentMethod = 'wallet' | 'cash' | 'momo';
type TransactionStatus = 'completed' | 'pending' | 'disputed' | 'refunded' | 'voided';

interface Transaction {
  id: string;
  patientName: string;
  patientPhone: string;
  service: string;
  amount: string;
  method: PaymentMethod;
  status: TransactionStatus;
  date: string;
  time: string;
  reference: string;
  visitReference: string;
  assignedStaff: string;
  duration: string;
}

const mockTransactions: Record<string, Transaction> = {
  '1': {
    id: '1',
    patientName: 'Sarah Johnson',
    patientPhone: '+256 700 123 456',
    service: 'Speech Therapy',
    amount: '150,000',
    method: 'wallet',
    status: 'completed',
    date: '2026-02-11',
    time: '09:15 AM',
    reference: 'TXN-2026-001234',
    visitReference: 'VISIT-001234',
    assignedStaff: 'Dr. Emily Chen',
    duration: '60 min',
  },
  '2': {
    id: '2',
    patientName: 'Michael Smith',
    patientPhone: '+256 700 234 567',
    service: 'Occupational Therapy',
    amount: '100,000',
    method: 'momo',
    status: 'completed',
    date: '2026-02-11',
    time: '10:45 AM',
    reference: 'TXN-2026-001235',
    visitReference: 'VISIT-001235',
    assignedStaff: 'Dr. James Wilson',
    duration: '45 min',
  },
  '3': {
    id: '3',
    patientName: 'Emma Davis',
    patientPhone: '+256 700 345 678',
    service: 'Behavioral Assessment',
    amount: '200,000',
    method: 'cash',
    status: 'pending',
    date: '2026-02-11',
    time: '11:20 AM',
    reference: 'TXN-2026-001236',
    visitReference: 'VISIT-001236',
    assignedStaff: 'Dr. Sarah Martinez',
    duration: '90 min',
  },
  '4': {
    id: '4',
    patientName: 'Olivia Brown',
    patientPhone: '+256 700 456 789',
    service: 'Parent Consultation',
    amount: '100,000',
    method: 'wallet',
    status: 'disputed',
    date: '2026-02-11',
    time: '02:30 PM',
    reference: 'TXN-2026-001237',
    visitReference: 'VISIT-001237',
    assignedStaff: 'Dr. Emily Chen',
    duration: '45 min',
  },
};

const methodConfig: Record<PaymentMethod, { label: string; icon: any }> = {
  wallet: { label: 'ABA Wallet', icon: Wallet },
  cash: { label: 'Cash', icon: DollarSign },
  momo: { label: 'Mobile Money', icon: Smartphone },
};

const statusConfig: Record<
  TransactionStatus,
  { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' }
> = {
  completed: { label: 'Completed', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  disputed: { label: 'Disputed', variant: 'error' },
  refunded: { label: 'Refunded', variant: 'info' },
  voided: { label: 'Voided', variant: 'neutral' },
};

const disputeReasons = [
  'Service not provided',
  'Incorrect amount charged',
  'Duplicate transaction',
  'Payment already made',
  'Service quality issue',
  'Other',
];

export function TransactionDetail() {
  const navigate = useNavigate();
  const { transactionId } = useParams();
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [showPINModal, setShowPINModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'refund' | 'void' | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeNotes, setDisputeNotes] = useState('');
  const [showDisputeReasonDropdown, setShowDisputeReasonDropdown] = useState(false);

  const transaction = transactionId ? mockTransactions[transactionId] : null;

  if (!transaction) {
    return (
      <div className="flex flex-col h-screen bg-aba-bg-primary">
        <AppTopBar
          title="Transaction Detail"
          showBack
          onBackClick={() => navigate('/transactions-list')}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-aba-neutral-600">Transaction not found</p>
        </div>
      </div>
    );
  }

  const MethodIcon = methodConfig[transaction.method].icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleFlagDispute = () => {
    if (disputeReason.trim()) {
      showToast('Transaction flagged for dispute', 'success');
      setShowDisputeModal(false);
      setDisputeReason('');
      setDisputeNotes('');
      setTimeout(() => {
        navigate('/transactions-list');
      }, 500);
    }
  };

  const handleInitiateRefund = () => {
    setShowRefundModal(false);
    setPendingAction('refund');
    setShowPINModal(true);
  };

  const handleInitiateVoid = () => {
    setShowVoidModal(false);
    setPendingAction('void');
    setShowPINModal(true);
  };

  const handlePINSuccess = () => {
    if (pendingAction === 'refund') {
      showToast('Refund approved successfully', 'success');
    } else if (pendingAction === 'void') {
      showToast('Transaction voided successfully', 'success');
    }
    setShowPINModal(false);
    setPendingAction(null);
    setTimeout(() => {
      navigate('/transactions-list');
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Transaction Details"
        showBack
        onBackClick={() => navigate('/transactions-list')}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="p-4 space-y-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            <ABABadge variant={statusConfig[transaction.status].variant} size="md">
              {statusConfig[transaction.status].label}
            </ABABadge>
          </div>

          {/* Receipt Preview */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-aba-primary-main" />
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Receipt
              </h3>
            </div>

            {/* Amount */}
            <div className="text-center py-4 mb-4 border-b border-aba-neutral-200">
              <p className="text-xs text-aba-neutral-600 mb-1">Amount Paid</p>
              <p className="text-3xl font-bold text-aba-neutral-900">
                UGX {transaction.amount}
              </p>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-aba-neutral-600">Transaction ID</span>
                <span className="font-medium text-aba-neutral-900">
                  {transaction.reference}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-aba-neutral-600">Visit Reference</span>
                <span className="font-medium text-aba-neutral-900">
                  {transaction.visitReference}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-aba-neutral-600">Payment Method</span>
                <div className="flex items-center gap-1.5">
                  <MethodIcon className="w-4 h-4 text-aba-neutral-600" />
                  <span className="font-medium text-aba-neutral-900">
                    {methodConfig[transaction.method].label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4 space-y-3">
            <h3 className="text-base font-semibold text-aba-neutral-900">
              Service Information
            </h3>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-aba-neutral-600">Service</p>
                <p className="text-sm font-medium text-aba-neutral-900">
                  {transaction.service}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-aba-neutral-600">Assigned Staff</p>
                <p className="text-sm font-medium text-aba-neutral-900">
                  {transaction.assignedStaff}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-aba-neutral-600">Date</p>
                <p className="text-sm font-medium text-aba-neutral-900">
                  {formatDate(transaction.date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-aba-neutral-600">Time</p>
                <p className="text-sm font-medium text-aba-neutral-900">
                  {transaction.time} ({transaction.duration})
                </p>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4 space-y-3">
            <h3 className="text-base font-semibold text-aba-neutral-900">
              Patient Information
            </h3>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-aba-neutral-600">Name</p>
                <p className="text-sm font-medium text-aba-neutral-900">
                  {transaction.patientName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-aba-neutral-600">Phone</p>
                <p className="text-sm font-medium text-aba-neutral-900">
                  {transaction.patientPhone}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          {transaction.status === 'completed' && (
            <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4 space-y-3">
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Admin Actions
              </h3>

              <div className="space-y-2">
                <ABAButton
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => setShowDisputeModal(true)}
                >
                  <AlertTriangle className="w-5 h-5" />
                  Flag Dispute
                </ABAButton>

                <ABAButton
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => setShowRefundModal(true)}
                >
                  <DollarSign className="w-5 h-5" />
                  Approve Refund
                </ABAButton>

                <ABAButton
                  variant="destructive"
                  size="md"
                  fullWidth
                  onClick={handleInitiateVoid}
                >
                  <XCircle className="w-5 h-5" />
                  Void Transaction
                </ABAButton>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Flag Dispute Modal */}
      <ABAModal
        isOpen={showDisputeModal}
        onClose={() => {
          setShowDisputeModal(false);
          setDisputeReason('');
          setDisputeNotes('');
        }}
        title="Flag Dispute"
      >
        <div className="space-y-4">
          <div className="bg-aba-warning-50 border border-aba-warning-200 rounded-xl p-4 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-aba-warning-main mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-aba-neutral-900">
                Flag this transaction for dispute investigation.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
              Dispute Reason *
            </label>
            <div className="relative">
              <button
                onClick={() => setShowDisputeReasonDropdown(!showDisputeReasonDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-aba-neutral-200 bg-white hover:border-aba-neutral-300 transition-colors text-left"
              >
                <span
                  className={
                    disputeReason ? 'text-aba-neutral-900' : 'text-aba-neutral-500'
                  }
                >
                  {disputeReason || 'Select reason'}
                </span>
              </button>

              {showDisputeReasonDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-aba-neutral-200 shadow-lg z-10 max-h-60 overflow-y-auto">
                  {disputeReasons.map((reason, index) => (
                    <button
                      key={reason}
                      onClick={() => {
                        setDisputeReason(reason);
                        setShowDisputeReasonDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        disputeReason === reason
                          ? 'bg-aba-primary-50 text-aba-primary-main font-medium'
                          : 'text-aba-neutral-900 hover:bg-aba-neutral-50'
                      } ${index === 0 ? 'rounded-t-xl' : ''} ${
                        index === disputeReasons.length - 1 ? 'rounded-b-xl' : ''
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              placeholder="Add any relevant details..."
              value={disputeNotes}
              onChange={(e) => setDisputeNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-aba-neutral-900 placeholder:text-aba-neutral-600 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => {
                setShowDisputeModal(false);
                setDisputeReason('');
                setDisputeNotes('');
              }}
            >
              Cancel
            </ABAButton>
            <ABAButton
              variant="primary"
              fullWidth
              onClick={handleFlagDispute}
              disabled={!disputeReason.trim()}
            >
              Flag Dispute
            </ABAButton>
          </div>
        </div>
      </ABAModal>

      {/* Approve Refund Modal */}
      <ABAModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        title="Approve Refund"
      >
        <div className="space-y-4">
          <div className="bg-aba-secondary-50 border border-aba-secondary-200 rounded-xl p-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-aba-secondary-main mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-aba-neutral-900 mb-1">
                You are about to approve a refund of{' '}
                <span className="font-medium">UGX {transaction.amount}</span> to{' '}
                <span className="font-medium">{transaction.patientName}</span>.
              </p>
              <p className="text-xs text-aba-neutral-700">
                This action requires Admin PIN verification and will be logged for
                audit purposes.
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => setShowRefundModal(false)}
            >
              Cancel
            </ABAButton>
            <ABAButton variant="primary" fullWidth onClick={handleInitiateRefund}>
              Continue
            </ABAButton>
          </div>
        </div>
      </ABAModal>

      {/* Void Transaction Modal */}
      <ABAModal
        isOpen={showVoidModal}
        onClose={() => setShowVoidModal(false)}
        title="Void Transaction"
      >
        <div className="space-y-4">
          <div className="bg-aba-error-50 border border-aba-error-200 rounded-xl p-4 flex items-start gap-2">
            <XCircle className="w-4 h-4 text-aba-error-main mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-aba-neutral-900 mb-1">
                Warning: Irreversible Action
              </p>
              <p className="text-xs text-aba-neutral-700">
                Voiding this transaction will permanently mark it as invalid. This
                action requires Admin PIN verification and will be logged for audit
                purposes.
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => setShowVoidModal(false)}
            >
              Cancel
            </ABAButton>
            <ABAButton variant="destructive" fullWidth onClick={handleInitiateVoid}>
              Continue
            </ABAButton>
          </div>
        </div>
      </ABAModal>

      {/* PIN Modal */}
      <PINModal
        isOpen={showPINModal}
        onClose={() => {
          setShowPINModal(false);
          setPendingAction(null);
        }}
        onSuccess={handlePINSuccess}
        title={pendingAction === 'refund' ? 'Approve Refund' : 'Void Transaction'}
        description={`Enter your Admin PIN to ${
          pendingAction === 'refund' ? 'approve the refund' : 'void this transaction'
        }`}
      />
    </div>
  );
}