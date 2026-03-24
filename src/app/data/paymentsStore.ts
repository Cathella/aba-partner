/**
 * paymentsStore — Shared in-memory store for the Receptionist Payments module.
 * R-40 Payments Home, R-41 Billing Summary, R-42 Collect Payment, R-43 Receipt, R-44 Failed.
 * Uses useSyncExternalStore for React 18 compatibility.
 */

import { useSyncExternalStore } from 'react';

/* ─────────── types ─────────── */

export interface BillingItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export type PaymentStatus = 'unpaid' | 'paid' | 'pending' | 'failed';
export type PaymentMethod = 'wallet' | 'cash' | 'mobile-money' | 'split';

export interface PaymentRecord {
  id: string;
  patient: string;
  phone: string;
  service: string;
  visitDate: string;
  visitTime: string;
  items: BillingItem[];
  subtotal: number;
  /** Member / insurance coverage (if applicable) */
  coverage?: {
    provider: string;
    memberId: string;
    percentage: number;
    amount: number;
  };
  total: number;
  /** Amount patient still owes after coverage */
  amountDue: number;
  status: PaymentStatus;
  method?: PaymentMethod;
  /** For split: wallet portion */
  splitWallet?: number;
  /** For split: cash portion */
  splitCash?: number;
  paidAt?: string;
  reference?: string;
  isMember: boolean;
}

/* ─────────── helpers ─────────── */

function fmtUGX(amount: number): string {
  return `UGX ${amount.toLocaleString('en-UG')}`;
}

export { fmtUGX };

function genRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let r = 'ABA-';
  for (let i = 0; i < 8; i++) r += chars[Math.floor(Math.random() * chars.length)];
  return r;
}

/* ─────────── initial mock data ─────────── */

const today = 'Feb 13, 2026';

const initialPayments: PaymentRecord[] = [
  {
    id: 'pay-01',
    patient: 'Jane Nakamya',
    phone: '+256 701 234 567',
    service: 'Speech Therapy',
    visitDate: today,
    visitTime: '09:00 AM',
    items: [
      { id: 'li-01a', description: 'Speech Therapy Session (45 min)', qty: 1, unitPrice: 80000, total: 80000 },
      { id: 'li-01b', description: 'Materials fee', qty: 1, unitPrice: 5000, total: 5000 },
    ],
    subtotal: 85000,
    coverage: { provider: 'UAP Insurance', memberId: 'UAP-4412', percentage: 30, amount: 25500 },
    total: 85000,
    amountDue: 59500,
    status: 'paid',
    method: 'wallet',
    paidAt: '09:55 AM',
    reference: 'ABA-QJ7T4HNP',
    isMember: true,
  },
  {
    id: 'pay-02',
    patient: 'Peter Ochieng',
    phone: '+256 702 345 678',
    service: 'OT Session',
    visitDate: today,
    visitTime: '09:30 AM',
    items: [
      { id: 'li-02a', description: 'OT Session (60 min)', qty: 1, unitPrice: 60000, total: 60000 },
    ],
    subtotal: 60000,
    total: 60000,
    amountDue: 60000,
    status: 'paid',
    method: 'cash',
    paidAt: '10:20 AM',
    reference: 'ABA-MK93RPWZ',
    isMember: false,
  },
  {
    id: 'pay-03',
    patient: 'Ruth Amongi',
    phone: '+256 703 456 789',
    service: 'Behavioral Assessment',
    visitDate: today,
    visitTime: '10:00 AM',
    items: [
      { id: 'li-03a', description: 'Behavioral Assessment (Initial)', qty: 1, unitPrice: 120000, total: 120000 },
      { id: 'li-03b', description: 'Assessment kit', qty: 1, unitPrice: 15000, total: 15000 },
    ],
    subtotal: 135000,
    coverage: { provider: 'Jubilee Health', memberId: 'JUB-8821', percentage: 20, amount: 27000 },
    total: 135000,
    amountDue: 108000,
    status: 'unpaid',
    isMember: true,
  },
  {
    id: 'pay-04',
    patient: 'Moses Okello',
    phone: '+256 704 567 890',
    service: 'Follow-up',
    visitDate: today,
    visitTime: '10:30 AM',
    items: [
      { id: 'li-04a', description: 'Follow-up Consultation', qty: 1, unitPrice: 50000, total: 50000 },
    ],
    subtotal: 50000,
    total: 50000,
    amountDue: 50000,
    status: 'unpaid',
    isMember: false,
  },
  {
    id: 'pay-05',
    patient: 'Grace Atim',
    phone: '+256 705 678 901',
    service: 'Parent Consult',
    visitDate: today,
    visitTime: '10:15 AM',
    items: [
      { id: 'li-05a', description: 'Parent Consultation (30 min)', qty: 1, unitPrice: 40000, total: 40000 },
    ],
    subtotal: 40000,
    total: 40000,
    amountDue: 40000,
    status: 'unpaid',
    isMember: false,
  },
  {
    id: 'pay-06',
    patient: 'David Ssemwogerere',
    phone: '+256 701 111 222',
    service: 'Speech Therapy',
    visitDate: today,
    visitTime: '08:30 AM',
    items: [
      { id: 'li-06a', description: 'Speech Therapy Session (45 min)', qty: 1, unitPrice: 80000, total: 80000 },
    ],
    subtotal: 80000,
    total: 80000,
    amountDue: 80000,
    status: 'paid',
    method: 'wallet',
    paidAt: '08:45 AM',
    reference: 'ABA-LN5V2XHG',
    isMember: false,
  },
  {
    id: 'pay-07',
    patient: 'Isaac Lubega',
    phone: '+256 712 345 678',
    service: 'Blood Work',
    visitDate: today,
    visitTime: '08:00 AM',
    items: [
      { id: 'li-07a', description: 'Lab — CBC Panel', qty: 1, unitPrice: 35000, total: 35000 },
      { id: 'li-07b', description: 'Lab — Metabolic Panel', qty: 1, unitPrice: 45000, total: 45000 },
    ],
    subtotal: 80000,
    total: 80000,
    amountDue: 80000,
    status: 'pending',
    method: 'wallet',
    isMember: false,
  },
  {
    id: 'pay-08',
    patient: 'Agnes Nansubuga',
    phone: '+256 715 678 901',
    service: 'Behavioral Assessment',
    visitDate: today,
    visitTime: '09:15 AM',
    items: [
      { id: 'li-08a', description: 'Behavioral Assessment (Initial)', qty: 1, unitPrice: 120000, total: 120000 },
    ],
    subtotal: 120000,
    coverage: { provider: 'AAR Health', memberId: 'AAR-1190', percentage: 50, amount: 60000 },
    total: 120000,
    amountDue: 60000,
    status: 'unpaid',
    isMember: true,
  },
  {
    id: 'pay-09',
    patient: 'Samuel Mugabe',
    phone: '+256 714 567 890',
    service: 'Speech Therapy',
    visitDate: today,
    visitTime: '09:45 AM',
    items: [
      { id: 'li-09a', description: 'Speech Therapy Session (45 min)', qty: 1, unitPrice: 80000, total: 80000 },
      { id: 'li-09b', description: 'Home exercise printout', qty: 1, unitPrice: 3000, total: 3000 },
    ],
    subtotal: 83000,
    total: 83000,
    amountDue: 83000,
    status: 'unpaid',
    isMember: false,
  },
];

