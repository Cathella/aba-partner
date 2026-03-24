import { useState } from 'react';
import { ABAButton } from '../aba/ABAButton';
import { showToast } from '../aba/Toast';
import { Clock, Plus, X } from 'lucide-react';

interface DaySchedule {
  day: string;
  enabled: boolean;
  openTime: string;
  closeTime: string;
  breakTime?: { start: string; end: string };
}

interface OperatingHoursStepProps {
  data: DaySchedule[];
  onUpdate: (data: DaySchedule[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OperatingHoursStep({ data, onUpdate, onNext, onBack }: OperatingHoursStepProps) {
  const [schedule, setSchedule] = useState<DaySchedule[]>(data);

  const toggleDay = (index: number) => {
    const updated = [...schedule];
    updated[index].enabled = !updated[index].enabled;
    setSchedule(updated);
  };

  const updateTime = (index: number, field: 'openTime' | 'closeTime', value: string) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  const addBreakTime = (index: number) => {
    const updated = [...schedule];
    updated[index].breakTime = { start: '12:00', end: '13:00' };
    setSchedule(updated);
  };

  const removeBreakTime = (index: number) => {
    const updated = [...schedule];
    delete updated[index].breakTime;
    setSchedule(updated);
  };

  const updateBreakTime = (index: number, field: 'start' | 'end', value: string) => {
    const updated = [...schedule];
    if (updated[index].breakTime) {
      updated[index].breakTime![field] = value;
      setSchedule(updated);
    }
  };

  const handleNext = () => {
    const hasEnabledDays = schedule.some((day) => day.enabled);
    if (!hasEnabledDays) {
      showToast('Please select at least one operating day', 'error');
      return;
    }
    onUpdate(schedule);
    onNext();
  };

  return (
    <div className="p-4 space-y-6 pb-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-aba-neutral-900 mb-2">
          Operating Hours
        </h2>
        <p className="text-sm text-aba-neutral-600">
          Set your clinic's working days and hours
        </p>
      </div>

      {/* Days List */}
      <div className="space-y-3">
        {schedule.map((day, index) => (
          <div
            key={day.day}
            className={`bg-aba-neutral-0 border rounded-xl p-4 transition-all ${
              day.enabled
                ? 'border-aba-primary-main shadow-sm'
                : 'border-aba-neutral-200'
            }`}
          >
            {/* Day Header with Checkbox */}
            <label className="flex items-center justify-between mb-3 cursor-pointer">
              <span className="text-sm font-semibold text-aba-neutral-900">
                {day.day}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={() => toggleDay(index)}
                  className="w-5 h-5 rounded border-2 border-aba-neutral-300 text-aba-primary-main focus:ring-2 focus:ring-aba-primary-main focus:ring-offset-0 cursor-pointer"
                />
              </div>
            </label>

            {/* Time Pickers */}
            {day.enabled && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                      Opens
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aba-neutral-400" />
                      <input
                        type="time"
                        value={day.openTime}
                        onChange={(e) => updateTime(index, 'openTime', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-aba-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aba-primary-main"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                      Closes
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aba-neutral-400" />
                      <input
                        type="time"
                        value={day.closeTime}
                        onChange={(e) => updateTime(index, 'closeTime', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-aba-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aba-primary-main"
                      />
                    </div>
                  </div>
                </div>

                {/* Break Time */}
                {day.breakTime ? (
                  <div className="bg-aba-neutral-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-aba-neutral-700">
                        Break Time
                      </span>
                      <button
                        onClick={() => removeBreakTime(index)}
                        className="text-aba-error-main hover:text-aba-error-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={day.breakTime.start}
                        onChange={(e) => updateBreakTime(index, 'start', e.target.value)}
                        className="w-full px-3 py-2 border border-aba-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-aba-primary-main"
                      />
                      <input
                        type="time"
                        value={day.breakTime.end}
                        onChange={(e) => updateBreakTime(index, 'end', e.target.value)}
                        className="w-full px-3 py-2 border border-aba-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-aba-primary-main"
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => addBreakTime(index)}
                    className="flex items-center gap-2 text-xs font-medium text-aba-secondary-main hover:underline"
                  >
                    <Plus className="w-4 h-4" />
                    Add break time
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Validation Warning */}
      {!schedule.some((day) => day.enabled) && (
        <div className="bg-aba-warning-50 border border-aba-warning-main/20 rounded-xl p-4">
          <p className="text-sm text-aba-warning-main font-medium">
            ⚠️ Select at least one operating day to continue
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