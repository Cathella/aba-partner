/**
 * CL-96 Manage Quick Phrases — Add, edit, delete quick phrases.
 * Inner page: back arrow to /cl/note-templates, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { CLConfirmModal } from '../components/aba/CLConfirmModal';
import { showToast } from '../components/aba/Toast';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';

interface QuickPhrase {
  id: string;
  category: string;
  name: string;
  text: string;
}

const initialPhrases: QuickPhrase[] = [
  { id: 'qp-01', category: 'greeting', name: 'Welcome', text: 'Welcome to Mukono Family Clinic. How can I help you today?' },
  { id: 'qp-02', category: 'greeting', name: 'Return Visit', text: 'Welcome back. Let\'s review your progress since last time.' },
  { id: 'qp-03', category: 'greeting', name: 'Parent Intro', text: 'Hello, thank you for bringing your child in today. Let\'s talk about your concerns.' },
  { id: 'qp-04', category: 'greeting', name: 'Reassurance', text: 'I understand your concern. Let\'s go through this carefully together.' },
  { id: 'qp-05', category: 'assessment', name: 'Normal Findings', text: 'All findings within normal limits for age. No acute concerns noted.' },
  { id: 'qp-06', category: 'assessment', name: 'Mild Presentation', text: 'Mild presentation consistent with [diagnosis]. No red flags.' },
  { id: 'qp-07', category: 'assessment', name: 'Needs Further Workup', text: 'Findings suggest further workup needed. Will order appropriate labs/imaging.' },
  { id: 'qp-08', category: 'assessment', name: 'Stable Condition', text: 'Condition stable. Continue current management plan.' },
  { id: 'qp-09', category: 'assessment', name: 'Improving', text: 'Patient showing improvement compared to last visit. Continue therapy.' },
  { id: 'qp-10', category: 'assessment', name: 'Referral Needed', text: 'Condition warrants specialist referral for further evaluation.' },
  { id: 'qp-11', category: 'advice', name: 'Hydration', text: 'Ensure adequate fluid intake — at least 6-8 glasses of water daily.' },
  { id: 'qp-12', category: 'advice', name: 'Rest', text: 'Rest as needed. Avoid strenuous activities for the next [X] days.' },
  { id: 'qp-13', category: 'advice', name: 'Medication Adherence', text: 'Take all prescribed medications as directed. Do not stop early even if feeling better.' },
  { id: 'qp-14', category: 'advice', name: 'Diet', text: 'Follow a balanced diet rich in fruits, vegetables, and proteins.' },
  { id: 'qp-15', category: 'advice', name: 'Return Precautions', text: 'Return immediately if symptoms worsen: high fever, difficulty breathing, or persistent vomiting.' },
  { id: 'qp-16', category: 'followup', name: '1 Week', text: 'Please schedule a follow-up appointment in 1 week.' },
  { id: 'qp-17', category: 'followup', name: '2 Weeks', text: 'Please schedule a follow-up appointment in 2 weeks.' },
  { id: 'qp-18', category: 'followup', name: '4 Weeks', text: 'Please schedule a follow-up appointment in 4 weeks for reassessment.' },
];

const categoryLabels: Record<string, string> = {
  greeting: 'Greeting',
  assessment: 'Assessment',
  advice: 'Advice',
  followup: 'Follow-up',
};

export function CLManageQuickPhrases() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterCategory = searchParams.get('category') || '';

  const [phrases, setPhrases] = useState<QuickPhrase[]>(initialPhrases);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* Form state */
  const [formName, setFormName] = useState('');
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState(filterCategory || 'greeting');

  const filteredPhrases = filterCategory
    ? phrases.filter((p) => p.category === filterCategory)
    : phrases;

  const handleSave = () => {
    if (!formName.trim() || !formText.trim()) return;

    if (editingId) {
      setPhrases((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, name: formName, text: formText, category: formCategory }
            : p
        )
      );
      showToast('Phrase updated', 'success');
      setEditingId(null);
    } else {
      const newPhrase: QuickPhrase = {
        id: `qp-${Date.now()}`,
        category: formCategory,
        name: formName,
        text: formText,
      };
      setPhrases((prev) => [newPhrase, ...prev]);
      showToast('Phrase added', 'success');
    }
    setFormName('');
    setFormText('');
  };

  const handleEdit = (phrase: QuickPhrase) => {
    setEditingId(phrase.id);
    setFormName(phrase.name);
    setFormText(phrase.text);
    setFormCategory(phrase.category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    setPhrases((prev) => prev.filter((p) => p.id !== deleteId));
    showToast('Phrase deleted', 'success');
    setDeleteId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormName('');
    setFormText('');
  };

  const pageTitle = filterCategory
    ? `${categoryLabels[filterCategory] || 'Quick'} Phrases`
    : 'Quick Phrases';

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar
        title={pageTitle}
        showBack
        onBackClick={() => navigate('/cl/note-templates')}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Add / Edit Form */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[#1A1A1A]">
              {editingId ? 'Edit Phrase' : 'Add New Phrase'}
            </h3>

            {/* Category selector */}
            {!filterCategory && (
              <div>
                <label className="text-xs text-[#8F9AA1] mb-1 block">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-10 rounded-md border border-[#E5E8EC] bg-[#FFFFFF] px-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-aba-primary-main/30 focus:border-aba-primary-main"
                >
                  <option value="greeting">Greeting</option>
                  <option value="assessment">Assessment</option>
                  <option value="advice">Advice</option>
                  <option value="followup">Follow-up</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-xs text-[#8F9AA1] mb-1 block">Phrase Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Welcome greeting"
                className="w-full h-10 rounded-md border border-[#E5E8EC] bg-[#FFFFFF] px-3 text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-aba-primary-main/30 focus:border-aba-primary-main"
              />
            </div>

            <div>
              <label className="text-xs text-[#8F9AA1] mb-1 block">Phrase Text</label>
              <textarea
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder="Type the full phrase text here..."
                rows={3}
                className="w-full rounded-md border border-[#E5E8EC] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-aba-primary-main/30 focus:border-aba-primary-main resize-none"
              />
            </div>

            <div className="flex gap-2">
              {editingId && (
                <ABAButton variant="outline" className="flex-1" onClick={handleCancel}>
                  Cancel
                </ABAButton>
              )}
              <ABAButton
                className="flex-1"
                onClick={handleSave}
                disabled={!formName.trim() || !formText.trim()}
              >
                {editingId ? 'Update' : 'Save'}
              </ABAButton>
            </div>
          </div>

          {/* Phrases List */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-sm font-semibold text-[#1A1A1A]">
                {filterCategory ? categoryLabels[filterCategory] : 'All'} Phrases
              </h3>
              <span className="text-xs text-[#8F9AA1]">
                {filteredPhrases.length} items
              </span>
            </div>

            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
              {filteredPhrases.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-[#8F9AA1]">No phrases yet</p>
                </div>
              ) : (
                filteredPhrases.map((phrase) => (
                  <div
                    key={phrase.id}
                    className="px-4 py-3 border-b border-[#E5E8EC] last:border-b-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-[#1A1A1A] truncate">
                            {phrase.name}
                          </p>
                          {!filterCategory && (
                            <span className="text-[10px] font-medium text-[#8F9AA1] bg-[#F7F9FC] px-1.5 py-0.5 rounded-full flex-shrink-0">
                              {categoryLabels[phrase.category]}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#8F9AA1] line-clamp-2">
                          {phrase.text}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(phrase)}
                          className="p-1.5 rounded-lg hover:bg-[#F7F9FC] transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#8F9AA1]" />
                        </button>
                        <button
                          onClick={() => setDeleteId(phrase.id)}
                          className="p-1.5 rounded-lg hover:bg-aba-error-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-aba-error-main" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <CLConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        icon={<AlertTriangle className="w-6 h-6 text-aba-error-main" />}
        iconBg="bg-aba-error-50"
        title="Delete Phrase"
        description="Are you sure you want to delete this quick phrase? This cannot be undone."
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}