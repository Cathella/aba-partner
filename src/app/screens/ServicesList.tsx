import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { ABABadge } from '../components/aba/ABABadge';
import { ListCard, ListCardItem } from '../components/aba/Cards';
import { ABAModal } from '../components/aba/ABAModal';
import { showToast } from '../components/aba/Toast';
import {
  ChevronLeft,
  Plus,
  Clock,
  DollarSign,
  Edit,
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

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Initial Consultation',
    category: 'Consultations',
    duration: '60 min',
    price: 'UGX 150,000',
    enabled: true,
  },
  {
    id: '2',
    name: 'Follow-up Session',
    category: 'Consultations',
    duration: '45 min',
    price: 'UGX 100,000',
    enabled: true,
  },
  {
    id: '3',
    name: 'Group Therapy',
    category: 'Consultations',
    duration: '90 min',
    price: 'UGX 200,000',
    enabled: false,
  },
  {
    id: '4',
    name: 'Blood Test',
    category: 'Lab',
    duration: '15 min',
    price: 'UGX 50,000',
    enabled: true,
  },
  {
    id: '5',
    name: 'Genetic Screening',
    category: 'Lab',
    duration: '30 min',
    price: 'UGX 250,000',
    enabled: true,
  },
  {
    id: '6',
    name: 'Basic Medication Package',
    category: 'Pharmacy',
    duration: '-',
    price: 'UGX 80,000',
    enabled: true,
  },
  {
    id: '7',
    name: 'Premium Supplements',
    category: 'Pharmacy',
    duration: '-',
    price: 'UGX 120,000',
    enabled: false,
  },
];

export function ServicesList() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('Consultations');
  const [services, setServices] = useState(mockServices);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [disableReason, setDisableReason] = useState('');

  const categories: ServiceCategory[] = ['Consultations', 'Lab', 'Pharmacy'];

  const filteredServices = services.filter(
    (service) => service.category === selectedCategory
  );

  const handleToggleService = (service: Service) => {
    if (service.enabled) {
      // Disable - show modal
      setSelectedService(service);
      setShowDisableModal(true);
    } else {
      // Enable - direct action
      setServices(
        services.map((s) =>
          s.id === service.id ? { ...s, enabled: true } : s
        )
      );
      showToast(`${service.name} enabled`, 'success');
    }
  };

  const handleDisableService = () => {
    if (selectedService && disableReason.trim()) {
      setServices(
        services.map((s) =>
          s.id === selectedService.id ? { ...s, enabled: false } : s
        )
      );
      showToast(`${selectedService.name} disabled`, 'success');
      setShowDisableModal(false);
      setSelectedService(null);
      setDisableReason('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Services & Pricing"
        showBack
        onBackClick={() => navigate(-1)}
        rightAction={
          <ABAButton
            variant="primary"
            size="sm"
            onClick={() => navigate('/add-service')}
          >
            <Plus className="w-4 h-4" />
            Add
          </ABAButton>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-aba-neutral-900 text-white'
                    : 'bg-white text-aba-neutral-700 border border-aba-neutral-200 hover:bg-aba-neutral-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Service Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-aba-neutral-600">
              {filteredServices.length}{' '}
              {filteredServices.length === 1 ? 'service' : 'services'}
            </p>
            <p className="text-sm text-aba-neutral-600">
              {filteredServices.filter((s) => s.enabled).length} enabled
            </p>
          </div>

          {/* Services List */}
          {filteredServices.length > 0 ? (
            <ListCard>
              {filteredServices.map((service) => (
                <ListCardItem
                  key={service.id}
                  onClick={() => navigate(`/edit-service/${service.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-aba-neutral-900">
                        {service.name}
                      </p>
                      {!service.enabled && (
                        <ABABadge variant="default" size="sm">
                          Disabled
                        </ABABadge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-aba-neutral-600">
                      {service.duration !== '-' && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{service.duration}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{service.price}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-service/${service.id}`);
                      }}
                      className="p-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
                    >
                      <Edit className="w-4 h-4 text-aba-neutral-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleService(service);
                      }}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        service.enabled
                          ? 'bg-aba-primary-main'
                          : 'bg-aba-neutral-200 border border-aba-neutral-400'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                          service.enabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </ListCardItem>
              ))}
            </ListCard>
          ) : (
            <div className="bg-white rounded-2xl border border-aba-neutral-200 p-8 text-center">
              <p className="text-sm text-aba-neutral-600">
                No services found in {selectedCategory}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Disable Service Modal */}
      <ABAModal
        isOpen={showDisableModal}
        onClose={() => {
          setShowDisableModal(false);
          setSelectedService(null);
          setDisableReason('');
        }}
        title="Disable Service"
      >
        <div className="space-y-4">
          <p className="text-sm text-aba-neutral-600">
            You are about to disable{' '}
            <span className="font-medium text-aba-neutral-900">
              {selectedService?.name}
            </span>
            . Please provide a reason.
          </p>
          <textarea
            placeholder="Enter reason for disabling service..."
            value={disableReason}
            onChange={(e) => setDisableReason(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-aba-neutral-900 placeholder:text-aba-neutral-600 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main focus:border-transparent transition-all resize-none"
          />
          <div className="bg-aba-warning-50 border border-aba-warning-200 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-aba-warning-main mt-0.5 flex-shrink-0" />
            <p className="text-xs text-aba-neutral-700">
              <span className="font-medium">Audit Note:</span> This action will
              be logged for compliance purposes.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => {
                setShowDisableModal(false);
                setSelectedService(null);
                setDisableReason('');
              }}
            >
              Cancel
            </ABAButton>
            <ABAButton
              variant="destructive"
              fullWidth
              onClick={handleDisableService}
              disabled={!disableReason.trim()}
            >
              Disable Service
            </ABAButton>
          </div>
        </div>
      </ABAModal>
    </div>
  );
}