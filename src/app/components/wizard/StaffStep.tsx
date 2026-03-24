import { useState } from 'react';
import { ABAButton } from '../aba/ABAButton';
import { ABABadge } from '../aba/ABABadge';
import { showToast } from '../aba/Toast';
import { UserPlus, X, Mail, Phone } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  contact: string;
  role: string;
}

interface StaffStepProps {
  data: StaffMember[];
  onUpdate: (data: StaffMember[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StaffStep({ data, onUpdate, onNext, onBack }: StaffStepProps) {
  const [staff, setStaff] = useState<StaffMember[]>(data);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    contactType: 'phone',
    role: '',
  });

  const roles = [
    'Receptionist',
    'Nurse',
    'Therapist',
    'Lab Technician',
    'Pharmacist',
    'Doctor',
    'Administrator',
  ];

  const roleColors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
    Receptionist: 'secondary',
    Nurse: 'success',
    Therapist: 'primary',
    'Lab Technician': 'info',
    Pharmacist: 'warning',
    Doctor: 'primary',
    Administrator: 'info',
  };

  const handleAddStaff = () => {
    if (!formData.name || !formData.contact || !formData.role) {
      showToast('Please complete all fields', 'error');
      return;
    }

    const newStaff: StaffMember = {
      id: Date.now().toString(),
      name: formData.name,
      contact: formData.contact,
      role: formData.role,
    };

    setStaff([...staff, newStaff]);
    setFormData({ name: '', contact: '', contactType: 'phone', role: '' });
    setShowAddForm(false);
    showToast('Staff member invited', 'success');
  };

  const removeStaff = (id: string) => {
    setStaff(staff.filter((s) => s.id !== id));
    showToast('Staff member removed', 'info');
  };

  const hasReceptionist = staff.some((s) => s.role === 'Receptionist');

  const handleNext = () => {
    if (!hasReceptionist) {
      // Show warning but allow continuation
      showToast('Consider adding a receptionist for better operations', 'warning');
    }
    onUpdate(staff);
    onNext();
  };

  return (
    <div className="p-4 space-y-6 pb-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-aba-neutral-900 mb-2">
          Add Staff & Roles
        </h2>
        <p className="text-sm text-aba-neutral-600">
          Invite team members to your clinic
        </p>
      </div>

      {/* Add Staff Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full border-2 border-dashed border-aba-secondary-main rounded-xl p-4 bg-aba-secondary-50/30 hover:bg-aba-secondary-50 transition-colors"
        >
          <div className="flex items-center justify-center gap-2 text-aba-secondary-main">
            <UserPlus className="w-5 h-5" />
            <span className="text-sm font-semibold">Invite Staff Member</span>
          </div>
        </button>
      )}

      {/* Add Staff Form */}
      {showAddForm && (
        <div className="bg-aba-neutral-0 border border-aba-secondary-main rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-aba-neutral-900">
              Invite Staff Member
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormData({ name: '', contact: '', contactType: 'phone', role: '' });
              }}
              className="text-aba-neutral-500 hover:text-aba-neutral-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-aba-neutral-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Jane Doe"
              className="w-full px-3 py-2 border border-aba-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aba-secondary-main"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-aba-neutral-700 mb-1">
              Contact Method
            </label>
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setFormData({ ...formData, contactType: 'phone' })}
                className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  formData.contactType === 'phone'
                    ? 'bg-aba-secondary-main text-white border-aba-secondary-main'
                    : 'bg-aba-neutral-0 text-aba-neutral-700 border-aba-neutral-300'
                }`}
              >
                <Phone className="w-4 h-4 inline mr-1" />
                Phone
              </button>
              <button
                onClick={() => setFormData({ ...formData, contactType: 'email' })}
                className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  formData.contactType === 'email'
                    ? 'bg-aba-secondary-main text-white border-aba-secondary-main'
                    : 'bg-aba-neutral-0 text-aba-neutral-700 border-aba-neutral-300'
                }`}
              >
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </button>
            </div>
            <input
              type={formData.contactType === 'email' ? 'email' : 'tel'}
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder={formData.contactType === 'email' ? 'jane@example.com' : '0700 123 456'}
              className="w-full px-3 py-2 border border-aba-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aba-secondary-main"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-aba-neutral-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-aba-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aba-secondary-main"
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <ABAButton
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={handleAddStaff}
            >
              Send Invite
            </ABAButton>
            <ABAButton
              variant="outline"
              size="md"
              className="flex-1"
              onClick={() => {
                setShowAddForm(false);
                setFormData({ name: '', contact: '', contactType: 'phone', role: '' });
              }}
            >
              Cancel
            </ABAButton>
          </div>
        </div>
      )}

      {/* Staff List */}
      {staff.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-aba-neutral-900">
            Invited Staff ({staff.length})
          </h3>
          {staff.map((member) => (
            <div
              key={member.id}
              className="bg-aba-neutral-0 border border-aba-neutral-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-aba-secondary-main">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-aba-neutral-900">
                        {member.name}
                      </h4>
                      <p className="text-xs text-aba-neutral-600 mt-0.5">
                        {member.contact}
                      </p>
                    </div>
                    <button
                      onClick={() => removeStaff(member.id)}
                      className="p-1.5 rounded-lg hover:bg-aba-error-50 text-aba-error-main transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <ABABadge variant={roleColors[member.role] || 'info'} size="sm">
                    {member.role}
                  </ABABadge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Receptionist Warning */}
      {staff.length > 0 && !hasReceptionist && (
        <div className="bg-aba-warning-50 border border-aba-warning-main/20 rounded-xl p-4">
          <p className="text-sm text-aba-warning-main font-medium">
            ⚠️ No receptionist added. Consider inviting one for better booking management.
          </p>
        </div>
      )}

      {/* Info Note */}
      {staff.length === 0 && !showAddForm && (
        <div className="bg-aba-neutral-50 rounded-xl p-4">
          <p className="text-xs text-aba-neutral-700 text-center">
            You can skip this step and add staff members later from your dashboard.
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
