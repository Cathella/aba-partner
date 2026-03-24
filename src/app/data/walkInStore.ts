/**
 * walkInStore — Shared in-memory store for the Receptionist Walk-in flow.
 * Screens R-10 → R-12 → R-13 → R-14 → R-15 → R-16 share this state.
 * Uses useSyncExternalStore for React 18 compatibility.
 */

import { useSyncExternalStore } from 'react';

/* ─────────── types ─────────── */

export interface WalkInMember {
  id: string;
  name: string;
  phone: string;
  gender: string;
  age: string;
  address: string;
  isMember: boolean; // true = AbaAccess, false = non-member
  memberId?: string;
}

export type Department = 'OPD' | 'Lab' | 'Pharmacy';

export interface WalkInVisit {
  department: Department;
  service: string;
  staff: string;
  notes: string;
}

export interface QueueTicket {
  ticketNumber: string;
  department: string;
  memberName: string;
  service: string;
  estimatedWait: string;
  time: string;
}

export interface WalkInFlowState {
  member: WalkInMember | null;
  verifyMethod: 'qr' | 'member-id' | 'phone' | null;
  verifyQuery: string;
  visit: WalkInVisit | null;
  ticket: QueueTicket | null;
}

/* ─────────── mock member directory ─────────── */

export const memberDirectory: WalkInMember[] = [
  { id: 'ABA-2024-001', name: 'Jane Nakamya', phone: '+256 701 234 567', gender: 'Female', age: '32', address: 'Mukono Town', isMember: true, memberId: 'ABA-2024-001' },
  { id: 'ABA-2024-002', name: 'Peter Ochieng', phone: '+256 702 345 678', gender: 'Male', age: '28', address: 'Jinja Road', isMember: true, memberId: 'ABA-2024-002' },
  { id: 'ABA-2024-003', name: 'Ruth Amongi', phone: '+256 703 456 789', gender: 'Female', age: '45', address: 'Kampala Central', isMember: true, memberId: 'ABA-2024-003' },
  { id: 'ABA-2024-004', name: 'Moses Okello', phone: '+256 704 567 890', gender: 'Male', age: '6', address: 'Naalya', isMember: true, memberId: 'ABA-2024-004' },
  { id: 'ABA-2024-005', name: 'Grace Atim', phone: '+256 705 678 901', gender: 'Female', age: '12', address: 'Ntinda', isMember: true, memberId: 'ABA-2024-005' },
  { id: 'ABA-2024-006', name: 'Amina Nambi', phone: '+256 706 789 012', gender: 'Female', age: '8', address: 'Bukoto', isMember: true, memberId: 'ABA-2024-006' },
  { id: 'ABA-2024-007', name: 'David Ssemwogerere', phone: '+256 701 111 222', gender: 'Male', age: '35', address: 'Entebbe Road', isMember: true, memberId: 'ABA-2024-007' },
];

/* ─────────── service options by department ─────────── */

export const departmentServices: Record<Department, string[]> = {
  OPD: [
    'Speech Therapy',
    'Occupational Therapy',
    'Behavioral Assessment',
    'Parent Consultation',
    'Follow-up Session',
    'General Check-up',
    'Developmental Screening',
  ],
  Lab: [
    'Blood Work',
    'Urinalysis',
    'Hearing Test',
    'Vision Screening',
    'Allergy Panel',
  ],
  Pharmacy: [
    'Prescription Pickup',
    'Medication Review',
    'Refill Request',
  ],
};

/* ─────────── staff options ─────────── */

export const staffOptions = [
  { id: '', label: 'Auto-assign' },
  { id: 'dr-ssekandi', label: 'Dr. Ssekandi' },
  { id: 'ms-apio', label: 'Ms. Apio' },
  { id: 'mr-okot', label: 'Mr. Okot' },
  { id: 'dr-namutebi', label: 'Dr. Namutebi' },
];

/* ─────────── store engine ─────────── */

const initialState: WalkInFlowState = {
  member: null,
  verifyMethod: null,
  verifyQuery: '',
  visit: null,
  ticket: null,
};

let _state: WalkInFlowState = { ...initialState };
let _version = 0;
const _listeners = new Set<() => void>();

function emitChange() {
  _version++;
  _listeners.forEach((fn) => fn());
}

/* ── public API ── */

export function getWalkInState(): WalkInFlowState {
  return _state;
}

export function setMember(member: WalkInMember | null) {
  _state = { ..._state, member };
  emitChange();
}

export function setVerifyMethod(method: 'qr' | 'member-id' | 'phone' | null) {
  _state = { ..._state, verifyMethod: method };
  emitChange();
}

export function setVerifyQuery(query: string) {
  _state = { ..._state, verifyQuery: query };
  emitChange();
}

export function setVisit(visit: WalkInVisit | null) {
  _state = { ..._state, visit };
  emitChange();
}

export function setTicket(ticket: QueueTicket | null) {
  _state = { ..._state, ticket };
  emitChange();
}

export function resetWalkInFlow() {
  _state = { ...initialState };
  emitChange();
}

export function searchMembers(query: string): WalkInMember[] {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];
  return memberDirectory.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      (m.memberId && m.memberId.toLowerCase().includes(q))
  );
}

/** Generate a pseudo-random ticket number */
export function generateTicketNumber(department: Department): string {
  const prefix = department === 'OPD' ? 'OPD' : department === 'Lab' ? 'LAB' : 'PHR';
  const num = Math.floor(Math.random() * 80) + 20; // 20-99
  return `${prefix}-0${num}`;
}

function getSnapshot(): number {
  return _version;
}

function subscribe(onStoreChange: () => void): () => void {
  _listeners.add(onStoreChange);
  return () => _listeners.delete(onStoreChange);
}

/* ── React hook ── */

export function useWalkInStore() {
  useSyncExternalStore(subscribe, getSnapshot);
  return {
    state: getWalkInState(),
    setMember,
    setVerifyMethod,
    setVerifyQuery,
    setVisit,
    setTicket,
    resetWalkInFlow,
    searchMembers,
  };
}
