/**
 * patientsStore — Shared in-memory store for the Receptionist Patients module.
 * R-60 Patients Home, R-61 Add Patient, R-62 Patient Profile,
 * R-63 Edit Patient, R-64 Dependents.
 * Uses useSyncExternalStore for React 18 compatibility.
 */

import { useSyncExternalStore } from 'react';

/* ─────────── types ─────────── */

export interface Dependent {
  id: string;
  name: string;
  relationship: string;
  age: string;
  gender: string;
}

export interface RecentActivity {
  id: string;
  type: 'visit' | 'payment';
  description: string;
  date: string;
  amount?: string;
  status: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  phone: string;
  gender: string;
  age: string;
  dob?: string;
  address: string;
  isMember: boolean;
  memberId?: string;
  nextOfKin?: string;
  nextOfKinPhone?: string;
  registeredAt: string;
  lastVisit?: string;
  dependents: Dependent[];
  recentActivity: RecentActivity[];
}

export type PatientFilter = 'all' | 'today' | 'member' | 'non-member';

/* ─────────── initial mock data ─────────── */

const today = new Date().toLocaleDateString('en-UG', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const initialPatients: PatientRecord[] = [
  {
    id: 'pat-001',
    name: 'Nakitto Agnes',
    phone: '+256 712 345 678',
    gender: 'Female',
    age: '34',
    dob: '15 Jun 1991',
    address: 'Mukono Town',
    isMember: true,
    memberId: 'ABA-2024-010',
    nextOfKin: 'Ssali Robert',
    nextOfKinPhone: '+256 701 222 333',
    registeredAt: '05 Jan 2026',
    lastVisit: '10 Feb 2026',
    dependents: [
      { id: 'dep-001', name: 'Nakitto Sarah', relationship: 'Daughter', age: '7', gender: 'Female' },
      { id: 'dep-002', name: 'Ssali David', relationship: 'Son', age: '4', gender: 'Male' },
    ],
    recentActivity: [
      { id: 'ra-001', type: 'visit', description: 'Speech Therapy — Dr. Ssekandi', date: '10 Feb 2026', status: 'Completed' },
      { id: 'ra-002', type: 'payment', description: 'Payment — UGX 80,000', date: '10 Feb 2026', amount: 'UGX 80,000', status: 'Paid' },
      { id: 'ra-003', type: 'visit', description: 'OT Session — Ms. Apio', date: '27 Jan 2026', status: 'Completed' },
    ],
  },
  {
    id: 'pat-002',
    name: 'Kato Joseph',
    phone: '+256 777 888 999',
    gender: 'Male',
    age: '8',
    dob: '22 Apr 2017',
    address: 'Ntinda, Kampala',
    isMember: false,
    nextOfKin: 'Kato Margaret',
    nextOfKinPhone: '+256 777 111 222',
    registeredAt: '12 Feb 2026',
    lastVisit: '12 Feb 2026',
    dependents: [],
    recentActivity: [
      { id: 'ra-004', type: 'visit', description: 'Behavioral Assessment — Ms. Apio', date: '12 Feb 2026', status: 'Completed' },
      { id: 'ra-005', type: 'payment', description: 'Payment — UGX 120,000', date: '12 Feb 2026', amount: 'UGX 120,000', status: 'Pending' },
    ],
  },
  {
    id: 'pat-003',
    name: 'Nansubuga Mary',
    phone: '+256 701 234 567',
    gender: 'Female',
    age: '28',
    dob: '08 Nov 1997',
    address: 'Kampala Central',
    isMember: true,
    memberId: 'ABA-2024-011',
    nextOfKin: 'Nansubuga Peter',
    nextOfKinPhone: '+256 702 333 444',
    registeredAt: '18 Dec 2025',
    lastVisit: '07 Feb 2026',
    dependents: [
      { id: 'dep-003', name: 'Nansubuga Joy', relationship: 'Daughter', age: '3', gender: 'Female' },
    ],
    recentActivity: [
      { id: 'ra-006', type: 'visit', description: 'Parent Consultation — Dr. Ssekandi', date: '07 Feb 2026', status: 'Completed' },
      { id: 'ra-007', type: 'payment', description: 'Payment — UGX 40,000', date: '07 Feb 2026', amount: 'UGX 40,000', status: 'Paid' },
      { id: 'ra-008', type: 'visit', description: 'Developmental Screening — Ms. Apio', date: '20 Jan 2026', status: 'Completed' },
    ],
  },
  {
    id: 'pat-004',
    name: 'Jane Nakamya',
    phone: '+256 701 234 567',
    gender: 'Female',
    age: '32',
    address: 'Mukono Town',
    isMember: true,
    memberId: 'ABA-2024-001',
    registeredAt: '10 Nov 2025',
    lastVisit: '13 Feb 2026',
    dependents: [],
    recentActivity: [
      { id: 'ra-009', type: 'visit', description: 'Speech Therapy — Dr. Ssekandi', date: '13 Feb 2026', status: 'In Progress' },
    ],
  },
  {
    id: 'pat-005',
    name: 'Peter Ochieng',
    phone: '+256 702 345 678',
    gender: 'Male',
    age: '28',
    address: 'Jinja Road',
    isMember: true,
    memberId: 'ABA-2024-002',
    registeredAt: '15 Nov 2025',
    lastVisit: '13 Feb 2026',
    dependents: [],
    recentActivity: [
      { id: 'ra-010', type: 'visit', description: 'OT Session — Dr. Ssekandi', date: '13 Feb 2026', status: 'Waiting' },
    ],
  },
  {
    id: 'pat-006',
    name: 'Grace Atim',
    phone: '+256 705 678 901',
    gender: 'Female',
    age: '12',
    address: 'Ntinda',
    isMember: false,
    nextOfKin: 'Atim Florence',
    nextOfKinPhone: '+256 705 000 111',
    registeredAt: today,
    lastVisit: today,
    dependents: [],
    recentActivity: [
      { id: 'ra-011', type: 'visit', description: 'Parent Consult — Ms. Apio', date: today, status: 'Waiting' },
    ],
  },
  {
    id: 'pat-007',
    name: 'Amina Nambi',
    phone: '+256 706 789 012',
    gender: 'Female',
    age: '8',
    address: 'Bukoto',
    isMember: true,
    memberId: 'ABA-2024-006',
    registeredAt: '20 Dec 2025',
    lastVisit: '03 Feb 2026',
    dependents: [],
    recentActivity: [],
  },
];

/* ─────────── store engine ─────────── */

let _items: PatientRecord[] = initialPatients.map((p) => ({ ...p }));
let _version = 0;
const _listeners = new Set<() => void>();

function emit() {
  _version++;
  _listeners.forEach((fn) => fn());
}

/* ── public getters ── */

export function getPatients(): PatientRecord[] {
  return _items;
}

export function getPatientById(id: string): PatientRecord | undefined {
  return _items.find((p) => p.id === id);
}

/* ── search & filter ── */

export function searchPatients(query: string, filter: PatientFilter): PatientRecord[] {
  let results = _items;

  // filter first
  if (filter === 'today') {
    results = results.filter((p) => p.registeredAt === today);
  } else if (filter === 'member') {
    results = results.filter((p) => p.isMember);
  } else if (filter === 'non-member') {
    results = results.filter((p) => !p.isMember);
  }

  // then search
  const q = query.trim().toLowerCase();
  if (q.length >= 2) {
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.memberId && p.memberId.toLowerCase().includes(q))
    );
  }

  return results;
}

