/**
 * NU-04 Nursing Notes — Short notes field + optional quick chips.
 *
 * Chips: Fever, Pain, Follow-up, Dizzy, Cough, Nausea
 * Save → toast → back to NU-02.
 * Inner page: back arrow, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { useNurseStore, addNursingNote } from '../data/nurseStore';
import { Clock } from 'lucide-react';

const quickChips = ['Fever', 'Pain', 'Follow-up', 'Dizzy', 'Cough', 'Nausea'];

export function NUNursingNotes() {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const { getById } = useNurseStore();

  const patient = getById(patientId || '');

  const [text, setText] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  if (!patient) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Nursing Notes" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Patient not found</p>
        </div>
      </div>
    );
  }

  const toggleChip = (chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const canSave = text.trim() || selectedChips.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    setIsSaving(true);
    setTimeout(() => {
      addNursingNote(patient.id, text.trim(), selectedChips);
      showToast('Nursing note saved', 'success');
      navigate(-1);
    }, 400);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Nursing Notes" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-4 space-y-3">

          {/* Patient bar */}
          <div className="bg-[#EBF3FF] rounded-2xl p-3 flex items-center gap-3">
            <span className="text-[10px] font-bold text-[#3A8DFF] bg-white px-1.5 py-[1px] rounded">
              {patient.ticketNo}
            </span>
            <p className="text-sm font-semibold text-[#1A1A1A]">{patient.patientName}</p>
          </div>

          {/* Quick chips */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <p className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-3">
              Quick Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {quickChips.map((chip) => {
                const active = selectedChips.includes(chip);
                return (
                  <button
                    key={chip}
                    onClick={() => toggleChip(chip)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                      active
                        ? 'bg-[#32C28A] text-white border-[#32C28A]'
                        : 'bg-[#F7F9FC] text-[#4A4F55] border-[#E5E8EC] hover:border-[#32C28A]'
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes textarea */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <p className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-2">
              Notes
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write nursing observations, symptoms, or instructions…"
              rows={5}
              className="w-full rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] p-3 text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all resize-none"
            />
          </div>

          {/* Previous notes */}
          {patient.notes.length > 0 && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E8EC]">
                <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                  Previous Notes ({patient.notes.length})
                </h3>
              </div>
              {patient.notes.map((note) => (
                <div key={note.id} className="px-4 py-3 border-b border-[#E5E8EC] last:border-b-0">
                  <p className="text-sm text-[#1A1A1A] leading-relaxed">{note.text}</p>
                  {note.chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {note.chips.map((c) => (
                        <span
                          key={c}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF3FF] text-[#3A8DFF]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-[#C9D0DB] mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {note.createdBy} · {note.createdAt}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky save */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleSave}
            disabled={!canSave}
            isLoading={isSaving}
          >
            Save Note
          </ABAButton>
        </div>
      </div>
    </div>
  );
}
