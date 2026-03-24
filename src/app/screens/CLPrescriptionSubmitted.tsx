/**
 * CL-16 Prescription Submitted — Success screen after Rx submission.
 * Shows confirmation and CTA: Back to Consultation.
 */
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ABAButton } from '../components/aba/ABAButton';
import { useClinicianStore } from '../data/clinicianStore';
import { CheckCircle2, Pill, Stethoscope, ClipboardList } from 'lucide-react';

export function CLPrescriptionSubmitted() {
  const navigate = useNavigate();
  const { visitId } = useParams<{ visitId: string }>();
  const [searchParams] = useSearchParams();
  const { getVisitById, getVisitOrders } = useClinicianStore();

  const visit = getVisitById(visitId || '');
  const count = parseInt(searchParams.get('count') || '1', 10);
  const orders = visit ? getVisitOrders(visit.id) : null;

  // Get the most recent prescriptions for this visit
  const recentRx = orders?.prescriptions.slice(0, count) || [];

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Success icon */}
        <div className="relative w-20 h-20 rounded-full bg-[#F5F3FF] flex items-center justify-center mb-5">
          <Pill className="w-8 h-8 text-[#8B5CF6]" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-aba-success-main flex items-center justify-center border-2 border-aba-neutral-100">
            <CheckCircle2 className="w-4.5 h-4.5 text-white" />
          </div>
        </div>

        <h1 className="text-[22px] font-semibold text-aba-neutral-900 text-center">
          Sent to Pharmacy
        </h1>
        <p className="text-sm text-aba-neutral-600 mt-2 text-center max-w-[280px]">
          {count} prescription{count > 1 ? 's have' : ' has'} been submitted
          {visit ? ` for ${visit.patientName}` : ''}.
        </p>

        {/* Prescription summary card */}
        {recentRx.length > 0 && (
          <div className="w-full mt-6 bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-aba-neutral-200 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-aba-neutral-600" />
              <h3 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">
                Prescription Summary
              </h3>
            </div>
            {recentRx.map((rx) => (
              <div
                key={rx.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-aba-neutral-200 last:border-b-0"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] flex items-center justify-center flex-shrink-0">
                  <Pill className="w-3.5 h-3.5 text-[#8B5CF6]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-aba-neutral-900 truncate">
                    {rx.medication} — {rx.dosage}
                  </p>
                  <p className="text-xs text-aba-neutral-600 truncate">
                    {rx.frequency} &middot; {rx.duration}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#8B5CF6] border border-[#8B5CF6]/15 flex-shrink-0">
                  Sent
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTAs */}
      <div className="bg-aba-neutral-0 border-t border-aba-neutral-200 p-4">
        <div className="max-w-[390px] mx-auto space-y-2.5">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => navigate(`/cl/consult/${visitId}`, { replace: true })}
          >
            <Stethoscope className="w-5 h-5" />
            Back to Consultation
          </ABAButton>
          <ABAButton
            variant="text"
            fullWidth
            onClick={() => navigate('/cl/orders', { replace: true })}
          >
            View All Orders
          </ABAButton>
        </div>
      </div>
    </div>
  );
}
