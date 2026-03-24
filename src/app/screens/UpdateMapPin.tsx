import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { InputField } from '../components/aba/InputField';
import { showToast } from '../components/aba/Toast';
import { Search, MapPin, Navigation } from 'lucide-react';

export function UpdateMapPin() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [coordinates, setCoordinates] = useState({
    lat: 0.3536,
    lng: 32.7554,
  });

  const handleUseLocation = () => {
    showToast('Location updated successfully', 'success');
    navigate('/clinic-information');
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Update Map Pin"
        showBack
        onBackClick={() => navigate('/clinic-information')}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="p-4 bg-white border-b border-aba-neutral-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aba-neutral-400 pointer-events-none" />
            <InputField
              type="text"
              placeholder="Search area or landmark"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
        </div>

        {/* Map Area - Placeholder */}
        <div className="flex-1 relative bg-aba-neutral-100">
          {/* Grid Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full grid grid-cols-12 grid-rows-12">
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className="border border-aba-neutral-300"></div>
              ))}
            </div>
          </div>

          {/* Center Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10">
            <div className="relative">
              <MapPin className="w-12 h-12 text-aba-secondary-main drop-shadow-lg" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-aba-secondary-main rounded-full opacity-50 blur-sm"></div>
            </div>
          </div>

          {/* Center Crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-aba-neutral-400"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-aba-neutral-400"></div>
          </div>

          {/* Mock Location Cards */}
          <div className="absolute top-4 left-4 right-4 z-20">
            <div className="bg-white rounded-xl border border-aba-neutral-200 p-3 shadow-lg">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-aba-secondary-main mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-aba-neutral-900">
                    Mukono Town Center
                  </p>
                  <p className="text-xs text-aba-neutral-600">
                    Mukono District, Uganda
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Location Button */}
          <button
            className="absolute bottom-24 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-aba-neutral-200 hover:bg-aba-neutral-50 active:bg-aba-neutral-100 transition-colors"
            onClick={() => {
              showToast('Using current location', 'success');
            }}
          >
            <Navigation className="w-5 h-5 text-aba-secondary-main" />
          </button>

          {/* Instructions */}
          <div className="absolute bottom-24 left-4 right-20 bg-white/95 backdrop-blur-sm rounded-xl border border-aba-neutral-200 p-3 shadow-lg">
            <p className="text-xs text-aba-neutral-700">
              <span className="font-semibold">Tip:</span> Drag the map to position
              the pin at your clinic's exact location.
            </p>
          </div>

          {/* Coordinates Display */}
          <div className="absolute top-20 right-4 bg-white rounded-lg border border-aba-neutral-200 px-3 py-2 shadow-md">
            <p className="text-xs font-mono text-aba-neutral-600">
              {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="p-4 bg-white border-t border-aba-neutral-200">
          <ABAButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleUseLocation}
          >
            <MapPin className="w-5 h-5" />
            Use This Location
          </ABAButton>
        </div>
      </div>
    </div>
  );
}
