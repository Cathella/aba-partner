/**
 * clinicianStore — Shared in-memory store for the Clinician module.
 * Manages the clinician's queue, SOAP notes, lab orders, prescriptions.
 * Uses useSyncExternalStore for React 18 compatibility.
 */

import { useSyncExternalStore } from 'react';

/* ─────────── types ─────────── */

export type CLVisitStatus =
  | 'waiting'
  | 'in-consultation'
  | 'lab-pending'
  | 'lab-results'
  | 'completed'
  | 'no-show'
  | 'transferred';

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface Vitals {
  temperature?: string;
  bloodPressure?: string;
  pulse?: string;
  spo2?: string;
  weight?: string;
  recordedAt?: string;
  capturedBy?: string;
}

export interface DiagnosisEntry {
  code: string;
  name: string;
}

export interface LabResultRow {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag?: 'normal' | 'high' | 'low' | 'critical';
}

export interface LabResultData {
  rows: LabResultRow[];
  collectedAt: string;
  resultedAt: string;
  specimen: string;
  method?: string;
}

export interface LabOrder {
  id: string;
  visitId: string;
  patientName: string;
  testName: string;
  urgency: 'routine' | 'urgent' | 'stat';
  status: 'pending' | 'in-progress' | 'completed';
  orderedAt: string;
  result?: string;
  notes?: string;
  resultData?: LabResultData;
  interpretationNote?: string;
  collectedAt?: string;
}

export interface Prescription {
  id: string;
  visitId: string;
  patientName: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
  createdAt: string;
  rxStatus: 'sent' | 'dispensed';
  sentToPharmacyAt?: string;
}

export interface CLQueueItem {
  id: string;
  patientId: string;
  patientName: string;
  age: string;
  gender: string;
  phone: string;
  isMember: boolean;
  service: string;
  status: CLVisitStatus;
  scheduledTime: string;
  checkedInAt?: string;
  room?: string;
  ticket: string;
  type: 'appointment' | 'walk-in';
  assignedTo: 'dr-ssekandi' | 'dr-nambi' | 'unassigned';
  chiefComplaint?: string;
  receptionNotes?: string;
  allergies?: string;
  historyNotes?: string;
  followUpNote?: string;
  soap: SOAPNote;
  vitals?: Vitals;
  diagnoses: DiagnosisEntry[];
  labOrders: string[];   // lab order IDs
  prescriptions: string[]; // prescription IDs
  completedAt?: string;
  diagnosisSummary?: string;
  followUp?: string;
  draftSavedAt?: string;
  /** Lab coverage status set during send-to-lab approval */
  labCoverageStatus?: 'Covered' | 'Discount applied' | 'Out-of-pocket';
  /** Lab applied package name */
  labCoveragePackage?: string;
  /** Consultation coverage status (set by Nurse or Reception during check-in) */
  consultCoverageStatus?: 'Covered' | 'Discount applied' | 'Out-of-pocket';
  consultCoveragePackage?: string;
  /** Pharmacy coverage status set during send-to-pharmacy approval */
  pharmCoverageStatus?: 'Covered' | 'Discount applied' | 'Out-of-pocket';
  pharmCoveragePackage?: string;
}

/* ─────────── initial mock data ─────────── */

