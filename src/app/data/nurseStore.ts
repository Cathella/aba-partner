/**
 * nurseStore — In-memory store for the Nurse module (merged Clinic Assistant).
 * Manages nurse queue (triage), vitals, notes, transfers, and rooms.
 * Uses useSyncExternalStore for React 18 compatibility.
 */

import { useSyncExternalStore } from 'react';

/* ─────────── types ─────────── */

export type NUQueueStatus =
  | 'waiting-triage'
  | 'ready-for-clinician'
  | 'in-station';

export type NUStationType = 'lab' | 'pharmacy' | 'room' | 'reception';

export type NURoomStatus = 'available' | 'occupied' | 'cleaning';

export interface NUVitals {
  bp?: string;       // e.g. "120/80"
  temp?: string;     // e.g. "36.7"
  pulse?: string;    // e.g. "72"
  spO2?: string;     // e.g. "98"
  weight?: string;   // e.g. "68"
  capturedAt?: string;
  capturedBy?: string;
}

export interface NUNote {
  id: string;
  text: string;
  chips: string[];
  createdAt: string;
  createdBy: string;
}

export interface NUQueueItem {
  id: string;
  ticketNo: string;
  patientName: string;
  patientAge: string;
  patientGender: string;
  isMember: boolean;
  service: string;
  arrivalTime: string;
  status: NUQueueStatus;
  stationType?: NUStationType;
  stationLabel?: string;
  vitals?: NUVitals;
  notes: NUNote[];
  transferNote?: string;
  /** Coverage fields set during station transfers */
  consultCoverageStatus?: 'Covered' | 'Discount applied' | 'Out-of-pocket';
  consultCoveragePackage?: string;
  labCoverageStatus?: 'Covered' | 'Discount applied' | 'Out-of-pocket';
  labCoveragePackage?: string;
  pharmCoverageStatus?: 'Covered' | 'Discount applied' | 'Out-of-pocket';
  pharmCoveragePackage?: string;
}

export interface NURoom {
  id: string;
  name: string;
  status: NURoomStatus;
  note?: string;
  lastUpdated?: string;
}

/* ─────────── mock data ─────────── */

