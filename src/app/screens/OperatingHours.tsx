import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { InputField } from '../components/aba/InputField';
import { showToast } from '../components/aba/Toast';
import {
  ChevronLeft,
  Clock,
  Plus,
  X,
  Calendar,
  Settings as SettingsIcon,
} from 'lucide-react';

interface TimeSlot {
  open: string;
  close: string;
}

interface Break {
  id: string;
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
  breaks: Break[];
}

type WeekSchedule = {
  [key: string]: DaySchedule;
};

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const initialSchedule: WeekSchedule = {
  Monday: {
    enabled: true,
    slots: [{ open: '08:00', close: '17:00' }],
    breaks: [],
  },
  Tuesday: {
    enabled: true,
    slots: [{ open: '08:00', close: '17:00' }],
    breaks: [],
  },
  Wednesday: {
    enabled: true,
    slots: [{ open: '08:00', close: '17:00' }],
    breaks: [],
  },
  Thursday: {
    enabled: true,
    slots: [{ open: '08:00', close: '17:00' }],
    breaks: [],
  },
  Friday: {
    enabled: true,
    slots: [{ open: '08:00', close: '17:00' }],
    breaks: [],
  },
  Saturday: {
    enabled: false,
    slots: [{ open: '09:00', close: '13:00' }],
    breaks: [],
  },
  Sunday: {
    enabled: false,
    slots: [{ open: '09:00', close: '13:00' }],
    breaks: [],
  },
};

export function OperatingHours() {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<WeekSchedule>(initialSchedule);

  const toggleDay = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        enabled: !schedule[day].enabled,
      },
    });
  };

  const updateTime = (
    day: string,
    field: 'open' | 'close',
    value: string
  ) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        slots: [{ ...schedule[day].slots[0], [field]: value }],
      },
    });
  };

  const addBreak = (day: string) => {
    const newBreak: Break = {
      id: Date.now().toString(),
      start: '12:00',
      end: '13:00',
    };
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        breaks: [...schedule[day].breaks, newBreak],
      },
    });
  };

  const removeBreak = (day: string, breakId: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        breaks: schedule[day].breaks.filter((b) => b.id !== breakId),
      },
    });
  };

  const updateBreak = (
    day: string,
    breakId: string,
    field: 'start' | 'end',
    value: string
  ) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        breaks: schedule[day].breaks.map((b) =>
          b.id === breakId ? { ...b, [field]: value } : b
        ),
      },
    });
  };

  const handleSave = () => {
    showToast('Operating hours updated successfully', 'success');
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Operating Hours"
        showBack
        onBackClick={() => navigate(-1)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/blackout-dates')}
              className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-aba-neutral-200 hover:bg-aba-neutral-50 transition-colors"
            >
              <Calendar className="w-5 h-5 text-aba-secondary-main" />
              <span className="text-sm font-medium text-aba-neutral-900">
                Blackout Dates
              </span>
            </button>
            <button
              onClick={() => navigate('/capacity-rules')}
              className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-aba-neutral-200 hover:bg-aba-neutral-50 transition-colors"
            >
              <SettingsIcon className="w-5 h-5 text-aba-secondary-main" />
              <span className="text-sm font-medium text-aba-neutral-900">
                Capacity Rules
              </span>
            </button>
          </div>

          {/* Weekly Schedule */}
          <div>
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
              Weekly Schedule
            </h3>
            <div className="space-y-3">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="bg-white rounded-2xl border border-aba-neutral-200 p-4"
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-aba-neutral-900">
                      {day}
                    </h4>
                    <button
                      onClick={() => toggleDay(day)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        schedule[day].enabled
                          ? 'bg-aba-primary-main'
                          : 'bg-aba-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          schedule[day].enabled
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Time Slots */}
                  {schedule[day].enabled && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                            Open
                          </label>
                          <InputField
                            type="time"
                            value={schedule[day].slots[0].open}
                            onChange={(e) =>
                              updateTime(day, 'open', e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                            Close
                          </label>
                          <InputField
                            type="time"
                            value={schedule[day].slots[0].close}
                            onChange={(e) =>
                              updateTime(day, 'close', e.target.value)
                            }
                          />
                        </div>
                      </div>

                      {/* Breaks */}
                      {schedule[day].breaks.length > 0 && (
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-aba-neutral-600">
                            Breaks
                          </label>
                          {schedule[day].breaks.map((breakTime) => (
                            <div
                              key={breakTime.id}
                              className="flex items-center gap-2"
                            >
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <InputField
                                  type="time"
                                  value={breakTime.start}
                                  onChange={(e) =>
                                    updateBreak(
                                      day,
                                      breakTime.id,
                                      'start',
                                      e.target.value
                                    )
                                  }
                                />
                                <InputField
                                  type="time"
                                  value={breakTime.end}
                                  onChange={(e) =>
                                    updateBreak(
                                      day,
                                      breakTime.id,
                                      'end',
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <button
                                onClick={() => removeBreak(day, breakTime.id)}
                                className="p-2 rounded-lg hover:bg-aba-error-50 text-aba-error-main transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Break Button */}
                      <button
                        onClick={() => addBreak(day)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-aba-secondary-main hover:bg-aba-secondary-50 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Break
                      </button>
                    </div>
                  )}

                  {/* Closed Message */}
                  {!schedule[day].enabled && (
                    <button
                      onClick={() => toggleDay(day)}
                      className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-aba-neutral-50 active:bg-aba-neutral-100 transition-colors"
                    >
                      <span className="text-sm text-aba-neutral-500">Closed</span>
                      <span className="text-xs text-aba-secondary-main font-medium">Tap to open</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-aba-neutral-200">
        <ABAButton variant="primary" size="lg" fullWidth onClick={handleSave}>
          <Clock className="w-5 h-5" />
          Save Operating Hours
        </ABAButton>
      </div>
    </div>
  );
}