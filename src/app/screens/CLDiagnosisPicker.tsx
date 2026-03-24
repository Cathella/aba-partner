/**
 * CL-07 Diagnosis Picker — Search + list + select diagnoses.
 * Adds selected diagnoses back to the visit's Assessment tab.
 */
import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { useClinicianStore, addDiagnosis } from '../data/clinicianStore';
import type { DiagnosisEntry } from '../data/clinicianStore';
import { Search, Check, Plus } from 'lucide-react';

/** Mock ICD-10 diagnosis catalogue */
const DIAGNOSIS_CATALOGUE: DiagnosisEntry[] = [
  { code: 'F80.0', name: 'Phonological disorder' },
  { code: 'F80.1', name: 'Expressive language disorder' },
  { code: 'F80.2', name: 'Mixed receptive-expressive language disorder' },
  { code: 'F80.9', name: 'Developmental disorder of speech and language, unspecified' },
  { code: 'F82', name: 'Specific developmental disorder of motor function' },
  { code: 'F84.0', name: 'Childhood autism' },
  { code: 'F84.5', name: "Asperger's syndrome" },
  { code: 'F88', name: 'Other disorders of psychological development' },
  { code: 'F89', name: 'Unspecified disorder of psychological development' },
  { code: 'F90.0', name: 'ADHD, predominantly inattentive type' },
  { code: 'F90.1', name: 'ADHD, predominantly hyperactive type' },
  { code: 'F90.2', name: 'ADHD, combined type' },
  { code: 'F91.3', name: 'Oppositional defiant disorder' },
  { code: 'F93.0', name: 'Separation anxiety disorder of childhood' },
  { code: 'F94.0', name: 'Selective mutism' },
  { code: 'F95.1', name: 'Chronic motor or vocal tic disorder' },
  { code: 'F98.0', name: 'Nonorganic enuresis' },
  { code: 'F98.1', name: 'Nonorganic encopresis' },
  { code: 'G80.0', name: 'Spastic quadriplegic cerebral palsy' },
  { code: 'G80.1', name: 'Spastic diplegic cerebral palsy' },
  { code: 'H90.3', name: 'Sensorineural hearing loss, bilateral' },
  { code: 'H93.25', name: 'Central auditory processing disorder' },
  { code: 'R47.1', name: 'Dysarthria and anarthria' },
  { code: 'R48.0', name: 'Dyslexia and alexia' },
  { code: 'R62.50', name: 'Unspecified lack of expected normal physiological development' },
  { code: 'Z13.4', name: 'Encounter for screening for developmental delays' },
  { code: 'Z71.3', name: 'Dietary counseling and surveillance' },
];

export function CLDiagnosisPicker() {
  const navigate = useNavigate();
  const { visitId } = useParams<{ visitId: string }>();
  const { getVisitById } = useClinicianStore();

  const visit = getVisitById(visitId || '');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<DiagnosisEntry[]>([]);

  const existingCodes = useMemo(
    () => new Set(visit?.diagnoses.map((d) => d.code) || []),
    [visit]
  );

  const results = useMemo(() => {
    if (!search.trim()) return DIAGNOSIS_CATALOGUE;
    const q = search.toLowerCase();
    return DIAGNOSIS_CATALOGUE.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q)
    );
  }, [search]);

  if (!visit) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Add Diagnosis" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-aba-neutral-600">Visit not found</p>
        </div>
      </div>
    );
  }

  const toggleDiagnosis = (d: DiagnosisEntry) => {
    if (existingCodes.has(d.code)) return; // already on visit
    setSelected((prev) =>
      prev.some((s) => s.code === d.code)
        ? prev.filter((s) => s.code !== d.code)
        : [...prev, d]
    );
  };

  const isSelected = (code: string) => selected.some((s) => s.code === code);

  const handleAdd = () => {
    selected.forEach((d) => addDiagnosis(visit.id, d));
    showToast(`${selected.length} diagnosis${selected.length > 1 ? 'es' : ''} added`, 'success');
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Add Diagnosis" showBack onBackClick={() => navigate(-1)} />

      {/* Search */}
      <div className="bg-aba-neutral-0 border-b border-aba-neutral-200 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aba-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ICD code…"
            autoFocus
            className="w-full h-10 pl-9 pr-4 rounded-[6px] border border-aba-neutral-200 bg-aba-neutral-100 text-sm text-aba-neutral-900 placeholder:text-aba-neutral-500 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main/30 focus:border-aba-secondary-main transition-all"
          />
        </div>
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {selected.map((s) => (
              <span
                key={s.code}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-aba-primary-50 text-xs font-medium text-aba-neutral-900 border border-aba-primary-main/15"
              >
                {s.code}
                <button
                  onClick={() => setSelected((prev) => prev.filter((p) => p.code !== s.code))}
                  className="p-0.5 rounded-full hover:bg-aba-neutral-200"
                >
                  <Plus className="w-3 h-3 rotate-45 text-aba-neutral-600" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs text-aba-neutral-500 font-medium">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="px-4 pb-4">
          <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
            {results.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-aba-neutral-500">No diagnoses match your search.</p>
              </div>
            ) : (
              results.map((d) => {
                const alreadyAdded = existingCodes.has(d.code);
                const checked = isSelected(d.code);
                return (
                  <button
                    key={d.code}
                    onClick={() => toggleDiagnosis(d)}
                    disabled={alreadyAdded}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-aba-neutral-200 last:border-b-0 text-left transition-colors ${
                      alreadyAdded
                        ? 'bg-aba-neutral-50 opacity-60'
                        : checked
                        ? 'bg-aba-primary-50/40'
                        : 'hover:bg-aba-neutral-100 active:bg-aba-neutral-200'
                    }`}
                  >
                    {/* Checkbox indicator */}
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        checked
                          ? 'bg-aba-primary-main border-aba-primary-main'
                          : alreadyAdded
                          ? 'border-aba-neutral-300 bg-aba-neutral-200'
                          : 'border-aba-neutral-300'
                      }`}
                    >
                      {(checked || alreadyAdded) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-aba-neutral-900 truncate">
                        {d.name}
                      </p>
                      <p className="text-xs text-aba-neutral-500 mt-0.5">
                        {d.code}
                        {alreadyAdded && ' — Already added'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Sticky bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-aba-neutral-0 border-t border-aba-neutral-200 z-30">
        <div className="max-w-[390px] mx-auto p-4">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleAdd}
            disabled={selected.length === 0}
          >
            Add {selected.length > 0 ? `${selected.length} Diagnosis${selected.length > 1 ? 'es' : ''}` : 'Selected'}
          </ABAButton>
        </div>
      </div>
    </div>
  );
}
