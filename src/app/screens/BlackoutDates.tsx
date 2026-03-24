import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { ABABadge } from '../components/aba/ABABadge';
import { ListCard, ListCardItem } from '../components/aba/Cards';
import { ABAModal } from '../components/aba/ABAModal';
import { showToast } from '../components/aba/Toast';
import {
  Plus,
  Calendar,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface BlackoutDate {
  id: string;
  date: string;
  reason: string;
  isPast: boolean;
}

const mockBlackoutDates: BlackoutDate[] = [
  {
    id: '1',
    date: '2026-03-15',
    reason: 'Staff Training Day',
    isPast: false,
  },
  {
    id: '2',
    date: '2026-04-10',
    reason: 'Public Holiday - Easter Monday',
    isPast: false,
  },
  {
    id: '3',
    date: '2026-06-09',
    reason: 'Heroes Day',
    isPast: false,
  },
  {
    id: '4',
    date: '2026-02-01',
    reason: 'Facility Maintenance',
    isPast: true,
  },
];

export function BlackoutDates() {
  const navigate = useNavigate();
  const [blackoutDates, setBlackoutDates] = useState(mockBlackoutDates);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<BlackoutDate | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = () => {
    if (selectedDate) {
      setBlackoutDates(blackoutDates.filter((d) => d.id !== selectedDate.id));
      showToast('Blackout date removed', 'success');
      setShowDeleteModal(false);
      setSelectedDate(null);
    }
  };

  const upcomingDates = blackoutDates.filter((d) => !d.isPast);
  const pastDates = blackoutDates.filter((d) => d.isPast);

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Blackout Dates"
        showBack
        onBackClick={() => navigate('/operating-hours')}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Info Box */}
          <div className="bg-aba-secondary-50 border border-aba-secondary-200 rounded-xl p-4">
            <p className="text-aba-neutral-700 text-[14px]">
              <span className="font-medium">Note:</span> Blackout dates prevent
              new bookings. Existing bookings on these dates will need to be
              manually rescheduled.
            </p>
          </div>

          {/* Upcoming Blackout Dates */}
          {upcomingDates.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-aba-neutral-900">
                  Upcoming Blackout Dates
                </h3>
                <ABABadge variant="warning" size="sm">
                  {upcomingDates.length}
                </ABABadge>
              </div>
              <ListCard>
                {upcomingDates.map((blackoutDate) => (
                  <ListCardItem
                    key={blackoutDate.id}
                    onClick={() => {}}
                  >
                    <div className="w-10 h-10 rounded-full bg-aba-warning-50 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-aba-warning-main" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-aba-neutral-900">
                        {formatDate(blackoutDate.date)}
                      </p>
                      <p className="text-xs text-aba-neutral-600">
                        {blackoutDate.reason}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(blackoutDate);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded-lg hover:bg-aba-error-50 text-aba-error-main transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </ListCardItem>
                ))}
              </ListCard>
            </div>
          )}

          {/* Past Blackout Dates */}
          {pastDates.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-aba-neutral-900 mb-3">
                Past Blackout Dates
              </h3>
              <ListCard>
                {pastDates.map((blackoutDate) => (
                  <ListCardItem
                    key={blackoutDate.id}
                    onClick={() => {}}
                  >
                    <div className="w-10 h-10 rounded-full bg-aba-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-aba-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-aba-neutral-600">
                        {formatDate(blackoutDate.date)}
                      </p>
                      <p className="text-xs text-aba-neutral-500 text-[#8f9aa1]">
                        {blackoutDate.reason}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(blackoutDate);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded-lg hover:bg-aba-error-50 text-aba-neutral-400 hover:text-aba-error-main transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </ListCardItem>
                ))}
              </ListCard>
            </div>
          )}

          {/* Empty State */}
          {upcomingDates.length === 0 && pastDates.length === 0 && (
            <div className="bg-white rounded-2xl border border-aba-neutral-200 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-aba-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-aba-neutral-400" />
              </div>
              <h3 className="text-base font-semibold text-aba-neutral-900 mb-1">
                No Blackout Dates
              </h3>
              <p className="text-sm text-aba-neutral-600 mb-4">
                Add dates when the clinic will be closed
              </p>
              <ABAButton
                variant="primary"
                size="md"
                onClick={() => navigate('/add-blackout-date')}
              >
                <Plus className="w-5 h-5" />
                Add Blackout Date
              </ABAButton>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Add Button */}
      <div className="p-4 border-t border-aba-neutral-200 bg-white">
        <ABAButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/add-blackout-date')}
        >
          <Plus className="w-5 h-5" />
          Add Blackout Date
        </ABAButton>
      </div>

      {/* Delete Confirmation Modal */}
      <ABAModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedDate(null);
        }}
        title="Remove Blackout Date"
      >
        <div className="space-y-4">
          <div className="bg-aba-warning-50 border border-aba-warning-200 rounded-xl p-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-aba-warning-main mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-aba-neutral-900">
                You are about to remove the blackout date for{' '}
                <span className="font-medium">
                  {selectedDate && formatDate(selectedDate.date)}
                </span>
                .
              </p>
              <p className="text-xs text-aba-neutral-700 mt-1">
                This will allow new bookings on this date.
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <ABAButton
              variant="outline"
              fullWidth
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedDate(null);
              }}
            >
              Cancel
            </ABAButton>
            <ABAButton
              variant="destructive"
              fullWidth
              onClick={handleDelete}
            >
              Remove Date
            </ABAButton>
          </div>
        </div>
      </ABAModal>
    </div>
  );
}