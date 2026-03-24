/**
 * R-64 Dependents — Member-only dependents list card with relationship + age.
 * CTA: "Start Visit for Dependent" → routes into Visit Intake.
 * Empty state if none.
 */
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { ABABadge } from '../components/aba/ABABadge';
import { ListCard } from '../components/aba/Cards';
import { EmptyState } from '../components/aba/EmptyState';
import { showToast } from '../components/aba/Toast';
import { usePatientsStore, type Dependent } from '../data/patientsStore';
import { setMember, resetWalkInFlow } from '../data/walkInStore';
import {
  Users,
  User,
  Play,
  AlertCircle,
  Baby,
  Heart,
} from 'lucide-react';

export function RDependents() {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const { patients } = usePatientsStore();

  const patient = useMemo(
    () => patients.find((p) => p.id === patientId),
    [patients, patientId]
  );

  const backPath = patient
    ? `/r/more/patients/${patient.id}`
    : '/r/more/patients';

  if (!patient) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar
          title="Dependents"
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

  const handleStartVisitForDependent = (dep: Dependent) => {
    resetWalkInFlow();
    setMember({
      id: `${patient.memberId || patient.id}-dep-${dep.id}`,
      name: dep.name,
      phone: patient.phone, // use parent phone
      gender: dep.gender,
      age: dep.age,
      address: patient.address,
      isMember: patient.isMember,
      memberId: patient.memberId,
    });
    showToast(`Starting visit for ${dep.name}`, 'success');
    navigate('/r/walk-in/intake');
  };

  const initials = patient.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar
        title="Dependents"
        showBack
        onBackClick={() => navigate(backPath)}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* ── Parent info card ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-aba-primary-50 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-aba-primary-main">
                {initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-aba-neutral-900">
                {patient.name}
              </p>
              <p className="text-xs text-aba-neutral-600">
                {patient.memberId && (
                  <span className="text-aba-secondary-main font-medium">
                    {patient.memberId} &bull;{' '}
                  </span>
                )}
                Primary account holder
              </p>
            </div>
            <ABABadge variant="success" size="sm">
              Member
            </ABABadge>
          </div>

          {/* ── Dependents ── */}
          {patient.dependents.length > 0 ? (
            <>
              <h4 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide px-1">
                {patient.dependents.length} Dependent
                {patient.dependents.length !== 1 ? 's' : ''}
              </h4>

              <div className="space-y-3">
                {patient.dependents.map((dep) => {
                  const depInitials = dep.name
                    .split(' ')
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase();

                  return (
                    <div
                      key={dep.id}
                      className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden"
                    >
                      <div className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-aba-secondary-main">
                            {depInitials}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-aba-neutral-900">
                            {dep.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs text-aba-neutral-600">
                              {dep.relationship}
                            </span>
                            <span className="text-xs text-aba-neutral-400">
                              &bull;
                            </span>
                            <span className="text-xs text-aba-neutral-600">
                              {dep.gender}, {dep.age} yrs
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Start Visit button */}
                      <div className="px-4 pb-4">
                        <ABAButton
                          variant="secondary"
                          size="sm"
                          fullWidth
                          onClick={() =>
                            handleStartVisitForDependent(dep)
                          }
                        >
                          <Play className="w-4 h-4" />
                          Start Visit for {dep.name.split(' ')[0]}
                        </ABAButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title="No dependents found"
              message={`${patient.name} has no registered dependents on this account.`}
            />
          )}

          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}
