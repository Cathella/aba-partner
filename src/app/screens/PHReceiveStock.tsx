/**
 * PH-22 Receive Stock — Form to add incoming stock to a medicine item.
 *
 * Inner page: showBack, no bottom nav.
 */
import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AppTopBar } from '../components/aba/AppTopBar';
import { ABAButton } from '../components/aba/ABAButton';
import {
  usePharmacyInventoryStore,
  receiveStock,
} from '../data/pharmacyInventoryStore';
import { showToast } from '../components/aba/Toast';
import {
  Search,
  PackagePlus,
  ChevronDown,
  Pill,
  Check,
} from 'lucide-react';

export function PHReceiveStock() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('item') || '';

  const { items } = usePharmacyInventoryStore();

  /* ── form state ── */
  const [selectedItemId, setSelectedItemId] = useState(preselectedId);
  const [medSearch, setMedSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  const filteredItems = useMemo(() => {
    if (!medSearch.trim()) return items;
    const q = medSearch.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q)
    );
  }, [items, medSearch]);

  const canSubmit = selectedItemId && parseInt(quantity, 10) > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    setTimeout(() => {
      receiveStock(
        selectedItemId,
        parseInt(quantity, 10),
        supplier.trim() || undefined,
        notes.trim() || undefined
      );
      showToast('Stock updated', 'success');
      navigate('/ph/inventory', { replace: true });
    }, 400);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7F9FC]">
      <AppTopBar title="Receive Stock" showBack onBackClick={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-40">
        <div className="p-4 space-y-4">

          {/* ── Medicine select ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <label className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-2 block">
              Medicine *
            </label>

            {selectedItem && !showDropdown ? (
              <button
                onClick={() => setShowDropdown(true)}
                className="w-full flex items-center justify-between h-11 px-3 rounded-xl border border-[#E5E8EC] bg-[#F7F9FC] hover:bg-[#FFFFFF] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E9F8F0] flex items-center justify-center">
                    <Pill className="w-3.5 h-3.5 text-[#32C28A]" />
                  </div>
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    {selectedItem.name}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-[#C9D0DB]" />
              </button>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9D0DB]" />
                <input
                  type="text"
                  value={medSearch}
                  onChange={(e) => {
                    setMedSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search medicine name or SKU"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#F7F9FC] border border-[#E5E8EC] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all"
                  autoFocus={!preselectedId}
                />

                {showDropdown && (
                  <div className="absolute top-12 left-0 right-0 bg-[#FFFFFF] border border-[#E5E8EC] rounded-xl shadow-lg max-h-48 overflow-y-auto z-20">
                    {filteredItems.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-[#C9D0DB]">No items found</p>
                    ) : (
                      filteredItems.map((it) => (
                        <button
                          key={it.id}
                          onClick={() => {
                            setSelectedItemId(it.id);
                            setMedSearch('');
                            setShowDropdown(false);
                          }}
                          className={`w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-[#F7F9FC] transition-colors border-b border-[#E5E8EC] last:border-b-0 ${
                            it.id === selectedItemId ? 'bg-[#E9F8F0]' : ''
                          }`}
                        >
                          <Pill className="w-3.5 h-3.5 text-[#32C28A] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#1A1A1A] truncate">{it.name}</p>
                            <p className="text-[10px] text-[#8F9AA1]">
                              SKU: {it.sku} · Qty: {it.quantityOnHand}
                            </p>
                          </div>
                          {it.id === selectedItemId && (
                            <Check className="w-4 h-4 text-[#32C28A] flex-shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Current stock hint */}
            {selectedItem && (
              <p className="text-xs text-[#8F9AA1] mt-2">
                Current stock: <span className="font-semibold text-[#1A1A1A]">{selectedItem.quantityOnHand}</span>
              </p>
            )}
          </div>

          {/* ── Quantity received ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <label className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-2 block">
              Quantity Received *
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              min={1}
              className="w-full h-11 px-3 border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all rounded-[14px]"
            />
          </div>

          {/* ── Supplier name (optional) ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <label className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-2 block">
              Supplier Name
              <span className="text-[#C9D0DB] font-normal ml-1">(optional)</span>
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. National Medical Stores"
              className="w-full h-11 px-3 border border-[#E5E8EC] bg-[#F7F9FC] text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all rounded-[14px]"
            />
          </div>

          {/* ── Notes (optional) ── */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E8EC] p-4">
            <label className="text-xs font-semibold text-[#8F9AA1] uppercase tracking-wide mb-2 block">
              Notes
              <span className="text-[#C9D0DB] font-normal ml-1">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this delivery…"
              rows={3}
              className="w-full text-sm text-[#1A1A1A] placeholder:text-[#C9D0DB] bg-[#F7F9FC] border border-[#E5E8EC] p-3 focus:outline-none focus:ring-2 focus:ring-[#32C28A]/30 focus:border-[#32C28A] transition-all resize-none rounded-[14px]"
            />
          </div>
        </div>
      </div>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E8EC] z-30">
        <div className="max-w-[390px] mx-auto p-4">
          <ABAButton
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleSubmit}
            disabled={!canSubmit}
            isLoading={isSubmitting}
          >
            <PackagePlus className="w-5 h-5" />
            Add to Stock
          </ABAButton>
        </div>
      </div>
    </div>
  );
}
