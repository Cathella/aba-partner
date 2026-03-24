/**
 * pharmacistStore — In-memory store for the Pharmacist module.
 * Manages the prescription queue, dispensing, and inventory stubs.
 * Uses useSyncExternalStore for React 18 compatibility.
 *
 * Bridges with clinicianStore: when the pharmacist dispenses,
 * it also calls updateRxStatus() on the clinician store.
 */

import { useSyncExternalStore } from 'react';

/* ─────────── types ─────────── */

export type PHRxStatus =
  | 'new'
  | 'in-progress'
  | 'ready'
  | 'completed'
  | 'on-hold'
  | 'out-of-stock'
  | 'partial-fill';

export type PHRequestSource = 'internal' | 'external-rx';

export interface PHRxAttachment {
  fileName: string;
  fileType: string;
  fileSize: string;
}

export interface PHMedItem {
  id: string;
  name: string;
  dosage: string;
  form: string; // tablet, syrup, suspension, drops, cream, inhaler, injection
  frequency: string;
  duration: string;
  quantity: number;
  dispensedQty: number;
  stockLevel: 'in-stock' | 'low-stock' | 'out-of-stock';
  stockCount?: number;
  notes?: string;
  substitution?: string;
  awaitingStock?: boolean;
}

export interface PHPrescription {
  id: string;
  clinicianRxId: string; // maps to clinicianStore Prescription.id
  visitId: string;
  patientName: string;
  patientAge: string;
  patientGender: string;
  patientPhone?: string;
  isMember?: boolean;
  status: PHRxStatus;
  urgency: 'routine' | 'urgent' | 'stat';
  prescribedBy: string;
  prescribedAt: string;
  medications: PHMedItem[];
  clinicalNotes?: string;
  pharmacistNotes?: string;
  startedAt?: string;
  readyAt?: string;
  dispensedAt?: string;
  dispensedBy?: string;
  holdReason?: string;
  paymentStatus: 'paid' | 'pending' | 'waived';
  paymentAmount?: string;
  allergies?: string[];
  weight?: string;
  requestSource?: PHRequestSource;
  rxAttachments?: PHRxAttachment[];
  rxVerified?: boolean;
  /** Coverage status from station transfer approval */
  coverageStatus?: 'Covered' | 'Discount applied' | 'Out-of-pocket';
  /** Applied coverage package name */
  coveragePackage?: string;
  /** Coverage-level payment status (distinct from legacy paymentStatus) */
  coveragePaymentStatus?: 'Paid' | 'Pending' | 'Hold';
  /** Human-readable visit ID for cross-reference */
  displayVisitId?: string;
}

/* ── OTC types ── */

export type PHOtcStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'declined';

export interface PHOtcItem {
  id: string;
  name: string;
  quantity: number;
  preparedQty: number;
  unitPrice: string;
  stockLevel: 'in-stock' | 'low-stock' | 'out-of-stock';
  stockCount?: number;
  isRestricted?: boolean;
  substitution?: string;
}

export interface PHOtcOrder {
  id: string;
  customerName: string;
  customerPhone?: string;
  isMember?: boolean;
  status: PHOtcStatus;
  items: PHOtcItem[];
  requestedAt: string;
  totalAmount: string;
  paymentStatus: 'paid' | 'pending' | 'waived';
  preparedAt?: string;
  completedAt?: string;
  completedBy?: string;
  declineReason?: string;
  notes?: string;
}

export interface PHInventoryAlert {
  id: string;
  medName: string;
  currentStock: number;
  reorderLevel: number;
  severity: 'warning' | 'critical';
}

/* ─────────── initial mock data ─────────── */

let _medSeq = 20;

