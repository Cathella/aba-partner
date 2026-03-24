/**
 * labTechStore — In-memory store for the Lab Technician module.
 * Manages the lab worklist, sample collection, result entry, and QC log.
 * Uses useSyncExternalStore for React 18 compatibility.
 *
 * Bridges with clinicianStore: when the lab tech updates a result,
 * it also calls updateLabStatus() on the clinician store to keep
 * the clinician's view in sync.
 */

import { useSyncExternalStore } from 'react';
import { updateLabStatus, incrementLabNotifications } from './clinicianStore';

/* ─────────── types ─────────── */

export type LTOrderStatus =
  | 'pending-collection'
  | 'in-progress'
  | 'results-ready'
  | 'completed'
  | 're-collect';

export type LTRequestSource = 'internal' | 'self-requested' | 'external-referral';

export interface LTSelfRequestDetails {
  testPackage: string;
  consentAccepted: boolean;
  collectionPreference: 'walk-in' | 'booked-time';
  bookedTime?: string;
}

export interface LTReferralAttachment {
  fileName: string;
  fileType: string;
  fileSize: string;
}

export interface LTResultRow {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag?: 'normal' | 'high' | 'low' | 'critical';
}

export interface LTRejectHistoryEntry {
  reason: string;
  category?: string;
  notes?: string;
  timestamp: string;
  rejectedBy: string;
}

export interface LTAmendmentEntry {
  previousResults: LTResultRow[];
  newResults: LTResultRow[];
  reason: string;
  timestamp: string;
  amendedBy: string;
}

export interface LTLabOrder {
  id: string;
  clinicianOrderId: string; // maps to clinicianStore LabOrder.id
  visitId: string;
  patientName: string;
  patientAge: string;
  patientGender: string;
  patientPhone?: string;
  isMember?: boolean;
  testName: string;
  testCategory: string;
  specimen: string;
  urgency: 'routine' | 'urgent' | 'stat';
  status: LTOrderStatus;
  orderedAt: string;
  orderedBy: string;
  clinicalNotes?: string;
  collectedAt?: string;
  collectedBy?: string;
  collectedSampleType?: string;
  collectedQuantity?: string;
  collectedSampleId?: string;
  collectedNotes?: string;
  processingStartedAt?: string;
  resultedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  results: LTResultRow[];
  method?: string;
  rejectReason?: string;
  rejectCategory?: string;
  rejectNotes?: string;
  rejectHistory: LTRejectHistoryEntry[];
  amendments: LTAmendmentEntry[];
  labNotes?: string;
  requestSource?: LTRequestSource;
  selfRequestDetails?: LTSelfRequestDetails;
  referralAttachments?: LTReferralAttachment[];
  /** Coverage status passed from station transfer approval */
  coverageStatus?: 'Covered' | 'Discount applied' | 'Out-of-pocket';
  /** Applied coverage package name */
  coveragePackage?: string;
  /** Payment status (relevant for out-of-pocket) */
  paymentStatus?: 'Paid' | 'Pending' | 'Hold';
  /** Human-readable visit ID for cross-reference */
  displayVisitId?: string;
}

export interface QCLogEntry {
  id: string;
  instrument: string;
  parameter: string;
  level: string;
  result: string;
  expected: string;
  status: 'pass' | 'fail' | 'warning';
  timestamp: string;
  techId: string;
}

/* ─────────── initial mock data ─────────── */

