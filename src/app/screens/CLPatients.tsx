/**
 * CL-08 Patients — Clinician's patient list (read-only search + tap to profile).
 * Main navigation tab (Patients).
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ClinicianBottomNav } from '../components/aba/ClinicianBottomNav';
import { SearchHeader } from '../components/aba/SearchHeader';
import { ListCard } from '../components/aba/Cards';
import { usePatientsStore, type PatientFilter } from '../data/patientsStore';
import {
  ChevronRight,
  Users,
  Shield,
} from 'lucide-react';

const filterChips: { id: PatientFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'member', label: 'Members' },
  { id: 'non-member', label: 'Non-members' },
];

export function CLPatients() {
  const navigate = useNavigate();
  const { searchPatients } = usePatientsStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<PatientFilter>('all');

  const results = searchPatients(search, filter);

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      {/* Top bar */}
      <div className="bg-aba-neutral-0 border-b border-aba-neutral-200 px-4 h-14 flex items-center">
        <h1 className="text-lg font-semibold text-aba-neutral-900">Patients</h1>
      </div>

      {/* Search */}
      <SearchHeader
        value={search}
        onChange={setSearch}
        placeholder="Search patients…"
      />

      {/* Filter chips */}
      <div className="flex gap-2 px-4 pb-3 -mt-1">
        {filterChips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => setFilter(chip.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === chip.id
                ? 'bg-aba-neutral-900 text-aba-neutral-0'
                : 'bg-aba-neutral-0 text-aba-neutral-700 border border-aba-neutral-200'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 pb-4">
          {results.length === 0 ? (
            <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-aba-neutral-100 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-aba-neutral-400" />
              </div>
              <p className="text-sm font-medium text-aba-neutral-900 mb-1">No patients found</p>
              <p className="text-xs text-aba-neutral-600">Try a different search or filter.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-aba-neutral-600 mb-2">
                {results.length} patient{results.length !== 1 ? 's' : ''}
              </p>
              <ListCard>
                {results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/cl/patients/${p.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-aba-neutral-200 last:border-b-0 hover:bg-aba-neutral-100 transition-colors text-left"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-aba-secondary-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-aba-secondary-main">
                        {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-aba-neutral-900 truncate">
                          {p.name}
                        </p>
                        {p.isMember && (
                          <Shield className="w-3.5 h-3.5 text-aba-primary-main flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-aba-neutral-600 truncate">
                        {p.age} yrs &middot; {p.gender}
                        {p.lastVisit && ` &middot; Last visit: ${p.lastVisit}`}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-aba-neutral-400 flex-shrink-0" />
                  </button>
                ))}
              </ListCard>
            </>
          )}
        </div>
      </div>

      <ClinicianBottomNav />
    </div>
  );
}