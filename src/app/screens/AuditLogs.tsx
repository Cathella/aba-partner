import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABABadge } from '../components/aba/ABABadge';
import { ABAButton } from '../components/aba/ABAButton';
import { ListCard, ListCardItem } from '../components/aba/Cards';
import {
  ChevronLeft,
  Filter,
  Download,
  X,
  Shield,
  User,
  DollarSign,
  Calendar,
  Settings,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  UserPlus,
  ChevronRight,
} from 'lucide-react';

type AuditModule = 'staff' | 'services' | 'bookings' | 'finance' | 'settings' | 'all';
type AuditActionType =
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'void'
  | 'all';

interface AuditLog {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  actionType: AuditActionType;
  module: AuditModule;
  timestamp: string;
  ipAddress: string;
  details?: string;
}

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    actor: 'Dr. Sarah Chen',
    actorRole: 'Facility Admin',
    action: 'Approved refund for transaction TXN-2026-001234',
    actionType: 'approve',
    module: 'finance',
    timestamp: '2026-02-11T14:30:00',
    ipAddress: '192.168.1.100',
    details: 'Refund amount: UGX 150,000',
  },
  {
    id: '2',
    actor: 'Dr. Sarah Chen',
    actorRole: 'Facility Admin',
    action: 'Updated service pricing for Speech Therapy',
    actionType: 'update',
    module: 'services',
    timestamp: '2026-02-11T11:15:00',
    ipAddress: '192.168.1.100',
    details: 'Price changed from UGX 100,000 to UGX 150,000',
  },
  {
    id: '3',
    actor: 'Dr. Emily Martinez',
    actorRole: 'Therapist',
    action: 'Created new patient booking',
    actionType: 'create',
    module: 'bookings',
    timestamp: '2026-02-11T09:45:00',
    ipAddress: '192.168.1.101',
    details: 'Patient: Sarah Johnson, Service: Speech Therapy',
  },
  {
    id: '4',
    actor: 'Dr. Sarah Chen',
    actorRole: 'Facility Admin',
    action: 'Deleted staff member account',
    actionType: 'delete',
    module: 'staff',
    timestamp: '2026-02-10T16:20:00',
    ipAddress: '192.168.1.100',
    details: 'Staff: John Williams (Inactive)',
  },
  {
    id: '5',
    actor: 'Dr. Sarah Chen',
    actorRole: 'Facility Admin',
    action: 'Voided transaction TXN-2026-001220',
    actionType: 'void',
    module: 'finance',
    timestamp: '2026-02-10T14:10:00',
    ipAddress: '192.168.1.100',
    details: 'Reason: Duplicate transaction',
  },
  {
    id: '6',
    actor: 'Dr. Sarah Chen',
    actorRole: 'Facility Admin',
    action: 'Invited new staff member',
    actionType: 'create',
    module: 'staff',
    timestamp: '2026-02-10T10:30:00',
    ipAddress: '192.168.1.100',
    details: 'Email: newstaff@clinic.com, Role: Therapist',
  },
  {
    id: '7',
    actor: 'Dr. James Wilson',
    actorRole: 'Therapist',
    action: 'Cancelled booking BK-001456',
    actionType: 'reject',
    module: 'bookings',
    timestamp: '2026-02-09T15:45:00',
    ipAddress: '192.168.1.102',
    details: 'Reason: Patient requested cancellation',
  },
  {
    id: '8',
    actor: 'Dr. Sarah Chen',
    actorRole: 'Facility Admin',
    action: 'Updated operating hours',
    actionType: 'update',
    module: 'settings',
    timestamp: '2026-02-09T09:00:00',
    ipAddress: '192.168.1.100',
    details: 'Extended Friday hours to 6:00 PM',
  },
];

const moduleConfig: Record<
  AuditModule,
  { label: string; icon: any; color: string }
