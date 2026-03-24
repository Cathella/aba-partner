import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABABadge } from '../components/aba/ABABadge';
import { ListCard, ListCardItem, KPICard } from '../components/aba/Cards';
import {
  ChevronLeft,
  FileText,
  ChevronRight,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
} from 'lucide-react';

type SettlementStatus = 'pending' | 'processed' | 'paid';

interface Settlement {
  id: string;
  batchNumber: string;
  status: SettlementStatus;
  amount: string;
  transactionCount: number;
  dateCreated: string;
  dateProcessed?: string;
  datePaid?: string;
}

const mockSettlements: Settlement[] = [
  {
    id: '1',
    batchNumber: 'BATCH-2026-002',
    status: 'pending',
    amount: '3,125,000',
    transactionCount: 45,
    dateCreated: '2026-02-11',
  },
  {
    id: '2',
    batchNumber: 'BATCH-2026-001',
    status: 'processed',
    amount: '5,480,000',
    transactionCount: 78,
    dateCreated: '2026-02-06',
    dateProcessed: '2026-02-10',
  },
  {
    id: '3',
    batchNumber: 'BATCH-2026-000',
    status: 'paid',
    amount: '4,920,000',
    transactionCount: 67,
    dateCreated: '2026-02-03',
    dateProcessed: '2026-02-05',
    datePaid: '2026-02-06',
  },
  {
    id: '4',
    batchNumber: 'BATCH-2026-099',
    status: 'paid',
    amount: '6,150,000',
    transactionCount: 89,
    dateCreated: '2026-01-29',
    dateProcessed: '2026-01-31',
    datePaid: '2026-02-01',
  },
];

const statusConfig: Record<
  SettlementStatus,
  { label: string; variant: 'success' | 'warning' | 'info'; icon: any }
> = {
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  processed: { label: 'Processed', variant: 'info', icon: CheckCircle },
  paid: { label: 'Paid', variant: 'success', icon: DollarSign },
};

export function SettlementLedger() {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const pendingSettlements = mockSettlements.filter((s) => s.status === 'pending');
  const processedSettlements = mockSettlements.filter((s) => s.status === 'processed');
  const paidSettlements = mockSettlements.filter((s) => s.status === 'paid');

  const totalPending = pendingSettlements.reduce(
    (sum, s) => sum + parseFloat(s.amount.replace(/,/g, '')),
    0
  );

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Settlement Ledger"
        showBack
        onBackClick={() => navigate(-1)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Summary Card */}
          <KPICard
            title="Total Pending Settlements"
            value={`UGX ${totalPending.toLocaleString()}`}
            subtitle={`${pendingSettlements.length} ${pendingSettlements.length === 1 ? 'batch' : 'batches'} pending`}
            icon={<DollarSign className="w-4 h-4" />}
            variant="dark"
          />

          {/* Pending Settlements */}
          {pendingSettlements.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  Pending Settlements
                </h3>
                <ABABadge variant="warning" size="sm">
                  {pendingSettlements.length}
                </ABABadge>
              </div>
              <ListCard>
                {pendingSettlements.map((settlement) => {
                  const StatusIcon = statusConfig[settlement.status].icon;
                  return (
                    <ListCardItem
                      key={settlement.id}
                      onClick={() => navigate(`/settlement-detail/${settlement.id}`)}
                    >
                      <div className="w-10 h-10 rounded-full bg-aba-warning-50 flex items-center justify-center flex-shrink-0">
                        <StatusIcon className="w-5 h-5 text-aba-warning-main" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-aba-neutral-900 mb-0.5">
                          {settlement.batchNumber}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-aba-neutral-600">
                          <span>{settlement.transactionCount} transactions</span>
                          <span>•</span>
                          <span>{formatDate(settlement.dateCreated)}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-aba-neutral-900">
                          UGX {settlement.amount}
                        </p>
                        <ChevronRight className="w-5 h-5 text-aba-neutral-400 ml-auto mt-1" />
                      </div>
                    </ListCardItem>
                  );
                })}
              </ListCard>
            </div>
          )}

          {/* Processed Settlements */}
          {processedSettlements.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  Processed Settlements
                </h3>
                <ABABadge variant="info" size="sm">
                  {processedSettlements.length}
                </ABABadge>
              </div>
              <ListCard>
                {processedSettlements.map((settlement) => {
                  const StatusIcon = statusConfig[settlement.status].icon;
                  return (
                    <ListCardItem
                      key={settlement.id}
                      onClick={() => navigate(`/settlement-detail/${settlement.id}`)}
                    >
                      <div className="w-10 h-10 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                        <StatusIcon className="w-5 h-5 text-aba-secondary-main" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-aba-neutral-900 mb-0.5">
                          {settlement.batchNumber}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-aba-neutral-600">
                          <span>{settlement.transactionCount} transactions</span>
                          <span>•</span>
                          <span>{formatDate(settlement.dateProcessed!)}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-aba-neutral-900">
                          UGX {settlement.amount}
                        </p>
                        <ChevronRight className="w-5 h-5 text-aba-neutral-400 ml-auto mt-1" />
                      </div>
                    </ListCardItem>
                  );
                })}
              </ListCard>
            </div>
          )}

          {/* Paid Settlements */}
          {paidSettlements.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
                Paid Settlements
              </h3>
              <ListCard>
                {paidSettlements.map((settlement) => {
                  const StatusIcon = statusConfig[settlement.status].icon;
                  return (
                    <ListCardItem
                      key={settlement.id}
                      onClick={() => navigate(`/settlement-detail/${settlement.id}`)}
                    >
                      <div className="w-10 h-10 rounded-full bg-aba-success-50 flex items-center justify-center flex-shrink-0">
                        <StatusIcon className="w-5 h-5 text-aba-success-main" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-aba-neutral-900 mb-0.5">
                          {settlement.batchNumber}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-aba-neutral-600">
                          <span>{settlement.transactionCount} transactions</span>
                          <span>•</span>
                          <span>Paid {formatDate(settlement.datePaid!)}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-aba-neutral-900">
                          UGX {settlement.amount}
                        </p>
                        <ChevronRight className="w-5 h-5 text-aba-neutral-400 ml-auto mt-1" />
                      </div>
                    </ListCardItem>
                  );
                })}
              </ListCard>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-aba-secondary-50 border border-aba-secondary-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-aba-secondary-main mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-aba-neutral-900 mb-1">
                  Settlement Schedule
                </p>
                <p className="text-aba-neutral-700 text-[14px]">
                  Settlements are processed every <strong>Monday</strong> and{' '}
                  <strong>Thursday</strong>. Funds are typically transferred within
                  1-2 business days after processing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}