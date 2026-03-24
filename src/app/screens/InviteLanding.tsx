import { useNavigate } from 'react-router';
import { ABAButton } from '../components/aba/ABAButton';
import { Building2, CheckCircle2, LogIn } from 'lucide-react';

const features = [
  'Schedule and manage patient appointments',
  'Coordinate across clinical departments',
  'Monitor real-time pharmacy and lab queues',
  'Generate financial and operational reports',
];

export function InviteLanding() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FC]">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* Logo / icon */}
        <div className="w-20 h-20 rounded-3xl bg-[#56D8A8] flex items-center justify-center mb-6 shadow-lg shadow-[#56D8A8]/25">
          <Building2 className="w-10 h-10 text-white" />
        </div>

        <h1 className="font-semibold text-[#1A1A1A] text-center leading-tight text-[20px]">
          Welcome to ABA Partner
        </h1>
        <p className="text-sm text-[#8F9AA1] text-center mt-2 max-w-[300px] leading-relaxed">
          The complete clinic management platform for your healthcare facility.
        </p>

        {/* Feature list */}
        <div className="mt-8 w-full max-w-[320px] space-y-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#56D8A8] flex-shrink-0" />
              <p className="text-sm text-[#4A4F55] leading-snug">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-6 pb-10 space-y-3">
        <ABAButton
          fullWidth
          size="lg"
          onClick={() => navigate('/otp-verification')}
        >
          Get Started
        </ABAButton>

        <ABAButton
          variant="outline"
          fullWidth
          size="lg"
          onClick={() => navigate('/login')}
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </ABAButton>

        <button
          onClick={() => navigate('/staff-sign-in')}
          className="w-full text-center text-sm font-medium text-[#3A8DFF] py-2 hover:underline"
        >
          Staff sign in
        </button>
      </div>
    </div>
  );
}