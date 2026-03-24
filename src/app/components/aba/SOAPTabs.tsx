/**
 * SOAPTabs — Tabbed SOAP note editor for clinician consultation view.
 * Tabs: Subjective, Objective, Assessment, Plan
 */
import { useState } from 'react';
import type { SOAPNote } from '../../data/clinicianStore';

type SOAPField = keyof SOAPNote;

interface SOAPTabsProps {
  soap: SOAPNote;
  onChange: (field: SOAPField, value: string) => void;
  readOnly?: boolean;
}

const tabs: { key: SOAPField; label: string; shortLabel: string; placeholder: string }[] = [
  {
    key: 'subjective',
    label: 'Subjective',
    shortLabel: 'S',
    placeholder: 'Patient history, chief complaint, symptoms reported by patient or caregiver…',
  },
  {
    key: 'objective',
    label: 'Objective',
    shortLabel: 'O',
    placeholder: 'Clinical observations, vitals, test findings, measurable data…',
  },
  {
    key: 'assessment',
    label: 'Assessment',
    shortLabel: 'A',
    placeholder: 'Diagnosis, clinical impression, differential diagnosis…',
  },
  {
    key: 'plan',
    label: 'Plan',
    shortLabel: 'P',
    placeholder: 'Treatment plan, medications, referrals, follow-up instructions…',
  },
];

export function SOAPTabs({ soap, onChange, readOnly = false }: SOAPTabsProps) {
  const [activeTab, setActiveTab] = useState<SOAPField>('subjective');

  const currentTab = tabs.find((t) => t.key === activeTab)!;
  const currentValue = soap[activeTab];

  return (
    <div className="bg-aba-neutral-0 rounded-2xl border border-aba-neutral-200 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-aba-neutral-200">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const hasContent = soap[tab.key].trim().length > 0;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-center text-sm font-medium transition-colors relative ${
                isActive
                  ? 'text-aba-primary-main'
                  : hasContent
                  ? 'text-aba-neutral-900'
                  : 'text-aba-neutral-600'
              }`}
            >
              {/* Mobile: show short label, sm+: full label */}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-aba-primary-main rounded-full" />
              )}
              {/* Filled dot indicator */}
              {hasContent && !isActive && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-aba-primary-main" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="p-4">
        <p className="text-xs font-medium text-aba-neutral-600 mb-2 uppercase tracking-wide">
          {currentTab.label}
        </p>
        {readOnly ? (
          <div className="min-h-[120px] text-sm text-aba-neutral-900 whitespace-pre-wrap">
            {currentValue || (
              <span className="text-aba-neutral-600 italic">No notes recorded</span>
            )}
          </div>
        ) : (
          <textarea
            value={currentValue}
            onChange={(e) => onChange(activeTab, e.target.value)}
            placeholder={currentTab.placeholder}
            rows={5}
            className="w-full min-h-[120px] text-sm text-aba-neutral-900 placeholder:text-aba-neutral-600/60 bg-aba-neutral-100 rounded-lg border border-aba-neutral-200 p-3 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main/30 focus:border-aba-secondary-main transition-all resize-none"
          />
        )}
      </div>
    </div>
  );
}
