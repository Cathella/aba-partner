/**
 * Tests Catalog — Lab tests available at the facility.
 * Facility Admin uses this to review / manage the lab test menu.
 * Linked from ClinicInformation setup checklist (Lab-specific item).
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ListCard, ListCardItem } from '../components/aba/Cards';
import { ABAButton } from '../components/aba/ABAButton';
import { ABABadge } from '../components/aba/ABABadge';
import { showToast } from '../components/aba/Toast';
import {
  Search,
  Plus,
  FlaskConical,
  Microscope,
  Droplets,
  Heart,
  Brain,
  Baby,
  Stethoscope,
  Activity,
  ChevronRight,
  Check,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

/* ── test categories ── */

interface LabTest {
  id: string;
  name: string;
  code: string;
  price: number;
  turnaround: string;
  specimen: string;
  enabled: boolean;
}

interface TestCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  iconBg: string;
  tests: LabTest[];
}

const initialCategories: TestCategory[] = [
  {
    id: 'haem',
    name: 'Haematology',
    icon: Droplets,
    color: 'text-[#E44F4F]',
    iconBg: 'bg-[#FDECEC]',
    tests: [
      { id: 'h-1', name: 'Complete Blood Count (CBC)', code: 'CBC', price: 25000, turnaround: '2 hrs', specimen: 'EDTA Blood', enabled: true },
      { id: 'h-2', name: 'Erythrocyte Sedimentation Rate', code: 'ESR', price: 15000, turnaround: '1 hr', specimen: 'EDTA Blood', enabled: true },
      { id: 'h-3', name: 'Blood Group & Rh Type', code: 'BG-RH', price: 20000, turnaround: '30 min', specimen: 'EDTA Blood', enabled: true },
      { id: 'h-4', name: 'Peripheral Blood Film', code: 'PBF', price: 30000, turnaround: '3 hrs', specimen: 'EDTA Blood', enabled: false },
      { id: 'h-5', name: 'Reticulocyte Count', code: 'RETIC', price: 20000, turnaround: '2 hrs', specimen: 'EDTA Blood', enabled: false },
    ],
  },
  {
    id: 'chem',
    name: 'Clinical Chemistry',
    icon: FlaskConical,
    color: 'text-[#3A8DFF]',
    iconBg: 'bg-[#E8F2FF]',
    tests: [
      { id: 'c-1', name: 'Liver Function Tests (LFT)', code: 'LFT', price: 45000, turnaround: '4 hrs', specimen: 'Serum', enabled: true },
      { id: 'c-2', name: 'Renal Function Tests (RFT)', code: 'RFT', price: 40000, turnaround: '4 hrs', specimen: 'Serum', enabled: true },
      { id: 'c-3', name: 'Blood Glucose (Fasting)', code: 'FBG', price: 10000, turnaround: '1 hr', specimen: 'Fluoride Blood', enabled: true },
      { id: 'c-4', name: 'Lipid Profile', code: 'LIPID', price: 50000, turnaround: '4 hrs', specimen: 'Serum', enabled: true },
      { id: 'c-5', name: 'HbA1c', code: 'HBA1C', price: 60000, turnaround: '6 hrs', specimen: 'EDTA Blood', enabled: false },
      { id: 'c-6', name: 'Thyroid Function (T3, T4, TSH)', code: 'TFT', price: 80000, turnaround: '24 hrs', specimen: 'Serum', enabled: false },
    ],
  },
  {
    id: 'micro',
    name: 'Microbiology',
    icon: Microscope,
    color: 'text-[#32C28A]',
    iconBg: 'bg-[#E9F8F0]',
    tests: [
      { id: 'm-1', name: 'Urinalysis', code: 'UA', price: 15000, turnaround: '1 hr', specimen: 'Urine', enabled: true },
      { id: 'm-2', name: 'Urine Culture & Sensitivity', code: 'UC-S', price: 35000, turnaround: '48 hrs', specimen: 'Mid-stream Urine', enabled: true },
      { id: 'm-3', name: 'Stool Microscopy', code: 'SM', price: 10000, turnaround: '1 hr', specimen: 'Stool', enabled: true },
      { id: 'm-4', name: 'Blood Culture', code: 'BC', price: 50000, turnaround: '72 hrs', specimen: 'Blood', enabled: false },
    ],
  },
  {
    id: 'sero',
    name: 'Serology & Immunology',
    icon: Heart,
    color: 'text-[#8B5CF6]',
    iconBg: 'bg-[#F5F3FF]',
    tests: [
      { id: 's-1', name: 'HIV Rapid Test', code: 'HIV-RT', price: 0, turnaround: '20 min', specimen: 'Whole Blood', enabled: true },
      { id: 's-2', name: 'Hepatitis B Surface Antigen', code: 'HBsAg', price: 20000, turnaround: '30 min', specimen: 'Serum', enabled: true },
      { id: 's-3', name: 'Malaria RDT', code: 'MRDT', price: 5000, turnaround: '15 min', specimen: 'Whole Blood', enabled: true },
      { id: 's-4', name: 'Widal Test', code: 'WIDAL', price: 15000, turnaround: '30 min', specimen: 'Serum', enabled: true },
      { id: 's-5', name: 'VDRL / RPR (Syphilis)', code: 'VDRL', price: 15000, turnaround: '30 min', specimen: 'Serum', enabled: false },
    ],
  },
  {
    id: 'special',
    name: 'Special Investigations',
    icon: Activity,
    color: 'text-[#D97706]',
    iconBg: 'bg-[#FFF3DC]',
    tests: [
      { id: 'sp-1', name: 'Hearing Audiometry', code: 'AUDIO', price: 60000, turnaround: '1 hr', specimen: 'N/A', enabled: true },
      { id: 'sp-2', name: 'ECG (12-lead)', code: 'ECG', price: 40000, turnaround: '30 min', specimen: 'N/A', enabled: false },
      { id: 'sp-3', name: 'Pregnancy Test (urine)', code: 'UPT', price: 10000, turnaround: '10 min', specimen: 'Urine', enabled: true },
    ],
  },
];

