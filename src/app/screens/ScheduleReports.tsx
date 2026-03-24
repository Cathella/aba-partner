import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import {
  ChevronLeft,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface Schedule {
  id: string;
  reportType: string;
  frequency: 'weekly' | 'monthly';
  day: string;
  time: string;
  email: string;
  enabled: boolean;
}

const reportTypes = [
  { value: 'visits', label: 'Visits Summary' },
  { value: 'revenue', label: 'Revenue Report' },
  { value: 'booking-trends', label: 'Booking Trends' },
];

const weekDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function ScheduleReports() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: '1',
      reportType: 'revenue',
      frequency: 'weekly',
      day: 'Monday',
      time: '09:00',
      email: 'admin@clinic.com',
      enabled: true,
    },
    {
      id: '2',
      reportType: 'visits',
      frequency: 'weekly',
      day: 'Friday',
      time: '17:00',
      email: 'admin@clinic.com',
      enabled: true,
    },
    {
      id: '3',
      reportType: 'booking-trends',
      frequency: 'monthly',
      day: '1',
      time: '10:00',
      email: 'admin@clinic.com',
      enabled: false,
    },
  ]);

  const [showNewScheduleForm, setShowNewScheduleForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    reportType: 'visits',
    frequency: 'weekly' as 'weekly' | 'monthly',
    day: 'Monday',
    time: '09:00',
    email: 'admin@clinic.com',
  });

  const toggleSchedule = (id: string) => {
    setSchedules(
      schedules.map((schedule) =>
        schedule.id === id
          ? { ...schedule, enabled: !schedule.enabled }
          : schedule
      )
    );
    const schedule = schedules.find((s) => s.id === id);
    showToast(
      `${schedule?.enabled ? 'Disabled' : 'Enabled'} scheduled report`,
      'success'
    );
  };

  const handleAddSchedule = () => {
    const newId = (schedules.length + 1).toString();
    setSchedules([
      ...schedules,
      {
        id: newId,
        ...newSchedule,
        enabled: true,
      },
    ]);
    setShowNewScheduleForm(false);
    setNewSchedule({
      reportType: 'visits',
      frequency: 'weekly',
      day: 'Monday',
      time: '09:00',
      email: 'admin@clinic.com',
    });
    showToast('Scheduled report created', 'success');
  };

  const getReportLabel = (type: string) => {
    return reportTypes.find((rt) => rt.value === type)?.label || type;
  };

  const formatScheduleTime = (schedule: Schedule) => {
    if (schedule.frequency === 'weekly') {
      return `Every ${schedule.day} at ${schedule.time}`;
    } else {
      return `Monthly on day ${schedule.day} at ${schedule.time}`;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Schedule Reports"
        showBack
        onBackClick={() => navigate('/reports-home')}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Info Box */}
          <div className="bg-aba-secondary-50 border border-aba-secondary-200 rounded-xl p-4 flex items-start gap-2">
            <Mail className="w-4 h-4 text-aba-secondary-main mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-aba-neutral-900 mb-1 font-bold">
                Automated Email Reports
              </p>
              <p className="text-aba-neutral-700 text-[14px]">
                Configure automatic report generation and delivery to your email
                address. Reports are generated and sent according to your schedule.
              </p>
            </div>
          </div>

          {/* Active Schedules */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Active Schedules
              </h3>
              <span className="px-2 py-1 bg-aba-primary-50 text-aba-primary-main rounded-full text-xs font-medium">
                {schedules.filter((s) => s.enabled).length} Active
              </span>
            </div>

            {schedules.length > 0 ? (
              <div className="bg-white rounded-2xl border border-aba-neutral-200 divide-y divide-aba-neutral-200">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-aba-neutral-900">
                            {getReportLabel(schedule.reportType)}
                          </h4>
                          {schedule.enabled && (
                            <CheckCircle className="w-4 h-4 text-aba-success-main" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-aba-neutral-600">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatScheduleTime(schedule)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-aba-neutral-600">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{schedule.email}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSchedule(schedule.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          schedule.enabled
                            ? 'bg-aba-primary-main'
                            : 'bg-aba-neutral-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            schedule.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-aba-neutral-200 p-8 text-center">
                <Calendar className="w-12 h-12 text-aba-neutral-400 mx-auto mb-3" />
                <p className="text-sm text-aba-neutral-600">
                  No scheduled reports yet
                </p>
              </div>
            )}
          </div>

          {/* Add New Schedule Section */}
          {showNewScheduleForm && (
            <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  New Schedule
                </h3>
                <button
                  onClick={() => setShowNewScheduleForm(false)}
                  className="text-sm text-aba-neutral-600 hover:text-aba-neutral-900"
                >
                  Cancel
                </button>
              </div>

              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                  Report Type
                </label>
                <select
                  value={newSchedule.reportType}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, reportType: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-aba-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-aba-secondary-main"
                >
                  {reportTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                  Frequency
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      setNewSchedule({
                        ...newSchedule,
                        frequency: 'weekly',
                        day: 'Monday',
                      })
                    }
                    className={`py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      newSchedule.frequency === 'weekly'
                        ? 'border-aba-primary-main bg-aba-primary-50 text-aba-primary-main'
                        : 'border-aba-neutral-200 bg-white text-aba-neutral-700'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() =>
                      setNewSchedule({
                        ...newSchedule,
                        frequency: 'monthly',
                        day: '1',
                      })
                    }
                    className={`py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      newSchedule.frequency === 'monthly'
                        ? 'border-aba-primary-main bg-aba-primary-50 text-aba-primary-main'
                        : 'border-aba-neutral-200 bg-white text-aba-neutral-700'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Day Selection */}
              <div>
                <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                  {newSchedule.frequency === 'weekly'
                    ? 'Day of Week'
                    : 'Day of Month'}
                </label>
                {newSchedule.frequency === 'weekly' ? (
                  <select
                    value={newSchedule.day}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, day: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-aba-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-aba-secondary-main"
                  >
                    {weekDays.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={newSchedule.day}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, day: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-aba-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-aba-secondary-main"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day.toString()}>
                        Day {day}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, time: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-aba-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-aba-secondary-main"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newSchedule.email}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, email: e.target.value })
                  }
                  placeholder="admin@clinic.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-aba-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-aba-secondary-main"
                />
              </div>

              {/* Save Button */}
              <ABAButton
                variant="primary"
                size="md"
                fullWidth
                onClick={handleAddSchedule}
              >
                <CheckCircle className="w-5 h-5" />
                Create Schedule
              </ABAButton>
            </div>
          )}

          {/* Help Text */}
          <div className="bg-aba-neutral-50 border border-aba-neutral-200 rounded-xl p-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-aba-neutral-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-aba-neutral-700 text-[14px]">
                <span className="font-medium">Note:</span> Scheduled reports are
                generated automatically and sent to the specified email address.
                Reports include data from the previous period based on the frequency
                selected.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      {!showNewScheduleForm && (
        <div className="flex-shrink-0 p-4 border-t border-aba-neutral-200 bg-white">
          <ABAButton
            variant="primary"
            size="md"
            fullWidth
            onClick={() => setShowNewScheduleForm(true)}
          >
            <Calendar className="w-5 h-5" />
            Add New Schedule
          </ABAButton>
        </div>
      )}
    </div>
  );
}