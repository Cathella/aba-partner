/**
 * notificationStore — Cross-role notification hub.
 * Provides a lightweight in-memory bus for inter-role notifications
 * (Lab→Doctor, Lab→Reception, Pharmacy→Reception, etc.).
 * Uses useSyncExternalStore for React 18 compatibility.
 */

import { useSyncExternalStore } from 'react';

/* ─────────── types ─────────── */

export type NotifTarget = 'reception' | 'doctor' | 'pharmacist' | 'nurse' | 'admin';

export interface CrossRoleNotification {
  id: string;
  target: NotifTarget;
  from: string; // e.g. "Lab Technician", "Pharmacist"
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  linkedRoute?: string; // optional deep-link
}

/* ─────────── state ─────────── */

let _notifications: CrossRoleNotification[] = [];
let _listeners: Set<() => void> = new Set();

function emit() {
  _listeners.forEach((l) => l());
}

/* ─────────── public API ─────────── */

/** Push a cross-role notification */
export function pushNotification(
  target: NotifTarget,
  from: string,
  title: string,
  body: string,
  linkedRoute?: string
) {
  const now = new Date();
  const id = `notif-${now.getTime()}-${Math.random().toString(36).slice(2, 6)}`;
  const timestamp = now.toLocaleTimeString('en-UG', {
    hour: '2-digit',
    minute: '2-digit',
  });
  _notifications = [
    { id, target, from, title, body, timestamp, read: false, linkedRoute },
    ..._notifications,
  ];
  emit();
}

/** Get unread count for a target role */
export function getUnreadCount(target: NotifTarget): number {
  return _notifications.filter((n) => n.target === target && !n.read).length;
}

/** Get all notifications for a target role */
export function getNotificationsForRole(target: NotifTarget): CrossRoleNotification[] {
  return _notifications.filter((n) => n.target === target);
}

/** Mark a specific notification as read */
export function markRead(notifId: string) {
  _notifications = _notifications.map((n) =>
    n.id === notifId ? { ...n, read: true } : n
  );
  emit();
}

/** Mark all notifications for a role as read */
export function markAllRead(target: NotifTarget) {
  _notifications = _notifications.map((n) =>
    n.target === target ? { ...n, read: true } : n
  );
  emit();
}

/* ─────────── React hook ─────────── */

export function useNotificationStore() {
  const snap = useSyncExternalStore(
    (cb) => {
      _listeners.add(cb);
      return () => _listeners.delete(cb);
    },
    () => _notifications
  );

  return {
    notifications: snap,
    getForRole: getNotificationsForRole,
    unreadCount: getUnreadCount,
    push: pushNotification,
    markRead,
    markAllRead,
  };
}
