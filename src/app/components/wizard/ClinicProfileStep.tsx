import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ABAButton } from '../aba/ABAButton';
import { InputField } from '../aba/InputField';
import { showToast } from '../aba/Toast';
import {
  MapPin,
  Lock,
  Stethoscope,
  FlaskConical,
  Pill,
  Check,
  Info,
  Layers,
  Users,
  ClipboardList,
  CalendarCheck,
  BarChart3,
  CreditCard,
  Settings,
  Package,
} from 'lucide-react';

type FacilityTypeKey = 'clinic' | 'laboratory' | 'pharmacy';

interface FacilityTypeOption {
  key: FacilityTypeKey;
  label: string;
  icon: React.ElementType;
  description: string;
}

const FACILITY_TYPES: FacilityTypeOption[] = [
  {
    key: 'clinic',
    label: 'Clinic / Health Center',
    icon: Stethoscope,
    description: 'Doctor, Nurse, Reception, Bookings & Queue',
  },
  {
    key: 'laboratory',
    label: 'Laboratory',
    icon: FlaskConical,
    description: 'Lab Worklist, Results, Quality Control',
  },
  {
    key: 'pharmacy',
    label: 'Pharmacy',
    icon: Pill,
    description: 'Prescription Queue, OTC Requests, Inventory',
  },
];

const MODULE_MAP: Record<FacilityTypeKey, { label: string; icon: React.ElementType }[]> = {
  clinic: [
    { label: 'Doctor', icon: Stethoscope },
    { label: 'Nurse', icon: Users },
    { label: 'Reception', icon: ClipboardList },
    { label: 'Bookings / Queue', icon: CalendarCheck },
  ],
  laboratory: [
    { label: 'Lab Worklist', icon: FlaskConical },
    { label: 'Results', icon: BarChart3 },
    { label: 'Quality Control', icon: ClipboardList },
  ],
  pharmacy: [
    { label: 'Prescription Queue', icon: Pill },
    { label: 'OTC Requests', icon: Package },
    { label: 'Inventory', icon: Layers },
  ],
};

const ALWAYS_MODULES = [
  { label: 'Payments', icon: CreditCard },
  { label: 'Reports', icon: BarChart3 },
  { label: 'Settings', icon: Settings },
];

interface ClinicProfileStepProps {
  data: {
    name: string;
    facilityType: string;
    facilityTypes?: string[];
    phone: string;
    email: string;
    location: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function ClinicProfileStep({ data, onUpdate, onNext }: ClinicProfileStepProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ...data,
    facilityTypes: (data.facilityTypes && data.facilityTypes.length > 0)
      ? data.facilityTypes
      : (data.facilityType ? [data.facilityType] : []),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedTypes = formData.facilityTypes as FacilityTypeKey[];

  const toggleFacilityType = (key: FacilityTypeKey) => {
    setFormData((prev) => {
      const current = prev.facilityTypes as string[];
      if (current.includes(key)) {
        if (current.length === 1) {
          showToast('At least one facility type must be selected', 'error');
          return prev;
        }
        return { ...prev, facilityTypes: current.filter((t) => t !== key) };
      }
      return { ...prev, facilityTypes: [...current, key] };
    });
    if (errors.facilityType) {
      setErrors((prev) => ({ ...prev, facilityType: '' }));
    }
  };

  const enabledModules = [
    ...selectedTypes.flatMap((key) => MODULE_MAP[key] || []),
    ...ALWAYS_MODULES,
  ];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.facilityTypes || formData.facilityTypes.length === 0) {
      newErrors.facilityType = 'Select at least one facility type';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,}$/.test(String(formData.phone).replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid phone number';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      // Pass back both facilityType (for backward compat) and facilityTypes
      onUpdate({
        ...formData,
        facilityType: formData.facilityTypes.join(', '),
      });
      onNext();
    } else {
      showToast('Please complete all required fields', 'error');
    }
  };

