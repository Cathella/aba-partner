/**
 * CL-15 Create Prescription — Multi-medication prescribing.
 * Medication search (sample list), add rows: name, dosage, frequency, duration, notes.
 * CTA: Submit to Pharmacy → CL-16 Prescription Submitted.
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { useClinicianStore, createPrescription } from '../data/clinicianStore';
import {
  Pill,
  Search,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Send,
} from 'lucide-react';

/* ── Sample medication catalogue ── */
const MEDICATION_CATALOGUE = [
  { name: 'Omega-3 Supplement', category: 'Supplement', dosages: ['250mg', '500mg', '1000mg'] },
  { name: 'Melatonin', category: 'Sleep Aid', dosages: ['1mg', '3mg', '5mg'] },
  { name: 'Methylphenidate (Ritalin)', category: 'ADHD', dosages: ['5mg', '10mg', '20mg'] },
  { name: 'Atomoxetine (Strattera)', category: 'ADHD', dosages: ['10mg', '18mg', '25mg', '40mg'] },
  { name: 'Risperidone', category: 'Antipsychotic', dosages: ['0.25mg', '0.5mg', '1mg', '2mg'] },
  { name: 'Aripiprazole (Abilify)', category: 'Antipsychotic', dosages: ['2mg', '5mg', '10mg'] },
  { name: 'Fluoxetine (Prozac)', category: 'SSRI', dosages: ['10mg', '20mg'] },
  { name: 'Sertraline (Zoloft)', category: 'SSRI', dosages: ['25mg', '50mg', '100mg'] },
  { name: 'Guanfacine (Intuniv)', category: 'ADHD', dosages: ['1mg', '2mg', '3mg', '4mg'] },
  { name: 'Clonidine', category: 'Alpha-2 Agonist', dosages: ['0.1mg', '0.2mg'] },
  { name: 'Iron Supplement (Ferrous Sulfate)', category: 'Supplement', dosages: ['65mg', '200mg', '325mg'] },
  { name: 'Vitamin D3', category: 'Supplement', dosages: ['400IU', '1000IU', '2000IU'] },
  { name: 'Vitamin B12', category: 'Supplement', dosages: ['500mcg', '1000mcg'] },
  { name: 'Magnesium Glycinate', category: 'Supplement', dosages: ['100mg', '200mg', '400mg'] },
  { name: 'Zinc Sulfate', category: 'Supplement', dosages: ['10mg', '15mg', '22mg'] },
  { name: 'Paracetamol (Acetaminophen)', category: 'Analgesic', dosages: ['120mg/5ml', '250mg', '500mg'] },
  { name: 'Ibuprofen', category: 'NSAID', dosages: ['100mg/5ml', '200mg', '400mg'] },
  { name: 'Diphenhydramine (Benadryl)', category: 'Antihistamine', dosages: ['12.5mg/5ml', '25mg'] },
  { name: 'Cetirizine', category: 'Antihistamine', dosages: ['5mg', '10mg'] },
  { name: 'Probiotics (Lactobacillus)', category: 'Probiotic', dosages: ['1 billion CFU', '5 billion CFU'] },
];

const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every 8 hours',
  'Every 12 hours',
  'As needed (PRN)',
  'At bedtime',
  'Before meals',
];

const DURATION_OPTIONS = [
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '14 days',
  '1 month',
  '2 months',
  '3 months',
  'Ongoing',
];

/* ── Types ── */
interface MedRow {
  id: number;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
  expanded: boolean;
}

let _rowSeq = 1;

function emptyRow(): MedRow {
  return {
    id: _rowSeq++,
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: '',
    expanded: true,
  };
}