const initialOrders: LTLabOrder[] = [
  {
    id: 'lt-001',
    clinicianOrderId: 'lab-01',
    visitId: 'clv-01',
    patientName: 'Jane Nakamya',
    patientAge: '32',
    patientGender: 'Female',
    patientPhone: '+256 7** *** 412',
    isMember: true,
    testName: 'Hearing Audiometry',
    testCategory: 'Audiology',
    specimen: 'N/A',
    urgency: 'routine',
    status: 'pending-collection',
    orderedAt: '09:15 AM',
    orderedBy: 'Dr. Ssekandi',
    clinicalNotes: 'Baseline hearing test to rule out auditory processing issues.',
    requestSource: 'internal',
    coverageStatus: 'Covered',
    coveragePackage: 'Lab Only',
    displayVisitId: 'V-000101',
    results: [],
    rejectHistory: [],
    amendments: [],
  },
  {
    id: 'lt-002',
    clinicianOrderId: 'lab-02',
    visitId: 'clv-05',
    patientName: 'Kato Joseph',
    patientAge: '8',
    patientGender: 'Male',
    patientPhone: '+256 7** *** 889',
    isMember: true,
    testName: 'CBC + Thyroid Panel',
    testCategory: 'Hematology / Endocrine',
    specimen: 'Venous Blood',
    urgency: 'urgent',
    status: 'completed',
    orderedAt: '08:40 AM',
    orderedBy: 'Dr. Nambi',
    clinicalNotes: 'Rule out organic causes for attention difficulties.',
    requestSource: 'internal',
    coverageStatus: 'Covered',
    coveragePackage: 'Care Bundle',
    displayVisitId: 'V-000105',
    collectedAt: '08:50 AM',
    collectedBy: 'Lab Tech Mukasa',
    processingStartedAt: '08:55 AM',
    resultedAt: '09:45 AM',
    verifiedAt: '09:50 AM',
    verifiedBy: 'Lab Tech Mukasa',
    method: 'Automated Hematology Analyzer',
    results: [
      { parameter: 'WBC', value: '7.2', unit: '×10³/µL', referenceRange: '4.5–11.0', flag: 'normal' },
      { parameter: 'RBC', value: '4.8', unit: '×10⁶/µL', referenceRange: '4.0–5.5', flag: 'normal' },
      { parameter: 'Hemoglobin', value: '12.4', unit: 'g/dL', referenceRange: '11.5–15.5', flag: 'normal' },
      { parameter: 'Hematocrit', value: '37.1', unit: '%', referenceRange: '35–45', flag: 'normal' },
      { parameter: 'Platelets', value: '285', unit: '×10³/µL', referenceRange: '150–400', flag: 'normal' },
      { parameter: 'TSH', value: '3.8', unit: 'mIU/L', referenceRange: '0.4–4.0', flag: 'normal' },
      { parameter: 'Free T4', value: '1.1', unit: 'ng/dL', referenceRange: '0.8–1.8', flag: 'normal' },
      { parameter: 'Free T3', value: '3.2', unit: 'pg/mL', referenceRange: '2.3–4.2', flag: 'normal' },
    ],
    rejectHistory: [],
    amendments: [],
  },
  {
    id: 'lt-003',
    clinicianOrderId: '',
    visitId: 'clv-10',
    patientName: 'Mugisha Daniel',
    patientAge: '5',
    patientGender: 'Male',
    patientPhone: '+256 7** *** 301',
    isMember: false,
    testName: 'Urinalysis',
    testCategory: 'Clinical Chemistry',
    specimen: 'Mid-stream Urine',
    urgency: 'routine',
    status: 'in-progress',
    orderedAt: '08:00 AM',
    orderedBy: 'Dr. Ssekandi',
    clinicalNotes: 'Suspected UTI. Dysuria reported by parent.',
    requestSource: 'self-requested',
    coverageStatus: 'Out-of-pocket',
    paymentStatus: 'Pending',
    displayVisitId: 'V-000110',
    selfRequestDetails: {
      testPackage: 'Basic Wellness Panel',
      consentAccepted: true,
      collectionPreference: 'walk-in',
    },
    collectedAt: '08:15 AM',
    collectedBy: 'Lab Tech Mukasa',
    collectedSampleType: 'Urine',
    collectedQuantity: '30 mL',
    collectedSampleId: 'SMP-20260214-003',
    processingStartedAt: '08:20 AM',
    results: [
      { parameter: 'Colour', value: 'Dark Yellow', unit: '', referenceRange: 'Pale–Yellow', flag: 'high' },
      { parameter: 'pH', value: '5.5', unit: '', referenceRange: '5.0–8.0', flag: 'normal' },
      { parameter: 'Protein', value: 'Trace', unit: 'mg/dL', referenceRange: 'Negative', flag: 'low' },
      { parameter: 'Glucose', value: 'Negative', unit: '', referenceRange: 'Negative', flag: 'normal' },
      { parameter: 'Leukocytes', value: '++', unit: '', referenceRange: 'Negative', flag: 'high' },
      { parameter: 'Nitrites', value: 'Positive', unit: '', referenceRange: 'Negative', flag: 'critical' },
    ],
    method: 'Dipstick + Microscopy',
    rejectHistory: [],
    amendments: [],
  },
  {
    id: 'lt-004',
    clinicianOrderId: '',
    visitId: 'clv-11',
    patientName: 'Auma Rebecca',
    patientAge: '14',
    patientGender: 'Female',
    patientPhone: '+256 7** *** 556',
    isMember: true,
    testName: 'Blood Glucose (Fasting)',
    testCategory: 'Clinical Chemistry',
    specimen: 'Capillary Blood',
    urgency: 'routine',
    status: 'results-ready',
    orderedAt: '07:30 AM',
    orderedBy: 'Dr. Nambi',
    clinicalNotes: 'Screening for diabetes. Family history positive.',
    requestSource: 'self-requested',
    coverageStatus: 'Covered',
    coveragePackage: 'Lab Only',
    displayVisitId: 'V-000111',
    selfRequestDetails: {
      testPackage: 'Diabetes Screening',
      consentAccepted: true,
      collectionPreference: 'booked-time',
      bookedTime: '07:30 AM',
    },
    collectedAt: '07:45 AM',
    collectedBy: 'Lab Tech Mukasa',
    processingStartedAt: '07:50 AM',
    resultedAt: '08:10 AM',
    method: 'Enzymatic Glucose Oxidase',
    results: [
      { parameter: 'Fasting Blood Glucose', value: '5.2', unit: 'mmol/L', referenceRange: '3.9–5.6', flag: 'normal' },
    ],
    rejectHistory: [],
    amendments: [],
  },
  {
    id: 'lt-005',
    clinicianOrderId: '',
    visitId: 'clv-12',
    patientName: 'Ssemakula Ivan',
    patientAge: '6',
    patientGender: 'Male',
    patientPhone: '+256 7** *** 778',
    isMember: true,
    testName: 'Stool Microscopy',
    testCategory: 'Parasitology',
    specimen: 'Stool Sample',
    urgency: 'stat',
    status: 'pending-collection',
    orderedAt: '09:30 AM',
    orderedBy: 'Dr. Ssekandi',
    clinicalNotes: 'Chronic diarrhea × 2 weeks. Check for ova & parasites.',
    requestSource: 'internal',
    coverageStatus: 'Covered',
    coveragePackage: 'Lab Only',
    displayVisitId: 'V-000112',
    results: [],
    rejectHistory: [],
    amendments: [],
  },
  {
    id: 'lt-006',
    clinicianOrderId: '',
    visitId: 'clv-13',
    patientName: 'Nalubega Faith',
    patientAge: '10',
    patientGender: 'Female',
    patientPhone: '+256 7** *** 190',
    isMember: false,
    testName: 'Full Blood Count',
    testCategory: 'Hematology',
    specimen: 'Venous Blood',
    urgency: 'urgent',
    status: 're-collect',
    orderedAt: '08:20 AM',
    orderedBy: 'Dr. Nambi',
    clinicalNotes: 'Pre-op workup for adenoid surgery.',
    requestSource: 'external-referral',
    coverageStatus: 'Out-of-pocket',
    paymentStatus: 'Hold',
    displayVisitId: 'V-000113',
    referralAttachments: [
      { fileName: 'referral-letter-faith.pdf', fileType: 'PDF', fileSize: '245 KB' },
    ],
    collectedAt: '08:35 AM',
    collectedBy: 'Lab Tech Mukasa',
    rejectReason: 'Sample hemolyzed — clotted specimen received. Please re-collect in EDTA tube.',
    results: [],
    rejectHistory: [
      {
        reason: 'Sample hemolyzed — clotted specimen received. Please re-collect in EDTA tube.',
        timestamp: '08:35 AM',
        rejectedBy: 'Lab Tech Mukasa',
      },
    ],
    amendments: [],
  },
  {
    id: 'lt-007',
    clinicianOrderId: '',
    visitId: 'clv-14',
    patientName: 'Okello Samuel',
    patientAge: '3',
    patientGender: 'Male',
    patientPhone: '+256 7** *** 044',
    isMember: true,
    testName: 'Malaria RDT',
    testCategory: 'Microbiology',
    specimen: 'Capillary Blood',
    urgency: 'stat',
    status: 'results-ready',
    orderedAt: '09:00 AM',
    orderedBy: 'Dr. Ssekandi',
    clinicalNotes: 'High fever × 3 days. Rule out malaria.',
    requestSource: 'internal',
    coverageStatus: 'Covered',
    coveragePackage: 'Care Bundle',
    displayVisitId: 'V-000114',
    collectedAt: '09:10 AM',
    collectedBy: 'Lab Tech Mukasa',
    processingStartedAt: '09:12 AM',
    resultedAt: '09:30 AM',
    method: 'Rapid Diagnostic Test (HRP2/pLDH)',
    results: [
      { parameter: 'P. falciparum (HRP2)', value: 'Positive', unit: '', referenceRange: 'Negative', flag: 'critical' },
      { parameter: 'Pan-malaria (pLDH)', value: 'Positive', unit: '', referenceRange: 'Negative', flag: 'critical' },
    ],
    rejectHistory: [],
    amendments: [],
  },
  /* ── Additional orders for request-source diversity ── */
  {
    id: 'lt-008',
    clinicianOrderId: '',
    visitId: 'clv-15',
    patientName: 'Babirye Grace',
    patientAge: '28',
    patientGender: 'Female',
    patientPhone: '+256 7** *** 217',
    isMember: true,
    testName: 'Liver Function Tests',
    testCategory: 'Clinical Chemistry',
    specimen: 'Venous Blood',
    urgency: 'routine',
    status: 'pending-collection',
    orderedAt: '09:45 AM',
    orderedBy: 'Self-requested',
    clinicalNotes: '',
    requestSource: 'self-requested',
    selfRequestDetails: {
      testPackage: 'Liver Health Check',
      consentAccepted: true,
      collectionPreference: 'walk-in',
    },
    results: [],
    rejectHistory: [],
    amendments: [],
  },
  {
    id: 'lt-009',
    clinicianOrderId: '',
    visitId: 'clv-16',
    patientName: 'Tumusiime Ronald',
    patientAge: '45',
    patientGender: 'Male',
    patientPhone: '+256 7** *** 623',
    isMember: false,
    testName: 'Lipid Profile + HbA1c',
    testCategory: 'Clinical Chemistry',
    specimen: 'Venous Blood',
    urgency: 'routine',
    status: 'pending-collection',
    orderedAt: '10:00 AM',
    orderedBy: 'Dr. Ouma (Kololo Medical Centre)',
    clinicalNotes: 'Referred for metabolic panel. Patient on metformin 500 mg BD.',
    requestSource: 'external-referral',
    coverageStatus: 'Out-of-pocket',
    paymentStatus: 'Paid',
    displayVisitId: 'V-000116',
    referralAttachments: [
      { fileName: 'referral-kololo-med.pdf', fileType: 'PDF', fileSize: '180 KB' },
      { fileName: 'previous-results-jan.jpg', fileType: 'JPG', fileSize: '320 KB' },
    ],
    results: [],
    rejectHistory: [],
    amendments: [],
  },
  {
    id: 'lt-010',
    clinicianOrderId: '',
    visitId: 'clv-17',
    patientName: 'Nantongo Esther',
    patientAge: '35',
    patientGender: 'Female',
    patientPhone: '+256 7** *** 455',
    isMember: true,
    testName: 'Renal Function Tests',
    testCategory: 'Clinical Chemistry',
    specimen: 'Venous Blood',
    urgency: 'routine',
    status: 'in-progress',
    orderedAt: '07:50 AM',
    orderedBy: 'Dr. Wasswa (Entebbe Clinic)',
    clinicalNotes: 'Referred for renal panel. History of hypertension.',
    requestSource: 'external-referral',
    referralAttachments: [
      { fileName: 'referral-entebbe.pdf', fileType: 'PDF', fileSize: '155 KB' },
    ],
    collectedAt: '08:05 AM',
    collectedBy: 'Lab Tech Mukasa',
    collectedSampleType: 'Venous Blood',
    collectedQuantity: '5 mL',
    collectedSampleId: 'SMP-20260214-010',
    processingStartedAt: '08:10 AM',
    results: [],
    method: 'Automated Chemistry Analyzer',
    rejectHistory: [],
    amendments: [],
  },
  {
    id: 'lt-011',
    clinicianOrderId: '',
    visitId: 'clv-18',
    patientName: 'Ochieng Peter',
    patientAge: '52',
    patientGender: 'Male',
    patientPhone: '+256 7** *** 891',
    isMember: false,
    testName: 'PSA (Prostate-Specific Antigen)',
    testCategory: 'Immunology',
    specimen: 'Venous Blood',
    urgency: 'routine',
    status: 'completed',
    orderedAt: '07:00 AM',
    orderedBy: 'Self-requested',
    clinicalNotes: '',
    requestSource: 'self-requested',
    coverageStatus: 'Out-of-pocket',
    paymentStatus: 'Paid',
    displayVisitId: 'V-000118',
    selfRequestDetails: {
      testPackage: "Men's Health Screening",
      consentAccepted: true,
      collectionPreference: 'booked-time',
      bookedTime: '07:00 AM',
    },
    collectedAt: '07:10 AM',
    collectedBy: 'Lab Tech Mukasa',
    processingStartedAt: '07:15 AM',
    resultedAt: '08:00 AM',
    verifiedAt: '08:05 AM',
    verifiedBy: 'Lab Tech Mukasa',
    method: 'Chemiluminescent Immunoassay',
    results: [
      { parameter: 'Total PSA', value: '1.8', unit: 'ng/mL', referenceRange: '0–4.0', flag: 'normal' },
      { parameter: 'Free PSA', value: '0.45', unit: 'ng/mL', referenceRange: '—', flag: 'normal' },
      { parameter: 'Free/Total Ratio', value: '25%', unit: '', referenceRange: '>25%', flag: 'normal' },
    ],
    rejectHistory: [],
    amendments: [],
  },
  {
    id: 'lt-012',
    clinicianOrderId: '',
    visitId: 'clv-19',
    patientName: 'Nansubuga Harriet',
    patientAge: '22',
    patientGender: 'Female',
    patientPhone: '+256 7** *** 332',
    isMember: true,
    testName: 'Thyroid Panel (TSH, T3, T4)',
    testCategory: 'Endocrine',
    specimen: 'Venous Blood',
    urgency: 'urgent',
    status: 'completed',
    orderedAt: '06:45 AM',
    orderedBy: 'Dr. Kagga (Mulago Referral)',
    clinicalNotes: 'Referred for thyroid evaluation. Goiter noted on examination.',
    requestSource: 'external-referral',
    coverageStatus: 'Covered',
    coveragePackage: 'Care Bundle',
    displayVisitId: 'V-000119',
    referralAttachments: [
      { fileName: 'mulago-referral-form.pdf', fileType: 'PDF', fileSize: '290 KB' },
    ],
    collectedAt: '07:00 AM',
    collectedBy: 'Lab Tech Mukasa',
    processingStartedAt: '07:10 AM',
    resultedAt: '08:30 AM',
    verifiedAt: '08:35 AM',
    verifiedBy: 'Lab Tech Mukasa',
    method: 'Chemiluminescent Immunoassay',
    results: [
      { parameter: 'TSH', value: '8.2', unit: 'mIU/L', referenceRange: '0.4–4.0', flag: 'high' },
      { parameter: 'Free T4', value: '0.6', unit: 'ng/dL', referenceRange: '0.8–1.8', flag: 'low' },
      { parameter: 'Free T3', value: '1.9', unit: 'pg/mL', referenceRange: '2.3–4.2', flag: 'low' },
    ],
    rejectHistory: [],
    amendments: [],
  },
];

