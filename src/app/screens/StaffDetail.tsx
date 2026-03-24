import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { ABABadge } from '../components/aba/ABABadge';
import { ListCard, ListCardItem } from '../components/aba/Cards';
import { ABAModal } from '../components/aba/ABAModal';
import { InputField } from '../components/aba/InputField';
import { showToast } from '../components/aba/Toast';
import {
  UserCheck,
  Mail,
  Send,
  Phone,
  Briefcase,
  Clock,
  Activity,
  UserCog,
  RotateCcw,
  UserX,
  Calendar,
  ShieldOff,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

type StaffStatus = 'active' | 'invited' | 'deactivated';
type StaffRole = 'Therapist' | 'Receptionist' | 'Facility Admin' | 'Support Staff';

const roles: StaffRole[] = ['Therapist', 'Receptionist', 'Facility Admin', 'Support Staff'];

interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  status: StaffStatus;
  email: string;
  phone: string;
  lastLogin?: string;
  lastAction?: string;
  joinedDate: string;
  deactivatedDate?: string;
  deactivatedBy?: string;
  deactivationReason?: string;
}

// Mock data
const mockStaffData: Record<string, Staff> = {
  '1': {
    id: '1',
    name: 'Dr. Sarah Johnson',
    role: 'Facility Admin',
    status: 'active',
    email: 'sarah.j@clinic.com',
    phone: '+256 700 123 456',
    lastLogin: '2 hours ago',
    lastAction: 'Updated clinic settings',
    joinedDate: 'Jan 15, 2024',
  },
  '2': {
    id: '2',
    name: 'Michael Chen',
    role: 'Therapist',
    status: 'active',
    email: 'michael.c@clinic.com',
    phone: '+256 700 234 567',
    lastLogin: '5 hours ago',
    lastAction: 'Completed session with John Doe',
    joinedDate: 'Feb 1, 2024',
  },
  '3': {
    id: '3',
    name: 'Emily Williams',
    role: 'Receptionist',
    status: 'active',
    email: 'emily.w@clinic.com',
    phone: '+256 700 345 678',
    lastLogin: 'Yesterday',
    lastAction: 'Scheduled new booking',
    joinedDate: 'Dec 10, 2023',
  },
  '4': {
    id: '4',
    name: 'David Martinez',
    role: 'Therapist',
    status: 'invited',
    email: 'david.m@clinic.com',
    phone: '+256 700 456 789',
    joinedDate: 'Mar 5, 2024',
  },
  '5': {
    id: '5',
    name: 'Lisa Anderson',
    role: 'Support Staff',
    status: 'deactivated',
    email: 'lisa.a@clinic.com',
    phone: '+256 700 567 890',
    joinedDate: 'Jun 20, 2023',
    deactivatedDate: 'Jan 8, 2026',
    deactivatedBy: 'Dr. Sarah Johnson',
    deactivationReason: 'Extended leave of absence — contract ended.',
  },
};

const statusConfig = {
  active: { label: 'Active', variant: 'success' as const },
  invited: { label: 'Invited', variant: 'warning' as const },
  deactivated: { label: 'Deactivated', variant: 'default' as const },
};

const roleColors = {
  'Facility Admin': 'primary' as const,
  'Therapist': 'secondary' as const,
  'Receptionist': 'info' as const,
  'Support Staff': 'default' as const,
};

