import { useState, useEffect, useRef } from 'react';
import { ABAButton } from '../aba/ABAButton';
import { showToast } from '../aba/Toast';
import { Building2, Pill, FlaskConical, Plus, X, Sparkles } from 'lucide-react';

interface DepartmentsData {
  opd: boolean;
  pharmacy: boolean;
  laboratory: boolean;
  custom: string[];
}

interface DepartmentsStepProps {
  data: DepartmentsData;
  facilityTypes?: string[];
  onUpdate: (data: DepartmentsData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DepartmentsStep({ data, facilityTypes = [], onUpdate, onNext, onBack }: DepartmentsStepProps) {
  const [departments, setDepartments] = useState<DepartmentsData>(data);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customDeptName, setCustomDeptName] = useState('');
  const hasPreselected = useRef(false);

  /* ── Preselect recommended departments from facility types ── */
  useEffect(() => {
    if (hasPreselected.current) return;
    // Only preselect if the user hasn't made any manual selections yet
    const hasManualSelection = data.opd || data.pharmacy || data.laboratory || data.custom.length > 0;
    if (hasManualSelection) {
      hasPreselected.current = true;
      return;
    }
    if (facilityTypes.length === 0) return;

    const recommended: Partial<DepartmentsData> = {};
    if (facilityTypes.includes('clinic')) recommended.opd = true;
    if (facilityTypes.includes('pharmacy')) recommended.pharmacy = true;
    if (facilityTypes.includes('laboratory')) recommended.laboratory = true;

    if (Object.keys(recommended).length > 0) {
      setDepartments((prev) => ({ ...prev, ...recommended }));
      hasPreselected.current = true;
    }
  }, [facilityTypes, data]);

  const toggleDepartment = (dept: 'opd' | 'pharmacy' | 'laboratory') => {
    setDepartments((prev) => ({
      ...prev,
      [dept]: !prev[dept],
    }));
  };

  const addCustomDepartment = () => {
    if (!customDeptName.trim()) {
      showToast('Please enter a department name', 'error');
      return;
    }
    setDepartments((prev) => ({
      ...prev,
      custom: [...prev.custom, customDeptName.trim()],
    }));
    setCustomDeptName('');
    setShowCustomInput(false);
    showToast('Custom department added', 'success');
  };

  const removeCustomDepartment = (index: number) => {
    setDepartments((prev) => ({
      ...prev,
      custom: prev.custom.filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
    onUpdate(departments);
    onNext();
  };

  /* ── Derive which departments were auto-recommended ── */
  const recommendedKeys = new Set<string>();
  if (facilityTypes.includes('clinic')) recommendedKeys.add('opd');
  if (facilityTypes.includes('pharmacy')) recommendedKeys.add('pharmacy');
  if (facilityTypes.includes('laboratory')) recommendedKeys.add('laboratory');

  const hasAnySelected =
    departments.opd || departments.pharmacy || departments.laboratory || departments.custom.length > 0;

  return (
    <div className="p-4 space-y-6 pb-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-aba-neutral-900 mb-2">
          Departments <span className="text-aba-neutral-500 font-normal text-base">(Optional)</span>
        </h2>
        <p className="text-sm text-aba-neutral-600 leading-relaxed">
          Recommended departments have been added based on your selected facility types. You can customize now or later.
        </p>
      </div>

      {/* Recommended info banner (shown when we auto-selected something) */}
      {recommendedKeys.size > 0 && (
        <div className="flex items-start gap-3 bg-[#E9F8F0] border border-[#56D8A8]/15 rounded-xl p-3.5">
          <Sparkles className="w-4 h-4 text-[#56D8A8] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-aba-neutral-700 leading-relaxed">
            <span className="font-semibold text-[#56D8A8]">Auto-recommended:</span>{' '}
            {[
              recommendedKeys.has('opd') && 'OPD',
              recommendedKeys.has('pharmacy') && 'Pharmacy',
              recommendedKeys.has('laboratory') && 'Laboratory',
            ]
              .filter(Boolean)
              .join(', ')}{' '}
            based on your facility types. Tap to toggle.
          </p>
        </div>
      )}

      {/* Department Cards */}
      <div className="space-y-3">
        {/* OPD */}
        <button
          onClick={() => toggleDepartment('opd')}
          className={`w-full bg-aba-neutral-0 border rounded-xl p-4 transition-all text-left ${
            departments.opd
              ? 'border-aba-primary-main shadow-md ring-2 ring-aba-primary-main/20'
              : 'border-aba-neutral-200 hover:border-aba-neutral-300'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                departments.opd
                  ? 'bg-aba-primary-main'
                  : 'bg-aba-neutral-100'
              }`}
            >
              <Building2
                className={`w-6 h-6 ${
                  departments.opd ? 'text-white' : 'text-aba-neutral-600'
                }`}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-aba-neutral-900">
                  Outpatient Department (OPD)
                </h3>
                {recommendedKeys.has('opd') && (
                  <span className="text-[9px] font-bold text-[#56D8A8] bg-[#E9F8F0] px-1.5 py-[1px] rounded-full uppercase tracking-wide flex-shrink-0">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-xs text-aba-neutral-600 mt-0.5">
                General consultations and diagnostics
              </p>
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                departments.opd
                  ? 'bg-aba-primary-main border-aba-primary-main'
                  : 'bg-aba-neutral-0 border-aba-neutral-300'
              }`}
            >
              {departments.opd && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        </button>

        {/* Pharmacy */}
        <button
          onClick={() => toggleDepartment('pharmacy')}
          className={`w-full bg-aba-neutral-0 border rounded-xl p-4 transition-all text-left ${
            departments.pharmacy
              ? 'border-aba-primary-main shadow-md ring-2 ring-aba-primary-main/20'
              : 'border-aba-neutral-200 hover:border-aba-neutral-300'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                departments.pharmacy
                  ? 'bg-aba-primary-main'
                  : 'bg-aba-neutral-100'
              }`}
            >
              <Pill
                className={`w-6 h-6 ${
                  departments.pharmacy ? 'text-white' : 'text-aba-neutral-600'
                }`}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-aba-neutral-900">
                  Pharmacy
                </h3>
                {recommendedKeys.has('pharmacy') && (
                  <span className="text-[9px] font-bold text-[#56D8A8] bg-[#E9F8F0] px-1.5 py-[1px] rounded-full uppercase tracking-wide flex-shrink-0">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-xs text-aba-neutral-600 mt-0.5">
                Medication dispensing and management
              </p>
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                departments.pharmacy
                  ? 'bg-aba-primary-main border-aba-primary-main'
                  : 'bg-aba-neutral-0 border-aba-neutral-300'
              }`}
            >
              {departments.pharmacy && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        </button>

        {/* Laboratory */}
        <button
          onClick={() => toggleDepartment('laboratory')}
          className={`w-full bg-aba-neutral-0 border rounded-xl p-4 transition-all text-left ${
            departments.laboratory
              ? 'border-aba-primary-main shadow-md ring-2 ring-aba-primary-main/20'
              : 'border-aba-neutral-200 hover:border-aba-neutral-300'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                departments.laboratory
                  ? 'bg-aba-primary-main'
                  : 'bg-aba-neutral-100'
              }`}
            >
              <FlaskConical
                className={`w-6 h-6 ${
                  departments.laboratory ? 'text-white' : 'text-aba-neutral-600'
                }`}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-aba-neutral-900">
                  Laboratory
                </h3>
                {recommendedKeys.has('laboratory') && (
                  <span className="text-[9px] font-bold text-[#56D8A8] bg-[#E9F8F0] px-1.5 py-[1px] rounded-full uppercase tracking-wide flex-shrink-0">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-xs text-aba-neutral-600 mt-0.5">
                Testing and diagnostics services
              </p>
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                departments.laboratory
                  ? 'bg-aba-primary-main border-aba-primary-main'
                  : 'bg-aba-neutral-0 border-aba-neutral-300'
              }`}
            >
              {departments.laboratory && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        </button>

        {/* Custom Departments */}
        {departments.custom.map((dept, index) => (
          <div
            key={index}
            className="bg-aba-neutral-0 border border-aba-secondary-main rounded-xl p-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-aba-secondary-50 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-aba-secondary-main" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-aba-neutral-900">
                  {dept}
                </h3>
                <p className="text-xs text-aba-neutral-600 mt-0.5">
                  Custom department
                </p>
              </div>
              <button
                onClick={() => removeCustomDepartment(index)}
                className="p-2 rounded-lg hover:bg-aba-error-50 text-aba-error-main transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {/* Add Custom Department */}
        {showCustomInput ? (
          <div className="bg-aba-neutral-50 border border-aba-neutral-300 rounded-xl p-4">
            <label className="block text-xs font-medium text-aba-neutral-700 mb-2">
              Department Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customDeptName}
                onChange={(e) => setCustomDeptName(e.target.value)}
                placeholder="e.g., Radiology"
                className="flex-1 px-3 py-2 border border-aba-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aba-secondary-main"
                autoFocus
              />
              <button
                onClick={addCustomDepartment}
                className="px-4 py-2 bg-aba-secondary-main text-white text-sm font-medium rounded-lg hover:bg-aba-secondary-100 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomDeptName('');
                }}
                className="px-4 py-2 bg-aba-neutral-200 text-aba-neutral-700 text-sm font-medium rounded-lg hover:bg-aba-neutral-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCustomInput(true)}
            className="w-full border-2 border-dashed border-aba-neutral-300 rounded-xl p-4 hover:border-aba-secondary-main hover:bg-aba-secondary-50/30 transition-colors"
          >
            <div className="flex items-center justify-center gap-2 text-aba-secondary-main">
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Add Custom Department</span>
            </div>
          </button>
        )}
      </div>

      {/* Optional hint — shown when nothing is selected */}
      {!hasAnySelected && (
        <div className="bg-aba-neutral-50 border border-aba-neutral-200 rounded-xl p-3.5">
          <p className="text-xs text-aba-neutral-600 text-center leading-relaxed">
            No departments selected. You can configure departments later from Settings.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <ABAButton
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onBack}
        >
          Back
        </ABAButton>
        <ABAButton
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={handleNext}
        >
          Continue
        </ABAButton>
      </div>
    </div>
  );
}