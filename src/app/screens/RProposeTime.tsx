import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { useBookingsStore } from '../data/bookingsStore';
import {
  Calendar,
  Clock,
  ChevronDown,
  FileText,
  Send,
  User,
} from 'lucide-react';

/* ── placeholder date/time options ── */
const dateOptions = [
  'Tomorrow, Feb 14',
  'Sat, Feb 15',
  'Mon, Feb 17',
  'Tue, Feb 18',
  'Wed, Feb 19',
];

const timeSlots = [
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
];

export function RProposeTime() {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();
  const { getBooking, updateBooking } = useBookingsStore();

  const booking = getBooking(bookingId ?? '');

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [sending, setSending] = useState(false);

  if (!booking) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Propose New Time" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-aba-neutral-600">Booking not found.</p>
        </div>
      </div>
    );
  }

  const canSubmit = selectedDate && selectedTime;

  const handleSend = () => {
    if (!canSubmit) return;
    setSending(true);
    setTimeout(() => {
      updateBooking(booking.id, {
        status: 'proposed',
        proposedDate: selectedDate,
        proposedTime: selectedTime,
        proposalReason: reason || undefined,
      });
      setSending(false);
      showToast(`New time proposed to ${booking.memberName}`, 'success');
      navigate('/r/bookings');
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Propose New Time" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-5">

          {/* ── Current booking summary ── */}
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
              <span className="text-xs text-aba-neutral-400">{booking.duration}</span>
            </div>
          </div>

          {/* ── New date picker (placeholder dropdown) ── */}
          <div>
            <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
              Proposed Date
            </label>
            <div className="relative">
              <button
                onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                className="w-full flex items-center justify-between h-12 px-4 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-sm hover:border-aba-neutral-600 transition-colors"
              >
                <span className={`inline-flex items-center gap-2 ${selectedDate ? 'text-aba-neutral-900' : 'text-aba-neutral-600'}`}>
                  <Calendar className="w-4 h-4" />
                  {selectedDate || 'Select a date'}
                </span>
                <ChevronDown className={`w-4 h-4 text-aba-neutral-600 transition-transform ${dateDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dateDropdownOpen && (
                <div className="absolute z-10 top-[calc(100%+4px)] left-0 right-0 bg-aba-neutral-0 border border-aba-neutral-200 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                  {dateOptions.map((d) => (
                    <button
                      key={d}
                      onClick={() => { setSelectedDate(d); setDateDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-aba-neutral-100 transition-colors border-b border-aba-neutral-200 last:border-b-0 ${
                        selectedDate === d
                          ? 'font-semibold text-aba-primary-main bg-aba-primary-50/50'
                          : 'text-aba-neutral-900'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Time slot picker ── */}
          <div>
            <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
              Proposed Time
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`py-2.5 rounded-lg border-2 text-xs font-medium transition-all ${
                    selectedTime === t
                      ? 'border-aba-primary-main bg-aba-primary-50 text-aba-primary-main'
                      : 'border-aba-neutral-200 bg-aba-neutral-0 text-aba-neutral-900 hover:bg-aba-neutral-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* ── Reason / note ── */}
          <div>
            <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
              <span className="inline-flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-aba-neutral-600" />
                Reason for change
              </span>
              <span className="text-aba-neutral-400 ml-1">(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Provider unavailable at original time, double-booked slot…"
              rows={3}
              className="w-full px-4 py-3 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-sm text-aba-neutral-900 placeholder:text-aba-neutral-600 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main/30 focus:border-aba-secondary-main transition-all resize-none"
            />
          </div>

          {/* ── Submit ── */}
          <div className="pt-2">
            <ABAButton
              variant="primary"
              size="lg"
              fullWidth
              disabled={!canSubmit}
              isLoading={sending}
              onClick={handleSend}
            >
              <Send className="w-5 h-5" />
              Send Proposal
            </ABAButton>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline"
          >
            Cancel
          </button>

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