const mockQueue: NUQueueItem[] = [
  {
    id: 'nq-1',
    ticketNo: 'T-001',
    patientName: 'Sarah Namutebi',
    patientAge: '28',
    patientGender: 'Female',
    isMember: true,
    service: 'General Consultation',
    arrivalTime: '08:15 AM',
    status: 'waiting-triage',
    notes: [],
  },
  {
    id: 'nq-2',
    ticketNo: 'T-002',
    patientName: 'James Okello',
    patientAge: '45',
    patientGender: 'Male',
    isMember: false,
    service: 'Follow-up Visit',
    arrivalTime: '08:32 AM',
    status: 'waiting-triage',
    notes: [],
  },
  {
    id: 'nq-3',
    ticketNo: 'T-003',
    patientName: 'Grace Akiteng',
    patientAge: '34',
    patientGender: 'Female',
    isMember: true,
    service: 'Lab Work',
    arrivalTime: '08:45 AM',
    status: 'waiting-triage',
    vitals: {
      bp: '118/76',
      temp: '36.5',
      pulse: '70',
      spO2: '99',
      weight: '62',
      capturedAt: '08:50 AM',
      capturedBy: 'Nurse Nambi',
    },
    notes: [],
  },
  {
    id: 'nq-4',
    ticketNo: 'T-004',
    patientName: 'Peter Ssemwanga',
    patientAge: '60',
    patientGender: 'Male',
    isMember: true,
    service: 'Chronic Care Review',
    arrivalTime: '09:00 AM',
    status: 'ready-for-clinician',
    vitals: {
      bp: '142/90',
      temp: '36.8',
      pulse: '78',
      spO2: '97',
      weight: '85',
      capturedAt: '09:10 AM',
      capturedBy: 'Nurse Nambi',
    },
    notes: [
      {
        id: 'nn-1',
        text: 'Patient reports persistent headaches for 3 days. BP elevated.',
        chips: ['Pain', 'Follow-up'],
        createdAt: '09:12 AM',
        createdBy: 'Nurse Nambi',
      },
    ],
  },
  {
    id: 'nq-5',
    ticketNo: 'T-005',
    patientName: 'Diana Nakamya',
    patientAge: '22',
    patientGender: 'Female',
    isMember: false,
    service: 'Walk-in',
    arrivalTime: '09:15 AM',
    status: 'ready-for-clinician',
    vitals: {
      bp: '110/70',
      temp: '38.2',
      pulse: '88',
      spO2: '98',
      weight: '55',
      capturedAt: '09:25 AM',
      capturedBy: 'Nurse Nambi',
    },
    notes: [
      {
        id: 'nn-2',
        text: 'Fever and body aches for 2 days. No vomiting.',
        chips: ['Fever'],
        createdAt: '09:27 AM',
        createdBy: 'Nurse Nambi',
      },
    ],
  },
  {
    id: 'nq-6',
    ticketNo: 'T-006',
    patientName: 'Moses Kato',
    patientAge: '50',
    patientGender: 'Male',
    isMember: true,
    service: 'Lab Work',
    arrivalTime: '09:30 AM',
    status: 'in-station',
    stationType: 'lab',
    stationLabel: 'Lab',
    vitals: {
      bp: '130/85',
      temp: '36.6',
      pulse: '74',
      spO2: '98',
      weight: '78',
      capturedAt: '09:40 AM',
      capturedBy: 'Nurse Nambi',
    },
    notes: [],
  },
  {
    id: 'nq-7',
    ticketNo: 'T-007',
    patientName: 'Rose Adongo',
    patientAge: '38',
    patientGender: 'Female',
    isMember: false,
    service: 'Pharmacy Pickup',
    arrivalTime: '09:45 AM',
    status: 'in-station',
    stationType: 'pharmacy',
    stationLabel: 'Pharmacy',
    notes: [],
  },
  {
    id: 'nq-8',
    ticketNo: 'T-008',
    patientName: 'David Lubega',
    patientAge: '55',
    patientGender: 'Male',
    isMember: true,
    service: 'Procedure',
    arrivalTime: '10:00 AM',
    status: 'in-station',
    stationType: 'room',
    stationLabel: 'Procedure Room',
    vitals: {
      bp: '125/82',
      temp: '36.7',
      pulse: '68',
      spO2: '99',
      weight: '90',
      capturedAt: '10:10 AM',
      capturedBy: 'Nurse Nambi',
    },
    notes: [],
  },
];

const mockRooms: NURoom[] = [
  { id: 'room-1', name: 'OPD Room 1', status: 'available', lastUpdated: '08:00 AM' },
  { id: 'room-2', name: 'OPD Room 2', status: 'occupied', note: 'Dr. Mugisha with patient', lastUpdated: '09:15 AM' },
  { id: 'room-3', name: 'Procedure Room', status: 'occupied', note: 'Minor procedure in progress', lastUpdated: '10:00 AM' },
  { id: 'room-4', name: 'Triage Desk', status: 'available', lastUpdated: '08:00 AM' },
];

/* ─────────── store ─────────── */

interface NurseState {
  queue: NUQueueItem[];
  rooms: NURoom[];
}

