/**
 * scheduleStore — Shared in-memory store for today's appointment schedule & queue.
 * R-20 (Today Schedule) uses this for check-in status updates,
 * R-30 Queue Board reads all queue-stage patients,
 * R-31 Queue Detail mutates status / transfers / removals.
 * Uses useSyncExternalStore for React 18 compatibility.
 */

import { useSyncExternalStore } from 'react';
import type { VisitStatus } from '../components/aba/StatusChip';

/* ─────────── types ─────────── */

export interface ScheduleItem {
  id: string;
  time: string;
  patient: string;
  phone: string;
  service: string;
  provider: string;
  status: VisitStatus;
  type: 'appointment' | 'walk-in';
  room?: string;
  assignedStaff?: string;
  checkedInAt?: string;
  /** Ticket number displayed on queue cards */
  ticket?: string;
  /** Transfer / removal notes */
  transferNote?: string;
  removalReason?: string;
  /** Coverage status set during transfer to consultation */
  coverageStatus?: 'Covered' | 'Discount applied' | 'Out-of-pocket';
  /** Applied package name (e.g., "Consultation Only") */
  coveragePackage?: string;
  /** Lab coverage status set during transfer to lab */
  labCoverageStatus?: 'Covered' | 'Discount applied' | 'Out-of-pocket';
  /** Lab applied package name (e.g., "Lab Only") */
  labCoveragePackage?: string;
  /** Pharmacy coverage status set during transfer to pharmacy */
  pharmCoverageStatus?: 'Covered' | 'Discount applied' | 'Out-of-pocket';
  /** Pharmacy applied package name (e.g., "Pharmacy Only") */
  pharmCoveragePackage?: string;
}

/* ─────────── initial mock data ─────────── */

const initialSchedule: ScheduleItem[] = [
  // ── completed ──
  { id: 'sch-01', time: '08:30 AM', patient: 'David Ssemwogerere', phone: '+256 701 111 222', service: 'Speech Therapy', provider: 'Dr. Ssekandi', status: 'completed', type: 'appointment', room: 'Room 2', assignedStaff: 'Dr. Ssekandi', checkedInAt: '08:25 AM', ticket: 'T-001' },
  // ── in-consultation ──
  { id: 'sch-02', time: '09:00 AM', patient: 'Jane Nakamya', phone: '+256 701 234 567', service: 'Speech Therapy', provider: 'Dr. Ssekandi', status: 'in-consultation', type: 'appointment', room: 'Room 3', assignedStaff: 'Dr. Ssekandi', checkedInAt: '08:55 AM', ticket: 'T-002' },
  // ── waiting ──
  { id: 'sch-03', time: '09:30 AM', patient: 'Peter Ochieng', phone: '+256 702 345 678', service: 'OT Session', provider: 'Dr. Ssekandi', status: 'waiting', type: 'appointment', room: 'Room 1', assignedStaff: 'Dr. Ssekandi', checkedInAt: '09:22 AM', ticket: 'T-003' },
  // ── arrived (not yet checked in) ──
  { id: 'sch-04', time: '10:00 AM', patient: 'Ruth Amongi', phone: '+256 703 456 789', service: 'Behavioral Assessment', provider: 'Ms. Apio', status: 'arrived', type: 'appointment' },
  { id: 'sch-05', time: '10:15 AM', patient: 'Grace Atim', phone: '+256 705 678 901', service: 'Parent Consult', provider: 'Ms. Apio', status: 'arrived', type: 'walk-in' },
  // ── confirmed (not arrived) ──
  { id: 'sch-06', time: '10:30 AM', patient: 'Moses Okello', phone: '+256 704 567 890', service: 'Follow-up', provider: 'Dr. Ssekandi', status: 'confirmed', type: 'appointment' },
  // ── pending ──
  { id: 'sch-07', time: '11:00 AM', patient: 'Amina Nambi', phone: '+256 706 789 012', service: 'OT Session', provider: 'Ms. Apio', status: 'pending', type: 'appointment' },
  { id: 'sch-08', time: '11:30 AM', patient: 'Sarah Kato', phone: '+256 707 890 123', service: 'Behavioral Assessment', provider: 'Dr. Ssekandi', status: 'confirmed', type: 'appointment' },
  { id: 'sch-09', time: '12:00 PM', patient: 'John Mugisha', phone: '+256 708 901 234', service: 'Speech Therapy', provider: 'Ms. Apio', status: 'pending', type: 'appointment' },
  { id: 'sch-10', time: '12:15 PM', patient: 'Betty Nabukenya', phone: '+256 709 012 345', service: 'General Check-up', provider: 'Dr. Ssekandi', status: 'arrived', type: 'walk-in' },
  { id: 'sch-11', time: '01:00 PM', patient: 'Robert Owino', phone: '+256 710 123 456', service: 'Follow-up', provider: 'Ms. Apio', status: 'confirmed', type: 'appointment' },
  { id: 'sch-12', time: '02:00 PM', patient: 'Florence Namatovu', phone: '+256 711 234 567', service: 'OT Session', provider: 'Dr. Ssekandi', status: 'pending', type: 'appointment' },
  // ── lab ──
  { id: 'sch-13', time: '08:00 AM', patient: 'Isaac Lubega', phone: '+256 712 345 678', service: 'Blood Work', provider: 'Dr. Ssekandi', status: 'lab', type: 'appointment', room: 'Lab', assignedStaff: 'Dr. Ssekandi', checkedInAt: '07:50 AM', ticket: 'T-004', transferNote: 'CBC and metabolic panel needed.' },
  // ── pharmacy ──
  { id: 'sch-14', time: '08:15 AM', patient: 'Esther Kyomuhendo', phone: '+256 713 456 789', service: 'Medication Review', provider: 'Ms. Apio', status: 'pharmacy', type: 'appointment', room: 'Pharmacy', assignedStaff: 'Ms. Apio', checkedInAt: '08:10 AM', ticket: 'T-005', transferNote: 'Collect prescribed medication.' },
  // ── waiting ──
  { id: 'sch-15', time: '09:45 AM', patient: 'Samuel Mugabe', phone: '+256 714 567 890', service: 'Speech Therapy', provider: 'Ms. Apio', status: 'waiting', type: 'appointment', room: 'Therapy Bay A', assignedStaff: 'Ms. Apio', checkedInAt: '09:38 AM', ticket: 'T-006' },
  // ── in-consultation ──
  { id: 'sch-16', time: '09:15 AM', patient: 'Agnes Nansubuga', phone: '+256 715 678 901', service: 'Behavioral Assessment', provider: 'Ms. Apio', status: 'in-consultation', type: 'appointment', room: 'Room 4', assignedStaff: 'Ms. Apio', checkedInAt: '09:10 AM', ticket: 'T-007' },
  // ── completed ──
  { id: 'sch-17', time: '07:30 AM', patient: 'Patrick Kasozi', phone: '+256 716 789 012', service: 'Follow-up', provider: 'Dr. Ssekandi', status: 'completed', type: 'appointment', room: 'Room 2', assignedStaff: 'Dr. Ssekandi', checkedInAt: '07:25 AM', ticket: 'T-008' },
];

