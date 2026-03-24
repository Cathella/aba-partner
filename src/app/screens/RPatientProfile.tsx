/**
 * R-62 Patient Profile — Summary card, quick actions (Start Visit, Create Booking,
 * Collect Payment), secondary actions (Edit details, View dependents), recent activity.
 */
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABABadge } from '../components/aba/ABABadge';
import { ListCard } from '../components/aba/Cards';
import { RListRow } from '../components/aba/RListRow';
import { EmptyState } from '../components/aba/EmptyState';
import { showToast } from '../components/aba/Toast';
import { usePatientsStore } from '../data/patientsStore';
import { setMember, resetWalkInFlow } from '../data/walkInStore';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Play,
  CalendarPlus,
  Pencil,
  Users,
  Clock,
  Activity,
  Heart,
  AlertCircle,
} from 'lucide-react';

export function RPatientProfile() {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const { patients } = usePatientsStore();

  const patient = useMemo(
    () => patients.find((p) => p.id === patientId),
    [patients, patientId]
  );

  if (!patient) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar
          title="Patient"
          showBack
          onBackClick={() => navigate('/r/more/patients')}
        />
        <EmptyState
          icon={<AlertCircle className="w-8 h-8" />}
          title="Patient not found"
          message="The patient record could not be loaded."
          actionLabel="Back to Patients"
          onAction={() => navigate('/r/more/patients')}
        />
      </div>
    );
  }

  const initials = patient.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  /* ── Actions ── */
  const handleStartVisit = () => {
    // Seed walkInStore with this patient so the Visit Intake screen picks them up
    resetWalkInFlow();
    setMember({
      id: patient.memberId || patient.id,
      name: patient.name,
      phone: patient.phone,
      gender: patient.gender,
      age: patient.age,
      address: patient.address,
      isMember: patient.isMember,
      memberId: patient.memberId,
    });
    navigate('/r/walk-in/intake');
  };

  const handleCreateBooking = () => {
    showToast('Navigating to bookings...', 'success');
    navigate('/r/bookings');
  };

  const handleCollectPayment = () => {
    navigate('/r/payments');
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar
        title="Patient Profile"
        showBack
        onBackClick={() => navigate('/r/more/patients')}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* ── Summary card ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-aba-primary-50 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-aba-primary-main">
                  {initials}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-lg font-semibold text-aba-neutral-900">
                    {patient.name}
                  </h2>
                  <ABABadge
                    variant={patient.isMember ? 'success' : 'neutral'}
                    size="sm"
                  >
                    {patient.isMember ? 'Member' : 'Non-member'}
                  </ABABadge>
                </div>
                {patient.memberId && (
                  <p className="text-xs text-aba-secondary-main font-medium mb-1">
                    {patient.memberId}
                  </p>
                )}
              </div>
            </div>

            {/* Details rows */}
            <div className="space-y-0">
              <DetailRow
                icon={<Phone className="w-4 h-4" />}
                label="Phone"
                value={patient.phone}
              />
              <DetailRow
                icon={<User className="w-4 h-4" />}
                label="Gender / Age"
                value={`${patient.gender}, ${patient.age} yrs`}
              />
              <DetailRow
                icon={<MapPin className="w-4 h-4" />}
                label="Address"
                value={patient.address}
              />
              {patient.nextOfKin && (
                <DetailRow
                  icon={<Heart className="w-4 h-4" />}
                  label="Next of Kin"
                  value={`${patient.nextOfKin}${patient.nextOfKinPhone ? ` (${patient.nextOfKinPhone})` : ''}`}
                />
              )}
              <DetailRow
                icon={<Calendar className="w-4 h-4" />}
                label="Registered"
                value={patient.registeredAt}
              />
              {patient.lastVisit && (
                <DetailRow
                  icon={<Clock className="w-4 h-4" />}
                  label="Last Visit"
                  value={patient.lastVisit}
                />
              )}
            </div>
          </div>

          {/* ── Quick actions ── */}
          <div>
            <h4 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide mb-2 px-1">
              Quick Actions
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <ActionCard
                icon={<Play className="w-5 h-5 text-aba-primary-main" />}
                bg="bg-aba-primary-50"
                label="Start Visit"
                onClick={handleStartVisit}
              />
              <ActionCard
                icon={<CalendarPlus className="w-5 h-5 text-aba-secondary-main" />}
                bg="bg-aba-secondary-50"
                label="Booking"
                onClick={handleCreateBooking}
              />
              <ActionCard
                icon={<CreditCard className="w-5 h-5 text-aba-success-main" />}
                bg="bg-aba-success-50"
                label="Payment"
                onClick={handleCollectPayment}
              />
            </div>
          </div>

          {/* ── Secondary actions ── */}
          <div>
            <h4 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide mb-2 px-1">
              Manage
            </h4>
            <ListCard>
              <RListRow
                icon={<Pencil className="w-5 h-5 text-aba-neutral-700" />}
                title="Edit Details"
                subtitle="Update contact & demographic info"
                showChevron
                onClick={() =>
                  navigate(`/r/more/patients/${patient.id}/edit`)
                }
              />
              {patient.isMember && (
                <RListRow
                  icon={<Users className="w-5 h-5 text-aba-neutral-700" />}
                  title="View Dependents"
                  subtitle={
                    patient.dependents.length > 0
                      ? `${patient.dependents.length} dependent${patient.dependents.length !== 1 ? 's' : ''}`
                      : 'No dependents'
                  }
                  showChevron
                  onClick={() =>
                    navigate(`/r/more/patients/${patient.id}/dependents`)
                  }
                />
              )}
            </ListCard>
          </div>

          {/* ── Recent activity ── */}
          {patient.recentActivity.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide mb-2 px-1">
                Recent Activity
              </h4>
              <ListCard>
                {patient.recentActivity.slice(0, 3).map((act) => (
                  <RListRow
                    key={act.id}
                    icon={
                      act.type === 'visit' ? (
                        <Activity className="w-5 h-5 text-aba-secondary-main" />
                      ) : (
                        <CreditCard className="w-5 h-5 text-aba-success-main" />
                      )
                    }
                    title={act.description}
                    subtitle={act.date}
                    trailing={
                      <ABABadge
                        variant={
                          act.status === 'Completed' || act.status === 'Paid'
                            ? 'success'
                            : act.status === 'Pending'
                            ? 'warning'
                            : 'info'
                        }
                        size="sm"
                      >
                        {act.status}
                      </ABABadge>
                    }
                  />
                ))}
              </ListCard>
            </div>
          )}

          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}

/* ── Detail row sub-component ── */
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-aba-neutral-200 last:border-b-0">
      <div className="mt-0.5 text-aba-neutral-400">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-aba-neutral-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm text-aba-neutral-900">{value}</p>
      </div>
    </div>
  );
}

/* ── Action card sub-component ── */
function ActionCard({
  icon,
  bg,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}
      >
        {icon}
      </div>
      <span className="text-xs font-medium text-aba-neutral-900">{label}</span>
    </button>
  );
}