const initialQueue: CLQueueItem[] = [
  {
    id: 'clv-01',
    patientId: 'pat-004',
    patientName: 'Jane Nakamya',
    age: '32',
    gender: 'Female',
    phone: '0772123456',
    isMember: true,
    service: 'Speech Therapy',
    status: 'in-consultation',
    scheduledTime: '09:00 AM',
    checkedInAt: '08:55 AM',
    room: 'Room 3',
    ticket: 'T-002',
    type: 'appointment',
    assignedTo: 'dr-ssekandi',
    chiefComplaint: 'Difficulty with articulation, follow-up from last session.',
    receptionNotes: 'Returning patient — previous chart pulled. Prefers afternoon follow-ups.',
    allergies: 'None known',
    historyNotes: 'Previous speech therapy sessions show steady improvement.',
    soap: {
      subjective: 'Patient reports improved clarity in daily speech. Occasional difficulty with sibilant sounds.',
      objective: 'Articulation assessment: 80% accuracy on /s/ and /z/ sounds, improved from 65% last visit.',
      assessment: '',
      plan: '',
    },
    vitals: { temperature: '36.5', bloodPressure: '118/76', pulse: '72', spo2: '98', weight: '58', recordedAt: '09:05 AM', capturedBy: 'Nurse Nambi' },
    diagnoses: [],
    labOrders: ['lab-01'],
    prescriptions: [],
  },
  {
    id: 'clv-02',
    patientId: 'pat-005',
    patientName: 'Peter Ochieng',
    age: '28',
    gender: 'Male',
    phone: '0772654321',
    isMember: false,
    service: 'OT Session',
    status: 'waiting',
    scheduledTime: '09:30 AM',
    checkedInAt: '09:22 AM',
    room: 'Room 1',
    ticket: 'T-003',
    type: 'appointment',
    assignedTo: 'dr-nambi',
    chiefComplaint: 'Fine motor skill difficulties affecting writing.',
    receptionNotes: 'First visit. Parent accompanied. Insurance card verified.',
    diagnoses: [],
    soap: { subjective: '', objective: '', assessment: '', plan: '' },
    labOrders: [],
    prescriptions: [],
  },
  {
    id: 'clv-03',
    patientId: 'pat-001',
    patientName: 'Nakitto Agnes',
    age: '34',
    gender: 'Female',
    phone: '0772111222',
    isMember: true,
    service: 'Follow-up',
    status: 'waiting',
    scheduledTime: '10:00 AM',
    checkedInAt: '09:50 AM',
    room: 'Room 2',
    ticket: 'T-009',
    type: 'appointment',
    assignedTo: 'unassigned',
    chiefComplaint: 'Follow-up on behavioral management plan for daughter.',
    receptionNotes: 'Member verified. Daughter present.',
    diagnoses: [],
    soap: { subjective: '', objective: '', assessment: '', plan: '' },
    labOrders: [],
    prescriptions: [],
  },
  {
    id: 'clv-04',
    patientId: 'pat-006',
    patientName: 'Grace Atim',
    age: '12',
    gender: 'Female',
    phone: '0772333444',
    isMember: false,
    service: 'Parent Consult',
    status: 'waiting',
    scheduledTime: '10:15 AM',
    checkedInAt: '10:10 AM',
    room: 'Therapy Bay A',
    ticket: 'T-010',
    type: 'walk-in',
    assignedTo: 'dr-ssekandi',
    chiefComplaint: 'Behavioral concerns at school, parent requests evaluation.',
    receptionNotes: 'Walk-in. Mother insists on seeing a doctor today. No prior records.',
    diagnoses: [],
    soap: { subjective: '', objective: '', assessment: '', plan: '' },
    labOrders: [],
    prescriptions: [],
  },
  {
    id: 'clv-05',
    patientId: 'pat-002',
    patientName: 'Kato Joseph',
    age: '8',
    gender: 'Male',
    phone: '0772555666',
    isMember: true,
    service: 'Behavioral Assessment',
    status: 'lab-results',
    scheduledTime: '08:30 AM',
    checkedInAt: '08:20 AM',
    room: 'Room 2',
    ticket: 'T-001',
    type: 'appointment',
    assignedTo: 'dr-nambi',
    chiefComplaint: 'Routine developmental screening follow-up.',
    receptionNotes: 'Parent requests printed summary for school.',
    allergies: 'Peanuts',
    soap: {
      subjective: 'Parent reports improved behavior at home. Still struggling at school with attention.',
      objective: 'ADHD screening questionnaire score: 18/30 (moderate). Height/weight within normal range.',
      assessment: 'Moderate ADHD symptoms persisting. Needs further lab work.',
      plan: 'Ordered CBC and thyroid panel to rule out organic causes.',
    },
    vitals: { temperature: '36.8', bloodPressure: '100/65', pulse: '88', spo2: '99', weight: '26', recordedAt: '08:35 AM', capturedBy: 'Nurse Nambi' },
    diagnoses: [{ code: 'F90.0', name: 'ADHD, predominantly inattentive type' }],
    labOrders: ['lab-02'],
    prescriptions: ['rx-01'],
  },
  {
    id: 'clv-06',
    patientId: 'pat-003',
    patientName: 'Nansubuga Mary',
    age: '28',
    gender: 'Female',
    phone: '0772777888',
    isMember: false,
    service: 'Parent Consultation',
    status: 'completed',
    scheduledTime: '08:00 AM',
    checkedInAt: '07:55 AM',
    room: 'Room 1',
    ticket: 'T-000',
    type: 'appointment',
    assignedTo: 'dr-ssekandi',
    chiefComplaint: 'Follow-up on daughter Joy\'s developmental milestones.',
    receptionNotes: 'Mother arrived early. All docs in order.',
    soap: {
      subjective: 'Mother reports Joy is making progress with speech. Walking more confidently.',
      objective: 'Denver screening: within normal limits for age. Speech: 2-word phrases emerging.',
      assessment: 'Age-appropriate development. Continue current therapy plan.',
      plan: 'Continue speech therapy weekly. Reassess in 4 weeks.',
    },
    diagnoses: [{ code: 'F80.1', name: 'Expressive language disorder' }],
    labOrders: [],
    prescriptions: [],
    completedAt: '08:45 AM',
    diagnosisSummary: 'Developmental delay — improving',
    followUp: '4 weeks',
  },
];

