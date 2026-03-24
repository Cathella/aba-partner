import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABABadge } from '../components/aba/ABABadge';
import {
  MapPin,
  Clock,
  Calendar,
  Star,
  Navigation,
  Phone,
  Mail,
  Layers,
} from 'lucide-react';

export function PreviewListing() {
  const navigate = useNavigate();

  // Simulated facility types — in production this comes from facility store
  const facilityTypes = ['clinic', 'laboratory'];
  const isMultiService = facilityTypes.length > 1;

  const services = [
    'Initial Consultation',
    'Follow-up Session',
    'Group Therapy',
    'Blood Test',
  ];

  const operatingHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 5:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 1:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ];

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Preview Listing"
        showBack
        onBackClick={() => navigate('/clinic-information')}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Preview Notice */}
          <div className="bg-aba-secondary-50 border border-aba-secondary-main/20 rounded-xl p-3 flex items-start gap-2">
            <div className="w-1 h-full bg-aba-secondary-main rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-aba-neutral-900 mb-1">
                Preview Mode
              </p>
              <p className="text-xs text-aba-neutral-700">
                This is how your clinic will appear in AbaAccess. Members will
                see this information when searching for facilities.
              </p>
            </div>
          </div>

          {/* Main Listing Card */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 overflow-hidden">
            {/* Header Image Placeholder */}
            <div className="h-32 bg-gradient-to-br from-aba-primary-200 to-aba-primary-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center mb-2">
                  <MapPin className="w-8 h-8 text-aba-primary-main" />
                </div>
                <p className="text-xs text-aba-neutral-600 text-[#a1a1a1]">
                  Facility photo placeholder
                </p>
              </div>
            </div>

            {/* Clinic Info */}
            <div className="p-4">
              {/* Clinic Name & Status */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-aba-neutral-900 mb-1">
                    Mukono Family Clinic
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <ABABadge variant="success" size="sm">
                      Open Now
                    </ABABadge>
                    <span className="text-xs text-aba-neutral-500">•</span>
                    {isMultiService ? (
                      <span className="inline-flex items-center gap-1 text-xs text-aba-primary-main font-medium">
                        <Layers className="w-3 h-3" />
                        Multi-service facility
                      </span>
                    ) : (
                      <span className="text-xs text-aba-neutral-600">Clinic</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating (Mock) */}
              <div className="flex items-center gap-1 mb-3">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-3.5 h-3.5 text-aba-warning-main fill-aba-warning-main"
                    />
                  ))}
                </div>
                <span className="text-xs text-aba-neutral-600 ml-1">
                  4.8 (124 reviews)
                </span>
              </div>

              {/* Location */}
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-4 h-4 text-aba-neutral-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-aba-neutral-900">
                    123 Main Street, Mukono Town
                  </p>
                  <p className="text-xs text-aba-neutral-600">
                    Mukono • Near Mukono Police Station
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Navigation className="w-3 h-3 text-aba-secondary-main" />
                    <span className="text-aba-secondary-main font-medium text-[14px]">
                      2.4 km away
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-aba-neutral-500 flex-shrink-0" />
                  <a
                    href="tel:+256700123456"
                    className="text-sm text-aba-secondary-main hover:underline"
                  >
                    +256 700 123 456
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-aba-neutral-500 flex-shrink-0" />
                  <a
                    href="mailto:admin@mukono.clinic"
                    className="text-sm text-aba-secondary-main hover:underline"
                  >
                    admin@mukono.clinic
                  </a>
                </div>
              </div>

              {/* Services Offered */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-aba-neutral-700" />
                  <h3 className="text-sm font-semibold text-aba-neutral-900">
                    Services Offered
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {services.slice(0, 3).map((service, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-aba-neutral-100 rounded-full text-xs text-aba-neutral-700"
                    >
                      {service}
                    </span>
                  ))}
                  {services.length > 3 && (
                    <span className="px-3 py-1.5 bg-aba-neutral-100 rounded-full text-xs text-aba-neutral-700">
                      +{services.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Operating Hours */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-aba-neutral-700" />
                  <h3 className="text-sm font-semibold text-aba-neutral-900">
                    Operating Hours
                  </h3>
                </div>
                <div className="bg-aba-neutral-50 rounded-xl p-3 space-y-2">
                  {operatingHours.map((schedule, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-aba-neutral-700">
                        {schedule.day}
                      </span>
                      <span className="text-xs font-medium text-aba-neutral-900">
                        {schedule.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book Visit Button (Disabled Preview) */}
              <button
                disabled
                className="w-full py-3 bg-aba-neutral-200 text-aba-neutral-500 rounded-xl text-sm font-semibold cursor-not-allowed"
              >
                Book Visit (Preview Only)
              </button>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="bg-aba-neutral-50 border border-aba-neutral-200 rounded-xl p-3">
            <p className="text-xs text-aba-neutral-700 text-center">
              This is a preview. Members will book from the AbaAccess mobile app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}