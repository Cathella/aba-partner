/**
 * CL-20 Visit Completed — Success screen after visit sign-off.
 * Shows a success animation-like state, summary, and "Back to Queue" CTA.
 */
import { useNavigate, useParams } from 'react-router';
import { ABAButton } from '../components/aba/ABAButton';
import { useClinicianStore } from '../data/clinicianStore';
import {
  CheckCircle2,
  Calendar,
  FileText,
  FlaskConical,
  Pill,
  ArrowRight,
} from 'lucide-react';

export function CLVisitCompleted() {
  const navigate = useNavigate();
  const { visitId } = useParams<{ visitId: string }>();
  const { getVisitById, getVisitOrders } = useClinicianStore();

  const visit = getVisitById(visitId || '');

  if (!visit) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100 items-center justify-center p-6">
        <p className="text-sm text-aba-neutral-600">Visit not found</p>
        <ABAButton variant="primary" className="mt-4" onClick={() => navigate('/cl/queue')}>
          Back to Queue
        </ABAButton>
      </div>
    );
  }

  const orders = getVisitOrders(visit.id);

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center px-6 pt-16 pb-8">
          {/* Success icon */}
          <div className="w-20 h-20 rounded-full bg-aba-success-50 flex items-center justify-center mb-5">
            <CheckCircle2 className="w-10 h-10 text-aba-success-main" />
          </div>

          <h1 className="text-[22px] font-semibold text-aba-neutral-900 text-center">
            Visit Completed
          </h1>
          <p className="text-sm text-aba-neutral-600 mt-2 text-center max-w-[280px]">
            {visit.patientName}&apos;s consultation has been successfully documented and signed off.
          </p>

          {visit.completedAt && (
            <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aba-success-50 text-xs font-medium text-aba-success-main border border-aba-success-main/15">
              <CheckCircle2 className="w-3 h-3" />
              Completed at {visit.completedAt}
            </span>
          )}
        </div>

        {/* Summary card */}
        <div className="px-4 pb-6 space-y-3">
          {/* Diagnosis */}
          {(visit.diagnosisSummary || visit.diagnoses.length > 0) && (
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-aba-neutral-600" />
                <h4 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">Diagnosis</h4>
              </div>
              {visit.diagnoses.length > 0 ? (
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
              ) : (
                <p className="text-sm text-aba-neutral-900">{visit.diagnosisSummary}</p>
              )}
            </div>
          )}

          {/* Orders summary */}
          {(orders.labs.length > 0 || orders.prescriptions.length > 0) && (
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">Orders</h4>
              </div>
              <div className="space-y-2">
                {orders.labs.map((lab) => (
                  <div key={lab.id} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#FFFBEB] flex items-center justify-center flex-shrink-0">
                      <FlaskConical className="w-3.5 h-3.5 text-[#F59E0B]" />
                    </div>
                    <p className="text-sm text-aba-neutral-900 flex-1">{lab.testName}</p>
                    <span className="text-xs text-aba-neutral-500">{lab.urgency}</span>
                  </div>
                ))}
                {orders.prescriptions.map((rx) => (
                  <div key={rx.id} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#F5F3FF] flex items-center justify-center flex-shrink-0">
                      <Pill className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    </div>
                    <p className="text-sm text-aba-neutral-900 flex-1">{rx.medication} — {rx.dosage}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up */}
          {visit.followUp && (
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-aba-neutral-600" />
                <h4 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">Follow-up</h4>
              </div>
              <p className="text-sm text-aba-neutral-900">{visit.followUp}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTAs */}
      <div className="bg-aba-neutral-0 border-t border-aba-neutral-200 p-4">
        <div className="max-w-[390px] mx-auto space-y-2.5">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => navigate('/cl/queue', { replace: true })}
          >
            Back to Queue
            <ArrowRight className="w-4 h-4" />
          </ABAButton>
          <ABAButton
            variant="text"
            fullWidth
            onClick={() => navigate(`/cl/consult/${visit.id}`, { replace: true })}
          >
            View Consultation Notes
          </ABAButton>
        </div>
      </div>
    </div>
  );
}