  return (
    <div className="p-4 space-y-6 pb-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-aba-neutral-900 mb-2">
          Facility Profile
        </h2>
        <p className="text-sm text-aba-neutral-600">
          Complete your facility's basic information
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Clinic Name - Read Only */}
        <div>
          <label className="block text-sm font-medium text-aba-neutral-700 mb-2">
            Facility Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.name}
              disabled
              className="w-full px-4 py-3 bg-white border border-aba-neutral-200 rounded text-sm text-aba-neutral-500 cursor-not-allowed"
            />
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-aba-neutral-400" />
          </div>
          <p className="text-xs text-aba-neutral-500 mt-1">
            Contact support to change facility name
          </p>
        </div>

        {/* ─── Facility Types (Multi-select cards) ─── */}
        <div>
          <label className="block text-sm font-medium text-aba-neutral-700 mb-2">
            Facility Types <span className="text-aba-error-main">*</span>
          </label>
          <div className="space-y-2">
            {FACILITY_TYPES.map((ft) => {
              const selected = selectedTypes.includes(ft.key);
              const Icon = ft.icon;
              return (
                <button
                  key={ft.key}
                  onClick={() => toggleFacilityType(ft.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                    selected
                      ? 'bg-aba-primary-50 border-aba-primary-main ring-1 ring-aba-primary-main/30'
                      : 'bg-white border-aba-neutral-200 active:bg-aba-neutral-50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selected ? 'bg-aba-primary-tint' : 'bg-aba-neutral-100'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        selected ? 'text-aba-neutral-900' : 'text-aba-neutral-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-aba-neutral-900">
                      {ft.label}
                    </p>
                    <p className="text-xs text-aba-neutral-600 mt-0.5">
                      {ft.description}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selected
                        ? 'bg-aba-primary-main border-aba-primary-main'
                        : 'bg-white border-aba-neutral-300'
                    }`}
                  >
                    {selected && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {errors.facilityType && (
            <p className="text-xs text-aba-error-main mt-1">{errors.facilityType}</p>
          )}
          <p className="text-xs text-aba-neutral-500 mt-2">
            Select 1–3 types. You can change this later.
          </p>
        </div>

        {/* ─── Enabled Modules Preview ─── */}
        {selectedTypes.length > 0 && (
          <div className="bg-aba-neutral-50 rounded-xl border border-aba-neutral-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-aba-primary-main" />
              <p className="text-xs font-semibold text-aba-neutral-900">
                Enabled Modules
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {enabledModules.map((mod, idx) => {
                const ModIcon = mod.icon;
                return (
                  <span
                    key={`${mod.label}-${idx}`}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-aba-primary-50 text-aba-neutral-900"
                  >
                    <ModIcon className="w-3 h-3" />
                    {mod.label}
                  </span>
                );
              })}
            </div>
            <div className="flex items-start gap-2 mt-2.5 pt-2 border-t border-aba-neutral-200">
              <Info className="w-3.5 h-3.5 text-aba-neutral-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-aba-neutral-600">
                Selecting facility types controls which workspaces and staff
                roles are enabled for this facility.
              </p>
            </div>
          </div>
        )}

        {/* Phone */}
        <InputField
          label="Phone Number"
          placeholder="0700 123 456"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          required
        />

        {/* Email */}
        <InputField
          label="Email Address"
          type="email"
          placeholder="clinic@example.com"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          required
        />

        {/* Location - Summary with Edit Link */}
        <div>
          <label className="block text-sm font-medium text-aba-neutral-700 mb-2">
            Location
          </label>
          <div className="bg-aba-neutral-50 border border-aba-neutral-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-aba-primary-main flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-aba-neutral-900 font-medium">
                  {formData.location}
                </p>
                <button
                  onClick={() => navigate('/update-map-pin')}
                  className="text-sm font-medium text-aba-secondary-main mt-2 hover:underline"
                >
                  Edit pin on map
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="pt-4">
        <ABAButton
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleNext}
        >
          Continue
        </ABAButton>
      </div>
    </div>
  );
}