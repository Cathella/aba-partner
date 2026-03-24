import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ListCard } from '../components/aba/Cards';
import { RListRow } from '../components/aba/RListRow';
import { StatusChip, type VisitStatus } from '../components/aba/StatusChip';
import { ABAButton } from '../components/aba/ABAButton';
import { ABABadge } from '../components/aba/ABABadge';
import { showToast } from '../components/aba/Toast';
import {
  User,
  Phone,
  Calendar,
  Clock,
  FileText,
  CreditCard,
  UserCheck,
  MapPin,
} from 'lucide-react';

/* ── mock patient ── */
const patientData = {
  name: 'Jane Nakamya',
  initials: 'JN',
  phone: '+256 701 234 567',
  dob: '12 Mar 2018',
  age: '7 years',
  parent: 'Mary Nakamya',
  parentPhone: '+256 700 111 222',
  address: 'Mukono, Kampala Road',
  currentStatus: 'waiting' as VisitStatus,
  queuePosition: 2,
};

interface VisitRecord {
  id: string;
  date: string;
  service: string;
  provider: string;
  status: VisitStatus;
  amount: string;
}

const visitHistory: VisitRecord[] = [
  { id: 'v1', date: 'Today, 10:30 AM', service: 'Speech Therapy', provider: 'Dr. Ssekandi', status: 'waiting', amount: 'UGX 80,000' },
  { id: 'v2', date: '10 Feb 2026', service: 'Speech Therapy', provider: 'Dr. Ssekandi', status: 'completed', amount: 'UGX 80,000' },
  { id: 'v3', date: '27 Jan 2026', service: 'Assessment', provider: 'Ms. Apio', status: 'completed', amount: 'UGX 120,000' },
  { id: 'v4', date: '13 Jan 2026', service: 'OT Session', provider: 'Dr. Ssekandi', status: 'completed', amount: 'UGX 60,000' },
  { id: 'v5', date: '6 Jan 2026', service: 'Speech Therapy', provider: 'Dr. Ssekandi', status: 'no-show', amount: 'UGX 0' },
];

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-aba-neutral-200 last:border-b-0">
      <div className="mt-0.5 text-aba-neutral-600">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-aba-neutral-600">{label}</p>
        <p className="text-sm font-medium text-aba-neutral-900">{value}</p>
      </div>
    </div>
  );
}

export function RPatientInfo() {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const [status, setStatus] = useState(patientData.currentStatus);

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar
        title="Patient Info"
        showBack
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Patient header */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-aba-primary-50 flex items-center justify-center">
                <span className="text-lg font-bold text-aba-primary-main">{patientData.initials}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-aba-neutral-900">{patientData.name}</h2>
                <p className="text-xs text-aba-neutral-600">{patientData.age} \u2022 DOB: {patientData.dob}</p>
              </div>
              <StatusChip status={status} size="md" />
            </div>

            {status === 'waiting' && (
              <div className="bg-aba-warning-50 rounded-xl p-3 flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-aba-warning-main flex-shrink-0" />
                <p className="text-xs font-medium text-aba-neutral-900">Queue position: #{patientData.queuePosition}</p>
              </div>
            )}

            <div className="space-y-0">
              <DetailRow icon={<Phone className="w-4 h-4" />} label="Phone" value={patientData.phone} />
              <DetailRow icon={<User className="w-4 h-4" />} label="Parent / Guardian" value={`${patientData.parent} (${patientData.parentPhone})`} />
              <DetailRow icon={<MapPin className="w-4 h-4" />} label="Address" value={patientData.address} />
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-3">
            {['waiting', 'arrived', 'checked-in'].includes(status) && (
              <ABAButton
                variant="primary"
                size="md"
                fullWidth
                onClick={() => {
                  if (status === 'waiting') setStatus('in-consultation');
                  else setStatus('checked-in');
                  showToast(`Status updated for ${patientData.name}`, 'success');
                }}
              >
                <UserCheck className="w-5 h-5" />
                {status === 'waiting' ? 'Call In' : 'Check In'}
              </ABAButton>
            )}
            <ABAButton variant="secondary" size="md" fullWidth onClick={() => navigate(`/r/collect-payment/pt-${patientId}`)}>
              <CreditCard className="w-5 h-5" />
              Collect Pay
            </ABAButton>
          </div>

          {/* Visit history */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-aba-neutral-900">Visit History</h3>
              <ABABadge variant="neutral" size="sm">{visitHistory.length} visits</ABABadge>
            </div>
            <ListCard>
              {visitHistory.map((v) => (
                <RListRow
                  key={v.id}
                  icon={<Calendar className="w-5 h-5 text-aba-secondary-main" />}
                  title={v.service}
                  subtitle={`${v.date} \u2022 ${v.provider}`}
                  trailing={
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium text-aba-neutral-700">{v.amount}</span>
                      <StatusChip status={v.status} size="sm" />
                    </div>
                  }
                  onClick={() => {}}
                />
              ))}
            </ListCard>
          </div>
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
}
