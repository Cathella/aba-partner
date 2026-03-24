import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import {
  Upload,
  Paperclip,
  AlertCircle,
  X,
} from 'lucide-react';

const categories = [
  { value: 'technical', label: 'Technical Issue' },
  { value: 'billing', label: 'Billing & Payments' },
  { value: 'account', label: 'Account Access' },
  { value: 'bookings', label: 'Bookings & Scheduling' },
  { value: 'staff', label: 'Staff Management' },
  { value: 'reports', label: 'Reports & Data' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'other', label: 'Other' },
];

const priorities = [
  { value: 'low', label: 'Low - General inquiry', color: 'text-aba-neutral-600' },
  {
    value: 'medium',
    label: 'Medium - Issue affecting work',
    color: 'text-aba-warning-main',
  },
  {
    value: 'high',
    label: 'High - Critical issue',
    color: 'text-aba-error-main',
  },
];

export function CreateTicket() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [errors, setErrors] = useState({
    category: '',
    priority: '',
    subject: '',
    description: '',
  });

  const handleSubmit = () => {
    // Validation
    if (!category) {
      showToast('Please select a category', 'error');
      setErrors({ ...errors, category: 'Please select a category' });
      return;
    }
    if (!priority) {
      showToast('Please select a priority level', 'error');
      setErrors({ ...errors, priority: 'Please select a priority level' });
      return;
    }
    if (!subject.trim()) {
      showToast('Please enter a subject', 'error');
      setErrors({ ...errors, subject: 'Please enter a subject' });
      return;
    }
    if (!description.trim()) {
      showToast('Please describe your issue', 'error');
      setErrors({ ...errors, description: 'Please describe your issue' });
      return;
    }

    // Submit ticket
    showToast('Support ticket submitted successfully', 'success');
    setTimeout(() => {
      navigate('/tickets-list');
    }, 1000);
  };

  const handleAddAttachment = () => {
    // Simulate file selection
    const fileName = `screenshot-${Date.now()}.png`;
    setAttachments([...attachments, fileName]);
    showToast('Attachment added', 'success');
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const isFormValid = category && priority && subject.trim() && description.trim();

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Create Support Ticket"
        showBack
        onBackClick={() => navigate('/tickets-list')}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-4">
          {/* Info Box */}
          <div className="bg-aba-secondary-50 border border-aba-secondary-200 rounded-xl p-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-aba-secondary-main mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-aba-neutral-900 mb-1">
                We're here to help
              </p>
              <p className="text-aba-neutral-700 text-[14px]">
                Describe your issue in detail and our support team will respond
                within 24 hours.
              </p>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-aba-neutral-900 mb-2">
              Category <span className="text-aba-error-main">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-aba-neutral-300 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main text-sm"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-aba-error-main mt-1">{errors.category}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-aba-neutral-900 mb-2">
              Priority Level <span className="text-aba-error-main">*</span>
            </label>
            <div className="space-y-2">
              {priorities.map((p) => (
                <label
                  key={p.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    priority === p.value
                      ? 'border-aba-secondary-main bg-aba-secondary-50'
                      : 'border-aba-neutral-300 bg-white hover:bg-aba-neutral-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p.value}
                    checked={priority === p.value}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-4 h-4 text-aba-secondary-main focus:ring-aba-secondary-main"
                  />
                  <span className={`text-sm font-medium ${p.color}`}>
                    {p.label}
                  </span>
                </label>
              ))}
            </div>
            {errors.priority && (
              <p className="text-xs text-aba-error-main mt-1">{errors.priority}</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-aba-neutral-900 mb-2">
              Subject <span className="text-aba-error-main">*</span>
            </label>
            <input
              type="text"
              placeholder="Brief summary of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-aba-neutral-300 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main text-sm"
            />
            <p className="text-xs text-aba-neutral-600 mt-1">
              {subject.length}/100 characters
            </p>
            {errors.subject && (
              <p className="text-xs text-aba-error-main mt-1">{errors.subject}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-aba-neutral-900 mb-2">
              Description <span className="text-aba-error-main">*</span>
            </label>
            <textarea
              placeholder="Provide detailed information about your issue, including any error messages or steps to reproduce..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors({ ...errors, description: '' });
                }
              }}
              rows={6}
              className="w-full px-4 py-3 rounded-md border border-aba-neutral-400 bg-aba-neutral-0 text-[14px] text-aba-neutral-900 placeholder:text-aba-neutral-600 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main focus:border-transparent transition-all resize-none"
            />
            <p className="text-xs text-aba-neutral-600 mt-1">
              {description.length}/1000 characters
            </p>
            {errors.description && (
              <p className="text-xs text-aba-error-main mt-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-semibold text-aba-neutral-900 mb-2">
              Attachments (Optional)
            </label>
            <button
              onClick={handleAddAttachment}
              className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-aba-neutral-300 bg-white hover:bg-aba-neutral-50 active:bg-aba-neutral-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-aba-neutral-700"
            >
              <Upload className="w-5 h-5" />
              Upload Screenshot or File
            </button>
            <p className="text-xs text-aba-neutral-600 mt-1">
              Max file size: 10MB. Supported: JPG, PNG, PDF
            </p>

            {/* Attachment List */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-aba-neutral-50 rounded-lg"
                  >
                    <Paperclip className="w-4 h-4 text-aba-neutral-600 flex-shrink-0" />
                    <span className="text-xs text-aba-neutral-900 flex-1 truncate">
                      {file}
                    </span>
                    <button
                      onClick={() => handleRemoveAttachment(index)}
                      className="p-1 rounded hover:bg-aba-neutral-200 transition-colors"
                    >
                      <X className="w-4 h-4 text-aba-neutral-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E8EC] p-4 shadow-lg">
        <div className="grid grid-cols-2 gap-3">
            <ABAButton
              variant="outline"
              size="md"
              onClick={() => navigate('/tickets-list')}
            >
              Cancel
            </ABAButton>
            <ABAButton
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={!isFormValid}
            >
              Submit Ticket
            </ABAButton>
        </div>
      </div>
    </div>
  );
}