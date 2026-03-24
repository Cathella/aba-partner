/**
 * accountantStore — In-memory store for the Accountant/Finance module.
 * Manages transactions, settlements, refunds, and financial summaries.
 * Uses useSyncExternalStore for React 18 compatibility.
 */

import { useSyncExternalStore } from 'react';

/* ─────────── types ─────────── */

export type ACTxStatus = 'paid' | 'pending' | 'failed' | 'refunded' | 'disputed';
export type ACPaymentMethod = 'cash' | 'mobile-money' | 'card' | 'insurance';
export type ACSettlementStatus = 'settled' | 'pending' | 'processing';
export type ACRequestStatus = 'awaiting' | 'approved' | 'rejected';
export type ACRequestType = 'refund' | 'dispute';

export interface ACTransaction {
  id: string;
  date: string;
  time: string;
  patientName: string;
  description: string;
  category: 'consultation' | 'lab' | 'pharmacy' | 'procedure' | 'membership' | 'other';
  amount: number;
  currency: string;
  method: ACPaymentMethod;
  status: ACTxStatus;
  reference: string;
  visitId?: string;
  invoiceNo?: string;
  notes?: string;
  refundReason?: string;
  refundedAt?: string;
  processedBy?: string;
  /** Linked-visit enrichment (for AC-03 detail view) */
  department?: string;
  staffName?: string;
  createdBy?: string;
  updatedBy?: string;
  /** Coverage traceability from station transfer approval */
  coverageSource?: 'Package' | 'Out-of-pocket';
  /** Applied package name (when coverageSource is 'Package') */
  coveragePackage?: string;
  /** Station type where coverage was applied */
  stationType?: 'Consultation' | 'Lab' | 'Pharmacy';
  /** Human-readable visit ID for cross-reference */
  displayVisitId?: string;
}

export interface ACSettlement {
  id: string;
  period: string;
  periodLabel: string;
  totalAmount: number;
  transactionCount: number;
  currency: string;
  status: ACSettlementStatus;
  settledAt?: string;
  bankAccount: string;
  reference: string;
  breakdown?: {
    cash: number;
    mobileMoney: number;
    card: number;
    insurance: number;
  };
  /** Enrichment for AC-05 detail view */
  expectedPayoutDate?: string;
  refundsDeducted?: number;
  payoutMethod?: 'bank' | 'mobile-money';
  generatedAt?: string;
  processingAt?: string;
}