const initialPrescriptions: PHPrescription[] = [
  {
    id: 'ph-001',
    clinicianRxId: 'rx-01',
    visitId: 'clv-01',
    patientName: 'Jane Nakamya',
    patientAge: '32',
    patientGender: 'Female',
    patientPhone: '+256 7** *** 412',
    isMember: true,
    status: 'new',
    urgency: 'routine',
    prescribedBy: 'Dr. Ssekandi',
    prescribedAt: '09:45 AM',
    paymentStatus: 'paid',
    paymentAmount: 'UGX 25,000',
    allergies: ['Penicillin'],
    medications: [
      {
        id: 'med-01',
        name: 'Amoxicillin',
        dosage: '500 mg',
        form: 'tablet',
        frequency: 'TDS (3× daily)',
        duration: '7 days',
        quantity: 21,
        dispensedQty: 0,
        stockLevel: 'in-stock',
        stockCount: 340,
        notes: 'Patient allergic to Penicillin — confirm substitute',
      },
      {
        id: 'med-02',
        name: 'Paracetamol',
        dosage: '500 mg',
        form: 'tablet',
        frequency: 'PRN (as needed)',
        duration: '5 days',
        quantity: 10,
        dispensedQty: 0,
        stockLevel: 'in-stock',
        stockCount: 1200,
      },
    ],
    clinicalNotes: 'Suspected bacterial pharyngitis. NOTE: penicillin allergy — consider Azithromycin.',
    requestSource: 'internal',
    coverageStatus: 'Covered',
    coveragePackage: 'Pharmacy Only',
    displayVisitId: 'V-000101',
  },
  {
    id: 'ph-002',
    clinicianRxId: 'rx-02',
    visitId: 'clv-05',
    patientName: 'Kato Joseph',
    patientAge: '8',
    patientGender: 'Male',
    patientPhone: '+256 7** *** 889',
    isMember: true,
    status: 'in-progress',
    urgency: 'urgent',
    prescribedBy: 'Dr. Nambi',
    prescribedAt: '10:15 AM',
    startedAt: '10:20 AM',
    paymentStatus: 'paid',
    paymentAmount: 'UGX 18,500',
    weight: '24 kg',
    medications: [
      {
        id: 'med-03',
        name: 'Artemether-Lumefantrine',
        dosage: '20/120 mg',
        form: 'tablet',
        frequency: 'BD (2× daily) × 3 days',
        duration: '3 days',
        quantity: 12,
        dispensedQty: 12,
        stockLevel: 'in-stock',
        stockCount: 85,
      },
      {
        id: 'med-04',
        name: 'Paracetamol Syrup',
        dosage: '250 mg/5 mL',
        form: 'syrup',
        frequency: 'QDS (4× daily)',
        duration: '3 days',
        quantity: 1,
        dispensedQty: 1,
        stockLevel: 'low-stock',
        stockCount: 8,
      },
    ],
    clinicalNotes: 'Confirmed malaria (P. falciparum +). Weight-based dosing. Ensure parent understands timing.',
    requestSource: 'internal',
    coverageStatus: 'Covered',
    coveragePackage: 'Care Bundle',
    displayVisitId: 'V-000105',
  },
  {
    id: 'ph-003',
    clinicianRxId: 'rx-03',
    visitId: 'clv-10',
    patientName: 'Mugisha Daniel',
    patientAge: '5',
    patientGender: 'Male',
    patientPhone: '+256 7** *** 301',
    isMember: false,
    status: 'ready',
    urgency: 'routine',
    prescribedBy: 'Dr. Ssekandi',
    prescribedAt: '08:30 AM',
    startedAt: '08:35 AM',
    readyAt: '08:50 AM',
    paymentStatus: 'pending',
    paymentAmount: 'UGX 12,000',
    medications: [
      {
        id: 'med-05',
        name: 'Cotrimoxazole',
        dosage: '240 mg/5 mL',
        form: 'suspension',
        frequency: 'BD (2× daily)',
        duration: '5 days',
        quantity: 1,
        dispensedQty: 1,
        stockLevel: 'in-stock',
        stockCount: 45,
      },
    ],
    clinicalNotes: 'UTI confirmed on urinalysis.',
    requestSource: 'internal',
    coverageStatus: 'Out-of-pocket',
    coveragePaymentStatus: 'Pending',
    displayVisitId: 'V-000110',
  },
  {
    id: 'ph-004',
    clinicianRxId: 'rx-04',
    visitId: 'clv-11',
    patientName: 'Auma Rebecca',
    patientAge: '14',
    patientGender: 'Female',
    patientPhone: '+256 7** *** 556',
    isMember: true,
    status: 'completed',
    urgency: 'routine',
    prescribedBy: 'Dr. Nambi',
    prescribedAt: '07:50 AM',
    startedAt: '07:55 AM',
    readyAt: '08:05 AM',
    dispensedAt: '08:15 AM',
    dispensedBy: 'Pharmacist Lule',
    paymentStatus: 'paid',
    paymentAmount: 'UGX 8,000',
    medications: [
      {
        id: 'med-06',
        name: 'Metformin',
        dosage: '500 mg',
        form: 'tablet',
        frequency: 'OD (once daily)',
        duration: '30 days',
        quantity: 30,
        dispensedQty: 30,
        stockLevel: 'in-stock',
        stockCount: 200,
      },
    ],
    clinicalNotes: 'Screening glucose normal but family hx — starting low-dose metformin per protocol.',
    requestSource: 'internal',
    coverageStatus: 'Discount applied',
    coveragePackage: 'Care Bundle',
    displayVisitId: 'V-000111',
  },
  {
    id: 'ph-005',
    clinicianRxId: 'rx-05',
    visitId: 'clv-12',
    patientName: 'Ssemakula Ivan',
    patientAge: '6',
    patientGender: 'Male',
    patientPhone: '+256 7** *** 778',
    isMember: true,
    status: 'on-hold',
    urgency: 'stat',
    prescribedBy: 'Dr. Ssekandi',
    prescribedAt: '10:00 AM',
    paymentStatus: 'pending',
    paymentAmount: 'UGX 35,000',
    holdReason: 'Payment pending — parent went to Mobile Money agent',
    allergies: [],
    medications: [
      {
        id: 'med-07',
        name: 'Albendazole',
        dosage: '400 mg',
        form: 'tablet',
        frequency: 'Stat (single dose)',
        duration: '1 day',
        quantity: 1,
        dispensedQty: 0,
        stockLevel: 'in-stock',
        stockCount: 120,
      },
      {
        id: 'med-08',
        name: 'Zinc Sulphate',
        dosage: '20 mg',
        form: 'tablet',
        frequency: 'OD (once daily)',
        duration: '14 days',
        quantity: 14,
        dispensedQty: 0,
        stockLevel: 'low-stock',
        stockCount: 15,
      },
      {
        id: 'med-09',
        name: 'ORS Sachets',
        dosage: 'Standard',
        form: 'sachet',
        frequency: 'PRN (after each stool)',
        duration: '5 days',
        quantity: 10,
        dispensedQty: 0,
        stockLevel: 'in-stock',
        stockCount: 300,
      },
    ],
    clinicalNotes: 'Chronic diarrhea. O&P positive. Treat parasites + supportive hydration.',
    requestSource: 'internal',
    coverageStatus: 'Covered',
    coveragePackage: 'Pharmacy Only',
    displayVisitId: 'V-000112',
  },
  {
    id: 'ph-006',
    clinicianRxId: 'rx-06',
    visitId: 'clv-13',
    patientName: 'Nalubega Faith',
    patientAge: '10',
    patientGender: 'Female',
    patientPhone: '+256 7** *** 190',
    isMember: false,
    status: 'out-of-stock',
    urgency: 'routine',
    prescribedBy: 'Dr. Nambi',
    prescribedAt: '09:00 AM',
    paymentStatus: 'waived',
    medications: [
      {
        id: 'med-10',
        name: 'Ferrous Sulphate',
        dosage: '200 mg',
        form: 'tablet',
        frequency: 'OD (once daily)',
        duration: '30 days',
        quantity: 30,
        dispensedQty: 0,
        stockLevel: 'out-of-stock',
        stockCount: 0,
      },
      {
        id: 'med-11',
        name: 'Folic Acid',
        dosage: '5 mg',
        form: 'tablet',
        frequency: 'OD (once daily)',
        duration: '30 days',
        quantity: 30,
        dispensedQty: 0,
        stockLevel: 'in-stock',
        stockCount: 450,
      },
    ],
    clinicalNotes: 'Pre-op workup shows mild iron-deficiency anemia. Start iron supplementation.',
    requestSource: 'external-rx',
    rxAttachments: [
      { fileName: 'rx-nalubega-faith.pdf', fileType: 'PDF', fileSize: '185 KB' },
    ],
    rxVerified: false,
    coverageStatus: 'Out-of-pocket',
    coveragePaymentStatus: 'Hold',
    displayVisitId: 'V-000113',
  },
  {
    id: 'ph-007',
    clinicianRxId: '',
    visitId: 'clv-14',
    patientName: 'Okello Samuel',
    patientAge: '3',
    patientGender: 'Male',
    patientPhone: '+256 7** *** 044',
    isMember: true,
    status: 'new',
    urgency: 'stat',
    prescribedBy: 'Dr. Ssekandi',
    prescribedAt: '10:30 AM',
    paymentStatus: 'paid',
    paymentAmount: 'UGX 22,000',
    weight: '14 kg',
    allergies: [],
    medications: [
      {
        id: 'med-12',
        name: 'Artemether-Lumefantrine',
        dosage: '20/120 mg',
        form: 'tablet',
        frequency: 'BD (2× daily) × 3 days',
        duration: '3 days',
        quantity: 6,
        dispensedQty: 0,
        stockLevel: 'in-stock',
        stockCount: 85,
      },
      {
        id: 'med-13',
        name: 'Paracetamol Drops',
        dosage: '100 mg/mL',
        form: 'drops',
        frequency: 'QDS (4× daily)',
        duration: '3 days',
        quantity: 1,
        dispensedQty: 0,
        stockLevel: 'in-stock',
        stockCount: 22,
      },
    ],
    clinicalNotes: 'Confirmed P. falciparum malaria — STAT treatment. High fever × 3 days.',
    requestSource: 'internal',
    coverageStatus: 'Covered',
    coveragePackage: 'Care Bundle',
    displayVisitId: 'V-000114',
  },
  /* ── External Rx prescriptions ── */
  {
    id: 'ph-008',
    clinicianRxId: '',
    visitId: '',
    patientName: 'Byaruhanga Moses',
    patientAge: '58',
    patientGender: 'Male',
    patientPhone: '+256 7** *** 371',
    isMember: false,
    status: 'new',
    urgency: 'routine',
    prescribedBy: 'Dr. Ouma (Kololo Medical Centre)',
    prescribedAt: '10:45 AM',
    paymentStatus: 'pending',
    paymentAmount: 'UGX 42,000',
    requestSource: 'external-rx',
    rxAttachments: [
      { fileName: 'kololo-prescription-moses.pdf', fileType: 'PDF', fileSize: '210 KB' },
      { fileName: 'previous-results.jpg', fileType: 'JPG', fileSize: '340 KB' },
    ],
    rxVerified: false,
    medications: [
      {
        id: 'med-14',
        name: 'Amlodipine',
        dosage: '5 mg',
        form: 'tablet',
        frequency: 'OD (once daily)',
        duration: '30 days',
        quantity: 30,
        dispensedQty: 0,
        stockLevel: 'in-stock',
        stockCount: 180,
      },
      {
        id: 'med-15',
        name: 'Losartan',
        dosage: '50 mg',
        form: 'tablet',
        frequency: 'OD (once daily)',
        duration: '30 days',
        quantity: 30,
        dispensedQty: 0,
        stockLevel: 'in-stock',
        stockCount: 95,
      },
    ],
    clinicalNotes: 'Hypertension management. Referred for medication refill.',
    coverageStatus: 'Out-of-pocket',
    coveragePaymentStatus: 'Paid',
  },
  {
    id: 'ph-009',
    clinicianRxId: '',
    visitId: '',
    patientName: 'Nassejje Hadijah',
    patientAge: '40',
    patientGender: 'Female',
    patientPhone: '+256 7** *** 802',
    isMember: true,
    status: 'completed',
    urgency: 'routine',
    prescribedBy: 'Dr. Kagga (Mulago Referral)',
    prescribedAt: '07:15 AM',
    startedAt: '07:20 AM',
    readyAt: '07:30 AM',
    dispensedAt: '07:45 AM',
    dispensedBy: 'Pharmacist Lule',
    paymentStatus: 'paid',
    paymentAmount: 'UGX 15,000',
    requestSource: 'external-rx',
    rxAttachments: [
      { fileName: 'mulago-rx-hadijah.pdf', fileType: 'PDF', fileSize: '195 KB' },
    ],
    rxVerified: true,
    medications: [
      {
        id: 'med-16',
        name: 'Levothyroxine',
        dosage: '50 mcg',
        form: 'tablet',
        frequency: 'OD (once daily, before breakfast)',
        duration: '30 days',
        quantity: 30,
        dispensedQty: 30,
        stockLevel: 'in-stock',
        stockCount: 60,
      },
    ],
    clinicalNotes: 'Hypothyroidism. Referred from Mulago for medication refill.',
    coverageStatus: 'Covered',
    coveragePackage: 'Care Bundle',
  },
];

