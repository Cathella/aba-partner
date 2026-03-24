import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { ABABadge } from '../components/aba/ABABadge';
import { ListCard, ListCardItem } from '../components/aba/Cards';
import { showToast } from '../components/aba/Toast';
import { ChevronLeft, UserCheck, CheckCircle } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  role: string;
  specialization: string;
  available: boolean;
}

const mockStaff: Staff[] = [
  {
    id: '1',
    name: 'Dr. Emily Chen',
    role: 'Therapist',
    specialization: 'Speech Therapy',
    available: true,
  },
  {
    id: '2',
    name: 'Dr. James Wilson',
    role: 'Therapist',
    specialization: 'Occupational Therapy',
    available: true,
  },
  {
    id: '3',
    name: 'Dr. Sarah Martinez',
    role: 'Therapist',
    specialization: 'Behavioral Therapy',
    available: false,
  },
  {
    id: '4',
    name: 'Dr. Michael Chen',
    role: 'Therapist',
    specialization: 'Speech Therapy',
    available: true,
  },
  {
    id: '5',
    name: 'Dr. Lisa Anderson',
    role: 'Therapist',
    specialization: 'Physical Therapy',
    available: true,
  },
];

const mockBookings: Record<
  string,
  { patientName: string; assignedStaffId: string; service: string; time: string }
> = {
  '1': {
    patientName: 'Sarah Johnson',
    assignedStaffId: '1',
    service: 'Speech Therapy',
    time: '09:00 AM',
  },
  '2': {
    patientName: 'Michael Smith',
    assignedStaffId: '2',
    service: 'Occupational Therapy',
    time: '10:30 AM',
  },
  '3': {
    patientName: 'Emma Davis',
    assignedStaffId: '3',
    service: 'Behavioral Assessment',
    time: '11:00 AM',
  },
};

export function ReassignStaff() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const booking = bookingId ? mockBookings[bookingId] : null;

  if (!booking) {
    return (
      <div className="flex flex-col h-screen bg-aba-bg-primary">
        <AppTopBar
          title="Reassign Staff"
          showBack
          onBackClick={() => navigate(-1)}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-aba-neutral-600">Booking not found</p>
        </div>
      </div>
    );
  }

  const currentStaffId = booking.assignedStaffId;
  const availableStaff = mockStaff.filter((staff) => staff.id !== currentStaffId);

  const handleConfirmReassignment = () => {
    if (selectedStaffId) {
      const selectedStaff = mockStaff.find((s) => s.id === selectedStaffId);
      showToast(
        `Booking reassigned to ${selectedStaff?.name}`,
        'success'
      );
      setTimeout(() => {
        navigate('/bookings-list');
      }, 500);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-aba-bg-primary">
      {/* Top Bar */}
      <AppTopBar
        title="Reassign Staff"
        showBack
        onBackClick={() => navigate(-1)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-aba-secondary-50 flex items-center justify-center">
              <UserCheck className="w-8 h-8 text-aba-secondary-main" />
            </div>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-aba-neutral-900 mb-1">
              Reassign Staff Member
            </h2>
            <p className="text-sm text-aba-neutral-600">
              {booking.patientName} • {booking.service}
            </p>
            <p className="text-xs text-aba-neutral-500">{booking.time}</p>
          </div>

          {/* Current Assignment */}
          <div className="bg-aba-neutral-50 border border-aba-neutral-200 rounded-xl p-4">
            <p className="text-xs font-medium text-aba-neutral-600 mb-2">
              Currently Assigned
            </p>
            <p className="text-sm font-semibold text-aba-neutral-900">
              {mockStaff.find((s) => s.id === currentStaffId)?.name}
            </p>
          </div>

          {/* Staff Selection */}
          <div>
            <h3 className="text-sm font-semibold text-aba-neutral-900 mb-3">
              Select New Staff Member
            </h3>
            <ListCard>
              {availableStaff.map((staff) => (
                <ListCardItem
                  key={staff.id}
                  onClick={() =>
                    staff.available ? setSelectedStaffId(staff.id) : null
                  }
                  className={!staff.available ? 'opacity-50' : ''}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-aba-neutral-900">
                        {staff.name}
                      </p>
                      {!staff.available && (
                        <ABABadge variant="error" size="sm">
                          Unavailable
                        </ABABadge>
                      )}
                    </div>
                    <p className="text-xs text-aba-neutral-600">{staff.role}</p>
                    <p className="text-xs text-aba-neutral-500">
                      {staff.specialization}
                    </p>
                  </div>
                  {selectedStaffId === staff.id && (
                    <CheckCircle className="w-5 h-5 text-aba-primary-main flex-shrink-0" />
                  )}
                  {!staff.available && (
                    <div className="w-5 h-5 flex-shrink-0" />
                  )}
                </ListCardItem>
              ))}
            </ListCard>
          </div>

          {/* Info Box */}
          <div className="bg-aba-secondary-50 border border-aba-secondary-200 rounded-xl p-4">
            <p className="text-xs text-aba-neutral-700">
              <span className="font-medium">Note:</span> Staff members marked as
              unavailable have conflicting bookings at this time or are not
              scheduled to work.
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Confirm Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-aba-bg-primary border-t border-aba-neutral-200">
        <ABAButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleConfirmReassignment}
          disabled={!selectedStaffId}
        >
          <UserCheck className="w-5 h-5" />
          Confirm Reassignment
        </ABAButton>
      </div>
    </div>
  );
}