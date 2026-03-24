import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { BottomNav } from '../components/aba/BottomNav';
import { ABABadge } from '../components/aba/ABABadge';
import { useState } from 'react';
import {
  ChevronLeft,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Wallet,
  Smartphone,
} from 'lucide-react';

type SettlementStatus = 'pending' | 'processed' | 'paid';
type PaymentMethod = 'wallet' | 'cash' | 'momo';

interface Transaction {
  id: string;
  reference: string;
  patientName: string;
  service: string;
  amount: string;
  method: PaymentMethod;
  date: string;
}

interface Settlement {
  id: string;
  batchNumber: string;
  status: SettlementStatus;
  amount: string;
  transactionCount: number;
  dateCreated: string;
  dateProcessed?: string;
  datePaid?: string;
  transactions: Transaction[];
  breakdown: {
    wallet: string;
    cash: string;
    momo: string;
  };
}

const mockSettlements: Record<string, Settlement> = {
  '1': {
    id: '1',
    batchNumber: 'BATCH-2026-002',
    status: 'pending',
    amount: '3,125,000',
    transactionCount: 45,
    dateCreated: '2026-02-11',
    transactions: [
      {
        id: '1',
        reference: 'TXN-2026-001234',
        patientName: 'Sarah Johnson',
        service: 'Speech Therapy',
        amount: '150,000',
        method: 'wallet',
        date: '2026-02-11',
      },
      {
        id: '2',
        reference: 'TXN-2026-001235',
        patientName: 'Michael Smith',
        service: 'Occupational Therapy',
        amount: '100,000',
        method: 'momo',
        date: '2026-02-11',
      },
      {
        id: '3',
        reference: 'TXN-2026-001236',
        patientName: 'Emma Davis',
        service: 'Behavioral Assessment',
        amount: '200,000',
        method: 'cash',
        date: '2026-02-11',
      },
    ],
    breakdown: {
      wallet: '1,850,000',
      cash: '620,000',
      momo: '655,000',
    },
  },
  '2': {
    id: '2',
    batchNumber: 'BATCH-2026-001',
    status: 'processed',
    amount: '5,480,000',
    transactionCount: 78,
    dateCreated: '2026-02-06',
    dateProcessed: '2026-02-10',
    transactions: [
      {
        id: '4',
        reference: 'TXN-2026-001180',
        patientName: 'Olivia Brown',
        service: 'Parent Consultation',
        amount: '100,000',
        method: 'wallet',
        date: '2026-02-06',
      },
      {
        id: '5',
        reference: 'TXN-2026-001181',
        patientName: 'Noah Williams',
        service: 'Follow-up Session',
        amount: '100,000',
        method: 'momo',
        date: '2026-02-06',
      },
    ],
    breakdown: {
      wallet: '2,840,000',
      cash: '1,320,000',
      momo: '1,320,000',
    },
  },
  '3': {
    id: '3',
    batchNumber: 'BATCH-2026-000',
    status: 'paid',
    amount: '4,920,000',
    transactionCount: 67,
    dateCreated: '2026-02-03',
    dateProcessed: '2026-02-05',
    datePaid: '2026-02-06',
    transactions: [
      {
        id: '6',
        reference: 'TXN-2026-001100',
        patientName: 'Ava Taylor',
        service: 'Initial Consultation',
        amount: '150,000',
        method: 'cash',
        date: '2026-02-03',
      },
    ],
    breakdown: {
      wallet: '2,460,000',
      cash: '1,230,000',
      momo: '1,230,000',
    },
  },
};

const statusConfig: Record<
  SettlementStatus,
  { label: string; variant: 'success' | 'warning' | 'info'; icon: any }
> = {
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  processed: { label: 'Processed', variant: 'info', icon: CheckCircle },
  paid: { label: 'Paid', variant: 'success', icon: DollarSign },
};

const methodConfig: Record<PaymentMethod, { label: string; icon: any }> = {
  wallet: { label: 'ABA Wallet', icon: Wallet },
  cash: { label: 'Cash', icon: DollarSign },
  momo: { label: 'Mobile Money', icon: Smartphone },
};

