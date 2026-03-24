/**
 * R-10 Add Walk-in — Landing page with two CTA paths:
 * 1. Verify AbaAccess Member → R-12
 * 2. Register Non-member → R-14
 */
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ReceptionistBottomNav } from '../components/aba/ReceptionistBottomNav';
import { resetWalkInFlow } from '../data/walkInStore';
import {
  ShieldCheck,
  UserPlus,
  ChevronRight,
  UserRoundSearch,
  ClipboardPlus,
} from 'lucide-react';

export function RWalkIn() {
  const navigate = useNavigate();

  const handleVerifyMember = () => {
    resetWalkInFlow();
    navigate('/r/walk-in/verify');
  };

  const handleRegisterNonMember = () => {
    resetWalkInFlow();
    navigate('/r/walk-in/register');
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Add Walk-in" showBack onBackClick={() => navigate('/r/today')} />

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-5">

          {/* ── Hero header ── */}
          <div className="text-center pt-4 pb-2">
            <div className="w-16 h-16 rounded-full bg-aba-primary-50 flex items-center justify-center mx-auto mb-4">
              <ClipboardPlus className="w-8 h-8 text-aba-primary-main" />
            </div>
            <h2 className="font-semibold text-aba-neutral-900 mb-1 text-[16px]">
              Add Walk-in Patient
            </h2>
            <p className="text-sm text-aba-neutral-600 max-w-xs mx-auto">
              Register a walk-in visit by verifying an existing member or registering a new non-member.
            </p>
          </div>

          {/* ── CTA 1: Verify AbaAccess Member ── */}
          <button
            onClick={handleVerifyMember}
            className="w-full bg-aba-neutral-0 rounded-2xl border-2 border-aba-neutral-200 p-5 hover:border-aba-primary-main hover:bg-aba-primary-50/30 active:bg-aba-primary-50 transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-aba-secondary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-aba-secondary-100 transition-colors">
                <ShieldCheck className="w-6 h-6 text-aba-secondary-main" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-aba-neutral-900">
                    Verify AbaAccess Member
                  </h3>
                  <ChevronRight className="w-5 h-5 text-aba-neutral-400 flex-shrink-0 group-hover:text-aba-primary-main transition-colors" />
                </div>
                <p className="text-sm text-aba-neutral-600 mt-1">
                  Scan QR code, enter Member ID, or search by phone number to verify an existing member.
                </p>
              </div>
            </div>

            {/* Quick method hints */}
            <div className="flex gap-2 mt-4 ml-16">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-aba-neutral-100 text-[11px] font-medium text-aba-neutral-700">
                <UserRoundSearch className="w-3 h-3" />
                QR / ID / Phone
              </span>
            </div>
          </button>

          {/* ── CTA 2: Register Non-member ── */}
          <button
            onClick={handleRegisterNonMember}
            className="w-full bg-aba-neutral-0 rounded-2xl border-2 border-aba-neutral-200 p-5 hover:border-aba-primary-main hover:bg-aba-primary-50/30 active:bg-aba-primary-50 transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-aba-warning-50 flex items-center justify-center flex-shrink-0 group-hover:bg-aba-warning-100 transition-colors">
                <UserPlus className="w-6 h-6 text-aba-warning-main" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-aba-neutral-900">
                    Register Non-member
                  </h3>
                  <ChevronRight className="w-5 h-5 text-aba-neutral-400 flex-shrink-0 group-hover:text-aba-primary-main transition-colors" />
                </div>
                <p className="text-sm text-aba-neutral-600 mt-1">
                  Quickly register a new patient who is not yet an AbaAccess member.
                </p>
              </div>
            </div>

            {/* Quick field hints */}
            <div className="flex flex-wrap gap-2 mt-4 ml-16">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-aba-neutral-100 text-[11px] font-medium text-aba-neutral-700">
                Name, Phone, Gender, DOB
              </span>
            </div>
          </button>

          {/* ── Info footnote ── */}
          <div className="bg-aba-secondary-50/50 rounded-xl p-3.5 border border-aba-secondary-main/10">
            <p className="text-xs text-aba-neutral-700 leading-relaxed">
              <span className="font-semibold">Tip:</span> If you start with member verification and
              the member isn't found, you'll have an option to register them as a non-member.
            </p>
          </div>

        </div>
      </div>

      <ReceptionistBottomNav />
    </div>
  );
}
