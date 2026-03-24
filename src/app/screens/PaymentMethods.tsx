import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { ABABadge } from '../components/aba/ABABadge';
import { ABAModal } from '../components/aba/ABAModal';
import { InputField } from '../components/aba/InputField';
import { showToast } from '../components/aba/Toast';
import {
  Wallet,
  Banknote,
  Smartphone,
  Building2,
  Shield,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Info,
  Star,
} from 'lucide-react';

type AccountType = 'bank' | 'mobile';

export function PaymentMethods() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromChecklist = searchParams.get('from') === 'checklist';
  
  // Aba Wallet
  const [abaWalletEnabled, setAbaWalletEnabled] = useState(true);
  const [settlementAccountName] = useState('Mukono Family Clinic');
  const [settlementAccountType] = useState<AccountType>('bank');
  const [settlementAccountNumber] = useState('****5678');
  const [abaWalletVerified, setAbaWalletVerified] = useState(true);
  
  // Cash Payments
  const [cashEnabled, setCashEnabled] = useState(true);
  
  // Mobile Money
  const [mtnEnabled, setMtnEnabled] = useState(false);
  const [airtelEnabled, setAirtelEnabled] = useState(false);
  const [mtnBusinessNumber, setMtnBusinessNumber] = useState('');
  const [airtelBusinessNumber, setAirtelBusinessNumber] = useState('');
  const [momoIntegrated, setMomoIntegrated] = useState(false);
  
  // Insurance/Corporate
  const [corporateEnabled, setCorporateEnabled] = useState(false);
  
  // Payment Rules
  const [splitPaymentsEnabled, setSplitPaymentsEnabled] = useState(true);
  const [requirePinRefunds, setRequirePinRefunds] = useState(true);
  
  // Modals
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const [showSettlementInfoModal, setShowSettlementInfoModal] = useState(false);
  const [learnMoreContent, setLearnMoreContent] = useState({ title: '', content: '' });
  
  // Track changes
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    setHasChanges(true);
  }, [
    abaWalletEnabled,
    cashEnabled,
    mtnEnabled,
    airtelEnabled,
    mtnBusinessNumber,
    airtelBusinessNumber,
    corporateEnabled,
    splitPaymentsEnabled,
    requirePinRefunds,
  ]);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (mtnEnabled && !mtnBusinessNumber.trim()) {
      newErrors.mtn = 'MTN business number is required';
    } else if (mtnEnabled && !/^\d{10}$/.test(mtnBusinessNumber)) {
      newErrors.mtn = 'Invalid number format (10 digits required)';
    }
    
    if (airtelEnabled && !airtelBusinessNumber.trim()) {
      newErrors.airtel = 'Airtel business number is required';
    } else if (airtelEnabled && !/^\d{10}$/.test(airtelBusinessNumber)) {
      newErrors.airtel = 'Invalid number format (10 digits required)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSaveChanges = () => {
    if (!validateForm()) {
      showToast('Please fix the errors before saving', 'error');
      return;
    }
    
    setHasChanges(false);
    showToast('Payment methods saved successfully', 'success');
  };
  
  const handleVerifyMomoNumber = (provider: 'mtn' | 'airtel') => {
    const number = provider === 'mtn' ? mtnBusinessNumber : airtelBusinessNumber;
    if (!number.trim()) {
      showToast('Please enter a business number first', 'error');
      return;
    }
    showToast(`${provider.toUpperCase()} verification request sent`, 'success');
  };
  
  const openLearnMore = (title: string, content: string) => {
    setLearnMoreContent({ title, content });
    setShowLearnMoreModal(true);
  };
  
  const openSettlementInfo = () => {
    // Check if settlement ledger route exists
    // For now, just open info modal
    setShowSettlementInfoModal(true);
  };
  
  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Payment Methods"
        showBack
        onBackClick={() => navigate('/settings')}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          {/* Helper Text */}
          <p className="text-aba-neutral-600 mb-4 text-[12px]">
            Configure how patients pay and how your clinic receives settlements.
          </p>
          
          {/* Checklist Banner */}
          {fromChecklist && (
            <div className="bg-aba-secondary-50 border border-aba-secondary-main/20 rounded-xl p-3 mb-4 flex items-start gap-2">
              <Info className="w-4 h-4 text-aba-secondary-main mt-0.5 flex-shrink-0" />
              <p className="text-xs text-aba-neutral-700">
                This is required before submitting for AbaAccess listing review.
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Aba Wallet Card */}
            <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-aba-primary-main" />
                  <h3 className="text-base font-semibold text-aba-neutral-900">
                    Aba Wallet (Primary)
                  </h3>
                </div>
                <ABABadge variant="success" size="sm">
                  <Star className="w-3 h-3" />
                  Recommended
                </ABABadge>
              </div>
              
              <div className="space-y-4">
                {/* Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-aba-neutral-900">
                      Accept Aba Wallet payments
                    </p>
                    <p className="text-xs text-aba-neutral-600">
                      Wallet settlements within 24–48 hours
                    </p>
                  </div>
                  <button
                    onClick={() => setAbaWalletEnabled(!abaWalletEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      abaWalletEnabled ? 'bg-aba-primary-main' : 'bg-aba-neutral-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        abaWalletEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {/* Status */}
                <div className="flex items-center gap-2">
                  {abaWalletVerified ? (
                    <div className="flex items-center gap-1 text-aba-success-main">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-medium">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-aba-warning-main">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Needs verification</span>
                    </div>
                  )}
                </div>
                
                {!abaWalletVerified && (
                  <div className="bg-aba-warning-50 border border-aba-warning-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-aba-warning-main mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-aba-neutral-700">
                      Pending verification by ABA Ops. You'll be notified when approved.
                    </p>
                  </div>
                )}
                
                {/* Settlement Details */}
                <div className="pt-3 border-t border-aba-neutral-200 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                      Settlement account name
                    </label>
                    <div className="px-4 py-3 rounded-md border border-aba-neutral-200 bg-aba-neutral-50 text-aba-neutral-900 text-sm">
                      {settlementAccountName}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                      Settlement account type
                    </label>
                    <div className="px-4 py-3 rounded-md border border-aba-neutral-200 bg-aba-neutral-50 text-aba-neutral-900 text-sm capitalize">
                      {settlementAccountType === 'bank' ? 'Bank Account' : 'Mobile Money'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                      Settlement account number
                    </label>
                    <div className="px-4 py-3 rounded-md border border-aba-neutral-200 bg-aba-neutral-50 text-aba-neutral-900 text-sm">
                      {settlementAccountNumber}
                    </div>
                  </div>
                  
                  <ABAButton
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={openSettlementInfo}
                  >
                    View Settlement Details
                    <ChevronRight className="w-4 h-4" />
                  </ABAButton>
                </div>
              </div>
            </div>
            
            {/* Cash Payments Card */}
            <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Banknote className="w-5 h-5 text-aba-secondary-main" />
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  Cash Payments
                </h3>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-aba-neutral-900">
                    Accept cash payments
                  </p>
                  <p className="text-xs text-aba-neutral-600">
                    Cash transactions are recorded for reporting
                  </p>
                </div>
                <button
                  onClick={() => setCashEnabled(!cashEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    cashEnabled ? 'bg-aba-primary-main' : 'bg-aba-neutral-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      cashEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            {/* Mobile Money Payments Card */}
            <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-aba-secondary-main" />
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  Mobile Money Payments
                </h3>
              </div>
              
              {!momoIntegrated && (
                <div className="bg-aba-neutral-50 border border-aba-neutral-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                  <Info className="w-4 h-4 text-aba-neutral-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-aba-neutral-700 mb-1">
                      <span className="font-medium">Integration pending</span>
                    </p>
                    <p className="text-xs text-aba-neutral-600">
                      Contact ABA Ops to enable mobile money payments.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {/* MTN MoMo */}
                <div className="pb-4 border-b border-aba-neutral-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-aba-warning-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-aba-warning-600">MTN</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-aba-neutral-900">
                          MTN MoMo
                        </p>
                        {!momoIntegrated && (
                          <p className="text-xs text-aba-neutral-500 text-[#8f9aa1]">Integration pending</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => momoIntegrated && setMtnEnabled(!mtnEnabled)}
                      disabled={!momoIntegrated}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        !momoIntegrated
                          ? 'bg-aba-neutral-200 cursor-not-allowed'
                          : mtnEnabled
                          ? 'bg-aba-primary-main'
                          : 'bg-aba-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          mtnEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {mtnEnabled && momoIntegrated && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                          Business number
                        </label>
                        <InputField
                          type="text"
                          value={mtnBusinessNumber}
                          onChange={(e) => {
                            setMtnBusinessNumber(e.target.value);
                            if (errors.mtn) {
                              setErrors({ ...errors, mtn: '' });
                            }
                          }}
                          placeholder="0700123456"
                          error={errors.mtn}
                        />
                      </div>
                      <ABAButton
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => handleVerifyMomoNumber('mtn')}
                      >
                        Verify Number
                      </ABAButton>
                    </div>
                  )}
                </div>
                
                {/* Airtel Money */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-aba-error-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-aba-error-600">AM</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-aba-neutral-900">
                          Airtel Money
                        </p>
                        {!momoIntegrated && (
                          <p className="text-xs text-aba-neutral-500 text-[#8f9aa1]">Integration pending</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => momoIntegrated && setAirtelEnabled(!airtelEnabled)}
                      disabled={!momoIntegrated}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        !momoIntegrated
                          ? 'bg-aba-neutral-200 cursor-not-allowed'
                          : airtelEnabled
                          ? 'bg-aba-primary-main'
                          : 'bg-aba-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          airtelEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {airtelEnabled && momoIntegrated && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-aba-neutral-600 mb-1">
                          Business number
                        </label>
                        <InputField
                          type="text"
                          value={airtelBusinessNumber}
                          onChange={(e) => {
                            setAirtelBusinessNumber(e.target.value);
                            if (errors.airtel) {
                              setErrors({ ...errors, airtel: '' });
                            }
                          }}
                          placeholder="0750123456"
                          error={errors.airtel}
                        />
                      </div>
                      <ABAButton
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => handleVerifyMomoNumber('airtel')}
                      >
                        Verify Number
                      </ABAButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Insurance / Corporate Card */}
            <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-aba-secondary-main" />
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  Insurance / Corporate (Optional)
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-aba-neutral-900">
                      Accept Corporate Plans (ABA Corporate)
                    </p>
                    <p className="text-xs text-aba-neutral-600">
                      Enable if your clinic serves employer bundles
                    </p>
                  </div>
                  <button
                    onClick={() => setCorporateEnabled(!corporateEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      corporateEnabled ? 'bg-aba-primary-main' : 'bg-aba-neutral-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        corporateEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <button
                  onClick={() =>
                    openLearnMore(
                      'Corporate Plans',
                      'ABA Corporate allows employers to provide health benefits to their employees. Your clinic can accept bookings and payments through these corporate bundles. Contact ABA Ops to get started.'
                    )
                  }
                  className="text-xs text-aba-secondary-main font-semibold hover:text-aba-secondary-600 transition-colors flex items-center gap-1"
                >
                  <Info className="w-3 h-3" />
                  Learn more
                </button>
              </div>
            </div>
            
            {/* Payment Rules Card */}
            <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-aba-primary-main" />
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  Payment Rules
                </h3>
              </div>
              
              <div className="space-y-3 mb-3">
                {/* Split payments */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-aba-neutral-900">
                      Allow split payments (Wallet + Cash)
                    </p>
                    <p className="text-xs text-aba-neutral-600">
                      Patients can pay with multiple methods
                    </p>
                  </div>
                  <button
                    onClick={() => setSplitPaymentsEnabled(!splitPaymentsEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      splitPaymentsEnabled ? 'bg-aba-primary-main' : 'bg-aba-neutral-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        splitPaymentsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {/* Require PIN for refunds */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-aba-neutral-900">
                      Require Admin PIN for refunds/voids
                    </p>
                    <p className="text-xs text-aba-neutral-600">
                      Extra security for financial actions
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
              </div>
              
              <div className="bg-aba-secondary-50 border border-aba-secondary-main/20 rounded-xl p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-aba-secondary-main mt-0.5 flex-shrink-0" />
                <p className="text-aba-neutral-700 text-[14px]">
                  Refunds/voids are logged in Audit Logs for compliance.
                </p>
              </div>
            </div>
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
      
      {/* Learn More Modal */}
      <ABAModal
        isOpen={showLearnMoreModal}
        onClose={() => setShowLearnMoreModal(false)}
        title={learnMoreContent.title}
      >
        <div className="space-y-4">
          <p className="text-sm text-aba-neutral-700">
            {learnMoreContent.content}
          </p>
          
          <ABAButton
            variant="primary"
            fullWidth
            onClick={() => setShowLearnMoreModal(false)}
          >
            Got it
          </ABAButton>
        </div>
      </ABAModal>
      
      {/* Settlement Info Modal */}
      <ABAModal
        isOpen={showSettlementInfoModal}
        onClose={() => setShowSettlementInfoModal(false)}
        title="Settlement Details"
      >
        <div className="space-y-4">
          <div className="bg-aba-neutral-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-xs text-aba-neutral-600">Account Name</span>
              <span className="text-sm font-medium text-aba-neutral-900">
                {settlementAccountName}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-xs text-aba-neutral-600">Account Type</span>
              <span className="text-sm font-medium text-aba-neutral-900 capitalize">
                {settlementAccountType === 'bank' ? 'Bank Account' : 'Mobile Money'}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-xs text-aba-neutral-600">Account Number</span>
              <span className="text-sm font-medium text-aba-neutral-900">
                {settlementAccountNumber}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-xs text-aba-neutral-600">Settlement Period</span>
              <span className="text-sm font-medium text-aba-neutral-900">
                24–48 hours
              </span>
            </div>
          </div>
          
          <p className="text-xs text-aba-neutral-600">
            To view detailed settlement history, go to Finance → Settlement Ledger.
          </p>
          
          <div className="flex gap-3">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => setShowSettlementInfoModal(false)}
            >
              Close
            </ABAButton>
            <ABAButton
              variant="primary"
              fullWidth
              onClick={() => {
                setShowSettlementInfoModal(false);
                navigate('/settlement-ledger');
              }}
            >
              View Ledger
            </ABAButton>
          </div>
        </div>
      </ABAModal>
    </div>
  );
}
