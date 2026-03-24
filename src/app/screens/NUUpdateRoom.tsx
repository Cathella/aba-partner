/**
 * NU-08 Update Room Status — Radio options + optional note + save.
 *
 * Radio options: Available, Occupied, Cleaning
 * Save → toast → back to NU-07.
 * Inner page: back arrow, no bottom nav.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import { showToast } from '../components/aba/Toast';
import { useNurseStore, updateRoomStatus } from '../data/nurseStore';
import type { NURoomStatus } from '../data/nurseStore';
import {
  DoorOpen,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';

interface StatusOption {
  value: NURoomStatus;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
}

const statusOptions: StatusOption[] = [
  {
    value: 'available',
    label: 'Available',
    subtitle: 'Room is clean and ready for use',
    icon: <CheckCircle2 className="w-5 h-5 text-[#38C172]" />,
    iconBg: 'bg-[#E9F8F0]',
  },
  {
    value: 'occupied',
    label: 'Occupied',
    subtitle: 'Room is currently in use',
    icon: <XCircle className="w-5 h-5 text-[#E44F4F]" />,
    iconBg: 'bg-[#FDECEC]',
  },
  {
    value: 'cleaning',
    label: 'Cleaning',
    subtitle: 'Room is being cleaned or prepared',
    icon: <Sparkles className="w-5 h-5 text-[#D97706]" />,
    iconBg: 'bg-[#FFF3DC]',
  },
];

export function NUUpdateRoom() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { getRoomById } = useNurseStore();

  const room = getRoomById(roomId || '');

  const [selectedStatus, setSelectedStatus] = useState<NURoomStatus>(room?.status || 'available');
  const [note, setNote] = useState(room?.note || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!room) {
    return (
      <div className="flex flex-col h-screen bg-[#F7F9FC]">
        <AppTopBar title="Update Room" showBack onBackClick={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#8F9AA1]">Room not found</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateRoomStatus(room.id, selectedStatus, note.trim() || undefined);
      showToast(`${room.name} updated to ${selectedStatus}`, 'success');
      navigate(-1);
    }, 400);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Update Room Status" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-4 space-y-3">

          {/* Room header */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
              <DoorOpen className="w-6 h-6 text-[#3A8DFF]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-[#1A1A1A]">{room.name}</p>
              <p className="text-xs text-[#8F9AA1]">
                Current: <span className="font-semibold capitalize">{room.status}</span>
                {room.lastUpdated ? ` · Updated ${room.lastUpdated}` : ''}
              </p>
            </div>
          </div>

          {/* Status options */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC]">
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                New Status
              </h3>
            </div>
            {statusOptions.map((opt) => {
              const isSelected = selectedStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelectedStatus(opt.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E8EC] last:border-b-0 transition-colors text-left ${
                    isSelected ? 'bg-[#E9F8F0]' : 'hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60'
                  }`}
                >
                  {/* Radio */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'border-[#32C28A] bg-[#32C28A]'
                        : 'border-[#C9D0DB] bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  <div className={`w-10 h-10 rounded-xl ${opt.iconBg} flex items-center justify-center flex-shrink-0`}>
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A]">{opt.label}</p>
                    <p className="text-xs text-[#8F9AA1]">{opt.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Optional note */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <p className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-2">
              Note (Optional)
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about the room status…"
              rows={3}
              className="w-full rounded-lg border border-[#E5E8EC] bg-[#F7F9FC] p-3 text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Sticky save */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="p-4">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleSave}
            isLoading={isSaving}
          >
            Save Room Status
          </ABAButton>
        </div>
      </div>
    </div>
  );
}