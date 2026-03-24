/**
 * CL-10 Create Lab Order — Multi-select test checkbox list,
 * priority (Routine/Urgent), notes to lab, Submit Order CTA.
 * On submit → CL-11 Order Submitted success screen.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { useClinicianStore, createLabOrder, sendToLab } from '../data/clinicianStore';
import { addLTOrderFromClinician } from '../data/labTechStore';
import { FlaskConical, Check, Search } from 'lucide-react';

/** Available lab tests catalogue */
const LAB_TESTS = [
  { id: 'cbc', name: 'Complete Blood Count (CBC)', category: 'Hematology' },
  { id: 'thyroid', name: 'Thyroid Panel (TSH, T3, T4)', category: 'Endocrine' },
  { id: 'bmp', name: 'Basic Metabolic Panel (BMP)', category: 'Chemistry' },
  { id: 'cmp', name: 'Comprehensive Metabolic Panel', category: 'Chemistry' },
  { id: 'ua', name: 'Urinalysis', category: 'Urinalysis' },
  { id: 'iron', name: 'Iron Studies (Ferritin, TIBC)', category: 'Hematology' },
  { id: 'lead', name: 'Blood Lead Level', category: 'Toxicology' },
  { id: 'eeg', name: 'EEG Referral', category: 'Neurology' },
  { id: 'audio', name: 'Hearing Audiometry', category: 'Audiology' },
  { id: 'genetic', name: 'Genetic Screening Panel', category: 'Genetics' },
  { id: 'vitd', name: 'Vitamin D (25-OH)', category: 'Chemistry' },
  { id: 'b12', name: 'Vitamin B12 & Folate', category: 'Chemistry' },
  { id: 'lipid', name: 'Lipid Panel', category: 'Chemistry' },
  { id: 'glucose', name: 'Fasting Blood Glucose', category: 'Chemistry' },
  { id: 'crp', name: 'C-Reactive Protein (CRP)', category: 'Immunology' },
];

