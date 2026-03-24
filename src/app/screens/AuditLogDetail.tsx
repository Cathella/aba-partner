import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABABadge } from '../components/aba/ABABadge';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import {
  ChevronLeft,
  User,
  Calendar,
  Clock,
  Monitor,
  MapPin,
  FileText,
  AlertCircle,
  Download,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  UserPlus,
  DollarSign,
  Settings,
} from 'lucide-react';

type AuditModule = 'staff' | 'services' | 'bookings' | 'finance' | 'settings';
type AuditActionType = 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'void';

interface AuditLog {
  id: string;
  actor: string;
  actorRole: string;
  actorEmail: string;
  action: string;
  actionType: AuditActionType;
  module: AuditModule;
  timestamp: string;
  ipAddress: string;
  device: string;
  location: string;
  details: string;
  beforeData?: Record<string, any>;
  afterData?: Record<string, any>;
  reason?: string;
  notes?: string;
}

const mockAuditLogs: Record<string, AuditLog> = {
  '1': {
    id: '1',
    actor: 'Dr. Sarah Chen',
    actorRole: 'Facility Admin',
    actorEmail: 'admin@mukono.clinic',
    action: 'Approved refund for transaction TXN-2026-001234',
    actionType: 'approve',
    module: 'finance',
    timestamp: '2026-02-11T14:30:00',
    ipAddress: '192.168.1.100',
    device: 'Chrome 120 on macOS',
    location: 'Kampala, Uganda',
    details: 'Refund amount: UGX 150,000',
    beforeData: {
      status: 'completed',
      amount: 'UGX 150,000',
    },
    afterData: {
      status: 'refunded',
      amount: 'UGX 0',
      refundAmount: 'UGX 150,000',
    },
    reason: 'Service not provided due to staff unavailability',
    notes: 'Patient requested refund. Approved after verification with therapist.',
  },
  '2': {
    id: '2',
    actor: 'Dr. Sarah Chen',
    actorRole: 'Facility Admin',
    actorEmail: 'admin@mukono.clinic',
    action: 'Updated service pricing for Speech Therapy',
    actionType: 'update',
    module: 'services',
    timestamp: '2026-02-11T11:15:00',
    ipAddress: '192.168.1.100',
    device: 'Chrome 120 on macOS',
    location: 'Kampala, Uganda',
    details: 'Price changed from UGX 100,000 to UGX 150,000',
    beforeData: {
      serviceName: 'Speech Therapy',
      price: 'UGX 100,000',
      duration: '60 min',
    },
    afterData: {
      serviceName: 'Speech Therapy',
      price: 'UGX 150,000',
      duration: '60 min',
    },
    reason: 'Market rate adjustment',
  },
  '4': {
    id: '4',
    actor: 'Dr. Sarah Chen',
    actorRole: 'Facility Admin',
    actorEmail: 'admin@mukono.clinic',
    action: 'Deleted staff member account',
    actionType: 'delete',
    module: 'staff',
    timestamp: '2026-02-10T16:20:00',
    ipAddress: '192.168.1.100',
    device: 'Chrome 120 on macOS',
    location: 'Kampala, Uganda',
    details: 'Staff: John Williams (Inactive)',
    beforeData: {
      name: 'John Williams',
      email: 'john.w@clinic.com',
      role: 'Therapist',
      status: 'Inactive',
    },
    afterData: null,
    reason: 'Employee resigned',
    notes: 'Account deleted after 30-day retention period.',
  },
  '5': {
    id: '5',
    actor: 'Dr. Sarah Chen',
    actorRole: 'Facility Admin',
    actorEmail: 'admin@mukono.clinic',
    action: 'Voided transaction TXN-2026-001220',
    actionType: 'void',
    module: 'finance',
    timestamp: '2026-02-10T14:10:00',
    ipAddress: '192.168.1.100',
    device: 'Chrome 120 on macOS',
    location: 'Kampala, Uganda',
    details: 'Reason: Duplicate transaction',
    beforeData: {
      transactionId: 'TXN-2026-001220',
      status: 'completed',
      amount: 'UGX 150,000',
    },
    afterData: {
      transactionId: 'TXN-2026-001220',
      status: 'voided',
      amount: 'UGX 0',
    },
    reason: 'Duplicate transaction detected',
    notes: 'Original transaction: TXN-2026-001219',
  },
};

const moduleConfig: Record<
  AuditModule,
  { label: string; icon: any; color: string }
> = {
  staff: { label: 'Staff', icon: User, color: 'text-aba-primary-main' },
  services: { label: 'Services', icon: FileText, color: 'text-aba-secondary-main' },
  bookings: { label: 'Bookings', icon: Calendar, color: 'text-aba-warning-main' },
  finance: { label: 'Finance', icon: DollarSign, color: 'text-aba-success-main' },
  settings: { label: 'Settings', icon: Settings, color: 'text-aba-neutral-600' },
};

const actionTypeConfig: Record<
  AuditActionType,
  { label: string; icon: any; variant: 'success' | 'info' | 'warning' | 'danger' }
> = {
  create: { label: 'Create', icon: UserPlus, variant: 'success' },
  update: { label: 'Update', icon: Edit, variant: 'info' },
  delete: { label: 'Delete', icon: Trash2, variant: 'danger' },
  approve: { label: 'Approve', icon: CheckCircle, variant: 'success' },
  reject: { label: 'Reject', icon: XCircle, variant: 'warning' },
  void: { label: 'Void', icon: AlertCircle, variant: 'danger' },
};

