/**
 * CL-11 Order Submitted — Success screen after lab order submission.
 * Shows confirmation message and CTA to view orders.
 */
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ABAButton } from '../components/aba/ABAButton';
import { useClinicianStore } from '../data/clinicianStore';
import { CheckCircle2, FlaskConical, ArrowRight, Stethoscope } from 'lucide-react';

export function CLOrderSubmitted() {
  const navigate = useNavigate();
  const { visitId } = useParams<{ visitId: string }>();
  const [searchParams] = useSearchParams();
  const { getVisitById } = useClinicianStore();

  const visit = getVisitById(visitId || '');
  const count = parseInt(searchParams.get('count') || '1', 10);

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-aba-success-50 flex items-center justify-center mb-5">
          <CheckCircle2 className="w-10 h-10 text-aba-success-main" />
        </div>

        <h1 className="text-[22px] font-semibold text-aba-neutral-900 text-center">
          Order Submitted
        </h1>
        <p className="text-sm text-aba-neutral-600 mt-2 text-center max-w-[280px]">
          {count} lab {count > 1 ? 'tests have' : 'test has'} been successfully ordered
          {visit ? ` for ${visit.patientName}` : ''}.
        </p>

        {/* Order summary card */}
        <div className="w-full mt-6 bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] flex items-center justify-center flex-shrink-0">
              <FlaskConical className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-aba-neutral-900">
                {count} Lab {count > 1 ? 'Tests' : 'Test'} Ordered
              </p>
              <p className="text-xs text-aba-neutral-600 mt-0.5">
                Status: Pending Collection
              </p>
            </div>
          </div>
          {visit && (
            <div className="mt-3 pt-3 border-t border-aba-neutral-200 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-semibold text-aba-secondary-main">
                  {visit.patientName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <p className="text-sm text-aba-neutral-700">
                {visit.patientName} &middot; {visit.ticket}
              </p>
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
            onClick={() => navigate('/cl/orders', { replace: true })}
          >
            View Orders
            <ArrowRight className="w-4 h-4" />
          </ABAButton>
          {visit && (
            <ABAButton
              variant="text"
              fullWidth
              onClick={() => navigate(`/cl/consult/${visit.id}`, { replace: true })}
            >
              <Stethoscope className="w-4 h-4" />
              Return to Consultation
            </ABAButton>
          )}
        </div>
      </div>
    </div>
  );
}
