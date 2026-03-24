import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { useBookingsStore } from '../data/bookingsStore';
import {
  ChevronDown,
  AlertTriangle,
  XCircle,
  User,
  Calendar,
  Clock,
} from 'lucide-react';

/* ── decline reason options ── */
const declineReasons = [
  { id: 'fully-booked', label: 'Fully booked on requested date' },
  { id: 'provider-unavailable', label: 'Provider not available' },
  { id: 'service-unavailable', label: 'Service temporarily unavailable' },
  { id: 'duplicate', label: 'Duplicate booking request' },
  { id: 'patient-request', label: 'Patient requested cancellation' },
  { id: 'other', label: 'Other reason' },
];

export function RDeclineBooking() {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();
  const { getBooking, updateBooking } = useBookingsStore();

  const booking = getBooking(bookingId ?? '');

  const [selectedReason, setSelectedReason] = useState('');
  const [reasonDropdownOpen, setReasonDropdownOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [declining, setDeclining] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!booking) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Decline Booking" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-aba-neutral-600">Booking not found.</p>
        </div>
      </div>
    );
  }

  const reasonLabel = declineReasons.find((r) => r.id === selectedReason)?.label ?? '';
  const canDecline = !!selectedReason;

  const handleDecline = () => {
    setDeclining(true);
    setTimeout(() => {
      updateBooking(booking.id, {
        status: 'declined',
        declineReason: reasonLabel,
        declineNotes: notes || undefined,
      });
      setDeclining(false);
      setConfirmOpen(false);
      showToast(`Booking for ${booking.memberName} declined`, 'warning');
      navigate('/r/bookings');
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Decline Booking" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-5">

          {/* ── Warning banner ── */}
          <div className="flex items-center gap-3 bg-aba-error-50 border border-aba-error-main/20 rounded-2xl p-4">
            <AlertTriangle className="w-5 h-5 text-aba-error-main flex-shrink-0" />
            <p className="text-sm text-aba-neutral-900">
              Declining this booking will notify the member. This action cannot be undone.
            </p>
          </div>

          {/* ── Booking summary ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-aba-secondary-main" />
              </div>
              <div>
                <p className="text-sm font-semibold text-aba-neutral-900">{booking.memberName}</p>
                <p className="text-xs text-aba-neutral-600">{booking.service}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-aba-neutral-100 rounded-xl p-3">
              <span className="inline-flex items-center gap-1 text-xs text-aba-neutral-600">
                <Calendar className="w-3.5 h-3.5" />
                {booking.date}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-aba-neutral-600">
                <Clock className="w-3.5 h-3.5" />
                {booking.time}
              </span>
            </div>
          </div>

          {/* ── Reason dropdown ── */}
          <div>
            <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
              Reason for declining <span className="text-aba-error-main">*</span>
            </label>
            <div className="relative">
              <button
                onClick={() => setReasonDropdownOpen(!reasonDropdownOpen)}
                className="w-full flex items-center justify-between h-12 px-4 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-sm hover:border-aba-neutral-600 transition-colors"
              >
                <span className={selectedReason ? 'text-aba-neutral-900' : 'text-aba-neutral-600'}>
                  {reasonLabel || 'Select a reason'}
                </span>
                <ChevronDown className={`w-4 h-4 text-aba-neutral-600 transition-transform ${reasonDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {reasonDropdownOpen && (
                <div className="absolute z-10 top-[calc(100%+4px)] left-0 right-0 bg-aba-neutral-0 border border-aba-neutral-200 rounded-lg shadow-lg overflow-hidden">
                  {declineReasons.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { setSelectedReason(r.id); setReasonDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-aba-neutral-100 transition-colors border-b border-aba-neutral-200 last:border-b-0 ${
                        selectedReason === r.id
                          ? 'font-semibold text-aba-error-main bg-aba-error-50/50'
                          : 'text-aba-neutral-900'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Additional notes ── */}
          <div>
            <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
              Additional notes <span className="text-aba-neutral-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Suggest they rebook next week, alternate provider available on Friday…"
              rows={4}
              className="w-full px-4 py-3 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-sm text-aba-neutral-900 placeholder:text-aba-neutral-600 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main/30 focus:border-aba-secondary-main transition-all resize-none"
            />
          </div>

          {/* ── Decline CTA ── */}
          <div className="pt-2">
            <ABAButton
              variant="destructive"
              size="lg"
              fullWidth
              disabled={!canDecline}
              onClick={() => setConfirmOpen(true)}
            >
              <XCircle className="w-5 h-5" />
              Decline Booking
            </ABAButton>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline"
          >
            Go back
          </button>

          <div className="h-4" />
        </div>
      </div>

      {/* ── Confirm decline modal ── */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmOpen(false); }}
        >
          <div className="bg-aba-neutral-0 rounded-t-3xl sm:rounded-3xl w-full max-w-[390px] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-aba-error-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-aba-error-main" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-aba-neutral-900">
                  Confirm Decline
                </h3>
                <p className="text-sm text-aba-neutral-600">This cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-aba-neutral-700 mb-6">
              You are about to decline <span className="font-semibold">{booking.memberName}</span>'s
              booking for {booking.service} on {booking.date}.
              The member will be notified.
            </p>

            <div className="flex gap-3">
              <ABAButton
                variant="text"
                onClick={() => setConfirmOpen(false)}
                className="flex-1"
                disabled={declining}
              >
                Cancel
              </ABAButton>
              <ABAButton
                variant="destructive"
                onClick={handleDecline}
                className="flex-1"
                isLoading={declining}
              >
                Decline
              </ABAButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
