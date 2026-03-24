import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { InputField } from '../components/aba/InputField';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { ChevronLeft, UserPlus, Mail, Phone, Briefcase } from 'lucide-react';

type StaffRole = 'Therapist' | 'Receptionist' | 'Facility Admin' | 'Support Staff';

const roles: StaffRole[] = ['Therapist', 'Receptionist', 'Facility Admin', 'Support Staff'];

export function InviteStaff() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '' as StaffRole | '',
  });
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.contact = 'Email or phone number is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phone && !/^\+?\d{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      showToast(`Invitation sent to ${formData.fullName}`, 'success');
      setTimeout(() => {
        navigate('/staff-list');
      }, 500);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Invite Staff"
        showBack
        onBackClick={() => navigate(-1)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-aba-primary-50 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-aba-primary-main" />
            </div>
          </div>
          <div className="text-center mb-6">
            <h2 className="font-semibold text-aba-neutral-900 mb-1 text-[16px]">
              Invite New Staff Member
            </h2>
            <p className="text-sm text-aba-neutral-600">
              Enter details to send an invitation
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4 space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[12px] font-medium text-[#8F9AA1] mb-2">
                Full Name *
              </label>
              <InputField
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  if (errors.fullName) {
                    setErrors({ ...errors, fullName: '' });
                  }
                }}
                error={errors.fullName}
                className="text-[14px]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[12px] font-medium text-[#8F9AA1] mb-2">
                Email Address
              </label>
              <InputField
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email || errors.contact) {
                    setErrors({ ...errors, email: '', contact: '' });
                  }
                }}
                leftIcon={<Mail className="w-5 h-5" />}
                error={errors.email}
                className="text-[14px]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[12px] font-medium text-[#8F9AA1] mb-2">
                Phone Number
              </label>
              <InputField
                type="tel"
                placeholder="+256 700 000 000"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone || errors.contact) {
                    setErrors({ ...errors, phone: '', contact: '' });
                  }
                }}
                leftIcon={<Phone className="w-5 h-5" />}
                error={errors.phone}
                className="text-[14px]"
              />
              {errors.contact && (
                <p className="text-xs text-aba-error-main mt-1">{errors.contact}</p>
              )}
            </div>

            {/* Role Dropdown */}
            <div>
              <label className="block text-[12px] font-medium text-[#8F9AA1] mb-2">
                Role *
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[14px] border transition-colors text-left text-[14px] ${
                    errors.role
                      ? 'border-aba-error-main bg-aba-error-50'
                      : 'border-aba-neutral-200 bg-white hover:border-aba-neutral-300'
                  }`}
                >
                  <Briefcase className="w-5 h-5 text-aba-neutral-500" />
                  <span className={formData.role ? 'text-aba-neutral-900' : 'text-aba-neutral-500'}>
                    {formData.role || 'Select role'}
                  </span>
                </button>
                {errors.role && (
                  <p className="text-xs text-aba-error-main mt-1">{errors.role}</p>
                )}

                {/* Dropdown Menu */}
                {showRoleDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-aba-neutral-200 shadow-lg z-10">
                    {roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setFormData({ ...formData, role });
                          setShowRoleDropdown(false);
                          if (errors.role) {
                            setErrors({ ...errors, role: '' });
                          }
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          formData.role === role
                            ? 'bg-aba-primary-50 text-aba-primary-main font-medium'
                            : 'text-aba-neutral-900 hover:bg-aba-neutral-50'
                        } ${role === roles[0] ? 'rounded-t-xl' : ''} ${
                          role === roles[roles.length - 1] ? 'rounded-b-xl' : ''
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-aba-secondary-50 border border-aba-secondary-200 rounded-xl p-4">
            <p className="text-sm text-aba-neutral-700">
              <span className="font-medium">Note:</span> The staff member will receive an invitation
              to activate their account and set up their PIN.
            </p>
          </div>

          {/* Submit Button - removed from here, moved to bottom */}
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="p-4 border-t border-aba-neutral-200 bg-white">
        <ABAButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSubmit}
        >
          Send Invite
        </ABAButton>
      </div>
    </div>
  );
}