export function CLNewLabOrder() {
  const navigate = useNavigate();
  const { visitId } = useParams<{ visitId: string }>();
  const { getVisitById } = useClinicianStore();

  const visit = getVisitById(visitId || '');

  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<'routine' | 'urgent'>('routine');
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [sendPatientToLab, setSendPatientToLab] = useState(false);

  if (!visit) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Order Lab Test" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-aba-neutral-600">Visit not found</p>
        </div>
      </div>
    );
  }

  const filteredTests = search.trim()
    ? LAB_TESTS.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase())
      )
    : LAB_TESTS;

  // Group tests by category
  const categories = [...new Set(filteredTests.map((t) => t.category))];

  const toggleTest = (id: string) => {
    setSelectedTests((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selectedTests.length === 0) {
      showToast('Please select at least one test', 'warning');
      return;
    }

    // Create an order for each selected test
    const selectedNames = selectedTests.map(
      (id) => LAB_TESTS.find((t) => t.id === id)?.name || id
    );

    selectedNames.forEach((testName) => {
      const clOrder = createLabOrder({
        visitId: visit.id,
        patientName: visit.patientName,
        testName,
        urgency,
        notes: notes.trim() || undefined,
      });

      // Bridge: auto-create a corresponding entry in the Lab Tech worklist
      addLTOrderFromClinician({
        clinicianOrderId: clOrder.id,
        visitId: visit.id,
        patientName: visit.patientName,
        patientAge: visit.age,
        patientGender: visit.gender,
        testName,
        urgency,
        orderedBy: visit.assignedTo === 'dr-nambi' ? 'Dr. Nambi' : 'Dr. Ssekandi',
        clinicalNotes: notes.trim() || undefined,
      });
    });

    if (sendPatientToLab) {
      sendToLab(visit.id);
    }

    // Navigate to success screen with order count
    navigate(`/cl/orders/submitted/${visit.id}?count=${selectedTests.length}`, { replace: true });
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Order Lab Tests" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-44">
        {/* Patient info strip */}
        <div className="bg-aba-neutral-0 border-b border-aba-neutral-200 px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-aba-secondary-main">
              {visit.patientName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-aba-neutral-900">{visit.patientName}</p>
            <p className="text-xs text-aba-neutral-600">{visit.service} &middot; {visit.ticket}</p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* ── Search ── */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aba-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tests…"
              className="w-full h-10 pl-9 pr-4 rounded-[6px] border border-aba-neutral-200 bg-aba-neutral-0 text-sm text-aba-neutral-900 placeholder:text-aba-neutral-500 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main/30 focus:border-aba-secondary-main transition-all"
            />
          </div>

          {/* ── Selected summary ── */}
          {selectedTests.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedTests.map((id) => {
                const test = LAB_TESTS.find((t) => t.id === id);
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-aba-primary-50 text-xs font-medium text-aba-neutral-900 border border-aba-primary-main/20"
                  >
                    {test?.name.split('(')[0].trim() || id}
                    <button
                      onClick={() => toggleTest(id)}
                      className="p-0.5 rounded-full hover:bg-aba-neutral-200"
                    >
                      <span className="text-[10px] text-aba-neutral-600">&times;</span>
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* ── Test List (Grouped by Category) ── */}
          {categories.map((category) => (
            <div key={category}>
              <p className="text-[10px] font-semibold text-aba-neutral-500 uppercase tracking-wide mb-2 px-1">
                {category}
              </p>
              <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
                {filteredTests
                  .filter((t) => t.category === category)
                  .map((test) => {
                    const isSelected = selectedTests.includes(test.id);
                    return (
                      <button
                        key={test.id}
                        onClick={() => toggleTest(test.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 border-b border-aba-neutral-200 last:border-b-0 text-left transition-colors ${
                          isSelected
                            ? 'bg-aba-primary-50/40'
                            : 'hover:bg-aba-neutral-100 active:bg-aba-neutral-200'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-aba-primary-main border-aba-primary-main'
                              : 'border-aba-neutral-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm text-aba-neutral-900 flex-1">{test.name}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}

          {/* ── Priority ── */}
          <div>
            <p className="text-sm font-medium text-aba-neutral-900 mb-2">Priority</p>
            <div className="flex gap-3">
              {(['routine', 'urgent'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUrgency(u)}
                  className={`flex-1 h-11 rounded-[6px] text-sm font-medium transition-colors capitalize ${
                    urgency === u
                      ? u === 'urgent'
                        ? 'bg-aba-warning-50 text-aba-warning-main border-2 border-aba-warning-main'
                        : 'bg-aba-primary-50 text-aba-primary-main border-2 border-aba-primary-main'
                      : 'bg-aba-neutral-0 text-aba-neutral-700 border border-aba-neutral-200'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* ── Notes to Lab ── */}
          <div>
            <p className="text-sm font-medium text-aba-neutral-900 mb-2">Notes to Lab</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions, clinical context, fasting requirements…"
              rows={3}
              className="w-full text-sm text-aba-neutral-900 placeholder:text-aba-neutral-500 bg-aba-neutral-0 rounded-lg border border-aba-neutral-200 p-3 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main/30 focus:border-aba-secondary-main transition-all resize-none"
            />
          </div>

          {/* ── Send to lab toggle ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-aba-neutral-900">Send patient to lab now</p>
              <p className="text-xs text-aba-neutral-500 mt-0.5">
                Status will change to &quot;Lab Pending&quot;
              </p>
            </div>
            <button
              onClick={() => setSendPatientToLab(!sendPatientToLab)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                sendPatientToLab ? 'bg-aba-primary-main' : 'bg-aba-neutral-400'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  sendPatientToLab ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Sticky Submit ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-aba-neutral-0 border-t border-aba-neutral-200 z-30">
        <div className="max-w-[390px] mx-auto p-4">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleSubmit}
            disabled={selectedTests.length === 0}
          >
            <FlaskConical className="w-5 h-5" />
            Submit Order{selectedTests.length > 0 ? ` (${selectedTests.length} test${selectedTests.length > 1 ? 's' : ''})` : ''}
          </ABAButton>
        </div>
      </div>
    </div>
  );
}