import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { StatusChip } from '../components/aba/StatusChip';
import { ABAButton } from '../components/aba/ABAButton';
import { ABAModal } from '../components/aba/ABAModal';
import { showToast } from '../components/aba/Toast';
import { useBookingsStore } from '../data/bookingsStore';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  Stethoscope,
  CheckCircle,
  CalendarClock,
  XCircle,
  UserCog,
  ChevronDown,
} from 'lucide-react';

/* ── staff options for Accept modal (R-22) ── */
const staffOptions = [
  { id: '', label: 'Auto-assign (first available)' },
  { id: 'dr-ssekandi', label: 'Dr. Ssekandi' },
  { id: 'ms-apio', label: 'Ms. Apio' },
  { id: 'mr-okot', label: 'Mr. Okot' },
  { id: 'dr-namutebi', label: 'Dr. Namutebi' },
];

/* ── info row helper ── */
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-aba-neutral-200 last:border-b-0">
      <div className="mt-0.5 text-aba-neutral-600">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-aba-neutral-600">{label}</p>
        <p className="text-sm font-medium text-aba-neutral-900">{value}</p>
      </div>
    </div>
  );
}

export function RBookingDetail() {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();
  const { getBooking, updateBooking } = useBookingsStore();

  const booking = getBooking(bookingId ?? '');

  /* R-22 Accept modal state */
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);

  /* ── Fallback for unknown IDs ── */
  if (!booking) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Booking Detail" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <p className="text-lg font-semibold text-aba-neutral-900 mb-2">Booking not found</p>
            <p className="text-sm text-aba-neutral-600 mb-4">ID: {bookingId}</p>
            <ABAButton variant="primary" size="md" onClick={() => navigate('/r/bookings')}>
              Back to Bookings
            </ABAButton>
          </div>
        </div>
      </div>
    );
  }

  const isActionable = ['pending', 'reschedule-requested'].includes(booking.status);

  /* ── Actions ── */
  const handleAccept = () => {
    const staffLabel = staffOptions.find((s) => s.id === selectedStaff)?.label ?? '';
    updateBooking(booking.id, {
      status: 'confirmed',
      assignedStaff: staffLabel || 'Auto-assigned',
    });
    setAcceptOpen(false);
    showToast(`Booking accepted for ${booking.memberName}`, 'success');
    setTimeout(() => navigate('/r/bookings'), 400);
  };

  const staffLabelSelected = selectedStaff
    ? staffOptions.find((s) => s.id === selectedStaff)?.label ?? ''
    : 'Auto-assign (first available)';

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Booking Detail" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">

          {/* ── Member summary card ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-aba-secondary-main" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-aba-neutral-900">
                    {booking.memberName}
                  </h2>
                  <p className="text-xs text-aba-neutral-600">{booking.memberEmail}</p>
                </div>
              </div>
              <StatusChip status={booking.status} size="md" />
            </div>

            <div className="flex gap-2">
              <a
                href={`tel:${booking.memberPhone}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-aba-neutral-200 text-xs font-medium text-aba-neutral-900 hover:bg-aba-neutral-100 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                {booking.memberPhone}
              </a>
              <a
                href={`mailto:${booking.memberEmail}`}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-aba-neutral-200 text-xs font-medium text-aba-neutral-900 hover:bg-aba-neutral-100 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Email
              </a>
            </div>
          </div>

          {/* ── Service & time details ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
            <h3 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide mb-1">
              Appointment Details
            </h3>
            <InfoRow
              icon={<Stethoscope className="w-4 h-4" />}
              label="Service"
              value={booking.service}
            />
            <InfoRow
              icon={<Calendar className="w-4 h-4" />}
              label="Requested Date"
              value={booking.date}
            />
            <InfoRow
              icon={<Clock className="w-4 h-4" />}
              label="Time & Duration"
              value={`${booking.time} \u2022 ${booking.duration}`}
            />
            {booking.assignedStaff && (
              <InfoRow
                icon={<UserCog className="w-4 h-4" />}
                label="Assigned Staff"
                value={booking.assignedStaff}
              />
            )}
          </div>

          {/* ── Proposed time (if applicable) ── */}
          {booking.status === 'proposed' && booking.proposedDate && (
            <div className="bg-aba-secondary-50 rounded-2xl border border-aba-secondary-main/20 p-4">
              <h3 className="text-xs font-semibold text-aba-secondary-main uppercase tracking-wide mb-2">
                New Time Proposed
              </h3>
              <p className="text-sm font-medium text-aba-neutral-900">
                {booking.proposedDate} at {booking.proposedTime}
              </p>
              {booking.proposalReason && (
                <p className="text-xs text-aba-neutral-600 mt-1">{booking.proposalReason}</p>
              )}
            </div>
          )}

          {/* ── Decline info (if applicable) ── */}
          {booking.status === 'declined' && (
            <div className="bg-aba-error-50 rounded-2xl border border-aba-error-main/20 p-4">
              <h3 className="text-xs font-semibold text-aba-error-main uppercase tracking-wide mb-2">
                Declined
              </h3>
              {booking.declineReason && (
                <p className="text-sm font-medium text-aba-neutral-900">{booking.declineReason}</p>
              )}
              {booking.declineNotes && (
                <p className="text-xs text-aba-neutral-600 mt-1">{booking.declineNotes}</p>
              )}
            </div>
          )}

          {/* ── Notes ── */}
          {booking.notes && (
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-aba-neutral-600" />
                <p className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">
                  Notes
                </p>
              </div>
              <p className="text-sm text-aba-neutral-700 leading-relaxed">
                {booking.notes}
              </p>
            </div>
          )}

          {/* ── Actions (only if actionable) ── */}
          {isActionable && (
            <div className="space-y-3 pt-2">
              {/* Accept — opens R-22 modal */}
              <ABAButton
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setAcceptOpen(true)}
              >
                <CheckCircle className="w-5 h-5" />
                Accept Booking
              </ABAButton>

              {/* Propose New Time → R-23 */}
              <ABAButton
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => navigate(`/r/bookings/${booking.id}/propose-time`)}
              >
                <CalendarClock className="w-5 h-5" />
                Propose New Time
              </ABAButton>

              {/* Decline → R-24 */}
              <button
                onClick={() => navigate(`/r/bookings/${booking.id}/decline`)}
                className="w-full py-3 text-sm font-semibold text-aba-error-main hover:underline transition-colors"
              >
                <span className="inline-flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  Decline Booking
                </span>
              </button>
            </div>
          )}

          {/* Non-actionable info */}
          {!isActionable && booking.status === 'confirmed' && (
            <div className="bg-aba-success-50 rounded-2xl border border-aba-success-main/20 p-4 text-center">
              <CheckCircle className="w-8 h-8 text-aba-success-main mx-auto mb-2" />
              <p className="text-sm font-medium text-aba-neutral-900">
                This booking has been confirmed
              </p>
              {booking.assignedStaff && (
                <p className="text-xs text-aba-neutral-600 mt-1">
                  Assigned to {booking.assignedStaff}
                </p>
              )}
            </div>
          )}

          <div className="h-4" />
        </div>
      </div>

      {/* ── R-22 Accept Booking Modal ── */}
      <ABAModal
        isOpen={acceptOpen}
        onClose={() => setAcceptOpen(false)}
        title="Accept Booking"
        description={`Confirm ${booking.memberName}'s booking for ${booking.service} on ${booking.date} at ${booking.time}.`}
        confirmText="Confirm & Accept"
        onConfirm={handleAccept}
      >
        {/* Staff dropdown */}
        <div>
          <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
            Assign Staff <span className="text-aba-neutral-400">(optional)</span>
          </label>
          <div className="relative">
            <button
              onClick={() => setStaffDropdownOpen(!staffDropdownOpen)}
              className="w-full flex items-center justify-between h-12 px-4 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-sm text-aba-neutral-900 hover:border-aba-neutral-600 transition-colors"
            >
              <span className={selectedStaff ? '' : 'text-aba-neutral-600'}>
                {staffLabelSelected}
              </span>
              <ChevronDown className={`w-4 h-4 text-aba-neutral-600 transition-transform ${staffDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {staffDropdownOpen && (
              <div className="absolute z-10 top-[calc(100%+4px)] left-0 right-0 bg-aba-neutral-0 border border-aba-neutral-200 rounded-lg shadow-lg overflow-hidden">
                {staffOptions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedStaff(s.id);
                      setStaffDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-aba-neutral-100 transition-colors border-b border-aba-neutral-200 last:border-b-0 ${
                      selectedStaff === s.id
                        ? 'font-semibold text-aba-primary-main bg-aba-primary-50/50'
                        : 'text-aba-neutral-900'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </ABAModal>
    </div>
  );
}