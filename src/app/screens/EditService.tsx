import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { InputField } from '../components/aba/InputField';
import { ABAButton } from '../components/aba/ABAButton';
import { ABAModal } from '../components/aba/ABAModal';
import { showToast } from '../components/aba/Toast';
import {
  Package,
  Clock,
  DollarSign,
  Tag,
  AlertCircle,
} from 'lucide-react';

type ServiceCategory = 'Consultations' | 'Lab' | 'Pharmacy';

interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  duration: string;
  price: string;
  enabled: boolean;
}

const categories: ServiceCategory[] = ['Consultations', 'Lab', 'Pharmacy'];

// Mock data
const mockServices: Record<string, Service> = {
  '1': {
    id: '1',
    name: 'Initial Consultation',
    category: 'Consultations',
    duration: '60',
    price: '150000',
    enabled: true,
  },
  '2': {
    id: '2',
    name: 'Follow-up Session',
    category: 'Consultations',
    duration: '45',
    price: '100000',
    enabled: true,
  },
  '3': {
    id: '3',
    name: 'Group Therapy',
    category: 'Consultations',
    duration: '90',
    price: '200000',
    enabled: false,
  },
  '4': {
    id: '4',
    name: 'Blood Test',
    category: 'Lab',
    duration: '15',
    price: '50000',
    enabled: true,
  },
  '5': {
    id: '5',
    name: 'Genetic Screening',
    category: 'Lab',
    duration: '30',
    price: '250000',
    enabled: true,
  },
  '6': {
    id: '6',
    name: 'Basic Medication Package',
    category: 'Pharmacy',
    duration: '',
    price: '80000',
    enabled: true,
  },
};

export function EditService() {
  const navigate = useNavigate();
  const { serviceId } = useParams();

  const originalService = serviceId ? mockServices[serviceId] : null;

  const [formData, setFormData] = useState({
    category: originalService?.category || ('' as ServiceCategory | ''),
    serviceName: originalService?.name || '',
    duration: originalService?.duration || '',
    price: originalService?.price || '',
    enabled: originalService?.enabled ?? true,
  });

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPriceChangeModal, setShowPriceChangeModal] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!originalService) {
    return (
      <div className="flex flex-col h-screen bg-aba-bg-primary">
        <AppTopBar
          title="Edit Service"
          showBack
          onBackClick={() => navigate('/services-list')}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-aba-neutral-600">Service not found</p>
        </div>
      </div>
    );
  }

  const hasPriceChanged = formData.price !== originalService.price;

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
      if (hasPriceChanged) {
        // Show price change confirmation modal
        setShowPriceChangeModal(true);
      } else {
        // Save without price change
        saveService();
      }
    }
  };

  const saveService = () => {
    showToast(`${formData.serviceName} updated successfully`, 'success');
    setTimeout(() => {
      navigate('/services-list');
    }, 500);
  };

  const handleConfirmPriceChange = () => {
    setShowPriceChangeModal(false);
    saveService();
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Edit Service"
        showBack
        onBackClick={() => navigate('/services-list')}
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
            <h2 className="text-xl font-semibold text-aba-neutral-900 mb-1">
              Edit Service
            </h2>
            <p className="text-sm text-aba-neutral-600">
              Update service details and pricing
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4 space-y-4">
            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                Category *
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-left ${
                    errors.category
                      ? 'border-aba-error-main bg-aba-error-50'
                      : 'border-aba-neutral-200 bg-white hover:border-aba-neutral-300'
                  }`}
                >
                  <Tag className="w-5 h-5 text-aba-neutral-500" />
                  <span
                    className={
                      formData.category
                        ? 'text-aba-neutral-900'
                        : 'text-aba-neutral-500'
                    }
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
              <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
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
              <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                Duration (minutes)
              </label>
              <InputField
                placeholder="e.g., 60"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                leftIcon={<Clock className="w-5 h-5" />}
              />
              <p className="text-xs text-aba-neutral-500 mt-1">
                Leave blank if not applicable
              </p>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
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
              {hasPriceChanged && (
                <p className="text-xs text-aba-warning-main mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Price has changed from UGX {originalService.price}
                </p>
              )}
            </div>

            {/* Status Toggle */}
            <div>
              <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                Status
              </label>
              <div className="flex items-center justify-between bg-aba-neutral-50 rounded-xl p-4">
                <div>
                  <p className="text-sm font-medium text-aba-neutral-900">
                    {formData.enabled ? 'Service enabled' : 'Service disabled'}
                  </p>
                  <p className="text-xs text-aba-neutral-600">
                    {formData.enabled
                      ? 'Available for booking'
                      : 'Not available for booking'}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setFormData({ ...formData, enabled: !formData.enabled })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.enabled
                      ? 'bg-aba-primary-main'
                      : 'bg-aba-neutral-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <ABAButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSubmit}
            >
              Update Service
            </ABAButton>
          </div>
        </div>
      </div>

      {/* Price Change Confirmation Modal */}
      <ABAModal
        isOpen={showPriceChangeModal}
        onClose={() => setShowPriceChangeModal(false)}
        title="Confirm Price Update"
      >
        <div className="space-y-4">
          <div className="bg-aba-warning-50 border border-aba-warning-200 rounded-xl p-4">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-aba-warning-main mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-aba-neutral-900">
                  Price Change Detected
                </p>
                <p className="text-xs text-aba-neutral-700 mt-1">
                  You are changing the price from UGX {originalService.price} to
                  UGX {formData.price}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
              Effective Date (Optional)
            </label>
            <InputField
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
            <p className="text-xs text-aba-neutral-500 mt-1">
              Leave blank to apply immediately
            </p>
          </div>

          <div className="bg-aba-neutral-50 border border-aba-neutral-200 rounded-xl p-3">
            <p className="text-xs text-aba-neutral-700">
              <span className="font-medium">Note:</span> Existing bookings will
              not be affected by this price change.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => setShowPriceChangeModal(false)}
            >
              Cancel
            </ABAButton>
            <ABAButton
              variant="primary"
              fullWidth
              onClick={handleConfirmPriceChange}
            >
              Confirm Update
            </ABAButton>
          </div>
        </div>
      </ABAModal>
    </div>
  );
}