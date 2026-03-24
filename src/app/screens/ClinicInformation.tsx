import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { InputField } from '../components/aba/InputField';
import { ABABadge } from '../components/aba/ABABadge';
import { ABAModal } from '../components/aba/ABAModal';
import { showToast } from '../components/aba/Toast';
import {
  MapPin,
  Check,
  Eye,
  Upload,
  AlertCircle,
  Building2,
  ChevronRight,
  Lock,
  Info,
  Clock,
  FlaskConical,
  Pill,
  Stethoscope,
  Users,
  ClipboardList,
  CalendarCheck,
  BarChart3,
  CreditCard,
  Settings,
  Layers,
  Package,
} from 'lucide-react';

// Facility type definitions
type FacilityTypeKey = 'clinic' | 'laboratory' | 'pharmacy';

interface FacilityTypeOption {
  key: FacilityTypeKey;
  label: string;
  icon: React.ElementType;
  description: string;
}

const FACILITY_TYPES: FacilityTypeOption[] = [
  {
    key: 'clinic',
    label: 'Clinic / Health Center',
    icon: Stethoscope,
    description: 'Doctor, Nurse, Reception, Bookings & Queue',
  },
  {
    key: 'laboratory',
    label: 'Laboratory',
    icon: FlaskConical,
    description: 'Lab Worklist, Results, Quality Control',
  },
  {
    key: 'pharmacy',
    label: 'Pharmacy',
    icon: Pill,
    description: 'Prescription Queue, OTC Requests, Inventory',
  },
];

// Module definitions keyed by facility type
const MODULE_MAP: Record<FacilityTypeKey, { label: string; icon: React.ElementType }[]> = {
  clinic: [
    { label: 'Doctor', icon: Stethoscope },
    { label: 'Nurse', icon: Users },
    { label: 'Reception', icon: ClipboardList },
    { label: 'Bookings / Queue', icon: CalendarCheck },
  ],
  laboratory: [
    { label: 'Lab Worklist', icon: FlaskConical },
    { label: 'Results', icon: BarChart3 },
    { label: 'Quality Control', icon: ClipboardList },
  ],
  pharmacy: [
    { label: 'Prescription Queue', icon: Pill },
    { label: 'OTC Requests', icon: Package },
    { label: 'Inventory', icon: Layers },
  ],
};

const ALWAYS_MODULES = [
  { label: 'Payments', icon: CreditCard },
  { label: 'Reports', icon: BarChart3 },
  { label: 'Settings', icon: Settings },
];

