/**
 * CL-09 Patient Profile — Clinician's read-only view of a patient profile.
 * Shows demographics, visit history, quick link to start consult.
 */
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ListCard } from '../components/aba/Cards';
import { usePatientsStore } from '../data/patientsStore';
import { useClinicianStore } from '../data/clinicianStore';
import type { TransferLogEntry } from '../data/clinicianStore';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Activity,
  CreditCard,
  ArrowRightLeft,
  UserCog,
  Clock,
} from 'lucide-react';

export function CLPatientProfile() {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const { getPatientById } = usePatientsStore();
  const { getTransferLogByPatient } = useClinicianStore();

  const patient = getPatientById(patientId || '');
  const transferLog = getTransferLogByPatient(patientId || '');

  if (!patient) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Patient Profile" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-aba-neutral-600">Patient not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Patient Profile" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Profile Header */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-semibold text-aba-secondary-main">
                  {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-aba-neutral-900">{patient.name}</h2>
                  {patient.isMember && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-aba-primary-main bg-aba-primary-50 px-2 py-0.5 rounded-full">
                      <Shield className="w-3 h-3" />
                      MEMBER
                    </span>
                  )}
                </div>
                <p className="text-sm text-aba-neutral-600 mt-0.5">
                  {patient.age} yrs &middot; {patient.gender}
                  {patient.memberId && ` &middot; ${patient.memberId}`}
                </p>
              </div>
            </div>

            {/* Contact details */}
            <div className="mt-4 pt-4 border-t border-aba-neutral-200 space-y-2.5">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-aba-neutral-600 flex-shrink-0" />
                <span className="text-aba-neutral-700">{patient.phone}</span>
              </div>
              {patient.address && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-aba-neutral-600 flex-shrink-0" />
                  <span className="text-aba-neutral-700">{patient.address}</span>
                </div>
              )}
              {patient.dob && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-aba-neutral-600 flex-shrink-0" />
                  <span className="text-aba-neutral-700">Born {patient.dob}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-aba-neutral-600 flex-shrink-0" />
                <span className="text-aba-neutral-700">
                  Registered {patient.registeredAt}
                  {patient.lastVisit && ` &middot; Last visit ${patient.lastVisit}`}
                </span>
              </div>
            </div>

            {/* Next of Kin */}
            {patient.nextOfKin && (
              <div className="mt-3 pt-3 border-t border-aba-neutral-200">
                <p className="text-xs font-medium text-aba-neutral-600 mb-1 uppercase tracking-wide">
                  Next of Kin
                </p>
                <p className="text-sm text-aba-neutral-900">
                  {patient.nextOfKin}
                  {patient.nextOfKinPhone && ` — ${patient.nextOfKinPhone}`}
                </p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          {patient.recentActivity.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
                Recent Activity
              </h3>
              <ListCard>
                {patient.recentActivity.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-aba-neutral-200 last:border-b-0"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        act.type === 'visit' ? 'bg-aba-secondary-50' : 'bg-aba-primary-50'
                      }`}
                    >
                      {act.type === 'visit' ? (
                        <Activity className="w-4 h-4 text-aba-secondary-main" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-aba-primary-main" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-aba-neutral-900 truncate">{act.description}</p>
                      <p className="text-xs text-aba-neutral-600">{act.date} &middot; {act.status}</p>
                    </div>
                  </div>
                ))}
              </ListCard>
            </div>
          )}

          {/* Transfer & Referral History (audit trail) */}
          {transferLog.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
                Transfer & Referral History
              </h3>
              <ListCard>
                {transferLog.map((entry) => {
                  const isTransfer = entry.type === 'transfer';
                  const isReassign = entry.type === 'reassign';
                  const destLabel = isReassign
                    ? entry.destination === 'dr-ssekandi'
                      ? 'Dr. Ssekandi'
                      : entry.destination === 'dr-nambi'
                      ? 'Dr. Nambi'
                      : entry.destination
                    : entry.destination.charAt(0).toUpperCase() + entry.destination.slice(1);

                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 px-4 py-3 border-b border-aba-neutral-200 last:border-b-0"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isReassign ? 'bg-[#F5F3FF]' : 'bg-aba-secondary-50'
                        }`}
                      >
                        {isReassign ? (
                          <UserCog className="w-4 h-4 text-[#8B5CF6]" />
                        ) : (
                          <ArrowRightLeft className="w-4 h-4 text-aba-secondary-main" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-aba-neutral-900">
                          {isReassign
                            ? `Reassigned to ${destLabel}`
                            : `Transferred to ${destLabel}`}
                        </p>
                        {entry.notes && (
                          <p className="text-xs text-aba-neutral-600 mt-0.5 truncate">
                            {entry.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="w-3 h-3 text-aba-neutral-500" />
                          <span className="text-[10px] text-aba-neutral-500">
                            {entry.timestamp} &middot; by {entry.performedBy === 'dr-ssekandi' ? 'Dr. Ssekandi' : entry.performedBy}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </ListCard>
            </div>
          )}

          {/* Dependents */}
          {patient.dependents.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
                Dependents
              </h3>
              <ListCard>
                {patient.dependents.map((dep) => (
                  <div
                    key={dep.id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-aba-neutral-200 last:border-b-0"
                  >
                    <div className="w-9 h-9 rounded-full bg-aba-neutral-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-aba-neutral-700">
                        {dep.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-aba-neutral-900 truncate">{dep.name}</p>
                      <p className="text-xs text-aba-neutral-600">
                        {dep.relationship} &middot; {dep.age} yrs &middot; {dep.gender}
                      </p>
                    </div>
                  </div>
                ))}
              </ListCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}