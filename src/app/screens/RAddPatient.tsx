/**
 * R-61 Add Patient — Tabs: "AbaAccess Member" (verify) / "Non-member" (register).
 * Member: search by phone/ID → verify → navigate to profile.
 * Non-member: fill form → save → navigate to profile.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { InputField } from '../components/aba/InputField';
import { ABAButton } from '../components/aba/ABAButton';
import { ABABadge } from '../components/aba/ABABadge';
import { ListCard } from '../components/aba/Cards';
import { RListRow } from '../components/aba/RListRow';
import { showToast } from '../components/aba/Toast';
import { addPatient, getPatients } from '../data/patientsStore';
import { memberDirectory, type WalkInMember } from '../data/walkInStore';
import {
  Search,
  UserCheck,
  UserPlus,
  Phone,
  CheckCircle2,
} from 'lucide-react';

type Tab = 'member' | 'non-member';
type Gender = 'Male' | 'Female' | '';

export function RAddPatient() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('member');

  /* ── Member verify state ── */
  const [memberQuery, setMemberQuery] = useState('');
  const [memberResults, setMemberResults] = useState<WalkInMember[]>([]);
  const [searched, setSearched] = useState(false);
  const [verifying, setVerifying] = useState(false);

  /* ── Non-member form state ── */
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender>('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [nextOfKin, setNextOfKin] = useState('');
  const [nextOfKinPhone, setNextOfKinPhone] = useState('');
  const [saving, setSaving] = useState(false);

  /* ── Member search ── */
  const handleMemberSearch = () => {
    const q = memberQuery.trim().toLowerCase();
    if (q.length < 2) {
      showToast('Enter at least 2 characters', 'warning');
      return;
    }
    const results = memberDirectory.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        (m.memberId && m.memberId.toLowerCase().includes(q))
    );
    setMemberResults(results);
    setSearched(true);
  };

  const handleSelectMember = (member: WalkInMember) => {
    setVerifying(true);
    // Check if patient already exists in store
    const existing = getPatients().find(
      (p) => p.memberId === member.memberId || (p.phone === member.phone && p.isMember)
    );

    setTimeout(() => {
      setVerifying(false);
      if (existing) {
        showToast('Patient already registered — opening profile', 'success');
        navigate(`/r/more/patients/${existing.id}`);
      } else {
        // Register and navigate
        const newPatient = addPatient({
          name: member.name,
          phone: member.phone,
          gender: member.gender,
          age: member.age,
          address: member.address,
          isMember: true,
          memberId: member.memberId,
        });
        showToast('Member added successfully', 'success');
        navigate(`/r/more/patients/${newPatient.id}`);
      }
    }, 1000);
  };

  /* ── Non-member save ── */
  const handleSaveNonMember = () => {
    if (!fullName.trim()) {
      showToast('Full name is required', 'warning');
      return;
    }
    if (!phone.trim()) {
      showToast('Phone number is required', 'warning');
      return;
    }
    if (!gender) {
      showToast('Please select gender', 'warning');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      const newPatient = addPatient({
        name: fullName.trim(),
        phone: phone.trim(),
        gender,
        age: age.trim() || 'N/A',
        address: address.trim() || 'N/A',
        isMember: false,
        nextOfKin: nextOfKin.trim() || undefined,
        nextOfKinPhone: nextOfKinPhone.trim() || undefined,
      });
      setSaving(false);
      showToast('Patient saved successfully', 'success');
      navigate(`/r/more/patients/${newPatient.id}`);
    }, 800);
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar
        title="Add Patient"
        showBack
        onBackClick={() => navigate('/r/more/patients')}
      />

      <div className="flex-1 overflow-y-auto">
        {/* ── Tab switcher ── */}
        <div className="flex bg-aba-neutral-0 border-b border-aba-neutral-200">
          <button
            onClick={() => setActiveTab('member')}
            className={`flex-1 flex items-center justify-center gap-2 h-12 text-sm font-semibold transition-colors relative ${
              activeTab === 'member'
                ? 'text-aba-primary-main'
                : 'text-aba-neutral-600 hover:text-aba-neutral-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            AbaAccess Member
            {activeTab === 'member' && (
              <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-aba-primary-main rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('non-member')}
            className={`flex-1 flex items-center justify-center gap-2 h-12 text-sm font-semibold transition-colors relative ${ activeTab === 'non-member' ? 'text-aba-primary-main' : 'text-aba-neutral-600 hover:text-aba-neutral-900' } text-[#a1a1a1]`}
          >
            <UserPlus className="w-4 h-4" />
            Non-member
            {activeTab === 'non-member' && (
              <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-aba-primary-main rounded-full" />
            )}
          </button>
        </div>

        {/* ── Member path ── */}
        {activeTab === 'member' && (
          <div className="p-4 space-y-4">
            <div className="bg-aba-secondary-50/50 rounded-2xl border border-aba-secondary-main/20 p-4">
              <p className="text-sm text-aba-neutral-900 font-medium mb-1">
                Verify AbaAccess membership
              </p>
              <p className="text-xs text-aba-neutral-600">
                Search by phone number or Member ID to verify and register the patient.
              </p>
            </div>

            <InputField
              label="Phone or Member ID"
              placeholder="e.g. +256 701... or ABA-2024-001"
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />

            {/* Results */}
            {searched && (
              <div className="space-y-3">
                {memberResults.length > 0 ? (
                  <>
                    <p className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide px-1">
                      {memberResults.length} member{memberResults.length !== 1 ? 's' : ''} found
                    </p>
                    <ListCard>
                      {memberResults.map((m) => (
                        <RListRow
                          key={m.id}
                          initials={m.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                          title={m.name}
                          subtitle={m.phone}
                          meta={m.memberId}
                          trailing={
                            <ABABadge variant="success" size="sm">
                              Member
                            </ABABadge>
                          }
                          showChevron
                          onClick={() => handleSelectMember(m)}
                        />
                      ))}
                    </ListCard>
                  </>
                ) : (
                  <div className="bg-aba-warning-50/50 rounded-2xl border border-aba-warning-main/20 p-4 text-center">
                    <p className="text-sm font-medium text-aba-neutral-900 mb-1">
                      No members found
                    </p>
                    <p className="text-xs text-aba-neutral-600 mb-3">
                      Try a different search or register as a non-member.
                    </p>
                    <ABAButton
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('non-member')}
                    >
                      Register Non-member
                    </ABAButton>
                  </div>
                )}
              </div>
            )}

            {/* Verifying overlay */}
            {verifying && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-aba-neutral-0 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-xl">
                  <div className="w-10 h-10 rounded-full border-2 border-aba-primary-main border-t-transparent animate-spin" />
                  <p className="text-sm font-medium text-aba-neutral-900">Verifying membership...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Non-member path ── */}
        {activeTab === 'non-member' && (
          <div className="p-4 pb-6 space-y-4">
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4 space-y-4">
              <InputField
                label="Full Name *"
                placeholder="e.g. Kato Joseph"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <InputField
                label="Phone Number *"
                placeholder="+256 7XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
              />

              {/* Gender selector */}
              <div>
                <label className="block font-medium text-aba-neutral-900 mb-2 text-[12px] text-[#8f9aa1]">
                  Gender *
                </label>
                <div className="flex gap-3">
                  {(['Male', 'Female'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`flex-1 h-12 rounded-md border text-sm font-medium transition-colors ${
                        gender === g
                          ? 'bg-aba-primary-50 border-aba-primary-main text-aba-primary-main'
                          : 'bg-aba-neutral-0 border-aba-neutral-400 text-aba-neutral-700 hover:bg-aba-neutral-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <InputField
                label="Age / Date of Birth"
                placeholder="e.g. 8 or 22 Apr 2017"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />

              <InputField
                label="Area / Address"
                placeholder="e.g. Ntinda, Kampala"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Next of kin (optional) */}
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4 space-y-4">
              <p className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">
                Next of Kin (optional)
              </p>
              <InputField
                label="Name"
                placeholder="e.g. Kato Margaret"
                value={nextOfKin}
                onChange={(e) => setNextOfKin(e.target.value)}
              />
              <InputField
                label="Phone"
                placeholder="+256 7XX XXX XXX"
                value={nextOfKinPhone}
                onChange={(e) => setNextOfKinPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Fixed bottom CTA for member tab ── */}
      {activeTab === 'member' && (
        <div className="flex-shrink-0 border-t border-aba-neutral-200 bg-aba-neutral-0 px-4 py-3">
          <ABAButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleMemberSearch}
            disabled={memberQuery.trim().length < 2}
          >
            <Search className="w-5 h-5" />
            Verify
          </ABAButton>
        </div>
      )}

      {/* ── Fixed bottom CTA for non-member tab ── */}
      {activeTab === 'non-member' && (
        <div className="flex-shrink-0 border-t border-aba-neutral-200 bg-aba-neutral-0 px-4 py-3">
          <ABAButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSaveNonMember}
            isLoading={saving}
            disabled={!fullName.trim() || !phone.trim() || !gender}
          >
            <CheckCircle2 className="w-5 h-5" />
            Save Patient
          </ABAButton>
        </div>
      )}
    </div>
  );
}