const initialQCLog: QCLogEntry[] = [
  {
    id: 'qc-01',
    instrument: 'Hematology Analyzer (HA-3200)',
    parameter: 'WBC Control',
    level: 'Normal',
    result: '7.5',
    expected: '7.0–8.0',
    status: 'pass',
    timestamp: '07:30 AM',
    techId: 'Lab Tech Mukasa',
  },
  {
    id: 'qc-02',
    instrument: 'Hematology Analyzer (HA-3200)',
    parameter: 'Hgb Control',
    level: 'Low',
    result: '6.8',
    expected: '6.5–7.5',
    status: 'pass',
    timestamp: '07:32 AM',
    techId: 'Lab Tech Mukasa',
  },
  {
    id: 'qc-03',
    instrument: 'Chemistry Analyzer (CA-500)',
    parameter: 'Glucose Control',
    level: 'Normal',
    result: '5.1',
    expected: '4.8–5.4',
    status: 'pass',
    timestamp: '07:35 AM',
    techId: 'Lab Tech Mukasa',
  },
  {
    id: 'qc-04',
    instrument: 'Chemistry Analyzer (CA-500)',
    parameter: 'Glucose Control',
    level: 'High',
    result: '16.2',
    expected: '14.0–16.0',
    status: 'warning',
    timestamp: '07:36 AM',
    techId: 'Lab Tech Mukasa',
  },
];

