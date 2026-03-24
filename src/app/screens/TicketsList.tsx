import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABABadge } from '../components/aba/ABABadge';
import { ABAButton } from '../components/aba/ABAButton';
import { ListCard, ListCardItem } from '../components/aba/Cards';
import {
  MessageSquarePlus,
  ChevronRight,
  MessageCircle,
  Clock,
} from 'lucide-react';

type TicketStatus = 'open' | 'in-progress' | 'resolved';
type TicketPriority = 'low' | 'medium' | 'high';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  unreadMessages: number;
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    ticketNumber: 'TKT-001234',
    subject: 'Unable to process refund',
    category: 'Billing & Payments',
    status: 'open',
    priority: 'high',
    createdAt: '2026-02-11T09:30:00',
    updatedAt: '2026-02-11T14:20:00',
    unreadMessages: 2,
  },
  {
    id: '2',
    ticketNumber: 'TKT-001198',
    subject: 'Staff member cannot access dashboard',
    category: 'Account Access',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2026-02-10T14:15:00',
    updatedAt: '2026-02-11T10:30:00',
    unreadMessages: 1,
  },
  {
    id: '3',
    ticketNumber: 'TKT-001156',
    subject: 'Export report feature not working',
    category: 'Technical Issue',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2026-02-09T16:45:00',
    updatedAt: '2026-02-10T11:00:00',
    unreadMessages: 0,
  },
  {
    id: '4',
    ticketNumber: 'TKT-001089',
    subject: 'Request for bulk booking import',
    category: 'Feature Request',
    status: 'resolved',
    priority: 'low',
    createdAt: '2026-02-08T11:20:00',
    updatedAt: '2026-02-09T15:30:00',
    unreadMessages: 0,
  },
  {
    id: '5',
    ticketNumber: 'TKT-001045',
    subject: 'How to set up automated reminders',
    category: 'Bookings & Scheduling',
    status: 'resolved',
    priority: 'low',
    createdAt: '2026-02-07T10:00:00',
    updatedAt: '2026-02-08T09:15:00',
    unreadMessages: 0,
  },
];

const statusConfig: Record<
  TicketStatus,
  { label: string; variant: 'success' | 'info' | 'warning' | 'default' }
> = {
  open: { label: 'Open', variant: 'info' },
  'in-progress': { label: 'In Progress', variant: 'warning' },
  resolved: { label: 'Resolved', variant: 'success' },
};

const priorityConfig: Record<TicketPriority, { color: string }> = {
  low: { color: 'text-aba-neutral-600' },
  medium: { color: 'text-aba-warning-main' },
  high: { color: 'text-aba-error-main' },
};

export function TicketsList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');

  const filteredTickets = mockTickets.filter((ticket) => {
    if (statusFilter === 'all') return true;
    return ticket.status === statusFilter;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const openCount = mockTickets.filter((t) => t.status === 'open').length;
  const inProgressCount = mockTickets.filter((t) => t.status === 'in-progress')
    .length;
  const resolvedCount = mockTickets.filter((t) => t.status === 'resolved').length;

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Support Tickets"
        showBack
        onBackClick={() => navigate('/help-center')}
      />

      {/* Filter Tabs */}
      <div className="bg-white border-b border-aba-neutral-200 p-4">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-aba-neutral-900 text-white'
                : 'bg-aba-neutral-100 text-aba-neutral-700 hover:bg-aba-neutral-200'
            }`}
          >
            All ({mockTickets.length})
          </button>
          <button
            onClick={() => setStatusFilter('open')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'open'
                ? 'bg-aba-neutral-900 text-white'
                : 'bg-aba-neutral-100 text-aba-neutral-700 hover:bg-aba-neutral-200'
            }`}
          >
            Open ({openCount})
          </button>
          <button
            onClick={() => setStatusFilter('in-progress')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'in-progress'
                ? 'bg-aba-neutral-900 text-white'
                : 'bg-aba-neutral-100 text-aba-neutral-700 hover:bg-aba-neutral-200'
            }`}
          >
            Active ({inProgressCount})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'resolved'
                ? 'bg-aba-neutral-900 text-white'
                : 'bg-aba-neutral-100 text-aba-neutral-700 hover:bg-aba-neutral-200'
            }`}
          >
            Done ({resolvedCount})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-4">
          {/* Tickets List */}
          {filteredTickets.length > 0 ? (
            <ListCard>
              {filteredTickets.map((ticket) => (
                <ListCardItem
                  key={ticket.id}
                  onClick={() => navigate(`/ticket-detail/${ticket.id}`)}
                >
                  <div className="w-10 h-10 rounded-full bg-aba-neutral-100 flex items-center justify-center flex-shrink-0 relative">
                    <MessageCircle className="w-5 h-5 text-aba-neutral-700" />
                    {ticket.unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-aba-error-main text-white text-xs rounded-full flex items-center justify-center font-semibold">
                        {ticket.unreadMessages}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-semibold text-aba-neutral-600">
                        {ticket.ticketNumber}
                      </p>
                      <ABABadge
                        variant={statusConfig[ticket.status].variant}
                        size="sm"
                      >
                        {statusConfig[ticket.status].label}
                      </ABABadge>
                    </div>
                    <p className="text-sm font-semibold text-aba-neutral-900 mb-0.5 truncate">
                      {ticket.subject}
                    </p>
                    <p className="text-xs text-aba-neutral-600">
                      {ticket.category} •{' '}
                      <span className={priorityConfig[ticket.priority].color}>
                        {ticket.priority.charAt(0).toUpperCase() +
                          ticket.priority.slice(1)}{' '}
                        Priority
                      </span>
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-aba-neutral-500" />
                      <p className="text-xs text-aba-neutral-500 text-[#8f9aa1]">
                        Updated {formatTimestamp(ticket.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-aba-neutral-400 flex-shrink-0" />
                </ListCardItem>
              ))}
            </ListCard>
          ) : (
            <div className="bg-white rounded-2xl border border-aba-neutral-200 p-8 text-center">
              <MessageCircle className="w-16 h-16 text-aba-neutral-400 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-aba-neutral-900 mb-1">
                No Tickets Found
              </h3>
              <p className="text-sm text-aba-neutral-600 mb-4">
                {statusFilter === 'all'
                  ? "You haven't created any support tickets yet"
                  : `No ${statusFilter.replace('-', ' ')} tickets`}
              </p>
              {statusFilter === 'all' && (
                <ABAButton
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/create-ticket')}
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  Create Your First Ticket
                </ABAButton>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Create Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E8EC] p-4 shadow-lg">
        <ABAButton
          variant="primary"
          size="md"
          fullWidth
          onClick={() => navigate('/create-ticket')}
        >
          <MessageSquarePlus className="w-5 h-5" />
          Create New Ticket
        </ABAButton>
      </div>
    </div>
  );
}