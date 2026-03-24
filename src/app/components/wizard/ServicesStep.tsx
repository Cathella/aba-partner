import { useState } from 'react';
import { ABAButton } from '../aba/ABAButton';
import { ABABadge } from '../aba/ABABadge';
import { showToast } from '../aba/Toast';
import { Plus, X, Edit2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  category: string;
  price: string;
  duration: string;
}

interface ServicesStepProps {
  data: Service[];
  onUpdate: (data: Service[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ServicesStep({ data, onUpdate, onNext, onBack }: ServicesStepProps) {
  const [services, setServices] = useState<Service[]>(data);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    duration: '',
  });

  const categories = ['Consultation', 'Therapy', 'Assessment', 'Laboratory', 'Pharmacy', 'Other'];

  const categoryColors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
    Consultation: 'primary',
    Therapy: 'secondary',
    Assessment: 'info',
    Laboratory: 'success',
    Pharmacy: 'warning',
    Other: 'info',
  };

  const handleAddService = () => {
    if (!formData.name || !formData.category || !formData.price || !formData.duration) {
      showToast('Please complete all service fields', 'error');
      return;
    }

    const newService: Service = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category,
      price: formData.price,
      duration: formData.duration,
    };

    setServices([...services, newService]);
    setFormData({ name: '', category: '', price: '', duration: '' });
    setShowAddForm(false);
    showToast('Service added successfully', 'success');
  };

  const removeService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
    showToast('Service removed', 'info');
  };

  const handleNext = () => {
    if (services.length === 0) {
      showToast('Please add at least one service', 'error');
      return;
    }
    onUpdate(services);
    onNext();
  };

  return (
    <div className="p-4 space-y-6 pb-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-aba-neutral-900 mb-2">
          Services & Pricing
        </h2>
        <p className="text-sm text-aba-neutral-600">
          Add services offered at your clinic
        </p>
      </div>

      {/* Add Service Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full border-2 border-dashed border-aba-primary-main rounded-xl p-4 bg-aba-primary-50/30 hover:bg-aba-primary-50 transition-colors"
        >
          <div className="flex items-center justify-center gap-2 text-aba-primary-main">
            <Plus className="w-5 h-5" />
            <span className="text-sm font-semibold">Add Service</span>
          </div>
        </button>
      )}

      {/* Add Service Form */}
      {showAddForm && (
        <div className="bg-aba-neutral-0 border border-aba-primary-main rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-aba-neutral-200">
            <h3 className="text-sm font-semibold text-aba-neutral-900">
              New Service
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormData({ name: '', category: '', price: '', duration: '' });
              }}
              className="text-aba-neutral-500 hover:text-aba-neutral-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8F9AA1] mb-1">
              Service Name <span className="text-aba-error-main">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., ABA Therapy Session"
              className="w-full px-3 py-2.5 border border-aba-neutral-200 rounded bg-transparent text-sm text-aba-neutral-900 placeholder:text-aba-neutral-400 focus:outline-none focus:border-aba-primary-main"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8F9AA1] mb-1">
              Category <span className="text-aba-error-main">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2.5 border border-aba-neutral-200 rounded bg-transparent text-sm text-aba-neutral-900 focus:outline-none focus:border-aba-primary-main"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8F9AA1] mb-1">
                Price (UGX) <span className="text-aba-error-main">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="50000"
                className="w-full px-3 py-2.5 border border-aba-neutral-200 rounded bg-transparent text-sm text-aba-neutral-900 placeholder:text-aba-neutral-400 focus:outline-none focus:border-aba-primary-main"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8F9AA1] mb-1">
                Duration (min) <span className="text-aba-error-main">*</span>
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="60"
                className="w-full px-3 py-2.5 border border-aba-neutral-200 rounded bg-transparent text-sm text-aba-neutral-900 placeholder:text-aba-neutral-400 focus:outline-none focus:border-aba-primary-main"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <ABAButton
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={handleAddService}
            >
              Add Service
            </ABAButton>
          </div>
        </div>
      )}

      {/* Services List */}
      {services.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-aba-neutral-900">
            Added Services ({services.length})
          </h3>
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-aba-neutral-0 border border-aba-neutral-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-aba-neutral-900">
                        {service.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <ABABadge
                          variant={categoryColors[service.category] || 'info'}
                          size="sm"
                        >
                          {service.category}
                        </ABABadge>
                      </div>
                    </div>
                    <button
                      onClick={() => removeService(service.id)}
                      className="p-1.5 rounded-lg hover:bg-aba-error-50 text-aba-error-main transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-aba-neutral-600">
                    <span className="font-semibold text-aba-neutral-900">
                      UGX {parseInt(service.price).toLocaleString()}
                    </span>
                    <span>•</span>
                    <span>{service.duration} minutes</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Validation Warning */}
      {services.length === 0 && !showAddForm && (
        <div className="bg-aba-warning-50 border border-aba-warning-main/20 rounded-xl p-4">
          <p className="text-sm text-aba-warning-main font-medium">
            ⚠️ Add at least one service to continue
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