/* ─────────── store engine ─────────── */

let _orders: LTLabOrder[] = initialOrders.map((o) => ({
  ...o,
  results: o.results.map((r) => ({ ...r })),
  rejectHistory: o.rejectHistory.map((r) => ({ ...r })),
  amendments: o.amendments.map((r) => ({ ...r })),
}));
let _qcLog: QCLogEntry[] = initialQCLog.map((e) => ({ ...e }));
let _version = 0;
const _listeners = new Set<() => void>();

function emit() {
  _version++;
  _listeners.forEach((fn) => fn());
}

/* ── counters ── */
let _orderSeq = 13;
let _qcSeq = 5;

/* ── public getters ── */

export function getLTOrders(): LTLabOrder[] {
  return _orders;
}

export function getLTOrderById(id: string): LTLabOrder | undefined {
  return _orders.find((o) => o.id === id);
}

export function getLTWorklist(): LTLabOrder[] {
  return _orders.filter(
    (o) =>
      o.status === 'pending-collection' ||
      o.status === 'in-progress' ||
      o.status === 're-collect' ||
      o.status === 'results-ready'
  );
}

export function getLTCompleted(): LTLabOrder[] {
  return _orders.filter((o) => o.status === 'completed');
}

export function getLTStats() {
  const all = _orders;
  return {
    total: all.length,
    pendingCollection: all.filter((o) => o.status === 'pending-collection').length,
    inProgress: all.filter((o) => o.status === 'in-progress').length,
    resultsReady: all.filter((o) => o.status === 'results-ready').length,
    completed: all.filter((o) => o.status === 'completed').length,
    reCollect: all.filter((o) => o.status === 're-collect').length,
    statOrders: all.filter(
      (o) => o.urgency === 'stat' && o.status !== 'completed'
    ).length,
  };
}