export interface ACRefundDisputeRequest {
  id: string;
  type: ACRequestType;
  txId: string;
  patientName: string;
  amount: number;
  currency: string;
  method: ACPaymentMethod;
  service: string;
  reference: string;
  staffName: string;
  reason: string;
  notes?: string;
  status: ACRequestStatus;
  raisedAt: string;
  raisedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

/* ─────────── mock data ─────────── */

const mockTransactions: ACTransaction[] = [
  {
    id: 'tx-001',
    date: '2026-02-14',
    time: '08:22 AM',
    patientName: 'Sarah Namutebi',
    description: 'General Consultation',
    category: 'consultation',
    amount: 50000,
    currency: 'UGX',
    method: 'mobile-money',
    status: 'paid',
    reference: 'MM-20260214-001',
    visitId: 'clv-01',
    invoiceNo: 'INV-2026-0341',
    processedBy: 'Receptionist Apio',
    coverageSource: 'Package',
    coveragePackage: 'Consultation Only',
    stationType: 'Consultation',
    displayVisitId: 'V-000101',
  },
  {
    id: 'tx-002',
    date: '2026-02-14',
    time: '08:45 AM',
    patientName: 'James Okello',
    description: 'CBC + Urinalysis',
    category: 'lab',
    amount: 85000,
    currency: 'UGX',
    method: 'cash',
    status: 'paid',
    reference: 'CSH-20260214-002',
    invoiceNo: 'INV-2026-0342',
    processedBy: 'Receptionist Apio',
    coverageSource: 'Out-of-pocket',
    stationType: 'Lab',
    displayVisitId: 'V-000102',
  },
  {
    id: 'tx-003',
    date: '2026-02-14',
    time: '09:10 AM',
    patientName: 'Grace Akiteng',
    description: 'Amoxicillin 500mg + Paracetamol',
    category: 'pharmacy',
    amount: 32000,
    currency: 'UGX',
    method: 'mobile-money',
    status: 'pending',
    reference: 'MM-20260214-003',
    invoiceNo: 'INV-2026-0343',
    processedBy: 'Pharmacist Lule',
    coverageSource: 'Package',
    coveragePackage: 'Pharmacy Only',
    stationType: 'Pharmacy',
    displayVisitId: 'V-000103',
  },
  {
    id: 'tx-004',
    date: '2026-02-14',
    time: '09:35 AM',
    patientName: 'Peter Ssemwanga',
    description: 'Chronic Care Review',
    category: 'consultation',
    amount: 75000,
    currency: 'UGX',
    method: 'insurance',
    status: 'pending',
    reference: 'INS-20260214-004',
    visitId: 'clv-04',
    invoiceNo: 'INV-2026-0344',
    notes: 'AAR Insurance — awaiting claim approval',
    processedBy: 'Receptionist Apio',
    coverageSource: 'Package',
    coveragePackage: 'Care Bundle',
    stationType: 'Consultation',
    displayVisitId: 'V-000104',
  },
  {
    id: 'tx-005',
    date: '2026-02-14',
    time: '10:05 AM',
    patientName: 'Diana Nakamya',
    description: 'Walk-in Consultation',
    category: 'consultation',
    amount: 40000,
    currency: 'UGX',
    method: 'card',
    status: 'failed',
    reference: 'CRD-20260214-005',
    invoiceNo: 'INV-2026-0345',
    notes: 'Card declined — insufficient funds',
    processedBy: 'Receptionist Apio',
    coverageSource: 'Out-of-pocket',
    stationType: 'Consultation',
    displayVisitId: 'V-000105',
  },
  {
    id: 'tx-006',
    date: '2026-02-13',
    time: '02:30 PM',
    patientName: 'Moses Kato',
    description: 'Thyroid Panel',
    category: 'lab',
    amount: 120000,
    currency: 'UGX',
    method: 'mobile-money',
    status: 'paid',
    reference: 'MM-20260213-006',
    invoiceNo: 'INV-2026-0336',
    processedBy: 'Receptionist Apio',
    coverageSource: 'Package',
    coveragePackage: 'Lab Only',
    stationType: 'Lab',
    displayVisitId: 'V-000106',
  },
  {
    id: 'tx-007',
    date: '2026-02-13',
    time: '11:15 AM',
    patientName: 'Rose Adongo',
    description: 'Membership Renewal — Annual',
    category: 'membership',
    amount: 500000,
    currency: 'UGX',
    method: 'mobile-money',
    status: 'paid',
    reference: 'MM-20260213-007',
    invoiceNo: 'INV-2026-0335',
    processedBy: 'Receptionist Apio',
  },
  {
    id: 'tx-008',
    date: '2026-02-13',
    time: '09:45 AM',
    patientName: 'David Lubega',
    description: 'Minor Procedure — Wound Dressing',
    category: 'procedure',
    amount: 65000,
    currency: 'UGX',
    method: 'cash',
    status: 'refunded',
    reference: 'CSH-20260213-008',
    invoiceNo: 'INV-2026-0334',
    refundReason: 'Patient cancelled before procedure',
    refundedAt: '02:00 PM',
    processedBy: 'Receptionist Apio',
    coverageSource: 'Out-of-pocket',
    displayVisitId: 'V-000108',
  },
  {
    id: 'tx-009',
    date: '2026-02-12',
    time: '10:20 AM',
    patientName: 'Fatima Namukwaya',
    description: 'General Consultation + X-ray',
    category: 'consultation',
    amount: 150000,
    currency: 'UGX',
    method: 'insurance',
    status: 'disputed',
    reference: 'INS-20260212-009',
    invoiceNo: 'INV-2026-0328',
    notes: 'Jubilee Insurance disputes X-ray charge',
    processedBy: 'Receptionist Apio',
    coverageSource: 'Package',
    coveragePackage: 'Care Bundle',
    stationType: 'Consultation',
    displayVisitId: 'V-000109',
  },
  {
    id: 'tx-010',
    date: '2026-02-12',
    time: '08:00 AM',
    patientName: 'Ronald Mugisha',
    description: 'Pharmacy — Metformin 850mg (30 tablets)',
    category: 'pharmacy',
    amount: 28000,
    currency: 'UGX',
    method: 'cash',
    status: 'paid',
    reference: 'CSH-20260212-010',
    invoiceNo: 'INV-2026-0327',
    processedBy: 'Pharmacist Lule',
    coverageSource: 'Package',
    coveragePackage: 'Pharmacy Only',
    stationType: 'Pharmacy',
    displayVisitId: 'V-000110',
  },
  {
    id: 'tx-011',
    date: '2026-02-12',
    time: '03:10 PM',
    patientName: 'Esther Nabwire',
    description: 'Speech Therapy Session',
    category: 'consultation',
    amount: 80000,
    currency: 'UGX',
    method: 'card',
    status: 'paid',
    reference: 'CRD-20260212-011',
    invoiceNo: 'INV-2026-0329',
    processedBy: 'Receptionist Apio',
    coverageSource: 'Package',
    coveragePackage: 'Consultation Only',
    stationType: 'Consultation',
    displayVisitId: 'V-000111',
  },
  {
    id: 'tx-012',
    date: '2026-02-11',
    time: '11:00 AM',
    patientName: 'Samuel Opio',
    description: 'Follow-up Visit',
    category: 'consultation',
    amount: 30000,
    currency: 'UGX',
    method: 'mobile-money',
    status: 'paid',
    reference: 'MM-20260211-012',
    invoiceNo: 'INV-2026-0320',
    processedBy: 'Receptionist Apio',
    coverageSource: 'Out-of-pocket',
    stationType: 'Consultation',
    displayVisitId: 'V-000112',
  },
];

const mockSettlements: ACSettlement[] = [
  {
    id: 'stl-001',
    period: '2026-02-14',
    periodLabel: 'Today — 14 Feb 2026',
    totalAmount: 282000,
    transactionCount: 5,
    currency: 'UGX',
    status: 'pending',
    bankAccount: 'Stanbic •••4521',
    reference: 'STL-20260214',
    breakdown: { cash: 85000, mobileMoney: 82000, card: 40000, insurance: 75000 },
    expectedPayoutDate: '16 Feb 2026',
    refundsDeducted: 0,
    payoutMethod: 'bank',
    generatedAt: '14 Feb 2026, 11:00 PM',
  },
  {
    id: 'stl-002',
    period: '2026-02-13',
    periodLabel: 'Yesterday — 13 Feb 2026',
    totalAmount: 685000,
    transactionCount: 3,
    currency: 'UGX',
    status: 'processing',
    bankAccount: 'Stanbic •••4521',
    reference: 'STL-20260213',
    breakdown: { cash: 65000, mobileMoney: 620000, card: 0, insurance: 0 },
    expectedPayoutDate: '15 Feb 2026',
    refundsDeducted: 65000,
    payoutMethod: 'bank',
    generatedAt: '13 Feb 2026, 11:00 PM',
    processingAt: '14 Feb 2026, 06:00 AM',
  },
  {
    id: 'stl-003',
    period: '2026-02-12',
    periodLabel: '12 Feb 2026',
    totalAmount: 258000,
    transactionCount: 3,
    currency: 'UGX',
    status: 'settled',
    settledAt: '13 Feb 2026, 06:00 AM',
    bankAccount: 'Stanbic •••4521',
    reference: 'STL-20260212',
    breakdown: { cash: 28000, mobileMoney: 0, card: 80000, insurance: 150000 },
    refundsDeducted: 0,
    payoutMethod: 'bank',
    generatedAt: '12 Feb 2026, 11:00 PM',
    processingAt: '13 Feb 2026, 02:00 AM',
  },
  {
    id: 'stl-004',
    period: '2026-02-11',
    periodLabel: '11 Feb 2026',
    totalAmount: 30000,
    transactionCount: 1,
    currency: 'UGX',
    status: 'settled',
    settledAt: '12 Feb 2026, 06:00 AM',
    bankAccount: 'Stanbic •••4521',
    reference: 'STL-20260211',
    breakdown: { cash: 0, mobileMoney: 30000, card: 0, insurance: 0 },
    refundsDeducted: 0,
    payoutMethod: 'mobile-money',
    generatedAt: '11 Feb 2026, 11:00 PM',
    processingAt: '12 Feb 2026, 02:00 AM',
  },
  {
    id: 'stl-005',
    period: '2026-02-10',
    periodLabel: '10 Feb 2026',
    totalAmount: 415000,
    transactionCount: 4,
    currency: 'UGX',
    status: 'settled',
    settledAt: '11 Feb 2026, 06:00 AM',
    bankAccount: 'Stanbic •••4521',
    reference: 'STL-20260210',
    breakdown: { cash: 120000, mobileMoney: 195000, card: 50000, insurance: 50000 },
    refundsDeducted: 15000,
    payoutMethod: 'bank',
    generatedAt: '10 Feb 2026, 11:00 PM',
    processingAt: '11 Feb 2026, 02:00 AM',
  },
  {
    id: 'stl-006',
    period: '2026-02-09',
    periodLabel: '9 Feb 2026',
    totalAmount: 198000,
    transactionCount: 2,
    currency: 'UGX',
    status: 'settled',
    settledAt: '10 Feb 2026, 06:00 AM',
    bankAccount: 'Stanbic •••4521',
    reference: 'STL-20260209',
    breakdown: { cash: 48000, mobileMoney: 150000, card: 0, insurance: 0 },
    refundsDeducted: 0,
    payoutMethod: 'bank',
    generatedAt: '9 Feb 2026, 11:00 PM',
    processingAt: '10 Feb 2026, 02:00 AM',
  },
];

const mockRequests: ACRefundDisputeRequest[] = [
  {
    id: 'req-001',
    type: 'refund',
    txId: 'tx-002',
    patientName: 'James Okello',
    amount: 85000,
    currency: 'UGX',
    method: 'cash',
    service: 'CBC + Urinalysis',
    reference: 'CSH-20260214-002',
    staffName: 'Receptionist Apio',
    reason: 'Lab results delayed — patient requested full refund',
    notes: 'Patient waited over 4 hours. Lab equipment was down.',
    status: 'awaiting',
    raisedAt: '14 Feb 2026, 11:30 AM',
    raisedBy: 'Receptionist Apio',
  },
  {
    id: 'req-002',
    type: 'refund',
    txId: 'tx-006',
    patientName: 'Moses Kato',
    amount: 120000,
    currency: 'UGX',
    method: 'mobile-money',
    service: 'Thyroid Panel',
    reference: 'MM-20260213-006',
    staffName: 'Receptionist Apio',
    reason: 'Duplicate payment — patient paid twice via Aba Wallet',
    status: 'awaiting',
    raisedAt: '13 Feb 2026, 04:15 PM',
    raisedBy: 'Receptionist Apio',
  },
  {
    id: 'req-003',
    type: 'refund',
    txId: 'tx-011',
    patientName: 'Esther Nabwire',
    amount: 80000,
    currency: 'UGX',
    method: 'card',
    service: 'Speech Therapy Session',
    reference: 'CRD-20260212-011',
    staffName: 'Dr. Akello',
    reason: 'Session cancelled by clinician — reschedule requested',
    notes: 'Patient was willing to reschedule but prefers refund first.',
    status: 'approved',
    raisedAt: '12 Feb 2026, 04:30 PM',
    raisedBy: 'Dr. Akello',
    approvedBy: 'Accountant Byaruhanga',
    approvedAt: '12 Feb 2026, 05:10 PM',
  },
  {
    id: 'req-004',
    type: 'refund',
    txId: 'tx-012',
    patientName: 'Samuel Opio',
    amount: 30000,
    currency: 'UGX',
    method: 'mobile-money',
    service: 'Follow-up Visit',
    reference: 'MM-20260211-012',
    staffName: 'Receptionist Apio',
    reason: 'Wrong patient charged — billing error',
    status: 'rejected',
    raisedAt: '11 Feb 2026, 02:00 PM',
    raisedBy: 'Receptionist Apio',
    rejectedBy: 'Accountant Byaruhanga',
    rejectedAt: '11 Feb 2026, 03:45 PM',
    rejectionReason: 'Charge confirmed correct after verification with the patient.',
  },
  {
    id: 'req-005',
    type: 'dispute',
    txId: 'tx-009',
    patientName: 'Fatima Namukwaya',
    amount: 150000,
    currency: 'UGX',
    method: 'insurance',
    service: 'General Consultation + X-ray',
    reference: 'INS-20260212-009',
    staffName: 'Dr. Ssempijja',
    reason: 'Jubilee Insurance disputes X-ray charge — says not covered under policy',
    notes: 'Insurance company claims X-ray was elective, not part of the consultation plan.',
    status: 'awaiting',
    raisedAt: '13 Feb 2026, 09:00 AM',
    raisedBy: 'Insurance Desk — Juliet Nansubuga',
  },
  {
    id: 'req-006',
    type: 'dispute',
    txId: 'tx-007',
    patientName: 'Rose Adongo',
    amount: 500000,
    currency: 'UGX',
    method: 'mobile-money',
    service: 'Membership Renewal — Annual',
    reference: 'MM-20260213-007',
    staffName: 'Receptionist Apio',
    reason: 'Patient claims membership was already renewed last month',
    notes: 'Patient says they renewed on 15 Jan via bank transfer. Investigating.',
    status: 'awaiting',
    raisedAt: '14 Feb 2026, 09:45 AM',
    raisedBy: 'Receptionist Apio',
  },
  {
    id: 'req-007',
    type: 'dispute',
    txId: 'tx-010',
    patientName: 'Ronald Mugisha',
    amount: 28000,
    currency: 'UGX',
    method: 'cash',
    service: 'Pharmacy — Metformin 850mg (30 tablets)',
    reference: 'CSH-20260212-010',
    staffName: 'Pharmacist Lule',
    reason: 'Patient received wrong medication quantity — only 20 tablets instead of 30',
    status: 'approved',
    raisedAt: '12 Feb 2026, 10:30 AM',
    raisedBy: 'Pharmacist Lule',
    approvedBy: 'Accountant Byaruhanga',
    approvedAt: '12 Feb 2026, 11:15 AM',
  },
];

/* ─────────── store ─────────── */

interface AccountantState {
  transactions: ACTransaction[];
  settlements: ACSettlement[];
  requests: ACRefundDisputeRequest[];
}

let state: AccountantState = {
  transactions: [...mockTransactions],
  settlements: [...mockSettlements],
  requests: [...mockRequests],
};

const listeners = new Set<() => void>();

function emit() {
  state = { ...state };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AccountantState {
  return state;
}

/* ─────────── selectors ─────────── */

function deriveView(s: AccountantState) {
  const today = '2026-02-14';
  const todayTxs = s.transactions.filter((t) => t.date === today);
  const paidToday = todayTxs.filter((t) => t.status === 'paid');
  const pendingTxs = s.transactions.filter((t) => t.status === 'pending');
  const failedTxs = s.transactions.filter((t) => t.status === 'failed');
  const refundedTxs = s.transactions.filter((t) => t.status === 'refunded');
  const disputedTxs = s.transactions.filter((t) => t.status === 'disputed');

  const todayRevenue = paidToday.reduce((sum, t) => sum + t.amount, 0);
  const pendingAmount = pendingTxs.reduce((sum, t) => sum + t.amount, 0);
  const refundedAmount = refundedTxs.reduce((sum, t) => sum + t.amount, 0);

  /* Channel-aggregated stats helper */
  const computeChannelStats = (txList: ACTransaction[]) => {
    const paid = txList.filter((t) => t.status === 'paid');
    const abaWallet = paid.filter((t) => t.method === 'mobile-money').reduce((s, t) => s + t.amount, 0);
    const cash = paid.filter((t) => t.method === 'cash').reduce((s, t) => s + t.amount, 0);
    const corporate = paid.filter((t) => t.method === 'insurance').reduce((s, t) => s + t.amount, 0);
    const card = paid.filter((t) => t.method === 'card').reduce((s, t) => s + t.amount, 0);
    const totalCollected = paid.reduce((s, t) => s + t.amount, 0);
    return { abaWallet, cash, corporate, card, totalCollected };
  };

  /* Pre-computed by period */
  const todayChannels = computeChannelStats(todayTxs);
  const last7 = s.transactions.filter((t) => t.date >= '2026-02-08');
  const last30 = s.transactions.filter((t) => t.date >= '2026-01-16');
  const channels7d = computeChannelStats(last7);
  const channels30d = computeChannelStats(last30);
  const channelsAll = computeChannelStats(s.transactions);

  /* Settlement & refund alert counts */
  const pendingSettlements = s.settlements.filter((st) => st.status === 'pending').length;
  const processingSettlements = s.settlements.filter((st) => st.status === 'processing').length;

  /* Request counts */
  const awaitingRefunds = s.requests.filter((r) => r.type === 'refund' && r.status === 'awaiting').length;
  const awaitingDisputes = s.requests.filter((r) => r.type === 'dispute' && r.status === 'awaiting').length;

  return {
    transactions: s.transactions,
    settlements: s.settlements,
    requests: s.requests,
    stats: {
      todayRevenue,
      todayTransactions: todayTxs.length,
      pendingAmount,
      pendingCount: pendingTxs.length,
      failedCount: failedTxs.length,
      refundedAmount,
      refundedCount: refundedTxs.length,
      disputedCount: disputedTxs.length,
      totalTransactions: s.transactions.length,
    },
    channelStats: {
      today: todayChannels,
      '7d': channels7d,
      '30d': channels30d,
      all: channelsAll,
    },
    alertStats: {
      pendingSettlements,
      processingSettlements,
      refundRequests: refundedTxs.length,
      disputedPayments: disputedTxs.length,
      awaitingRefunds,
      awaitingDisputes,
    },
    getTransactionById: (id: string) => s.transactions.find((t) => t.id === id),
    getSettlementById: (id: string) => s.settlements.find((st) => st.id === id),
    getTransactionsForDate: (date: string) => s.transactions.filter((t) => t.date === date),
    getRequestById: (id: string) => s.requests.find((r) => r.id === id),
  };
}

/* ─────────── hook ─────────── */

export function useAccountantStore() {
  const s = useSyncExternalStore(subscribe, getSnapshot);
  return deriveView(s);
}

/* ─────────── mutations ─────────── */

export function markRefunded(txId: string, reason: string) {
  const now = new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit', hour12: true });
  state = {
    ...state,
    transactions: state.transactions.map((t) =>
      t.id === txId
        ? { ...t, status: 'refunded' as ACTxStatus, refundReason: reason, refundedAt: now }
        : t
    ),
  };
  emit();
}

export function markDisputed(txId: string, note: string) {
  state = {
    ...state,
    transactions: state.transactions.map((t) =>
      t.id === txId
        ? { ...t, status: 'disputed' as ACTxStatus, notes: note }
        : t
    ),
  };
  emit();
}

export function resolveDispute(txId: string, resolution: 'paid' | 'refunded') {
  state = {
    ...state,
    transactions: state.transactions.map((t) =>
      t.id === txId ? { ...t, status: resolution as ACTxStatus } : t
    ),
  };
  emit();
}

export function approveRequest(reqId: string) {
  const now = new Date();
  const ts = now.toLocaleString('en-UG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
  state = {
    ...state,
    requests: state.requests.map((r) =>
      r.id === reqId
        ? { ...r, status: 'approved' as ACRequestStatus, approvedBy: 'Accountant Byaruhanga', approvedAt: ts }
        : r
    ),
  };
  emit();
}

export function rejectRequest(reqId: string, reason: string) {
  const now = new Date();
  const ts = now.toLocaleString('en-UG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
  state = {
    ...state,
    requests: state.requests.map((r) =>
      r.id === reqId
        ? { ...r, status: 'rejected' as ACRequestStatus, rejectedBy: 'Accountant Byaruhanga', rejectedAt: ts, rejectionReason: reason }
        : r
    ),
  };
  emit();
}

/* ─────────── helpers ─────────── */

export function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString('en-UG')}`;
}