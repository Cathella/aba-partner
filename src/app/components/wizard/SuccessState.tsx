import { ABAButton } from '../aba/ABAButton';
import { CheckCircle2, Clock, Mail } from 'lucide-react';

interface SuccessStateProps {
  onContinue: () => void;
}

export function SuccessState({ onContinue }: SuccessStateProps) {
  return (
    <div className="w-full min-h-screen bg-aba-neutral-100 flex items-center justify-center">
      <div className="w-[390px] h-[844px] bg-aba-neutral-100 relative overflow-hidden shadow-2xl flex items-center justify-center p-4">
        <div className="w-full max-w-[358px] space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-aba-success-50 flex items-center justify-center relative animate-[scale-in_0.5s_ease-out]">
              <div className="w-20 h-20 rounded-full bg-aba-success-main flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-aba-neutral-900 mb-2">
              Submitted for Activation!
            </h1>
            <p className="text-sm text-aba-neutral-600">
              Your clinic setup has been successfully submitted
            </p>
          </div>

          {/* Status Banner */}
          <div className="bg-aba-neutral-0 border border-aba-neutral-300 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-aba-secondary-main" />
              </div>
              <div>
                <p className="text-sm font-semibold text-aba-neutral-900">
                  Under Review
                </p>
                <p className="text-xs text-aba-neutral-600">
                  Estimated time: 24-48 hours
                </p>
              </div>
            </div>
            <div className="bg-aba-neutral-100 rounded-lg p-3">
              <p className="text-xs text-aba-neutral-700">
                Our team is reviewing your clinic information. You'll receive an email notification once your clinic is activated.
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-aba-primary-50 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-aba-neutral-900">
              What happens next?
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-aba-primary-main flex-shrink-0 mt-1.5"></div>
                <p className="text-xs text-aba-neutral-700">
                  Verification of clinic details and documents
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-aba-primary-main flex-shrink-0 mt-1.5"></div>
                <p className="text-xs text-aba-neutral-700">
                  Account activation and wallet setup
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-aba-primary-main flex-shrink-0 mt-1.5"></div>
                <p className="text-xs text-aba-neutral-700">
                  Email confirmation with login credentials
                </p>
              </div>
            </div>
          </div>

          {/* Email Notification */}
          <div className="bg-aba-neutral-0 border border-aba-neutral-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-aba-primary-main" />
              <div>
                <p className="text-xs font-medium text-aba-neutral-900">
                  Confirmation sent to
                </p>
                <p className="text-xs text-aba-neutral-600">
                  clinic@example.com
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <ABAButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={onContinue}
          >
            Go to Dashboard
          </ABAButton>

          {/* Support Link */}
          <div className="text-center">
            <p className="text-xs text-aba-neutral-600">
              Need help?{' '}
              <button className="font-medium text-aba-secondary-main hover:underline">
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