const initialLabOrders: LabOrder[] = [
  {
    id: 'lab-01',
    visitId: 'clv-01',
    patientName: 'Jane Nakamya',
    testName: 'Hearing Audiometry',
    urgency: 'routine',
    status: 'pending',
    orderedAt: '09:15 AM',
    notes: 'Baseline hearing test to rule out auditory processing issues.',
  },
  {
    id: 'lab-02',
    visitId: 'clv-05',
    patientName: 'Kato Joseph',
    testName: 'CBC + Thyroid Panel',
    urgency: 'urgent',
    status: 'completed',
    orderedAt: '08:40 AM',
    collectedAt: '08:50 AM',
    notes: 'Rule out organic causes for attention difficulties.',
    result: 'Results within normal limits.',
    resultData: {
      specimen: 'Venous Blood',
      collectedAt: '08:50 AM',
      resultedAt: '09:45 AM',
      method: 'Automated Hematology Analyzer',
      rows: [
        { parameter: 'WBC', value: '7.2', unit: '×10³/µL', referenceRange: '4.5–11.0', flag: 'normal' },
        { parameter: 'RBC', value: '4.8', unit: '×10⁶/µL', referenceRange: '4.0–5.5', flag: 'normal' },
        { parameter: 'Hemoglobin', value: '12.4', unit: 'g/dL', referenceRange: '11.5–15.5', flag: 'normal' },
        { parameter: 'Hematocrit', value: '37.1', unit: '%', referenceRange: '35–45', flag: 'normal' },
        { parameter: 'Platelets', value: '285', unit: '×10³/µL', referenceRange: '150–400', flag: 'normal' },
        { parameter: 'TSH', value: '3.8', unit: 'mIU/L', referenceRange: '0.4–4.0', flag: 'normal' },
        { parameter: 'Free T4', value: '1.1', unit: 'ng/dL', referenceRange: '0.8–1.8', flag: 'normal' },
        { parameter: 'Free T3', value: '3.2', unit: 'pg/mL', referenceRange: '2.3–4.2', flag: 'normal' },
      ],
    },
  },
];