/* ─────────── staff & room options ─────────── */

export const staffChoices = [
  { id: '', label: 'Keep current' },
  { id: 'dr-ssekandi', label: 'Dr. Ssekandi' },
  { id: 'ms-apio', label: 'Ms. Apio' },
  { id: 'mr-okot', label: 'Mr. Okot' },
  { id: 'dr-namutebi', label: 'Dr. Namutebi' },
];

export const roomChoices = [
  '',
  'Room 1',
  'Room 2',
  'Room 3',
  'Room 4',
  'Therapy Bay A',
  'Therapy Bay B',
  'Lab',
];

export const removalReasons = [
  'Patient left without being seen',
  'Duplicate entry',
  'Patient requested cancellation',
  'Incorrect patient information',
  'Appointment rescheduled',
  'Other',
];

/* ─────────── helpers ─────────── */

/** Statuses that still need check-in */
export const isNotArrived = (s: VisitStatus) => ['pending', 'confirmed'].includes(s);
export const isArrived = (s: VisitStatus) => s === 'arrived';
export const isCheckedIn = (s: VisitStatus) =>
  ['checked-in', 'waiting', 'in-consultation', 'lab', 'pharmacy'].includes(s);
export const isDone = (s: VisitStatus) => ['completed', 'no-show'].includes(s);

/** Is this patient currently somewhere in the queue? */
export const isInQueue = (s: VisitStatus) =>
  ['waiting', 'in-consultation', 'lab', 'pharmacy'].includes(s);

/** Returns a human-friendly arrival label for the three-state model */
export function arrivalLabel(s: VisitStatus): string {
  if (isNotArrived(s)) return 'Not arrived';
  if (isArrived(s)) return 'Arrived';
  if (isCheckedIn(s)) return 'Checked-in';
  return 'Done';
}

/** The "next" status in the typical flow */
export function nextStatus(current: VisitStatus): VisitStatus | null {
  const map: Partial<Record<VisitStatus, VisitStatus>> = {
    waiting: 'in-consultation',
    'in-consultation': 'completed',
    lab: 'waiting',
    pharmacy: 'waiting',
  };
  return map[current] ?? null;
}

/** Human label for the "advance" action */
export function advanceActionLabel(current: VisitStatus): string {
  const map: Partial<Record<VisitStatus, string>> = {
    waiting: 'Start Consultation',
    'in-consultation': 'Mark Complete',
    lab: 'Return to Queue',
    pharmacy: 'Return to Queue',
  };
  return map[current] ?? 'Update Status';
}

/* ─────────── ticket counter ─────────── */

let _ticketSeq = 9; // T-001 through T-008 are already assigned in initial data

function nextTicket(): string {
  _ticketSeq++;
  return `T-${String(_ticketSeq).padStart(3, '0')}`;
}

/* ─────────── store engine ─────────── */

let _items: ScheduleItem[] = initialSchedule.map((i) => ({ ...i }));
let _version = 0;
const _listeners = new Set<() => void>();

