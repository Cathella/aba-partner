import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABABadge } from '../components/aba/ABABadge';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import {
  Send,
  Paperclip,
  CheckCircle2,
  User,
  X,
  Star,
} from 'lucide-react';

type TicketStatus = 'open' | 'in-progress' | 'resolved';
type MessageSender = 'user' | 'support';

interface Message {
  id: string;
  sender: MessageSender;
  senderName: string;
  content: string;
  timestamp: string;
  attachments?: string[];
}

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: TicketStatus;
  priority: string;
  createdAt: string;
  messages: Message[];
}

const mockTickets: Record<string, Ticket> = {
  '1': {
    id: '1',
    ticketNumber: 'TKT-001234',
    subject: 'Unable to process refund',
    category: 'Billing & Payments',
    status: 'open',
    priority: 'High',
    createdAt: '2026-02-11T09:30:00',
    messages: [
      {
        id: 'm1',
        sender: 'user',
        senderName: 'Dr. Sarah Chen',
        content:
          "I'm trying to process a refund for transaction TXN-2026-001234, but the system shows an error: 'Refund not available'. The payment was completed yesterday and the client is requesting a full refund due to service cancellation.",
        timestamp: '2026-02-11T09:30:00',
      },
      {
        id: 'm2',
        sender: 'support',
        senderName: 'James - Support Team',
        content:
          "Hi Dr. Chen, thank you for reaching out. I've reviewed the transaction and I can see the issue. The refund window for this transaction type requires admin approval. I've escalated this to our finance team and they'll process it within 2 hours. You'll receive a confirmation email once completed.",
        timestamp: '2026-02-11T11:45:00',
      },
      {
        id: 'm3',
        sender: 'user',
        senderName: 'Dr. Sarah Chen',
        content:
          'Thank you for the quick response! Is there a way to avoid this delay in the future? We sometimes need to process urgent refunds.',
        timestamp: '2026-02-11T14:20:00',
      },
    ],
  },
  '2': {
    id: '2',
    ticketNumber: 'TKT-001198',
    subject: 'Staff member cannot access dashboard',
    category: 'Account Access',
    status: 'in-progress',
    priority: 'Medium',
    createdAt: '2026-02-10T14:15:00',
    messages: [
      {
        id: 'm1',
        sender: 'user',
        senderName: 'Dr. Sarah Chen',
        content:
          'One of our therapists, Dr. Emily Martinez (emily.m@clinic.com), is unable to log into the dashboard. She gets an "Invalid credentials" error even after resetting her password.',
        timestamp: '2026-02-10T14:15:00',
      },
      {
        id: 'm2',
        sender: 'support',
        senderName: 'Maria - Support Team',
        content:
          "Hi Dr. Chen, I've checked Dr. Martinez's account. It appears her account was temporarily locked due to multiple failed login attempts. I've unlocked it and sent her a password reset link. Please ask her to check her email and try again.",
        timestamp: '2026-02-10T15:30:00',
      },
      {
        id: 'm3',
        sender: 'support',
        senderName: 'Maria - Support Team',
        content:
          'Just following up - has Dr. Martinez been able to access her account successfully?',
        timestamp: '2026-02-11T10:30:00',
      },
    ],
  },
};

const statusConfig: Record<
  TicketStatus,
  { label: string; variant: 'success' | 'info' | 'warning' }
> = {
  open: { label: 'Open', variant: 'info' },
  'in-progress': { label: 'In Progress', variant: 'warning' },
  resolved: { label: 'Resolved', variant: 'success' },
};

