/**
 * CL-05 Order Detail — View details for a lab order or prescription.
 */
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { useClinicianStore, updateLabStatus } from '../data/clinicianStore';
import {
  FlaskConical,
  Pill,
  User,
  Clock,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Send,
} from 'lucide-react';

export function CLOrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { getLabOrderById, getPrescriptionById } = useClinicianStore();

  const lab = getLabOrderById(orderId || '');
  const rx = getPrescriptionById(orderId || '');

  if (!lab && !rx) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Order Detail" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-aba-neutral-600">Order not found</p>
        </div>
      </div>
    );
  }

  // Lab order detail
  if (lab) {
    const statusStyles = {
      pending: { bg: 'bg-aba-warning-50', text: 'text-aba-warning-main', label: 'Pending Collection' },
      'in-progress': { bg: 'bg-aba-secondary-50', text: 'text-aba-secondary-main', label: 'In Progress' },
      completed: { bg: 'bg-aba-success-50', text: 'text-aba-success-main', label: 'Result Ready' },
    };
    const st = statusStyles[lab.status];

    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Lab Order" showBack onBackClick={() => navigate(-1)} />

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Header card */}
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFFBEB] flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-aba-neutral-900">{lab.testName}</h2>
                  <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${st.bg} ${st.text} mt-1`}>
                    {st.label}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-aba-neutral-200">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-aba-neutral-600" />
                  <span className="text-sm text-aba-neutral-900">{lab.patientName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-aba-neutral-600" />
                  <span className="text-sm text-aba-neutral-700">Ordered at {lab.orderedAt}</span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-aba-neutral-600" />
                  <span className="text-sm text-aba-neutral-700 capitalize">Urgency: {lab.urgency}</span>
                </div>
                {lab.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-aba-neutral-600 mt-0.5" />
                    <span className="text-sm text-aba-neutral-700">{lab.notes}</span>
                  </div>
                )}
                {lab.result && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-aba-success-main mt-0.5" />
                    <span className="text-sm text-aba-neutral-900 font-medium">{lab.result}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions (only if not completed) */}
            {lab.status !== 'completed' && (
              <div className="space-y-3">
                {lab.status === 'pending' && (
                  <ABAButton
                    variant="secondary"
                    fullWidth
                    onClick={() => {
                      updateLabStatus(lab.id, 'in-progress');
                      showToast('Lab order marked as in progress', 'success');
                    }}
                  >
                    Mark as In Progress
                  </ABAButton>
                )}
                <ABAButton
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    updateLabStatus(lab.id, 'completed', 'Results within normal limits.');
                    showToast('Lab results recorded', 'success');
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Record Results
                </ABAButton>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Prescription detail
  if (rx) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Prescription" showBack onBackClick={() => navigate(-1)} />

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#F5F3FF] flex items-center justify-center">
                  <Pill className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-aba-neutral-900">{rx.medication}</h2>
                  <p className="text-sm text-aba-neutral-600 mt-0.5">{rx.dosage}</p>
                </div>
              </div>

              {/* Rx status */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                    rx.rxStatus === 'dispensed'
                      ? 'bg-aba-success-50 text-aba-success-main'
                      : 'bg-[#F5F3FF] text-[#8B5CF6]'
                  }`}
                >
                  {rx.rxStatus === 'sent' ? (
                    <><Send className="w-3 h-3" /> Sent to Pharmacy</>
                  ) : (
                    <><CheckCircle2 className="w-3 h-3" /> Dispensed</>
                  )}
                </span>
              </div>

              <div className="space-y-3 pt-3 border-t border-aba-neutral-200">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-aba-neutral-600" />
                  <span className="text-sm text-aba-neutral-900">{rx.patientName}</span>
                </div>
                <DetailRow label="Frequency" value={rx.frequency} />
                <DetailRow label="Duration" value={rx.duration} />
                <DetailRow label="Created" value={rx.createdAt} />
                {rx.sentToPharmacyAt && <DetailRow label="Sent to Pharmacy" value={rx.sentToPharmacyAt} />}
                {rx.notes && <DetailRow label="Notes" value={rx.notes} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between">
      <span className="text-sm text-aba-neutral-600">{label}</span>
      <span className="text-sm font-medium text-aba-neutral-900 text-right max-w-[60%]">{value}</span>
    </div>
  );
}