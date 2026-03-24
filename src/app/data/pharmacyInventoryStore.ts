/**
 * pharmacyInventoryStore — In-memory store for the Pharmacy Inventory module.
 * Manages medicine catalogue, stock levels, receive/adjust operations, and audit logs.
 * Uses useSyncExternalStore for React 18 compatibility.
 */

import { useSyncExternalStore } from 'react';

/* ─────────── types ─────────── */

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  form: string;
  dosage: string;
  quantityOnHand: number;
  reorderLevel: number;
  lastUpdated: string; // timestamp string
}

export type AuditAction = 'received' | 'dispensed' | 'adjustment' | 'reorder-update';

export interface AuditEntry {
  id: string;
  itemId: string;
  action: AuditAction;
  delta: number; // positive or negative
  reason?: string;
  note?: string;
  timestamp: string;
  by: string;
}

/* ─────────── helpers ─────────── */

export function getStockStatus(item: InventoryItem): StockStatus {
  if (item.quantityOnHand <= 0) return 'out-of-stock';
  if (item.quantityOnHand <= item.reorderLevel) return 'low-stock';
  return 'in-stock';
}

/* ─────────── initial mock data ─────────── */

const now = new Date();
const fmt = (d: Date) =>
  d.toLocaleString('en-UG', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const initialItems: InventoryItem[] = [
  { id: 'inv-01', sku: 'PH-1001', name: 'Amoxicillin 500 mg', form: 'Tablet', dosage: '500 mg', quantityOnHand: 340, reorderLevel: 100, lastUpdated: fmt(new Date(now.getTime() - 2 * 3600000)) },
  { id: 'inv-02', sku: 'PH-1002', name: 'Paracetamol 500 mg', form: 'Tablet', dosage: '500 mg', quantityOnHand: 1200, reorderLevel: 200, lastUpdated: fmt(new Date(now.getTime() - 1 * 3600000)) },
  { id: 'inv-03', sku: 'PH-1003', name: 'Paracetamol Syrup 250 mg/5 mL', form: 'Syrup', dosage: '250 mg/5 mL', quantityOnHand: 8, reorderLevel: 20, lastUpdated: fmt(new Date(now.getTime() - 5 * 3600000)) },
  { id: 'inv-04', sku: 'PH-1004', name: 'Artemether-Lumefantrine 20/120 mg', form: 'Tablet', dosage: '20/120 mg', quantityOnHand: 85, reorderLevel: 40, lastUpdated: fmt(new Date(now.getTime() - 3 * 3600000)) },
  { id: 'inv-05', sku: 'PH-1005', name: 'Ferrous Sulphate 200 mg', form: 'Tablet', dosage: '200 mg', quantityOnHand: 0, reorderLevel: 50, lastUpdated: fmt(new Date(now.getTime() - 12 * 3600000)) },
  { id: 'inv-06', sku: 'PH-1006', name: 'Zinc Sulphate 20 mg', form: 'Tablet', dosage: '20 mg', quantityOnHand: 15, reorderLevel: 30, lastUpdated: fmt(new Date(now.getTime() - 4 * 3600000)) },
  { id: 'inv-07', sku: 'PH-1007', name: 'Cotrimoxazole 240 mg/5 mL', form: 'Suspension', dosage: '240 mg/5 mL', quantityOnHand: 45, reorderLevel: 15, lastUpdated: fmt(new Date(now.getTime() - 6 * 3600000)) },
  { id: 'inv-08', sku: 'PH-1008', name: 'Metformin 500 mg', form: 'Tablet', dosage: '500 mg', quantityOnHand: 200, reorderLevel: 60, lastUpdated: fmt(new Date(now.getTime() - 8 * 3600000)) },
  { id: 'inv-09', sku: 'PH-1009', name: 'Folic Acid 5 mg', form: 'Tablet', dosage: '5 mg', quantityOnHand: 450, reorderLevel: 100, lastUpdated: fmt(new Date(now.getTime() - 10 * 3600000)) },
  { id: 'inv-10', sku: 'PH-1010', name: 'Albendazole 400 mg', form: 'Tablet', dosage: '400 mg', quantityOnHand: 120, reorderLevel: 30, lastUpdated: fmt(new Date(now.getTime() - 7 * 3600000)) },
  { id: 'inv-11', sku: 'PH-1011', name: 'ORS Sachets', form: 'Sachet', dosage: 'Standard', quantityOnHand: 300, reorderLevel: 50, lastUpdated: fmt(new Date(now.getTime() - 2 * 3600000)) },
  { id: 'inv-12', sku: 'PH-1012', name: 'Paracetamol Drops 100 mg/mL', form: 'Drops', dosage: '100 mg/mL', quantityOnHand: 22, reorderLevel: 15, lastUpdated: fmt(new Date(now.getTime() - 3 * 3600000)) },
];

const initialAudit: AuditEntry[] = [
  { id: 'aud-01', itemId: 'inv-01', action: 'received', delta: 20, timestamp: fmt(new Date(now.getTime() - 2 * 3600000)), by: 'Pharmacist Lule', note: 'Supplier delivery' },
  { id: 'aud-02', itemId: 'inv-01', action: 'dispensed', delta: -2, reason: 'Prescription', timestamp: fmt(new Date(now.getTime() - 1.5 * 3600000)), by: 'Pharmacist Lule', note: 'Auto-deducted on dispense' },
  { id: 'aud-03', itemId: 'inv-01', action: 'dispensed', delta: -5, reason: 'OTC', timestamp: fmt(new Date(now.getTime() - 1 * 3600000)), by: 'Pharmacist Lule', note: 'Auto-deducted on dispense' },
  { id: 'aud-04', itemId: 'inv-03', action: 'adjustment', delta: -5, reason: 'Damaged/expired', timestamp: fmt(new Date(now.getTime() - 5 * 3600000)), by: 'Pharmacist Lule' },
  { id: 'aud-05', itemId: 'inv-03', action: 'dispensed', delta: -3, reason: 'Prescription', timestamp: fmt(new Date(now.getTime() - 4 * 3600000)), by: 'Pharmacist Lule', note: 'Auto-deducted on dispense' },
  { id: 'aud-06', itemId: 'inv-05', action: 'dispensed', delta: -10, reason: 'Prescription', timestamp: fmt(new Date(now.getTime() - 12 * 3600000)), by: 'Pharmacist Lule', note: 'Auto-deducted on dispense' },
  { id: 'aud-07', itemId: 'inv-05', action: 'adjustment', delta: -5, reason: 'Stock count correction', timestamp: fmt(new Date(now.getTime() - 11 * 3600000)), by: 'Pharmacist Lule' },
  { id: 'aud-08', itemId: 'inv-06', action: 'received', delta: 30, timestamp: fmt(new Date(now.getTime() - 24 * 3600000)), by: 'Pharmacist Lule', note: 'Monthly resupply' },
  { id: 'aud-09', itemId: 'inv-06', action: 'dispensed', delta: -14, reason: 'Prescription', timestamp: fmt(new Date(now.getTime() - 4 * 3600000)), by: 'Pharmacist Lule', note: 'Auto-deducted on dispense' },
  { id: 'aud-10', itemId: 'inv-02', action: 'received', delta: 500, timestamp: fmt(new Date(now.getTime() - 48 * 3600000)), by: 'Pharmacist Lule', note: 'Bulk order' },
  { id: 'aud-11', itemId: 'inv-02', action: 'dispensed', delta: -10, reason: 'OTC', timestamp: fmt(new Date(now.getTime() - 0.5 * 3600000)), by: 'Pharmacist Lule', note: 'Auto-deducted on dispense' },
  { id: 'aud-12', itemId: 'inv-11', action: 'dispensed', delta: -5, reason: 'OTC', timestamp: fmt(new Date(now.getTime() - 0.3 * 3600000)), by: 'Pharmacist Lule', note: 'Auto-deducted on dispense' },
];

/* ─────────── store engine ─────────── */

let _items: InventoryItem[] = initialItems.map((i) => ({ ...i }));
let _audit: AuditEntry[] = initialAudit.map((a) => ({ ...a }));
let _version = 0;
let _audSeq = 13;
const _listeners = new Set<() => void>();

function emit() {
  _version++;
  _listeners.forEach((fn) => fn());
}

/* ── public getters ── */

export function getInventoryItems(): InventoryItem[] {
  return _items;
}

export function getInventoryItemById(id: string): InventoryItem | undefined {
  return _items.find((i) => i.id === id);
}

export function getAuditForItem(itemId: string): AuditEntry[] {
  return _audit
    .filter((a) => a.itemId === itemId)
    .sort((a, b) => b.id.localeCompare(a.id)); // newest first by id
}

export function getInventoryStats() {
  const all = _items;
  return {
    total: all.length,
    inStock: all.filter((i) => getStockStatus(i) === 'in-stock').length,
    lowStock: all.filter((i) => getStockStatus(i) === 'low-stock').length,
    outOfStock: all.filter((i) => getStockStatus(i) === 'out-of-stock').length,
  };
}

/* ── mutations ── */

/** Receive stock for an item */
export function receiveStock(
  itemId: string,
  qty: number,
  supplier?: string,
  note?: string
) {
  const ts = fmt(new Date());
  _items = _items.map((i) =>
    i.id === itemId
      ? { ...i, quantityOnHand: i.quantityOnHand + qty, lastUpdated: ts }
      : i
  );
  _audit = [
    {
      id: `aud-${String(_audSeq++).padStart(2, '0')}`,
      itemId,
      action: 'received',
      delta: qty,
      note: [supplier && `Supplier: ${supplier}`, note].filter(Boolean).join('. ') || undefined,
      timestamp: ts,
      by: 'Pharmacist Lule',
    },
    ..._audit,
  ];
  emit();
}

/** Adjust stock (increase or decrease) */
export function adjustStock(
  itemId: string,
  delta: number,
  reason: string,
  note?: string
) {
  const ts = fmt(new Date());
  _items = _items.map((i) =>
    i.id === itemId
      ? {
          ...i,
          quantityOnHand: Math.max(0, i.quantityOnHand + delta),
          lastUpdated: ts,
        }
      : i
  );
  _audit = [
    {
      id: `aud-${String(_audSeq++).padStart(2, '0')}`,
      itemId,
      action: 'adjustment',
      delta,
      reason,
      note: note || undefined,
      timestamp: ts,
      by: 'Pharmacist Lule',
    },
    ..._audit,
  ];
  emit();
}

/** Update reorder level */
export function updateReorderLevel(itemId: string, newLevel: number) {
  const ts = fmt(new Date());
  _items = _items.map((i) =>
    i.id === itemId ? { ...i, reorderLevel: newLevel, lastUpdated: ts } : i
  );
  _audit = [
    {
      id: `aud-${String(_audSeq++).padStart(2, '0')}`,
      itemId,
      action: 'reorder-update',
      delta: 0,
      note: `Reorder level set to ${newLevel}`,
      timestamp: ts,
      by: 'Pharmacist Lule',
    },
    ..._audit,
  ];
  emit();
}

/** Deduct stock when dispensing — matches inventory items by name substring */
export function deductStockOnDispense(medName: string, qty: number, source?: 'Prescription' | 'OTC') {
  const lowerName = medName.toLowerCase();
  const match = _items.find(
    (i) =>
      i.name.toLowerCase().includes(lowerName) ||
      lowerName.includes(i.name.toLowerCase().split(' ')[0])
  );
  if (!match || qty <= 0) return;

  const ts = fmt(new Date());
  _items = _items.map((i) =>
    i.id === match.id
      ? {
          ...i,
          quantityOnHand: Math.max(0, i.quantityOnHand - qty),
          lastUpdated: ts,
        }
      : i
  );
  _audit = [
    {
      id: `aud-${String(_audSeq++).padStart(2, '0')}`,
      itemId: match.id,
      action: 'dispensed' as AuditAction,
      delta: -qty,
      reason: source || undefined,
      note: `Auto-deducted on dispense`,
      timestamp: ts,
      by: 'Pharmacist Lule',
    },
    ..._audit,
  ];
  emit();
}

/** Find inventory item by medicine name (fuzzy match) */
export function findInventoryItemByName(medName: string): InventoryItem | undefined {
  const lowerName = medName.toLowerCase();
  return _items.find(
    (i) =>
      i.name.toLowerCase().includes(lowerName) ||
      lowerName.includes(i.name.toLowerCase().split(' ')[0])
  );
}

/* ── React hook ── */

function getSnapshot(): number {
  return _version;
}

function subscribe(cb: () => void): () => void {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

export function usePharmacyInventoryStore() {
  useSyncExternalStore(subscribe, getSnapshot);
  return {
    items: getInventoryItems(),
    stats: getInventoryStats(),
    getItemById: getInventoryItemById,
    getAudit: getAuditForItem,
    receiveStock,
    adjustStock,
    updateReorderLevel,
    deductStockOnDispense,
    findInventoryItemByName,
  };
}