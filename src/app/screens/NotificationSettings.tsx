import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { ABAModal } from '../components/aba/ABAModal';
import { showToast } from '../components/aba/Toast';
import {
  Bell,
  Smartphone,
  Mail,
  MessageCircle,
  Calendar,
  DollarSign,
  Users,
  Moon,
  Send,
  AlertCircle,
  ChevronRight,
  Check,
} from 'lucide-react';

type RecipientType = 'reception' | 'admin' | 'custom';
type StaffRole = 'admin' | 'receptionist' | 'doctor' | 'accountant';

export function NotificationSettings() {
  const navigate = useNavigate();
  
  // Channel Preferences
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  
  // Integration status
  const [smsConfigured, setSmsConfigured] = useState(false);
  const [whatsappIntegrated, setWhatsappIntegrated] = useState(false);
  const [emailIntegrated, setEmailIntegrated] = useState(false);
  
  // Booking Alerts
  const [newBooking, setNewBooking] = useState(true);
  const [bookingChanges, setBookingChanges] = useState(true);
  const [noShow, setNoShow] = useState(true);
  const [bookingReminder, setBookingReminder] = useState(true);
  const [bookingRecipient, setBookingRecipient] = useState<RecipientType>('reception');
  const [customRoles, setCustomRoles] = useState<StaffRole[]>(['admin', 'receptionist']);
  
  // Finance Alerts
  const [paymentReceived, setPaymentReceived] = useState(true);
  const [pendingSettlement, setPendingSettlement] = useState(true);
  const [settlementPaid, setSettlementPaid] = useState(true);
  const [disputeActivity, setDisputeActivity] = useState(true);
  
  // Operational Alerts
  const [staffInviteAccepted, setStaffInviteAccepted] = useState(true);
  const [staffInactive, setStaffInactive] = useState(false);
  const [servicesDisabled, setServicesDisabled] = useState(true);
  const [operatingHoursIssues, setOperatingHoursIssues] = useState(true);
  
  // Quiet Hours
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('06:00');
  
  // Modals
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [tempRoles, setTempRoles] = useState<StaffRole[]>([]);
  
  // Track changes
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    // Mark as changed whenever any toggle changes
    setHasChanges(true);
  }, [
    inAppNotifications,
    smsNotifications,
    whatsappNotifications,
    emailNotifications,
    newBooking,
    bookingChanges,
    noShow,
    bookingReminder,
    paymentReceived,
    pendingSettlement,
    settlementPaid,
    disputeActivity,
    staffInviteAccepted,
    staffInactive,
    servicesDisabled,
    operatingHoursIssues,
    quietHoursEnabled,
    quietHoursStart,
    quietHoursEnd,
    bookingRecipient,
  ]);
  
  const handleSaveChanges = () => {
    setHasChanges(false);
    showToast('Notification preferences saved', 'success');
  };
  
  const handleSendTest = () => {
    showToast('Test notification sent', 'success');
  };
  
  const openRecipientModal = () => {
    setTempRoles([...customRoles]);
    setShowRecipientModal(true);
  };
  
  const toggleRole = (role: StaffRole) => {
    setTempRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };
  
  const saveRecipients = () => {
    setCustomRoles(tempRoles);
    setShowRecipientModal(false);
  };
  
  const getRecipientLabel = () => {
    if (bookingRecipient === 'reception') return 'Reception Team';
    if (bookingRecipient === 'admin') return 'Facility Admin only';
    return `Custom (${customRoles.length} roles)`;
  };
  
  const roleLabels: Record<StaffRole, string> = {
    admin: 'Facility Admin',
    receptionist: 'Receptionist',
    doctor: 'Doctor',
    accountant: 'Accountant',
  };
  
  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Notifications"
        showBack
        onBackClick={() => navigate('/settings')}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {/* Channel Preferences */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-aba-primary-main" />
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Channel Preferences
              </h3>
            </div>
            
            <div className="space-y-3 mb-3">
              {/* In-app */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-aba-secondary-main" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-aba-neutral-900">
                      In-app notifications
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInAppNotifications(!inAppNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    inAppNotifications ? 'bg-aba-primary-main' : 'bg-aba-neutral-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      inAppNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* SMS */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-aba-secondary-main" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-aba-neutral-900">
                      SMS notifications
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSmsNotifications(!smsNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    smsNotifications ? 'bg-aba-primary-main' : 'bg-aba-neutral-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      smsNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* SMS Warning */}
              {smsNotifications && !smsConfigured && (
                <div className="bg-aba-warning-50 border border-aba-warning-200 rounded-xl p-3 flex items-start gap-2 ml-8">
                  <AlertCircle className="w-4 h-4 text-aba-warning-main mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-aba-neutral-700">
                    SMS not configured. Contact ABA Ops to set up.
                  </p>
                </div>
              )}
              
              {/* WhatsApp */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-aba-secondary-main" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-aba-neutral-900">
                      WhatsApp notifications
                    </p>
                    {!whatsappIntegrated && (
                      <p className="text-xs text-aba-neutral-500 text-[#8f9aa1]">Integration pending</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setWhatsappNotifications(!whatsappNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    whatsappNotifications ? 'bg-aba-primary-main' : 'bg-aba-neutral-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      whatsappNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Email */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-aba-secondary-main" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-aba-neutral-900">
                      Email notifications
                    </p>
                    {!emailIntegrated && (
                      <p className="text-xs text-aba-neutral-500 text-[#8f9aa1]">Integration pending</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emailNotifications ? 'bg-aba-primary-main' : 'bg-aba-neutral-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <p className="text-xs text-aba-neutral-600">
              Choose how your clinic receives alerts.
            </p>
          </div>
          
          {/* Booking Alerts */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-aba-secondary-main" />
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Booking Alerts
              </h3>
            </div>
            
            <div className="space-y-3 mb-4">
              {/* New booking */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    New booking received
                  </p>
                </div>
                <button
                  onClick={() => setNewBooking(!newBooking)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    newBooking ? 'bg-aba-primary-main' : 'bg-aba-neutral-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      newBooking ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Booking changes */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    Booking rescheduled/cancelled
                  </p>
                </div>
                <button
                  onClick={() => setBookingChanges(!bookingChanges)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    bookingChanges ? 'bg-aba-primary-main' : 'bg-aba-neutral-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      bookingChanges ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* No-show */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    No-show detected
                  </p>
                </div>
                <button
                  onClick={() => setNoShow(!noShow)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    noShow ? 'bg-aba-primary-main' : 'bg-aba-neutral-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      noShow ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Booking reminder */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    Booking reminder to patient
                  </p>
                </div>
                <button
                  onClick={() => setBookingReminder(!bookingReminder)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    bookingReminder ? 'bg-aba-primary-main' : 'bg-aba-neutral-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      bookingReminder ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            {/* Recipient Selector */}
            <div className="pt-3 border-t border-aba-neutral-200">
              <label className="block text-xs font-medium text-aba-neutral-600 mb-2">
                Default recipient
              </label>
              
              <div className="space-y-2">
                <button
                  onClick={() => setBookingRecipient('reception')}
                  className={`w-full px-4 py-3 rounded-[14px] border text-sm text-left flex items-center justify-between transition-colors ${ bookingRecipient === 'reception' ? 'bg-aba-primary-50 border-aba-primary-main text-aba-primary-main font-medium' : 'bg-white border-aba-neutral-300 text-aba-neutral-900 hover:border-aba-primary-main' } text-[#1a1a1a]`}
                >
                  Reception Team
                  {bookingRecipient === 'reception' && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                
                <button
                  onClick={() => setBookingRecipient('admin')}
                  className={`w-full px-4 py-3 rounded-[14px] border text-sm text-left flex items-center justify-between transition-colors ${
                    bookingRecipient === 'admin'
                      ? 'bg-aba-primary-50 border-aba-primary-main text-aba-primary-main font-medium'
                      : 'bg-white border-aba-neutral-300 text-aba-neutral-900 hover:border-aba-primary-main'
                  }`}
                >
                  Facility Admin only
                  {bookingRecipient === 'admin' && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setBookingRecipient('custom');
                    openRecipientModal();
                  }}
                  className={`w-full px-4 py-3 rounded-[14px] border text-sm text-left flex items-center justify-between transition-colors ${
                    bookingRecipient === 'custom'
                      ? 'bg-aba-primary-50 border-aba-primary-main text-aba-primary-main font-medium'
                      : 'bg-white border-aba-neutral-300 text-aba-neutral-900 hover:border-aba-primary-main'
                  }`}
                >
                  <span>{getRecipientLabel()}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Finance & Settlement Alerts */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-aba-primary-main" />
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Finance & Settlement Alerts
              </h3>
            </div>
            
            <div className="space-y-3 mb-3">
              {/* Payment received */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    Payment received
                  </p>
                </div>
                <button
                  onClick={() => setPaymentReceived(!paymentReceived)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    paymentReceived ? 'bg-aba-primary-main' : 'bg-aba-neutral-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      paymentReceived ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Pending settlement */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    Pending settlement reminder
                  </p>
                </div>
                <button
                  onClick={() => setPendingSettlement(!pendingSettlement)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    pendingSettlement ? 'bg-aba-primary-main' : 'bg-aba-neutral-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pendingSettlement ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Settlement paid */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    Settlement paid out
                  </p>
                </div>
                <button
                  onClick={() => setSettlementPaid(!settlementPaid)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settlementPaid ? 'bg-aba-primary-main' : 'bg-aba-neutral-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settlementPaid ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Dispute activity */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    Dispute/Refund activity
                  </p>
                </div>
                <button
                  onClick={() => setDisputeActivity(!disputeActivity)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    disputeActivity ? 'bg-aba-primary-main' : 'bg-aba-neutral-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      disputeActivity ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className="bg-aba-secondary-50 border border-aba-secondary-main/20 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-aba-secondary-main mt-0.5 flex-shrink-0" />
              <p className="text-aba-neutral-700 text-[14px] text-[#1a1a1a]">
                Recommended for clinic admins.
              </p>
            </div>
          </div>
          
          {/* Operational Alerts */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-aba-secondary-main" />
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Operational Alerts
              </h3>
            </div>
            
            <div className="space-y-3">
              {/* Staff invite accepted */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    Staff invite accepted
                  </p>
                </div>
                <button
                  onClick={() => setStaffInviteAccepted(!staffInviteAccepted)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    staffInviteAccepted ? 'bg-aba-primary-main' : 'bg-aba-neutral-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      staffInviteAccepted ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Staff inactive */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    Staff inactive for 7 days
                  </p>
                </div>
                <button
                  onClick={() => setStaffInactive(!staffInactive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    staffInactive ? 'bg-aba-primary-main' : 'bg-aba-neutral-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      staffInactive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Services disabled */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    Services disabled / no services available
                  </p>
                </div>
                <button
                  onClick={() => setServicesDisabled(!servicesDisabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    servicesDisabled ? 'bg-aba-primary-main' : 'bg-aba-neutral-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      servicesDisabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Operating hours issues */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    Operating hours missing / blackout conflicts
                  </p>
                </div>
                <button
                  onClick={() => setOperatingHoursIssues(!operatingHoursIssues)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    operatingHoursIssues ? 'bg-aba-primary-main' : 'bg-aba-neutral-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      operatingHoursIssues ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
          
          {/* Quiet Hours */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="w-5 h-5 text-aba-primary-main" />
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Quiet Hours
              </h3>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-aba-neutral-900">
                  Enable quiet hours
                </p>
                <p className="text-xs text-aba-neutral-600">
                  Pause non-critical notifications
                </p>
              </div>
              <button
                onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  quietHoursEnabled ? 'bg-aba-primary-main' : 'bg-aba-neutral-400'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    quietHoursEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {quietHoursEnabled && (
              <div className="space-y-3 pt-3 border-t border-aba-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                      Start time
                    </label>
                    <input
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => setQuietHoursStart(e.target.value)}
                      className="w-full px-4 py-3 rounded-md border border-aba-neutral-300 text-sm focus:border-aba-primary-main focus:outline-none focus:ring-2 focus:ring-aba-primary-main"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                      End time
                    </label>
                    <input
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => setQuietHoursEnd(e.target.value)}
                      className="w-full px-4 py-3 rounded-md border border-aba-neutral-300 text-sm focus:border-aba-primary-main focus:outline-none focus:ring-2 focus:ring-aba-primary-main"
                    />
                  </div>
                </div>
                
                <div className="bg-aba-warning-50 border border-aba-warning-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-aba-warning-main mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-aba-neutral-700">
                    Critical alerts may still be delivered during quiet hours.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Notification Preview */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Send className="w-5 h-5 text-aba-secondary-main" />
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Notification Preview
              </h3>
            </div>
            
            <p className="text-xs text-aba-neutral-600 mb-4">
              Send a test notification to verify your settings.
            </p>
            
            <ABAButton
              variant="outline"
              size="md"
              fullWidth
              onClick={handleSendTest}
            >
              <Send className="w-4 h-4" />
              Send Test Notification
            </ABAButton>
          </div>
        </div>
      </div>
      
      {/* Sticky Save Bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-aba-neutral-200 p-4 shadow-lg">
          <ABAButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSaveChanges}
          >
            Save Changes
          </ABAButton>
        </div>
      )}
      
      {/* Recipient Selection Modal */}
      <ABAModal
        isOpen={showRecipientModal}
        onClose={() => setShowRecipientModal(false)}
        title="Choose Recipients"
      >
        <div className="space-y-4">
          <p className="text-sm text-aba-neutral-700">
            Select which staff roles should receive booking alerts.
          </p>
          
          <div className="space-y-2">
            {(Object.keys(roleLabels) as StaffRole[]).map((role) => (
              <button
                key={role}
                onClick={() => toggleRole(role)}
                className={`w-full px-4 py-3 rounded-xl border text-sm text-left flex items-center justify-between transition-colors ${
                  tempRoles.includes(role)
                    ? 'bg-aba-primary-50 border-aba-primary-main text-aba-primary-main font-medium'
                    : 'bg-white border-aba-neutral-300 text-aba-neutral-900 hover:border-aba-primary-main'
                }`}
              >
                {roleLabels[role]}
                {tempRoles.includes(role) && (
                  <Check className="w-5 h-5" />
                )}
              </button>
            ))}
          </div>
          
          <div className="flex gap-3 pt-2">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => setShowRecipientModal(false)}
            >
              Cancel
            </ABAButton>
            <ABAButton
              variant="primary"
              fullWidth
              onClick={saveRecipients}
            >
              Save
            </ABAButton>
          </div>
        </div>
      </ABAModal>
    </div>
  );
}