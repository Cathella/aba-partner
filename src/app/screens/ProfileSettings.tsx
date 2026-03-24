import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { InputField } from '../components/aba/InputField';
import { ABABadge } from '../components/aba/ABABadge';
import { ABAModal } from '../components/aba/ABAModal';
import { showToast } from '../components/aba/Toast';
import {
  User,
  Mail,
  Phone,
  Globe,
  Clock,
  Palette,
  Smartphone,
  ChevronDown,
  AlertCircle,
  Check,
  LogOut,
  Monitor,
} from 'lucide-react';

interface Device {
  id: string;
  name: string;
  type: 'mobile' | 'desktop';
  lastActive: string;
  location: string;
}

export function ProfileSettings() {
  const navigate = useNavigate();
  
  // Profile data
  const [fullName, setFullName] = useState('Dr. Sarah Nakato');
  const [email, setEmail] = useState('sarah.nakato@mukono.clinic');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [phoneNumber] = useState('+256 700 123 456');
  const [role] = useState('Facility Admin');
  const [clinicName] = useState('Mukono Family Clinic');
  
  // Preferences
  const [language, setLanguage] = useState('English');
  const [timeFormat, setTimeFormat] = useState<'12' | '24'>('12');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  // Devices
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'iPhone 13 Pro',
      type: 'mobile',
      lastActive: '2 mins ago',
      location: 'Kampala, Uganda',
    },
    {
      id: '2',
      name: 'Chrome on MacBook',
      type: 'desktop',
      lastActive: '2 days ago',
      location: 'Mukono, Uganda',
    },
  ]);
  
  // Modals
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showSignOutAllModal, setShowSignOutAllModal] = useState(false);
  const [deviceToSignOut, setDeviceToSignOut] = useState<string | null>(null);
  
  const languages = ['English', 'Luganda', 'Swahili'];
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const handleSaveChanges = () => {
    showToast('Profile updated successfully', 'success');
  };
  
  const handleVerifyEmail = () => {
    // Simulate verification
    setIsEmailVerified(true);
    showToast('Verification email sent', 'success');
  };
  
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
        title="Profile Settings"
        showBack
        onBackClick={() => navigate('/settings')}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-aba-primary-main" />
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Profile
              </h3>
            </div>
            
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-aba-primary-main flex items-center justify-center">
                  <span className="font-bold text-white text-[#1a1a1a] text-[18px]">
                    {getInitials(fullName)}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-aba-secondary-main flex items-center justify-center border-2 border-white hover:bg-aba-secondary-600 transition-colors">
                  <User className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                  Full Name
                </label>
                <InputField
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              
              {/* Role (Read-only) */}
              <div>
                <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                  Role
                </label>
                <div className="px-4 py-3 rounded-md border border-aba-neutral-200 bg-aba-neutral-50 text-aba-neutral-900 text-sm">
                  {role}
                </div>
              </div>
              
              {/* Clinic Name (Read-only) */}
              <div>
                <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                  Clinic Name
                </label>
                <div className="px-4 py-3 rounded-md border border-aba-neutral-200 bg-aba-neutral-50 text-aba-neutral-900 text-sm">
                  {clinicName}
                </div>
              </div>
              
              {/* Save Button */}
              {/* Moved to fixed bottom */}
            </div>
          </div>
          
          {/* Contact Details */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-aba-secondary-main" />
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Contact Details
              </h3>
            </div>
            
            <div className="space-y-4">
              {/* Phone Number (Read-only) */}
              <div>
                <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                  Phone Number
                </label>
                <div className="px-4 py-3 rounded-md border border-aba-neutral-200 bg-aba-neutral-50 text-aba-neutral-900 text-sm flex items-center justify-between">
                  <span>{phoneNumber}</span>
                  <Phone className="w-4 h-4 text-aba-neutral-400" />
                </div>
                <p className="text-xs text-aba-neutral-500 mt-1">
                  Contact ABA Support to change your phone number
                </p>
              </div>
              
              {/* Email Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-aba-neutral-600">
                    Email Address
                  </label>
                  {isEmailVerified ? (
                    <ABABadge variant="success" size="sm">
                      <Check className="w-3 h-3" />
                      Verified
                    </ABABadge>
                  ) : (
                    <ABABadge variant="warning" size="sm">
                      Unverified
                    </ABABadge>
                  )}
                </div>
                <InputField
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
                
                {!isEmailVerified && (
                  <div className="mt-3 bg-aba-warning-50 border border-aba-warning-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-aba-warning-main mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-aba-neutral-700 mb-2">
                        Verify your email for account recovery and important notifications.
                      </p>
                      <ABAButton
                        variant="outline"
                        size="sm"
                        onClick={handleVerifyEmail}
                      >
                        Verify Email
                      </ABAButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Preferences */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-aba-primary-main" />
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Preferences
              </h3>
            </div>
            
            <div className="space-y-4">
              {/* Language Selector */}
              <div>
                <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                  Language
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                    className="w-full px-4 py-3 rounded-md border border-aba-neutral-300 bg-white text-aba-neutral-900 text-sm flex items-center justify-between hover:border-aba-secondary-main focus:outline-none focus:ring-2 focus:ring-aba-secondary-main transition-colors"
                  >
                    <span>{language}</span>
                    <ChevronDown className={`w-4 h-4 text-aba-neutral-500 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showLanguageDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowLanguageDropdown(false)}
                      ></div>
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-aba-neutral-200 rounded-xl shadow-lg overflow-hidden z-20">
                        {languages.map((lang) => (
                          <button
                            key={lang}
                            onClick={() => {
                              setLanguage(lang);
                              setShowLanguageDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left text-sm hover:bg-aba-neutral-50 transition-colors ${
                              language === lang
                                ? 'bg-aba-primary-50 text-aba-primary-main font-medium'
                                : 'text-aba-neutral-900'
                            }`}
                          >
                            {lang}
                            {language === lang && (
                              <Check className="w-4 h-4 inline-block ml-2" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Time Format Toggle */}
              <div>
                <label className="block text-xs font-medium text-aba-neutral-600 mb-2">
                  Time Format
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTimeFormat('12')}
                    className={`flex-1 py-2.5 px-4 rounded-[14px] border text-sm font-medium transition-colors ${ timeFormat === '12' ? 'bg-aba-primary-main text-white border-aba-primary-main' : 'bg-white text-aba-neutral-700 border-aba-neutral-300 hover:border-aba-primary-main' } text-[#1a1a1a]`}
                  >
                    <Clock className="w-4 h-4 inline-block mr-1" />
                    12-hour
                  </button>
                  <button
                    onClick={() => setTimeFormat('24')}
                    className={`flex-1 py-2.5 px-4 rounded-[14px] border text-sm font-medium transition-colors ${
                      timeFormat === '24'
                        ? 'bg-aba-primary-main text-white border-aba-primary-main'
                        : 'bg-white text-aba-neutral-700 border-aba-neutral-300 hover:border-aba-primary-main'
                    }`}
                  >
                    <Clock className="w-4 h-4 inline-block mr-1" />
                    24-hour
                  </button>
                </div>
              </div>
              
              {/* Theme */}
              <div>
                <label className="block text-xs font-medium text-aba-neutral-600 mb-2">
                  Theme
                </label>
                <div className="flex items-center gap-2">
                  <button
                    className="flex-1 py-2.5 px-4 rounded-[14px] border bg-aba-primary-main text-white border-aba-primary-main text-sm font-medium text-[#1a1a1a]"
                  >
                    <Palette className="w-4 h-4 inline-block mr-1" />
                    Light
                  </button>
                  <button
                    disabled
                    className="flex-1 py-2.5 px-4 rounded-[14px] border bg-aba-neutral-100 text-aba-neutral-400 border-aba-neutral-200 text-sm font-medium cursor-not-allowed"
                  >
                    <Palette className="w-4 h-4 inline-block mr-1" />
                    Dark (Coming soon)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed Bottom Save Button */}
      <div className="p-4 border-t border-aba-neutral-200 bg-white">
        <ABAButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSaveChanges}
        >
          Save Changes
        </ABAButton>
      </div>
      
      {/* Sign Out Device Modal */}
      <ABAModal
        isOpen={showSignOutModal}
        onClose={() => {
          setShowSignOutModal(false);
          setDeviceToSignOut(null);
        }}
        title="Sign Out Device?"
      >
        <div className="space-y-4">
          <p className="text-sm text-aba-neutral-700">
            This device will be signed out and you'll need to sign in again to use
            it.
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
              All devices will be signed out. You'll need to sign in again on each
              device.
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