export function getQCLog(): QCLogEntry[] {
  return _qcLog;
}

/* ── mutations ── */

/** Mark sample as collected */
export function collectSample(
  orderId: string,
  meta?: {
    sampleType?: string;
    quantity?: string;
    sampleId?: string;
    notes?: string;
    collectedBy?: string;
  }
) {
  const now = new Date().toLocaleTimeString('en-UG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  _orders = _orders.map((o) =>
    o.id === orderId
      ? {
          ...o,
          status: 'in-progress' as LTOrderStatus,
          collectedAt: now,
          collectedBy: meta?.collectedBy || 'Lab Tech Mukasa',
          collectedSampleType: meta?.sampleType || o.specimen,
          collectedQuantity: meta?.quantity,
          collectedSampleId: meta?.sampleId,
          collectedNotes: meta?.notes,
          processingStartedAt: now,
        }
      : o
  );
  emit();
}

/** Reject a sample — mark as re-collect */
export function rejectSample(
  orderId: string,
  reason: string,
  meta?: { category?: string; notes?: string }
) {
  const now = new Date().toLocaleTimeString('en-UG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  _orders = _orders.map((o) =>
    o.id === orderId
      ? {
          ...o,
          status: 're-collect' as LTOrderStatus,
          rejectReason: reason,
          rejectCategory: meta?.category,
          rejectNotes: meta?.notes,
          rejectHistory: [
            ...o.rejectHistory,
            {
              reason,
              category: meta?.category,
              notes: meta?.notes,
              timestamp: now,
              rejectedBy: 'Lab Tech Mukasa',
            },
          ],
        }
      : o
  );
  emit();
}

