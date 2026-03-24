import { useState } from 'react';
import { ABAButton } from '../aba/ABAButton';
import { WizardData } from '../../screens/SetupWizardFlow';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Clock,
  Briefcase,
  DollarSign,
  Users,
  FlaskConical,
  Pill,
  Layers,
  Stethoscope,
} from 'lucide-react';

interface ReviewStepProps {
  wizardData: WizardData;
  onSubmit: () => void;
  onBack: () => void;
}

const FACILITY_TYPE_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  clinic: { label: 'Clinic / Health Center', icon: Stethoscope },
  laboratory: { label: 'Laboratory', icon: FlaskConical },
  pharmacy: { label: 'Pharmacy', icon: Pill },
};

export function ReviewStep({ wizardData, onSubmit, onBack }: ReviewStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const facilityTypes = wizardData.clinicProfile.facilityTypes ?? [];
  const hasClinic = facilityTypes.includes('clinic');
  const hasLaboratory = facilityTypes.includes('laboratory');
  const hasPharmacy = facilityTypes.includes('pharmacy');
  const isMultiService = facilityTypes.length > 1;

  // Validation checks
  const hasOperatingHours = wizardData.operatingHours.some((day) => day.enabled);
  const hasDepartments = wizardData.departments.opd ||
                        wizardData.departments.pharmacy ||
                        wizardData.departments.laboratory ||
                        wizardData.departments.custom.length > 0;
  const hasServices = wizardData.services.length > 0;
  const hasReceptionist = wizardData.staff.some((s) => s.role === 'Receptionist');
  const hasStaff = wizardData.staff.length > 0;

  type CheckItem = {
    label: string;
    status: string;
    icon: React.ElementType;
    warning?: string;
  };

  const checks: CheckItem[] = [
    // Always required
    {
      label: 'Facility types selected',
      status: facilityTypes.length > 0 ? 'complete' : 'incomplete',
      icon: Building2,
    },
    {
      label: 'Operating hours configured',
      status: hasOperatingHours ? 'complete' : 'incomplete',
      icon: Clock,
    },
    {
      label: 'Departments enabled',
      status: hasDepartments ? 'complete' : 'incomplete',
      icon: Building2,
    },
    {
      label: 'Payment methods configured',
      status: 'complete',
      icon: DollarSign,
    },
    // Clinic-specific
    ...(hasClinic
      ? [
          {
            label: 'Services added',
            status: hasServices ? 'complete' : 'incomplete',
            icon: Briefcase,
          },
          {
            label: 'Doctor / Nurse assigned',
            status: hasStaff ? 'complete' : 'warning',
            icon: Users,
            warning: !hasStaff ? 'You can add staff later' : undefined,
          },
          {
            label: 'Receptionist assigned',
            status: hasReceptionist ? 'complete' : 'warning',
            icon: Users,
            warning: !hasReceptionist ? 'Recommended for booking management' : undefined,
          },
        ]
      : []),
    // Laboratory-specific
    ...(hasLaboratory
      ? [
          {
            label: 'Tests Catalog',
            status: 'warning' as const,
            icon: FlaskConical,
            warning: 'Set up after wizard — link from Settings',
          },
        ]
      : []),
    // Pharmacy-specific
    ...(hasPharmacy
      ? [
          {
            label: 'Inventory setup',
            status: 'warning' as const,
            icon: Pill,
            warning: 'Set up after wizard — Pharmacy Inventory module',
          },
        ]
      : []),
  ];

  const canSubmit = hasOperatingHours && hasDepartments && facilityTypes.length > 0;

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      onSubmit();
    }, 2000);
  };

  // Build facility type display label
  const facilityTypeLabel = isMultiService
    ? 'Multi-service facility'
    : facilityTypes.length === 1
    ? FACILITY_TYPE_LABELS[facilityTypes[0]]?.label ?? 'Facility'
    : 'Facility Type Not Set';

  return (
    <div className="p-4 space-y-6 pb-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-aba-neutral-900 mb-2">
          Review & Submit
        </h2>
        <p className="text-sm text-aba-neutral-600">
          Verify your facility setup before going live
        </p>
      </div>

      {/* Clinic Summary */}
      <div className="bg-gradient-to-br from-aba-primary-main to-aba-primary-100 rounded-xl p-4 text-white">
        <h3 className="text-lg font-semibold mb-1">
          {wizardData.clinicProfile.name}
        </h3>
        <div className="flex items-center gap-1.5 mb-3">
          {isMultiService && <Layers className="w-3.5 h-3.5 opacity-90" />}
          <p className="text-sm opacity-90">
            {facilityTypeLabel}
          </p>
        </div>
        {/* Facility type chips */}
        {facilityTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {facilityTypes.map((key) => {
              const ft = FACILITY_TYPE_LABELS[key];
              if (!ft) return null;
              const Icon = ft.icon;
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium"
                >
                  <Icon className="w-3 h-3" />
                  {ft.label}
                </span>
              );
            })}
          </div>
        )}
        <div className="space-y-1 text-xs opacity-90">
          <p>📧 {wizardData.clinicProfile.email || 'Not provided'}</p>
          <p>📱 {wizardData.clinicProfile.phone || 'Not provided'}</p>
        </div>
      </div>

      {/* Validation Checklist */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-aba-neutral-900">
          Setup Checklist
        </h3>
        {checks.map((check, index) => {
          const Icon = check.icon;
          return (
            <div
              key={index}
              className={`bg-aba-neutral-0 border rounded-xl p-3 ${
                check.status === 'complete'
                  ? 'border-aba-success-main/30 bg-aba-success-50/30'
                  : check.status === 'warning'
                  ? 'border-aba-warning-main/30 bg-aba-warning-50/30'
                  : 'border-aba-error-main/30 bg-aba-error-50/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    check.status === 'complete'
                      ? 'bg-aba-success-main text-white'
                      : check.status === 'warning'
                      ? 'bg-aba-warning-main text-white'
                      : 'bg-aba-error-main text-white'
                  }`}
                >
                  {check.status === 'complete' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : check.status === 'warning' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      check.status === 'complete'
                        ? 'text-aba-success-main'
                        : check.status === 'warning'
                        ? 'text-aba-warning-main'
                        : 'text-aba-error-main'
                    }`}
                  >
                    {check.label}
                  </p>
                  {check.warning && (
                    <p className="text-xs text-aba-neutral-600 mt-0.5">
                      {check.warning}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-aba-neutral-0 border border-aba-neutral-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-aba-primary-main">
            {wizardData.operatingHours.filter((d) => d.enabled).length}
          </p>
          <p className="text-xs text-aba-neutral-600 mt-1">Days Open</p>
        </div>
        <div className="bg-aba-neutral-0 border border-aba-neutral-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-aba-primary-main">
            {wizardData.services.length}
          </p>
          <p className="text-xs text-aba-neutral-600 mt-1">Services</p>
        </div>
        <div className="bg-aba-neutral-0 border border-aba-neutral-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-aba-primary-main">
            {wizardData.staff.length}
          </p>
          <p className="text-xs text-aba-neutral-600 mt-1">Staff</p>
        </div>
      </div>

      {/* Submit Warning */}
      {!canSubmit && (
        <div className="bg-aba-error-50 border border-aba-error-main/20 rounded-xl p-4">
          <p className="text-sm text-aba-error-main font-medium">
            ❌ Complete all required steps before submitting
          </p>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-aba-neutral-50 rounded-xl p-4">
        <p className="text-xs text-aba-neutral-700 text-center">
          After submission, your facility will be reviewed and activated within 24-48 hours. You'll receive a confirmation email.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <ABAButton
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </ABAButton>
        <ABAButton
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={handleSubmit}
          disabled={!canSubmit}
          isLoading={isSubmitting}
        >
          Mark Ready for Go-Live
        </ABAButton>
      </div>
    </div>
  );
}