/* ── OTC mock data ── */

const initialOtcOrders: PHOtcOrder[] = [
  {
    id: 'otc-001',
    customerName: 'Kamya Robert',
    customerPhone: '+256 7** *** 519',
    isMember: true,
    status: 'pending',
    requestedAt: '10:50 AM',
    totalAmount: 'UGX 8,500',
    paymentStatus: 'paid',
    items: [
      { id: 'otc-i-01', name: 'Paracetamol 500mg', quantity: 10, preparedQty: 0, unitPrice: 'UGX 200', stockLevel: 'in-stock', stockCount: 1200 },
      { id: 'otc-i-02', name: 'Vitamin C 500mg', quantity: 30, preparedQty: 0, unitPrice: 'UGX 150', stockLevel: 'in-stock', stockCount: 350 },
    ],
  },
  {
    id: 'otc-002',
    customerName: 'Akello Sarah',
    isMember: false,
    status: 'pending',
    requestedAt: '11:05 AM',
    totalAmount: 'UGX 12,000',
    paymentStatus: 'pending',
    items: [
      { id: 'otc-i-03', name: 'Ibuprofen 400mg', quantity: 20, preparedQty: 0, unitPrice: 'UGX 300', stockLevel: 'in-stock', stockCount: 500 },
      { id: 'otc-i-04', name: 'Antacid Suspension', quantity: 1, preparedQty: 0, unitPrice: 'UGX 6,000', stockLevel: 'low-stock', stockCount: 5 },
    ],
  },
  {
    id: 'otc-003',
    customerName: 'Wabwire James',
    customerPhone: '+256 7** *** 662',
    isMember: true,
    status: 'preparing',
    requestedAt: '09:30 AM',
    totalAmount: 'UGX 15,500',
    paymentStatus: 'paid',
    preparedAt: '09:40 AM',
    items: [
      { id: 'otc-i-05', name: 'Cetirizine 10mg', quantity: 10, preparedQty: 10, unitPrice: 'UGX 250', stockLevel: 'in-stock', stockCount: 200 },
      { id: 'otc-i-06', name: 'Nasal Saline Spray', quantity: 1, preparedQty: 1, unitPrice: 'UGX 8,000', stockLevel: 'in-stock', stockCount: 15 },
      { id: 'otc-i-07', name: 'Loratadine 10mg', quantity: 10, preparedQty: 0, unitPrice: 'UGX 300', stockLevel: 'in-stock', stockCount: 180, isRestricted: true },
    ],
  },
  {
    id: 'otc-004',
    customerName: 'Nambooze Sylvia',
    customerPhone: '+256 7** *** 145',
    isMember: false,
    status: 'completed',
    requestedAt: '08:00 AM',
    totalAmount: 'UGX 5,000',
    paymentStatus: 'paid',
    preparedAt: '08:10 AM',
    completedAt: '08:15 AM',
    completedBy: 'Pharmacist Lule',
    items: [
      { id: 'otc-i-08', name: 'ORS Sachets', quantity: 5, preparedQty: 5, unitPrice: 'UGX 500', stockLevel: 'in-stock', stockCount: 300 },
      { id: 'otc-i-09', name: 'Zinc Sulphate 20mg', quantity: 10, preparedQty: 10, unitPrice: 'UGX 250', stockLevel: 'low-stock', stockCount: 15 },
    ],
  },
  {
    id: 'otc-005',
    customerName: 'Lubega Patrick',
    isMember: true,
    status: 'pending',
    requestedAt: '11:15 AM',
    totalAmount: 'UGX 18,000',
    paymentStatus: 'paid',
    items: [
      { id: 'otc-i-10', name: 'Multivitamin Tablets', quantity: 30, preparedQty: 0, unitPrice: 'UGX 200', stockLevel: 'in-stock', stockCount: 400 },
      { id: 'otc-i-11', name: 'Omega-3 Capsules', quantity: 30, preparedQty: 0, unitPrice: 'UGX 350', stockLevel: 'in-stock', stockCount: 120 },
      { id: 'otc-i-12', name: 'Diclofenac Gel 50g', quantity: 1, preparedQty: 0, unitPrice: 'UGX 4,500', stockLevel: 'out-of-stock', stockCount: 0 },
    ],
  },
];

