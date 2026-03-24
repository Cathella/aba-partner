/**
 * FAQ Category — shows articles within a help center FAQ category.
 * Linked from HelpCenter.tsx browse-by-category list.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ListCard, ListCardItem } from '../components/aba/Cards';
import {
  ChevronRight,
  FileText,
  Book,
  Calendar,
  Users,
  CreditCard,
  Settings,
  Shield,
  Search,
} from 'lucide-react';

/* ── category metadata (mirrors HelpCenter.tsx) ── */
const categoryMeta: Record<
  string,
  { title: string; icon: any; color: string; description: string }
> = {
  'getting-started': {
    title: 'Getting Started',
    icon: Book,
    color: 'text-aba-primary-main',
    description: 'Learn the basics of ABA Partner',
  },
  bookings: {
    title: 'Bookings & Scheduling',
    icon: Calendar,
    color: 'text-aba-warning-main',
    description: 'Manage appointments and availability',
  },
  staff: {
    title: 'Staff Management',
    icon: Users,
    color: 'text-aba-secondary-main',
    description: 'Add and manage staff members',
  },
  payments: {
    title: 'Payments & Finance',
    icon: CreditCard,
    color: 'text-aba-success-main',
    description: 'Transaction and settlement help',
  },
  settings: {
    title: 'Settings & Configuration',
    icon: Settings,
    color: 'text-aba-neutral-600',
    description: 'Customize your clinic setup',
  },
  security: {
    title: 'Security & Compliance',
    icon: Shield,
    color: 'text-aba-error-main',
    description: 'Data protection and audit logs',
  },
};

/* ── mock articles per category ── */
const articlesByCategory: Record<
  string,
  { id: string; title: string; readTime: string; views: number }[]
> = {
  'getting-started': [
    { id: 'gs-1', title: 'Welcome to ABA Partner', readTime: '3 min', views: 2340 },
    { id: 'gs-2', title: 'Setting up your facility profile', readTime: '5 min', views: 1870 },
    { id: 'gs-3', title: 'Inviting your first staff member', readTime: '4 min', views: 1654 },
    { id: 'gs-4', title: 'Adding services and pricing', readTime: '4 min', views: 1420 },
    { id: 'gs-5', title: 'Configuring operating hours', readTime: '3 min', views: 1280 },
    { id: 'gs-6', title: 'Understanding the dashboard', readTime: '5 min', views: 1190 },
    { id: 'gs-7', title: 'Navigating role-based views', readTime: '4 min', views: 980 },
    { id: 'gs-8', title: 'Completing the setup wizard', readTime: '6 min', views: 870 },
  ],
  bookings: [
    { id: 'bk-1', title: 'How bookings work in ABA Partner', readTime: '4 min', views: 2100 },
    { id: 'bk-2', title: 'Managing the daily schedule', readTime: '3 min', views: 1890 },
    { id: 'bk-3', title: 'Handling walk-in patients', readTime: '3 min', views: 1650 },
    { id: 'bk-4', title: 'Reassigning staff to bookings', readTime: '3 min', views: 1340 },
    { id: 'bk-5', title: 'Cancelling or rescheduling', readTime: '2 min', views: 1200 },
    { id: 'bk-6', title: 'Setting up blackout dates', readTime: '3 min', views: 1050 },
    { id: 'bk-7', title: 'Capacity rules explained', readTime: '4 min', views: 940 },
    { id: 'bk-8', title: 'Booking notifications', readTime: '3 min', views: 860 },
    { id: 'bk-9', title: 'Patient check-in flow', readTime: '4 min', views: 780 },
    { id: 'bk-10', title: 'End of day summary', readTime: '3 min', views: 720 },
    { id: 'bk-11', title: 'Proposing alternative times', readTime: '2 min', views: 650 },
    { id: 'bk-12', title: 'Declining bookings properly', readTime: '2 min', views: 590 },
  ],
  staff: [
    { id: 'st-1', title: 'Inviting staff members', readTime: '4 min', views: 1542 },
    { id: 'st-2', title: 'Assigning roles and permissions', readTime: '5 min', views: 1380 },
    { id: 'st-3', title: 'Staff sign-in with PIN', readTime: '3 min', views: 1210 },
    { id: 'st-4', title: 'Deactivating a staff account', readTime: '2 min', views: 1050 },
    { id: 'st-5', title: 'Editing staff details', readTime: '2 min', views: 930 },
    { id: 'st-6', title: 'Resending invitations', readTime: '2 min', views: 820 },
    { id: 'st-7', title: 'Understanding staff statuses', readTime: '3 min', views: 740 },
    { id: 'st-8', title: 'Staff PIN reset flow', readTime: '3 min', views: 680 },
    { id: 'st-9', title: 'Role-based navigation', readTime: '4 min', views: 620 },
    { id: 'st-10', title: 'Switching roles', readTime: '2 min', views: 550 },
  ],
  payments: [
    { id: 'py-1', title: 'Understanding the payment flow', readTime: '5 min', views: 1980 },
    { id: 'py-2', title: 'Processing refunds for clients', readTime: '4 min', views: 1328 },
    { id: 'py-3', title: 'Viewing transaction history', readTime: '3 min', views: 1200 },
    { id: 'py-4', title: 'Settlement ledger explained', readTime: '5 min', views: 1100 },
    { id: 'py-5', title: 'Reconciling cash at end of day', readTime: '4 min', views: 980 },
    { id: 'py-6', title: 'Setting up payment methods', readTime: '3 min', views: 870 },
    { id: 'py-7', title: 'Mobile money integration', readTime: '4 min', views: 760 },
    { id: 'py-8', title: 'Billing summary walkthrough', readTime: '3 min', views: 680 },
    { id: 'py-9', title: 'Failed payment handling', readTime: '3 min', views: 620 },
    { id: 'py-10', title: 'Printing & sharing receipts', readTime: '2 min', views: 560 },
    { id: 'py-11', title: 'Revenue reports overview', readTime: '4 min', views: 490 },
    { id: 'py-12', title: 'Insurance and coverage', readTime: '5 min', views: 430 },
    { id: 'py-13', title: 'Disputes and escalation', readTime: '4 min', views: 380 },
    { id: 'py-14', title: 'Accountant role overview', readTime: '4 min', views: 330 },
    { id: 'py-15', title: 'Exporting financial data', readTime: '3 min', views: 290 },
  ],
  settings: [
    { id: 'se-1', title: 'Setting up operating hours', readTime: '3 min', views: 1156 },
    { id: 'se-2', title: 'Editing facility information', readTime: '4 min', views: 1020 },
    { id: 'se-3', title: 'Notification preferences', readTime: '3 min', views: 890 },
    { id: 'se-4', title: 'Services and pricing management', readTime: '4 min', views: 780 },
    { id: 'se-5', title: 'PIN and security settings', readTime: '3 min', views: 690 },
    { id: 'se-6', title: 'Preview your listing', readTime: '3 min', views: 610 },
    { id: 'se-7', title: 'Updating your map pin', readTime: '2 min', views: 540 },
    { id: 'se-8', title: 'Managing departments', readTime: '3 min', views: 470 },
    { id: 'se-9', title: 'Facility types explained', readTime: '4 min', views: 410 },
  ],
  security: [
    { id: 'sc-1', title: 'Understanding audit logs', readTime: '5 min', views: 892 },
    { id: 'sc-2', title: 'Data privacy in ABA Partner', readTime: '4 min', views: 780 },
    { id: 'sc-3', title: 'Changing your PIN securely', readTime: '3 min', views: 650 },
    { id: 'sc-4', title: 'Who can see what data', readTime: '4 min', views: 540 },
    { id: 'sc-5', title: 'Reporting a security concern', readTime: '3 min', views: 430 },
    { id: 'sc-6', title: 'Compliance best practices', readTime: '5 min', views: 320 },
  ],
};

