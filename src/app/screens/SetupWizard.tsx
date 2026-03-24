import { useNavigate } from 'react-router';
import { ABAButton } from '../components/aba/ABAButton';
import { CheckCircle2, Rocket } from 'lucide-react';

export function SetupWizard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-aba-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[390px] bg-aba-neutral-0 rounded-3xl p-8 shadow-xl">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-aba-success-50 flex items-center justify-center relative">
            <CheckCircle2 className="w-16 h-16 text-aba-success-main" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-aba-neutral-900 mb-2">
            Account Activated!
          </h1>
          <p className="text-sm text-aba-neutral-600">
            Your clinic admin account is ready. Let's set up your clinic.
          </p>
        </div>

        {/* Features List */}
        <div className="bg-aba-primary-50 rounded-2xl p-6 mb-8 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-aba-primary-main flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-aba-neutral-900">
                Manage Bookings
              </p>
              <p className="text-xs text-aba-neutral-600 mt-0.5">
                Schedule and track client sessions
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-aba-primary-main flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-aba-neutral-900">
                Track Finances
              </p>
              <p className="text-xs text-aba-neutral-600 mt-0.5">
                Monitor revenue and expenses
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-aba-primary-main flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-aba-neutral-900">
                Generate Reports
              </p>
              <p className="text-xs text-aba-neutral-600 mt-0.5">
                Insights and analytics at your fingertips
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <ABAButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate('/setup-wizard-flow')}
          >
            <Rocket className="w-5 h-5" />
            Start Setup Wizard
          </ABAButton>

          <ABAButton
            variant="text"
            size="md"
            className="w-full"
            onClick={() => navigate('/dashboard')}
          >
            Skip for now
          </ABAButton>
        </div>
      </div>
    </div>
  );
}