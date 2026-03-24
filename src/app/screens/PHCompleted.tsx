/**
 * Completed Prescriptions — Dispensed prescriptions grouped by date.
 *
 * Layout:
 *   Top bar → "Completed"
 *   Search
 *   Prescriptions grouped by date (Today, Yesterday, older dates)
 *   Tapping opens PH-07 (Completed Rx Detail)
 *   Bottom nav present.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { PharmacyBottomNav } from '../components/aba/PharmacyBottomNav';
import { usePharmacistStore } from '../data/pharmacistStore';
import type { PHPrescription, PHOtcOrder } from '../data/pharmacistStore';
import {
  Search,
  Inbox,
  ChevronRight,
  ShieldCheck,
  Pill,
  Clock,
  Calendar,
  ShoppingBag,
} from 'lucide-react';

/* ── Date grouping helpers ── */

function getDateGroupLabel(dateKey: string): string {
  const today = new Date();
  const todayKey = formatDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  if (dateKey === todayKey) return 'Today';
  if (dateKey === yesterdayKey) return 'Yesterday';
  return dateKey;
}

function formatDateKey(date: Date): string {
  return date.toLocaleDateString('en-UG', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Group prescriptions by a mock dispensed date. Since our mock data uses
 *  time strings only (e.g. "10:23 AM"), we treat all as dispensed today. */
function groupByDate(rxList: PHPrescription[]): { label: string; items: PHPrescription[] }[] {
  const today = new Date();
  const todayKey = formatDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  // Distribute mock data across date groups for realism
  const groups: Record<string, PHPrescription[]> = {};

  rxList.forEach((rx, idx) => {
    let key: string;
    if (idx < Math.ceil(rxList.length * 0.6)) {
      key = todayKey;
    } else if (idx < Math.ceil(rxList.length * 0.85)) {
      key = yesterdayKey;
    } else {
      const older = new Date(today);
      older.setDate(older.getDate() - 2);
      key = formatDateKey(older);
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(rx);
  });

  // Return in reverse chronological order
  const ordered = [todayKey, yesterdayKey];
  const remaining = Object.keys(groups).filter((k) => !ordered.includes(k)).sort().reverse();
  const allKeys = [...ordered, ...remaining].filter((k) => groups[k]?.length);

  return allKeys.map((key) => ({
    label: getDateGroupLabel(key),
    items: groups[key],
  }));
}

/* ── Completed row component ── */
function CompletedRow({
  rx,
  onClick,
}: {
  rx: PHPrescription;
  onClick: () => void;
}) {
  const medSummary =
    rx.medications.length === 1
      ? rx.medications[0].name
      : `${rx.medications[0].name} +${rx.medications.length - 1} more`;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-stretch gap-0 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
    >
      {/* Green accent bar */}
      <div className="w-[3px] flex-shrink-0 rounded-r-full my-2 bg-[#38C172]" />

      <div className="flex-1 flex items-center gap-3 px-3.5 py-3">
        {/* Shield icon */}
        <div className="w-9 h-9 rounded-full bg-[#E9F8F0] flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-4.5 h-4.5 text-[#38C172]" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Row 1: Patient name + age */}
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-[#1A1A1A] truncate">
              {rx.patientName}
            </p>
            <span className="text-xs text-[#8F9AA1] flex-shrink-0">
              {rx.patientAge} yrs
            </span>
          </div>

          {/* Row 2: Medication summary */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <Pill className="w-3 h-3 text-[#C9D0DB] flex-shrink-0" />
            <p className="text-xs text-[#4A4F55] truncate">{medSummary}</p>
          </div>

          {/* Row 3: Dispensed time + pharmacist */}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="font-semibold text-[#38C172] bg-[#E9F8F0] px-1.5 py-[2px] rounded-full flex items-center gap-1 text-[12px]">
              <Clock className="w-3 h-3" />
              {rx.dispensedAt}
            </span>
            <span className="text-[#C9D0DB] text-[12px]">
              by {rx.dispensedBy}
            </span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
      </div>
    </button>
  );
}

/* ── Main component ── */

export function PHCompleted() {
  const navigate = useNavigate();
  const { completed, otcCompleted } = usePharmacistStore();
  const [search, setSearch] = useState('');
  type CompletedMode = 'prescriptions' | 'otc';
  const [mode, setMode] = useState<CompletedMode>('prescriptions');

  const filtered = useMemo(() => {
    if (!search.trim()) return completed;
    const q = search.toLowerCase();
    return completed.filter(
      (rx) =>
        rx.patientName.toLowerCase().includes(q) ||
        rx.medications.some((m) => m.name.toLowerCase().includes(q)) ||
        rx.id.toLowerCase().includes(q)
    );
  }, [completed, search]);

  const filteredOtc = useMemo(() => {
    if (!search.trim()) return otcCompleted;
    const q = search.toLowerCase();
    return otcCompleted.filter(
      (o) =>
        o.customerName.toLowerCase().includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q)) ||
        o.id.toLowerCase().includes(q)
    );
  }, [otcCompleted, search]);

  const dateGroups = useMemo(() => groupByDate(filtered), [filtered]);

  const totalCompleted = completed.length + otcCompleted.length;

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      {/* Top bar */}
      <div className="bg-[#FFFFFF] border-b border-[#E5E8EC] px-4 h-14 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Completed</h1>
        {totalCompleted > 0 && (
          <span className="text-xs font-semibold text-[#38C172] bg-[#E9F8F0] px-2 py-0.5 rounded-full">
            {totalCompleted} total
          </span>
        )}
      </div>

      {/* Mode toggle + Search */}
      <div className="bg-[#FFFFFF] border-b border-[#E5E8EC] px-4 py-3 space-y-3">
        {/* Mode toggle */}
        <div className="flex bg-[#F7F9FC] rounded-xl p-0.5 gap-0.5">
          <button
            onClick={() => setMode('prescriptions')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] transition-all text-xs font-medium ${
              mode === 'prescriptions' ? 'bg-[#FFFFFF] text-[#1A1A1A] shadow-sm' : 'text-[#8F9AA1]'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            Prescriptions
            {completed.length > 0 && (
              <span className={`min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${mode === 'prescriptions' ? 'bg-[#32C28A] text-white' : 'bg-[#E5E8EC] text-[#8F9AA1]'}`}>
                {completed.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setMode('otc')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] transition-all text-xs font-medium ${
              mode === 'otc' ? 'bg-[#FFFFFF] text-[#1A1A1A] shadow-sm' : 'text-[#8F9AA1]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            OTC Orders
            {otcCompleted.length > 0 && (
              <span className={`min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${mode === 'otc' ? 'bg-[#7C3AED] text-white' : 'bg-[#E5E8EC] text-[#8F9AA1]'}`}>
                {otcCompleted.length}
              </span>
            )}
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9D0DB]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={mode === 'prescriptions' ? 'Search completed prescriptions…' : 'Search completed OTC orders…'}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {mode === 'prescriptions' ? (
            /* Prescriptions */
            dateGroups.length > 0 ? (
              dateGroups.map((group) => (
                <div key={group.label}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <Calendar className="w-3.5 h-3.5 text-[#C9D0DB]" />
                    <p className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide">{group.label}</p>
                    <span className="text-[#C9D0DB] text-[12px]">({group.items.length})</span>
                  </div>
                  <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
                    {group.items.map((rx) => (
                      <CompletedRow key={rx.id} rx={rx} onClick={() => navigate(`/ph/completed-detail/${rx.id}`)} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center pt-20">
                <div className="w-14 h-14 rounded-2xl bg-[#F7F9FC] border border-[#E5E8EC] flex items-center justify-center mb-4">
                  <Inbox className="w-6 h-6 text-[#C9D0DB]" />
                </div>
                <p className="text-sm font-medium text-[#4A4F55]">No completed prescriptions</p>
                <p className="text-xs text-[#8F9AA1] mt-1 max-w-[260px] text-center leading-relaxed">
                  {search.trim() ? 'No results match your search.' : 'Dispensed prescriptions will appear here.'}
                </p>
              </div>
            )
          ) : (
            /* OTC Orders */
            filteredOtc.length > 0 ? (
              <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] overflow-hidden">
                {filteredOtc.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => navigate(`/ph/otc/${o.id}`)}
                    className="w-full flex items-stretch gap-0 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC]/60 transition-colors text-left"
                  >
                    <div className="w-[3px] flex-shrink-0 rounded-r-full my-2 bg-[#7C3AED]" />
                    <div className="flex-1 flex items-center gap-3 px-3.5 py-3">
                      <div className="w-9 h-9 rounded-full bg-[#F3F0FF] flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-4.5 h-4.5 text-[#7C3AED]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1A1A] truncate">{o.customerName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <ShoppingBag className="w-3 h-3 text-[#C9D0DB]" />
                          <p className="text-xs text-[#4A4F55] truncate">
                            {o.items.length === 1 ? o.items[0].name : `${o.items[0].name} +${o.items.length - 1} more`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="font-semibold text-[#38C172] bg-[#E9F8F0] px-1.5 py-[2px] rounded-full flex items-center gap-1 text-[12px]">
                            <Clock className="w-3 h-3" /> {o.completedAt}
                          </span>
                          <span className="text-[#C9D0DB] text-[12px]">by {o.completedBy}</span>
                          <span className="text-[#8F9AA1] ml-auto text-[12px]">{o.totalAmount}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-20">
                <div className="w-14 h-14 rounded-2xl bg-[#F7F9FC] border border-[#E5E8EC] flex items-center justify-center mb-4">
                  <ShoppingBag className="w-6 h-6 text-[#C9D0DB]" />
                </div>
                <p className="text-sm font-medium text-[#4A4F55]">No completed OTC orders</p>
                <p className="text-xs text-[#8F9AA1] mt-1 max-w-[260px] text-center leading-relaxed">
                  {search.trim() ? 'No results match your search.' : 'Completed OTC orders will appear here.'}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      <PharmacyBottomNav />
    </div>
  );
}