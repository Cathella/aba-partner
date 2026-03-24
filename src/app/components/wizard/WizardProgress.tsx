interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-aba-neutral-0 border-b border-aba-neutral-200 px-4 py-4">
      {/* Step Counter */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-aba-neutral-600">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-xs font-semibold text-aba-primary-main">
          {Math.round(progress)}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-aba-neutral-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-aba-primary-main to-aba-primary-100 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
