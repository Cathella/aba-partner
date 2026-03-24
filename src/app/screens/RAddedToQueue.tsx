/**
 * R-16 Added to Queue — Success screen with ticket card.
 * Ticket: number, department, estimated wait, member name, service.
 * CTA: View Queue → /r/queue
 */
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { useWalkInStore, resetWalkInFlow } from '../data/walkInStore';
import {
  CheckCircle,
  Ticket,
  Clock,
  User,
  Stethoscope,
  Building2,
  ListOrdered,
  Plus,
} from 'lucide-react';

export function RAddedToQueue() {
  const navigate = useNavigate();
  const { state } = useWalkInStore();

  const ticket = state.ticket;
  const member = state.member;

  if (!ticket || !member) {
    return (
      <div className="flex flex-col h-screen bg-aba-neutral-100">
        <AppTopBar title="Queue Ticket" showBack onBackClick={() => navigate('/r/walk-in')} />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-sm text-aba-neutral-600 mb-4">No ticket data found.</p>
          </div>
        </div>
        <div className="flex-shrink-0 border-t border-aba-neutral-200 bg-aba-neutral-0 px-4 py-3">
          <ABAButton variant="primary" size="md" fullWidth onClick={() => navigate('/r/walk-in')}>
            Start Over
          </ABAButton>
        </div>
      </div>
    );
  }

  const handleViewQueue = () => {
    resetWalkInFlow();
    navigate('/r/queue');
  };

  const handleAddAnother = () => {
    resetWalkInFlow();
    navigate('/r/walk-in');
  };

  return (
    <div className="flex flex-col h-screen bg-aba-neutral-100">
      <AppTopBar title="Added to Queue" />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-5">

          {/* ── Success header ── */}
          <div className="text-center pt-4 pb-2">
            <div className="w-20 h-20 rounded-full bg-aba-success-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-aba-success-main" />
            </div>
            <h2 className="text-xl font-semibold text-aba-neutral-900 mb-1">
              Added to Queue!
            </h2>
            <p className="text-sm text-aba-neutral-600">
              {member.name} has been added to the {ticket.department} queue.
            </p>
          </div>

          {/* ── Ticket card ── */}
          <div className="bg-aba-neutral-0 rounded-2xl border-2 border-aba-primary-main overflow-hidden">
            {/* Ticket header */}
            <div className="bg-aba-primary-main px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-aba-neutral-900" />
                <span className="text-sm font-semibold text-aba-neutral-900">Queue Ticket</span>
              </div>
              <span className="text-xs text-aba-neutral-900/70">{ticket.time}</span>
            </div>

            {/* Ticket number — large */}
            <div className="text-center py-6 border-b border-dashed border-aba-neutral-300">
              <p className="text-xs text-aba-neutral-600 uppercase tracking-widest mb-1">
                Ticket Number
              </p>
              <p className="text-4xl font-bold text-aba-neutral-900 tracking-wide">
                {ticket.ticketNumber}
              </p>
            </div>

            {/* Ticket details */}
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-aba-neutral-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-aba-neutral-600">Patient</p>
                  <p className="text-sm font-medium text-aba-neutral-900">{ticket.memberName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-aba-neutral-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-aba-neutral-600">Department</p>
                  <p className="text-sm font-medium text-aba-neutral-900">{ticket.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Stethoscope className="w-4 h-4 text-aba-neutral-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-aba-neutral-600">Service</p>
                  <p className="text-sm font-medium text-aba-neutral-900">{ticket.service}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-aba-neutral-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-aba-neutral-600">Estimated Wait</p>
                  <p className="text-sm font-semibold text-aba-primary-main">{ticket.estimatedWait}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Fixed bottom CTAs ── */}
      <div className="flex-shrink-0 border-t border-aba-neutral-200 bg-aba-neutral-0 px-4 py-3 flex flex-col gap-2">
        <ABAButton variant="primary" size="lg" fullWidth onClick={handleViewQueue}>
          <ListOrdered className="w-5 h-5" />
          View Queue
        </ABAButton>

        <ABAButton variant="outline" size="lg" fullWidth onClick={handleAddAnother}>
          <Plus className="w-5 h-5" />
          Add Another Walk-in
        </ABAButton>

        <button
          onClick={() => { resetWalkInFlow(); navigate('/r/today'); }}
          className="w-full py-2 text-sm font-medium text-aba-neutral-600 hover:underline"
        >
          Back to Today
        </button>
      </div>
    </div>
  );
}