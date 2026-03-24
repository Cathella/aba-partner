/**
 * bookingsStore — Shared in-memory store for Receptionist booking data.
 * Allows R-11, R-21, R-23, R-24 screens to read/write the same state
 * so that status updates persist across navigation.
 *
 * Uses useSyncExternalStore for React 18 compatibility.
 */

import { useSyncExternalStore } from 'react';
import type { VisitStatus } from '../components/aba/StatusChip';

/* ─────────── types ─────────── */

export type BookingTab = 'new' | 'today' | 'upcoming';

export interface Booking {
  id: string;
  memberName: string;
  memberPhone: string;
  memberEmail: string;
  service: string;
  provider: string;
  date: string;        // display string: "Today", "Tomorrow", "Feb 15"
  time: string;        // "09:00 AM"
  duration: string;    // "45 min"
  notes: string;
  status: VisitStatus;
  tab: BookingTab;
  assignedStaff?: string;
  /** If a new time was proposed */
  proposedDate?: string;
  proposedTime?: string;
  proposalReason?: string;
  /** If declined */
  declineReason?: string;
  declineNotes?: string;
}

/* ─────────── initial mock data ─────────── */

const initialBookings: Booking[] = [
  // ── New tab (incoming requests) ──
  {
    id: 'bk-n1',
    memberName: 'Sarah Kato',
    memberPhone: '+256 707 890 123',
    memberEmail: 'sarah.kato@email.com',
    service: 'Behavioral Assessment',
    provider: '',
    date: 'Tomorrow',
    time: '09:00 AM',
    duration: '90 min',
    notes: 'First-time assessment. Mother reports difficulty with transitions.',
    status: 'pending',
    tab: 'new',
  },
  {
    id: 'bk-n2',
    memberName: 'John Mugisha',
    memberPhone: '+256 708 901 234',
    memberEmail: 'john.mugisha@email.com',
    service: 'Speech Therapy',
    provider: '',
    date: 'Tomorrow',
    time: '10:30 AM',
    duration: '45 min',
    notes: 'Follow-up from initial screening on Feb 5.',
    status: 'pending',
    tab: 'new',
  },
  {
    id: 'bk-n3',
    memberName: 'Betty Nabukenya',
    memberPhone: '+256 709 012 345',
    memberEmail: 'betty.nab@email.com',
    service: 'Follow-up Session',
    provider: 'Dr. Ssekandi',
    date: 'Feb 15',
    time: '02:00 PM',
    duration: '30 min',
    notes: 'Client requested to change from originally booked Feb 14 morning slot.',
    status: 'reschedule-requested',
    tab: 'new',
  },
  {
    id: 'bk-n4',
    memberName: 'Robert Owino',
    memberPhone: '+256 710 123 456',
    memberEmail: 'r.owino@email.com',
    service: 'OT Session',
    provider: '',
    date: 'Feb 16',
    time: '11:00 AM',
    duration: '60 min',
    notes: 'Referred by school counselor. Fine motor skills concern.',
    status: 'pending',
    tab: 'new',
  },
  {
    id: 'bk-n5',
    memberName: 'Florence Namatovu',
    memberPhone: '+256 711 234 567',
    memberEmail: 'flo.namatovu@email.com',
    service: 'Parent Consultation',
    provider: '',
    date: 'Feb 17',
    time: '09:30 AM',
    duration: '45 min',
    notes: 'Parent wants to discuss ABA therapy options.',
    status: 'pending',
    tab: 'new',
  },

  // ── Today tab ──
  {
    id: 'bk-t1',
    memberName: 'Jane Nakamya',
    memberPhone: '+256 701 234 567',
    memberEmail: 'jane.n@email.com',
    service: 'Speech Therapy',
    provider: 'Dr. Ssekandi',
    date: 'Today',
    time: '09:00 AM',
    duration: '45 min',
    notes: 'Continuing articulation exercises from last session.',
    status: 'confirmed',
    tab: 'today',
    assignedStaff: 'Dr. Ssekandi',
  },
  {
    id: 'bk-t2',
    memberName: 'Peter Ochieng',
    memberPhone: '+256 702 345 678',
    memberEmail: 'peter.o@email.com',
    service: 'OT Session',
    provider: 'Ms. Apio',
    date: 'Today',
    time: '09:30 AM',
    duration: '60 min',
    notes: 'Sensory integration therapy.',
    status: 'confirmed',
    tab: 'today',
    assignedStaff: 'Ms. Apio',
  },
  {
    id: 'bk-t3',
    memberName: 'Ruth Amongi',
    memberPhone: '+256 703 456 789',
    memberEmail: 'ruth.a@email.com',
    service: 'Behavioral Assessment',
    provider: 'Dr. Ssekandi',
    date: 'Today',
    time: '10:00 AM',
    duration: '90 min',
    notes: 'Initial assessment. Bring previous medical records.',
    status: 'pending',
    tab: 'today',
  },
  {
    id: 'bk-t4',
    memberName: 'Moses Okello',
    memberPhone: '+256 704 567 890',
    memberEmail: 'moses.ok@email.com',
    service: 'Follow-up Session',
    provider: 'Dr. Ssekandi',
    date: 'Today',
    time: '10:30 AM',
    duration: '30 min',
    notes: '',
    status: 'confirmed',
    tab: 'today',
    assignedStaff: 'Dr. Ssekandi',
  },
  {
    id: 'bk-t5',
    memberName: 'Grace Atim',
    memberPhone: '+256 705 678 901',
    memberEmail: 'grace.atim@email.com',
    service: 'Parent Consultation',
    provider: 'Ms. Apio',
    date: 'Today',
    time: '11:00 AM',
    duration: '45 min',
    notes: 'Parent bringing school progress report.',
    status: 'pending',
    tab: 'today',
  },

  // ── Upcoming tab ──
  {
    id: 'bk-u1',
    memberName: 'Amina Nambi',
    memberPhone: '+256 706 789 012',
    memberEmail: 'amina.n@email.com',
    service: 'OT Session',
    provider: 'Ms. Apio',
    date: 'Feb 15',
    time: '09:00 AM',
    duration: '60 min',
    notes: 'Bi-weekly session.',
    status: 'confirmed',
    tab: 'upcoming',
    assignedStaff: 'Ms. Apio',
  },
  {
    id: 'bk-u2',
    memberName: 'David Ssemwogerere',
    memberPhone: '+256 701 111 222',
    memberEmail: 'david.ss@email.com',
    service: 'Speech Therapy',
    provider: 'Dr. Ssekandi',
    date: 'Feb 16',
    time: '10:00 AM',
    duration: '45 min',
    notes: 'Review progress after 6 sessions.',
    status: 'confirmed',
    tab: 'upcoming',
    assignedStaff: 'Dr. Ssekandi',
  },
  {
    id: 'bk-u3',
    memberName: 'Patricia Auma',
    memberPhone: '+256 712 345 678',
    memberEmail: 'pat.auma@email.com',
    service: 'Behavioral Assessment',
    provider: '',
    date: 'Feb 17',
    time: '02:00 PM',
    duration: '90 min',
    notes: 'New patient referral from pediatrician.',
    status: 'pending',
    tab: 'upcoming',
  },
];

/* ─────────── store engine ─────────── */

let _bookings = [...initialBookings];
let _version = 0;
const _listeners = new Set<() => void>();

function emitChange() {
  _version++;
  _listeners.forEach((fn) => fn());
}

/* ── public API ── */

export function getBookings(): Booking[] {
  return _bookings;
}

export function getBooking(id: string): Booking | undefined {
  return _bookings.find((b) => b.id === id);
}

export function updateBooking(id: string, updates: Partial<Booking>) {
  _bookings = _bookings.map((b) =>
    b.id === id ? { ...b, ...updates } : b
  );
  emitChange();
}

export function getSnapshot(): number {
  return _version;
}

function subscribe(onStoreChange: () => void): () => void {
  _listeners.add(onStoreChange);
  return () => _listeners.delete(onStoreChange);
}

/* ── React hook ── */

export function useBookingsStore() {
  useSyncExternalStore(subscribe, getSnapshot);
  return {
    bookings: getBookings(),
    getBooking,
    updateBooking,
  };
}
