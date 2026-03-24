/**
 * NU-03 Capture Vitals — Form for BP, Temp, Pulse, SpO2, Weight.
 *
 * Save → success toast → back to NU-02.
 * Inner page: back arrow, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { useNurseStore, saveVitals } from '../data/nurseStore';
import {
  Activity,
  Thermometer,
  HeartPulse,
  Wind,
  Weight,
} from 'lucide-react';

interface VitalField {
  key: string;
  label: string;
  placeholder: string;
  unit: string;
  icon: React.ReactNode;
  iconBg: string;
}

const fields: VitalField[] = [
  {
    key: 'bp',
    label: 'Blood Pressure',
    placeholder: '120/80',
    unit: 'mmHg',
    icon: <Activity className="w-5 h-5 text-[#E44F4F]" />,
    iconBg: 'bg-[#FDECEC]',
  },
  {
    key: 'temp',
    label: 'Temperature',
    placeholder: '36.7',
    unit: '°C',
    icon: <Thermometer className="w-5 h-5 text-[#D97706]" />,
    iconBg: 'bg-[#FFF3DC]',
  },
  {
    key: 'pulse',
    label: 'Pulse Rate',
    placeholder: '72',
    unit: 'bpm',
    icon: <HeartPulse className="w-5 h-5 text-[#3A8DFF]" />,
    iconBg: 'bg-[#EBF3FF]',
  },
  {
    key: 'spO2',
    label: 'Oxygen Saturation (SpO2)',
    placeholder: '98',
    unit: '%',
    icon: <Wind className="w-5 h-5 text-[#38C172]" />,
    iconBg: 'bg-[#E9F8F0]',
  },
  {
    key: 'weight',
    label: 'Weight',
    placeholder: '68',
    unit: 'kg',
    icon: <Weight className="w-5 h-5 text-[#4A4F55]" />,
    iconBg: 'bg-[#F7F9FC]',
  },
];

export function NUCaptureVitals() {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const { getById } = useNurseStore();

  const patient = getById(patientId || '');

  const [values, setValues] = useState<Record<string, string>>(() => {
    if (patient?.vitals) {
      return {
        bp: patient.vitals.bp || '',
        temp: patient.vitals.temp || '',
        pulse: patient.vitals.pulse || '',
        spO2: patient.vitals.spO2 || '',
        weight: patient.vitals.weight || '',
      };
    }
    return { bp: '', temp: '', pulse: '', spO2: '', weight: '' };
  });

  const [isSaving, setIsSaving] = useState(false);

  if (!patient) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Capture Vitals" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Patient not found</p>
        </div>
      </div>
    );
  }

  const hasAnyValue = Object.values(values).some((v) => v.trim() !== '');

  const handleSave = () => {
    if (!hasAnyValue) return;
    setIsSaving(true);
    setTimeout(() => {
      saveVitals(patient.id, {
        bp: values.bp || undefined,
        temp: values.temp || undefined,
        pulse: values.pulse || undefined,
        spO2: values.spO2 || undefined,
        weight: values.weight || undefined,
      });
      showToast('Vitals saved successfully', 'success');
      navigate(-1);
    }, 400);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Capture Vitals" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-4 space-y-3">

          {/* Patient bar */}
          <div className="bg-[#EBF3FF] rounded-2xl p-3 flex items-center gap-3">
            <span className="text-[10px] font-bold text-[#3A8DFF] bg-white px-1.5 py-[1px] rounded">
              {patient.ticketNo}
            </span>
            <p className="text-sm font-semibold text-[#1A1A1A]">{patient.patientName}</p>
            <span className="text-xs text-[#8F9AA1]">
              {patient.patientAge} yrs
            </span>
          </div>

          {/* Vitals form */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            {fields.map((field, idx) => (
              <div
                key={field.key}
                className={`px-4 py-4 ${idx < fields.length - 1 ? 'border-b border-[#E5E8EC]' : ''}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg ${field.iconBg} flex items-center justify-center flex-shrink-0`}>
                    {field.icon}
                  </div>
                  <label className="text-sm font-medium text-[#1A1A1A]">
                    {field.label}
                  </label>
                </div>
                <div className="relative ml-11">
                  <input
                    type="text"
                    value={values[field.key]}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                    className="w-full h-10 pl-3 pr-14 rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8F9AA1]">
                    {field.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky save */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleSave}
            disabled={!hasAnyValue}
            isLoading={isSaving}
          >
            Save Vitals
          </ABAButton>
        </div>
      </div>
    </div>
  );
}