export function TicketDetail() {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [replyMessage, setReplyMessage] = useState('');
  const [showCloseModal, setShowCloseModal] = useState(false);

  const ticket = ticketId ? mockTickets[ticketId] : null;

  if (!ticket) {
    return (
      <div className="flex flex-col h-screen bg-aba-bg-primary">
        <AppTopBar
          title="Ticket Detail"
          showBack
          onBackClick={() => navigate('/tickets-list')}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-aba-neutral-600">Ticket not found</p>
        </div>
      </div>
    );
  }

  const handleSendReply = () => {
    if (!replyMessage.trim()) {
      showToast('Please enter a message', 'error');
      return;
    }

    showToast('Reply sent successfully', 'success');
    setReplyMessage('');
  };

  const handleCloseTicket = () => {
    setShowCloseModal(true);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title={ticket.ticketNumber}
        showBack
        onBackClick={() => navigate('/tickets-list')}
      />

      {/* Ticket Header */}
      <div className="bg-white border-b border-aba-neutral-200 p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-base font-semibold text-aba-neutral-900 mb-1">
              {ticket.subject}
            </h2>
            <p className="text-sm text-aba-neutral-600">
              {ticket.category} • {ticket.priority} Priority
            </p>
          </div>
          <ABABadge variant={statusConfig[ticket.status].variant} size="md">
            {statusConfig[ticket.status].label}
          </ABABadge>
        </div>

        {ticket.status !== 'resolved' && (
          <ABAButton
            variant="outline"
            size="sm"
            fullWidth
            onClick={handleCloseTicket}
          >
            <CheckCircle2 className="w-4 h-4" />
            Close Ticket
          </ABAButton>
        )}
      </div>

      {/* Messages Timeline */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 pb-24">
          {/* Group messages by date */}
          {ticket.messages.map((message, index) => {
            const showDateDivider =
              index === 0 ||
              formatDate(message.timestamp) !==
                formatDate(ticket.messages[index - 1].timestamp);

            return (
              <div key={message.id}>
                {showDateDivider && (
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-aba-neutral-200"></div>
                    <span className="text-xs font-medium text-aba-neutral-500">
                      {formatDate(message.timestamp)}
                    </span>
                    <div className="flex-1 h-px bg-aba-neutral-200"></div>
                  </div>
                )}

                <div
                  className={`flex gap-3 ${
                    message.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user'
                        ? 'bg-aba-primary-100'
                        : 'bg-aba-secondary-100'
                    }`}
                  >
                    <User
                      className={`w-4 h-4 ${
                        message.sender === 'user'
                          ? 'text-aba-primary-main'
                          : 'text-aba-secondary-main'
                      }`}
                    />
                  </div>

                  {/* Message Content */}
                  <div
                    className={`flex-1 ${
                      message.sender === 'user' ? 'items-end' : 'items-start'
                    } flex flex-col`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p
                        className={`text-xs font-semibold ${
                          message.sender === 'user'
                            ? 'text-aba-primary-main'
                            : 'text-aba-secondary-main'
                        }`}
                      >
                        {message.senderName}
                      </p>
                      <p className="text-xs text-aba-neutral-500">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                        message.sender === 'user'
                          ? 'bg-aba-primary-50 border border-aba-primary-200'
                          : 'bg-white border border-aba-neutral-200'
                      }`}
                    >
                      <p className="text-sm text-aba-neutral-900 whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reply Box - Only show if ticket is not resolved */}
      {ticket.status !== 'resolved' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-aba-neutral-200 p-4">
          <div className="max-w-[390px] mx-auto">
            <div className="flex items-end gap-2">
              <button className="p-3 rounded-xl border border-aba-neutral-300 hover:bg-aba-neutral-50 active:bg-aba-neutral-100 transition-colors flex-shrink-0">
                <Paperclip className="w-5 h-5 text-aba-neutral-600" />
              </button>
              <div className="flex-1">
                <textarea
                  placeholder="Type your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={1}
                  className="w-full px-4 py-3 rounded-md border border-aba-neutral-300 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main text-sm resize-none"
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
              </div>
              <button
                onClick={handleSendReply}
                disabled={!replyMessage.trim()}
                className="p-3 rounded-xl bg-aba-primary-main hover:bg-aba-primary-600 active:bg-aba-primary-700 disabled:bg-aba-neutral-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Ticket Modal */}
      {showCloseModal && (
        <CloseTicketModal
          ticketNumber={ticket.ticketNumber}
          onClose={() => setShowCloseModal(false)}
          onConfirm={() => {
            setShowCloseModal(false);
            navigate('/tickets-list');
          }}
        />
      )}
    </div>
  );
}

function CloseTicketModal({
  ticketNumber,
  onClose,
  onConfirm,
}: {
  ticketNumber: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      showToast('Please rate your support experience', 'error');
      return;
    }

    showToast('Ticket closed successfully. Thank you for your feedback!', 'success');
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md mx-auto p-6 space-y-4 animate-slide-up max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-aba-neutral-900">
            Close Ticket
          </h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-aba-neutral-100 active:bg-aba-neutral-200 transition-colors"
          >
            <X className="w-5 h-5 text-aba-neutral-600" />
          </button>
        </div>

        <div className="bg-aba-neutral-50 border border-aba-neutral-200 rounded-xl p-4">
          <p className="text-sm text-aba-neutral-700">
            You are about to close ticket{' '}
            <strong className="text-aba-neutral-900">{ticketNumber}</strong>.
            Please rate your support experience.
          </p>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-aba-neutral-900 mb-3 text-center">
            How satisfied are you with the support?
          </label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= rating
                      ? 'fill-aba-warning-main text-aba-warning-main'
                      : 'text-aba-neutral-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm font-medium text-aba-neutral-700 mt-2">
              {rating === 5 && 'Excellent!'}
              {rating === 4 && 'Very Good'}
              {rating === 3 && 'Good'}
              {rating === 2 && 'Fair'}
              {rating === 1 && 'Poor'}
            </p>
          )}
        </div>

        {/* Feedback */}
        <div>
          <label className="block text-sm font-semibold text-aba-neutral-900 mb-2">
            Additional Feedback (Optional)
          </label>
          <textarea
            placeholder="Tell us about your experience..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 rounded-md border border-aba-neutral-300 focus:outline-none focus:ring-2 focus:ring-aba-secondary-main text-sm resize-none"
          />
          <p className="text-xs text-aba-neutral-600 mt-1">
            {feedback.length}/500 characters
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <ABAButton variant="outline" size="md" onClick={onClose}>
            Cancel
          </ABAButton>
          <ABAButton
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={rating === 0}
          >
            Close Ticket
          </ABAButton>
        </div>
      </div>
    </div>
  );
}