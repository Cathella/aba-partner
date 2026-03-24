/**
 * NU-07 Rooms & Stations — List of rooms with status chips.
 *
 * Each row: room name, status chip (Available / Occupied / Cleaning).
 * Tap row → NU-08 Update Room Status.
 * Bottom nav present.
 */
import { useNavigate } from 'react-router';
import { NurseBottomNav } from '../components/aba/NurseBottomNav';
import { useNurseStore } from '../data/nurseStore';
import type { NURoomStatus } from '../data/nurseStore';
import {
  DoorOpen,
  ChevronRight,
  Clock,
} from 'lucide-react';

const roomStatusMeta: Record<NURoomStatus, { label: string; dot: string; bg: string; text: string }> = {
  available: {
    label: 'Available',
    dot: 'bg-[#38C172]',
    bg: 'bg-[#E9F8F0]',
    text: 'text-[#38C172]',
  },
  occupied: {
    label: 'Occupied',
    dot: 'bg-[#E44F4F]',
    bg: 'bg-[#FDECEC]',
    text: 'text-[#E44F4F]',
  },
  cleaning: {
    label: 'Cleaning',
    dot: 'bg-[#FFB649]',
    bg: 'bg-[#FFF3DC]',
    text: 'text-[#D97706]',
  },
};

export function NURooms() {
  const navigate = useNavigate();
  const { rooms } = useNurseStore();

  const available = rooms.filter((r) => r.status === 'available').length;
  const occupied = rooms.filter((r) => r.status === 'occupied').length;

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      {/* Top bar */}
      <div className="bg-[#FFFFFF] border-b border-[#E5E8EC] px-4 h-14 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Rooms & Stations</h1>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#38C172] bg-[#E9F8F0] px-2 py-0.5 rounded-full text-[12px]">
            {available} free
          </span>
          <span className="font-semibold text-[#E44F4F] bg-[#FDECEC] px-2 py-0.5 rounded-full text-[12px]">
            {occupied} in use
          </span>
        </div>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            {rooms.map((room) => {
              const meta = roomStatusMeta[room.status];
              return (
                <button
                  key={room.id}
                  onClick={() => navigate(`/nu/room/${room.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-4 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
                >
                  {/* Room icon */}
                  <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                    <DoorOpen className={`w-5 h-5 ${meta.text}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A]">{room.name}</p>
                    {room.note && (
                      <p className="text-xs text-[#8F9AA1] truncate mt-0.5">{room.note}</p>
                    )}
                    {room.lastUpdated && (
                      <span className="flex items-center gap-1 mt-1 text-[12px] text-[#8f9aa1]">
                        <Clock className="w-3 h-3" />
                        Updated {room.lastUpdated}
                      </span>
                    )}
                  </div>

                  {/* Status chip */}
                  <span
                    className={`inline-flex items-center gap-1.5 font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text} flex-shrink-0 text-[12px]`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>

                  <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <NurseBottomNav />
    </div>
  );
}
