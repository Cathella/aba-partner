/**
 * CL-05 Consultation Workspace — SOAP tabs with rich per-tab content,
 * compact patient header, "In Consultation" status indicator,
 * sticky bottom: Save Draft (secondary) + Complete Visit (primary).
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { CLStatusChip } from '../components/aba/CLStatusChip';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import {
  useClinicianStore,
  updateSOAP,
  updateVisitField,
  saveDraft,
  removeDiagnosis,
} from '../data/clinicianStore';
import type { SOAPNote } from '../data/clinicianStore';
import {
  Thermometer,
  HeartPulse,
  Activity,
  Weight,
  Wind,
  ChevronRight,
  FlaskConical,
  Pill,
  ArrowRightLeft,
  Calendar,
  Plus,
  X,
  Save,
  CheckCircle2,
  Stethoscope,
  AlertTriangle,
  Send,
  Timer,
  User,
} from 'lucide-react';

type SOAPTab = keyof SOAPNote;

const tabLabels: { key: SOAPTab; label: string; short: string }[] = [
  { key: 'subjective', label: 'Subjective', short: 'S' },
  { key: 'objective', label: 'Objective', short: 'O' },
  { key: 'assessment', label: 'Assessment', short: 'A' },
  { key: 'plan', label: 'Plan', short: 'P' },
];

export function CLConsult() {
  const navigate = useNavigate();
  const { visitId } = useParams<{ visitId: string }>();
  const { getVisitById, getVisitOrders } = useClinicianStore();

  const visit = getVisitById(visitId || '');
  const [activeTab, setActiveTab] = useState<SOAPTab>('subjective');

  if (!visit) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Consultation" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-aba-neutral-600">Visit not found</p>
        </div>
      </div>
    );
  }

  const orders = getVisitOrders(visit.id);
  const isCompleted = visit.status === 'completed';
  const readOnly = isCompleted;

  const handleSaveDraft = () => {
    saveDraft(visit.id);
    showToast('Draft saved', 'success');
  };

  const handleCompleteVisit = () => {
    navigate(`/cl/review/${visit.id}`);
  };

  /* ── Tab content helpers ── */

  const hasTabContent = (tab: SOAPTab): boolean => {
    switch (tab) {
      case 'subjective':
        return !!(visit.chiefComplaint || visit.soap.subjective || visit.allergies || visit.historyNotes);
      case 'objective':
        return !!(visit.vitals || visit.soap.objective);
      case 'assessment':
        return !!(visit.diagnoses.length > 0 || visit.soap.assessment);
      case 'plan':
        return !!(visit.soap.plan || visit.followUpNote || orders.labs.length > 0 || orders.prescriptions.length > 0);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      {/* ── Top Bar ── */}
      <AppTopBar
        title="Consultation"
        showBack
        onBackClick={() => navigate(`/cl/visit/${visit.id}`)}
        rightAction={
          <CLStatusChip status={visit.status} size="sm" />
        }
      />

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Compact Patient Header */}
        <div className="bg-aba-neutral-0 border-b border-aba-neutral-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-aba-secondary-main">
                {visit.patientName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-aba-neutral-900 truncate">
                {visit.patientName}
              </p>
              <p className="text-xs text-aba-neutral-600">
                {visit.age} yrs &middot; {visit.gender} &middot; {visit.ticket}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!isCompleted && <SessionTimer />}
              {visit.draftSavedAt && (
                <span className="text-[10px] font-medium text-aba-success-main bg-aba-success-50 px-2 py-0.5 rounded-full">
                  Saved {visit.draftSavedAt}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SOAP Tab Bar */}
        <div className="bg-aba-neutral-0 border-b border-aba-neutral-200">
          <div className="flex">
            {tabLabels.map((tab) => {
              const isActive = activeTab === tab.key;
              const filled = hasTabContent(tab.key);
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3.5 text-center text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'text-aba-primary-main'
                      : filled
                      ? 'text-aba-neutral-900'
                      : 'text-aba-neutral-500'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.short}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-aba-primary-main rounded-full" />
                  )}
                  {filled && !isActive && (
                    <span className="absolute top-2.5 right-3 w-1.5 h-1.5 rounded-full bg-aba-primary-main" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="p-4 space-y-4">
          {/* ====== SUBJECTIVE ====== */}
          {activeTab === 'subjective' && (
            <>
              {/* Chief Complaint */}
              <FieldCard label="Chief Complaint">
                {readOnly ? (
                  <ReadOnlyText value={visit.chiefComplaint} />
                ) : (
                  <textarea
                    value={visit.chiefComplaint || ''}
                    onChange={(e) => updateVisitField(visit.id, 'chiefComplaint', e.target.value)}
                    placeholder="Primary reason for visit…"
                    rows={2}
                    className={inputClass}
                  />
                )}
              </FieldCard>

              {/* History */}
              <FieldCard label="History / HPI">
                {readOnly ? (
                  <ReadOnlyText value={visit.historyNotes || visit.soap.subjective} />
                ) : (
                  <textarea
                    value={visit.historyNotes || visit.soap.subjective}
                    onChange={(e) => {
                      updateVisitField(visit.id, 'historyNotes', e.target.value);
                      updateSOAP(visit.id, 'subjective', e.target.value);
                    }}
                    placeholder="Relevant history, onset, duration, severity…"
                    rows={3}
                    className={inputClass}
                  />
                )}
              </FieldCard>

              {/* Allergies */}
              <FieldCard
                label="Allergies"
                icon={<AlertTriangle className="w-3.5 h-3.5 text-aba-warning-main" />}
              >
                {readOnly ? (
                  <ReadOnlyText value={visit.allergies} placeholder="None documented" />
                ) : (
                  <input
                    type="text"
                    value={visit.allergies || ''}
                    onChange={(e) => updateVisitField(visit.id, 'allergies', e.target.value)}
                    placeholder="Known allergies (e.g. Penicillin, Peanuts)…"
                    className={inputSmClass}
                  />
                )}
              </FieldCard>
            </>
          )}

          {/* ====== OBJECTIVE ====== */}
          {activeTab === 'objective' && (
            <>
              {/* Vitals & Triage Card */}
              <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-aba-neutral-200">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-[#E44F4F]" />
                    <h4 className="text-sm font-semibold text-aba-neutral-900">Vitals & Triage</h4>
                  </div>
                  {visit.vitals?.recordedAt && (
                    <span className="text-[10px] text-aba-neutral-500">
                      {visit.vitals.recordedAt}
                    </span>
                  )}
                </div>
                {visit.vitals ? (
                  <>
                    <div className="grid grid-cols-3 gap-px bg-aba-neutral-200">
                      <VitalCell icon={<Thermometer className="w-3.5 h-3.5" />} label="Temp" value={`${visit.vitals.temperature || '—'}°C`} />
                      <VitalCell icon={<HeartPulse className="w-3.5 h-3.5" />} label="BP" value={visit.vitals.bloodPressure || '—'} />
                      <VitalCell icon={<Activity className="w-3.5 h-3.5" />} label="Pulse" value={`${visit.vitals.pulse || '—'} bpm`} />
                      <VitalCell icon={<Wind className="w-3.5 h-3.5" />} label="SpO2" value={`${visit.vitals.spo2 || '—'}%`} />
                      <VitalCell icon={<Weight className="w-3.5 h-3.5" />} label="Weight" value={`${visit.vitals.weight || '—'} kg`} />
                      <div className="bg-aba-neutral-0" />
                    </div>

                    {/* Nurse attribution */}
                    <div className="px-4 py-2 bg-[#F7F9FC] flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#E9F8F0] flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 text-[#38C172]" />
                      </div>
                      <span className="text-xs text-aba-neutral-600">
                        Captured by <span className="font-semibold text-aba-neutral-900">{visit.vitals.capturedBy || 'Nurse'}</span>
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-aba-neutral-100 flex items-center justify-center mx-auto mb-2.5">
                      <HeartPulse className="w-5 h-5 text-aba-neutral-400" />
                    </div>
                    <p className="text-sm font-medium text-aba-neutral-700">No vitals recorded yet</p>
                    <p className="text-xs text-aba-neutral-500 mt-1">
                      Nurse will capture vitals during triage.
                    </p>
                  </div>
                )}
                {!readOnly && (
                  <button
                    onClick={() => navigate(`/cl/vitals/${visit.id}`)}
                    className="w-full flex items-center justify-center gap-2 py-3 border-t border-aba-neutral-200 text-sm font-medium text-aba-secondary-main hover:bg-aba-secondary-50/50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {visit.vitals ? 'Update Vitals' : 'Add Vitals'}
                  </button>
                )}
              </div>

              {/* Observations */}
              <FieldCard label="Observations / Exam Findings">
                {readOnly ? (
                  <ReadOnlyText value={visit.soap.objective} />
                ) : (
                  <textarea
                    value={visit.soap.objective}
                    onChange={(e) => updateSOAP(visit.id, 'objective', e.target.value)}
                    placeholder="Clinical observations, physical exam findings, screening scores…"
                    rows={4}
                    className={inputClass}
                  />
                )}
              </FieldCard>
            </>
          )}

          {/* ====== ASSESSMENT ====== */}
          {activeTab === 'assessment' && (
            <>
              {/* Diagnosis chips */}
              <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-aba-neutral-900">Diagnoses</h4>
                  <span className="text-xs text-aba-neutral-500">{visit.diagnoses.length} added</span>
                </div>

                {visit.diagnoses.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {visit.diagnoses.map((d) => (
                      <span
                        key={d.code}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-aba-secondary-50 text-sm text-aba-neutral-900 border border-aba-secondary-main/15"
                      >
                        <span className="text-[10px] font-bold text-aba-secondary-main">{d.code}</span>
                        {d.name}
                        {!readOnly && (
                          <button
                            onClick={() => removeDiagnosis(visit.id, d.code)}
                            className="ml-0.5 p-0.5 rounded-full hover:bg-aba-neutral-200 transition-colors"
                          >
                            <X className="w-3 h-3 text-aba-neutral-600" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-aba-neutral-500 mb-3">No diagnoses added yet.</p>
                )}

                {!readOnly && (
                  <ABAButton
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => navigate(`/cl/diagnosis/${visit.id}`)}
                  >
                    <Plus className="w-4 h-4" />
                    Add Diagnosis
                  </ABAButton>
                )}
              </div>

              {/* Assessment notes */}
              <FieldCard label="Clinical Impression / Notes">
                {readOnly ? (
                  <ReadOnlyText value={visit.soap.assessment} />
                ) : (
                  <textarea
                    value={visit.soap.assessment}
                    onChange={(e) => updateSOAP(visit.id, 'assessment', e.target.value)}
                    placeholder="Clinical impression, differential diagnosis, reasoning…"
                    rows={3}
                    className={inputClass}
                  />
                )}
              </FieldCard>
            </>
          )}

          {/* ====== PLAN ====== */}
          {activeTab === 'plan' && (
            <>
              {/* Action buttons */}
              {!readOnly && (
                <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
                  <PlanAction
                    icon={<FlaskConical className="w-4 h-4 text-[#F59E0B]" />}
                    iconBg="bg-[#FFFBEB]"
                    label="Order Lab"
                    count={orders.labs.length}
                    onClick={() => navigate(`/cl/orders/new-lab/${visit.id}`)}
                  />
                  <PlanAction
                    icon={<Pill className="w-4 h-4 text-[#8B5CF6]" />}
                    iconBg="bg-[#F5F3FF]"
                    label="Prescription"
                    count={orders.prescriptions.length}
                    badge={orders.prescriptions.some((rx) => rx.rxStatus === 'sent') ? 'sent' : undefined}
                    onClick={() => navigate(`/cl/orders/prescription/${visit.id}`)}
                  />
                  <PlanAction
                    icon={<ArrowRightLeft className="w-4 h-4 text-aba-secondary-main" />}
                    iconBg="bg-aba-secondary-50"
                    label="Transfer / Referral"
                    onClick={() => navigate(`/cl/transfer/${visit.id}`)}
                  />
                </div>
              )}

              {/* Existing orders summary */}
              {(orders.labs.length > 0 || orders.prescriptions.length > 0) && (
                <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-aba-neutral-200">
                    <h4 className="text-sm font-semibold text-aba-neutral-900">Active Orders</h4>
                  </div>
                  {orders.labs.map((lab) => {
                    const labLabel =
                      lab.status === 'completed'
                        ? 'Result Ready'
                        : lab.status === 'in-progress'
                        ? 'In Progress'
                        : 'Pending';
                    const labColor =
                      lab.status === 'completed'
                        ? 'text-aba-success-main bg-aba-success-50'
                        : lab.status === 'in-progress'
                        ? 'text-aba-secondary-main bg-aba-secondary-50'
                        : 'text-aba-warning-main bg-aba-warning-50';
                    return (
                      <button
                        key={lab.id}
                        onClick={() =>
                          lab.status === 'completed'
                            ? navigate(`/cl/lab-result/${lab.id}`)
                            : navigate(`/cl/orders/${lab.id}`)
                        }
                        className="w-full flex items-center gap-3 px-4 py-3 border-b border-aba-neutral-200 last:border-b-0 hover:bg-aba-neutral-100 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] flex items-center justify-center flex-shrink-0">
                          <FlaskConical className="w-3.5 h-3.5 text-[#F59E0B]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-aba-neutral-900 truncate">{lab.testName}</p>
                          <p className="text-xs text-aba-neutral-600 capitalize">{lab.urgency}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${labColor} flex-shrink-0`}>
                          {labLabel}
                        </span>
                        <ChevronRight className="w-4 h-4 text-aba-neutral-400 flex-shrink-0" />
                      </button>
                    );
                  })}
                  {orders.prescriptions.map((rx) => (
                    <button
                      key={rx.id}
                      onClick={() => navigate(`/cl/orders/${rx.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-aba-neutral-200 last:border-b-0 hover:bg-aba-neutral-100 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] flex items-center justify-center flex-shrink-0">
                        <Pill className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-aba-neutral-900 truncate">{rx.medication} — {rx.dosage}</p>
                        <p className="text-xs text-aba-neutral-600">{rx.frequency} &middot; {rx.duration}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          rx.rxStatus === 'dispensed'
                            ? 'text-aba-success-main bg-aba-success-50'
                            : 'text-[#8B5CF6] bg-[#F5F3FF]'
                        }`}
                      >
                        {rx.rxStatus === 'sent' && <Send className="w-2.5 h-2.5" />}
                        {rx.rxStatus === 'sent' ? 'Sent' : 'Dispensed'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-aba-neutral-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Follow-up note */}
              <FieldCard
                label="Follow-up Note"
                icon={<Calendar className="w-3.5 h-3.5 text-aba-neutral-600" />}
              >
                {readOnly ? (
                  <ReadOnlyText value={visit.followUpNote || visit.soap.plan} />
                ) : (
                  <textarea
                    value={visit.followUpNote || visit.soap.plan}
                    onChange={(e) => {
                      updateVisitField(visit.id, 'followUpNote', e.target.value);
                      updateSOAP(visit.id, 'plan', e.target.value);
                    }}
                    placeholder="Follow-up instructions, timeline, patient education…"
                    rows={3}
                    className={inputClass}
                  />
                )}
              </FieldCard>
            </>
          )}
        </div>
      </div>

      {/* ── Sticky Bottom Actions ── */}
      {!isCompleted && (
        <div className="fixed bottom-0 left-0 right-0 bg-aba-neutral-0 border-t border-aba-neutral-200 z-30">
          <div className="flex gap-3 max-w-[390px] mx-auto p-4">
            <ABAButton variant="outline" className="flex-1" onClick={handleSaveDraft}>
              <Save className="w-4 h-4" />
              Save Draft
            </ABAButton>
            <ABAButton variant="primary" className="flex-1" onClick={handleCompleteVisit}>
              <CheckCircle2 className="w-4 h-4" />
              Complete Visit
            </ABAButton>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Reusable sub-components ─── */

const inputClass =
  'w-full text-sm text-aba-neutral-900 placeholder:text-aba-neutral-500 bg-aba-neutral-100 rounded-lg border border-aba-neutral-200 p-3 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main/30 focus:border-aba-secondary-main transition-all resize-none';

const inputSmClass =
  'w-full h-10 text-sm text-aba-neutral-900 placeholder:text-aba-neutral-500 bg-aba-neutral-100 rounded-lg border border-aba-neutral-200 px-3 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main/30 focus:border-aba-secondary-main transition-all';

function FieldCard({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4">
      <div className="flex items-center gap-1.5 mb-2.5">
        {icon}
        <h4 className="text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide">{label}</h4>
      </div>
      {children}
    </div>
  );
}

function ReadOnlyText({ value, placeholder }: { value?: string; placeholder?: string }) {
  return (
    <p className="text-sm text-aba-neutral-900 whitespace-pre-wrap leading-relaxed">
      {value || <span className="text-aba-neutral-500 italic">{placeholder || 'Not documented'}</span>}
    </p>
  );
}

function VitalCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-aba-neutral-0 p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-aba-neutral-500 mb-1">
        {icon}
        <span className="text-[10px] font-medium uppercase">{label}</span>
      </div>
      <p className="text-sm font-semibold text-aba-neutral-900">{value}</p>
    </div>
  );
}

function PlanAction({
  icon,
  iconBg,
  label,
  count,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  count?: number;
  badge?: 'sent';
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-aba-neutral-200 last:border-b-0 hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors text-left"
    >
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium text-aba-neutral-900">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-xs font-semibold text-aba-neutral-600 bg-aba-neutral-100 px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
      {badge === 'sent' && (
        <span className="text-xs font-semibold text-aba-success-main bg-aba-success-50 px-2 py-0.5 rounded-full">
          Sent
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-aba-neutral-400 flex-shrink-0" />
    </button>
  );
}

function SessionTimer() {
  const [time, setTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-1">
      <Timer className="w-3.5 h-3.5 text-aba-neutral-500" />
      <span className="text-[10px] font-medium text-aba-neutral-500">{formatTime(time)}</span>
    </div>
  );
}