import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { BottomNav } from '../components/aba/BottomNav';
import { ABAButton } from '../components/aba/ABAButton';
import { ABABadge } from '../components/aba/ABABadge';
import { ListCard, ListCardItem } from '../components/aba/Cards';
import { ABAModal } from '../components/aba/ABAModal';
import { showToast } from '../components/aba/Toast';
import {
  Search,
  SlidersHorizontal,
  X,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Mail,
  RotateCcw,
  UserX,
  Eye,
  UserCog,
  Inbox,
} from 'lucide-react';

/* ── types ── */

type StaffStatus = 'active' | 'invited' | 'deactivated';
type StaffRole = 'Therapist' | 'Receptionist' | 'Facility Admin' | 'Support Staff';

interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  status: StaffStatus;
  email: string;
  phone: string;
  lastLogin?: string;
}

/* ── mock data ── */

const mockStaffData: Staff[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    role: 'Facility Admin',
    status: 'active',
    email: 'sarah.j@clinic.com',
    phone: '+256 700 123 456',
    lastLogin: '2 hours ago',
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Therapist',
    status: 'active',
    email: 'michael.c@clinic.com',
    phone: '+256 700 234 567',
    lastLogin: '5 hours ago',
  },
  {
    id: '3',
    name: 'Emily Williams',
    role: 'Receptionist',
    status: 'active',
    email: 'emily.w@clinic.com',
    phone: '+256 700 345 678',
    lastLogin: 'Yesterday',
  },
  {
    id: '4',
    name: 'David Martinez',
    role: 'Therapist',
    status: 'invited',
    email: 'david.m@clinic.com',
    phone: '+256 700 456 789',
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    role: 'Support Staff',
    status: 'deactivated',
    email: 'lisa.a@clinic.com',
    phone: '+256 700 567 890',
  },
];

/* ── config maps ── */

const statusConfig = {
  active: { label: 'Active', variant: 'success' as const },
  invited: { label: 'Invited', variant: 'warning' as const },
  deactivated: { label: 'Deactivated', variant: 'default' as const },
};

const roleColors = {
  'Facility Admin': 'primary' as const,
  Therapist: 'secondary' as const,
  Receptionist: 'info' as const,
  'Support Staff': 'default' as const,
};

/* ── filter option definitions ── */

type RoleFilter = 'all' | StaffRole;
type StatusFilterKey = 'all' | StaffStatus;

const roleOptions: { key: RoleFilter; label: string }[] = [
  { key: 'all', label: 'All Roles' },
  { key: 'Facility Admin', label: 'Facility Admin' },
  { key: 'Therapist', label: 'Therapist' },
  { key: 'Receptionist', label: 'Receptionist' },
  { key: 'Support Staff', label: 'Support Staff' },
];

const statusOptions: { key: StatusFilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'invited', label: 'Invited' },
  { key: 'deactivated', label: 'Deactivated' },
];

/* ════════════════════════════════════════ */