export function SettlementDetail() {
  const navigate = useNavigate();
  const { settlementId } = useParams();
  const [activeTab, setActiveTab] = useState('finance');

  const settlement = settlementId ? mockSettlements[settlementId] : null;

  if (!settlement) {
    return (
      <div className="flex flex-col h-screen bg-aba-bg-primary">
        <AppTopBar
          title="Settlement Detail"
          leftAction={
            <button
              onClick={() => navigate('/settlement-ledger')}
              className="p-2 -ml-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-aba-neutral-900" />
            </button>
          }
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-aba-neutral-600">Settlement not found</p>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[settlement.status].icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Settlement Details"
        leftAction={
          <button
            onClick={() => navigate('/settlement-ledger')}
            className="p-2 -ml-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-aba-neutral-900" />
          </button>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            <ABABadge variant={statusConfig[settlement.status].variant} size="lg">
              {statusConfig[settlement.status].label}
            </ABABadge>
          </div>

          {/* Amount Card */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-6">
            <div className="text-center">
              <p className="text-sm text-aba-neutral-600 mb-2">Settlement Amount</p>
              <p className="text-4xl font-bold text-aba-neutral-900 mb-1">
                UGX {settlement.amount}
              </p>
              <p className="text-xs text-aba-neutral-500">
                {settlement.transactionCount} transactions
              </p>
            </div>
          </div>

          {/* Settlement Information */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4 space-y-3">
            <h3 className="text-base font-semibold text-aba-neutral-900">
              Settlement Information
            </h3>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-aba-neutral-600">Batch Number</p>
                <p className="text-sm font-medium text-aba-neutral-900">
                  {settlement.batchNumber}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <StatusIcon className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-aba-neutral-600">Status</p>
                <p className="text-sm font-medium text-aba-neutral-900">
                  {statusConfig[settlement.status].label}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-aba-neutral-600">Date Created</p>
                <p className="text-sm font-medium text-aba-neutral-900">
                  {formatDate(settlement.dateCreated)}
                </p>
              </div>
            </div>

            {settlement.dateProcessed && (
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-aba-neutral-600">Date Processed</p>
                  <p className="text-sm font-medium text-aba-neutral-900">
                    {formatDate(settlement.dateProcessed)}
                  </p>
                </div>
              </div>
            )}

            {settlement.datePaid && (
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-aba-neutral-600">Date Paid</p>
                  <p className="text-sm font-medium text-aba-neutral-900">
                    {formatDate(settlement.datePaid)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Breakdown */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-4">
              Payment Method Breakdown
            </h3>
            <div className="space-y-3">
              {Object.entries(settlement.breakdown).map(([method, amount]) => {
                const MethodIcon = methodConfig[method as PaymentMethod].icon;
                return (
                  <div
                    key={method}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-aba-neutral-100 flex items-center justify-center">
                        <MethodIcon className="w-4 h-4 text-aba-neutral-600" />
                      </div>
                      <span className="text-sm text-aba-neutral-900">
                        {methodConfig[method as PaymentMethod].label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-aba-neutral-900">
                      UGX {amount}
                    </span>
                  </div>
                );
              })}
              <div className="border-t border-aba-neutral-200 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-aba-neutral-900">
                    Total
                  </span>
                  <span className="text-base font-bold text-aba-primary-main">
                    UGX {settlement.amount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
              Transaction Summary
            </h3>
            <div className="space-y-2">
              {settlement.transactions.slice(0, 5).map((transaction) => {
                const MethodIcon = methodConfig[transaction.method].icon;
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-2 border-b border-aba-neutral-100 last:border-0"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <MethodIcon className="w-4 h-4 text-aba-neutral-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-aba-neutral-900 truncate">
                          {transaction.patientName}
                        </p>
                        <p className="text-xs text-aba-neutral-500 truncate">
                          {transaction.reference}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-aba-neutral-900 flex-shrink-0 ml-2">
                      UGX {transaction.amount}
                    </span>
                  </div>
                );
              })}
              {settlement.transactionCount > 5 && (
                <p className="text-xs text-center text-aba-neutral-500 pt-2">
                  + {settlement.transactionCount - 5} more transactions
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
