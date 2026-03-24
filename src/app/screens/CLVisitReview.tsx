/**
 * CL-19 Visit Review & Sign-off — Summary of SOAP + orders + prescriptions.
 * Confirm modal: "Complete visit?" → on confirm → CL-20 Visit Completed.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { CLStatusChip } from '../components/aba/CLStatusChip';
import { ABAButton } from '../components/aba/ABAButton';
import { CLConfirmModal } from '../components/aba/CLConfirmModal';
import {
  useClinicianStore,
  completeVisitFull,
} from '../data/clinicianStore';
import {
  FileText,
  Stethoscope,
  ClipboardCheck,
  Calendar,
  FlaskConical,
  Pill,
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  HeartPulse,
  Activity,
} from 'lucide-react';

export function CLVisitReview() {
  const navigate = useNavigate();
  const { visitId } = useParams<{ visitId: string }>();
  const { getVisitById, getVisitOrders } = useClinicianStore();

  const visit = getVisitById(visitId || '');
  const [showConfirm, setShowConfirm] = useState(false);

  if (!visit) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Visit Review" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-aba-neutral-600">Visit not found</p>
        </div>
      </div>
    );
  }

  const orders = getVisitOrders(visit.id);

  // Warnings: e.g. empty SOAP sections
  const warnings: string[] = [];
  if (!visit.soap.subjective.trim()) warnings.push('Subjective notes empty');
  if (!visit.soap.objective.trim()) warnings.push('Objective notes empty');
  if (!visit.soap.assessment.trim() && visit.diagnoses.length === 0) warnings.push('No assessment or diagnosis');
  if (!visit.soap.plan.trim() && !visit.followUpNote) warnings.push('No plan documented');

  const handleConfirmComplete = () => {
    const diagSummary = visit.diagnoses.map((d) => d.name).join(', ') || visit.soap.assessment;
    completeVisitFull(visit.id, {
      diagnosisSummary: diagSummary,
      followUp: visit.followUpNote,
    });
    setShowConfirm(false);
    navigate(`/cl/completed/${visit.id}`, { replace: true });
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Visit Review" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-4">
          {/* ── Patient + Status ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                <span className="text-base font-semibold text-aba-secondary-main">
                  {visit.patientName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-aba-neutral-900">{visit.patientName}</p>
                <p className="text-sm text-aba-neutral-600">
                  {visit.age} yrs &middot; {visit.gender} &middot; {visit.service}
                </p>
              </div>
              <CLStatusChip status={visit.status} />
            </div>
          </div>

          {/* ── Warnings ── */}
          {warnings.length > 0 && (
            <div className="bg-aba-warning-50 rounded-2xl border border-aba-warning-main/15 p-4">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-aba-warning-main flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-aba-neutral-900 uppercase tracking-wide mb-1.5">
                    Incomplete Documentation
                  </p>
                  <ul className="space-y-1">
                    {warnings.map((w, i) => (
                      <li key={i} className="text-sm text-aba-neutral-700 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-aba-warning-main flex-shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ── Vitals Summary ── */}
          {visit.vitals && (
            <ReviewSection title="Vitals" icon={<Thermometer className="w-4 h-4" />}>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {visit.vitals.temperature && <VitalItem label="Temp" value={`${visit.vitals.temperature}°C`} />}
                {visit.vitals.bloodPressure && <VitalItem label="BP" value={visit.vitals.bloodPressure} />}
                {visit.vitals.pulse && <VitalItem label="Pulse" value={`${visit.vitals.pulse} bpm`} />}
                {visit.vitals.spo2 && <VitalItem label="SpO2" value={`${visit.vitals.spo2}%`} />}
                {visit.vitals.weight && <VitalItem label="Weight" value={`${visit.vitals.weight} kg`} />}
              </div>
            </ReviewSection>
          )}

          {/* ── SOAP Summary ── */}
          <ReviewSection title="Subjective" icon={<FileText className="w-4 h-4" />}>
            <SummaryText value={visit.chiefComplaint} label="Chief Complaint" />
            <SummaryText value={visit.soap.subjective || visit.historyNotes} label="History" />
            {visit.allergies && <SummaryText value={visit.allergies} label="Allergies" />}
          </ReviewSection>

          <ReviewSection title="Objective" icon={<Stethoscope className="w-4 h-4" />}>
            <SummaryText value={visit.soap.objective} />
          </ReviewSection>

          <ReviewSection title="Assessment" icon={<ClipboardCheck className="w-4 h-4" />}>
            {visit.diagnoses.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-semibold text-aba-neutral-500 uppercase tracking-wide mb-1.5">Diagnoses</p>
                <div className="flex flex-wrap gap-1.5">
                  {visit.diagnoses.map((d) => (
                    <span
                      key={d.code}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-aba-secondary-50 text-xs text-aba-neutral-900 border border-aba-secondary-main/15"
                    >
                      <span className="font-bold text-aba-secondary-main">{d.code}</span>
                      {d.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <SummaryText value={visit.soap.assessment} label="Notes" />
          </ReviewSection>

          <ReviewSection title="Plan" icon={<Calendar className="w-4 h-4" />}>
            <SummaryText value={visit.soap.plan || visit.followUpNote} />
          </ReviewSection>

          {/* ── Orders ── */}
          {orders.labs.length > 0 && (
            <ReviewSection title={`Lab Orders (${orders.labs.length})`} icon={<FlaskConical className="w-4 h-4 text-[#F59E0B]" />}>
              <ul className="space-y-1.5">
                {orders.labs.map((lab) => (
                  <li key={lab.id} className="flex items-center gap-2 text-sm text-aba-neutral-900">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] flex-shrink-0" />
                    {lab.testName}
                    <span className="text-xs text-aba-neutral-500">({lab.urgency})</span>
                  </li>
                ))}
              </ul>
            </ReviewSection>
          )}

          {orders.prescriptions.length > 0 && (
            <ReviewSection title={`Prescriptions (${orders.prescriptions.length})`} icon={<Pill className="w-4 h-4 text-[#8B5CF6]" />}>
              <ul className="space-y-1.5">
                {orders.prescriptions.map((rx) => (
                  <li key={rx.id} className="flex items-center gap-2 text-sm text-aba-neutral-900">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] flex-shrink-0" />
                    {rx.medication} — {rx.dosage}
                    <span className="text-xs text-aba-neutral-500">({rx.frequency})</span>
                  </li>
                ))}
              </ul>
            </ReviewSection>
          )}
        </div>
      </div>

      {/* ── Sticky Bottom ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-aba-neutral-0 border-t border-aba-neutral-200 z-30">
        <div className="flex gap-3 max-w-[390px] mx-auto p-4">
          <ABAButton variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            Edit Notes
          </ABAButton>
          <ABAButton variant="primary" className="flex-1" onClick={() => setShowConfirm(true)}>
            <CheckCircle2 className="w-4 h-4" />
            Sign Off
          </ABAButton>
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      <CLConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        icon={<CheckCircle2 className="w-7 h-7 text-aba-success-main" />}
        iconBg="bg-aba-success-50"
        title="Complete Visit?"
        description={`You are about to mark ${visit.patientName}'s visit as complete. This will finalize the documentation.`}
        confirmText="Complete Visit"
        cancelText="Go Back"
        onConfirm={handleConfirmComplete}
      />
    </div>
  );
}

/* ── Helpers ── */

function ReviewSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-aba-neutral-600">{icon}</span>
        <h4 className="text-sm font-semibold text-aba-neutral-900">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function SummaryText({ value, label }: { value?: string; label?: string }) {
  if (!value) return null;
  return (
    <div className="mb-2 last:mb-0">
      {label && (
        <p className="text-[10px] font-semibold text-aba-neutral-500 uppercase tracking-wide mb-0.5">{label}</p>
      )}
      <p className="text-sm text-aba-neutral-900 whitespace-pre-wrap leading-relaxed">{value}</p>
    </div>
  );
}

function VitalItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] font-medium text-aba-neutral-500 uppercase">{label}: </span>
      <span className="text-sm font-semibold text-aba-neutral-900">{value}</span>
    </div>
  );
}