export function FAQCategory() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchQuery, setSearchQuery] = useState('');

  const meta = categoryMeta[categoryId ?? ''];
  const articles = articlesByCategory[categoryId ?? ''] ?? [];

  if (!meta) {
    return (
      <div className="flex flex-col h-screen bg-aba-bg-primary">
        <AppTopBar title="Category" showBack onBackClick={() => navigate('/help-center')} />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-aba-neutral-600">Category not found.</p>
        </div>
      </div>
    );
  }

  const IconComponent = meta.icon;

  const filtered = searchQuery.trim()
    ? articles.filter((a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles;

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      <AppTopBar
        title={meta.title}
        showBack
        onBackClick={() => navigate('/help-center')}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Category Header */}
          <div className="rounded-2xl border border-aba-neutral-200 bg-aba-neutral-0 p-4 flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-aba-neutral-100 flex items-center justify-center flex-shrink-0">
              <IconComponent className={`w-6 h-6 ${meta.color}`} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-aba-neutral-900 mb-0.5">
                {meta.title}
              </h2>
              <p className="text-xs text-aba-neutral-600">
                {meta.description} &middot; {articles.length} articles
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aba-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search in ${meta.title}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-aba-neutral-300 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main text-sm"
            />
          </div>

          {/* Articles List */}
          {filtered.length > 0 ? (
            <ListCard>
              {filtered.map((article) => (
                <ListCardItem
                  key={article.id}
                  onClick={() => navigate(`/help-article/${article.id}`)}
                >
                  <div className="w-9 h-9 rounded-full bg-aba-neutral-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-aba-neutral-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-aba-neutral-900 mb-0.5 truncate">
                      {article.title}
                    </p>
                    <p className="text-xs text-aba-neutral-600">
                      {article.readTime} read &middot;{' '}
                      {article.views.toLocaleString()} views
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-aba-neutral-400 flex-shrink-0" />
                </ListCardItem>
              ))}
            </ListCard>
          ) : (
            <div className="text-center py-12">
              <Search className="w-10 h-10 text-aba-neutral-300 mx-auto mb-3" />
              <p className="text-sm text-aba-neutral-600">
                No articles match &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
