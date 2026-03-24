/**
 * R-63 Edit Patient — Edit contact + demographic fields. CTA: "Save Changes".
 * Success toast on save, navigate back to Patient Profile.
 */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { InputField } from '../components/aba/InputField';
import { ABAButton } from '../components/aba/ABAButton';
import { EmptyState } from '../components/aba/EmptyState';
import { showToast } from '../components/aba/Toast';
import { usePatientsStore, updatePatient } from '../data/patientsStore';
import { Phone, CheckCircle2, AlertCircle, Heart } from 'lucide-react';

type Gender = 'Male' | 'Female' | '';

export function REditPatient() {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const { patients } = usePatientsStore();

  const patient = useMemo(
    () => patients.find((p) => p.id === patientId),
    [patients, patientId]
  );

  /* ── form state ── */
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender>('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [nextOfKin, setNextOfKin] = useState('');
  const [nextOfKinPhone, setNextOfKinPhone] = useState('');
  const [saving, setSaving] = useState(false);

  /* ── prefill ── */
  useEffect(() => {
    if (patient) {
      setName(patient.name);
      setPhone(patient.phone);
      setGender((patient.gender as Gender) || '');
      setAge(patient.age);
      setAddress(patient.address);
      setNextOfKin(patient.nextOfKin || '');
      setNextOfKinPhone(patient.nextOfKinPhone || '');
    }
  }, [patient]);

  if (!patient) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar
          title="Edit Patient"
          showBack
          onBackClick={() => navigate('/r/more/patients')}
        />
        <EmptyState
          icon={<AlertCircle className="w-8 h-8" />}
          title="Patient not found"
          message="The patient record could not be loaded."
          actionLabel="Back to Patients"
          onAction={() => navigate('/r/more/patients')}
        />
      </div>
    );
  }

  const handleSave = () => {
    if (!name.trim()) {
      showToast('Full name is required', 'warning');
      return;
    }
    if (!phone.trim()) {
      showToast('Phone number is required', 'warning');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      updatePatient(patient.id, {
        name: name.trim(),
        phone: phone.trim(),
        gender: gender || patient.gender,
        age: age.trim() || patient.age,
        address: address.trim() || patient.address,
        nextOfKin: nextOfKin.trim() || undefined,
        nextOfKinPhone: nextOfKinPhone.trim() || undefined,
      });
      setSaving(false);
      showToast('Changes saved successfully', 'success');
      navigate(`/r/more/patients/${patient.id}`);
    }, 800);
  };

  const backPath = `/r/more/patients/${patient.id}`;

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar
        title="Edit Patient"
        showBack
        onBackClick={() => navigate(backPath)}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Member badge */}
          {patient.isMember && patient.memberId && (
            <div className="bg-aba-success-50/50 rounded-2xl border border-aba-success-main/20 p-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-aba-success-main flex-shrink-0" />
              <p className="text-xs text-aba-neutral-900">
                AbaAccess Member &bull; <span className="font-semibold">{patient.memberId}</span>
              </p>
            </div>
          )}

          {/* Contact fields */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4 space-y-4">
            <p className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">
              Contact
            </p>

            <InputField
              label="Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />

            <InputField
              label="Phone Number *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+256 7XX XXX XXX"
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>

          {/* Demographics */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4 space-y-4">
            <p className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">
              Demographics
            </p>

            <div>
              <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                Gender
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
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 8 or 22 Apr 2017"
            />

            <InputField
              label="Area / Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Ntinda, Kampala"
            />
          </div>

          {/* Next of kin */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-aba-neutral-600" />
              <p className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">
                Next of Kin
              </p>
            </div>

            <InputField
              label="Name"
              value={nextOfKin}
              onChange={(e) => setNextOfKin(e.target.value)}
              placeholder="Name"
            />

            <InputField
              label="Phone"
              value={nextOfKinPhone}
              onChange={(e) => setNextOfKinPhone(e.target.value)}
              placeholder="+256 7XX XXX XXX"
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>

          {/* Save CTA */}
          <ABAButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSave}
            isLoading={saving}
            disabled={!name.trim() || !phone.trim()}
          >
            <CheckCircle2 className="w-5 h-5" />
            Save Changes
          </ABAButton>

          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}
