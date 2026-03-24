/**
 * NU Today Summary — Daily stats overview for the Nurse role.
 *
 * Cards: Waiting for Triage, Ready for Clinician, In Station, Total.
 * Room status overview.
 * Inner page: back arrow, no bottom nav.
 */
import { useNavigate } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { KPICard } from '../components/aba/Cards';
import { useNurseStore } from '../data/nurseStore';
import type { NURoomStatus } from '../data/nurseStore';
import {
  Clock,
  CheckCircle2,
  Users,
  DoorOpen,
} from 'lucide-react';

const roomStatusColors: Record<NURoomStatus, { dot: string; label: string }> = {
  available: { dot: 'bg-[#38C172]', label: 'Available' },
  occupied: { dot: 'bg-[#E44F4F]', label: 'Occupied' },
  cleaning: { dot: 'bg-[#FFB649]', label: 'Cleaning' },
};

export function NUTodaySummary() {
  const navigate = useNavigate();
  const { stats, rooms } = useNurseStore();

  const dateStr = new Date().toLocaleDateString('en-UG', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const statCards: { label: string; value: string | number; icon: React.ReactNode; variant: 'default' | 'success' | 'warning' | 'error' | 'dark' }[] = [
    {
      label: 'Waiting for Triage',
      value: stats.waitingTriage,
      icon: <Clock className="w-5 h-5" />,
      variant: 'warning',
    },
    {
      label: 'Ready for Doctor',
      value: stats.readyForClinician,
      icon: <CheckCircle2 className="w-5 h-5" />,
      variant: 'success',
    },
    {
      label: 'In Station',
      value: stats.inStation,
      icon: <DoorOpen className="w-5 h-5" />,
      variant: 'default',
    },
    {
      label: 'Total Patients',
      value: stats.total,
      icon: <Users className="w-5 h-5" />,
      variant: 'dark',
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Today's Summary" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="p-4 space-y-3">
          {/* Date */}
          <p className="text-xs text-[#8F9AA1] text-center">{dateStr}</p>

          {/* 2×2 stat grid */}
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((card) => (
              <KPICard
                key={card.label}
                title={card.label}
                value={card.value}
                icon={card.icon}
                variant={card.variant}
              />
            ))}
          </div>

          {/* Room overview */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E8EC] flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-[#3A8DFF]" />
              <h3 className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">
                Room Status
              </h3>
            </div>
            {rooms.map((room) => {
              const rc = roomStatusColors[room.status];
              return (
                <div
                  key={room.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E8EC] last:border-b-0"
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${rc.dot}`} />
                  <p className="text-sm text-[#1A1A1A] flex-1">{room.name}</p>
                  <span className="text-xs text-[#8F9AA1]">{rc.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}