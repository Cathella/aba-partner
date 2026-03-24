/**
 * Help Article — renders a single help-center article.
 * Linked from HelpCenter popular articles and FAQCategory article lists.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import {
  ThumbsUp,
  ThumbsDown,
  Clock,
  Eye,
  Tag,
  ChevronRight,
  FileText,
  ArrowLeft,
} from 'lucide-react';

/* ── article content database ── */
interface Article {
  id: string;
  title: string;
  category: string;
  categoryId: string;
  readTime: string;
  views: number;
  lastUpdated: string;
  sections: { heading: string; body: string }[];
  relatedIds: string[];
}

const articles: Record<string, Article> = {
  /* Popular articles (linked from HelpCenter) */
  '1': {
    id: '1',
    title: 'How to invite staff members',
    category: 'Staff Management',
    categoryId: 'staff',
    readTime: '4 min',
    views: 1542,
    lastUpdated: '2026-01-15',
    sections: [
      {
        heading: 'Overview',
        body: 'ABA Partner lets Facility Admins invite staff to the clinic via email or phone number. Each invited user receives a link to accept the invite, verify their identity with OTP, and create a secure PIN.',
      },
      {
        heading: 'Step 1 — Navigate to Staff',
        body: 'From the Facility Admin Dashboard, tap the bottom-nav "Staff" tab or use the Quick Action "Invite Staff" button.',
      },
      {
        heading: 'Step 2 — Fill in details',
        body: 'Enter the staff member\'s full name, select their role (Receptionist, Doctor, Lab Technician, Pharmacist, Nurse, or Accountant), and provide an email or phone number.',
      },
      {
        heading: 'Step 3 — Send the invite',
        body: 'Tap "Send Invite". The staff member will receive a notification. You can track invitation status (Pending, Active, Deactivated) from the Staff List screen.',
      },
      {
        heading: 'Tips',
        body: 'Make sure the contact information is correct before sending. If the staff member does not receive the invite, you can resend it from their Staff Detail page.',
      },
    ],
    relatedIds: ['st-2', 'st-3'],
  },
  '2': {
    id: '2',
    title: 'Processing refunds for clients',
    category: 'Payments & Finance',
    categoryId: 'payments',
    readTime: '4 min',
    views: 1328,
    lastUpdated: '2026-01-20',
    sections: [
      {
        heading: 'When to issue a refund',
        body: 'Refunds should be issued when a service was not delivered, a duplicate payment occurred, or the patient/client requests cancellation within the allowed window.',
      },
      {
        heading: 'How to process',
        body: 'Go to Accountant > Transactions, find the transaction, and tap "Request Refund". Fill in the reason and amount. The refund request will be queued for approval.',
      },
      {
        heading: 'Approval workflow',
        body: 'Refund requests appear in the Refunds & Disputes section. The Facility Admin or Accountant can review and approve/deny each request.',
      },
    ],
    relatedIds: ['py-3', 'py-5'],
  },
  '3': {
    id: '3',
    title: 'Setting up operating hours',
    category: 'Settings & Configuration',
    categoryId: 'settings',
    readTime: '3 min',
    views: 1156,
    lastUpdated: '2026-02-01',
    sections: [
      {
        heading: 'Accessing operating hours',
        body: 'Navigate to Settings > Operating Hours from the Facility Admin dashboard, or tap the Quick Action shortcut.',
      },
      {
        heading: 'Configuring your schedule',
        body: 'Toggle each day of the week on or off. For active days, set the opening and closing times. You can also configure lunch breaks.',
      },
      {
        heading: 'Blackout dates',
        body: 'Use the Blackout Dates sub-screen to mark public holidays or closures. These dates will block new bookings automatically.',
      },
    ],
    relatedIds: ['se-2', 'bk-6'],
  },
  '4': {
    id: '4',
    title: 'Understanding audit logs',
    category: 'Security & Compliance',
    categoryId: 'security',
    readTime: '5 min',
    views: 892,
    lastUpdated: '2026-01-28',
    sections: [
      {
        heading: 'What are audit logs?',
        body: 'Audit logs track every significant action in your facility: staff logins, data changes, payment processing, prescription dispensing, and more.',
      },
      {
        heading: 'Viewing logs',
        body: 'Go to Settings > Audit Logs. You can filter by date range, action type, or staff member. Each log entry shows the timestamp, actor, action, and affected record.',
      },
      {
        heading: 'Why it matters',
        body: 'Audit logs are critical for compliance, dispute resolution, and internal accountability. They cannot be edited or deleted.',
      },
    ],
    relatedIds: ['sc-2', 'sc-4'],
  },
  /* Generic fallback for category-specific articles */
};