const initialInventoryAlerts: PHInventoryAlert[] = [
  { id: 'ia-01', medName: 'Paracetamol Syrup 250mg/5mL', currentStock: 8, reorderLevel: 20, severity: 'warning' },
  { id: 'ia-02', medName: 'Ferrous Sulphate 200mg', currentStock: 0, reorderLevel: 50, severity: 'critical' },
  { id: 'ia-03', medName: 'Zinc Sulphate 20mg', currentStock: 15, reorderLevel: 30, severity: 'warning' },
];

/* ─────────── store engine ─────────── */

let _rxs: PHPrescription[] = initialPrescriptions.map((rx) => ({
  ...rx,
  medications: rx.medications.map((m) => ({ ...m })),
}));
let _otcOrders: PHOtcOrder[] = initialOtcOrders.map((o) => ({
  ...o,
  items: o.items.map((i) => ({ ...i })),
}));
let _alerts: PHInventoryAlert[] = initialInventoryAlerts.map((a) => ({ ...a }));
let _version = 0;
const _listeners = new Set<() => void>();

function emit() {
  _version++;
  _listeners.forEach((fn) => fn());
}

let _rxSeq = 10;

/* ── public getters ── */

export function getPHPrescriptions(): PHPrescription[] {
  return _rxs;
}