/* ── mutations ── */

let _seq = _items.length + 1;

export function addPatient(
  data: Omit<PatientRecord, 'id' | 'registeredAt' | 'dependents' | 'recentActivity'>
): PatientRecord {
  const newPatient: PatientRecord = {
    ...data,
    id: `pat-${String(_seq++).padStart(3, '0')}`,
    registeredAt: today,
    dependents: [],
    recentActivity: [],
  };
  _items = [newPatient, ..._items];
  emit();
  return newPatient;
}

export function updatePatient(
  id: string,
  data: Partial<Omit<PatientRecord, 'id' | 'registeredAt' | 'dependents' | 'recentActivity'>>
) {
  _items = _items.map((p) => (p.id === id ? { ...p, ...data } : p));
  emit();
}

/* ── phone masking helper ── */
export function maskPhone(phone: string): string {
  // "+256 712 345 678" → "+256 7** *** 678"
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return phone;
  const last3 = digits.slice(-3);
  const prefix = phone.slice(0, 5);
  return `${prefix} ${phone[5] ?? ''}** *** ${last3}`;
}

/* ── React hook ── */

function getSnapshot(): number {
  return _version;
}

function subscribe(cb: () => void): () => void {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

export function usePatientsStore() {
  useSyncExternalStore(subscribe, getSnapshot);
  return {
    patients: getPatients(),
    getPatientById,
    searchPatients,
    addPatient,
    updatePatient,
  };
}