function fmtUGX(value: number) {
  if (value === 0) return 'Free';
  return `UGX ${value.toLocaleString()}`;
}

export function TestsCatalog() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const totalTests = categories.reduce((sum, c) => sum + c.tests.length, 0);
  const enabledTests = categories.reduce(
    (sum, c) => sum + c.tests.filter((t) => t.enabled).length,
    0
  );

  /* ── toggle test enabled ── */
  const toggleTest = (catId: string, testId: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              tests: c.tests.map((t) =>
                t.id === testId ? { ...t, enabled: !t.enabled } : t
              ),
            }
          : c
      )
    );
  };

  /* ── filtered view ── */
  const query = searchQuery.toLowerCase().trim();
  const filteredCategories = query
    ? categories
        .map((c) => ({
          ...c,
          tests: c.tests.filter(
            (t) =>
              t.name.toLowerCase().includes(query) ||
              t.code.toLowerCase().includes(query)
          ),
        }))
        .filter((c) => c.tests.length > 0)
    : categories;

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar
        title="Tests Catalog"
        showBack
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-4">
          {/* Summary */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#E8F2FF] flex items-center justify-center flex-shrink-0">
              <FlaskConical className="w-6 h-6 text-[#3A8DFF]" />
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-[#1A1A1A]">
                {enabledTests} of {totalTests} tests enabled
              </p>
              <p className="text-xs text-[#8F9AA1] mt-0.5">
                {categories.length} categories &middot; Toggle tests on/off to match your facility
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F9AA1] pointer-events-none" />
            <input
              type="text"
              placeholder="Search tests by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E8EC] focus:outline-none focus:ring-2 focus:ring-[#3A8DFF] text-sm bg-[#FFFFFF]"
            />
          </div>

          {/* Categories */}
          {filteredCategories.map((category) => {
            const IconComponent = category.icon;
            const isExpanded = expandedCat === category.id || !!query;
            const enabledCount = category.tests.filter((t) => t.enabled).length;

            return (
              <div
                key={category.id}
                className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() =>
                    setExpandedCat(expandedCat === category.id ? null : category.id)
                  }
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/50 transition-colors text-left"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${category.iconBg} flex items-center justify-center flex-shrink-0`}
                  >
                    <IconComponent className={`w-5 h-5 ${category.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                      {category.name}
                    </p>
                    <p className="text-xs text-[#8F9AA1]">
                      {enabledCount}/{category.tests.length} enabled
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-[#C9D0DB] transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {/* Tests List */}
                {isExpanded && (
                  <div className="border-t border-[#E5E8EC]">
                    {category.tests.map((test) => (
                      <div
                        key={test.id}
                        className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E8EC] last:border-b-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-medium text-[#1A1A1A] truncate">
                              {test.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#8F9AA1]">
                            <span className="font-mono text-[#4A4F55]">
                              {test.code}
                            </span>
                            <span>&middot;</span>
                            <span>{fmtUGX(test.price)}</span>
                            <span>&middot;</span>
                            <span>{test.turnaround}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleTest(category.id, test.id)}
                          className="flex-shrink-0 p-0.5"
                        >
                          {test.enabled ? (
                            <ToggleRight className="w-7 h-7 text-[#32C28A]" />
                          ) : (
                            <ToggleLeft className="w-7 h-7 text-[#C9D0DB]" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-10 h-10 text-[#C9D0DB] mx-auto mb-3" />
              <p className="text-sm text-[#8F9AA1]">
                No tests match &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          )}

          {/* // ... remove this code ... Save button removed from here */}
        </div>
      </div>

      {/* Fixed Bottom Save */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E8EC] p-4 shadow-lg">
        <ABAButton
          variant="primary"
          fullWidth
          size="lg"
          onClick={() => {
            showToast(`Catalog saved — ${enabledTests} tests enabled`, 'success');
            navigate(-1);
          }}
        >
          <Check className="w-4 h-4" />
          Save Catalog
        </ABAButton>
      </div>
    </div>
  );
}