export function AuditLogDetail() {
  const navigate = useNavigate();
  const { logId } = useParams();

  const log = logId ? mockAuditLogs[logId] : null;

  if (!log) {
    return (
      <div className="flex flex-col h-screen bg-aba-bg-primary">
        <AppTopBar
          title="Audit Log Detail"
          showBack
          onBackClick={() => navigate('/audit-logs')}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-aba-neutral-600">Audit log not found</p>
        </div>
      </div>
    );
  }

  const ModuleIcon = moduleConfig[log.module].icon;
  const ActionIcon = actionTypeConfig[log.actionType].icon;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };
  };

  const { date, time } = formatTimestamp(log.timestamp);

  const handleExport = () => {
    showToast('Exporting audit log as PDF', 'success');
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Audit Log Details"
        showBack
        onBackClick={() => navigate('/audit-logs')}
        rightAction={
          <button
            onClick={handleExport}
            className="p-2 -mr-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
          >
            <Download className="w-5 h-5 text-aba-neutral-900" />
          </button>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-center gap-2">
            <ABABadge variant={actionTypeConfig[log.actionType].variant} size="lg">
              {actionTypeConfig[log.actionType].label}
            </ABABadge>
            <span className="text-aba-neutral-400">•</span>
            <span className="text-sm font-medium text-aba-neutral-600">
              {moduleConfig[log.module].label}
            </span>
          </div>

          {/* Action Summary */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-aba-neutral-100 flex items-center justify-center flex-shrink-0">
                <ModuleIcon className={`w-5 h-5 ${moduleConfig[log.module].color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-aba-neutral-900 mb-1">
                  Action Performed
                </h3>
                <p className="text-sm text-aba-neutral-900">{log.action}</p>
              </div>
            </div>
          </div>

          {/* Actor Information */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4 space-y-3">
            <h3 className="text-base font-semibold text-aba-neutral-900">
              Actor Information
            </h3>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-aba-neutral-600">Name</p>
                <p className="text-sm font-medium text-aba-neutral-900">{log.actor}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-aba-neutral-600">Role</p>
                <p className="text-sm font-medium text-aba-neutral-900">
                  {log.actorRole}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-aba-neutral-600">Email</p>
                <p className="text-sm font-medium text-aba-neutral-900">
                  {log.actorEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamp & Location */}
          <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4 space-y-3">
            <h3 className="text-base font-semibold text-aba-neutral-900">
              Timestamp & Location
            </h3>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-aba-neutral-600">Date</p>
                <p className="text-sm font-medium text-aba-neutral-900">{date}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-aba-neutral-600">Time</p>
                <p className="text-sm font-medium text-aba-neutral-900">{time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Monitor className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-aba-neutral-600">Device</p>
                <p className="text-sm font-medium text-aba-neutral-900">{log.device}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-aba-neutral-600">IP Address</p>
                <p className="text-sm font-medium text-aba-neutral-900">
                  {log.ipAddress}
                </p>
                <p className="text-xs text-aba-neutral-500 mt-0.5">{log.location}</p>
              </div>
            </div>
          </div>

          {/* Before/After Data */}
          {(log.beforeData || log.afterData) && (
            <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4">
              <h3 className="text-base font-semibold text-aba-neutral-900 mb-4">
                Data Changes
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {/* Before */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-2 h-2 rounded-full bg-aba-error-main"></div>
                    <p className="text-xs font-semibold text-aba-neutral-700">
                      Before
                    </p>
                  </div>
                  {log.beforeData ? (
                    <div className="bg-aba-error-50 border border-aba-error-200 rounded-lg p-3 space-y-2">
                      {Object.entries(log.beforeData).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs text-aba-neutral-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm font-medium text-aba-neutral-900">
                            {value?.toString() || '-'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-aba-neutral-50 border border-aba-neutral-200 rounded-lg p-3">
                      <p className="text-xs text-aba-neutral-500 italic">
                        No previous data
                      </p>
                    </div>
                  )}
                </div>

                {/* After */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-2 h-2 rounded-full bg-aba-success-main"></div>
                    <p className="text-xs font-semibold text-aba-neutral-700">After</p>
                  </div>
                  {log.afterData ? (
                    <div className="bg-aba-success-50 border border-aba-success-200 rounded-lg p-3 space-y-2">
                      {Object.entries(log.afterData).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs text-aba-neutral-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm font-medium text-aba-neutral-900">
                            {value?.toString() || '-'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-aba-neutral-50 border border-aba-neutral-200 rounded-lg p-3">
                      <p className="text-xs text-aba-neutral-500 italic">Data deleted</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reason & Notes */}
          {(log.reason || log.notes) && (
            <div className="bg-white rounded-2xl border border-aba-neutral-200 p-4 space-y-3">
              <h3 className="text-base font-semibold text-aba-neutral-900">
                Additional Information
              </h3>

              {log.reason && (
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-aba-neutral-600">Reason</p>
                    <p className="text-sm font-medium text-aba-neutral-900">
                      {log.reason}
                    </p>
                  </div>
                </div>
              )}

              {log.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-aba-neutral-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-aba-neutral-600">Notes</p>
                    <p className="text-sm text-aba-neutral-900">{log.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Compliance Notice */}
          <div className="bg-aba-secondary-50 border border-aba-secondary-200 rounded-xl p-4 flex items-start gap-2">
            <Shield className="w-4 h-4 text-aba-secondary-main mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-aba-neutral-700">
                <span className="font-medium">Compliance Notice:</span> This audit log
                is maintained for security and regulatory compliance. All data is
                encrypted and retained for 12 months as per clinic policy.
              </p>
            </div>
          </div>

          {/* Export Button */}
          <ABAButton variant="primary" size="md" fullWidth onClick={handleExport}>
            <Download className="w-5 h-5" />
            Export as PDF
          </ABAButton>
        </div>
      </div>
    </div>
  );
}