let state: NurseState = {
  queue: [...mockQueue],
  rooms: [...mockRooms],
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

function getSnapshot(): NurseState {
  return state;
}

/* ─────────── selectors ─────────── */

function deriveView(s: NurseState) {
  const waitingTriage = s.queue.filter((q) => q.status === 'waiting-triage');
  const readyForClinician = s.queue.filter((q) => q.status === 'ready-for-clinician');
  const inStation = s.queue.filter((q) => q.status === 'in-station');

  return {
    queue: s.queue,
    rooms: s.rooms,
    waitingTriage,
    readyForClinician,
    inStation,
    stats: {
      total: s.queue.length,
      waitingTriage: waitingTriage.length,
      readyForClinician: readyForClinician.length,
      inStation: inStation.length,
    },
    getById: (id: string) => s.queue.find((q) => q.id === id),
    getRoomById: (id: string) => s.rooms.find((r) => r.id === id),
  };
}

/* ─────────── hook ─────────── */

export function useNurseStore() {
  const s = useSyncExternalStore(subscribe, getSnapshot);
  return deriveView(s);
}

/* ─────────── mutations ─────────── */

export function saveVitals(patientId: string, vitals: NUVitals) {
  const now = new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit', hour12: true });
  state = {
    ...state,
    queue: state.queue.map((q) =>
      q.id === patientId
        ? { ...q, vitals: { ...vitals, capturedAt: now, capturedBy: 'Nurse Nambi' } }
        : q
    ),
  };
  emit();
}

export function addNursingNote(patientId: string, text: string, chips: string[]) {
  const now = new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit', hour12: true });
  const noteId = `nn-${Date.now()}`;
  state = {
    ...state,
    queue: state.queue.map((q) =>
      q.id === patientId
        ? {
            ...q,
            notes: [
              ...q.notes,
              { id: noteId, text, chips, createdAt: now, createdBy: 'Nurse Nambi' },
            ],
          }
        : q
    ),
  };
  emit();
}

export function markReadyForClinician(patientId: string) {
  state = {
    ...state,
    queue: state.queue.map((q) =>
      q.id === patientId ? { ...q, status: 'ready-for-clinician' as NUQueueStatus } : q
    ),
  };
  emit();
}

export function transferPatient(
  patientId: string,
  stationType: NUStationType,
  stationLabel: string,
  note?: string
) {
  state = {
    ...state,
    queue: state.queue.map((q) =>
      q.id === patientId
        ? {
            ...q,
            status: 'in-station' as NUQueueStatus,
            stationType,
            stationLabel,
            transferNote: note,
          }
        : q
    ),
  };
  emit();
}

/** Transfer to station with coverage info (Lab / Pharmacy). */
export function transferPatientWithCoverage(
  patientId: string,
  stationType: NUStationType,
  stationLabel: string,
  coverage: { status: 'Covered' | 'Discount applied' | 'Out-of-pocket'; packageName?: string },
  note?: string
) {
  const coverageKey = stationType === 'lab' ? 'lab' : 'pharm';
  state = {
    ...state,
    queue: state.queue.map((q) =>
      q.id === patientId
        ? {
            ...q,
            status: 'in-station' as NUQueueStatus,
            stationType,
            stationLabel,
            transferNote: note,
            [`${coverageKey}CoverageStatus`]: coverage.status,
            [`${coverageKey}CoveragePackage`]: coverage.packageName || undefined,
          }
        : q
    ),
  };
  emit();
}

/** Mark ready for clinician with consultation coverage info. */
export function markReadyWithCoverage(
  patientId: string,
  coverage: { status: 'Covered' | 'Discount applied' | 'Out-of-pocket'; packageName?: string }
) {
  state = {
    ...state,
    queue: state.queue.map((q) =>
      q.id === patientId
        ? {
            ...q,
            status: 'ready-for-clinician' as NUQueueStatus,
            consultCoverageStatus: coverage.status,
            consultCoveragePackage: coverage.packageName || undefined,
          }
        : q
    ),
  };
  emit();
}

export function updateRoomStatus(roomId: string, newStatus: NURoomStatus, note?: string) {
  const now = new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit', hour12: true });
  state = {
    ...state,
    rooms: state.rooms.map((r) =>
      r.id === roomId ? { ...r, status: newStatus, note: note || r.note, lastUpdated: now } : r
    ),
  };
  emit();
}