export function getPHRxById(id: string): PHPrescription | undefined {
  return _rxs.find((rx) => rx.id === id);
}

export function getPHQueue(): PHPrescription[] {
  return _rxs.filter(
    (rx) =>
      rx.status === 'new' ||
      rx.status === 'in-progress' ||
      rx.status === 'ready' ||
      rx.status === 'on-hold' ||
      rx.status === 'out-of-stock' ||
      rx.status === 'partial-fill'
  );
}

export function getPHCompleted(): PHPrescription[] {
  return _rxs.filter((rx) => rx.status === 'completed');
}

export function getPHStats() {
  const all = _rxs;
  return {
    total: all.length,
    newCount: all.filter((rx) => rx.status === 'new').length,
    inProgress: all.filter((rx) => rx.status === 'in-progress').length,
    ready: all.filter((rx) => rx.status === 'ready').length,
    completed: all.filter((rx) => rx.status === 'completed').length,
    onHold: all.filter((rx) => rx.status === 'on-hold').length,
    outOfStock: all.filter((rx) => rx.status === 'out-of-stock').length,
    partialFill: all.filter((rx) => rx.status === 'partial-fill').length,
    statOrders: all.filter(
      (rx) => rx.urgency === 'stat' && rx.status !== 'completed'
    ).length,
  };
}