export function StaffDetail() {
  const navigate = useNavigate();
  const { staffId } = useParams();
  const [showResetPinModal, setShowResetPinModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '' as StaffRole | '',
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const staff = staffId ? mockStaffData[staffId] : null;

  if (!staff) {
    return (
      <div className="flex flex-col h-screen bg-aba-bg-primary">
        <AppTopBar
          title="Staff Details"
          showBack
          onBackClick={() => navigate('/staff-list')}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-aba-neutral-600">Staff member not found</p>
        </div>
      </div>
    );
  }

  const handleResetPin = () => {
    showToast(`PIN reset link sent to ${staff.name}`, 'success');
    setShowResetPinModal(false);
  };

  const handleDeactivate = () => {
    if (deactivateReason.trim()) {
      showToast(`${staff.name} has been deactivated`, 'success');
      setShowDeactivateModal(false);
      setDeactivateReason('');
      setTimeout(() => {
        navigate('/staff-list');
      }, 500);
    }
  };

  const handleReactivate = () => {
    showToast(`${staff.name} has been reactivated`, 'success');
    setShowReactivateModal(false);
    setTimeout(() => {
      navigate('/staff-list');
    }, 500);
  };

  const handleEditDetails = () => {
    const errors: Record<string, string> = {};
    if (!editFormData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!editFormData.email.trim()) {
      errors.email = 'Email is required';
    }
    if (!editFormData.phone.trim()) {
      errors.phone = 'Phone is required';
    }
    if (!editFormData.role) {
      errors.role = 'Role is required';
    }
    setEditErrors(errors);

    if (Object.keys(errors).length === 0) {
      // Update staff details logic here
      showToast(`${staff.name} details updated`, 'success');
      setShowEditDetailsModal(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Staff Details"
        showBack
        onBackClick={() => navigate('/staff-list')}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Staff Profile Card */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                  staff.status === 'deactivated'
                    ? 'bg-aba-neutral-100'
                    : 'bg-aba-primary-50'
                }`}
              >
                {staff.status === 'deactivated' ? (
                  <ShieldOff className="w-8 h-8 text-aba-neutral-400" />
                ) : (
                  <UserCheck className="w-8 h-8 text-aba-primary-main" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-aba-neutral-900 mb-1">
                  {staff.name}
                </h2>
                <div className="flex items-center gap-2 mb-3">
                  <ABABadge variant={roleColors[staff.role]} size="sm">
                    {staff.role}
                  </ABABadge>
                  <ABABadge variant={statusConfig[staff.status].variant} size="sm">
                    {statusConfig[staff.status].label}
                  </ABABadge>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-aba-neutral-500" />
                <span className="text-aba-neutral-900">{staff.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-aba-neutral-500" />
                <span className="text-aba-neutral-900">{staff.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-aba-neutral-500" />
                <span className="text-aba-neutral-600">Joined {staff.joinedDate}</span>
              </div>
            </div>
          </div>

          {/* Deactivation Notice Banner */}
          {staff.status === 'deactivated' && (
            <div className="bg-aba-error-50 rounded-2xl border border-aba-error-main/20 p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-aba-error-main" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-aba-neutral-900 mb-0.5">
                    Account Deactivated
                  </p>
                  <p className="text-xs text-aba-neutral-600">
                    This staff member can no longer access the system. Reactivate to restore access.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Deactivation Details Card */}
          {staff.status === 'deactivated' && (
            <div>
              <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
                Deactivation Details
              </h3>
              <div className="bg-white rounded-2xl border border-aba-neutral-200 overflow-hidden">
                <div className="p-4 space-y-3">
                  {staff.deactivatedDate && (
                    <div className="flex items-center gap-3">
                      <div className="text-aba-neutral-400 flex-shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-aba-neutral-600">Deactivated On</span>
                        <p className="text-sm text-aba-neutral-900">{staff.deactivatedDate}</p>
                      </div>
                    </div>
                  )}
                  {staff.deactivatedBy && (
                    <div className="flex items-center gap-3">
                      <div className="text-aba-neutral-400 flex-shrink-0">
                        <UserX className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-aba-neutral-600">Deactivated By</span>
                        <p className="text-sm text-aba-neutral-900">{staff.deactivatedBy}</p>
                      </div>
                    </div>
                  )}
                  {staff.deactivationReason && (
                    <div className="flex items-start gap-3">
                      <div className="text-aba-neutral-400 flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-aba-neutral-600">Reason</span>
                        <p className="text-sm text-aba-neutral-900">{staff.deactivationReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Activity Preview */}
          {staff.status === 'active' && (
            <div>
              <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
                Recent Activity
              </h3>
              <ListCard>
                <ListCardItem onClick={() => {}}>
                  <div className="w-10 h-10 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-aba-secondary-main" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-aba-neutral-900">
                      Last Login
                    </p>
                    <p className="text-xs text-aba-neutral-600">
                      {staff.lastLogin}
                    </p>
                  </div>
                </ListCardItem>
                {staff.lastAction && (
                  <ListCardItem onClick={() => {}}>
                    <div className="w-10 h-10 rounded-full bg-aba-primary-50 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-aba-primary-main" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-aba-neutral-900">
                        Last Action
                      </p>
                      <p className="text-xs text-aba-neutral-600">
                        {staff.lastAction}
                      </p>
                    </div>
                  </ListCardItem>
                )}
              </ListCard>
            </div>
          )}

          {/* Actions */}
          <div>
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
              Actions
            </h3>
            <div className="space-y-3">
              <ABAButton
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => {
                  setEditFormData({
                    fullName: staff.name,
                    email: staff.email,
                    phone: staff.phone,
                    role: staff.role,
                  });
                  setShowEditDetailsModal(true);
                }}
              >
                <UserCog className="w-5 h-5" />
                Edit Details
              </ABAButton>
              {staff.status === 'invited' && (
                <ABAButton
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => {
                    showToast(`Invite resent to ${staff.name}`, 'success');
                  }}
                >
                  <Send className="w-5 h-5" />
                  Resend Invite
                </ABAButton>
              )}
              {staff.status === 'active' && (
                <ABAButton
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => setShowResetPinModal(true)}
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset PIN
                </ABAButton>
              )}
              {staff.status !== 'deactivated' && (
                <ABAButton
                  variant="destructive"
                  size="lg"
                  fullWidth
                  onClick={() => setShowDeactivateModal(true)}
                >
                  <UserX className="w-5 h-5 text-aba-error-main" />
                  <span className="text-aba-error-main">Deactivate Staff Member</span>
                </ABAButton>
              )}
              {staff.status === 'deactivated' && (
                <ABAButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => setShowReactivateModal(true)}
                >
                  <ShieldCheck className="w-5 h-5" />
                  Reactivate Staff Member
                </ABAButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reset PIN Modal */}
      <ABAModal
        isOpen={showResetPinModal}
        onClose={() => setShowResetPinModal(false)}
        title="Reset PIN"
      >
        <div className="space-y-4">
          <p className="text-sm text-aba-neutral-600">
            Are you sure you want to reset the PIN for{' '}
            <span className="font-medium text-aba-neutral-900">{staff.name}</span>?
          </p>
          <p className="text-sm text-aba-neutral-600">
            They will receive a link to create a new PIN.
          </p>
          <div className="flex gap-3 pt-2">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => setShowResetPinModal(false)}
            >
              Cancel
            </ABAButton>
            <ABAButton
              variant="primary"
              fullWidth
              onClick={handleResetPin}
            >
              Reset PIN
            </ABAButton>
          </div>
        </div>
      </ABAModal>

      {/* Deactivate Modal */}
      <ABAModal
        isOpen={showDeactivateModal}
        onClose={() => {
          setShowDeactivateModal(false);
          setDeactivateReason('');
        }}
        title="Deactivate Staff Member"
      >
        <div className="space-y-4">
          <p className="text-sm text-aba-neutral-600">
            You are about to deactivate{' '}
            <span className="font-medium text-aba-neutral-900">{staff.name}</span>.
            Please provide a reason.
          </p>
          <InputField
            placeholder="Enter reason for deactivation..."
            value={deactivateReason}
            onChange={(e) => setDeactivateReason(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-aba-neutral-900 placeholder:text-aba-neutral-600 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main focus:border-transparent transition-all resize-none"
          />
          <div className="flex gap-3 pt-2">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => {
                setShowDeactivateModal(false);
                setDeactivateReason('');
              }}
            >
              Cancel
            </ABAButton>
            <ABAButton
              variant="destructive"
              fullWidth
              onClick={handleDeactivate}
              disabled={!deactivateReason.trim()}
            >
              Deactivate
            </ABAButton>
          </div>
        </div>
      </ABAModal>

      {/* Reactivate Modal */}
      <ABAModal
        isOpen={showReactivateModal}
        onClose={() => setShowReactivateModal(false)}
        title="Reactivate Staff Member"
      >
        <div className="space-y-4">
          <p className="text-sm text-aba-neutral-600">
            Are you sure you want to reactivate{' '}
            <span className="font-medium text-aba-neutral-900">{staff.name}</span>?
          </p>
          <p className="text-xs text-aba-neutral-500">
            They will regain access to the system and be marked as active.
          </p>
          <div className="flex gap-3 pt-2">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => setShowReactivateModal(false)}
            >
              Cancel
            </ABAButton>
            <ABAButton
              variant="primary"
              fullWidth
              onClick={handleReactivate}
            >
              Reactivate
            </ABAButton>
          </div>
        </div>
      </ABAModal>

      {/* Edit Details Modal */}
      <ABAModal
        isOpen={showEditDetailsModal}
        onClose={() => {
          setShowEditDetailsModal(false);
          setShowRoleDropdown(false);
          setEditFormData({
            fullName: '',
            email: '',
            phone: '',
            role: '' as StaffRole | '',
          });
          setEditErrors({});
        }}
        title="Edit Staff Details"
      >
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
              Full Name *
            </label>
            <InputField
              placeholder="Enter full name"
              value={editFormData.fullName}
              onChange={(e) => {
                setEditFormData({ ...editFormData, fullName: e.target.value });
                if (editErrors.fullName) {
                  setEditErrors({ ...editErrors, fullName: '' });
                }
              }}
              error={editErrors.fullName}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
              Email Address *
            </label>
            <InputField
              type="email"
              placeholder="email@example.com"
              value={editFormData.email}
              onChange={(e) => {
                setEditFormData({ ...editFormData, email: e.target.value });
                if (editErrors.email) {
                  setEditErrors({ ...editErrors, email: '' });
                }
              }}
              leftIcon={<Mail className="w-5 h-5" />}
              error={editErrors.email}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
              Phone Number *
            </label>
            <InputField
              type="tel"
              placeholder="+256 700 000 000"
              value={editFormData.phone}
              onChange={(e) => {
                setEditFormData({ ...editFormData, phone: e.target.value });
                if (editErrors.phone) {
                  setEditErrors({ ...editErrors, phone: '' });
                }
              }}
              leftIcon={<Phone className="w-5 h-5" />}
              error={editErrors.phone}
            />
          </div>

          {/* Role Dropdown */}
          <div>
            <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
              Role *
            </label>
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-left ${
                  editErrors.role
                    ? 'border-aba-error-main bg-aba-error-50'
                    : 'border-aba-neutral-200 bg-white hover:border-aba-neutral-300'
                }`}
              >
                <Briefcase className="w-5 h-5 text-aba-neutral-500" />
                <span className={editFormData.role ? 'text-aba-neutral-900' : 'text-aba-neutral-500'}>
                  {editFormData.role || 'Select role'}
                </span>
              </button>
              {editErrors.role && (
                <p className="text-xs text-aba-error-main mt-1">{editErrors.role}</p>
              )}

              {/* Dropdown Menu */}
              {showRoleDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-aba-neutral-200 shadow-lg z-10">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setEditFormData({ ...editFormData, role });
                        setShowRoleDropdown(false);
                        if (editErrors.role) {
                          setEditErrors({ ...editErrors, role: '' });
                        }
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        editFormData.role === role
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => {
                setShowEditDetailsModal(false);
                setShowRoleDropdown(false);
                setEditFormData({
                  fullName: '',
                  email: '',
                  phone: '',
                  role: '' as StaffRole | '',
                });
                setEditErrors({});
              }}
            >
              Cancel
            </ABAButton>
            <ABAButton
              variant="primary"
              fullWidth
              onClick={handleEditDetails}
            >
              Save Changes
            </ABAButton>
          </div>
        </div>
      </ABAModal>
    </div>
  );
}