const initialPrescriptions: Prescription[] = [
  {
    id: 'rx-01',
    visitId: 'clv-05',
    patientName: 'Kato Joseph',
    medication: 'Omega-3 Supplement',
    dosage: '500mg',
    frequency: 'Once daily',
    duration: '3 months',
    notes: 'Adjunct nutritional support.',
    createdAt: '08:45 AM',
    rxStatus: 'sent',
    sentToPharmacyAt: '08:50 AM',
  },
];

/* ─────────── store engine ─────────── */

let _queue: CLQueueItem[] = initialQueue.map((i) => ({ ...i, soap: { ...i.soap } }));
let _labOrders: LabOrder[] = initialLabOrders.map((o) => ({ ...o }));
let _prescriptions: Prescription[] = initialPrescriptions.map((p) => ({ ...p }));
let _viewedResultIds = new Set<string>(); // tracks which completed lab results have been opened
let _transferLog: TransferLogEntry[] = []; // audit trail for transfers, referrals, reassigns
let _transferLogSeq = 1;
let _version = 0;
const _listeners = new Set<() => void>();

function emit() {
  _version++;
  _listeners.forEach((fn) => fn());
}

/* ── counters ── */

let _labSeq = 3;
let _rxSeq = 2;
let _visitSeq = 7; // next queue item sequence (clv-07+)

/* ── public getters ── */

export function getQueue(): CLQueueItem[] {
  return _queue;
}

export function getVisitById(id: string): CLQueueItem | undefined {
  return _queue.find((v) => v.id === id);
}

export function getLabOrders(): LabOrder[] {
  return _labOrders;
}

export function getLabOrderById(id: string): LabOrder | undefined {
  return _labOrders.find((o) => o.id === id);
}

export function getPrescriptions(): Prescription[] {
  return _prescriptions;
}

export function getPrescriptionById(id: string): Prescription | undefined {
  return _prescriptions.find((p) => p.id === id);
}

/** Get all orders (labs + prescriptions) for a visit */
export function getVisitOrders(visitId: string): { labs: LabOrder[]; prescriptions: Prescription[] } {
  return {
    labs: _labOrders.filter((o) => o.visitId === visitId),
    prescriptions: _prescriptions.filter((p) => p.visitId === visitId),
  };
}

/* ── new results badge ── */

/** Count of completed lab results the clinician hasn't opened yet */
export function getNewResultsCount(): number {
  return _labOrders.filter(
    (o) => o.status === 'completed' && !_viewedResultIds.has(o.id)
  ).length;
}

/** Mark a lab result as viewed (clears the "new" badge for it) */
export function markResultViewed(orderId: string) {
  if (!_viewedResultIds.has(orderId)) {
    _viewedResultIds = new Set(_viewedResultIds);
    _viewedResultIds.add(orderId);
    emit();
  }
}

/* ── transfer audit log ── */

/** Get the full transfer/reassign history log */
export function getTransferLog(): TransferLogEntry[] {
  return _transferLog;
}

/** Get transfer log entries for a specific patient */
export function getTransferLogByPatient(patientId: string): TransferLogEntry[] {
  return _transferLog.filter((e) => e.patientId === patientId);
}

/* ── queue KPIs ── */

export function getQueueStats() {
  const waiting = _queue.filter((v) => v.status === 'waiting').length;
  const inConsult = _queue.filter((v) => v.status === 'in-consultation').length;
  const labPending = _queue.filter((v) => v.status === 'lab-pending' || v.status === 'lab-results').length;
  const completed = _queue.filter((v) => v.status === 'completed').length;
  return { waiting, inConsult, labPending, completed, total: _queue.length };
}

/* ── mutations ── */

/** Start consultation — move from waiting to in-consultation */
export function startConsultation(visitId: string) {
  _queue = _queue.map((v) =>
    v.id === visitId ? { ...v, status: 'in-consultation' as CLVisitStatus } : v
  );
  emit();
}

