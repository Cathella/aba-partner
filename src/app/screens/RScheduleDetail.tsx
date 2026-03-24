/**
 * R-20b Schedule Item Detail — Shows patient + appointment info with
 * status-appropriate actions (Mark Arrived, Check In, View in Queue).
 * Check-in flow mirrors the inline modals from RSchedule (R-25, R-26).
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { StatusChip, type VisitStatus } from '../components/aba/StatusChip';
import { ABAButton } from '../components/aba/ABAButton';
import { ABABadge } from '../components/aba/ABABadge';
import { showToast } from '../components/aba/Toast';
import {
  useScheduleStore,
  isNotArrived,
  isArrived,
  isCheckedIn,
  isDone,
  isInQueue,
  arrivalLabel,
  staffChoices,
  roomChoices,
  type ScheduleItem,
} from '../data/scheduleStore';
import {
  User,
  Phone,
  Stethoscope,
  Clock,
  Calendar,
  DoorOpen,
  UserCheck,
  Users,
  CheckCircle,
  ChevronDown,
  ClipboardCheck,
  ArrowRight,
  X,
} from 'lucide-react';

export function RScheduleDetail() {
  const navigate = useNavigate();
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const { getItemById, markArrived, checkInPatient, items } = useScheduleStore();

  const [item, setItem] = useState<ScheduleItem | undefined>(undefined);

  /* Keep item in sync with store */
  useEffect(() => {
    if (scheduleId) setItem(getItemById(scheduleId));
  }, [scheduleId, items, getItemById]);

  /* ── Check-in modal state ── */
  type ModalStep = null | 'confirm' | 'assign';
  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const [staffValue, setStaffValue] = useState('');
  const [roomValue, setRoomValue] = useState('');
  const [staffOpen, setStaffOpen] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Not found ── */
  if (!item) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Schedule Detail" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <p className="text-lg font-semibold text-aba-neutral-900 mb-2">Patient not found</p>
            <p className="text-sm text-aba-neutral-600 mb-4">
              This schedule entry may have been removed.
            </p>
            <ABAButton variant="primary" size="md" onClick={() => navigate('/r/schedule')}>
              Back to Schedule
            </ABAButton>
          </div>
        </div>
      </div>
    );
  }

  /* ── Status flags ── */
  const showMarkArrived = isNotArrived(item.status);
  const showCheckIn = isArrived(item.status);
  const showViewQueue = isInQueue(item.status);
  const showDone = isDone(item.status);

  /* ── Modal helpers ── */
  const openCheckIn = () => {
    setStaffValue('');
    setRoomValue('');
    setStaffOpen(false);
    setRoomOpen(false);
    setModalStep('confirm');
  };

  const closeModal = () => {
    setModalStep(null);
    setIsSubmitting(false);
  };

  const handleQuickCheckIn = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      checkInPatient(item.id);
      showToast(`${item.patient} checked in — added to Queue`, 'success');
      closeModal();
    }, 500);
  };

  const goToAssignStep = () => {
    setStaffValue(item.provider ?? '');
    setRoomValue(item.room ?? '');
    setModalStep('assign');
  };

  const handleAssignCheckIn = () => {
    setIsSubmitting(true);
    const staffLabel =
      staffChoices.find((s) => s.id === staffValue)?.label ?? staffValue ?? item.provider;
    setTimeout(() => {
      checkInPatient(item.id, { staff: staffLabel, room: roomValue });
      showToast(`${item.patient} checked in → ${roomValue || 'auto-room'}`, 'success');
      closeModal();
    }, 500);
  };

  const handleMarkArrived = () => {
    markArrived(item.id);
    showToast(`${item.patient} marked as Arrived`, 'success');
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Schedule Detail" showBack onBackClick={() => navigate('/r/schedule')} />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* ── Patient header card ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-aba-secondary-main" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-aba-neutral-900">{item.patient}</h2>
                  <p className="text-xs text-aba-neutral-600">{item.phone}</p>
                </div>
              </div>
              <StatusChip status={item.status} size="md" />
            </div>

            {/* Type badge */}
            {item.type === 'walk-in' && (
              <div className="mb-3">
                <ABABadge variant="success" size="sm">
                  Walk-in
                </ABABadge>
              </div>
            )}

            {/* Quick contact */}
            <a
              href={`tel:${item.phone}`}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-aba-neutral-200 text-xs font-medium text-aba-neutral-900 hover:bg-aba-neutral-100 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              {item.phone}
            </a>
          </div>

          {/* ── Appointment details card ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
            <div className="px-4 py-3 bg-aba-neutral-100/50 border-b border-aba-neutral-200">
              <h4 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">
                Appointment Details
              </h4>
            </div>
            <div className="p-4 space-y-3">
              <InfoRow
                icon={<Clock className="w-4 h-4" />}
                label="Scheduled Time"
                value={item.time}
              />
              <InfoRow
                icon={<Stethoscope className="w-4 h-4" />}
                label="Service"
                value={item.service}
              />
              <InfoRow
                icon={<User className="w-4 h-4" />}
                label="Provider"
                value={item.provider}
              />
              {item.room && (
                <InfoRow
                  icon={<DoorOpen className="w-4 h-4" />}
                  label="Room"
                  value={item.room}
                />
              )}
              {item.assignedStaff && item.assignedStaff !== item.provider && (
                <InfoRow
                  icon={<Users className="w-4 h-4" />}
                  label="Assigned Staff"
                  value={item.assignedStaff}
                />
              )}
              {item.checkedInAt && (
                <InfoRow
                  icon={<UserCheck className="w-4 h-4" />}
                  label="Checked In At"
                  value={item.checkedInAt}
                />
              )}
              {item.ticket && (
                <InfoRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Ticket"
                  value={item.ticket}
                />
              )}
            </div>
          </div>

          {/* ── Arrival status banner ── */}
          {showMarkArrived && (
            <div className="bg-aba-warning-50 rounded-2xl border border-aba-warning-main/20 p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-aba-warning-main flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-aba-neutral-900">Not yet arrived</p>
                <p className="text-xs text-aba-neutral-600">
                  Mark this patient as arrived when they get to the facility.
                </p>
              </div>
            </div>
          )}

          {showCheckIn && (
            <div className="bg-aba-primary-50 rounded-2xl border border-aba-primary-main/20 p-4 flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-aba-primary-main flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-aba-neutral-900">Patient has arrived</p>
                <p className="text-xs text-aba-neutral-600">
                  Check them in to add to the waiting queue.
                </p>
              </div>
            </div>
          )}

          {showDone && (
            <div className="bg-aba-neutral-100 rounded-2xl border border-aba-neutral-200 p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-aba-neutral-400 flex-shrink-0" />
              <p className="text-sm text-aba-neutral-600">
                This visit has been {item.status === 'completed' ? 'completed' : 'marked as no-show'}.
              </p>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="space-y-3 pt-1">
            {showMarkArrived && (
              <ABAButton variant="primary" size="lg" fullWidth onClick={handleMarkArrived}>
                <UserCheck className="w-5 h-5" />
                Mark Arrived
              </ABAButton>
            )}

            {showCheckIn && (
              <ABAButton variant="primary" size="lg" fullWidth onClick={openCheckIn}>
                <ClipboardCheck className="w-5 h-5" />
                Check In Patient
              </ABAButton>
            )}

            {showViewQueue && (
              <ABAButton
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate(`/r/queue/${item.id}`)}
              >
                <ArrowRight className="w-5 h-5" />
                View in Queue
              </ABAButton>
            )}
          </div>

          <div className="h-4" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
           R-25 Check-in Confirm Modal
         ═══════════════════════════════════════════════════════ */}
      {modalStep === 'confirm' && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-aba-neutral-0 rounded-t-3xl sm:rounded-3xl w-full max-w-[390px] p-6 animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardCheck className="w-5 h-5 text-aba-primary-main" />
                  <h3 className="text-lg font-semibold text-aba-neutral-900">Confirm Check-in</h3>
                </div>
                <p className="text-sm text-aba-neutral-600">
                  Mark this patient as checked in and add them to the waiting queue.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1 -mt-1 -mr-1 rounded-lg hover:bg-aba-neutral-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-aba-neutral-600" />
              </button>
            </div>

            {/* Patient summary */}
            <div className="bg-aba-neutral-100 rounded-xl p-4 mb-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-aba-secondary-main" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-aba-neutral-900">{item.patient}</p>
                  <p className="text-xs text-aba-neutral-600">{item.phone}</p>
                </div>
                <StatusChip status={item.status} />
              </div>
              <div className="flex items-center gap-4 pt-1.5 border-t border-aba-neutral-200 text-xs text-aba-neutral-700">
                <span>
                  <span className="font-medium">Time:</span> {item.time}
                </span>
                <span>
                  <span className="font-medium">Service:</span> {item.service}
                </span>
              </div>
              <div className="text-xs text-aba-neutral-700">
                <span className="font-medium">Provider:</span> {item.provider}
              </div>
            </div>

            {/* Info note */}
            <div className="bg-aba-success-50/50 rounded-lg p-3 mb-6 border border-aba-success-main/10">
              <p className="text-xs text-aba-neutral-700 leading-relaxed">
                <span className="font-semibold">What happens:</span> The patient will be moved to
                <span className="font-semibold text-aba-success-main"> Waiting</span> status in the
                live queue.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <ABAButton
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleQuickCheckIn}
                isLoading={isSubmitting}
              >
                <CheckCircle className="w-5 h-5" />
                Check In Now
              </ABAButton>

              <ABAButton
                variant="outline"
                size="lg"
                fullWidth
                onClick={goToAssignStep}
                disabled={isSubmitting}
              >
                <Users className="w-5 h-5" />
                Assign Staff / Room First
              </ABAButton>

              <button
                onClick={closeModal}
                className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
           R-26 Assign Staff / Room Modal
         ═══════════════════════════════════════════════════════ */}
      {modalStep === 'assign' && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-aba-neutral-0 rounded-t-3xl sm:rounded-3xl w-full max-w-[390px] p-6 animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-aba-secondary-main" />
                  <h3 className="text-lg font-semibold text-aba-neutral-900">
                    Assign Staff & Room
                  </h3>
                </div>
                <p className="text-sm text-aba-neutral-600">
                  Optionally assign a staff member and room before checking in{' '}
                  <span className="font-medium">{item.patient}</span>.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1 -mt-1 -mr-1 rounded-lg hover:bg-aba-neutral-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-aba-neutral-600" />
              </button>
            </div>

            {/* ── Staff dropdown ── */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-aba-neutral-600" />
                  Assign Staff
                </span>
              </label>
              <div className="relative">
                <button
                  onClick={() => {
                    setStaffOpen(!staffOpen);
                    setRoomOpen(false);
                  }}
                  className="w-full flex items-center justify-between h-12 px-4 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-sm hover:border-aba-neutral-600 transition-colors"
                >
                  <span className={staffValue ? 'text-aba-neutral-900' : 'text-aba-neutral-600'}>
                    {staffChoices.find((s) => s.id === staffValue)?.label || item.provider}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-aba-neutral-600 transition-transform ${staffOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {staffOpen && (
                  <div className="absolute z-20 top-[calc(100%+4px)] left-0 right-0 bg-aba-neutral-0 border border-aba-neutral-200 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                    {staffChoices.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setStaffValue(s.id);
                          setStaffOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-aba-neutral-100 transition-colors border-b border-aba-neutral-200 last:border-b-0 ${
                          staffValue === s.id
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

            {/* ── Room dropdown ── */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <DoorOpen className="w-4 h-4 text-aba-neutral-600" />
                  Room / Area
                </span>
              </label>
              <div className="relative">
                <button
                  onClick={() => {
                    setRoomOpen(!roomOpen);
                    setStaffOpen(false);
                  }}
                  className="w-full flex items-center justify-between h-12 px-4 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-sm hover:border-aba-neutral-600 transition-colors"
                >
                  <span className={roomValue ? 'text-aba-neutral-900' : 'text-aba-neutral-600'}>
                    {roomValue || 'Select a room (optional)'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-aba-neutral-600 transition-transform ${roomOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {roomOpen && (
                  <div className="absolute z-20 top-[calc(100%+4px)] left-0 right-0 bg-aba-neutral-0 border border-aba-neutral-200 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                    {roomChoices.map((r) => (
                      <button
                        key={r || '__none__'}
                        onClick={() => {
                          setRoomValue(r);
                          setRoomOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-aba-neutral-100 transition-colors border-b border-aba-neutral-200 last:border-b-0 ${
                          roomValue === r
                            ? 'font-semibold text-aba-primary-main bg-aba-primary-50/50'
                            : 'text-aba-neutral-900'
                        }`}
                      >
                        {r || 'No room (auto-assign)'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <ABAButton
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleAssignCheckIn}
                isLoading={isSubmitting}
              >
                <CheckCircle className="w-5 h-5" />
                Confirm & Check In
              </ABAButton>

              <ABAButton
                variant="text"
                size="md"
                fullWidth
                onClick={() => setModalStep('confirm')}
                disabled={isSubmitting}
              >
                Back
              </ABAButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Info row helper ── */
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-aba-neutral-400 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-aba-neutral-600">{label}</span>
        <p className="text-sm text-aba-neutral-900 truncate">{value}</p>
      </div>
    </div>
  );
}
