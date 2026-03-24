import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { InputField } from '../components/aba/InputField';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { Settings, Users, Clock, AlertCircle } from 'lucide-react';

export function CapacityRules() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    maxBookingsPerSlot: '3',
    bufferTimeMinutes: '15',
  });

  const handleSave = () => {
    showToast('Capacity rules updated successfully', 'success');
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Capacity Rules"
        showBack
        onBackClick={() => navigate('/operating-hours')}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-aba-secondary-50 flex items-center justify-center">
              <Settings className="w-8 h-8 text-aba-secondary-main" />
            </div>
          </div>
          <div className="text-center mb-6">
            <h2 className="font-semibold text-aba-neutral-900 mb-1 text-[16px]">
              Capacity Rules
            </h2>
            <p className="text-sm text-aba-neutral-600">
              Configure booking limits and buffer times
            </p>
          </div>

          {/* Settings Card */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4 space-y-6">
            {/* Max Bookings Per Slot */}
            <div>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-aba-primary-50 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-aba-primary-main" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-aba-neutral-900 mb-1">
                    Maximum Bookings Per Slot
                  </h3>
                  <p className="text-xs text-aba-neutral-600 mb-3">
                    Set how many appointments can be booked in the same time
                    slot
                  </p>
                  <InputField
                    type="number"
                    min="1"
                    max="10"
                    value={formData.maxBookingsPerSlot}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxBookingsPerSlot: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="bg-aba-neutral-50 rounded-lg p-3">
                <p className="text-xs text-aba-neutral-700 text-[#8f9aa1]">
                  <span className="font-medium">Example:</span> With a limit of{' '}
                  {formData.maxBookingsPerSlot}, you can book up to{' '}
                  {formData.maxBookingsPerSlot} clients at 9:00 AM if they're
                  seeing different therapists or services.
                </p>
              </div>
            </div>

            {/* Buffer Time */}
            <div className="border-t border-aba-neutral-200 pt-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-aba-secondary-main" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-aba-neutral-900 mb-1">
                    Buffer Time Between Appointments
                  </h3>
                  <p className="text-xs text-aba-neutral-600 mb-3">
                    Add extra time between appointments for preparation and
                    cleanup
                  </p>
                  <div className="flex items-center gap-2">
                    <InputField
                      type="number"
                      min="0"
                      max="60"
                      step="5"
                      value={formData.bufferTimeMinutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bufferTimeMinutes: e.target.value,
                        })
                      }
                    />
                    <span className="text-sm text-aba-neutral-600">
                      minutes
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-aba-neutral-50 rounded-lg p-3">
                <p className="text-xs text-aba-neutral-700 text-[#8f9aa1]">
                  <span className="font-medium">Example:</span> If an
                  appointment ends at 10:00 AM with a {formData.bufferTimeMinutes}
                  -minute buffer, the next available slot will be at 10:
                  {String(parseInt(formData.bufferTimeMinutes)).padStart(2, '0')}{' '}
                  AM.
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-aba-secondary-50 border border-aba-secondary-200 rounded-xl p-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-aba-secondary-main mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-aba-neutral-900 mb-1">
                Best Practices
              </p>
              <ul className="text-xs text-aba-neutral-700 space-y-1">
                <li>• Set realistic limits based on your staff capacity</li>
                <li>
                  • Add buffer time to prevent therapist burnout and allow for
                  notes
                </li>
                <li>
                  • These rules apply to all new bookings but won't affect
                  existing ones
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <h3 className="text-sm font-semibold text-aba-neutral-900 mb-3">
              Quick Presets
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  setFormData({ maxBookingsPerSlot: '2', bufferTimeMinutes: '10' })
                }
                className="px-4 py-3 bg-white rounded-xl border border-aba-neutral-200 hover:bg-aba-neutral-50 transition-colors text-left"
              >
                <p className="text-sm font-medium text-aba-neutral-900 mb-1">
                  Conservative
                </p>
                <p className="text-xs text-aba-neutral-600">
                  2 slots, 10 min buffer
                </p>
              </button>
              <button
                onClick={() =>
                  setFormData({ maxBookingsPerSlot: '3', bufferTimeMinutes: '15' })
                }
                className="px-4 py-3 bg-white rounded-xl border border-aba-neutral-200 hover:bg-aba-neutral-50 transition-colors text-left"
              >
                <p className="text-sm font-medium text-aba-neutral-900 mb-1">
                  Balanced
                </p>
                <p className="text-xs text-aba-neutral-600">
                  3 slots, 15 min buffer
                </p>
              </button>
              <button
                onClick={() =>
                  setFormData({ maxBookingsPerSlot: '5', bufferTimeMinutes: '5' })
                }
                className="px-4 py-3 bg-white rounded-xl border border-aba-neutral-200 hover:bg-aba-neutral-50 transition-colors text-left"
              >
                <p className="text-sm font-medium text-aba-neutral-900 mb-1">
                  High Volume
                </p>
                <p className="text-xs text-aba-neutral-600">
                  5 slots, 5 min buffer
                </p>
              </button>
              <button
                onClick={() =>
                  setFormData({ maxBookingsPerSlot: '1', bufferTimeMinutes: '20' })
                }
                className="px-4 py-3 bg-white rounded-xl border border-aba-neutral-200 hover:bg-aba-neutral-50 transition-colors text-left"
              >
                <p className="text-sm font-medium text-aba-neutral-900 mb-1">
                  One-on-One
                </p>
                <p className="text-xs text-aba-neutral-600">
                  1 slot, 20 min buffer
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-aba-neutral-200">
        <ABAButton variant="primary" size="lg" fullWidth onClick={handleSave}>
          Save Capacity Rules
        </ABAButton>
      </div>
    </div>
  );
}