/** Update SOAP note for a visit */
export function updateSOAP(visitId: string, field: keyof SOAPNote, value: string) {
  _queue = _queue.map((v) =>
    v.id === visitId ? { ...v, soap: { ...v.soap, [field]: value } } : v
  );
  emit();
}

/** Update vitals for a visit */
export function updateVitals(visitId: string, vitals: Vitals) {
  const now = new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
  _queue = _queue.map((v) =>
    v.id === visitId ? { ...v, vitals: { ...vitals, recordedAt: now } } : v
  );
  emit();
}

/** Add a diagnosis to a visit */
export function addDiagnosis(visitId: string, entry: DiagnosisEntry) {
  _queue = _queue.map((v) =>
    v.id === visitId && !v.diagnoses.some((d) => d.code === entry.code)
      ? { ...v, diagnoses: [...v.diagnoses, entry] }
      : v
  );
  emit();
}

/** Remove a diagnosis from a visit */
export function removeDiagnosis(visitId: string, code: string) {
  _queue = _queue.map((v) =>
    v.id === visitId
      ? { ...v, diagnoses: v.diagnoses.filter((d) => d.code !== code) }
      : v
  );
  emit();
}

/** Update a simple string field on a visit */
export function updateVisitField(visitId: string, field: 'allergies' | 'historyNotes' | 'followUpNote' | 'chiefComplaint', value: string) {
  _queue = _queue.map((v) =>
    v.id === visitId ? { ...v, [field]: value } : v
  );
  emit();
}

/** Save draft — records timestamp */
export function saveDraft(visitId: string) {
  const now = new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
  _queue = _queue.map((v) =>
    v.id === visitId ? { ...v, draftSavedAt: now } : v
  );
  emit();
}

/** Complete a visit (updated for new fields) */
export function completeVisitFull(visitId: string, opts?: { diagnosisSummary?: string; followUp?: string }) {
  const now = new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
  _queue = _queue.map((v) =>
    v.id === visitId
      ? {
          ...v,
          status: 'completed' as CLVisitStatus,
          completedAt: now,
          diagnosisSummary: opts?.diagnosisSummary || v.diagnoses.map((d) => d.name).join(', ') || v.soap.assessment,
          followUp: opts?.followUp || v.followUpNote,
        }
      : v
  );
  emit();
}

/** Send to lab */
export function sendToLab(visitId: string) {
  _queue = _queue.map((v) =>
    v.id === visitId ? { ...v, status: 'lab-pending' as CLVisitStatus } : v
  );
  emit();
}

/** Send to lab with coverage info */
export function sendToLabWithCoverage(
  visitId: string,
  coverage: { status: 'Covered' | 'Discount applied' | 'Out-of-pocket'; packageName?: string }
) {
  _queue = _queue.map((v) =>
    v.id === visitId
      ? {
          ...v,
          status: 'lab-pending' as CLVisitStatus,
          labCoverageStatus: coverage.status,
          labCoveragePackage: coverage.packageName || undefined,
        }
      : v
  );
  emit();
}

/** Send to pharmacy with coverage info */
export function sendToPharmacyWithCoverage(
  visitId: string,
  coverage: { status: 'Covered' | 'Discount applied' | 'Out-of-pocket'; packageName?: string }
) {
  const now = new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
  _queue = _queue.map((v) =>
    v.id === visitId
      ? {
          ...v,
          status: 'transferred' as CLVisitStatus,
          completedAt: now,
          pharmCoverageStatus: coverage.status,
          pharmCoveragePackage: coverage.packageName || undefined,
        }
      : v
  );
  emit();
}

/** Create a lab order */
export function createLabOrder(data: {
  visitId: string;
  patientName: string;
  testName: string;
  urgency: 'routine' | 'urgent' | 'stat';
  notes?: string;
}): LabOrder {
  const now = new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
  const order: LabOrder = {
    id: `lab-${String(_labSeq++).padStart(2, '0')}`,
    visitId: data.visitId,
    patientName: data.patientName,
    testName: data.testName,
    urgency: data.urgency,
    status: 'pending',
    orderedAt: now,
    notes: data.notes,
  };
  _labOrders = [order, ..._labOrders];

  // Link to visit
  _queue = _queue.map((v) =>
    v.id === data.visitId
      ? { ...v, labOrders: [...v.labOrders, order.id] }
      : v
  );
  emit();
  return order;
}

