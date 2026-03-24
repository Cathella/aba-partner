/**
 * CL-06 Vitals — Modal/screen for recording patient vitals.
 * Fields: Temperature, Blood Pressure, Pulse, SpO2, Weight.
 * Save → success toast, navigate back.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { useClinicianStore, updateVitals } from '../data/clinicianStore';
import {
  Thermometer,
  HeartPulse,
  Activity,
  Wind,
  Weight,
} from 'lucide-react';

interface VitalFieldConfig {
  key: 'temperature' | 'bloodPressure' | 'pulse' | 'spo2' | 'weight';
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  placeholder: string;
  unit: string;
  inputMode: 'decimal' | 'numeric' | 'text';
}

const fields: VitalFieldConfig[] = [
  {
    key: 'temperature',
    label: 'Temperature',
    icon: <Thermometer className="w-5 h-5 text-aba-error-main" />,
    iconBg: 'bg-aba-error-50',
    placeholder: '36.5',
    unit: '°C',
    inputMode: 'decimal',
  },
  {
    key: 'bloodPressure',
    label: 'Blood Pressure',
    icon: <HeartPulse className="w-5 h-5 text-[#8B5CF6]" />,
    iconBg: 'bg-[#F5F3FF]',
    placeholder: '120/80',
    unit: 'mmHg',
    inputMode: 'text',
  },
  {
    key: 'pulse',
    label: 'Pulse Rate',
    icon: <Activity className="w-5 h-5 text-aba-primary-main" />,
    iconBg: 'bg-aba-primary-50',
    placeholder: '72',
    unit: 'bpm',
    inputMode: 'numeric',
  },
  {
    key: 'spo2',
    label: 'Oxygen Saturation (SpO2)',
    icon: <Wind className="w-5 h-5 text-aba-secondary-main" />,
    iconBg: 'bg-aba-secondary-50',
    placeholder: '98',
    unit: '%',
    inputMode: 'numeric',
  },
  {
    key: 'weight',
    label: 'Weight',
    icon: <Weight className="w-5 h-5 text-[#F59E0B]" />,
    iconBg: 'bg-[#FFFBEB]',
    placeholder: '65',
    unit: 'kg',
    inputMode: 'decimal',
  },
];

export function CLVitals() {
  const navigate = useNavigate();
  const { visitId } = useParams<{ visitId: string }>();
  const { getVisitById } = useClinicianStore();

  const visit = getVisitById(visitId || '');

  const [values, setValues] = useState<Record<string, string>>(() => {
    if (!visit?.vitals) return {};
    return {
      temperature: visit.vitals.temperature || '',
      bloodPressure: visit.vitals.bloodPressure || '',
      pulse: visit.vitals.pulse || '',
      spo2: visit.vitals.spo2 || '',
      weight: visit.vitals.weight || '',
    };
  });

  if (!visit) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Vitals" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-aba-neutral-600">Visit not found</p>
        </div>
      </div>
    );
  }

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateVitals(visit.id, {
      temperature: values.temperature || undefined,
      bloodPressure: values.bloodPressure || undefined,
      pulse: values.pulse || undefined,
      spo2: values.spo2 || undefined,
      weight: values.weight || undefined,
    });
    showToast('Vitals saved successfully', 'success');
    navigate(-1);
  };

  const hasAnyValue = Object.values(values).some((v) => v.trim());

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Record Vitals" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-28">
        {/* Patient context */}
        <div className="bg-aba-neutral-0 border-b border-aba-neutral-200 px-4 py-3">
          <p className="text-sm font-medium text-aba-neutral-900">{visit.patientName}</p>
          <p className="text-xs text-aba-neutral-600">
            {visit.age} yrs &middot; {visit.gender} &middot; {visit.ticket}
          </p>
        </div>

        <div className="p-4 space-y-3">
          {fields.map((field) => (
            <div
              key={field.key}
              className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${field.iconBg} flex items-center justify-center flex-shrink-0`}>
                  {field.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-aba-neutral-900">{field.label}</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode={field.inputMode}
                  value={values[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full h-12 px-4 pr-16 rounded-xl border border-aba-neutral-200 bg-aba-neutral-100 text-base text-aba-neutral-900 placeholder:text-aba-neutral-400 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main/30 focus:border-aba-secondary-main transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-aba-neutral-500">
                  {field.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-aba-neutral-0 border-t border-aba-neutral-200 z-30">
        <div className="max-w-[390px] mx-auto p-4">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleSave}
            disabled={!hasAnyValue}
          >
            Save Vitals
          </ABAButton>
        </div>
      </div>
    </div>
  );
}
