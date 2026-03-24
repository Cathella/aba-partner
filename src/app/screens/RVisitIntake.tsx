/**
 * R-15 Visit Intake — Department, service, staff, notes, then Add to Queue.
 * Department: OPD / Lab / Pharmacy (card selectors)
 * Service dropdown (filtered by department)
 * Optional assign staff + notes
 * CTA: Add to Queue → R-16
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import {
  useWalkInStore,
  departmentServices,
  staffOptions,
  generateTicketNumber,
  setVisit,
  setTicket,
  type Department,
} from '../data/walkInStore';
import { addToClinicianQueue } from '../data/clinicianStore';
import {
  Stethoscope,
  FlaskConical,
  Pill,
  ChevronDown,
  User,
  ShieldCheck,
  FileText,
  ListPlus,
} from 'lucide-react';

const departments: { id: Department; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  {
    id: 'OPD',
    label: 'OPD',
    icon: <Stethoscope className="w-5 h-5" />,
    color: 'text-aba-primary-main',
    bg: 'bg-aba-primary-50',
  },
  {
    id: 'Lab',
    label: 'Lab',
    icon: <FlaskConical className="w-5 h-5" />,
    color: 'text-aba-warning-main',
    bg: 'bg-aba-warning-50',
  },
  {
    id: 'Pharmacy',
    label: 'Pharmacy',
    icon: <Pill className="w-5 h-5" />,
    color: 'text-[#EC4899]',
    bg: 'bg-[#FDF2F8]',
  },
];

export function RVisitIntake() {
  const navigate = useNavigate();
  const { state } = useWalkInStore();

  const [department, setDepartment] = useState<Department | ''>('');
  const [service, setService] = useState('');
  const [staff, setStaff] = useState('');
  const [notes, setNotes] = useState('');
  const [serviceOpen, setServiceOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const member = state.member;

  /* ── If no member selected, redirect back ── */
  if (!member) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Visit Intake" showBack onBackClick={() => navigate('/r/walk-in')} />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-sm text-aba-neutral-600 mb-4">No patient selected. Please go back and select or register a patient.</p>
          </div>
        </div>
        <div className="flex-shrink-0 border-t border-aba-neutral-200 bg-aba-neutral-0 px-4 py-3">
          <ABAButton variant="primary" size="md" fullWidth onClick={() => navigate('/r/walk-in')}>
            Back to Walk-in
          </ABAButton>
        </div>
      </div>
    );
  }

  const serviceOptions = department ? departmentServices[department] : [];
  const canSubmit = department && service;

  const staffLabel = staff
    ? staffOptions.find((s) => s.id === staff)?.label ?? ''
    : 'Auto-assign';

  const handleAddToQueue = () => {
    if (!department || !service) return;
    setSubmitting(true);

    setTimeout(() => {
      setVisit({
        department,
        service,
        staff: staffLabel,
        notes: notes.trim(),
      });

      const ticketNum = generateTicketNumber(department);
      const waitMins = Math.floor(Math.random() * 20) + 5;

      setTicket({
        ticketNumber: ticketNum,
        department,
        memberName: member.name,
        service,
        estimatedWait: `~${waitMins} min`,
        time: new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' }),
      });

      addToClinicianQueue({
        patientName: member.name,
        phone: member.phone,
        age: member.age,
        gender: member.gender,
        isMember: member.isMember,
        service,
        ticket: ticketNum,
        notes: notes.trim() || undefined,
        staff: staff || undefined,
      });

      setSubmitting(false);
      showToast(`${member.name} added to ${department} queue`, 'success');
      navigate('/r/walk-in/queued');
    }, 700);
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Visit Intake" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-5">

          {/* ── Patient summary chip ── */}
          <div className="flex items-center gap-3 bg-aba-neutral-0 rounded-xl border border-aba-neutral-200 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-aba-secondary-main" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-aba-neutral-900 truncate">{member.name}</p>
              <p className="text-xs text-aba-neutral-600">{member.phone}</p>
            </div>
            {member.isMember && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-aba-secondary-main bg-aba-secondary-50 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Member
              </span>
            )}
            {!member.isMember && (
              <span className="inline-flex items-center text-[10px] font-semibold text-aba-warning-main bg-aba-warning-50 px-2 py-0.5 rounded-full">
                Non-member
              </span>
            )}
          </div>

          {/* ── Department selector ── */}
          <div>
            <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
              Department <span className="text-aba-error-main">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {departments.map((d) => {
                const isActive = department === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => { setDepartment(d.id); setService(''); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      isActive
                        ? 'border-aba-primary-main bg-aba-primary-50'
                        : 'border-aba-neutral-200 bg-aba-neutral-0 hover:bg-aba-neutral-100'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full ${isActive ? 'bg-aba-primary-main/10' : d.bg} flex items-center justify-center`}>
                      <span className={isActive ? 'text-aba-primary-main' : d.color}>{d.icon}</span>
                    </div>
                    <span className={`text-xs font-medium ${isActive ? 'text-aba-primary-main' : 'text-aba-neutral-900'}`}>
                      {d.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Service dropdown ── */}
          {department && (
            <div>
              <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                Service <span className="text-aba-error-main">*</span>
              </label>
              <div className="relative">
                <button
                  onClick={() => setServiceOpen(!serviceOpen)}
                  className="w-full flex items-center justify-between h-12 px-4 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-sm hover:border-aba-neutral-600 transition-colors"
                >
                  <span className={service ? 'text-aba-neutral-900' : 'text-aba-neutral-600'}>
                    {service || 'Select a service'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-aba-neutral-600 transition-transform ${serviceOpen ? 'rotate-180' : ''}`} />
                </button>

                {serviceOpen && (
                  <div className="absolute z-10 top-[calc(100%+4px)] left-0 right-0 bg-aba-neutral-0 border border-aba-neutral-200 rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                    {serviceOptions.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setService(s); setServiceOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-aba-neutral-100 transition-colors border-b border-aba-neutral-200 last:border-b-0 ${
                          service === s
                            ? 'font-semibold text-aba-primary-main bg-aba-primary-50/50'
                            : 'text-aba-neutral-900'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Optional: Assign staff ── */}
          {department && (
            <div>
              <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                Assign Staff <span className="text-aba-neutral-400">(optional)</span>
              </label>
              <div className="relative">
                <button
                  onClick={() => setStaffOpen(!staffOpen)}
                  className="w-full flex items-center justify-between h-12 px-4 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-sm hover:border-aba-neutral-600 transition-colors"
                >
                  <span className={staff ? 'text-aba-neutral-900' : 'text-aba-neutral-600'}>
                    {staffLabel}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-aba-neutral-600 transition-transform ${staffOpen ? 'rotate-180' : ''}`} />
                </button>

                {staffOpen && (
                  <div className="absolute z-10 top-[calc(100%+4px)] left-0 right-0 bg-aba-neutral-0 border border-aba-neutral-200 rounded-lg shadow-lg overflow-hidden">
                    {staffOptions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setStaff(s.id); setStaffOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-aba-neutral-100 transition-colors border-b border-aba-neutral-200 last:border-b-0 ${
                          staff === s.id
                            ? 'font-semibold text-aba-primary-main bg-aba-primary-50/50'
                            : 'text-aba-neutral-900'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Notes ── */}
          {department && (
            <div>
              <label className="block text-sm font-medium text-aba-neutral-900 mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-aba-neutral-600" />
                  Notes
                </span>
                <span className="text-aba-neutral-400 ml-1">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Patient reports headache since morning, referred by Dr. Okot…"
                rows={3}
                className="w-full px-4 py-3 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-sm text-aba-neutral-900 placeholder:text-aba-neutral-600 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main/30 focus:border-aba-secondary-main transition-all resize-none"
              />
            </div>
          )}

        </div>
      </div>

      {/* ── Fixed bottom CTA ── */}
      <div className="flex-shrink-0 border-t border-aba-neutral-200 bg-aba-neutral-0 px-4 py-3 flex flex-col gap-2">
        <ABAButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canSubmit}
          isLoading={submitting}
          onClick={handleAddToQueue}
        >
          <ListPlus className="w-5 h-5" />
          Add to Queue
        </ABAButton>
        <button
          onClick={() => navigate(-1)}
          className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline"
        >
          Go back
        </button>
      </div>
    </div>
  );
}