import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { InputField } from '../components/aba/InputField';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { ChevronLeft, Package, Clock, DollarSign, Tag } from 'lucide-react';

type ServiceCategory = 'Consultations' | 'Lab' | 'Pharmacy';

const categories: ServiceCategory[] = ['Consultations', 'Lab', 'Pharmacy'];

export function AddService() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '' as ServiceCategory | '',
    serviceName: '',
    duration: '',
    price: '',
    enabled: true,
  });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.serviceName.trim()) {
      newErrors.serviceName = 'Service name is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      showToast(`${formData.serviceName} added successfully`, 'success');
      setTimeout(() => {
        navigate('/services-list');
      }, 500);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Add Service"
        showBack
        onBackClick={() => navigate(-1)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-aba-primary-50 flex items-center justify-center">
              <Package className="w-8 h-8 text-aba-primary-main" />
            </div>
          </div>
          <div className="text-center mb-6">
            <h2 className="font-semibold text-aba-neutral-900 mb-1 text-[16px]">
              Add New Service
            </h2>
            <p className="text-sm text-aba-neutral-600">
              Enter service details and pricing
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4 space-y-4">
            {/* Category Dropdown */}
            <div>
              <label className="block text-[12px] font-medium text-[#8F9AA1] mb-2">
                Category *
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[14px] border transition-colors text-left ${
                    errors.category
                      ? 'border-aba-error-main bg-aba-error-50'
                      : 'border-aba-neutral-200 bg-white hover:border-aba-neutral-300'
                  }`}
                >
                  <Tag className="w-5 h-5 text-aba-neutral-500" />
                  <span
                    className={`text-[14px] ${
                      formData.category
                        ? 'text-aba-neutral-900'
                        : 'text-aba-neutral-500'
                    }`}
                  >
                    {formData.category || 'Select category'}
                  </span>
                </button>
                {errors.category && (
                  <p className="text-xs text-aba-error-main mt-1">
                    {errors.category}
                  </p>
                )}

                {/* Dropdown Menu */}
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-aba-neutral-200 shadow-lg z-10">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setFormData({ ...formData, category });
                          setShowCategoryDropdown(false);
                          if (errors.category) {
                            setErrors({ ...errors, category: '' });
                          }
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          formData.category === category
                            ? 'bg-aba-primary-50 text-aba-primary-main font-medium'
                            : 'text-aba-neutral-900 hover:bg-aba-neutral-50'
                        } ${category === categories[0] ? 'rounded-t-xl' : ''} ${
                          category === categories[categories.length - 1]
                            ? 'rounded-b-xl'
                            : ''
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Service Name */}
            <div>
              <label className="block text-[12px] font-medium text-[#8F9AA1] mb-2">
                Service Name *
              </label>
              <InputField
                placeholder="e.g., Initial Consultation"
                value={formData.serviceName}
                onChange={(e) => {
                  setFormData({ ...formData, serviceName: e.target.value });
                  if (errors.serviceName) {
                    setErrors({ ...errors, serviceName: '' });
                  }
                }}
                error={errors.serviceName}
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-[12px] font-medium text-[#8F9AA1] mb-2">
                Duration
              </label>
              <InputField
                placeholder="e.g., 60 min (optional)"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                leftIcon={<Clock className="w-5 h-5" />}
              />
              <p className="text-xs text-aba-neutral-500 mt-1 text-[#8f9aa1]">
                Leave blank if not applicable (e.g., pharmacy items)
              </p>
            </div>

            {/* Price */}
            <div>
              <label className="block text-[12px] font-medium text-[#8F9AA1] mb-2">
                Price *
              </label>
              <InputField
                placeholder="e.g., 150000"
                value={formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value });
                  if (errors.price) {
                    setErrors({ ...errors, price: '' });
                  }
                }}
                leftIcon={<DollarSign className="w-5 h-5" />}
                error={errors.price}
              />
              <p className="text-xs text-aba-neutral-500 mt-1 text-[#8f9aa1]">
                Enter amount in UGX (without currency symbol)
              </p>
            </div>

            {/* Status Toggle */}
            <div>
              <label className="block text-[12px] font-medium text-[#8F9AA1] mb-2">
                Status
              </label>
              <div className="flex items-center justify-between bg-aba-neutral-50 rounded-xl p-4">
                <div>
                  <p className="text-sm font-medium text-aba-neutral-900">
                    Enable service
                  </p>
                  <p className="text-xs text-aba-neutral-600">
                    Service will be available immediately
                  </p>
                </div>
                <button
                  onClick={() =>
                    setFormData({ ...formData, enabled: !formData.enabled })
                  }
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    formData.enabled
                      ? 'bg-aba-primary-main'
                      : 'bg-aba-neutral-200 border border-aba-neutral-400'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                      formData.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button - removed from here, moved to bottom */}
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
          Save Service
        </ABAButton>
      </div>
    </div>
  );
}