/** Generate a stub article for IDs not in the hand-written database */
function getArticle(id: string): Article | null {
  if (articles[id]) return articles[id];

  // Derive a plausible stub from the id prefix
  const prefixMap: Record<string, { category: string; categoryId: string }> = {
    gs: { category: 'Getting Started', categoryId: 'getting-started' },
    bk: { category: 'Bookings & Scheduling', categoryId: 'bookings' },
    st: { category: 'Staff Management', categoryId: 'staff' },
    py: { category: 'Payments & Finance', categoryId: 'payments' },
    se: { category: 'Settings & Configuration', categoryId: 'settings' },
    sc: { category: 'Security & Compliance', categoryId: 'security' },
  };

  const prefix = id.split('-')[0];
  const meta = prefixMap[prefix];
  if (!meta) return null;

  return {
    id,
    title: `Help Article ${id.toUpperCase()}`,
    category: meta.category,
    categoryId: meta.categoryId,
    readTime: '3 min',
    views: 500,
    lastUpdated: '2026-02-10',
    sections: [
      {
        heading: 'About this article',
        body: `This article provides guidance on a topic within ${meta.category}. Detailed content will be available in a future update.`,
      },
      {
        heading: 'Need more help?',
        body: 'If you cannot find what you need, create a support ticket from the Help Center and our team will respond within 24 hours.',
      },
    ],
    relatedIds: [],
  };
}

export function HelpArticle() {
  const navigate = useNavigate();
  const { articleId } = useParams<{ articleId: string }>();
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const article = getArticle(articleId ?? '');

  if (!article) {
    return (
      <div className="flex flex-col h-screen bg-aba-bg-primary">
        <AppTopBar title="Article" showBack onBackClick={() => navigate('/help-center')} />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-aba-neutral-600">Article not found.</p>
        </div>
      </div>
    );
  }

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    showToast(
      type === 'up' ? 'Thanks for your feedback!' : 'We\'ll work to improve this article',
      'success'
    );
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      <AppTopBar
        title="Help Article"
        showBack
        onBackClick={() => navigate(-1 as any)}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-5">
          {/* Article Header */}
          <div>
            <button
              onClick={() => navigate(`/faq-category/${article.categoryId}`)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-aba-primary-50 text-aba-primary-main text-xs font-medium mb-3 hover:bg-aba-primary-100 transition-colors"
            >
              <Tag className="w-3 h-3" />
              {article.category}
            </button>
            <h1 className="text-xl font-semibold text-aba-neutral-900 mb-2">
              {article.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-aba-neutral-600">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime} read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {article.views.toLocaleString()} views
              </span>
              <span>Updated {article.lastUpdated}</span>
            </div>
          </div>

          {/* Article Body */}
          <div className="rounded-2xl border border-aba-neutral-200 bg-aba-neutral-0 divide-y divide-aba-neutral-200">
            {article.sections.map((section, idx) => (
              <div key={idx} className="p-4">
                <h3 className="text-sm font-semibold text-aba-neutral-900 mb-2">
                  {section.heading}
                </h3>
                <p className="text-sm text-aba-neutral-700 leading-relaxed">
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          {/* Feedback */}
          <div className="rounded-2xl border border-aba-neutral-200 bg-aba-neutral-0 p-4">
            <p className="text-sm font-semibold text-aba-neutral-900 mb-3 text-center">
              Was this article helpful?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => handleFeedback('up')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-colors ${
                  feedback === 'up'
                    ? 'bg-aba-success-50 border-aba-success-main text-aba-success-main'
                    : 'border-aba-neutral-300 text-aba-neutral-700 hover:bg-aba-neutral-50'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">Yes</span>
              </button>
              <button
                onClick={() => handleFeedback('down')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-colors ${
                  feedback === 'down'
                    ? 'bg-aba-error-50 border-aba-error-main text-aba-error-main'
                    : 'border-aba-neutral-300 text-aba-neutral-700 hover:bg-aba-neutral-50'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span className="text-sm font-medium">No</span>
              </button>
            </div>
          </div>

          {/* Related Articles */}
          {article.relatedIds.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
                Related Articles
              </h3>
              <div className="rounded-2xl border border-aba-neutral-200 bg-aba-neutral-0 divide-y divide-aba-neutral-200">
                {article.relatedIds.map((relId) => {
                  const rel = getArticle(relId);
                  if (!rel) return null;
                  return (
                    <button
                      key={relId}
                      onClick={() => navigate(`/help-article/${relId}`)}
                      className="w-full flex items-center gap-3 p-3.5 hover:bg-aba-neutral-50 active:bg-aba-neutral-100 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-aba-neutral-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-aba-neutral-600" />
                      </div>
                      <p className="flex-1 text-sm font-medium text-aba-neutral-900 truncate">
                        {rel.title}
                      </p>
                      <ChevronRight className="w-4 h-4 text-aba-neutral-400 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Back to Help Center */}
          <div className="pb-4">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => navigate('/help-center')}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Help Center
            </ABAButton>
          </div>
        </div>
      </div>
    </div>
  );
}