> = {
  staff: {
    label: 'Staff',
    icon: User,
    color: 'text-aba-primary-main',
  },
  services: {
    label: 'Services',
    icon: FileText,
    color: 'text-aba-secondary-main',
  },
  bookings: {
    label: 'Bookings',
    icon: Calendar,
    color: 'text-aba-warning-main',
  },
  finance: {
    label: 'Finance',
    icon: DollarSign,
    color: 'text-aba-success-main',
  },
  settings: {
    label: 'Settings',
    icon: Settings,
    color: 'text-aba-neutral-600',
  },
  all: {
    label: 'All Modules',
    icon: Shield,
    color: 'text-aba-neutral-600',
  },
};

const actionTypeConfig: Record<
  AuditActionType,
  { label: string; icon: any; variant: 'success' | 'info' | 'warning' | 'danger' | 'default' }
> = {
  create: {
    label: 'Create',
    icon: UserPlus,
    variant: 'success',
  },
  update: {
    label: 'Update',
    icon: Edit,
    variant: 'info',
  },
  delete: {
    label: 'Delete',
    icon: Trash2,
    variant: 'danger',
  },
  approve: {
    label: 'Approve',
    icon: CheckCircle,
    variant: 'success',
  },
  reject: {
    label: 'Reject',
    icon: XCircle,
    variant: 'warning',
  },
  void: {
    label: 'Void',
    icon: AlertCircle,
    variant: 'danger',
  },
  all: {
    label: 'All Actions',
    icon: Shield,
    variant: 'default',
  },
};

