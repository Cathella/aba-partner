/**
 * CL-94 Note Templates — SOAP Templates / Quick Phrases tabs.
 * Inner page: back arrow to /cl/more, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import {
  FileText,
  ChevronRight,
  Plus,
  MessageCircle,
  Stethoscope,
  ClipboardList,
  Heart,
} from 'lucide-react';

type TemplateTab = 'soap' | 'phrases';

/* ── SOAP Templates ── */
export interface SOAPTemplate {
  id: string;
  name: string;
  description: string;
}

export const soapTemplates: SOAPTemplate[] = [
  { id: 'tpl-01', name: 'General Consultation', description: 'Standard SOAP layout for general clinic visits' },
  { id: 'tpl-02', name: 'Follow-up Visit', description: 'Template for returning patients with prior notes' },
  { id: 'tpl-03', name: 'Pediatric Fever', description: 'Fever workup template for children under 12' },
];

/* ── Quick Phrases categories ── */
interface PhraseCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  count: number;
}

const phraseCategories: PhraseCategory[] = [
  { id: 'greeting', label: 'Greeting', icon: <MessageCircle className="w-4 h-4 text-aba-primary-main" />, iconBg: 'bg-aba-primary-50', count: 4 },
  { id: 'assessment', label: 'Assessment', icon: <Stethoscope className="w-4 h-4 text-[#8B5CF6]" />, iconBg: 'bg-[#F5F3FF]', count: 6 },
  { id: 'advice', label: 'Advice', icon: <Heart className="w-4 h-4 text-aba-error-main" />, iconBg: 'bg-aba-error-50', count: 5 },
  { id: 'followup', label: 'Follow-up', icon: <ClipboardList className="w-4 h-4 text-[#F59E0B]" />, iconBg: 'bg-[#FFFBEB]', count: 3 },
];

export function CLNoteTemplates() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TemplateTab>('soap');

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar
        title="Note Templates"
        showBack
        onBackClick={() => navigate('/cl/more')}
      />

      {/* Tabs */}
      <div className="px-4 pt-3 pb-1 flex gap-2">
        <button
          onClick={() => setTab('soap')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            tab === 'soap'
              ? 'bg-[#1A1A1A] text-white'
              : 'bg-[#FFFFFF] text-[#4A4F55] border border-[#E5E8EC]'
          }`}
        >
          SOAP Templates
        </button>
        <button
          onClick={() => setTab('phrases')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            tab === 'phrases'
              ? 'bg-[#1A1A1A] text-white'
              : 'bg-[#FFFFFF] text-[#4A4F55] border border-[#E5E8EC]'
          }`}
        >
          Quick Phrases
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {tab === 'soap' ? (
            /* SOAP Templates List */
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
              {soapTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => navigate(`/cl/template/${tpl.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC] transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">
                      {tpl.name}
                    </p>
                    <p className="text-xs text-[#8F9AA1] mt-0.5 truncate">
                      {tpl.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            /* Quick Phrases */
            <>
              <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
                {phraseCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/cl/quick-phrases?category=${cat.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC] transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl ${cat.iconBg} flex items-center justify-center flex-shrink-0`}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A]">
                        {cat.label}
                      </p>
                      <p className="text-xs text-[#8F9AA1] mt-0.5">
                        {cat.count} phrases
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => navigate('/cl/quick-phrases')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[#C9D0DB] text-sm font-medium text-aba-secondary-main hover:bg-aba-secondary-50 active:bg-aba-secondary-50/70 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add phrase
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
