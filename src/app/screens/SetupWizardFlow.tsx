import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ArrowLeft } from 'lucide-react';
import { WizardProgress } from '../components/wizard/WizardProgress';
import { ClinicProfileStep } from '../components/wizard/ClinicProfileStep';
import { OperatingHoursStep } from '../components/wizard/OperatingHoursStep';
import { DepartmentsStep } from '../components/wizard/DepartmentsStep';
import { ServicesStep } from '../components/wizard/ServicesStep';
import { PaymentsStep } from '../components/wizard/PaymentsStep';
import { StaffStep } from '../components/wizard/StaffStep';
import { ReviewStep } from '../components/wizard/ReviewStep';
import { SuccessState } from '../components/wizard/SuccessState';

export interface WizardData {
  clinicProfile: {
    name: string;
    facilityType: string;
    facilityTypes: string[];
    phone: string;
    email: string;
    location: string;
  };
  operatingHours: Array<{
    day: string;
    enabled: boolean;
    openTime: string;
    closeTime: string;
    breakTime?: { start: string; end: string };
  }>;
  departments: {
    opd: boolean;
    pharmacy: boolean;
    laboratory: boolean;
    custom: string[];
  };
  services: Array<{
    id: string;
    name: string;
    category: string;
    price: string;
    duration: string;
  }>;
  staff: Array<{
    id: string;
    name: string;
    contact: string;
    role: string;
  }>;
}

export function SetupWizardFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [wizardData, setWizardData] = useState<WizardData>({
    clinicProfile: {
      name: 'Mukono Family Clinic',
      facilityType: '',
      facilityTypes: [],
      phone: '',
      email: '',
      location: 'Mukono District, Central Region, Uganda',
    },
    operatingHours: [
      { day: 'Monday', enabled: false, openTime: '08:00', closeTime: '17:00' },
      { day: 'Tuesday', enabled: false, openTime: '08:00', closeTime: '17:00' },
      { day: 'Wednesday', enabled: false, openTime: '08:00', closeTime: '17:00' },
      { day: 'Thursday', enabled: false, openTime: '08:00', closeTime: '17:00' },
      { day: 'Friday', enabled: false, openTime: '08:00', closeTime: '17:00' },
      { day: 'Saturday', enabled: false, openTime: '08:00', closeTime: '13:00' },
      { day: 'Sunday', enabled: false, openTime: '08:00', closeTime: '13:00' },
    ],
    departments: {
      opd: false,
      pharmacy: false,
      laboratory: false,
      custom: [],
    },
    services: [],
    staff: [],
  });

  const totalSteps = 7;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const updateWizardData = (section: keyof WizardData, data: any) => {
    setWizardData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  if (isSubmitted) {
    return <SuccessState onContinue={() => navigate('/clinic-dashboard')} />;
  }

  return (
    <div className="w-full min-h-screen bg-aba-neutral-100 flex items-center justify-center">
      {/* Mobile Frame Container */}
      <div className="w-[390px] h-[844px] bg-aba-neutral-100 relative overflow-hidden shadow-2xl flex flex-col">
        {/* Top Bar */}
        <AppTopBar
          title="Setup Wizard"
          leftAction={
            currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-aba-neutral-900" />
              </button>
            ) : undefined
          }
        />

        {/* Progress Indicator */}
        <WizardProgress currentStep={currentStep} totalSteps={totalSteps} />

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto">
          {currentStep === 1 && (
            <ClinicProfileStep
              data={wizardData.clinicProfile}
              onUpdate={(data) => updateWizardData('clinicProfile', data)}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <OperatingHoursStep
              data={wizardData.operatingHours}
              onUpdate={(data) => updateWizardData('operatingHours', data)}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <DepartmentsStep
              data={wizardData.departments}
              facilityTypes={wizardData.clinicProfile.facilityTypes || []}
              onUpdate={(data) => updateWizardData('departments', data)}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <ServicesStep
              data={wizardData.services}
              onUpdate={(data) => updateWizardData('services', data)}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 5 && (
            <PaymentsStep
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 6 && (
            <StaffStep
              data={wizardData.staff}
              onUpdate={(data) => updateWizardData('staff', data)}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 7 && (
            <ReviewStep
              wizardData={wizardData}
              onSubmit={handleSubmit}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}