/* ─────────── store engine ─────────── */

let _items: PaymentRecord[] = initialPayments.map((p) => ({ ...p }));
let _version = 0;
const _listeners = new Set<() => void>();

function emit() {
  _version++;
  _listeners.forEach((fn) => fn());
}

/* ── public getters ── */

export function getPayments(): PaymentRecord[] {
  return _items;
}

export function getPaymentById(id: string): PaymentRecord | undefined {
  return _items.find((p) => p.id === id);
}

/* ── KPI computations ── */

export function getPaymentKPIs() {
  let collected = 0;
  let pendingAmt = 0;
  let unpaidAmt = 0;
  let paidToday = 0;

  _items.forEach((p) => {
    if (p.status === 'paid') {
      collected += p.amountDue;
      paidToday++;
    } else if (p.status === 'pending') {
      pendingAmt += p.amountDue;
    } else if (p.status === 'unpaid') {
      unpaidAmt += p.amountDue;
    }
  });

  return { collected, pendingAmt, unpaidAmt, paidToday, totalCount: _items.length };
}

/** End-of-Day summary — wallet / cash / split / pending breakdowns. */
export function getEndOfDaySummary() {
  let walletTotal = 0;
  let cashTotal = 0;
  let pendingCount = 0;
  let pendingTotal = 0;
  let paidCount = 0;

  _items.forEach((p) => {
    if (p.status === 'paid') {
      paidCount++;
      if (p.method === 'wallet') {
        walletTotal += p.amountDue;
      } else if (p.method === 'cash') {
        cashTotal += p.amountDue;
      } else if (p.method === 'split') {
        walletTotal += p.splitWallet ?? 0;
        cashTotal += p.splitCash ?? 0;
      }
    } else if (p.status === 'pending' || p.status === 'failed') {
      pendingCount++;
      pendingTotal += p.amountDue;
    } else if (p.status === 'unpaid') {
      pendingCount++;
      pendingTotal += p.amountDue;
    }
  });

  return {
    walletTotal,
    cashTotal,
    totalCollected: walletTotal + cashTotal,
    pendingCount,
    pendingTotal,
    paidCount,
    totalPatients: _items.length,
  };
}

/* ── mutations ── */

/** Record a successful payment. */
export function recordPayment(
  id: string,
  opts: {
    method: PaymentMethod;
    splitWallet?: number;
    splitCash?: number;
  }
) {
  const now = new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
  _items = _items.map((p) =>
    p.id === id
      ? {
          ...p,
          status: 'paid' as PaymentStatus,
          method: opts.method,
          splitWallet: opts.splitWallet,
          splitCash: opts.splitCash,
          paidAt: now,
          reference: genRef(),
        }
      : p
  );
  emit();
}

/** Mark a payment as pending (e.g. after wallet failure). */
export function markPending(id: string) {
  _items = _items.map((p) =>
    p.id === id
      ? { ...p, status: 'pending' as PaymentStatus }
      : p
  );
  emit();
}

/** Mark a payment as failed. */
export function markFailed(id: string) {
  _items = _items.map((p) =>
    p.id === id
      ? { ...p, status: 'failed' as PaymentStatus }
      : p
  );
  emit();
}

/* ── React hook ── */

function getSnapshot(): number {
  return _version;
}

function subscribe(cb: () => void): () => void {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

export function usePaymentsStore() {
  useSyncExternalStore(subscribe, getSnapshot);
  return {
    payments: getPayments(),
    getPaymentById,
    getPaymentKPIs,
    getEndOfDaySummary,
    recordPayment,
    markPending,
    markFailed,
  };
}