export function AuditLogs() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<AuditModule>('all');
  const [selectedActionType, setSelectedActionType] = useState<AuditActionType>('all');
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredLogs = mockAuditLogs.filter((log) => {
    const moduleMatch = selectedModule === 'all' || log.module === selectedModule;
    const actionMatch =
      selectedActionType === 'all' || log.actionType === selectedActionType;
    const staffMatch = selectedStaff === 'all' || log.actor === selectedStaff;

    const logDate = new Date(log.timestamp);
    const dateMatch =
      (!startDate || logDate >= new Date(startDate)) &&
      (!endDate || logDate <= new Date(endDate));

    return moduleMatch && actionMatch && staffMatch && dateMatch;
  });

  const clearFilters = () => {
    setSelectedModule('all');
    setSelectedActionType('all');
    setSelectedStaff('all');
    setStartDate('');
    setEndDate('');
  };

  const activeFiltersCount = [
    selectedModule !== 'all',
    selectedActionType !== 'all',
    selectedStaff !== 'all',
    startDate !== '',
    endDate !== '',
  ].filter(Boolean).length;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const uniqueStaff = Array.from(
    new Set(mockAuditLogs.map((log) => log.actor))
  ).sort();

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Audit Logs"
        showBack
        onBackClick={() => navigate('/settings')}
        rightAction={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="p-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
            >
              <Download className="w-5 h-5 text-aba-neutral-900" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 -mr-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors relative"
            >
              <Filter className="w-5 h-5 text-aba-neutral-900" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-aba-primary-main text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        }
      />

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-aba-neutral-200 p-4 space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-aba-neutral-900 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-aba-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-aba-secondary-main"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-aba-neutral-900 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-aba-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-aba-secondary-main"
              />
            </div>
          </div>

          {/* Staff Filter */}
          <div>
            <label className="block text-xs font-medium text-aba-neutral-900 mb-1">
              Staff Member
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-aba-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-aba-secondary-main"
            >
              <option value="all">All Staff</option>
              {uniqueStaff.map((staff) => (
                <option key={staff} value={staff}>
                  {staff}
                </option>
              ))}
            </select>
          </div>

          {/* Module Filter */}
          <div>
            <label className="block text-xs font-medium text-aba-neutral-900 mb-1">
              Module
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value as AuditModule)}
              className="w-full px-3 py-2 rounded-lg border border-aba-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-aba-secondary-main"
            >
              {Object.entries(moduleConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Type Filter */}
          <div>
            <label className="block text-xs font-medium text-aba-neutral-900 mb-1">
              Action Type
            </label>
            <select
              value={selectedActionType}
              onChange={(e) =>
                setSelectedActionType(e.target.value as AuditActionType)
              }
              className="w-full px-3 py-2 rounded-lg border border-aba-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-aba-secondary-main"
            >
              {Object.entries(actionTypeConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <ABAButton variant="outline" size="sm" fullWidth onClick={clearFilters}>
              <X className="w-4 h-4" />
              Clear Filters
            </ABAButton>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Info Box */}
          <div className="bg-aba-secondary-50 border border-aba-secondary-200 rounded-xl p-4 flex items-start gap-2">
            <Shield className="w-4 h-4 text-aba-secondary-main mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-aba-neutral-900 mb-1">
                Compliance Tracking
              </p>
              <p className="text-xs text-aba-neutral-700">
                All administrative actions are logged for security and compliance
                purposes. Logs are retained for 12 months.
              </p>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-aba-neutral-600">
            {filteredLogs.length} {filteredLogs.length === 1 ? 'log' : 'logs'}{' '}
            found
          </p>

          {/* Audit Logs List */}
          {filteredLogs.length > 0 ? (
            <ListCard>
              {filteredLogs.map((log) => {
                const ModuleIcon = moduleConfig[log.module].icon;
                return (
                  <ListCardItem
                    key={log.id}
                    onClick={() => navigate(`/audit-log-detail/${log.id}`)}
                  >
                    <div
                      className={`w-10 h-10 rounded-full bg-aba-neutral-100 flex items-center justify-center flex-shrink-0`}
                    >
                      <ModuleIcon
                        className={`w-5 h-5 ${moduleConfig[log.module].color}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-aba-neutral-900 truncate">
                          {log.actor}
                        </p>
                        <ABABadge
                          variant={actionTypeConfig[log.actionType].variant}
                          size="sm"
                        >
                          {actionTypeConfig[log.actionType].label}
                        </ABABadge>
                      </div>
                      <p className="text-aba-neutral-900 mb-0.5 truncate text-[12px] text-[#8f9aa1]">
                        {log.action}
                      </p>
                      <p className="text-xs text-aba-neutral-600">
                        {moduleConfig[log.module].label} •{' '}
                        {formatTimestamp(log.timestamp)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-aba-neutral-400 flex-shrink-0" />
                  </ListCardItem>
                );
              })}
            </ListCard>
          ) : (
            <div className="bg-white rounded-2xl border border-aba-neutral-200 p-8 text-center">
              <Shield className="w-16 h-16 text-aba-neutral-400 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-aba-neutral-900 mb-1">
                No Audit Logs Found
              </h3>
              <p className="text-sm text-aba-neutral-600">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          logsCount={filteredLogs.length}
        />
      )}
    </div>
  );
}

function ExportModal({
  onClose,
  logsCount,
}: {
  onClose: () => void;
  logsCount: number;
}) {
  const handleExport = (format: 'csv' | 'pdf') => {
    // Simulate export
    import('../components/aba/Toast').then(({ showToast }) => {
      showToast(`Exporting ${logsCount} logs as ${format.toUpperCase()}`, 'success');
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md mx-auto p-6 space-y-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-aba-neutral-900">
            Export Audit Logs
          </h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
          >
            <X className="w-5 h-5 text-aba-neutral-600" />
          </button>
        </div>

        <div className="bg-aba-neutral-50 border border-aba-neutral-200 rounded-xl p-4">
          <p className="text-sm text-aba-neutral-700">
            You are about to export <strong>{logsCount} audit logs</strong>. Select
            your preferred format below.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ABAButton
            variant="primary"
            size="md"
            onClick={() => handleExport('csv')}
          >
            <Download className="w-5 h-5" />
            Export CSV
          </ABAButton>
          <ABAButton
            variant="secondary"
            size="md"
            onClick={() => handleExport('pdf')}
          >
            <Download className="w-5 h-5" />
            Export PDF
          </ABAButton>
        </div>

        <ABAButton variant="outline" size="md" fullWidth onClick={onClose}>
          Cancel
        </ABAButton>
      </div>
    </div>
  );
}