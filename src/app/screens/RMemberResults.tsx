/**
 * R-13 Member Results — Shows matching members from verification search.
 * Select one → R-15 Visit Intake.
 * No results → "No member found" error state with CTA → R-14 Register Non-member.
 */
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { ABABadge } from '../components/aba/ABABadge';
import {
  useWalkInStore,
  searchMembers,
  setMember,
  type WalkInMember,
} from '../data/walkInStore';
import {
  User,
  ShieldCheck,
  Phone,
  MapPin,
  ChevronRight,
  UserX,
  UserPlus,
  SearchX,
} from 'lucide-react';

export function RMemberResults() {
  const navigate = useNavigate();
  const { state } = useWalkInStore();

  const results = useMemo(
    () => searchMembers(state.verifyQuery),
    [state.verifyQuery]
  );

  const handleSelect = (member: WalkInMember) => {
    setMember(member);
    navigate('/r/walk-in/intake');
  };

  const handleRegisterNonMember = () => {
    navigate('/r/walk-in/register');
  };

  const hasResults = results.length > 0;

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Search Results" showBack onBackClick={() => navigate('/r/walk-in/verify')} />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-4">

          {/* ── Query summary ── */}
          <div className="flex items-center justify-between bg-aba-neutral-0 rounded-xl border border-aba-neutral-200 px-4 py-3">
            <div>
              <p className="text-xs text-aba-neutral-600">
                {state.verifyMethod === 'phone' ? 'Phone search' : 'Member ID search'}
              </p>
              <p className="text-sm font-semibold text-aba-neutral-900">
                &ldquo;{state.verifyQuery}&rdquo;
              </p>
            </div>
            <ABABadge variant={hasResults ? 'success' : 'error'} size="sm">
              {hasResults ? `${results.length} found` : 'No match'}
            </ABABadge>
          </div>

          {/* ── Results list ── */}
          {hasResults ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">
                Select a member to continue
              </p>
              {results.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m)}
                  className="w-full bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4 hover:border-aba-primary-main hover:bg-aba-primary-50/20 active:bg-aba-primary-50 transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-aba-secondary-main" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-aba-neutral-900 truncate">
                          {m.name}
                        </p>
                        <ChevronRight className="w-4 h-4 text-aba-neutral-400 flex-shrink-0 group-hover:text-aba-primary-main transition-colors" />
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-aba-secondary-main bg-aba-secondary-50 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" />
                          {m.memberId}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-aba-neutral-600">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {m.phone}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {m.address}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* ── No member found error state ── */
            <div className="flex flex-col items-center justify-center text-center py-10 px-6">
              <div className="w-20 h-20 rounded-full bg-aba-error-50 flex items-center justify-center mb-4">
                <UserX className="w-10 h-10 text-aba-error-main" />
              </div>
              <h3 className="font-semibold text-aba-neutral-900 mb-2 text-[16px]">
                No member found
              </h3>
              <p className="text-sm text-aba-neutral-600 mb-2 max-w-xs">
                We couldn't find an AbaAccess member matching
                <span className="font-semibold"> &ldquo;{state.verifyQuery}&rdquo;</span>.
              </p>
              <p className="text-aba-neutral-400 mb-6 max-w-xs text-[14px]">
                Please double-check the information or register them as a non-member walk-in.
              </p>

            </div>
          )}

        </div>
      </div>

      {/* ── Fixed bottom CTA ── */}
      {!hasResults && (
        <div className="flex-shrink-0 border-t border-aba-neutral-200 bg-aba-neutral-0 px-4 py-3 flex flex-col gap-2">
          <ABAButton variant="primary" size="lg" fullWidth onClick={handleRegisterNonMember}>
            <UserPlus className="w-5 h-5" />
            Register Non-member
          </ABAButton>
          <ABAButton variant="outline" size="md" fullWidth onClick={() => navigate('/r/walk-in/verify')}>
            <SearchX className="w-4 h-4" />
            Try Again
          </ABAButton>
        </div>
      )}
    </div>
  );
}