export function getPHInventoryAlerts(): PHInventoryAlert[] {
  return _alerts;
}

/* ── mutations ── */

/** Start processing a prescription */
export function startDispensing(rxId: string) {
  const now = new Date().toLocaleTimeString('en-UG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  _rxs = _rxs.map((rx) =>
    rx.id === rxId
      ? { ...rx, status: 'in-progress' as PHRxStatus, startedAt: now }
      : rx
  );
  emit();
}

/** Update dispensed quantities for a medication item */
export function updateDispensedQty(rxId: string, medId: string, qty: number) {
  _rxs = _rxs.map((rx) =>
    rx.id === rxId
      ? {
          ...rx,
          medications: rx.medications.map((m) =>
            m.id === medId ? { ...m, dispensedQty: qty } : m
          ),
        }
      : rx
  );
  emit();
}

/** Mark prescription as ready for pickup */
export function markReady(rxId: string) {
  const now = new Date().toLocaleTimeString('en-UG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  // Check if all meds are fully dispensed
  const rx = _rxs.find((r) => r.id === rxId);
  if (!rx) return;

  const allFullyDispensed = rx.medications.every(
    (m) => m.dispensedQty >= m.quantity
  );
  const someDispensed = rx.medications.some((m) => m.dispensedQty > 0);

  let newStatus: PHRxStatus = 'ready';
  if (!allFullyDispensed && someDispensed) newStatus = 'partial-fill';

  _rxs = _rxs.map((r) =>
    r.id === rxId
      ? { ...r, status: newStatus, readyAt: now }
      : r
  );
  emit();
}

/** Complete a dispensing — hand to patient */
export function completeDispensing(rxId: string, pharmacistNotes?: string) {
  const now = new Date().toLocaleTimeString('en-UG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  _rxs = _rxs.map((rx) =>
    rx.id === rxId
      ? {
          ...rx,
          status: 'completed' as PHRxStatus,
          dispensedAt: now,
          dispensedBy: 'Pharmacist Lule',
          pharmacistNotes: pharmacistNotes || rx.pharmacistNotes,
        }
      : rx
  );
  emit();
}

/** Put on hold */
export function putOnHold(rxId: string, reason: string) {
  _rxs = _rxs.map((rx) =>
    rx.id === rxId
      ? { ...rx, status: 'on-hold' as PHRxStatus, holdReason: reason }
      : rx
  );
  emit();
}

/** Remove hold → move back to new or in-progress */
export function removeHold(rxId: string) {
  _rxs = _rxs.map((rx) =>
    rx.id === rxId
      ? {
          ...rx,
          status: (rx.startedAt ? 'in-progress' : 'new') as PHRxStatus,
          holdReason: undefined,
        }
      : rx
  );
  emit();
}

/** Mark as out of stock */
export function markOutOfStock(rxId: string) {
  _rxs = _rxs.map((rx) =>
    rx.id === rxId
      ? { ...rx, status: 'out-of-stock' as PHRxStatus }
      : rx
  );
  emit();
}

/** Add substitution for a med item */
export function addSubstitution(rxId: string, medId: string, substitution: string) {
  _rxs = _rxs.map((rx) =>
    rx.id === rxId
      ? {
          ...rx,
          medications: rx.medications.map((m) =>
            m.id === medId ? { ...m, substitution, stockLevel: 'in-stock' as const, awaitingStock: false } : m
          ),
        }
      : rx
  );
  emit();
}

/** Mark a medication as awaiting stock */
export function markMedAwaitingStock(rxId: string, medId: string) {
  _rxs = _rxs.map((rx) =>
    rx.id === rxId
      ? {
          ...rx,
          medications: rx.medications.map((m) =>
            m.id === medId ? { ...m, awaitingStock: true } : m
          ),
        }
      : rx
  );
  emit();
}

/** Update pharmacist notes */
export function updatePharmacistNotes(rxId: string, notes: string) {
  _rxs = _rxs.map((rx) =>
    rx.id === rxId ? { ...rx, pharmacistNotes: notes } : rx
  );
  emit();
}

/** Mark prescription as paid (prototype helper) */
export function markPaid(rxId: string) {
  _rxs = _rxs.map((rx) =>
    rx.id === rxId ? { ...rx, paymentStatus: 'paid' as const } : rx
  );
  emit();
}

/** Add a prescription from clinician bridge */
export function addPHRxFromClinician(data: {
  clinicianRxId: string;
  visitId: string;
  patientName: string;
  patientAge?: string;
  patientGender?: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedBy?: string;
  notes?: string;
}) {
  const now = new Date().toLocaleTimeString('en-UG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const newRx: PHPrescription = {
    id: `ph-${String(_rxSeq++).padStart(3, '0')}`,
    clinicianRxId: data.clinicianRxId,
    visitId: data.visitId,
    patientName: data.patientName,
    patientAge: data.patientAge || '',
    patientGender: data.patientGender || '',
    status: 'new',
    urgency: 'routine',
    prescribedBy: data.prescribedBy || 'Doctor',
    prescribedAt: now,
    paymentStatus: 'pending',
    clinicalNotes: data.notes,
    medications: [
      {
        id: `med-${_medSeq++}`,
        name: data.medication,
        dosage: data.dosage,
        form: 'tablet',
        frequency: data.frequency,
        duration: data.duration,
        quantity: 1,
        dispensedQty: 0,
        stockLevel: 'in-stock',
      },
    ],
  };
  _rxs = [newRx, ..._rxs];
  emit();
  return newRx;
}

/** Verify external Rx prescription */
export function verifyExternalRx(rxId: string) {
  _rxs = _rxs.map((rx) =>
    rx.id === rxId ? { ...rx, rxVerified: true } : rx
  );
  emit();
}

/* ────────── OTC getters ────────── */

let _otcSeq = 6;

export function getPHOtcOrders(): PHOtcOrder[] {
  return _otcOrders;
}

export function getPHOtcById(id: string): PHOtcOrder | undefined {
  return _otcOrders.find((o) => o.id === id);
}

export function getPHOtcQueue(): PHOtcOrder[] {
  return _otcOrders.filter(
    (o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'
  );
}

export function getPHOtcCompleted(): PHOtcOrder[] {
  return _otcOrders.filter((o) => o.status === 'completed');
}

export function getPHOtcStats() {
  const all = _otcOrders;
  return {
    total: all.length,
    pending: all.filter((o) => o.status === 'pending').length,
    preparing: all.filter((o) => o.status === 'preparing').length,
    ready: all.filter((o) => o.status === 'ready').length,
    completed: all.filter((o) => o.status === 'completed').length,
    declined: all.filter((o) => o.status === 'declined').length,
  };
}

/* ────────── OTC mutations ────────── */

/** Start preparing an OTC order */
export function startOtcPreparing(otcId: string) {
  const now = new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
  _otcOrders = _otcOrders.map((o) =>
    o.id === otcId ? { ...o, status: 'preparing' as PHOtcStatus, preparedAt: now } : o
  );
  emit();
}

/** Update prepared qty for an OTC item */
export function updateOtcItemQty(otcId: string, itemId: string, qty: number) {
  _otcOrders = _otcOrders.map((o) =>
    o.id === otcId
      ? { ...o, items: o.items.map((i) => (i.id === itemId ? { ...i, preparedQty: qty } : i)) }
      : o
  );
  emit();
}

/** Mark OTC order ready for pickup */
export function markOtcReady(otcId: string) {
  _otcOrders = _otcOrders.map((o) =>
    o.id === otcId ? { ...o, status: 'ready' as PHOtcStatus } : o
  );
  emit();
}

/** Complete OTC order */
export function completeOtcOrder(otcId: string, notes?: string) {
  const now = new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
  _otcOrders = _otcOrders.map((o) =>
    o.id === otcId
      ? { ...o, status: 'completed' as PHOtcStatus, completedAt: now, completedBy: 'Pharmacist Lule', notes: notes || o.notes }
      : o
  );
  emit();
}

/** Decline OTC order */
export function declineOtcOrder(otcId: string, reason: string) {
  _otcOrders = _otcOrders.map((o) =>
    o.id === otcId ? { ...o, status: 'declined' as PHOtcStatus, declineReason: reason } : o
  );
  emit();
}

/** Mark OTC order as paid */
export function markOtcPaid(otcId: string) {
  _otcOrders = _otcOrders.map((o) =>
    o.id === otcId ? { ...o, paymentStatus: 'paid' as const } : o
  );
  emit();
}

/** Add substitution for OTC item */
export function addOtcSubstitution(otcId: string, itemId: string, substitution: string) {
  _otcOrders = _otcOrders.map((o) =>
    o.id === otcId
      ? { ...o, items: o.items.map((i) => (i.id === itemId ? { ...i, substitution, stockLevel: 'in-stock' as const } : i)) }
      : o
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

export function usePharmacistStore() {
  useSyncExternalStore(subscribe, getSnapshot);
  return {
    prescriptions: getPHPrescriptions(),
    queue: getPHQueue(),
    completed: getPHCompleted(),
    stats: getPHStats(),
    inventoryAlerts: getPHInventoryAlerts(),
    getRxById: getPHRxById,
    startDispensing,
    updateDispensedQty,
    markReady,
    completeDispensing,
    putOnHold,
    removeHold,
    markOutOfStock,
    addSubstitution,
    markMedAwaitingStock,
    updatePharmacistNotes,
    markPaid,
    addPHRxFromClinician,
    verifyExternalRx,
    /* OTC */
    otcOrders: getPHOtcOrders(),
    otcQueue: getPHOtcQueue(),
    otcCompleted: getPHOtcCompleted(),
    otcStats: getPHOtcStats(),
    getOtcById: getPHOtcById,
    startOtcPreparing,
    updateOtcItemQty,
    markOtcReady,
    completeOtcOrder,
    declineOtcOrder,
    markOtcPaid,
    addOtcSubstitution,
  };
}