function emit() {
  _version++;
  _listeners.forEach((fn) => fn());
}

/* ── public API ── */

export function getSchedule(): ScheduleItem[] {
  return _items;
}

export function getItemById(id: string): ScheduleItem | undefined {
  return _items.find((i) => i.id === id);
}

/** Check in a patient — sets status to "waiting" (enters queue). */
export function checkInPatient(
  id: string,
  opts?: { staff?: string; room?: string }
) {
  const now = new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
  _items = _items.map((i) =>
    i.id === id
      ? {
          ...i,
          status: 'waiting' as VisitStatus,
          checkedInAt: now,
          assignedStaff: opts?.staff || i.provider,
          room: opts?.room || i.room || '',
          ticket: i.ticket || nextTicket(),
        }
      : i
  );
  emit();
}

/** Mark a patient as arrived (but not yet checked in). */
export function markArrived(id: string) {
  _items = _items.map((i) =>
    i.id === id ? { ...i, status: 'arrived' as VisitStatus } : i
  );
  emit();
}

/** Advance to next status in normal flow. */
export function advanceStatus(id: string) {
  _items = _items.map((i) => {
    if (i.id !== id) return i;
    const next = nextStatus(i.status);
    return next ? { ...i, status: next } : i;
  });
  emit();
}

/** Advance to in-consultation with coverage info. */
export function advanceWithCoverage(
  id: string,
  coverage: { status: 'Covered' | 'Discount applied' | 'Out-of-pocket'; packageName?: string }
) {
  _items = _items.map((i) => {
    if (i.id !== id) return i;
    return {
      ...i,
      status: 'in-consultation' as VisitStatus,
      coverageStatus: coverage.status,
      coveragePackage: coverage.packageName || undefined,
    };
  });
  emit();
}

/** Directly set status to any value. */
export function setStatus(id: string, status: VisitStatus) {
  _items = _items.map((i) =>
    i.id === id ? { ...i, status } : i
  );
  emit();
}

/** Transfer to Lab with optional note. */
export function transferToLab(id: string, note?: string) {
  _items = _items.map((i) =>
    i.id === id
      ? { ...i, status: 'lab' as VisitStatus, room: 'Lab', transferNote: note || '' }
      : i
  );
  emit();
}

/** Transfer to Lab with coverage info. */
export function transferToLabWithCoverage(
  id: string,
  coverage: { status: 'Covered' | 'Discount applied' | 'Out-of-pocket'; packageName?: string },
  note?: string
) {
  _items = _items.map((i) =>
    i.id === id
      ? {
          ...i,
          status: 'lab' as VisitStatus,
          room: 'Lab',
          transferNote: note || '',
          labCoverageStatus: coverage.status,
          labCoveragePackage: coverage.packageName || undefined,
        }
      : i
  );
  emit();
}

/** Transfer to Pharmacy with optional note. */
export function transferToPharmacy(id: string, note?: string) {
  _items = _items.map((i) =>
    i.id === id
      ? { ...i, status: 'pharmacy' as VisitStatus, room: 'Pharmacy', transferNote: note || '' }
      : i
  );
  emit();
}

/** Transfer to Pharmacy with coverage info. */
export function transferToPharmacyWithCoverage(
  id: string,
  coverage: { status: 'Covered' | 'Discount applied' | 'Out-of-pocket'; packageName?: string },
  note?: string
) {
  _items = _items.map((i) =>
    i.id === id
      ? {
          ...i,
          status: 'pharmacy' as VisitStatus,
          room: 'Pharmacy',
          transferNote: note || '',
          pharmCoverageStatus: coverage.status,
          pharmCoveragePackage: coverage.packageName || undefined,
        }
      : i
  );
  emit();
}

/** Remove from queue with a reason. */
export function removeFromQueue(id: string, reason: string) {
  _items = _items.map((i) =>
    i.id === id
      ? { ...i, status: 'no-show' as VisitStatus, removalReason: reason }
      : i
  );
  emit();
}

/** Get all items currently in the queue (any active stage). */
export function getQueueFromSchedule(): ScheduleItem[] {
  return _items.filter((i) => isInQueue(i.status));
}

/** Get all items including completed / no-show for the board's Completed tab. */
export function getQueueBoardItems(): ScheduleItem[] {
  return _items.filter(
    (i) => isInQueue(i.status) || i.status === 'completed' || i.status === 'no-show'
  );
}

/* ── React hook ── */

function getSnapshot(): number {
  return _version;
}

function subscribe(cb: () => void): () => void {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

export function useScheduleStore() {
  useSyncExternalStore(subscribe, getSnapshot);
  return {
    items: getSchedule(),
    getItemById,
    checkInPatient,
    markArrived,
    advanceStatus,
    advanceWithCoverage,
    setStatus,
    transferToLab,
    transferToLabWithCoverage,
    transferToPharmacy,
    transferToPharmacyWithCoverage,
    removeFromQueue,
    queueItems: getQueueFromSchedule(),
    boardItems: getQueueBoardItems(),
  };
}