/**
 * PH-20 Inventory Home — Searchable inventory list with filter chips and stock badges.
 *
 * Main navigation tab — shows PharmacyBottomNav.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { PharmacyBottomNav } from '../components/aba/PharmacyBottomNav';
import { ListCard } from '../components/aba/Cards';
import {
  usePharmacyInventoryStore,
  getStockStatus,
  type StockStatus,
} from '../data/pharmacyInventoryStore';
import {
  Search,
  PackageCheck,
  PackageMinus,
  PackageX,
  ChevronRight,
  PackagePlus,
} from 'lucide-react';

/* ── filter chip definitions ── */

type FilterId = 'all' | 'low-stock' | 'out-of-stock';

const filterChips: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'low-stock', label: 'Low stock' },
  { id: 'out-of-stock', label: 'Out of stock' },
];

/* ── stock badge config ── */

const badgeConfig: Record<
  StockStatus,
  { label: string; icon: React.ReactNode; bg: string; text: string; border: string }
> = {
  'in-stock': {
    label: 'In Stock',
    icon: <PackageCheck className="w-3 h-3" />,
    bg: 'bg-[#E9F8F0]',
    text: 'text-[#38C172]',
    border: 'border-[#38C172]/20',
  },
  'low-stock': {
    label: 'Low',
    icon: <PackageMinus className="w-3 h-3" />,
    bg: 'bg-[#FFF3DC]',
    text: 'text-[#D97706]',
    border: 'border-[#D97706]/20',
  },
  'out-of-stock': {
    label: 'Out',
    icon: <PackageX className="w-3 h-3" />,
    bg: 'bg-[#FDECEC]',
    text: 'text-[#E44F4F]',
    border: 'border-[#E44F4F]/20',
  },
};

export function PHInventoryHome() {
  const navigate = useNavigate();
  const { items, stats } = usePharmacyInventoryStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');

  const filtered = useMemo(() => {
    let list = items;

    // filter by status
    if (filter === 'low-stock') {
      list = list.filter((i) => getStockStatus(i) === 'low-stock');
    } else if (filter === 'out-of-stock') {
      list = list.filter((i) => getStockStatus(i) === 'out-of-stock');
    }

    // search by name or SKU
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q)
      );
    }

    return list;
  }, [items, filter, search]);

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      {/* Top bar */}
      <div className="bg-[#FFFFFF] border-b border-[#E5E8EC] px-4 h-14 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Inventory</h1>
        {stats.total > 0 && (
          <span className="text-xs font-semibold text-[#32C28A] bg-[#E9F8F0] px-2 py-0.5 rounded-full">
            {stats.total} items
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {/* ── Summary chips ── */}
          <div className="flex gap-2">
            <div className="flex-1 bg-[#E9F8F0] p-3 text-center rounded-[14px]">
              <p className="text-lg font-bold text-[#1A1A1A]">{stats.total}</p>
              <p className="text-[#4A4F55] text-[12px]">Total items</p>
            </div>
            <div className="flex-1 bg-[#FFF3DC] p-3 text-center rounded-[14px]">
              <p className="text-lg font-bold text-[#D97706]">{stats.lowStock}</p>
              <p className="text-[#4A4F55] text-[12px]">Low stock</p>
            </div>
            <div className="flex-1 bg-[#FDECEC] p-3 text-center rounded-[14px]">
              <p className="text-lg font-bold text-[#E44F4F]">{stats.outOfStock}</p>
              <p className="text-[#4A4F55] text-[12px]">Out of stock</p>
            </div>
          </div>

          {/* ── Search bar ── */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9D0DB]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicine name or SKU"
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#FFFFFF] border border-[#E5E8EC] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all"
            />
          </div>

          {/* ── Filter chips ── */}
          <div className="flex gap-2">
            {filterChips.map((chip) => {
              const isActive = filter === chip.id;
              const count =
                chip.id === 'all'
                  ? stats.total
                  : chip.id === 'low-stock'
                  ? stats.lowStock
                  : stats.outOfStock;
              return (
                <button
                  key={chip.id}
                  onClick={() => setFilter(chip.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    isActive
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-[#FFFFFF] text-[#4A4F55] border-[#E5E8EC] hover:bg-[#F7F9FC]'
                  }`}
                >
                  {chip.label}
                  <span className={`ml-1 ${isActive ? 'text-white/70' : 'text-[#C9D0DB]'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Inventory list ── */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <PackageX className="w-10 h-10 text-[#C9D0DB] mb-3" />
              <p className="text-sm font-medium text-[#8F9AA1]">
                {search.trim() || filter !== 'all' ? 'No items found' : 'No inventory items'}
              </p>
              <p className="text-xs text-[#C9D0DB] mt-1">
                {search.trim() || filter !== 'all'
                  ? 'Try a different search or filter'
                  : 'Add your first item by receiving stock'}
              </p>
              {!search.trim() && filter === 'all' && (
                <button
                  onClick={() => navigate('/ph/inventory/receive')}
                  className="mt-4 h-10 px-6 flex items-center gap-2 rounded-md bg-[#32C28A] text-[#1A1A1A] font-semibold text-sm border-[1.5px] border-[#1A1A1A] hover:brightness-95 active:brightness-90 transition-all"
                >
                  <PackagePlus className="w-4 h-4" />
                  Receive Stock
                </button>
              )}
            </div>
          ) : (
            <ListCard>
              {filtered.map((item) => {
                const status = getStockStatus(item);
                const badge = badgeConfig[status];

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/ph/inventory/${item.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E8EC] last:border-b-0 hover:bg-[#F7F9FC] active:bg-[#E5E8EC] transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#1A1A1A] truncate">
                          {item.name}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 font-semibold px-1.5 py-[2px] rounded-full border flex-shrink-0 ${badge.bg} ${badge.text} ${badge.border} text-[12px]`}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-[#4A4F55]">
                          Qty: <span className="font-semibold text-[#1A1A1A]">{item.quantityOnHand}</span>
                        </span>
                        <span className="text-xs text-[#C9D0DB]">|</span>
                        <span className="text-xs text-[#8F9AA1]">
                          Reorder at {item.reorderLevel}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#C9D0DB] flex-shrink-0" />
                  </button>
                );
              })}
            </ListCard>
          )}
        </div>
      </div>

      {/* ── Sticky CTA: Receive Stock ── */}
      {filtered.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
          <div className="max-w-[390px] mx-auto p-4">
            <button
              onClick={() => navigate('/ph/inventory/receive')}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-md bg-[#32C28A] text-[#1A1A1A] font-semibold text-sm border-[1.5px] border-[#1A1A1A] hover:brightness-95 active:brightness-90 transition-all"
            >
              <PackagePlus className="w-5 h-5" />
              Receive Stock
            </button>
          </div>
        </div>
      )}

      <PharmacyBottomNav />
    </div>
  );
}