export function StaffList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('settings');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterRole, setFilterRole] = useState<RoleFilter>('all');
  const [filterStatus, setFilterStatus] = useState<StatusFilterKey>('all');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showResetPinModal, setShowResetPinModal] = useState(false);
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '' as StaffRole | '',
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  /* Active filter count */
  const activeFiltersCount =
    (filterRole !== 'all' ? 1 : 0) +
    (filterStatus !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setFilterRole('all');
    setFilterStatus('all');
  };

  /* Status counts within current role filter */
  const statusCounts = useMemo(() => {
    let base = filterRole !== 'all'
      ? mockStaffData.filter((s) => s.role === filterRole)
      : mockStaffData;
    const counts: Record<StatusFilterKey, number> = {
      all: base.length,
      active: base.filter((s) => s.status === 'active').length,
      invited: base.filter((s) => s.status === 'invited').length,
      deactivated: base.filter((s) => s.status === 'deactivated').length,
    };
    return counts;
  }, [filterRole]);

  /* Role counts within current status filter */
  const roleCounts = useMemo(() => {
    let base = filterStatus !== 'all'
      ? mockStaffData.filter((s) => s.status === filterStatus)
      : mockStaffData;
    const counts: Record<RoleFilter, number> = {
      all: base.length,
      'Facility Admin': base.filter((s) => s.role === 'Facility Admin').length,
      Therapist: base.filter((s) => s.role === 'Therapist').length,
      Receptionist: base.filter((s) => s.role === 'Receptionist').length,
      'Support Staff': base.filter((s) => s.role === 'Support Staff').length,
    };
    return counts;
  }, [filterStatus]);

  /* Apply all filters */
  const filteredStaff = useMemo(() => {
    let items = [...mockStaffData];

    if (filterRole !== 'all') {
      items = items.filter((s) => s.role === filterRole);
    }

    if (filterStatus !== 'all') {
      items = items.filter((s) => s.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q),
      );
    }

    return items;
  }, [filterRole, filterStatus, searchQuery]);

  /* ── action handlers ── */

  const handleResendInvite = (staff: Staff) => {
    showToast(`Invite resent to ${staff.name}`, 'success');
    setShowActionsMenu(null);
  };

  const handleResetPin = () => {
    if (selectedStaff) {
      showToast(`PIN reset link sent to ${selectedStaff.name}`, 'success');
      setShowResetPinModal(false);
      setShowActionsMenu(null);
      setSelectedStaff(null);
    }
  };

  const handleDeactivate = () => {
    if (selectedStaff && deactivateReason.trim()) {
      showToast(`${selectedStaff.name} has been deactivated`, 'success');
      setShowDeactivateModal(false);
      setShowActionsMenu(null);
      setSelectedStaff(null);
      setDeactivateReason('');
    }
  };

  const handleEditRole = () => {
    if (selectedStaff && editFormData.role) {
      showToast(`${selectedStaff.name}'s role has been updated to ${editFormData.role}`, 'success');
      setShowEditDetailsModal(false);
      setShowActionsMenu(null);
      setSelectedStaff(null);
      setEditFormData({
        fullName: '',
        email: '',
        phone: '',
        role: '' as StaffRole | '',
      });
      setEditErrors({});
    }
  };

  const handleEditDetails = () => {
    if (selectedStaff) {
      setEditFormData({
        fullName: selectedStaff.name,
        email: selectedStaff.email,
        phone: selectedStaff.phone,
        role: selectedStaff.role,
      });
      setShowEditDetailsModal(true);
      setShowActionsMenu(null);
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setEditErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const validateEditForm = () => {
    let valid = true;
    const errors: Record<string, string> = {};

    if (!editFormData.fullName.trim()) {
      errors.fullName = 'Full name is required';
      valid = false;
    }

    if (!editFormData.email.trim()) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(editFormData.email)) {
      errors.email = 'Invalid email format';
      valid = false;
    }

    if (!editFormData.phone.trim()) {
      errors.phone = 'Phone number is required';
      valid = false;
    } else if (!/^\+\d{1,3} \d{3} \d{3} \d{3,4}$/.test(editFormData.phone)) {
      errors.phone = 'Invalid phone number format';
      valid = false;
    }

    if (!editFormData.role) {
      errors.role = 'Role is required';
      valid = false;
    }

    setEditErrors(errors);
    return valid;
  };

  const handleEditFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEditForm()) {
      handleEditRole();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Staff & Roles"
        leftAction={
          <button
            onClick={() => navigate('/clinic-dashboard')}
            className="p-2 -ml-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-aba-neutral-900" />
          </button>
        }
        rightAction={
          <ABAButton
            variant="primary"
            size="sm"
            onClick={() => navigate('/invite-staff')}
          >
            <Plus className="w-4 h-4" />
            Invite
          </ABAButton>
        }
      />

      {/* Search + Filter bar */}
      <div className="bg-white border-b border-aba-neutral-200 px-4 pt-3 pb-3 space-y-2.5 flex-shrink-0">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aba-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, or role..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-aba-neutral-200 bg-aba-neutral-100 text-sm text-aba-neutral-900 placeholder:text-aba-neutral-400 focus:outline-none focus:ring-2 focus:ring-aba-primary-main/30 focus:border-aba-primary-main transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl border border-aba-neutral-200 bg-aba-neutral-100 hover:bg-aba-neutral-200 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-aba-neutral-700" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-aba-primary-main text-white text-[10px] font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Active filter tags */}
        {activeFiltersCount > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {filterRole !== 'all' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium pl-2.5 pr-1.5 py-1 rounded-full bg-aba-neutral-900 text-white">
                {roleOptions.find((r) => r.key === filterRole)?.label}
                <button
                  onClick={() => setFilterRole('all')}
                  className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium pl-2.5 pr-1.5 py-1 rounded-full bg-aba-neutral-900 text-white">
                {statusOptions.find((s) => s.key === filterStatus)?.label}
                <button
                  onClick={() => setFilterStatus('all')}
                  className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {filteredStaff.length > 0 ? (
          <div className="p-4 space-y-3">
            {/* Results count */}
            <p className="text-xs text-aba-neutral-600 px-1">
              {filteredStaff.length} {filteredStaff.length === 1 ? 'staff member' : 'staff members'}
            </p>

            {/* Staff List */}
            <ListCard>
              {filteredStaff.map((staff) => (
                <ListCardItem
                  key={staff.id}
                  onClick={() => navigate(`/staff/${staff.id}`)}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-aba-primary-50 flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-5 h-5 text-aba-neutral-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-aba-neutral-900">
                          {staff.name}
                        </p>
                        <ABABadge variant={statusConfig[staff.status].variant} size="sm">
                          {statusConfig[staff.status].label}
                        </ABABadge>
                      </div>
                      <p className="text-xs text-aba-neutral-600 mb-1">
                        {staff.email}
                      </p>
                      <div className="flex items-center gap-2">
                        <ABABadge variant={roleColors[staff.role]} size="sm">
                          {staff.role}
                        </ABABadge>
                        {staff.lastLogin && (
                          <span className="text-xs text-[#8F9AA1]">
                            Last login: {staff.lastLogin}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-aba-neutral-400 flex-shrink-0" />
                </ListCardItem>
              ))}
            </ListCard>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-24 px-4">
            <div className="w-14 h-14 rounded-2xl bg-aba-neutral-100 border border-aba-neutral-200 flex items-center justify-center mb-4">
              <Inbox className="w-6 h-6 text-aba-neutral-400" />
            </div>
            <p className="text-sm font-medium text-aba-neutral-700">No staff members found</p>
            <p className="text-xs text-aba-neutral-600 mt-1 text-center max-w-[220px]">
              {searchQuery.trim()
                ? 'Try a different search term.'
                : 'No staff match the current filters.'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Filter bottom sheet ── */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowFilters(false)}
          />
          {/* Sheet */}
          <div className="relative bg-white rounded-t-2xl px-4 pt-3 pb-6">
            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-aba-neutral-200 mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-aba-neutral-900">Filters</h3>
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="text-xs font-medium text-aba-error-main">
                  Clear all
                </button>
              )}
            </div>

            {/* Section 1: Role */}
            <div className="mb-5">
              <p className="text-xs font-medium text-aba-neutral-600 uppercase tracking-wide mb-2.5">
                Role
              </p>
              <div className="flex gap-2 flex-wrap">
                {roleOptions.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setFilterRole(r.key)}
                    className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                      filterRole === r.key
                        ? 'bg-aba-neutral-900 text-white border-aba-neutral-900'
                        : 'bg-white text-aba-neutral-700 border-aba-neutral-200 hover:bg-aba-neutral-100'
                    }`}
                  >
                    {r.label}
                    {roleCounts[r.key] > 0 && (
                      <span className={`ml-1 ${filterRole === r.key ? 'text-white/60' : 'text-aba-neutral-400'}`}>
                        {roleCounts[r.key]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Status */}
            <div className="mb-5">
              <p className="text-xs font-medium text-aba-neutral-600 uppercase tracking-wide mb-2.5">
                Status
              </p>
              <div className="flex gap-2 flex-wrap">
                {statusOptions.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setFilterStatus(s.key)}
                    className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                      filterStatus === s.key
                        ? 'bg-aba-neutral-900 text-white border-aba-neutral-900'
                        : 'bg-white text-aba-neutral-700 border-aba-neutral-200 hover:bg-aba-neutral-100'
                    }`}
                  >
                    {s.label}
                    {statusCounts[s.key] > 0 && (
                      <span className={`ml-1 ${filterStatus === s.key ? 'text-white/60' : 'text-aba-neutral-400'}`}>
                        {statusCounts[s.key]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply */}
            <button
              onClick={() => setShowFilters(false)}
              className="w-full h-11 rounded-xl bg-aba-primary-main text-white text-sm font-semibold hover:bg-aba-primary-100 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Reset PIN Modal */}
      <ABAModal
        isOpen={showResetPinModal}
        onClose={() => {
          setShowResetPinModal(false);
          setSelectedStaff(null);
        }}
        title="Reset PIN"
      >
        <div className="space-y-4">
          <p className="text-sm text-aba-neutral-600">
            Are you sure you want to reset the PIN for{' '}
            <span className="font-medium text-aba-neutral-900">{selectedStaff?.name}</span>?
          </p>
          <p className="text-sm text-aba-neutral-600">
            They will receive a link to create a new PIN.
          </p>
          <div className="flex gap-3 pt-2">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => {
                setShowResetPinModal(false);
                setSelectedStaff(null);
              }}
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
          setSelectedStaff(null);
          setDeactivateReason('');
        }}
        title="Deactivate Staff Member"
      >
        <div className="space-y-4">
          <p className="text-sm text-aba-neutral-600">
            You are about to deactivate{' '}
            <span className="font-medium text-aba-neutral-900">{selectedStaff?.name}</span>.
            Please provide a reason.
          </p>
          <textarea
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
                setSelectedStaff(null);
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

      {/* Edit Details Modal */}
      <ABAModal
        isOpen={showEditDetailsModal}
        onClose={() => {
          setShowEditDetailsModal(false);
          setSelectedStaff(null);
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
        <form onSubmit={handleEditFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-aba-neutral-600">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={editFormData.fullName}
              onChange={handleEditFormChange}
              className="w-full px-4 py-3 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-aba-neutral-900 placeholder:text-aba-neutral-600 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main focus:border-transparent transition-all"
              placeholder="Enter full name"
            />
            {editErrors.fullName && (
              <p className="text-sm text-aba-error-main">{editErrors.fullName}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm text-aba-neutral-600">Email</label>
            <input
              type="email"
              name="email"
              value={editFormData.email}
              onChange={handleEditFormChange}
              className="w-full px-4 py-3 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-aba-neutral-900 placeholder:text-aba-neutral-600 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main focus:border-transparent transition-all"
              placeholder="Enter email"
            />
            {editErrors.email && (
              <p className="text-sm text-aba-error-main">{editErrors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm text-aba-neutral-600">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={editFormData.phone}
              onChange={handleEditFormChange}
              className="w-full px-4 py-3 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-aba-neutral-900 placeholder:text-aba-neutral-600 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main focus:border-transparent transition-all"
              placeholder="Enter phone number"
            />
            {editErrors.phone && (
              <p className="text-sm text-aba-error-main">{editErrors.phone}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm text-aba-neutral-600">Role</label>
            <div className="relative">
              <select
                name="role"
                value={editFormData.role}
                onChange={handleEditFormChange}
                className="w-full px-4 py-3 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-aba-neutral-900 placeholder:text-aba-neutral-600 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main focus:border-transparent transition-all"
              >
                <option value="">Select a role</option>
                {(['Therapist', 'Receptionist', 'Facility Admin', 'Support Staff'] as const).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            {editErrors.role && (
              <p className="text-sm text-aba-error-main">{editErrors.role}</p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => {
                setShowEditDetailsModal(false);
                setSelectedStaff(null);
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
              type="submit"
            >
              Update Details
            </ABAButton>
          </div>
        </form>
      </ABAModal>
    </div>
  );
}