/** Save partial result entry (still in-progress) */
export function savePartialResults(
  orderId: string,
  results: LTResultRow[],
  method?: string,
  notes?: string
) {
  _orders = _orders.map((o) =>
    o.id === orderId
      ? {
          ...o,
          results: results.map((r) => ({ ...r })),
          method: method || o.method,
          labNotes: notes || o.labNotes,
        }
      : o
  );
  emit();
}

/** Submit results — marks order as results-ready */
export function submitResults(
  orderId: string,
  results: LTResultRow[],
  method?: string,
  notes?: string
) {
  const now = new Date().toLocaleTimeString('en-UG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  _orders = _orders.map((o) =>
    o.id === orderId
      ? {
          ...o,
          status: 'results-ready' as LTOrderStatus,
          results: results.map((r) => ({ ...r })),
          resultedAt: now,
          method: method || o.method,
          labNotes: notes || o.labNotes,
        }
      : o
  );
  emit();
}

/** Verify & release results — marks as completed, syncs to clinician store */
export function verifyAndRelease(orderId: string) {
  const now = new Date().toLocaleTimeString('en-UG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const order = _orders.find((o) => o.id === orderId);
  if (!order) return;

  _orders = _orders.map((o) =>
    o.id === orderId
      ? {
          ...o,
          status: 'completed' as LTOrderStatus,
          verifiedAt: now,
          verifiedBy: 'Lab Tech Mukasa',
        }
      : o
  );

  // Sync to clinician store if there's a linked order
  if (order.clinicianOrderId) {
    updateLabStatus(order.clinicianOrderId, 'completed');
    incrementLabNotifications();
  }

  emit();
}

/** Add a QC log entry */
export function addQCEntry(
  entry: Omit<QCLogEntry, 'id' | 'timestamp' | 'techId'>
) {
  const now = new Date().toLocaleTimeString('en-UG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const newEntry: QCLogEntry = {
    ...entry,
    id: `qc-${String(_qcSeq++).padStart(2, '0')}`,
    timestamp: now,
    techId: 'Lab Tech Mukasa',
  };
  _qcLog = [newEntry, ..._qcLog];
  emit();
}

/** Update lab notes on an order */
export function updateLabNotes(orderId: string, notes: string) {
  _orders = _orders.map((o) =>
    o.id === orderId ? { ...o, labNotes: notes } : o
  );
  emit();
}

/** Amend results on a completed order — creates an audit trail entry */
export function amendResults(
  orderId: string,
  newResults: LTResultRow[],
  reason: string
) {
  const now = new Date().toLocaleTimeString('en-UG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  _orders = _orders.map((o) =>
    o.id === orderId
      ? {
          ...o,
          amendments: [
            ...o.amendments,
            {
              previousResults: o.results.map((r) => ({ ...r })),
              newResults: newResults.map((r) => ({ ...r })),
              reason,
              timestamp: now,
              amendedBy: 'Lab Tech Mukasa',
            },
          ],
          results: newResults.map((r) => ({ ...r })),
          verifiedAt: now,
          verifiedBy: 'Lab Tech Mukasa (amended)',
        }
      : o
  );
  emit();
}

/** Create a lab order from the clinician module bridge */
export function addLTOrderFromClinician(data: {
  clinicianOrderId: string;
  visitId: string;
  patientName: string;
  patientAge?: string;
  patientGender?: string;
  testName: string;
  testCategory?: string;
  specimen?: string;
  urgency: 'routine' | 'urgent' | 'stat';
  orderedBy?: string;
  clinicalNotes?: string;
}) {
  const now = new Date().toLocaleTimeString('en-UG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const newOrder: LTLabOrder = {
    id: `lt-${String(_orderSeq++).padStart(3, '0')}`,
    clinicianOrderId: data.clinicianOrderId,
    visitId: data.visitId,
    patientName: data.patientName,
    patientAge: data.patientAge || '',
    patientGender: data.patientGender || '',
    testName: data.testName,
    testCategory: data.testCategory || 'General',
    specimen: data.specimen || 'N/A',
    urgency: data.urgency,
    status: 'pending-collection',
    orderedAt: now,
    orderedBy: data.orderedBy || 'Doctor',
    clinicalNotes: data.clinicalNotes,
    results: [],
    rejectHistory: [],
    amendments: [],
  };
  _orders = [newOrder, ..._orders];
  emit();
  return newOrder;
}

/** Compute average turnaround time from completed orders (in minutes) */
export function computeAvgTAT(): string {
  const completedOrders = _orders.filter(
    (o) => o.status === 'completed' && o.orderedAt && o.verifiedAt
  );
  if (completedOrders.length === 0) return '—';

  // Parse HH:MM AM/PM time strings to minutes for mock calculation
  function parseTime(t: string): number {
    const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return 0;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const ampm = match[3]?.toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }

  let totalMin = 0;
  let count = 0;
  for (const o of completedOrders) {
    const start = parseTime(o.orderedAt);
    const end = parseTime(o.verifiedAt!);
    const diff = end >= start ? end - start : end + 1440 - start;
    if (diff > 0 && diff < 480) {
      totalMin += diff;
      count++;
    }
  }

  if (count === 0) return '—';
  const avg = Math.round(totalMin / count);
  if (avg >= 60) return `${Math.floor(avg / 60)}h ${avg % 60}m`;
  return `${avg} min`;
}

/* ── React hook ── */

function getSnapshot(): number {
  return _version;
}

function subscribe(cb: () => void): () => void {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

export function useLabTechStore() {
  useSyncExternalStore(subscribe, getSnapshot);
  return {
    orders: getLTOrders(),
    worklist: getLTWorklist(),
    completed: getLTCompleted(),
    stats: getLTStats(),
    qcLog: getQCLog(),
    getOrderById: getLTOrderById,
    collectSample,
    rejectSample,
    savePartialResults,
    submitResults,
    verifyAndRelease,
    addQCEntry,
    updateLabNotes,
    amendResults,
    addLTOrderFromClinician,
    computeAvgTAT,
  };
}