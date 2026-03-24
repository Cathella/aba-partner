import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { ChevronLeft, UserX, AlertCircle } from 'lucide-react';

const cancellationReasons = [
  'Patient requested cancellation',
  'Staff unavailable',
  'Facility closed',
  'Emergency situation',
  'Patient no-show',
  'Duplicate booking',
  'Other',
];

const mockBookings: Record<
  string,
  { patientName: string; service: string; date: string; time: string }
> = {
  '1': {
    patientName: 'Sarah Johnson',
    service: 'Speech Therapy',
    date: '2026-02-11',
    time: '09:00 AM',
  },
  '2': {
    patientName: 'Michael Smith',
    service: 'Occupational Therapy',
    date: '2026-02-11',
    time: '10:30 AM',
  },
  '3': {
    patientName: 'Emma Davis',
    service: 'Behavioral Assessment',
    date: '2026-02-11',
    time: '11:00 AM',
  },
  '4': {
    patientName: 'Olivia Brown',
    service: 'Parent Consultation',
    date: '2026-02-11',
    time: '02:00 PM',
  },
};

export function CancelBooking() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedReason, setSelectedReason] = useState('');
  const [notes, setNotes] = useState('');
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const booking = bookingId ? mockBookings[bookingId] : null;

  if (!booking) {
    return (
      <div className="flex flex-col h-screen bg-aba-bg-primary">
        <AppTopBar
          title="Cancel Booking"
          leftAction={
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-aba-neutral-900" />
            </button>
          }
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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedReason) {
      newErrors.reason = 'Please select a cancellation reason';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancelBooking = () => {
    if (validateForm()) {
      showToast(`Booking for ${booking.patientName} cancelled`, 'success');
      setTimeout(() => {
        navigate('/bookings-list');
      }, 500);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Cancel Booking"
        leftAction={
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-aba-neutral-900" />
          </button>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-aba-error-50 flex items-center justify-center">
              <UserX className="w-8 h-8 text-aba-error-main" />
            </div>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-aba-neutral-900 mb-1">
              Cancel Booking
            </h2>
            <p className="text-sm text-aba-neutral-600">
              Please provide a reason for cancellation
            </p>
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <h3 className="text-sm font-semibold text-aba-neutral-900 mb-3">
              Booking Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-aba-neutral-600">Patient:</span>
                <span className="font-medium text-aba-neutral-900">
                  {booking.patientName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-aba-neutral-600">Service:</span>
                <span className="font-medium text-aba-neutral-900">
                  {booking.service}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-aba-neutral-600">Date:</span>
                <span className="font-medium text-aba-neutral-900">
                  {formatDate(booking.date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-aba-neutral-600">Time:</span>
                <span className="font-medium text-aba-neutral-900">
                  {booking.time}
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Form */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4 space-y-4">
            {/* Reason Dropdown */}
            <div>
              <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                Cancellation Reason *
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowReasonDropdown(!showReasonDropdown)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors text-left ${
                    errors.reason
                      ? 'border-aba-error-main bg-aba-error-50'
                      : 'border-aba-neutral-200 bg-white hover:border-aba-neutral-300'
                  }`}
                >
                  <span
                    className={
                      selectedReason
                        ? 'text-aba-neutral-900'
                        : 'text-aba-neutral-500'
                    }
                  >
                    {selectedReason || 'Select reason'}
                  </span>
                </button>
                {errors.reason && (
                  <p className="text-xs text-aba-error-main mt-1">
                    {errors.reason}
                  </p>
                )}

                {/* Dropdown Menu */}
                {showReasonDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-aba-neutral-200 shadow-lg z-10 max-h-60 overflow-y-auto">
                    {cancellationReasons.map((reason, index) => (
                      <button
                        key={reason}
                        onClick={() => {
                          setSelectedReason(reason);
                          setShowReasonDropdown(false);
                          if (errors.reason) {
                            setErrors({ ...errors, reason: '' });
                          }
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          selectedReason === reason
                            ? 'bg-aba-primary-50 text-aba-primary-main font-medium'
                            : 'text-aba-neutral-900 hover:bg-aba-neutral-50'
                        } ${index === 0 ? 'rounded-t-xl' : ''} ${
                          index === cancellationReasons.length - 1
                            ? 'rounded-b-xl'
                            : ''
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                placeholder="Add any additional information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-aba-neutral-900 placeholder:text-aba-neutral-600 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Warning Box */}
          <div className="bg-aba-error-50 border border-aba-error-200 rounded-xl p-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-aba-error-main mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-aba-neutral-900 mb-1">
                Important
              </p>
              <ul className="text-xs text-aba-neutral-700 space-y-1">
                <li>• The patient will be notified of the cancellation</li>
                <li>• This action cannot be undone</li>
                <li>• Cancellation will be logged for audit purposes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Cancel Button */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-aba-bg-primary border-t border-aba-neutral-200">
        <ABAButton
          variant="destructive"
          size="lg"
          fullWidth
          onClick={handleCancelBooking}
        >
          <UserX className="w-5 h-5" />
          Cancel Booking
        </ABAButton>
      </div>
    </div>
  );
}