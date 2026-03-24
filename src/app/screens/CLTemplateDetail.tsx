/**
 * CL-95 Template Detail — SOAP template preview with "Use this template" CTA.
 * Inner page: back arrow to /cl/note-templates, no bottom nav.
 */
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { soapTemplates } from './CLNoteTemplates';

/* ── Template content by ID ── */
interface TemplateContent {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

const templateContent: Record<string, TemplateContent> = {
  'tpl-01': {
    subjective:
      'Patient presents with [chief complaint]. Duration: [X days/weeks]. Associated symptoms include [list]. No reported allergies. Current medications: [list or "None"].',
    objective:
      'Vitals: T [__]°C, BP [__/__] mmHg, HR [__] bpm, SpO2 [__]%, Wt [__] kg.\nGeneral appearance: [alert/oriented/comfortable].\nPertinent exam findings: [describe].',
    assessment:
      'Primary diagnosis: [ICD-10 code — description].\nDifferential diagnoses considered: [list].\nSeverity: [mild/moderate/severe].',
    plan:
      '1. Medications: [prescribe]\n2. Labs ordered: [list or "None"]\n3. Referrals: [list or "None"]\n4. Patient education provided on [topic].\n5. Follow-up in [X weeks].',
  },
  'tpl-02': {
    subjective:
      'Patient returns for follow-up of [previous diagnosis]. Reports [improvement/no change/worsening]. Adherence to treatment plan: [good/partial/poor]. New symptoms: [list or "None"].',
    objective:
      'Vitals: T [__]°C, BP [__/__] mmHg, HR [__] bpm, SpO2 [__]%, Wt [__] kg.\nComparison with last visit: [improved/stable/declined].\nExam: [pertinent findings].',
    assessment:
      'Follow-up for [diagnosis]. Status: [improving/stable/worsening].\nLab results review: [summary if applicable].',
    plan:
      '1. Continue/Adjust medications: [details]\n2. Repeat labs: [if needed]\n3. Reinforce patient education.\n4. Next follow-up: [date/timeframe].',
  },
  'tpl-03': {
    subjective:
      'Child presents with fever of [duration]. Highest recorded temp: [X]°C. Associated symptoms: [cough/runny nose/vomiting/diarrhea/rash]. Fluid intake: [adequate/poor]. Vaccination status: [up to date/incomplete].',
    objective:
      'Vitals: T [__]°C, HR [__] bpm, RR [__], SpO2 [__]%, Wt [__] kg.\nGeneral: [active/lethargic/irritable].\nENT: [findings]. Chest: [clear/crackles/wheeze].\nAbdomen: [soft/tender]. Skin: [rash description if any].',
    assessment:
      'Acute febrile illness — likely [viral URTI / otitis media / UTI / malaria].\nRed flags: [present/absent].',
    plan:
      '1. Antipyretic: Paracetamol [dose] q6h PRN.\n2. Labs: [malaria RDT / CBC / urinalysis].\n3. Fluids: Encourage oral rehydration.\n4. Return precautions: Worsening fever >3 days, poor intake, lethargy.\n5. Follow-up in [24-48 hours].',
  },
};

const sectionLabels: { key: keyof TemplateContent; label: string; color: string }[] = [
  { key: 'subjective', label: 'S — Subjective', color: 'border-l-aba-secondary-main' },
  { key: 'objective', label: 'O — Objective', color: 'border-l-[#8B5CF6]' },
  { key: 'assessment', label: 'A — Assessment', color: 'border-l-[#F59E0B]' },
  { key: 'plan', label: 'P — Plan', color: 'border-l-aba-primary-main' },
];

export function CLTemplateDetail() {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();

  const tpl = soapTemplates.find((t) => t.id === templateId);
  const content = templateContent[templateId ?? ''];

  if (!tpl || !content) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar
          title="Template Detail"
          showBack
          onBackClick={() => navigate('/cl/note-templates')}
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Template not found</p>
        </div>
      </div>
    );
  }

  const handleUseTemplate = () => {
    showToast('Template applied', 'success');
    /* Navigate to the most recent in-consultation visit's workspace, or fallback to queue */
    navigate('/cl/consult/clv-01');
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar
        title={tpl.name}
        showBack
        onBackClick={() => navigate('/cl/note-templates')}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Template description */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <p className="text-sm text-[#4A4F55]">{tpl.description}</p>
          </div>

          {/* SOAP Sections */}
          {sectionLabels.map((sec) => (
            <div
              key={sec.key}
              className={`bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4 border-l-4 ${sec.color}`}
            >
              <h4 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-2">
                {sec.label}
              </h4>
              <p className="text-sm text-[#4A4F55] whitespace-pre-line leading-relaxed">
                {content[sec.key]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="border-t border-[#E5E8EC] bg-[#FFFFFF] px-4 py-3">
        <ABAButton fullWidth size="lg" onClick={handleUseTemplate}>
          Use This Template
        </ABAButton>
      </div>
    </div>
  );
}
