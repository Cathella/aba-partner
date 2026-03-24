import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { ListCard, ListCardItem } from '../components/aba/Cards';
import {
  ChevronLeft,
  Search,
  MessageSquarePlus,
  HelpCircle,
  ChevronRight,
  Book,
  CreditCard,
  Calendar,
  Users,
  Settings,
  Shield,
  FileText,
  Video,
  MessageCircle,
} from 'lucide-react';

interface FAQCategory {
  id: string;
  title: string;
  icon: any;
  color: string;
  articleCount: number;
  description: string;
}

const faqCategories: FAQCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Book,
    color: 'text-aba-primary-main',
    articleCount: 8,
    description: 'Learn the basics of ABA Partner',
  },
  {
    id: 'bookings',
    title: 'Bookings & Scheduling',
    icon: Calendar,
    color: 'text-aba-warning-main',
    articleCount: 12,
    description: 'Manage appointments and availability',
  },
  {
    id: 'staff',
    title: 'Staff Management',
    icon: Users,
    color: 'text-aba-secondary-main',
    articleCount: 10,
    description: 'Add and manage staff members',
  },
  {
    id: 'payments',
    title: 'Payments & Finance',
    icon: CreditCard,
    color: 'text-aba-success-main',
    articleCount: 15,
    description: 'Transaction and settlement help',
  },
  {
    id: 'settings',
    title: 'Settings & Configuration',
    icon: Settings,
    color: 'text-aba-neutral-600',
    articleCount: 9,
    description: 'Customize your clinic setup',
  },
  {
    id: 'security',
    title: 'Security & Compliance',
    icon: Shield,
    color: 'text-aba-error-main',
    articleCount: 6,
    description: 'Data protection and audit logs',
  },
];

const popularArticles = [
  {
    id: '1',
    title: 'How to invite staff members',
    category: 'Staff Management',
    views: 1542,
  },
  {
    id: '2',
    title: 'Processing refunds for clients',
    category: 'Payments & Finance',
    views: 1328,
  },
  {
    id: '3',
    title: 'Setting up operating hours',
    category: 'Settings & Configuration',
    views: 1156,
  },
  {
    id: '4',
    title: 'Understanding audit logs',
    category: 'Security & Compliance',
    views: 892,
  },
];

export function HelpCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateTicket = () => {
    navigate('/create-ticket');
  };

  const handleViewTickets = () => {
    navigate('/tickets-list');
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Help Center"
        showBack
        onBackClick={() => navigate('/settings')}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aba-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-aba-neutral-300 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main text-sm"
            />
          </div>

          {/* Support Options */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCreateTicket}
              className="bg-aba-primary-main hover:bg-aba-primary-600 active:bg-aba-primary-700 text-white rounded-2xl p-4 flex flex-col items-center gap-2 transition-colors"
            >
              <MessageSquarePlus className="w-6 h-6" />
              <span className="text-sm font-semibold">Create Ticket</span>
            </button>
            <button
              onClick={handleViewTickets}
              className="bg-white hover:bg-aba-neutral-50 active:bg-aba-neutral-100 border border-aba-neutral-200 rounded-2xl p-4 flex flex-col items-center gap-2 transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-aba-neutral-900" />
              <span className="text-sm font-semibold text-aba-neutral-900">
                My Tickets
              </span>
            </button>
          </div>

          {/* Video Tutorials */}
          <div className="bg-[#3A8DFF] rounded-2xl p-4 text-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold mb-1">Video Tutorials</h3>
                <p className="text-sm text-white/90 mb-3">
                  Watch step-by-step guides for common tasks
                </p>
                <button className="px-4 py-2 bg-white text-aba-secondary-main rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors">
                  Watch Now
                </button>
              </div>
            </div>
          </div>

          {/* FAQ Categories */}
          <div>
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
              Browse by Category
            </h3>
            <ListCard>
              {faqCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <ListCardItem
                    key={category.id}
                    onClick={() => navigate(`/faq-category/${category.id}`)}
                  >
                    <div className="w-10 h-10 rounded-full bg-aba-neutral-100 flex items-center justify-center flex-shrink-0">
                      <IconComponent className={`w-5 h-5 ${category.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-aba-neutral-900">
                          {category.title}
                        </p>
                        <span className="px-2 py-0.5 bg-aba-neutral-100 text-aba-neutral-600 text-xs font-medium rounded-full">
                          {category.articleCount}
                        </span>
                      </div>
                      <p className="text-xs text-aba-neutral-600">
                        {category.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-aba-neutral-400 flex-shrink-0" />
                  </ListCardItem>
                );
              })}
            </ListCard>
          </div>

          {/* Popular Articles */}
          <div>
            <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
              Popular Articles
            </h3>
            <ListCard>
              {popularArticles.map((article) => (
                <ListCardItem
                  key={article.id}
                  onClick={() => navigate(`/help-article/${article.id}`)}
                >
                  <div className="w-10 h-10 rounded-full bg-aba-neutral-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-aba-neutral-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-aba-neutral-900 mb-0.5 truncate">
                      {article.title}
                    </p>
                    <p className="text-xs text-aba-neutral-600">
                      {article.category} • {article.views.toLocaleString()} views
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-aba-neutral-400 flex-shrink-0" />
                </ListCardItem>
              ))}
            </ListCard>
          </div>

          {/* Contact Support */}
          <div className="bg-aba-neutral-50 border border-aba-neutral-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-aba-neutral-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-aba-neutral-900 mb-1">
                  Still need help?
                </h3>
                <p className="text-xs text-aba-neutral-700 mb-3">
                  Our support team is available Monday-Friday, 8AM-6PM EAT
                </p>
                <div className="flex gap-2">
                  <a
                    href="mailto:support@abapartner.com"
                    className="text-xs font-medium text-aba-secondary-main hover:underline"
                  >
                    support@abapartner.com
                  </a>
                  <span className="text-aba-neutral-400">•</span>
                  <a
                    href="tel:+256700000000"
                    className="text-xs font-medium text-aba-secondary-main hover:underline"
                  >
                    +256 700 000 000
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}