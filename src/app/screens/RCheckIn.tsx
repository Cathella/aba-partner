import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { InputField } from '../components/aba/InputField';
import { StatusChip } from '../components/aba/StatusChip';
import { showToast } from '../components/aba/Toast';
import {
  UserCheck,
  Phone,
  User,
  FileText,
  CheckCircle,
  Search,
} from 'lucide-react';

/* ── mock search results ── */
interface PatientResult {
  id: string;
  name: string;
  phone: string;
  lastVisit: string;
  upcomingBooking?: string;
}

const patients: PatientResult[] = [
  { id: 'pt1', name: 'Jane Nakamya', phone: '+256 701 234 567', lastVisit: '12 Feb 2026', upcomingBooking: 'Speech Therapy @ 10:30 AM' },
  { id: 'pt2', name: 'Moses Okello', phone: '+256 704 567 890', lastVisit: '10 Feb 2026', upcomingBooking: 'Follow-up @ 11:00 AM' },
  { id: 'pt3', name: 'Grace Atim', phone: '+256 705 678 901', lastVisit: '8 Feb 2026' },
];

export function RCheckIn() {
  const navigate = useNavigate();
  const { checkInId } = useParams<{ checkInId: string }>();
  const isWalkIn = checkInId === 'walk-in';

  const [step, setStep] = useState<'search' | 'confirm' | 'done'>(isWalkIn ? 'search' : 'confirm');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientResult | null>(
    isWalkIn ? null : patients[0]
  );
  const [notes, setNotes] = useState('');

  const filteredPatients = searchQuery.trim()
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.phone.includes(searchQuery)
      )
    : [];

  const handleSelect = (p: PatientResult) => {
    setSelectedPatient(p);
    setStep('confirm');
  };

  const handleCheckIn = () => {
    setStep('done');
    showToast(`${selectedPatient?.name} checked in!`, 'success');
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar
        title={isWalkIn ? 'Walk-in Check-in' : 'Check In'}
        showBack
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-5">
          {/* STEP: Search */}
          {step === 'search' && (
            <>
              <div>
                <h2 className="text-lg font-semibold text-aba-neutral-900 mb-1">Find Patient</h2>
                <p className="text-sm text-aba-neutral-600">Search by name or phone number</p>
              </div>

              <InputField
                placeholder="e.g. Jane Nakamya or +256…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />

              {filteredPatients.length > 0 && (
                <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
                  {filteredPatients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelect(p)}
                      className="w-full flex items-center gap-3 p-4 text-left border-b border-aba-neutral-200 last:border-b-0 hover:bg-aba-neutral-100 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-aba-secondary-main" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-aba-neutral-900">{p.name}</p>
                        <p className="text-xs text-aba-neutral-600">{p.phone}</p>
                        {p.upcomingBooking && (
                          <p className="text-xs text-aba-primary-main mt-0.5">{p.upcomingBooking}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.trim() && filteredPatients.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-aba-neutral-600 mb-3">No patient found</p>
                  <ABAButton variant="outline" size="md" onClick={() => navigate('/r/more/patients/add')}>
                    Register New Patient
                  </ABAButton>
                </div>
              )}
            </>
          )}

          {/* STEP: Confirm */}
          {step === 'confirm' && selectedPatient && (
            <>
              <div>
                <h2 className="text-lg font-semibold text-aba-neutral-900 mb-1">Confirm Check-in</h2>
                <p className="text-sm text-aba-neutral-600">Review details before checking in</p>
              </div>

              <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-aba-primary-50 flex items-center justify-center">
                    <User className="w-6 h-6 text-aba-primary-main" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-aba-neutral-900">{selectedPatient.name}</p>
                    <p className="text-xs text-aba-neutral-600">{selectedPatient.phone}</p>
                  </div>
                </div>

                {selectedPatient.upcomingBooking && (
                  <div className="bg-aba-primary-50 rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-aba-primary-main flex-shrink-0" />
                    <p className="text-xs font-medium text-aba-neutral-900">Booked: {selectedPatient.upcomingBooking}</p>
                  </div>
                )}

                {isWalkIn && !selectedPatient.upcomingBooking && (
                  <div className="bg-aba-warning-50 rounded-xl p-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-aba-warning-main flex-shrink-0" />
                    <p className="text-xs font-medium text-aba-neutral-900">Walk-in — no existing booking</p>
                  </div>
                )}

                <div className="pt-2">
                  <label className="block text-sm font-medium text-aba-neutral-900 mb-2">Check-in Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Arrived with parent, brought school report…"
                    rows={3}
                    className="w-full px-4 py-3 rounded-[6px] border border-aba-neutral-400 bg-aba-neutral-0 text-sm text-aba-neutral-900 placeholder:text-aba-neutral-600 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main/30 focus:border-aba-secondary-main transition-all resize-none"
                  />
                </div>
              </div>

              <ABAButton variant="primary" size="lg" fullWidth onClick={handleCheckIn}>
                <UserCheck className="w-5 h-5" />
                Confirm Check-in
              </ABAButton>

              {isWalkIn && (
                <ABAButton variant="text" size="md" fullWidth onClick={() => { setStep('search'); setSelectedPatient(null); setSearchQuery(''); }}>
                  Back to search
                </ABAButton>
              )}
            </>
          )}

          {/* STEP: Done */}
          {step === 'done' && selectedPatient && (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="w-20 h-20 rounded-full bg-aba-success-50 flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-aba-success-main" />
              </div>
              <h2 className="text-xl font-semibold text-aba-neutral-900 mb-2">Checked In!</h2>
              <p className="text-sm text-aba-neutral-600 mb-1">{selectedPatient.name}</p>
              <StatusChip status="checked-in" size="md" />

              <div className="flex gap-3 mt-8 w-full max-w-xs">
                <ABAButton variant="primary" size="md" fullWidth onClick={() => navigate('/r/queue')}>
                  View Queue
                </ABAButton>
                <ABAButton variant="outline" size="md" fullWidth onClick={() => navigate('/r/today')}>
                  Done
                </ABAButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}