export function CLPrescription() {
  const navigate = useNavigate();
  const { visitId } = useParams<{ visitId: string }>();
  const { getVisitById } = useClinicianStore();

  const visit = getVisitById(visitId || '');

  const [rows, setRows] = useState<MedRow[]>([emptyRow()]);
  const [searchOpen, setSearchOpen] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSearchOpen(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!visit) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Prescribe" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-aba-neutral-600">Visit not found</p>
        </div>
      </div>
    );
  }

  const updateRow = (id: number, field: keyof MedRow, value: string | boolean) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const removeRow = (id: number) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id);
      return next.length === 0 ? [emptyRow()] : next;
    });
  };

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow()]);
  };

  const toggleExpand = (id: number) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, expanded: !r.expanded } : r)));
  };

  const selectMedication = (rowId: number, medName: string) => {
    updateRow(rowId, 'medication', medName);
    // Auto-set first dosage suggestion
    const med = MEDICATION_CATALOGUE.find((m) => m.name === medName);
    if (med && med.dosages.length > 0) {
      updateRow(rowId, 'dosage', med.dosages[0]);
    }
    setSearchOpen(null);
    setSearchTerm('');
  };

  const filteredMeds = searchTerm.trim()
    ? MEDICATION_CATALOGUE.filter(
        (m) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : MEDICATION_CATALOGUE;

  const filledRows = rows.filter(
    (r) => r.medication.trim() && r.dosage.trim() && r.frequency && r.duration
  );

  const handleSubmit = () => {
    if (filledRows.length === 0) {
      showToast('Please fill in at least one complete medication row', 'warning');
      return;
    }

    filledRows.forEach((row) => {
      createPrescription({
        visitId: visit.id,
        patientName: visit.patientName,
        medication: row.medication.trim(),
        dosage: row.dosage.trim(),
        frequency: row.frequency,
        duration: row.duration,
        notes: row.notes.trim() || undefined,
      });
    });

    navigate(`/cl/orders/rx-submitted/${visit.id}?count=${filledRows.length}`, {
      replace: true,
    });
  };

  const currentMed = (medName: string) =>
    MEDICATION_CATALOGUE.find((m) => m.name === medName);

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Prescribe" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-36">
        {/* Patient strip */}
        <div className="bg-aba-neutral-0 border-b border-aba-neutral-200 px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F5F3FF] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-[#8B5CF6]">
              {visit.patientName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-aba-neutral-900">{visit.patientName}</p>
            <p className="text-xs text-aba-neutral-600">
              {visit.service} &middot; {visit.ticket}
              {visit.allergies && (
                <span className="text-aba-error-main"> &middot; Allergies: {visit.allergies}</span>
              )}
            </p>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* ── Medication rows ── */}
          {rows.map((row, idx) => (
            <div
              key={row.id}
              className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden"
            >
              {/* Row header */}
              <button
                onClick={() => toggleExpand(row.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-aba-neutral-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] flex items-center justify-center flex-shrink-0">
                  <Pill className="w-4 h-4 text-[#8B5CF6]" />
                </div>
                <div className="flex-1 min-w-0">
                  {row.medication ? (
                    <>
                      <p className="text-sm font-medium text-aba-neutral-900 truncate">
                        {row.medication}
                      </p>
                      <p className="text-xs text-aba-neutral-600 truncate">
                        {[row.dosage, row.frequency, row.duration].filter(Boolean).join(' · ') ||
                          'Incomplete'}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-aba-neutral-500">Medication {idx + 1}</p>
                  )}
                </div>
                {row.medication && row.dosage && row.frequency && row.duration && (
                  <span className="w-2 h-2 rounded-full bg-aba-success-main flex-shrink-0" />
                )}
                {row.expanded ? (
                  <ChevronUp className="w-4 h-4 text-aba-neutral-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-aba-neutral-400 flex-shrink-0" />
                )}
              </button>

              {/* Expanded form */}
              {row.expanded && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-aba-neutral-200">
                  {/* Medication search */}
                  <div className="relative" ref={searchOpen === row.id ? dropdownRef : undefined}>
                    <label className="block text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide mb-1.5">
                      Medication <span className="text-aba-error-main">*</span>
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aba-neutral-500" />
                      <input
                        type="text"
                        value={searchOpen === row.id ? searchTerm : row.medication}
                        onFocus={() => {
                          setSearchOpen(row.id);
                          setSearchTerm(row.medication);
                        }}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          updateRow(row.id, 'medication', e.target.value);
                        }}
                        placeholder="Search medications…"
                        className="w-full h-10 pl-9 pr-4 rounded-[6px] border border-aba-neutral-200 bg-aba-neutral-100 text-sm text-aba-neutral-900 placeholder:text-aba-neutral-500 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main/30 focus:border-aba-secondary-main transition-all"
                      />
                    </div>

                    {/* Dropdown */}
                    {searchOpen === row.id && (
                      <div className="absolute z-40 top-full left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-aba-neutral-0 rounded-xl border border-aba-neutral-200 shadow-lg">
                        {filteredMeds.length === 0 ? (
                          <p className="px-4 py-3 text-xs text-aba-neutral-500">No matches found</p>
                        ) : (
                          filteredMeds.map((med) => (
                            <button
                              key={med.name}
                              onClick={() => selectMedication(row.id, med.name)}
                              className="w-full text-left px-4 py-2.5 text-sm text-aba-neutral-900 hover:bg-aba-neutral-100 active:bg-aba-neutral-200 border-b border-aba-neutral-200 last:border-b-0 transition-colors"
                            >
                              <span className="font-medium">{med.name}</span>
                              <span className="text-xs text-aba-neutral-500 ml-2">{med.category}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dosage */}
                  <div>
                    <label className="block text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide mb-1.5">
                      Dosage <span className="text-aba-error-main">*</span>
                    </label>
                    {currentMed(row.medication) ? (
                      <div className="flex flex-wrap gap-1.5">
                        {currentMed(row.medication)!.dosages.map((d) => (
                          <button
                            key={d}
                            onClick={() => updateRow(row.id, 'dosage', d)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              row.dosage === d
                                ? 'bg-[#8B5CF6] text-white'
                                : 'bg-aba-neutral-100 text-aba-neutral-700 border border-aba-neutral-200 hover:bg-aba-neutral-200'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                        <input
                          type="text"
                          value={
                            currentMed(row.medication)!.dosages.includes(row.dosage) ? '' : row.dosage
                          }
                          onChange={(e) => updateRow(row.id, 'dosage', e.target.value)}
                          placeholder="Custom…"
                          className="h-[30px] w-20 px-2 rounded-[6px] border border-aba-neutral-200 bg-aba-neutral-100 text-xs text-aba-neutral-900 placeholder:text-aba-neutral-500 focus:outline-none focus:ring-1 focus:ring-aba-secondary-main/30"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={row.dosage}
                        onChange={(e) => updateRow(row.id, 'dosage', e.target.value)}
                        placeholder="e.g. 500mg, 5ml…"
                        className="w-full h-10 px-3 rounded-[6px] border border-aba-neutral-200 bg-aba-neutral-100 text-sm text-aba-neutral-900 placeholder:text-aba-neutral-500 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main/30 focus:border-aba-secondary-main transition-all"
                      />
                    )}
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide mb-1.5">
                      Frequency <span className="text-aba-error-main">*</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {FREQUENCY_OPTIONS.map((f) => (
                        <button
                          key={f}
                          onClick={() => updateRow(row.id, 'frequency', f)}
                          className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            row.frequency === f
                              ? 'bg-aba-primary-main text-aba-neutral-900 border border-aba-neutral-900'
                              : 'bg-aba-neutral-100 text-aba-neutral-700 border border-aba-neutral-200 hover:bg-aba-neutral-200'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide mb-1.5">
                      Duration <span className="text-aba-error-main">*</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {DURATION_OPTIONS.map((d) => (
                        <button
                          key={d}
                          onClick={() => updateRow(row.id, 'duration', d)}
                          className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            row.duration === d
                              ? 'bg-aba-primary-main text-aba-neutral-900 border border-aba-neutral-900'
                              : 'bg-aba-neutral-100 text-aba-neutral-700 border border-aba-neutral-200 hover:bg-aba-neutral-200'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-aba-neutral-600 uppercase tracking-wide mb-1.5">
                      Notes (optional)
                    </label>
                    <textarea
                      value={row.notes}
                      onChange={(e) => updateRow(row.id, 'notes', e.target.value)}
                      placeholder="Special instructions, take with food…"
                      rows={2}
                      className="w-full text-sm text-aba-neutral-900 placeholder:text-aba-neutral-500 bg-aba-neutral-100 rounded-[6px] border border-aba-neutral-200 p-3 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main/30 focus:border-aba-secondary-main transition-all resize-none"
                    />
                  </div>

                  {/* Remove */}
                  {rows.length > 1 && (
                    <button
                      onClick={() => removeRow(row.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-aba-error-main hover:text-aba-error-main/80 transition-colors mt-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove medication
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add another medication */}
          <button
            onClick={addRow}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-aba-neutral-300 bg-aba-neutral-0 text-sm font-medium text-aba-neutral-600 hover:text-aba-neutral-900 hover:border-aba-neutral-400 hover:bg-aba-neutral-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Another Medication
          </button>
        </div>
      </div>

      {/* ── Sticky Submit ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-aba-neutral-0 border-t border-aba-neutral-200 z-30">
        <div className="max-w-[390px] mx-auto p-4 space-y-2">
          {filledRows.length > 0 && filledRows.length < rows.length && (
            <p className="text-xs text-aba-warning-main text-center">
              {rows.length - filledRows.length} incomplete medication{rows.length - filledRows.length > 1 ? 's' : ''} will be skipped
            </p>
          )}
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleSubmit}
            disabled={filledRows.length === 0}
          >
            <Send className="w-4.5 h-4.5" />
            Submit to Pharmacy
            {filledRows.length > 0 && ` (${filledRows.length})`}
          </ABAButton>
        </div>
      </div>
    </div>
  );
}
