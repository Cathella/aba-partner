/**
 * R-60 Patients Home — Search bar, filter chips, patient list, Add Patient CTA.
 * Accessed from More → Patients. Bottom nav present (More tab highlighted).
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ReceptionistBottomNav } from '../components/aba/ReceptionistBottomNav';
import { SearchHeader } from '../components/aba/SearchHeader';
import { ListCard } from '../components/aba/Cards';
import { RListRow } from '../components/aba/RListRow';
import { ABABadge } from '../components/aba/ABABadge';
import { EmptyState } from '../components/aba/EmptyState';
import {
  usePatientsStore,
  searchPatients,
  maskPhone,
  type PatientFilter,
} from '../data/patientsStore';
import { UserPlus, Users, Search } from 'lucide-react';

const filterChips: { id: PatientFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'today', label: "Today's New" },
  { id: 'member', label: 'Members' },
  { id: 'non-member', label: 'Non-members' },
];

export function RPatients() {
  const navigate = useNavigate();
  const { patients } = usePatientsStore();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PatientFilter>('all');

  const filtered = useMemo(
    () => searchPatients(query, filter),
    [patients, query, filter]
  );

  const getInitials = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar
        title="Patients"
        showBack
        onBackClick={() => navigate('/r/more')}
        rightAction={
          <button
            onClick={() => navigate('/r/more/patients/add')}
            className="p-2 -mr-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
            aria-label="Add patient"
          >
            
          </button>
        }
      />

      {/* Search */}
      <SearchHeader
        value={query}
        onChange={setQuery}
        placeholder="Search name or phone"
      />

      {/* Filter chips */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
        {filterChips.map((chip) => {
          const isActive = filter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setFilter(chip.id)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                isActive
                  ? 'bg-aba-neutral-900 text-white border-aba-neutral-900'
                  : 'bg-aba-neutral-0 text-aba-neutral-700 border-aba-neutral-200 hover:bg-aba-neutral-100'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Patient list */}
      <div className="flex-1 overflow-y-auto pb-20">
        {filtered.length > 0 ? (
          <div className="px-4">
            <p className="text-xs text-aba-neutral-600 mb-2 px-1">
              {filtered.length} patient{filtered.length !== 1 ? 's' : ''}
            </p>
            <ListCard>
              {filtered.map((patient) => (
                <RListRow
                  key={patient.id}
                  initials={getInitials(patient.name)}
                  title={patient.name}
                  subtitle={maskPhone(patient.phone)}
                  meta={patient.lastVisit ? `Last visit: ${patient.lastVisit}` : undefined}
                  trailing={
                    <ABABadge
                      variant={patient.isMember ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {patient.isMember ? 'Member' : 'Non-member'}
                    </ABABadge>
                  }
                  showChevron
                  onClick={() => navigate(`/r/more/patients/${patient.id}`)}
                />
              ))}
            </ListCard>
          </div>
        ) : (
          <EmptyState
            icon={<Search className="w-8 h-8" />}
            title="No patients found"
            message={
              query
                ? `No results for "${query}". Try a different search or add a new patient.`
                : 'No patients match this filter. Add a new patient to get started.'
            }
            actionLabel="Add Patient"
            onAction={() => navigate('/r/more/patients/add')}
          />
        )}
      </div>

      {/* Fixed bottom CTA */}
      {filtered.length > 0 && (
        <div className="flex-shrink-0 border-t border-aba-neutral-200 bg-aba-neutral-0 px-4 py-3">
          <button
            onClick={() => navigate('/r/more/patients/add')}
            className="w-full flex items-center justify-center gap-2 h-12 px-6 rounded-[14px] bg-aba-primary-main text-aba-neutral-900 font-semibold text-sm shadow-lg border-[1.5px] border-aba-neutral-900 hover:bg-aba-primary-600 active:bg-aba-primary-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Add Patient
          </button>
        </div>
      )}

      <ReceptionistBottomNav />
    </div>
  );
}