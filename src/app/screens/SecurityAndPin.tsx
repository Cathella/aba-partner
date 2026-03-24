import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { ABAModal } from '../components/aba/ABAModal';
import { showToast } from '../components/aba/Toast';
import {
  Lock,
  ChevronRight,
  Shield,
  Clock,
  Smartphone,
  Monitor,
  LogOut,
  AlertCircle,
} from 'lucide-react';

interface Device {
  id: string;
  name: string;
  type: 'mobile' | 'desktop';
  lastActive: string;
}

export function SecurityAndPin() {
  const navigate = useNavigate();
  
  // Toggles state
  const [requirePinRefunds, setRequirePinRefunds] = useState(true);
  const [requirePinRoleChanges, setRequirePinRoleChanges] = useState(true);
  const [requirePinSettlements, setRequirePinSettlements] = useState(true);
  const [requireOtpNewDevice, setRequireOtpNewDevice] = useState(true);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [autoLockTime, setAutoLockTime] = useState(15); // minutes
  
  // Devices
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'iPhone 13 Pro',
      type: 'mobile',
      lastActive: '2 mins ago',
    },
    {
      id: '2',
      name: 'Chrome on MacBook',
      type: 'desktop',
      lastActive: '2 days ago',
    },
  ]);
  
  // Modals
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showSignOutAllModal, setShowSignOutAllModal] = useState(false);
  const [deviceToSignOut, setDeviceToSignOut] = useState<string | null>(null);
  const [showAutoLockPicker, setShowAutoLockPicker] = useState(false);
  
  const autoLockOptions = [5, 10, 15, 30, 60];
  
  const handleSignOutDevice = () => {
    if (deviceToSignOut) {
      setDevices(devices.filter((d) => d.id !== deviceToSignOut));
      setShowSignOutModal(false);
      setDeviceToSignOut(null);
      showToast('Device signed out successfully', 'success');
    }
  };
  
  const handleSignOutAll = () => {
    setDevices([]);
    setShowSignOutAllModal(false);
    showToast('Signed out from all devices', 'success');
  };
  
  const openSignOutModal = (deviceId: string) => {
    setDeviceToSignOut(deviceId);
    setShowSignOutModal(true);
  };
  
  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Security & PIN"
        showBack
        onBackClick={() => navigate('/settings')}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* PIN Management Card */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 overflow-hidden">
            <div className="p-4 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-aba-primary-main" />
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  PIN Management
                </h3>
              </div>
            </div>
            
            {/* Change PIN */}
            <button
              onClick={() => navigate('/change-pin')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-aba-neutral-50 active:bg-aba-neutral-100 transition-colors border-t border-aba-neutral-200"
            >
              <span className="text-sm font-medium text-aba-neutral-900">
                Change PIN
              </span>
              <ChevronRight className="w-5 h-5 text-aba-neutral-400" />
            </button>
            
            {/* Reset PIN */}
            <button
              onClick={() => navigate('/reset-pin')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-aba-neutral-50 active:bg-aba-neutral-100 transition-colors border-t border-aba-neutral-200"
            >
              <span className="text-sm font-medium text-aba-neutral-900">
                Forgot PIN / Reset PIN
              </span>
              <ChevronRight className="w-5 h-5 text-aba-neutral-400" />
            </button>
            
            <div className="px-4 py-3 border-t border-aba-neutral-200">
              <p className="text-xs text-aba-neutral-600">
                PIN is required for sign-in and approving sensitive actions.
              </p>
            </div>
          </div>
          
          {/* Sensitive Actions Card */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-aba-secondary-main" />
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Sensitive Actions
              </h3>
            </div>
            
            <div className="space-y-3 mb-3">
              {/* Require PIN for refunds/voids */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    Require PIN for refunds/voids
                  </p>
                  <p className="text-xs text-aba-neutral-600">
                    Protect financial transactions
                  </p>
                </div>
                <button
                  onClick={() => setRequirePinRefunds(!requirePinRefunds)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    requirePinRefunds ? 'bg-aba-primary-main' : 'bg-aba-neutral-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      requirePinRefunds ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Require PIN for role changes */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    Require PIN for role changes
                  </p>
                  <p className="text-xs text-aba-neutral-600">
                    Control staff permissions
                  </p>
                </div>
                <button
                  onClick={() => setRequirePinRoleChanges(!requirePinRoleChanges)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    requirePinRoleChanges ? 'bg-aba-primary-main' : 'bg-aba-neutral-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      requirePinRoleChanges ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Require PIN for settlement disputes */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    Require PIN for settlement disputes
                  </p>
                  <p className="text-xs text-aba-neutral-600">
                    Approve dispute submissions
                  </p>
                </div>
                <button
                  onClick={() => setRequirePinSettlements(!requirePinSettlements)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    requirePinSettlements ? 'bg-aba-primary-main' : 'bg-aba-neutral-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      requirePinSettlements ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className="bg-aba-secondary-50 border border-aba-secondary-main/20 rounded-xl p-3 flex items-start gap-2">
              <Shield className="w-4 h-4 text-aba-secondary-main mt-0.5 flex-shrink-0" />
              <p className="text-xs text-aba-neutral-700">
                Recommended to keep these on for security.
              </p>
            </div>
          </div>
          
          {/* Login Security Card */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-aba-primary-main" />
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Login Security
              </h3>
            </div>
            
            <div className="space-y-3">
              {/* Require OTP on new device */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    Require OTP on new device
                  </p>
                  <p className="text-xs text-aba-neutral-600">
                    Extra verification for security
                  </p>
                </div>
                <button
                  onClick={() => setRequireOtpNewDevice(!requireOtpNewDevice)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    requireOtpNewDevice ? 'bg-aba-primary-main' : 'bg-aba-neutral-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      requireOtpNewDevice ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Auto-lock after inactivity */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    Auto-lock after inactivity
                  </p>
                  <p className="text-xs text-aba-neutral-600">
                    Lock app when idle
                  </p>
                </div>
                <button
                  onClick={() => setAutoLockEnabled(!autoLockEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoLockEnabled ? 'bg-aba-primary-main' : 'bg-aba-neutral-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoLockEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Auto-lock time picker */}
              {autoLockEnabled && (
                <div className="pt-2">
                  <label className="block text-xs font-medium text-aba-neutral-600 mb-2">
                    Auto-lock timeout
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowAutoLockPicker(!showAutoLockPicker)}
                      className="w-full px-4 py-3 rounded-md border border-aba-neutral-300 bg-white text-aba-neutral-900 text-sm flex items-center justify-between hover:border-aba-secondary-main focus:outline-none focus:ring-2 focus:ring-aba-secondary-main transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-aba-neutral-500" />
                        <span>{autoLockTime} minutes</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-aba-neutral-500 transition-transform ${showAutoLockPicker ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {showAutoLockPicker && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowAutoLockPicker(false)}
                        ></div>
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-aba-neutral-200 rounded-xl shadow-lg overflow-hidden z-20">
                          {autoLockOptions.map((time) => (
                            <button
                              key={time}
                              onClick={() => {
                                setAutoLockTime(time);
                                setShowAutoLockPicker(false);
                              }}
                              className={`w-full px-4 py-3 text-left text-sm hover:bg-aba-neutral-50 transition-colors ${
                                autoLockTime === time
                                  ? 'bg-aba-primary-50 text-aba-primary-main font-medium'
                                  : 'text-aba-neutral-900'
                              }`}
                            >
                              {time} minutes
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Sessions Card */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-aba-secondary-main" />
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Active Sessions
              </h3>
            </div>
            
            <p className="text-xs text-aba-neutral-600 mb-4">
              Devices currently signed in to your account
            </p>
            
            {/* Devices List */}
            <div className="space-y-3 mb-4">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="bg-aba-neutral-50 rounded-xl p-3 border border-aba-neutral-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-aba-neutral-200 flex items-center justify-center flex-shrink-0">
                      {device.type === 'mobile' ? (
                        <Smartphone className="w-5 h-5 text-aba-secondary-main" />
                      ) : (
                        <Monitor className="w-5 h-5 text-aba-secondary-main" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-aba-neutral-900">
                        {device.name}
                      </p>
                      <p className="text-xs text-aba-neutral-500 mt-1">
                        Active {device.lastActive}
                      </p>
                    </div>
                    <button
                      onClick={() => openSignOutModal(device.id)}
                      className="text-xs font-medium text-aba-error-main hover:text-aba-error-600 transition-colors flex-shrink-0"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Sign Out All */}
            <ABAButton
              variant="outline"
              size="md"
              fullWidth
              onClick={() => setShowSignOutAllModal(true)}
              className="border-aba-error-main text-aba-error-main hover:bg-aba-error-50"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of All Devices
            </ABAButton>
          </div>
        </div>
      </div>
      
      {/* Sign Out Device Modal */}
      <ABAModal
        isOpen={showSignOutModal}
        onClose={() => {
          setShowSignOutModal(false);
          setDeviceToSignOut(null);
        }}
        title="Sign Out of This Device?"
      >
        <div className="space-y-4">
          <p className="text-sm text-aba-neutral-700">
            This device will be signed out and you'll need to sign in again to use it.
          </p>
          
          <div className="flex gap-3 pt-2">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => {
                setShowSignOutModal(false);
                setDeviceToSignOut(null);
              }}
            >
              Cancel
            </ABAButton>
            <ABAButton
              variant="primary"
              fullWidth
              onClick={handleSignOutDevice}
              className="bg-aba-error-main hover:bg-aba-error-600"
            >
              Sign Out
            </ABAButton>
          </div>
        </div>
      </ABAModal>
      
      {/* Sign Out All Devices Modal */}
      <ABAModal
        isOpen={showSignOutAllModal}
        onClose={() => setShowSignOutAllModal(false)}
        title="Sign Out All Devices?"
      >
        <div className="space-y-4">
          <div className="bg-aba-error-50 border border-aba-error-200 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-aba-error-main mt-0.5 flex-shrink-0" />
            <p className="text-xs text-aba-neutral-700">
              All devices will be signed out. You'll need to sign in again on each device.
            </p>
          </div>
          
          <div className="flex gap-3 pt-2">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => setShowSignOutAllModal(false)}
            >
              Cancel
            </ABAButton>
            <ABAButton
              variant="primary"
              fullWidth
              onClick={handleSignOutAll}
              className="bg-aba-error-main hover:bg-aba-error-600"
            >
              Sign Out All
            </ABAButton>
          </div>
        </div>
      </ABAModal>
    </div>
  );
}
