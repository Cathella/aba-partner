/**
 * R-14 Register Non-member — Quick registration form for non-AbaAccess patients.
 * Fields: full name, phone, gender, age/DOB, area/address.
 * Save & Continue → R-15 Visit Intake.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { InputField } from '../components/aba/InputField';
import { ABAButton } from '../components/aba/ABAButton';
import { setMember } from '../data/walkInStore';
import {
  User,
  Phone,
  Calendar,
  MapPin,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

export function RRegisterNonMember() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [ageDob, setAgeDob] = useState('');
  const [address, setAddress] = useState('');
  const [genderOpen, setGenderOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  /* validation */
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    else if (phone.trim().length < 10) errs.phone = 'Enter a valid phone number';
    if (!gender) errs.gender = 'Please select gender';
    return errs;
  };

  const canSubmit = fullName.trim() && phone.trim();

  const handleSave = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    setTimeout(() => {
      const nonMemberId = `NM-${Date.now().toString(36).toUpperCase()}`;
      setMember({
        id: nonMemberId,
        name: fullName.trim(),
        phone: phone.trim(),
        gender,
        age: ageDob.trim(),
        address: address.trim(),
        isMember: false,
      });
      setSaving(false);
      navigate('/r/walk-in/intake');
    }, 600);
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Register Non-member" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-5">

          {/* ── Header ── */}
          <div>
            <h2 className="font-semibold text-aba-neutral-900 mb-1 text-[16px]">
              Quick Registration
            </h2>
            <p className="text-aba-neutral-600 text-[12px]">
              Enter the patient's basic information to register a non-member walk-in.
            </p>
          </div>

          {/* ── Form fields ── */}
          <div className="space-y-4">

            {/* Full name */}
            <InputField
              label="Full Name"
              placeholder="e.g. John Mugisha"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: '' })); }}
              leftIcon={<User className="w-5 h-5" />}
              error={errors.fullName}
            />

            {/* Phone */}
            <InputField
              label="Phone Number"
              placeholder="e.g. +256 701 234 567"
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: '' })); }}
              leftIcon={<Phone className="w-5 h-5" />}
              error={errors.phone}
            />

            {/* Gender dropdown */}
            <div>
              <label className="block font-medium text-aba-neutral-900 mb-2 text-[#8f9aa1] text-[12px]">
                Gender
              </label>
              <div className="relative">
                <button
                  onClick={() => setGenderOpen(!genderOpen)}
                  className={`w-full flex items-center justify-between h-12 px-4 rounded-md border bg-aba-neutral-0 text-sm hover:border-aba-neutral-600 transition-colors ${
                    errors.gender
                      ? 'border-aba-error-main'
                      : 'border-aba-neutral-400'
                  }`}
                >
                  <span className={gender ? 'text-aba-neutral-900' : 'text-aba-neutral-600'}>
                    {gender || 'Select gender'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-aba-neutral-600 transition-transform ${genderOpen ? 'rotate-180' : ''}`} />
                </button>

                {genderOpen && (
                  <div className="absolute z-10 top-[calc(100%+4px)] left-0 right-0 bg-aba-neutral-0 border border-aba-neutral-200 rounded-lg shadow-lg overflow-hidden">
                    {genderOptions.map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          setGender(g);
                          setGenderOpen(false);
                          setErrors((p) => ({ ...p, gender: '' }));
                        }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-aba-neutral-100 transition-colors border-b border-aba-neutral-200 last:border-b-0 ${
                          gender === g
                            ? 'font-semibold text-aba-primary-main bg-aba-primary-50/50'
                            : 'text-aba-neutral-900'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.gender && (
                <p className="mt-1.5 text-sm text-aba-error-main">{errors.gender}</p>
              )}
            </div>

            {/* Age / DOB */}
            <InputField
              label="Age or Date of Birth"
              placeholder="e.g. 8 years or 15/03/2018"
              value={ageDob}
              onChange={(e) => setAgeDob(e.target.value)}
              leftIcon={<Calendar className="w-5 h-5" />}
              helperText="Optional — enter age in years or DOB"
            />

            {/* Area / Address */}
            <InputField
              label="Area / Address"
              placeholder="e.g. Mukono Town, Kampala"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              leftIcon={<MapPin className="w-5 h-5" />}
              helperText="Optional"
            />
          </div>

        </div>
      </div>

      {/* ── Fixed bottom CTA ── */}
      <div className="flex-shrink-0 border-t border-aba-neutral-200 bg-aba-neutral-0 px-4 py-3 flex flex-col gap-2">
        <ABAButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canSubmit}
          isLoading={saving}
          onClick={handleSave}
        >
          Save & Continue
          <ArrowRight className="w-5 h-5" />
        </ABAButton>
        <button
          onClick={() => navigate(-1)}
          className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}