/** Create a prescription */
export function createPrescription(data: {
  visitId: string;
  patientName: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}): Prescription {
  const now = new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
  const rx: Prescription = {
    id: `rx-${String(_rxSeq++).padStart(2, '0')}`,
    visitId: data.visitId,
    patientName: data.patientName,
    medication: data.medication,
    dosage: data.dosage,
    frequency: data.frequency,
    duration: data.duration,
    notes: data.notes,
    createdAt: now,
    rxStatus: 'sent',
    sentToPharmacyAt: now,
  };
  _prescriptions = [rx, ..._prescriptions];

  // Link to visit
  _queue = _queue.map((v) =>
    v.id === data.visitId
      ? { ...v, prescriptions: [...v.prescriptions, rx.id] }
      : v
  );
  emit();
  return rx;
}

/** Update lab order status */
export function updateLabStatus(orderId: string, status: LabOrder['status'], result?: string) {
  _labOrders = _labOrders.map((o) =>
    o.id === orderId ? { ...o, status, result: result ?? o.result } : o
  );

  // If completed, move visit to lab-results
  const order = _labOrders.find((o) => o.id === orderId);
  if (order && status === 'completed') {
    _queue = _queue.map((v) =>
      v.id === order.visitId && v.status === 'lab-pending'
        ? { ...v, status: 'lab-results' as CLVisitStatus }
        : v
    );
  }
  emit();
}

/* ── Lab notification badge ── */
let _labNotificationCount = 0;

export function getLabNotificationCount(): number {
  return _labNotificationCount;
}

export function incrementLabNotifications() {
  _labNotificationCount++;
  emit();
}

export function clearLabNotifications() {
  _labNotificationCount = 0;
  emit();
}

/** Add or update interpretation note on a lab order */
export function addInterpretationNote(orderId: string, note: string) {
  _labOrders = _labOrders.map((o) =>
    o.id === orderId ? { ...o, interpretationNote: note } : o
  );
  emit();
}

/** Update prescription status */
export function updateRxStatus(rxId: string, status: Prescription['rxStatus']) {
  _prescriptions = _prescriptions.map((p) =>
    p.id === rxId ? { ...p, rxStatus: status } : p
  );
  emit();
}

/** Transfer type for CL-18 */
export type TransferType = 'lab' | 'pharmacy' | 'reception' | 'follow-up';

/** Transfer / referral / reassign log entry for audit trail */
export interface TransferLogEntry {
  id: string;
  visitId: string;
  patientId: string;
  patientName: string;
  type: 'transfer' | 'referral' | 'reassign';
  destination: string;
  notes?: string;
  performedBy: string;
  timestamp: string;
}

/** Transfer / refer a patient — updates visit status and records note */
export function transferPatient(
  visitId: string,
  transferType: TransferType,
  notes?: string
) {
  const now = new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
  _queue = _queue.map((v) => {
    if (v.id !== visitId) return v;
    const base = {
      ...v,
      followUpNote: notes ? `[Transfer — ${transferType}] ${notes}` : v.followUpNote,
    };
    switch (transferType) {
      case 'lab':
        return { ...base, status: 'lab-pending' as CLVisitStatus };
      case 'pharmacy':
        return { ...base, status: 'transferred' as CLVisitStatus, completedAt: now };
      case 'reception':
        return { ...base, status: 'waiting' as CLVisitStatus };
      case 'follow-up':
        return {
          ...base,
          status: 'completed' as CLVisitStatus,
          completedAt: now,
          followUp: 'Scheduled',
        };
    }
  });
  _transferLog.push({
    id: `transfer-${String(_transferLogSeq++).padStart(2, '0')}`,
    visitId,
    patientId: _queue.find((v) => v.id === visitId)?.patientId || '',
    patientName: _queue.find((v) => v.id === visitId)?.patientName || '',
    type: 'transfer',
    destination: transferType,
    notes,
    performedBy: 'dr-ssekandi', // placeholder
    timestamp: now,
  });
  emit();
}

