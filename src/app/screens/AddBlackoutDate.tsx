import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { BottomNav } from '../components/aba/BottomNav';
import { InputField } from '../components/aba/InputField';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { ChevronLeft, Calendar, AlertCircle } from 'lucide-react';

export function AddBlackoutDate() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('settings');
  const [formData, setFormData] = useState({
    date: '',
    reason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      showToast('Blackout date added successfully', 'success');
      setTimeout(() => {
        navigate('/blackout-dates');
      }, 500);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Add Blackout Date"
        showBack
        onBackClick={() => navigate(-1)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-aba-warning-50 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-aba-warning-main" />
            </div>
          </div>
          <div className="text-center mb-6">
            <h2 className="font-semibold text-aba-neutral-900 mb-1 text-[16px]">
              Add Blackout Date
            </h2>
            <p className="text-sm text-aba-neutral-600">
              Block a date from accepting bookings
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4 space-y-4">
            {/* Date */}
            <div>
              <label className="block font-medium text-aba-neutral-900 mb-2 text-[12px] text-[#8f9aa1]">
                Date *
              </label>
              <InputField
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value });
                  if (errors.date) {
                    setErrors({ ...errors, date: '' });
                  }
                }}
                error={errors.date}
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block font-medium text-aba-neutral-900 mb-2 text-[12px] text-[#8f9aa1]">
                Reason *
              </label>
              <textarea
                placeholder="e.g., Public Holiday, Staff Training"
                value={formData.reason}
                onChange={(e) => {
                  setFormData({ ...formData, reason: e.target.value });
                  setErrors({ ...errors, reason: '' });
                }}
                rows={3}
                className="w-full px-4 py-3 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-aba-neutral-900 text-[14px] placeholder:text-aba-neutral-600 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main focus:border-transparent transition-all resize-none"
              />
              {errors.reason && (
                <p className="text-xs text-aba-error-main mt-1">
                  {errors.reason}
                </p>
              )}
            </div>
          </div>

          {/* Warning Box */}
          <div className="bg-aba-warning-50 border border-aba-warning-200 rounded-xl p-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-aba-warning-main mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-aba-neutral-900 mb-1">
                Important
              </p>
              <p className="text-aba-neutral-700 text-[14px]">
                Adding a blackout date will prevent new bookings on this date.
                Existing bookings will need to be manually rescheduled.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="p-4 border-t border-aba-neutral-200 bg-white">
        <ABAButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSubmit}
        >
          Add Blackout Date
        </ABAButton>
      </div>
    </div>
  );
}