interface ClinicData {
  name: string;
  facilityTypes: FacilityTypeKey[];
  phone: string;
  email: string;
  address: string;
  district: string;
  landmark: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

type ListingStatus = 'not_listed' | 'pending_review' | 'listed';

export function ClinicInformation() {
  const navigate = useNavigate();
  const clinicDetailsRef = useRef<HTMLDivElement>(null);

  const [clinicData, setClinicData] = useState<ClinicData>({
    name: 'Mukono Family Clinic',
    facilityTypes: ['clinic'],
    phone: '+256 700 123 456',
    email: 'admin@mukono.clinic',
    address: '123 Main Street, Mukono Town',
    district: 'Mukono',
    landmark: 'Near Mukono Police Station',
    coordinates: {
      lat: 0.3536,
      lng: 32.7554,
    },
  });

  const [listingStatus, setListingStatus] = useState<ListingStatus>('not_listed');
  const [allowBookings, setAllowBookings] = useState(true);
  const [showHours, setShowHours] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Derived: selected facility types
  const selectedTypes = clinicData.facilityTypes;
  const hasClinic = selectedTypes.includes('clinic');
  const hasLaboratory = selectedTypes.includes('laboratory');
  const hasPharmacy = selectedTypes.includes('pharmacy');
  const isMultiService = selectedTypes.length > 1;

  // Toggle a facility type
  const toggleFacilityType = (key: FacilityTypeKey) => {
    setClinicData((prev) => {
      const current = prev.facilityTypes;
      if (current.includes(key)) {
        // Must keep at least 1 selected
        if (current.length === 1) {
          showToast('At least one facility type must be selected', 'error');
          return prev;
        }
        return { ...prev, facilityTypes: current.filter((t) => t !== key) };
      }
      return { ...prev, facilityTypes: [...current, key] };
    });
  };

  // Build enabled modules list
  const enabledModules = [
    ...selectedTypes.flatMap((key) => MODULE_MAP[key]),
    ...ALWAYS_MODULES,
  ];

  // Dynamic requirements based on selected types
  const baseRequirements = {
    operatingHours: true,
    paymentMethods: true,
    contactDetails: true,
  };

  type RequirementItem = {
    key: string;
    label: string;
    met: boolean;
    action: string;
    onTap: () => void;
  };

  const requirementItems: RequirementItem[] = [
    {
      key: 'operatingHours',
      label: 'Operating hours set',
      met: baseRequirements.operatingHours,
      action: 'View',
      onTap: () => navigate('/operating-hours'),
    },
    {
      key: 'paymentMethods',
      label: 'Payment methods configured',
      met: baseRequirements.paymentMethods,
      action: 'Setup',
      onTap: () => navigate('/payment-methods'),
    },
    {
      key: 'contactDetails',
      label: 'Contact details added',
      met: baseRequirements.contactDetails,
      action: 'Edit',
      onTap: () => scrollToClinicDetails(),
    },
    // Clinic-specific
    ...(hasClinic
      ? [
          {
            key: 'services',
            label: 'Add Services',
            met: true,
            action: 'Manage',
            onTap: () => navigate('/services-list'),
          },
          {
            key: 'assignStaff',
            label: 'Assign Doctor / Nurse',
            met: true,
            action: 'Manage',
            onTap: () => navigate('/staff-list'),
          },
        ]
      : []),
    // Laboratory-specific
    ...(hasLaboratory
      ? [
          {
            key: 'testsCatalog',
            label: 'Tests Catalog',
            met: false,
            action: 'Setup',
            onTap: () => navigate('/tests-catalog'),
          },
        ]
      : []),
    // Pharmacy-specific
    ...(hasPharmacy
      ? [
          {
            key: 'inventory',
            label: 'Set up Inventory',
            met: false,
            action: 'Setup',
            onTap: () => navigate('/ph/inventory'),
          },
        ]
      : []),
  ];

  const allRequirementsMet = requirementItems.every((r) => r.met);

  const handleSaveChanges = () => {
    showToast('Facility information updated successfully', 'success');
  };

  const handleSubmit = () => {
    setListingStatus('pending_review');
    setShowSubmitModal(false);
    showToast('Submitted for review', 'success');
  };

  const handleUpdateField = (field: keyof ClinicData, value: string) => {
    setClinicData({ ...clinicData, [field]: value } as any);
  };

  const scrollToClinicDetails = () => {
    clinicDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Helper function to get badge variant
  const getBadgeVariant = (): 'warning' | 'success' | undefined => {
    if (listingStatus === 'listed') return 'success';
    if (listingStatus === 'not_listed') return 'warning';
    return undefined;
  };

  // Listing type label
  const listingTypeLabel = isMultiService
    ? 'Multi-service facility'
    : selectedTypes.length === 1
    ? FACILITY_TYPES.find((t) => t.key === selectedTypes[0])?.label ?? 'Facility'
    : 'Facility';

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Facility Information"
        showBack
        onBackClick={() => navigate('/settings')}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Clinic Details Card */}
          <div
            ref={clinicDetailsRef}
            className="bg-white rounded-2xl border border-aba-neutral-200 p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-aba-primary-main" />
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Facility Details
              </h3>
            </div>

            <div className="space-y-4">
              {/* Clinic Name (Read-only) */}
              <div>
                <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                  Facility Name
                </label>
                <div className="px-4 py-3 rounded-md border border-aba-neutral-200 bg-aba-neutral-50 text-aba-neutral-900 text-sm">
                  {clinicData.name}
                </div>
              </div>

              {/* ─── Facility Types (Multi-select chips) ─── */}
              <div>
                <label className="block text-xs font-medium text-aba-neutral-600 mb-2">
                  Facility Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {FACILITY_TYPES.map((ft) => {
                    const selected = selectedTypes.includes(ft.key);
                    const Icon = ft.icon;
                    return (
                      <button
                        key={ft.key}
                        onClick={() => toggleFacilityType(ft.key)}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all ${
                          selected
                            ? 'bg-aba-primary-50 border-aba-primary-main text-aba-neutral-900 ring-1 ring-aba-primary-main/30'
                            : 'bg-white border-aba-neutral-200 text-aba-neutral-700 active:bg-aba-neutral-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">{ft.label}</span>
                        {selected && (
                          <div className="w-4 h-4 rounded-full bg-aba-primary-main flex items-center justify-center ml-1">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-aba-neutral-500 mt-2">
                  Select 1–3 types. You can change this later.
                </p>
              </div>

              {/* ─── Enabled Modules Summary ─── */}
              <div className="bg-aba-neutral-50 rounded-xl border border-aba-neutral-200 p-3">
                <div className="flex items-center gap-2 mb-2.5">
                  <Layers className="w-4 h-4 text-aba-primary-main" />
                  <p className="text-xs font-semibold text-aba-neutral-900">
                    Enabled Modules
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {enabledModules.map((mod, idx) => {
                    const ModIcon = mod.icon;
                    return (
                      <span
                        key={`${mod.label}-${idx}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-aba-primary-50 text-aba-neutral-900"
                      >
                        <ModIcon className="w-3 h-3" />
                        {mod.label}
                      </span>
                    );
                  })}
                </div>
                {/* Helper note */}
                <div className="flex items-start gap-2 mt-3 pt-2.5 border-t border-aba-neutral-200">
                  <Info className="w-3.5 h-3.5 text-aba-neutral-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-aba-neutral-600">
                    Selecting facility types controls which workspaces and staff
                    roles are enabled for this facility.
                  </p>
                </div>
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                  Contact Phone
                </label>
                <InputField
                  type="tel"
                  value={clinicData.phone}
                  onChange={(e) => handleUpdateField('phone', e.target.value)}
                  placeholder="+256 7XX XXX XXX"
                />
              </div>

              {/* Support Email */}
              <div>
                <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                  Support Email
                </label>
                <InputField
                  type="email"
                  value={clinicData.email}
                  onChange={(e) => handleUpdateField('email', e.target.value)}
                  placeholder="admin@clinic.com"
                />
              </div>

              {/* Physical Address */}
              <div>
                <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                  Physical Address
                </label>
                <InputField
                  type="text"
                  value={clinicData.address}
                  onChange={(e) => handleUpdateField('address', e.target.value)}
                  placeholder="Street address"
                />
              </div>

              {/* District/Area */}
              <div>
                <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                  District/Area
                </label>
                <InputField
                  type="text"
                  value={clinicData.district}
                  onChange={(e) =>
                    handleUpdateField('district', e.target.value)
                  }
                  placeholder="District or area"
                />
              </div>

              {/* Landmark (Optional) */}
              <div>
                <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                  Landmark <span className="text-aba-neutral-500">(Optional)</span>
                </label>
                <InputField
                  type="text"
                  value={clinicData.landmark}
                  onChange={(e) =>
                    handleUpdateField('landmark', e.target.value)
                  }
                  placeholder="Nearby landmark"
                />
              </div>

              {/* Save Button */}
              <ABAButton
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleSaveChanges}
              >
                Save Changes
              </ABAButton>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-aba-secondary-main" />
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Location
              </h3>
            </div>

            {/* Map Preview Placeholder */}
            <div className="bg-aba-neutral-100 rounded-xl h-40 flex items-center justify-center mb-3 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className="border border-aba-neutral-300"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-aba-secondary-main/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-aba-secondary-main" />
                </div>
                <p className="font-medium text-aba-neutral-700 text-[12px]">
                  Map Preview
                </p>
              </div>
            </div>

            <p className="text-xs text-aba-neutral-600 mb-3">
              This pin helps members find you.
            </p>

            {/* Coordinates Summary */}
            <div className="bg-aba-neutral-50 rounded-lg p-3 mb-3">
              <p className="text-xs text-aba-neutral-600 mb-1">
                Current Location
              </p>
              <p className="text-sm font-medium text-aba-neutral-900">
                {clinicData.address}
              </p>
              <p className="text-xs text-aba-neutral-500 mt-1 text-[#8f9aa1]">
                {clinicData.coordinates.lat.toFixed(4)},{' '}
                {clinicData.coordinates.lng.toFixed(4)}
              </p>
            </div>

            <ABAButton
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => navigate('/update-map-pin')}
            >
              <MapPin className="w-4 h-4" />
              Update Map Pin
            </ABAButton>
          </div>

          {/* AbaAccess Listing Card */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-aba-neutral-900">
                AbaAccess Listing
              </h3>
              {listingStatus === 'pending_review' ? (
                <div className="px-3 py-1 bg-aba-secondary-50 border border-aba-secondary-main/20 rounded-full">
                  <span className="text-xs font-semibold text-aba-secondary-main">
                    Pending Review
                  </span>
                </div>
              ) : (
                <ABABadge variant={getBadgeVariant()} size="sm">
                  {listingStatus === 'listed' ? 'Listed' : 'Not Listed'}
                </ABABadge>
              )}
            </div>

            <p className="text-sm text-aba-neutral-700 mb-1">
              Listed facilities appear in AbaAccess so members can find you and
              book visits.
            </p>

            {/* Multi-service label */}
            {isMultiService && (
              <div className="flex items-center gap-1.5 mb-2">
                <Layers className="w-3.5 h-3.5 text-aba-primary-main" />
                <span className="text-xs font-semibold text-aba-primary-main">
                  Multi-service facility
                </span>
              </div>
            )}

            <p className="text-xs text-aba-neutral-600 mb-4">
              Your request will be reviewed by ABA Ops before you appear in
              AbaAccess.
            </p>

            {/* Status Banners */}
            {listingStatus === 'pending_review' && (
              <div className="bg-aba-secondary-50 border border-aba-secondary-main/20 rounded-xl p-3 mb-4 flex items-start gap-2">
                <Clock className="w-4 h-4 text-aba-secondary-main mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-aba-neutral-900 mb-1">
                    Submitted for Review
                  </p>
                  <p className="text-xs text-aba-neutral-700">
                    ABA Ops will review and approve your listing.
                  </p>
                </div>
              </div>
            )}

            {listingStatus === 'listed' && (
              <div className="bg-aba-success-50 border border-aba-success-main/20 rounded-xl p-3 mb-4 flex items-start gap-2">
                <Check className="w-4 h-4 text-aba-success-main mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-aba-neutral-900 mb-1">
                    Approved & Listed
                  </p>
                  <p className="text-xs text-aba-neutral-700">
                    You are now listed on AbaAccess. Members can find and book visits.
                  </p>
                </div>
              </div>
            )}

            {/* Toggles */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-aba-neutral-900">
                      Allow bookings from AbaAccess
                    </p>
                    <p className="text-xs text-aba-neutral-600">
                      Members can book visits directly
                    </p>
                  </div>
                  {listingStatus !== 'listed' && (
                    <Lock className="w-4 h-4 text-aba-neutral-400 flex-shrink-0 mt-0.5" />
                  )}
                </div>
                <button
                  onClick={() => listingStatus === 'listed' && setAllowBookings(!allowBookings)}
                  disabled={listingStatus !== 'listed'}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    allowBookings && listingStatus === 'listed'
                      ? 'bg-aba-primary-main'
                      : 'bg-aba-neutral-300'
                  } ${listingStatus !== 'listed' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      allowBookings && listingStatus === 'listed'
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    Show operating hours publicly
                  </p>
                  <p className="text-xs text-aba-neutral-600">
                    Display your schedule
                  </p>
                </div>
                <button
                  onClick={() => setShowHours(!showHours)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showHours ? 'bg-aba-primary-main' : 'bg-aba-neutral-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showHours ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* ─── Dynamic Setup Checklist ─── */}
            <div className="bg-aba-neutral-50 rounded-xl p-3 mb-4">
              <p className="text-xs font-semibold text-aba-neutral-700 mb-3">
                Setup Checklist
              </p>
              <div className="divide-y divide-aba-neutral-200">
                {requirementItems.map((req) => (
                  <button
                    key={req.key}
                    onClick={req.onTap}
                    className="w-full flex items-center justify-between active:bg-white px-2 py-3 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                          req.met
                            ? 'bg-aba-success-main'
                            : 'bg-aba-neutral-300'
                        }`}
                      >
                        {req.met && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <p className="text-xs text-aba-neutral-700">
                        {req.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-aba-secondary-main font-medium">
                        {req.action}
                      </span>
                      <ChevronRight className="w-4 h-4 text-aba-secondary-main" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Warning if requirements not met */}
            {!allRequirementsMet && listingStatus === 'not_listed' && (
              <div className="bg-aba-warning-50 border border-aba-warning-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-aba-warning-main mt-0.5 flex-shrink-0" />
                <p className="text-xs text-aba-neutral-700">
                  Complete all setup checklist items to submit for listing.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {listingStatus === 'not_listed' && (
                <ABAButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => setShowSubmitModal(true)}
                  disabled={!allRequirementsMet}
                >
                  Submit for Listing Review
                </ABAButton>
              )}

              {listingStatus === 'pending_review' && (
                <ABAButton
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => setShowStatusModal(true)}
                >
                  <Info className="w-4 h-4" />
                  View Submission Status
                </ABAButton>
              )}

              <ABAButton
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => navigate('/preview-listing')}
              >
                <Eye className="w-4 h-4" />
                Preview Listing
              </ABAButton>
            </div>
          </div>

          {/* Facility Photos */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Facility Photos
              </h3>
              <span className="text-xs text-aba-neutral-500">Optional</span>
            </div>

            <p className="text-aba-neutral-700 mb-4 text-[12px] text-[#8f9aa1]">
              Add photos to help members recognize your facility.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-aba-neutral-50 border-2 border-dashed border-aba-neutral-300 rounded-xl flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5 text-aba-neutral-400" />
                  <p className="text-xs text-aba-neutral-500 text-[#8f9aa1]">Add photo</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-aba-neutral-500 text-center mt-3">
              Coming soon
            </p>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <ABAModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit for Listing Review?"
      >
        <div className="space-y-4">
          <p className="text-sm text-aba-neutral-700">
            ABA Ops will review your details before members can see and book your
            facility in AbaAccess.
          </p>

          {isMultiService && (
            <div className="bg-aba-primary-50 border border-aba-primary-main/20 rounded-xl p-3 flex items-start gap-2">
              <Layers className="w-4 h-4 text-aba-primary-main mt-0.5 flex-shrink-0" />
              <p className="text-xs text-aba-neutral-700">
                Your listing will appear as a{' '}
                <span className="font-semibold text-aba-primary-main">Multi-service facility</span>{' '}
                offering {selectedTypes.map((t) => FACILITY_TYPES.find((ft) => ft.key === t)?.label).join(', ')}.
              </p>
            </div>
          )}

          <div className="bg-aba-secondary-50 border border-aba-secondary-main/20 rounded-xl p-3">
            <p className="text-xs text-aba-neutral-700">
              <span className="font-semibold">Note:</span> Review typically takes
              1-2 business days. You'll be notified once approved.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => setShowSubmitModal(false)}
            >
              Cancel
            </ABAButton>
            <ABAButton variant="primary" fullWidth onClick={handleSubmit}>
              Submit
            </ABAButton>
          </div>
        </div>
      </ABAModal>

      {/* Submission Status Modal */}
      <ABAModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Submission Status"
      >
        <div className="space-y-4">
          <div className="bg-aba-secondary-50 border border-aba-secondary-main/20 rounded-xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-aba-secondary-main/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-aba-secondary-main" />
            </div>
            <p className="text-sm font-semibold text-aba-neutral-900 mb-2">
              Under Review
            </p>
            <p className="text-xs text-aba-neutral-700">
              ABA Ops is reviewing your listing. You'll be notified once approved.
            </p>
            {isMultiService && (
              <p className="text-xs text-aba-primary-main font-medium mt-2">
                {listingTypeLabel}
              </p>
            )}
          </div>

          <div className="bg-aba-neutral-50 rounded-xl p-3">
            <p className="text-xs text-aba-neutral-700">
              <span className="font-semibold">What happens next?</span>
            </p>
            <ul className="mt-2 space-y-1 text-xs text-aba-neutral-700 list-disc list-inside">
              <li>ABA Ops reviews your facility details</li>
              <li>You receive approval notification</li>
              <li>Your facility appears in AbaAccess</li>
            </ul>
          </div>

          <ABAButton
            variant="primary"
            fullWidth
            onClick={() => setShowStatusModal(false)}
          >
            Got It
          </ABAButton>
        </div>
      </ABAModal>
    </div>
  );
}