/** Reassign a visit to a different clinician */
export function reassignVisit(
  visitId: string,
  newAssignee: CLQueueItem['assignedTo']
) {
  _queue = _queue.map((v) =>
    v.id === visitId ? { ...v, assignedTo: newAssignee } : v
  );
  _transferLog.push({
    id: `transfer-${String(_transferLogSeq++).padStart(2, '0')}`,
    visitId,
    patientId: _queue.find((v) => v.id === visitId)?.patientId || '',
    patientName: _queue.find((v) => v.id === visitId)?.patientName || '',
    type: 'reassign',
    destination: newAssignee,
    notes: 'Reassigned to another doctor.',
    performedBy: 'dr-ssekandi', // placeholder
    timestamp: new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' }),
  });
  emit();
}

/** Add a patient to the clinician queue (called from Receptionist check-in) */
export function addToClinicianQueue(data: {
  patientName: string;
  phone: string;
  age: string;
  gender: string;
  isMember: boolean;
  service: string;
  ticket: string;
  notes?: string;
  staff?: string;
}): CLQueueItem {
  const now = new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
  const id = `clv-${String(_visitSeq++).padStart(2, '0')}`;
  const rooms = ['Room 1', 'Room 2', 'Room 3', 'Therapy Bay A', 'Therapy Bay B'];
  const room = rooms[Math.floor(Math.random() * rooms.length)];

  let assignedTo: CLQueueItem['assignedTo'] = 'unassigned';
  if (data.staff === 'dr-ssekandi') assignedTo = 'dr-ssekandi';
  else if (data.staff === 'dr-nambi') assignedTo = 'dr-nambi';

  const item: CLQueueItem = {
    id,
    patientId: `pat-${Date.now()}`,
    patientName: data.patientName,
    age: data.age,
    gender: data.gender,
    phone: data.phone.replace(/\s/g, '').replace('+256', '0'),
    isMember: data.isMember,
    service: data.service,
    status: 'waiting',
    scheduledTime: now,
    checkedInAt: now,
    room,
    ticket: data.ticket,
    type: 'walk-in',
    assignedTo,
    chiefComplaint: '',
    receptionNotes: data.notes || '',
    soap: { subjective: '', objective: '', assessment: '', plan: '' },
    diagnoses: [],
    labOrders: [],
    prescriptions: [],
  };

  _queue = [..._queue, item];
  emit();
  return item;
}

/* ── React hook ── */

function getSnapshot(): number {
  return _version;
}

function subscribe(cb: () => void): () => void {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

export function useClinicianStore() {
  useSyncExternalStore(subscribe, getSnapshot);
  return {
    queue: getQueue(),
    getVisitById,
    getQueueStats: getQueueStats(),
    labOrders: getLabOrders(),
    getLabOrderById,
    prescriptions: getPrescriptions(),
    getPrescriptionById,
    getVisitOrders,
    startConsultation,
    updateSOAP,
    completeVisitFull,
    sendToLab,
    sendToLabWithCoverage,
    sendToPharmacyWithCoverage,
    createLabOrder,
    createPrescription,
    updateLabStatus,
    addInterpretationNote,
    updateRxStatus,
    updateVitals,
    addDiagnosis,
    removeDiagnosis,
    updateVisitField,
    saveDraft,
    transferPatient,
    reassignVisit,
    addToClinicianQueue,
    getNewResultsCount,
    markResultViewed,
    getTransferLog,
    getTransferLogByPatient,
    getLabNotificationCount,
    incrementLabNotifications,
    clearLabNotifications,
  };
}