import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABABadge } from '../components/aba/ABABadge';
import { ABAButton } from '../components/aba/ABAButton';
import { ABAModal } from '../components/aba/ABAModal';
import { showToast } from '../components/aba/Toast';
import {
  ChevronLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  UserX,
  CheckCircle,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

type BookingStatus =
  | 'confirmed'
  | 'checked-in'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show'
  | 'pending-reschedule';

interface Booking {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  assignedStaff: string;
  assignedStaffId: string;
  status: BookingStatus;
  notes?: string;
  patientAge?: string;
  patientDiagnosis?: string;
  bookingDate: string;
}

const mockBookings: Record<string, Booking> = {
  '1': {
    id: '1',
    patientName: 'Sarah Johnson',
    patientPhone: '+256 700 123 456',
    patientEmail: 'sarah.j@example.com',
    service: 'Speech Therapy',
    date: '2026-02-11',
    time: '09:00 AM',
    duration: '60 min',
    assignedStaff: 'Dr. Emily Chen',
    assignedStaffId: '1',
    status: 'completed',
    notes: 'Follow-up for articulation exercises',
    patientAge: '8 years',
    patientDiagnosis: 'Articulation Disorder',
    bookingDate: '2026-02-05',
  },
  '2': {
    id: '2',
    patientName: 'Michael Smith',
    patientPhone: '+256 700 234 567',
    patientEmail: 'michael.s@example.com',
    service: 'Occupational Therapy',
    date: '2026-02-11',
    time: '10:30 AM',
    duration: '45 min',
    assignedStaff: 'Dr. James Wilson',
    assignedStaffId: '2',
    status: 'in-progress',
    notes: 'Fine motor skills development',
    patientAge: '6 years',
    patientDiagnosis: 'Developmental Coordination Disorder',
    bookingDate: '2026-02-06',
  },
  '3': {
    id: '3',
    patientName: 'Emma Davis',
    patientPhone: '+256 700 345 678',
    patientEmail: 'emma.d@example.com',
    service: 'Behavioral Assessment',
    date: '2026-02-11',
    time: '11:00 AM',
    duration: '90 min',
    assignedStaff: 'Dr. Sarah Martinez',
    assignedStaffId: '3',
    status: 'checked-in',
    notes: 'Initial comprehensive assessment',
    patientAge: '10 years',
    patientDiagnosis: 'Pending assessment',
    bookingDate: '2026-02-07',
  },
  '6': {
    id: '6',
    patientName: 'Ava Taylor',
    patientPhone: '+256 700 456 789',
    patientEmail: 'ava.t@example.com',
    service: 'Initial Consultation',
    date: '2026-02-12',
    time: '09:00 AM',
    duration: '60 min',
    assignedStaff: 'Dr. Sarah Martinez',
    assignedStaffId: '3',
    status: 'pending-reschedule',
    notes: 'Parent requested to reschedule due to conflict',
    patientAge: '5 years',
    patientDiagnosis: 'New patient',
    bookingDate: '2026-02-08',
  },
};

const statusConfig: Record<
  BookingStatus,
  { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' }
> = {
  confirmed: { label: 'Confirmed', variant: 'info' },
  'checked-in': { label: 'Checked In', variant: 'info' },
  'in-progress': { label: 'In Progress', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'error' },
  'no-show': { label: 'No-show', variant: 'error' },
  'pending-reschedule': { label: 'Pending Reschedule', variant: 'warning' },
};

export function BookingDetail() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [showApproveModal, setShowApproveModal] = useState(false);

  const booking = bookingId ? mockBookings[bookingId] : null;

  if (!booking) {
    return (
      <div className="flex flex-col h-screen bg-aba-bg-primary">
        <AppTopBar
          title="Booking Detail"
          showBack
          onBackClick={() => navigate(-1)}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-aba-neutral-600">Booking not found</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleApproveReschedule = () => {
    showToast('Reschedule request approved', 'success');
    setShowApproveModal(false);
    setTimeout(() => {
      navigate('/bookings-list');
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Booking Details"
        showBack
        onBackClick={() => navigate(-1)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            <ABABadge variant={statusConfig[booking.status].variant} size="md">
              {statusConfig[booking.status].label}
            </ABABadge>
          </div>

          {/* Booking Information */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4 space-y-4">
            <h3 className="text-base font-semibold text-aba-neutral-900">
              Booking Information
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-aba-neutral-600">Service</p>
                  <p className="text-sm font-medium text-aba-neutral-900">
                    {booking.service}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-aba-neutral-600">Date</p>
                  <p className="text-sm font-medium text-aba-neutral-900">
                    {formatDate(booking.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-aba-neutral-600">Time</p>
                  <p className="text-sm font-medium text-aba-neutral-900">
                    {booking.time} ({booking.duration})
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-aba-neutral-600">Assigned Staff</p>
                  <p className="text-sm font-medium text-aba-neutral-900">
                    {booking.assignedStaff}
                  </p>
                </div>
              </div>

              {booking.notes && (
                <div className="flex items-start gap-3 pt-2 border-t border-aba-neutral-200">
                  <FileText className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-aba-neutral-600">Notes</p>
                    <p className="text-sm text-aba-neutral-900">{booking.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Patient Summary */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4 space-y-4">
            <h3 className="text-base font-semibold text-aba-neutral-900">
              Patient Summary
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-aba-neutral-600">Name</p>
                  <p className="text-sm font-medium text-aba-neutral-900">
                    {booking.patientName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-aba-neutral-600">Phone</p>
                  <p className="text-sm font-medium text-aba-neutral-900">
                    {booking.patientPhone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-aba-neutral-600">Email</p>
                  <p className="text-sm font-medium text-aba-neutral-900">
                    {booking.patientEmail}
                  </p>
                </div>
              </div>

              {booking.patientAge && (
                <div className="flex items-start gap-3 pt-2 border-t border-aba-neutral-200">
                  <User className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-aba-neutral-600">Age</p>
                    <p className="text-sm text-aba-neutral-900">
                      {booking.patientAge}
                    </p>
                  </div>
                </div>
              )}

              {booking.patientDiagnosis && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-aba-neutral-600">Diagnosis</p>
                    <p className="text-sm text-aba-neutral-900">
                      {booking.patientDiagnosis}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Actions */}
          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4 space-y-3">
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Admin Actions
              </h3>

              <div className="space-y-2">
                <ABAButton
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => navigate(`/reassign-staff/${booking.id}`)}
                >
                  <UserCheck className="w-5 h-5" />
                  Reassign Staff
                </ABAButton>

                {booking.status === 'pending-reschedule' && (
                  <ABAButton
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={() => setShowApproveModal(true)}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve Reschedule
                  </ABAButton>
                )}

                <ABAButton
                  variant="destructive"
                  size="md"
                  fullWidth
                  onClick={() => navigate(`/cancel-booking/${booking.id}`)}
                >
                  <UserX className="w-5 h-5" />
                  Cancel Booking
                </ABAButton>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approve Reschedule Modal */}
      <ABAModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Reschedule"
      >
        <div className="space-y-4">
          <div className="bg-aba-secondary-50 border border-aba-secondary-200 rounded-xl p-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-aba-secondary-main mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-aba-neutral-900">
                You are about to approve the reschedule request for{' '}
                <span className="font-medium">{booking.patientName}</span>.
              </p>
              <p className="text-xs text-aba-neutral-700 mt-1">
                The patient will be notified and can choose a new time slot.
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => setShowApproveModal(false)}
            >
              Cancel
            </ABAButton>
            <ABAButton
              variant="primary"
              fullWidth
              onClick={handleApproveReschedule}
            >
              Approve
            </ABAButton>
          </div>
        </div>
      </ABAModal>
    </div>
  );
}