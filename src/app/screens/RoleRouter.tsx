import { useNavigate } from 'react-router';
import { ABAButton } from '../components/aba/ABAButton';
import { UserCheck, Stethoscope, ClipboardList, HeartPulse, FlaskConical, Pill, Activity, Landmark } from 'lucide-react';

export function RoleRouter() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-aba-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[390px]">
        <div className="bg-aba-neutral-0 rounded-3xl p-8 shadow-xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-aba-success-50 flex items-center justify-center">
              <UserCheck className="w-10 h-10 text-aba-success-main" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-2">
            <h1 className="text-2xl font-semibold text-aba-neutral-900 mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-aba-neutral-600">
              Routing to your workspace...
            </p>
          </div>

          {/* User Info */}
          <div className="bg-aba-neutral-100 rounded-2xl p-4 mb-8 mt-6">
            <p className="text-sm text-aba-neutral-700 text-center">
              Signed in as{' '}
              <span className="font-semibold text-aba-neutral-900">
                Staff Member
              </span>
            </p>
            <p className="text-xs text-aba-neutral-600 text-center mt-1">
              Mukono Family Clinic
            </p>
          </div>

          {/* Role Selection (Prototype Only) */}
          <div className="space-y-3">
            <ABAButton
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/r/today')}
            >
              <ClipboardList className="w-5 h-5" />
              Continue as Receptionist
            </ABAButton>

            <ABAButton
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/cl/queue')}
            >
              <HeartPulse className="w-5 h-5" />
              Continue as Doctor
            </ABAButton>

            <ABAButton
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/lt/worklist')}
            >
              <FlaskConical className="w-5 h-5" />
              Continue as Lab Tech
            </ABAButton>

            <ABAButton
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/ph/queue')}
            >
              <Pill className="w-5 h-5" />
              Continue as Pharmacist
            </ABAButton>

            <ABAButton
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/nu/queue')}
            >
              <Activity className="w-5 h-5" />
              Continue as Nurse
            </ABAButton>

            <ABAButton
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/ac/overview')}
            >
              <Landmark className="w-5 h-5" />
              Continue as Accountant
            </ABAButton>

            <ABAButton
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => navigate('/clinic-dashboard')}
            >
              <Stethoscope className="w-5 h-5" />
              Continue as Facility Admin
            </ABAButton>
          </div>

          {/* Prototype Note */}
          <div className="mt-6 bg-aba-secondary-50 rounded-2xl p-3">
            <p className="text-xs text-aba-neutral-700 text-center">
              <span className="font-semibold">Prototype note:</span> In
              production, routing happens automatically based on assigned role.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}